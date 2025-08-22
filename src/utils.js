export function getCurrentDate(){
  const offset = parseInt(localStorage.getItem('dayOffset') || '0', 10);
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

export function getDaysLeft(expiresAt){
  if(!expiresAt) return 0;
  const now = getCurrentDate();
  const exp = new Date(expiresAt);
  now.setHours(0,0,0,0);
  exp.setHours(0,0,0,0);
  return Math.ceil((exp - now)/86400000);
}

export function getTodayStr(){
  return getCurrentDate().toISOString().split('T')[0];
}

export function advanceDay(){
  const off = parseInt(localStorage.getItem('dayOffset') || '0', 10) + 1;
  localStorage.setItem('dayOffset', off);
  window.dispatchEvent(new Event('dayOffsetChange'));
}

export function resetDay(){
  localStorage.removeItem('dayOffset');
  window.dispatchEvent(new Event('dayOffsetChange'));
}

export function getAge(birthday){
  if(!birthday) return '';
  const birth = new Date(birthday);
  const today = getCurrentDate();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if(m < 0 || (m === 0 && today.getDate() < birth.getDate())){
    age--;
  }
  return age;
}

export function parseBirthday(str){
  const m = str.match(/^(\d{2})[.\/-](\d{2})[.\/-](\d{4})$/);
  if(!m) return '';
  const day = parseInt(m[1], 10);
  const month = parseInt(m[2], 10);
  const year = parseInt(m[3], 10);
  const date = new Date(Date.UTC(year, month - 1, day));
  if(
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) return '';
  return date.toISOString().split('T')[0];
}

export function detectOS(){
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';
  if (/android/i.test(ua)) return 'Android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (/Win/.test(ua)) return 'Windows';
  if (/Mac/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown';
}

export function detectBrowser(){
  if (typeof navigator === 'undefined') return '';
  const ua = navigator.userAgent || '';
  if (/Edg\//.test(ua)) return 'Edge';
  if (/OPR\//.test(ua)) return 'Opera';
  if (/Chrome\//.test(ua)) return 'Chrome';
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'Safari';
  if (/Firefox\//.test(ua)) return 'Firefox';
  return 'Unknown';
}

export function getDailyProfileLimit(user){
  const tier = user?.subscriptionTier || 'free';
  const limits = { free:3, gold:8 };
  return limits[tier] ?? limits.free;
}

export function getSuperLikeLimit(user){
  const tier = user?.subscriptionTier || 'free';
  const limits = { free:0, gold:3 };
  return limits[tier] ?? limits.free;
}

export function getMonthlyBoostLimit(user){
  const tier = user?.subscriptionTier || 'free';
  const limits = { free:0, gold:2 };
  return limits[tier] ?? limits.free;
}

export function getMaxVideoSeconds(user){
  const tier = user?.subscriptionTier || 'free';
  const caps = { free:10, gold:15 };
  return caps[tier] ?? caps.free;
}

export function hasInterestChat(user){
  const tier = user?.subscriptionTier || 'free';
  return tier === 'gold';
}

export function hasAdvancedFilters(user){
  const tier = user?.subscriptionTier || 'free';
  return tier !== 'free';
}

export function hasRatings(user){
  const tier = user?.subscriptionTier || 'free';
  return tier === 'gold';
}

export function getWeekId(date = getCurrentDate()){
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
  const weekNo = Math.ceil(((d - yearStart)/86400000 + 1)/7);
  return `${d.getUTCFullYear()}-${weekNo}`;
}

export async function clearAppCache(){
  if(typeof window === 'undefined') return;
  try{
    if('caches' in window){
      const keys = await caches.keys();
      await Promise.all(keys.map(k => caches.delete(k)));
    }
    if('localStorage' in window) localStorage.clear();
    if('indexedDB' in window && indexedDB.databases){
      const dbs = await indexedDB.databases();
      await Promise.all(dbs.map(db => db.name && indexedDB.deleteDatabase(db.name)));
    }
  }catch(err){
    console.error('Failed to clear app cache', err);
  }
}
