
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