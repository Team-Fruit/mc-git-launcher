const {contextBridge, ipcRenderer} = require("electron");

contextBridge.exposeInMainWorld(
  "api", {
    async c_clone(data) { return ipcRenderer.invoke('c-clone', data) },
    async c_pull(data) { return ipcRenderer.invoke('c-pull', data) },
    async c_diff(data) { return ipcRenderer.invoke('c-diff', data) },
  }
);
