export default function decorate(block) {
  // Search whole block so multi-row authoring still works
  const bgPicture = block.querySelector('picture');
  if (bgPicture) {
    bgPicture.classList.add('primary-hero-bg');
    const bgImg = bgPicture.querySelector('img');
    if (bgImg) {
      bgImg.loading = 'eager';
      bgImg.fetchPriority = 'high';
    }
    block.prepend(bgPicture);
  }

  const h3s = [...block.querySelectorAll('h3')];

  // Remove any stray <br> from h3 elements
  h3s.forEach((h3) => h3.querySelector('br')?.remove());

  // Find the CTA link in any h3, then hoist it into its own <p>
  const ctaHost = h3s.find((h3) => h3.querySelector('a'));
  if (ctaHost) {
    const p = document.createElement('p');
    p.classList.add('primary-hero-cta');
    p.append(ctaHost.querySelector('a'));
    h3s[h3s.length - 1].after(p);
  }

  // Promote subheadings h3 -> h2: they sit directly under the hero's h1, so an
  // h3 here skips a level (a11y: heading-order). Drop any now-empty heading.
  h3s.forEach((h3) => {
    if (!h3.textContent.trim()) {
      h3.remove();
      return;
    }
    const h2 = document.createElement('h2');
    if (h3.id) h2.id = h3.id;
    h2.append(...h3.childNodes);
    h3.replaceWith(h2);
  });

  // Mark the containing section so all three heroes lay out as a grid
  block.closest('.section')?.classList.add('hero-grid');
}
