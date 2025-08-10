let listeners = [];

function read() {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  } catch (err) {
    return [];
  }
}

function write(list) {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem('notifications', JSON.stringify(list));
}

export function getNotifications() {
  return read();
}

export function addNotification(n) {
  const list = read();
  list.push({ ...n, timestamp: n.timestamp || new Date().toISOString(), read: false });
  write(list);
  listeners.forEach(fn => fn(list));
}

export function markNotificationsRead() {
  const list = read().map(n => ({ ...n, read: true }));
  write(list);
  listeners.forEach(fn => fn(list));
}

export function subscribeNotifications(fn) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter(l => l !== fn);
  };
}

export async function showLocalNotification(title, body) {
  try {
    const reg = await navigator.serviceWorker.ready;
    await reg.showNotification(title, { body, icon: 'icon-192.png' });
  } catch (err) {
    console.error('showLocalNotification failed', err);
  }
  addNotification({ title, body, type: 'local' });
}

export async function sendPushNotification(userId, body, title = '') {
  const base = process.env.FUNCTIONS_BASE_URL || '';
  const payload = JSON.stringify({ userId, body, title });
  const endpoints = ['send-push', 'send-webpush'];
  for (const endpoint of endpoints) {
    try {
      const resp = await fetch(`${base}/.netlify/functions/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload
      });
      if (!resp.ok) {
        const text = await resp.text();
        console.error('Push failed', endpoint, text);
      }
    } catch (err) {
      console.error('Push failed', endpoint, err);
    }
  }
}
