import { useEffect, useRef } from 'react';
import { useSendFiles } from '../lib/incoming';

const SHARED_CACHE = 'shared-image';
const SHARED_KEY = '/__shared-image';

// Pull the file the service worker stashed after a Web Share Target POST, then clear it.
async function pickupSharedImage(): Promise<File | null> {
  if (!('caches' in window)) return null;
  try {
    const cache = await caches.open(SHARED_CACHE);
    const res = await cache.match(SHARED_KEY);
    if (!res) return null;
    const blob = await res.blob();
    const name = decodeURIComponent(res.headers.get('x-file-name') || 'shared-image');
    await cache.delete(SHARED_KEY);
    return new File([blob], name, { type: blob.type || 'image/*' });
  } catch {
    return null;
  }
}

// Best effort fetch for ?src=<url>. Works for same-origin images and any image whose host
// allows cross-origin reads; otherwise it fails quietly and the user just sees the empty tool.
async function fetchSrc(src: string): Promise<File | null> {
  try {
    const res = await fetch(src, { mode: 'cors' });
    if (!res.ok) return null;
    const blob = await res.blob();
    if (!blob.type.startsWith('image/')) return null;
    const name = src.split('/').pop()?.split('?')[0] || 'image';
    return new File([blob], name, { type: blob.type });
  } catch {
    return null;
  }
}

// Wires up every way an image can enter the app from outside the page, then hands the file to
// the compressor. Rendered once at the app root.
export default function IncomingImageBridge() {
  const send = useSendFiles();
  const sendRef = useRef(send);
  sendRef.current = send;

  useEffect(() => {
    let active = true;

    const deliver = (file: File) => {
      if (!active) return;
      sendRef.current([file], '/compress');
    };

    // 1. Desktop "Open with" via the File Handling API.
    window.launchQueue?.setConsumer(async (params) => {
      const handle = params.files?.[0];
      if (!handle) return;
      try {
        deliver(await handle.getFile());
      } catch {
        /* ignore a handle we cannot read */
      }
    });

    // 2. Browser extension posts the right-clicked image into the page.
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const d = e.data as
        | { source?: string; name?: string; type?: string; buffer?: ArrayBuffer }
        | null;
      if (d && d.source === 'ihateimages-extension' && d.buffer instanceof ArrayBuffer) {
        deliver(new File([d.buffer], d.name || 'image', { type: d.type || 'image/png' }));
      }
    };
    window.addEventListener('message', onMessage);
    // Let the extension content script know a listener is ready.
    window.postMessage({ source: 'ihateimages-app', ready: true }, window.location.origin);

    // 3. Share sheet result and ?src= links.
    const params = new URLSearchParams(window.location.search);
    void (async () => {
      if (params.get('from') === 'share') {
        const file = await pickupSharedImage();
        if (file) deliver(file);
      }
      const src = params.get('src');
      if (src) {
        const file = await fetchSrc(src);
        if (file) deliver(file);
      }
    })();

    return () => {
      active = false;
      window.removeEventListener('message', onMessage);
    };
  }, []);

  return null;
}
