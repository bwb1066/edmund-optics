export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div');
  if (!inner) return;

  // Background image — first <picture> anywhere in the block
  const bgPicture = inner.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('featured-event-hero-bg');
    const bgImg = bgPicture.querySelector('img');
    if (bgImg) { bgImg.loading = 'eager'; bgImg.fetchPriority = 'high'; }
    const wrapper = bgPicture.parentElement;
    block.prepend(bgPicture);
    if (wrapper?.tagName === 'P' && wrapper.childElementCount === 0) wrapper.remove();
  }

  // Label (small "FEATURED EVENT" line) — any sub-h1 heading
  const labelEl = inner.querySelector('h3, h4, h5, h6');
  // Main headline
  const h1 = inner.querySelector('h1, h2');
  // CTA link
  const ctaLink = inner.querySelector('a');

  const content = document.createElement('div');
  content.className = 'featured-event-hero-content';

  if (labelEl) {
    labelEl.classList.add('featured-event-label');
    content.append(labelEl);
  }

  if (h1) content.append(h1);

  if (ctaLink) {
    const p = document.createElement('p');
    p.className = 'featured-event-cta';
    p.append(ctaLink);
    content.append(p);
  }

  inner.replaceChildren(content);
}
