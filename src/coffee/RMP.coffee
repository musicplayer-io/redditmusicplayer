
Constants = require 'Constants'
Messages = require 'collections/Messages.coffee'
Playlist = require 'collections/Playlist'
SubredditPlaylist = require 'collections/SubredditPlaylist'

KeyboardController = require 'controllers/KeyboardController'
PlayerController = require 'controllers/PlayerController'
VolumeControl = require 'controllers/VolumeControl'
Remote = require 'controllers/Remote'

Message = require 'models/Message'
ProgressBar = require 'models/ProgressBar'
Authentication = require 'models/Authentication'

ButtonControlView = require 'views/ButtonControlView'
CommentsView = require 'views/CommentsView'
CurrentSongView = require 'views/CurrentSongView'
CustomSubredditView = require 'views/CustomSubredditView'
MessageView = require 'views/MessageView'
PlaylistView = require 'views/PlaylistView'
RemoteView = require 'views/RemoteView'
SearchView = require 'views/SearchView'
SortMethodView = require 'views/SortMethodView'
MobileUI = require 'views/MobileUI'
ProgressBarView = require 'views/ProgressBarView'
SubredditPlayListView = require 'views/SubredditPlayListView'
SubredditSelectionView = require 'views/SubredditSelectionView'
TitleBar = require 'views/TitleBar'
VolumeControlView = require 'views/VolumeControlView'
UI = require 'views/UI'

Util = require 'Util'
Dispatcher = Util.Dispatcher
Store = require 'Store'


initViews = () ->

	# Capture all events
	# Dispatcher.on 'all', (event_name, object) ->
	# 	if _.values(Constants).indexOf(event_name) < 0
	# 		console.error 'EVENT NOT FOUND', event_name
	# 		console.trace()
	# 	else
	# 		console.log 'Event', event_name, object if FLAG_DEBUG

	backward = new ButtonControlView
		el: $('.controls .backward.button')
		attributes:
			clickEvent: Constants.CONTROLS_BACKWARD

	forward = new ButtonControlView
		el: $('.controls .forward.button')
		attributes:
			clickEvent: Constants.CONTROLS_FORWARD

	play = new ButtonControlView
		el: $('.controls .play.button')
		attributes:
			clickEvent: Constants.CONTROLS_PLAY
			listenEvent: "#{Constants.PLAYER_PLAYING} #{Constants.PLAYER_PAUSED} #{Constants.PLAYER_ENDED}"
			checkState: () ->
				player = PlayerController.controller
				if player.type is 'youtube'
					return false if not player.player? or not player.player.getPlayerState?
					return player.player.getPlayerState() is 1
				else
					return player.playerState is Constants.PLAYING

	commentsView = new CommentsView
		el: $('.content.playlist .comments.root')

	currentsongview = new CurrentSongView
		el: $('.content.playlist .current.song')

	customsubredditview = new CustomSubredditView
		el: $('.content.browse .custom-subreddit')

	messageview = new MessageView
		el: $('.ui.messages')
		collection: Messages

	mobileui = new MobileUI
		el: $('.ui.mobilebar')

	playlistview = new PlaylistView
		el: $('.content.playlist .music.playlist')
		collection: Playlist

	progressbarview = new ProgressBarView
		el: $('.controls .middle.menu')
		model: new ProgressBar()

	remoteView = new RemoteView
		el: $('.content.remote')
		model: Remote

	subredditplaylistview = new SubredditPlayListView
		el: $('.content.browse .my.reddit.menu')
		collection: SubredditPlaylist

	$('.content.browse .reddit.subreddits.menu').each (index, element) ->
		Store.subredditsSelection.push new SubredditSelectionView
			el: element

	searchview = new SearchView
		el: $('.content.browse .search-reddit')
		subredditplaylistview: subredditplaylistview

	sortmethodview = new SortMethodView
		el: $('.content.playlist .sortMethod')


	volumecontrol = new VolumeControlView
		model: VolumeControl
		el: $('.controls .volume.control')

	panelOne = new UI
		el: $('.ui.container.one')
		number: 'one'

	panelTwo = new UI
		el: $('.ui.container.two')
		number: 'two'

	panelThree = new UI
		el: $('.ui.container.three')
		number: 'three'

	titlebar = new TitleBar
		el: $('.ui.titlebar')
		panel: panelTwo

	MessageSurvey = Message.extend
		type: 'info'
		status: 'MessageSurvey'
		text: 'We\'re looking for feedback. Help us by filling out this survey.'
		buttons: [
			{
				text: 'View survey',
				className: 'yellow'
				url: 'https://www.surveymonkey.com/r/PHTTNPD'
				callback: () ->
					localStorage.setItem('survey', 'filled')
					Messages.removeByStatus 'MessageSurvey'
			},
			{
				text: 'Never',
				className: 'red'
				callback: () ->
					localStorage.setItem('survey', 'filled')
					Messages.removeByStatus 'MessageSurvey'
			},
			{
				text: 'Remind me later',
				action: 'close',
				className: 'blue close'
			}
		]

	if localStorage.getItem('survey') isnt 'filled'
		showSurvey = () -> Dispatcher.trigger Constants.MESSAGE, new MessageSurvey()
		window.setTimeout showSurvey, 10 * 1000 * 60



initWindowEvents = () ->
	$(window).resize ->
		Dispatcher.trigger Constants.APP_RESIZE

	$(window).mouseup ->
		Store.dragging = false
		Dispatcher.trigger Constants.DRAGGING_STOPPED

	$("<script src='//www.youtube.com/iframe_api' />").appendTo $('.scripts')
	$("<script src='//w.soundcloud.com/player/api.js' />").appendTo $('.scripts')

	if window.addEventListener
		window.addEventListener 'message', Util.onMessageReceived, false
	else
		window.attachEvent 'onmessage', Util.onMessageReceived, false

	Dispatcher.on 'app:page', (category, page) ->
		if Store.authentication isnt null
			$(".titlebar .authentication .sign-out').attr('href', '/logout?redirect=/#{page}")
		else
			$(".titlebar .authentication .log-in').attr('href', '/login?redirect=/#{page}")

start = () ->
	KeyboardController.initEvents()

	Dispatcher.trigger Constants.APP_MAIN
	Dispatcher.trigger Constants.APP_RESIZE

	# Trigger the views to render
	$('.ui.container').each (i, el) ->
		item = $ el
		Dispatcher.trigger "LOADED_#{item.data('page').toUpperCase()}"


loadURLData = () ->
	if url_autoplay? and url_autoplay is true
		Dispatcher.once Constants.LOADED_MUSIC, () ->
			Dispatcher.trigger Constants.CONTROLS_PLAY

	if url_remote?
		Remote.setHash url_remote
		Remote.setReceiver false

	if user_authentication?
		Store.authentication = new Authentication user_authentication

loadURLData()

# Main
$(document).ready ->
	initViews()
	initWindowEvents()
	start()


	console.log '''
		 __								 #							 #
		|--|	 ### # #	##		 ###		 ###	#	 ## # # ### ###
		|	|	 ### # #	#	 #	#			 # #	#	# # ### ##	#
	 () ()	 # # ### ##	 ## ###		 ###	## ###	 # ### #
																	 #					 ###
 	 https://github.com/musicplayer-io/redditmusicplayer

	'''
