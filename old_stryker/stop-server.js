const fs = require('fs');
const path = require('path');

const PID_FILE = path.resolve(__dirname, '.ng-serve.pid');

if (!fs.existsSync(PID_FILE)) {
  process.exit(0);
}

const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'), 10);

try {
  process.kill(pid, 'SIGTERM');
  console.log(`Killed Angular server (PID ${pid})`);
} catch (e) {
  console.log('Server already stopped');
}

fs.unlinkSync(PID_FILE);
