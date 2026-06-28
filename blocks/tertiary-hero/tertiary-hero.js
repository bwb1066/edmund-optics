export default function decorate(block) {
  // First picture anywhere in the block = full-bleed background
  const bgPicture = block.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('tertiary-hero-bg');
    block.prepend(bgPicture);
  }

  // h1 may wrap its link in <strong> — unwrap so the <a> is a direct child
  const h1 = block.querySelector('h1');
  if (h1) {
    const strong = h1.querySelector('strong');
    const a = strong?.querySelector('a');
    if (strong && a) strong.replaceWith(a);
  }

  // Build a centered content overlay (matches secondary-hero)
  const content = document.createElement('div');
  content.className = 'tertiary-hero-content';
  if (h1) content.append(h1);

  // Remove the EDS wrapper divs so .tertiary-hero-content is a direct child;
  // position:absolute;inset:0 then centers reliably inside the card.
  [...block.querySelectorAll(':scope > div')].forEach((div) => div.remove());
  block.appendChild(content);
}
