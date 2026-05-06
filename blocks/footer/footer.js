import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// Social hrefs are fallbacks; authors should link images in the CMS
const SOCIAL_HREFS = {
  facebook: 'https://www.facebook.com/edmundoptics',
  x: 'https://www.twitter.com/edmundoptics',
  twitter: 'https://www.twitter.com/edmundoptics',
  youtube: 'https://www.youtube.com/edmundoptics',
  linkedin: 'https://www.linkedin.com/company/edmund-optics',
  instagram: 'https://www.instagram.com/edmundoptics/',
  tiktok: 'https://www.tiktok.com/@edmundoptics',
};

function getSocialName(alt) {
  const a = alt.toLowerCase();
  if (a.includes('facebook')) return 'facebook';
  if (a.includes('tiktok') || a.includes('tik tok')) return 'tiktok';
  if (a.includes('instagram')) return 'instagram';
  if (a.includes('linkedin')) return 'linkedin';
  if (a.includes('youtube')) return 'youtube';
  if (a.includes(' x') || a.endsWith(' x') || a.includes('twitter')) return 'x';
  return null;
}

// Nav has 6 authored groups mapped to 4 visual columns:
// col1=About Us, col2=Customer Care+Adv Mfg, col3=Discounts, col4=Catalogs+Hiring CTA
function decorateNavSection(section) {
  section.classList.add('footer-nav');
  const ul = section.querySelector('.default-content-wrapper > ul');
  if (!ul) return;

  const items = [...ul.children];
  const grid = document.createElement('div');
  grid.className = 'footer-nav-grid';

  [[items[0]], [items[1], items[2]], [items[3]], [items[4], items[5]]].forEach((group) => {
    const col = document.createElement('div');
    col.className = 'footer-nav-col';
    group.filter(Boolean).forEach((li) => {
      const firstP = li.querySelector(':scope > p');
      if (firstP && !firstP.classList.contains('button-wrapper')) {
        firstP.className = 'footer-nav-heading';
        col.append(firstP);
      }
      const subUl = li.querySelector(':scope > ul');
      if (subUl) col.append(subUl);
      li.querySelectorAll(':scope > p').forEach((p) => col.append(p));
    });
    grid.append(col);
  });

  ul.replaceWith(grid);
}

// CMS puts all social <picture>s + tagline text together in one <h3>
function decorateLegalSection(section) {
  section.classList.add('footer-legal');
  const wrapper = section.querySelector('.default-content-wrapper');
  if (!wrapper) return;

  const socialList = document.createElement('ul');
  socialList.className = 'footer-social';
  const taglineEl = document.createElement('p');

  const h3 = wrapper.querySelector('h3');
  if (h3) {
    [...h3.querySelectorAll('picture')].forEach((picture) => {
      const img = picture.querySelector('img');
      if (!img) return;
      const name = getSocialName(img.alt || '');
      if (!name) return;
      const a = document.createElement('a');
      a.href = SOCIAL_HREFS[name] || '#';
      a.setAttribute('aria-label', img.alt);
      a.setAttribute('target', '_blank');
      a.setAttribute('rel', 'nofollow noopener');
      a.append(picture);
      const li = document.createElement('li');
      li.append(a);
      socialList.append(li);
    });
    // remaining nodes after pictures are moved out = tagline; skip leading <br>s
    let sawContent = false;
    while (h3.firstChild) {
      const node = h3.firstChild;
      if (!sawContent && node.nodeName === 'BR') { node.remove(); } else {
        sawContent = true;
        taglineEl.append(node);
      }
    }
    h3.remove();
  }

  const left = document.createElement('div');
  left.className = 'footer-legal-left';
  while (wrapper.firstChild) left.append(wrapper.firstChild);

  const right = document.createElement('div');
  right.className = 'footer-legal-right';
  right.append(socialList);
  if (taglineEl.hasChildNodes()) right.append(taglineEl);

  wrapper.append(left, right);
}

export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : '/footer';
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;

  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  const sections = footer.querySelectorAll(':scope > div');
  if (sections[0]) sections[0].classList.add('footer-signup');
  if (sections[1]) decorateNavSection(sections[1]);
  if (sections[2]) decorateLegalSection(sections[2]);
  if (sections[3]) sections[3].classList.add('footer-certs');

  block.append(footer);
}
