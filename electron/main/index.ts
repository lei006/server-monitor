import { app, BrowserWindow, shell, ipcMain } from 'electron'
import { release } from 'node:os'
import { join } from 'node:path'


import ModWinMain from './mod_winmain'
import ModTray from './mod_tray'
import ModMqttServer from './mod_mqttserver'


/*
import { Start }  from 'test.js'
child.Start();
*/

// The built directory structure
//
// ├─┬ dist-electron
// │ ├─┬ main
// │ │ └── index.js    > Electron-Main
// │ └─┬ preload
// │   └── index.js    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = join(__dirname, '..')
process.env.DIST = join(process.env.DIST_ELECTRON, '../dist')
process.env.PUBLIC = process.env.VITE_DEV_SERVER_URL
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'


// Here, you can also use other preload
const preload = join(__dirname, '../preload/index.js')
let url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST, 'index.html')

let mqtt_port = 1883;


async function createWindow() {

  


  let mainWindow = ModWinMain.Start(url);

  if (process.env.VITE_DEV_SERVER_URL) { // electron-vite-vue#298
    mainWindow.loadURL(url)
  } else {
    mainWindow.loadFile(indexHtml)
  }
  
  mainWindow.webContents.openDevTools()

  ModTray.Start(mainWindow);

  ModMqttServer.Start(mqtt_port);

  console.log("app path:", app.getAppPath());

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  app.quit()
})



app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})
