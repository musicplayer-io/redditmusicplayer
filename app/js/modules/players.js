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

function PlayersModel() {
	var self = this;

	$.observable(self);

	// Youtube

	var videoMode = false;
	var videoWindow = null;
	var YoutubeInit = function () {
		
		var ytPlayer = $("#youtube").tubeplayer({
			allowFullScreen: "false", // true by default, allow user to go full screen
			autoplay: true,
			initialVideo: "Wkx_xvl7zRA", // the video that is loaded into the player
			preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
			onPlayerEnded: function () {
				self.trigger("youtube-onPlayerEnded");
			},
			onPlayerPaused: function () {
				self.trigger("youtube-onPlayerPaused");
			},
			onPlayerUnstarted: function () {
				self.trigger("youtube-onPlayerUnstarted");
			},
			onPlayerPlaying: function () {
				self.trigger("youtube-onPlayerPlaying");
			},
			onPlayerBuffering: function () {
				self.trigger("youtube-onPlayerBuffering");
			},
			onPlayerCued: function () {
				self.trigger("youtube-message", "YT > onPlayerCued");
			},
			onErrorNotFound: function () {
				self.trigger("youtube-message", "YT > onErrorNotFound");
			},
			onErrorNotEmbeddable: function () {
				self.trigger("youtube-message", "YT > onErrorNotEmbeddable");
			},
			onErrorInvalidParameter: function () {
				self.trigger("youtube-message", "YT > onErrorInvalidParameter");
			},
		});
	};

	self.on("youtube-play", function (id) {
		if ($(".video.open").hasClass("disabled")) {
			$(".video.open").removeClass("disabled");
		}
		if (videoMode === false) {
			if ("undefined" !== typeof(id)) {
				$("#youtube").tubeplayer("play", id);
			} else {
				$("#youtube").tubeplayer("play");
			}
		} else {
			videoWindow.postMessage({
				"type": "players",
				"event": "youtube-play",
				"data": id
			}, "*");
		}
	});
	self.on("youtube-seek", function (percentage) {
		if (videoMode === false) {
			var data = $("#youtube").tubeplayer("data");
			$("#youtube").tubeplayer("seek", percentage * data.duration);
		} else {
			videoWindow.postMessage({
				"type": "players",
				"event": "youtube-seek",
				"data": percentage
			}, "*");
		}
	});
	self.on("youtube-pause", function () {
		if (videoMode === false) {
			$("#youtube").tubeplayer("pause");
		} else {
			videoWindow.postMessage({
				"type": "players",
				"event": "youtube-pause"
			}, "*");
		}
	});
	self.on("youtube-stop", function () {
		if (videoMode === false) {
			$("#youtube").tubeplayer("stop");
		} else {
			videoWindow.postMessage({
				"type": "players",
				"event": "youtube-stop"
			}, "*");
		}
	});

	self.on("youtube-progressbar", function () {
		if (videoMode === false) {
			self.trigger("youtube-progressbarReturn", $("#youtube").tubeplayer("data"));
		} else {
			videoWindow.postMessage({
				"type": "players",
				"event": "youtube-progressbar"
			}, "*");
		}
	});

	self.on("videoOpen", function (vidWin, currentSong) {
		videoWindow = vidWin;
		if (videoWindow !== null) {
			console.log("Video > ON");
			videoMode = true;
			$("#youtube").tubeplayer("pause");
			self.one("yt-ready", function () {
				console.log("Video > Ready");
				var data = $("#youtube").tubeplayer("data");
				self.one("youtube-progressbarReturn", function (data) {
					if (data.videoID !== currentSong.file.substr(31)) {
						videoWindow.postMessage({
							"type": "players",
							"event": "youtube-load",
							"data": {
								"id": currentSong.file.substr(31),
								"time": data.currentTime
							}
						}, "*");
					}
				});
				videoWindow.postMessage({
					"type": "players",
					"event": "youtube-load",
					"data": {
						"id": currentSong.file.substr(31),
						"time": data.currentTime
					}
				}, "*");
			});
		} else {
			videoMode = false;
		}
	});
	self.on("videoClose", function () {
		console.log("Video > OFF");
		self.one("youtube-progressbarReturn", function (data) {
			$("#youtube").tubeplayer("play");
			$("#youtube").tubeplayer("seek", (data.currentTime / data.duration) * data.duration);
		});
		videoWindow.postMessage({
			"type": "players",
			"event": "youtube-progressbar"
		}, "*");
		videoWindow = null;
		videoMode = false;
	});

	

	var messageHandler = function (e) {
		if (e.data.type === "players") {
			console.log("Message >", e.data);
			if (e.data.data) {
				self.trigger(e.data.event, e.data.data);
			} else {
				self.trigger(e.data.event);
			}
		}
	};

	window.addEventListener('message', messageHandler);

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

	// Soundcloud Player
	var SoundcloudInit = function () {
		SoundCloud.initialize({
			client_id: "5441b373256bae7895d803c7c23e59d9"
		});

		self.widget.bind(SoundCloud.Widget.Events.READY, function () {
			self.widget.bind(SoundCloud.Widget.Events.FINISH, function () {
				self.trigger("souncdloud-onFinish");
			});
			self.widget.bind(SoundCloud.Widget.Events.PAUSE, function () {
				self.trigger("souncdloud-onPause");
			});
			self.widget.bind(SoundCloud.Widget.Events.PLAY, function () {
				self.trigger("souncdloud-onPlay");
			});
			self.widget.bind(SoundCloud.Widget.Events.ERROR, function () {
				self.trigger("soundcloud-message", "SC > Error");
			});
			self.widget.bind(SoundCloud.Widget.Events.PLAY_PROGRESS, function (data) {
				self.trigger("souncdloud-onPlayProgress", data);
			});
			self.widget.bind(SoundCloud.Widget.Events.LOAD_PROGRESS, function () {
				self.trigger("soundcloud-message", "SC > Loading");
			});
		});
	};

	self.on("soundcloud-load", function (uri) {
		self.widget.load(uri, self.widgetOptions);
		if (videoMode) {
			if (videoWindow) {
				videoWindow.close();
				self.trigger("videoClose");
				$(".video.open").addClass("disabled");
			}
		}
	});
	self.on("soundcloud-play", function (uri) {
		self.widget.play();
	});
	self.on("soundcloud-duration", function () {
		self.widget.getDuration(function (dur) {
			self.trigger("soundcloud-durationReturn", dur);
		});
	});
	self.on("soundcloud-seek", function (percentage) {
		self.widget.getDuration(function (dur) {
			self.widget.seekTo(percentage * dur);
		});
	});
	self.on("soundcloud-seekTo", function (percentage) {
		self.widget.seekTo(percentage);
	});
	self.on("soundcloud-pause", function () {
		self.widget.pause();
	});
	self.on("soundcloud-stop", function () {
		self.widget.pause();
	});

	self.init = function () {
		YoutubeInit();
		SoundcloudInit();
		console.log("PLAYERS > Ready");
	};
}

module.exports = PlayersModel;