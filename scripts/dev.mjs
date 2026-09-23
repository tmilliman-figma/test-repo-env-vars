import { spawn } from 'node:child_process';

const commands = [
  {
    name: 'backend',
    command: process.execPath,
    args: ['--env-file-if-exists=.env', 'backend/server.js']
  },
  {
    name: 'frontend',
    command: 'vite',
    args: []
  }
];

const children = [];
let stopping = false;

function stopAll(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (!child.killed) child.kill(signal);
  }
}

for (const item of commands) {
  const child = spawn(item.command, item.args, {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: process.env
  });

  children.push(child);

  child.on('exit', (code, signal) => {
    if (!stopping) {
      console.log(`${item.name} exited with ${signal || code}`);
      stopAll();
      process.exitCode = code ?? 1;
    }
  });
}

process.on('SIGINT', () => stopAll('SIGINT'));
process.on('SIGTERM', () => stopAll('SIGTERM'));
