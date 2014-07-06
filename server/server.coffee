express = require 'express'
https = require 'https'
credentials = require("./config/credentials")

# Configure Server
server = express()
http = require('http').Server(server)
io = require('socket.io')(http)
server.set 'baseDir', __dirname + '/..'

require('./config/default').call server
require('./config/development').call server if server.get "env" is "development"
require('./config/production').call server if server.get "env" is "production"

# Set Up Routes
require('./routes').call server

secure_server = https.createServer credentials, server
server.listen server.set('port')
secure_server.listen 4009

console.log 'Server running...'
console.log '  > Listening on port %d in %s mode', server.set('port'), server.settings.env

module.exports = server