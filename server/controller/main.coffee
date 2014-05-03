
seo = require './seo'

# App controller
# Serves the application - Main Category

class AppController
	about: (request, response, callback) =>
		response.render "content/main/about", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("about", request, response, html) else @app("about", request, response, html)
	discover: (request, response, callback) =>
		response.render "content/main/discover", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("discover", request, response, html) else @app("discover", request, response, html)
	browse: (request, response, callback) =>
		response.render "content/main/browse", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("browse", request, response, html) else @app("browse", request, response, html)
	popular: (request, response, callback) =>
		response.render "content/main/popular", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("popular", request, response, html) else @app("popular", request, response, html)
	playlist: (request, response, callback) =>
		response.render "content/main/playlist", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("playlist", request, response, html) else @app("playlist", request, response, html)
	radio: (request, response, callback) =>
		response.render "content/main/radio", (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("radio", request, response, html) else @app("radio", request, response, html)
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

controller = new AppController
module.exports = controller
