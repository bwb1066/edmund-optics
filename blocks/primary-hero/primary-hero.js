export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div');
  if (!inner) return;

  const h1 = inner.querySelector('h1');
  const h3s = [...inner.querySelectorAll('h3')];

  // Pull the background <picture> from anywhere in inner and prepend to block root
  const bgPicture = inner.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('primary-hero-bg');
    const bgImg = bgPicture.querySelector('img');
    if (bgImg) {
      bgImg.loading = 'eager';
      bgImg.fetchPriority = 'high';
    }
    // Remove empty wrapper <p> left behind
    const wrapper = bgPicture.parentElement;
    block.prepend(bgPicture);
    if (wrapper?.tagName === 'P' && wrapper.childElementCount === 0) wrapper.remove();
  }

  // Remove any stray <br> from h3 elements
  h3s.forEach((h3) => h3.querySelector('br')?.remove());

  // Find the CTA link in any h3, then hoist it into its own <p>
  let ctaLink;
  let ctaHost;
  for (const h3 of h3s) {
    const link = h3.querySelector('a');
    if (link) { ctaLink = link; ctaHost = h3; break; }
  }
  if (ctaLink && ctaHost) {
    const p = document.createElement('p');
    p.classList.add('primary-hero-cta');
    p.append(ctaLink);
    const lastH3 = h3s[h3s.length - 1];
    lastH3.after(p);
  }

  // Mark the containing section so all three heroes lay out as a grid
  block.closest('.section')?.classList.add('hero-grid');
}
