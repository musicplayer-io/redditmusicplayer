window.RMP = {}
RMP.dispatcher = _.clone(Backbone.Events)

# Main
$(document).ready ->
	RMP.dispatcher.trigger "app:main"

$( window ).resize ->
	RMP.dispatcher.trigger "app:resize"