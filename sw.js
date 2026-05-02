// ACEtech Station Service Worker v3
// Change version number to force cache refresh
const CACHE_VERSION = 'acetech-v3';

// On install - skip waiting so new SW activates immediately
self.addEventListener('install', event => {
  self.skipWaiting();
});

// On activate - delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch - network first, fall back to cache for the HTML page only
self.addEventListener('fetch', event => {
  // Never cache API calls
  if (event.request.url.includes('script.google.com')) return;
  if (event.request.url.includes('fonts.googleapis.com')) return;
  if (event.request.url.includes('cdnjs.cloudflare.com')) return;

  // For the station HTML - network first, cache as fallback
  if (event.request.url.includes('station2.html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
  }
});
