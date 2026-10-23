import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// Addy Osmani playbook applied here:
// - Ship less JS on the main thread: heavy codecs run in a Web Worker (see src/workers).
// - Code-split aggressively: each tool route + the AVIF/HEIC codecs are lazy-loaded.
// - Cache the app shell for instant repeat loads & full offline use (PWA / Workbox).
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.svg', 'robots.txt'],
      workbox: {
        // Pulled into the generated service worker to handle Web Share Target POSTs.
        importScripts: ['sw-share.js'],
        // Precache the app shell, fonts and the small codec wasm for instant, offline use.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,wasm}'],
        // The ~24 MB ONNX runtime wasm (background remover) is far too big to precache; it is
        // fetched and cached on first use instead (see runtimeCaching below).
        globIgnores: ['**/ort-wasm*.wasm'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        runtimeCaching: [
          {
            // On-device AI runtime for the background remover: cache once, then works offline.
            urlPattern: ({ url }) => /ort-wasm.*\.wasm$/.test(url.pathname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'onnx-runtime',
              expiration: { maxEntries: 6, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
          {
            // The segmentation model weights are downloaded once from the imgly CDN.
            urlPattern: ({ url }) => /imgly/.test(url.hostname),
            handler: 'CacheFirst',
            options: {
              cacheName: 'imgly-model',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifest: {
        name: 'iHateImages - Private Image Toolkit',
        short_name: 'iHateImages',
        description:
          'Compress, convert, resize & clean images 100% in your browser. No upload, no watermark, no sign-up.',
        theme_color: '#0e0f11',
        background_color: '#f4f5f7',
        display: 'standalone',
        start_url: '/',
        icons: [{ src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }],
        shortcuts: [
          { name: 'Compress', short_name: 'Compress', url: '/compress' },
          { name: 'Convert', short_name: 'Convert', url: '/convert' },
          { name: 'Remove background', short_name: 'Background', url: '/background-remover' },
          { name: 'Crop', short_name: 'Crop', url: '/crop' },
        ],
        file_handlers: [
          {
            action: '/compress',
            accept: {
              'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.bmp', '.heic', '.heif'],
            },
          },
        ],
        share_target: {
          action: '/share-target',
          method: 'POST',
          enctype: 'multipart/form-data',
          params: {
            title: 'title',
            text: 'text',
            url: 'url',
            files: [{ name: 'file', accept: ['image/*'] }],
          },
        },
      },
    }),
  ],
  build: {
    target: 'es2022',
    // Performance budget: warn loudly if any chunk creeps past 500 KB.
    chunkSizeWarningLimit: 500,
  },
  worker: { format: 'es' },
  // The Squoosh AVIF codec and the background-removal model both load their own wasm/assets;
  // keep esbuild from pre-bundling them.
  optimizeDeps: { exclude: ['@jsquash/avif', '@imgly/background-removal'] },
});
