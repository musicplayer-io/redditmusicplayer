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

	var sandbox = document.getElementById("sandbox").contentWindow;

	$.observable(self);

	// Youtube
	self.on("youtube-play", function (id) {
		sandbox.postMessage({
			"type": "players",
			"event": "youtube-play",
			"data": id
		}, "*");
	});
	self.on("youtube-seek", function (percentage) {
		sandbox.postMessage({
			"type": "players",
			"event": "youtube-seek",
			"data": percentage
		}, "*");
	});
	self.on("youtube-stop", function () {
		sandbox.postMessage({
			"type": "players",
			"event": "youtube-stop"
		}, "*");
	});

	self.on("youtube-progressbar", function () {
		sandbox.postMessage({
			"type": "players",
			"event": "youtube-progressbar"
		}, "*");
	});

	self.on("soundcloud-load", function (uri) {
		sandbox.postMessage({
			"type": "players",
			"event": "soundcloud-load",
			"message": uri
		}, "*");
	});
	self.on("soundcloud-play", function (uri) {
		sandbox.postMessage({
			"type": "players",
			"event": "soundcloud-play"
		}, "*");
	});
	self.on("soundcloud-duration", function () {
		sandbox.postMessage({
			"type": "players",
			"event": "soundcloud-duration"
		}, "*");
	});
	self.on("soundcloud-seek", function (percentage) {
		sandbox.postMessage({
			"type": "players",
			"event": "soundcloud-seek",
			"data": percentage
		}, "*");
	});
	self.on("soundcloud-seekTo", function (percentage) {
		sandbox.postMessage({
			"type": "players",
			"event": "soundcloud-seekTo",
			"data": percentage
		}, "*");
	});
	self.on("soundcloud-stop", function () {
		sandbox.postMessage({
			"type": "players",
			"event": "soundcloud-stop"
		}, "*");
		self.widget.pause();
	});

	var messageHandler = function (e) {
		if (e.data.type === "players") {
			if (e.data.data) {
				self.trigger(e.data.event, e.data.data);
			} else {
				self.trigger(e.data.event);
			}
		}
	};

	self.init = function () {
		window.addEventListener('message', messageHandler);
		console.log("PLAYERS > Ready");
	};
}

module.exports = PlayersModel;