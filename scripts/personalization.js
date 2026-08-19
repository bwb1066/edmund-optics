import { getMetadata } from './aem.js';

/**
 * Turn behavior into an audience signal, from two sources:
 *   - Brand Chat turns (the widget's `brand-concierge:message` event)
 *   - Knowledge Center (and any audience-tagged) page views
 *
 * Each signal (a) updates a per-session tally and sets window.eoAudience to the
 * leading audience — so on-page consumers (knowledge-content) personalize
 * immediately, even before Adobe is live — and (b) pushes a DERIVED event to
 * Adobe via the Web SDK for unified-profile enrichment (GATED on window.alloy,
 * so it's inert until the SDK is configured; see websdk.js). Raw prompt text is
 * never sent — only the derived audience/topic.
 */

const AUDIENCES = ['laser_research', 'bio_imaging', 'machine_vision'];
const STORE_KEY = 'eo_audience_signal';

// Keyword → audience for classifying a chat turn (prompt + recommendations).
const CHAT_RULES = [
  ['laser_research', /laser|nd:?yag|ultrafast|femtosecond|1064|damage threshold|beam|high[- ]power/i],
  ['bio_imaging', /microscop|fluoresc|confocal|\boct\b|objective|dichroic|\bbio|cell|life[- ]scienc/i],
  ['machine_vision', /machine vision|inspection|\bswir\b|telecentric|fixed focal|\bsensor|camera|factory/i],
];

function inferFromChat(detail) {
  const hay = [
    detail.prompt || '',
    ...(detail.recommendations || []).map((r) => `${r.title || ''} ${r.reason || ''}`),
  ].join(' ');
  const hit = CHAT_RULES.find(([, re]) => re.test(hay));
  return hit ? hit[0] : 'default';
}

function readTally() {
  try {
    return JSON.parse(sessionStorage.getItem(STORE_KEY)) || {};
  } catch (e) {
    return {};
  }
}

function leadingAudience(tally) {
  let best = null;
  let bestN = 0;
  AUDIENCES.forEach((a) => {
    if ((tally[a] || 0) > bestN) {
      best = a;
      bestN = tally[a];
    }
  });
  return best;
}

// Record one signal: bump the session tally (skipping the neutral 'default'),
// promote the leading audience, and enrich the Adobe profile if the SDK is live.
function recordSignal(audience, source, extra = {}) {
  if (audience && audience !== 'default') {
    const tally = readTally();
    tally[audience] = (tally[audience] || 0) + 1;
    try {
      sessionStorage.setItem(STORE_KEY, JSON.stringify(tally));
    } catch (e) { /* private mode — the signal is best-effort */ }
    window.eoAudience = leadingAudience(tally) || window.eoAudience;
  }

  if (typeof window.alloy === 'function') {
    const eventType = source === 'content'
      ? 'web.webpagedetails.pageViews'
      : 'experience.chat.interaction';
    window.alloy('sendEvent', {
      xdm: {
        eventType,
        // Placeholder tenant field group — map to the real AEP schema path.
        _edmundoptics: { signal: { source, audience: audience || 'default', ...extra } },
      },
    });
  }
}

// Restore the audience BEFORE blocks (knowledge-content) decorate on a fresh
// page: an explicit demo-panel override wins, else the leading in-session signal.
function applyStoredAudience() {
  let override = null;
  try {
    override = sessionStorage.getItem('eo_audience_override');
  } catch (e) { /* private mode */ }
  if (override) {
    window.eoAudience = override;
    return;
  }
  const lead = leadingAudience(readTally());
  if (lead) window.eoAudience = lead;
}

function wireChat() {
  document.addEventListener('brand-concierge:message', (e) => {
    const detail = e.detail || {};
    if (detail.role !== 'assistant') return;
    recordSignal(inferFromChat(detail), 'concierge', {
      recommendedCount: (detail.recommendations || []).length,
    });
  });
}

// A Knowledge Center (or any audience-tagged) page view is an implicit signal.
function recordContentView() {
  const audience = getMetadata('audience');
  const contentType = getMetadata('content-type');
  if (!audience && !contentType) return;
  recordSignal(audience, 'content', {
    contentType: contentType || undefined,
    topic: getMetadata('topic') || undefined,
  });
}

let wired = false;

export default function initPersonalization() {
  if (wired) return;
  wired = true;
  applyStoredAudience();
  wireChat();
  recordContentView();
}
