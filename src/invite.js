import { db, doc, getDoc } from './firebase.js';

async function loadInvite() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const gift = params.has('gift');
  if (!id) return;
  try {
    const snap = await getDoc(doc(db, 'profiles', id));
    if (!snap.exists()) return;
    const profile = snap.data();
    const inviteText = document.getElementById('invite-text');
    inviteText.textContent = gift ? `${profile.name} giver dig gratis premium i 3 måneder` : `${profile.name} inviterer dig til RealDate`;
    const picEl = document.getElementById('profile-pic');
    if (profile.photoURL) {
      const img = document.createElement('img');
      img.src = profile.photoURL;
      img.alt = profile.name;
      img.className = 'w-20 h-20 rounded-lg object-cover mr-4';
      picEl.appendChild(img);
    }
    const cta = document.getElementById('cta');
    cta.href = gift ? `./index.html?gift=${id}` : `./index.html?ref=${id}`;
  } catch (err) {
    console.error('Failed to load profile', err);
  }
}

loadInvite();
