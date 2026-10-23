import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import ToolContent from '../components/ToolContent';
import ToolHeader from '../components/ToolHeader';
import Thumb from '../components/Thumb';
import { Segmented } from '../components/controls';
import { Icon } from '../components/icons';
import { MobileActionBar, ProgressBar, SettingsPanel, WorkspaceGrid } from '../components/Workspace';
import { imagesToPdf, type Orientation, type PageMode } from '../lib/pdf';
import { formatBytes } from '../lib/format';
import { nextPaint } from '../lib/schedule';
import { imageFilesFrom, useIncomingFiles } from '../lib/incoming';
import { downloadUrl } from '../lib/download';
import { formatLabel } from '../lib/suggest';

interface Page {
  file: File;
  url: string;
}

export default function ImageToPdf() {
  const [pages, setPages] = useState<Page[]>([]);
  const [pageMode, setPageMode] = useState<PageMode>('a4');
  const [orientation, setOrientation] = useState<Orientation>('auto');
  const [busy, setBusy] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfSize, setPdfSize] = useState(0);
  const urls = useRef<string[]>([]);
  const addInput = useRef<HTMLInputElement>(null);

  useEffect(
    () => () => {
      urls.current.forEach(URL.revokeObjectURL);
    },
    [],
  );

  const clearPdf = useCallback(() => {
    setPdfUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
  }, []);

  const addFiles = useCallback(
    (incoming: File[]) => {
      clearPdf();
      setPages((p) => [
        ...p,
        ...incoming.map((file) => {
          const url = URL.createObjectURL(file);
          urls.current.push(url);
          return { file, url };
        }),
      ]);
    },
    [clearPdf],
  );
  useIncomingFiles(addFiles);

  const move = (i: number, by: number) => {
    clearPdf();
    setPages((p) => {
      const j = i + by;
      if (j < 0 || j >= p.length) return p;
      const next = [...p];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const remove = (i: number) => {
    clearPdf();
    setPages((p) => {
      URL.revokeObjectURL(p[i].url);
      return p.filter((_, j) => j !== i);
    });
  };

  const clearAll = () => {
    clearPdf();
    pages.forEach((p) => URL.revokeObjectURL(p.url));
    setPages([]);
  };

  // Settings change the PDF, so drop a finished one.
  useEffect(() => {
    clearPdf();
  }, [pageMode, orientation, clearPdf]);

  const make = useCallback(async () => {
    if (!pages.length) return;
    setBusy(true);
    clearPdf();
    // Paint the busy state before building the PDF so the click stays responsive (good INP).
    await nextPaint();
    try {
      const blob = await imagesToPdf(
        pages.map((p) => p.file),
        { pageMode, orientation, marginPt: pageMode === 'fit' ? 0 : 28 },
      );
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setPdfSize(blob.size);
    } finally {
      setBusy(false);
    }
  }, [pages, pageMode, orientation, clearPdf]);

  const download = () => {
    if (pdfUrl) downloadUrl(pdfUrl, 'images.pdf');
  };

  const pageAspect = pageMode === 'fit' ? undefined : orientation === 'landscape' ? 1.414 : 0.707;
  const count = pages.length;

  return (
    <div className="container-page">
      <ToolHeader
        title="Image to PDF"
        description="Combine JPG, PNG, WebP, AVIF or HEIC images into a single PDF, in the order you choose. 100% in your browser, no upload, no watermark."
      />

      <WorkspaceGrid>
        <div className="min-w-0">
          {count === 0 ? (
            <Dropzone onFiles={addFiles} />
          ) : (
            <div className="card animate-fade-in overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 pl-4 pr-2 sm:pl-5">
                <p className="text-[13.5px] text-muted">
                  <span className="font-semibold text-fg">
                    {count} {count === 1 ? 'page' : 'pages'}
                  </span>{' '}
                  &middot; reorder with the arrows
                </p>
                <div className="flex shrink-0 items-center">
                  <input
                    ref={addInput}
                    type="file"
                    accept="image/*,.heic,.heif"
                    multiple
                    hidden
                    onChange={(e) => {
                      addFiles(imageFilesFrom(e.target.files));
                      e.target.value = '';
                    }}
                  />
                  <button type="button" onClick={() => addInput.current?.click()} disabled={busy} className="btn btn-ghost btn-sm">
                    <Icon name="plus" className="h-4 w-4" />
                    Add more
                  </button>
                  <button type="button" onClick={clearAll} disabled={busy} className="btn btn-ghost btn-sm">
                    <Icon name="trash" className="h-4 w-4" />
                    <span className="hidden sm:inline">Clear</span>
                  </button>
                </div>
              </div>

              <ol className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 sm:p-5 xl:grid-cols-4">
                {pages.map((p, i) => (
                  <li key={p.url} className="group min-w-0">
                    <div
                      className="relative mx-auto overflow-hidden rounded-lg border border-line bg-white shadow-soft"
                      style={{ aspectRatio: pageAspect ? String(pageAspect) : '3 / 4' }}
                    >
                      <div className={`absolute ${pageMode === 'fit' ? 'inset-0' : 'inset-[6%]'}`}>
                        <Thumb src={p.url} alt={`Page ${i + 1}`} label={formatLabel(p.file)} fit="contain" className="h-full w-full" />
                      </div>
                      <span className="absolute left-2 top-2 grid h-6 min-w-6 place-items-center rounded-full bg-ink px-1.5 text-[11.5px] font-bold text-ink-fg">
                        {i + 1}
                      </span>
                      {!busy && (
                        <div className="absolute inset-x-2 bottom-2 flex justify-between gap-1 transition [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:group-focus-within:opacity-100">
                          <span className="flex gap-1">
                            <button
                              type="button"
                              onClick={() => move(i, -1)}
                              disabled={i === 0}
                              aria-label={`Move page ${i + 1} earlier`}
                              className="grid h-7 w-7 place-items-center rounded-full bg-ink text-ink-fg shadow-lift disabled:opacity-30"
                            >
                              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => move(i, 1)}
                              disabled={i === count - 1}
                              aria-label={`Move page ${i + 1} later`}
                              className="grid h-7 w-7 place-items-center rounded-full bg-ink text-ink-fg shadow-lift disabled:opacity-30"
                            >
                              <Icon name="arrowRight" className="h-3.5 w-3.5" />
                            </button>
                          </span>
                          <button
                            type="button"
                            onClick={() => remove(i)}
                            aria-label={`Remove page ${i + 1}`}
                            className="grid h-7 w-7 place-items-center rounded-full bg-ink text-ink-fg shadow-lift"
                          >
                            <Icon name="close" className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="mt-2 truncate text-center text-[12px] text-muted">{p.file.name}</p>
                  </li>
                ))}
                {!busy && (
                  <li>
                    <Dropzone variant="tile" onFiles={addFiles} className="aspect-[3/4]" />
                  </li>
                )}
              </ol>

              {pdfUrl && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-subtle/50 px-4 py-3.5 sm:px-5">
                  <p className="tabular text-[13.5px] text-muted">
                    <span className="font-semibold text-fg">PDF ready</span> &middot; {count}{' '}
                    {count === 1 ? 'page' : 'pages'} &middot; {formatBytes(pdfSize)}
                  </p>
                  <button type="button" onClick={download} className="btn btn-primary hidden sm:inline-flex">
                    <Icon name="download" className="h-4 w-4" />
                    Download PDF
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <SettingsPanel
          footer={
            <div className={count ? 'hidden lg:block' : ''}>
              <button type="button" onClick={make} disabled={busy || count === 0} className="btn btn-primary btn-lg w-full">
                {busy ? 'Building PDF' : 'Create PDF'}
                {count > 1 && !busy && (
                  <span className="tabular rounded-full bg-ink-fg/15 px-2 py-0.5 text-[12px]">{count}</span>
                )}
              </button>
              {busy && <ProgressBar className="mt-3" />}
              {pdfUrl && (
                <button type="button" onClick={download} className="btn btn-secondary btn-lg mt-2 w-full">
                  <Icon name="download" className="h-4 w-4" />
                  Download PDF
                </button>
              )}
            </div>
          }
        >
          <Segmented
            label="Page size"
            value={pageMode}
            onChange={setPageMode}
            options={[
              { value: 'a4', label: 'A4' },
              { value: 'letter', label: 'Letter' },
              { value: 'fit', label: 'Fit image' },
            ]}
            hint={pageMode === 'fit' ? 'Each page takes the exact size of its image.' : undefined}
          />

          {pageMode !== 'fit' && (
            <Segmented
              label="Orientation"
              value={orientation}
              onChange={setOrientation}
              options={[
                { value: 'auto', label: 'Auto' },
                { value: 'portrait', label: 'Portrait' },
                { value: 'landscape', label: 'Landscape' },
              ]}
              hint={orientation === 'auto' ? 'Each page turns to match its image.' : undefined}
            />
          )}
        </SettingsPanel>
      </WorkspaceGrid>

      {count > 0 && (
        <MobileActionBar busy={busy}>
          {pdfUrl ? (
            <button type="button" onClick={download} className="btn btn-primary btn-lg flex-1">
              <Icon name="download" className="h-4 w-4" />
              Download PDF
            </button>
          ) : (
            <button type="button" onClick={make} disabled={busy} className="btn btn-primary btn-lg flex-1">
              {busy ? 'Building PDF' : `Create PDF (${count} ${count === 1 ? 'page' : 'pages'})`}
            </button>
          )}
        </MobileActionBar>
      )}

      <ToolContent slug="/image-to-pdf" />
    </div>
  );
}
