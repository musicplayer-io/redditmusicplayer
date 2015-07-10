window.RMP = {}
RMP.dispatcher = _.clone(Backbone.Events)

# Main
$(document).ready ->
	RMP.dispatcher.trigger "app:main"
	RMP.dispatcher.trigger "app:resize"
	console.log """
	   __                 #               #
	  |--|   ### # #  ##     ###     ###  #   ## # # ### ###
	  |  |   ### # #  #   #  #       # #  #  # # ### ##  #
	 () ()   # # ### ##   ## ###     ###  ## ###   # ### #
	                                 #           ###
 	 https://github.com/musicplayer-io/redditmusicplayer

	"""

$( window ).resize ->
	RMP.dispatcher.trigger "app:resize"

# Dragging
RMP.dragging = false

$(window).mouseup ->
	RMP.dragging = false
	RMP.dispatcher.trigger "events:stopDragging"

# postMessage for vimeo
onMessageReceived = (ev) ->
	return false if not /^https?:\/\/player.vimeo.com/.test(ev.origin)
	data = JSON.parse event.data

	switch data.event
		when "ready"
			RMP.dispatcher.trigger "vimeo:ready"
		when "playProgress"
  	    	RMP.dispatcher.trigger "vimeo:playProgress", data.data
		when "pause"
			RMP.dispatcher.trigger "vimeo:pause"
		when "finish"
			RMP.dispatcher.trigger "vimeo:finish"
		when "play"
			RMP.dispatcher.trigger "vimeo:play"
		when "loadProgress"
			RMP.dispatcher.trigger "vimeo:loadProgress", data.data
			console.log data if FLAG_DEBUG

	switch data.method
		when "getVideoHeight"
			RMP.dispatcher.trigger "vimeo:getVideoHeight", data.value
		when "getVideoWidth"
			RMP.dispatcher.trigger "vimeo:getVideoWidth", data.value
		else
			console.log data if FLAG_DEBUG

if window.addEventListener
    window.addEventListener "message", onMessageReceived, false
else
    window.attachEvent "onmessage", onMessageReceived, false


openPopup = (url, type) ->
	width = 575
	height= 400
	left = ($(window).width()  - width)  / 2
	top = ($(window).height() - height) / 2
	opts = "status=1,width=#{width},height=#{height},top=#{top},left=#{left}"
	window.open(url, type, opts);
