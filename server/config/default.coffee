express = require 'express'
passport = require 'passport'
jade = require 'jade'
RedditStrategy = require('passport-reddit').Strategy

# Configure Authentication
reddit = require './reddit'
passport.serializeUser (user, done) ->
    done null, user

passport.deserializeUser (obj, done) ->
    done null, obj

passport.use new RedditStrategy
    clientID: reddit.client_id
    clientSecret: reddit.secret
    callbackURL: reddit.redirect_uri
    scope: reddit.scope
    , (accessToken, refreshToken, profile, done) ->
        process.nextTick () ->
            done null, profile

module.exports = ->
    baseDir = @set 'baseDir'
    
    # The port the server should run on
    @set 'port', process.env.PORT || 4005
    
    @set 'view engine', 'jade'
    @set 'views', baseDir + '/src/jade'
        
    # Set the server's public directory
    @use express.static(baseDir + '/app')

    @use express.logger "dev"
    
    # Allow parsing of request bodies and '_method' parameters
    @use express.bodyParser()
    @use express.methodOverride()
    
    # Session
    @use express.cookieParser()
    @use express.session
        secret: "Reddit Music Player"
    
    # Authentication
    @use passport.initialize()
    @use passport.session()
    
    # Mount application routes
    @use @router