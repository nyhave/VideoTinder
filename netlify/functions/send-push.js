const admin = require('firebase-admin');

if (!admin.apps.length) {
  const cred = process.env.FIREBASE_SERVICE_ACCOUNT_JSON
    ? admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON))
    : admin.credential.applicationDefault();
  admin.initializeApp({
    credential: cred
  });
}

const db = admin.firestore();

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  try {
    const { title = 'Videotpush', body } = JSON.parse(event.body || '{}');
    if (!body) {
      return { statusCode: 400, body: 'Invalid payload' };
    }
    const tokensSnap = await db.collection('pushTokens').get();
    const tokens = tokensSnap.docs.map(d => d.id);
    if (tokens.length === 0) {
      return { statusCode: 200, body: 'No tokens' };
    }
    await admin.messaging().sendEachForMulticast({
      tokens,
      notification: { title, body }
    });
    return { statusCode: 200, body: JSON.stringify({ success: true, count: tokens.length }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};
