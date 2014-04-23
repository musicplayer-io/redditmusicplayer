
MusicPlayer = Backbone.Model.extend
	type: "none"

YoutubePlayer = MusicPlayer.extend
	type: "youtube"
	onPlayerReady: (e) ->
		e.target.playVideo()
	onPlayerStateChange: (e) ->
		console.log e if FLAG_DEBUG
		switch e.data
			when YT.PlayerState.UNSTARTED then RMP.dispatcher.trigger "player:unstarted", @
			when YT.PlayerState.PLAYING then RMP.dispatcher.trigger "player:playing", @
			when YT.PlayerState.PAUSED then RMP.dispatcher.trigger "player:paused", @
			when YT.PlayerState.ENDED then RMP.dispatcher.trigger "player:ended", @
			when YT.PlayerState.CUED then RMP.dispatcher.trigger "player:cued", @
			when YT.PlayerState.BUFFERING then RMP.dispatcher.trigger "player:buffering", @
	events: () ->
		"onReady": @onPlayerReady
		"onStateChange": @onPlayerStateChange
	init: () ->
		isReady = YT?
		if not isReady then throw "Youtube not Ready!"
		@player = new YT.Player "player",
			videoId: @track.id
			events: @events()
	initProgress: () ->
		RMP.dispatcher.trigger "progress:duration", @player.getDuration() # secs
		getData = () =>
			RMP.dispatcher.trigger "progress:current", @player.getCurrentTime() # secs
			RMP.dispatcher.trigger "progress:loaded", @player.getVideoLoadedFraction() # %
		@interval = setInterval getData, 200 if not @interval?
		console.log "INTERVAL SET #{@interval}" if FLAG_DEBUG
	clean: () ->
		@player.destroy()
		clearInterval @interval
		@interval = null
		@stopListening()
		@off()
		@trigger "destroy"
	switch: (song) ->
		@set song.attributes
		@track = @attributes.media.oembed
		@track.id = @track.url.substr(31)

		@player.loadVideoById @track.id
	playPause: () ->
		if @player.getPlayerState() == 1 then @player.pauseVideo() else @player.playVideo()
	initialize: () ->
		@$el = $("#player") if not @$el?
		@track = @attributes.media.oembed
		@track.id = @track.url.substr(31)

		@init()

		@listenTo RMP.dispatcher, "player:playing", @initProgress
		
		console.log @track if FLAG_DEBUG
		console.log "Player :: Youtube" if FLAG_DEBUG

SoundcloudPlayer = MusicPlayer.extend
	type: "soundcloud"
	events: () ->
		"playProgress": @progress_play
		"play": @event_trigger("playing")
		"pause": @event_trigger("paused")
		"finish": @event_trigger("ended")
	progress_play: (data) ->
		RMP.dispatcher.trigger "progress:current", data.currentPosition / 1000 # secs
		RMP.dispatcher.trigger "progress:loaded", data.loadedProgress # secs
	playerState: "ended"
	event_trigger: (ev) ->
		return (data) =>
			@player.getDuration (duration) =>
				RMP.dispatcher.trigger "progress:duration", duration / 1000 # secs
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	playPause: () ->
		@player.toggle()
	switch: (song) ->
		@set song.attributes
		@init () =>
			@player.load @track.sc.uri,
				auto_play: true
	setUp: (callback) ->
		if not @player?
			console.log "setting up iframe" if FLAG_DEBUG
			iframe = $("<iframe id='soundcloud' src='//w.soundcloud.com/player/?url=#{@track.sc.uri}'>").appendTo($("#player")) if $("#soundcloud").length is 0
			@player = SC.Widget "soundcloud"
			_.each @events(), (listener, ev) =>
				@player.bind ev, listener
		callback() if callback?
	clean: () ->
		@$el.html ""
		@stopListening()
		@off()
		@trigger "destroy"
	init: (callback) ->
		@track = @attributes.media.oembed
		@track.id = decodeURIComponent(decodeURIComponent(@track.html)).match(/\/tracks\/(\d+)/)[1]
		$.ajax
			url: "#{API.Soundcloud.base}/tracks/#{@track.id}.json?jsonp=?"
			data:
				client_id: API.Soundcloud.key
			success: (sctrack) =>
				console.log sctrack if FLAG_DEBUG
				if not sctrack.streamable then throw "not streamable"
				@track.sc = sctrack

				RMP.progressbar.enableSoundcloud @track.sc.waveform_url
				@setUp callback
	initialize: () ->
		@$el = $("#player") if not @$el?
		@init () =>
			@player.load @track.sc.uri,
				auto_play: true
		
	
MP3Player = MusicPlayer.extend
	type: "mp3"
	events: () ->
		"progress": @progress_play()
		"play": @event_trigger("playing")
		"playing": @event_trigger("playing")
		"pause": @event_trigger("paused")
		"ended": @event_trigger("ended")
		"durationchange": @setDuration()
	setDuration: () ->
		return () =>
			RMP.dispatcher.trigger "progress:duration", @player.duration # secs
	progress_play: (data) ->
		return () =>
			RMP.dispatcher.trigger "progress:loaded", @player.buffered.end(0)/@player.duration # secs
			RMP.dispatcher.trigger "progress:current", @player.currentTime # secs
	playerState: "ended"
	event_trigger: (ev) ->
		return (data) =>
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	init: () ->
		@player = $("<audio controls autoplay='true' src='#{@attributes.streaming_url}'/>").appendTo(@$el)[0]
		@player.play()
		_.each @events(), (listener, ev) =>
			$(@player).bind ev, listener
	clean: (justTheElement) ->
		$(@player).remove()
		@$el.html ""
		@stopListening() if not justTheElement?
		@trigger "destroy" if not justTheElement?
		@off if not justTheElement
	switch: (song) ->
		@set song.attributes
		@set "streaming_url", @get "url"
		@clean(true)
		@init()
	playPause: () ->
		if @playerState is "playing" then @player.pause() else @player.play()
	initialize: () ->
		@$el = $("#player") if not @$el?
		@$el.html ""
		@set "streaming_url", @get "url"
		@init()

BandcampPlayer = MP3Player.extend
	type: "bandcamp"
	getID: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/url/1/info"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				key: API.Bandcamp.key
				url: @get "url"
			success: (data) =>
				@set data
				callback data
	getAlbumInfo: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/album/2/info"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				key: API.Bandcamp.key
				album_id: @get "album_id"
			success: (data) =>
				@set data
				@set data.tracks[0]
				callback data
	getTrackInfo: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/track/3/info"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				key: API.Bandcamp.key
				track_id: @get "track_id"
			success: (data) =>
				@set data
				callback data
	getInfo: (callback) ->
		@getID (ids) =>
			if not ids.track_id?
				if ids.album_id?
					@getAlbumInfo callback
			else
				@getTrackInfo callback
	switch: (song) ->
		@set song.attributes
		@clean(true)
		@getInfo () =>
			RMP.dispatcher.trigger "progress:duration", @get "duration" # secs
			@init()			
	initialize: () ->
		@$el = $("#player") if not @$el?
		@$el.html ""
		@getInfo () =>
			RMP.dispatcher.trigger "progress:duration", @get "duration" # secs
			@init()			


PlayerController = Backbone.Model.extend
	change: (index, song) ->
		if not @controller?
			@controller = switch
				when song.type is "youtube" then new YoutubePlayer song.attributes
				when song.type is "soundcloud" then new SoundcloudPlayer song.attributes
				when song.type is "bandcamp" then new BandcampPlayer song.attributes
				when song.type is "mp3" then new MP3Player song.attributes
				else throw "Not A Song Sent to Player Controller"
		else
			if song.playable is true
				if @controller.type is song.type
					if @controller.get("id") isnt song.get("id")
						@controller.switch song
				else
					@controller.clean()
					@controller = null
					@change(index, song)
	playPause: (e) ->
		return if not @controller?
		@controller.playPause()
	initialize: () ->
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "controls:play", @playPause

RMP.player = new PlayerController

# Youtube functions
RMP.dispatcher.once "app:main", () ->
	$("<script src='https://www.youtube.com/iframe_api' />").appendTo $(".scripts")
	$("<script src='https://w.soundcloud.com/player/api.js' />").appendTo $(".scripts")

onYouTubeIframeAPIReady = () ->
	console.log "Youtube :: iFramed" if FLAG_DEBUG
	RMP.dispatcher.trigger "youtube:iframe"