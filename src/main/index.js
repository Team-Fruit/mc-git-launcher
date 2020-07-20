const {ipcMain} = require('electron')
const fs = require("fs")
const path = require("path")
const git = require('isomorphic-git')
const http = require('isomorphic-git/http/node')

ipcMain.handle('git.clone', async (event, data) => {
  return git.clone({
    fs,
    http,
    dir: data.local,
    url: data.remote,
    singleBranch: true,
    //depth: 1
  }).then(async () => {
    await git.setConfig({
      fs,
      dir: data.local,
      path: 'user.name',
      value: 'Kamesuta'
    })
    await git.setConfig({
      fs,
      dir: data.local,
      path: 'user.email',
      value: 'kamesuta@gmail.com'
    })
  }).then(() => {
    return {
      success: true
    }
  }).catch(err => {
    return {
      success: false,
      reason: err
    }
  })
})

ipcMain.handle('git.pull', async (event, data) => {
  return git.pull({
    fs,
    http,
    dir: data.local,
    ref: 'master',
    singleBranch: true
  }).then(() => {
    return {
      success: true
    }
  }).catch(err => {
    return {
      success: false,
      reason: err
    }
  })
})

ipcMain.handle('git.diff', async (event, data) => {
  const dir = data.local
  const commitA = await git.log({
    fs,
    dir,
    depth: 1,
    ref: 'master'
  })
  const commitB = await git.log({
    fs,
    dir,
    depth: 1,
    ref: 'origin/master'
  })
  return git.walk({
    fs,
    dir,
    trees: [git.TREE({ ref: commitA[0].oid }), git.TREE({ ref: commitB[0].oid }), git.WORKDIR()],
    map: async function(filepath, [A, B, C]) {
      // ignore directories
      if (filepath === '.' || filepath.startsWith('.git/')) {
        return
      }

      /*
      if ((A !== null && (await A.type()) === 'tree')
        || (B !== null && (await B.type()) === 'tree')
        || (C !== null && (await C.type()) === 'tree')) {
        return
      }
       */

      // generate ids
      const Aoid = A === null ? undefined : await A.oid()
      const Boid = B === null ? undefined : await B.oid()
      const Coid = C === null ? undefined : await C.oid()

      const fullpath = path.join(dir, filepath)

      return {
        A,
        B,
        C,
        Aoid,
        Boid,
        Coid,
        filepath,
        fullpath,
      }
    }
  }).then(async changes => {
    return Promise.all(changes.map(async change => {
      const {filepath, fullpath} = change
      // determine modification type
      if (change.Aoid === undefined && change.Boid === undefined) {
        // unknown
        console.log('Something weird happened:')
        console.log(change.A)
        console.log(change.B)
        console.log(change.C)
      } else if (change.Aoid === change.Boid) {
        // equal
      } else if (change.Boid === undefined) {
        // remove
        if (change.Coid !== undefined) {
          await fs.promises.unlink(fullpath).catch()
          await git.remove({
            fs,
            dir,
            filepath,
          })
        }
      } else {
        // add, modify
        if (change.Boid != change.Coid) {
          await fs.promises.writeFile(fullpath, await change.B.content())
          await git.add({
            fs,
            dir,
            filepath,
          })
        }
      }
      return change
    }))
  }).then(async result => {
    const commit = commitB[0].oid
    await fs.promises.writeFile(path.join(dir, `/.git/refs/heads/master`), commit);
    return result
  }).then(result => {
    console.log(result)
    return {
      success: true,
      result: JSON.stringify(result),
    }
  }).catch(err => {
    console.error(err)
    return {
      success: false,
      reason: err,
    }
  })
})
