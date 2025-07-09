// Bump the cache name whenever cached files change to ensure
// clients receive the latest versions.
const CACHE_NAME = 'videotinder-v2';
const IMAGE_CACHE = 'image-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/public/index.html',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then(cache => cache.addAll(URLS_TO_CACHE))
      .catch(err => {
        // Avoid uncaught promise rejections if a file fails to cache
        console.error('Precache failed', err);
      })
  );
});

// Remove old caches on activate so updates are picked up immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE).then(cache =>
        cache.match(event.request).then(response => {
          if (response) return response;
          return fetch(event.request)
            .then(networkResponse => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
        })
      )
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
