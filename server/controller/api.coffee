
seo = require './seo'
req = require 'request'

# Auth controller
# Provider Reddit Interaction

postToReddit = (url, token, data, callback) ->
	options =
		method: "POST"
		url: "https://oauth.reddit.com#{url}"
		form: data
		headers:
			"Authorization": "bearer #{token}"
			"User-Agent": "Reddit Music Player/1.0 by illyism"
	console.log options
	req(options, callback)

getFromReddit = (url, token, data, callback) ->
	options =
		method: "GET"
		url: "https://oauth.reddit.com#{url}"
		json: data
		headers:
			"Authorization": "bearer #{token}"
			"User-Agent": "User-Agent: Reddit Music Player/1.0 by illyism"
	console.log options
	req(options, callback)

class APIController
	add_comment: (request, response, callback) =>
		if not request.body.thing_id? then return response.send
			error:
				type: "InvalidID"
				message: "Wrong or no ID supplied."

		data =
			comment: request.body.text
			parent: request.body.thing_id

		postToReddit "/api/comment", request.user.accessToken, data, (err, resp, body) ->
			if not err? and resp.statusCode is 200
				response.send body
			else
				console.log err, resp.statusCode, resp.headers, body
				response.send
					error:
						type: "APIError"
						message: "Something went wrong."
						status: resp.statusCode
						data: body

	comments: (request, response, callback) =>
		if not request.query.permalink? then return response.send
			error:
				type: "InvalidPermalink"
				message: "Wrong or no permalink supplied."

		data = 
			sort: request.query.sort
		data.t = request.query.t if request.query.sort is "top"

		getFromReddit request.query.permalink, request.user.accessToken, data, (err, resp, body) ->
			if not err? and resp.statusCode is 200
				response.send body
			else
				console.log err, resp.statusCode, resp.headers, body
				response.send
					error:
						type: "APIError"
						message: "Something went wrong."
						status: resp.statusCode
						data: body

	vote: (request, response, callback) =>
		if not request.body.id? then return response.send
			error:
				type: "InvalidID"
				message: "Wrong or no ID supplied."

		data = 
			dir: parseInt request.body.dir
			id: request.body.id

		postToReddit "/api/vote", request.user.accessToken, data, (err, resp, body) ->
			if not err? and resp.statusCode is 200
				console.log resp.headers
				response.send
					user: request.user._json
					status: resp.statusCode
					data: body
			else
				console.log err, resp.statusCode, resp.headers, body
				response.send
					error:
						type: "APIError"
						message: "Something went wrong."
						status: resp.statusCode
						data: body



	isAuthenticated: (request, response, callback) ->
		return callback() if request.isAuthenticated()
		response.send
			error:
				type: "NotAuthenticated"
				message: "You need to be logged in."

controller = new APIController
module.exports = controller
