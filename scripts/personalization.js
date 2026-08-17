/**
 * Bridge Brand Chat turns into personalization signals.
 *
 * On each assistant turn the concierge widget emits a tenant-neutral
 * `brand-concierge:message` CustomEvent. Here we infer the visitor's audience
 * from what was recommended (and their prompt), then:
 *   (a) push a derived chat-interaction event to Adobe via the Web SDK for
 *       unified-profile enrichment — GATED on window.alloy, so it's inert until
 *       the SDK is configured (see websdk.js); and
 *   (b) set window.eoAudience so on-page consumers (knowledge-content) can
 *       personalize immediately, before any Target round-trip.
 *
 * Privacy: only the DERIVED intent (an audience key) is sent — never the raw
 * prompt text.
 */

// Same audience taxonomy the knowledge-content block serves.
const AUDIENCE_RULES = [
  ['laser_research', /laser|nd:?yag|ultrafast|femtosecond|1064|damage threshold|beam|high[- ]power/i],
  ['bio_imaging', /microscop|fluoresc|confocal|\boct\b|objective|dichroic|\bbio|cell|life[- ]scienc/i],
  ['machine_vision', /machine vision|inspection|\bswir\b|telecentric|fixed focal|\bsensor|camera|factory/i],
];

function inferAudience(detail) {
  const hay = [
    detail.prompt || '',
    ...(detail.recommendations || []).map((r) => `${r.title || ''} ${r.reason || ''}`),
  ].join(' ');
  const hit = AUDIENCE_RULES.find(([, re]) => re.test(hay));
  return hit ? hit[0] : 'default';
}

let wired = false;

export default function initChatPersonalization() {
  if (wired) return;
  wired = true;

  document.addEventListener('brand-concierge:message', (e) => {
    const detail = e.detail || {};
    if (detail.role !== 'assistant') return;
    const audience = inferAudience(detail);

    // (b) Same-page signal for client-side consumers.
    window.eoAudience = audience;

    // (a) Unified-profile enrichment via the Web SDK (no-op until configured).
    if (typeof window.alloy === 'function') {
      window.alloy('sendEvent', {
        xdm: {
          eventType: 'experience.chat.interaction',
          // Placeholder tenant field group — map to the real AEP schema path.
          _edmundoptics: {
            chat: {
              channel: 'concierge',
              intent: audience,
              recommendedCount: (detail.recommendations || []).length,
            },
          },
        },
      });
    }
  });
}
