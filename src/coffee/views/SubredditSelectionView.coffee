
Dispatcher = require('Util').Dispatcher
SubredditPlaylist = require 'collections/SubredditPlaylist'
Subreddit = require 'models/Subreddit'
Store = require 'Store'


SubredditSelectionView = Backbone.View.extend
	tagName: 'div'
	className: 'selection'
	category: 'Default'
	reddits: []
	events:
		'click .menu.selection .item': 'open'

	open: (e) ->
		target = $ e.currentTarget

		currentReddit = new Subreddit
			category: @category
			name: target.data 'value'
			text: target.data 'name'

		if target.hasClass 'active'
			SubredditPlaylist.get(currentReddit).destroy()
			SubredditPlaylist.remove currentReddit
		else
			SubredditPlaylist.add currentReddit
			SubredditPlaylist.get(currentReddit).save()

		console.log "Subreddit :: Changed :: #{currentReddit}" if FLAG_DEBUG
		@render()

	render: () ->
		@show()
		redditsInThisCategory = SubredditPlaylist.where({'category': @category})
		if redditsInThisCategory is 0 then return
		redditsInThisCategoryByName = _.pluck(_.pluck(redditsInThisCategory, 'attributes'), 'name')
		@activeReddits = _.intersection redditsInThisCategoryByName, @reddits
		@$('.menu .item').removeClass 'active'
		_.each @activeReddits, (element) =>
			@$(".menu .item[data-value='#{element}']").addClass 'active'

	hide: () ->
		@$el.hide()

	hideAllExcept: (value) ->
		elements = $()
		_(@reddits)
			.filter (r) -> r.indexOf(value) is -1
			.forEach (element) =>
				elements = elements.add @$(".menu .item[data-value='#{element}']")
			.value()
		elements.hide()

	show: () ->
		@$el.show()
		@$('.menu .item').show()

	initialize: () ->
		@category = @$el.data 'category'
		@reddits = $.map @$('.selection.menu .item'), (o) ->
			return $(o).data 'value'
		@render()

		@listenTo SubredditPlaylist, 'add', @render
		@listenTo SubredditPlaylist, 'remove', @render
		@listenTo SubredditPlaylist, 'reset', @render

		@$('.menu.selection .item').popup
			variation: 'inverted'
			position: 'right center'
			transition: 'fade'
			delay:
				show: 300

		console.log 'SubredditSelectionView :: View Made', @category if FLAG_DEBUG



module.exports = SubredditSelectionView
