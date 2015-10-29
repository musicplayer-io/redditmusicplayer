
ProgressBar = require 'models/ProgressBar'
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher
Store = require 'Store'

ProgressBarView = Backbone.View.extend
	events:
		'mousemove .progress': 'seeking'
		'mousedown .progress': 'startSeeking'
	justSeeked: false

	startSeeking: (e) ->
		Store.dragging = true
		offset = e.offsetX or e.layerX or e.originalEvent.layerX or 0 # firefox
		@percentage = offset / @$('.progress').outerWidth()
		@justSeeked = true

	seeking: (e) ->
		return if not @justSeeked # mousedown didn't start on progressbar, return

		offset = e.offsetX or e.layerX or e.originalEvent.layerX or 0 # firefox
		@percentage = offset / @$('.progress').outerWidth()

		if (Store.dragging) # mouse is down, seek without playing
			Dispatcher.trigger Constants.CONTROLS_SEEKTO, @percentage, not Store.dragging

		@$('.progress .current').css('width', @percentage * 100 + '%')

	stopSeeking: () ->
		return if not @justSeeked

		Dispatcher.trigger Constants.CONTROLS_SEEKTO, @percentage, not Store.dragging
		console.log "ProgressBarView :: Seek :: #{@percentage * 100}%" if FLAG_DEBUG and Store.dragging is false

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
		itemWidth = $('.controls .left .item').outerWidth()
		@$('.progress').css('width', $('body').innerWidth() - itemWidth * 7.5)

	render: () ->
		# set end time
		@$('.end.time').text @toMinSecs @model.get('duration')

		# set loaded progress
		@$('.progress .loaded').css('width', @model.get('loaded') * 100 + '%')

		# set current
		@$('.start.time').text @toMinSecs @model.get('current')
		@$('.progress .current').css('width', @model.get('current') / @model.get('duration') * 100 + '%')

	enableSoundcloud: (track) ->
		@$('.progress').addClass 'soundcloud'
		@$('.progress .waveform').css '-webkit-mask-box-image', "url(#{track.sc.waveform_url})"

	songChanged: () ->
		@$('.progress').removeClass 'soundcloud'

	initialize: () ->
		@resize()
		console.log 'ProgressBarView :: Ready' if FLAG_DEBUG
		@listenTo @model, 'change', @render
		@listenTo Dispatcher, Constants.SONG_CLICKED, @songChanged
		@listenTo Dispatcher, Constants.APP_RESIZE, @resize
		@listenTo Dispatcher, Constants.DRAGGING_STOPPED, @stopSeeking
		@listenTo Dispatcher, Constants.SOUNDCLOUD_TRACK_RECEIVED, @enableSoundcloud



module.exports = ProgressBarView
