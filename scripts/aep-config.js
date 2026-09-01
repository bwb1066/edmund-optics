/**
 * Site-specific configuration for the Adobe Web SDK / AEP integration
 * (websdk.js, personalization.js, demo-panel.js). Centralizing these values
 * here is what makes those three modules portable to another site — copy
 * them over and only this file needs to change.
 */
export default {
  // XDM tenant namespace the personalization signal is written under. Must
  // match the tenant id of whatever AEP schema the datastream points at.
  tenantId: '_edmundoptics',

  // Custom DOM event a chat widget dispatches with { role, prompt,
  // recommendations } detail. Leave undefined to skip chat-signal wiring.
  chatEventName: 'brand-concierge:message',

  // AJO/Target decision scope label used by the demo panel's persona-switch
  // event. Purely a label — doesn't need to exist as a real activity.
  decisionScope: 'pdp-knowledge',

  // Audience segments inferred from chat turns and used for the demo panel's
  // persona-switcher buttons. `match` classifies a chat turn's text.
  audiences: [
    {
      key: 'laser_research',
      label: 'Laser Researcher',
      match: /laser|nd:?yag|ultrafast|femtosecond|1064|damage threshold|beam|high[- ]power/i,
    },
    {
      key: 'bio_imaging',
      label: 'Bio Imaging',
      match: /microscop|fluoresc|confocal|\boct\b|objective|dichroic|\bbio|cell|life[- ]scienc/i,
    },
    {
      key: 'machine_vision',
      label: 'Machine Vision',
      match: /machine vision|inspection|\bswir\b|telecentric|fixed focal|\bsensor|camera|factory/i,
    },
  ],

  // Optional B2B "log in as" demo identities, for sites with a contract-
  // account / commerce concept. Empty array hides the demo panel's Identity
  // section entirely.
  demoPersonas: [
    { id: 'acme-photonics', label: 'Acme Photonics' },
  ],

  // window.eoAudience and the eo_-prefixed sessionStorage keys predate this
  // config file (see scripts/p13n.js, consumed by knowledge-content.js) —
  // keep personalization.js/demo-panel.js writing to the same names rather
  // than introducing new ones those consumers wouldn't see.
  audienceGlobal: 'eoAudience',
  storageKeys: {
    override: 'eo_audience_override',
    buyer: 'eo_demo_buyer',
    tally: 'eo_audience_signal',
    demoFlag: 'eo_demo',
  },
};
