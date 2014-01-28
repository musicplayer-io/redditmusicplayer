//     Reddit Music Player
//     Copyright (C) 2014  Ilias Ismanalijev

//     This program is free software: you can redistribute it and/or modify
//     it under the terms of the GNU Affero General Public License as
//     published by the Free Software Foundation, either version 3 of the
//     License, or (at your option) any later version.

//     This program is distributed in the hope that it will be useful,
//     but WITHOUT ANY WARRANTY; without even the implied warranty of
//     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//     GNU Affero General Public License for more details.

//     You should have received a copy of the GNU Affero General Public License
//     along with this program.  If not, see http://www.gnu.org/licenses/

"use strict";

var ERRORS = {
	CALLBACKUNDEFINED: function (object) {
		this.message = "Callback not defined";
		this.name = "CallbackUndefined";
		this.object = object;
	},
	KEYUNDEFINED: function (object) {
		this.message = "Key not defined";
		this.name = "KeyUndefined";
		this.object = object;
	},
	NOTANOBJECT: function (object) {
		this.message = "Items is not an Object";
		this.name = "NotAnObject";
		this.object = object;
	}
};

// Polyfill
if (!Object.keys) {
	Object.keys = function (o) {
		if (o !== Object(o)) {
			throw new TypeError('Object.keys called on a non-object');
		}
		var k = [], p;
		for (p in o) {
			if (Object.prototype.hasOwnProperty.call(o, p)) {
				k.push(p);
			}
		}
		return k;
	};
}

function chromeStorage() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	self.getItem = function (key, callback) {
		console.log(key);
		chrome.storage.sync.get(key, callback);
	};
	self.setItem = function (items, callback) {
		return chrome.storage.sync.set(items, callback);
	};
	self.clear = function (key, callback) {
		chrome.storage.sync.remove(key, callback);
	};
}

function simpleStorage() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	self.storage = {};

	var getArray = function (arr) {
		var keys = {};
		for (var i = arr.length - 1; i >= 0; i--) {
			keys[arr[i]] = JSON.parse(self.storage[arr[i]]);
		}
		return keys;
	};

	self.getItem = function (key, callback) {
		if ("undefined" === typeof(callback)) {
			throw new ERRORS.CALLBACKUNDEFINED({key: key, callback: callback});
		}
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so get all the keys in the array
			// Returns an object
			callback(getArray(key));
		} else {
			// Not an array, just a string
			callback(getArray([key]));
		}
	};
	self.setItem = function (items, callback) {
		if (typeof({}) === typeof(items)) {
			// Set each item
			for (var i = Object.keys(items).length - 1; i >= 0; i--) {
				var key = Object.keys(items)[i];
				var value = items[key];
				self.storage[key] = JSON.stringify(value);
			}
			if ("undefined" !== typeof(callback)) {
				callback();
			}
		} else {
			throw new ERRORS.NOTANOBJECT({items: items});
		}
	};
	self.clear = function (key, callback) {
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so clear all the keys in the array
			// Returns an object
			for (var i = key.length - 1; i >= 0; i--) {
				delete self.storage[key[i]];
			}
		} else {
			// Not an array, just a string
			delete self.storage[key];
		}
		if ("undefined" !== typeof(callback)) {
			callback();
		}
	};
}

function localStorageHelper() {
	/*jshint validthis: true */
	var self = this;

	$.observable(self);

	if ("undefined" === typeof(localStorage)) {
		self.local = global.window.localStorage;
	} else {
		self.local = localStorage || global.window.localStorage;
	}


	var getArray = function (arr) {
		var keys = {};
		for (var i = arr.length - 1; i >= 0; i--) {
			keys[arr[i]] = JSON.parse(self.local.getItem(arr[i]));
		}
		return keys;
	};

	self.getItem = function (key, callback) {
		if ("undefined" === typeof(callback)) {
			throw new ERRORS.CALLBACKUNDEFINED({key: key, callback: callback});
		}
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so get all the keys in the array
			// Returns an object
			callback(getArray(key));
		} else {
			// Not an array, just a string
			callback(getArray([key]));
		}
	};
	self.setItem = function (items, callback) {
		if (typeof({}) === typeof(items)) {
			// Set each item
			for (var i = Object.keys(items).length - 1; i >= 0; i--) {
				var key = Object.keys(items)[i];
				var value = items[key];
				self.local.setItem(key, JSON.stringify(value));
			}
			if ("undefined" !== typeof(callback)) {
				callback();
			}
		} else {
			throw new ERRORS.NOTANOBJECT({items: items});
		}
	};
	self.clear = function (key, callback) {
		if ("undefined" === typeof(key)) {
			throw new ERRORS.KEYUNDEFINED({key: key, callback: callback});
		}
		if (typeof([]) === typeof(key)) {
			// Array, so clear all the keys in the array
			// Returns an object
			for (var i = key.length - 1; i >= 0; i--) {
				self.local.clear(key[i]);
			}
		} else {
			// Not an array, just a string
			self.local.clear(key);
		}
		if ("undefined" !== typeof(callback)) {
			callback();
		}
	};
}


function OptionsModel() {
	var self = this;

	/*global chrome:true */

	var isChrome = false;
	if ("undefined" !== typeof(chrome)) {
		if ("undefined" !== typeof(chrome.storage)) {
			isChrome = true;
			console.log("OPTIONS > Using Chrome");
			self.local = new chromeStorage();
		}
	}
	if (!isChrome) {
		if ("undefined" !== typeof(window.localStorage) || "undefined" !== typeof(global.window.localStorage)) {
			console.log("OPTIONS > Using localStorage");
			self.local = new localStorageHelper();
		} else {
			console.log("OPTIONS > Using Fallback");
			self.local = new simpleStorage();
		}
	}

	self.get = function (items, callback) {
		console.log("OPTIONS > Get", items);
		try {
			self.local.getItem(items, callback);
		} catch (e) {
			console.error(e.name, e.message, e.object);
		}
	};

	self.set = function (items, callback) {
		console.log("OPTIONS > Set", items);
		try {
			self.local.setItem(items, callback);
		} catch (e) {
			console.error(e.name, e.message, e.object);
		}
	};

	self.clear = function (items, callback) {
		try {
			self.local.clear(items, callback);
		} catch (e) {
			console.error(e.name, e.message, e.object);
		}
	};

	// Set defaults
	var defaults = {
		sortMethod: "hot",
		topMethod: "week",
		subreddits: []
	};

	self.get(["sortMethod", "topMethod", "subreddits"], function (items) {
		if (items.topMethod === null || "undefined" === typeof(items.topMethod)) {
			self.set({topMethod: defaults.topMethod});
		}
		if (items.sortMethod === null || "undefined" === typeof(items.sortMethod)) {
			self.set({sortMethod: defaults.sortMethod});
		}
		if (items.subreddits === null || "undefined" === typeof(items.subreddits)) {
			self.set({subreddits: []});
		}
	});

	$.observable(self);
}

module.exports = OptionsModel;