const {ipcMain} = require('electron')
const fs = require('fs').promises
const path = require('path')
const mcgit = require('./mcgit')
const {JavaSetup} = require('./install-java')
const {Client, Authenticator} = require('minecraft-launcher-core');

let javaExecutable = null;

ipcMain.handle('mcgit.clone', async (event, data) => {
  return mcgit.clone({
    dir: data.local,
    url: data.remote.substr(data.remote.length - 4) === ".git" ? data.remote : data.remote + ".git",
    ours: 'main',
  })
})

ipcMain.handle('mcgit.fetch', async (event, data) => {
  return mcgit.fetch({
    dir: data.local,
    url: data.remote,
    ours: 'main',
  })
})

ipcMain.handle('mcgit.update.force', async (event, data) => {
  return mcgit.updateHard({
    dir: data.local,
    ours: 'main',
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
  try {
    const sender = event.sender
    const javaSetup = new JavaSetup({
      runtimeFolder: path.resolve('minecraft/runtime'),
      tempFolder: path.resolve('minecraft/temp'),
    })
    javaSetup.on('java-download-progress', e => sender.send('mcgit.java-progress', e))
    javaExecutable = await javaSetup.initalizeJava()
    return {
      success: true,
      result: 'OK!',
    }
  } catch (err) {
    console.log('Error: ', err)
    return {
      success: false,
      reason: err,
    }
  }
})

ipcMain.handle('mcgit.launch', async (event, data) => {
  const sender = event.sender

  if (!javaExecutable)
    return {
      success: false,
      reason: 'java is not ready.',
    }

  const launcher = new Client();
  launcher.on('debug', (e) => console.log(e));
  launcher.on('data', (e) => console.log(e));
  launcher.on('progress', (e) => console.log(e));
  launcher.on('package-extract', (e) => console.log(e));
  launcher.on('download', (e) => console.log(e));
  launcher.on('close', (e) => console.log(e));

  // launcher.on('download-status', e => sender.send('mcgit.download-progress', 100 * e.current / e.total));
  launcher.on('progress', e => sender.send('mcgit.modpack-progress', 100 * e.task / e.total));

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
    javaPath: javaExecutable,
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
