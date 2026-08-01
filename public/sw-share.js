// Web Share Target handler. When someone shares an image into the installed app, the browser
// POSTs it to /share-target. We stash the file in the Cache API and redirect to the compressor,
// which reads and clears it. Nothing is sent to any server; this runs in your own service worker.
// This file is pulled into the generated Workbox service worker via workbox.importScripts.
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method === 'POST' && url.pathname === '/share-target') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request) {
  try {
    const form = await request.formData();
    const file = form.get('file') || form.get('image');
    if (file && file.size) {
      const cache = await caches.open('shared-image');
      const headers = new Headers({
        'content-type': file.type || 'application/octet-stream',
        'x-file-name': encodeURIComponent(file.name || 'shared-image'),
      });
      await cache.put('/__shared-image', new Response(file, { headers }));
    }
  } catch (err) {
    // Redirect anyway so the user still lands on the tool.
  }
  return Response.redirect(self.location.origin + '/compress?from=share', 303);
}
