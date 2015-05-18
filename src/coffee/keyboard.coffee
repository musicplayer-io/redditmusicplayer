
KeyboardController = Backbone.Model.extend
	defaults:
		shifted: false
	send: (command, e) ->
		RMP.dispatcher.trigger command, e
	initialize: () ->
		$("body").keyup (e) =>

			if (@get("shifted") is true)
				if e.keyCode is 40 then @send "controls:forward", e
				else if e.keyCode is 39 then @send "controls:forward", e
				else if e.keyCode is 37 then @send "controls:backward", e
				else if e.keyCode is 38 then @send "controls:backward", e

				if e.keyCode is 32
					@send "controls:play", e
					e.preventDefault()

			if e.keyCode is 17
				@set "shifted", false

		$("body").keydown (e) =>
			if e.keyCode is 17
				@set "shifted", true

RMP.keyboard = new KeyboardController
