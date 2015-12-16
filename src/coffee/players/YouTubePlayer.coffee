
Dispatcher = require('Util').Dispatcher
MusicPlayer = require 'players/MusicPlayer'
Constants = require 'Constants'
VolumeControl = require 'controllers/VolumeControl'



YouTubePlayer = MusicPlayer.extend
	type: 'youtube'

	onPlayerReady: (e) ->
		e.target.playVideo()

	onPlayerStateChange: (e) ->
		switch e.data
			when YT.PlayerState.UNSTARTED then Dispatcher.trigger Constants.PLAYER_UNSTARTED, @
			when YT.PlayerState.PLAYING then Dispatcher.trigger Constants.PLAYER_PLAYING, @
			when YT.PlayerState.PAUSED then Dispatcher.trigger Constants.PLAYER_PAUSED, @
			when YT.PlayerState.ENDED then Dispatcher.trigger Constants.PLAYER_ENDED, @
			when YT.PlayerState.CUED then Dispatcher.trigger Constants.PLAYER_CUED, @
			when YT.PlayerState.BUFFERING then Dispatcher.trigger Constants.PLAYER_BUFFERING, @

	onError: (e) ->
		message = switch e.data
			when 2 then 'Invalid parameter'
			when 5 then 'Cannot be played in HTML5 player'
			when 100 then 'Video was not found, removed or private'
			when 101 then 'Not allowed in embedded players'
			when 150 then 'Not allowed in embedded players - 150'
		console.error 'YouTubePlayer :: Error :: ', message if FLAG_DEBUG
		Dispatcher.trigger Constants.CONTROLS_FORWARD

	events: () ->
		'onReady': @onPlayerReady
		'onStateChange': @onPlayerStateChange
		'onError': @onError

	init: () ->
		if not YT? then throw new Error 'YouTube not Ready!'
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
		regex = /^(?:https?:\/\/)?(?:www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|attribution_link\?a=.+?watch.+?v(?:%|=)))((\w|-){11})(?:\S+)?$/
		matches = regex.exec url
		return matches[1] if matches? and matches[1]

	getTrack: () ->
		if @attributes.media is null or not @attributes.media.oembed.url?
			console.error 'YouTubePlayer :: No Media Data', @attributes if FLAG_DEBUG
			@track =
				url: @attributes.url
				id: @findYouTubeId @attributes.url
		else
			@track = @attributes.media.oembed
			@track.id = @findYouTubeId @track.url

	initialize: () ->
		console.log 'Player :: YouTube' if FLAG_DEBUG

		@$el = $('#player') if not @$el?
		@getTrack()
		@init()
		@listenTo Dispatcher, Constants.PLAYER_PLAYING, @initProgress
		console.log 'YouTubePlayer :: ', @track if FLAG_DEBUG



module.exports = YouTubePlayer
