
Authentication = Backbone.Model.extend
	template: Templates.AuthenticationView
	initialize: () ->
		@$el = $(".titlebar .authentication")
		@$ = (selector) ->
			$(".titlebar .authentication #{selector}")
		if @get ("name")
			@$el.html @template @attributes
			@$(".ui.dropdown").dropdown()
		RMP.dispatcher.trigger "authenticated", @


RMP.dispatcher.on "app:page", (category, page) ->
	if RMP.authentication?
		$(".titlebar .authentication .sign-out").attr("href", "/logout?redirect=/#{page}")
	else
		$(".titlebar .authentication .log-in").attr("href", "/login?redirect=/#{page}")