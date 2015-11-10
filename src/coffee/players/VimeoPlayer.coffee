
Dispatcher = require('Util').Dispatcher
MusicPlayer = require 'players/MusicPlayer'
Constants = require 'Constants'
VolumeControl = require 'controllers/VolumeControl'


VimeoPlayer = MusicPlayer.extend
	type: 'vimeo'
	playerState: Constants.ENDED
	duration: 60

	postMessage: (options) ->
		@player.postMessage JSON.stringify(options), '*'

	init: () ->
		console.log 'VimeoPlayer :: Making Player' if FLAG_DEBUG
		@playerEl = $("<iframe src='//player.vimeo.com/video/#{@track.id}?api=1&autoplay=1&player_id=vimeoplayer' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'>")
		@$el.append @playerEl
		@player = @playerEl[0].contentWindow
		@postMessage method: 'play'

	clean: (justTheElement) ->
		$('#player iframe').remove()
		@$el.html ''
		@stopListening() if not justTheElement?
		@trigger 'destroy' if not justTheElement?
		@off if not justTheElement

	switch: (song) ->
		@set song.attributes

		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))
		video_id = url.match(/\/video\/(\d+)/)
		@track.id = video_id[1] if video_id?

		@clean(true)
		@init()

	isPlaying: -> @playerState is Constants.PLAYING

	playPause: () ->
		if @isPlaying()
			@postMessage method: 'pause'
		else
			@postMessage method: 'play'

	seekTo: (percentage) ->
		@postMessage
			method: 'seekTo'
			value: percentage * @duration

	onReady: () ->
		@postMessage
			method: 'setColor'
			value: 'FDC00F'
		@postMessage
			method: 'addEventListener'
			value: 'pause'
		@postMessage
			method: 'addEventListener'
			value: 'finish'
		@postMessage
			method: 'addEventListener'
			value: 'playProgress'
		@postMessage
			method: 'addEventListener'
			value: 'loadProgress'
		@postMessage
			method: 'addEventListener'
			value: 'play'
		@postMessage
			method: 'getVideoHeight'
		@postMessage
			method: 'getVideoWidth'
		@volume VolumeControl.get('volume')

	volume: (value) ->
		@postMessage
			method: 'setVolume'
			value: value

	onPlayProgress: (data) ->
		@duration = data.duration
		Dispatcher.trigger Constants.PROGRESS_DURATION, data.duration # secs
		Dispatcher.trigger Constants.PROGRESS_CURRENT, data.seconds # secs

	onPause: () ->
		@playerState = Constants.PAUSED
		Dispatcher.trigger Constants.PLAYER_PAUSED, @

	onFinish: () ->
		@playerState = Constants.ENDED
		Dispatcher.trigger Constants.PLAYER_ENDED, @

	onPlay: () ->
		@playerState = Constants.PLAYING
		Dispatcher.trigger Constants.PLAYER_PLAYING, @

	onLoadProgress: (data) ->
		Dispatcher.trigger Constants.PROGRESS_LOADED, data.percent

	onVideoHeight: (value) ->
		@height = value
		@setHeight()

	onVideoWidth: (value) ->
		@width = value
		@setHeight()

	setHeight: () ->
		if @height? and @width?
			externalWidth = $('.content.song').width()
			ratio = @height / @width
			@playerEl.height ratio * externalWidth

	initialize: () ->
		@$el = $('#player') if not @$el?
		@$el.html ''

		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))

		video_id = url.match(/\/video\/(\d+)/)
		@track.id = video_id[1] if video_id?

		@listenTo Dispatcher, Constants.VIMEO_READY, @onReady
		@listenTo Dispatcher, Constants.VIMEO_PLAYPROGRESS, @onPlayProgress
		@listenTo Dispatcher, Constants.VIMEO_PAUSE, @onPause
		@listenTo Dispatcher, Constants.VIMEO_FINISH, @onFinish
		@listenTo Dispatcher, Constants.VIMEO_PLAY, @onPlay
		@listenTo Dispatcher, Constants.VIMEO_LOADPROGRESS, @onLoadProgress
		@listenTo Dispatcher, Constants.VIMEO_GET_VIDEOWIDTH, @onVideoWidth
		@listenTo Dispatcher, Constants.VIMEO_GET_VIDEOHEIGHT, @onVideoHeight

		@init()



module.exports = VimeoPlayer
