import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const frontendHost = env.FRONTEND_HOST || '0.0.0.0';
  const frontendPort = Number(env.FRONTEND_PORT || env.PORT || 3000);
  const backendHost = env.BACKEND_HOST || '127.0.0.1';
  const backendPort = Number(env.BACKEND_PORT || 8787);

  return {
    plugins: [react()],
    server: {
      host: frontendHost,
      port: frontendPort,
      strictPort: true,
      proxy: {
        '/api': {
          target: `http://${backendHost}:${backendPort}`,
          changeOrigin: true
        }
      }
    },
    preview: {
      host: frontendHost,
      port: Number(env.PREVIEW_PORT || 4173),
      strictPort: true
    }
  };
});
