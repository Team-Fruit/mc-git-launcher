const path = require("path");

const mainDir = path.join(__dirname, "src/main/");
const rendererDir = path.join(__dirname, "src/renderer/");

const isDev = process.env.NODE_ENV === "development";

let _NUXT_URL_ = "";
if (isDev) {
  const config = require(path.join(rendererDir, "nuxt.config.js"));
  config.rootDir = path.resolve(rendererDir);

  const http = require("http");
  const {Nuxt, Builder} = require("nuxt");
  const nuxt = new Nuxt(config);
  nuxt.ready().then(() => {
    const builder = new Builder(nuxt);
    const server = http.createServer(nuxt.render);
    builder.build().catch(err => {
      console.error(err);
      process.exit(1);
    });
    server.listen();
    _NUXT_URL_ = `http://localhost:${server.address().port}`;
    console.log(`Nuxt working on ${_NUXT_URL_}`);
  });
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

  win.webContents.on('dom-ready', function(e) {
    win.webContents.executeJavaScript('' +
      'var http = new XMLHttpRequest();' +
      'var s = location.href.split("/");' +
      'http.open("HEAD",location.href.replace(s[s.length-1],"")+"_nuxt/runtime.js",false);' +
      'http.send();' +
      'if(http.status == 404) {location.href="/redirect?p=" + encodeURI(window.location.pathname)}')
  })

  win.on("closed", () => (win = null));
  if (isDev) {
    const http = require("http");

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
