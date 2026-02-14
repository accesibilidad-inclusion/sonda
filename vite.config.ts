import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig(({ mode }) => {
    const isDev = mode === 'development';

    // Try to load HTTPS certificates if they exist
    let httpsConfig = undefined;
    const certPath = path.resolve(__dirname, '.cert/cert.pem');
    const keyPath = path.resolve(__dirname, '.cert/key.pem');

    if (isDev && fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsConfig = {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }

    return {
      base: mode === 'production' ? '/sonda/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
        https: httpsConfig,
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
