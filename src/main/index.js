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

ipcMain.handle('git.update', async (event, data) => {
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
  const fetchChanges = async () => {
    return git.walk({
      fs,
      dir,
      trees: [git.TREE({ ref: commitA[0].oid }), git.TREE({ ref: commitB[0].oid }), git.WORKDIR()],
      map: async function(filepath, rawEntries) {
        return {
          rawEntries,
          filepath,
          fullpath: path.join(dir, filepath),
        }
      }
    }).then(async changes => {
      return changes.filter(c => {
        // ignore directories
        if (c.filepath === '.' || c.filepath === '.git' || c.filepath.startsWith('.git/')) {
          return false
        }

        return true
      })
    }).then(async changes => {
      return Promise.all(changes.map(async c => {
        return {
          ...c,
          entries: await Promise.all(c.rawEntries.map(async entry => {
            return {
              obj: entry,
              data: await entry?.content(),
              type: await entry?.type(),
              oid: await entry?.oid(),
            }
          }))
        }
      }))
    })
  }
  await fetchChanges().then(async changes => {
    return Promise.all(changes.map(async c => {
      const [A, B, C] = c.entries

      // removedir
      if (A.type === 'tree' && B.type !== 'tree') {
        if (C.type === 'tree')
          await fs.promises.rmdir(c.fullpath, {recursive: true})
      }

      // remove
      if (A.type === 'blob' && B.type !== 'blob') {
        if (C.type === 'blob')
          await fs.promises.unlink(c.fullpath)
      }

      return c
    }))
  }).then(async changes => {
    return Promise.all(changes.map(async c => {
      const [A, B, C] = c.entries

      // mkdir
      if (A.type !== 'tree' && B.type === 'tree') {
        if (C.type !== 'tree')
          await fs.promises.mkdir(c.fullpath, { recursive: true })
      }

      return c
    }))
  })
  return fetchChanges().then(async changes => {
    return Promise.all(changes.map(async c => {
      const [A, B, C] = c.entries

      // determine modification type
      if (A.oid === B.oid) {
        // equal
      } else if (B.type !== 'blob') {
        // remove
        if (C.type === 'blob') {
          await fs.promises.unlink(c.fullpath)
          await git.remove({
            fs,
            dir,
            filepath: c.filepath,
          })
        }
      } else {
        // add, modify
        if (B.type === 'blob' && B.oid !== C.oid) {
          await fs.promises.writeFile(c.fullpath, B.data)
          await git.add({
            fs,
            dir,
            filepath: c.filepath,
          })
        }
      }

      return c
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
