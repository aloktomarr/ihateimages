// Optional, privacy-friendly analytics (Microsoft Clarity). This no-ops unless VITE_CLARITY_ID is
// set, so nothing loads in development or before you configure it. Your images are processed only
// on your device and are never sent to any analytics service.
type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

export function initAnalytics(): void {
  const id = (import.meta.env as Record<string, string | undefined>).VITE_CLARITY_ID;
  if (!id) return;

  const w = window as unknown as { clarity?: ClarityFn };
  if (!w.clarity) {
    const stub: ClarityFn = (...args: unknown[]) => {
      (stub.q = stub.q || []).push(args);
    };
    w.clarity = stub;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${id}`;
  document.head.appendChild(script);
}
