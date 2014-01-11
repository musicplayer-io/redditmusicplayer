
# Reddit Music Player

Music listening for reddit.

[Reddit Music Player is available here!](http://reddit.music.player.il.ly/)

---

Module | Status
--- | --- | ---
**Global Version** | 0.1.2
**Website** |  [reddit.music.player.il.ly](http://reddit.music.player.il.ly)
**Chrome App** | Next Up
**Github** | Coming Soon
**Windows 8** | In The Future

---

# Contributing

You need node installed and running. To run the server you need to build the packages using grunt.
Here are the grunt tasks you can run using grunt-cli.

* **grunt**: Default - jshint, jade, less, livereload
* **grunt server**: Server - jshint, less, browserify, livreload
* **grunt build**: Building for node-webkit - jshint, less, jade, browserify
* **grunt chrome --force**: Build for Chrome Apps - jshint, less, jade, browserify, build for chrome

Your files need to be validated by jshint.
You can run the server by **npm start**.