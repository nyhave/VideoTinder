const request = require('supertest');
const { createLambdaServer } = require('./helpers');

jest.mock('firebase-admin', () => {
  const sendMock = jest.fn().mockResolvedValue({ successCount: 1, responses: [] });
  return {
    apps: [],
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    messaging: () => ({ sendEachForMulticast: sendMock }),
    firestore: () => ({
      collection: () => ({ add: jest.fn().mockResolvedValue({}) })
    })
  };
});

const handler = require('../send-push.js').handler;

describe('send-push function', () => {
  const app = createLambdaServer(handler);

  test('rejects non-POST', async () => {
    await request(app).get('/').expect(405);
  });

  test('sends push with provided tokens', async () => {
    const res = await request(app)
      .post('/')
      .send({ body: 'Hello', tokens: ['t1'] })
      .expect(200);
    const body = JSON.parse(res.text);
    expect(body.successCount).toBe(1);
    expect(body.removedCount).toBe(0);
  });
});
