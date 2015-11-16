
Constants = require('Constants')
Dispatcher = require('Util').Dispatcher
MusicPlayer = require 'players/MusicPlayer'
VolumeControl = require 'controllers/VolumeControl'



SoundCloudPlayer = MusicPlayer.extend
	type: 'soundcloud'
	playerState: Constants.ENDED

	events: () ->
		'playProgress': @progress_play
		'play': @event_trigger(Constants.PLAYING)
		'pause': @event_trigger(Constants.PAUSED)
		'finish': @onFinish.bind @

	progress_play: (data) ->
		Dispatcher.trigger Constants.PROGRESS_CURRENT, data.currentPosition / 1000 # secs
		Dispatcher.trigger Constants.PROGRESS_LOADED, data.loadedProgress # secs

	onFinish: () ->
		@player.getCurrentSoundIndex (index) =>
			# 199 = The embed player has a maximum of 199 tracks
			# But the amount of tracks returned in the API call can be higher
			if @track.sc.kind is 'track' or index >= @track.sc.track_count - 1 or index >= 199
				@playerState = Constants.ENDED
				Dispatcher.trigger Constants.PLAYER_ENDED, @
			else
				@playerState = Constants.PAUSED
				Dispatcher.trigger Constants.PLAYER_PAUSED, @


	event_trigger: (ev) ->
		return (data) =>
			@player.setVolume(VolumeControl.get('volume')) # didn't work on ready event
			@player.getDuration (duration) ->
				Dispatcher.trigger Constants.PROGRESS_DURATION, duration / 1000 # secs
			@playerState = ev
			Dispatcher.trigger "PLAYER_#{ev}", @

	isPlaying: -> @playerState is Constants.PLAYING

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
			console.log 'setting up iframe' if FLAG_DEBUG
			if $('#soundcloud').length is 0
				iframe = $ "<iframe id='soundcloud' width='100%' height='450' scrolling='no' frameborder='no' src='//w.soundcloud.com/player/?url=#{@track.sc.uri}&amp;auto_play=true&amp;hide_related=true&amp;show_comments=true&amp;show_user=true&amp;show_reposts=false&amp;visual=true'></iframe>"
					.appendTo($('#player'))
			@player = SC.Widget 'soundcloud'
			_.each @events(), (listener, ev) =>
				@player.bind ev, listener
		callback() if callback?

	clean: () ->
		@$el.html ''
		@stopListening()
		@off()
		@trigger 'destroy'

	init: (callback) ->
		if @get('media')?
			@track = @attributes.media.oembed
			url = decodeURIComponent(decodeURIComponent(@track.html))
		else
			console.error 'SoundcloudPlayer :: Not Streamable'
			Dispatcher.trigger Constants.CONTROLS_FORWARD
			return

		user_id = url.match(/\/users\/(\d+)/)
		@track.type = 'users' if user_id?
		@track.id = user_id[1] if user_id?

		track_id = url.match(/\/tracks\/(\d+)/)
		@track.type = 'tracks' if track_id?
		@track.id = track_id[1] if track_id?

		track_id = url.match(/\/playlists\/(\d+)/)
		@track.type = 'playlists' if track_id?
		@track.id = track_id[1] if track_id?

		console.log 'SoundCloudPlayer :: Track ', @track if FLAG_DEBUG
		$.ajax
			url: "#{API.Soundcloud.base}/#{@track.type}/#{@track.id}.json"
			dataType: 'json'
			data:
				client_id: API.Soundcloud.key
			success: (sctrack) =>
				console.log 'SoundcloudPlayer :: Track received ', sctrack if FLAG_DEBUG
				if not sctrack.streamable
					console.error 'SoundcloudPlayer :: Not Streamable'
					# Skip to the next song
					Dispatcher.trigger Constants.CONTROLS_FORWARD

				@track.sc = sctrack
				Dispatcher.trigger Constants.SOUNDCLOUD_TRACK_RECEIVED, @track
				@setUp callback
			error: (xhr, status, err) ->
				console.error 'SoundcloudPlayer :: Error Loading :: ', status, err
				# Skip to the next song
				Dispatcher.trigger Constants.CONTROLS_FORWARD

	initialize: () ->
		@$el = $('#player') if not @$el?
		@init () =>
			@player.load "#{@track.sc.uri}",
				auto_play: true
				visual: true



module.exports = SoundCloudPlayer
