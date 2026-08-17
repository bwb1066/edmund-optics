import { loadFragment } from '../fragment/fragment.js';

// Adobe Target decision scope that returns the inferred audience for this PDP.
const DECISION_SCOPE = 'pdp-knowledge';
// Never let an audience lookup block the PDP — fall back to default after this.
const AUDIENCE_TIMEOUT_MS = 1500;

/**
 * Resolve the inferred audience for this visitor.
 * Resolution order (first hit wins):
 *   1. ?audience=  URL param — stakeholder/demo override (flip experiences live)
 *   2. Adobe Target via the Web SDK ("alloy") for the pdp-knowledge scope
 *   3. window.eoAudience — data layer populated by Brand Chat / RTCDP
 *   4. 'default'
 * Always resolves within AUDIENCE_TIMEOUT_MS so the page never hangs on Target.
 * @returns {Promise<string>} audience key
 */
async function resolveAudience() {
  // 1. Explicit override — invaluable for live demos.
  const override = new URLSearchParams(window.location.search).get('audience');
  if (override) return override;

  // 2. Adobe Target via Web SDK, guarded by a timeout.
  if (typeof window.alloy === 'function') {
    try {
      const result = await Promise.race([
        window.alloy('sendEvent', { renderDecisions: false, decisionScopes: [DECISION_SCOPE] }),
        new Promise((res) => { setTimeout(() => res(null), AUDIENCE_TIMEOUT_MS); }),
      ]);
      const proposition = result?.propositions?.find((p) => p.scope === DECISION_SCOPE);
      const content = proposition?.items?.find((i) => i.data?.content)?.data?.content;
      // Target offer payload is JSON, e.g. {"audience":"laser_research"}.
      const audience = typeof content === 'string' ? JSON.parse(content).audience : content?.audience;
      if (audience) return audience;
    } catch (e) {
      // fall through to the data layer / default
    }
  }

  // 3. Data layer set by Brand Chat / RTCDP profile.
  if (window.eoAudience) return window.eoAudience;

  // 4. Default experience.
  return 'default';
}

/**
 * Personalized knowledge content for a PDP.
 *
 * Authoring contract — one row per audience, cell 1 = audience key,
 * cell 2 = link to the AEM fragment to render:
 *   | Knowledge Content |                                          |
 *   | default           | /knowledge/fragments/pcx-overview        |
 *   | laser_research    | /knowledge/fragments/thermal-lensing     |
 *   | bio_imaging       | /knowledge/fragments/optical-filters     |
 *   | machine_vision    | /knowledge/fragments/swir-imaging        |
 *
 * @param {Element} block The block element
 */
export default async function decorate(block) {
  // 1. Build audience -> fragment-path map from the authored rows.
  const variants = {};
  [...block.children].forEach((row) => {
    const [keyCell, refCell] = row.children;
    if (!keyCell || !refCell) return;
    const key = keyCell.textContent.trim();
    const link = refCell.querySelector('a');
    const path = link ? new URL(link.href).pathname : refCell.textContent.trim();
    if (key && path) variants[key] = path;
  });

  // 2. Reserve space + show a skeleton so the Target swap does not shift layout.
  block.replaceChildren();
  block.classList.add('is-loading');
  block.setAttribute('aria-busy', 'true');

  // 3. Resolve the audience, then pick its fragment (fall back to default).
  const audience = await resolveAudience();
  const served = variants[audience] ? audience : 'default';
  const path = variants[served];
  block.dataset.audience = served;
  // Demo affordance: when overridden via ?audience=, badge which experience shows.
  if (new URLSearchParams(window.location.search).has('audience')) block.classList.add('kc-demo');

  // 4. Load only the chosen fragment.
  if (path) {
    const fragment = await loadFragment(path);
    if (fragment) {
      block.replaceChildren(...fragment.childNodes);
      // DA-authored fragments lose authored classes (kc-eyebrow / kc-cta), so
      // re-apply them structurally: first paragraph is the eyebrow, the last
      // link is the CTA (strip any button decoration it picked up).
      const firstPara = block.querySelector('p');
      if (firstPara && !firstPara.querySelector('a')) firstPara.classList.add('kc-eyebrow');
      const links = block.querySelectorAll('a');
      const cta = links[links.length - 1];
      if (cta) {
        cta.classList.remove('button');
        cta.classList.add('kc-cta');
        cta.parentElement?.classList.remove('button-container');
      }
    }
  }

  block.classList.remove('is-loading');
  block.removeAttribute('aria-busy');

  // 5. Report which knowledge experience was served (analytics / measurement).
  window.adobeDataLayer = window.adobeDataLayer || [];
  window.adobeDataLayer.push({
    event: 'knowledgeContentServed',
    knowledgeContent: { audience: served, path },
  });
}
