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