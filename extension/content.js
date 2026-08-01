// Runs on ihateimages.com. It hands the image the user right-clicked (fetched by the extension's
// background worker) to the page, then clears it. The image is passed in-browser via postMessage
// and never leaves the machine.
(function () {
  let payload = null;

  function toArrayBuffer(base64) {
    const bin = atob(base64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return bytes.buffer;
  }

  function send() {
    if (!payload) return;
    window.postMessage(
      {
        source: 'ihateimages-extension',
        name: payload.name,
        type: payload.type,
        buffer: toArrayBuffer(payload.base64),
      },
      window.location.origin,
    );
  }

  // The app tells us when its listener is ready, so we do not post before it can hear us.
  window.addEventListener('message', (e) => {
    if (e.source !== window || e.origin !== window.location.origin) return;
    const d = e.data;
    if (d && d.source === 'ihateimages-app' && d.ready) send();
  });

  chrome.storage.local.get('pendingImage', (data) => {
    const p = data && data.pendingImage;
    if (!p) return;
    chrome.storage.local.remove('pendingImage');
    // Only use a fresh hand-off so we do not reload an old image on a later visit.
    if (Date.now() - (p.ts || 0) > 60000) return;
    payload = p;
    send(); // in case the app is already listening
  });
})();
