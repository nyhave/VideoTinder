const webpush = require('web-push');
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
  try {
    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.join(__dirname, '../../videotinder-38b8b-firebase-adminsdk-fbsvc-5f3bef3136.json');
      if (fs.existsSync(credPath)) {
        serviceAccount = require(credPath);
      }
    }
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
    }
  } catch (err) {
    console.error('Failed to initialize Firebase admin:', err);
  }
}

const db = admin.firestore();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
};

if (process.env.WEB_PUSH_PUBLIC_KEY && process.env.WEB_PUSH_PRIVATE_KEY) {
  webpush.setVapidDetails('mailto:example@example.com', process.env.WEB_PUSH_PUBLIC_KEY, process.env.WEB_PUSH_PRIVATE_KEY);
}

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  try {
    const { title, body, subscriptions, silent } = JSON.parse(event.body || '{}');
    let subs = [];
    if (Array.isArray(subscriptions) && subscriptions.length) {
      subs = subscriptions;
    } else {
      const snap = await db.collection('webPushSubscriptions').get();
      subs = snap.docs.map(d => ({ id: d.id, ...d.data().subscription }));
    }
    let success = 0;
    const failed = [];
    await Promise.all(subs.map(async sub => {
      try {
        await webpush.sendNotification(sub, JSON.stringify({ title, body, silent }));
        success++;
      } catch (err) {
        if (err.statusCode === 410 || err.statusCode === 404) {
          try {
            if (sub.id) await db.collection('webPushSubscriptions').doc(sub.id).delete();
          } catch (_) {}
        }
        failed.push({ endpoint: sub.endpoint, error: err.message });
      }
    }));
    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ success, failed: failed.length })
    };
  } catch (err) {
    console.error('send-webpush error', err);
    return { statusCode: 500, headers, body: err.message };
  }
};
