const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const webPush = require('web-push');

if (!admin.apps.length) {
  const credPath = path.join(__dirname, '../../videotinder-38b8b-firebase-adminsdk-fbsvc-5f3bef3136.json');
  try {
    if (!fs.existsSync(credPath)) {
      console.error('Firebase credential file missing:', credPath);
    } else {
      const serviceAccount = require(credPath);
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
  } catch (err) {
    console.error('Failed to load Firebase credentials:', err);
  }
}
const db = admin.firestore();

webPush.setVapidDetails(
  'mailto:nyhave@gmail.com',
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
);

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { title = 'RealDate', body } = JSON.parse(event.body || '{}');
    if (!body) {
      return { statusCode: 400, body: 'Invalid payload' };
    }
  const subsSnap = await db.collection('webPushSubscriptions').get();
  const subs = subsSnap.docs.map(d => d.data());
  const payload = JSON.stringify({ title, body });
  const failed = [];
  await Promise.all(
    subs.map(async sub => {
      try {
        await webPush.sendNotification(sub, payload);
      } catch (err) {
        console.error('Failed to send push to', sub.endpoint, err);
        if (err.statusCode === 410 || err.statusCode === 404) {
          const safeId = Buffer.from(sub.endpoint)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
          db.collection('webPushSubscriptions').doc(safeId).delete().catch(() => {});
        }
        failed.push(sub.endpoint);
      }
    })
  );
  return {
    statusCode: 200,
    body: JSON.stringify({
      success: true,
      count: subs.length,
      errors: failed.length,
      subscriptions: subs
    })
  };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error!' };
  }
};
