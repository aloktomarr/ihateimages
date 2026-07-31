# iHateImages

A **private, watermark-free, 100% client-side image toolkit**. Compress, convert, resize and
clean images entirely in the browser — no upload, no sign-up, no watermark, works offline.

Built as a companion to the [ihatepdf feasibility study](../ihatepdf-feasibility-study.md): same
playbook (a boring-but-universal need that incumbents ruined with watermarks and paywalls), applied
to images.

## Live tools

| Tool | What it does |
|---|---|
| **Compress** | Shrink JPEG/PNG/WebP/AVIF/HEIC at chosen quality, optional dimension cap |
| **Convert** | HEIC/JPEG/PNG/WebP/AVIF → any format (great for iPhone HEIC photos) |
| **Resize** | Fit long-edge, percentage, or exact WxH with aspect lock |
| **Strip metadata** | Detect + remove GPS location, camera info and timestamps |

Roadmap tools (background removal, crop, upscale, favicon/app-icon, passport photo) are shown on the
home grid as "Soon".

## Tech stack

- **Vite + React + TypeScript** app shell, **Tailwind CSS** design system.
- **Web Worker + OffscreenCanvas + Comlink** — all pixel work runs off the main thread.
- **Native canvas codecs** for JPEG/PNG/WebP (fast, zero-dependency).
- **[@jsquash/avif](https://github.com/jamsinclair/jSquash)** (Squoosh wasm) for AVIF, lazy-loaded.
- **heic2any** (libheif) for HEIC decode, lazy-loaded.
- **exifr** for metadata scanning, **fflate** for "download all" zips.
- **vite-plugin-pwa** for offline / installable PWA.

## Getting started

```powershell
npm install
npm run dev        # start dev server
npm run build      # typecheck + production build
npm run preview    # preview the production build
```

## How it works (data flow)

```
File → [HEIC? → heic2any → PNG] → ArrayBuffer ──(transfer)──▶ Web Worker
                                                              │ createImageBitmap
                                                              │ OffscreenCanvas draw/resize
                                                              │ convertToBlob (jpeg/png/webp)
                                                              │ or @jsquash/avif encode
                                                              ▼
                                          Blob ◀── result (size, dimensions) → download / zip
```

Nothing is ever uploaded. See [PERFORMANCE.md](PERFORMANCE.md) for the optimization notes.

## Notes / limitations

- AVIF encoding uses a wasm codec (~a few hundred KB) fetched on first AVIF use.
- Very large images are bounded by tab memory (same trade-off every client-side tool has).
- SPA routes need a host rewrite (serve `index.html` for unknown paths) for deep links.
- PWA icons currently reference the SVG favicon; add 192/512 PNGs for full install polish.
