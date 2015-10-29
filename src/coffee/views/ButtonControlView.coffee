
Dispatcher = require('Util').Dispatcher



ButtonControlView = Backbone.View.extend
	events:
		'click': 'click'
	click: (e) ->
		Dispatcher.trigger @attributes.clickEvent, e
	stateChange: (data) ->
		console.log 'Button :: StateChange', data if FLAG_DEBUG
		if @checkState(data) is true then @$el.addClass 'active' else @$el.removeClass 'active'
	initialize: () ->
		@checkState = @attributes.checkState
		@listenTo Dispatcher, @attributes.listenEvent, @stateChange if @attributes.listenEvent?



module.exports = ButtonControlView
