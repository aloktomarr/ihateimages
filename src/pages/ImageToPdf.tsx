import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import Select from '../components/Select';
import Spinner from '../components/Spinner';
import ToolContent from '../components/ToolContent';
import { imagesToPdf, type Orientation, type PageMode } from '../lib/pdf';
import { formatBytes } from '../lib/format';
import { nextPaint } from '../lib/schedule';

export default function ImageToPdf() {
  const [files, setFiles] = useState<File[]>([]);
  const [thumbs, setThumbs] = useState<string[]>([]);
  const [pageMode, setPageMode] = useState<PageMode>('a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [busy, setBusy] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState(0);
  const urls = useRef<string[]>([]);

  const cleanup = useCallback(() => {
    urls.current.forEach(URL.revokeObjectURL);
    urls.current = [];
  }, []);
  useEffect(() => cleanup, [cleanup]);

  const onFiles = useCallback(
    (incoming: File[]) => {
      cleanup();
      setFiles(incoming);
      setThumbs(
        incoming.map((f) => {
          const u = URL.createObjectURL(f);
          urls.current.push(u);
          return u;
        }),
      );
      setPdfUrl(null);
    },
    [cleanup],
  );

  const make = useCallback(async () => {
    if (!files.length) return;
    setBusy(true);
    setPdfUrl(null);
    // Paint the busy state before building the PDF so the click stays responsive (good INP).
    await nextPaint();
    try {
      const blob = await imagesToPdf(files, {
        pageMode,
        orientation,
        marginPt: pageMode === 'fit' ? 0 : 28,
      });
      const url = URL.createObjectURL(blob);
      urls.current.push(url);
      setPdfUrl(url);
      setPdfSize(blob.size);
    } finally {
      setBusy(false);
    }
  }, [files, pageMode, orientation]);

  const download = () => {
    if (!pdfUrl) return;
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'images.pdf';
    a.click();
  };

  return (
    <section>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Image to PDF</h1>
      <p className="mb-5 max-w-2xl text-[15px] text-muted">
        Combine JPG, PNG, WebP, AVIF or HEIC images into a single PDF, in the order you drop them.
        100% in your browser, no upload, no watermark.
      </p>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="lg:col-start-1 lg:row-start-1">
          <Dropzone onFiles={onFiles} />
          {thumbs.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {thumbs.map((t, i) => (
                <img
                  key={i}
                  src={t}
                  alt={`Page ${i + 1}`}
                  width={72}
                  height={72}
                  loading="lazy"
                  decoding="async"
                  style={{ width: 72, height: 72 }}
                  className="rounded-lg border border-line bg-hover object-cover"
                />
              ))}
            </div>
          )}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20 lg:col-start-2 lg:row-start-1 lg:self-start">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-fg">Page size</span>
            <Select value={pageMode} onChange={(e) => setPageMode(e.target.value as PageMode)}>
              <option value="a4">A4</option>
              <option value="letter">US Letter</option>
              <option value="fit">Fit to each image</option>
            </Select>
          </label>

          {pageMode !== 'fit' && (
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg">Orientation</span>
              <Select
                value={orientation}
                onChange={(e) => setOrientation(e.target.value as Orientation)}
              >
                <option value="auto">Auto</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </Select>
            </label>
          )}

          <button
            type="button"
            onClick={make}
            disabled={busy || files.length === 0}
            className="btn-primary w-full"
          >
            {busy ? 'Building PDF' : 'Create PDF'}
          </button>
          {busy && <Spinner label="Building your PDF" />}
          {files.length === 0 && (
            <p className="text-xs text-muted">Drop images on the left to begin.</p>
          )}

          {pdfUrl && (
            <div className="card space-y-2 p-3">
              <p className="text-sm text-fg">
                PDF ready ({files.length} page{files.length > 1 ? 's' : ''} &middot;{' '}
                {formatBytes(pdfSize)})
              </p>
              <button type="button" onClick={download} className="btn-primary w-full">
                Download PDF
              </button>
            </div>
          )}
        </aside>
      </div>

      <ToolContent slug="/image-to-pdf" />
    </section>
  );
}
