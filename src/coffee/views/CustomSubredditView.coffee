
Dispatcher = require('Util').Dispatcher
SubredditPlaylist = require 'collections/SubredditPlaylist'
Store = require 'Store'
Subreddit = require 'models/Subreddit'
Constants = require 'Constants'


CustomSubredditView = Backbone.View.extend
	events:
		'keyup input': 'keypress'
		'click .button': 'submit'

	_showHideList: (show, hide, val) ->
		val = @$('input').val()

		_.forEach Store.subredditsSelection, (s) -> s.show()
		return if not val? or val.trim().length is 0

		val = val.toLowerCase()
		# Hide empty categories
		_(Store.subredditsSelection)
			.filter (cat) ->
				not _.find cat.reddits, (r) ->
					r.indexOf(val) > -1
			.forEach (list) -> list.hide()
			.commit()

		# Hide empty subs
		_(Store.subredditsSelection)
			.filter (cat) ->
				_.find cat.reddits, (r) ->
					r.indexOf(val) > -1
			.forEach (list) -> list.hideAllExcept val
			.commit()


	keypress: (e) ->
		if e.keyCode is 13
			@submit()
		else
			@showHideList()

	submit: () ->
		_.forEach Store.subredditsSelection, (s) -> s.show()
		val = @$('input').val()

		return if not val?
		return if val.trim().length < 3

		val = val.toLowerCase()
		return if SubredditPlaylist.where({name: val}).length isnt 0

		sub = new Subreddit
			category: 'custom'
			name: val
			text: val

		SubredditPlaylist.add sub
		sub.save()

		@render()

	render: () ->
		@$('input').val('')

	initialize: () ->
		@showHideList = _.debounce @_showHideList, 500
		console.log 'Custom Subreddit :: Ready' if FLAG_DEBUG

		@listenTo SubredditPlaylist, 'add', @render
		@listenTo SubredditPlaylist, 'remove', @render

		@listenTo Dispatcher, Constants.LOADED_BROWSE, (page) =>
			@setElement $('.content.browse .custom-subreddit')
			$('.share.pop').popup()



module.exports = CustomSubredditView
