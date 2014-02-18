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
			allowFullScreen: "true", // true by default, allow user to go full screen
			autoplay: true,
			showControls: true,
			modestbranding: true,
			annotations: false,
			theme: "dark",
			preferredQuality: "hd720",// preferred quality: default, small, medium, large, hd720
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
		console.log("play", id);
		$("#youtube").tubeplayer("play", id);
	});
	self.on("youtube-load", function (data) {
		console.log("load", data.id, data.time);
		$("#youtube").tubeplayer("play", {id: data.id, time: data.time});
	});
	self.on("youtube-seek", function (percentage) {
		var data = $("#youtube").tubeplayer("data");
		$("#youtube").tubeplayer("seek", percentage * data.duration);
	});
	self.on("youtube-pause", function () {
		$("#youtube").tubeplayer("pause");
	});
	self.on("youtube-stop", function () {
		$("#youtube").tubeplayer("stop");
	});

	self.on("youtube-progressbar", function () {
		self.trigger("youtube-progressbarReturn", $("#youtube").tubeplayer("data"));
	});

	self.init = function () {
		YoutubeInit();
		console.log("PLAYERS > Ready");
	};
}

$(function () {
	// Init
		var Players = new PlayersModel();
		var parent = null;

		var messageHandler = function (e) {
			if (e.data.type === "players") {
				if (parent === null) {
					parent = e.source;
					messagePipe("yt-ready");
				}
				//console.log("PIPING > RECEIVED > ", e.data.event);
				if (e.data.data) {
					Players.trigger(e.data.event, e.data.data);
				} else {
					Players.trigger(e.data.event);
				}
			}
		};

		var messagePipe = function (event, data) {
			//console.log("PIPING > SEND > ", event);
			if (data) {
				parent.postMessage({
					"type": "players",
					"event": event,
					"data": data
				}, "*");
			} else {
				parent.postMessage({
					"type": "players",
					"event": event
				}, "*");
			}
		};

		var PlayersPipe = function (event) {
			Players.on(event, function (data) {
				messagePipe(event, data);
			});
		};

		PlayersPipe("youtube-onPlayerEnded");
		PlayersPipe("youtube-onPlayerPaused");
		PlayersPipe("youtube-onPlayerUnstarted");
		PlayersPipe("youtube-onPlayerPlaying");
		PlayersPipe("youtube-onPlayerBuffering");
		PlayersPipe("youtube-message");
		PlayersPipe("youtube-progressbarReturn");

		window.addEventListener('message', messageHandler);

		Players.init();
	});