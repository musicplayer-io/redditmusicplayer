try {
	if (global) global.$ = $;
} catch(err) {}

// Model Dependencies
	// Music
	var PlayerModel = require("./js/modules/player");

	// UI
	var ContentModel = require("./js/modules/content");
	var ProgressBarModel = require("./js/modules/progressbar");

	var OptionsModel = require("./js/modules/options");

// Presenter
$(function() {

	// Initialize
		
		var Player = new PlayerModel();
		var loadProgress = new ProgressBarModel(".load-progress");
		var musicProgress = new ProgressBarModel(".music-progress");
		var Content = new ContentModel();
		var Options = new OptionsModel();
		global.window.Player = Player;

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


	// User Events
		// Music controls
			// Play & Stop
			$(".play-btn").click(function() {
				Player.trigger("play-btn");
			})

			// Next button
			$(".next-btn").click(function() {
				Player.trigger("next-btn");
			})

			// Previous button
			$(".prev-btn").click(function() {
				Player.trigger("prev-btn");
			})

		// Subreddits
			var filterSubs = function() {
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

			// Search Subreddits
			var toggleSearchSubs = function(e) {
				if (e) e.preventDefault();
				$("#searchSubs").toggleClass("visible");
				$("#searchSubs").toggleClass("hidden");
				if ($("#searchSubs").hasClass("visible")) {
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
				$(".musicmenu .selection.menu .item.active").each(function(e, item) {
					var self = $(item);
					var active = self.hasClass("active");
					if (active) {
						Player.Music.trigger("menu-selection-clear", self);
						self.removeClass("active");
					}
				})
				Player.Music.trigger("update");
			})


		// MUSIC
			// Select Subreddit
			$(".musicmenu .selection.menu .item").click(function(e) {
				var self = $(this);
				var active = self.hasClass("active");
				if (active) {
					Player.Music.trigger("menu-selection-remove", self);
					self.removeClass("active");
				} else if (!active) {
					Player.Music.trigger("menu-selection-add", self);
					self.addClass("active");
				}
			})

		// Semantic UI
			// Radio & Music Tabs
			$("body .content.settings .item")
			.tab({
				useCSS: false,
				overlay: false,
				duration: 500,
				onTabLoad : function(tab) {
					console.log(tab)
				}
			});

			$("body .page-menu .item")
			.tab({
				useCSS: false,
				overlay: false,
				duration: 500,
				onTabLoad : function(tab) {
					if (tab == "music") {
						$(".page-menu .music-page").addClass("active");
						$(".page-menu .radio-page").removeClass("active");
						Player.trigger("channel", "Music");
					} else {
						$(".page-menu .radio-page").addClass("active");
						$(".page-menu .music-page").removeClass("active");
						Player.trigger("channel", "Radio");
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
					Player.trigger("update");
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
					Player.isPlaying = false;
					console.log("yt played ended");
					Player.Music.trigger("song-next");
					musicProgress.end();
				},
				onPlayerUnstarted: function() {
					Player.isPlaying = false;
					timeOut = window.setTimeout(function() {
						console.log("timed out");
						if (Player.isPlaying == false) {
							Player.trigger("next-btn");
						}
					}, 5000);
				},
				onPlayerPlaying: function() {
					$(".play-btn").addClass("stop");
					$(".play-btn").removeClass("play");
					Player.isPlaying = true;
					loadProgress.trigger("end");
					musicProgress.start();
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
				client_id: "e350357eef0347515be167f33dd3240d"
			});

			Player.Music.widget.bind(SC.Widget.Events.READY, function() {
				Player.Music.widget.bind(SC.Widget.Events.FINISH, function() {
					$(".play-btn").removeClass("stop");
					$(".play-btn").addClass("play");
					Player.isPlaying = false;
					console.log("sc played ended");
					Player.Music.trigger("song-next");
					musicProgress.end();
				})
				Player.Music.widget.bind(SC.Widget.Events.PLAY, function() {
					Player.Music.trigger("soundcloud-ready");
					$(".play-btn").addClass("stop");
					$(".play-btn").removeClass("play");
					loadProgress.trigger("end");
					Player.isPlaying = true;
					musicProgress.start();
					console.log("sc played playing");
				})
				Player.Music.widget.bind(SC.Widget.Events.ERROR, function() {
					console.log("errorwidget")
				})
				Player.Music.widget.bind(SC.Widget.Events.PLAY_PROGRESS, function(data) {
					Content.trigger("music-progress", "music", Player.currentSong, data);
				})
				Player.Music.widget.bind(SC.Widget.Events.LOAD_PROGRESS, function() {
					console.log("LOAD_PROGRESS")
				})
			})

		// Keyboard
			
			// Music Controls
				KeyboardJS.on("space", function() {
					Player.trigger("play-btn");
				})
				KeyboardJS.on("right", function() {
					Player.trigger("next-btn");
				})
				KeyboardJS.on("left", function() {
					Player.trigger("previous-btn");
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
			Player.on("song", function(channel, song) {
				if (channel === "radio") {
					console.log("Now Playing: " + song.title);
					$(".bottom.menu .radio.tab .title").html(song.title);
					$(".bottom.menu .radio.tab .artist").html(song.artist);
				} else if (channel === "music") {
					console.log("Now Playing: " + song.title);
					$(".bottom.menu .music.tab .title").html(song.title);
				}
				Content.trigger("new-song", channel, song);
			})

			// Music started playing
			Player.on("playing", function(view, isPlaying) {
				if (isPlaying) {
					//loadProgress.trigger("end");
					Content.trigger("music-progress", view, Player.currentSong);
				}
			})

			// New Playlist on the Radio
			Player.Radio.on("newsongs", function(songs) {
				Content.trigger("build", "radio playlist", songs, Player.currentSong);
			})
			// New Playlist on the Music / New Subreddits
			Player.Music.on("playlist", function(songs) {
				Content.trigger("build", "music playlist", songs, Player.currentSong);
			})

		// Progressbar

			musicProgress.element.click(function(e) {
				var maxWidth = musicProgress.element.outerWidth();
				var myWidth = e.clientX;
				console.log(Player.currentSong);
				if (Player.currentSong.origin == "soundcloud.com") {
					Player.Music.widget.getDuration(function(dur) {
						Player.Music.widget.seekTo((myWidth/maxWidth) * dur);
					})
				} else {
					var data = $("#youtube").tubeplayer("data");
					$("#youtube").tubeplayer("seek", (myWidth/maxWidth) * data.duration);
				}

				musicProgress.seek(myWidth/maxWidth * 100);
			})

			

		// Content
			Content.on("playlist-select", function(view, element, song) {
				if (!element.hasClass("active")) {
					loadProgress.trigger("start");
					Player.trigger("playlist-select", view, element, song);
				}
			})

			// Settings Defaults
				if (Options.get("sortMethod") == "top") {
					$(".ui.dropdown .item[data-value='"+Options.get("sortMethod")+":"+Options.get("topMethod")+"']").click();
				} else {
					$(".ui.dropdown .item[data-value='"+Options.get("sortMethod")+"']").click();
				}

				$(".still-loading").transition({
					animation: "slide up",
					duration: "100ms"
				});
})
