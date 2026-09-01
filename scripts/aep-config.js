/**
 * Site-specific configuration for the Adobe Web SDK / AEP integration
 * (websdk.js, personalization.js, demo-panel.js). Centralizing these values
 * here is what makes those three modules portable to another site — copy
 * them over and only this file needs to change.
 */
export default {
  // The XDM tenant namespace every custom field goes under. An AEP tenant id
  // is assigned ONCE PER IMS ORG, not per site — this org's real tenant is
  // `_demosystem4` (confirmed against the BWBEdmundOpticsDemo schema).
  // store-safety-kleen shares this same org/datastream and must use the same
  // value here.
  tenantId: '_demosystem4',

  // This replica's identifier, included on every tracked event so the
  // datastream/schema shared with other replicas can still be filtered per
  // site.
  site: 'edmund-optics',

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
