// netlify/functions/get-vapid-public-key.js
exports.handler = async () => {
  const publicKey = process.env.WEB_PUSH_PUBLIC_KEY || '';
  if (!publicKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'WEB_PUSH_PUBLIC_KEY not set' }) };
  }
  return { statusCode: 200, body: JSON.stringify({ publicKey }) };
};
