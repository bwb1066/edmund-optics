import { getAudience, onChange } from '../../scripts/p13n.js';

// Knowledge Center manifest (11 tagged articles). Mirrors the DA content under
// /knowledge-center and the audience tags used across the personalization layer.
const ARTICLES = [
  {
    title: 'Minimizing Thermal Lensing in High-Power Laser Systems', type: 'Application Note', audience: 'laser_research', path: '/knowledge-center/application-notes/minimizing-thermal-lensing', summary: 'How absorbed power forms a focus-shifting lens; substrate choice and LIDT.',
  },
  {
    title: 'Measuring Laser-Induced Damage Threshold: S-on-1 and R-on-1', type: 'Scientific Paper', audience: 'laser_research', path: '/knowledge-center/scientific-papers/lidt-measurement-methods', summary: 'The two ISO LIDT protocols and pulse/wavelength scaling for design margins.',
  },
  {
    title: 'How to Align a Beam Expander', type: 'Video', audience: 'laser_research', path: '/knowledge-center/video/aligning-a-beam-expander', summary: 'Step-by-step Galilean beam-expander alignment with a shear plate.',
  },
  {
    title: 'Selecting Filters for Fluorescence Microscopy', type: 'Application Note', audience: 'bio_imaging', path: '/knowledge-center/application-notes/fluorescence-filter-selection', summary: 'Matching excitation/emission/dichroic to a fluorophore; avoiding bleedthrough.',
  },
  {
    title: 'Confocal Imaging: PSF and Resolution Limits', type: 'Scientific Paper', audience: 'bio_imaging', path: '/knowledge-center/scientific-papers/confocal-imaging-fundamentals', summary: 'PSF, pinhole size in Airy units, NA, and the resolution/signal trade-off.',
  },
  {
    title: 'Fluorescence Filter Set Finder', type: 'Tech Tool', audience: 'bio_imaging', path: '/knowledge-center/tech-tools/fluorescence-filter-finder', summary: 'Enter a fluorophore, get a matched ex/dichroic/em set with blocking flags.',
  },
  {
    title: 'SWIR Imaging for Inline Inspection', type: 'Application Note', audience: 'machine_vision', path: '/knowledge-center/application-notes/swir-imaging-for-inspection', summary: 'Where SWIR reveals moisture/fill-level/material contrast on the line.',
  },
  {
    title: 'Machine Vision Lens Basics: Format, Resolution, Telecentricity', type: 'Article', audience: 'machine_vision', path: '/knowledge-center/articles/machine-vision-lens-basics', summary: 'Sensor format, MTF, fixed-focal vs telecentric for gauging.',
  },
  {
    title: 'Imaging Lens Selection Calculator', type: 'Tech Tool', audience: 'machine_vision', path: '/knowledge-center/tech-tools/lens-selection-calculator', summary: 'Sensor/FOV/working-distance in; focal length + telecentric flag out.',
  },
  {
    title: 'Choosing LED Illumination for Machine Vision', type: 'Video', audience: 'machine_vision', path: '/knowledge-center/video/led-illumination-for-inspection', summary: 'Ring/backlight/dome/coaxial geometries and wavelength for defect contrast.',
  },
  {
    title: 'Understanding Optical Coatings: AR, Mirror, and Filter Basics', type: 'Article', audience: 'default', path: '/knowledge-center/articles/understanding-optical-coatings', summary: 'Primer on the three coating families and how to choose.',
  },
];

const LABELS = {
  laser_research: 'Reading for laser researchers',
  bio_imaging: 'Reading for imaging scientists',
  machine_vision: 'Reading for vision engineers',
  default: 'From the Knowledge Center',
};

function pick(audience) {
  let list = ARTICLES.filter((a) => a.audience === audience);
  if (list.length < 3) {
    list = list.concat(ARTICLES.filter((a) => a.audience === 'default' && !list.includes(a)));
  }
  if (list.length < 3) list = ARTICLES;
  return list.slice(0, 3);
}

function buildCard(article) {
  const card = document.createElement('a');
  card.className = 'recommended-knowledge-card';
  card.href = article.path;
  card.innerHTML = `
    <span class="recommended-knowledge-type">${article.type}</span>
    <span class="recommended-knowledge-title">${article.title}</span>
    <span class="recommended-knowledge-summary">${article.summary}</span>
    <span class="recommended-knowledge-cta">Read →</span>`;
  return card;
}

export default function decorate(block) {
  const heading = document.createElement('h2');
  heading.className = 'recommended-knowledge-heading';
  const strip = document.createElement('div');
  strip.className = 'recommended-knowledge-strip';
  block.replaceChildren(heading, strip);

  const render = () => {
    const audience = getAudience();
    heading.textContent = LABELS[audience] || LABELS.default;
    strip.replaceChildren(...pick(audience).map(buildCard));
  };

  render();
  onChange(render);
}
