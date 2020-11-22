import { app, BrowserWindow, Tray, globalShortcut } from 'electron'
import Positioner from 'electron-positioner'
import os from 'os'
import path from 'path'

if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow = null,
    tray = null

const winURL = process.env.NODE_ENV === 'development' ? `http://localhost:9080` : `file://${__dirname}/index.html`,
      platform = os.platform(),
      icons = {
          'win32': 'icon.ico',
          'darwin': '16x16.png'
      }

if (platform == 'darwin' && process.env.NODE_ENV !== 'development') app.dock.hide()

function createWindow() {
    mainWindow = new BrowserWindow({
        height: 563,
        useContentSize: true,
        width: 400,
        frame: false,
        resizable: true,
        skipTaskbar: true,
        show: false
    })

    mainWindow.loadURL(winURL)

    const positioner = new Positioner(mainWindow)

    if (platform == 'win32') {
        let position = positioner.calculate('trayBottomCenter', tray.getBounds())

        mainWindow.setPosition(position.x, position.y - 10)
    } else if (platform == 'darwin') {
        let position = positioner.calculate('trayCenter', tray.getBounds())

        mainWindow.setPosition(position.x, position.y + 10)
    }

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    mainWindow.on('blur', () => {
        mainWindow.hide()
    })
}

function createTray() {
    tray = new Tray(path.join(__static, icons[platform]))
    tray.setToolTip('Magic Control')

    tray.on('click', () => { toggleWindow() })
    tray.on('double-click', () => { toggleWindow() })
    tray.on('right-click', () => { toggleWindow() })
}

function toggleWindow() {
    if (mainWindow.isVisible()) {
        mainWindow.hide()
    } else {
        mainWindow.show()
        mainWindow.focus()
    }
}

app.on('ready', () => {
    createTray()
    createWindow()
})

app.on('will-quit', () => {
    globalShortcut.unregisterAll()
})

app.on('window-all-closed', () => {
    app.quit()
})
