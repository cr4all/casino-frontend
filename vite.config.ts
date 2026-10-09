import { defineConfig, type Connect, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

function visitorCountryPlugin(): Plugin {
  const respond: Connect.NextHandleFunction = (req, res, next) => {
    const url = req.url?.split('?')[0];
    if (url !== '/geo/country') {
      next();
      return;
    }

    const header = (name: string) => {
      const value = req.headers[name];
      return Array.isArray(value) ? (value[0] ?? '') : (value ?? '');
    };

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(
      JSON.stringify({
        cf: header('cf-ipcountry'),
        cloudfront: header('cloudfront-viewer-country'),
        // DEV_VISITOR_COUNTRY lets a local English browser exercise country detection.
        countryCode: header('x-country-code') || process.env.DEV_VISITOR_COUNTRY || '',
        vercel: header('x-vercel-ip-country'),
      }),
    );
  };

  return {
    name: 'visitor-country',
    configureServer(server) {
      server.middlewares.use(respond);
    },
    configurePreviewServer(server) {
      server.middlewares.use(respond);
    },
  };
}

const dir = path.dirname(fileURLToPath(import.meta.url));

const sentryAuthToken = process.env.SENTRY_AUTH_TOKEN;
const sentryOrg = process.env.SENTRY_ORG;
const sentryProject = process.env.SENTRY_PROJECT;
const sentryUploadEnabled = Boolean(sentryAuthToken && sentryOrg && sentryProject);

export default defineConfig({
  plugins: [
    visitorCountryPlugin(),
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
