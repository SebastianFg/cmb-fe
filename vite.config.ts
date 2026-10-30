import path from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, './src'),
      },
    },
    server: {
      host: '0.0.0.0',
      port: Number.parseInt(env.VITE_APP_PORT || '3000', 10),
      fs: {
        allow: ['.'],
      },
      allowedHosts: ['localhost', '127.0.0.1'],
      hmr: env.HMR_HOST
        ? { host: env.HMR_HOST, protocol: 'wss', clientPort: 443 }
        : true,
    },
  };
});
