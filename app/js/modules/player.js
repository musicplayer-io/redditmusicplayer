var MusicModel = require("./music");
var RadioModel = require("./radio");

var ProgressBarModel = require("./progressbar");

// Player
function PlayerModel() {
	/// Controls Music & Radio

	/// Content > Events
		// :: loaded : Done Loading
		// :: loading : Done Loading
		// :: song-switch (song) : Song is switched
		// :: song-previous : Previous song
		// :: song-next : Next song
		// :: update : Get new songs

	/// Listeners > Content
		// :: playlist-select ("radio|music", element, song) : Playlist item is selected.
		// :: play-btn : Play button is pressed
		// :: prev-btn : Previous button is pressed
		// :: next-btn : Next button is pressed
		// :: channel : Channel switched : Update content

	/// Redirects (Music/Radio > Player > Events)
		/// Music
		// :: song (song) : Song is playing
		// :: playing (isPlaying) : State of the playing system
		/// Radio
		// :: song (song) : Song is playing
		// :: playing (isPlaying) : State of the playing system

	// Initialize
		var self = this;

		self.Radio = new RadioModel("http://radioreddit.com/api/status.json");
		self.Music = new MusicModel();

		var channel = "Radio";

	// Methods
		self.play = function() {
			var player;
			if (channel == "Radio")
				 player = self.Radio;
			else player = self.Music;
			self.one("playing", function(isPlaying) {
				if (isPlaying) self.trigger("loaded");
			});
			player.play();
		};

		self.stop = function() {
			var player;
			if (channel == "Radio")
				 player = self.Radio;
			else player = self.Music;
			player.stop();
		}

		Object.defineProperty(self, "isPlaying", {
			get: function() {
				var player;
				if (channel == "Radio")
					 player = self.Radio;
				else player = self.Music;
				return player.isPlaying;
			},
			set: function(value) {
				var player;
				if (channel == "Radio")
					 player = self.Radio;
				else player = self.Music;
				return player.isPlaying = value;
			}
		})

		Object.defineProperty(self, "currentSong", {
			get: function() {
				var player;
				if (channel == "Radio")
					 player = self.Radio;
				else player = self.Music;
				return player.currentSong;
			}
		})

	$.observable(self);

	// Listeners::Music
		self.Music.on("song-playing", function(song) {
			self.trigger("song", "music", song);
			self.trigger("loaded");
		})
		// If Music starts Playing;
		self.Music.on("playing", function(state) {
			self.isPlaying = state;
			self.trigger("playing", "music", self.isPlaying);
			self.trigger("loaded");
			$(".play-btn").removeClass("stop");
			$(".play-btn").addClass("play");
		});
	// Listeners::Radio
		self.Radio.on("song", function(song) {
			console.log("New Song")
			self.trigger("song", "radio", song);
			self.trigger("loaded");
		})
		// If Radio starts Playing;
		self.Radio.on("playing", function(state) {
			self.isPlaying = state;
			self.trigger("playing", "radio", self.isPlaying);
			self.trigger("loaded");
			$(".play-btn").removeClass("stop");
			$(".play-btn").addClass("play");
		});

	// Listeners
		self.on("update", function() {
			var player;
			if (channel == "Radio")
				 player = self.Radio;
			else player = self.Music;
			player.trigger("update");
		})

		// Song Selected from Playlist
		self.on("playlist-select", function(view, songEl, song) {
			if (!songEl.hasClass("active")) {
				if (view == "radio") {
					$(".radio.content .playlist .active").removeClass("active");
				} else if (view == "music") {
					$(".music.content .playlist .active").removeClass("active");
				}
				songEl.addClass("active");
				self.trigger("loading");

				$(".play-btn").removeClass("play");
				$(".play-btn").addClass("stop");

				if (channel == "Radio")
					 player = self.Radio;
				else player = self.Music;
				player.trigger("song-switch", song);
			}
		})

		// More Requested
		self.on("playlist-more", function(view) {
			if (channel == "Radio")
				 player = self.Radio;
			else player = self.Music;
			player.trigger("playlist-more");
		})

		// Play / Pause button
		self.on("play-btn", function() {
			if (!self.isPlaying) {
				$(".play-btn").removeClass("play");
				$(".play-btn").addClass("stop");
				self.play();
				self.trigger("loading");
			} else if (self.isPlaying) {
				$(".play-btn").removeClass("stop");
				$(".play-btn").addClass("play");
				self.stop();
			}
		});

		// Previous Button
		self.on("prev-btn", function() {
			if (channel == "Radio")
				 player = self.Radio;
			else player = self.Music;
			player.trigger("song-previous");
		});
		// Next Button
		self.on("next-btn", function() {
			if (channel == "Radio")
				 player = self.Radio;
			else player = self.Music;
			player.trigger("song-next");
		});
		// Tab Switch
		self.on("channel", function(newChannel) {
			channel = newChannel;
			if (channel == "Radio") {
				self.Radio.trigger("update");
			} else if (channel == "Music") {
				self.Music.trigger("update");
			}
		})
}
module.exports = PlayerModel;