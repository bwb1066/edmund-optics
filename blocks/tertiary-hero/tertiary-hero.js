export default function decorate(block) {
  // First picture anywhere in the block = full-bleed background
  const bgPicture = block.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('tertiary-hero-bg');
    block.prepend(bgPicture);
  }

  // Heading may wrap its link in <strong> — unwrap so the <a> is a direct child.
  // Accepts h1 or h2: h2 is preferred authoring (this tile sits alongside
  // primary-hero's h1 in the hero-grid, so only one h1 should exist per page).
  const heading = block.querySelector('h1, h2');
  if (heading) {
    const strong = heading.querySelector('strong');
    const a = strong?.querySelector('a');
    if (strong && a) strong.replaceWith(a);
  }

  // Build a centered content overlay (matches secondary-hero)
  const content = document.createElement('div');
  content.className = 'tertiary-hero-content';
  if (heading) content.append(heading);

  // Remove the EDS wrapper divs so .tertiary-hero-content is a direct child;
  // position:absolute;inset:0 then centers reliably inside the card.
  [...block.querySelectorAll(':scope > div')].forEach((div) => div.remove());
  block.appendChild(content);
}
