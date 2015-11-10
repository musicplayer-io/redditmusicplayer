
Dispatcher = require('Util').Dispatcher
Playlist = require 'collections/Playlist'
Templates = require 'Templates'
Reddit = require 'controllers/Reddit'
Constants = require 'Constants'
Store = require 'Store'


CurrentSongView = Backbone.View.extend
	template: Templates.CurrentSongView
	events:
		'click .upvote': 'vote'
		'click .downvote': 'vote'

	vote: (e) ->
		return if not Store.authentication?

		target = $(e.currentTarget)
		parent = target.parents('.vote')
		id = parent.attr('id')

		dir = switch
			when target.hasClass 'active' then 0
			when target.hasClass 'upvote' then 1
			when target.hasClass 'downvote' then -1

		Reddit.vote id, dir

		$(parent.find('.upvote, .downvote')).removeClass 'active'

		if dir is 1 or dir is -1
			target.addClass 'active'

	render: (index, song) ->
		song = Playlist.current.song if not song?
		if not song? then return
		songJSON = song.toJSON()

		@$el.html @template songJSON
		$('.self.text').html($($('.self.text').text()))

		if song.playable is true
			$('.current-song-sidebar .title').text(songJSON.title)
			document.title = "#{songJSON.title} | Music Player for Reddit"
			$('.current-song-sidebar .image').attr 'src', ''

	initialize: () ->
		console.log 'CurrentSongView :: Ready' if FLAG_DEBUG
		@listenTo Dispatcher, Constants.SONG_CLICKED, @render
		@listenTo Dispatcher, Constants.LOADED_PLAYLIST, (page) =>
			@setElement $('.content.song .current.song')
			@render()



module.exports = CurrentSongView
