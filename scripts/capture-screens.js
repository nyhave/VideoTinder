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

  const users = [
    { id: '102', tier: 'free' },
    { id: '101', tier: 'silver' },
    { id: '103', tier: 'gold' },
    { id: '104', tier: 'platinum' }
  ];

  const routes = [
    { tab: 'discovery', name: 'home' },
    { tab: 'profile', name: 'profile' },
    { tab: 'chat', name: 'chat' },
    { tab: 'admin', name: 'admin' }
  ];

  for (const u of users) {
    const page = await browser.newPage();
    await page.setViewport({
      width: 360,
      height: 640,
      deviceScaleFactor: 2,
      isMobile: true
    });
    await page.evaluateOnNewDocument(id => {
      localStorage.setItem('loggedIn', 'true');
      localStorage.setItem('preferredUserId', id);
    }, u.id);
    await page.setRequestInterception(true);
    page.on('request', req => {
      const url = req.url();
      const allowed =
        url.startsWith(`http://localhost:${port}`) ||
        url.startsWith('data:') ||
        url.startsWith('https://cdn.tailwindcss.com') ||
        url.includes('googleapis.com') ||
        url.startsWith('https://firebasestorage.googleapis.com');
      allowed ? req.continue() : req.abort();
    });
    const shotsDir = path.join(__dirname, '..', 'screenshots', u.tier);
    fs.mkdirSync(shotsDir, { recursive: true });

    for (const route of routes) {
      const url = `http://localhost:${port}/?tab=${route.tab}`;
      const file = path.join(shotsDir, `${route.name}.png`);
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
      // Allow extra time for client-side data to render before capturing
      // `waitForTimeout` was removed in newer Puppeteer versions; use a manual delay instead
      await new Promise(resolve => setTimeout(resolve, 5000));
      await page.screenshot({ path: file, fullPage: true });
      console.log('Saved', file);
    }

    await page.close();
  }

  await browser.close();
  server.close();
}

capture().catch(err => {
  console.error(err);
  process.exit(1);
});
