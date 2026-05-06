export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div');
  if (!inner) return;

  const h1 = inner.querySelector('h1');
  const h3 = inner.querySelector('h3');

  // Pull the background <picture> out of <h1> and prepend to block root
  const bgPicture = h1?.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('primary-hero-bg');
    const bgImg = bgPicture.querySelector('img');
    if (bgImg) {
      bgImg.loading = 'eager';
      bgImg.fetchPriority = 'high';
    }
    block.prepend(bgPicture);
  }

  // Move the CTA <a> from <h3> into its own <p> below h3
  if (h3) {
    const link = h3.querySelector('a');
    const br = h3.querySelector('br');
    if (br) br.remove();
    if (link) {
      const p = document.createElement('p');
      p.classList.add('primary-hero-cta');
      p.append(link);
      h3.after(p);
    }
  }

  // Mark the containing section so all three heroes lay out as a grid
  block.closest('.section')?.classList.add('hero-grid');
}
