
CurrentSongView = Backbone.View.extend
	template: Templates.CurrentSongView
	events:
		"click .upvote": "vote"
		"click .downvote": "vote"
	vote: (e) ->
		return if not RMP.authentication?

		target = $(e.currentTarget)
		parent = target.parents(".vote")
		id = parent.attr('id')

		dir = switch
			when target.hasClass "active" then 0
			when target.hasClass "upvote" then 1
			when target.hasClass "downvote" then -1

		RMP.reddit.vote id, dir

		$(parent.find(".upvote, .downvote")).removeClass "active"

		if dir is 1 or dir is -1
			target.addClass "active"
	render: (index, song) ->
		song = RMP.playlist.current.song if not song?
		if not song? then return
		songJSON = song.toJSON()

		@$el.html @template songJSON
		$('.self.text').html($($('.self.text').text()))

		if song.playable is true
			$(".current-song-sidebar .title").text(songJSON.title)
			document.title = "#{songJSON.title} | Music Player for Reddit"
			if song.get("type") is "bandcamp" and song.get("media")
				console.log(song.get("media")) if FLAG_DEBUG
				$(".current-song-sidebar .image").attr "src", song.get("media").oembed.thumbnail_url
			else
				$(".current-song-sidebar .image").attr "src", ""
	initialize: () ->
		@listenTo RMP.dispatcher, "song:change", @render
		console.log "CurrentSongView :: Ready" if FLAG_DEBUG

CommentsView = Backbone.View.extend
	template: Templates.CommentsView
	events:
		"click .upvote": "vote"
		"click .downvote": "vote"
		"click .actions .reply": "reply"
		"click .actions .collapse": "collapse"
		"click .expand": "expand"
		"click .form .add_comment": "add_comment"
		"click .reply_to .close": "reply_close"
	reply: (e) ->
		if not RMP.authentication?
			RMP.dispatcher.trigger "message", new MessageNotAuthenticated()
			return

		target = $(e.currentTarget)
		parent = target.closest(".comment")
		id = parent.attr('id')
		@reply_id = id
		@reply_author = $(parent.find(".author")).text()

		@$(".reply_to").remove()
		temp = Templates.ReplyTo
			author: @reply_author
			id: @reply_id
		@$el.append temp

	collapse: (e) ->
		target = $(e.currentTarget)
		parent = target.closest(".comment")
		parent.addClass("collapse")

	expand: (e) ->
		target = $(e.currentTarget)
		parent = target.closest(".comment")
		parent.removeClass("collapse")


	reply_close: (e) ->
		target = $(e.currentTarget.parentElement)
		@reply_id = @reply_author = null
		target.remove()
	add_comment: (e) ->
		if not RMP.authentication?
			RMP.dispatcher.trigger "message", new MessageNotAuthenticated()
			return

		target = $(e.currentTarget)
		parent = target.closest(".comment")
		id = parent.attr('id')

		if not @reply_id? then @reply_id = RMP.playlist.current.song.get("name")
		text = @$(".comment_text").val()
		@$(".comment_text").val ""
		RMP.reddit.addComment
			text: text
			thing_id: @reply_id
			callback: (reply) =>
				RMP.playlist.current.song.set "num_comments", RMP.playlist.current.song.get("num_comments") + 1
				console.log reply if FLAG_DEBUG
				@render()

	vote: (e) ->
		if not RMP.authentication?
			RMP.dispatcher.trigger "message", new MessageNotAuthenticated()
			return

		target = $(e.currentTarget)
		parent = target.closest(".comment")
		id = parent.attr('id')

		dir = switch
			when target.hasClass "active" then 0
			when target.hasClass "upvote" then 1
			when target.hasClass "downvote" then -1

		RMP.reddit.vote id, dir

		$(parent.find(".upvote, .downvote")).removeClass "active"
		$(parent.find(".ups")).text parent.data "ups"
		$(parent.find(".downs")).text parent.data "downs"

		if dir is 1 or dir is -1
			dirClass = if dir is 1 then "ups" else "downs"
			dirEl = $ parent.find(".#{dirClass}")
			initial = parent.data dirClass
			dirEl.text parseInt(initial) + 1
			target.addClass "active"

	renderComment: (comment) ->
		return if not comment.body?
		time = new Date()
		time.setTime parseInt(comment.created_utc) * 1000
		comment.created_ago = timeSince time

		songId = RMP.playlist.current.song.get("id")
		comment.permalink = "#{API.Reddit.base}/r/#{comment.subreddit}/comments/#{songId}/link/#{comment.id}"

		body = $ _.unescape comment.body_html
		links = body.find("a")
		links.attr("target", "_blank")
		links.each (i) ->
			link = $ @
			url = link.attr "href"
			isImage = url.match(/\.(jpeg|jpg|gif|png|svg||apng|bmp|ico|webp)$/) isnt null
			if isImage
				link.popup
					title: link.text()
					variation: "inverted"
					html: "<img class='ui image fluid' src='#{url}'/>"

		html = $(@template comment)
		html.find(".text").append body


		# recurse into nodes
		if (typeof comment.replies is 'object')
			html.append @parse(comment.replies.data.children)

		return html
	parse: (comments) ->
		root = $("<div class='comments'></div>")
		_.each comments, (comment) =>
			root.append @renderComment comment.data
		return root
	render: (index, song) ->
		song = RMP.playlist.current.song if not song?
		return if not song?
		songJSON = song.toJSON()
		@$(".num_comments").text songJSON.num_comments
		@$(".comments.overview").html ""

		permalink = songJSON.permalink
		if songJSON.num_comments > 0
			RMP.reddit.getComments permalink, (comments_tree) =>
				_.each comments_tree, (comment) =>
					@$(".comments.overview").append @renderComment comment.data

	initialize: () ->
		@listenTo RMP.dispatcher, "song:change", @render
		console.log "CommentsView :: Ready" if FLAG_DEBUG

RMP.currentsongview = new CurrentSongView
	el: $(".content.playlist .current.song")
RMP.commentsview = new CommentsView
	el: $(".content.playlist .comments.root")

RMP.dispatcher.on "loaded:playlist", (page) ->
	RMP.currentsongview.setElement $(".content.song .current.song")
	RMP.currentsongview.render()

	RMP.commentsview.setElement $(".content.song .comments.root")
	RMP.commentsview.render()
