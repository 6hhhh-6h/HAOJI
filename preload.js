const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('neonStore', {
  get: (key) => ipcRenderer.sendSync('store:get', key),
  set: (key, value) => ipcRenderer.sendSync('store:set', key, value),
  remove: (key) => ipcRenderer.sendSync('store:remove', key)
});

contextBridge.exposeInMainWorld('neonSecret', {
  get: (key) => ipcRenderer.invoke('secret:get', key),
  set: (key, value) => ipcRenderer.invoke('secret:set', key, value)
});