const { spawn } = require('child_process');
const http = require('http');

const PORT = 4200;

function waitForServer(port, retries = 60) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      const req = http.get(`http://localhost:${port}`, res => {
        res.destroy();
        resolve();
      });

      req.on('error', () => {
        if (retries-- === 0) {
          reject(new Error('Server did not start'));
        } else {
          setTimeout(attempt, 1000);
        }
      });
    };
    attempt();
  });
}

const server = spawn('npx', ['ng', 'serve'], {
  detached: true,
  stdio: 'ignore',
  shell: true
});

server.unref();

waitForServer(PORT)
  .then(() => {
    console.log('Angular server is ready');
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
