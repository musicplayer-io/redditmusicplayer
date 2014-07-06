

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
		console.log "Reddit :: GetMusic :: ", @subreddits() if FLAG_DEBUG
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
	save: () ->
		localStorage["sortMethod"] = @get "sortMethod"
		localStorage["topMethod"] = @get "topMethod"
	initialize: () ->
		@set "sortMethod", localStorage["sortMethod"] if localStorage["sortMethod"]?
		@set "topMethod", localStorage["topMethod"] if localStorage["topMethod"]?
		if (@get("sortMethod") isnt "top" or @get("sortMethod") isnt "hot" or @get("sortMethod") isnt "new")
			@changeSortMethod("hot", "week")
			@save()
		@listenTo @, "change", @save

RMP.reddit = new Reddit