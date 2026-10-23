import { useCallback, useRef, useState } from 'react';
import { Icon } from './icons';
import { imageFilesFrom } from '../lib/incoming';
import { modKeyLabel } from '../lib/palette';

interface Props {
  accept?: string;
  multiple?: boolean;
  onFiles: (files: File[]) => void;
  highlight?: boolean;
  /** "lg" is the main empty state; "tile" is a small square used as an "add more" slot. */
  variant?: 'lg' | 'tile';
  className?: string;
}

const FORMATS = ['JPG', 'PNG', 'WebP', 'AVIF', 'HEIC'];

/** Three fanned-out photo cards: the visual shorthand for "drop images here". */
export function DropArt({ active = false }: { active?: boolean }) {
  return (
    <div className="relative mx-auto h-[88px] w-[132px]" aria-hidden>
      <div
        className={`absolute left-1 top-3 h-[68px] w-[56px] rounded-xl border border-line bg-surface shadow-soft transition duration-300 ${
          active ? '-translate-x-2 -rotate-[16deg]' : '-rotate-[9deg]'
        }`}
      >
        <div className="m-1.5 h-[40px] rounded-lg bg-subtle" />
      </div>
      <div
        className={`absolute right-1 top-3 h-[68px] w-[56px] rounded-xl border border-line bg-surface shadow-soft transition duration-300 ${
          active ? 'translate-x-2 rotate-[16deg]' : 'rotate-[9deg]'
        }`}
      >
        <div className="m-1.5 h-[40px] rounded-lg bg-pop/70" />
      </div>
      <div
        className={`absolute left-1/2 top-0 grid h-[76px] w-[62px] -translate-x-1/2 place-items-center rounded-xl bg-ink text-ink-fg shadow-lift transition duration-300 ${
          active ? '-translate-y-2' : ''
        }`}
      >
        <Icon name={active ? 'download' : 'upload'} className="h-6 w-6" />
      </div>
    </div>
  );
}

export default function Dropzone({
  accept = 'image/*,.heic,.heif',
  multiple = true,
  onFiles,
  highlight = false,
  variant = 'lg',
  className = '',
}: Props) {
  const [drag, setDrag] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handle = useCallback(
    (list: FileList | null) => {
      const files = imageFilesFrom(list);
      if (files.length) onFiles(multiple ? files : files.slice(0, 1));
    },
    [onFiles, multiple],
  );

  const events = {
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      setDrag(true);
    },
    onDragLeave: () => setDrag(false),
    onDrop: (e: React.DragEvent) => {
      // preventDefault also tells the page-wide drop handler that this box took the files.
      e.preventDefault();
      setDrag(false);
      handle(e.dataTransfer.files);
    },
    onClick: () => inputRef.current?.click(),
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        inputRef.current?.click();
      }
    },
  };

  const input = (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      multiple={multiple}
      hidden
      onChange={(e) => {
        handle(e.target.files);
        e.target.value = '';
      }}
    />
  );

  if (variant === 'tile') {
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label="Add more images"
        {...events}
        className={`grid cursor-pointer place-items-center rounded-xl border-2 border-dashed text-muted transition ${
          drag ? 'border-fg bg-subtle text-fg' : 'border-line-strong hover:border-fg/40 hover:bg-subtle hover:text-fg'
        } ${className}`}
      >
        {input}
        <span className="flex flex-col items-center gap-1.5 text-[13px] font-semibold">
          <Icon name="plus" className="h-5 w-5" />
          Add more
        </span>
      </div>
    );
  }

  const active = drag || highlight;

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={multiple ? 'Choose images' : 'Choose an image'}
      {...events}
      className={`group relative flex min-h-[340px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[1.5rem] border-2 border-dashed px-6 py-12 text-center transition duration-200 sm:min-h-[400px] ${
        active ? 'border-fg bg-subtle' : 'border-line-strong bg-surface hover:border-fg/40'
      } ${className}`}
    >
      {input}
      <div className="dot-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative">
        <DropArt active={drag} />
        <p className="mt-7 text-[22px] font-semibold tracking-[-0.025em] text-fg sm:text-2xl">
          {drag ? 'Let go to add them' : multiple ? 'Drop images here' : 'Drop an image here'}
        </p>
        <p className="mt-1.5 text-[14px] text-muted">
          or{' '}
          <span className="font-semibold text-fg underline decoration-line-strong underline-offset-4 group-hover:decoration-fg">
            browse your files
          </span>
          <span className="hidden sm:inline">
            , or paste with <span className="kbd ml-0.5">{modKeyLabel()} V</span>
          </span>
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {FORMATS.map((f) => (
            <span key={f} className="rounded-md border border-line bg-surface px-2 py-0.5 text-[11.5px] font-semibold text-muted">
              {f}
            </span>
          ))}
        </div>
        {highlight && !drag && (
          <p className="mt-5 text-[13.5px] font-semibold text-fg">Add an image first, then hit the button again.</p>
        )}
      </div>
      <p className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-1.5 text-[12px] text-faint">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Files stay on this device
      </p>
    </div>
  );
}
