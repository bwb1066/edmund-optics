---
writtenBy: stardust (master skill, freeform-phrase path)
writtenAgainst: "build a draft page within the site (drafts folder) of the edmund optics aem eds site and use the design (but not the theme colors - use EOs) of this page https://www.schott.com/en-us/markets/optics/optical-metrology"
synthesized: the dimensional reading below, the command sequence, and the page's content/copy
authored: none (no prior direction.md existed)
read: PRODUCT.md, DESIGN.md, schott.com/en-us/markets/optics/optical-metrology (structural reference only, fetched via WebFetch)
---

# Direction: Optical Metrology draft page

## Reading the phrase

- **register:** `brand` (inherited from PRODUCT.md)
- **expressive axis:** `committed`, fixed (inherited from DESIGN.md — black/graphite structure, single yellow CTA accent, not moved by this request)
- **tone:** `serious`, fixed (inherited — precise/authoritative/technical)
- **density:** `balanced`, fixed (inherited — EO's 40px section rhythm, not editorial-airy)
- **distinctiveness:** not moved on the EO-brand axis; the *structural* reference point is Schott's page layout, reused as a skeleton, not as a distinctiveness target
- **audience:** PRODUCT.md's technical buyers, narrowed to the optical-metrology market specifically
- **constraints:** `brand-faithful` (hard pin, explicit in the user's phrase — "not the theme colors, use EO's"); reuse Schott's section sequence as the layout skeleton (explicit in the user's phrase)

## IA-fidelity

Not applicable in the usual stardust sense (no existing EO page is being
redesigned here — this is new-page authorship using an *external* site's
layout as a structural reference). Treated as: adopt Schott's section
sequence as the skeleton, fill entirely with EO content/tokens/components.

## Assumptions (stated at plan time, confirmed by user's "go")

1. Topic mirrors Schott's page 1:1 — an "Optical Metrology" market page
   for Edmund Optics, not a generic skeleton repurposed for another topic.
2. Reuse existing EO blocks wherever they fit (`primary-hero`, `columns`,
   `cards`, `contact-columns`); approximate Schott's applications carousel
   as a static responsive card row rather than new carousel JS.
3. Output as `drafts/optical-metrology.plain.html` per AEM EDS markup
   conventions.
4. No real photography available — flat monochrome placeholder SVGs
   stand in, explicitly commented as swap-before-publish.

## Commands run, in order

1. **impeccable init** (forced prerequisite — no PRODUCT.md/DESIGN.md
   existed). Wrote both files from a codebase scan; several qualitative
   fields inferred and flagged (see journal 2026-07-08T08:15).
2. **impeccable shape** "Optical Metrology market page for Edmund
   Optics" — compact-form brief (PRODUCT.md/DESIGN.md + the confirmed
   plan already pinned scope/content/direction), citing Schott's
   structure as the layout reference.
3. **Build** (impeccable craft-equivalent, hand-authored to AEM EDS
   markup conventions) — `drafts/optical-metrology.plain.html` plus 12
   placeholder SVGs.
4. **Validation loop** (stardust's own rule, not an impeccable command) —
   Playwright at 3 viewports; found and fixed two real bugs (`primary-hero`
   standalone width, 1px overflow from a `contact-columns` headline that
   was too long for the `white-space: nowrap` treatment at 768px).
5. **impeccable critique** (dual sub-agent) — Assessment A completed;
   Assessment B stalled and was substituted with direct `detect.mjs` +
   the validation loop's own evidence (degraded, noted in journal). Fixed
   the one confirmed P0 (dead "Live Chat" link) and one documentation gap
   (DESIGN.md hero h1 weight).
6. **impeccable polish** — not run as a separate pass; the critique fixes
   plus the pre-existing validation loop covered the same ground for a
   single new page. No further polish-only issues remained.

## Pages affected

New page only: `optical-metrology`. No other page's markup or content
changed. `blocks/primary-hero/primary-hero.css` changed (additive,
`:only-child` selector — does not alter the existing 3-hero homepage grid).
`DESIGN.md` changed once (hero weight documentation).

---

# Direction addendum: eo-new-design (second page, same session)

## Reading the phrase

"Build a draft page called `eo-new-design`, using coherent.com's homepage
layout, EO's own styles/colors/content." Same axis readings as the first
page (register `brand`, expressive `committed`, tone `serious`, density
`balanced`, all inherited/fixed) — the phrase only moves the *structural
reference* (Coherent's homepage instead of Schott's market page) and the
*scope* (a homepage-style concept, broader audience than the metrology
page's narrowed technical-buyer framing).

## Commands run, in order

1. **impeccable shape** (compact form — PRODUCT.md/DESIGN.md plus the
   confirmed plan already pinned scope/content/direction).
2. **Build** — `drafts/eo-new-design.plain.html` plus 13 placeholder SVGs,
   reusing `primary-hero`/`secondary-hero`/`tertiary-hero` (as a true
   3-sibling grid this time, unlike the metrology page's standalone use),
   `columns`, `featured-products-cards`, `featured-event-hero`.
3. **Validation loop** — Playwright at 3 viewports; clean on the first
   pass except for the content-loss bug described below.
4. **impeccable critique** (dual sub-agent) — both assessments completed
   this run (no stall). Fixed one P1 (triple-h1 heading hierarchy, fixed
   at the block level in `secondary-hero`/`tertiary-hero`) and one bug
   found before critique even ran (silently-dropped event description
   paragraph in `featured-event-hero.js`). Deferred the remaining
   findings (composition genericness, CTA-count hierarchy, existing hero-
   tile typography voice, unstyled news list) as content-strategy or
   cross-page-impact decisions for the user.
5. **impeccable polish** — not run separately; same rationale as the
   first page.

## Pages affected

New page only: `eo-new-design`. `blocks/featured-event-hero/{js,css}`
changed (additive — new optional description-paragraph slot).
`blocks/secondary-hero/secondary-hero.css` and
`blocks/tertiary-hero/{js,css}` changed (additive — h1/h2 dual support,
visually identical either way). No other page's markup changed; the
`optical-metrology` page doesn't use `secondary-hero`/`tertiary-hero`/
`featured-event-hero`, so it's unaffected by any of this page's block
changes (spot-checked after the fact).
