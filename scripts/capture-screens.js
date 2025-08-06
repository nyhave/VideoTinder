const express = require('express');
const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

async function startServer(distPath, port) {
  const app = express();
  app.use(express.static(distPath));
  // For client-side routing in the built SPA
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
  return new Promise(resolve => {
    const server = app.listen(port, () => {
      console.log(`Server started on http://localhost:${port}`);
      resolve(server);
    });
  });
}

async function capture() {
  const distDir = path.join(__dirname, '..', 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('dist folder missing; run "npm run build" first');
  }
  const port = 5000;
  const server = await startServer(distDir, port);

  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 360,
    height: 640,
    deviceScaleFactor: 2,
    isMobile: true
  });
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('preferredUserId', '101');
  });
  await page.setRequestInterception(true);
  page.on('request', req => {
    const allowed = req.url().startsWith(`http://localhost:${port}`) || req.url().startsWith('data:');
    allowed ? req.continue() : req.abort();
  });
  const routes = [
    { tab: 'discovery', name: 'home' },
    { tab: 'profile', name: 'profile' },
    { tab: 'chat', name: 'chat' },
    { tab: 'admin', name: 'admin' }
  ];
  const shotsDir = path.join(__dirname, '..', 'screenshots');
  fs.mkdirSync(shotsDir, { recursive: true });

  for (const route of routes) {
    const url = `http://localhost:${port}/?tab=${route.tab}`;
    const file = path.join(shotsDir, `${route.name}.png`);
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
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
