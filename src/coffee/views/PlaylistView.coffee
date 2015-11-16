
Dispatcher = require('Util').Dispatcher
Templates = require 'Templates'
Constants = require 'Constants'


PlaylistView = Backbone.View.extend
	tagName: 'div'
	className: 'playlist'
	events:
		'click .ui.item': 'activate'
		'click .item.more': 'more'
	template: Templates.PlayListView

	more: (e) ->
		@$('.more').html('<i class="icon notched circle loading"></i>')
		@collection.more()

	activate: (e) ->
		target = $ e.currentTarget
		id = target.data 'id'
		song = @collection.get id
		Dispatcher.trigger Constants.SONG_CLICKED, song

	render: () ->
		content = []
		@collection.each (model) =>
			content.push @template model.toJSON()
		@$el.html content.join ''
		@$el.append $('<div class="item more">Load More</div>')
		@setCurrent @collection.current.index, @collection.current.song

	setCurrent: (index, song) ->
		@$('.item').removeClass 'active'
		$(@$('.item')[index]).addClass 'active'

	initialize: () ->
		@listenTo @collection, 'remove', @render
		@listenTo @collection, 'reset', @render
		@listenTo @collection, 'update', @render
		@listenTo Dispatcher, Constants.SONG_ACTIVATED, @setCurrent
		@listenTo Dispatcher, Constants.LOADED_PLAYLIST, (page) =>
			@setElement $('.content.playlist .music.playlist')
			@render() if @collection.length > 0
			$('.shuffle-button').popup()
			$('.shuffle-button').click =>
				@collection.reset @collection.shuffle()
		console.log 'PlayListView :: Ready' if FLAG_DEBUG



module.exports = PlaylistView
