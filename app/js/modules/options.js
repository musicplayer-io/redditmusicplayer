"use strict";

function simpleStorage() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	global.storage = {};

	self.getItem = function (key) {
		return global.storage[key];
	};
	self.setItem = function (key, value) {
		return global.storage[key] = value;
	};
	self.clear = function (key) {
		return delete global.storage[key];
	};
}

var defaults = {
	sortMethod: "hot",
	topMethod: "week",
	subreddits: []
};

function OptionsModel() {
	var self = this;

	self.local = global.window.localStorage || new simpleStorage();

	self.get = function (key) {
		return JSON.parse(self.local.getItem(key)) || defaults[key];
	};

	self.set = function (key, value) {
		console.log(key, value);
		return self.local.setItem(key, JSON.stringify(value));
	};

	self.clear = function (key) {
		return self.local.clear(key);
	};

	$.observable(self);
}

module.exports = OptionsModel;