export function getCurrentDate(){
  const offset = parseInt(localStorage.getItem('dayOffset') || '0', 10);
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

export function getTodayStr(){
  return getCurrentDate().toISOString().split('T')[0];
}

export function advanceDay(){
  const off = parseInt(localStorage.getItem('dayOffset') || '0', 10) + 1;
  localStorage.setItem('dayOffset', off);
}

export function resetDay(){
  localStorage.removeItem('dayOffset');
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
