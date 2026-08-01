// Wait for the browser to paint the current frame before starting heavy, blocking work.
// This keeps INP (Interaction to Next Paint) low: after a click, the next paint becomes the
// "processing" state rather than the end of a multi-second encode or model run. Two nested
// requestAnimationFrame calls guarantee at least one full frame has been painted.
export function nextPaint(): Promise<void> {
  if (typeof requestAnimationFrame === 'undefined') return Promise.resolve();
  return new Promise((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
}
