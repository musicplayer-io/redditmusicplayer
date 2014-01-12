"use strict";

if (global) {
	global.$ = $;
}

// Model Dependencies
var gui = require("nw.gui");
var WindowModel = require("./js/modules/window");

$(function () {
	// Init
		var musicWindow = new WindowModel(gui);

		if (process.platform === "win32") {
			console.log(process.platform);
			$(".windows-only").addClass("iswindows");
			$(".windows-hidden").addClass("iswindows");
		} else {
			console.log(process.platform);
			$(".windows-only").addClass("notwindows");
			$(".windows-hidden").addClass("notwindows");
		}

	//Native Window Controls
		// Close
		$(".native .close.button").click(function () {
			musicWindow.close();
		});
		$(".native.windows-only.close").on("click", function () {
			musicWindow.close();
		});

		// Minimize
		$(".native .minimize.button").click(function () {
			musicWindow.minimize();
		});

		// Maximize
		$(".native .maximize.button").click(function () {
			musicWindow.maximize();
		});

	// Window
		var Keyboard = window.KeyboardJS || global.KeyboardJS;
		Keyboard.on('ctrl+w', function () {
		    musicWindow.close();
		});
		Keyboard.on('ctrl+shift+w', function () {
		    gui.App.closeAllWindows();
		});
		Keyboard.on("ctrl+q", function () {
			gui.App.quit();
		});

	//Links
		Keyboard.on("f1", function () {
			gui.Shell.openExternal("http://reddit.music.player.il.ly");
		});
		Keyboard.on("f12", function () {
			musicWindow.window.showDevTools();
		});

	// Window
		// Window Focus
		musicWindow.window.on('focus', function () {
			$(".ui.menu.top .native").addClass("active");
		});

		// Window Blur
		musicWindow.window.on('blur', function () {
			$(".ui.menu.top .native").removeClass("active");
		});
	});

// Flash
if (process) {
	try {
	    var path = require('path');
	    var flashTrust = require('nw-flash-trust');
	    var appName = 'redditmusicplayer';

	    var trustManager = flashTrust.initSync(appName);
	    var appPath = path.dirname(process.execPath);
	    trustManager.add(process.cwd());
	    trustManager.add(appPath);
	    trustManager.add('s.ytimg.com');
	    trustManager.add('ytimg.com');
	    trustManager.add('youtube.com');
	    trustManager.add('www.youtube.com');
	    trustManager.add('soundcloud.com');
	    trustManager.add('player.soundcloud.com');
	    trustManager.add('*.soundcloud.com');
	    trustManager.add('http://player.soundcloud.com/player.swf');
	} catch (err) {
		console.error(err);
	}	
}
