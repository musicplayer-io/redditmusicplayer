"use strict";

// Version manifest

var version = {
	win32: "0.1.2",
	osx: "0.1.2",
	linux: "0.1.2",
};

var events = require('events').EventEmitter;

var express = require('express');
var app = express();

var request = require('request');
var cheerio = require('cheerio');

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
	res.render('server.jade', data);
};

var justIndex = function (req, res) {
	var data = {};
	if ("undefined" !== typeof(req.query.autoplay)) {
		data.autoplay = true;
	}
	res.render('server.jade', data);
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
	self.url = 'http://www.reddit.com/' + url;
	self.subs = [];

	request(self.url, function (error, response, html) {
		if (!error && response.statusCode === 200) {
			var $ = cheerio.load(html);
			$(".side .subreddits a").each(function (i, element) {
				self.subs.push(element.attribs.href.substr(3));
			});
			self.emit("loaded", self.subs);
		} else {
			self.emit("failed", error, self.url);
		}
	});

	return self;
};

var loadedAll = function (subs, req, res) {
	console.log(subs.length);
	var data = {subreddits: subs, pushState: false};
	if ("undefined" !== typeof(req.query.autoplay)) {
		data.autoplay = true;
	}
	res.render("server.jade", data);
};

var multiCache = {};

var multiReddit = function (req, res) {
	var url = req.url.split("+");
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
	res.render('server.jade', data);
};

// Routes

app.get("/", justIndex);
app.get("/r/:subreddit", withSubreddits);
app.get("/r/:subreddit/comments/:commentid", commentThread);
app.get("/r/:subreddit/comments/:commentid/:title", commentThread);
app.get("/player", justIndex);
app.get("/player/r/:subreddit", withSubreddits);

app.get(/^\/user\/(.+)/, multiReddit);

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