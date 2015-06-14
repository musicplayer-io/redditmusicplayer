window.RMP = {}
RMP.dispatcher = _.clone(Backbone.Events)

# Main
$(document).ready ->
	RMP.dispatcher.trigger "app:main"
	RMP.dispatcher.trigger "app:resize"

	wht = `'\033[1;37m'`
	blu = `'\033[1;34m'`
	ylw = `'\033[1;33m'`
	grn = `'\033[1;32m'`
	red = `'\033[1;31m'`
	rst = `'\033[0m'`
	console.log """
	   __                 #               #                  
	  |--|   ### # #  ##     ###     ###  #   ## # # ### ### 
	  |  |   ### # #  #   #  #       # #  #  # # ### ##  #   
	 () ()   # # ### ##   ## ###     ###  ## ###   # ### #   
	                                 #           ###         
	"""

$( window ).resize ->
	RMP.dispatcher.trigger "app:resize"

# Dragging
RMP.dragging = false

$( window ).mouseup ->
	RMP.dragging = false
	RMP.dispatcher.trigger "events:stopDragging"
