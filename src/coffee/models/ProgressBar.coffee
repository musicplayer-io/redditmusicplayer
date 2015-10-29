
Dispatcher = require('Util').Dispatcher
Constants = require 'Constants'



ProgressBar = Backbone.Model.extend
	defaults:
		loaded: 0
		current: 0
		duration: 60
		currentSongID: -1

	setDuration: (data) ->
		@set 'duration', data
		@set 'current', 0
	setLoaded: (data) ->
		@set 'loaded', data

	setCurrent: (data) ->
		@set 'current', data

	songChanged: (index, song) ->
		if song.get('id') isnt @get('currentSongID') and song.get('playable') is true
			@setCurrent 0
			@setLoaded 0
			@setDuration 60
			@set 'currentSongID', song.get 'id'

	initialize: () ->
		console.log 'ProgressBar :: Ready' if FLAG_DEBUG
		@listenTo Dispatcher, Constants.SONG_CLICKED, @songChanged
		@listenTo Dispatcher, Constants.PROGRESS_CURRENT, @setCurrent
		@listenTo Dispatcher, Constants.PROGRESS_LOADED, @setLoaded
		@listenTo Dispatcher, Constants.PROGRESS_DURATION, @setDuration



module.exports = ProgressBar
