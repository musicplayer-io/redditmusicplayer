
Dispatcher = require('Util').Dispatcher
Constants = require 'Constants'



TitleBar = Backbone.View.extend
	events:
		'click .page.link': 'pageClick'

	# Event on click of the view icon in the titlebar
	pageClick: (e) ->
		item = $ e.currentTarget
		page = item.data 'page'
		@panel.navigate page if @panel?

	pageChanging: (number, text) ->
		@$('.page.link').removeClass 'active'
		@$(".page.link[data-page=#{text}]").addClass 'active'

	initialize: (obj) ->
		@panel = obj.panel

		@$('.pop').popup()
		@listenTo Dispatcher, Constants.PAGE_CHANGING, @pageChanging



module.exports = TitleBar
