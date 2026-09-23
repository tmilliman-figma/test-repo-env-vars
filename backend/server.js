import { createApp } from './app.js';

const host = process.env.BACKEND_HOST || '127.0.0.1';
const port = Number(process.env.BACKEND_PORT || 8787);

try {
  const app = createApp();

  app.listen(port, host, () => {
    console.log(`Backend listening at http://${host}:${port}`);
  });
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
