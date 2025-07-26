const CACHE_NAME = 'sudosolve-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/style.css',
  '/src/sudoku.js',
  '/src/app.js',
  '/manifest.json'
];

// Install event – cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Activate event – clean up old caches (optional for later versions)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

// Fetch event – serve cached content if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response =>
      response || fetch(event.request)
    )
  );
});
