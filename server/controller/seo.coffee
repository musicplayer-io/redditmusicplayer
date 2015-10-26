

Pages =
	discover:
		title: 'Discover Music | Reddit Music Player'
		description: 'Discover great music from Reddit with the Reddit Music Player.'
	browse:
		title: 'Browse Subreddits | Reddit Music Player'
		description: 'Find the right subreddits for you.'
	popular:
		title: 'Popular Music | Reddit Music Player'
		description: 'The most popular music on Reddit.'
	playlist:
		title: 'My Playlist | Reddit Music Player'
		description: 'Configure your playlist.'
	radio:
		title: 'Radio Reddit | Reddit Music Player'
		description: 'Listen to Radio Reddit.'
	devices:
		title: 'My Remote Devices | Reddit Music Player'
		description: 'Configure remote devices.'
	saved:
		title: 'My Saved Music | Reddit Music Player'
		description: 'The music you have saved.'
	recent:
		title: 'My Recent Songs | Reddit Music Player'
		description: 'Songs you\'ve recently listened to.'
	statistics:
		title: 'My Statistics | Reddit Music Player'
		description: 'See your statistics on songs and subreddits.'
	settings:
		title: 'My Settings | Reddit Music Player'
		description: 'Configure your settings.'
	authentication:
		title: 'My Account | Reddit Music Player'
		description: 'Configure your account on Reddit Music Player.'
	default:
		title: 'Reddit Music Player'
		description: 'Play music from subreddits on reddit. Listen to the best user-curated music on the web. All of the music subreddits in one beautiful music player.'



class SEOController
	generate: (page) ->
		if page of Pages
			seo = Pages[page]
		else
			seo = Pages.default
		return seo



controller = new SEOController
module.exports = controller
