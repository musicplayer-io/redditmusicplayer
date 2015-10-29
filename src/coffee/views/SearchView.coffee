
Dispatcher = require('Util').Dispatcher
Playlist = require 'collections/Playlist'
Search = require 'models/Search'
Store = require 'Store'
Constants = require 'Constants'



SearchView = Backbone.View.extend
	events:
		'keyup input': 'enter'
		'click .button': 'submit'

	enter: (e) ->
		return if e.keyCode isnt 13
		@submit()

	submit: () ->
		val = @$('input').val()

		return if not val?
		return if val.trim().length < 3

		Store.search = new Search
			text: val
		Playlist.refresh()
		@subredditplaylistview.render()

	initialize: (obj) ->
		@subredditplaylistview = obj.subredditplaylistview
		console.log 'Search View :: Ready' if FLAG_DEBUG
		@listenTo Dispatcher, Constants.LOADED_BROWSE, (page) =>
			@setElement $('.content.browse .search-reddit')



module.exports = SearchView
