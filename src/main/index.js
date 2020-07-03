/* globals INCLUDE_RESOURCES_PATH */
import { app, ipcMain } from 'electron'
import Git from 'nodegit'
import fs from 'fs'

/**
 * Set `__resources` path to resources files in renderer process
 */
global.__resources = undefined // eslint-disable-line no-underscore-dangle
// noinspection BadExpressionStatementJS
INCLUDE_RESOURCES_PATH // eslint-disable-line no-unused-expressions
if (__resources === undefined) console.error('[Main-process]: Resources path is undefined')

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.handle('c-clone', async (event, data) => {
  /*
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
   */
})

ipcMain.handle('c-pull', async (event, data) => {
  /*
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
   */
})

ipcMain.handle('c-merge', async (event, data) => {
  /*
  return git.merge({
    fs,
    dir: data.local,
    ours: 'master',
    theirs: '/remotes/origin/master'
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
   */
})

// Load here all startup windows
require('./mainWindow')
