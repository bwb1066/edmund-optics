/**
 * Personalization state — the single read API shared by the recommendation
 * blocks and the demo panel. State is faked client-side today (demo panel /
 * knowledge-center reads set it); when Adobe is live, only the resolver's middle
 * step changes (a real Target decision), and consumers stay the same.
 */

const OVERRIDE_KEY = 'eo_audience_override';
const BUYER_KEY = 'eo_demo_buyer';

/** Current audience: explicit override → implicit signal (window.eoAudience) → default. */
export function getAudience() {
  try {
    return sessionStorage.getItem(OVERRIDE_KEY) || window.eoAudience || 'default';
  } catch (e) {
    return window.eoAudience || 'default';
  }
}

/** The "logged-in" contract account key, or '' when anonymous. */
export function getBuyer() {
  try {
    return sessionStorage.getItem(BUYER_KEY) || '';
  } catch (e) {
    return '';
  }
}

/** Subscribe to state changes (fired by the demo panel). */
export function onChange(fn) {
  document.addEventListener('p13n:change', (e) => fn(e.detail || {}));
}
