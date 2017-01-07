// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, BrowserWindow, globalShortcut } from 'electron';
import { devMenuTemplate } from './menu/dev_menu_template';
import { editMenuTemplate } from './menu/edit_menu_template';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

var mainWindow, keysWindow;

var setApplicationMenu = function () {
    var menus = [editMenuTemplate];
    if (env.name !== 'production') {
        menus.push(devMenuTemplate);
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    var userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

app.on('ready', function () {
    setApplicationMenu();

    mainWindow = createWindow('main', {
        width: 1024,
        height: 768,
        minWidth: 1024,
        minHeight: 768,
        webPreferences: {
            nodeIntegration: false
        }
    });

    mainWindow.loadURL('https://reddit.musicplayer.io/');

    let webContents = mainWindow.webContents

    if (env.name === 'development') {
        mainWindow.openDevTools();
    }

    globalShortcut.register('MediaNextTrack', () => {
        webContents.executeJavaScript("$('.item.forward.button').click()")
    })

    globalShortcut.register('MediaPreviousTrack', () => {
        webContents.executeJavaScript("$('.item.backward.button').click()")
    })

    globalShortcut.register('MediaStop', () => {
        webContents.executeJavaScript("$('.item.play.button').click()")
    })

    globalShortcut.register('MediaPlayPause', () => {
        webContents.executeJavaScript("$('.item.play.button').click()")
    })
});

app.on('window-all-closed', function () {
    app.quit();
});
