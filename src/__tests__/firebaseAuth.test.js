const admin = require('firebase-admin');
const fs = require('fs');

const hasCreds = !!process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

beforeAll(() => {
  if (!hasCreds) return;
  if (admin.apps.length) return;

  let serviceAccount = null;
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
    } catch {}
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);
  }

  if (serviceAccount) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  }
});

(hasCreds ? test : test.skip)('Firebase auth is accessible', async () => {
  const list = await admin.auth().listUsers(1);
  expect(list).toBeDefined();
  expect(Array.isArray(list.users)).toBe(true);
});
