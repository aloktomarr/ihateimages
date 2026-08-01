// Background service worker. Adds a right-click menu on images. When clicked, it fetches the
// image bytes (the background worker can read cross-origin images), stores them briefly, and
// opens the iHateImages compressor. The content script then hands the bytes to the page.
const MENU_ID = 'ihateimages-compress';
const APP_URL = 'https://ihateimages.com/compress?from=extension';

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: MENU_ID,
    title: 'Compress with iHateImages',
    contexts: ['image'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info) => {
  if (info.menuItemId !== MENU_ID || !info.srcUrl) return;
  try {
    const res = await fetch(info.srcUrl);
    const blob = await res.blob();
    const base64 = await blobToBase64(blob);
    await chrome.storage.local.set({
      pendingImage: {
        base64,
        type: blob.type || 'image/png',
        name: fileNameFromUrl(info.srcUrl, blob.type),
        ts: Date.now(),
      },
    });
  } catch (err) {
    await chrome.storage.local.remove('pendingImage');
  }
  await chrome.tabs.create({ url: APP_URL });
});

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function fileNameFromUrl(url, type) {
  try {
    const last = new URL(url).pathname.split('/').pop() || 'image';
    if (last.includes('.')) return last;
    const ext = (type && type.split('/')[1]) || 'png';
    return `${last || 'image'}.${ext}`;
  } catch {
    return 'image.png';
  }
}
