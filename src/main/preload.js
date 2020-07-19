const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
  "api", {
    async git(channel, ...args) {
      return ipcRenderer.invoke("git." + channel, ...args);
    }
  }
);
