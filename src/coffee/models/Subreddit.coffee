
Subreddit = Backbone.Model.extend
	defaults:
		category: null
		name: null
		text: null
	idAttribute: 'name'
	toString: () ->
		return @escape 'name'
	initialize: () ->
		console.log 'Subreddit :: Created' if FLAG_DEBUG



module.exports = Subreddit
