const {ipcMain} = require('electron')
const mcgit = require('./mcgit')

ipcMain.handle('git.clone', async (event, data) => {
  return mcgit.clone({
    dir: data.local,
    url: data.remote,
  })
})

ipcMain.handle('git.fetch', async (event, data) => {
  return mcgit.fetch({
    dir: data.local,
    url: data.remote,
  })
})

ipcMain.handle('git.update.force', async (event, data) => {
  return mcgit.updateHard({
    dir: data.local,
  })
})

ipcMain.handle('git.update', async (event, data) => {
  return mcgit.updateSoft({
    dir: data.local,
  })
})
