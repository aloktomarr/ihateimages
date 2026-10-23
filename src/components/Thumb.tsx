import { useState } from 'react';
import { Icon } from './icons';

// An image preview that degrades to a labelled placeholder when the browser cannot draw the
// file (HEIC outside Safari, for example). The file itself still processes fine.
export default function Thumb({
  src,
  alt,
  label,
  fit = 'cover',
  className = '',
}: {
  src?: string;
  alt: string;
  /** Short format label shown on the placeholder, e.g. "HEIC". */
  label?: string;
  fit?: 'cover' | 'contain';
  className?: string;
}) {
  const [broken, setBroken] = useState(false);
  if (!src || broken) {
    return (
      <div className={`grid place-items-center bg-subtle text-muted ${className}`}>
        <span className="flex flex-col items-center gap-1">
          <Icon name="image" className="h-6 w-6" />
          {label && <span className="text-[11px] font-bold tracking-wide">{label}</span>}
        </span>
      </div>
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      onError={() => setBroken(true)}
      className={`${fit === 'cover' ? 'object-cover' : 'object-contain'} ${className}`}
    />
  );
}
