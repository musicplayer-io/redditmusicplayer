
Dispatcher = require('Util').Dispatcher
Constants = require 'Constants'
MP3Player = require 'players/MP3Player'
SoundCloudPlayer = require 'players/SoundCloudPlayer'
VimeoPlayer = require 'players/VimeoPlayer'
YouTubePlayer = require 'players/YouTubePlayer'


PlayerController = Backbone.Model.extend
	change: (index, song) ->
		if not @controller?
			console.log 'PlayerController :: No controller set' if FLAG_DEBUG
			@controller = switch
				when song.type is 'youtube' then new YouTubePlayer song.attributes
				when song.type is 'soundcloud' then new SoundCloudPlayer song.attributes
				when song.type is 'vimeo' then new VimeoPlayer song.attributes
				when song.type is 'mp3' then new MP3Player song.attributes
		else
			if song.playable is true
				console.log 'PlayerController :: Song is playable' if FLAG_DEBUG
				if @controller.type is song.type
					console.log 'PlayerController :: Controller is good' if FLAG_DEBUG
					if @controller.get('id') isnt song.get('id')
						console.log 'PlayerController :: Not the same song', song if FLAG_DEBUG
						@controller.switch song
				else
					console.log 'PlayerController :: Clean up' if FLAG_DEBUG
					@controller.clean()
					@controller = null
					# Controller has been cleaned up, change now
					@change(index, song)

	playPause: (e) ->
		Remote = require 'controllers/Remote'
		return if Remote.get('receiver') is false
		return if not @controller?
		console.log 'PlayerController :: PlayPause', @controller.type if FLAG_DEBUG
		@controller.playPause()

	volume: (value) ->
		return if not @controller?
		console.log 'PlayerController :: Volume' if FLAG_DEBUG
		@controller.volume value

	seekTo: (percentage, seekAhead) ->
		return if not @controller?
		@controller.seekTo(percentage, seekAhead)

	initialize: () ->
		@listenTo Dispatcher, Constants.SONG_ACTIVATED, @change
		@listenTo Dispatcher, Constants.CONTROLS_PLAY, @playPause
		@listenTo Dispatcher, Constants.CONTROLS_VOLUME, @volume
		@listenTo Dispatcher, Constants.CONTROLS_SEEKTO, @seekTo



module.exports = new PlayerController()
