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

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type'
};

exports.handler = async function(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, headers, body: 'Method Not Allowed' };
  }
  try {
    await admin.auth().listUsers(1);
    return { statusCode: 200, headers, body: 'ok' };
  } catch (err) {
    console.error('Auth check failed:', err);
    return { statusCode: 500, headers, body: err.message };
  }
};
