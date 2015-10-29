Dispatcher = require('Util').Dispatcher
MusicPlayer = require 'players/MusicPlayer'
Constants = require 'Constants'
VolumeControl = require 'controllers/VolumeControl'



MP3Player = MusicPlayer.extend
	type: 'mp3'
	playerState: 'ended'

	events: () ->
		'progress': @progress_play()
		'play': @event_trigger('PLAYING')
		'playing': @event_trigger('PLAYING')
		'pause': @event_trigger('PAUSED')
		'ended': @event_trigger('ENDED')
		'durationchange': @setDuration()

	setDuration: () ->
		return () =>
			Dispatcher.trigger Constants.PROGRESS_DURATION, @player.duration # secs

	progress_play: (data) ->
		return () =>
			Dispatcher.trigger Constants.PROGRESS_LOADED, @player.buffered.end(0) / @player.duration # secs
			Dispatcher.trigger Constants.PROGRESS_CURRENT, @player.currentTime # secs

	event_trigger: (ev) ->
		return (data) =>
			@playerState = ev
			Dispatcher.trigger "PLAYER_#{ev.toUpperCase()}", @

	init: () ->
		console.log 'MP3Player :: Making Player' if FLAG_DEBUG
		@player = $("<audio controls autoplay='true' src='#{@attributes.streaming_url}'/>").appendTo(@$el)[0]
		console.log @$el if FLAG_DEBUG
		@player.play()
		@player.volume = VolumeControl.get('volume')
		_.each @events(), (listener, ev) =>
			$(@player).bind ev, listener

	clean: (justTheElement) ->
		$(@player).remove()
		@$el.html ''
		@stopListening() if not justTheElement?
		@trigger 'destroy' if not justTheElement?
		@off if not justTheElement

	switch: (song) ->
		@set song.attributes
		@set 'streaming_url', @get 'url'
		@clean(true)
		@init()

	isPlaying: -> @playerState is 'PLAYING'

	playPause: () ->
		if @isPlaying() then @player.pause() else @player.play()

	volume: (value) ->
		@player.volume = value

	seekTo: (percentage, seekAhead) ->
		@player.currentTime = percentage * @player.duration

	initialize: () ->
		@$el = $('#player') if not @$el?
		@$el.html ''
		@set 'streaming_url', @get 'url'
		@init()



module.exports = MP3Player
