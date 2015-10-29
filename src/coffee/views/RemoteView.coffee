
Constants = require 'Constants'
Dispatcher = require('Util').Dispatcher
SubredditPlaylist = require 'collections/SubredditPlaylist'



RemoteView = Backbone.View.extend
	events:
		'click .remote-controls .remote-btn': 'button'
		'click .subreddits-copy': 'copySubreddits'
		'click .generate-link': 'generateLink'

	generateLink: () ->
		@model.requestHash (hash) =>
			@model.socket.emit 'join:hash', hash
			url = "#{API.MusicPlayer.base}/remote/#{hash}"
			@$('.hashlink a').attr('href', url)
			@$('.hashlink .text').text hash
			@$('.qrcode').html('')
			@$('.qrcode').qrcode text: url

	copySubreddits: () ->
		@model.send 'remote:subreddits', SubredditPlaylist.toString()

	button: (e) ->
		item = $ e.currentTarget
		return if item.hasClass 'disabled'
		type = item.data 'type'
		@model.send type

	render: () ->
		if @model.has('hash') is true
			@$('.dimmer').removeClass('active')
		if @model.get('receiver') is true
			@$('.checkbox.receiver input').prop('checked', true)
			@$('.remote-controls').hide()
			@$('.remote-receiver').show()
		else
			@$('.checkbox.commander input').prop('checked', true)
			@$('.remote-controls').show()
			@$('.remote-receiver').hide()

	setReceiver: () ->
		@model.set('receiver', true)

	setCommander: () ->
		@model.set('receiver', false)

	changeElement: () ->
		@$('.checkbox.radio').checkbox
			onChange: (value) =>
				if @$('.checkbox.receiver input').is(':checked')
					@setReceiver()
				else
					@setCommander()
		@render()
		if @model.has('name')
			@$('.dimmer').removeClass('active')

	initialize: () ->
		@render()
		@listenTo @model, 'change', @render
		Dispatcher.once Constants.AUTHENTICATED, (authentication) =>
			@$('.dimmer').removeClass('active')

		@listenTo Dispatcher, Constants.LOADED_REMOTE, (page) =>
			@setElement $('.content.remote')
			@changeElement()



module.exports = RemoteView
