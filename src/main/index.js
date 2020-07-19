const {ipcMain} = require('electron')
const fs = require("fs")
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
  const commitA = await git.log({
    fs,
    dir: data.local,
    depth: 1,
    ref: 'master'
  })
  const commitB = await git.log({
    fs,
    dir: data.local,
    depth: 1,
    ref: 'origin/master'
  })
  return git.walk({
    fs,
    dir: data.local,
    trees: [git.TREE({ ref: commitA[0].oid }), git.TREE({ ref: commitB[0].oid })],
    map: async function(filepath, [A, B]) {
      // ignore directories
      if (filepath === '.') {
        return
      }
      if (A !== null && (await A.type()) === 'tree' || B !== null && (await B.type()) === 'tree') {
        return
      }

      // generate ids
      const Aoid = A === null ? undefined : await A.oid()
      const Boid = B === null ? undefined : await B.oid()

      // determine modification type
      let type = 'equal'
      if (Aoid !== Boid) {
        type = 'modify'
      }
      if (Aoid === undefined) {
        type = 'add'
      }
      if (Boid === undefined) {
        type = 'remove'
      }
      if (Aoid === undefined && Boid === undefined) {
        console.log('Something weird happened:')
        console.log(A)
        console.log(B)
      }

      return {
        path: `/${filepath}`,
        type: type,
      }
    }
  }).then(result => {
    console.log(result)
    return {
      success: true,
      result: JSON.stringify(result),
    }
  }).catch(err => {
    return {
      success: false,
      reason: err,
    }
  })
})
