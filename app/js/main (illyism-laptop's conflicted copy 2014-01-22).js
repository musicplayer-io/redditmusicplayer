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

try {
	if (global) {
		global.$ = $;
	}
} catch (err) {}

// Model Dependencies
// Music
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
		var Music = new MusicModel(musicProgress, loadProgress);
		var Content = new ContentModel();
		var Options = new OptionsModel();
		var Subreddits = new SubredditsModel(Music);
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
		var clicking = false;
		

		$(document).mousemove(function (e) {
			if (clicking === false) {
				return;
			}
			var percentage = e.clientX / musicProgress.element.outerWidth() * 100;

			musicProgress.seek(percentage);
			musicProgress.element.find(".time.start").html(Math.floor(percentage) + "%");
			musicProgress.element.find(".time.end").css({
				"margin-left": percentage + "%"
			});
		});

		musicProgress.element.mousedown(function (e) {
			clicking = true;
			Content.trigger("musicProgress-clicking");
			$(document).one("mouseup", function (ev) {
				if (clicking === false) {
					return;
				}
				clicking = false;
				var percentage = ev.clientX / musicProgress.element.outerWidth() * 100;
				musicProgress.seek(percentage);
				musicProgress.element.find(".time.start").html(Math.floor(percentage) + "%");
				musicProgress.element.find(".time.end").css({
					"margin-left": percentage + "%"
				});
				Music.on("music-progress", function () {
					Content.trigger("musicProgress-released");
				});
				Music.trigger("musicProgress", ev);
			});
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
			}
		});

		// New Playlist on the Music / New Subreddits
		Music.on("playlist", function (songs) {
			Content.trigger("build", "music playlist", songs, Music.currentSong);
		});

		// Mostly soundcloud data
		Music.on("music-progress", function (song, data) {
			Content.trigger("music-progress", song, data);
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

		Content.on("youtube-progressbar", function () {
			Music.trigger("youtube-progressbar");
		});

		Music.on("youtube-progressbarReturn", function (data) {
			Content.trigger("youtube-progressbarReturn", data);
		});

			
		// Init Settings
		Events.init();

		var ActivateSubs = function (subs) {
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
		};
		/*global comment_server:true */
		if ("undefined" !== typeof(comment_server)) {
			Music.Reddit.trigger("comments", comment_server);
			Music.Reddit.one("playlist-update", function () {
				Content.one("build-ready", function () {
					$(".musicplaylist .item.more").remove();
				});
			});
		} else {
			if ("undefined" !== typeof(defaults)) {
				/*global defaults:true */
				ActivateSubs(defaults.split(","));
			} else {
				Options.get("subreddits", function (items) {
					ActivateSubs(items.subreddits);
				});
			}
		}

		Options.get(["sortMethod", "topMethod"], function (items) {
			if (items.sortMethod === "top") {
				$(".sorting.column .item[data-value='" + items.sortMethod + ":" + items.topMethod + "']").click();
			} else {
				$(".sorting.column .item[data-value='" + items.sortMethod + "']").click();
			}
		});

		if ("undefined" !== typeof(autoplay)) {
			// Autoplay when build is ready.
			Content.one("build-ready", function () {
				$(".music.playlist .item").click();
			});
		}

		/*global ga:true*/
		if ("undefined" !== typeof(ga)) {
			ga('create', 'UA-45488207-5', 'il.ly');
			ga('send', 'pageview');
		}

	});
