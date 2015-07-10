ProgressBar = Backbone.Model.extend
	defaults:
		loaded: 0
		current: 0
		duration: 60
		currentSongID: -1
	setDuration: (data) ->
		@set "duration", data
		@set "current", 0
	setLoaded: (data) ->
		@set "loaded", data
	setCurrent: (data) ->
		@set "current", data
	change: (index, song) ->
		if song.get("id") isnt @get("currentSongID") and song.get("playable") is true
			@setCurrent 0
			@setLoaded 0
			@setDuration 60
			@set "currentSongID", song.get "id"
			$(".controls .progress").removeClass "soundcloud"
	enableSoundcloud: (waveform) ->
		$(".controls .progress").addClass "soundcloud"
		$(".controls .progress .waveform").css "-webkit-mask-box-image", "url(#{waveform})"
	initialize: () ->
		console.log "ProgressBar :: Ready" if FLAG_DEBUG
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "progress:current", @setCurrent
		@listenTo RMP.dispatcher, "progress:loaded", @setLoaded
		@listenTo RMP.dispatcher, "progress:duration", @setDuration


ProgressBarView = Backbone.View.extend
	events:
		"mousemove .progress": "seeking"
		"mousedown .progress": "startSeeking"
	justSeeked: false
	startSeeking: (e) ->
		RMP.dragging = true
		offset = e.offsetX or e.layerX or e.originalEvent.layerX or 0 # firefox
		@percentage = offset / @$(".progress").outerWidth()
		@justSeeked = true
	seeking: (e) ->
		return if not @justSeeked # mousedown didn't start on progressbar, return

		offset = e.offsetX or e.layerX or e.originalEvent.layerX or 0 # firefox
		@percentage = offset / @$(".progress").outerWidth()

		if (RMP.dragging) # mouse is down, seek without playing
			RMP.dispatcher.trigger "progress:set", @percentage, not RMP.dragging

		@$(".progress .current").css("width", @percentage * 100 + "%")
	stopSeeking: () ->
		return if not @justSeeked

		RMP.dispatcher.trigger "progress:set", @percentage, not RMP.dragging
		console.log "ProgressBarView :: Seek :: #{@percentage * 100}%" if FLAG_DEBUG and RMP.dragging is false

		@justSeeked = false
	toMinSecs: (secs) ->
		hours = Math.floor(secs / 3600)
		if hours
			mins = Math.floor((secs / 60) - hours * 60)
			secs = Math.floor(secs % 60)
			"#{String('0'+hours).slice(-2)}:#{String('0'+mins).slice(-2)}:#{String('0'+secs).slice(-2)}"
		else
			mins = Math.floor(secs / 60)
			secs = Math.floor(secs % 60)
			"#{String('0'+mins).slice(-2)}:#{String('0'+secs).slice(-2)}"
	resize: () ->
		itemWidth = $(".controls .left .item").outerWidth()
		@$(".progress").css("width", $("body").innerWidth() - itemWidth * 7.5)
	render: () ->
		# set end time
		@$(".end.time").text @toMinSecs @model.get("duration")

		# set loaded progress
		@$(".progress .loaded").css("width", @model.get("loaded") * 100 + "%")

		# set current
		@$(".start.time").text @toMinSecs @model.get("current")
		@$(".progress .current").css("width", @model.get("current") / @model.get("duration") * 100 + "%")
	initialize: () ->
		@resize()
		console.log "ProgressBarView :: Ready" if FLAG_DEBUG
		@listenTo @model, "change", @render
		@listenTo RMP.dispatcher, "app:resize", @resize
		@listenTo RMP.dispatcher, "events:stopDragging", @stopSeeking

RMP.progressbar = new ProgressBar
RMP.progressbarview = new ProgressBarView
	el: $(".controls .middle.menu")
	model: RMP.progressbar

Button = Backbone.View.extend
	events:
		"click": "click"
	click: (e) ->
		RMP.dispatcher.trigger @attributes.clickEvent, e
	stateChange: (data) ->
		console.log "Button :: StateChange", data if FLAG_DEBUG
		if @checkState(data) is true then @$el.addClass "active" else @$el.removeClass "active"
	initialize: () ->
		@checkState = @attributes.checkState
		@listenTo RMP.dispatcher, @attributes.listenEvent, @stateChange if @attributes.listenEvent?

Buttons = Backbone.Model.extend
	initialize: () ->
		@backward = new Button
			el: $(".controls .backward.button")
			attributes:
				clickEvent: "controls:backward"
		@forward = new Button
			el: $(".controls .forward.button")
			attributes:
				clickEvent: "controls:forward"
		@play = new Button
			el: $(".controls .play.button")
			attributes:
				clickEvent: "controls:play"
				listenEvent: "player:playing player:paused player:ended"
				checkState: (player) ->
					player = RMP.player.controller if player is window
					if player.type is "youtube"
						return player.player.getPlayerState() is 1
					else
						return player.playerState is "playing"


VolumeControl = Backbone.Model.extend
	defaults:
		volume: 1
		size: 100

	volumeChange: () ->
		RMP.dispatcher.trigger "controls:volume", @get("volume")

		try
			localStorage["volume"] = @get("volume")
		catch e
			console.error e

	initialize: () ->
		@listenTo @, "change:volume", @volumeChange
		@set "volume", (localStorage["volume"]) if localStorage["volume"]?

VolumeControlView = Backbone.View.extend
	events:
		"mousemove .volume.popup": "seeking"
		"mousedown .volume.popup": "startSeeking"
	justSeeked: false
	setPercentage: (e) ->
		max = @model.get("size")
		offset = e.offsetY or e.layerY or e.originalEvent.layerY or 0 # firefox
		current = (offset - max) * -1
		ratio = current / max
		@model.set "volume", ratio
	startSeeking: (e) ->
		RMP.dragging = true
		@setPercentage e
		@justSeeked = true
	seeking: (e) ->
		return if not @justSeeked # mousedown didn't start on volumebar, return
		@setPercentage e
	stopSeeking: () ->
		return if not @justSeeked
		@justSeeked = false
	click: (e) ->
		max = @model.get("size")
		offset = e.offsetY or e.layerY or e.originalEvent.layerY or 0 # firefox
		current = (offset - max) * -1
		ratio = current / max
		@model.set "volume", ratio
	render: () ->
		@$(".volume-bar").css("height", (@model.get("volume") * @model.get("size")) + "px")

		if @model.get("volume") >= 0.5
			@$(".icon.volume").removeClass("off up down").addClass "up"
		else if @model.get("volume") <= 0.1
			@$(".icon.volume").removeClass("off up down").addClass "off"
		else
			@$(".icon.volume").removeClass("off up down").addClass "down"

	initialize: () ->
		@listenTo @model, "change:volume", @render
		@$(".volume.button").popup
			popup: $(".volume.popup")
			on: "click"
			position: "top center"
			distanceAway: 0
		@render()
		@listenTo RMP.dispatcher, "events:stopDragging", @stopSeeking

RMP.volumecontrol = new VolumeControlView
	model: new VolumeControl
	el: $(".controls .volume.control")

RMP.buttons = new Buttons
