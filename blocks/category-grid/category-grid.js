/**
 * Category grid — a responsive grid of square image tiles, each linking to a
 * catalog category.
 *
 * Authoring contract — one row per tile:
 *   | picture | category name (optionally a link) |
 * If the name cell contains a link, the whole tile becomes that link;
 * otherwise the tile renders as a non-interactive figure.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  const grid = document.createElement('div');
  grid.className = 'category-grid-items';

  rows.forEach((row) => {
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
    grid.append(card);
  });

  block.replaceChildren(grid);
}
