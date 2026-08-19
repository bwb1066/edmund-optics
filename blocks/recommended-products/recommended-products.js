import store from '../../scripts/commerce.js';
import { getAudience, getBuyer, onChange } from '../../scripts/p13n.js';

// Audience → catalog search + strip label. Keyword search is forgiving across
// the REMOTE catalog (matches name/category/specs); falls back to featured.
const AUD = {
  laser_research: { q: 'laser', label: 'Recommended for laser & ultrafast builds' },
  bio_imaging: { q: 'microscope', label: 'Recommended for life-sciences imaging' },
  machine_vision: { q: 'imaging', label: 'Recommended for machine vision & inspection' },
  default: { q: '', label: 'Featured products' },
};

function buildCard(product) {
  const el = document.createElement('div');
  el.className = 'recommended-product';
  const pdp = `${store.pdpUrl || '/drafts/pdp'}?sku=${encodeURIComponent(product.sku)}`;
  el.innerHTML = `
    <a class="recommended-product-media" href="${pdp}">
      ${product.image_url ? `<img src="${product.image_url}" alt="" loading="lazy">` : ''}
    </a>
    <p class="recommended-product-cat">${product.category || ''}</p>
    <a class="recommended-product-name" href="${pdp}">${product.name}</a>
    <p class="recommended-product-price">${store.formatPrice(store.resolvePrice(product, 1))}</p>
    <button type="button" class="recommended-product-add">Add to quote</button>`;
  el.querySelector('.recommended-product-add').addEventListener('click', async (e) => {
    const btn = e.currentTarget;
    await store.addToQuote(product.sku, 1, 'web');
    btn.textContent = 'Added ✓';
    btn.classList.add('is-added');
    setTimeout(() => {
      btn.textContent = 'Add to quote';
      btn.classList.remove('is-added');
    }, 1400);
  });
  return el;
}

async function fetchProducts(audience) {
  const cfg = AUD[audience] || AUD.default;
  let products = await store.search({ query: cfg.q, limit: 6 });
  if (products.length < 4) products = await store.search({ query: '', limit: 6 });
  return products.slice(0, 6);
}

export default async function decorate(block) {
  const heading = document.createElement('h2');
  heading.className = 'recommended-products-heading';
  const strip = document.createElement('div');
  strip.className = 'recommended-products-strip';
  block.replaceChildren(heading, strip);

  const render = async () => {
    const audience = getAudience();
    heading.textContent = getBuyer()
      ? 'Recommended for Acme Photonics (contract pricing)'
      : (AUD[audience] || AUD.default).label;
    const products = await fetchProducts(audience);
    strip.replaceChildren(...products.map(buildCard));
  };

  await render();
  onChange(render);
}
