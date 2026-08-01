# Performance notes

This project follows a few standard web performance practices. Each one maps to a decision in the code.

## 1. Get off the main thread

Decoding, resizing, and encoding an image can block the UI for hundreds of milliseconds, so all of it runs in a Web Worker using OffscreenCanvas. The main thread stays free and the interface stays responsive.

- `src/workers/image.worker.ts` is the worker.
- `src/lib/imageEngine.ts` wraps it with Comlink and transfers (rather than copies) the pixel buffer with `Comlink.transfer(...)` for a zero-copy handoff.

## 2. Ship less JavaScript, and ship it later

- Route-based code splitting: every tool page is a `React.lazy()` chunk (`src/App.tsx`), so the landing page ships almost no tool code.
- On-demand codecs: the AVIF codec (`@jsquash/avif`) and the HEIC decoder (`heic2any`) sit behind a dynamic `import()` and load only when the user needs them. The zip library (`fflate`) loads only when a batch is zipped.

## 3. Use modern image formats

The app produces WebP and AVIF, and it accepts HEIC input so iPhone users are not stuck. WebP, JPEG, and PNG use the browser's built-in encoders. AVIF uses the Squoosh codec compiled to WebAssembly.

## 4. Respect memory

- Object URLs for previews are tracked and revoked on new runs and on unmount (`src/components/ImageToolShell.tsx`), which prevents leaks during batch work.
- `ImageBitmap` objects are closed with `.close()` after drawing.
- Large files are bounded by tab memory, the same limit every client-side tool has.

## 5. Cache the shell, work offline

`vite-plugin-pwa` (Workbox) precaches the app shell and codecs, so repeat visits are instant and the app runs offline.

## 6. Performance budgets

`vite.config.ts` sets `chunkSizeWarningLimit: 500`, so any chunk that grows past 500 KB shows a warning in the build output. This keeps bundle size visible.

## 7. Lazy, async images in the UI

Result thumbnails use `loading="lazy"` and `decoding="async"` so rendering a large batch of previews does not block interaction.

## Ideas for further work

- Add 192 and 512 pixel (and maskable) PNG icons for a cleaner installable PWA.
- Warm up the worker on first idle so worker startup time is hidden.
- Add wasm threading (COOP and COEP headers with SharedArrayBuffer) for faster AVIF on multi-core devices.
- Statically render the tool pages for search engines.
