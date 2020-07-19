const {ipcMain} = require("electron");

ipcMain.handle('sushi', async (event, data) => {
  return data.toUpperCase()
})
