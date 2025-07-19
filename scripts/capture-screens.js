const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function startServer(distPath, port) {
  const app = express();
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  return new Promise(resolve => {
    const server = app.listen(port, () => resolve(server));
  });
}

async function capture() {
  const distDir = path.join(__dirname, '..', 'dist');
  const port = 5000;
  const server = await startServer(distDir, port);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH
  });
  const page = await browser.newPage();
  const routes = ['/', '/profile', '/chat', '/admin'];
  const shotsDir = path.join(__dirname, '..', 'screenshots');
  fs.mkdirSync(shotsDir, { recursive: true });

  for (const route of routes) {
    const url = `http://localhost:${port}${route}`;
    const file = path.join(shotsDir, `${route === '/' ? 'home' : route.substring(1)}.png`);
    await page.goto(url, { waitUntil: 'networkidle0' });
    await page.screenshot({ path: file, fullPage: true });
    console.log('Saved', file);
  }

  await browser.close();
  server.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
