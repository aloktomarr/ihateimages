import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import CropField from '../components/CropField';
import Select from '../components/Select';
import ToolContent from '../components/ToolContent';
import ToolHeader from '../components/ToolHeader';
import { Field, Segmented } from '../components/controls';
import { Icon } from '../components/icons';
import { MobileActionBar, SettingsPanel, StageCard, WorkspaceGrid } from '../components/Workspace';
import { processImage } from '../lib/imageEngine';
import { type CropRect, type ProcessOptions } from '../lib/imageTypes';
import { formatBytes, renameExt } from '../lib/format';
import { PASSPORT_PRESETS, mmToPx } from '../lib/passport';
import { nextPaint } from '../lib/schedule';
import { useIncomingFiles } from '../lib/incoming';
import { downloadUrl } from '../lib/download';

interface Result {
  url: string;
  size: number;
  w: number;
  h: number;
}

export default function PassportPhoto() {
  const [file, setFile] = useState<File | null>(null);
  const [presetId, setPresetId] = useState(PASSPORT_PRESETS[0].id);
  const [dpi, setDpi] = useState(300);
  const [rect, setRect] = useState<CropRect | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const urlRef = useRef<string | null>(null);

  const preset = PASSPORT_PRESETS.find((p) => p.id === presetId) ?? PASSPORT_PRESETS[0];
  const aspect = preset.wMm / preset.hMm;
  const outW = mmToPx(preset.wMm, dpi);
  const outH = mmToPx(preset.hMm, dpi);

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
      const opts: ProcessOptions = {
        targetFormat: 'image/jpeg',
        quality: 0.92,
        crop: rect,
        resize: { mode: 'exact', width: outW, height: outH },
      };
      const out = await processImage(file, opts);
      const url = URL.createObjectURL(out.blob);
      urlRef.current = url;
      setResult({ url, size: out.blob.size, w: out.width, h: out.height });
    } finally {
      setBusy(false);
    }
  }, [file, rect, outW, outH, clearResult]);

  const download = () => {
    if (!result || !file) return;
    downloadUrl(result.url, renameExt(file.name, 'jpg'));
  };

  return (
    <div className="container-page">
      <ToolHeader
        title="Passport & ID photo"
        description="Crop your photo to an official passport or ID size, with the exact pixel dimensions for printing. Everything stays on your device."
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
                      <img src={result.url} alt="Passport photo result" className="h-14 w-auto shrink-0 rounded-md shadow-soft" />
                      <p className="tabular text-[13.5px] text-muted">
                        <span className="font-semibold text-fg">Print-ready</span> &middot; {result.w}&times;{result.h}{' '}
                        &middot; {formatBytes(result.size)} &middot; JPEG
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
              <CropField file={file} aspect={aspect} onCropChange={setRect} />
              <p className="mt-3 px-1 text-[12.5px] text-muted">
                Centre your face in the box, with a little space above your head.
              </p>
            </StageCard>
          )}
        </div>

        <SettingsPanel
          footer={
            <div className={file ? 'hidden lg:block' : ''}>
              <button type="button" onClick={run} disabled={busy || !rect} className="btn btn-primary btn-lg w-full">
                {busy ? 'Creating' : 'Create photo'}
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
          <Field label="Photo size">
            <Select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
              {PASSPORT_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </Select>
          </Field>

          <Segmented
            label="Print resolution"
            value={dpi}
            onChange={setDpi}
            options={[
              { value: 300, label: '300 DPI' },
              { value: 600, label: '600 DPI' },
            ]}
            hint="300 DPI is the standard for photo printing."
          />

          <div className="flex items-center gap-4 rounded-xl bg-subtle p-4">
            <span
              className="shrink-0 rounded-[3px] border-2 border-fg bg-surface"
              style={{ width: 30 * Math.min(1, aspect), height: 30 / Math.max(1, aspect) }}
              aria-hidden
            />
            <p className="tabular text-[13px] leading-snug text-muted">
              Output <span className="font-semibold text-fg">{outW}&times;{outH}px</span>
              <br />
              {preset.wMm}&times;{preset.hMm}mm at {dpi} DPI
            </p>
          </div>
        </SettingsPanel>
      </WorkspaceGrid>

      {file && (
        <MobileActionBar busy={busy}>
          {result ? (
            <>
              <button type="button" onClick={run} disabled={busy || !rect} className="btn btn-secondary h-[3.25rem] flex-1">
                Redo
              </button>
              <button type="button" onClick={download} className="btn btn-primary btn-lg flex-1">
                <Icon name="download" className="h-4 w-4" />
                Download
              </button>
            </>
          ) : (
            <button type="button" onClick={run} disabled={busy || !rect} className="btn btn-primary btn-lg flex-1">
              {busy ? 'Creating' : 'Create photo'}
            </button>
          )}
        </MobileActionBar>
      )}

      <ToolContent slug="/passport-photo" />
    </div>
  );
}
