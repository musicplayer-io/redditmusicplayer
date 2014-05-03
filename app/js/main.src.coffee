window.RMP = {}
RMP.dispatcher = _.clone(Backbone.Events)

# Main
$(document).ready ->
	RMP.dispatcher.trigger "app:main"
	RMP.dispatcher.trigger "app:resize"

$( window ).resize ->
	RMP.dispatcher.trigger "app:resize"
API = 
	Bandcamp:
		base: "//api.bandcamp.com/api"
		key: "vatnajokull"
	Soundcloud: 
		base: "//api.soundcloud.com"
		key: "5441b373256bae7895d803c7c23e59d9"
	Reddit:
		base: "//www.reddit.com"

FLAG_DEBUG = true

Templates = 
	SubredditPlayListView: _.template("
			<a class='item' data-category='<%= category %>' data-value='<%= name %>'><%= text %></a>
		")
	PlayListView: _.template("
			<div class='ui item' data-id='<%= id %>'>
				<% if (thumbnail) { %>
					<% if (thumbnail == 'self' || thumbnail == 'default') { %>
						<% if (type == 'mp3') { %>
							<i class='left floated icon music large'/>
						<% } else { %>
							<i class='left floated icon chat outline large'/>
						<% } %>
					<% } else {%>
						<img src='<%= thumbnail %>' class='ui image rounded left floated'/>
					<% } %>
				<% } %>
				<div class='content'>
					<div class='title'><%= title %></div>
					<span class='ups'><%= ups %></span> / 
					<span class='downs'><%= downs %></span> • 
					<span class='author'><%= author %></span> in
					<span class='subreddit'><%= subreddit %></span> • 
					<span class='created'><%= created_ago %></span> • 
					<span class='origin'><%= domain %></span> • 
					<span class='comments'><%= num_comments %> comments</span>
				</div>
			</div>
		")
	CurrentSongView: _.template("
			<% if (media) { %>
				<img class='ui image fluid' src='<%= media.oembed.thumbnail_url %>' />
			<% } %>
			<div class='vote' id='<%= name %>'>
				<div class='upvote'><i class='icon up arrow'></i></div>
				<div class='downvote'><i class='icon down arrow'></i></div>
			</div>
			<h3 class='ui header title'><%= title %></h3>
			<table class='ui table inverted'>
				<tbody>
					<% if (media) { %>
						<tr>
							<td>Title</td>
							<td><%= media.oembed.title %></td>
						</tr>
						<tr>
							<td>Description</td>
							<td><%= media.oembed.description %></td>
						</tr>
					<% } %>
					<tr>
						<td class='four wide'>Upvotes</td>
						<td class='thirteen wide'><%= ups %></td>
					</tr><tr>
						<td>Downvotes</td>
						<td><%= downs %></td>
					</tr><tr>
						<td>Author</td>
						<td><%= author %></td>
					</tr><tr>
						<td>Timestamp</td>
						<td><%= subreddit %></td>
					</tr><tr>
						<td>Subreddit</td>
						<td><%= created_ago %> ago</td>
					</tr><tr>
						<td>Origin</td>
						<td><%= domain %></td>
					</tr><tr>
						<td>Comments</td>
						<td><%= num_comments %> comments</td>
					</tr><tr>
						<td colspan='2'>
							<div class='ui 2 fluid tiny buttons'>
								<a target='_blank' class='permalink ui button' href='http://www.reddit.com<%= permalink %>'>
									<i class='url icon'></i>
									Reddit
								</a>
								<% if (type == 'link') { %>
									<a target='_blank' class='ui external button' href='<%= url %>'>
										<i class='external url icon'></i>
										Link
									</a>
								<% } %>
								<% if (media) { %>
									<% if (media && (media.type == 'youtube.com' || media.type == 'youtu.be')) { %>
										<script src='https://apis.google.com/js/platform.js'></script>
										<div class='ui youtube tiny button'>
											<div class='g-ytsubscribe' data-channel='<%= media.oembed.author_name %>' data-layout='default' data-theme='dark' data-count='default'></div>
										</div>
									<% } else if (media.type == 'soundcloud.com') { %>
										<a href='<%= media.oembed.author_url %>' target='_blank' class='ui soundcloud button'>
											<i class='icon male'></i>
											<%= media.oembed.author_name %>
										</a>
									<% } %>
								<% } %>
							</div>
						</td>
					</tr>
				</tbody>
			</table>
			<% if (is_self) { %>
				<div class='ui divider'></div>
				<div class='self text'>
					<%= selftext_html %>
				</div>
			<% } %>
		")
	CommentsView: _.template("
			<div class='comment' id='<%= name %>' data-ups='<%= ups %>' data-downs='<%= downs %>'>
				<div class='vote'>
					<div class='upvote<% if (likes === true) print(' active') %>'><i class='icon up arrow'></i></div>
					<div class='downvote<% if (likes === false) print(' active') %>'><i class='icon down arrow'></i></div>
				</div>
				<div class='content'>
					<a class='author'><%= author %></a>
					<div class='metadata'>
						<span class='ups'><%= ups %></span>/ <span class='downs'><%= downs %></span>
						<span class='date'><%= created_ago %> ago</span>
					</div>
					<div class='text'><% print(_.unescape(body_html)) %></div>
					<div class='actions'><a class='reply'>Reply</a></div>
				</div>
			</div>
		")
	ReplyTo: _.template("
			<span class='ui reply_to label inverted black fluid' id='<%= id %>'>
				Replying to <%= author %>
				<i class='icon close'></i>
			</span>
		")
	AuthenticationView: _.template("
			<div class='item ui dropdown reddit account' id='<%= id %>'>
				<i class='icon user'></i>
				<%= name %>
				<i class='icon dropdown'></i>
				<div class='menu'>
					<div class='item'>
						<%= link_karma %> Link Karma
					</div>
					<div class='item'>
						<%= comment_karma %> Comment Karma
					</div>
					<% if (is_gold == true) { %>
						<div class='item'>
							Gold Member
						</div>
					<% } %>
					<a class='item sign-out' href='/logout'>
						<i class='icon off'></i>
						Log Out
					</a>
				</div>
			</div>
		")

RouterModel = Backbone.Router.extend
	routes:
		"discover": "discover"
		"browse": "browse"
		"popular": "popular"
		"playlist": "playlist"
		"radio": "radio"
		"/": "about"
		"about": "about"
		"devices": "devices"
		"saved": "saved"
		"recent": "recent"
		"statistics": "statistics"
		"settings": "settings"
	discover: () ->
		console.log "Router :: Discover" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "discover"
	about: () ->
		console.log "Router :: About" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "about"
	browse: () ->
		console.log "Router :: Browse" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "browse"
	playlist: () ->
		console.log "Router :: Playlist" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "playlist"
	initialize: () ->
		console.log "Router :: Ready" if FLAG_DEBUG

RMP.router = new RouterModel

RMP.dispatcher.on "app:main", (category, page) -> 
	Backbone.history.start({pushState: true}) if not Backbone.History.started
	console.log "History :: Ready" if FLAG_DEBUG


Reddit = Backbone.Model.extend
	defaults:
		sortMethod: "hot"
		topMethod: "month"
	vote: (id, dir) ->
		data = 
			id: id
			dir: dir
		$.ajax
			type: 'POST'
			dataType: "json"
			url: "/api/vote"
			data: data
			success: (resp) =>
				console.log resp if FLAG_DEBUG
	subreddits: () ->
		return RMP.subredditplaylist.toString()
	getMusic: (callback) ->
		data = {}
		data.sort = @get("sortMethod")
		data.t = @get("topMethod") if @get("sortMethod") is "top"
		$.ajax
			dataType: "json"
			url: "#{API.Reddit.base}/r/#{@subreddits()}/#{@get('sortMethod')}.json?jsonp=?"
			data: data
			success: (r) =>
				callback r.data.children
	getMore: (last, callback) ->
		data = {}
		data.sort = @get("sortMethod")
		data.t = @get("topMethod") if @get("sortMethod") is "top"
		data.after = last
		$.ajax
			dataType: "json"
			url: "#{API.Reddit.base}/r/#{@subreddits()}/#{@get('sortMethod')}.json?jsonp=?"
			data: data
			success: (r) =>
				callback r.data.children
	getComments: (permalink, callback) ->
		data = {}
		data.sort = @get("sortMethod")
		data.t = @get("topMethod") if @get("sortMethod") is "top"
		url = "#{API.Reddit.base}#{permalink}.json?jsonp=?"
		url = "/api/comments" if RMP.authentication?
		data.permalink = permalink if RMP.authentication?
		$.ajax
			dataType: "json"
			url: url
			data: data
			success: (r) =>
				callback r[1].data.children
	addComment: (params) ->
		data = 
			text: params.text
			thing_id: params.thing_id
		$.ajax
			type: 'POST'
			dataType: "json"
			url: "/api/add_comment"
			data: data
			success: (resp) =>
				params.callback(resp)
	changeSortMethod: (sortMethod, topMethod) ->
		@set "sortMethod", sortMethod
		@set "topMethod", topMethod

RMP.reddit = new Reddit

Authentication = Backbone.Model.extend
	template: Templates.AuthenticationView
	initialize: () ->
		@$el = $(".titlebar .authentication")
		@$ = (selector) ->
			$(".titlebar .authentication #{selector}")
		if @get ("name")
			@$el.html @template @attributes
			@$(".ui.dropdown").dropdown()


RMP.dispatcher.on "app:page", (category, page) -> 
	if RMP.authentication?
		$(".titlebar .authentication .sign-out").attr("href", "/logout?redirect=/#{page}")
	else
		$(".titlebar .authentication .log-in").attr("href", "/login?redirect=/#{page}")
ProgressBar = Backbone.Model.extend
	defaults:
		loaded: 0
		current: 0
		duration: 60
		currentSongID: -1
	resize: () ->
		itemWidth = $(".controls .left .item").outerWidth()
		$(".controls .middle").css("width", $("body").innerWidth() - itemWidth*5.4)
		$(".controls .middle .progress").css("width", $("body").innerWidth() - itemWidth*9)
	toMinSecs: (secs) ->
		hours = Math.floor(secs / 3600)
		if hours
			mins = Math.floor((secs / 60) - hours * 60)
			secs = Math.floor(secs % 60)
			"#{String('0'+hours).slice(-2)}:#{String('0'+mins).slice(-2)}:#{String('0'+secs).slice(-2)}"
		else 
			mins = Math.floor(secs / 60)
			secs = Math.floor(secs % 60)
			"#{String('0'+mins).slice(-2)}:#{String('0'+secs).slice(-2)}"
	setDuration: (data) ->
		@set "duration", data
		@set "current", 0
		$(".controls .end.time").text @toMinSecs data
	setLoaded: (data) ->
		@set "loaded", data
		$(".controls .progress .loaded").css("width", data * 100 + "%")
	setCurrent: (data) ->
		@set "current", data
		$(".controls .start.time").text @toMinSecs data
		$(".controls .progress .current").css("width", data / @get("duration") * 100 + "%")
	change: (index, song) ->
		if song.get("id") isnt @get("currentSongID") and song.get("playable") is true
			@setCurrent 0
			@setLoaded 0
			@setDuration 60
			@set "currentSongID", song.get "id"
			$(".controls .progress").removeClass "soundcloud"
	enableSoundcloud: (waveform) ->
		$(".controls .progress").addClass "soundcloud"
		$(".controls .progress .waveform").css "-webkit-mask-box-image", "url(#{waveform})"
	initialize: () ->
		@resize()
		console.log "ProgressBar :: Ready" if FLAG_DEBUG
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "progress:current", @setCurrent
		@listenTo RMP.dispatcher, "progress:loaded", @setLoaded
		@listenTo RMP.dispatcher, "progress:duration", @setDuration
		@listenTo RMP.dispatcher, "app:resize", @resize

RMP.progressbar = new ProgressBar


Button = Backbone.View.extend
	events:
		"click": "click"
	click: (e) ->
		RMP.dispatcher.trigger @attributes.clickEvent, e
	stateChange: (data) ->
		console.log "Button :: StateChange", data if FLAG_DEBUG
		if @checkState(data) is true then @$el.addClass "active" else @$el.removeClass "active"
	initialize: () ->
		@checkState = @attributes.checkState
		@listenTo RMP.dispatcher, @attributes.listenEvent, @stateChange if @attributes.listenEvent?

Buttons = Backbone.Model.extend
	initialize: () ->
		@backward = new Button
			el: $(".controls .backward.button")
			attributes:
				clickEvent: "controls:backward"
		@forward = new Button
			el: $(".controls .forward.button")
			attributes:
				clickEvent: "controls:forward"
		@play = new Button
			el: $(".controls .play.button")
			attributes:
				clickEvent: "controls:play"
				listenEvent: "player:playing player:paused player:ended"
				checkState: (player) ->
					player = RMP.player.controller if (player is window) 
					if player.type is "youtube"
						return player.player.getPlayerState() == 1
					else
						return player.playerState is "playing"
		@shuffle = new Button
			el: $(".controls .shuffle.button")
			attributes:
				clickEvent: "controls:shuffle"
				listenEvent: "player:shuffle"
		@repeat = new Button
			el: $(".controls .repeat.button")
			attributes:
				clickEvent: "controls:repeat"
				listenEvent: "player:repeat"

RMP.buttons = new Buttons
SidebarModel = Backbone.Model.extend
	category: "main"
	page: "discover"
			
Sidebar = Backbone.View.extend
	tagName: "div"
	className: "sidepane"
	events:
		"click .link.item": "open"
	open: (event) ->
		category = event.currentTarget.parentElement.dataset.category
		page = event.currentTarget.dataset.page
		@model.set
			"element": event.currentTarget
		console.log "Sidebar :: Click :: #{page}" if FLAG_DEBUG
		RMP.router.navigate page,
			trigger: true
	navigate: (category, page) ->
		@model.set
			"category": category
			"page": page
	getElement: (page) ->
		@$("[data-page=#{page}]")
	render: () ->
		@getElement(@model.previous("page")).removeClass "active" if @model.previous("element")?
		@getElement(@model.get("page")).addClass "active"
	initialize: () ->
		console.log "Sidebar :: Ready" if FLAG_DEBUG
		@listenTo @model, "change:page", @render
		@listenTo RMP.dispatcher, "app:page", @navigate


RMP.sidebar = new Sidebar
	model: new SidebarModel
	el: $(".ui.sidepane")	


UIModel = Backbone.View.extend
	tagName: "div"
	className: "container"
	cache: {}
	load: (page, callback, ignoreCache) ->
		if page of @cache and (ignoreCache is false or not ignoreCache?)
			return callback @cache[page]

		$.get("/#{page}", (data) =>
			@cache[page] = data
			callback data
		)
	navigate: (category, page) ->
		@load page, (data) =>
			@render data, page
	getElement: (page) ->
		@$("[data-page=#{page}]")
	render: (data, page) ->
		@$el.html data.content
		document.title = data.seo.title
		RMP.dispatcher.trigger "loaded:#{page}"
	initialize: () ->
		console.log "UI :: Ready" if FLAG_DEBUG
		$(".ui.dropdown").dropdown()
		@listenTo RMP.dispatcher, "app:page", @navigate


RMP.ui = new UIModel
	el: $(".ui.container")
Subreddit = Backbone.Model.extend
	defaults:
		category: null
		name: null
		text: null
	idAttribute: "name"
	toString: () ->
		return @escape "name"
	initialize: () ->
		console.log "Subreddit :: Created" if FLAG_DEBUG

SubredditPlaylist = Backbone.Collection.extend
	model: Subreddit
	localStorage: new Backbone.LocalStorage("Subreddits")
	toString: () ->
		RMP.subredditplaylist.pluck("name").join("+")
	initialize: () ->
		console.log "SubredditPlaylist :: Ready" if FLAG_DEBUG
		@listenTo @, "add", @save
		@listenTo @, "remove", @save

SubredditPlayListView = Backbone.View.extend
	tagName: "div"
	className: "selection"
	events:
		"click .menu.selection .item": "remove"
	remove: (e) ->
		currentReddit = e.currentTarget.dataset.value
		RMP.subredditplaylist.get(currentReddit).destroy()
		RMP.subredditplaylist.remove RMP.subredditplaylist.get currentReddit
	template: Templates.SubredditPlayListView
	render: () ->
		@$(".menu.selection").html("")
		RMP.subredditplaylist.each (model) =>
			@$(".menu.selection").append @template model.toJSON()
	initialize: () ->
		@listenTo RMP.subredditplaylist, "add", @render
		@listenTo RMP.subredditplaylist, "remove", @render
		
		console.log "SubredditPlayListView :: Ready" if FLAG_DEBUG

SubredditSelectionView = Backbone.View.extend
	tagName: "div"
	className: "selection"
	events:
		"click .menu.selection .item": "open"
	open: (e) ->
		target = $ e.currentTarget

		currentReddit = new Subreddit
			category: @category
			name: target.data "value"
			text: target.text()

		if target.hasClass "active"
			RMP.subredditplaylist.get(currentReddit).destroy()
			RMP.subredditplaylist.remove currentReddit
		else
			RMP.subredditplaylist.add currentReddit
			RMP.subredditplaylist.get(currentReddit).save()

		console.log "Subreddit :: Changed :: #{currentReddit}" if FLAG_DEBUG
		@render()
	category: "Default"
	reddits: []
	render: () ->
		redditsInThisCategory = RMP.subredditplaylist.where({"category": @category})
		if redditsInThisCategory is 0 then return
		redditsInThisCategoryByName = _.pluck(_.pluck(redditsInThisCategory, "attributes"), "name")
		@activeReddits = _.intersection redditsInThisCategoryByName, @reddits
		@$(".menu .item").removeClass "active"
		_.each @activeReddits, (element) =>
			@$(".menu .item[data-value='#{element}']").addClass "active"
	initialize: () ->
		@category = @$el.data "category"
		@reddits = $.map @$(".selection.menu .item"), (o) -> 
			return $(o).data "value"
		@render()

		@listenTo RMP.subredditplaylist, "add", @render
		@listenTo RMP.subredditplaylist, "remove", @render

		console.log "Subreddit :: View Made" if FLAG_DEBUG



RMP.subredditsSelection = []

RMP.subredditplaylist = new SubredditPlaylist
RMP.subredditplaylistview = new SubredditPlayListView
	el: $(".content.browse .my.reddit.menu")

RMP.dispatcher.on "loaded:browse", (page) ->
	RMP.subredditsSelection = []
	console.time "Making Views" if FLAG_DEBUG
	$(".content.browse .reddit.subreddits.menu").each (index, element) ->
		RMP.subredditsSelection.push new SubredditSelectionView
			el: element
	console.timeEnd "Making Views" if FLAG_DEBUG
	RMP.subredditplaylistview.setElement $(".content.browse .my.reddit.menu")
	RMP.subredditplaylistview.render() if RMP.subredditplaylist.length > 0

RMP.dispatcher.on "app:main", () ->
	RMP.subredditplaylist.fetch()

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
	initialize: () ->
		@listenTo RMP.subredditplaylist, "add", @refresh
		@listenTo RMP.subredditplaylist, "remove", @refresh

		@listenTo RMP.dispatcher, "controls:forward", @forward
		@listenTo RMP.dispatcher, "controls:backward", @backward
		@listenTo RMP.dispatcher, "controls:sortMethod", @refresh

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

MusicPlayer = Backbone.Model.extend
	type: "none"

YoutubePlayer = MusicPlayer.extend
	type: "youtube"
	onPlayerReady: (e) ->
		e.target.playVideo()
	onPlayerStateChange: (e) ->
		console.log "YoutubePlayer :: StateChange", e if FLAG_DEBUG
		switch e.data
			when YT.PlayerState.UNSTARTED then RMP.dispatcher.trigger "player:unstarted", @
			when YT.PlayerState.PLAYING then RMP.dispatcher.trigger "player:playing", @
			when YT.PlayerState.PAUSED then RMP.dispatcher.trigger "player:paused", @
			when YT.PlayerState.ENDED then RMP.dispatcher.trigger "player:ended", @
			when YT.PlayerState.CUED then RMP.dispatcher.trigger "player:cued", @
			when YT.PlayerState.BUFFERING then RMP.dispatcher.trigger "player:buffering", @
	events: () ->
		"onReady": @onPlayerReady
		"onStateChange": @onPlayerStateChange
	init: () ->
		isReady = YT?
		if not isReady then throw "Youtube not Ready!"
		@player = new YT.Player "player",
			videoId: @track.id
			events: @events()
	initProgress: () ->
		RMP.dispatcher.trigger "progress:duration", @player.getDuration() # secs
		getData = () =>
			RMP.dispatcher.trigger "progress:current", @player.getCurrentTime() # secs
			RMP.dispatcher.trigger "progress:loaded", @player.getVideoLoadedFraction() # %
		@interval = setInterval getData, 200 if not @interval?
		console.log "YoutubePlayer :: Interval Set :: #{@interval}" if FLAG_DEBUG
	clean: () ->
		@player.destroy()
		clearInterval @interval
		@interval = null
		@stopListening()
		@off()
		@trigger "destroy"
	switch: (song) ->
		@set song.attributes
		@track = @attributes.media.oembed
		@track.id = @track.url.substr(31)

		@player.loadVideoById @track.id
	playPause: () ->
		if @player.getPlayerState() == 1 then @player.pauseVideo() else @player.playVideo()
	initialize: () ->
		@$el = $("#player") if not @$el?
		@track = @attributes.media.oembed
		@track.id = @track.url.substr(31)

		@init()

		@listenTo RMP.dispatcher, "player:playing", @initProgress
		
		console.log "YoutubePlayer :: ", @track if FLAG_DEBUG
		console.log "Player :: Youtube" if FLAG_DEBUG

SoundcloudPlayer = MusicPlayer.extend
	type: "soundcloud"
	events: () ->
		"playProgress": @progress_play
		"play": @event_trigger("playing")
		"pause": @event_trigger("paused")
		"finish": @event_trigger("ended")
	progress_play: (data) ->
		RMP.dispatcher.trigger "progress:current", data.currentPosition / 1000 # secs
		RMP.dispatcher.trigger "progress:loaded", data.loadedProgress # secs
	playerState: "ended"
	event_trigger: (ev) ->
		return (data) =>
			@player.getDuration (duration) =>
				RMP.dispatcher.trigger "progress:duration", duration / 1000 # secs
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	playPause: () ->
		@player.toggle()
	switch: (song) ->
		@set song.attributes
		@init () =>
			@player.load @track.sc.uri,
				auto_play: true
	setUp: (callback) ->
		if not @player?
			console.log "setting up iframe" if FLAG_DEBUG
			iframe = $("<iframe id='soundcloud' src='//w.soundcloud.com/player/?visual=true&url=#{@track.sc.uri}'>").appendTo($("#player")) if $("#soundcloud").length is 0
			@player = SC.Widget "soundcloud"
			_.each @events(), (listener, ev) =>
				@player.bind ev, listener
		callback() if callback?
	clean: () ->
		@$el.html ""
		@stopListening()
		@off()
		@trigger "destroy"
	init: (callback) ->
		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))

		user_id = url.match(/\/users\/(\d+)/)
		@track.type = "users" if user_id?
		@track.id = user_id[1] if user_id?

		track_id = url.match(/\/tracks\/(\d+)/)
		@track.type = "tracks" if track_id?
		@track.id = track_id[1] if track_id?

		$.ajax
			url: "#{API.Soundcloud.base}/#{@track.type}/#{@track.id}.json?callback=?"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				client_id: API.Soundcloud.key
			success: (sctrack) =>
				console.log sctrack if FLAG_DEBUG
				if not sctrack.streamable then throw "not streamable"
				@track.sc = sctrack

				RMP.progressbar.enableSoundcloud @track.sc.waveform_url
				@setUp callback
	initialize: () ->
		@$el = $("#player") if not @$el?
		@init () =>
			@player.load @track.sc.uri,
				auto_play: true
		
	
MP3Player = MusicPlayer.extend
	type: "mp3"
	events: () ->
		"progress": @progress_play()
		"play": @event_trigger("playing")
		"playing": @event_trigger("playing")
		"pause": @event_trigger("paused")
		"ended": @event_trigger("ended")
		"durationchange": @setDuration()
	setDuration: () ->
		return () =>
			RMP.dispatcher.trigger "progress:duration", @player.duration # secs
	progress_play: (data) ->
		return () =>
			RMP.dispatcher.trigger "progress:loaded", @player.buffered.end(0)/@player.duration # secs
			RMP.dispatcher.trigger "progress:current", @player.currentTime # secs
	playerState: "ended"
	event_trigger: (ev) ->
		return (data) =>
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	init: () ->
		console.log "MP3Player :: Making Player" if FLAG_DEBUG
		@player = $("<audio controls autoplay='true' src='#{@attributes.streaming_url}'/>").appendTo(@$el)[0]
		console.log @$el if FLAG_DEBUG
		@player.play()
		_.each @events(), (listener, ev) =>
			$(@player).bind ev, listener
	clean: (justTheElement) ->
		$(@player).remove()
		@$el.html ""
		@stopListening() if not justTheElement?
		@trigger "destroy" if not justTheElement?
		@off if not justTheElement
	switch: (song) ->
		@set song.attributes
		@set "streaming_url", @get "url"
		@clean(true)
		@init()
	playPause: () ->
		if @playerState is "playing" then @player.pause() else @player.play()
	initialize: () ->
		@$el = $("#player") if not @$el?
		@$el.html ""
		@set "streaming_url", @get "url"
		@init()

BandcampPlayer = MP3Player.extend
	type: "bandcamp"
	getID: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/url/1/info"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				key: API.Bandcamp.key
				url: @get "url"
			success: (data) =>
				@set data
				callback data
	getAlbumInfo: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/album/2/info"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				key: API.Bandcamp.key
				album_id: @get "album_id"
			success: (data) =>
				@set data
				@set data.tracks[0]
				callback data
	getTrackInfo: (callback) ->
		$.ajax
			url: "#{API.Bandcamp.base}/track/3/info"
			jsonp: "callback"
			dataType: "jsonp"
			data:
				key: API.Bandcamp.key
				track_id: @get "track_id"
			success: (data) =>
				@set data
				callback data
	errorAvoidBandCamp: (ids) ->
		console.error "BandCampPlayer :: Error", ids.error_message
		SongBandcamp.prototype.playable = false
		_.each RMP.playlist.where({type:"bandcamp"}), (item) ->
			item.set "playable", false
		RMP.dispatcher.trigger "controls:forward"
	getInfo: (callback) ->
		@getID (ids) =>
			if ids.error?
				return @errorAvoidBandCamp(ids)
			console.log "BandCampPlayer :: IDs Get" if FLAG_DEBUG
			if not ids.track_id?
				console.log "BandCampPlayer :: No Track ID", ids if FLAG_DEBUG
				if ids.album_id?
					console.log "BandCampPlayer :: Get Album Info" if FLAG_DEBUG
					@getAlbumInfo callback
			else
				console.log "BandCampPlayer :: Get Track Info" if FLAG_DEBUG
				@getTrackInfo callback
	switch: (song) ->
		@set song.attributes
		@clean(true)
		@getInfo () =>
			RMP.dispatcher.trigger "progress:duration", @get "duration" # secs
			@init()			
	initialize: () ->
		@$el = $("#player") if not @$el?
		@$el.html ""
		@getInfo () =>
			RMP.dispatcher.trigger "progress:duration", @get "duration" # secs
			@init()			


PlayerController = Backbone.Model.extend
	change: (index, song) ->
		if not @controller?
			@controller = switch
				when song.type is "youtube" then new YoutubePlayer song.attributes
				when song.type is "soundcloud" then new SoundcloudPlayer song.attributes
				when song.type is "bandcamp" then new BandcampPlayer song.attributes
				when song.type is "mp3" then new MP3Player song.attributes
				else throw "Not A Song Sent to Player Controller"
		else
			if song.playable is true
				if @controller.type is song.type
					if @controller.get("id") isnt song.get("id")
						@controller.switch song
				else
					@controller.clean()
					@controller = null
					@change(index, song)
	playPause: (e) ->
		return if not @controller?
		@controller.playPause()
	initialize: () ->
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "controls:play", @playPause

RMP.player = new PlayerController

# Youtube functions
RMP.dispatcher.once "app:main", () ->
	$("<script src='https://www.youtube.com/iframe_api' />").appendTo $(".scripts")
	$("<script src='https://w.soundcloud.com/player/api.js' />").appendTo $(".scripts")

onYouTubeIframeAPIReady = () ->
	console.log "Youtube :: iFramed" if FLAG_DEBUG
	RMP.dispatcher.trigger "youtube:iframe"