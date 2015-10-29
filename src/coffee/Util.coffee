
Constants = require 'Constants'
Dispatcher = _.clone(Backbone.Events)
module.exports.Dispatcher = Dispatcher


# postMessage for vimeo
module.exports.onMessageReceived = (ev) ->
	return false if not /^https?:\/\/player.vimeo.com/.test(ev.origin)
	data = JSON.parse event.data

	switch data.event
		when 'ready'
			Dispatcher.trigger Constants.VIMEO_READY
		when 'playProgress'
			Dispatcher.trigger Constants.VIMEO_PLAYPROGRESS, data.data
		when 'pause'
			Dispatcher.trigger Constants.VIMEO_PAUSE
		when 'finish'
			Dispatcher.trigger Constants.VIMEO_FINISH
		when 'play'
			Dispatcher.trigger Constants.VIMEO_PLAY
		when 'loadProgress'
			Dispatcher.trigger Constants.VIMEO_LOADPROGRESS, data.data
			console.log data if FLAG_DEBUG

	switch data.method
		when 'getVideoHeight'
			Dispatcher.trigger Constants.VIMEO_GET_VIDEOHEIGHT, data.value
		when 'getVideoWidth'
			Dispatcher.trigger Constants.VIMEO_GET_VIDEOWIDTH, data.value
		else
			console.log data if FLAG_DEBUG


module.exports.openPopup = (url, type) ->
	width = 575
	height = 400
	left = ($(window).width()  - width)  / 2
	top = ($(window).height() - height) / 2
	opts = "status=1,width=#{width},height=#{height},top=#{top},left=#{left}"
	window.open url, type, opts

module.exports.timeSince = (time) ->
	seconds = Math.floor((new Date() - time) / 1000)
	interval = Math.floor(seconds / 31536000)
	return "#{interval} years" if interval > 1
	interval = Math.floor(seconds / 2592000)
	return "#{interval} months" if interval > 1
	interval = Math.floor(seconds / 86400)
	return "#{interval} days" if interval > 1
	interval = Math.floor(seconds / 3600)
	return "#{interval} hours" if interval > 1
	interval = Math.floor(seconds / 60)
	return "#{interval} minutes" if interval > 1
	return "#{Math.floor(seconds)} seconds"


module.exports.onYouTubeIframeAPIReady = () ->
	console.log 'Youtube :: iFramed' if FLAG_DEBUG
	Dispatcher.trigger Constants.YOUTUBE_IFRAMEREADY
