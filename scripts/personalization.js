import { getMetadata } from './aem.js';
import config from './aep-config.js';

/**
 * Turn behavior into an audience signal, from two sources:
 *   - Brand Chat turns (the widget's `config.chatEventName` event)
 *   - Knowledge Center (and any audience-tagged) page views
 *
 * Each signal (a) updates a per-session tally and sets window.eoAudience to the
 * leading audience — so on-page consumers (knowledge-content) personalize
 * immediately, even before Adobe is live — and (b) pushes a DERIVED event to
 * Adobe via the Web SDK for unified-profile enrichment (GATED on window.alloy,
 * so it's inert until the SDK is configured; see websdk.js). Raw prompt text is
 * never sent — only the derived audience/topic.
 *
 * Audience segments + chat classification rules, the XDM tenant namespace,
 * the chat event name, and the shared window.eoAudience/eo_-prefixed storage
 * keys (see scripts/p13n.js) all come from aep-config.js — that's the only
 * file a different site needs to edit to reuse this module.
 */

const KEYS = {
  override: 'aep_audience_override',
  tally: 'aep_audience_signal',
  ...config.storageKeys,
};
const AUD_GLOBAL = config.audienceGlobal || 'aepAudience';

const AUDIENCES = config.audiences.map((a) => a.key);

/** Classify free text into a configured audience key, or 'default'. */
export function classify(text) {
  const hit = config.audiences.find(({ match }) => match.test(text || ''));
  return hit ? hit.key : 'default';
}

/**
 * Does this text read as belonging to `audience`? Exposed so block code can
 * reorder/filter content by persona relevance using the same vocabulary the
 * signal classifier uses.
 */
export function matchesAudience(text, audience) {
  const rule = config.audiences.find((a) => a.key === audience);
  return rule ? rule.match.test(text || '') : false;
}

function readTally() {
  try {
    return JSON.parse(sessionStorage.getItem(KEYS.tally)) || {};
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

function defaultEventType(source) {
  return source === 'content' ? 'web.webpagedetails.pageViews' : 'experience.chat.interaction';
}

// Record one signal: bump the session tally (skipping the neutral 'default'),
// promote the leading audience, and enrich the Adobe profile if the SDK is live.
export function recordSignal(audience, source, extra = {}) {
  if (audience && audience !== 'default') {
    const tally = readTally();
    tally[audience] = (tally[audience] || 0) + 1;
    try {
      sessionStorage.setItem(KEYS.tally, JSON.stringify(tally));
    } catch (e) { /* private mode — the signal is best-effort */ }
    window[AUD_GLOBAL] = leadingAudience(tally) || window[AUD_GLOBAL];
  }

  if (typeof window.alloy === 'function') {
    const eventType = (config.eventTypeForSource || defaultEventType)(source);
    window.alloy('sendEvent', {
      xdm: {
        eventType,
        [config.tenantId]: { signal: { source, audience: audience || 'default', ...extra } },
      },
    });
  }
}

// Restore the audience BEFORE blocks (knowledge-content) decorate on a fresh
// page: an explicit demo-panel override wins, else the leading in-session signal.
function applyStoredAudience() {
  let override = null;
  try {
    override = sessionStorage.getItem(KEYS.override);
  } catch (e) { /* private mode */ }
  if (override) {
    window[AUD_GLOBAL] = override;
    return;
  }
  const lead = leadingAudience(readTally());
  if (lead) window[AUD_GLOBAL] = lead;
}

function wireChat() {
  if (!config.chatEventName) return;
  document.addEventListener(config.chatEventName, (e) => {
    const detail = e.detail || {};
    if (detail.role !== 'assistant') return;
    const hay = [
      detail.prompt || '',
      ...(detail.recommendations || []).map((r) => `${r.title || ''} ${r.reason || ''}`),
    ].join(' ');
    recordSignal(classify(hay), 'concierge', {
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
  config.wireExtraSignals?.({ classify, recordSignal });
}
