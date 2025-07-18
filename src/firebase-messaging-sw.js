importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

let messaging;

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'INIT_FIREBASE') {
    firebase.initializeApp(event.data.config);
    messaging = firebase.messaging();
    handleBackgroundMessages();
  }
});

// Show notifications for background messages after Firebase is initialized
function handleBackgroundMessages() {
  if (!messaging) return;
  messaging.onBackgroundMessage(payload => {
    const n = payload.notification || {};
    const d = payload.data || {};
    const title = n.title || 'RealDate';
    const body = n.body || title;
    self.registration.showNotification(title, {
      body,
      icon: 'icon-192.png',
      silent: d.silent === 'true' || n.silent === true
    });
  });
}

self.addEventListener('push', event => {
  let data = {};
  if (event.data) {
    try { data = event.data.json(); } catch { data = { body: event.data.text() }; }
  }
  const title = data.title || 'RealDate';
  const body = data.body || title;
  event.waitUntil((async () => {
    await self.registration.showNotification(title, {
      body,
      icon: 'icon-192.png',
      silent: data.silent === true || data.silent === 'true'
    });
    const clientsArr = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsArr) {
      client.postMessage({ type: 'PUSH_RECEIVED', payload: data });
    }
  })());
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
      const root = self.registration.scope;
      for (const client of clientsArr) {
        if (client.url.startsWith(root) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(root);
    })
  );
});
