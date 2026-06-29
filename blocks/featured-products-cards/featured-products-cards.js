export default function decorate(block) {
  [...block.children].forEach((card) => {
    const cells = [...card.children];
    const mediaCell = cells[0];
    const textCell = cells[1];

    const pictures = mediaCell ? [...mediaCell.querySelectorAll('picture')] : [];
    const productPic = pictures[0];
    const badgePic = pictures[1];
    const isTopSeller = /top\s*seller/i.test(mediaCell?.textContent || '');

    // Title carries the product link; subtitle is the following <p>.
    let titleEl = textCell?.querySelector('h3, h2, h4');
    const href = titleEl?.querySelector('a')?.getAttribute('href');
    const subEl = textCell?.querySelector('p');

    // Title: drop the redundant <strong> wrapper, keep the link + any sub/sup.
    if (titleEl) {
      // Promote to h2 so it follows the section's h1 without a skipped level.
      if (titleEl.tagName !== 'H2') {
        const h2 = document.createElement('h2');
        if (titleEl.id) h2.id = titleEl.id;
        h2.append(...titleEl.childNodes);
        titleEl.replaceWith(h2);
        titleEl = h2;
      }
      titleEl.classList.add('fp-card-title');
      const strong = titleEl.querySelector('strong');
      if (strong) strong.replaceWith(...strong.childNodes);
    }

    // Subtitle: unwrap the link so it reads as plain text (keep formatting).
    if (subEl) {
      subEl.classList.add('fp-card-sub');
      const a = subEl.querySelector('a');
      if (a) a.replaceWith(...a.childNodes);
    }

    // Badge row: TECHSPEC logo (if any) + a TOP SELLER tag (if flagged).
    const meta = document.createElement('div');
    meta.className = 'fp-card-meta';
    if (badgePic) {
      badgePic.classList.add('fp-card-brand');
      meta.append(badgePic);
    }
    if (isTopSeller) {
      const tag = document.createElement('span');
      tag.className = 'fp-card-tag';
      tag.textContent = 'TOP SELLER';
      meta.append(tag);
    }

    // Product image, wrapped in the product link when available.
    let media = null;
    if (productPic) {
      media = document.createElement(href ? 'a' : 'div');
      media.className = 'fp-card-media';
      if (href) media.href = href;
      media.append(productPic);
    }

    // Reassemble the card in display order.
    card.className = 'fp-card';
    card.replaceChildren();
    if (media) card.append(media);
    if (meta.children.length) card.append(meta);
    if (titleEl) card.append(titleEl);
    if (subEl) card.append(subEl);
  });
}
