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
