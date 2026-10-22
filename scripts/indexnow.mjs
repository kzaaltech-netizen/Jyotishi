// Tells Bing, Yandex and other IndexNow search engines that pages changed.
// Run after each deploy to production:  npm run indexnow
// The key file public/0e4a8977ae8a15d1f7d6bbc095da743c.txt must be live at https://jyotishly.com/0e4a8977ae8a15d1f7d6bbc095da743c.txt.

import { readFile } from 'node:fs/promises';

const HOST = 'jyotishly.com';
const KEY = '0e4a8977ae8a15d1f7d6bbc095da743c';

const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const urlList = [...sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)].map((m) => m[1]);

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList }),
});
console.log(`indexnow: sent ${urlList.length} URLs, HTTP ${res.status}`);
if (!res.ok && res.status !== 202) process.exitCode = 1;
