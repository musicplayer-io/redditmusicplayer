
RouterModel = Backbone.Router.extend
	routes:
		"discover": "discover"
		"browse": "browse"
		"popular": "popular"
		"playlist": "playlist"
		"radio": "radio"
		"/": "about"
		"about": "about"
		"devices": "devices"
		"saved": "saved"
		"recent": "recent"
		"statistics": "statistics"
		"settings": "settings"
	discover: () ->
		console.log "Router :: Discover" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "discover"
	about: () ->
		console.log "Router :: About" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "about"
	browse: () ->
		console.log "Router :: Browse" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "browse"
	playlist: () ->
		console.log "Router :: Playlist" if FLAG_DEBUG
		RMP.dispatcher.trigger "app:page", "main", "playlist"
	initialize: () ->
		console.log "Router :: Ready" if FLAG_DEBUG

RMP.router = new RouterModel

RMP.dispatcher.on "app:main", (category, page) -> 
	Backbone.history.start({pushState: true}) if not Backbone.History.started
	console.log "History :: Ready" if FLAG_DEBUG