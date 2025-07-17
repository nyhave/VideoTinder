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

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { title = 'RealDate', body } = JSON.parse(event.body || '{}');
    if (!body) {
      return { statusCode: 400, body: 'Invalid payload' };
    }
    const tokensSnap = await db.collection('pushTokens').get();
    const tokens = tokensSnap.docs.map(d => d.id);
    if (tokens.length === 0) {
      return { statusCode: 200, body: 'No tokens' };
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

    return {
      statusCode: 200,
      body: JSON.stringify({ successCount: res.successCount, removedCount: badTokens.length })
    };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};
