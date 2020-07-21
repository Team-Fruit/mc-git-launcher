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
    ref: 'master',
    singleBranch: true,
    //depth: 1,
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

ipcMain.handle('git.fetch', async (event, data) => {
  return await git.fetch({
    fs,
    http,
    dir: data.local,
    url: data.remote,
    ref: 'master',
    singleBranch: true,
    //depth: 1,
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

async function prepareWorkDir({fs, dir, ref}) {
  const repo = {
    fs,
    dir,
  }
  const commitA = await git.log({
    ...repo,
    depth: 1,
    ref,
  })
  await git.walk({
    ...repo,
    trees: [git.WORKDIR(), git.TREE({ref: commitA[0].oid})],
    map: async function (filepath, rawEntries) {
      if (filepath === '.')
        return undefined
      if (filepath === '.git')
        return null
      return {
        rawEntries,
        entries: await Promise.all(rawEntries.map(async entry => {
          return {
            obj: entry,
            type: await entry?.type(),
          }
        })),
        filepath,
        fullpath: path.join(dir, filepath),
      }
    }
  }).then(async changes => {
    return Promise.all(changes.map(async c => {
      const [A, B] = c.entries

      // removedir
      if (A.type === 'tree' && B.type !== 'tree') {
        await fs.promises.rmdir(c.fullpath, {recursive: true})
      }

      // remove
      if (A.type === 'blob' && B.type !== 'blob') {
        await fs.promises.unlink(c.fullpath)
        await git.remove({
          ...repo,
          filepath: c.filepath,
        })
      }

      return c
    }))
  }).then(async changes => {
    return Promise.all(changes.map(async c => {
      const [A, B] = c.entries

      // mkdir
      if (A.type !== 'tree' && B.type === 'tree') {
        await fs.promises.mkdir(c.fullpath, {recursive: true})
      }

      return c
    }))
  })
}

ipcMain.handle('git.update.force', async (event, data) => {
  const dir = data.local
  const repo = {
    fs,
    dir,
  }
  try {
    await git.merge({
      ...repo,
      ours: 'master',
      theirs: 'origin/master',
      fastForwardOnly: true,
    })
    await prepareWorkDir({
      ...repo,
      ref: 'master',
    })
    await git.statusMatrix({
      ...repo,
      ref: 'master'
    }).then((status) =>
      Promise.all(status.map(([filepath, , worktreeStatus]) =>
        worktreeStatus
          ? git.add({...repo, filepath})
          : git.remove({...repo, filepath})
      ))
    )
    await git.checkout({
      ...repo,
      ref: 'master',
      force: true,
    })
    return {
      success: true,
      result: 'SUSHI',
    }
  } catch (err) {
    console.log('Error: ', err)
    return {
      success: false,
      reason: err,
    }
  }
})

ipcMain.handle('git.update', async (event, data) => {
  const dir = data.local
  const repo = {
    fs,
    dir,
  }
  const commitA = await git.log({
    ...repo,
    depth: 1,
    ref: 'master'
  })
  const commitB = await git.log({
    ...repo,
    depth: 1,
    ref: 'origin/master'
  })
  await prepareWorkDir({
    ...repo,
    ref: 'origin/master'
  })
  return git.walk({
    ...repo,
    trees: [git.TREE({ref: commitA[0].oid}), git.TREE({ref: commitB[0].oid}), git.WORKDIR()],
    map: async function (filepath, rawEntries) {
      if (filepath === '.')
        return undefined
      if (filepath === '.git')
        return null
      return {
        rawEntries,
        entries: await Promise.all(rawEntries.map(async entry => {
          return {
            obj: entry,
            data: await entry?.content(),
            type: await entry?.type(),
            oid: await entry?.oid(),
          }
        })),
        filepath,
        fullpath: path.join(dir, filepath),
      }
    }
  }).then(async changes => {
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
            ...repo,
            filepath: c.filepath,
          })
        }
      } else {
        // add, modify
        if (B.type === 'blob' && B.oid !== C.oid) {
          await fs.promises.writeFile(c.fullpath, B.data)
          await git.add({
            ...repo,
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
