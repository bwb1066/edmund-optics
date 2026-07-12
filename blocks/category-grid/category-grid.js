/**
 * Category grid — a responsive grid of square image tiles, each linking to a
 * catalog category.
 *
 * Base authoring contract — one row per tile:
 *   | picture | category name (optionally a link) |
 *
 * Variant `category-grid (paged)` adds:
 *   - an optional header row (no picture): | eyebrow text | title text |,
 *     where the eyebrow is a click affordance that opens the header's Shop
 *     mega-menu;
 *   - a collapse/expand pager (prev/next) that shows one row first;
 *   - overlaid tile labels + focus-on-hover (styled in CSS).
 * The base (unvariant) block is unchanged.
 *
 * @param {Element} block The block element
 */

/** Open the header's Shop mega-menu/drawer (built by header.js). */
function openShopMenu() {
  const nav = document.querySelector('header #nav');
  if (!nav) return;
  const shop = nav.querySelector('.nav-shop')
    || [...nav.querySelectorAll('.nav-sections .default-content-wrapper > ul > li')]
      .find((li) => li.querySelector(':scope > a, :scope > p')?.textContent.trim().toLowerCase().startsWith('shop'));
  if (!shop) return;
  const open = shop.getAttribute('aria-expanded') === 'true';
  shop.setAttribute('aria-expanded', open ? 'false' : 'true');
}

function buildTile(row) {
  const [mediaCell, nameCell] = row.children;
  const picture = mediaCell?.querySelector('picture');
  const link = nameCell?.querySelector('a');
  const name = (link?.textContent || nameCell?.textContent || '').trim();

  const card = document.createElement(link ? 'a' : 'div');
  card.className = 'category-grid-card';
  if (link) card.href = link.getAttribute('href');

  const imgWrap = document.createElement('div');
  imgWrap.className = 'category-grid-img';
  if (picture) {
    const img = picture.querySelector('img');
    if (img && !img.getAttribute('alt')) img.alt = name;
    imgWrap.append(picture);
  }

  const label = document.createElement('div');
  label.className = 'category-grid-name';
  label.textContent = name;

  card.append(imgWrap, label);
  return card;
}

export default function decorate(block) {
  const paged = block.classList.contains('paged');
  const rows = [...block.children];

  // A header row (paged only) is any row with no <picture>.
  const headerRow = paged ? rows.find((r) => !r.querySelector('picture')) : null;
  const tileRows = rows.filter((r) => r !== headerRow);

  const grid = document.createElement('div');
  grid.className = 'category-grid-items';
  tileRows.forEach((row) => grid.append(buildTile(row)));

  if (!paged) {
    block.replaceChildren(grid);
    return;
  }

  // ── Header: eyebrow (opens Shop) + title, with pager controls ──
  const header = document.createElement('div');
  header.className = 'category-grid-header';

  const heading = document.createElement('div');
  heading.className = 'category-grid-heading';
  if (headerRow) {
    const [eyebrowCell, titleCell] = headerRow.children;
    const eyebrowText = eyebrowCell?.textContent.trim();
    const titleText = (titleCell || eyebrowCell)?.textContent.trim();
    if (eyebrowText && titleCell) {
      const eyebrow = document.createElement('button');
      eyebrow.type = 'button';
      eyebrow.className = 'category-grid-eyebrow';
      eyebrow.textContent = eyebrowText;
      eyebrow.setAttribute('aria-label', `${eyebrowText} — open the Shop menu`);
      eyebrow.addEventListener('click', openShopMenu);
      heading.append(eyebrow);
    }
    if (titleText) {
      const h2 = document.createElement('h2');
      h2.className = 'category-grid-title';
      h2.textContent = titleText;
      heading.append(h2);
    }
  }

  const perPage = 4;
  const total = grid.children.length;

  const controls = document.createElement('div');
  controls.className = 'category-grid-controls';
  const count = document.createElement('span');
  count.className = 'category-grid-count';
  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'category-grid-arrow category-grid-prev';
  prev.setAttribute('aria-label', 'Show fewer categories');
  prev.innerHTML = '&larr;';
  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'category-grid-arrow category-grid-next';
  next.setAttribute('aria-label', 'Show all categories');
  next.innerHTML = '&rarr;';
  controls.append(count, prev, next);

  header.append(heading, controls);

  const wrap = document.createElement('div');
  wrap.className = 'category-grid-wrap';
  wrap.append(grid);

  const setExpanded = (expanded) => {
    block.classList.toggle('is-expanded', expanded);
    count.textContent = expanded
      ? `Showing all ${total}`
      : `Showing ${Math.min(perPage, total)} of ${total}`;
    prev.disabled = !expanded;
    next.disabled = expanded;
  };
  prev.addEventListener('click', () => setExpanded(false));
  next.addEventListener('click', () => setExpanded(true));

  block.replaceChildren(header, wrap);
  setExpanded(false);
}
