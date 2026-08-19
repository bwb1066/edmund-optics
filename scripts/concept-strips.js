import { loadCSS } from './aem.js';

/**
 * Inject the personalized recommendation strips onto the concept homepage.
 * Done in code (not DA authoring) so the large concept-3b source stays
 * untouched: the strips are a personalization feature, gated to the concept
 * template via its body class. They render just above "Featured Optics".
 */
const STRIPS = ['recommended-products', 'recommended-knowledge'];

export default async function injectConceptStrips(main) {
  if (!document.body.classList.contains('concept-3b')) return;
  if (!main || main.querySelector('.recommended-products')) return;

  const anchor = main.querySelector('.product-cards')?.closest('main > div');

  const sections = STRIPS.map((name) => {
    const section = document.createElement('div');
    section.className = 'section';
    const block = document.createElement('div');
    block.className = name;
    section.append(block);
    if (anchor) anchor.before(section); else main.prepend(section);
    return { name, block };
  });

  await Promise.all(sections.map(async ({ name, block }) => {
    loadCSS(`${window.hlx.codeBasePath}/blocks/${name}/${name}.css`);
    const mod = await import(`../blocks/${name}/${name}.js`);
    await mod.default(block);
  }));
}
