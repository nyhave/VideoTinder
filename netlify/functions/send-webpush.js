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
      } else {
        console.error('Firebase credential file missing:', credPath);
      }
    }
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    }
  } catch (err) {
    console.error('Failed to load Firebase credentials:', err);
  }
}
const db = admin.firestore();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
};

webPush.setVapidDetails(
  'mailto:nyhave@gmail.com',
  process.env.WEB_PUSH_PUBLIC_KEY,
  process.env.WEB_PUSH_PRIVATE_KEY
);

function checkEnv() {
  if (!process.env.WEB_PUSH_PUBLIC_KEY || !process.env.WEB_PUSH_PRIVATE_KEY) {
    console.error('WEB_PUSH_* environment variables are not set');
    return false;
  }
  return true;
}

exports.handler = async function(event) {
  console.log('send-webpush function triggered');
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  if (!checkEnv()) {
    return { statusCode: 500, headers, body: 'Server configuration error' };
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(event.body || '{}');
  } catch (err) {
    console.error('Failed to parse request body:', event.body, err);
    return { statusCode: 400, headers, body: 'Invalid JSON payload' };
  }

  try {
    const { title = 'RealDate', body, userId, silent } = parsedBody;
    if (!body) {
      return { statusCode: 400, headers, body: 'Invalid payload: body required' };
    }
  let subsSnap;
  if (userId) {
    subsSnap = await db.collection('webPushSubscriptions').where('userId','==', userId).get();
  } else {
    subsSnap = await db.collection('webPushSubscriptions').get();
  }
  const subs = subsSnap.docs.map(d => d.data());
  const payload = JSON.stringify({ title, body, silent: !!silent });
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

  await db.collection('serverLogs').add({
    timestamp: new Date().toISOString(),
    type: 'send-webpush',
    body,
    subscriptions: subs.length,
    failed: failed.length
  }).catch(() => {});
  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({
      success: true,
      count: subs.length,
      errors: failed.length,
      subscriptions: subs
    })
  };
  } catch (err) {
    console.error(err);
    await db.collection('serverLogs').add({
      timestamp: new Date().toISOString(),
      type: 'send-webpush',
      error: err.message
    }).catch(() => {});
    return { statusCode: 500, headers, body: 'Server error!' };
  }
};
