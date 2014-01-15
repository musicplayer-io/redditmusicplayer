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

var Bandcamp = {base: "http://api.bandcamp.com/api/", key: "snaefellsjokull"};
var SoundCloud = {base: "http://api.soundcloud.com/", key: "5441b373256bae7895d803c7c23e59d9"};

var OptionsModel = require("./options");

$.observable(window);

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

	var processMusic = function (r) {
		var playlist = [];
		var more = last.length > 0 ? true : false;
		var page = more ? "after=" + last + "&" : "";
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
	};

	window.addEventListener("message", function (e) {
		var data = e.data;
		data.type = "fetchMusic";
		var r = data.response;
		processMusic(r);
	});

	var fetchMusic = function (options) {
		var more = last.length > 0 ? true : false;
		var page = more ? "after=" + last + "&" : "";
		var topParams = options.sortMethod === "top" ? "sort=top&t=" + options.topMethod + "&" : "";
		var sandbox = document.getElementById("sandbox").contentWindow;
		sandbox.postMessage({"type": "fetchMusic", "url": "http://www.reddit.com/r/" + options.subreddits + "/" + options.sortMethod + "/.json?" + topParams + page + "jsonp=?"}, "*");
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