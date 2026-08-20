/* eslint-disable no-underscore-dangle */
/**
 * Adobe-branded demo control + Web SDK inspector, gated behind ?demo.
 *
 * - Lets you fake the personalization state (audience persona + "logged-in"
 *   contract account) without a real Target/AEP setup.
 * - Installs a logging shim over window.alloy that CAPTURES every sendEvent and
 *   pretty-prints the XDM that the Web SDK would post to the Adobe Edge /
 *   Datastream — so the inspector works even with no datastream configured
 *   (events are captured, not sent). If a real alloy exists, it forwards too.
 *
 * State lives in sessionStorage so it survives navigation during a demo, and is
 * read by personalization.js (audience override) and the commerce store (buyer).
 */

const ADOBE_RED = '#fa0f00';
const OVERRIDE_KEY = 'eo_audience_override';
const BUYER_KEY = 'eo_demo_buyer';
const DEMO_FLAG = 'eo_demo';
const ACME = 'acme-photonics';

const AUDIENCES = [
  { key: '', label: 'Anonymous' },
  { key: 'laser_research', label: 'Laser Researcher' },
  { key: 'bio_imaging', label: 'Bio Imaging' },
  { key: 'machine_vision', label: 'Machine Vision' },
];

const captured = [];
let els = {};

export function demoEnabled() {
  const params = new URLSearchParams(window.location.search);
  if (params.has('demo')) {
    const v = params.get('demo');
    if (v === '0' || v === 'off' || v === 'false') {
      sessionStorage.removeItem(DEMO_FLAG);
      return false;
    }
    sessionStorage.setItem(DEMO_FLAG, '1');
  }
  return sessionStorage.getItem(DEMO_FLAG) === '1';
}

const ss = {
  audience: () => sessionStorage.getItem(OVERRIDE_KEY) || '',
  buyer: () => sessionStorage.getItem(BUYER_KEY) || '',
};

// ── Web SDK capture ───────────────────────────────────────────────────────
function renderEvents() {
  if (!els.log) return;
  els.log.innerHTML = captured.length
    ? captured.map((e) => {
      const time = new Date(e.t).toLocaleTimeString();
      const type = e.payload?.xdm?.eventType || e.command;
      return '<div class="eo-demo-evt"><div class="eo-demo-evt-head">'
        + `<span class="eo-demo-chip">${type}</span><span class="eo-demo-time">${time}</span></div>`
        + `<pre>${JSON.stringify(e.payload, null, 2)}</pre></div>`;
    }).join('')
    : '<p class="eo-demo-empty">No events yet — interact with the page (view content, add to quote) and the Web SDK payloads appear here.</p>';
}

function installAlloyLogger() {
  const real = typeof window.alloy === 'function' ? window.alloy : null;
  const logger = (...args) => {
    const [command, payload] = args;
    captured.unshift({ t: Date.now(), command, payload });
    if (captured.length > 50) captured.pop();
    renderEvents();
    return real ? real(...args) : Promise.resolve({ demo: true });
  };
  logger.q = (real && real.q) || [];
  window.alloy = logger;
}

// ── Render ────────────────────────────────────────────────────────────────
function render() {
  if (!els.aud) return;
  const aud = ss.audience();
  const buyer = ss.buyer();
  els.aud.querySelectorAll('button').forEach((b) => {
    b.classList.toggle('is-on', (b.dataset.aud || '') === aud);
  });
  const loggedIn = buyer === ACME;
  els.account.textContent = loggedIn ? 'Logged in: Acme Photonics ✓ — log out' : 'Log in as Acme Photonics';
  els.account.classList.toggle('is-on', loggedIn);
  const stateLabel = loggedIn
    ? 'Acme Photonics (contract account)'
    : (AUDIENCES.find((a) => a.key === aud)?.label || 'Anonymous');
  els.state.textContent = stateLabel;
}

// ── State changes ─────────────────────────────────────────────────────────
function announce() {
  document.dispatchEvent(new CustomEvent('p13n:change', {
    detail: { audience: ss.audience(), buyer: ss.buyer() },
  }));
}

function setAudience(key) {
  if (key) sessionStorage.setItem(OVERRIDE_KEY, key);
  else sessionStorage.removeItem(OVERRIDE_KEY);
  window.eoAudience = key || undefined;
  // Show the decision request the site would make for this persona.
  window.alloy('sendEvent', {
    xdm: {
      eventType: 'decisioning.propositionFetch',
      _demo: { decisionScope: 'pdp-knowledge', persona: key || 'default' },
    },
  });
  announce();
  render();
}

function setBuyer(on) {
  if (on) sessionStorage.setItem(BUYER_KEY, ACME);
  else sessionStorage.removeItem(BUYER_KEY);
  window.brandCommerce?.useBuyer?.(on ? ACME : null);
  // A login is an identity + authenticated-state signal to the Edge.
  window.alloy('sendEvent', {
    xdm: {
      eventType: on ? 'identity.authenticatedState' : 'identity.loggedOut',
      identityMap: on
        ? { CRMID: [{ id: ACME, primary: true, authenticatedState: 'authenticated' }] }
        : {},
      _demo: { account: on ? ACME : null, contract: on },
    },
  });
  announce();
  render();
}

function reset() {
  sessionStorage.removeItem(OVERRIDE_KEY);
  sessionStorage.removeItem(BUYER_KEY);
  window.eoAudience = undefined;
  window.brandCommerce?.useBuyer?.(null);
  announce();
  render();
}

// Turn the demo off entirely: clear state + the sticky flag and remove the UI.
function exitDemo() {
  reset();
  sessionStorage.removeItem(DEMO_FLAG);
  els.tab?.remove();
  els.panel?.remove();
}

const STYLES = `
.eo-demo-tab{position:fixed;right:0;top:38%;z-index:2147483000;display:flex;align-items:center;gap:8px;
  padding:10px 12px;background:#1d1d1d;color:#fff;border:0;border-right:4px solid ${ADOBE_RED};
  border-radius:8px 0 0 8px;cursor:pointer;font:600 12px/1 -apple-system,system-ui,sans-serif;
  letter-spacing:.04em;box-shadow:0 2px 12px rgb(0 0 0 / 30%)}
.eo-demo-tab .dot{width:12px;height:12px;border-radius:2px;background:${ADOBE_RED}}
.eo-demo-panel{position:fixed;top:0;right:0;height:100vh;width:390px;max-width:92vw;z-index:2147483001;
  background:#fff;box-shadow:-8px 0 30px rgb(0 0 0 / 25%);transform:translateX(100%);
  transition:transform .22s ease;display:flex;flex-direction:column;font:14px/1.4 -apple-system,system-ui,sans-serif;color:#222}
.eo-demo-panel.open{transform:none}
.eo-demo-hd{background:#1d1d1d;color:#fff;padding:16px 18px;border-bottom:4px solid ${ADOBE_RED};display:flex;align-items:center;gap:10px}
.eo-demo-hd .dot{width:16px;height:16px;border-radius:3px;background:${ADOBE_RED}}
.eo-demo-hd b{font-size:14px;display:block}
.eo-demo-hd small{color:#b9b9b9;font-size:11px;letter-spacing:.04em}
.eo-demo-hd .x{margin-left:auto;background:none;border:0;color:#fff;font-size:20px;cursor:pointer;line-height:1}
.eo-demo-body{padding:16px 18px;overflow:auto;display:flex;flex-direction:column;gap:16px}
.eo-demo-sec>h4{margin:0 0 8px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#767676}
.eo-demo-aud{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.eo-demo-aud button,.eo-demo-account{padding:9px 10px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;
  cursor:pointer;font:inherit;font-weight:600;color:#333;text-align:center}
.eo-demo-aud button.is-on{background:${ADOBE_RED};border-color:${ADOBE_RED};color:#fff}
.eo-demo-account{width:100%}
.eo-demo-account.is-on{background:#1a7f37;border-color:#1a7f37;color:#fff}
.eo-demo-reset{width:100%;padding:8px;border:0;background:none;color:${ADOBE_RED};cursor:pointer;font:inherit;font-weight:600}
.eo-demo-exit{width:100%;padding:9px;border:1px solid #d9d9d9;border-radius:6px;background:#fff;color:#555;cursor:pointer;font:inherit;font-weight:600}
.eo-demo-state{padding:10px 12px;border-radius:6px;background:#f4f4f4;font-size:13px}
.eo-demo-state b{color:#111}
.eo-demo-inspector{flex:1;border-top:1px solid #eee;padding:14px 18px;overflow:auto;background:#fafafa}
.eo-demo-inspector>h4{margin:0 0 4px;font-size:11px;letter-spacing:.06em;text-transform:uppercase;color:#767676}
.eo-demo-inspector .note{margin:0 0 10px;font-size:11px;color:#999}
.eo-demo-evt{margin:0 0 10px;border:1px solid #eaeaea;border-radius:6px;background:#fff;overflow:hidden}
.eo-demo-evt-head{display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:#f3f3f3}
.eo-demo-chip{font:600 11px/1.4 ui-monospace,monospace;color:${ADOBE_RED}}
.eo-demo-time{font-size:10px;color:#999}
.eo-demo-evt pre{margin:0;padding:8px 10px;font:11px/1.45 ui-monospace,SFMono-Regular,Menlo,monospace;
  white-space:pre-wrap;word-break:break-word;color:#333;max-height:200px;overflow:auto}
.eo-demo-empty{font-size:12px;color:#999}
`;

function build() {
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.append(style);

  const tab = document.createElement('button');
  tab.className = 'eo-demo-tab';
  tab.type = 'button';
  tab.innerHTML = '<span class="dot"></span>Adobe · Web SDK';

  const panel = document.createElement('aside');
  panel.className = 'eo-demo-panel';
  panel.innerHTML = `
    <div class="eo-demo-hd">
      <span class="dot"></span>
      <span><b>Adobe Experience Platform</b><small>WEB SDK · PERSONALIZATION DEMO</small></span>
      <button class="x" type="button" aria-label="Close">×</button>
    </div>
    <div class="eo-demo-body">
      <div class="eo-demo-sec">
        <h4>Audience (implicit persona)</h4>
        <div class="eo-demo-aud"></div>
      </div>
      <div class="eo-demo-sec">
        <h4>Identity</h4>
        <button class="eo-demo-account" type="button"></button>
      </div>
      <div class="eo-demo-state">Current: <b class="eo-demo-statev">Anonymous</b></div>
      <button class="eo-demo-reset" type="button">Reset to anonymous</button>
      <button class="eo-demo-exit" type="button">Exit demo</button>
    </div>
    <div class="eo-demo-inspector">
      <h4>Datastream events</h4>
      <p class="note">What the Web SDK would post to the Adobe Edge for this session.</p>
      <div class="eo-demo-log"></div>
    </div>`;

  document.body.append(tab, panel);

  els = {
    tab,
    panel,
    aud: panel.querySelector('.eo-demo-aud'),
    account: panel.querySelector('.eo-demo-account'),
    reset: panel.querySelector('.eo-demo-reset'),
    exit: panel.querySelector('.eo-demo-exit'),
    state: panel.querySelector('.eo-demo-statev'),
    log: panel.querySelector('.eo-demo-log'),
  };

  AUDIENCES.forEach((a) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.dataset.aud = a.key;
    b.textContent = a.label;
    b.addEventListener('click', () => setAudience(a.key));
    els.aud.append(b);
  });

  els.account.addEventListener('click', () => setBuyer(ss.buyer() !== ACME));
  els.reset.addEventListener('click', reset);
  els.exit.addEventListener('click', exitDemo);
  tab.addEventListener('click', () => panel.classList.toggle('open'));
  panel.querySelector('.x').addEventListener('click', () => panel.classList.remove('open'));
}

export default function initDemoPanel() {
  installAlloyLogger();
  build();
  render();
  renderEvents();
  // Emit the page view the Web SDK sends on load, so the inspector is populated.
  window.alloy('sendEvent', {
    xdm: {
      eventType: 'web.webpagedetails.pageViews',
      web: {
        webPageDetails: {
          name: document.title,
          URL: window.location.href,
          pageViews: { value: 1 },
        },
      },
    },
  });
}
