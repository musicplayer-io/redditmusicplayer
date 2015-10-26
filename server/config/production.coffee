
# Dependencies
express = require 'express'

# Server production configuration
module.exports = ->
	# Simple error reporting - should display a 500 page
	@use express.errorHandler()
