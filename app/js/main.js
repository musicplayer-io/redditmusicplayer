try {
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
					$(".clear-subs").removeClass("hidden");
				} else {
					showAllSubs();
					$(".clear-subs").addClass("hidden");
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

			var clearSubs = function() {
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
			}

			// Show Search
			$(".search-subs").click(toggleSearchSubs)
			// On Input
			$("#searchSubs input").keyup(filterSubs);
			// Clear
			$(".clear-subs").click(clearSubs);

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

			// Sorting
				$(".sorting.column .sort.item").click(function(e) {
					var target = $(e.target);
					var sortingMethod = target.data("value");
					
					// Make button active
					$(".sorting.column .sort.item").removeClass("active");
					target.addClass("active");

					// Set Sorting Method
					Options.set("sortMethod", sortingMethod);
					Music.trigger("update");
				})

				// Dropdowns
				$('.top.dropdown').dropdown({
					metadata: {
					  value : 'value'
					},
					transition: "fade",
					duration: 100,
					onChange: function(sortingMethod, text) {
						if (sortingMethod.substr(0,3) == "top") {
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
					Music.togglePlayBtn("play");
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
					Music.togglePlayBtn("stop");
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
					Music.togglePlayBtn("play");
					Music.isPlaying = false;
					console.log("sc played ended");
					Plaer.Music.trigger("song-next");
					musicProgress.end();
				})
				Music.widget.bind(SC.Widget.Events.PLAY, function() {
					Music.trigger("soundcloud-ready");
					Music.togglePlayBtn("stop");
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
						$(".music .title").text("Hit Play!");
					}
					initSubs();

					if (Options.get("sortMethod") == "top") {
						$(".sorting.column .item[data-value='"+Options.get("sortMethod")+":"+Options.get("topMethod")+"']").click();
					} else {
						$(".sorting.column .item[data-value='"+Options.get("sortMethod")+"']").click();
					}

})
