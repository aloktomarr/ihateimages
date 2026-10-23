import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// A tiny hand-off queue for images arriving from anywhere other than a tool's own upload box:
// the home page picker, a drop or paste anywhere on the page, the PWA share sheet, the desktop
// "Open with" file handler, the browser extension, or an ?src= link. Everything stays in memory.
type Listener = (files: File[]) => void;

let pending: File[] | null = null;
const listeners = new Set<Listener>();

/** Hand files to the page that is open right now (its tool is already listening). */
function deliverNow(files: File[]): boolean {
  if (!listeners.size) return false;
  listeners.forEach((l) => l(files));
  return true;
}

/** Park files for the next tool that mounts. */
function park(files: File[]): void {
  pending = files;
}

function takePending(): File[] | null {
  const f = pending;
  pending = null;
  return f;
}

/**
 * Subscribe a tool page to incoming files. Picks up anything parked before it mounted, then
 * keeps listening while it is open. `onFiles` should be stable (wrap it in useCallback).
 */
export function useIncomingFiles(onFiles: (files: File[]) => void): void {
  useEffect(() => {
    const existing = takePending();
    if (existing) onFiles(existing);
    listeners.add(onFiles);
    return () => {
      listeners.delete(onFiles);
    };
  }, [onFiles]);
}

/**
 * Returns send(files, to): opens `to` (a path, optionally with a query) with the files loaded.
 * If that page is already open, the files go straight to it instead of navigating.
 */
export function useSendFiles(): (files: File[], to: string) => void {
  const navigate = useNavigate();
  return useCallback(
    (files: File[], to: string) => {
      if (!files.length) return;
      const targetPath = to.split('?')[0];
      if (targetPath === window.location.pathname) {
        // Already there: hand over now, or park it if the page is still loading its chunk.
        if (!deliverNow(files)) park(files);
        return;
      }
      park(files);
      navigate(to);
    },
    [navigate],
  );
}

/** Keep only files we can open: any image type, plus HEIC/HEIF which often has no MIME type. */
export function imageFilesFrom(list: FileList | File[] | null | undefined): File[] {
  if (!list) return [];
  return Array.from(list).filter((f) => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
}
