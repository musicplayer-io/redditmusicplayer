
fs = require 'fs'

privateKey = fs.readFileSync(__dirname + '/keys/ssl.key')
certificate = fs.readFileSync(__dirname + '/keys/ssl.cert')
credentials = 
	key: privateKey
	cert: certificate

module.exports = credentials