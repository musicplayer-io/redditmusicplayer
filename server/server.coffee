
# Configure Server
app = require('express')()

app.set 'baseDir', __dirname + '/..'

require('./config/default').call app
require('./config/development').call app if app.get "env" is "development"
require('./config/production').call app if app.get "env" is "production"

# Set Up Routes
require('./routes').call app

# Listen in
http = require('http').Server(app)
http.listen app.get('port'), () ->
  console.log('Express server listening on port ' + app.get('port'))

# Socket IO
io = require('socket.io') http
require("./sockets") io

module.exports = app

credentials = require("./config/credentials")
secure_server = require("https").Server credentials, app
secure_server.listen 4009