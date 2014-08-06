passportSocketIo = require("passport.socketio")
session = require 'express-session'
RedisStore = require('connect-redis')(session)
cookieParser = require 'cookie-parser'

onAuthorizeSuccess = (data, accept) ->
	# console.log('successful connection to socket.io')
	accept()

onAuthorizeFail = (data, message, error, accept) ->
	# console.log('failed connection to socket.io:', message)
	if error?
		accept(new Error(message))

sendToRoomOnTrigger = (socket, type) ->
	socket.on type, (data) ->
		socket.to(socket.request.user.name).emit type, data

module.exports = (io) ->
	simpleEvents = ["controls:play", "controls:forward", "controls:backward", "remote:subreddits"]

	io.use passportSocketIo.authorize
		cookieParser: cookieParser
		key: "rmp.id"
		secret: "Reddit Music Player"
		store: new RedisStore
			prefix: "sess"
			port: 6379
			host: "localhost"
		success: onAuthorizeSuccess
		fail: onAuthorizeFail

	io.on "connection", (socket) ->
		return if not socket.request.user
		
		# # console.log "Socket :: User Connected :: #{socket.request.user.name}"
		# socket.on "disconnect", () ->
		# 	# console.log "Socket :: User Disconnected :: #{socket.request.user.name}"

		socket.join socket.request.user.name

		for ev in simpleEvents
			sendToRoomOnTrigger socket, ev