// Bump the cache name whenever cached files change to ensure
// clients receive the latest versions.
const CACHE_NAME = 'videotpush-v2';
console.log('ServiceWorker script loaded', CACHE_NAME);
// Cache for images and video so large media files work offline
const MEDIA_CACHE = 'media-cache-v1';
const URLS_TO_CACHE = [
  '/',
  '/public/index.html',
];

self.addEventListener('install', event => {
  console.log('ServiceWorker installing', CACHE_NAME);
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
  console.log('ServiceWorker activating');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
});

self.addEventListener('fetch', event => {
  console.log('ServiceWorker fetch', event.request.url);
  const dest = event.request.destination;
  if (['image', 'video'].includes(dest)) {
    event.respondWith(
      caches.open(MEDIA_CACHE).then(cache =>
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
