const http = require("http");
const path = require("path");
const {Nuxt, Builder} = require("nuxt");

const mainDir = path.join(__dirname, "src/main/");
const rendererDir = path.join(__dirname, "src/renderer/");

const config = require(path.join(rendererDir, "nuxt.config.js"));
config.rootDir = path.resolve(rendererDir);

const nuxt = new Nuxt(config);
const builder = new Builder(nuxt);
const server = http.createServer(nuxt.render);

let _NUXT_URL_ = "";
if (config.dev) {
  builder.build().catch(err => {
    console.error(err);
    process.exit(1);
  });
  server.listen();
  _NUXT_URL_ = `http://localhost:${server.address().port}`;
  console.log(`Nuxt working on ${_NUXT_URL_}`);
} else {
  _NUXT_URL_ = `file:///index.html`;
}

const {BrowserWindow, app, protocol} = require("electron");

app.on('ready', () => {
  protocol.interceptFileProtocol('file', (req, callback) => {
    const requestedUrl = req.url.substr(7);

    if (path.isAbsolute(requestedUrl)) {
      callback(path.normalize(path.join(rendererDir, "dist", requestedUrl)));
    } else {
      callback(requestedUrl);
    }
  });
});

let win = null;
const newWin = () => {
  win = new BrowserWindow({
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.resolve(path.join(mainDir, "preload.js"))
    }
  });
  win.on("closed", () => (win = null));
  if (config.dev) {
    const pollServer = () => {
      http
        .get(_NUXT_URL_, res => {
          if (res.statusCode === 200) {
            win.loadURL(_NUXT_URL_);
          } else {
            console.log("restart poolServer");
            setTimeout(pollServer, 300);
          }
        })
        .on("error", pollServer);
    };
    pollServer();
  } else {
    return win.loadURL(_NUXT_URL_);
  }
};
app.on("ready", newWin);
app.on("window-all-closed", () => app.quit());
app.on("activate", () => win === null && newWin());

require(path.join(mainDir, 'index'))
