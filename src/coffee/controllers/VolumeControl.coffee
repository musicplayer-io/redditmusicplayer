
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher



VolumeControl = Backbone.Model.extend
	defaults:
		volume: 1
		size: 100

	volumeChange: () ->
		Dispatcher.trigger Constants.CONTROLS_VOLUME, @get('volume')

		try
			localStorage['volume'] = @get('volume')
		catch e
			console.error e

	initialize: () ->
		@listenTo @, 'change:volume', @volumeChange
		@set 'volume', (localStorage['volume']) if localStorage['volume']?



module.exports = new VolumeControl()
