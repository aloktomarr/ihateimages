import { useCallback, useEffect, useRef, useState } from 'react';
import Dropzone from '../components/Dropzone';
import CropField from '../components/CropField';
import Select from '../components/Select';
import Slider from '../components/Slider';
import Spinner from '../components/Spinner';
import ToolContent from '../components/ToolContent';
import { processImage } from '../lib/imageEngine';
import { EXT, normalizeType, type CropRect, type ProcessOptions, type TargetFormat } from '../lib/imageTypes';
import { formatBytes, renameExt } from '../lib/format';

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

export default function Crop() {
  const [file, setFile] = useState<File | null>(null);
  const [aspectIdx, setAspectIdx] = useState(0);
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

  const run = useCallback(async () => {
    if (!file || !rect) return;
    setBusy(true);
    clearResult();
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
    const a = document.createElement('a');
    a.href = result.url;
    a.download = renameExt(file.name, EXT[result.type as TargetFormat] ?? 'png');
    a.click();
  };

  const isPng = format === 'image/png';

  return (
    <section>
      <h1 className="mb-1 text-2xl font-extrabold tracking-tight">Crop image</h1>
      <p className="mb-5 max-w-2xl text-[15px] text-muted">
        Crop freely or to a fixed aspect ratio at full resolution. No watermark, nothing uploaded.
      </p>

      {!file && <Dropzone multiple={false} onFiles={onFiles} />}

      {file && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <CropField file={file} aspect={ASPECTS[aspectIdx].value} onCropChange={setRect} />

          <aside className="space-y-4">
            <div>
              <span className="mb-1 block text-sm font-medium text-fg">Aspect ratio</span>
              <div className="flex flex-wrap gap-2">
                {ASPECTS.map((a, i) => (
                  <button
                    key={a.label}
                    type="button"
                    onClick={() => setAspectIdx(i)}
                    className={`btn-ghost ${i === aspectIdx ? 'border-accent text-accent' : ''}`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="block">
              <span className="mb-1 block text-sm font-medium text-fg">Output format</span>
              <Select value={format} onChange={(e) => setFormat(e.target.value as FormatChoice)}>
                <option value="same">Keep original</option>
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
                <option value="image/avif">AVIF</option>
              </Select>
            </label>

            <Slider
              label="Quality"
              min={1}
              max={100}
              value={quality}
              suffix="%"
              onChange={setQuality}
              disabled={isPng}
            />

            <button type="button" onClick={run} disabled={busy || !rect} className="btn-primary w-full">
              {busy ? 'Working' : 'Crop image'}
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
                <img src={result.url} alt="Cropped result" className="w-full rounded-lg" />
                <p className="text-xs text-muted">
                  {result.w}×{result.h} · {formatBytes(result.size)}
                </p>
                <button type="button" onClick={download} className="btn-primary w-full">
                  Download
                </button>
              </div>
            )}
          </aside>
        </div>
      )}

      <ToolContent slug="/crop" />
    </section>
  );
}
