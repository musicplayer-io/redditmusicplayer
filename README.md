
<h1 align="center">
  <br>
  <a href="http://reddit.musicplayer.io" title="reddit.musicplayer.io">
  <img width="650" src="https://cloud.githubusercontent.com/assets/304283/8148060/19b85c3c-1279-11e5-9004-7dda6ee8f7d7.png" alt="music player for reddit">
  </a>
  <br>
  <br>
</h1>

> A free and open-source streaming music web player using data from Reddit.


# Contributing

## Installation from source

```
$ git clone https://github.com/musicplayer-io/redditmusicplayer.git
$ cd redditmusicplayer
$ npm install

$ cp server/config/reddit.coffee.sample server/config/reddit.coffee
# edit server/config/reddit.coffee

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
You can set an API key for development and production separately in `server/config.reddit.coffee`.


# License

[GPLv3](LICENSE.md) © 2014-2015 Ilias Ismanalijev
