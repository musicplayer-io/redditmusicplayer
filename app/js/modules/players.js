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

	var YoutubeInit = function () {
		
		var ytPlayer = $("#youtube").tubeplayer({
			allowFullScreen: "false", // true by default, allow user to go full screen
			autoplay: true,
			initialVideo: "Wkx_xvl7zRA", // the video that is loaded into the player
			preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
			onPlayerEnded: function () {
				self.trigger("youtube-onPlayerEnded");
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
		$("#youtube").tubeplayer("play", id);
	});
	self.on("youtube-seek", function (percentage) {
		var data = $("#youtube").tubeplayer("data");
		$("#youtube").tubeplayer("seek", percentage * data.duration);
	});
	self.on("youtube-stop", function () {
		$("#youtube").tubeplayer("stop");
	});

	self.on("youtube-progressbar", function () {
		self.trigger("youtube-progressbarReturn", $("#youtube").tubeplayer("data"));
	});

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