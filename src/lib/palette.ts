// A minimal open/close signal for the command palette, so any button can open it without
// threading state through the tree.
type Listener = () => void;
const listeners = new Set<Listener>();

export function openPalette(): void {
  listeners.forEach((l) => l());
}

export function onOpenPalette(l: Listener): () => void {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** "⌘" on Apple devices, "Ctrl" elsewhere, for shortcut hints. */
export function modKeyLabel(): string {
  if (typeof navigator === 'undefined') return 'Ctrl';
  const p = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform || navigator.platform || '';
  return /mac|iphone|ipad|ipod/i.test(p) ? '⌘' : 'Ctrl';
}
