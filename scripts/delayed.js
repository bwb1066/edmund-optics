function addBackToTop() {
  const btn = document.createElement('button');
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="18 15 12 9 6 15"/></svg>';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const update = () => btn.classList.toggle('visible', window.scrollY > 300);
  window.addEventListener('scroll', update, { passive: true });
  update();
  document.body.append(btn);
}

const SPARKLE_SVG = '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'
  + '<path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z"/>'
  + '<path d="M20 3v4"/><path d="M22 5h-4"/>'
  + '<path d="M4 17v2"/><path d="M5 18H3"/></svg>';

const WIDGET_URL = 'https://bwb1066.github.io/brand-chat-config-ui/widget/brand-concierge.js';
const WIDGET_BASE = WIDGET_URL.replace(/[^/]+$/, '');
const SUPABASE_URL = 'https://cyjquwhkmzyedkwuaffc.supabase.co';
// eslint-disable-next-line max-len
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN5anF1d2hrbXp5ZWRrd3VhZmZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNjY4MjcsImV4cCI6MjA5MDY0MjgyN30.GkMBLXBZr9u34m4uI6ZR-2ZniLZD3RkjropjQw058k4';
const SITE_KEY = 'edmund-optics';

function addChatbot() {
  const btn = document.createElement('button');
  btn.className = 'chatbot-bubble';
  btn.setAttribute('aria-label', 'Ask the Brand Concierge');
  btn.innerHTML = SPARKLE_SVG;

  let chatModule = null;
  btn.addEventListener('click', async () => {
    if (!chatModule) {
      // eslint-disable-next-line import/no-unresolved
      chatModule = await import(WIDGET_URL);
      chatModule.init({
        supabaseUrl: SUPABASE_URL,
        anonKey: SUPABASE_KEY,
        siteKey: SITE_KEY,
        showTrigger: false,
        widgetBase: WIDGET_BASE,
      });
    }
    chatModule.default();
  });

  document.body.append(btn);
}

addBackToTop();
addChatbot();
