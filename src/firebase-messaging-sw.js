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
    self.registration.showNotification(payload.notification.title, {
      body: payload.notification.body,
      icon: 'icon-192.png'
    });
  });
}
