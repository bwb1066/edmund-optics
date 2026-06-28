/**
 * Fix-up pass: adds productImageUrl to products that are missing one.
 * Reads tools/products.json, re-scrapes images, writes back.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT_FILE = path.join(__dirname, 'products.json');
const CONCURRENCY = 6;
const PAGE_TIMEOUT = 15000;
const IMG_REGEX = /productimages\.edmundoptics\.com\/(\d+\.[a-zA-Z]+)/;

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  process.stdout.write(`[${ts}] ${msg}\n`);
}

async function fetchImage(page, product) {
  try {
    const resp = await page.goto(product.productPageUrl, { timeout: PAGE_TIMEOUT, waitUntil: 'domcontentloaded' });
    if (!resp || resp.status() >= 400) return null;

    // Extract image URL from raw HTML — productimages CDN URLs are in page source
    const html = await page.content();
    const match = html.match(IMG_REGEX);
    if (match) {
      return `https://productimages.edmundoptics.com/${match[1]}`;
    }
    return null;
  } catch {
    return null;
  }
}

async function processQueue(pages, queue, products, total) {
  await Promise.all(
    pages.map(async (page) => {
      while (queue.length > 0) {
        const idx = queue.shift();
        if (idx === undefined) break;
        const product = products[idx];
        const imageUrl = await fetchImage(page, product);
        const done = total - queue.length;
        if (imageUrl) {
          product.productImageUrl = imageUrl;
          process.stdout.write(`\r  ${done}/${total} processed   `);
        }
      }
    }),
  );
  process.stdout.write('\n');
}

(async () => {
  const products = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
  const missing = products.map((p, i) => (!p.productImageUrl ? i : -1)).filter((i) => i >= 0);
  log(`${missing.length}/${products.length} products need images`);

  if (missing.length === 0) {
    log('All products already have images.');
    return;
  }

  log('Launching browser…');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
  });

  const workerPages = await Promise.all(
    Array.from({ length: CONCURRENCY }, () => ctx.newPage()),
  );

  await processQueue(workerPages, [...missing], products, missing.length);
  await browser.close();

  const withImg = products.filter((p) => p.productImageUrl).length;
  log(`Done. ${withImg}/${products.length} products now have images.`);
  fs.writeFileSync(OUT_FILE, JSON.stringify(products, null, 2), 'utf8');
  log(`Written to ${OUT_FILE}`);
})();
