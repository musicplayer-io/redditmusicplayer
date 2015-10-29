
Dispatcher = require('Util').Dispatcher
Playlist = require 'collections/Playlist'
Templates = require 'Templates'
Reddit = require 'controllers/Reddit'
Util = require 'Util'
Constants = require 'Constants'
Store = require 'Store'


CommentsView = Backbone.View.extend
	template: Templates.CommentsView

	events:
		'click .upvote': 'vote'
		'click .downvote': 'vote'
		'click .actions .reply': 'reply'
		'click .actions .collapse': 'collapse'
		'click .expand': 'expand'
		'click .form .add_comment': 'add_comment'
		'click .reply_to .close': 'reply_close'

	reply: (e) ->
		if not Store.authentication?
			Dispatcher.trigger Constants.MESSAGE, new MessageNotAuthenticated()
			return

		target = $(e.currentTarget)
		parent = target.closest('.comment')
		id = parent.attr('id')
		@reply_id = id
		@reply_author = $(parent.find('.author')).text()

		@$('.reply_to').remove()
		temp = Templates.ReplyTo
			author: @reply_author
			id: @reply_id
		@$el.append temp

	collapse: (e) ->
		target = $(e.currentTarget)
		parent = target.closest('.comment')
		parent.addClass('collapse')

	expand: (e) ->
		target = $(e.currentTarget)
		parent = target.closest('.comment')
		parent.removeClass('collapse')

	reply_close: (e) ->
		target = $(e.currentTarget.parentElement)
		@reply_id = @reply_author = null
		target.remove()

	add_comment: (e) ->
		if not Store.authentication?
			Dispatcher.trigger Constants.MESSAGE, new MessageNotAuthenticated()
			return

		target = $(e.currentTarget)
		parent = target.closest('.comment')
		id = parent.attr('id')

		if not @reply_id? then @reply_id = Playlist.current.song.get('name')
		text = @$('.comment_text').val()
		@$('.comment_text').val ''
		Reddit.addComment
			text: text
			thing_id: @reply_id
			callback: (reply) =>
				Playlist.current.song.set 'num_comments', Playlist.current.song.get('num_comments') + 1
				console.log reply if FLAG_DEBUG
				@render()

	vote: (e) ->
		if not Store.authentication?
			Dispatcher.trigger Constants.MESSAGE, new MessageNotAuthenticated()
			return

		target = $(e.currentTarget)
		parent = target.closest('.comment')
		id = parent.attr('id')

		dir = switch
			when target.hasClass 'active' then 0
			when target.hasClass 'upvote' then 1
			when target.hasClass 'downvote' then -1

		Reddit.vote id, dir

		$(parent.find('.upvote, .downvote')).removeClass 'active'
		$(parent.find('.ups')).text parent.data 'ups'
		$(parent.find('.downs')).text parent.data 'downs'

		if dir is 1 or dir is -1
			dirClass = if dir is 1 then 'ups' else 'downs'
			dirEl = $ parent.find(".#{dirClass}")
			initial = parent.data dirClass
			dirEl.text parseInt(initial) + 1
			target.addClass 'active'

	renderComment: (comment) ->
		return if not comment.body?
		time = new Date()
		time.setTime parseInt(comment.created_utc) * 1000
		comment.created_ago = Util.timeSince time

		songId = Playlist.current.song.get('id')
		comment.permalink = "#{API.Reddit.base}/r/#{comment.subreddit}/comments/#{songId}/link/#{comment.id}"

		songSubmitter = Playlist.current.song.get('author')
		comment.isSubmitter = songSubmitter is comment.author

		body = $ _.unescape comment.body_html
		links = body.find('a')
		links.attr('target', '_blank')
		links.each (i) ->
			link = $ @
			url = link.attr 'href'
			isImage = url.match(/\.(jpeg|jpg|gif|png|svg||apng|bmp|ico|webp)$/) isnt null
			if isImage
				link.popup
					title: link.text()
					variation: 'inverted'
					html: "<img class='ui image fluid' src='#{url}'/>"

		html = $(@template comment)
		html.find('.text').append body


		# recurse into nodes
		if (typeof comment.replies is 'object')
			html.append @parse(comment.replies.data.children)

		return html

	parse: (comments) ->
		root = $('<div class="comments"></div>')
		_.each comments, (comment) =>
			root.append @renderComment comment.data
		return root

	render: (index, song) ->
		song = Playlist.current.song if not song?
		return if not song?
		songJSON = song.toJSON()
		@$('.num_comments').text songJSON.num_comments
		@$('.comments.overview').html '<i class="icon loading circle notched"></i>'

		permalink = songJSON.permalink
		if songJSON.num_comments > 0
			Reddit.getComments permalink, (comments_tree) =>
				return if Playlist.current.index isnt index
				@$('.comments.overview').html ''
				_.each comments_tree, (comment) =>
					@$('.comments.overview').append @renderComment comment.data
		else
			return if Playlist.current.index isnt index
			@$('.comments.overview').html 'No comments to display.'

	initialize: () ->
		@listenTo Dispatcher, Constants.SONG_CLICKED, @render
		console.log 'CommentsView :: Ready' if FLAG_DEBUG
		@listenTo Dispatcher, Constants.LOADED_PLAYLIST, (page) =>
			@setElement $('.content.song .comments.root')
			@render()



module.exports = CommentsView
