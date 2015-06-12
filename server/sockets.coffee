passportSocketIo = require("passport.socketio")
session = require 'express-session'
RedisStore = require('connect-redis')(session)
cookieParser = require 'cookie-parser'

onAuthorizeSuccess = (data, accept) ->
	accept()

onAuthorizeFail = (data, message, error, accept) ->
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
		
		socket.join socket.request.user.name

		for ev in simpleEvents
			sendToRoomOnTrigger socket, ev