// Bump the cache name whenever cached files change to ensure
// clients receive the latest versions.
const CACHE_NAME = 'VideoTinder-cache-v6';
console.log('ServiceWorker script loaded', CACHE_NAME);
// Cache for images and video so large media files work offline
const MEDIA_CACHE = 'media-cache-v1';
const rel = (p) => new URL(p, self.registration.scope).href;
const URLS_TO_CACHE = [
  rel(''),
  rel('index.html'),
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

// Vis notifikationer ved push (iOS Safari m.fl.)
self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (err) {
    data = {};
  }
  const title = data.title || 'Notifikation';
  const body  = data.body  || '';
  const options = {
    body,
    icon: rel('icons/icon-192.png'),
    badge: rel('icons/badge.png'),
    tag: data.tag || 'videotpush',
    renotify: true,
    data: { url: data.url || rel('') }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Klik-adfærd: fokusér åben fane eller åbn URL
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || rel('');
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(target);
    })
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

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PING') {
    event.ports[0]?.postMessage({ type: 'PONG' });
  }
});
