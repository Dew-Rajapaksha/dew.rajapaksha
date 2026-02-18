const CACHE_NAME = 'musix-cache-v1';

// Core files to cache immediately
const urlsToCache = [
  './',
  './index.html',
  './about.html',
  './media.html',
  './contact.html',
  './manifest.json',
  './audio'
];

// Install: cache core files
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: clean old caches
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});

// Fetch: dynamic caching for audio + core files
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // If it’s audio, cache dynamically
  if (url.pathname.startsWith('/audio/')) {
    e.respondWith(
      caches.match(e.request).then(resp => {
        if (resp) return resp;
        return fetch(e.request).then(networkResp => {
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, networkResp.clone()));
          return networkResp;
        });
      })
    );
    return;
  }

  // Default: cache first for core files
  e.respondWith(
    caches.match(e.request).then(resp => resp || fetch(e.request))
  );
});
