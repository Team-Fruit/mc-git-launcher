const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
  "api", {
    async action(channel, ...args) {
      return ipcRenderer.invoke("mcgit." + channel, ...args);
    },
  }
);
