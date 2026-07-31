// Generate a complete favicon / app-icon set from one image, entirely on-device.
// Produces a real multi-size favicon.ico (PNG-in-ICO), individual PNGs, an apple-touch-icon,
// PWA icons, a web manifest and a copy-paste HTML snippet, all zipped with fflate.

const PNG_SIZES = [16, 32, 48, 64, 180, 192, 512];
const ICO_SIZES = [16, 32, 48];

export interface FaviconResult {
  archive: Blob;
  previews: { size: number; url: string }[];
}

async function drawSquare(bitmap: ImageBitmap, size: number): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not acquire 2D context');
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  // "cover": center-crop the source to a square so non-square inputs still work.
  const s = Math.min(bitmap.width, bitmap.height);
  const sx = (bitmap.width - s) / 2;
  const sy = (bitmap.height - s) / 2;
  ctx.drawImage(bitmap, sx, sy, s, s, 0, 0, size, size);
  return await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG encode failed'))), 'image/png'),
  );
}

// Build an ICO container whose entries are PNG images (supported by all modern browsers).
function buildIco(entries: { size: number; data: Uint8Array }[]): Uint8Array {
  const headerSize = 6 + entries.length * 16;
  const total = headerSize + entries.reduce((sum, e) => sum + e.data.length, 0);
  const buf = new Uint8Array(total);
  const view = new DataView(buf.buffer);
  view.setUint16(0, 0, true); // reserved
  view.setUint16(2, 1, true); // type: 1 = icon
  view.setUint16(4, entries.length, true);

  let entryPtr = 6;
  let dataPtr = headerSize;
  for (const e of entries) {
    buf[entryPtr] = e.size >= 256 ? 0 : e.size; // width (0 => 256)
    buf[entryPtr + 1] = e.size >= 256 ? 0 : e.size; // height
    buf[entryPtr + 2] = 0; // color palette
    buf[entryPtr + 3] = 0; // reserved
    view.setUint16(entryPtr + 4, 1, true); // color planes
    view.setUint16(entryPtr + 6, 32, true); // bits per pixel
    view.setUint32(entryPtr + 8, e.data.length, true); // data size
    view.setUint32(entryPtr + 12, dataPtr, true); // data offset
    buf.set(e.data, dataPtr);
    dataPtr += e.data.length;
    entryPtr += 16;
  }
  return buf;
}

const MANIFEST = JSON.stringify(
  {
    name: '',
    short_name: '',
    icons: [
      { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    theme_color: '#ffffff',
    background_color: '#ffffff',
    display: 'standalone',
  },
  null,
  2,
);

const README = `iHateImages - favicon package

Drop these files in your site root and add this to your <head>:

  <link rel="icon" href="/favicon.ico" sizes="any">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="apple-touch-icon" href="/apple-touch-icon.png">
  <link rel="manifest" href="/site.webmanifest">

Generated 100% in your browser. Nothing was uploaded.
`;

export async function generateFavicons(file: File): Promise<FaviconResult> {
  const bitmap = await createImageBitmap(file);
  const png = new Map<number, Uint8Array>();
  const previews: { size: number; url: string }[] = [];

  try {
    for (const size of PNG_SIZES) {
      const blob = await drawSquare(bitmap, size);
      png.set(size, new Uint8Array(await blob.arrayBuffer()));
      previews.push({ size, url: URL.createObjectURL(blob) });
    }
  } finally {
    bitmap.close();
  }

  const enc = new TextEncoder();
  const files: Record<string, Uint8Array> = {
    'favicon.ico': buildIco(ICO_SIZES.map((s) => ({ size: s, data: png.get(s)! }))),
    'favicon-16x16.png': png.get(16)!,
    'favicon-32x32.png': png.get(32)!,
    'favicon-48x48.png': png.get(48)!,
    'favicon-64x64.png': png.get(64)!,
    'apple-touch-icon.png': png.get(180)!,
    'android-chrome-192x192.png': png.get(192)!,
    'android-chrome-512x512.png': png.get(512)!,
    'site.webmanifest': enc.encode(MANIFEST),
    'README.txt': enc.encode(README),
  };

  const { zipSync } = await import('fflate');
  const zip = zipSync(files, { level: 6 });
  return { archive: new Blob([zip], { type: 'application/zip' }), previews };
}
