
Dispatcher = require('Util').Dispatcher
MusicPlayer = require 'players/MusicPlayer'
Constants = require 'Constants'
VolumeControl = require 'controllers/VolumeControl'



YouTubePlayer = MusicPlayer.extend
	type: 'youtube'

	onPlayerReady: (e) ->
		e.target.playVideo()

	onPlayerStateChange: (e) ->
		console.log 'YouTubePlayer :: StateChange', e if FLAG_DEBUG
		switch e.data
			when YT.PlayerState.UNSTARTED then Dispatcher.trigger Constants.PLAYER_UNSTARTED, @
			when YT.PlayerState.PLAYING then Dispatcher.trigger Constants.PLAYER_PLAYING, @
			when YT.PlayerState.PAUSED then Dispatcher.trigger Constants.PLAYER_PAUSED, @
			when YT.PlayerState.ENDED then Dispatcher.trigger Constants.PLAYER_ENDED, @
			when YT.PlayerState.CUED then Dispatcher.trigger Constants.PLAYER_CUED, @
			when YT.PlayerState.BUFFERING then Dispatcher.trigger Constants.PLAYER_BUFFERING, @

	onError: (e) ->
		console.error 'YouTubePlayer :: Error', e if FLAG_DEBUG
		Dispatcher.trigger Constants.CONTROLS_FORWARD

	events: () ->
		'onReady': @onPlayerReady
		'onStateChange': @onPlayerStateChange
		'onError': @onError

	init: () ->
		isReady = YT?
		if not isReady then throw new Error 'YouTube not Ready!'
		@player = new YT.Player 'player',
			videoId: @track.id
			events: @events()

	initProgress: () ->
		@player.setVolume(VolumeControl.get('volume') * 100)
		Dispatcher.trigger Constants.PROGRESS_DURATION, @player.getDuration() # secs
		getData = () =>
			Dispatcher.trigger Constants.PROGRESS_CURRENT, @player.getCurrentTime() # secs
			Dispatcher.trigger Constants.PROGRESS_LOADED, @player.getVideoLoadedFraction() # %
		@interval = setInterval getData, 200 if not @interval?
		console.log "YouTubePlayer :: Interval Set :: #{@interval}" if FLAG_DEBUG

	clean: () ->
		@player.destroy()
		clearInterval @interval
		@interval = null
		@stopListening()
		@off()
		@trigger 'destroy'

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

	findYouTubeId: (url) ->
		domain = @get('domain')
		if @get('domain') is 'youtu.be'
			regex = @track.url.match(/\/\/youtu.be\/(.*)$/)
			if regex and regex[1] then regex[1] else null
		else
			regex = @track.url.match(/\/\/.*=([\w+]+)$/)
			if regex and regex[1] then regex[1] else null

	getTrack: () ->
		if @attributes.media is null
			console.error 'YouTubePlayer :: No Media Data' if FLAG_DEBUG
			@track =
				url: @attributes.url
			id = @findYouTubeId @track.url
			if id
				@track.id = id
			else
				return Dispatcher.trigger Constants.CONTROLS_FORWARD
		else
			@track = @attributes.media.oembed
			@track.id = @track.url.substr(31)

	initialize: () ->
		@$el = $('#player') if not @$el?
		@getTrack()
		@init()
		@listenTo Dispatcher, Constants.PLAYER_PLAYING, @initProgress

		console.log 'YouTubePlayer :: ', @track if FLAG_DEBUG
		console.log 'Player :: YouTube' if FLAG_DEBUG



module.exports = YouTubePlayer
