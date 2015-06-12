

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
	forward: () ->
		return if @get("receiver") is true
		@send "controls:forward"
	backward: () ->
		return if @get("receiver") is true
		@send "controls:backward"
	playPause: () ->
		return if @get("receiver") is true
		@send "controls:play"
	requestHash: (cb) ->
		return if @get("receiver") is false
		$.get "/remote/generate", (hash) ->
			cb hash
	setHash: (hash) ->
		@set("hash", hash)
		console.log @has("name")
		if @has("name") is false
			@socket = io()
			@socket.emit "join:hash", hash
			@listenTo RMP.dispatcher, "controls:forward", @forward
			@listenTo RMP.dispatcher, "controls:backward", @backward
			@listenTo RMP.dispatcher, "controls:play", @playPause
	initialize: () ->
		
		RMP.dispatcher.once "authenticated", (authentication) =>
			@set "name", authentication.get("name")
			@socket = io()

			simpleEvents = ["controls:forward", "controls:backward", "controls:play", "remote:subreddits"]

			for ev in simpleEvents
				@triggerOnEmit ev

			@socket.on "response:hash", (hash) =>
				console.log hash

			@listenTo RMP.dispatcher, "controls:forward", @forward
			@listenTo RMP.dispatcher, "controls:backward", @backward
			@listenTo RMP.dispatcher, "controls:play", @playPause

RemoteView = Backbone.View.extend
	events:
		"click .remote-controls .remote-btn": "button"
		"click .subreddits-copy": "copySubreddits"
		"click .generate-link": "generateLink"
	generateLink: () ->
		@model.requestHash (hash) =>
			@model.socket.emit "join:hash", hash
			@$(".hashlink").attr("href", "http://reddit.music.player.il.lyremote/#{hash}").html hash
			@$(".qrcode").html("")
			@$(".qrcode").qrcode
				text: "http://reddit.music.player.il.ly/remote/#{hash}"
	copySubreddits: () ->
		@model.send "remote:subreddits", RMP.subredditplaylist.toString()
	button: (e) ->
		item = $ e.currentTarget
		return if item.hasClass "disabled"
		type = item.data "type"
		@model.send type
	render: () ->
		if @model.has("hash") is true
			@$(".dimmer").removeClass("active")
		if @model.get("receiver") is true
			@$(".checkbox.receiver input").prop("checked", true)
			@$(".remote-controls").hide()
			@$(".remote-receiver").show()
		else
			@$(".checkbox.commander input").prop("checked", true)
			@$(".remote-controls").show()
			@$(".remote-receiver").hide()
		
	setReceiver: () ->
		RMP.remoteview.model.set("receiver", true)
	setCommander: () ->
		RMP.remoteview.model.set("receiver", false)
	changeElement: () ->
		@$(".checkbox.radio").checkbox
			onChange: (value) =>
				if @$(".checkbox.receiver input").is(":checked")
					@setReceiver()
				else
					@setCommander()
		@render()
		if @model.has("name")
			@$(".dimmer").removeClass("active")

	initialize: () ->
		@render()
		@listenTo @model, "change", @render
		RMP.dispatcher.once "authenticated", (authentication) =>
			@$(".dimmer").removeClass("active")


RMP.remote = new Remote
RMP.remoteview = new RemoteView
	model: RMP.remote
	el: $(".content.remote")

RMP.dispatcher.on "loaded:remote", (page) ->
	RMP.remoteview.setElement $(".content.remote")
	RMP.remoteview.changeElement()