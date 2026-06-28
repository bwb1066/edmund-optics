const NS = 'http://www.w3.org/2000/svg';

function icon(type) {
  const svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', '22');
  svg.setAttribute('height', '22');
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('aria-hidden', 'true');
  const paths = type === 'chat'
    ? ['M3 5h18v12H9l-4 4v-4H3z']
    : ['M3 5h18v14H3z', 'M3 6l9 7 9-7'];
  paths.forEach((d) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    svg.append(p);
  });
  return svg;
}

// Split a cell into "lines", breaking on <br> boundaries. Descends into <p>
// wrappers (EDS wraps loose cell text in <p>) so their inner <br>s split too.
function splitLines(cell) {
  const lines = [];
  let current = document.createDocumentFragment();
  const flush = () => {
    if ((current.textContent || '').trim() || current.querySelector('a, picture')) {
      lines.push(current);
    }
    current = document.createDocumentFragment();
  };
  const walk = (parent) => {
    [...parent.childNodes].forEach((node) => {
      if (node.nodeName === 'BR') {
        flush();
      } else if (node.nodeName === 'P') {
        flush();
        walk(node);
        flush();
      } else {
        current.append(node);
      }
    });
  };
  walk(cell);
  flush();
  return lines;
}

export default function decorate(block) {
  const row = block.querySelector(':scope > div');
  const cells = row ? [...row.children] : [];

  const cols = cells.map((cell) => {
    const lines = splitLines(cell);
    let hi = lines.findIndex((l) => l.querySelector('strong, a'));
    if (hi < 0) hi = 0;

    const col = document.createElement('div');
    col.className = 'cc-col';

    lines.slice(0, hi).forEach((f) => {
      const s = document.createElement('span');
      s.className = 'cc-eyebrow';
      s.append(f);
      col.append(s);
    });

    const headline = lines[hi];
    if (headline) {
      const h = document.createElement('span');
      h.className = 'cc-headline';
      const text = headline.textContent.trim().toLowerCase();
      // Unwrap a redundant <strong> so styling is consistent.
      const strong = headline.querySelector('strong');
      if (strong) strong.replaceWith(...strong.childNodes);
      if (text.includes('live chat')) h.append(icon('chat'));
      else if (text.includes('email')) h.append(icon('email'));
      h.append(headline);
      if (!text.includes('live chat') && !text.includes('email')) {
        const chev = document.createElement('span');
        chev.className = 'cc-chevron';
        chev.textContent = '»';
        h.append(chev);
      }
      col.append(h);
    }

    lines.slice(hi + 1).forEach((f) => {
      const s = document.createElement('span');
      s.className = 'cc-sub';
      s.append(f);
      col.append(s);
    });

    // EDS decorateButtons may have added .button classes to standalone links.
    col.querySelectorAll('a').forEach((a) => a.removeAttribute('class'));

    return col;
  });

  block.replaceChildren(...cols);
}
