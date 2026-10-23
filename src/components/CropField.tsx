import { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, { centerCrop, type Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import type { CropRect } from '../lib/imageTypes';

interface Props {
  file: File;
  /** Locked aspect ratio (width / height). Omit for freeform. */
  aspect?: number;
  onCropChange: (rect: CropRect | null) => void;
}

// Largest centered rectangle of the requested aspect that fits inside the image at ~90%.
// Computing it directly (instead of makeAspectCrop) avoids overflowing the image on photos
// whose orientation differs from the target ratio (e.g. 1:1 on a landscape shot).
function makeDefault(mediaW: number, mediaH: number, aspect?: number): Crop {
  if (!aspect) {
    return centerCrop({ unit: '%', width: 90, height: 90, x: 0, y: 0 }, mediaW, mediaH);
  }
  const mediaAspect = mediaW / mediaH;
  let widthPct: number;
  let heightPct: number;
  if (aspect >= mediaAspect) {
    widthPct = 90;
    heightPct = (90 * mediaAspect) / aspect;
  } else {
    heightPct = 90;
    widthPct = (90 * aspect) / mediaAspect;
  }
  return centerCrop({ unit: '%', width: widthPct, height: heightPct, x: 0, y: 0 }, mediaW, mediaH);
}

// Interactive crop selector. Emits the selection in SOURCE (natural) pixels so the engine can
// crop the full-resolution image, independent of how large the preview is rendered.
export default function CropField({ file, aspect, onCropChange }: Props) {
  const [src, setSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const imgRef = useRef<HTMLImageElement>(null);
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;

  useEffect(() => {
    const url = URL.createObjectURL(file);
    setSrc(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const toNatural = useCallback((c?: Crop): CropRect | null => {
    const img = imgRef.current;
    if (!img || !c || !c.width || !c.height) return null;
    const px =
      c.unit === '%'
        ? {
            x: (c.x / 100) * img.width,
            y: (c.y / 100) * img.height,
            width: (c.width / 100) * img.width,
            height: (c.height / 100) * img.height,
          }
        : { x: c.x, y: c.y, width: c.width, height: c.height };
    const sx = img.naturalWidth / img.width;
    const sy = img.naturalHeight / img.height;
    if (!px.width || !px.height) return null;
    const x = Math.round(px.x * sx);
    const y = Math.round(px.y * sy);
    const width = Math.round(px.width * sx);
    // With a locked ratio, derive the height from the width so rounding cannot skew it
    // (a 1:1 crop must come out exactly square), staying inside the image.
    const ratio = aspectRef.current;
    const height = ratio
      ? Math.min(Math.round(width / ratio), img.naturalHeight - y)
      : Math.round(px.height * sy);
    return { x, y, width, height };
  }, []);

  const onImageLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget;
      const c = makeDefault(img.width, img.height, aspect);
      setCrop(c);
      onCropChange(toNatural(c));
    },
    [aspect, onCropChange, toNatural],
  );

  // Re-center the selection whenever the requested aspect ratio changes.
  useEffect(() => {
    const img = imgRef.current;
    if (!img || !img.width) return;
    const c = makeDefault(img.width, img.height, aspect);
    setCrop(c);
    onCropChange(toNatural(c));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aspect]);

  return (
    <div className="checkerboard grid place-items-center overflow-hidden rounded-2xl p-2 sm:p-4">
      <ReactCrop
        crop={crop}
        onChange={(c) => setCrop(c)}
        onComplete={(c) => onCropChange(toNatural(c))}
        aspect={aspect}
        keepSelection
        ruleOfThirds
      >
        {src && (
          <img
            ref={imgRef}
            src={src}
            alt="Crop source"
            onLoad={onImageLoad}
            className="max-h-[60vh] w-auto select-none"
          />
        )}
      </ReactCrop>
    </div>
  );
}
