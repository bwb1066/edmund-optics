/**
 * Progressive (accordion) mobile nav for the concept-1a theme.
 *
 * The stock header force-expands the entire multi-level nav tree on mobile,
 * dumping ~700 items at once. This adds tap-to-drill-down: each list item with
 * a submenu toggles it open/closed (siblings collapse), revealing one level at
 * a time. Additive and opt-in — invoked from header.js only when
 * body.concept-1a is present, and only acts on mobile.
 *
 * State lives on a private `data-c1a-open` attribute rather than aria-expanded,
 * because header.js already binds the top-level items' aria-expanded to the
 * desktop shop-drawer / mega-menu / company-dropdown (MutationObservers).
 * Reusing it would trip those panels; a separate attribute keeps the two
 * behaviors fully decoupled.
 *
 * @param {Element} nav The decorated <nav id="nav"> element
 */
export default function enhanceMobileNav(nav) {
  const mobile = window.matchMedia('(max-width: 899px)');
  const sections = nav.querySelector('.nav-sections');
  if (!sections) return;

  const labelOf = (li) => [...li.children].find((c) => c.tagName === 'A' || c.tagName === 'P');
  const hasSubmenu = (li) => [...li.children].some((c) => c.tagName === 'UL');

  // Make each expandable label click-focusable. Without this, tapping a
  // non-focusable <p> blurs the nav and header.js's focusout handler closes
  // the whole drawer before the toggle runs. tabindex=-1 keeps it out of the
  // desktop tab order while still taking focus on tap.
  sections.querySelectorAll('li').forEach((li) => {
    if (!hasSubmenu(li)) return;
    const label = labelOf(li);
    if (label) {
      label.setAttribute('tabindex', '-1');
      label.setAttribute('role', 'button');
    }
  });

  const collapseAll = () => {
    sections.querySelectorAll('[data-c1a-open]').forEach((li) => li.removeAttribute('data-c1a-open'));
    // The stock toggleMenu sets top-level aria-expanded=true on open, which
    // would fire header.js's desktop panels; force them back closed on mobile.
    sections
      .querySelectorAll('.default-content-wrapper > ul > li[aria-expanded="true"]')
      .forEach((li) => li.setAttribute('aria-expanded', 'false'));
  };

  sections.addEventListener('click', (e) => {
    if (!mobile.matches) return;
    const label = e.target.closest('a, p');
    if (!label || !sections.contains(label)) return;
    const li = label.closest('li');
    if (!li || !sections.contains(li)) return;
    if (!hasSubmenu(li)) return; // leaf link → let it navigate

    e.preventDefault();
    e.stopPropagation();
    const isOpen = li.hasAttribute('data-c1a-open');
    [...li.parentElement.children].forEach((sib) => sib.removeAttribute('data-c1a-open'));
    if (!isOpen) li.setAttribute('data-c1a-open', '');
  }, true);

  new MutationObserver(() => {
    if (mobile.matches && nav.getAttribute('aria-expanded') === 'true') collapseAll();
  }).observe(nav, { attributes: true, attributeFilter: ['aria-expanded'] });

  if (mobile.matches) collapseAll();
}
