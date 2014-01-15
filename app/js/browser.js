require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            if (ev.source === window && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],2:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};//     Reddit Music Player
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
		ga('create', 'UA-45488207-5', 'il.ly');
		ga('send', 'pageview');

	});

},{"./js/modules/content":"JTiXJJ","./js/modules/events":"gtc4uL","./js/modules/music":"NzQZ2+","./js/modules/options":"xbP5ff","./js/modules/progressbar":"t9+Ge2","./js/modules/subreddits":"62hrOi"}],"./js/modules/content":[function(require,module,exports){
module.exports=require('JTiXJJ');
},{}],"JTiXJJ":[function(require,module,exports){
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

var ProgressBarModel = require("./progressbar");


function ContentModel() {
	/// Controls the Content.

	/// Content->Events
	// :: playlist-select ("radio|music", element, song) : Playlist item is selected.
	// :: playlist-more ("radio|music") : More requested.

	/// Listeners->Content
	// :: build ("radio|music", playlist[], song) : Builds Playlists.
	// :: music-progress ("radio|music") : Update the bottom progressbar.

	var self = this;

	var musicProgress = new ProgressBarModel(".music-progress");

	// Subreddits

	self.addToExtras = function (subreddit) {
		var element = $("<a class='item' data-value='" + subreddit.toLowerCase() + "'>" + subreddit + "</a>");
		element.appendTo($(".subreddit-menu .extra .extra.menu"));
		return element;
	};

	var buildSong = function (item) {
		// <div class="ui item" href="{file}">
		// 	<div class="name">{title}</div>
		// 	<span class="ups">{ups}</span>/<span class="downs">{downs}</span> &#8226; 
		// 	<span class="author">{author}</span> &#8226; 
		// 	<span class="created">{created} ago</span> &#8226; 
		// 	<span class="subreddit">{subreddit}</span> &#8226; 
		// 	<span class="origin">{origin}</span> &#8226; 
		// 	<a href="{reddit}" target="_blank" title="{title}">
		// 		<u>permalink</u>
		// 	</a>
		// </div>
		var root = $("<div class='ui item'></div>").attr("href", item.file);
		$("<div/>").addClass("name").html(item.title).appendTo(root);
		$("<span/>").addClass("ups").text(item.ups).appendTo(root);
		$("<span/>").text("/").appendTo(root);
		$("<span/>").addClass("downs").text(item.downs).appendTo(root);
		$("<span/>").html(" &#8226; ").appendTo(root);
		$("<span/>").addClass("author").text(item.author).appendTo(root);
		$("<span/>").html(" &#8226; ").appendTo(root);
		$("<span/>").addClass("created").text(item.created).appendTo(root);
		$("<span/>").html(" &#8226; ").appendTo(root);
		$("<span/>").addClass("subreddit").text(item.subreddit).appendTo(root);
		$("<span/>").html(" &#8226; ").appendTo(root);
		$("<span/>").addClass("origin").text(item.origin).appendTo(root);
		$("<span/>").html(" &#8226; ").appendTo(root);
		$("<span/>").addClass("comments").text(item.comments + " comments").appendTo(root);
		$("<span/>").html(" &#8226; ").appendTo(root);
		$("<a/>").attr("href", item.reddit).attr("target", "_blank").attr("title", item.title).html($("<u>permalink</u>")).appendTo(root);
		return root;
	};

	// MUSIC
	var buildMusicView = function (songs, currentSong) {
		var root = $(".music.content .playlist");
		var template = $(".templates [type='html/musicplaylist']").html();

		var add = function (item) {
			var newEl = buildSong(item);
			if (item.markdown) {
				/*global markdown:true */
				newEl.find(".name").html(markdown.toHTML(newEl.find(".name").html()));
				newEl.find(".name a").attr("href", "#");
			}
			var el = newEl.appendTo(root);
			if (currentSong) {// New Playlist Received > Send Songs & Current Song > Rebuild View
				if (item.title === currentSong.title) {
					el.addClass("active");
				}
			}
			//el.transition("fade down in");
			el.click(function () {
				self.trigger("playlist-select", el, item);
			});
		};

		var more = function () {
			var newEl = $("<div class='item more'></div>");
			newEl.append($("<div class='name'>Load More</div>"));
			var el = newEl.appendTo(root);
			//el.transition("fade down in"); 
			el.click(function () {
				self.trigger("playlist-more");
			});
		};

		
		// Remove all old songs...
		$(".music.content .playlist .item").remove();

		// For all the new songs...
		for (var i = 0; i < songs.length; i++) {
			add(songs[i]);
		}
		more();
		self.trigger("build-ready");
	};

	var musicSongSelect = function (song) {
		var items = $(".music.content .playlist .item");
		items.siblings(".active").removeClass("active");
		items.siblings('[href="' + song.file + '"]').addClass("active");
	};

	$.observable(self);

	self.on("build", function (view, content, currentSong) {
		if (view === "music playlist") {
			buildMusicView(content, currentSong);
		}
	});

	var intervalProgressBar;
	function updateProgressBar(updateFunction) {
		if (!intervalProgressBar) {
			musicProgress.start();
			intervalProgressBar = window.setInterval(updateFunction, 500);
		}
	}

	self.on("new-song", function (currentSong) {
		musicSongSelect(currentSong);
	});

	self.on("music-progress", function (currentSong, soundcloudData) {
		intervalProgressBar = window.clearInterval(intervalProgressBar);
		if (currentSong.origin === "soundcloud.com") {
			try {
				musicProgress.set(soundcloudData.relativePosition * 100);
			} catch (err) {
				console.error(currentSong);
			}
		} else {
			self.trigger("youtube-progressbar");
			updateProgressBar(function () {
				self.trigger("youtube-progressbar");
			});
		}
	});

	self.on("youtube-progressbarReturn", function (data) {
		if (!data) {
			self.trigger("ytnotready");
		}
		musicProgress.set(data.currentTime / data.duration * 100);
	});
}

module.exports = ContentModel;
},{"./progressbar":"t9+Ge2"}],"gtc4uL":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};//     Reddit Music Player
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
/*global KeyboardJS:true */

function UserEventsModel(Music, Options) {

	/// Controls the subreddits menu.
	var self = this;

	$.observable(self);

	// MUSIC CONTROLS
	var MusicEvents = function () {
		// Play & Pause
		$(".play-btn").click(function (e) {
			self.trigger("play-btn", e);
		});

		// Next button
		$(".next-btn").click(function (e) {
			self.trigger("song-next", e);
		});

		// Previous button
		$(".prev-btn").click(function (e) {
			self.trigger("song-previous", e);
		});
	};

	// SUBREDDITS
	var SubredditMenuEvents = function () {
		// Show Search
		$(".search-subs").click(function (e) {
			self.trigger("toggleSearchSubs", e);
		});
		// On Input
		$("#searchSubs input").keyup(function (e) {
			self.trigger("filterSubs", e);
		});
		// Clear
		$(".clear-subs").click(function (e) {
			self.trigger("clearSubs", e);
		});

		$(".edit-subs").click(function (e) {
			self.trigger("toggleActiveSubs", e);
		});

		// Select Subreddit
		$(".musicmenu .selection.menu .item").click(function (e) {
			var element = $(this);
			var active = element.hasClass("active");
			if (active) {
				Music.trigger("menu-selection-remove", element);
				element.removeClass("active");
			} else if (!active) {
				Music.trigger("menu-selection-add", element);
				element.addClass("active");
			}
		});
	};

	// SORTING
	var SortingEvents = function () {
		// Sorting Method Selected
		$(".sorting.column .sort.item").click(function (e) {
			var target = $(e.target);
			var sortingMethod = target.data("value");
			
			// Make button active
			$(".sorting.column .sort.item").removeClass("active");
			target.addClass("active");

			// Set Sorting Method
			Options.set({"sortMethod": sortingMethod});
			Music.trigger("update");
		});

		// Dropdowns
		$('.top.dropdown').dropdown({
			metadata: {
				"value": 'value'
			},
			transition: "fade",
			duration: 100,
			onChange: function (sortingMethod, text) {
				if (sortingMethod.substr(0, 3) === "top") {
					var topvalue = sortingMethod.split(":");
					Options.set({
						"sortMethod": topvalue[0],
						"topMethod": topvalue[1]
					});

					// Make button active
					$(".sorting.column .sort.item").removeClass("active");
					$(".sorting.column .sort.item.top").addClass("active");
				} else {
					Options.set({"sortMethod": sortingMethod});
				}
				Music.trigger("update");
			}
		});
	};

	// Keyboard
	var KeyboardEvents = function () {
		var Keyboard = window.KeyboardJS || global.KeyboardJS;
		// Music Controls
		Keyboard.on("space", function (e) {
			Music.trigger("play-btn", e);
		});
		Keyboard.on("right,down", function () {
			Music.trigger("song-next");
		});
		Keyboard.on("left,up", function () {
			Music.trigger("song-previous");
		});

		// Clear subreddits
		Keyboard.on("ctrl+x", function (e) {
			self.trigger("clearSubs", e);
		});

		Keyboard.on("ctrl+e", function (e) {
			self.trigger("toggleActiveSubs", e);
		});

		// Search
		Keyboard.on("ctrl+f", function (e) {
			self.trigger("toggleSearchSubs", e);
		});

		// Espace
		Keyboard.on("escape", function () {
			if ($("#searchSubs").hasClass("visible")) {
				self.trigger("toggleSearchSubs");
			}
		});
	};

	self.init = function () {
		MusicEvents();
		SubredditMenuEvents();
		SortingEvents();
		KeyboardEvents();
		console.log("EVENTS > Ready");
	};
}

module.exports = UserEventsModel;
},{}],"./js/modules/events":[function(require,module,exports){
module.exports=require('gtc4uL');
},{}],"./js/modules/music":[function(require,module,exports){
module.exports=require('NzQZ2+');
},{}],"NzQZ2+":[function(require,module,exports){
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


},{"./players":"5QOjA2","./reddit":15}],"xbP5ff":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};//     Reddit Music Player
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

var ERRORS = {
	CALLBACKUNDEFINED: function (object) {
		this.message = "Callback not defined";
		this.name = "CallbackUndefined";
		this.object = object;
	},
	KEYUNDEFINED: function (object) {
		this.message = "Key not defined";
		this.name = "KeyUndefined";
		this.object = object;
	},
	NOTANOBJECT: function (object) {
		this.message = "Items is not an Object";
		this.name = "NotAnObject";
		this.object = object;
	}
};

// Polyfill
if (!Object.keys) {
	Object.keys = function (o) {
		if (o !== Object(o)) {
			throw new TypeError('Object.keys called on a non-object');
		}
		var k = [], p;
		for (p in o) {
			if (Object.prototype.hasOwnProperty.call(o, p)) {
				k.push(p);
			}
		}
		return k;
	};
}

function chromeStorage() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	self.getItem = function (key, callback) {
		console.log(key);
		chrome.storage.sync.get(key, callback);
	};
	self.setItem = function (items, callback) {
		return chrome.storage.sync.set(items, callback);
	};
	self.clear = function (key, callback) {
		chrome.storage.sync.remove(key, callback);
	};
}

function simpleStorage() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	self.storage = {};

	var getArray = function (arr) {
		var keys = {};
		for (var i = arr.length - 1; i >= 0; i--) {
			keys[arr[i]] = JSON.parse(self.storage[arr[i]]);
		}
		return keys;
	};

	self.getItem = function (key, callback) {
		if ("undefined" === typeof(callback)) {
			throw new ERRORS.CALLBACKUNDEFINED({key: key, callback: callback});
		}
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so get all the keys in the array
			// Returns an object
			callback(getArray(key));
		} else {
			// Not an array, just a string
			callback(getArray([key]));
		}
	};
	self.setItem = function (items, callback) {
		if (typeof({}) === typeof(items)) {
			// Set each item
			for (var i = Object.keys(items).length - 1; i >= 0; i--) {
				var key = Object.keys(items)[i];
				var value = items[key];
				self.storage[key] = JSON.stringify(value);
			}
			if ("undefined" !== typeof(callback)) {
				callback();
			}
		} else {
			throw new ERRORS.NOTANOBJECT({items: items});
		}
	};
	self.clear = function (key, callback) {
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so clear all the keys in the array
			// Returns an object
			for (var i = key.length - 1; i >= 0; i--) {
				delete self.storage[key[i]];
			}
		} else {
			// Not an array, just a string
			delete self.storage[key];
		}
		if ("undefined" !== typeof(callback)) {
			callback();
		}
	};
}

function localStorageHelper() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	self.local = localStorage || global.window.localStorage;

	var getArray = function (arr) {
		var keys = {};
		for (var i = arr.length - 1; i >= 0; i--) {
			keys[arr[i]] = JSON.parse(self.local.getItem(arr[i]));
		}
		return keys;
	};

	self.getItem = function (key, callback) {
		if ("undefined" === typeof(callback)) {
			throw new ERRORS.CALLBACKUNDEFINED({key: key, callback: callback});
		}
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so get all the keys in the array
			// Returns an object
			callback(getArray(key));
		} else {
			// Not an array, just a string
			callback(getArray([key]));
		}
	};
	self.setItem = function (items, callback) {
		if (typeof({}) === typeof(items)) {
			// Set each item
			for (var i = Object.keys(items).length - 1; i >= 0; i--) {
				var key = Object.keys(items)[i];
				var value = items[key];
				self.local.setItem(key, JSON.stringify(value));
			}
			if ("undefined" !== typeof(callback)) {
				callback();
			}
		} else {
			throw new ERRORS.NOTANOBJECT({items: items});
		}
	};
	self.clear = function (key, callback) {
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so clear all the keys in the array
			// Returns an object
			for (var i = key.length - 1; i >= 0; i--) {
				self.local.clear(key[i]);
			}
		} else {
			// Not an array, just a string
			self.local.clear(key);
		}
		if ("undefined" !== typeof(callback)) {
			callback();
		}
	};
}


function OptionsModel() {
	var self = this;

	/*global chrome:true */

	var isChrome = false;
	if ("undefined" !== typeof(chrome)) {
		if ("undefined" !== typeof(chrome.storage)) {
			isChrome = true;
			console.log("OPTIONS > Using Chrome");
			self.local = new chromeStorage();
		}
	}
	if (!isChrome) {
		if ("undefined" !== typeof(window.localStorage) || "undefined" !== typeof(global.window.localStorage)) {
			console.log("OPTIONS > Using localStorage");
			self.local = new localStorageHelper();
		} else {
			console.log("OPTIONS > Using Fallback");
			self.local = new simpleStorage();
		}
	}

	self.get = function (items, callback) {
		console.log("OPTIONS > Get", items);
		try {
			self.local.getItem(items, callback);
		} catch (e) {
			console.error(e.name, e.message, e.object);
		}
	};

	self.set = function (items, callback) {
		console.log("OPTIONS > Set", items);
		try {
			self.local.setItem(items, callback);
		} catch (e) {
			console.error(e.name, e.message, e.object);
		}
	};

	self.clear = function (items, callback) {
		try {
			self.local.clear(items, callback);
		} catch (e) {
			console.error(e.name, e.message, e.object);
		}
	};

	// Set defaults
	var defaults = {
		sortMethod: "hot",
		topMethod: "week",
		subreddits: []
	};

	self.get(["sortMethod", "topMethod", "subreddits"], function (items) {
		if (items.topMethod === null || "undefined" === typeof(items.topMethod)) {
			self.set({topMethod: defaults.topMethod});
		}
		if (items.sortMethod === null || "undefined" === typeof(items.sortMethod)) {
			self.set({sortMethod: defaults.sortMethod});
		}
		if (items.subreddits === null || "undefined" === typeof(items.subreddits)) {
			self.set({subreddits: []});
		}
	});

	$.observable(self);
}

module.exports = OptionsModel;
},{}],"./js/modules/options":[function(require,module,exports){
module.exports=require('xbP5ff');
},{}],"./js/modules/players":[function(require,module,exports){
module.exports=require('5QOjA2');
},{}],"5QOjA2":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};//     Reddit Music Player
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
		if ("undefined" !== typeof(id)) {
			$("#youtube").tubeplayer("play", id);
		} else {
			$("#youtube").tubeplayer("play");
		}
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
},{}],"./js/modules/progressbar":[function(require,module,exports){
module.exports=require('t9+Ge2');
},{}],"t9+Ge2":[function(require,module,exports){
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

function ProgressBar(link) {
	var self = this;
	var current = 10;
	var interval = null;

	self.element = $(link);
	self.bar = $(link + " .bar");

	var shift = function () {
		current += 5;
		self.bar.css({"width": current  + "%"});
	};
	var reset = function () {
		current = 0;
		self.bar.css({"width": current  + "%"});
		if (interval) {
			window.clearInterval(interval);
		}
	};
	var autoShift = function () {
		interval = window.setInterval(function () {
			if (current >= 100) {
				reset();
			} else {
				shift();
			}
		}, 1000);
	};
	var disable = function () {
		self.element.removeClass("activated");
		if (interval) {
			interval = window.clearInterval(interval);
			interval = window.clearInterval(interval);
		}
	};

	self.start = function () {
		self.element.addClass("activated");
		reset();
	};
	self.end = function () {
		current = 100;
		self.bar.css({"width": "100%"});
		window.setTimeout(disable, 200);
	};

	self.set = function (percent) {
		current = percent;
		self.bar.css({"width": percent + "%"});
	};

	self.seek = function (percent) {
		current = percent;
		self.bar.stop(true, true);
		self.bar.css({"width": percent + "%"});
	};

	// Enable MVP pattern (this is the secret for everything)
	$.observable(self);

	self.on("start", function () {
		self.start();
		autoShift();
	});
	self.on("end", function () {
		self.end();
	});
}


module.exports = ProgressBar;
},{}],15:[function(require,module,exports){
var process=require("__browserify_process");//     Reddit Music Player
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

var Bandcamp = {base: "http://api.bandcamp.com/api/", key: "snaefellsjokull"};
var SoundCloud = {base: "http://api.soundcloud.com/", key: "5441b373256bae7895d803c7c23e59d9"};

var OptionsModel = require("./options");

function RedditModel() {
	var self = this;

	var Options = new OptionsModel();
	self.subreddits = [];
	if ("undefined" !== typeof(defaults)) {
		/*global defaults:true */
		self.subreddits = defaults.split(",");
	} else {
		Options.get("subreddits", function (items) {
			self.subreddits = items.subreddits;
		});
	}
	var last = "";

	$.observable(self);

	var timeSince = function (date) {

		var seconds = Math.floor((new Date() - date) / 1000);

		var interval = Math.floor(seconds / 31536000);

		if (interval > 1) {
			return interval + " years";
		}
		interval = Math.floor(seconds / 2592000);
		if (interval > 1) {
			return interval + " months";
		}
		interval = Math.floor(seconds / 86400);
		if (interval > 1) {
			return interval + " days";
		}
		interval = Math.floor(seconds / 3600);
		if (interval > 1) {
			return interval + " hours";
		}
		interval = Math.floor(seconds / 60);
		if (interval > 1) {
			return interval + " minutes";
		}
		return Math.floor(seconds) + " seconds";
	};

	var fetchComments = function (commentUrl) {
		var playlist = [];
		$.getJSON("http://www.reddit.com/" + commentUrl + "/.json?depth=0&limit=100&sort=" + self.sortMethod + "&jsonp=?", function (r) {
			r = r[1];
			$.each(r.data.children, function (i, child) {
				var post = child.data;
				var media = post.body;

				var time = new Date();
				time.setTime(parseInt(post.created_utc) * 1000);
				post.created = timeSince(time);
				var data = {"author": post.author, "subreddit": post.subreddit, "ups": post.ups, "downs": post.downs, "created": post.created, "name": post.name, "reddit": "http://reddit.com" + commentUrl };

				var youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*\)/;
				var match = media.match(youtubeRegex);
				if (match && match[2].length === 11) {
					data.origin = "youtube.com";
					var youtubeUrl = match[2];
					playlist.push($.extend({markdown: true, title: media, file: "http://www.youtube.com/watch?v=" + youtubeUrl}, data));
					self.trigger("playlist-update", playlist);
				}
			});
		});
	};

	var fetchMusic = function (options) {
		var playlist = [];
		var topParams = options.sortMethod === "top" ? "sort=top&t=" + options.topMethod + "&" : "";
		var more = last.length > 0 ? true : false;
		var page = more ? "after=" + last + "&" : "";
		$.getJSON("http://www.reddit.com/r/" + options.subreddits + "/" + options.sortMethod + "/.json?" + topParams + page + "jsonp=?", function (r) {
			console.log("REDDIT > Total:", r.data.children.length);
			$.each(r.data.children, function (i, child) {
				var post = child.data;
				var media = post.media;
				if (media) {
					var time = new Date();
					time.setTime(parseInt(post.created_utc) * 1000);
					post.created = timeSince(time);
					var data = {"comments": post.num_comments, "author": post.author, "subreddit": post.subreddit, "ups": post.ups, "downs": post.downs, "created": post.created, "name": post.name, "reddit": "http://reddit.com" + post.permalink, "score": post.score, "origin": media.type };
					
					switch (media.type) {
						case "bandcamp.com":
							console.log("bandcamp");
							$.getJSON(Bandcamp.base + "url/1/info?callback=?", {key: Bandcamp.key, url: post.url}, function (r) {
								if (r.album_id) {
									$.getJSON(Bandcamp.base + "album/2/info?callback=?", {key: Bandcamp.key, album_id: r.album_id}, function (r) {
										$.each(r.tracks, function (i, track) {
											if (more) {
												self.trigger("playlist-add", $.extend({title: track.title, file: track.streaming_url}, data));
											} else {
												playlist.push($.extend({title: track.title, file: track.streaming_url}, data));
												self.trigger("playlist-update", playlist);
											}
										});
									});
								} else if (r.track_id) {
									$.getJSON(Bandcamp.base + "track/1/info?callback=?", {key: Bandcamp.key, track_id: r.track_id}, function (track) {
										if (more) {
											self.trigger("playlist-add", $.extend({title: track.title, file: track.streaming_url}, data));
										} else {
											playlist.push($.extend({title: track.title, file: track.streaming_url}, data));
											self.trigger("playlist-update", playlist);
										}
									});
								}
							});
							break;

						case "youtube.com":
						case "youtu.be":
							data.origin = "youtube.com";
							var track = media.oembed;
							if (more) {
								self.trigger("playlist-add", $.extend({title: track.title, file: track.url}, data));
							} else {
								playlist.push($.extend({title: track.title, file: track.url}, data));
								self.trigger("playlist-update", playlist);
							}
							break;

						case "soundcloud.com":
							if (!process.platform) {
								var track_id = decodeURIComponent(decodeURIComponent(media.oembed.html)).match(/\/tracks\/(\d+)/);
								if (track_id) {
									$.getJSON(SoundCloud.base + "tracks/" + track_id[1] + ".json", {client_id: SoundCloud.key}, function (track) {
										if (track.streamable) {
											if (more) {
												self.trigger("playlist-add", $.extend({track: track, title: track.title, file: track.stream_url}, data));
											} else {
												playlist.push($.extend({track: track, title: track.title, file: track.stream_url}, data));
												self.trigger("playlist-update", playlist);
											}
										}
									});
								}
							}
							break;
						default:
							console.log("REDDIT > Ignored: ", media);
					}
				}
			});
			console.log("REDDIT > Songs:", playlist.length);
		});
	};

	/*global pushState:true */
	var shouldPush = false;
	if ("undefined" === typeof(pushState)) {
		shouldPush = true;
	} else {
		if (pushState === true) {
			shouldPush = true;
		} else {
			shouldPush = false;
		}
	}
	var state = function (url) {
		if (shouldPush === true) {
			if ("undefined" !== typeof(pushState)) {
				var stateObj = { subreddits: self.subreddits };
				history.replaceState(stateObj, "Reddit Music Player", url);
			}
		}
	};

	self.addSubReddit = function (value) {
		shouldPush = true;
		self.subreddits.push(value);
		Options.set({"subreddits": self.subreddits});
	};

	self.removeSubReddit = function (value) {
		shouldPush = true;
		var index = self.subreddits.indexOf(value);
		self.subreddits.splice(index, 1);
		Options.set({"subreddits": self.subreddits});
	};

	self.getSubRedditList = function () {
		state("/r/" + self.subreddits.join("+"));
		return self.subreddits.join("+");
	};

	self.on("update", function () {
		if (self.subreddits.length >= 1) {
			last = "";
			Options.get(["sortMethod", "topMethod"], function (items) {
				items.subreddits = self.getSubRedditList(self.subreddits);
				fetchMusic(items);
			});
		} else {
			state("/");
		}
	});

	self.on("comments", function (commentUrl) {
		fetchComments(commentUrl);
	});

	self.on("more", function (lastId) {
		last = lastId;
		Options.get(["sortMethod", "topMethod"], function (items) {
			items.subreddits = self.getSubRedditList(self.subreddits);
			fetchMusic(items);
		});
	});
}


module.exports = RedditModel;
},{"./options":"xbP5ff","__browserify_process":1}],"./js/modules/subreddits":[function(require,module,exports){
module.exports=require('62hrOi');
},{}],"62hrOi":[function(require,module,exports){
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

function SubredditsModel(Music) {
	/// Controls the subreddits menu.
	var self = this;

	$.observable(self);

	var hideItem = function (n, item) {
		$(item).hide();
	};
	var showItem = function (n, item) {
		$(item).show();
	};
	var showActiveSubs = function () {
		var lists = $(".subreddit-menu > .item");
		for (var i = lists.length - 1; i >= 0; i--) {
			var list = $(lists[i]);
			list.find(".item:not(.active)").each(hideItem);
			list.find(".item.active").each(showItem);
		}
	};

	var showAllSubs = function () {
		var lists = $(".subreddit-menu > .item");
		for (var i = lists.length - 1; i >= 0; i--) {
			var list = $(lists[i]);
			list.find(".item").show();
		}
	};

	// Search Subreddits
	var toggleSearchSubs = function (e) {
		if (e) {
			e.preventDefault();
		}
		$("#searchSubs").toggleClass("visible");
		$("#searchSubs").toggleClass("hidden");
		if ($("#searchSubs").hasClass("visible")) {
			$(".edit-subs").removeClass("active");
			$("#searchSubs input").focus();
			$("#searchSubs input").select();
			$(".search-subs").addClass("active");
		} else {
			$("#searchSubs input").blur();
			$("#searchSubs input").val("");
			$(".search-subs").removeClass("active");
			filterSubs();
		}
		if ($(".edit-subs").hasClass("active")) {
			$(".clear-subs").removeClass("hidden");
		} else {
			$(".clear-subs").addClass("hidden");
		}
	};

	var toggleActiveSubs = function (e) {
		if (e) {
			e.preventDefault();
		}
		$(".edit-subs").toggleClass("active");
		if ($("#searchSubs").hasClass("visible")) {
			toggleSearchSubs();
		}
		if ($(".edit-subs").hasClass("active")) {
			showActiveSubs();
			$(".clear-subs").removeClass("hidden");
		} else {
			showAllSubs();
			$(".clear-subs").addClass("hidden");
		}
	};

	var clearSubs = function () {
		$(".edit-subs").removeClass("active");
		showAllSubs();
		if ($("#searchSubs").hasClass("visible")) {
			toggleSearchSubs();
		}
		$(".musicmenu .selection.menu .item.active").each(function (e, item) {
			var element = $(item);
			var active = element.hasClass("active");
			if (active) {
				Music.trigger("menu-selection-clear", element);
				element.removeClass("active");
			}
		});
		Music.trigger("update");
	};

	var markEach = function (x, item) {
		var value = $("#searchSubs input").val();
		item = $(item);
		if (!item.text().fuzzy(value)) {
			item.hide();
		} else {
			var string = item.text().split("");
			var marks = item.text().fuzzyMark(value);
			for (var n = 0; n < string.length; n++) {
				for (var m = 0; m < marks.length; m++) {
					var mark = marks[m];
					if (n === mark) {
						string[n] = "<b>" + string[n] + "</b>";
					}
				}
			}
			item.html(string.join(""));
			item.show();
		}
	};
	var filterSubs = function () {
		var lists = $(".subreddit-menu > .item");
		for (var i = lists.length - 1; i >= 0; i--) {
			var list = $(lists[i]);
			list.find(".item").each(markEach);
			list.show();
			if (list.find(".item:visible").length === 0) {
				list.hide();
			} else {
				list.show();
			}
		}
	};

	// Events
	self.on("toggleSearchSubs", toggleSearchSubs);
	self.on("filterSubs", filterSubs);
	self.on("clearSubs", clearSubs);
	self.on("toggleActiveSubs", toggleActiveSubs);
}

module.exports = SubredditsModel;
},{}]},{},[2])
;