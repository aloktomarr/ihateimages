import type { ReactNode } from 'react';
import { Icon } from './icons';
import { formatBytes } from '../lib/format';
import { imageFilesFrom } from '../lib/incoming';

// Layout pieces shared by every tool page: the two-column workspace, the sticky settings
// panel, a progress bar and the bottom action bar used on phones.

export function WorkspaceGrid({ children }: { children: ReactNode }) {
  return <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">{children}</div>;
}

export function SettingsPanel({
  children,
  badge,
  footer,
}: {
  children: ReactNode;
  /** Optional element next to the "Settings" title. */
  badge?: ReactNode;
  /** The primary action and anything under it. */
  footer?: ReactNode;
}) {
  return (
    <aside className="lg:sticky lg:top-24">
      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-fg">Settings</h2>
          {badge}
        </div>
        <div className="space-y-6">{children}</div>
        {footer && <div className="mt-7">{footer}</div>}
      </div>
      <p className="mt-3 flex items-center justify-center gap-1.5 text-[12.5px] text-faint">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Runs on this device. Nothing is uploaded.
      </p>
    </aside>
  );
}

export function ProgressBar({ value, className = '' }: { value?: number; className?: string }) {
  const indeterminate = value === undefined;
  return (
    <div
      className={`h-1 overflow-hidden rounded-full bg-subtle ${className}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : Math.round(value * 100)}
    >
      <div
        className={`h-full rounded-full bg-on transition-[width] duration-300 ${indeterminate ? 'w-2/5 animate-progress' : ''}`}
        style={indeterminate ? undefined : { width: `${Math.max(4, value * 100)}%` }}
      />
    </div>
  );
}

/** Fixed bar at the bottom of the screen on phones, so the main action is always in reach. */
export function MobileActionBar({
  children,
  busy = false,
  progress,
}: {
  children: ReactNode;
  busy?: boolean;
  /** 0 to 1 while busy; leave out for an indeterminate bar. */
  progress?: number;
}) {
  return (
    <>
      <div className="h-24 lg:hidden" aria-hidden />
      <div
        className="nav-blur fixed inset-x-0 bottom-0 z-30 border-t border-line px-4 pt-3 lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {busy && <ProgressBar value={progress} className="absolute inset-x-0 top-0 rounded-none" />}
        <div className="mx-auto flex max-w-page items-center gap-2">{children}</div>
      </div>
    </>
  );
}

/**
 * The card that holds a single loaded image: a slim bar with its name, size and Replace/Clear,
 * then the editor or preview, then an optional result row.
 */
export function StageCard({
  file,
  onReplace,
  onClear,
  disabled,
  children,
  footer,
}: {
  file: File;
  onReplace: (files: File[]) => void;
  onClear: () => void;
  disabled?: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="card animate-fade-in overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-line py-2.5 pl-4 pr-2 sm:pl-5">
        <p className="min-w-0 truncate text-[13.5px] text-muted">
          <span className="font-semibold text-fg">{file.name}</span> &middot; {formatBytes(file.size)}
        </p>
        <div className="flex shrink-0 items-center">
          <label className={`btn btn-ghost btn-sm cursor-pointer ${disabled ? 'pointer-events-none opacity-45' : ''}`}>
            <input
              type="file"
              accept="image/*,.heic,.heif"
              hidden
              disabled={disabled}
              onChange={(e) => {
                const f = imageFilesFrom(e.target.files);
                if (f.length) onReplace(f);
                e.target.value = '';
              }}
            />
            <Icon name="refresh" className="h-4 w-4" />
            Replace
          </label>
          <button type="button" onClick={onClear} disabled={disabled} className="btn btn-ghost btn-sm">
            <Icon name="trash" className="h-4 w-4" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>
      <div className="p-3 sm:p-4">{children}</div>
      {footer && <div className="border-t border-line bg-subtle/50 px-4 py-3.5 sm:px-5">{footer}</div>}
    </div>
  );
}

/** Small overlay used on previews while a file is being processed. */
export function BusyOverlay({ label }: { label: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-black/45 backdrop-blur-[1px]">
      <span className="flex items-center gap-2.5 rounded-full bg-black/70 px-4 py-2 text-[13px] font-semibold text-white">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        {label}
      </span>
    </div>
  );
}
