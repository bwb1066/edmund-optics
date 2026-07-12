/**
 * Knowledge cards — a row of resource cards, each with an image (yellow
 * underline), a category badge, and a blue title. The whole card links out.
 *
 * Authoring contract — one row per card:
 *   | picture | badge label | title (link) |
 * Badge renders yellow by default; a badge whose text contains "trending"
 * renders in the dark/inverted treatment.
 *
 * The centered section header (eyebrow, heading, description, Browse All
 * button) is authored as default content in the same section and styled by
 * the scoped rules in knowledge-cards.css.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const grid = document.createElement('div');
  grid.className = 'knowledge-cards-items';

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const picture = row.querySelector('picture');
    if (!picture) return;

    const badgeText = cells[1]?.textContent.trim() || '';
    const link = cells[2]?.querySelector('a');
    const title = (link?.textContent || cells[2]?.textContent || '').trim();

    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'knowledge-card';
    if (link) card.href = link.getAttribute('href');

    const imgWrap = document.createElement('div');
    imgWrap.className = 'knowledge-card-img';
    const img = picture.querySelector('img');
    if (img && !img.getAttribute('alt')) img.alt = title;
    imgWrap.append(picture);

    const body = document.createElement('div');
    body.className = 'knowledge-card-body';

    if (badgeText) {
      const badge = document.createElement('span');
      badge.className = 'knowledge-card-badge';
      if (/trending/i.test(badgeText)) badge.classList.add('is-trending');
      badge.textContent = badgeText;
      body.append(badge);
    }

    const heading = document.createElement('div');
    heading.className = 'knowledge-card-title';
    heading.textContent = title;
    body.append(heading);

    card.append(imgWrap, body);
    grid.append(card);
  });

  block.replaceChildren(grid);
}
