const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Mutant ID from Stryker
const mutantId = process.env.__STRYKER_ACTIVE_MUTANT__ || 'no-mutant';

// Resolve logs folder two levels up
const logsDir = path.resolve(__dirname, '../../logs');

// Ensure logs folder exists
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log file per mutant
const logFile = path.join(logsDir, `playwright-${mutantId}.log`);

// Overwrite per run
fs.writeFileSync(logFile, `Mutant ID: ${mutantId}\n`, 'utf-8');

// Spawn Playwright
const ps = spawn('npx', ['playwright', 'test'], {
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
  env: process.env
});

// Pipe stdout and stderr to log file
ps.stdout.on('data', chunk => fs.appendFileSync(logFile, chunk));
ps.stderr.on('data', chunk => fs.appendFileSync(logFile, chunk));

// On exit, append exit code
ps.on('close', code => {
  fs.appendFileSync(logFile, `Process exited with code ${code}\n`);
  process.exit(code);
});
