import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Dropzone from '../components/Dropzone';
import CropField from '../components/CropField';
import Slider from '../components/Slider';
import ToolContent from '../components/ToolContent';
import ToolHeader from '../components/ToolHeader';
import { Field, FormatPicker } from '../components/controls';
import { Icon } from '../components/icons';
import { MobileActionBar, SettingsPanel, StageCard, WorkspaceGrid } from '../components/Workspace';
import { processImage } from '../lib/imageEngine';
import { EXT, normalizeType, type CropRect, type ProcessOptions, type TargetFormat } from '../lib/imageTypes';
import { formatBytes, renameExt } from '../lib/format';
import { nextPaint } from '../lib/schedule';
import { useIncomingFiles } from '../lib/incoming';
import { downloadUrl } from '../lib/download';

const ASPECTS: { label: string; value: number | undefined }[] = [
  { label: 'Free', value: undefined },
  { label: '1:1', value: 1 },
  { label: '4:3', value: 4 / 3 },
  { label: '3:2', value: 3 / 2 },
  { label: '16:9', value: 16 / 9 },
  { label: '2:3', value: 2 / 3 },
];

type FormatChoice = 'same' | TargetFormat;

interface Result {
  url: string;
  size: number;
  w: number;
  h: number;
  type: string;
}

/** A tiny rectangle in the shape of the ratio, so the options read at a glance. */
function AspectShape({ value }: { value?: number }) {
  const w = value ? (value >= 1 ? 22 : 22 * value) : 22;
  const h = value ? (value >= 1 ? 22 / value : 22) : 16;
  return (
    <span className="grid h-7 place-items-center">
      <span
        className={`block rounded-[3px] border-2 border-current ${value ? '' : 'border-dashed'}`}
        style={{ width: w, height: h }}
      />
    </span>
  );
}

export default function Crop() {
  const [searchParams] = useSearchParams();
  const [file, setFile] = useState<File | null>(null);
  const [aspectIdx, setAspectIdx] = useState(() => {
    // Preset from the URL, e.g. /crop?aspect=1:1 for a square profile picture.
    const i = ASPECTS.findIndex((a) => a.label === searchParams.get('aspect'));
    return i >= 0 ? i : 0;
  });
  const [rect, setRect] = useState<CropRect | null>(null);
  const [format, setFormat] = useState<FormatChoice>('same');
  const [quality, setQuality] = useState(92);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const urlRef = useRef<string | null>(null);

  const clearResult = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
    setResult(null);
  }, []);
  useEffect(() => clearResult, [clearResult]);

  const onFiles = useCallback(
    (files: File[]) => {
      clearResult();
      setRect(null);
      setFile(files[0]);
    },
    [clearResult],
  );
  useIncomingFiles(onFiles);

  const run = useCallback(async () => {
    if (!file || !rect) return;
    setBusy(true);
    clearResult();
    // Paint the busy state before the encode so the click stays responsive (good INP).
    await nextPaint();
    try {
      const targetFormat: TargetFormat = format === 'same' ? normalizeType(file.type) : format;
      const opts: ProcessOptions = {
        targetFormat,
        quality: quality / 100,
        crop: rect,
        resize: { mode: 'none' },
      };
      const out = await processImage(file, opts);
      const url = URL.createObjectURL(out.blob);
      urlRef.current = url;
      setResult({ url, size: out.blob.size, w: out.width, h: out.height, type: out.outType });
    } finally {
      setBusy(false);
    }
  }, [file, rect, format, quality, clearResult]);

  const download = () => {
    if (!result || !file) return;
    downloadUrl(result.url, renameExt(file.name, EXT[result.type as TargetFormat] ?? 'png'));
  };

  const isPng = format === 'image/png';

  return (
    <div className="container-page">
      <ToolHeader
        title="Crop image"
        description="Crop freely or to a fixed aspect ratio, at full resolution. No watermark, nothing uploaded."
      />

      <WorkspaceGrid>
        <div className="min-w-0">
          {!file ? (
            <Dropzone multiple={false} onFiles={onFiles} />
          ) : (
            <StageCard
              file={file}
              onReplace={onFiles}
              onClear={() => {
                clearResult();
                setFile(null);
              }}
              disabled={busy}
              footer={
                result && (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={result.url}
                        alt="Cropped result"
                        className="checkerboard h-12 w-12 shrink-0 rounded-lg object-contain"
                      />
                      <p className="tabular text-[13.5px] text-muted">
                        <span className="font-semibold text-fg">Cropped</span> &middot; {result.w}&times;{result.h}{' '}
                        &middot; {formatBytes(result.size)}
                      </p>
                    </div>
                    <button type="button" onClick={download} className="btn btn-primary hidden sm:inline-flex">
                      <Icon name="download" className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                )
              }
            >
              <CropField file={file} aspect={ASPECTS[aspectIdx].value} onCropChange={setRect} />
              <p className="mt-3 px-1 text-[12.5px] text-muted">
                Drag the box or its corners.
                {rect && (
                  <span className="tabular">
                    {' '}
                    Selection: <span className="font-semibold text-fg">{rect.width}&times;{rect.height}px</span>
                  </span>
                )}
              </p>
            </StageCard>
          )}
        </div>

        <SettingsPanel
          footer={
            <div className={file ? 'hidden lg:block' : ''}>
              <button type="button" onClick={run} disabled={busy || !rect} className="btn btn-primary btn-lg w-full">
                {busy ? 'Cropping' : 'Crop image'}
              </button>
              {result && (
                <button type="button" onClick={download} className="btn btn-secondary btn-lg mt-2 w-full">
                  <Icon name="download" className="h-4 w-4" />
                  Download
                </button>
              )}
            </div>
          }
        >
          <Field label="Aspect ratio">
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Aspect ratio">
              {ASPECTS.map((a, i) => (
                <button
                  key={a.label}
                  type="button"
                  role="radio"
                  aria-checked={i === aspectIdx}
                  onClick={() => setAspectIdx(i)}
                  className={`flex flex-col items-center gap-1 rounded-xl border py-2.5 text-[12.5px] font-semibold transition ${
                    i === aspectIdx
                      ? 'border-fg bg-subtle text-fg shadow-[inset_0_0_0_1px_rgb(var(--fg))]'
                      : 'border-line text-muted hover:border-line-strong hover:text-fg'
                  }`}
                >
                  <AspectShape value={a.value} />
                  {a.label}
                </button>
              ))}
            </div>
          </Field>

          <FormatPicker
            value={format}
            onChange={setFormat}
            options={['same', 'image/jpeg', 'image/png', 'image/webp', 'image/avif'] as FormatChoice[]}
          />

          <Slider label="Quality" min={1} max={100} value={quality} suffix="%" onChange={setQuality} disabled={isPng} />
        </SettingsPanel>
      </WorkspaceGrid>

      {file && (
        <MobileActionBar busy={busy}>
          {result ? (
            <>
              <button type="button" onClick={run} disabled={busy || !rect} className="btn btn-secondary h-[3.25rem] flex-1">
                Crop again
              </button>
              <button type="button" onClick={download} className="btn btn-primary btn-lg flex-1">
                <Icon name="download" className="h-4 w-4" />
                Download
              </button>
            </>
          ) : (
            <button type="button" onClick={run} disabled={busy || !rect} className="btn btn-primary btn-lg flex-1">
              {busy ? 'Cropping' : 'Crop image'}
            </button>
          )}
        </MobileActionBar>
      )}

      <ToolContent slug="/crop" />
    </div>
  );
}
