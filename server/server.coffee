
# Configure Server
app = require('express')()
pkg = require '../package.json'
app.set 'baseDir', __dirname + '/..'
app.locals.pkg = pkg

require('./config/default').call app
require('./config/development').call app if app.get "env" is "development"
require('./config/production').call app if app.get "env" is "production"

# Set Up Routes
require('./routes').call app

# Listen in
http = require('http').Server(app)
http.listen app.get('port'), () ->
  wht = `'\033[1;37m'`
  blu = `'\033[1;34m'`
  ylw = `'\033[1;33m'`
  grn = `'\033[1;32m'`
  red = `'\033[1;31m'`
  rst = `'\033[0m'`
  console.log """
              #{grn}♪ #{blu}♫    #{grn}♪ #{blu}♫  #{grn}♪ #{blu}♫    #{grn}♪ #{blu}♫  #{grn}♪ #{rst}  
             #{red}♫ #{blu}♪ #{ylw}♫ #{rst} #{wht} Music Player #{rst} #{red}♫ #{blu}♪ #{ylw}♫ #{rst}
     __    ------------------------------
    |--|   Port         #{blu}#{app.get('port')} #{rst}
    |  |   Version      #{blu}#{pkg.version} #{rst}
   () ()   Environment  #{blu}#{app.get "env"} #{rst}
           Author       #{blu}#{pkg.author} #{rst}
  """
  
# Socket IO
io = require('socket.io') http
require("./sockets") io


module.exports = app