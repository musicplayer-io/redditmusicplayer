Message = Backbone.Model.extend
	type: "none"

MessageFailedToGetMusic = Message.extend
	type: "error"
	status: "MessageFailedToGetMusic"
	text: "Failed to Get Music"
	button: "Try Again?"
	callback: () ->
		RMP.dispatcher.trigger "app:refresh"


Messages = Backbone.Collection.extend
	removeByStatus: (status) ->
		@remove @filter (msg) -> msg.status is status
	addNew: (msg) ->
		existingMsg = @find (m) -> m.status is msg.status
		if existingMsg
			RMP.messageview.repeat existingMsg
		else
			@add msg
	initialize: () ->
		@listenTo RMP.dispatcher, "message", @addNew
		@listenTo RMP.dispatcher, "app:loadedMusic", () =>
			@removeByStatus "MessageFailedToGetMusic"


MessageView = Backbone.View.extend
	template: Templates.MessageView
	events:
		"click .close": "close"
		"click .button": "click"
	click: (e) ->
		message = RMP.messages.get $(e.currentTarget).parents(".message").data "id"
		message.callback() if message? and message.callback?
	close: (e) ->
		RMP.messages.remove $(e.currentTarget).parents(".message").data "id"
	repeat: (msg) ->
		@$(".message[data-id=#{msg.cid}]").transition "shake"
	add: (msg) ->
		@$el.addClass "active"
		$msg = $ @template msg
		@$el.append $msg
		if msg.type is "error"
			$msg.transition "shake"
		else
			$msg.transition "fly up in"
	remove: (msg) ->
		@$(".message[data-id=#{msg.cid}]").remove()
		@$el.removeClass "active"
	initialize: () ->
		@listenTo RMP.messages, "add", @add
		@listenTo RMP.messages, "remove", @remove

RMP.messages = new Messages
RMP.messageview = new MessageView
	el: $(".ui.messages")