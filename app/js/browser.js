require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var process=require("__browserify_process"),global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};try {
	if (global) global.$ = $;
} catch(err) {}

// Model Dependencies
	// Music
	var MusicModel = require("./js/modules/music");

	// UI
	var ContentModel = require("./js/modules/content");
	var ProgressBarModel = require("./js/modules/progressbar");

	var OptionsModel = require("./js/modules/options");

// Presenter
$(function() {

	// Initialize
		var Music = new MusicModel();
		var loadProgress = new ProgressBarModel(".load-progress");
		var musicProgress = new ProgressBarModel(".music-progress");
		var Content = new ContentModel();
		var Options = new OptionsModel();

	// Some work

		if( process.platform == "win32" ) {
			console.log(process.platform);
			$(".windows-only").addClass("iswindows");
			$(".windows-hidden").addClass("iswindows");
		} else {
			console.log(process.platform);
			$(".windows-only").addClass("notwindows");
			$(".windows-hidden").addClass("notwindows");
		}


	// Helpers

		String.prototype.fuzzy = function (s) {
		    var hay = this.toLowerCase(), i = 0, n = 0, l;
		    s = s.toLowerCase();
		    for (; l = s[i++] ;) if ((n = hay.indexOf(l, n)) === -1) return false;
		    return true;
		};

		String.prototype.fuzzyMark = function (s) {
		    var hay = this.toLowerCase(), i = 0, n = 0, l;
		    s = s.toLowerCase();
		    for (; l = s[i++] ;) if ((n = hay.indexOf(l, n)) === -1) return false;
		    var matches = [];
			var i=0, n=0;
		    for (; l = s[i++] ;) {
		    	matches.push((n = hay.indexOf(l, n)));
		    }
		    return matches;
		};

	// User Events
		// Music controls
			// Play & Stop
			$(".play-btn").click(function() {
				Music.trigger("play-btn");
			})

			// Next button
			$(".next-btn").click(function() {
				Music.trigger("song-next");
			})

			// Previous button
			$(".prev-btn").click(function() {
				Music.trigger("song-previous");
			})

		// Subreddits
			var filterSubs = function() {
				var value = $("#searchSubs input").val();
				var lists = $(".subreddit-menu > .item");
				for (var i = lists.length - 1; i >= 0; i--) {
					var list = $(lists[i]);
					list.find(".item").each(function(n, item) {
						var item = $(item);
						if (!item.text().fuzzy(value)) {
							item.hide();
						} else {
							var string = item.text().split("");
							var marks = item.text().fuzzyMark(value);
							for (var n = 0; n < string.length; n++) {
								for (var m = 0; m < marks.length; m++) {
									var mark = marks[m];
									if (n==mark) {
										string[n] = "<b>"+ string[n] +"</b>";
									}
								};
							};
							item.html(string.join(""))
							item.show();
							list.show();
						}
					})
					if (list.find(".item:visible").length==0) {
						list.hide();
					} else {
						list.show();
					}
				};
			};

			var _filterSubs = function() {
				var value = $("#searchSubs input").val();
				var lists = $(".subreddit-menu > .item");
				for (var i = lists.length - 1; i >= 0; i--) {
					var list = $(lists[i]);
					list.find(".item").each(function(n, item) {
						var item = $(item);
						if (item.text().indexOf(value) == -1) {
							item.hide();
						} else {
							item.show();
							list.show();
						}
					})
					if (list.find(".item:visible").length==0) {
						list.hide();
					} else {
						list.show();
					}
				};
			};

			var showActiveSubs = function() {
				var lists = $(".subreddit-menu > .item");
				for (var i = lists.length - 1; i >= 0; i--) {
					var list = $(lists[i]);
					list.find(".item:not(.active)").each(function(n, item) {
						$(item).hide();
					})
					list.find(".item.active").each(function(n, item) {
						$(item).show();
					})
				};
			};

			var showAllSubs = function() {
				var lists = $(".subreddit-menu > .item");
				for (var i = lists.length - 1; i >= 0; i--) {
					var list = $(lists[i]);
					list.find(".item").show();
				};
			}

			var toggleActiveSubs = function(e) {
				if (e) e.preventDefault();
				$(".edit-subs").toggleClass("active");
				if ($("#searchSubs").hasClass("visible")) toggleSearchSubs();
				if ($(".edit-subs").hasClass("active")) {
					showActiveSubs();
				} else {
					showAllSubs();
				}
			}

			// Search Subreddits
			var toggleSearchSubs = function(e) {
				if (e) e.preventDefault();
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
			};

			// Show Search
			$(".search-subs").click(toggleSearchSubs)
			// On Input
			$("#searchSubs input").keyup(filterSubs);
			// Clear
			$(".clear-subs").click(function() {
				$(".edit-subs").removeClass("active");
				showAllSubs();
				if ($("#searchSubs").hasClass("visible")) toggleSearchSubs();
				$(".musicmenu .selection.menu .item.active").each(function(e, item) {
					var self = $(item);
					var active = self.hasClass("active");
					if (active) {
						Music.trigger("menu-selection-clear", self);
						self.removeClass("active");
					}
				})
				Music.trigger("update");
			})

			$(".edit-subs").click(toggleActiveSubs);


		// MUSIC
			// Select Subreddit
			$(".musicmenu .selection.menu .item").click(function(e) {
				var self = $(this);
				var active = self.hasClass("active");
				if (active) {
					Music.trigger("menu-selection-remove", self);
					self.removeClass("active");
				} else if (!active) {
					Music.trigger("menu-selection-add", self);
					self.addClass("active");
				}
			})

		// Semantic UI
			// Radio & Music Tabs
			$("body .content.settings .item")
			.tab({
				useCSS: false,
				overlay: false,
				duration: 500
			});

			$("body .page-menu .item")
			.tab({
				useCSS: false,
				overlay: false,
				duration: 500,
				onTabLoad : function(tab) {
					if (tab == "music") {
						$(".page-menu .music-page").addClass("active");
						$(".page-menu .settings-page").removeClass("active");
					} else if (tab=="settings") {
						$(".page-menu .settings-page").addClass("active");
						$(".page-menu .music-page").removeClass("active");
					}
				}
			});

			// Dropdowns
			$('.ui.dropdown').dropdown({
				metadata: {
				  value : 'value'
				},
				transition: "fade",
				duration: 100,
				onChange: function(value, text) {
					if (value.substr(0,3) == "top") {
						var topvalue = value.split(":");
						Options.set("sortMethod", topvalue[0]);
						Options.set("topMethod", topvalue[1]);
					} else {
						Options.set("sortMethod", value);
					}
					Music.trigger("update");
				}
			});

			$('.ui.checkbox')
			  .checkbox()
			;

		// JQUERY Player
			var timeOut;
			var ytPlayer = $("#youtube").tubeplayer({
				allowFullScreen: "false", // true by default, allow user to go full screen
				autoplay: true,
				initialVideo: "Wkx_xvl7zRA", // the video that is loaded into the player
				preferredQuality: "default",// preferred quality: default, small, medium, large, hd720
				onPlayerEnded: function() {
					$(".play-btn").removeClass("stop");
					$(".play-btn").addClass("play");
					Music.isPlaying = false;
					console.log("yt played ended");
					Music.trigger("song-next");
					musicProgress.end();
				},
				onPlayerUnstarted: function() {
					Music.isPlaying = false;
					timeOut = window.setTimeout(function() {
						if (Music.isPlaying == false) {
							Music.trigger("song-next");
						}
					}, 5000);
				},
				onPlayerPlaying: function() {
					$(".play-btn").addClass("stop");
					$(".play-btn").removeClass("play");
					Music.isPlaying = true;
					loadProgress.trigger("end");
					musicProgress.start();
					Content.trigger("music-progress", Music.currentSong);
					console.log("yt played playing");
					timeOut = window.clearTimeout(timeOut);
				},
				onPlayerBuffering: function() {
					loadProgress.trigger("start");
					console.log("yt played buffering");
				}
			});
		// Soundclould Player
			SC.initialize({
				client_id: "5441b373256bae7895d803c7c23e59d9"
			});

			Music.widget.bind(SC.Widget.Events.READY, function() {
				Music.widget.bind(SC.Widget.Events.FINISH, function() {
					$(".play-btn").removeClass("stop");
					$(".play-btn").addClass("play");
					Music.isPlaying = false;
					console.log("sc played ended");
					Plaer.Music.trigger("song-next");
					musicProgress.end();
				})
				Music.widget.bind(SC.Widget.Events.PLAY, function() {
					Music.trigger("soundcloud-ready");
					$(".play-btn").addClass("stop");
					$(".play-btn").removeClass("play");
					loadProgress.trigger("end");
					Music.isPlaying = true;
					musicProgress.start();
					console.log("sc played playing");
				})
				Music.widget.bind(SC.Widget.Events.ERROR, function() {
					console.log("errorwidget")
				})
				Music.widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
					Content.trigger("music-progress", Music.currentSong, data);
				})
				Music.widget.bind(SC.Widget.Events.LOAD_PROGRESS, function() {
					console.log("LOAD_PROGRESS")
				})
			})

		// Keyboard
			
			// Music Controls
				KeyboardJS.on("space", function() {
					Music.trigger("play-btn");
				})
				KeyboardJS.on("right", function() {
					Music.trigger("song-next");
				})
				KeyboardJS.on("left", function() {
					Music.trigger("song-previous");
				})

				KeyboardJS.on("f2", function() {
					$("body .page-menu .item[data-tab=music]").click()
				})
				KeyboardJS.on("f3", function() {
					$("body .page-menu .item[data-tab=radio]").click()
				})

			// Search
				KeyboardJS.on("ctrl+f", toggleSearchSubs);

			// Espace
				KeyboardJS.on("escape", function() {
					if ($("#searchSubs").hasClass("visible")) {
						toggleSearchSubs();
					}
				})

	// Model Events
		// Player
			// New song :: Set Title & Progressbar
			Music.on("song-playing", function(song) {
				console.log("Now Playing: " + song.title);
				$(".bottom.menu .music.tab .title").html(song.title);
				Content.trigger("new-song", song);
			})

			// Music started playing
			Music.on("playing", function(isPlaying) {
				if (isPlaying) {
					//loadProgress.trigger("end");
					Content.trigger("music-progress", Music.currentSong);
				}
			})

			// New Playlist on the Music / New Subreddits
			Music.on("playlist", function(songs) {
				Content.trigger("build", "music playlist", songs, Music.currentSong);
			})

		// Progressbar

			musicProgress.element.click(function(e) {
				var maxWidth = musicProgress.element.outerWidth();
				var myWidth = e.clientX;
				if (Music.currentSong.origin == "soundcloud.com") {
					Music.widget.getDuration(function(dur) {
						Music.widget.seekTo((myWidth/maxWidth) * dur);
					})
				} else {
					var data = $("#youtube").tubeplayer("data");
					$("#youtube").tubeplayer("seek", (myWidth/maxWidth) * data.duration);
				}

				musicProgress.seek(myWidth/maxWidth * 100);
			})

		// Last FM

			$(".lastfm-btn").click(function() {
				var lastfm_key = "5627a9006241747e2d462a15685b27ac";
				var secret = "e4ac152e4201f7032a020b8e5f70495a";
				var user = $(".lastfm-user input").val();
				var pass = $(".lastfm-pass input").val();
				var sig = "api_key"+lastfm_key+"methodauth.getMobileSessionpassword"+pass+"username"+user+secret;
				var md5_sig = hex_md5(sig);
				$.post("https://ws.audioscrobbler.com/2.0/", {
					method: "auth.getMobileSession",
					username: user,
					password: pass,
					api_key: lastfm_key,
					api_sig: md5_sig
				}, function(data) {
					var lastData = $(data);
					Options.set("lastfm_name", lastData.find("name").text());
					Options.set("lastfm_key", lastData.find("key").text());
					isLoggedInLastFM();
				})
			})

			$(".lastfm-logout-btn").click(function() {
				Options.clear("lastfm_key");
				Options.clear("lastfm_name");
				$(".lastfm.log-in").show();
				$(".lastfm.logged-in").hide();

				$(".lastfm-user input").val("");
				$(".lastfm-pass input").val("");
			})
			

		// Content
			Content.on("playlist-select", function(element, song) {
				if (!element.hasClass("active")) {
					loadProgress.trigger("start");
					Music.trigger("playlist-select", element, song);
				}
			})

			Content.on("playlist-more", function() {
				Music.trigger("playlist-more");
			})

			// Settings Defaults
				if (Options.get("sortMethod") == "top") {
					$(".ui.dropdown .item[data-value='"+Options.get("sortMethod")+":"+Options.get("topMethod")+"']").click();
				} else {
					$(".ui.dropdown .item[data-value='"+Options.get("sortMethod")+"']").click();
				}

		
		// Options

				// Subreddits
				var makeDefaultSubreddits = function() {
					var root =  $(".subreddits-default");
					root.html("");
					var template = $(".templates [type='html/subredditlabel']").html();
					var defaultSubs = Options.get("subreddits");
					for (var i = defaultSubs.length - 1; i >= 0; i--) {
						var sub = {"sub": defaultSubs[i], "name": defaultSubs[i], "icon": "remove"};
						var el = $($.render(template, sub));
						el.appendTo(root);
						el.click(removeDefaultSub);
					};
				}
				var addDefaultSub = function(e) {
					var sub = $(this).data("sub");
					if (Options.get("subreddits").indexOf(sub) === -1) {
						var tOptions = Options.get("subreddits");
						tOptions.push(sub.toLowerCase());
						Options.set("subreddits", tOptions);
					}
					makeDefaultSubreddits();
				}

				var removeDefaultSub = function(e) {
					var sub = $(this).data("sub");
					if (Options.get("subreddits").indexOf(sub) > -1) {
						var tOptions = Options.get("subreddits");
						tOptions.splice(Options.get("subreddits").indexOf(sub), 1);
						Options.set("subreddits", tOptions);
					}
					makeDefaultSubreddits();
				}

				makeDefaultSubreddits();

				$(".subreddits-add input").keyup(function() {
					var value = $(this).val();
					var root =  $(".subreddits-search-add");
					var template = $(".templates [type='html/subredditlabel']").html();
					root.html("");
					root.show("fade up in");
					if (value.length >= 2) {
						for (var i = Options.subreddits.length - 1; i >= 0; i--) {
							var sub = Options.subreddits[i];
							if (sub.fuzzy(value)) {
								var string = sub.split("");
								var marks = sub.fuzzyMark(value);
								for (var n = 0; n < string.length; n++) {
									for (var m = 0; m < marks.length; m++) {
										var mark = marks[m];
										if (n==mark) {
											string[n] = "<b>"+ string[n] +"</b>";
										}
									};
								};
								var subData = {"sub": sub, "name": string.join(""), "icon": "add"};
								var el = $($.render(template, subData));
								el.appendTo(root);
								el.click(addDefaultSub);
							}
						};
					}
						
				})
				$(".subreddits-add input").blur(function() {
					var root =  $(".subreddits-search-add");
					root.transition({
						animation : 'fade up out',
						duration  : '200ms',
						complete  : function() {
							root.html("");
						}
					});
					$(".subreddits-add input").val("");
				});


				// Settings defaults | They're loaded in reddit.js anyway.
					function initSubs() {
						var subs =  Options.get("subreddits");
						for (var i = subs.length - 1; i >= 0; i--) {
							$(".subreddit-menu .item[data-value='"+subs[i]+"']").addClass("active");
						};
					}
					initSubs();
					function isLoggedInLastFM() {
						if (Options.get("lastfm_key")) {
							$(".lastfm.log-in").hide();
							$(".lastfm.logged-in").show();
							$(".lastfm.logged-in input").val(Options.get("lastfm_name"));
						}
					}
					isLoggedInLastFM();

				// Go
				$(".still-loading").transition({
					animation: "slide up",
					duration: "200ms"
				});
})

},{"./js/modules/content":"kUqara","./js/modules/music":"USwVCS","./js/modules/options":"jLEaKv","./js/modules/progressbar":"LtFNV5","__browserify_process":11}],"./js/modules/content":[function(require,module,exports){
module.exports=require('kUqara');
},{}],"kUqara":[function(require,module,exports){
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

	// MUSIC
	var buildMusicView = function(songs, currentSong) {
		var root = $(".music.content .playlist");
		var template = $(".templates [type='html/musicplaylist']").html();

		var add = function(item) {
			if (item.origin == "youtube.com") item.origin = "<i class='icon youtube play'></i>";
			var newEl = $($.render(template, item));
			var el = newEl.appendTo(root);
			if (currentSong) {// New Playlist Received > Send Songs & Current Song > Rebuild View
				if (item.title == currentSong.title) {
					el.addClass("active");
				}
			}
			//el.transition("fade down in");
			el.click(function() {
				self.trigger("playlist-select", el, item);
			})
		}

		var more = function() {
			var newEl = $("<div class='item more'></div>");
			newEl.append($("<div class='name'>Load More</div>"));
			var el = newEl.appendTo(root);
			//el.transition("fade down in"); 
			el.click(function() {
				self.trigger("playlist-more");
			})
		}

		
		// Remove all old songs...
		$(".music.content .playlist .item").remove()
		// .transition({
		// 	animation: "fade up out",
		// 	duration: "100ms",
		// 	complete: function() {
		// 		$(this).remove();
		// 	}
		// });

		// For all the new songs...
		for (var i = 0; i < songs.length; i++) {
			add(songs[i]);
		};
		more();
	}

	var musicSongSelect = function(song) {
		var items = $(".music.content .playlist .item");
		items.siblings(".active").removeClass("active");
		items.siblings('[href="'+song.file+'"]').addClass("active");
	}

	$.observable(self);

	self.on("build", function(view, content, currentSong) {
		if (view == "music playlist") {
			buildMusicView(content, currentSong);
		}
	})

	var intervalProgressBar;
	function updateProgressBar(updateFunction) {
		if (!intervalProgressBar) {
			musicProgress.start();
			intervalProgressBar = window.setInterval(function() {
				var percentage = updateFunction();
				musicProgress.set(percentage);
			}, 500);
		}
	}


	self.on("music-progress", function(currentSong, data) {
		if (currentSong.origin == "soundcloud.com") {
			try {
				musicProgress.set(data.relativePosition*100);
			} catch(err) {
				//console.error(currentSong);
			}
		} else {
			updateProgressBar(function() {
				var data = $("#youtube").tubeplayer("data");
				return data.currentTime / data.duration * 100;
			})
		}
	})

	self.on("new-song", function(currentSong) {
		musicSongSelect(currentSong);
	})
}

module.exports = ContentModel;
},{"./progressbar":"LtFNV5"}],"USwVCS":[function(require,module,exports){
var RedditModel = require("./reddit")

function MusicModel() {
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
		var self = this
		var url = "",
			index = 0,
			Reddit = self.Reddit = new RedditModel(),
			type = null;

		self.widget = SC.Widget("sc");
		self.widgetOptions = {
			auto_advance: false,
			auto_play: false,
			buying: false,
			download: false,
			hide_related: false,
			liking: false,
			sharing: false,
			show_artwork: false,
			show_comments: false,
			show_playcount: false,
			show_user: false,
			start_track: "0",
			callback: function(data) {
				self.trigger("load-ready", data);
			}
		};

		self.isPlaying = false;
		self.songs = [];
		self.player = null;
		self.currentSong = null;

	// Methods
		var isLastSong = function() {
			if (self.currentSong == self.songs[self.songs.length-1]) {
				console.log("last song");
				self.trigger("playlist-more");
			}
		}

		var playSong = function (song) {
			self.stop();
			if (song) {
				self.currentSong = song;
				index = self.songs.indexOf(self.currentSong);
				if (song.origin == "<i class='icon youtube play'></i>") {
					var songId = song.file.substr(31);
					$("#youtube").tubeplayer("play", songId);
					self.trigger("playing", true);
					self.trigger("song-playing", song);
				} else if (song.origin == "soundcloud.com") {
					self.one("load-ready", function(data) {
						self.widget.play();
						self.trigger("playing", true);
						self.trigger("song-playing", self.currentSong);
					})
					self.widget.load(song.track.uri, self.widgetOptions);
				}
				isLastSong();
			}
		}

		var getSongByURL = function(songURL) {
			for (var i = self.songs.length - 1; i >= 0; i--) {
				if (self.songs[i].file == songURL) return self.songs[i];
			};
		}

		self.play = function () {
			if (self.songs.length > 0) {
				playSong(
					self.songs[index]
				);
			} else {
				Reddit.trigger("update");
				Reddit.one("playlist", function() {
					playSong(
						self.songs[self.index]
					);
				})
			}
		}
		
		self.stop = function() {
			if (self.isPlaying) {
				self.widget.pause();
				$("#youtube").tubeplayer("stop");
				self.trigger("playing", false);
			}
		}


	$.observable(self);

	// Listeners
		// New Song Selected > Play This Song
		self.on("song-switch", function(song) {
			if (song) {
				if (song.file) {
					playSong(song);
				}
			}
		})
		// Previous Song > Play Previous Song
		self.on("song-previous", function() {
			var indexMin = index - 1;
			if (indexMin >= 0) {
				index--;
				self.play();
			}
		})
		// Next Song > Play Next Song
		self.on("song-next", function() {
			var indexMin = index + 1;
			if (indexMin <= self.songs.length) {
				index++;
				self.play();
			}
		})

		// Update > Update Reddit
		self.on("update", function() {
			Reddit.trigger("update");
		})

		self.on("playlist-more", function() {
			if (self.songs[self.songs.length-1])
				Reddit.trigger("more", self.songs[self.songs.length-1].name);
		})

	// Reddit
		// Remove Subreddit > Update Reddit > Update Songs
		self.on("menu-selection-remove", function(el) {
			if (el) {
				var sub = el.attr("data-value");
				Reddit.removeSubReddit(sub);
				Reddit.trigger("update");
			}
		})
		// Add Subreddit > Update Reddit
		self.on("menu-selection-add", function(el) {
			if (el) {
				var sub = el.attr("data-value");
				Reddit.addSubReddit(sub);
				Reddit.trigger("update");
			}
		})
		// Clear Subreddits
		self.on("menu-selection-clear", function(el) {
			var sub = el.attr("data-value");
			Reddit.removeSubReddit(sub);
		})
		// New Playlist Received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist", function(playlist) {
			self.songs = playlist;
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		})

		// New Playlist Received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist-update", function(playlist) {
			self.songs = playlist;
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		})

		// More playlist items received > Send Songs & Current Song > Rebuild View
		Reddit.on("playlist-add", function(playlist) {
			self.songs.push(playlist);
			// New Playlist / Include: songs, current song.
			self.trigger("playlist", self.songs, self.currentSong);
		})


			// If Music starts Playing;
			self.on("playing", function(state) {
				self.isPlaying = state;
				self.trigger("loaded");
				$(".play-btn").removeClass("stop");
				$(".play-btn").addClass("play");
			});

		// Listeners

			// Song Selected from Playlist
			self.on("playlist-select", function(songEl, song) {
				if (!songEl.hasClass("active")) {
					$(".music.content .playlist .active").removeClass("active");
					songEl.addClass("active");
					self.trigger("loading");

					$(".play-btn").removeClass("play");
					$(".play-btn").addClass("stop");

					self.trigger("song-switch", song);
				}
			})

			// Play / Pause button
			self.on("play-btn", function() {
				if (!self.isPlaying) {
					$(".play-btn").removeClass("play");
					$(".play-btn").addClass("stop");
					self.play();
					self.trigger("loading");
				} else if (self.isPlaying) {
					$(".play-btn").removeClass("stop");
					$(".play-btn").addClass("play");
					self.stop();
				}
			});

}

module.exports = MusicModel;


},{"./reddit":10}],"./js/modules/music":[function(require,module,exports){
module.exports=require('USwVCS');
},{}],"jLEaKv":[function(require,module,exports){
var global=typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {};

function simpleStorage() {
	var self = this;

	global.storage = {};

	self.getItem = function(key) {
		return global.storage[key];
	}
	self.setItem = function(key, value) {
		return global.storage[key] = value;
	}
	self.clear = function(key) {
		return delete global.storage[key];
	}
}

var defaults = {
	sortMethod: "hot",
	topMethod: "week",
	subreddits: []
}

function OptionsModel() {
	var self = this;

	self.subreddits = ["crustpunk","grunge","melodicmetal","postrock","punk","Punkskahardcore","ska","stonerrock","atmosphericdnb","bassheavy","breakbeat","breakcore","brostep","chillstep","chiptunes","classic_beats","complextro","darkstep","deephouse","dnb","dubstep","drumstep","electro","ElectronicJazz","electronicmusic","electrohouse","electropop","electroswing","fidget","footwork","frenchhouse","funkhouse","futurebeats","futurefunkairlines","futuregarage","futurepopmusic","glitch","glitchop","grime","happyhardcore","hardstyle","hardtek","house","idm","juke","jumpup","latinhouse","liquiddnb","minimaltech","moombahton","NeuroFunk","nudisco","proghouse","progressivetrance","psytrance","purplemusic","raggajungle","realdubstep","skweee","techno","tech_house","techstep","trance","trap","triphop","blues","DeepFunk","funk","FunkSouMusic","jazz","soul","soulies","altrap","hiphopheads","makinghiphop","nerdcore","rap","80sMusic","ambientmusic","asmr","AvantGardeMusic","calireggae","chillmusic","chillwave","classicalmusic","coversongs","Cyberpunk_Music","dub","djmixes","EcouteCa","freemusic","frisson","gamemusic","icm","industrialmusic","ipm","jazznoir","koreanmusic","liftingmusic","listentothis","listentous","minimal","mlptunes","motivatedmusic","music","musiccritics","musicnews","MusicVideosOnYouTube","orchestra","partymusic","queercore","redditmusicclub","reggae","reggaeton","RepublicOfMusic","rootsreggae","rhythmicnoise","soundtracks","SoundsVintage","soulof","SpaceMusic"];

	if (!localStorage) var localStorage = global.window.localStorage || new simpleStorage();
	self.local = localStorage;

	self.get = function(key) {
		return JSON.parse(self.local.getItem(key)) || defaults[key];
	}

	self.set = function(key, value) {
		console.log(key, value);
		return self.local.setItem(key, JSON.stringify(value));
	}

	self.clear = function(key) {
		return self.local.clear(key);
	}

	$.observable(self);
}

module.exports = OptionsModel;
},{}],"./js/modules/options":[function(require,module,exports){
module.exports=require('jLEaKv');
},{}],"./js/modules/progressbar":[function(require,module,exports){
module.exports=require('LtFNV5');
},{}],"LtFNV5":[function(require,module,exports){


function ProgressBar(link) {
	var self=this;
	var current = 10;
	var interval = null;

	self.element = $(link);
	self.bar = $(link + " .bar");

	var shift = function() {
		current += 5;
		self.bar.css({"width": current  + "%"});
	}
	var reset = function() {
		current = 0;
		self.bar.css({"width": current  + "%"});
		if (interval) {
			window.clearInterval(interval)
		}
	}
	var autoShift = function() {
		interval = window.setInterval(function() {
			if (current >= 100) {
				reset();
			} else {
				shift();
			}
		}, 1000);
	}
	var disable = function() {
		self.element.removeClass("activated");
		if (interval) {
			interval = window.clearInterval(interval);
			interval = window.clearInterval(interval);
		}
	}

	self.start = function() {
		self.element.addClass("activated");
		reset();
	}
	self.end = function() {
		current=100;
		self.bar.css({"width": "100%"});
		window.setTimeout(disable, 200)
	}

	self.set = function(percent) {
		current=percent;
		self.bar.css({"width": percent+"%"});
	}

	self.seek = function(percent) {
		current=percent;
		self.bar.stop(true, true);
		self.bar.css({"width": percent+"%"});
	}

	// Enable MVP pattern (this is the secret for everything)
	$.observable(self);

	self.on("start", function() {
	  self.start();
	  autoShift();
	})
	self.on("end", function() {
	  	self.end();
	})
}


module.exports = ProgressBar;
},{}],10:[function(require,module,exports){
var Bandcamp = {base: "http://api.bandcamp.com/api/", key: "snaefellsjokull"};
var SoundCloud = {base: "http://api.soundcloud.com/", key: "5441b373256bae7895d803c7c23e59d9"};

var OptionsModel = require("./options");

function RedditModel() {
	var self = this;

	var Options = new OptionsModel();
	self.subreddits = Options.get("subreddits");
	var last = "";

	$.observable(self);

	Object.defineProperty(self, "sortMethod", {
		get: function() {
			return Options.get("sortMethod");
		}
	})

	Object.defineProperty(self, "topMethod", {
		get: function() {
			return Options.get("topMethod");
		}
	})

	var fetchMusic = function(subreddits, callback) {
		var playlist = [];
		var topParams = self.sortMethod == "top" ? "sort=top&t="+self.topMethod+"&" : "";
		var more = last.length > 0 ? true : false;
		var page = more ? "after="+last+"&" : "";
		$.getJSON("http://www.reddit.com/r/" + subreddits + "/"+self.sortMethod+"/.json?"+topParams + page + "jsonp=?", function(r) {
			console.log("total songs", r.data.children.length);
			$.each(r.data.children, function (i, child) {
				var post = child.data;
				var media = post.media;
				if (media) {
					var data = { "name": post.name, "reddit": "http://reddit.com"+post.permalink, "score": post.score, "origin": media.type };
					
					switch (media.type) {
						case "bandcamp.com":
							$.getJSON(Bandcamp.base + "url/1/info?callback=?", {key: Bandcamp.key, url: post.url}, function(r){
								if(r.album_id){
									$.getJSON(Bandcamp.base + "album/2/info?callback=?", {key: Bandcamp.key, album_id: r.album_id}, function(r){
										$.each(r.tracks, function(i, track){
											if (more) {
												self.trigger("playlist-add", $.extend({title: track.title, file: track.streaming_url}, data));
											} else {
												playlist.push($.extend({title: track.title, file: track.streaming_url}, data));
												self.trigger("playlist-update", playlist)
											}
										});
									});
								}else if(r.track_id){
									$.getJSON(Bandcamp.base + "track/1/info?callback=?", {key: Bandcamp.key, track_id: r.track_id}, function(track){
										if (more) {
											self.trigger("playlist-add", $.extend({title: track.title, file: track.streaming_url}, data));
										} else {
											playlist.push($.extend({title: track.title, file: track.streaming_url}, data));
											self.trigger("playlist-update", playlist)
										}
									});
								}
							});
						break;

						case "youtube.com":
							var track = media.oembed;
							if (more) {
								self.trigger("playlist-add", $.extend({title: track.title, file: track.url}, data));
							} else {
								playlist.push($.extend({title: track.title, file: track.url}, data));
								self.trigger("playlist-update", playlist)
							}
						break;

						case "soundcloud.com":
							var track_id = unescape(media.oembed.html).match(/\/tracks\/(\d+)/);
							if(track_id){
								$.getJSON(SoundCloud.base + "tracks/" + track_id[1] + ".json", {client_id: SoundCloud.key}, function(track){
									if(track.streamable){
										if (more) {
											self.trigger("playlist-add", $.extend({track: track, title: track.title, file: track.stream_url}, data));
										} else {
											playlist.push($.extend({track: track, title: track.title, file: track.stream_url}, data));
											self.trigger("playlist-update", playlist)
										}
									}
								});
							}
						break;
					}
				}
			});
			console.log("playlist length", playlist.length)
			//self.trigger("playlist", playlist)
		});
	}

	self.addSubReddit = function(value) {
		self.subreddits.push(value);
	}

	self.removeSubReddit = function(value) {
		var index = self.subreddits.indexOf(value);
		self.subreddits.splice(index, 1);
	}

	self.getSubRedditList = function() {
		return self.subreddits.join("+");
	}

	self.on("update", function() {
		if (self.subreddits.length >= 1) {
			last = "";
			fetchMusic(self.getSubRedditList(self.subreddits));
		}
	})

	self.on("more", function(lastId) {
		console.log(lastId);
		last = lastId;
		fetchMusic(self.getSubRedditList(self.subreddits));
	})

}


module.exports = RedditModel;
},{"./options":"jLEaKv"}],11:[function(require,module,exports){
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

},{}]},{},[1])
;