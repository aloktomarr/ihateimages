// Optional, privacy-friendly analytics (Microsoft Clarity). This no-ops unless VITE_CLARITY_ID is
// set, so nothing loads in development or before you configure it. Your images are processed only
// on your device and are never sent to any analytics service.
type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[] };

// Microsoft Clarity project id. It ships in the page (public by design), so hardcoding is fine;
// set VITE_CLARITY_ID to override. Only loads in production builds so local dev/testing sessions
// are not tracked. Your images are processed on-device and are never sent to Clarity.
const CLARITY_ID =
  (import.meta.env as Record<string, string | undefined>).VITE_CLARITY_ID || 'xv7b7rr8ee';

export function initAnalytics(): void {
  if (!import.meta.env.PROD || !CLARITY_ID) return;

  const w = window as unknown as { clarity?: ClarityFn };
  if (!w.clarity) {
    const stub: ClarityFn = (...args: unknown[]) => {
      (stub.q = stub.q || []).push(args);
    };
    w.clarity = stub;
  }

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.clarity.ms/tag/${CLARITY_ID}`;
  document.head.appendChild(script);
}
