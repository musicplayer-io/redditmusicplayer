
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher
Subreddit = require 'models/Subreddit'


SubredditPlaylist = Backbone.Collection.extend
	model: Subreddit
	localStorage: new Backbone.LocalStorage('Subreddits')

	toString: () ->
		@toArray().join('+')

	toArray: () ->
		@pluck('name').filter((x) -> x)

	parseFromRemote: (strSubs) ->
		subs = []
		for i in strSubs.split('+')
			sub = new Subreddit
				category: 'remote'
				name: i
				text: i
			subs.push sub

		@reset subs

	loadFromServer: () ->
		console.log 'URL :: ', url_subreddits if FLAG_DEBUG
		newList = _.map url_subreddits, (sub) ->
			new Subreddit
				category: 'url'
				name: sub
				text: sub
		@add newList

	loadFromMemory: () ->
		@fetch reset: true

		# Add default if none
		if @length is 0
			defaultSub = new Subreddit
				category: 'Other'
				name: 'listentothis'
				text: 'Listen To This'
			@add defaultSub
			@listenToOnce @, 'add', (x) ->
				@remove defaultSub

	initialize: () ->
		console.log 'SubredditPlaylist :: Ready' if FLAG_DEBUG
		@listenTo @, 'remove', (x) -> x.destroy()
		@listenTo Dispatcher, Constants.REMOTE_SUBREDDITS, @parseFromRemote
		@listenTo Dispatcher, Constants.APP_MAIN, =>
			if url_subreddits?
				@loadFromServer()
			else
				@loadFromMemory()



module.exports = new SubredditPlaylist()
