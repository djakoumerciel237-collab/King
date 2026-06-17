const { File, Blob } = require('buffer')
global.File = File
global.Blob = Blob

const express = require('express');
const path = require('path');
const { spawn } = require("child_process");
const fs = require("fs");
const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 3000;

http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GoatBot is alive - Status: OK');
}).listen(port, () => {
  console.log(`📡 Web server running on port ${port}`);
});

if (!fs.existsSync("./cache")) fs.mkdirSync("./cache");
const logPath = path.join(__dirname, "cache", "logs.txt");
fs.writeFileSync(logPath, "", { flag: "a" });
const logStream = fs.createWriteStream(logPath, { flags: "a" });

let clients = [];
const originalLog = console.log;
console.log = (...args) => {
  const logMsg = args.map(arg => (typeof arg === "object"? JSON.stringify(arg) : String(arg))).join(" ");
  originalLog(logMsg);
  logStream.write(logMsg + "\n");
  clients.forEach(ws => ws.readyState === 1 && ws.send(logMsg));
};

const wss = new WebSocket.Server({ server });
wss.on("connection", ws => {
  clients.push(ws);
  ws.send("[Connected] ✅ King log viewer active");
  ws.on("close", () => {
    clients = clients.filter(c => c!== ws);
  });
});

app.get("/logs", (req, res) => {
  res.send(`<html><head><title>King Logs</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:monospace;background:#000;color:#0f0;padding:10px;margin:0}#log{height:85vh;overflow-y:scroll;white-space:pre-wrap;border:1px solid #444;padding:10px;background:#111}.error{color:#ff5555}</style></head><body><h2>📜 King Logs</h2><div id="log">Loading...</div><script>const log=document.getElementById("log");fetch("/logs.txt").then(r=>r.text()).then(t=>{log.innerHTML=t.replace(/\\n/g,"<br>");log.scrollTop=log.scrollHeight});const ws=new WebSocket((location.protocol==="https:"?"wss://":"ws://")+location.host);ws.onmessage=e=>{log.innerHTML+="<br>"+e.data.replace(/\\n/g,"<br>");log.scrollTop=log.scrollHeight}</script></body></html>`);
});

app.use("/logs.txt", express.static(logPath));

function startProject() {
  console.log("[DEBUG] === KING BOT STARTING ===");
  console.log("[DEBUG] Node:", process.version);
  console.log("[DEBUG] Goat.js exists:", fs.existsSync(path.join(__dirname, "Goat.js")));

  const child = spawn("node", ["Goat.js"], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  child.stdout.on("data", (data) => {
    const msg = data.toString().trim();
    if (msg) console.log("[King]", msg);
  });

  child.stderr.on("data", (data) => {
    const err = data.toString().trim();
    if (err) console.log("[King ERROR]", err);
  });

  child.on("close", (code) => {
    console.log(`[Goat.js] Exited code ${code}`);
    if (code !== 0) setTimeout(startProject, 5000);
  });
}

setTimeout(startProject, 2000);
