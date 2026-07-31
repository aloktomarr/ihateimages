// Standard passport / ID photo sizes. Aspect ratio drives the crop; the physical size plus the
// chosen DPI drives the exact output pixel dimensions so the print is the correct size.
export interface PassportPreset {
  id: string;
  label: string;
  wMm: number;
  hMm: number;
}

export const PASSPORT_PRESETS: PassportPreset[] = [
  { id: 'us', label: 'US passport & visa - 2x2 in (51x51mm)', wMm: 51, hMm: 51 },
  { id: 'eu', label: 'EU / UK / Schengen - 35x45mm', wMm: 35, hMm: 45 },
  { id: 'in', label: 'India - 35x45mm', wMm: 35, hMm: 45 },
  { id: 'cn', label: 'China visa - 33x48mm', wMm: 33, hMm: 48 },
  { id: 'ca', label: 'Canada - 50x70mm', wMm: 50, hMm: 70 },
  { id: 'au', label: 'Australia - 35x45mm', wMm: 35, hMm: 45 },
];

export function mmToPx(mm: number, dpi: number): number {
  return Math.round((mm / 25.4) * dpi);
}
