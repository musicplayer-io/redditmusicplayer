
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher



Message = Backbone.Model.extend
	type: 'none'



MessageFailedToGetMusic = Message.extend
	type: 'error'
	status: 'MessageFailedToGetMusic'
	text: 'Failed to load music from Reddit.'
	help: 'https://www.reddit.com/r/MusicPlayer/comments/3s9h98/help_failed_to_load_music_from_reddit/'
	button: 'Try Again?'

	callback: () ->
		Dispatcher.trigger Constants.GET_MUSIC



MessageNotAuthenticated = Message.extend
	type: 'error'
	status: 'MessageNotAuthenticated'
	text: 'You need to be logged in for this'
	button: 'Log In'
	
	callback: () ->
		location.href = '/login'



module.exports = Message
module.exports.MessageFailedToGetMusic = MessageFailedToGetMusic
module.exports.MessageNotAuthenticated = MessageNotAuthenticated
