import type { SelectHTMLAttributes } from 'react';
import { Icon } from './icons';

interface Props extends SelectHTMLAttributes<HTMLSelectElement> {
  /** Layout classes for the wrapper (e.g. spacing). The select itself is styled by `.select`. */
  wrapperClassName?: string;
}

// A native <select> (keyboard + accessibility for free) with a custom chevron and themed styling.
export default function Select({ wrapperClassName = '', children, ...rest }: Props) {
  return (
    <div className={`relative ${wrapperClassName}`}>
      <select {...rest} className="select">
        {children}
      </select>
      <Icon
        name="chevronDown"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
      />
    </div>
  );
}
