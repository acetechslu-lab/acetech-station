// ACEtech Station Service Worker
const CACHE_NAME = 'acetech-v4';
const STATION_URL = '/acetech-station/station2.html';

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.add(STATION_URL);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Never intercept API calls
  if (url.includes('script.google.com') ||
      url.includes('fonts.googleapis.com') ||
      url.includes('cdnjs.cloudflare.com')) {
    return;
  }

  // Cache-first for station HTML
  if (url.includes('station2.html')) {
    event.respondWith(
      caches.open(CACHE_NAME).then(cache =>
        fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => cache.match(event.request))
      )
    );
    return;
  }

  // Cache-first for other local assets (Logo, manifest, sw.js)
  if (url.includes('acetechslu-lab.github.io')) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
          return response;
        });
      })
    );
  }
});
