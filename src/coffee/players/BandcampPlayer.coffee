
Dispatcher = require('Util').Dispatcher
MP3Player = require 'players/MP3Player'
Playlist = require 'collections/Playlist'
Constants = require 'Constants'
SongBandcamp = require('models/Song').SongBandcamp



BandcampPlayer = MP3Player.extend
	type: 'bandcamp'

	getID: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/url/1/info"
			jsonp: 'callback'
			dataType: 'jsonp'
			data:
				key: API.Bandcamp.key
				url: @get 'url'
			success: (data) =>
				@set data
				callback data

	getAlbumInfo: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/album/2/info"
			jsonp: 'callback'
			dataType: 'jsonp'
			data:
				key: API.Bandcamp.key
				album_id: @get 'album_id'
			success: (data) =>
				@set data
				@set data.tracks[0]
				callback data

	getTrackInfo: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/track/3/info"
			jsonp: 'callback'
			dataType: 'jsonp'
			data:
				key: API.Bandcamp.key
				track_id: @get 'track_id'
			success: (data) =>
				@set data
				callback data

	errorAvoidBandCamp: (ids) ->
		console.error 'BandCampPlayer :: Error', ids.error_message
		SongBandcamp.prototype.playable = false
		_.each Playlist.where({type:'bandcamp'}), (item) ->
			item.set 'playable', false
		Dispatcher.trigger Constants.CONTROLS_FORWARD

	getInfo: (callback) ->
		@getID (ids) =>
			if ids.error?
				return @errorAvoidBandCamp(ids)
			console.log 'BandCampPlayer :: IDs Get' if FLAG_DEBUG
			if not ids.track_id?
				console.log 'BandCampPlayer :: No Track ID', ids if FLAG_DEBUG
				if ids.album_id?
					console.log 'BandCampPlayer :: Get Album Info' if FLAG_DEBUG
					@getAlbumInfo callback
			else
				console.log 'BandCampPlayer :: Get Track Info' if FLAG_DEBUG
				@getTrackInfo callback

	switch: (song) ->
		@set song.attributes
		@clean(true)
		@getInfo () =>
			Dispatcher.trigger Constants.PROGRESS_DURATION, @get 'duration' # secs
			@init()

	initialize: () ->
		@$el = $('#player') if not @$el?
		@$el.html ''
		@getInfo () =>
			Dispatcher.trigger Constants.PROGRESS_DURATION, @get 'duration' # secs
			@init()



module.exports = BandcampPlayer
