/**
 * Authoring contract — one row per stat: | number | label |
 * @param {Element} block The block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('stat-band-item');
    const [numberCell, labelCell] = row.children;
    numberCell?.classList.add('stat-band-number');
    labelCell?.classList.add('stat-band-label');
  });
}
