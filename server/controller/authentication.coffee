
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

	login: (request, response, callback) =>
		request.session.redirectBack = request.query.redirect if request.session?
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
		console.log "callback", request.query
		redirectBack = '/'
		redirectBack = request.session.redirectBack if request.session? and request.session.redirectBack?
		auth = passport.authenticate 'reddit', (err, user, refreshToken) ->
			return callback(err) if err?
			return response.redirect("/login") if not user?
			request.logIn user, (err) ->
				return callback(err) if err?
				request.session.refreshToken = refreshToken
				return response.redirect(redirectBack)
		auth(request, response, callback)
	isAuthenticated: (request, response, callback) ->
		return callback() if request.isAuthenticated()
		response.redirect "/login"


controller = new AuthController
module.exports = controller
