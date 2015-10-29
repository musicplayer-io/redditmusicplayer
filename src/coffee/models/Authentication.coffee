
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher
Templates = require 'Templates'



Authentication = Backbone.Model.extend
	template: Templates.AuthenticationView

	initialize: () ->
		@$el = $('.titlebar .authentication')
		@$ = (selector) ->
			$(".titlebar .authentication #{selector}")
		if @get ('name')
			@$el.html @template @attributes
			@$('.ui.dropdown').dropdown()

		Dispatcher.trigger Constants.AUTHENTICATED, @



module.exports = Authentication
