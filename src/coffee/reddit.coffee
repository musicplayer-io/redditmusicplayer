

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