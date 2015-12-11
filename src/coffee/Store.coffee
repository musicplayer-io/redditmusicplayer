
module.exports =
	search: null
	multi: null
	dragging: false
	firstRequest: false
	subredditsSelection: []
	authentication: null
	filterFunction: (song) -> song.data.is_self is false
