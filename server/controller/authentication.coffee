
seo = require './seo'

reddit = require '../config/reddit'
passport = require 'passport'
util = require 'util'
crypto = require 'crypto'

# Auth controller
# Provider Reddit Interaction

class AuthController

	me: (request, response, callback) =>
		response.send
			user: request.user

	account: (request, response, callback) =>
		response.render "content/authentication/account", {user: request.user}, (err, html) =>
			return console.error err if err
			if request.xhr then @xhr("about", request, response, html) else @app("about", request, response, html)


	login: (request, response, callback) =>
		request.session.redirectBack = request.query.redirect
		response.redirect '/auth/reddit'
	logout: (request, response) =>
		request.logout()
		if request.xhr
			response.send
				user: request.user
		else
			if request.query.redirect? then response.redirect request.query.redirect else response.redirect "/"

	authenticate: (request, response, callback) =>
		request.session.state = crypto.randomBytes(32).toString('hex')
		auth = passport.authenticate 'reddit',
			state: request.session.state
			duration: "permanent"
			scope: reddit.scope
		auth(request, response, callback)
	callback: (request, response, callback) =>
		if request.query.state == request.session.state
			redirectBack = '/'
			redirectBack = request.session.redirectBack if request.session.redirectBack?
			console.log request.query
			auth = passport.authenticate 'reddit',
				successRedirect: redirectBack
				failureRedirect: '/login'
			auth(request, response, callback)
		else
			callback(new Error 403)
	isAuthenticated: (request, response, callback) ->
		return callback() if request.isAuthenticated()
		response.redirect "/login"

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

controller = new AuthController
module.exports = controller
