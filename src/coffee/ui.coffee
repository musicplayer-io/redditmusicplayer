
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

RMP.dispatcher.on "loaded:about", (page) ->
	$(".start.listening").click (e) ->
		console.log "About :: Start Listening" if FLAG_DEBUG
		RMP.dispatcher.trigger "controls:play"
		# RMP.router.navigate "playlist",
			# trigger: true
		RMP.sidebar.open "playlist"
		# RMP.router.playlist()