let listeners = [];

function read() {
  if (typeof localStorage === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('notifications') || '[]');
  } catch {
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
