window.RMP = {}
RMP.dispatcher = _.clone(Backbone.Events)

# Main
$(document).ready ->
	RMP.dispatcher.trigger "app:main"
	RMP.dispatcher.trigger "app:resize"

$( window ).resize ->
	RMP.dispatcher.trigger "app:resize"

# Dragging
RMP.dragging = false
# $( window ).mousedown ->
#	RMP.dragging = true

$( window ).mouseup ->
	RMP.dragging = false
	RMP.dispatcher.trigger "events:stopDragging"
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
			<% if (url.indexOf('imgur') >= 0) { %>
				<a class='ui image fluid' href='<%= url %>' target='_blank'>
					<img src='<%= url %>' />
				</a>
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
									<% } else if (media.type == 'vimeo.com') { %>
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
		if RMP.subredditplaylist.length is 0
			return "listentothis"
		else
			return RMP.subredditplaylist.toString()
	getMusic: (callback, after) ->
		data = {}
		data.sort = @get("sortMethod")
		data.t = @get("topMethod") if @get("sortMethod") is "top"
		data.after = after if after?

		if RMP.search?
			return @getSearch callback, data
		if RMP.multi?
			return @getMulti callback, data

		console.log "Reddit :: GetMusic :: ", @subreddits() if FLAG_DEBUG
		$.ajax
			dataType: "json"
			url: "#{API.Reddit.base}/r/#{@subreddits()}/#{@get('sortMethod')}.json?jsonp=?"
			data: data
			success: (r) =>
				return console.error "Reddit :: #{r.error.type} :: #{r.error.message}" if r.error?
				callback r.data.children

	getSearch: (callback, data) ->
		@set "search", RMP.search
		console.log "Reddit :: GetSearch ::", @get("search") if FLAG_DEBUG
		$.ajax
			dataType: "json"
			url: "#{API.Reddit.base}/search.json?q=#{@get('search')}&jsonp=?"
			data: data
			success: (r) =>
				return console.error "Reddit :: #{r.error.type} :: #{r.error.message}" if r.error?
				callback r.data.children

	getMulti: (callback, data) ->
		if not @has("multi")
			@set "multi", RMP.multi
		console.log "Reddit :: GetMulti ::", @get("multi") if FLAG_DEBUG
		$.ajax
			dataType: "json"
			url: "#{API.Reddit.base}/user/#{@get('multi')}/#{@get('sortMethod')}.json?jsonp=?"
			data: data
			success: (r) =>
				return console.error "Reddit :: #{r.error.type} :: #{r.error.message}" if r.error?
				callback r.data.children
	getMore: (last, callback) ->
		@getMusic callback, last
		# data = {}
		# data.sort = @get("sortMethod")
		# data.t = @get("topMethod") if @get("sortMethod") is "top"
		# data.after = last
		# $.ajax
		# 	dataType: "json"
		# 	url: "#{API.Reddit.base}/r/#{@subreddits()}/#{@get('sortMethod')}.json?jsonp=?"
		# 	data: data
		# 	success: (r) =>
		# 		return console.error "Reddit :: #{r.error.type} :: #{r.error.message}" if r.error?
		# 		callback r.data.children
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
				return console.error "Reddit :: #{r.error.type} :: #{r.error.message}" if r.error?
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
			success: (r) =>
				return console.error "Reddit :: #{r.error.type} :: #{r.error.message}" if r.error?
				params.callback(r)
	changeSortMethod: (sortMethod, topMethod) ->
		@set "sortMethod", sortMethod
		@set "topMethod", topMethod
	save: () ->
		try
			localStorage["sortMethod"] = @get "sortMethod"
			localStorage["topMethod"] = @get "topMethod"
		catch e
			console.error e
		
	initialize: () ->
		@set "sortMethod", localStorage["sortMethod"] if localStorage["sortMethod"]?
		@set "topMethod", localStorage["topMethod"] if localStorage["topMethod"]?
		if (@get("sortMethod") isnt "top" or @get("sortMethod") isnt "hot" or @get("sortMethod") isnt "new")
			@changeSortMethod("hot", "week")
			@save()
		@listenTo @, "change", @save

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
		RMP.dispatcher.trigger "authenticated", @


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
	setDuration: (data) ->
		@set "duration", data
		@set "current", 0
	setLoaded: (data) ->
		@set "loaded", data
	setCurrent: (data) ->
		@set "current", data
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
		console.log "ProgressBar :: Ready" if FLAG_DEBUG
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "progress:current", @setCurrent
		@listenTo RMP.dispatcher, "progress:loaded", @setLoaded
		@listenTo RMP.dispatcher, "progress:duration", @setDuration
		

ProgressBarView = Backbone.View.extend
	events:
		"mousemove .progress": "seeking"
		"mousedown .progress": "startSeeking"
	justSeeked: false
	startSeeking: (e) ->
		RMP.dragging = true
		@percentage = e.offsetX / @$(".progress").outerWidth()
		@justSeeked = true
	seeking: (e) ->
		return if not @justSeeked # mousedown didn't start on progressbar, return

		@percentage = e.offsetX / @$(".progress").outerWidth()

		if (RMP.dragging) # mouse is down, seek without playing
			RMP.dispatcher.trigger "progress:set", @percentage, !RMP.dragging

		@$(".progress .current").css("width", @percentage * 100 + "%")
	stopSeeking: () ->
		return if not @justSeeked
		
		RMP.dispatcher.trigger "progress:set", @percentage, !RMP.dragging
		console.log "ProgressBarView :: Seek :: #{@percentage*100}%" if FLAG_DEBUG and RMP.dragging is false

		@justSeeked = false
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
	resize: () ->
		itemWidth = $(".controls .left .item").outerWidth()
		@$(".progress").css("width", $("body").innerWidth() - itemWidth*7.5)
	render: () ->
		# set end time
		@$(".end.time").text @toMinSecs @model.get("duration")

		# set loaded progress
		@$(".progress .loaded").css("width", @model.get("loaded") * 100 + "%")

		# set current
		@$(".start.time").text @toMinSecs @model.get("current")
		@$(".progress .current").css("width", @model.get("current") / @model.get("duration") * 100 + "%")
	initialize: () ->
		@resize()
		console.log "ProgressBarView :: Ready" if FLAG_DEBUG
		@listenTo @model, "change", @render
		@listenTo RMP.dispatcher, "app:resize", @resize
		@listenTo RMP.dispatcher, "events:stopDragging", @stopSeeking

RMP.progressbar = new ProgressBar
RMP.progressbarview = new ProgressBarView
	el: $(".controls .middle.menu")
	model: RMP.progressbar

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


VolumeControl = Backbone.Model.extend
	defaults:
		volume: 1
		size: 100

	volumeChange: () ->
		RMP.dispatcher.trigger "controls:volume", @get("volume")

		try
			localStorage["volume"] = @get("volume")
		catch e
			console.error e
		
	initialize: () ->
		@listenTo @, "change:volume", @volumeChange
		@set "volume", (localStorage["volume"]) if localStorage["volume"]?

VolumeControlView = Backbone.View.extend
	events:
		"click .volume-control": "click"
	click: (e) ->

		max = @model.get("size")
		current = (e.offsetY - max) * -1

		ratio = current / max

		@model.set "volume", ratio
	render: () ->
		@$(".volume-bar").css("height", (@model.get("volume") * @model.get("size")) + "px")

		if @model.get("volume") >= 0.5
			@$(".icon.volume").removeClass("off up down").addClass "up"
		else if @model.get("volume") <= 0.1
			@$(".icon.volume").removeClass("off up down").addClass "off"
		else
			@$(".icon.volume").removeClass("off up down").addClass "down"
		
	initialize: () ->
		@listenTo @model, "change:volume", @render
		@render()

RMP.volumecontrol = new VolumeControlView
	model: new VolumeControl
	el: $(".controls .volume.button")

RMP.buttons = new Buttons

UIModel = Backbone.View.extend
	tagName: "div"
	className: "container"
	cache: {}
	events:
		"click .switcher .item": "open"
	open: (e) ->
		item = $ e.currentTarget
		page = item.data("page")
		@navigate page
	load: (page, callback, ignoreCache) ->
		if page of @cache and (ignoreCache is false or not ignoreCache?)
			return callback @cache[page]

		console.log "UI :: Load :: ", page if FLAG_DEBUG
		$.get("/#{page}", (data) =>
			@cache[page] = data
			callback data
		)
	navigate: (page) ->
		@load page, (data) =>
			@render data, page
	getElement: (page) ->
		@$("[data-page=#{page}]")
	render: (data, page) ->
		@$el.html data.content
		@$el.find(".ui.dropdown").dropdown()
		@$el.find(".ui.checkbox").checkbox()
		RMP.dispatcher.trigger "loaded:#{page}"
	initialize: () ->
		console.log "UI :: Ready" if FLAG_DEBUG
		$(".ui.dropdown").dropdown()
		$(".ui.checkbox").checkbox()
		@listenTo RMP.dispatcher, "app:page", @navigate


RMP.ui = [
	new UIModel
		el: $(".ui.container.one")
	new UIModel
		el: $(".ui.container.two")
	new UIModel
		el: $(".ui.container.three")
]

MobileUI = Backbone.View.extend
	tagName: "div"
	className: "mobilebar"
	events:
		"click .item": "click"
	click: (e) ->
		item = $ e.currentTarget

		console.log item
		page = item.data "page"
		container = $(".ui.container[data-page=#{page}]")
		
		$(".ui.container").removeClass "active"
		container.addClass "active"

		@$(".item").removeClass "active"
		item.addClass "active"
	initialize: () ->
		console.log "MobileUI :: Ready" if FLAG_DEBUG


RMP.mobileui = new MobileUI
	el: $(".ui.mobilebar")

RMP.dispatcher.on "loaded:about", (page) ->
	$(".start.listening").click (e) ->
		console.log "About :: Start Listening" if FLAG_DEBUG
		RMP.dispatcher.trigger "controls:play"
		# RMP.router.navigate "playlist",
			# trigger: true
		RMP.sidebar.open "playlist"
		# RMP.router.playlist()

RMP.dispatcher.on "app:main", () ->
	$(".ui.container").each (i, el) ->
		item = $ el
		RMP.dispatcher.trigger "loaded:#{item.data('page')}"
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
	parseFromRemote: (strSubs) ->
		subs = [] 

		for i in strSubs.split("+")
			sub = new Subreddit
				category: "remote"
				name: i
				text: i
			subs.push sub

		@reset subs
	initialize: () ->
		console.log "SubredditPlaylist :: Ready" if FLAG_DEBUG
		@listenTo @, "add", @save
		@listenTo @, "reset", @save
		@listenTo @, "remove", @save
		@listenTo RMP.dispatcher, "remote:subreddits", @parseFromRemote

SubredditPlayListView = Backbone.View.extend
	tagName: "div"
	className: "selection"
	events:
		"click .menu.selection .item": "remove"
	remove: (e) ->
		currentReddit = e.currentTarget.dataset.value
		if e.currentTarget.dataset.category is "multi"
			RMP.multi = null
			RMP.playlist.refresh()
			@render()
		else if e.currentTarget.dataset.category is "search"
			RMP.search = null
			RMP.playlist.refresh()
			@render()
		else
			RMP.subredditplaylist.get(currentReddit).destroy()
			RMP.subredditplaylist.remove RMP.subredditplaylist.get currentReddit
	template: Templates.SubredditPlayListView
	render: () ->
		@$(".menu.selection").html("")
		if RMP.search?
			sub = new Subreddit
				category: "search"
				name: "search: #{RMP.search.get('text')}"
				text: "search: #{RMP.search.get('text')}"
			@$(".menu.selection").append @template sub.toJSON()
		else if RMP.multi
			sub = new Subreddit
				category: "multi"
				name: RMP.multi
				text: RMP.multi
			@$(".menu.selection").append @template sub.toJSON()
		else
			RMP.subredditplaylist.each (model) =>
				@$(".menu.selection").append @template model.toJSON()
	initialize: () ->
		@listenTo RMP.subredditplaylist, "add", @render
		@listenTo RMP.subredditplaylist, "remove", @render
		@listenTo RMP.subredditplaylist, "reset", @render
		
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
		@listenTo RMP.subredditplaylist, "reset", @render

		console.log "Subreddit :: View Made" if FLAG_DEBUG

CustomSubreddit = Backbone.View.extend
	events:
		"keyup input": "enter"
		"click .button": "submit"
	enter: (e) ->
		return if e.keyCode isnt 13
		@submit()
	submit: () ->
		val = @$("input").val()

		return if not val?
		return if val.trim().length < 3

		val = val.toLowerCase()
		return if RMP.subredditplaylist.where({name: val}).length isnt 0

		sub = new Subreddit
				category: "custom"
				name: val
				text: val

		RMP.subredditplaylist.add sub


		@$("input").val("")
	initialize: () ->
		console.log "Custom Subreddit :: Ready" if FLAG_DEBUG


RMP.subredditsSelection = []

RMP.subredditplaylist = new SubredditPlaylist
RMP.subredditplaylistview = new SubredditPlayListView
	el: $(".content.browse .my.reddit.menu")

RMP.customsubreddit = new CustomSubreddit
	el: $(".content.browse .custom-subreddit")

RMP.dispatcher.on "loaded:browse", (page) ->
	RMP.subredditsSelection = []
	console.time "Making Views" if FLAG_DEBUG
	$(".content.browse .reddit.subreddits.menu").each (index, element) ->
		RMP.subredditsSelection.push new SubredditSelectionView
			el: element
	console.timeEnd "Making Views" if FLAG_DEBUG
	RMP.subredditplaylistview.setElement $(".content.browse .my.reddit.menu")
	RMP.subredditplaylistview.render() if RMP.subredditplaylist.length > 0

	RMP.customsubreddit.setElement $(".content.browse .custom-subreddit")

RMP.dispatcher.on "app:main", () ->
	if (RMP.URLsubreddits?)
		RMP.subredditplaylist.reset()
		for sub in RMP.URLsubreddits
			RMP.subredditplaylist.add new Subreddit
				category: "url"
				name: sub
				text: sub
		
	else
		RMP.subredditplaylist.fetch()
	if (RMP.subredditplaylist.length is 0)
		RMP.subredditplaylist.add new Subreddit
			category: "Other"
			name: "listentothis"
			text: "Listen To This"

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
SongVimeo = Song.extend
	type: "vimeo"
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
			when item.domain is "youtube.com" or item.domain is "youtu.be" or item.domain is "m.youtube.com" then new SongYoutube item
			when item.domain is "soundcloud.com" then new SongSoundcloud item
			when item.domain.substr(-12) is "bandcamp.com" then new SongBandcamp item
			when item.url.substr(-4) is ".mp3" then new SongMP3 item
			when item.domain is "vimeo.com" then new SongVimeo item
			when item.is_self then new NotALink item
			else new NotASong item
	activate: (song) ->
		index = _.indexOf(@models, song)
		@current.song = song
		@current.index = index
		RMP.dispatcher.trigger "song:change", index, song
		if @current.index >= @length  - 1
			@more()
	refresh: () ->
		RMP.reddit.getMusic (items) =>
			list = []
			_.each items, (item) =>
				list.push @parseSong item.data
			@reset list
			RMP.dispatcher.trigger "app:loadedMusic"
	more: (callback) ->
		RMP.reddit.getMore @last().get("name"), (items) =>
			console.log items if FLAG_DEBUG
			_.each items, (item) =>
				@add @parseSong item.data
			callback() if callback?
	forward: () ->
		if @current.index >= @length  - 1
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
		@listenTo RMP.subredditplaylist, "reset", @refresh

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
			# console.log model.toJSON() if FLAG_DEBUG
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

SortMethodView = Backbone.View.extend
	events:
		"click .item": "select"
	getCurrent: () ->
		@$("[data-value='#{RMP.reddit.get('sortMethod')}']")
	render: () ->
		@$(".item").removeClass "active"
		@getCurrent().addClass "active"

		@$(".ui.dropdown").dropdown("set selected", "top:#{RMP.reddit.get('topMethod')}")
	select: (e) ->
		target = $ e.currentTarget
		method = target.data "value"
		return if not method?
		sortMethod = method
		topMethod = RMP.reddit.get "topMethod"
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

RMP.sortmethodview = new SortMethodView
	el: $(".content.playlist .sortMethod")

RMP.dispatcher.on "loaded:playlist", (page) ->
	RMP.playlistview.setElement $(".content.playlist .music.playlist")
	RMP.playlistview.render() if RMP.playlist.length > 0

	RMP.sortmethodview.setElement $(".content.playlist .sortMethod")
	RMP.sortmethodview.render()

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

RMP.currentsongview = new CurrentSongView
	el: $(".content.playlist .current.song")
RMP.commentsview = new CommentsView
	el: $(".content.playlist .comments.root")

RMP.dispatcher.on "loaded:playlist", (page) ->
	RMP.currentsongview.setElement $(".content.song .current.song")
	RMP.currentsongview.render()

	RMP.commentsview.setElement $(".content.song .comments.root")
	RMP.commentsview.render()

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
	onError: (e) ->
		console.error "YoutubePlayer :: Error", e if FLAG_DEBUG
		RMP.dispatcher.trigger "controls:forward"
	events: () ->
		"onReady": @onPlayerReady
		"onStateChange": @onPlayerStateChange
		"onError": @onError
	init: () ->
		isReady = YT?
		if not isReady then throw "Youtube not Ready!"
		@player = new YT.Player "player",
			videoId: @track.id
			events: @events()
	initProgress: () ->
		@player.setVolume(RMP.volumecontrol.model.get("volume") * 100)
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
		if @player && @player.getPlayerState? && @player.pauseVideo? && @player.playVideo?
			if @player.getPlayerState() == 1 then @player.pauseVideo() else @player.playVideo()
	volume: (value) ->
		@player.setVolume(value * 100)
	seekTo: (percentage, seekAhead) ->
		@player.seekTo percentage * @player.getDuration(), seekAhead
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
			@player.setVolume(RMP.volumecontrol.model.get("volume") * 100) # didn't work on ready event
			@player.getDuration (duration) =>
				RMP.dispatcher.trigger "progress:duration", duration / 1000 # secs
			@playerState = ev
			RMP.dispatcher.trigger "player:#{ev}", @
	playPause: () ->
		@player.toggle()
	volume: (value) ->
		@player.setVolume(value * 100)
	seekTo: (percentage, seekAhead) ->
		@player.getDuration (duration) =>
			@player.seekTo percentage * duration
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

		track_id = url.match(/\/playlists\/(\d+)/)
		@track.type = "playlists" if track_id?
		@track.id = track_id[1] if track_id?

		console.log @track
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
		@player.volume = RMP.volumecontrol.model.get("volume")
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
	volume: (value) ->
		@player.volume = value
	seekTo: (percentage, seekAhead) ->
		@player.currentTime = percentage * @player.duration
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

VimeoPlayer = MusicPlayer.extend
	type: "vimeo"
	events: () ->
		# "progress": @progress_play()
		# "play": @event_trigger("playing")
		# "playing": @event_trigger("playing")
		# "pause": @event_trigger("paused")
		# "ended": @event_trigger("ended")
		# "durationchange": @setDuration()
	setDuration: () ->
		# return () =>
		# 	RMP.dispatcher.trigger "progress:duration", @player.duration # secs
	progress_play: (data) ->
		# return () =>
		# 	RMP.dispatcher.trigger "progress:loaded", @player.buffered.end(0)/@player.duration # secs
		# 	RMP.dispatcher.trigger "progress:current", @player.currentTime # secs
	playerState: "ended"
	event_trigger: (ev) ->
		# return (data) =>
		# 	@playerState = ev
		# 	RMP.dispatcher.trigger "player:#{ev}", @
	init: () ->
		console.log "VimeoPlayer :: Making Player" if FLAG_DEBUG
		player = $("<iframe src='http://player.vimeo.com/video/#{@track.id}?api=1&autoplay=1' webkitallowfullscreen mozallowfullscreen allowfullscreen frameborder='0'>")
		@$el.append player
		
		@player = player[0].contentWindow
		@player.postMessage({
			"method": "play"
		}, "*")

		# _.each @events(), (listener, ev) =>
		# 	$(@player).bind ev, listener
	clean: (justTheElement) ->
		$("#player iframe").remove()
		@$el.html ""
		@stopListening() if not justTheElement?
		@trigger "destroy" if not justTheElement?
		@off if not justTheElement
	switch: (song) ->
		@set song.attributes

		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))
		video_id = url.match(/\/video\/(\d+)/)
		@track.id = video_id[1] if video_id?

		@clean(true)
		@init()
	playPause: () ->
		if @playerState is "playing" 
			@player.postMessage({method: "pause"}, "*")
		else
			@player.postMessage({method: "play"}, "*")
	seekTo: (percentage, seekAhead) ->
		# @player.currentTime = percentage * @player.duration
	initialize: () ->
		@$el = $("#player") if not @$el?
		@$el.html ""

		@track = @attributes.media.oembed
		url = decodeURIComponent(decodeURIComponent(@track.html))

		video_id = url.match(/\/video\/(\d+)/)
		@track.id = video_id[1] if video_id?
		
		@init()


PlayerController = Backbone.Model.extend
	change: (index, song) ->
		if not @controller?
			@controller = switch
				when song.type is "youtube" then new YoutubePlayer song.attributes
				when song.type is "soundcloud" then new SoundcloudPlayer song.attributes
				when song.type is "bandcamp" then new BandcampPlayer song.attributes
				when song.type is "vimeo" then new VimeoPlayer song.attributes
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
		console.log "PlayerController : PlayPause" if FLAG_DEBUG
		@controller.playPause()
	volume: (value) ->
		return if not @controller?
		console.log "PlayerController :: Volume" if FLAG_DEBUG
		@controller.volume value
	seekTo: (percentage, seekAhead) ->
		return if not @controller?
		@controller.seekTo(percentage, seekAhead)
	initialize: () ->
		@listenTo RMP.dispatcher, "song:change", @change
		@listenTo RMP.dispatcher, "controls:play", @playPause
		@listenTo RMP.dispatcher, "controls:volume", @volume
		@listenTo RMP.dispatcher, "progress:set", @seekTo

RMP.player = new PlayerController

# Youtube functions
RMP.dispatcher.once "app:main", () ->
	$("<script src='https://www.youtube.com/iframe_api' />").appendTo $(".scripts")
	$("<script src='https://w.soundcloud.com/player/api.js' />").appendTo $(".scripts")

onYouTubeIframeAPIReady = () ->
	console.log "Youtube :: iFramed" if FLAG_DEBUG
	RMP.dispatcher.trigger "youtube:iframe"
# john site:youtube OR site:soundcloud OR site:basecamp self:no
# http://www.reddit.com/search.json?q=john%20site:youtube%20OR%20site:soundcloud%20OR%20site:basecamp%20self:no

Search = Backbone.Model.extend
	defaults:
		sites: "site:youtube.com OR site:soundcloud.com OR site:bandcamp.com OR site:vimeo.com OR site:youtu.be OR site:m.youtube.com"
	toString: () ->
		return @get("text") + " " + @get("sites")
	initialize: (@text) ->

SearchView = Backbone.View.extend
	events:
		"keyup input": "enter"
		"click .button": "submit"
	enter: (e) ->
		return if e.keyCode isnt 13
		@submit()
	submit: () ->
		val = @$("input").val()

		return if not val?
		return if val.trim().length < 3

		RMP.search = new Search
			text: val

		RMP.playlist.refresh()
		RMP.subredditplaylistview.render()
	initialize: () ->
		console.log "Search View :: Ready" if FLAG_DEBUG


RMP.searchview = new SearchView
	model: RMP.remote
	el: $(".content.browse .search-reddit")

RMP.dispatcher.on "loaded:browse", (page) ->
	RMP.searchview.setElement $(".content.browse .search-reddit")


Remote = Backbone.Model.extend
	defaults:
		receiver: true
	triggerOnEmit: (type) ->
		@socket.on type, (data) =>
			return if @get("receiver") is false
			console.log "Socket :: Receive :: #{type}", data if FLAG_DEBUG
			RMP.dispatcher.trigger type, data
	send: (type, data) ->
		console.log "Socket :: Send :: #{type}", data if FLAG_DEBUG
		@socket.emit type, data
	setReceiver: (bool) ->
		@set "receiver", bool
	initialize: () ->
		RMP.dispatcher.once "authenticated", (authentication) =>
			@set "name", authentication.get("name")
			@socket = io()

			simpleEvents = ["controls:forward", "controls:backward", "controls:play", "remote:subreddits"]

			for ev in simpleEvents
				@triggerOnEmit ev

RemoteView = Backbone.View.extend
	events:
		"click .remote-controls .button": "button"
		"click .subreddits-copy": "copySubreddits"
	copySubreddits: () ->
		@model.send "remote:subreddits", RMP.subredditplaylist.toString()
	button: (e) ->
		item = $ e.currentTarget
		return if item.hasClass "disabled"
		type = item.data "type"
		@model.send type
	render: () ->
		if @model.get("receiver") is true
			@$(".ui.button").addClass "disabled"
		else
			@$(".ui.button").removeClass "disabled"
	setReceiver: () ->
		RMP.remoteview.model.set("receiver", true)
	setCommander: () ->
		RMP.remoteview.model.set("receiver", false)
	changeElement: () ->
		@$(".checkbox.receiver").checkbox
			onEnable: @setReceiver
			onDisable: @setCommander
		@render()
		if @model.has("name")
			@$(".dimmer").dimmer("hide")
	initialize: () ->
		@render()
		@listenTo @model, "change", @render
		RMP.dispatcher.once "authenticated", (authentication) =>
			@$(".dimmer").dimmer("hide")


RMP.remote = new Remote
RMP.remoteview = new RemoteView
	model: RMP.remote
	el: $(".content.remote")

RMP.dispatcher.on "loaded:remote", (page) ->
	RMP.remoteview.setElement $(".content.remote")
	RMP.remoteview.changeElement()

KeyboardController = Backbone.Model.extend
	defaults:
		shifted: false
	send: (command, e) ->
		RMP.dispatcher.trigger command, e
	initialize: () ->
		$("body").keyup (e) =>

			if (@get("shifted") is true)
				if e.keyCode is 40 then @send "controls:forward", e
				else if e.keyCode is 39 then @send "controls:forward", e
				else if e.keyCode is 37 then @send "controls:backward", e
				else if e.keyCode is 38 then @send "controls:backward", e

				if e.keyCode is 32
					@send "controls:play", e
					e.preventDefault()

			if e.keyCode is 17
				@set "shifted", false

		$("body").keydown (e) =>
			if e.keyCode is 17
				@set "shifted", true

RMP.keyboard = new KeyboardController
