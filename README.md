
# Music Player for Reddit

A free and open-source streaming music web player using data from Reddit.

[Music Player for Reddit Website](http://reddit.music.player.il.ly/)

# Contributing

## Installation from source

```
$ git clone https://github.com/Illyism/redditmusicplayer.git
$ cd redditmusicplayer
$ npm install
$ cd server
$ npm install

$ cp config/reddit.coffee.sample config/reddit.coffee
$ cd ..

$ cp src/coffee/config.coffee.sample src/coffee/config.coffee
# edit src/coffee/config.coffee

// In development
$ grunt
$ npm start

// In production
$ grunt build
$ NODE_ENV=production npm start

```

## Authentication

You'll need a [Reddit](#reddit) API key for this to work.
As well as a running [redis-server](http://redis.io/topics/quickstart) on port 6379.


## Getting API keys

#### SoundCloud

[SoundCloud API key](http://soundcloud.com/you/apps/new).
Then edit it in `src/coffee/config.coffee`.

#### Reddit

[Get the API key](https://www.reddit.com/prefs/apps/) - Only required for authentication.
You can set an API key for development and production seperately in `server/config.reddit.coffee`.


# License

[GPLv3](LICENSE.md) © 2014-2015 Ilias Ismanalijev