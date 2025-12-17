const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
let keytar;
try { keytar = require('keytar'); } catch (_) { keytar = null; }

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

ipcMain.handle('secret:get', async (_event, key) => {
  if (!keytar) return null;
  try { return await keytar.getPassword('Haoji', key); } catch (_) { return null; }
});
ipcMain.handle('secret:set', async (_event, key, value) => {
  if (!keytar) return false;
  try { await keytar.setPassword('Haoji', key, value || ''); return true; } catch (_) { return false; }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});