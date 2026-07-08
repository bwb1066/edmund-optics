const AUTOPLAY_MS = 6000;

/**
 * Authoring contract — one row per slide:
 *   | picture | eyebrow (p) + heading (h1/h2) + subcopy (p) + CTA link (p>a) |
 * The first slide's heading should be authored as h1 (the page's single
 * true heading); subsequent slides use h2 so the carousel never creates
 * more than one h1 on the page.
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const rows = [...block.children];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const track = document.createElement('div');
  track.className = 'hero-carousel-track';

  const slides = rows.map((row, i) => {
    const [mediaCell, textCell] = row.children;
    const picture = mediaCell?.querySelector('picture');
    if (picture) {
      const img = picture.querySelector('img');
      if (img) {
        img.loading = i === 0 ? 'eager' : 'lazy';
        if (i === 0) img.fetchPriority = 'high';
      }
    }

    const slide = document.createElement('div');
    slide.className = 'hero-carousel-slide';
    slide.setAttribute('role', 'group');
    slide.setAttribute('aria-roledescription', 'slide');
    slide.setAttribute('aria-label', `${i + 1} of ${rows.length}`);
    slide.hidden = i !== 0;

    if (picture) {
      picture.classList.add('hero-carousel-bg');
      slide.append(picture);
    }

    const content = document.createElement('div');
    content.className = 'hero-carousel-content';
    if (textCell) content.append(...textCell.childNodes);
    slide.append(content);

    track.append(slide);
    return slide;
  });

  block.replaceChildren(track);

  if (slides.length <= 1) return;

  const controls = document.createElement('div');
  controls.className = 'hero-carousel-controls';

  const prevBtn = document.createElement('button');
  prevBtn.type = 'button';
  prevBtn.className = 'hero-carousel-arrow hero-carousel-prev';
  prevBtn.setAttribute('aria-label', 'Previous slide');
  prevBtn.innerHTML = '&#8249;';

  const nextBtn = document.createElement('button');
  nextBtn.type = 'button';
  nextBtn.className = 'hero-carousel-arrow hero-carousel-next';
  nextBtn.setAttribute('aria-label', 'Next slide');
  nextBtn.innerHTML = '&#8250;';

  const dots = document.createElement('div');
  dots.className = 'hero-carousel-dots';
  dots.setAttribute('role', 'tablist');
  dots.setAttribute('aria-label', 'Slides');

  let current = 0;
  let timer = null;

  const dotButtons = slides.map((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'hero-carousel-dot';
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    dot.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    dots.append(dot);
    return dot;
  });

  function goTo(index) {
    const next = (index + slides.length) % slides.length;
    slides[current].hidden = true;
    dotButtons[current].setAttribute('aria-selected', 'false');
    current = next;
    slides[current].hidden = false;
    dotButtons[current].setAttribute('aria-selected', 'true');
  }

  function restartAutoplay() {
    if (prefersReducedMotion) return;
    clearInterval(timer);
    timer = setInterval(() => goTo(current + 1), AUTOPLAY_MS);
  }

  prevBtn.addEventListener('click', () => { goTo(current - 1); restartAutoplay(); });
  nextBtn.addEventListener('click', () => { goTo(current + 1); restartAutoplay(); });
  dotButtons.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); restartAutoplay(); }));

  block.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { goTo(current - 1); restartAutoplay(); }
    if (e.key === 'ArrowRight') { goTo(current + 1); restartAutoplay(); }
  });

  block.addEventListener('mouseenter', () => clearInterval(timer));
  block.addEventListener('mouseleave', restartAutoplay);
  block.addEventListener('focusin', () => clearInterval(timer));
  block.addEventListener('focusout', restartAutoplay);

  controls.append(prevBtn, dots, nextBtn);
  block.append(controls);

  restartAutoplay();
}
