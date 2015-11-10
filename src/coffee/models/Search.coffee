# john site:youtube OR site:soundcloud OR site:basecamp self:no
# http://www.reddit.com/search.json?q=john%20site:youtube%20OR%20site:soundcloud%20OR%20site:basecamp%20self:no

Search = Backbone.Model.extend
	defaults:
		sites: 'site:youtube.com OR site:soundcloud.com OR site:vimeo.com OR site:youtu.be OR site:m.youtube.com'

	toString: () ->
		return @get('text') + ' ' + @get('sites')



module.exports = Search
