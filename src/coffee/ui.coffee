
UIModel = Backbone.View.extend
	tagName: "div"
	className: "container"
	cache: {}
	load: (page, callback, ignoreCache) ->
		if page of @cache and (ignoreCache is false or not ignoreCache?)
			return callback @cache[page]

		console.log "UI :: Load :: ", page if FLAG_DEBUG
		$.get("/#{page}", (data) =>
			@cache[page] = data
			callback data
		)
	navigate: (category, page, container) ->
		@setElementview $(".ui.container.#{container}") if container?
		@load page, (data) =>
			@render data, page
	getElement: (page) ->
		@$("[data-page=#{page}]")
	render: (data, page) ->
		@$el.html data.content
		@$el.find(".ui.dropdown").dropdown()
		document.title = data.seo.title
		RMP.dispatcher.trigger "loaded:#{page}"
	initialize: () ->
		console.log "UI :: Ready" if FLAG_DEBUG
		$(".ui.dropdown").dropdown()
		@listenTo RMP.dispatcher, "app:page", @navigate


RMP.ui = new UIModel
	el: $(".ui.container.two")

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