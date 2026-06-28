/**
 * Edmund Optics product catalog scraper.
 * Fetches product URLs from the EO sitemap, then scrapes each product page.
 * Output: tools/products.json
 *
 * Usage:
 *   node tools/scrape-products.js [maxProducts]
 *   node tools/scrape-products.js 500
 */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const BASE_URL = 'https://www.edmundoptics.com';
const SITEMAP_URL = `${BASE_URL}/sitemap/SiteMap_EN.xml`;
const OUT_FILE = path.join(__dirname, 'products.json');
const CONCURRENCY = 5;
const PAGE_TIMEOUT = 20000;
const MAX_PRODUCTS = parseInt(process.argv[2] || '2000', 10);

function log(msg) {
  const ts = new Date().toISOString().substring(11, 19);
  process.stdout.write(`[${ts}] ${msg}\n`);
}

async function fetchSitemapProductUrls(page) {
  log('Fetching sitemap…');
  await page.goto(SITEMAP_URL, { timeout: 30000, waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000); // let Cloudflare challenge resolve if needed

  const content = await page.content();
  const matches = content.match(/https:\/\/www\.edmundoptics\.com\/p\/[^<"'\s]+/g) || [];
  return [...new Set(matches)];
}

async function scrapeProduct(page, url) {
  try {
    const resp = await page.goto(url, { timeout: PAGE_TIMEOUT, waitUntil: 'domcontentloaded' });
    if (!resp || resp.status() >= 400) return null;
    await page.waitForTimeout(400);

    return await page.evaluate((pageUrl) => {
      // Product name
      const name = (
        document.querySelector('h1.product-title, h1[itemprop="name"], h1.pdp__title, h1.pdp-title, h1.heading--1, h1')
          ?.textContent || ''
      ).trim();
      if (!name) return null;

      // Primary image — prefer the first large product photo
      const imgSelectors = [
        '.pdp__primary-image img',
        '.primary-product-image img',
        '[itemprop="image"]',
        '.product-image-wrapper img',
        '.product-image img',
        '.pdp-image img',
        'img.product-img',
        '.image-carousel img',
        'img[alt*="product"]',
      ];
      let imageUrl = '';
      for (const sel of imgSelectors) {
        const el = document.querySelector(sel);
        if (el) {
          imageUrl = el.src || el.dataset.src || el.dataset.lazySrc || '';
          if (imageUrl) break;
        }
      }
      if (imageUrl.startsWith('//')) imageUrl = 'https:' + imageUrl;
      imageUrl = imageUrl.split('?')[0]; // strip query params

      // Description — prefer structured data, then visible text
      let description = '';
      const ldJson = document.querySelector('script[type="application/ld+json"]');
      if (ldJson) {
        try {
          const data = JSON.parse(ldJson.textContent);
          const target = Array.isArray(data) ? data.find((d) => d['@type'] === 'Product') : data;
          if (target?.description) description = target.description.trim();
        } catch { /* ignore */ }
      }
      if (!description) {
        const descEl = document.querySelector(
          '[itemprop="description"], .product-description__text, .pdp-description, #product-description, .description-text, .overview__text, .product-overview p',
        );
        description = descEl?.innerText?.trim() || '';
      }
      if (!description) {
        description = document.querySelector('meta[name="description"]')?.content?.trim() || '';
      }
      description = description.replace(/\s+/g, ' ').substring(0, 600);

      return {
        productName: name,
        productPageUrl: pageUrl,
        productImageUrl: imageUrl,
        productDescription: description,
      };
    }, url);
  } catch {
    return null;
  }
}

async function processQueue(pages, queue, results, total) {
  await Promise.all(
    pages.map(async (page) => {
      while (queue.length > 0) {
        const url = queue.shift();
        if (!url) break;
        const done = total - queue.length;
        const result = await scrapeProduct(page, url);
        if (result) {
          results.push(result);
          process.stdout.write(`\r  ${done}/${total} processed — ${results.length} OK   `);
          // Write incremental checkpoint every 100 products
          if (results.length % 100 === 0) {
            fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), 'utf8');
          }
        }
      }
    }),
  );
  process.stdout.write('\n');
}

(async () => {
  log('Launching browser…');
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 900 },
    extraHTTPHeaders: { 'Accept-Language': 'en-US,en;q=0.9' },
  });

  // === Phase 1: get product URLs from sitemap ===
  const sitemapPage = await ctx.newPage();
  let allUrls = await fetchSitemapProductUrls(sitemapPage);
  log(`Sitemap: ${allUrls.length} product URLs found`);

  if (allUrls.length === 0) {
    log('No URLs from sitemap — exiting.');
    await browser.close();
    process.exit(1);
  }

  // Sample evenly across the full URL list (so we get variety across all categories)
  let selectedUrls;
  if (allUrls.length <= MAX_PRODUCTS) {
    selectedUrls = allUrls;
  } else {
    const step = allUrls.length / MAX_PRODUCTS;
    selectedUrls = Array.from({ length: MAX_PRODUCTS }, (_, i) => allUrls[Math.round(i * step)]);
  }
  log(`Targeting ${selectedUrls.length} products (sampled from ${allUrls.length})`);

  // === Phase 2: scrape product pages concurrently ===
  log(`Phase 2: scraping with ${CONCURRENCY} concurrent pages…`);
  const queue = [...selectedUrls];
  const workerPages = await Promise.all(
    Array.from({ length: CONCURRENCY }, () => ctx.newPage()),
  );

  const results = [];
  await processQueue(workerPages, queue, results, selectedUrls.length);

  await browser.close();

  log(`Complete: ${results.length} products scraped.`);
  fs.writeFileSync(OUT_FILE, JSON.stringify(results, null, 2), 'utf8');
  log(`Written to ${OUT_FILE}`);
})();
