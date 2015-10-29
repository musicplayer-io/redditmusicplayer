
Dispatcher = require('Util').Dispatcher
Constants = require 'Constants'



Messages = Backbone.Collection.extend
	removeByStatus: (status) ->
		@remove @filter (msg) -> msg.status is status

	addNew: (msg) ->
		existingMsg = @find (m) -> m.status is msg.status
		if existingMsg
			Dispatcher.trigger Constants.MESSAGE_REPEAT, existingMsg
		else
			@add msg

	initialize: () ->
		@listenTo Dispatcher, Constants.MESSAGE, @addNew
		@listenTo Dispatcher, Constants.LOADED_MUSIC, () =>
			@removeByStatus 'MessageFailedToGetMusic'



module.exports = new Messages()
