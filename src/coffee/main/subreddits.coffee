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