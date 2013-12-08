var RedditModel = require("./reddit")

function MusicModel() {
	/// Controls Music & Radio

	/// Events
		// :: loaded : Done Loading
		// :: song|song-playing (song) : Song is playing
		// :: playing (isPlaying) : State of the playing system

	/// Listeners
		// :: playlist-select ("radio|music", element, song) : Playlist item is selected
		// :: song-switch (song) : Song is switched
		// :: song-previous : Previous song
		// :: song-next : Next song
		// :: update : Get new songs > Reddit
		// :: menu-selection-remove (subreddit) : Remove a subreddit
		// :: menu-selection-add (subreddit) : Add a subreddit

	/// Reddit
		/// Events
		// :: update : Get New Songs
		/// Listeners
		// :: playlist (playlist) : Get a new playlist
		// :: playlist-update (playlist) : Update playlist

	// Initialize
		var self = this
		var url = "",
			index = 0,
			Reddit = new RedditModel(),
			type = null;

		self.widget = SC.Widget("sc");
		self.widgetOptions = {
			auto_advance: false,
			auto_play: false,
			buying: false,
			download: false,
			hide_related: false,
			liking: false,
			sharing: false,
			show_artwork: false,
			show_comments: false,
			show_playcount: false,
			show_user: false,
			start_track: "0",
			callback: function(data) {
				self.trigger("load-ready", data);
			}
		};

		self.isPlaying = false;
		self.songs = [];
		self.player = null;
		self.currentSong = null;

	// Methods
		var isLastSong = function() {
			if (self.currentSong == self.songs[self.songs.length-1]) {
				console.log("last song");
				self.trigger("playlist-more");
			}
		}

		var playSong = function (song) {
			self.stop();
			if (song) {
				self.currentSong = song;
				index = self.songs.indexOf(self.currentSong);
				if (song.origin == "<i class='icon youtube play'></i>") {
					var songId = song.file.substr(31);
					$("#youtube").tubeplayer("play", songId);
					self.trigger("playing", true);
					self.trigger("song-playing", song);
				} else if (song.origin == "soundcloud.com") {
					self.one("load-ready", function(data) {
						self.widget.play();
						self.trigger("playing", true);
						self.trigger("song-playing", self.currentSong);
					})
					self.widget.load(song.track.uri, self.widgetOptions);
				}
				isLastSong();
			}
		}

		var getSongByURL = function(songURL) {
			for (var i = self.songs.length - 1; i >= 0; i--) {
				if (self.songs[i].file == songURL) return self.songs[i];
			};
		}

		self.play = function () {
			if (self.songs.length > 0) {
				playSong(
					self.songs[index]
				);
			} else {
				Reddit.trigger("update");
				Reddit.one("playlist", function() {
					playSong(
						self.songs[self.index]
					);
				})
			}
		}
		
		self.stop = function() {
			if (self.isPlaying) {
				self.widget.pause();
				$("#youtube").tubeplayer("stop");
				self.trigger("playing", false);
			}
		}


	$.observable(self);

	// Listeners
		// New Song Selected > Play This Song
		self.on("song-switch", function(song) {
			if (song) {
				if (song.file) {
					playSong(song);
				}
			}
		})
		// Previous Song > Play Previous Song
		self.on("song-previous", function() {
			var indexMin = index - 1;
			if (indexMin >= 0) {
				index--;
				self.play();
			}
		})
		// Next Song > Play Next Song
		self.on("song-next", function() {
			var indexMin = index + 1;
			if (indexMin <= self.songs.length) {
				index++;
				self.play();
			}
		})

		// Update > Update Reddit
		self.on("update", function() {
			Reddit.trigger("update");
		})

		self.on("playlist-more", function() {
			if (self.songs[self.songs.length-1])
				Reddit.trigger("more", self.songs[self.songs.length-1].name);
		})

	// Reddit
		// Remove Subreddit > Update Reddit > Update Songs
		self.on("menu-selection-remove", function(el) {
			if (el) {
				var sub = el.attr("data-value");
				Reddit.removeSubReddit(sub);
				Reddit.trigger("update");
			}
		})
		// Add Subreddit > Update Reddit
		self.on("menu-selection-add", function(el) {
			if (el) {
				var sub = el.attr("data-value");
				Reddit.addSubReddit(sub);
				Reddit.trigger("update");
			}
		})
		// Clear Subreddits
		self.on("menu-selection-clear", function(el) {
			var sub = el.attr("data-value");
			Reddit.removeSubReddit(sub);
		})
		// New Playlist Received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist", function(playlist) {
			self.songs = playlist;
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		})

		// New Playlist Received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist-update", function(playlist) {
			self.songs = playlist;
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		})

		// More playlist items received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist-add", function(playlist) {
			self.songs.push(playlist);
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		})
}

module.exports = MusicModel;

