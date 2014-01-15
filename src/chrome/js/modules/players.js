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