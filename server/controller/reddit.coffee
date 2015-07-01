req = require "request"
seo = require "./seo"
_ = require "lodash"

# Reddit controller
# Serves subreddits, comment threads, multireddits

class RedditController
	withSubreddits: (request, response, callback) ->
		subreddits = request.params.subreddit.split("+")
		data = {subreddits: subreddits}
		data.autoplay = true if request.query.autoplay?
		data.user = request.user._json if request.user?
		data.page = "subreddits"
		if subreddits.length > 1
			data.title = subreddits.join(", ")
			response.render "app", data
		else
			sub = subreddits[0].toLowerCase()
			req "https://www.reddit.com/r/#{sub}/about.json", (err, resp, body) ->
				if err?
					data.title = sub
					return response.render "app", data
				try
					json = JSON.parse(body).data
					data.title = json.title
					data.description = json.title
					data.description += " - " + json.public_description if json.public_description?
					data.description += " - " + json.header_title if json.header_title?
					data.image = json.header_img if json.header_img?
					response.render "app", data
				catch e
					data.title = sub
					response.render "app", data
	commentThread: (request, response, callback) =>
		comment = "r/" + request.params.subreddit + "/comments/" + request.params.commentid
		data = {comment: comment}
		data.autoplay = true if request.query.autoplay?
		@render request, response, data, "comments"
	multiReddit: (request, response, callback) =>
		data = {multi: request.params[0]}
		data.autoplay = true if request.query.autoplay?
		@render request, response, data, "multi"
	render: (request, response, data, page) ->
		data.user = request.user._json if request.user?
		data.seo = seo.generate page
		data.page = page
		response.render "app", data

controller = new RedditController
module.exports = controller
