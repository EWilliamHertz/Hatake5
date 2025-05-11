const CACHE_NAME = 'hatake-v1';
const ASSETS = [
  '/',
  '/css/main.css',
  '/js/main.js',
  '/images/logo.svg'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request)
      .then(response => response || fetch(e.request))
});
