// POST payload example:
// {
//   "body": "Hello there",
//   "title": "RealDate",
//   "tokens": ["token1", "token2"] // optional
// }

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

if (!admin.apps.length) {
  try {
    let serviceAccount = null;
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } else {
      const credPath =
        process.env.GOOGLE_APPLICATION_CREDENTIALS ||
        path.join(
          __dirname,
          '../../videotinder-38b8b-firebase-adminsdk-fbsvc-5f3bef3136.json'
        );
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

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  try {
    const { title = 'RealDate', body, tokens: bodyTokens, userId } = JSON.parse(event.body || '{}');
    if (!body) {
      return { statusCode: 400, headers, body: 'Invalid payload' };
    }
    let tokens = bodyTokens;
    if (!Array.isArray(tokens) || tokens.length === 0) {
      let tokensSnap;
      if (userId) {
        tokensSnap = await db.collection('pushTokens').where('userId','==', userId).get();
      } else {
        tokensSnap = await db.collection('pushTokens').get();
      }
      tokens = tokensSnap.docs.map(d => d.id);
    }
    if (tokens.length === 0) {
      await db.collection('serverLogs').add({
        timestamp: new Date().toISOString(),
        type: 'send-push',
        body,
        tokens: 0,
        note: 'no tokens'
      }).catch(() => {});
      return { statusCode: 200, headers, body: 'No tokens' };
    }
    const res = await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body }
    });

    const badTokens = res.responses
      .map((r, i) => (!r.success ? tokens[i] : null))
      .filter(Boolean);

    if (badTokens.length) {
      const batch = db.batch();
      badTokens.forEach(t => batch.delete(db.collection('pushTokens').doc(t)));
      await batch.commit();
    }

    await db.collection('serverLogs').add({
      timestamp: new Date().toISOString(),
      type: 'send-push',
      body,
      tokens: tokens.length,
      successCount: res.successCount,
      removedCount: badTokens.length
    }).catch(() => {});

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ successCount: res.successCount, removedCount: badTokens.length })
    };
  } catch (err) {
    console.error(err);
    await db.collection('serverLogs').add({
      timestamp: new Date().toISOString(),
      type: 'send-push',
      error: err.message
    }).catch(() => {});
    return { statusCode: 500, headers, body: 'Server error' };
  }
};
