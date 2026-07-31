# Performance notes (the Addy Osmani playbook, applied)

This project deliberately follows the web-performance principles Addy Osmani is known for
(_Learning Patterns_, _Image Optimization_, and years of Chrome DevRel guidance). Each technique
below maps to a concrete decision in the code.

## 1. Get off the main thread
Decoding, resizing and encoding an image can block the UI for hundreds of milliseconds. All of it
runs in a **Web Worker** using **OffscreenCanvas**, so the main thread stays free and the interface
never janks.
- `src/workers/image.worker.ts` — the worker.
- `src/lib/imageEngine.ts` — wraps it with **Comlink** and **transfers** (not copies) the pixel
  buffer with `Comlink.transfer(...)` for a zero-copy handoff.

## 2. Ship less JavaScript, and ship it later
- **Route-based code splitting:** every tool page is a `React.lazy()` chunk (`src/App.tsx`), so the
  landing page ships almost no tool code.
- **On-demand codecs:** the AVIF wasm (`@jsquash/avif`) and HEIC decoder (`heic2any`) are behind
  dynamic `import()` and only fetched when the user actually needs them. The "download all" zip
  library (`fflate`) is loaded only when a batch is zipped.

## 3. Use modern image formats
The whole product is about producing **WebP** and **AVIF** — the formats Addy champions for the web —
and it accepts **HEIC** input so iPhone users aren't stuck. WebP/JPEG/PNG use the browser's built-in
encoders; AVIF uses the Squoosh codec.

## 4. Respect memory
- Object URLs for previews are tracked and **revoked** on new runs and on unmount
  (`src/components/ImageToolShell.tsx`), preventing leaks during batch work.
- `ImageBitmap`s are explicitly `.close()`d after drawing.
- Honest device limits: memory bounds large-file processing, as with any client-side tool.

## 5. Cache the shell, work offline
`vite-plugin-pwa` (Workbox) precaches the app shell and codecs, so repeat visits are instant and the
app runs fully **offline** — a first-class feature, not an afterthought.

## 6. Performance budgets
`vite.config.ts` sets `chunkSizeWarningLimit: 500` so any chunk that grows past 500 KB fails loudly
in the build output, keeping bundle creep visible.

## 7. Lazy, async images in the UI
Result thumbnails use `loading="lazy"` and `decoding="async"` so rendering a large batch of previews
doesn't block interaction.

## Ideas for further optimization
- Add 192/512 (and maskable) PNG icons for a polished installable PWA.
- Pre-warm the worker on first interaction (idle) to hide worker startup latency.
- Add `wasm` threading (COOP/COEP + `SharedArrayBuffer`) for faster AVIF on multi-core devices.
- Static-render the tool landing pages (SSG) for SEO — the ihatepdf growth engine.
