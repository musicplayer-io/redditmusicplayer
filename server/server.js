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

// Version manifest

var version = {
	win32: "0.2.2",
	osx: "0.2.2",
	linux: "0.2.2",
};

var events = require('events').EventEmitter;

var express = require('express');
var app = express();

var request = require('request');

// Configuration

var env = process.env.NODE_ENV || 'dev';

var __appdir = __dirname + "/../app";
if (env === "production") {
	__appdir = "/srv/node/redditmusicplayer/app";
}

var __serverdir = __dirname + "/../server";
if (env === "production") {
	__serverdir = "/srv/node/redditmusicplayer/server";
}

var __srcdir = __dirname + "/../src";
if (env === "production") {
	__srcdir = "/srv/node/redditmusicplayer/src";
}

app.use(express.compress());
if (env === "dev") {
	app.use(express.logger("dev"));
}

app.use("/css", express.static(__appdir + '/css'));
app.use("/img", express.static(__appdir + '/img'));
app.use("/img", express.static(__serverdir + '/img'));
app.use("/fonts", express.static(__appdir + '/fonts'));
app.use("/js", express.static(__appdir + '/js'));
app.set("views", __srcdir + "/jade");
app.engine('jade', require('jade').renderFile);

// Methods

var withSubreddits = function (req, res) {
	var subreddits = req.params.subreddit.split("+");
	var data = {subreddits: subreddits};
	if ("undefined" !== typeof(req.query.autoplay)) {
		data.autoplay = true;
	}
	res.render('player.jade', data);
};

var justIndex = function (req, res) {
	var data = {};
	if ("undefined" !== typeof(req.query.autoplay)) {
		data.autoplay = true;
	}
	res.render('player.jade', data);
};


var HomePage = function (req, res) {
	var ua = req.headers["user-agent"];
	var isWindowsString = /windows nt/i;
	var isWindows = isWindowsString.test(ua);
	var data = {
		isWindows: isWindows
	};
	res.render('homepage.jade', data);
};



function multiListener() {
	/*jshint validthis:true */
	events.call(this);
}

multiListener.super_ = events;
multiListener.prototype = Object.create(events.prototype, {
    constructor: {
        value: multiListener,
        enumerable: false
    }
});

multiListener.prototype.load = function (url) {
	var self = this;
	self.url = 'http://www.reddit.com/api/multi/' + url;
	self.subs = [];

	console.log("MULTI > ", self.url);

	request(self.url, function (error, response) {
		if (!error && response.statusCode === 200) {
			var data = JSON.parse(response.body).data.subreddits;
			for (var i = data.length - 1; i >= 0; i--) {
				self.subs.push(data[i].name);
			}
			self.emit("loaded", self.subs);
		} else {
			self.emit("failed", error, self.url);
		}
	});

	return self;
};

var loadedAll = function (subs, req, res) {
	var data = {subreddits: subs, pushState: false};
	if ("undefined" !== typeof(req.query.autoplay)) {
		data.autoplay = true;
	}
	res.render("player.jade", data);
};

var multiCache = {};

var multiReddit = function (req, res) {
	var url = req.url.split("+");
	url[0] = url[0].replace("/player/", "");
	if (!multiCache[req.url]) {
		var listener = new multiListener();
		var loadedNum = 0;
		var subs = [];

		var loadMulti = function (addSubs) {
			loadedNum = loadedNum + 1;
			subs = subs.concat(addSubs);
			multiCache[multi] = addSubs;
			if (url.length === loadedNum) {
				loadedAll(subs, req, res);
				multiCache[req.url] = subs;
			}
		};

		var failedMulti = function (err, url) {
			console.error(err, url);
			loadedNum = loadedNum + 1;
			if (url.length === loadedNum) {
				loadedAll(subs, req, res);
			}
		};

		for (var i = url.length - 1; i >= 0; i--) {
			var multi = url[i];
			if (!multiCache[multi]) {
				var load = listener.load(multi);
				load.once("loaded", loadMulti);
				load.once("failed", failedMulti);
			} else {
				console.log("cache hit", multi);
				loadedNum = loadedNum + 1;
				subs = subs.concat(multiCache[multi]);
				if (url.length === loadedNum) {
					loadedAll(subs, req, res);
				}
			}
		}	
	} else {
		console.log("cache hit", req.url);
		loadedAll(multiCache[req.url], req, res);
	}
};


var commentThread = function (req, res) {
	var comment = "r/" + req.params.subreddit + "/comments/" + req.params.commentid;
	var data = {comment: comment, pushState: false};
	if ("undefined" !== typeof(req.query.autoplay)) {
		data.autoplay = true;
	}
	res.render('player.jade', data);
};

var simpleRedirect = function (req, res) {
	console.log("redirect", req.originalUrl);
	res.redirect("/player" + req.originalUrl);
};

// Video

var videoPlayer = function (req, res) {
	res.render('video.jade');
};


// Routes

app.get("/", HomePage);
app.get(/^\/user\/(.+)/, simpleRedirect);
app.get("/r/:subreddit", simpleRedirect);
app.get("/r/:subreddit", simpleRedirect);
app.get("/r/:subreddit/comments/:commentid", simpleRedirect);
app.get("/r/:subreddit/comments/:commentid/:title", simpleRedirect);
app.get("/player", justIndex);
app.get("/player/r/:subreddit", withSubreddits);
app.get("/player/r/:subreddit", withSubreddits);
app.get("/player/r/:subreddit/comments/:commentid", commentThread);
app.get("/player/r/:subreddit/comments/:commentid/:title", commentThread);
app.get(/^\/player\/user\/(.+)/, multiReddit);

app.get("/video", videoPlayer);

app.get("/update.xml", function (req, res) {
	if (req.query.v && req.query.os) {
		res.send(200, {version: version[req.query.os]});
	} else {
		res.send(500, {error: "Invalid Request"});
	}
});


// Init
app.listen(4005);
console.log("listening on 4005");