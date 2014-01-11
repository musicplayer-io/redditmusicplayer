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
		KeyboardJS.on("ctrl+x", function(e) {
			self.trigger("clearSubs", e);
		})

		KeyboardJS.on("ctrl+e", function(e) {
			self.trigger("toggleActiveSubs", e);
		})

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