
Constants = require 'Constants'
Store = require 'Store'
Dispatcher = require('Util').Dispatcher


VolumeControlView = Backbone.View.extend
	events:
		'mousemove .volume.popup': 'seeking'
		'mousedown .volume.popup': 'startSeeking'
	justSeeked: false

	setPercentage: (e) ->
		max = @model.get('size')
		offset = e.offsetY or e.layerY or e.originalEvent.layerY or 0 # firefox
		current = (offset - max) * -1
		ratio = current / max
		@model.set 'volume', ratio

	startSeeking: (e) ->
		Store.dragging = true
		@setPercentage e
		@justSeeked = true

	seeking: (e) ->
		return if not @justSeeked # mousedown didn't start on volumebar, return
		@setPercentage e

	stopSeeking: () ->
		return if not @justSeeked
		@justSeeked = false

	click: (e) ->
		max = @model.get('size')
		offset = e.offsetY or e.layerY or e.originalEvent.layerY or 0 # firefox
		current = (offset - max) * -1
		ratio = current / max
		@model.set 'volume', ratio

	render: () ->
		@$('.volume-bar').css('height', (@model.get('volume') * @model.get('size')) + 'px')

		if @model.get('volume') >= 0.5
			@$('.icon.volume').removeClass('off up down').addClass 'up'
		else if @model.get('volume') <= 0.1
			@$('.icon.volume').removeClass('off up down').addClass 'off'
		else
			@$('.icon.volume').removeClass('off up down').addClass 'down'

	initialize: () ->
		@listenTo @model, 'change:volume', @render
		@$('.volume.button').popup
			popup: $('.volume.popup')
			on: 'click'
			position: 'top center'
			distanceAway: 0
		@render()
		@listenTo Dispatcher, Constants.DRAGGING_STOPPED, @stopSeeking



module.exports = VolumeControlView
