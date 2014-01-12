"use strict";

try {
	if (global) {
		global.$ = $;
	}
} catch (err) {}

// Model Dependencies
// Music
var PlayersModel = require("./js/modules/players");
var MusicModel = require("./js/modules/music");

// UI
var ContentModel = require("./js/modules/content");
var SubredditsModel = require("./js/modules/subreddits");
var ProgressBarModel = require("./js/modules/progressbar");

// Options
var OptionsModel = require("./js/modules/options");

// Events
var EventsModel = require("./js/modules/events");

// Presenter
$(function () {

	// Initialize
		var loadProgress = new ProgressBarModel(".load-progress");
		var musicProgress = new ProgressBarModel(".music-progress");
		var Music = new MusicModel(musicProgress);
		var Content = new ContentModel();
		var Options = new OptionsModel();
		var Subreddits = new SubredditsModel(Music);
		var Players = new PlayersModel(Music, loadProgress, musicProgress);
		var Events = new EventsModel(Music, Options);

	// Helpers

		String.prototype.fuzzy = function (s) {
			var hay = this.toLowerCase(), i = 0, n = 0, l;
			s = s.toLowerCase();
			for (; l = s[i++] ;) {
				if ((n = hay.indexOf(l, n)) === -1) {
					return false;
				}
			}
			return true;
		};

		String.prototype.fuzzyMark = function (s) {
			var hay = this.toLowerCase(), i = 0, n = 0, l;
			s = s.toLowerCase();
			for (; l = s[i++] ;) {
				if ((n = hay.indexOf(l, n)) === -1) {
					return false;
				}
			}
			var matches = [];
			i = 0, n = 0;
			for (; l = s[i++] ;) {
				matches.push((n = hay.indexOf(l, n)));
			}
			return matches;
		};

		
	// User Events
		// Events defined in Events module
		function pipeEvent(To, event) {
			Events.on(event, function (Arg1) {
				console.log(To, event, Arg1);
				To.trigger(event, Arg1);
			});
		}
		function pipeAction(Action) {
			Action();
		}
		Events.on("action", function (call) {
			pipeAction(call);
		});

		pipeEvent(Music, "play-btn");
		pipeEvent(Music, "song-next");
		pipeEvent(Music, "song-previous");

		pipeEvent(Subreddits, "toggleSearchSubs");
		pipeEvent(Subreddits, "filterSubs");
		pipeEvent(Subreddits, "clearSubs");
		pipeEvent(Subreddits, "toggleActiveSubs");

		// Progressbar
		musicProgress.element.click(function (e) {
			Music.trigger("musicProgress", e);
		});
		
		
	// Model Events
		// PLAYER
		// New song :: Set Title & Progressbar
		Music.on("song-playing", function (song) {
			console.log("Now Playing: " + song.title);
			$(".bottom.menu .title").html(song.title);
			document.title = song.title + " | " + "Reddit Music Player";
			Content.trigger("new-song", song);
		});

		// Music started playing
		Music.on("playing", function (isPlaying) {
			if (isPlaying) {
				Content.trigger("music-progress", Music.currentSong);
				window.setTimeout(function () {
					if (!Music.isPlaying) {
						Music.play();
					}
				}, 5000);
			} else {
				console.log(isPlaying, Music.isPlaying);
			}
		});

		// New Playlist on the Music / New Subreddits
		Music.on("playlist", function (songs) {
			Content.trigger("build", "music playlist", songs, Music.currentSong);
		});

		

		// CONTENT
		Content.on("playlist-select", function (element, song) {
			if (!element.hasClass("active")) {
				loadProgress.trigger("start");
				Music.trigger("playlist-select", element, song);
			}
		});

		Content.on("playlist-more", function () {
			Music.trigger("playlist-more");
		});

		Content.one("ytnotready", function () {
			Music.trigger("play-btn");
		});

			
		// Init Settings
		Players.init();
		Events.init();

		var subs = Options.get("subreddits");
		if ("undefined" !== typeof(defaults)) {
			/*global defaults:true */
			subs = defaults.split(",");
		}
		/*global comment_server:true */
		if ("undefined" === typeof(comment_server)) {
			for (var i = 0; i < subs.length; i++) {
				var thisSub = $(".subreddit-menu .item[data-value='" + subs[i].toLowerCase() + "']");
				if (thisSub.length === 0) {
					// If it doesn't exist in the default listing, add it to extras.
					thisSub = Content.addToExtras(subs[i]);
					console.log(thisSub);
					$(".subreddit-menu .extra.hidden").removeClass("hidden");
				}
				thisSub.addClass("active");
			}
		} else {
			Music.Reddit.trigger("comments", comment_server);
			Music.Reddit.one("playlist-update", function () {
				Content.one("build-ready", function () {
					$(".musicplaylist .item.more").remove();
				});
			});
		}

		if (Options.get("sortMethod") === "top") {
			$(".sorting.column .item[data-value='" + Options.get("sortMethod") + ":" + Options.get("topMethod") + "']").click();
		} else {
			$(".sorting.column .item[data-value='" + Options.get("sortMethod") + "']").click();
		}

		if ("undefined" !== typeof(autoplay)) {
			if (subs.length > 0) {
				Content.one("build-ready", function () {
					$(".music.playlist .item").click();
				});
			}
		}

	});
