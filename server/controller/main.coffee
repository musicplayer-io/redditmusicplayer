
seo = require './seo'

# App controller
# Serves the application - Main Category

render = (request, response, page) ->
	response.render "content/main/#{page}", (err, html) ->
		return console.error err if err?
		data =
			content: html
			user: request.user._json if request.user?
			seo: seo.generate page
			page: page
		if request.xhr then response.send data else response.render "app", data

class AppController
	about: (request, response, callback) =>
		render(request, response, "about")
	browse: (request, response, callback) =>
		render(request, response, "browse")
	playlist: (request, response, callback) =>
		render(request, response, "playlist")
	remote: (request, response, callback) =>
		render(request, response, "remote")
	search: (request, response, callback) =>
		render(request, response, "search")	

controller = new AppController
module.exports = controller
