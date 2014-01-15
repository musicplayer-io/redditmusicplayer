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

// Window
function WindowModel(gui) {
	var self = this;

	self.gui = gui || require("nw.gui");
	self.window = self.gui.Window.get();

	self.window.setMinimumSize(560, 300);

	$.observable(self);

	var buildMacWindowMenu = function () {
		var menu = new self.gui.MenuItem({label: 'Player'});
		menu.submenu = new self.gui.Menu();
		var menuItem = new self.gui.MenuItem({label: 'Zoom'});
		menuItem.click = function () {
			self.gui.Window.get().maximize();
		};
		menu.submenu.append(menuItem);
		return menu;
	};

	self.close = function () {
		self.window.close();
	};
	self.minimize = function () {
		self.window.minimize();
	};
	self.isMaximized = false;
	self.maximize = function () {
		if (self.isMaximized) {
			self.window.unmaximize();	
			self.isMaximized = false;
		} else {
			self.window.maximize();
			self.isMaximized = true;
		}
		
	};

	self.menubar = new self.gui.Menu({type: 'menubar'});
	self.menubar.append(buildMacWindowMenu());
	//self.window.menu = self.menubar;
}

module.exports = WindowModel;