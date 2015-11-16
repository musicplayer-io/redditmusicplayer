
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher



KeyboardController = Backbone.Model.extend
	defaults:
		shifted: false

	send: (command, e) ->
		Dispatcher.trigger command, e

	initEvents: () ->
		$('body').keyup (e) =>

			if (@get('shifted') is true)
				if e.keyCode is 40 then @send Constants.CONTROLS_FORWARD, e
				else if e.keyCode is 39 then @send Constants.CONTROLS_FORWARD, e
				else if e.keyCode is 37 then @send Constants.CONTROLS_BACKWARD, e
				else if e.keyCode is 38 then @send Constants.CONTROLS_BACKWARD, e

				if e.keyCode is 32
					@send Constants.CONTROLS_PLAY, e
					e.preventDefault()

			if e.keyCode is 17
				@set 'shifted', false

		$('body').keydown (e) =>
			if e.keyCode is 17
				@set 'shifted', true



module.exports = new KeyboardController()
