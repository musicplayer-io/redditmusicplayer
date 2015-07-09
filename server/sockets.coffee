passportSocketIo = require "passport.socketio"
session = require "express-session"
RedisStore = require("connect-redis") session
cookieParser = require "cookie-parser"
crypto = require "crypto"
_ = require "lodash"

onAuthorizeSuccess = (data, accept) ->
	accept()

onAuthorizeFail = (data, message, error, accept) ->
	accept()

sendToRoomOnTrigger = (socket, type) ->
	socket.on type, (data) ->
		socket.rooms.forEach (room) ->
			socket.to(room).emit type, data

io = null

module.exports = (socketio) ->
	io = socketio
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

module.exports.routes = ->
	@post "/remote/:token/:action", (req, res, next) ->
		token = req.params.token
		action = req.params.action

		socket = _.find io.sockets.sockets, (s) ->
			_.find s.rooms, (r) -> token is r

		if not socket?
			return res.send
				control: action
				status: false
				message: "Bad token or disconnecsted"

		switch action
			when "play"
				socket.emit "controls:play"
				res.send
					control: "play"
					status: true

			when "forward"
				socket.emit "controls:forward"
				res.send
					control: "forward"
					status: true

			when "backward"
				socket.emit "controls:forward"
				res.send
					control: "backward"
					status: true

			when "subreddits"
				subreddits = req.body["subreddits[]"]?.join("+")
				subreddits = req.body.subreddits if not subreddits?
				console.log subreddits, req.body
				socket.emit "remote:subreddits", subreddits
				res.send
					control: "subreddits"
					subreddits: subreddits
					status: true

	@get "/remote/:token/:action", (req, res, next) ->
		token = req.params.token
		action = req.params.action

		socket = _.find io.sockets.sockets, (s) ->
			_.find s.rooms, (r) -> token is r

		if not socket?
			return res.send
				control: action
				status: false
				message: "Bad token"

		switch action
			when "user"
				socket.once "answer:user", (data) ->
					res.send
						control: "user"
						status: true
						data: data
				socket.emit "get:user"
			when "play"
				socket.once "answer:play", (data) ->
					res.send
						control: "play"
						status: true
						data: data
				socket.emit "get:play"
			when "subreddits"
				socket.once "answer:subreddits", (data) ->
					res.send
						control: "subreddits"
						status: true
						data: data
				socket.emit "get:subreddits"
			when "song"
				socket.once "answer:song", (data) ->
					if data
						res.send
							control: "song"
							status: true
							data: data
					else
						res.send
							control: "song"
							status: false
							data: {}
							message: "No song selected"
				socket.emit "get:song"
