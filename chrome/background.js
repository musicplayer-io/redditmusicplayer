"use strict";
/*global chrome:true */

chrome.app.runtime.onLaunched.addListener(function () {
	chrome.app.window.create('main.html', {
		frame: "none",
		bounds: {
			width: 800,
			height: 600
		},
		minWidth: 600,
		minHeight: 220
	});
});