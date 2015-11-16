
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher



Message = Backbone.Model.extend
	type: 'none'



MessageFailedToGetMusic = Message.extend
	type: 'error'
	status: 'MessageFailedToGetMusic'
	text: 'Failed to load music from Reddit.'
	buttons: [
		{
			text: 'Help',
			className: 'blue',
			url: 'https://www.reddit.com/r/MusicPlayer/comments/3s9h98/help_failed_to_load_music_from_reddit/'
		},
		{
			text: 'Try again?',
			className: 'yellow',
			callback: () -> Dispatcher.trigger Constants.GET_MUSIC
		},
		{
			icon: 'close',
			action: 'close',
			className: 'red icon close'
		}
	]


MessageNotAuthenticated = Message.extend
	type: 'error'
	status: 'MessageNotAuthenticated'
	text: 'You need to be logged in for this'
	buttons: [
		{
			text: 'Log In',
			url: '/login'
		},
		{
			icon: 'close',
			action: 'close',
			className: 'red icon close'
		}
	]





module.exports = Message
module.exports.MessageFailedToGetMusic = MessageFailedToGetMusic
module.exports.MessageNotAuthenticated = MessageNotAuthenticated
