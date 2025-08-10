// netlify/functions/get-vapid-public-key.js
exports.handler = async () => {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY || '';
  // Temporary debug output of VAPID key - remove before production.
  console.log('DEBUG: WEB_PUSH_PUBLIC_KEY', publicKey); // TODO: Remove before production
  if (!publicKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'WEB_PUSH_PUBLIC_KEY not set' }) };
  }
  return { statusCode: 200, body: JSON.stringify({ publicKey }) };
};
