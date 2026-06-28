function tagIcon(label) {
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('viewBox', '0 0 16 16');
  svg.setAttribute('width', '12');
  svg.setAttribute('height', '12');
  svg.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(svgNS, 'path');
  if (/trending/i.test(label)) {
    // upward arrow
    path.setAttribute('d', 'M8 2 3 7h3v7h4V7h3z');
  } else {
    // document/page
    path.setAttribute('d', 'M4 1h6l3 3v11H4zm5 1v3h3z');
  }
  path.setAttribute('fill', 'currentColor');
  svg.append(path);
  return svg;
}

export default function decorate(block) {
  const inner = block.querySelector(':scope > div > div') || block;

  // ── Header ───────────────────────────────────────────────────────────
  const h1 = inner.querySelector('h1');
  const sub = inner.querySelector('h3');
  // "Browse All" is the first <p> that is NOT inside the cards table.
  const table = inner.querySelector('table');
  const cta = [...inner.querySelectorAll(':scope > p')].find((p) => !table || !table.contains(p));

  const head = document.createElement('div');
  head.className = 'kb-head';

  if (h1) {
    // Split "EDMUND OPTICS®  <br>  Knowledge Center" into eyebrow + title.
    const strong = h1.querySelector('strong');
    const titleText = (strong?.textContent || h1.textContent).trim();
    // Eyebrow = everything before the <br>/strong.
    const eyebrow = document.createElement('p');
    eyebrow.className = 'kb-eyebrow';
    const br = h1.querySelector('br');
    if (br) {
      const frag = document.createDocumentFragment();
      let n = h1.firstChild;
      while (n && n !== br) { const next = n.nextSibling; frag.append(n); n = next; }
      eyebrow.append(frag);
    } else {
      eyebrow.textContent = 'EDMUND OPTICS®';
    }
    if (eyebrow.textContent.trim()) head.append(eyebrow);

    const title = document.createElement('h1');
    title.className = 'kb-title';
    title.textContent = titleText;
    head.append(title);
  }

  if (sub) {
    const p = document.createElement('p');
    p.className = 'kb-sub';
    p.textContent = sub.textContent.trim();
    head.append(p);
  }

  if (cta) {
    const link = cta.querySelector('a');
    const el = document.createElement(link ? 'a' : 'span');
    el.className = 'kb-cta';
    if (link) el.href = link.getAttribute('href');
    el.textContent = cta.textContent.trim();
    head.append(el);
  }

  // ── Cards ────────────────────────────────────────────────────────────
  const cards = document.createElement('div');
  cards.className = 'kb-cards';

  if (table) {
    const rows = [...table.querySelectorAll('tbody > tr')];
    rows.forEach((row) => {
      const cellPic = row.querySelector('picture');
      if (!cellPic) return; // skips the "featured-cards" header row
      const cellsTd = [...row.children];
      const textTd = cellsTd[cellsTd.length - 1];
      const tag = textTd.querySelector('p')?.textContent.trim() || '';
      const titleEl = textTd.querySelector('h2, h3, h4');
      const href = titleEl?.querySelector('a')?.getAttribute('href');

      const card = document.createElement('article');
      card.className = 'kb-card';

      const media = document.createElement(href ? 'a' : 'div');
      media.className = 'kb-card-media';
      if (href) media.href = href;
      media.append(cellPic);
      card.append(media);

      if (tag) {
        const tagEl = document.createElement('p');
        tagEl.className = 'kb-card-tag';
        tagEl.append(tagIcon(tag));
        const span = document.createElement('span');
        span.textContent = tag.toUpperCase();
        tagEl.append(span);
        card.append(tagEl);
      }

      if (titleEl) {
        const h = document.createElement('h3');
        h.className = 'kb-card-title';
        const a = titleEl.querySelector('a');
        if (a) {
          a.textContent = a.textContent.trim();
          h.append(a);
        } else {
          h.textContent = titleEl.textContent.trim();
        }
        card.append(h);
      }

      cards.append(card);
    });
  }

  block.replaceChildren(head, cards);
}
