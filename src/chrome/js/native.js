"use strict";
/*global chrome:true */

$(function () {
	// Init
		var musicWindow = window;
		$.observable(musicWindow);

		if (navigator.platform === "win32") {
			console.log(navigator.platform);
			$(".windows-only").addClass("iswindows");
			$(".windows-hidden").addClass("iswindows");
		} else {
			console.log(navigator.platform);
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

	// Window
		// Window Focus
		musicWindow.on('focus', function () {
			$(".ui.menu.top .native").addClass("active");
		});

		// Window Blur
		musicWindow.on('blur', function () {
			$(".ui.menu.top .native").removeClass("active");
		});
	});