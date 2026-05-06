export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div');
  if (!inner) return;

  // First picture = full-bleed background
  const bgPicture = inner.querySelector(':scope > p > picture');
  if (bgPicture) {
    bgPicture.classList.add('tertiary-hero-bg');
    block.prepend(bgPicture);
  }

  // h1 may contain a link — unwrap strong so the <a> is a direct h1 child
  const h1 = inner.querySelector(':scope > h1');
  if (h1) {
    const strong = h1.querySelector('strong');
    const a = strong?.querySelector('a');
    if (strong && a) strong.replaceWith(a);
  }
}
