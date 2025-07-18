import { db, doc, getDoc } from './firebase.js';

async function loadInvite() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (!id) return;
  try {
    const snap = await getDoc(doc(db, 'profiles', id));
    if (!snap.exists()) return;
    const profile = snap.data();
    const inviteText = document.getElementById('invite-text');
    inviteText.textContent = `${profile.name} inviterer dig til RealDate`;
    const picEl = document.getElementById('profile-pic');
    if (profile.photoURL) {
      const img = document.createElement('img');
      img.src = profile.photoURL;
      img.alt = profile.name;
      img.className = 'w-32 h-32 rounded-full object-cover mx-auto mb-4';
      picEl.appendChild(img);
    }
    const cta = document.getElementById('cta');
    cta.href = `./index.html?ref=${id}`;
  } catch (err) {
    console.error('Failed to load profile', err);
  }
}

loadInvite();
