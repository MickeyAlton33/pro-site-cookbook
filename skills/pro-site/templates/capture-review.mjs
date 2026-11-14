#!/usr/bin/env node
import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';

const [base = 'http://localhost:3100', ...requested] = process.argv.slice(2);
const routes = requested.length ? requested : ['/'];
const origin = new URL(base);
if (!['http:', 'https:'].includes(origin.protocol)) throw new Error('Expected an HTTP(S) URL');
await mkdir('.review', { recursive: true });
const browser = await chromium.launch();
const results = [];
try {
  for (const route of routes) {
    const url = new URL(route, origin);
    if (url.origin !== origin.origin) throw new Error(`Route must stay on ${origin.origin}`);
    const name = Buffer.from(route).toString('base64url');
    for (const [width, height] of [[375, 812], [768, 1024], [1440, 900]]) {
      const page = await browser.newPage({ viewport: { width, height }, reducedMotion: 'reduce' });
      const errors = [];
      page.on('pageerror', (error) => errors.push(error.message));
      page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
      const response = await page.goto(url.href, { waitUntil: 'networkidle' });
      if (!response?.ok()) errors.push(`HTTP ${response?.status() ?? 'no response'}`);
      await page.evaluate(() => document.fonts.ready);
      if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) errors.push('Horizontal overflow');
      const full = `.review/${name}-${width}-full.png`;
      const fold = `.review/${name}-${width}-fold.png`;
      await page.screenshot({ path: full, fullPage: true, animations: 'disabled' });
      await page.screenshot({ path: fold, animations: 'disabled' });
      results.push({ route, width, full, fold, errors });
      await page.close();
    }
  }
} finally {
  await browser.close();
}
await writeFile('.review/results.json', JSON.stringify(results, null, 2) + '\n');
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.errors.length)) process.exitCode = 1;
