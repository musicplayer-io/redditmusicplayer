
MusicPlayer = Backbone.Model.extend
	type: "none"

YoutubePlayer = MusicPlayer.extend
	type: "youtube"
	onPlayerReady: (e) ->
		e.target.playVideo()
	onPlayerStateChange: (e) ->
		console.log "YoutubePlayer :: StateChange", e if FLAG_DEBUG
		switch e.data
			when YT.PlayerState.UNSTARTED then RMP.dispatcher.trigger "player:unstarted", @
			when YT.PlayerState.PLAYING then RMP.dispatcher.trigger "player:playing", @
			when YT.PlayerState.PAUSED then RMP.dispatcher.trigger "player:paused", @
			when YT.PlayerState.ENDED then RMP.dispatcher.trigger "player:ended", @
			when YT.PlayerState.CUED then RMP.dispatcher.trigger "player:cued", @
			when YT.PlayerState.BUFFERING then RMP.dispatcher.trigger "player:buffering", @
	onError: (e) ->
		console.error "YoutubePlayer :: Error", e if FLAG_DEBUG
		RMP.dispatcher.trigger "controls:forward"
	events: () ->
		"onReady": @onPlayerReady
		"onStateChange": @onPlayerStateChange
		"onError": @onError
	init: () ->
		isReady = YT?
		if not isReady then throw new Error "Youtube not Ready!"
		@player = new YT.Player "player",
			videoId: @track.id
			events: @events()
	initProgress: () ->
		@player.setVolume(RMP.volumecontrol.model.get("volume") * 100)
		RMP.dispatcher.trigger "progress:duration", @player.getDuration() # secs
		getData = () =>
			RMP.dispatcher.trigger "progress:current", @player.getCurrentTime() # secs
			RMP.dispatcher.trigger "progress:loaded", @player.getVideoLoadedFraction() # %
		@interval = setInterval getData, 200 if not @interval?
		console.log "YoutubePlayer :: Interval Set :: #{@interval}" if FLAG_DEBUG
	clean: () ->
		@player.destroy()
		clearInterval @interval
		@interval = null
		@stopListening()
		@off()
		@trigger "destroy"
	switch: (song) ->
		@set song.attributes
		@getTrack()
		@player.loadVideoById @track.id
	isPlaying: ->
		if @player and @player.getPlayerState? and @player.pauseVideo? and @player.playVideo?
			return @player.getPlayerState() is 1
		else
			return false
	playPause: () ->
		if @isPlaying() then @player.pauseVideo() else @player.playVideo()
	volume: (value) ->
		@player.setVolume(value * 100)
	seekTo: (percentage, seekAhead) ->
		@player.seekTo percentage * @player.getDuration(), seekAhead
	findYoutubeId: (url) ->
		console.log(@attributes)
		domain = @get("domain")
		if @get("domain") is "youtu.be"
			regex = @track.url.match(/\/\/youtu.be\/(.*)$/)
			if regex and regex[1] then regex[1] else null
		else
			regex = @track.url.match(/\/\/.*=([\w+]+)$/)
			if regex and regex[1] then regex[1] else null
	getTrack: () ->
		if @attributes.media is null
			console.error "YoutubePlayer :: No Media Data" if FLAG_DEBUG
			@track =
				url: @attributes.url
			id = @findYoutubeId @track.url
			if id
				@track.id = id
			else
				return RMP.dispatcher.trigger "controls:forward"
		else
			@track = @attributes.media.oembed
			@track.id = @track.url.substr(31)
	initialize: () ->
		@$el = $("#player") if not @$el?
		@getTrack()
		@init()
		@listenTo RMP.dispatcher, "player:playing", @initProgress

		console.log "YoutubePlayer :: ", @track if FLAG_DEBUG
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
			@player.setVolume(RMP.volumecontrol.model.get("volume")) # didn't work on ready event
			@player.getDuration (duration) ->
				RMP.dispatcher.trigger "progress:duration", duration / 1000 # secs
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	isPlaying: -> @playerState is "playing"
	playPause: () ->
		@player.toggle()
	volume: (value) ->
		@player.setVolume(value)
	seekTo: (percentage, seekAhead) ->
		@player.getDuration (duration) =>
			@player.seekTo percentage * duration
	switch: (song) ->
		@set song.attributes
		@init () =>
			@player.load @track.sc.uri,
				auto_play: true
				visual: true
	setUp: (callback) ->
		if not @player?
			console.log "setting up iframe" if FLAG_DEBUG
			if $("#soundcloud").length is 0
				iframe = $ "<iframe id='soundcloud' width='100%' height='450' scrolling='no' frameborder='no' src='//w.soundcloud.com/player/?url=#{@track.sc.uri}&amp;auto_play=true&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true'></iframe>"
					.appendTo($("#player"))
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
		if @get("media")?
			@track = @attributes.media.oembed
			url = decodeURIComponent(decodeURIComponent(@track.html))
		else
			console.error "SoundcloudPlayer :: Not Streamable"
			RMP.dispatcher.trigger "controls:forward"
			return

		user_id = url.match(/\/users\/(\d+)/)
		@track.type = "users" if user_id?
		@track.id = user_id[1] if user_id?

		track_id = url.match(/\/tracks\/(\d+)/)
		@track.type = "tracks" if track_id?
		@track.id = track_id[1] if track_id?

		track_id = url.match(/\/playlists\/(\d+)/)
		@track.type = "playlists" if track_id?
		@track.id = track_id[1] if track_id?

		console.log @track if FLAG_DEBUG
		$.ajax
			url: "#{API.Soundcloud.base}/#{@track.type}/#{@track.id}.json?callback=?"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				client_id: API.Soundcloud.key
			success: (sctrack) =>
				console.log sctrack if FLAG_DEBUG
				if not sctrack.streamable
					console.error "SoundcloudPlayer :: Not Streamable"
					RMP.dispatcher.trigger "controls:forward"
				@track.sc = sctrack

				RMP.progressbar.enableSoundcloud @track.sc.waveform_url
				@setUp callback
			error: (xhr, status, err) =>
				console.error "SoundcloudPlayer :: Error Loading :: ", status, err
				RMP.dispatcher.trigger "controls:forward"
	initialize: () ->
		@$el = $("#player") if not @$el?
		@init () =>
			@player.load "#{@track.sc.uri}",
				auto_play: true
				visual: true


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
			RMP.dispatcher.trigger "progress:loaded", @player.buffered.end(0) / @player.duration # secs
			RMP.dispatcher.trigger "progress:current", @player.currentTime # secs
	playerState: "ended"
	event_trigger: (ev) ->
		return (data) =>
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	init: () ->
		console.log "MP3Player :: Making Player" if FLAG_DEBUG
		@player = $("<audio controls autoplay='true' src='#{@attributes.streaming_url}'/>").appendTo(@$el)[0]
		console.log @$el if FLAG_DEBUG
		@player.play()
		@player.volume = RMP.volumecontrol.model.get("volume")
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
	isPlaying: -> @playerState is "playing"
	playPause: () ->
		if @isPlaying() then @player.pause() else @player.play()
	volume: (value) ->
		@player.volume = value
	seekTo: (percentage, seekAhead) ->
		@player.currentTime = percentage * @player.duration
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
	errorAvoidBandCamp: (ids) ->
		console.error "BandCampPlayer :: Error", ids.error_message
		SongBandcamp.prototype.playable = false
		_.each RMP.playlist.where({type:"bandcamp"}), (item) ->
			item.set "playable", false
		RMP.dispatcher.trigger "controls:forward"
	getInfo: (callback) ->
		@getID (ids) =>
			if ids.error?
				return @errorAvoidBandCamp(ids)
			console.log "BandCampPlayer :: IDs Get" if FLAG_DEBUG
			if not ids.track_id?
				console.log "BandCampPlayer :: No Track ID", ids if FLAG_DEBUG
				if ids.album_id?
					console.log "BandCampPlayer :: Get Album Info" if FLAG_DEBUG
					@getAlbumInfo callback
			else
				console.log "BandCampPlayer :: Get Track Info" if FLAG_DEBUG
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

VimeoPlayer = MusicPlayer.extend
	type: "vimeo"
	playerState: "ended"
	duration: 60
	postMessage: (options) ->
		@player.postMessage JSON.stringify(options), "*"
	init: () ->
		console.log "VimeoPlayer :: Making Player" if FLAG_DEBUG
		@playerEl = $("<iframe src='//player.vimeo.com/video/#{@track.id}?api=1&autoplay=1&player_id=vimeoplayer' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'>")
		@$el.append @playerEl
		@player = @playerEl[0].contentWindow
		@postMessage method: "play"
	clean: (justTheElement) ->
		$("#player iframe").remove()
		@$el.html ""
		@stopListening() if not justTheElement?
		@trigger "destroy" if not justTheElement?
		@off if not justTheElement
	switch: (song) ->
		@set song.attributes

		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))
		video_id = url.match(/\/video\/(\d+)/)
		@track.id = video_id[1] if video_id?

		@clean(true)
		@init()
	isPlaying: -> @playerState is "playing"
	playPause: () ->
		if @isPlaying()
			@postMessage method: "pause"
		else
			@postMessage method: "play"
	seekTo: (percentage) ->
		@postMessage
			method: "seekTo"
			value: percentage * @duration
	onReady: () ->
		@postMessage
			method: "setColor"
			value: "FDC00F"
		@postMessage
			method: "addEventListener"
			value: "pause"
		@postMessage
			method: "addEventListener"
			value: "finish"
		@postMessage
			method: "addEventListener"
			value: "playProgress"
		@postMessage
			method: "addEventListener"
			value: "loadProgress"
		@postMessage
			method: "addEventListener"
			value: "play"
		@postMessage
			method: "getVideoHeight"
		@postMessage
			method: "getVideoWidth"
		@volume RMP.volumecontrol.model.get("volume")
	volume: (value) ->
		@postMessage
			method: "setVolume"
			value: value
	onPlayProgress: (data) ->
		@duration = data.duration
		RMP.dispatcher.trigger "progress:duration", data.duration # secs
		RMP.dispatcher.trigger "progress:current", data.seconds # secs
	onPause: () ->
		@playerState = "paused"
		RMP.dispatcher.trigger "player:paused", @
	onFinish: () ->
		@playerState = "ended"
		RMP.dispatcher.trigger "player:ended", @
	onPlay: () ->
		@playerState = "playing"
		RMP.dispatcher.trigger "player:playing", @
	onLoadProgress: (data) ->
		RMP.dispatcher.trigger "progress:loaded", data.percent
	onVideoHeight: (value) ->
		@height = value
		@setHeight()
	onVideoWidth: (value) ->
		@width = value
		@setHeight()
	setHeight: () ->
		if @height? and @width?
			externalWidth = $(".content.song").width()
			ratio = @height / @width
			@playerEl.height ratio * externalWidth
	initialize: () ->
		@$el = $("#player") if not @$el?
		@$el.html ""

		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))

		video_id = url.match(/\/video\/(\d+)/)
		@track.id = video_id[1] if video_id?

		@listenTo RMP.dispatcher, "vimeo:ready", @onReady
		@listenTo RMP.dispatcher, "vimeo:playProgress", @onPlayProgress
		@listenTo RMP.dispatcher, "vimeo:pause", @onPause
		@listenTo RMP.dispatcher, "vimeo:finish", @onFinish
		@listenTo RMP.dispatcher, "vimeo:play", @onPlay
		@listenTo RMP.dispatcher, "vimeo:loadProgress", @onLoadProgress
		@listenTo RMP.dispatcher, "vimeo:getVideoWidth", @onVideoWidth
		@listenTo RMP.dispatcher, "vimeo:getVideoHeight", @onVideoHeight

		@init()


PlayerController = Backbone.Model.extend
	change: (index, song) ->
		if not @controller?
			@controller = switch
				when song.type is "youtube" then new YoutubePlayer song.attributes
				when song.type is "soundcloud" then new SoundcloudPlayer song.attributes
				when song.type is "bandcamp" then new BandcampPlayer song.attributes
				when song.type is "vimeo" then new VimeoPlayer song.attributes
				when song.type is "mp3" then new MP3Player song.attributes
				else throw new Error "Not A Song Sent to Player Controller"
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
		return if RMP.remote.get("receiver") is false
		return if not @controller?
		console.log "PlayerController : PlayPause" if FLAG_DEBUG
		@controller.playPause()
	volume: (value) ->
		return if not @controller?
		console.log "PlayerController :: Volume" if FLAG_DEBUG
		@controller.volume value
	seekTo: (percentage, seekAhead) ->
		return if not @controller?
		@controller.seekTo(percentage, seekAhead)
	initialize: () ->
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "controls:play", @playPause
		@listenTo RMP.dispatcher, "controls:volume", @volume
		@listenTo RMP.dispatcher, "progress:set", @seekTo

RMP.player = new PlayerController

# Youtube functions
RMP.dispatcher.once "app:main", () ->
	$("<script src='//www.youtube.com/iframe_api' />").appendTo $(".scripts")
	$("<script src='//w.soundcloud.com/player/api.js' />").appendTo $(".scripts")

onYouTubeIframeAPIReady = () ->
	console.log "Youtube :: iFramed" if FLAG_DEBUG
	RMP.dispatcher.trigger "youtube:iframe"
