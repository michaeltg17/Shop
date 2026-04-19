const { execSync } = require('child_process');

try {
  execSync('npx stryker run', { stdio: 'inherit' });
} finally {
  execSync('node stop-server.js', { stdio: 'inherit' });
}
