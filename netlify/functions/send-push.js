// POST payload example:
// {
//   "body": "Hello there",
//   "title": "RealDate",
//   "tokens": ["token1", "token2"], // optional
//   "silent": true // optional
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
  console.log('send-push function triggered');
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  try {
    const { title = 'RealDate', body, tokens: bodyTokens, userId, silent } = JSON.parse(event.body || '{}');
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
    const message = {
      tokens,
      data: { title, body, silent: silent ? 'true' : 'false' }
    };
    if (!silent) {
      message.notification = { title, body };
    }
    const res = await admin.messaging().sendEachForMulticast(message);

    const badTokens = res.responses
      .map((r, i) => {
        if (!r.success) {
          const code = r.error && r.error.code;
          if (code === 'messaging/registration-token-not-registered' ||
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/invalid-argument') {
            return tokens[i];
          }
        }
        return null;
      })
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
      silent: !!silent,
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
