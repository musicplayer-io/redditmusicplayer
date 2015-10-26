window.RMP = {}
RMP.dispatcher = _.clone(Backbone.Events)

# Main
$(document).ready ->
	RMP.dispatcher.trigger 'app:main'
	RMP.dispatcher.trigger 'app:resize'
	console.log '''
	   __                 #               #
	  |--|   ### # #  ##     ###     ###  #   ## # # ### ###
	  |  |   ### # #  #   #  #       # #  #  # # ### ##  #
	 () ()   # # ### ##   ## ###     ###  ## ###   # ### #
	                                 #           ###
 	 https://github.com/musicplayer-io/redditmusicplayer

	'''

$( window ).resize ->
	RMP.dispatcher.trigger 'app:resize'

# Dragging
RMP.dragging = false

$(window).mouseup ->
	RMP.dragging = false
	RMP.dispatcher.trigger 'events:stopDragging'
