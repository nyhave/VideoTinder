const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const webPush = require('web-push');

if (!admin.apps.length) {
  try {
    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      if (fs.existsSync(credPath)) {
        serviceAccount = require(credPath);
      }
    }
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
  } catch (err) {
    console.error('Failed to load Firebase credentials:', err);
  }
}

const db = admin.firestore();

if (process.env.WEB_PUSH_PUBLIC_KEY && process.env.WEB_PUSH_PRIVATE_KEY) {
  webPush.setVapidDetails(
    'mailto:nyhave@gmail.com',
    process.env.WEB_PUSH_PUBLIC_KEY,
    process.env.WEB_PUSH_PRIVATE_KEY
  );
}

function parseTime(str) {
  if (!str) return null;
  const [h, m] = str.split(':').map(Number);
  return { h, m };
}

function inDnd(prefs, now) {
  const start = parseTime(prefs.dndStart);
  const end = parseTime(prefs.dndEnd);
  if (!start || !end) return false;
  const s = new Date(now);
  s.setHours(start.h, start.m || 0, 0, 0);
  const e = new Date(now);
  e.setHours(end.h, end.m || 0, 0, 0);
  if (start.h > end.h || (start.h === end.h && (start.m || 0) > (end.m || 0))) {
    if (now >= s) {
      e.setDate(e.getDate() + 1);
    } else {
      s.setDate(s.getDate() - 1);
    }
  }
  return now >= s && now < e;
}

function dndEndTime(prefs, now) {
  const end = parseTime(prefs.dndEnd);
  if (!end) return now;
  const e = new Date(now);
  e.setHours(end.h, end.m || 0, 0, 0);
  const start = parseTime(prefs.dndStart);
  if (start && (start.h > end.h || (start.h === end.h && (start.m || 0) > (end.m || 0))) && now >= e) {
    e.setDate(e.getDate() + 1);
  }
  if (start && (start.h > end.h || (start.h === end.h && (start.m || 0) > (end.m || 0))) && now < e) {
    // nothing
  }
  if (now >= e) {
    e.setDate(e.getDate() + 1);
  }
  return e;
}

async function sendAll(userId, title, body, tokensByUser, subsByUser) {
  const tokens = tokensByUser[userId] || [];
  if (tokens.length) {
    try {
      const res = await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
        data: { title, body }
      });
      const bad = res.responses
        .map((r, i) => (!r.success ? tokens[i] : null))
        .filter(Boolean);
      if (bad.length) {
        const batch = db.batch();
        bad.forEach(t => batch.delete(db.collection('pushTokens').doc(t)));
        await batch.commit();
      }
    } catch (err) {
      console.error('FCM send error', err);
    }
  }

  const subs = subsByUser[userId] || [];
  if (subs.length) {
    const payload = JSON.stringify({ title, body });
    for (const sub of subs) {
      try {
        await webPush.sendNotification(sub, payload);
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          const safeId = Buffer.from(sub.endpoint)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
          db.collection('webPushSubscriptions').doc(safeId).delete().catch(() => {});
        }
      }
    }
  }
}

exports.handler = async function(event) {
  console.log('notify-new-clips function triggered');
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  const now = new Date();

  const tokensSnap = await db.collection('pushTokens').get();
  const subsSnap = await db.collection('webPushSubscriptions').get();
  const profilesSnap = await db.collection('profiles').get();

  const tokensByUser = {};
  tokensSnap.docs.forEach(d => {
    const { userId } = d.data();
    if (!tokensByUser[userId]) tokensByUser[userId] = [];
    tokensByUser[userId].push(d.id);
  });

  const subsByUser = {};
  subsSnap.docs.forEach(d => {
    const data = d.data();
    if (!subsByUser[data.userId]) subsByUser[data.userId] = [];
    subsByUser[data.userId].push(data);
  });

  const pendingSnap = await db
    .collection('scheduledPushes')
    .where('sendAfter', '<=', now.toISOString())
    .get();
  await Promise.all(
    pendingSnap.docs.map(async d => {
      const { userId, title, body } = d.data();
      await sendAll(userId, title, body, tokensByUser, subsByUser);
      await d.ref.delete();
    })
  );

  await Promise.all(
    profilesSnap.docs.map(async p => {
      const prefs = p.data().notificationPrefs || {};
      if (prefs.types && prefs.types.newClips === false) return;
      const userId = p.id;
      if (!tokensByUser[userId] && !subsByUser[userId]) return;
      if (inDnd(prefs, now)) {
        const sendAfter = dndEndTime(prefs, now).toISOString();
        await db.collection('scheduledPushes').add({
          userId,
          title: 'RealDate',
          body: 'Dagens klip er klar',
          sendAfter
        });
      } else {
        await sendAll(userId, 'RealDate', 'Dagens klip er klar', tokensByUser, subsByUser);
      }
    })
  );

  return { statusCode: 200, body: 'ok' };
};
