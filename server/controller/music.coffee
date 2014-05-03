
seo = require './seo'

# Music controller
# Serves the application - Music Category

class MusicController
	devices: (request, response, callback) =>
		response.render "content/music/devices", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("devices", request, response, html) else @app("devices", request, response, html)
	saved: (request, response, callback) =>
		response.render "content/music/saved", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("saved", request, response, html) else @app("saved", request, response, html)
	recent: (request, response, callback) =>
		response.render "content/music/recent", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("recent", request, response, html) else @app("recent", request, response, html)
	statistics: (request, response, callback) =>
		response.render "content/music/statistics", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("statistics", request, response, html) else @app("statistics", request, response, html)
	settings: (request, response, callback) =>
		response.render "content/music/settings", request, (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("settings", request, response, html) else @app("settings", request, response, html)
	xhr: (page, request, response, html) ->
		response.send
			content: html
			user: request.user._json if request.user?
			seo: seo.generate page
	app: (page, request, response, html) =>
		response.render 'app',
			content: html
			user: request.user._json if request.user?
			seo: seo.generate page

controller = new MusicController
module.exports = controller
