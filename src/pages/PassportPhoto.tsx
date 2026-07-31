import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import CropField from '../components/CropField';
import Select from '../components/Select';
import Spinner from '../components/Spinner';
import ToolContent from '../components/ToolContent';
import { processImage } from '../lib/imageEngine';
import { type CropRect, type ProcessOptions } from '../lib/imageTypes';
import { formatBytes, renameExt } from '../lib/format';
import { PASSPORT_PRESETS, mmToPx } from '../lib/passport';

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

  const run = useCallback(async () => {
    if (!file || !rect) return;
    setBusy(true);
    clearResult();
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
    const a = document.createElement('a');
    a.href = result.url;
    a.download = renameExt(file.name, 'jpg');
    a.click();
  };

  return (
    <section>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Passport &amp; ID photo</h1>
      <p className="mb-5 max-w-2xl text-[15px] text-muted">
        Crop your photo to an official passport or ID size with the correct pixel dimensions for
        printing. Everything stays on your device.
      </p>

      {!file && <Dropzone multiple={false} onFiles={onFiles} />}

      {file && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <CropField file={file} aspect={aspect} onCropChange={setRect} />

          <aside className="space-y-4">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg">Photo size</span>
              <Select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
                {PASSPORT_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </label>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg">Print resolution</span>
              <Select value={dpi} onChange={(e) => setDpi(Number(e.target.value))}>
                <option value={300}>300 DPI (standard)</option>
                <option value={600}>600 DPI (high)</option>
              </Select>
            </label>

            <div className="card p-3 text-xs text-muted">
              Output: <span className="font-semibold text-fg">{outW}×{outH}px</span> at {dpi} DPI (
              {preset.wMm}×{preset.hMm}mm).
            </div>

            <button type="button" onClick={run} disabled={busy || !rect} className="btn-primary w-full">
              {busy ? 'Working' : 'Create photo'}
            </button>
            {busy && <Spinner label="Processing on your device" />}
            <button
              type="button"
              onClick={() => {
                clearResult();
                setFile(null);
              }}
              className="btn-ghost w-full"
            >
              Choose another image
            </button>

            {result && (
              <div className="card space-y-2 p-3">
                <img src={result.url} alt="Passport result" className="mx-auto rounded-lg" style={{ maxWidth: 200 }} />
                <p className="text-xs text-muted">
                  {result.w}×{result.h} · {formatBytes(result.size)} · JPEG
                </p>
                <button type="button" onClick={download} className="btn-primary w-full">
                  Download
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <ToolContent slug="/passport-photo" />
    </section>
  );
}
