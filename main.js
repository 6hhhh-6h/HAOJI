const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

function storeFilePath() {
  return path.join(app.getPath('userData'), 'neon-notes.json');
}

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(storeFilePath(), 'utf-8'));
  } catch (_) {
    return {};
  }
}

function writeStore(obj) {
  fs.writeFileSync(storeFilePath(), JSON.stringify(obj));
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.loadFile('neon_notes.html');
}

ipcMain.on('store:get', (event, key) => {
  const data = readStore();
  event.returnValue = data[key] || null;
});

ipcMain.on('store:set', (event, key, value) => {
  const data = readStore();
  data[key] = value;
  writeStore(data);
  event.returnValue = true;
});

ipcMain.on('store:remove', (event, key) => {
  const data = readStore();
  delete data[key];
  writeStore(data);
  event.returnValue = true;
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});