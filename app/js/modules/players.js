"use strict";
/*global SC:true */

function PlayersModel(Music, loadProgress, musicProgress) {
	var self = this;

	$.observable(self);

	// Youtube

	var Youtube = function () {
		var timeOut;
		var ytPlayer = $("#youtube").tubeplayer({
			allowFullScreen: "false", // true by default, allow user to go full screen
			autoplay: true,
			initialVideo: "Wkx_xvl7zRA", // the video that is loaded into the player
			preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
			onPlayerEnded: function () {
				console.log("YT > Ended");
				Music.togglePlayBtn("play");
				Music.isPlaying = false;
				Music.trigger("song-next");
				musicProgress.end();
			},
			onPlayerUnstarted: function () {
				console.log("YT > Unstarted");
				Music.isPlaying = false;
				timeOut = window.setTimeout(function () {
					if (Music.isPlaying === false) {
						Music.trigger("song-next");
					}
				}, 5000);
			},
			onPlayerPlaying: function () {
				console.log("YT > Playing");
				Music.togglePlayBtn("stop");
				Music.isPlaying = true;
				loadProgress.trigger("end");
				musicProgress.start();
				self.trigger("music-progress", Music.currentSong);
				timeOut = window.clearTimeout(timeOut);
			},
			onPlayerBuffering: function () {
				console.log("YT > Buffering");
				loadProgress.trigger("start");
			},
			onPlayerCued: function () {
				console.log("YT > onPlayerCued");
			},
			onErrorNotFound: function () {
				console.error("YT > onErrorNotFound");
			},
			onErrorNotEmbeddable: function () {
				console.error("YT > onErrorNotEmbeddable");
			},
			onErrorInvalidParameter: function () {
				console.error("YT > onErrorInvalidParameter");
			},
		});
	};

	// Soundcloud Player
	var Soundcloud = function () {
		SC.initialize({
			client_id: "5441b373256bae7895d803c7c23e59d9"
		});

		Music.widget.bind(SC.Widget.Events.READY, function () {
			Music.widget.bind(SC.Widget.Events.FINISH, function () {
				console.log("SC > Ended");
				Music.togglePlayBtn("play");
				Music.isPlaying = false;
				Music.trigger("song-next");
				musicProgress.end();
			});
			Music.widget.bind(SC.Widget.Events.PLAY, function () {
				console.log("SC > Playing");
				Music.trigger("soundcloud-ready");
				Music.togglePlayBtn("stop");
				loadProgress.trigger("end");
				Music.isPlaying = true;
				musicProgress.start();
			});
			Music.widget.bind(SC.Widget.Events.ERROR, function () {
				console.log("SC > Error");
			});
			Music.widget.bind(SC.Widget.Events.PLAY_PROGRESS, function (data) {
				self.trigger("music-progress", Music.currentSong, data);
			});
			Music.widget.bind(SC.Widget.Events.LOAD_PROGRESS, function () {
				console.log("SC > Loading");
			});
		});
	};

	self.init = function () {
		Youtube();
		Soundcloud();
		console.log("PLAYERS > Ready");
	};
}

module.exports = PlayersModel;