const {ipcMain} = require('electron')
const fs = require('fs').promises
const path = require('path')
const mcgit = require('./mcgit')
const {JavaSetup} = require('./install-java')
const {Client, Authenticator} = require('minecraft-launcher-core');

const launcher = new Client();
launcher.on('debug', (e) => console.log(e));
launcher.on('data', (e) => console.log(e));

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

async function findForge(dir) {
  const forgeDir = path.join(dir, 'forge')
  const forgeDirCont = await fs.readdir(forgeDir).catch(err => undefined)
  if (forgeDirCont === undefined)
    return undefined
  const forgeFile = forgeDirCont.find(elm => elm.match(/.*\.jar/ig))
  if (forgeFile === undefined)
    return undefined
  const forgePath = path.join(forgeDir, forgeFile)
  return forgePath
}

ipcMain.handle('mcgit.java', async (event, data) => {
  return new JavaSetup({
    userData: path.resolve(path.join('minecraft'))
  }).installJava()
    .then(result => {
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
    })
})

ipcMain.handle('mcgit.launch', async (event, data) => {
  const auth = Authenticator.getAuth(data.mc.email, data.mc.password)
  const forge = await findForge(data.local)
  const modpackOpts = JSON.parse(await fs.readFile(path.join(data.local, 'modpack.json'), 'utf8'))
  const userOpts = await fs.readFile(path.join(data.local, 'modpack.user.json'))
    .then(e => JSON.parse(e, 'utf8'))
    .catch(err => ({}))
  const opts = {
    forge: forge,
    memory: {
      max: "4000",
      min: "1000"
    },
    ...modpackOpts,
    ...userOpts,
    authorization: auth,
    root: data.local,
  }
  opts.overrides = {
    directory: path.resolve(path.join('minecraft/versions', opts.version.number)), // where the Minecraft jar and version json are located.
    natives: path.resolve('minecraft/bin', opts.version.number), // native directory path.
    assetRoot: path.resolve('minecraft/assets'),
    libraryRoot: path.resolve('minecraft/libraries'),
  }

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
  })
})
