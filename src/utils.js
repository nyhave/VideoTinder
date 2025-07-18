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
