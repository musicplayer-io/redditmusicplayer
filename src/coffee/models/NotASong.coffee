Util = require 'Util'



NotASong = Backbone.Model.extend
	type: 'link'
	playable: false
	initialize: () ->
		time = new Date()
		time.setTime parseInt(@get 'created_utc') * 1000
		@set 'created_ago', Util.timeSince time
		@set 'type', @type
		@set 'playable', @playable
		if @get('domain').indexOf 'imgur.com' > -1
			@set 'url', @get('url').replace('http:', 'https:')



NotALink = NotASong.extend
	type: 'self'



module.exports.NotASong = NotASong
module.exports.NotALink = NotALink
