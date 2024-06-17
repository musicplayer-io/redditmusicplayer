
Dispatcher = require('Util').Dispatcher
Playlist = require 'collections/Playlist'
Constants = require 'Constants'



UI = Backbone.View.extend
	tagName: 'div'
	className: 'container'
	cache: {}
	events:
		'click .switcher .item': 'open'

	# Event on click of the *switcher* icon and selection of a view
	open: (e) ->
		item = $ e.currentTarget
		page = item.data('page')
		@navigate page

	load: (page, callback, ignoreCache) ->
		if page of @cache and (ignoreCache is false or not ignoreCache?)
			return callback @cache[page]

		console.log 'UI :: Load :: ', page if FLAG_DEBUG
		$.get("/#{page}", (data) =>
			@cache[page] = data
			callback data
		)

	navigate: (page) ->
		@page = page
		@load page, (data) =>
			@render data, page

		# Show the changes in navigation
		Dispatcher.trigger Constants.PAGE_CHANGING, @number, page

		posthog.capture('$pageview', {
			page: page
		})

	getElement: (page) ->
		@$("[data-page=#{page}]")

	render: (data, page) ->
		@$el.html data.content
		@$el.find('.ui.dropdown').dropdown()
		@$el.find('.ui.checkbox').checkbox()
		Dispatcher.trigger "LOADED_#{page.toUpperCase()}"

	scrollInPlaylist: (index, song) ->
		return if not @$el.find('.content').hasClass('playlist')
		offset = @$('.music.playlist .item')[Playlist.current.index].offsetTop
		@$el.scrollTop offset

	initialize: () ->
		$('.ui.dropdown').dropdown()
		$('.ui.checkbox').checkbox()
		@listenTo Dispatcher, 'app:page', @navigate
		console.log 'UI :: Ready' if FLAG_DEBUG

		@listenTo Dispatcher, Constants.SONG_CLICKED, @scrollInPlaylist



module.exports = UI
