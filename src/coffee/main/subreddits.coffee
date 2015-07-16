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
		"click .share": "share"
		"click .menu.selection .item": "remove"
	share: (e) ->
		subs = RMP.subredditplaylist.pluck("name")
		link = "#{API.MusicPlayer.base}/r/#{subs.join('+')}?autoplay"
		shortLink = "#{API.MusicPlayer.short}/r/#{subs.join('+')}?autoplay"

		modal = $("#modalSubredditShare")
		modal.modal('setting', 'transition', "vertical flip")

		$("#subredditsLink").val(link).focus().select()
		$("#subredditsShort").val(shortLink)

		$("#subredditsShort,#subredditsLink").click -> @select()

		$("#modalSubredditShare .twitter").click () ->
			text = "I 💛 Music Player for Reddit. I'm listening to #{subs.join(', ') } "
			url = "https://twitter.com/intent/tweet?text=#{encodeURIComponent(text)}&url=#{encodeURIComponent(shortLink)}&via=musicplayer_io&related=musicplayer_io"
			openPopup url, "twitter"

		$("#modalSubredditShare .facebook").click () ->
			text = "I 💛 Music Player for Reddit. I'm listening to #{subs.join(', ') } "
			url = "https://www.facebook.com/sharer/sharer.php?u=#{encodeURIComponent(link)}"
			openPopup url, "facebook"

		$("#modalSubredditShare .google.plus").click () ->
			text = "I 💛 Music Player for Reddit. I'm listening to #{subs.join(', ') } "
			url = "https://plus.google.com/share?url=#{encodeURIComponent(link)}"
			openPopup url, "google plus"

		$("#modalSubredditShare .reddit").click () ->
			s = subs.map (sub) -> "[/r/#{sub}]"
			text = "[Playlist] #{s.join(' ')} 💛"
			url = "https://reddit.com/r/musicplayer/submit?title=#{encodeURIComponent(text)}&url=#{encodeURIComponent(link)}&sub=musicplayer"
			openPopup url, "reddit"


		modal.modal("show")
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
			text: target.data "name"

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
		@show()
		redditsInThisCategory = RMP.subredditplaylist.where({"category": @category})
		if redditsInThisCategory is 0 then return
		redditsInThisCategoryByName = _.pluck(_.pluck(redditsInThisCategory, "attributes"), "name")
		@activeReddits = _.intersection redditsInThisCategoryByName, @reddits
		@$(".menu .item").removeClass "active"
		_.each @activeReddits, (element) =>
			@$(".menu .item[data-value='#{element}']").addClass "active"
	hide: () ->
		@$el.hide()
	hideAllExcept: (value) ->
		subsList = _.filter @reddits, (r) -> not _.startsWith r, value
		_.each subsList, (element) =>
			@$(".menu .item[data-value='#{element}']").hide()
	show: () ->
		@$el.show()
		@$(".menu .item").show()
	initialize: () ->
		@category = @$el.data "category"
		@reddits = $.map @$(".selection.menu .item"), (o) ->
			return $(o).data "value"
		@render()

		@listenTo RMP.subredditplaylist, "add", @render
		@listenTo RMP.subredditplaylist, "remove", @render
		@listenTo RMP.subredditplaylist, "reset", @render

		@$(".menu.selection .item").popup
			variation: "inverted"
			position: "right center"
			transition: "fade"
			delay:
	      show: 300

		console.log "SubredditSelectionView :: View Made", @category if FLAG_DEBUG

CustomSubreddit = Backbone.View.extend
	events:
		"keyup input": "keypress"
		"click .button": "submit"
	keypress: (e) ->
		if e.keyCode is 13
			@submit()
		else
			val = @$("input").val()

			_.forEach RMP.subredditsSelection, (s) -> s.show()
			return if not val? or val.trim().length is 0

			val = val.toLowerCase()

			# Hide empty categories
			hiddenList = _.filter RMP.subredditsSelection, (s) ->
				not _.find s.reddits, (r) -> _.startsWith r, val
			_.forEach hiddenList, (list) -> list.hide()

			# Hide empty subs
			showList = _.filter RMP.subredditsSelection, (s) ->
				_.find s.reddits, (r) -> _.startsWith r, val
			_.forEach showList, (list) -> list.hideAllExcept(val)

	submit: () ->
		_.forEach RMP.subredditsSelection, (s) -> s.show()
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
		sub.save()

		@render()
	render: () ->
		@$("input").val("")
	initialize: () ->
		console.log "Custom Subreddit :: Ready" if FLAG_DEBUG
		@listenTo RMP.subredditplaylist, "add", @render
		@listenTo RMP.subredditplaylist, "remove", @render


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
	$(".share.pop").popup()

RMP.dispatcher.on "app:main", () ->
	if RMP.URLsubreddits?
		console.log "URL :: ", RMP.URLsubreddits if FLAG_DEBUG
		newList = _.map RMP.URLsubreddits, (sub) ->
			new Subreddit
				category: "url"
				name: sub
				text: sub
		RMP.subredditplaylist.add newList
	else
		RMP.subredditplaylist.fetch reset: true
		if (RMP.subredditplaylist.length is 0)
			RMP.subredditplaylist.add new Subreddit
				category: "Other"
				name: "listentothis"
				text: "Listen To This"
