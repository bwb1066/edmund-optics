export default function decorate(block) {
  // Collect pictures and the first heading anywhere in the block,
  // regardless of exact nesting (p > picture vs bare picture, etc.)
  const allPictures = [...block.querySelectorAll('picture')];
  const heading = block.querySelector('h1, h2');

  // First picture = full-bleed background
  const bgPicture = allPictures[0];
  if (bgPicture) {
    bgPicture.classList.add('secondary-hero-bg');
    block.prepend(bgPicture);
  }

  // Build content overlay
  const content = document.createElement('div');
  content.className = 'secondary-hero-content';

  // Product artwork + logo only in the 3-picture "brand spotlight" variant
  if (allPictures[1] && allPictures[2]) {
    const productWrap = document.createElement('div');
    productWrap.className = 'secondary-hero-product';
    productWrap.append(allPictures[1]);
    content.append(productWrap);
  }

  if (heading) content.append(heading);

  if (allPictures[2]) {
    const logoWrap = document.createElement('div');
    logoWrap.className = 'secondary-hero-logo';
    logoWrap.append(allPictures[2]);
    content.append(logoWrap);
  }

  // Remove all EDS wrapper divs (now empty after extracting content above)
  // so .secondary-hero-content becomes a direct child of .secondary-hero.
  // position:absolute;inset:0 then resolves against .secondary-hero with
  // no intermediate containing-block candidates — guaranteed centering.
  [...block.querySelectorAll(':scope > div')].forEach((div) => div.remove());
  block.appendChild(content);
}
