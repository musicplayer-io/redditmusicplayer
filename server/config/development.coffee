
# Dependencies
express = require 'express'

# Server development configuration
module.exports = ->
	# Output sensible errors with the full stack trace
	@use express.errorHandler
		dumpExceptions: true
		showStack: true
