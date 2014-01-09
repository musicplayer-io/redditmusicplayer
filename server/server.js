"use strict";

var version = {
	win32: 0.1,
	osx: 0.1,
	linux: 0.1
};

var express = require('express');
var app = express();

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

app.get("/", function (req, res) {
	res.render('server.jade');
});

app.get("/update.xml", function (req, res) {
	if (req.query.v && req.query.os) {
		res.send(200, {version: version[req.query.os]});
	} else {
		res.send(500, {error: "Invalid Request"});
	}
});

app.listen(4005);
console.log("listening on 4005");