export async function cacheMediaIfNewer(url, uploadedAt) {
  if (typeof window === 'undefined' || !('caches' in window)) return;
  if (!url || !uploadedAt) return;
  const key = `media:${url}`;
  const stored = localStorage.getItem(key);
  if (stored === uploadedAt) return;
  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error('Failed request');
    const cache = await caches.open('media-cache-v1');
    await cache.put(url, resp.clone());
    localStorage.setItem(key, uploadedAt);
  } catch (err) {
    console.error('Failed to cache media', err);
  }
}
