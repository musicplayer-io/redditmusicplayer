
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher
Reddit = require 'controllers/Reddit'



SortMethodView = Backbone.View.extend
	events:
		'click .sort.item': 'select'

	getCurrent: () ->
		@$("[data-value='#{Reddit.get('sortMethod')}']")

	render: () ->
		@$('.item').removeClass 'active'
		@getCurrent().addClass 'active'

		@$('.ui.dropdown').dropdown('set selected', "top:#{Reddit.get('topMethod')}")

	select: (e) ->
		target = $ e.currentTarget
		method = target.data 'value'
		return if not method?
		sortMethod = method
		topMethod = Reddit.get 'topMethod'
		if method.substr(0, 3) is 'top'
			sortMethod = 'top'
			topMethod = method.substr(4)

		Reddit.changeSortMethod(sortMethod, topMethod)
		Dispatcher.trigger Constants.CONTROLS_SORTMETHOD, sortMethod, topMethod

		@render()

	initialize: () ->
		@render()
		@listenTo Dispatcher, Constants.LOADED_PLAYLIST, (page) =>
			@setElement $('.content.playlist .sortMethod')
			@render()



module.exports = SortMethodView
