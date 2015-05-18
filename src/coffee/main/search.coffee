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