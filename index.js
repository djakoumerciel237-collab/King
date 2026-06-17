/** 
 * @author NTKhang 
 * ! The source code is written by NTKhang, please don't change the author's name everywhere. Thank you for using
 * ! Official source code: https://github.com/ntkhang03/Goat-Bot-V2
 * ! If you do not download the source code from the above address, you are using an unknown version and at risk of having your account hacked
 * 
 * English:
 * ! Please do not change the below code, it is very important for the project.
 * It is my motivation to maintain and develop the project for free.
 * ! If you change it, you will be banned forever
 * Thank you for using
 * 
 * Vietnamese:
 * ! Vui lòng không thay đổi mã bên dưới, nó rất quan trọng đối với dự án.
 * Nó là động lực để tôi duy trì và phát triển dự án miễn phí.
 * ! Nếu thay đổi nó, bạn sẽ bị cấm vĩnh viễn
 * Cảm ơn bạn đã sử dụng 
 */

const { spawn } = require("child_process");
const log = require("./logger/log.js");
const http = require("http");

// === RAILWAY KEEP-ALIVE SERVER ===
const PORT = process.env.PORT || 3000;
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('GoatBot is alive - Status: OK');
}).listen(PORT, () => {
  log.info("Keep-Alive", `Server running on port ${PORT} - Railway won't sleep now`);
});

// Anti-idle log every 5 min
setInterval(() => {
  log.info("Keep-Alive", `Bot alive - RAM: ${(process.memoryUsage().heapUsed/1024/1024).toFixed(1)}MB`);
}, 5 * 60 * 1000);

function startProject() {
  const child = spawn("node", ["Goat.js"], { 
    cwd: __dirname, 
    stdio: "inherit", 
    shell: true 
  });
  
  child.on("close", (code) => {
    log.info("Project stopped with code:", code);
    if (code === 2) {
      log.info("Project", "Restarting...");
      startProject();
    }
  });
}

startProject();
