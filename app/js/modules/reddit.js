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
					time.setTime(parseInt(post.created) * 1000);
					post.created = timeSince(time);
					var data = {"author": post.author, "subreddit": post.subreddit, "ups": post.ups, "downs": post.downs, "created": post.created, "name": post.name, "reddit": "http://reddit.com" + post.permalink, "score": post.score, "origin": media.type };
					
					switch (media.type) {
						case "bandcamp.com":
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
							var track = media.oembed;
							if (more) {
								self.trigger("playlist-add", $.extend({title: track.title, file: track.url}, data));
							} else {
								playlist.push($.extend({title: track.title, file: track.url}, data));
								self.trigger("playlist-update", playlist);
							}
							break;

						case "soundcloud.com":
							var track_id = decodeURI(media.oembed.html).match(/\/tracks\/(\d+)/);
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
					}
				}
			});
			console.log("REDDIT > Songs:", playlist.length);
		});
	};

	self.addSubReddit = function (value) {
		self.subreddits.push(value);
		Options.set("subreddits", self.subreddits);
	};

	self.removeSubReddit = function (value) {
		var index = self.subreddits.indexOf(value);
		self.subreddits.splice(index, 1);
		Options.set("subreddits", self.subreddits);
	};

	self.getSubRedditList = function () {
		var stateObj = { subreddits: self.subreddits };
		history.replaceState(stateObj, "Reddit Music Player", "/r/" + self.subreddits.join("+"));
		return self.subreddits.join("+");
	};

	self.on("update", function () {
		if (self.subreddits.length >= 1) {
			last = "";
			fetchMusic(self.getSubRedditList(self.subreddits));
		} else {
			var stateObj = { subreddits: self.subreddits };
			history.replaceState(stateObj, "Reddit Music Player", "/");
		}
	});

	self.on("more", function (lastId) {
		last = lastId;
		fetchMusic(self.getSubRedditList(self.subreddits));
	});
}


module.exports = RedditModel;