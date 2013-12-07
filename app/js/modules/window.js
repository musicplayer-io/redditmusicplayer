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
		}
		menu.submenu.append(menuItem);
		return menu;
	}

	self.close = function() {self.window.close()};
	self.minimize = function() {self.window.minimize()};
	self.isMaximized = false;
	self.maximize = function() {
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