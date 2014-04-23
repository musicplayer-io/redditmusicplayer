express = require 'express'

# Configure Server
server = express()
server.set 'baseDir', __dirname + '/..'
server.configure require('./config/default')
server.configure 'development', require('./config/development')
server.configure 'production', require('./config/production')

# Set Up Routes
require('./routes').call server

server.listen server.set('port')

console.log 'Server running...'
console.log '  > Listening on port %d in %s mode', server.set('port'), server.settings.env

module.exports = server