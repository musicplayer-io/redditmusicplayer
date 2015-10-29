Util = require 'Util'



Song = Backbone.Model.extend
	type: 'none'
	playable: false
	initialize: () ->
		time = new Date()
		time.setTime parseInt(@get 'created_utc') * 1000
		@set 'created_ago', Util.timeSince time
		@set 'type', @type
		@set 'playable', @playable



SongYoutube = Song.extend
	type: 'youtube'
	playable: true



SongSoundcloud = Song.extend
	type: 'soundcloud'
	playable: true



SongBandcamp = Song.extend
	type: 'bandcamp'
	playable: true



SongMP3 = Song.extend
	type: 'mp3'
	playable: true



SongVimeo = Song.extend
	type: 'vimeo'
	playable: true



module.exports.Song = Song
module.exports.SongYoutube = SongYoutube
module.exports.SongSoundcloud = SongSoundcloud
module.exports.SongBandcamp = SongBandcamp
module.exports.SongMP3 = SongMP3
module.exports.SongVimeo = SongVimeo
