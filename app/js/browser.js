require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

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
		if ("undefined" === typeof(comment_server)) {
			/*global comments_server:true */
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
				$(".musicplaylist .item.more").remove();
			})
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

},{"./js/modules/content":"JTiXJJ","./js/modules/events":"gtc4uL","./js/modules/music":"NzQZ2+","./js/modules/options":"xbP5ff","./js/modules/players":"5QOjA2","./js/modules/progressbar":"t9+Ge2","./js/modules/subreddits":"62hrOi"}],"JTiXJJ":[function(require,module,exports){
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

	// MUSIC
	var buildMusicView = function (songs, currentSong) {
		var root = $(".music.content .playlist");
		var template = $(".templates [type='html/musicplaylist']").html();

		var add = function (item) {
			var newEl = $($.render(template, item));
			if (item.markdown) {
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
			intervalProgressBar = window.setInterval(function () {
				var percentage = updateFunction();
				musicProgress.set(percentage);
			}, 500);
		}
	}

	self.on("new-song", function (currentSong) {
		musicSongSelect(currentSong);
	});

	self.on("music-progress", function (currentSong, soundcloudData) {
		if (currentSong.origin === "soundcloud.com") {
			try {
				musicProgress.set(soundcloudData.relativePosition * 100);
			} catch (err) {
				//console.error(currentSong);
			}
		} else {
			updateProgressBar(function () {
				var data = $("#youtube").tubeplayer("data");
				if (!data) {
					self.trigger("ytnotready");
				}
				return data.currentTime / data.duration * 100;
			});
		}
	});

}

module.exports = ContentModel;
},{"./progressbar":"t9+Ge2"}],"./js/modules/content":[function(require,module,exports){
module.exports=require('JTiXJJ');
},{}],"./js/modules/events":[function(require,module,exports){
module.exports=require('gtc4uL');
},{}],"gtc4uL":[function(require,module,exports){
"use strict";
/*global KeyboardJS:false */

function UserEventsModel(Music, Options) {

	/// Controls the subreddits menu.
	var self = this;

	$.observable(self);

	// MUSIC CONTROLS
	var MusicEvents = function () {
		// Play & Stop
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
			Options.set("sortMethod", sortingMethod);
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
					Options.set("sortMethod", topvalue[0]);
					Options.set("topMethod", topvalue[1]);

					// Make button active
					$(".sorting.column .sort.item").removeClass("active");
					$(".sorting.column .sort.item.top").addClass("active");
				} else {
					Options.set("sortMethod", sortingMethod);
				}
				Music.trigger("update");
			}
		});
	};

	// Keyboard
	var KeyboardEvents = function () {
		// Music Controls
		KeyboardJS.on("space", function () {
			Music.trigger("play-btn");
		});
		KeyboardJS.on("right,down", function () {
			Music.trigger("song-next");
		});
		KeyboardJS.on("left,up", function () {
			Music.trigger("song-previous");
		});

		// Clear subreddits
		KeyboardJS.on("ctrl+x", function (e) {
			self.trigger("clearSubs", e);
		});

		KeyboardJS.on("ctrl+e", function (e) {
			self.trigger("toggleActiveSubs", e);
		});

		// Search
		KeyboardJS.on("ctrl+f", function (e) {
			self.trigger("toggleSearchSubs", e);
		});

		// Espace
		KeyboardJS.on("escape", function () {
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
},{}],"./js/modules/music":[function(require,module,exports){
module.exports=require('NzQZ2+');
},{}],"NzQZ2+":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";
/*global SC:true */

var RedditModel = require("./reddit");

function MusicModel(musicProgress) {
	/// Controls Music & Radio

	/// Events
		// :: loaded : Done Loading
		// :: song|song-playing (song) : Song is playing
		// :: playing (isPlaying) : State of the playing system

	/// Listeners
		// :: playlist-select ("radio|music", element, song) : Playlist item is selected
		// :: song-switch (song) : Song is switched
		// :: song-previous : Previous song
		// :: song-next : Next song
		// :: update : Get new songs > Reddit
		// :: menu-selection-remove (subreddit) : Remove a subreddit
		// :: menu-selection-add (subreddit) : Add a subreddit

	/// Reddit
		/// Events
		// :: update : Get New Songs
		/// Listeners
		// :: playlist (playlist) : Get a new playlist
		// :: playlist-update (playlist) : Update playlist

	// Initialize
		var self = this;
		var url = "",
			index = 0,
			Reddit = self.Reddit = new RedditModel(),
			type = null;

		if (!SC) {
			SC = global.SC || window.SC;
		}
		self.widget = SC.Widget("sc");
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

		self.isPlaying = false;
		self.songs = [];
		self.player = null;
		self.currentSong = null;

	// Methods
		var isLastSong = function () {
			if (self.currentSong === self.songs[0]) {
				console.log("first song");
				$(".prev-btn").addClass("disabled");
			} else {
				$(".prev-btn").removeClass("disabled");
			}
		};

		var isFirstSong = function () {
			if (self.currentSong === self.songs[self.songs.length - 1]) {
				console.log("last song");
				self.trigger("playlist-more");
			}
		};

		var playSong = function (song) {
			self.stop();
			if (song) {
				self.currentSong = song;
				index = self.songs.indexOf(self.currentSong);
				if (song.origin === "youtube.com") {
					var songId = song.file.substr(31);
					$("#youtube").tubeplayer("play", songId);
					self.trigger("playing", true);
					self.trigger("song-playing", song);
				} else if (song.origin === "soundcloud.com") {
					self.one("load-ready", function (data) {
						self.widget.play();
						self.trigger("playing", true);
						self.trigger("song-playing", self.currentSong);
					});
					self.widget.load(song.track.uri, self.widgetOptions);
				}
				isLastSong();
				isFirstSong();
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
			console.log(musicProgress.element.outerWidth(), e, myWidth / maxWidth);
			if (self.currentSong.origin === "soundcloud.com") {
				self.widget.getDuration(function (dur) {
					self.widget.seekTo((myWidth / maxWidth) * dur);
				});
			} else {
				var data = $("#youtube").tubeplayer("data");
				$("#youtube").tubeplayer("seek", (myWidth / maxWidth) * data.duration);
			}

			musicProgress.seek(myWidth / maxWidth * 100);
		};

		self.play = function () {
			if (self.songs.length > 0) {
				playSong(
					self.songs[index]
				);
			} else {
				Reddit.trigger("update");
				Reddit.one("playlist", function () {
					playSong(
						self.songs[self.index]
					);
				});
			}
		};
		
		self.stop = function () {
			if (self.isPlaying) {
				self.widget.pause();
				$("#youtube").tubeplayer("stop");
				self.trigger("playing", false);
			}
		};

		self.togglePlayBtn = function (value) {
			$(".play-btn").removeClass("stop").removeClass("play");
			$(".play-btn .icon").addClass("hidden");
			if (value === "play") {
				$(".play-btn").addClass("play");
				$(".play-btn .play").removeClass("hidden");
			} else if (value === "stop") {
				$(".play-btn").addClass("stop");
				$(".play-btn .stop").removeClass("hidden");
			}
		};


		$.observable(self);

	// Listeners
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

				self.togglePlayBtn("stop");

				self.trigger("song-switch", song);
			}
		});

		// Play / Pause button
		self.on("play-btn", function () {
			if (!self.isPlaying) {
				self.togglePlayBtn("stop");
				self.play();
				self.trigger("loading");
			} else if (self.isPlaying) {
				self.togglePlayBtn("play");
				self.stop();
			}
		});

		// Play / Pause button
		self.on("musicProgress", seek);
	}

module.exports = MusicModel;


},{"./reddit":14}],"./js/modules/options":[function(require,module,exports){
module.exports=require('xbP5ff');
},{}],"xbP5ff":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};"use strict";

function simpleStorage() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	global.storage = {};

	self.getItem = function (key) {
		return global.storage[key];
	};
	self.setItem = function (key, value) {
		return global.storage[key] = value;
	};
	self.clear = function (key) {
		return delete global.storage[key];
	};
}

var defaults = {
	sortMethod: "hot",
	topMethod: "week",
	subreddits: []
};

function OptionsModel() {
	var self = this;

	self.local = global.window.localStorage || new simpleStorage();

	self.get = function (key) {
		return JSON.parse(self.local.getItem(key)) || defaults[key];
	};

	self.set = function (key, value) {
		return self.local.setItem(key, JSON.stringify(value));
	};

	self.clear = function (key) {
		return self.local.clear(key);
	};

	$.observable(self);
}

module.exports = OptionsModel;
},{}],"./js/modules/players":[function(require,module,exports){
module.exports=require('5QOjA2');
},{}],"5QOjA2":[function(require,module,exports){
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
},{}],"./js/modules/progressbar":[function(require,module,exports){
module.exports=require('t9+Ge2');
},{}],"t9+Ge2":[function(require,module,exports){
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
},{}],14:[function(require,module,exports){
"use strict";

var Bandcamp = {base: "http://api.bandcamp.com/api/", key: "snaefellsjokull"};
var SoundCloud = {base: "http://api.soundcloud.com/", key: "5441b373256bae7895d803c7c23e59d9"};

var OptionsModel = require("./options");

function RedditModel() {
	var self = this;

	var Options = new OptionsModel();
	self.subreddits = Options.get("subreddits");
	if ("undefined" !== typeof(defaults)) {
		/*global defaults:true */
		self.subreddits = defaults.split(",");
	}
	var last = "";

	$.observable(self);

	Object.defineProperty(self, "sortMethod", {
		get: function () {
			return Options.get("sortMethod");
		}
	});

	Object.defineProperty(self, "topMethod", {
		get: function () {
			return Options.get("topMethod");
		}
	});

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

	var fetchMusic = function (subreddits, callback) {
		var playlist = [];
		var topParams = self.sortMethod === "top" ? "sort=top&t=" + self.topMethod + "&" : "";
		var more = last.length > 0 ? true : false;
		var page = more ? "after=" + last + "&" : "";
		$.getJSON("http://www.reddit.com/r/" + subreddits + "/" + self.sortMethod + "/.json?" + topParams + page + "jsonp=?", function (r) {
			console.log("REDDIT > Total:", r.data.children.length);
			$.each(r.data.children, function (i, child) {
				var post = child.data;
				var media = post.media;
				if (media) {
					var time = new Date();
					time.setTime(parseInt(post.created_utc) * 1000);
					post.created = timeSince(time);
					var data = {"author": post.author, "subreddit": post.subreddit, "ups": post.ups, "downs": post.downs, "created": post.created, "name": post.name, "reddit": "http://reddit.com" + post.permalink, "score": post.score, "origin": media.type };
					
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
						case "youtube.com": case "youtu.be":
							var track = media.oembed;
							if (more) {
								self.trigger("playlist-add", $.extend({title: track.title, file: track.url}, data));
							} else {
								playlist.push($.extend({title: track.title, file: track.url}, data));
								self.trigger("playlist-update", playlist);
							}
							break;

						case "soundcloud.com":
							var track_id = unescape(media.oembed.html).match(/\/tracks\/(\d+)/);
							console.log(media.oembed);
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
							break;
						default:
							console.log(media);
					}
				}
			});
			console.log("REDDIT > Songs:", playlist.length);
		});
	};

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
		/*global pushState:true */
		if (shouldPush === true) {
			var stateObj = { subreddits: self.subreddits };
			history.replaceState(stateObj, "Reddit Music Player", url);
		}
	};

	self.addSubReddit = function (value) {
		shouldPush = true;
		self.subreddits.push(value);
		Options.set("subreddits", self.subreddits);
	};

	self.removeSubReddit = function (value) {
		shouldPush = true;
		var index = self.subreddits.indexOf(value);
		self.subreddits.splice(index, 1);
		Options.set("subreddits", self.subreddits);
	};

	self.getSubRedditList = function () {
		state("/r/" + self.subreddits.join("+"));
		return self.subreddits.join("+");
	};

	self.on("update", function () {
		if (self.subreddits.length >= 1) {
			last = "";
			fetchMusic(self.getSubRedditList(self.subreddits));
		} else {
			state("/");
		}
	});

	self.on("comments", function (commentUrl) {
		fetchComments(commentUrl);
	});

	self.on("more", function (lastId) {
		last = lastId;
		fetchMusic(self.getSubRedditList(self.subreddits));
	});
}


module.exports = RedditModel;
},{"./options":"xbP5ff"}],"./js/modules/subreddits":[function(require,module,exports){
module.exports=require('62hrOi');
},{}],"62hrOi":[function(require,module,exports){
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
},{}]},{},[1])
;