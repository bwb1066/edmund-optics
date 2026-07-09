/**
 * Split banner — side-by-side full-bleed image panels with an overlaid
 * caption and a bottom scrim for legibility. Stacks on mobile.
 *
 * Authoring contract — one row per panel:
 *   | picture | caption (heading/text, optionally wrapped in a link) |
 * If the caption contains a link, the whole panel becomes that link.
 *
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];

  rows.forEach((row) => {
    const [mediaCell, captionCell] = row.children;
    const picture = mediaCell?.querySelector('picture');
    const link = captionCell?.querySelector('a');

    const panel = document.createElement(link ? 'a' : 'div');
    panel.className = 'split-banner-panel';
    if (link) {
      panel.href = link.getAttribute('href');
      // Unwrap the link so its text becomes the caption without nesting <a>s.
      link.replaceWith(...link.childNodes);
    }

    if (picture) {
      picture.classList.add('split-banner-bg');
      const img = picture.querySelector('img');
      if (img) img.loading = 'lazy';
      panel.append(picture);
    }

    const scrim = document.createElement('div');
    scrim.className = 'split-banner-scrim';
    panel.append(scrim);

    const caption = document.createElement('div');
    caption.className = 'split-banner-caption';
    if (captionCell) caption.append(...captionCell.childNodes);
    panel.append(caption);

    block.append(panel);
  });

  rows.forEach((row) => row.remove());
}
