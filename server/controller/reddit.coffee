
seo = require "./seo"

# Reddit controller
# Serves subreddits, comment threads, multireddits

class RedditController
	withSubreddits: (request, response, callback) =>
		subreddits = request.params.subreddit.split("+")
		data = {subreddits: subreddits}
		data.autoplay = true if request.query.autoplay?

		@render request, response, data, "subreddits"
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
