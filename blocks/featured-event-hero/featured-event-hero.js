export default function decorate(block) {
  // Search the whole block so multi-row authoring still works
  const bgPicture = block.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('featured-event-hero-bg');
    const bgImg = bgPicture.querySelector('img');
    if (bgImg) { bgImg.loading = 'eager'; bgImg.fetchPriority = 'high'; }
    block.prepend(bgPicture);
  }

  // All headings in the block, ordered by DOM position
  const allHeadings = [...block.querySelectorAll('h1, h2, h3, h4, h5, h6')];

  // Headline is h1/h2, falling back to any heading present.
  const headlineEl = allHeadings.find((h) => /^H[12]$/.test(h.tagName)) ?? allHeadings[0] ?? null;

  // Links outside the headline are the eyebrow label + CTA, in DOM order.
  // (The "FEATURED EVENT" eyebrow is often authored as a link.)
  const outerLinks = [...block.querySelectorAll('a')].filter((a) => !headlineEl?.contains(a));
  const ctaLink = outerLinks[outerLinks.length - 1] ?? null;
  const labelLink = outerLinks.length > 1 ? outerLinks[0] : null;

  // Label text: the eyebrow link, else a sub-heading, else a sensible default.
  const subHeading = allHeadings.find((h) => /^H[3-6]$/.test(h.tagName));
  const labelText = (labelLink?.textContent || subHeading?.textContent || 'FEATURED EVENT').trim();

  const content = document.createElement('div');
  content.className = 'featured-event-hero-content';

  const label = document.createElement('p');
  label.className = 'featured-event-label';
  label.textContent = labelText;
  content.append(label);

  if (headlineEl) content.append(headlineEl);

  if (ctaLink) {
    // If the CTA still reads as an ALL-CAPS eyebrow, normalize it.
    if (/^[A-Z][A-Z\s]{2,}$/.test(ctaLink.textContent.trim())) {
      ctaLink.textContent = 'Request Content';
    }
    const p = document.createElement('p');
    p.className = 'featured-event-cta';
    p.append(ctaLink);
    content.append(p);
  }

  // Remove all EDS wrapper divs and append content as direct child
  [...block.querySelectorAll(':scope > div')].forEach((div) => div.remove());
  block.appendChild(content);
}
