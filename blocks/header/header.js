import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';

// media query match that indicates mobile/tablet width
const isDesktop = window.matchMedia('(min-width: 900px)');

function closeOnEscape(e) {
  if (e.code === 'Escape') {
    const nav = document.getElementById('nav');
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections);
      navSectionExpanded.focus();
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections);
      nav.querySelector('button').focus();
    }
  }
}

function closeOnFocusLost(e) {
  const nav = e.currentTarget;
  if (!nav.contains(e.relatedTarget)) {
    const navSections = nav.querySelector('.nav-sections');
    if (!navSections) return;
    const navSectionExpanded = navSections.querySelector('[aria-expanded="true"]');
    if (navSectionExpanded && isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleAllNavSections(navSections, false);
    } else if (!isDesktop.matches) {
      // eslint-disable-next-line no-use-before-define
      toggleMenu(nav, navSections, false);
    }
  }
}

function openOnKeydown(e) {
  const focused = document.activeElement;
  const isNavDrop = focused.className === 'nav-drop';
  if (isNavDrop && (e.code === 'Enter' || e.code === 'Space')) {
    const dropExpanded = focused.getAttribute('aria-expanded') === 'true';
    // eslint-disable-next-line no-use-before-define
    toggleAllNavSections(focused.closest('.nav-sections'));
    focused.setAttribute('aria-expanded', dropExpanded ? 'false' : 'true');
  }
}

function focusNavSection() {
  document.activeElement.addEventListener('keydown', openOnKeydown);
}

/**
 * Toggles all nav sections
 * @param {Element} sections The container element
 * @param {Boolean} expanded Whether the element should be expanded or collapsed
 */
function toggleAllNavSections(sections, expanded = false) {
  if (!sections) return;
  sections.querySelectorAll('.nav-sections .default-content-wrapper > ul > li').forEach((section) => {
    section.setAttribute('aria-expanded', expanded);
  });
}

/**
 * Toggles the entire nav
 * @param {Element} nav The container element
 * @param {Element} navSections The nav sections within the container element
 * @param {*} forceExpanded Optional param to force nav expand behavior when not null
 */
function toggleMenu(nav, navSections, forceExpanded = null) {
  const expanded = forceExpanded !== null ? !forceExpanded : nav.getAttribute('aria-expanded') === 'true';
  const button = nav.querySelector('.nav-hamburger button');
  document.body.style.overflowY = (expanded || isDesktop.matches) ? '' : 'hidden';
  nav.setAttribute('aria-expanded', expanded ? 'false' : 'true');
  toggleAllNavSections(navSections, expanded || isDesktop.matches ? 'false' : 'true');
  button.setAttribute('aria-label', expanded ? 'Open navigation' : 'Close navigation');
  // enable nav dropdown keyboard accessibility
  if (navSections) {
    const navDrops = navSections.querySelectorAll('.nav-drop');
    if (isDesktop.matches) {
      navDrops.forEach((drop) => {
        if (!drop.hasAttribute('tabindex')) {
          drop.setAttribute('tabindex', 0);
          drop.addEventListener('focus', focusNavSection);
        }
      });
    } else {
      navDrops.forEach((drop) => {
        drop.removeAttribute('tabindex');
        drop.removeEventListener('focus', focusNavSection);
      });
    }
  }

  // enable menu collapse on escape keypress
  if (!expanded || isDesktop.matches) {
    window.addEventListener('keydown', closeOnEscape);
    nav.addEventListener('focusout', closeOnFocusLost);
  } else {
    window.removeEventListener('keydown', closeOnEscape);
    nav.removeEventListener('focusout', closeOnFocusLost);
  }
}

/**
 * loads and decorates the header, mainly the nav
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  // load nav as fragment
  const navMeta = getMetadata('nav');
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : '/nav';
  const fragment = await loadFragment(navPath);

  // decorate nav DOM
  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  while (fragment.firstElementChild) nav.append(fragment.firstElementChild);

  const classes = ['brand', 'sections', 'tools'];
  classes.forEach((c, i) => {
    const section = nav.children[i];
    if (section) section.classList.add(`nav-${c}`);
  });

  const navBrand = nav.querySelector('.nav-brand');
  const brandLink = navBrand?.querySelector('.button');
  if (brandLink) {
    brandLink.className = '';
    brandLink.closest('.button-container').className = '';
  }

  // Ensure nav-tools exists (CMS may only author brand + sections)
  let navTools = nav.querySelector('.nav-tools');
  if (!navTools) {
    navTools = document.createElement('div');
    navTools.className = 'nav-tools';
    nav.append(navTools);
  }

  // Move account/cart ul from brand → tools, add icons
  const utilLinks = navBrand?.querySelector('ul');
  if (utilLinks && navTools) {
    utilLinks.classList.add('nav-util-links');
    [...utilLinks.children].forEach((li) => {
      const a = li.querySelector('a');
      if (!a) return;
      const label = a.textContent.trim().toLowerCase();
      if (label.includes('account')) {
        li.classList.add('nav-util-account');
        a.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>');
        a.insertAdjacentHTML('beforeend', '<svg class="nav-chevron" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>');
      } else if (label.includes('cart')) {
        a.insertAdjacentHTML('afterbegin', '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>');
        a.insertAdjacentHTML('beforeend', '<span class="nav-cart-count">0</span>');
      }
    });
    navTools.append(utilLinks);
  }

  // Search bar
  const searchDiv = document.createElement('div');
  searchDiv.className = 'nav-search';
  searchDiv.innerHTML = '<form class="nav-search-form" role="search" action="/search" method="get"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg><input type="search" name="q" placeholder="Search by Keyword, Stock Number, or Resource" aria-label="Search"></form>';

  // Wrap brand + search + tools in a single top bar div
  const topBar = document.createElement('div');
  topBar.className = 'nav-topbar';
  topBar.append(navBrand, searchDiv, navTools);
  nav.prepend(topBar);

  // ── Util data + panel builder (used by both secondary-tools and util-bar) ──
  const utilLanguages = [
    { label: 'English', href: '#', current: true },
    { label: '简体中文', href: '/zh/' },
    { label: '日本語', href: '/ja/' },
    { label: '한국어', href: '/ko/' },
    { label: '繁體中文', href: '/zh-tw/' },
    { label: 'Deutsch', href: '/de/' },
    { label: 'Français', href: '/fr/' },
  ];

  const utilCurrencies = [
    {
      flag: '🇺🇸', code: 'USD', href: '#', current: true,
    },
    { flag: '🇬🇧', code: 'GBP', href: '#' },
    { flag: '🇪🇺', code: 'EUR', href: '#' },
    { flag: '🇯🇵', code: 'JPY', href: '#' },
    { flag: '🇸🇬', code: 'SGD', href: '#' },
    { flag: '🇰🇷', code: 'KRW', href: '#' },
    { flag: '🇨🇳', code: 'RMB', href: '#' },
    { flag: '🇹🇼', code: 'TWD', href: '#' },
    { flag: '🇦🇺', code: 'AUD', href: '#' },
    { flag: '🇮🇳', code: 'INR', href: '#' },
    { flag: '🇨🇦', code: 'CAD', href: '#' },
  ];

  const buildUtilPanel = (items, heading, isCurrency) => {
    const panel = document.createElement('div');
    panel.className = `util-dropdown${isCurrency ? ' util-currency-dropdown' : ' util-lang-dropdown'}`;
    const h = document.createElement('p');
    h.className = 'util-dropdown-heading';
    h.textContent = heading;
    panel.appendChild(h);
    const grid = document.createElement('ul');
    grid.className = 'util-dropdown-grid';
    items.forEach(({
      flag, code, label, href, current,
    }) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = href;
      if (isCurrency) {
        a.innerHTML = `<span class="util-flag" aria-hidden="true">${flag}</span>${code}`;
      } else {
        a.textContent = label;
      }
      if (current) a.classList.add('util-dropdown-current');
      li.appendChild(a);
      grid.appendChild(li);
    });
    panel.appendChild(grid);
    if (isCurrency) {
      const note = document.createElement('p');
      note.className = 'util-currency-note';
      note.innerHTML = "Can't find your local currency? Visit our <a href='/contact-support/'>Contact Us</a> page for pricing guidance.";
      panel.appendChild(note);
    }
    return panel;
  };

  const navSections = nav.querySelector('.nav-sections');
  if (navSections) {
    navSections.querySelectorAll(':scope .default-content-wrapper > ul > li').forEach((navSection) => {
      if (navSection.querySelector('ul')) navSection.classList.add('nav-drop');
      navSection.addEventListener('click', () => {
        if (isDesktop.matches) {
          const expanded = navSection.getAttribute('aria-expanded') === 'true';
          toggleAllNavSections(navSections);
          navSection.setAttribute('aria-expanded', expanded ? 'false' : 'true');
        }
      });
    });

    // ── Manufacturing megamenu & Company nav item classes ──
    const allNavLis = [...navSections.querySelectorAll(':scope .default-content-wrapper > ul > li')];

    // ── Company dropdown — body-level panel (same reason as Manufacturing) ──
    const companyItem = allNavLis.find(
      (li) => li.querySelector(':scope > p, :scope > a')?.textContent.trim().toLowerCase().startsWith('company'),
    );
    if (companyItem) {
      companyItem.classList.add('nav-company');
      const inlineCompanyDrop = companyItem.querySelector(':scope > ul');
      let companyCloseTimer;
      companyItem.addEventListener('mouseenter', () => {
        if (!isDesktop.matches) return;
        clearTimeout(companyCloseTimer);
        toggleAllNavSections(navSections);
        companyItem.setAttribute('aria-expanded', 'true');
      });
      companyItem.addEventListener('mouseleave', () => {
        if (!isDesktop.matches) return;
        companyCloseTimer = setTimeout(() => companyItem.setAttribute('aria-expanded', 'false'), 150);
      });
      if (inlineCompanyDrop) {
        inlineCompanyDrop.addEventListener('mouseenter', () => clearTimeout(companyCloseTimer));
        inlineCompanyDrop.addEventListener('mouseleave', () => {
          if (!isDesktop.matches) return;
          companyItem.setAttribute('aria-expanded', 'false');
        });
      }
    }

    const mfgItem = allNavLis.find(
      (li) => li.querySelector(':scope > p, :scope > a')?.textContent.trim().toLowerCase().startsWith('manufactur'),
    );
    if (mfgItem) {
      mfgItem.classList.add('nav-megamenu');
      const colorMap = [
        ['precision', 'mfg-orange'],
        ['laser', 'mfg-purple'],
        ['filter', 'mfg-pink'],
        ['imaging', 'mfg-teal'],
      ];

      // Build panel as a body-level element so position:fixed hits the real viewport
      const panel = document.createElement('div');
      panel.className = 'mfg-megamenu-panel';

      const dropdown = mfgItem.querySelector(':scope > ul');
      if (dropdown) {
        [...dropdown.children].forEach((li) => {
          const clone = li.cloneNode(true);
          const link = clone.querySelector('a');
          if (!link) { clone.classList.add('megamenu-desc'); panel.appendChild(clone); return; }
          clone.classList.add('megamenu-tile');
          const t = link.textContent.toLowerCase();
          const color = colorMap.find(([kw]) => t.includes(kw))?.[1];
          if (color) clone.classList.add(color);
          const text = link.textContent.trim();
          const byIdx = text.search(/\s+by\s+/i);
          if (byIdx !== -1) {
            const title = text.slice(0, byIdx);
            const brand = text.slice(byIdx).replace(/^\s*by\s*/i, '');
            const spIdx = title.indexOf(' ');
            const bold = (spIdx > -1 ? title.slice(0, spIdx) : title).toUpperCase();
            const rest = (spIdx > -1 ? title.slice(spIdx) : '').toUpperCase();
            link.innerHTML = `<span class="tile-name"><strong>${bold}</strong>${rest}</span><span class="tile-brand">by ${brand.toUpperCase()}</span>`;
          }
          panel.appendChild(clone);
        });
      }

      document.body.appendChild(panel);

      new MutationObserver(() => {
        panel.classList.toggle('is-open', mfgItem.getAttribute('aria-expanded') === 'true');
      }).observe(mfgItem, { attributes: true, attributeFilter: ['aria-expanded'] });

      // Hover-open: Manufacturing opens on mouseenter, closes on mouseleave with a
      // short grace period so the mouse can travel into the body-level panel.
      let mfgCloseTimer;
      mfgItem.addEventListener('mouseenter', () => {
        if (!isDesktop.matches) return;
        clearTimeout(mfgCloseTimer);
        toggleAllNavSections(navSections);
        mfgItem.setAttribute('aria-expanded', 'true');
      });
      mfgItem.addEventListener('mouseleave', () => {
        if (!isDesktop.matches) return;
        mfgCloseTimer = setTimeout(() => {
          if (!panel.matches(':hover')) mfgItem.setAttribute('aria-expanded', 'false');
        }, 150);
      });
      panel.addEventListener('mouseenter', () => clearTimeout(mfgCloseTimer));
      panel.addEventListener('mouseleave', () => {
        if (!isDesktop.matches) return;
        mfgItem.setAttribute('aria-expanded', 'false');
      });
    }

    // ── Shop drawer ──
    const shopItem = allNavLis.find(
      (li) => li.querySelector(':scope > a, :scope > p')?.textContent.trim().toLowerCase().startsWith('shop'),
    ) || allNavLis[0];

    if (shopItem && shopItem !== mfgItem && shopItem !== companyItem) {
      shopItem.classList.add('nav-shop');

      const shopOverlay = document.createElement('div');
      shopOverlay.className = 'shop-drawer-overlay';
      document.body.appendChild(shopOverlay);

      const shopPanel = document.createElement('div');
      shopPanel.className = 'shop-drawer-panel';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'shop-drawer-close';
      closeBtn.setAttribute('aria-label', 'Close shop menu');
      closeBtn.innerHTML = '&times;';
      shopPanel.appendChild(closeBtn);

      const drawerList = document.createElement('ul');
      drawerList.className = 'shop-drawer-list';

      const catHeader = document.createElement('li');
      catHeader.className = 'shop-drawer-section-header';
      catHeader.textContent = 'Shop by Category';
      drawerList.appendChild(catHeader);

      // Use shopItem's nested ul if available; otherwise fall back to peer navLis
      const shopDropdown = shopItem.querySelector(':scope > ul');
      const categoryItems = shopDropdown
        ? [...shopDropdown.children]
        : allNavLis.filter((li) => {
          const t = li.querySelector(':scope > a, :scope > p')?.textContent.trim().toLowerCase() ?? '';
          return li !== mfgItem && li !== companyItem && li !== shopItem && !t.startsWith('learn');
        });

      categoryItems.forEach((li) => {
        const link = li.querySelector('a');
        if (!link) return;
        const row = document.createElement('li');
        row.className = 'shop-drawer-item';
        const a = document.createElement('a');
        a.href = link.href;
        a.textContent = link.textContent.trim();
        row.appendChild(a);
        drawerList.appendChild(row);
      });

      const toolsHeader = document.createElement('li');
      toolsHeader.className = 'shop-drawer-section-header';
      toolsHeader.textContent = 'Product Tools and Discounts';
      drawerList.appendChild(toolsHeader);

      [
        ['Quick Quote Tool', '/tools/quote'],
        ['Custom Quoting & Calculators', '/products/product-selection-tools#custom'],
        ['Product Selection Tools', '/products/product-selection-tools'],
        ['Programs & Promotions', '/promotions/'],
      ].forEach(([text, href]) => {
        const row = document.createElement('li');
        row.className = 'shop-drawer-item';
        const a = document.createElement('a');
        a.href = href;
        a.textContent = text;
        row.appendChild(a);
        drawerList.appendChild(row);
      });

      shopPanel.appendChild(drawerList);
      document.body.appendChild(shopPanel);

      new MutationObserver(() => {
        const open = shopItem.getAttribute('aria-expanded') === 'true';
        shopPanel.classList.toggle('is-open', open);
        shopOverlay.classList.toggle('is-open', open);
      }).observe(shopItem, { attributes: true, attributeFilter: ['aria-expanded'] });

      const closeShop = () => {
        if (isDesktop.matches) shopItem.setAttribute('aria-expanded', 'false');
      };
      closeBtn.addEventListener('click', closeShop);
      shopOverlay.addEventListener('click', closeShop);
    }

    // Inject right-side secondary tools into the primary nav bar
    const secTools = document.createElement('ul');
    secTools.className = 'nav-secondary-tools';

    // English (language) — click-to-open, not hover
    const secLangLi = document.createElement('li');
    secLangLi.className = 'nav-drop';
    secLangLi.setAttribute('aria-expanded', 'false');
    const secLangA = document.createElement('a');
    secLangA.href = '#';
    secLangA.textContent = 'English';
    const secLangPanel = buildUtilPanel(utilLanguages, 'Select Your Language:', false);
    secLangLi.append(secLangA, secLangPanel);

    // USD (currency) — click-to-open, not hover
    const secCurrencyLi = document.createElement('li');
    secCurrencyLi.className = 'nav-drop';
    secCurrencyLi.setAttribute('aria-expanded', 'false');
    const secCurrencyA = document.createElement('a');
    secCurrencyA.href = '#';
    secCurrencyA.textContent = 'USD';
    const secCurrencyPanel = buildUtilPanel(utilCurrencies, 'Select Your Currency:', true);
    secCurrencyLi.append(secCurrencyA, secCurrencyPanel);

    // Phone + Contact
    const secPhoneLi = document.createElement('li');
    secPhoneLi.innerHTML = '<a href="tel:18003631992"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></svg>1-800-363-1992</a>';
    const secContactLi = document.createElement('li');
    secContactLi.innerHTML = '<a href="/contact-support/">Contact Us</a>';

    secTools.append(secLangLi, secCurrencyLi, secPhoneLi, secContactLi);
    navSections.append(secTools);

    // Hover-open handlers for secondary tools English/USD (on all viewports).
    [
      { li: secLangLi, panel: secLangPanel },
      { li: secCurrencyLi, panel: secCurrencyPanel },
    ].forEach(({ li, panel }) => {
      let secTimer;
      const open = () => {
        clearTimeout(secTimer);
        li.setAttribute('aria-expanded', 'true');
        panel.classList.add('is-open');
      };
      const close = () => {
        li.setAttribute('aria-expanded', 'false');
        panel.classList.remove('is-open');
      };
      li.addEventListener('mouseenter', open);
      li.addEventListener('mouseleave', () => {
        secTimer = setTimeout(() => {
          if (!panel.matches(':hover')) close();
        }, 150);
      });
      panel.addEventListener('mouseenter', () => clearTimeout(secTimer));
      panel.addEventListener('mouseleave', close);
      // Keep the link from navigating when tapped/clicked.
      li.querySelector('a').addEventListener('click', (e) => e.preventDefault());
    });

    // Hover-open for remaining nav-drop items (e.g. "Learn")
    allNavLis
      .filter((li) => li.classList.contains('nav-drop') && li !== mfgItem && li !== companyItem && li !== shopItem)
      .forEach((item) => {
        let dropTimer;
        item.addEventListener('mouseenter', () => {
          if (!isDesktop.matches) return;
          clearTimeout(dropTimer);
          toggleAllNavSections(navSections);
          item.setAttribute('aria-expanded', 'true');
        });
        item.addEventListener('mouseleave', () => {
          if (!isDesktop.matches) return;
          dropTimer = setTimeout(() => item.setAttribute('aria-expanded', 'false'), 150);
        });
        const ul = item.querySelector(':scope > ul');
        if (ul) {
          ul.addEventListener('mouseenter', () => clearTimeout(dropTimer));
          ul.addEventListener('mouseleave', () => {
            if (!isDesktop.matches) return;
            item.setAttribute('aria-expanded', 'false');
          });
        }
      });
  }

  // hamburger for mobile — prepend into topBar
  const hamburger = document.createElement('div');
  hamburger.classList.add('nav-hamburger');
  hamburger.innerHTML = `<button type="button" aria-controls="nav" aria-label="Open navigation">
      <span class="nav-hamburger-icon"></span>
    </button>`;
  hamburger.addEventListener('click', () => toggleMenu(nav, navSections));
  topBar.prepend(hamburger);

  // ── Utility bar (language + currency pickers) ──
  const utilBar = document.createElement('div');
  utilBar.className = 'nav-util-bar';

  const utilBarList = document.createElement('ul');
  utilBarList.className = 'util-bar-list';

  // My Account — hidden on mobile
  const utilAccountLi = document.createElement('li');
  utilAccountLi.className = 'util-bar-item util-bar-account';
  utilAccountLi.innerHTML = '<a href="/account/">My Account</a>';
  utilBarList.appendChild(utilAccountLi);

  // Language picker
  const utilLangLi = document.createElement('li');
  utilLangLi.className = 'util-bar-item util-bar-lang';
  const utilLangBtn = document.createElement('button');
  utilLangBtn.className = 'util-bar-btn';
  utilLangBtn.setAttribute('aria-expanded', 'false');
  utilLangBtn.textContent = 'English';
  const utilLangPanel = buildUtilPanel(utilLanguages, 'Select Your Language:', false);
  utilLangLi.appendChild(utilLangBtn);
  utilLangLi.appendChild(utilLangPanel);
  utilBarList.appendChild(utilLangLi);

  // Currency picker
  const utilCurrencyLi = document.createElement('li');
  utilCurrencyLi.className = 'util-bar-item util-bar-currency';
  const utilCurrencyBtn = document.createElement('button');
  utilCurrencyBtn.className = 'util-bar-btn';
  utilCurrencyBtn.setAttribute('aria-expanded', 'false');
  utilCurrencyBtn.textContent = 'USD';
  const utilCurrencyPanel = buildUtilPanel(utilCurrencies, 'Select Your Currency:', true);
  utilCurrencyLi.appendChild(utilCurrencyBtn);
  utilCurrencyLi.appendChild(utilCurrencyPanel);
  utilBarList.appendChild(utilCurrencyLi);

  // Contact Us
  const utilContactLi = document.createElement('li');
  utilContactLi.className = 'util-bar-item util-bar-contact';
  utilContactLi.innerHTML = '<a href="/contact-support/">Contact Us</a>';
  utilBarList.appendChild(utilContactLi);

  utilBar.appendChild(utilBarList);

  const closeAllUtilDropdowns = () => {
    utilBarList.querySelectorAll('.util-bar-btn[aria-expanded="true"]').forEach((btn) => {
      btn.setAttribute('aria-expanded', 'false');
      btn.nextElementSibling?.classList.remove('is-open');
    });
  };

  [
    { btn: utilLangBtn, panel: utilLangPanel },
    { btn: utilCurrencyBtn, panel: utilCurrencyPanel },
  ].forEach(({ btn, panel }) => {
    const li = btn.parentElement;
    let utilTimer;
    const open = () => {
      clearTimeout(utilTimer);
      closeAllUtilDropdowns();
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
    };
    const close = () => {
      btn.setAttribute('aria-expanded', 'false');
      panel.classList.remove('is-open');
    };
    // Hover-open (also fires on first tap on touch devices).
    li.addEventListener('mouseenter', open);
    li.addEventListener('mouseleave', () => {
      utilTimer = setTimeout(() => {
        if (!panel.matches(':hover')) close();
      }, 150);
    });
    panel.addEventListener('mouseenter', () => clearTimeout(utilTimer));
    panel.addEventListener('mouseleave', close);
    // Click toggles too (touch fallback).
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (btn.getAttribute('aria-expanded') === 'true') close();
      else open();
    });
  });

  document.addEventListener('click', (e) => {
    if (!utilBar.contains(e.target)) closeAllUtilDropdowns();
  });

  nav.appendChild(utilBar);

  nav.setAttribute('aria-expanded', 'false');
  // prevent mobile nav behavior on window resize
  toggleMenu(nav, navSections, isDesktop.matches);
  isDesktop.addEventListener('change', () => toggleMenu(nav, navSections, isDesktop.matches));

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  block.append(navWrapper);
}
