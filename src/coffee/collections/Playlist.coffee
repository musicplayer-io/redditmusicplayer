
Remote = require 'controllers/Remote'
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher
SubredditPlaylist = require 'collections/SubredditPlaylist'
Reddit = require 'controllers/Reddit'
{NotASong, NotALink} = require 'models/NotASong'
{Song,  SongYoutube, SongSoundcloud, SongMP3, SongVimeo} = require 'models/Song'



Playlist = Backbone.Collection.extend
	current:
		song: null
		index: -1

	parseSong: (item) ->
		item.thumbnail = item.thumbnail.replace('http:', '')
		song = switch
			when item.domain is 'youtube.com' or
				item.domain is 'youtu.be' or
				item.domain is 'm.youtube.com' then new SongYoutube item
			when item.domain is 'soundcloud.com' then new SongSoundcloud item
			when item.url.substr(-4) is '.mp3' then new SongMP3 item
			when item.domain is 'vimeo.com' then new SongVimeo item
			when item.is_self then new NotALink item
			else new NotASong item

	activate: (song) ->
		index = _.indexOf(@models, song)
		@current.song = song
		@current.index = index
		Dispatcher.trigger Constants.SONG_CLICKED, index, song
		if @current.index >= @length  - 1
			@more()

	refresh: () ->
		Reddit.getMusic (items) =>
			list = []
			_.each items, (item) =>
				existingSong = @find (existingItem) ->
					item.data.id is existingItem.get('id')
				if existingSong?
					list.push existingSong
				else
					list.push @parseSong item.data
			@reset list
			@current.index = @indexOf(@current.song)
			Dispatcher.trigger Constants.LOADED_MUSIC

	more: (callback) ->
		Reddit.getMore @last().get('name'), (items) =>
			parsedSongs = []
			_.each items, (item) =>
				parsedSongs.push @parseSong item.data
			@add parsedSongs
			callback() if callback?

	forward: () ->
		return if Remote.get('receiver') is false
		if @current.index >= @length  - 1
			@more () =>
				@forward()
		else
			@current.index++
			@current.song = @at(@current.index)
			if @current.song.get('playable') is false
				@forward()
			else
				@activate(@current.song)

	backward: () ->
		return if Remote.get('receiver') is false
		if (@current.index - 1 <= 0)
			@current.song = @at(@current.index - 1)
			if @current.song.get('playable') is true
				@current.index = 0
				@activate(@current.song)
		else
			@current.index--
			@current.song = @at(@current.index)
			if @current.song.get('playable') is false
				@backward()
			else
				@activate(@current.song)

	playFirstSongIfEmpty: () ->
		if (@current.index is -1)
			@forward()

	initialize: () ->
		@listenTo SubredditPlaylist, 'add', @refresh
		@listenTo SubredditPlaylist, 'remove', @refresh
		@listenTo SubredditPlaylist, 'reset', @refresh

		@listenTo Dispatcher, Constants.CONTROLS_FORWARD, @forward
		@listenTo Dispatcher, Constants.CONTROLS_BACKWARD, @backward
		@listenTo Dispatcher, Constants.CONTROLS_PLAY, @playFirstSongIfEmpty
		@listenTo Dispatcher, Constants.CONTROLS_SORTMETHOD, @refresh
		@listenTo Dispatcher, Constants.GET_MUSIC, @refresh

		@listenTo Dispatcher, Constants.PLAYER_ENDED, @forward


		console.log 'Playlist :: Ready' if FLAG_DEBUG



module.exports = new Playlist()
