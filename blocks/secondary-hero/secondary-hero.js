export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div');
  if (!inner) return;

  const pPictures = [...inner.querySelectorAll(':scope > p > picture')];
  const h1 = inner.querySelector(':scope > h1');

  // First picture = full-bleed background
  if (pPictures[0]) {
    pPictures[0].classList.add('secondary-hero-bg');
    block.prepend(pPictures[0]);
  }

  // Build content overlay
  const content = document.createElement('div');
  content.className = 'secondary-hero-content';

  // Second picture = product/brand artwork (SONiX logo + products)
  if (pPictures[1]) {
    const wrap = document.createElement('div');
    wrap.className = 'secondary-hero-product';
    wrap.append(pPictures[1]);
    content.append(wrap);
  }

  // Headline
  if (h1) content.append(h1);

  // Third picture = EO logo
  if (pPictures[2]) {
    const wrap = document.createElement('div');
    wrap.className = 'secondary-hero-logo';
    wrap.append(pPictures[2]);
    content.append(wrap);
  }

  inner.replaceChildren(content);
}
