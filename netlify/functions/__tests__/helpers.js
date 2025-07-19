const express = require('express');

function createLambdaServer(handler) {
  const app = express();
  app.use(express.json());
  app.use(async (req, res) => {
    const event = {
      httpMethod: req.method,
      headers: req.headers,
      body: req.body && Object.keys(req.body).length ? JSON.stringify(req.body) : undefined
    };
    try {
      const result = await handler(event);
      res.status(result.statusCode || 200);
      if (result.headers) {
        for (const [k, v] of Object.entries(result.headers)) {
          res.set(k, v);
        }
      }
      res.send(result.body);
    } catch (err) {
      res.status(500).send(String(err));
    }
  });
  return app;
}

module.exports = { createLambdaServer };
