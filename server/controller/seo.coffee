

Pages =
	discover:
		title: "Discover Video | Reddit Video Player"
		description: "Discover great Video from Reddit with the Reddit Video Player."
	browse:
		title: "Browse Subreddits | Reddit Video Player"
		description: "Find the right subreddits for you."
	popular:
		title: "Popular Video | Reddit Video Player"
		description: "The most popular Video on Reddit."
	playlist:
		title: "My Playlist | Reddit Video Player"
		description: "Configure your playlist."
	radio:
		title: "Radio Reddit | Reddit Video Player"
		description: "Listen to Radio Reddit."
	devices:
		title: "My Remote Devices | Reddit Video Player"
		description: "Configure remote devices."
	saved:
		title: "My Saved Video | Reddit Video Player"
		description: "The Video you have saved."
	recent:
		title: "My Recent Songs | Reddit Video Player"
		description: "Songs you've recently listened to."
	statistics:
		title: "My Statistics | Reddit Video Player"
		description: "See your statistics on songs and subreddits."
	settings:
		title: "My Settings | Reddit Video Player"
		description: "Configure your settings."
	authentication:
		title: "My Account | Reddit Video Player"
		description: "Configure your account on Reddit Video Player."
	default:
		title: "Reddit Video Player"
		description: "Play Video from subreddits on reddit. Listen to the best user-curated Video on the web. All of the Video subreddits in one beautiful Video player."

class SEOController
	generate: (page) ->
		if page of Pages
			seo = Pages[page]
		else
			seo = Pages.default
		return seo

controller = new SEOController
module.exports = controller
