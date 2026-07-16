import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const sentryUploadEnabled = Boolean(sentryAuthToken && sentryOrg && sentryProject);

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ...(sentryUploadEnabled
      ? [
          sentryVitePlugin({
            org: sentryOrg!,
            project: sentryProject!,
            authToken: sentryAuthToken!,
          }),
        ]
      : []),
  ],
  resolve: {
    alias: {
      '@': path.resolve(dir, './src'),
    },
  },
  build: {
    sourcemap: sentryUploadEnabled,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
