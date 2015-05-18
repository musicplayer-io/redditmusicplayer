

Remote = Backbone.Model.extend
	defaults:
		receiver: true
	triggerOnEmit: (type) ->
		@socket.on type, (data) =>
			return if @get("receiver") is false
			console.log "Socket :: Receive :: #{type}", data if FLAG_DEBUG
			RMP.dispatcher.trigger type, data
	send: (type, data) ->
		console.log "Socket :: Send :: #{type}", data if FLAG_DEBUG
		@socket.emit type, data
	setReceiver: (bool) ->
		@set "receiver", bool
	initialize: () ->
		RMP.dispatcher.once "authenticated", (authentication) =>
			@set "name", authentication.get("name")
			@socket = io()

			simpleEvents = ["controls:forward", "controls:backward", "controls:play", "remote:subreddits"]

			for ev in simpleEvents
				@triggerOnEmit ev

RemoteView = Backbone.View.extend
	events:
		"click .remote-controls .button": "button"
		"click .subreddits-copy": "copySubreddits"
	copySubreddits: () ->
		@model.send "remote:subreddits", RMP.subredditplaylist.toString()
	button: (e) ->
		item = $ e.currentTarget
		return if item.hasClass "disabled"
		type = item.data "type"
		@model.send type
	render: () ->
		if @model.get("receiver") is true
			@$(".ui.button").addClass "disabled"
		else
			@$(".ui.button").removeClass "disabled"
	setReceiver: () ->
		RMP.remoteview.model.set("receiver", true)
	setCommander: () ->
		RMP.remoteview.model.set("receiver", false)
	changeElement: () ->
		@$(".checkbox.receiver").checkbox
			onEnable: @setReceiver
			onDisable: @setCommander
		@render()
		if @model.has("name")
			@$(".dimmer").dimmer("hide")
	initialize: () ->
		@render()
		@listenTo @model, "change", @render
		RMP.dispatcher.once "authenticated", (authentication) =>
			@$(".dimmer").dimmer("hide")


RMP.remote = new Remote
RMP.remoteview = new RemoteView
	model: RMP.remote
	el: $(".content.remote")

RMP.dispatcher.on "loaded:remote", (page) ->
	RMP.remoteview.setElement $(".content.remote")
	RMP.remoteview.changeElement()