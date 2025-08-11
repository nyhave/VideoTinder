// netlify/functions/send-webpush.js
// Minimal, robust Web Push til iOS (Safari) + desktop/Android via standard Web Push.
// Læser subscriptions fra Firestore 'webPushSubscriptions' og sender payload med title/body/url.
// Svarer med detaljer pr. endpoint så du kan se præcis hvorfor noget fejler.

const webpush = require('web-push');
const admin = require('firebase-admin');

// Init Firebase Admin én gang
if (!admin.apps.length) {
  // Brug enten GOOGLE_APPLICATION_CREDENTIALS eller FIREBASE_SERVICE_ACCOUNT_JSON
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)),
    });
  } else {
    admin.initializeApp(); // antager GOOGLE_APPLICATION_CREDENTIALS
  }
}

const db = admin.firestore();

// VAPID nøgler SKAL matche dem, klienten er subscribet med
const PUBLIC_KEY = process.env.WEB_PUSH_PUBLIC_KEY;
const PRIVATE_KEY = process.env.WEB_PUSH_PRIVATE_KEY;

console.log(`PUBLIC: ${PUBLIC_KEY}`);
console.log(`PRIVATE: ${PRIVATE_KEY}`);

if (!PUBLIC_KEY || !PRIVATE_KEY) {
  console.warn('WEB_PUSH_PUBLIC_KEY / WEB_PUSH_PRIVATE_KEY mangler');
}

webpush.setVapidDetails(
  // Brug en gyldig subject (mailto eller https)
  process.env.WEB_PUSH_SUBJECT || 'mailto:nyhave@gmail.com',
  PUBLIC_KEY,
  PRIVATE_KEY
);

// Hjælpere
const okJson = (obj) => ({ statusCode: 200, body: JSON.stringify(obj) });
const badJson = (code, obj) => ({ statusCode: code, body: JSON.stringify(obj) });

// Læs alle subs (evtl. filtrer på userId hvis medsendt)
async function loadSubscriptions(userId) {
  let q = db.collection('webPushSubscriptions');
  if (userId) q = q.where('userId', '==', userId);
  const snap = await q.get();
  return snap.docs.map((d) => d.data());
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return badJson(405, { success: false, error: 'Method not allowed' });
  }

  let payloadIn;
  try {
    payloadIn = JSON.parse(event.body || '{}');
  } catch (_e) {
    return badJson(400, { success: false, error: 'Invalid JSON' });
  }

  const title = payloadIn.title || 'Notifikation';
  const body = payloadIn.body || '';
  const url = payloadIn.url || '/';
  const tag = payloadIn.tag || 'videotpush';
  const userId = payloadIn.userId || null;
  const silent = !!payloadIn.silent;

  // Det her er det eneste, SW har brug for til at vise korrekt titel/tekst
  const payload = {
    title,
    body,
    url,
    tag,
    silent,
  };

  // Hent subs
  const subscriptions = await loadSubscriptions(userId);
  console.log(`send-webpush: ${subscriptions.length} subscription(s)`, {
    title,
    url,
    tag,
    silent,
    userId,
  });
  if (!subscriptions.length) {
    return okJson({ success: true, count: 0, errors: 0, results: [] });
  }

  // Send én for én for at få klar fejlkode
  const results = [];
  let errors = 0;

  for (const sub of subscriptions) {
    try {
      // webpush forventer det rene subscription-objekt fra PushManager.subscribe().toJSON()
      await webpush.sendNotification(sub, JSON.stringify(payload), {
        TTL: 4500,
        urgency: 'normal',
      });
      console.log('send-webpush OK', sub.endpoint);
      results.push({ endpoint: sub.endpoint, ok: true });
    } catch (err) {
      errors++;
      const status = err.statusCode || err.status || 0;
      const msg = String(err.body || err.message || err);
      console.warn('send-webpush FAIL', sub.endpoint, status, msg);
      results.push({ endpoint: sub.endpoint, ok: false, status, msg });

      // Ryd op ved 404/410 (stale endpoint)
      if (status === 404 || status === 410) {
        try {
          // doc-id kan være gemt som encoded endpoint; vi forsøger begge veje:
          const snap = await db
            .collection('webPushSubscriptions')
            .where('endpoint', '==', sub.endpoint)
            .get();
          for (const d of snap.docs) await d.ref.delete();
        } catch (_) {
          // ignorer oprydningsfejl
        }
      }
    }
  }

  console.log(
    `send-webpush complete: ${subscriptions.length - errors} ok, ${errors} error(s)`
  );

  return okJson({
    success: true,
    count: subscriptions.length,
    errors,
    results,
    note:
      'Hvis du ser 401/403/400, er det næsten altid VAPID-mismatch. 404/410 betyder typisk stale subscription – resubscribe på enheden.',
  });
};
