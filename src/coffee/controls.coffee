ProgressBar = Backbone.Model.extend
	defaults:
		loaded: 0
		current: 0
		duration: 60
		currentSongID: -1
	resize: () ->
		itemWidth = $(".controls .left .item").outerWidth()
		$(".controls .middle").css("width", $("body").innerWidth() - itemWidth*5.2)
		$(".controls .middle .progress").css("width", $("body").innerWidth() - itemWidth*9)
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
	setDuration: (data) ->
		@set "duration", data
		@set "current", 0
		$(".controls .end.time").text @toMinSecs data
	setLoaded: (data) ->
		@set "loaded", data
		$(".controls .progress .loaded").css("width", data * 100 + "%")
	setCurrent: (data) ->
		@set "current", data
		$(".controls .start.time").text @toMinSecs data
		$(".controls .progress .current").css("width", data / @get("duration") * 100 + "%")
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
		@resize()
		console.log "ProgressBar :: Ready" if FLAG_DEBUG
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "progress:current", @setCurrent
		@listenTo RMP.dispatcher, "progress:loaded", @setLoaded
		@listenTo RMP.dispatcher, "progress:duration", @setDuration
		@listenTo RMP.dispatcher, "app:resize", @resize

RMP.progressbar = new ProgressBar


Button = Backbone.View.extend
	events:
		"click": "click"
	click: (e) ->
		RMP.dispatcher.trigger @attributes.clickEvent, e
	stateChange: (data) ->
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
					if player.type is "youtube"
						return player.getPlayerState() == 1
					else
						return player.playerState is "playing"
		@shuffle = new Button
			el: $(".controls .shuffle.button")
			attributes:
				clickEvent: "controls:shuffle"
				listenEvent: "player:shuffle"
		@repeat = new Button
			el: $(".controls .repeat.button")
			attributes:
				clickEvent: "controls:repeat"
				listenEvent: "player:repeat"

RMP.buttons = new Buttons