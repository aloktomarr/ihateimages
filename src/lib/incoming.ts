// A tiny queue for images arriving from outside the page: the PWA share sheet, the desktop
// "Open with" file handler, the browser extension, or an ?src= link. Any tool built on
// ImageToolShell picks these up and loads them automatically. Everything stays in memory.
type Listener = (file: File) => void;

let pending: File | null = null;
const listeners = new Set<Listener>();

// Called by the bridge when a file arrives from outside the page.
export function pushIncomingImage(file: File): void {
  pending = file;
  listeners.forEach((l) => l(file));
}

// Consume a file that arrived before a tool mounted (returns it once, then clears it).
export function takeIncomingImage(): File | null {
  const f = pending;
  pending = null;
  return f;
}

// Subscribe to files that arrive while a tool is already open. Returns an unsubscribe function.
export function onIncomingImage(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
