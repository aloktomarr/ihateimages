// AVIF encoding via the Squoosh WebAssembly codec (jSquash).
// Imported dynamically so the wasm is only fetched when a user actually picks AVIF
// This is a core "ship it only when needed" optimisation.
export async function encodeAvif(imageData: ImageData, quality: number): Promise<ArrayBuffer> {
  const mod = (await import('@jsquash/avif')) as unknown as {
    encode: (data: ImageData, options?: { quality?: number }) => Promise<ArrayBuffer>;
  };
  const q = Math.max(1, Math.min(100, Math.round(quality * 100)));
  return mod.encode(imageData, { quality: q });
}
