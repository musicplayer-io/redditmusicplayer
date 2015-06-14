
# Routes
module.exports = ->

	# Homepage / App
	main = require "./controller/main"
	@get "/", main.playlist # default
	@get "/browse", main.browse
	@get "/playlist", main.playlist
	@get "/remote", main.remote

	# Sockets
	@get "/remote/generate", main.remoteGenerate
	@get "/remote/:hash", main.remoteHash

	# Authentication
	authentication = require "./controller/authentication"
	@get "/login", authentication.login
	@get "/logout", authentication.logout
	@get "/me.json", authentication.isAuthenticated, authentication.me
	@get "/auth/reddit", authentication.authenticate
	@get "/auth/reddit/callback", authentication.callback

	# API
	api = require "./controller/api"
	@post "/api/vote", api.isAuthenticated, api.vote
	@get "/api/comments", api.comments
	@post "/api/add_comment", api.isAuthenticated, api.add_comment
	@get "/api/get/*", api.get

	# Reddit
	reddit = require "./controller/reddit"
	@get "/r/:subreddit", reddit.withSubreddits
	@get "/r/:subreddit/comments/:commentid", reddit.commentThread
	@get "/r/:subreddit/comments/:commentid/:title", reddit.commentThread
	@get /^\/user\/(.+)/, reddit.multiReddit
