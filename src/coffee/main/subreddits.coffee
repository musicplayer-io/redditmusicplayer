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
		@toArray().join("+")
	toArray: () ->
		@pluck("name").filter((x) -> x)
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
		@listenTo @, "remove", (x) -> x.destroy()
		@listenTo RMP.dispatcher, "remote:subreddits", @parseFromRemote

SubredditPlayListView = Backbone.View.extend
	tagName: "div"
	className: "selection"
	events:
		"click .menu.selection .item": "remove"
	remove: (e) ->
		currentReddit = e.currentTarget.dataset.value
		console.log "SubredditPlayListView :: Remove :: ", currentReddit if FLAG_DEBUG
		if e.currentTarget.dataset.category is "multi"
			RMP.multi = null
			RMP.playlist.refresh()
			@render()
		else if e.currentTarget.dataset.category is "search"
			RMP.search = null
			RMP.playlist.refresh()
			@render()
		else
			RMP.subredditplaylist.remove RMP.subredditplaylist.get currentReddit
	template: Templates.SubredditCurrentPlayListView
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