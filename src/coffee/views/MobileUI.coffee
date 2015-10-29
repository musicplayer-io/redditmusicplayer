
Dispatcher = require('Util').Dispatcher
Constants = require 'Constants'


MobileUI = Backbone.View.extend
	tagName: 'div'
	className: 'mobilebar'
	events:
		'click .item': 'click'

	changeText: (item, text) ->
		@$(".item.#{item}").text text

	click: (e) ->
		item = $ e.currentTarget

		page = item.data 'page'
		container = $(".ui.container[data-page=#{page}]")

		$('.ui.container').removeClass 'active'
		container.addClass 'active'

		@$('.item').removeClass 'active'
		item.addClass 'active'

	pageChanging: (number, page) ->
		@changeText number, page

	initialize: () ->
		console.log 'MobileUI :: Ready' if FLAG_DEBUG
		@listenTo Dispatcher, Constants.PAGE_CHANGING, @pageChanging



module.exports = MobileUI
