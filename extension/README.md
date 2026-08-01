# iHateImages browser extension

Adds a right-click menu item, "Compress with iHateImages", on any image on the web. Selecting it
opens the image in the iHateImages compressor so you can shrink and download it. The image is
fetched by the extension and passed to the page in your browser. Nothing is uploaded to a server.

## How it works

1. `background.js` adds the context-menu item and, on click, fetches the image bytes and stores
   them briefly with `chrome.storage.local`, then opens `https://ihateimages.com/compress`.
2. `content.js` runs on ihateimages.com, reads those bytes, and hands them to the page with
   `window.postMessage`, then clears the stored copy.
3. The web app's incoming-image bridge receives the message and loads the image into the tool.

## Load it for testing (unpacked)

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on Developer mode.
3. Choose "Load unpacked" and select this `extension` folder.
4. Right-click any image on a web page and choose "Compress with iHateImages".

To test against a local dev server, add `"http://localhost:5173/*"` to `content_scripts[0].matches`
and change `APP_URL` in `background.js` to your local URL.

## Permissions, and why they are needed

- `contextMenus`: adds the right-click menu item.
- `storage` and `unlimitedStorage`: briefly hold the image bytes between the click and the tab
  opening, without a size cap.
- `host_permissions: <all_urls>`: lets the background worker fetch the image you right-clicked from
  any site. This is required because pages themselves usually block cross-origin image reads.

## Before publishing

- Add icons (16, 48, 128 px) and reference them in `manifest.json`.
- Consider narrowing `host_permissions` to `optional_host_permissions` requested on demand.
- Bump the `version` and fill in store listing details.
