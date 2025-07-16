const admin = require('firebase-admin');
const webPush = require('web-push');

if (!admin.apps.length) {
  const serviceAccount = require('../../videotinder-38b8b-firebase-adminsdk-fbsvc-5f3bef3136.json');
  admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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
    const { title = 'Videotpush', body } = JSON.parse(event.body || '{}');
    if (!body) {
      return { statusCode: 400, body: 'Invalid payload' };
    }
    const subsSnap = await db.collection('webPushSubscriptions').get();
    const subs = subsSnap.docs.map(d => d.data());
    const payload = JSON.stringify({ title, body });
    await Promise.all(subs.map(sub =>
      webPush.sendNotification(sub, payload).catch(err => {
        if (err.statusCode === 410 || err.statusCode === 404) {
          db.collection('webPushSubscriptions').doc(sub.endpoint).delete().catch(() => {});
        }
      })
    ));
    return { statusCode: 200, body: JSON.stringify({ success: true, count: subs.length }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};
