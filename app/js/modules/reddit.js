var Bandcamp = {base: "http://api.bandcamp.com/api/", key: "snaefellsjokull"};
var SoundCloud = {base: "http://api.soundcloud.com/", key: "e350357eef0347515be167f33dd3240d"};

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