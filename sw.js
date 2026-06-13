/* TrackFood service worker: cache the app shell so it works offline.
   Bump CACHE_VERSION whenever any shell file changes, so installed
   phones pick up the new version. */
'use strict';

const CACHE_VERSION = 'trackfood-v5';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './js/data.js',
  './js/seed.js',
  './js/seed2.js',
  './js/seed3.js',
  './js/store.js',
  './js/ui.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  /* Only handle same-origin GETs. Open Food Facts / Google Fonts etc.
     go straight to the network. */
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        /* opportunistically cache same-origin responses (fonts CSS excluded by origin check) */
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put(e.request, copy));
        }
        return res;
      });
    })
  );
});
