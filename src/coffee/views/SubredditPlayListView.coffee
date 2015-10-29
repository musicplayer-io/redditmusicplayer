
Dispatcher = require('Util').Dispatcher
Playlist = require 'collections/Playlist'
Templates = require 'Templates'
Subreddit = require 'models/Subreddit'
Store = require 'Store'
Constants = require 'Constants'


SubredditPlayListView = Backbone.View.extend
	tagName: 'div'
	className: 'selection'
	template: Templates.SubredditCurrentPlayListView
	events:
		'click .share': 'share'
		'click .menu.selection .item': 'remove'

	share: (e) ->
		subs = @collection.pluck('name')
		link = "#{API.MusicPlayer.base}/r/#{subs.join('+')}?autoplay"
		shortLink = "#{API.MusicPlayer.short}/r/#{subs.join('+')}?autoplay"

		modal = $('#modalSubredditShare')
		modal.modal('setting', 'transition', 'vertical flip')

		$('#subredditsLink').val(link).focus().select()
		$('#subredditsShort').val(shortLink)

		$('#subredditsShort,#subredditsLink').click -> @select()

		$('#modalSubredditShare .twitter').click () ->
			text = "I 💛 Music Player for Reddit. I'm listening to #{subs.join(', ') } "
			url = "https://twitter.com/intent/tweet?text=#{encodeURIComponent(text)}&url=#{encodeURIComponent(shortLink)}&via=musicplayer_io&related=musicplayer_io"
			openPopup url, 'twitter'

		$('#modalSubredditShare .facebook').click () ->
			text = "I 💛 Music Player for Reddit. I'm listening to #{subs.join(', ') } "
			url = "https://www.facebook.com/sharer/sharer.php?u=#{encodeURIComponent(link)}"
			openPopup url, 'facebook'

		$('#modalSubredditShare .google.plus').click () ->
			text = "I 💛 Music Player for Reddit. I'm listening to #{subs.join(', ') } "
			url = "https://plus.google.com/share?url=#{encodeURIComponent(link)}"
			openPopup url, 'google plus'

		$('#modalSubredditShare .reddit').click () ->
			s = subs.map (sub) -> "[/r/#{sub}]"
			text = "[Playlist] #{s.join(' ')} 💛"
			url = "https://reddit.com/r/musicplayer/submit?title=#{encodeURIComponent(text)}&url=#{encodeURIComponent(link)}&sub=musicplayer"
			openPopup url, 'reddit'

		modal.modal('show')

	remove: (e) ->
		currentReddit = e.currentTarget.dataset.value
		console.log 'SubredditPlayListView :: Remove :: ', currentReddit if FLAG_DEBUG

		if e.currentTarget.dataset.category is 'multi'
			Store.multi = null
			Playlist.refresh()
			@render()

		else if e.currentTarget.dataset.category is 'search'
			Store.search = null
			Playlist.refresh()
			@render()

		else
			@collection.remove @collection.get currentReddit



	render: () ->
		@$('.menu.selection').html('')

		if Store.search?
			sub = new Subreddit
				category: 'search'
				name: "search: #{Store.search.get('text')}"
				text: "search: #{Store.search.get('text')}"
			@$('.menu.selection').append @template sub.toJSON()

		else if Store.multi
			sub = new Subreddit
				category: 'multi'
				name: Store.multi
				text: Store.multi
			@$('.menu.selection').append @template sub.toJSON()

		else
			@collection.each (model) =>
				@$('.menu.selection').append @template model.toJSON()

	initialize: () ->
		@listenTo @collection, 'add', @render
		@listenTo @collection, 'remove', @render
		@listenTo @collection, 'reset', @render

		@listenTo Dispatcher, Constants.LOADED_BROWSE, (page) =>
			@setElement $('.content.browse .my.reddit.menu')
			@render() if @collection.length > 0

		console.log 'SubredditPlayListView :: Ready' if FLAG_DEBUG



module.exports = SubredditPlayListView
