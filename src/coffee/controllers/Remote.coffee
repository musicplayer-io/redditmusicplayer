
Constants = require 'Constants'
PlayerController = require 'controllers/PlayerController'
Dispatcher = require('Util').Dispatcher
Playlist = require 'collections/Playlist'
SubredditPlaylist = require 'collections/SubredditPlaylist'
Store = require 'Store'



Remote = Backbone.Model.extend
	defaults:
		receiver: true

	triggerOnEmit: (type) ->
		@socket.on type, (data) =>
			return if @get('receiver') is false
			console.log "Socket :: Receive :: #{type}", data if FLAG_DEBUG
			Dispatcher.trigger type, data

	send: (type, data) ->
		console.log "Socket :: Send :: #{type}", data if FLAG_DEBUG
		@socket.emit type, data

	setReceiver: (bool) ->
		@set 'receiver', bool

	forward: () ->
		return if @get('receiver') is true
		@send Constants.CONTROLS_FORWARD

	backward: () ->
		return if @get('receiver') is true
		@send Constants.CONTROLS_BACKWARD

	playPause: () ->
		return if @get('receiver') is true
		@send Constants.CONTROLS_PLAY

	requestHash: (cb) ->
		return if @get('receiver') is false
		$.get '/remote/generate', (hash) ->
			cb hash

	setHash: (hash) ->
		@set('hash', hash)
		if @has('name') is false
			@socket = io()
			@socket.emit 'join:hash', hash
			@listenTo Dispatcher, Constants.CONTROLS_FORWARD, @forward
			@listenTo Dispatcher, Constants.CONTROLS_BACKWARD, @backward
			@listenTo Dispatcher, Constants.CONTROLS_PLAY, @playPause

	initialize: () ->
		Dispatcher.once Constants.AUTHENTICATED, (authentication) =>
			console.log 'Authenticated', authentication if FLAG_DEBUG

			@set 'name', authentication.get('name')
			@socket = io()

			simpleEvents = [Constants.CONTROLS_FORWARD, Constants.CONTROLS_BACKWARD, Constants.CONTROLS_PLAY, 'remote:subreddits']

			for ev in simpleEvents
				@triggerOnEmit ev

			@socket.on 'get:user', =>
				console.log 'Socket :: Query :: User' if FLAG_DEBUG
				@socket.emit 'answer:user', _.omit(Store.authentication.attributes, 'token')

			@socket.on 'get:play', =>
				console.log 'Socket :: Query :: Play' if FLAG_DEBUG
				if PlayerController.controller? and PlayerController.controller.isPlaying()
					@socket.emit 'answer:play', true
				else
					@socket.emit 'answer:play', false

			@socket.on 'get:subreddits', =>
				console.log 'Socket :: Query :: Subreddits' if FLAG_DEBUG
				@socket.emit 'answer:subreddits', SubredditPlaylist.pluck('name')

			@socket.on 'get:song', =>
				console.log 'Socket :: Query :: Song' if FLAG_DEBUG
				if Playlist.current.song?
					@socket.emit 'answer:song', Playlist.current.song.attributes
				else
					@socket.emit 'answer:song', false

			@listenTo Dispatcher, Constants.CONTROLS_FORWARD, @forward
			@listenTo Dispatcher, Constants.CONTROLS_BACKWARD, @backward
			@listenTo Dispatcher, Constants.CONTROLS_PLAY, @playPause



module.exports = new Remote()
