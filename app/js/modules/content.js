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