import { useCallback, useRef, useState } from 'react';
import { Icon } from './icons';

interface Props {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
}

export default function Dropzone({ accept = 'image/*,.heic,.heif', multiple = true, onFiles }: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (list: FileList | null) => {
      if (!list) return;
      const files = Array.from(list).filter(
        (f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name),
      );
      if (files.length) onFiles(files);
    },
    [onFiles],
  );

  return (
    <div
      role="button"
      tabIndex={0}
      onDragOver={(e) => {
        e.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDrag(false);
        handle(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click();
      }}
      className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition ${
        drag ? 'border-accent bg-hover' : 'border-line hover:bg-hover'
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => handle(e.target.files)}
      />
      <Icon name="upload" className="mx-auto mb-2 h-7 w-7 text-muted" />
      <p className="font-semibold text-fg">Drop images here or click to browse</p>
      <p className="mt-1 text-xs text-muted">
        Files never leave your device. JPEG, PNG, WebP, AVIF, HEIC
      </p>
    </div>
  );
}
