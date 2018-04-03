
<h1 align="center">
  <br>
  <a href="http://reddit.musicplayer.io" title="reddit.musicplayer.io">
  <img width="650" src="https://cloud.githubusercontent.com/assets/304283/8148060/19b85c3c-1279-11e5-9004-7dda6ee8f7d7.png" alt="music player for reddit">
  </a>
  <br>
  <br>
</h1>

[![Backers on Open Collective](https://opencollective.com/musicplayer/backers/badge.svg)](#backers)
 [![Sponsors on Open Collective](https://opencollective.com/musicplayer/sponsors/badge.svg)](#sponsors) 

> A free and open-source streaming music web player using data from Reddit.


# Contributing

[![Greenkeeper badge](https://badges.greenkeeper.io/musicplayer-io/redditmusicplayer.svg)](https://greenkeeper.io/)

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


## Contributors

This project exists thanks to all the people who contribute. [[Contribute](CONTRIBUTING.md)].
<a href="graphs/contributors"><img src="https://opencollective.com/musicplayer/contributors.svg?width=890&button=false" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/musicplayer#backer)]

<a href="https://opencollective.com/musicplayer#backers" target="_blank"><img src="https://opencollective.com/musicplayer/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/musicplayer#sponsor)]

<a href="https://opencollective.com/musicplayer/sponsor/0/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/1/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/2/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/3/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/4/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/5/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/6/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/7/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/8/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/musicplayer/sponsor/9/website" target="_blank"><img src="https://opencollective.com/musicplayer/sponsor/9/avatar.svg"></a>



# License

[GPLv3](LICENSE.md) © 2014-2015 Ilias Ismanalijev
