
timeSince = (time) ->
	seconds = Math.floor((new Date() - time) / 1000)
	interval = Math.floor(seconds / 31536000);
	return "#{interval} years" if interval > 1
	interval = Math.floor(seconds / 2592000)
	return "#{interval} months" if interval > 1
	interval = Math.floor(seconds / 86400)
	return "#{interval} days" if interval > 1
	interval = Math.floor(seconds / 3600)
	return "#{interval} hours" if interval > 1
	interval = Math.floor(seconds / 60)
	return "#{interval} minutes" if interval > 1
	return "#{Math.floor(seconds)} seconds"


Song = Backbone.Model.extend
	type: "none"
	playable: false
	initialize: () ->
		time = new Date()
		time.setTime parseInt(@get "created_utc") * 1000
		@set "created_ago", timeSince time
		@set "type", @type
		@set "playable", @playable
SongYoutube = Song.extend
	type: "youtube"
	playable: true
SongSoundcloud = Song.extend
	type: "soundcloud"
	playable: true
SongBandcamp = Song.extend
	type: "bandcamp"
	playable: true
SongMP3 = Song.extend
	type: "mp3"
	playable: true

NotASong = Backbone.Model.extend
	type: "link"
	playable: false
	initialize: () ->
		time = new Date()
		time.setTime parseInt(@get "created_utc") * 1000
		@set "created_ago", timeSince time
		@set "type", @type
		@set "playable", @playable
NotALink = NotASong.extend
	type: "self"


Playlist = Backbone.Collection.extend
	current:
		song: null
		index: -1
	parseSong: (item) ->
		song = switch
			when item.domain is "youtube.com" then new SongYoutube item
			when item.domain is "soundcloud.com" then new SongSoundcloud item
			when item.domain.substr(-12) is "bandcamp.com" then new SongBandcamp item
			when item.url.substr(-4) is ".mp3" then new SongMP3 item
			when item.is_self then new NotALink item
			else new NotASong item
	activate: (song) ->
		index = _.indexOf(@models, song)
		@current.song = song
		@current.index = index
		RMP.dispatcher.trigger "song:change", index, song
	refresh: () ->
		RMP.reddit.getMusic (items) =>
			list = []
			_.each items, (item) =>
				list.push @parseSong item.data
			@reset list
	more: (callback) ->
		RMP.reddit.getMore @last().get("name"), (items) =>
			console.log items if FLAG_DEBUG
			_.each items, (item) =>
				@add @parseSong item.data
			callback() if callback?
	forward: () ->
		if @current.index >= @length 
			@more () =>
				@forward()
		else
			@current.index++
			@current.song = @at(@current.index)
			if @current.song.get("playable") is false
				@forward()
			else
				@activate(@current.song)
	backward: () ->
		if (@current.index - 1 <= 0)
			@current.song = @at(@current.index - 1)
			if @current.song.get("playable") is true
				@current.index = 0
				@activate(@current.song)
		else
			@current.index--
			@current.song = @at(@current.index)
			if @current.song.get("playable") is false
				@backward()
			else
				@activate(@current.song)
	playFirstSongIfEmpty: () ->
		if (@current.index is -1)
			@forward()
	initialize: () ->
		@listenTo RMP.subredditplaylist, "add", @refresh
		@listenTo RMP.subredditplaylist, "remove", @refresh

		@listenTo RMP.dispatcher, "controls:forward", @forward
		@listenTo RMP.dispatcher, "controls:backward", @backward
		@listenTo RMP.dispatcher, "controls:sortMethod", @refresh
		@listenTo RMP.dispatcher, "controls:play", @playFirstSongIfEmpty

		@listenTo RMP.dispatcher, "player:ended", @forward


		console.log "Playlist :: Ready" if FLAG_DEBUG

PlaylistView = Backbone.View.extend
	tagName: "div"
	className: "playlist"
	events:
		"click .ui.item": "activate"
		"click .item.more": "more"
	more: (e) ->
		RMP.playlist.more()
	activate: (e) ->
		target = $ e.currentTarget
		id = target.data "id"
		song = RMP.playlist.get id
		RMP.playlist.activate song
	template: Templates.PlayListView
	render: () ->
		@$el.html ""
		RMP.playlist.each (model) =>
			console.log model.toJSON() if FLAG_DEBUG
			@$el.append @template model.toJSON()
		@$el.append $("<div class='item more'>Load More</div>")
		@setCurrent RMP.playlist.current.index, RMP.playlist.current.song
	setCurrent: (index, song) ->
		@$(".item").removeClass "active"
		$(@$(".item")[index]).addClass "active"
	initialize: () ->
		@listenTo RMP.playlist, "add", @render
		@listenTo RMP.playlist, "remove", @render
		@listenTo RMP.playlist, "reset", @render
		@listenTo RMP.dispatcher, "song:change", @setCurrent
		console.log "PlayListView :: Ready" if FLAG_DEBUG

CurrentSongView = Backbone.View.extend
	template: Templates.CurrentSongView
	events:
		"click .upvote": "vote"
		"click .downvote": "vote"
	vote: (e) ->
		target = $(e.currentTarget)
		parent = target.parents(".vote")
		id = parent.attr('id')

		dir = switch
			when target.hasClass "active" then 0
			when target.hasClass "upvote" then 1
			when target.hasClass "docuwnvote" then -1
		
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
			document.title = "#{songJSON.title} | Reddit Music Player"
			if song.get("type") is "bandcamp"
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
		"click .form .add_comment": "add_comment"
		"click .reply_to .close": "reply_close"
	reply: (e) ->
		target = $(e.currentTarget)
		parent = target.parents(".comment")
		id = parent.attr('id')
		@reply_id = id
		@reply_author = $(parent.find(".author")).text()
		
		@$(".reply_to").remove()
		temp = Templates.ReplyTo
			author: @reply_author
			id: @reply_id
		@$el.append temp
	reply_close: (e) ->
		target = $(e.currentTarget.parentElement)
		@reply_id = @reply_author = null
		target.remove()
	add_comment: (e) ->
		target = $(e.currentTarget)
		parent = target.parents(".comment")
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
		target = $(e.currentTarget)
		parent = target.parents(".comment")
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
		time = new Date()
		time.setTime parseInt(comment.created_utc) * 1000
		comment.created_ago = timeSince time

		html = $(@template comment)

		# recurse into nodes
		console.log comment if FLAG_DEBUG
		if (typeof comment.replies == 'object')
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

SortMethodView = Backbone.View.extend
	events:
		"click .item": "select"
	getCurrent: () ->
		@$("[data-value='#{RMP.reddit.get('sortMethod')}']")
	render: () ->
		@$(".item").removeClass "active"
		@getCurrent().addClass "active"
		@$(".ui.dropdown").dropdown()
	select: (e) ->
		target = $ e.currentTarget
		method = target.data "value"
		sortMethod = method
		if method.substr(0,3) is "top"
			sortMethod = "top"
			topMethod = method.substr(4)

		RMP.reddit.changeSortMethod(sortMethod, topMethod)
		RMP.dispatcher.trigger "controls:sortMethod", sortMethod, topMethod
		
		@render()
	initialize: () ->
		@render()

RMP.playlist = new Playlist
RMP.playlistview = new PlaylistView
	el: $(".content.playlist .music.playlist")
RMP.currentsongview = new CurrentSongView
	el: $(".content.playlist .current.song")
RMP.commentsview = new CommentsView
	el: $(".content.playlist .comments.root")
RMP.sortmethodview = new SortMethodView
	el: $(".content.playlist .sortMethod")

RMP.dispatcher.on "loaded:playlist", (page) ->
	RMP.playlistview.setElement $(".content.playlist .music.playlist")
	RMP.playlistview.render() if RMP.playlist.length > 0

	RMP.currentsongview.setElement $(".content.playlist .current.song")
	RMP.currentsongview.render()

	RMP.commentsview.setElement $(".content.playlist .comments.root")
	RMP.commentsview.render()

	RMP.sortmethodview.setElement $(".content.playlist .sortMethod")
	RMP.sortmethodview.render()