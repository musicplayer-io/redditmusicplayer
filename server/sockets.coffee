passportSocketIo = require("passport.socketio")
session = require "express-session"
RedisStore = require("connect-redis")(session)
cookieParser = require "cookie-parser"
crypto = require "crypto"

onAuthorizeSuccess = (data, accept) ->
	accept()

onAuthorizeFail = (data, message, error, accept) ->
	accept()

sendToRoomOnTrigger = (socket, type) ->
	socket.on type, (data) ->
		socket.rooms.forEach (room) ->
			socket.to(room).emit type, data

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
		socket.on "join:hash", (hash) ->
			socket.join hash
			console.log "Socket Join ", socket.request.user.name, hash

		if socket.request.user?
			socket.join socket.request.user.name

		for ev in simpleEvents
			sendToRoomOnTrigger socket, ev