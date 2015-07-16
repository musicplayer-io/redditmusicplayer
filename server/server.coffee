yaml = require "js-yaml"
path = require "path"
fs = require "fs"
_ = require "lodash"
pkg = require "../package.json"

# Configure Server
app = require("express")()
app.set "baseDir", __dirname + "/.."

require("./config/default").call app
require("./config/development").call app if app.get "env" is "development"
require("./config/production").call app if app.get "env" is "production"

# Configure Views
app.locals.pkg = pkg
app.locals._ = _
app.locals.subs = yaml.safeLoad fs.readFileSync(path.join(__dirname, "..", "/subreddits.yaml"), "utf8")

# Set Up Routes
require("./routes").call app

# Listen in
http = require("http").Server(app)
http.listen app.get("port"), () ->
	wht = `"\033[1;37m"`
	blu = `"\033[1;34m"`
	ylw = `"\033[1;33m"`
	grn = `"\033[1;32m"`
	red = `"\033[1;31m"`
	rst = `"\033[0m"`
	subs = app.locals.subs
	console.log """
	           #{grn}♪ #{blu}♫    #{grn}♪ #{blu}♫  #{grn}♪ #{blu}♫    #{grn}♪ #{blu}♫  #{grn}♪ #{rst}
	         #{red}♫ #{blu}♪ #{ylw}♫ #{rst} #{wht} Music Player #{rst} #{red}♫ #{blu}♪ #{ylw}♫ #{rst}
	  __    ------------------------------
	 |--|   Port         #{blu}#{app.get("port")} #{rst}
	 |  |   Version      #{blu}#{pkg.version} #{rst}
	() ()   Environment  #{blu}#{app.get "env"} #{rst}
	        Subreddits   #{blu}#{subs.length} #{rst}
	"""

# Socket IO
io = require("socket.io") http
require("./sockets") io
require("./sockets").routes.call app


module.exports = app
