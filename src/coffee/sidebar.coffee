SidebarModel = Backbone.Model.extend
	category: "main"
	page: "discover"
			
Sidebar = Backbone.View.extend
	tagName: "div"
	className: "sidepane"
	events:
		"click .link.item": "openEvent"
	openEvent: (event) ->
		page = event.currentTarget.dataset.page
		@open page
	open: (page) ->
		element = @getElement page
		console.log("Sidebar :: Open ", element) if FLAG_DEBUG
		category = element.parent().data "category"
		@model.set
			"element": element
		console.log "Sidebar :: Click :: #{page}" if FLAG_DEBUG
		RMP.router.navigate page,
			trigger: true
	navigate: (category, page) ->
		@model.set
			"category": category
			"page": page
	getElement: (page) ->
		@$("[data-page=#{page}]")
	render: () ->
		@getElement(@model.previous("page")).removeClass "active" if @model.previous("element")?
		@getElement(@model.get("page")).addClass "active"
	initialize: () ->
		console.log "Sidebar :: Ready" if FLAG_DEBUG
		@listenTo @model, "change:page", @render
		@listenTo RMP.dispatcher, "app:page", @navigate


RMP.sidebar = new Sidebar
	model: new SidebarModel
	el: $(".ui.sidepane")	
