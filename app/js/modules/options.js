

function simpleStorage() {
	var self = this;

	global.storage = {};

	self.getItem = function(key) {
		return global.storage[key];
	}
	self.setItem = function(key, value) {
		return global.storage[key] = value;
	}
	self.clear = function(key) {
		return delete global.storage[key];
	}
}

var defaults = {
	sortMethod: "hot",
	topMethod: "week",
	subreddits: []
}

function OptionsModel() {
	var self = this;

	self.subreddits = ["crustpunk","grunge","melodicmetal","postrock","punk","Punkskahardcore","ska","stonerrock","atmosphericdnb","bassheavy","breakbeat","breakcore","brostep","chillstep","chiptunes","classic_beats","complextro","darkstep","deephouse","dnb","dubstep","drumstep","electro","ElectronicJazz","electronicmusic","electrohouse","electropop","electroswing","fidget","footwork","frenchhouse","funkhouse","futurebeats","futurefunkairlines","futuregarage","futurepopmusic","glitch","glitchop","grime","happyhardcore","hardstyle","hardtek","house","idm","juke","jumpup","latinhouse","liquiddnb","minimaltech","moombahton","NeuroFunk","nudisco","proghouse","progressivetrance","psytrance","purplemusic","raggajungle","realdubstep","skweee","techno","tech_house","techstep","trance","trap","triphop","blues","DeepFunk","funk","FunkSouMusic","jazz","soul","soulies","altrap","hiphopheads","makinghiphop","nerdcore","rap","80sMusic","ambientmusic","asmr","AvantGardeMusic","calireggae","chillmusic","chillwave","classicalmusic","coversongs","Cyberpunk_Music","dub","djmixes","EcouteCa","freemusic","frisson","gamemusic","icm","industrialmusic","ipm","jazznoir","koreanmusic","liftingmusic","listentothis","listentous","minimal","mlptunes","motivatedmusic","music","musiccritics","musicnews","MusicVideosOnYouTube","orchestra","partymusic","queercore","redditmusicclub","reggae","reggaeton","RepublicOfMusic","rootsreggae","rhythmicnoise","soundtracks","SoundsVintage","soulof","SpaceMusic"];

	if (!localStorage) var localStorage = global.window.localStorage || new simpleStorage();
	self.local = localStorage;

	self.get = function(key) {
		return JSON.parse(self.local.getItem(key)) || defaults[key];
	}

	self.set = function(key, value) {
		console.log(key, value);
		return self.local.setItem(key, JSON.stringify(value));
	}

	self.clear = function(key) {
		return self.local.clear(key);
	}

	$.observable(self);
}

module.exports = OptionsModel;