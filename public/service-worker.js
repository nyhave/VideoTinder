// Bump the cache name whenever cached files change to ensure
// clients receive the latest versions.
const CACHE_NAME = 'videotpush-v1';
// Cache for images, audio and video so large media files work offline
const MEDIA_CACHE = 'media-cache-v1';
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
  const dest = event.request.destination;
  if (['image', 'video', 'audio'].includes(dest)) {
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
