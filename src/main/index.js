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

      const fullpath = path.join(dir, filepath)

      return {
        A,
        B,
        C,
        filepath,
        fullpath,
      }
    }
  }).then(async changes => {
    return Promise.all(changes.map(async change => {
      const {filepath, fullpath} = change

      const {A, B, C} = change

      // generate ids
      const Aoid = await A?.oid()
      const Boid = await B?.oid()
      const Coid = await C?.oid()

      // generate types
      const Atype = await A?.type()
      const Btype = await B?.type()
      const Ctype = await C?.type()

      if (Atype !== Btype) {
        // removedir
        if (Atype === 'tree') {
          await fs.promises.rmdir(fullpath)
        }
      }

      // determine modification type
      if (Aoid === Boid) {
        // equal
      } else if (B === undefined) {
        // remove
        if (Ctype === 'blob') {
          await fs.promises.unlink(fullpath)
          await git.remove({
            fs,
            dir,
            filepath,
          })
        }
      } else {
        // add, modify
        if (Btype === 'blob' && Boid !== Coid) {
          //await fs.promises.mkdir(path.dirname(fullpath), { recursive: true }).catch()
          await fs.promises.writeFile(fullpath, await B.content())
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
    console.log('Error: ', err)
    return {
      success: false,
      reason: err,
    }
  })
})
