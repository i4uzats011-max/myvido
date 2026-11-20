// Service Worker for FocusTube PWA & Background Sync
const CACHE_NAME = 'focustube-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Pass-through for dynamic APIs and media
  if (
    event.request.url.includes('/api/') ||
    event.request.url.includes('youtube.com') ||
    event.request.url.includes('googlevideo.com')
  ) {
    return;
  }
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
