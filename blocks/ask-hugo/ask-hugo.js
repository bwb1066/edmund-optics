import { getMetadata } from '../../scripts/aem.js';

// Brand Concierge (Hugo) config is author-controlled via page metadata
// (concierge-url / concierge-key / concierge-site), with the same defaults as
// scripts/delayed.js. This block is the prominent inline entry point; the
// corner bubble is suppressed on this page (delayed.js gates on body.concept-3b).
const WIDGET_BASE = 'https://bwb1066.github.io/brand-concierge/widget/';
// Version query busts the browser/CDN module cache when the widget updates
// (the GH Pages URL is otherwise cached for 10 min with no revalidation).
const WIDGET_URL = `${WIDGET_BASE}brand-concierge.js?v=commerce3`;
// eslint-disable-next-line max-len
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5anF1d2hrbXp5ZWRrd3VhZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjY4MjcsImV4cCI6MjA5MDY0MjgyN30.GkMBLXBZr9u34m4uI6ZR-2ZniLZD3RkjropjQw058k4';
const SUPABASE_URL = getMetadata('concierge-url') || 'https://cyjquwhkmzyedkwuaffc.supabase.co';
const SUPABASE_KEY = getMetadata('concierge-key') || DEFAULT_KEY;
const SITE_KEY = getMetadata('concierge-site') || 'edmund-optics';

const DEFAULTS = {
  eyebrow: 'Ask Hugo, your Edmund Optics AI Concierge',
  heading: 'What are you building or what do you want to know?',
  placeholder: 'e.g. a 1064 nm beam-steering setup',
  suggestions: ['Compare coatings', 'Match a lens to my sensor', 'Explain optical coatings'],
};

/**
 * Read the block's labeled authoring rows into a config object. Each row is
 * `| key | value |`; recognized keys: eyebrow, heading, placeholder,
 * suggestions (comma-separated). Missing keys fall back to DEFAULTS.
 */
function readConfig(block) {
  const cfg = { ...DEFAULTS };
  [...block.children].forEach((row) => {
    const [keyCell, valCell] = row.children;
    const key = keyCell?.textContent.trim().toLowerCase();
    if (!valCell) return;
    if (key === 'suggestions') {
      const items = valCell.textContent.split(',').map((s) => s.trim()).filter(Boolean);
      if (items.length) cfg.suggestions = items;
    } else if (['eyebrow', 'heading', 'placeholder'].includes(key)) {
      const v = valCell.textContent.trim();
      if (v) cfg[key] = v;
    }
  });
  return cfg;
}

/**
 * Ask Hugo — prominent inline concierge prompt. On submit, opens the themed
 * brand-concierge modal prefilled with the query (native chat takes over).
 * @param {Element} block The block element
 */
export default function decorate(block) {
  const cfg = readConfig(block);

  let chat = null;
  const openHugo = async (query) => {
    const q = (query || '').trim();
    if (!q) return;
    if (!chat) {
      chat = await import(/* webpackIgnore: true */ WIDGET_URL);
      chat.init({
        supabaseUrl: SUPABASE_URL,
        anonKey: SUPABASE_KEY,
        siteKey: SITE_KEY,
        showTrigger: false,
        widgetBase: WIDGET_BASE,
      });
    }
    chat.default(q);
  };

  const section = document.createElement('div');
  section.className = 'ask-hugo-inner';

  const eyebrow = document.createElement('div');
  eyebrow.className = 'ask-hugo-eyebrow';
  eyebrow.innerHTML = '<span class="ask-hugo-avatar" aria-hidden="true">H</span>';
  const eyebrowText = document.createElement('span');
  eyebrowText.textContent = cfg.eyebrow;
  eyebrow.append(eyebrowText);

  const heading = document.createElement('h2');
  heading.className = 'ask-hugo-heading';
  heading.textContent = cfg.heading;

  const form = document.createElement('form');
  form.className = 'ask-hugo-form';
  form.setAttribute('role', 'search');
  const input = document.createElement('input');
  input.className = 'ask-hugo-input';
  input.type = 'text';
  input.placeholder = cfg.placeholder;
  input.setAttribute('aria-label', cfg.heading);
  const submit = document.createElement('button');
  submit.type = 'submit';
  submit.className = 'ask-hugo-submit';
  submit.setAttribute('aria-label', 'Ask Hugo');
  submit.innerHTML = '&rarr;';
  form.append(input, submit);
  form.addEventListener('submit', (e) => { e.preventDefault(); openHugo(input.value); });

  const chips = document.createElement('div');
  chips.className = 'ask-hugo-chips';
  cfg.suggestions.forEach((s) => {
    const chip = document.createElement('button');
    chip.type = 'button';
    chip.className = 'ask-hugo-chip';
    chip.textContent = s;
    chip.addEventListener('click', () => { input.value = s; openHugo(s); });
    chips.append(chip);
  });

  section.append(eyebrow, heading, form, chips);
  block.replaceChildren(section);
}
