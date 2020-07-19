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
  return {
    success: true
  }
})
