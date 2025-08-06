export async function cacheMediaIfNewer(url, uploadedAt) {
  if (typeof window === 'undefined' || !('caches' in window) || !url) return;
  const key = `media:${url}`;
  let ts = uploadedAt;
  if (!ts) {
    ts = localStorage.getItem(key) || new Date().toISOString();
  }
  const stored = localStorage.getItem(key);
  if (stored === ts) return;
  try {
    const cache = await caches.open('media-cache-v1');
    await cache.add(new Request(url, { mode: 'no-cors' }));
    localStorage.setItem(key, ts);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    console.error(`Failed to cache media ${url}`, msg);
  }
}
