const request = require('supertest');
const { createLambdaServer } = require('./helpers');

process.env.WEB_PUSH_PUBLIC_KEY = 'pub';
process.env.WEB_PUSH_PRIVATE_KEY = 'priv';

jest.mock('firebase-admin', () => {
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    firestore: () => ({
      collection: name => {
        if (name === 'webPushSubscriptions') {
          return {
            where: () => ({ get: jest.fn().mockResolvedValue({ docs: [ { data: () => ({ endpoint: 'e1' }) } ] }) }),
            get: jest.fn().mockResolvedValue({ docs: [ { data: () => ({ endpoint: 'e1' }) } ] })
          };
        }
        if (name === 'serverLogs') {
          return { add: jest.fn().mockResolvedValue({}) };
        }
        return {};
      }
    })
  };
});

jest.mock('web-push', () => ({
  setVapidDetails: jest.fn(),
  sendNotification: jest.fn().mockResolvedValue({})
}));

const handler = require('../send-webpush.js').handler;

describe('send-webpush function', () => {
  const app = createLambdaServer(handler);

  test('rejects non-POST', async () => {
    await request(app).get('/').expect(405);
  });

  test('sends web push to subscriptions', async () => {
    const res = await request(app)
      .post('/')
      .send({ body: 'Hello' })
      .expect(200);
    const body = JSON.parse(res.text);
    expect(body.success).toBe(true);
    expect(body.count).toBe(1);
  });
});
