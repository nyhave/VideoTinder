const admin = require('firebase-admin');

if (!admin.apps.length) {
  const serviceAccount = require('../../videotinder-38b8b-firebase-adminsdk-fbsvc-5f3bef3136.json');

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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
    return { statusCode: 200, body: JSON.stringify({ success: true }) };
  } catch (err) {
    console.error(err);
    return { statusCode: 500, body: 'Server error' };
  }
};
