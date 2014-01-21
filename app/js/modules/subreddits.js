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