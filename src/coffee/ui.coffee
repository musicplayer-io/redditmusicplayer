
UIModel = Backbone.View.extend
	tagName: 'div'
	className: 'container'
	cache: {}
	events:
		'click .switcher .item': 'open'
	# Event on click of the *switcher* icon and selection of a view
	open: (e) ->
		item = $ e.currentTarget
		page = item.data('page')
		@navigate page
	load: (page, callback, ignoreCache) ->
		if page of @cache and (ignoreCache is false or not ignoreCache?)
			return callback @cache[page]

		console.log 'UI :: Load :: ', page if FLAG_DEBUG
		$.get("/#{page}", (data) =>
			@cache[page] = data
			callback data
		)
	navigate: (page) ->
		@page = page
		@load page, (data) =>
			@render data, page
		# Show the changes in navigation
		RMP.mobileui.changeText @number, page
		RMP.titlebar.$('.page.link').removeClass 'active'
		RMP.titlebar.$(".page.link[data-page=#{page}]").addClass 'active'
	getElement: (page) ->
		@$("[data-page=#{page}]")
	render: (data, page) ->
		@$el.html data.content
		@$el.find('.ui.dropdown').dropdown()
		@$el.find('.ui.checkbox').checkbox()
		RMP.dispatcher.trigger "loaded:#{page}"
	scrollInPlaylist: (index, song) ->
		return if not @$el.find('.content').hasClass('playlist')
		offset = @$('.music.playlist .item')[RMP.playlist.current.index].offsetTop
		@$el.scrollTop offset
	initialize: () ->
		@number = switch
			when @$el.hasClass('one') then 'one'
			when @$el.hasClass('two') then 'two'
			when @$el.hasClass('three') then 'three'

		$('.ui.dropdown').dropdown()
		$('.ui.checkbox').checkbox()
		@listenTo RMP.dispatcher, 'app:page', @navigate
		console.log 'UI :: Ready' if FLAG_DEBUG

		@listenTo RMP.dispatcher, 'song:change', @scrollInPlaylist


RMP.ui = [
	new UIModel
		el: $('.ui.container.one')
	new UIModel
		el: $('.ui.container.two')
	new UIModel
		el: $('.ui.container.three')
]

MobileUI = Backbone.View.extend
	tagName: 'div'
	className: 'mobilebar'
	events:
		'click .item': 'click'
	changeText: (item, text) ->
		@$(".item.#{item}").text text
	click: (e) ->
		item = $ e.currentTarget

		page = item.data 'page'
		container = $(".ui.container[data-page=#{page}]")

		$('.ui.container').removeClass 'active'
		container.addClass 'active'

		@$('.item').removeClass 'active'
		item.addClass 'active'
	initialize: () ->
		console.log 'MobileUI :: Ready' if FLAG_DEBUG


TitleBar = Backbone.View.extend
	events:
		'click .page.link': 'pageClick'
	# Event on click of the view icon in the titlebar
	pageClick: (e) ->
		item = $ e.currentTarget
		page = item.data 'page'
		RMP.ui[1].navigate page
	initialize: () ->
		@$('.pop').popup()


RMP.titlebar = new TitleBar
	el: $('.ui.titlebar')

RMP.mobileui = new MobileUI
	el: $('.ui.mobilebar')

RMP.dispatcher.on 'app:main', () ->
	$('.ui.container').each (i, el) ->
		item = $ el
		RMP.dispatcher.trigger "loaded:#{item.data('page')}"
