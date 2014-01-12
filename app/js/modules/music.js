"use strict";
/*global SC:true */

var RedditModel = require("./reddit");

function MusicModel(musicProgress) {
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
		var self = this;
		var url = "",
			index = 0,
			Reddit = self.Reddit = new RedditModel(),
			type = null;

		var SoundCloud = window.SC || global.SC;
		self.widget = SoundCloud.Widget("sc");
		self.widgetOptions = {
			"auto_advance": false,
			"auto_play": false,
			"buying": false,
			"download": false,
			"hide_related": false,
			"liking": false,
			"sharing": false,
			"show_artwork": false,
			"show_comments": false,
			"show_playcount": false,
			"show_user": false,
			"start_track": "0",
			callback: function (data) {
				self.trigger("load-ready", data);
			}
		};

		self.isPlaying = false;
		self.songs = [];
		self.player = null;
		self.currentSong = null;

	// Methods
		var isLastSong = function () {
			if (self.currentSong === self.songs[0]) {
				console.log("first song");
				$(".prev-btn").addClass("disabled");
			} else {
				$(".prev-btn").removeClass("disabled");
			}
		};

		var isFirstSong = function () {
			if (self.currentSong === self.songs[self.songs.length - 1]) {
				console.log("last song");
				self.trigger("playlist-more");
			}
		};

		var playSong = function (song) {
			self.stop();
			if (song) {
				self.currentSong = song;
				index = self.songs.indexOf(self.currentSong);
				if (song.origin === "youtube.com") {
					var songId = song.file.substr(31);
					$("#youtube").tubeplayer("play", songId);
					self.trigger("playing", true);
					self.trigger("song-playing", song);
				} else if (song.origin === "soundcloud.com") {
					self.one("load-ready", function (data) {
						self.widget.play();
						self.trigger("playing", true);
						self.trigger("song-playing", self.currentSong);
					});
					self.widget.load(song.track.uri, self.widgetOptions);
				}
				isLastSong();
				isFirstSong();
			}
		};

		var getSongByURL = function (songURL) {
			for (var i = self.songs.length - 1; i >= 0; i--) {
				if (self.songs[i].file === songURL) {
					return self.songs[i];
				}
			}
		};

		var seek = function (e) {
			var maxWidth = musicProgress.element.outerWidth();
			var myWidth = e.clientX;
			console.log(musicProgress.element.outerWidth(), e, myWidth / maxWidth);
			if (self.currentSong.origin === "soundcloud.com") {
				self.widget.getDuration(function (dur) {
					self.widget.seekTo((myWidth / maxWidth) * dur);
				});
			} else {
				var data = $("#youtube").tubeplayer("data");
				$("#youtube").tubeplayer("seek", (myWidth / maxWidth) * data.duration);
			}

			musicProgress.seek(myWidth / maxWidth * 100);
		};

		self.play = function () {
			if (self.songs.length > 0) {
				playSong(
					self.songs[index]
				);
			} else {
				Reddit.trigger("update");
				Reddit.one("playlist", function () {
					playSong(
						self.songs[self.index]
					);
				});
			}
		};
		
		self.stop = function () {
			if (self.isPlaying) {
				self.widget.pause();
				$("#youtube").tubeplayer("stop");
				self.trigger("playing", false);
			}
		};

		self.togglePlayBtn = function (value) {
			$(".play-btn").removeClass("stop").removeClass("play");
			$(".play-btn .icon").addClass("hidden");
			if (value === "play") {
				$(".play-btn").addClass("play");
				$(".play-btn .play").removeClass("hidden");
			} else if (value === "stop") {
				$(".play-btn").addClass("stop");
				$(".play-btn .stop").removeClass("hidden");
			}
		};


		$.observable(self);

	// Listeners
		// New Song Selected > Play This Song
		self.on("song-switch", function (song) {
			if (song) {
				if (song.file) {
					playSong(song);
				}
			}
		});
		// Previous Song > Play Previous Song
		self.on("song-previous", function () {
			var indexMin = index - 1;
			if (indexMin >= 0) {
				index--;
				self.play();
			}
		});
		// Next Song > Play Next Song
		self.on("song-next", function () {
			var indexMin = index + 1;
			if (indexMin <= self.songs.length) {
				index++;
				self.play();
			}
		});

		// Update > Update Reddit
		self.on("update", function () {
			Reddit.trigger("update");
		});

		self.on("playlist-more", function () {
			if (self.songs[self.songs.length - 1]) {
				Reddit.trigger("more", self.songs[self.songs.length - 1].name);
			}
		});

	// Reddit
		// Remove Subreddit > Update Reddit > Update Songs
		self.on("menu-selection-remove", function (el) {
			if (el) {
				var sub = el.attr("data-value");
				Reddit.removeSubReddit(sub);
				Reddit.trigger("update");
			}
		});
		// Add Subreddit > Update Reddit
		self.on("menu-selection-add", function (el) {
			if (el) {
				var sub = el.attr("data-value");
				Reddit.addSubReddit(sub);
				Reddit.trigger("update");
			}
		});
		// Clear Subreddits
		self.on("menu-selection-clear", function (el) {
			var sub = el.attr("data-value");
			Reddit.removeSubReddit(sub);
		});
		// New Playlist Received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist", function (playlist) {
			self.songs = playlist;
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		});

		// New Playlist Received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist-update", function (playlist) {
			self.songs = playlist;
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		});

		// More playlist items received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist-add", function (playlist) {
			self.songs.push(playlist);
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		});

	// Listeners
		// Song Selected from Playlist
		self.on("playlist-select", function (songEl, song) {
			if (!songEl.hasClass("active")) {
				$(".music.content .playlist .active").removeClass("active");
				songEl.addClass("active");
				self.trigger("loading");

				self.togglePlayBtn("stop");

				self.trigger("song-switch", song);
			}
		});

		// Play / Pause button
		self.on("play-btn", function () {
			if (!self.isPlaying) {
				self.togglePlayBtn("stop");
				self.play();
				self.trigger("loading");
			} else if (self.isPlaying) {
				self.togglePlayBtn("play");
				self.stop();
			}
		});

		// Play / Pause button
		self.on("musicProgress", seek);
	}

module.exports = MusicModel;

