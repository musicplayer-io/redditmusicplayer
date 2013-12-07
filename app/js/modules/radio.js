

// RADIO
function RadioModel(url) {
	/// Controls Radio

	/// Events
		// :: playing (isPlaying) : Event on state change
		// :: newsongs (songs[]) : New songs received
		// :: song (song) : song selected

	/// Listeners
		// :: song-switch (song) : Song was selected > Play this song
		// :: song-previous : Go back an index
		// :: song-next : Go forward an index
		// :: update : Get New Songs
		/// Player
		// :: playing (isPlaying) : Event on state changes
		// :: loaded (isAutoPlaying) : If loaded, play

	// Initialize
		var self = this;

		var online = false;
		var listeners = 0;
		var all_listeners = 0;
		var playlist = "main";
		var index = 0;

		self.currentSong = null;
		self.isPlaying = false;
		self.songs = [];

		var player = {
			load: function(url) {},
			end: function() {}
		};
		$.observable(player);

	// Methods
		var getSongs = function () {
			$.get(url, function(status) {
				if (status) {
					listeners = status.listeners;
					if (status.online === "TRUE") {
						online = true;
					}
					else {
						online = false;
					}
					playlist = status.playlist;
					all_listeners = status.all_listeners;
					self.songs = status.songs.song;
					self.trigger("newsongs", self.songs);
				}
			});
		};

		var playSong = function (song) {
			player.load(song.download_url || song.preview_url);
			self.currentSong = song;
			index = self.songs.indexOf(self.currentSong);
			self.trigger("song", song);
		};

		self.stop = function() {
			if (self.isPlaying) {
				player.end();
			}
		};

		self.play = function() {
			if (self.songs.length > 0) {
				playSong(self.songs[index]);
			} else {
				self.one("newsongs", function() {
					playSong(self.songs[index]);
				})
				getSongs();
			}
		};

	$.observable(self);

	// Listeners
		// New Song Selected
		self.on("song-switch", function(song) {
			if (song) {
				self.stop();
				playSong(song);
			}
		})
		// Previous Song
		self.on("song-previous", function() {
			var indexMin = index - 1;
			self.stop();
			if (indexMin >= 0) {
				index--;
				self.play();
			}
		})
		// Next Song
		self.on("song-next", function() {
			var indexMin = index + 1;
			self.stop();
			if (indexMin <= self.songs.length) {
				index++;
				self.play();
			}
		})

		// Update Songs
		self.on("update", function() {
			getSongs();
		})

		// Playing
		player.on("playing", function(isPlaying) {
			self.isPlaying = isPlaying;
			self.trigger("playing", isPlaying);
		});

		// Loaded
		player.on("loaded", function(autoPlaying) {
			if (!autoPlaying) {
				self.play();
			}
	});
}

/*

artist: "Boys Boys Boys"
genre: "Pop/Rock"
id: "387"
preview_url: "http://radioreddit.com/preview/?mp3=Boys_Boys_Boys_%28fletch44%29_Mountains.mp3"
reddit_title: "Mountains by Boys Boys Boys (fletch44)"
reddit_url: "http://www.radioreddit.com/songs/?song=Boys_Boys_Boys_%28fletch44%29_Mountains"
redditor: "fletch44"
score: "31"
title: "Mountains"

*/

module.exports = RadioModel;