# iHateImages

A private, watermark-free image toolkit that runs entirely in your browser. Compress, convert, resize, crop, upscale, remove backgrounds, and more. No upload, no sign-up, no watermark. It works offline once loaded.

Live site: https://ihateimages.com

## Tools

| Tool | What it does |
|---|---|
| Compress | Shrink JPEG, PNG, WebP, AVIF, and HEIC at a quality you choose |
| Convert | Convert between HEIC, JPEG, PNG, WebP, and AVIF (useful for iPhone HEIC photos) |
| Resize | Resize by long edge, percentage, or exact width and height |
| Crop | Crop freely or to a fixed aspect ratio |
| Rotate and flip | Rotate in 90 degree steps and flip horizontally or vertically |
| Upscale | Enlarge 2x or 4x with high-quality resampling and sharpening |
| Remove background | On-device AI cutout to a transparent PNG |
| Strip metadata | Remove GPS location, camera info, and timestamps |
| Favicon | Generate favicon.ico, PNG icons, and a web manifest |
| Passport photo | Crop to official ID sizes at the correct DPI |
| Image to PDF | Combine images into a single PDF |

Everything runs on your device. Your files are never uploaded.

## Tech stack

- Vite, React, and TypeScript for the app, with Tailwind CSS for styling.
- A Web Worker with OffscreenCanvas and Comlink, so pixel work runs off the main thread.
- Native canvas codecs for JPEG, PNG, and WebP.
- @jsquash/avif, a WebAssembly build of the Squoosh AVIF codec, loaded on demand.
- heic2any (libheif) for decoding HEIC, loaded on demand.
- @imgly/background-removal, an ONNX model that runs on-device for background removal.
- exifr for reading metadata, fflate for zipping, and pdf-lib for PDF export.
- vite-plugin-pwa for offline support.

## Getting started

You need Node 18 or newer and npm.

```
npm install
npm run dev        # start the dev server at http://localhost:5173
npm run build      # type-check and build for production
npm run preview    # serve the production build locally
```

## How it works

An image is decoded, drawn onto a canvas, and re-encoded, all in the browser. Formats the browser cannot handle on its own use a WebAssembly codec that loads only when needed. HEIC files are decoded first, then handed to the same pipeline. The heavy work happens in a Web Worker so the interface stays responsive.

Nothing is ever sent to a server. You can confirm this by opening your browser network tab while you use a tool. See [PERFORMANCE.md](PERFORMANCE.md) for notes on how the app stays fast.

## Contributing

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) to get started, and please follow the [Code of Conduct](CODE_OF_CONDUCT.md). To report a security issue, see [SECURITY.md](SECURITY.md).

## License

Released under the [MIT License](LICENSE).

Built by Alok Tomar (https://x.com/AlokTom19637918).
