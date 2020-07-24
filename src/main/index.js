const {ipcMain} = require('electron')
const path = require('path')
const mcgit = require('./mcgit')
const {Client, Authenticator} = require('minecraft-launcher-core');
const launcher = new Client();

ipcMain.handle('mcgit.clone', async (event, data) => {
  return mcgit.clone({
    dir: data.local,
    url: data.remote,
    ours: 'master',
  })
})

ipcMain.handle('mcgit.fetch', async (event, data) => {
  return mcgit.fetch({
    dir: data.local,
    url: data.remote,
    ours: 'master',
  })
})

ipcMain.handle('mcgit.update.force', async (event, data) => {
  return mcgit.updateHard({
    dir: data.local,
    ours: 'master',
  })
})

ipcMain.handle('mcgit.update', async (event, data) => {
  return mcgit.updateSoft({
    dir: data.local,
    ours: 'master',
  })
})

ipcMain.handle('mcgit.launch', async (event, data) => {
  let opts = {
    clientPackage: null,
    authorization: Authenticator.getAuth(data.mc.email, data.mc.password),
    root: data.local,
    version: {
      number: "1.15.2",
      type: "release"
    },
    memory: {
      max: "6000",
      min: "4000"
    }
  }
  opts.overrides = {
    directory: path.resolve(path.join('minecraft/versions', opts.version.number)), // where the Minecraft jar and version json are located.
    natives: path.resolve('minecraft/natives'), // native directory path.
    assetRoot: path.resolve('minecraft/assets'),
    libraryRoot: path.resolve('minecraft/libraries'),
  }

  launcher.on('debug', (e) => console.log(e));
  launcher.on('data', (e) => console.log(e));

  return launcher.launch(opts).then(result => {
    console.log(result)
    return {
      success: true,
      result: 'OK!',
    }
  }).catch(err => {
    console.log('Error: ', err)
    return {
      success: false,
      reason: err,
    }
  });
})
