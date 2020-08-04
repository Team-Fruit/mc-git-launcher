const makeDir = require('make-dir');
const path = require('path');
const EventEmitter = require('events').EventEmitter;
const axios = require('axios');
const adapter = require('axios/lib/adapters/http');
const fse = require('fs-extra');
const zlib = require('zlib');
const tar = require('tar');
const progress = require('fs-readstream-progress');
const Zip = require('adm-zip')
const {promisify} = require('util');
const {exec} = require('child_process');

const JAVA_MANIFEST_URL = 'https://cdn.assets-gdevs.com/openjdk8.json';

class JavaSetup extends EventEmitter {
  constructor({runtimeFolder, tempFolder}) {
    super();
    this.runtimeFolder = runtimeFolder;
    this.tempFolder = tempFolder;
  }

  convertOSToJavaFormat(ElectronFormat) {
    switch (ElectronFormat) {
      case 'win32':
        return 'windows';
      case 'darwin':
        return 'mac';
      case 'linux':
        return 'linux';
      default:
        return false;
    }
  }

  async getJavaManifest() {
    return axios.get(JAVA_MANIFEST_URL);
  }

  async downloadFile(fileName, url, onProgress) {
    await makeDir(path.dirname(fileName));

    const {data, headers} = await axios.get(url, {
      responseType: 'stream',
      responseEncoding: null,
      adapter
    });
    const out = fse.createWriteStream(fileName, {encoding: null});
    data.pipe(out);

    // Save variable to know progress
    let receivedBytes = 0;
    const totalBytes = parseInt(headers['content-length'], 10);

    data.on('data', chunk => {
      // Update the received bytes
      receivedBytes += chunk.length;
      if (onProgress) {
        onProgress(((receivedBytes * 100) / totalBytes).toFixed(1));
      }
    });

    return new Promise((resolve, reject) => {
      data.on('end', () => {
        out.end();
        resolve();
      });

      data.on('error', () => {
        reject();
      });
    });
  }

  async initalizeJava() {
    const javaManifest = (await this.getJavaManifest()).data;
    if (!await this.isLatestJavaDownloaded(javaManifest, true))
      await this.installJava(javaManifest);
    return this.getJavaPath(javaManifest);
  }

  async getJavaPath(meta) {
    const javaOs = this.convertOSToJavaFormat(process.platform);
    const javaMeta = meta.find(v => v.os === javaOs);
    const javaFolder = path.join(
      this.runtimeFolder,
      javaMeta.version_data.openjdk_version
    );
    // Check if it's downloaded, if it's latest version and if it's a valid download
    let isValid = true;

    const javaExecutable = path.join(
      javaFolder,
      'bin',
      `java${javaOs === 'windows' ? '.exe' : ''}`
    );
    return javaExecutable;
  }

  async isLatestJavaDownloaded(meta, retry) {
    const javaOs = this.convertOSToJavaFormat(process.platform);
    const javaMeta = meta.find(v => v.os === javaOs);
    const javaFolder = path.join(
      this.runtimeFolder,
      javaMeta.version_data.openjdk_version
    );
    // Check if it's downloaded, if it's latest version and if it's a valid download
    let isValid = true;

    const javaExecutable = path.join(
      javaFolder,
      'bin',
      `java${javaOs === 'windows' ? '.exe' : ''}`
    );
    try {
      await fse.access(javaFolder);
      await promisify(exec)(`"${javaExecutable}" -version`);
    } catch (err) {
      console.log('Java is not ready');

      if (retry) {
        if (process.platform !== 'win32') {
          try {
            await promisify(exec)(`chmod +x "${javaExecutable}"`);
            await promisify(exec)(`chmod 755 "${javaExecutable}"`);
          } catch {
            // swallow error
          }
        }

        return this.isLatestJavaDownloaded(meta);
      }

      isValid = false;
    }
    return isValid;
  };

  async installJava(meta) {
    const javaOs = this.convertOSToJavaFormat(process.platform);
    const javaMeta = meta.find(v => v.os === javaOs);
    const {
      version_data: {openjdk_version: version},
      binary_link: url,
      release_name: releaseName
    } = javaMeta;
    await fse.remove(this.runtimeFolder);
    const downloadLocation = path.join(this.tempFolder, path.basename(url));

    await this.downloadFile(downloadLocation, url, p => {
      // ipcRenderer.invoke('update-progress-bar', parseInt(p, 10) / 100);
      // setDownloadPercentage(parseInt(p, 10));
    });

    // ipcRenderer.invoke('update-progress-bar', -1);
    // setDownloadPercentage(null);
    await new Promise(resolve => setTimeout(resolve, 500));

    const totalSteps = process.platform !== 'win32' ? 2 : 1;

    // setCurrentStep(`Extracting 1 / ${totalSteps}`);

    if (downloadLocation.endsWith(".tar.gz")) {
      const gunzip = zlib.createGunzip();
      const extractor = tar.extract({path: this.tempFolder});
      const firstExtraction = fse.createReadStream(downloadLocation).pipe(gunzip).pipe(extractor);
      await new Promise((resolve, reject) => {
        firstExtraction.on('end', () => {
          resolve();
        });
        firstExtraction.on('error', err => {
          reject(err);
        });
      });
    } else {
      new Zip(downloadLocation).extractAllTo(this.tempFolder, true)
    }

    await fse.remove(downloadLocation);

    const directoryToMove =
      process.platform === 'darwin'
        ? path.join(this.tempFolder, `${releaseName}-jre`, 'Contents', 'Home')
        : path.join(this.tempFolder, `${releaseName}-jre`);
    await fse.move(directoryToMove, path.join(this.runtimeFolder, version));

    await fse.remove(path.join(this.tempFolder, `${releaseName}-jre`));

    const ext = process.platform === 'win32' ? '.exe' : '';

    if (process.platform !== 'win32') {
      const execPath = path.join(this.runtimeFolder, version, 'bin', `java${ext}`);

      await promisify(exec)(`chmod +x "${execPath}"`);
      await promisify(exec)(`chmod 755 "${execPath}"`);
    }

    // dispatch(updateJavaPath(null));
    // setCurrentStep(`Java is ready!`);
    // ipcRenderer.invoke('update-progress-bar', -1);
    // setDownloadPercentage(null);
    // await new Promise(resolve => setTimeout(resolve, 2000));
    // dispatch(closeModal());
  }
}

module.exports = {
  JavaSetup,
}
