import { processImage } from './imageEngine';

export type PageMode = 'fit' | 'a4' | 'letter';
export type Orientation = 'auto' | 'portrait' | 'landscape';

export interface PdfOptions {
  pageMode: PageMode;
  orientation: Orientation;
  marginPt: number;
}

// Page sizes in PDF points (1/72 inch).
const SIZES: Record<'a4' | 'letter', [number, number]> = {
  a4: [595.28, 841.89],
  letter: [612, 792],
};

// Build a single PDF from a list of images, one image per page. Runs entirely in the browser:
// each image is decoded and normalized to JPEG via the engine (so HEIC/WebP/AVIF all work), then
// embedded with pdf-lib. Nothing is uploaded.
export async function imagesToPdf(files: File[], opts: PdfOptions): Promise<Blob> {
  const { PDFDocument } = await import('pdf-lib');
  const pdf = await PDFDocument.create();

  for (const file of files) {
    const out = await processImage(file, {
      targetFormat: 'image/jpeg',
      quality: 0.9,
      resize: { mode: 'longEdge', longEdge: 2500 },
    });
    const jpg = await pdf.embedJpg(await out.blob.arrayBuffer());
    const iw = jpg.width;
    const ih = jpg.height;

    if (opts.pageMode === 'fit') {
      const page = pdf.addPage([iw, ih]);
      page.drawImage(jpg, { x: 0, y: 0, width: iw, height: ih });
      continue;
    }

    let [pw, ph] = SIZES[opts.pageMode];
    const landscape =
      opts.orientation === 'landscape' || (opts.orientation === 'auto' && iw > ih);
    if (landscape) [pw, ph] = [ph, pw];

    const m = opts.marginPt;
    const scale = Math.min((pw - m * 2) / iw, (ph - m * 2) / ih);
    const w = iw * scale;
    const h = ih * scale;
    const page = pdf.addPage([pw, ph]);
    page.drawImage(jpg, { x: (pw - w) / 2, y: (ph - h) / 2, width: w, height: h });
  }

  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: 'application/pdf' });
}
