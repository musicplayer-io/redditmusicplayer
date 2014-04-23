
# Routes
module.exports = ->

    # Homepage / App
    main = require('./controller/main')
    @get '/', main.about
    @get '/about', main.about
    @get '/discover', main.discover
    @get '/browse', main.browse
    @get '/popular', main.popular
    @get '/playlist', main.playlist
    @get '/radio', main.radio

    # My Music
    music = require('./controller/music')
    @get '/devices', music.devices
    @get '/saved', music.saved
    @get '/recent', music.recent
    @get '/statistics', music.statistics
    @get '/settings', music.settings

    # Authentication
    authentication = require('./controller/authentication')
    @get '/login', authentication.login
    @get '/logout', authentication.logout
    @get '/me.json', authentication.me
    @get '/account', authentication.isAuthenticated, authentication.account
    @get '/auth/reddit', authentication.authenticate
    @get '/auth/reddit/callback', authentication.callback

    # API
    api = require('./controller/api')
    @post '/api/vote', api.isAuthenticated, api.vote
    @get '/api/comments', api.comments
    @post '/api/add_comment', api.isAuthenticated, api.add_comment