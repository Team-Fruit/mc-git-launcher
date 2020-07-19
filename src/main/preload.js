const {contextBridge, ipcRenderer} = require("electron");
contextBridge.exposeInMainWorld(
  "api", {
    sushi: async (...args) => ipcRenderer.invoke('sushi', ...args)
  }
);
