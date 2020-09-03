const { app, BrowserWindow, ipcMain } = require('electron')
const { machineId } = require('node-machine-id')
const { spawn } = require('child_process')

let iterationDelay = 1000

async function createWindow() {
  const id = await machineId()

  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadFile('./app/index.html')
  mainWindow.on('closed', function() {
    mainWindow = null
  })
  let child_process

  ipcMain.on('start', () => {
    child_process = spawn(
      'node',
      ['./dist/index.js', '--iterationDelay', iterationDelay],
      {
        stdio: ['inherit', 'inherit', 'inherit', 'ipc']
      }
    )
  })
  ipcMain.on('stop', () => {
    child_process.kill('SIGINT')
  })
  ipcMain.on('changeSpeed', (event, delay) => {
    iterationDelay = delay
  })
}

app.on('ready', createWindow)
app.on('window-all-closed', function() {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function() {
  if (mainWindow === null) createWindow()
})
