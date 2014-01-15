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