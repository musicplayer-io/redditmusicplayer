//     Reddit Music Player
//     Copyright (C) 2014  Ilias Ismanalijev

//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU Affero General Public License as
//     published by the Free Software Foundation, either version 3 of the
//     License, or (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU Affero General Public License for more details.

//     You should have received a copy of the GNU Affero General Public License
//     along with this program.  If not, see http://www.gnu.org/licenses/

"use strict";
/*global SC:true */

var RedditModel = require("./reddit");
var PlayersModel = require("./players");

function MusicModel(musicProgress, loadProgress) {
	/// Controls Music & Radio
	/// Interfaces with Reddit and Youtube / Soundcloud

	// Initialize
		var self = this;
		var url = "",
			index = 0,
			Reddit = self.Reddit = new RedditModel(),
			type = null;

		var Players = self.Players = new PlayersModel();

		self.isPlaying = false;
		self.songs = [];
		self.player = null;
		self.currentSong = null;

	// Methods
		var isLastSong = function () {
			if (self.currentSong === self.songs[0]) {
				console.log("Music > First Song");
				$(".prev-btn").addClass("disabled");
			} else {
				$(".prev-btn").removeClass("disabled");
			}
		};

		var isFirstSong = function () {
			if (self.currentSong === self.songs[self.songs.length - 1]) {
				console.log("Music > Last Song");
				self.trigger("playlist-more");
			}
		};

		var playSong = function (song) {
			if (song) {
				self.stop();
				self.currentSong = song;
				index = self.songs.indexOf(self.currentSong);
				if (song.origin === "youtube.com") {
					var songId = song.file.substr(31);
					Players.trigger("youtube-play", songId);
					self.trigger("playing", true);
					self.trigger("song-playing", song);
				} else if (song.origin === "soundcloud.com") {
					Players.one("load-ready", function (data) {
						Players.trigger("soundcloud-play");
						self.trigger("playing", true);
						self.trigger("song-playing", self.currentSong);
					});
					Players.trigger("soundcloud-load", song.track.uri);
				}
				isLastSong();
				isFirstSong();
			}
		};

		var continueSong = function () {
			if (self.currentSong.origin === "youtube.com") {
				Players.trigger("youtube-play");
			} else if (self.currentSong.origin === "soundcloud.com") {
				Players.trigger("soundcloud-play");
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
			if (self.currentSong.origin === "soundcloud.com") {
				Players.trigger("soundcloud-seek", (myWidth / maxWidth));
			} else if (self.currentSong.origin === "youtube.com") {
				Players.trigger("youtube-seek", (myWidth / maxWidth));
			}

			musicProgress.seek(myWidth / maxWidth * 100);
		};

		self.play = function () {
			if (self.songs.length > 0) {
				var newSong = self.songs[index];
				if (newSong === self.currentSong) {
					continueSong();
				} else {
					playSong(newSong);
				}
			} else {
				Reddit.one("playlist", function () {
					playSong(
						self.songs[self.index]
					);
				});
				Reddit.trigger("update");
			}
		};

		self.pause = function () {
			if (self.isPlaying) {
				Players.trigger("soundcloud-pause");
				Players.trigger("youtube-pause");
				self.trigger("playing", false);
			}
		};
		
		self.stop = function () {
			if (self.isPlaying) {
				Players.trigger("soundcloud-stop");
				Players.trigger("youtube-stop");
				self.trigger("playing", false);
			}
		};

		self.togglePlayBtn = function (value) {
			$(".play-btn").removeClass("pause").removeClass("play");
			$(".play-btn .icon").addClass("hidden");
			if (value === "play") {
				$(".play-btn").addClass("play");
				$(".play-btn .play").removeClass("hidden");
			} else if (value === "pause") {
				$(".play-btn").addClass("pause");
				$(".play-btn .pause").removeClass("hidden");
			}
		};

	// Init
		$.observable(self);
		Players.init();

	// Listeners
		// PLAYERS

		// Youtube
		Players.on("youtube-onPlayerEnded", function () {
			console.log("YT > Ended");
			self.togglePlayBtn("play");
			self.isPlaying = false;
			self.trigger("song-next");
			musicProgress.end();
		});

		Players.on("youtube-onPlayerPaused", function () {
			console.log("YT > Paused");
			self.togglePlayBtn("play");
			self.isPlaying = false;
		});

		var timeOut;
		Players.on("youtube-onPlayerUnstarted", function () {
			console.log("YT > Unstarted");
			self.isPlaying = false;
			timeOut = window.setTimeout(function () {
				if (self.isPlaying === false) {
					self.trigger("song-next");
				}
			}, 5000);
		});

		Players.on("youtube-onPlayerPlaying", function () {
			console.log("YT > Playing");
			self.togglePlayBtn("pause");
			self.isPlaying = true;
			loadProgress.trigger("end");
			musicProgress.start();
			self.trigger("music-progress", self.currentSong);
			timeOut = window.clearTimeout(timeOut);
		});

		Players.on("youtube-onPlayerBuffering", function () {
			console.log("YT > Buffering");
			loadProgress.trigger("start");
		});

		Players.on("youtube-message", function (msg) {
			console.log(msg);
		});

		// Soundcloud

		Players.on("souncdloud-onFinish", function () {
			console.log("SC > Ended");
			self.togglePlayBtn("play");
			self.isPlaying = false;
			self.trigger("song-next");
			musicProgress.end();
		});

		Players.on("souncdloud-onPause", function () {
			console.log("SC > Pause");
			self.togglePlayBtn("play");
			self.isPlaying = false;
		});

		Players.on("souncdloud-onPlay", function () {
			console.log("SC > Playing");
			self.trigger("soundcloud-ready");
			self.togglePlayBtn("pause");
			loadProgress.trigger("end");
			self.isPlaying = true;
			musicProgress.start();
		});

		Players.on("souncdloud-onPlayProgress", function (data) {
			self.trigger("music-progress", self.currentSong, data);
		});

		Players.on("souncdloud-message", function (msg) {
			console.log(msg);
		});

		Players.on("youtube-progressbarReturn", function (data) {
			self.trigger("youtube-progressbarReturn", data);
		});
		// Progressbar asks for youtube data
		self.on("youtube-progressbar", function () {
			Players.trigger("youtube-progressbar");
		});

		// -------

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

				self.togglePlayBtn("pause");

				self.trigger("song-switch", song);
			}
		});

		// Play / Pause button
		self.on("play-btn", function (e) {
			if (e) {
				e.preventDefault();
			}
			if (!self.isPlaying) {
				self.togglePlayBtn("pause");
				self.play();
				self.trigger("loading");
			} else if (self.isPlaying) {
				self.togglePlayBtn("play");
				self.pause();
			}
		});

		// Play / Pause button
		self.on("musicProgress", seek);
	}

module.exports = MusicModel;

