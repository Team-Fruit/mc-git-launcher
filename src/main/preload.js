const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
  "api", {
    async action(channel, ...args) {
      return ipcRenderer.invoke('mcgit.' + channel, ...args);
    },
    on(channel, func) {
      return ipcRenderer.on('mcgit.' + channel, func);
    }
  }
);
