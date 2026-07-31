// A small separable-free 3x3 sharpen (unsharp-style) convolution used by the upscaler to
// restore crispness after enlargement. Runs on ImageData in place; alpha is left untouched.
export function sharpenImageData(img: ImageData, amount: number): void {
  if (amount <= 0) return;
  const { data, width, height } = img;
  const src = new Uint8ClampedArray(data);
  const center = 1 + 4 * amount;
  const rowBytes = width * 4;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      for (let c = 0; c < 3; c++) {
        const idx = i + c;
        const up = y > 0 ? src[idx - rowBytes] : src[idx];
        const down = y < height - 1 ? src[idx + rowBytes] : src[idx];
        const left = x > 0 ? src[idx - 4] : src[idx];
        const right = x < width - 1 ? src[idx + 4] : src[idx];
        // Uint8ClampedArray assignment clamps to 0..255 automatically.
        data[idx] = center * src[idx] - amount * (up + down + left + right);
      }
    }
  }
}
