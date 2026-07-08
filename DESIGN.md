---
name: Edmund Optics EDS Site
description: Engineering-grade B2B site for optics, photonics, and laser components
colors:
  eo-yellow: "#ffcd00"
  eo-yellow-deep: "#e6b900"
  signal-blue: "#3b63fb"
  signal-blue-deep: "#1d3ecf"
  ink: "#131313"
  graphite: "#505050"
  paper: "#ffffff"
  mist: "#f8f8f8"
  nav-black: "#000000"
  nav-charcoal: "#333333"
  footer-charcoal: "#292929"
typography:
  display:
    fontFamily: "sofia-pro, sofia-pro-fallback, sans-serif"
    fontSize: "55px"
    fontWeight: 600
    lineHeight: 1.25
  headline:
    fontFamily: "sofia-pro, sofia-pro-fallback, sans-serif"
    fontSize: "34px"
    fontWeight: 600
    lineHeight: 1.25
  title:
    fontFamily: "sofia-pro, sofia-pro-fallback, sans-serif"
    fontSize: "27px"
    fontWeight: 600
    lineHeight: 1.25
  body:
    fontFamily: "sofia-pro, sofia-pro-fallback, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  sm: "3px"
  md: "12px"
  lg: "16px"
  pill: "2.4em"
spacing:
  page-margin-mobile: "20px"
  page-margin-desktop: "11%"
  section-gap: "40px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.5em 1.2em"
  button-primary-hover:
    backgroundColor: "{colors.graphite}"
  button-accent:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0.5em 1.2em"
  button-accent-hover:
    backgroundColor: "{colors.signal-blue-deep}"
---

# Design System: Edmund Optics EDS Site

## 1. Overview

**Creative North Star: "The Calibrated Instrument"**

The site reads like a precision instrument panel, not a storefront: matte
black and graphite structure, a single disciplined yellow for calibration
marks (calls to action), and generous body copy sized for engineers reading
specs at their desk. Density is moderate — content is technical and often
long-form, so hierarchy leans on type scale and whitespace rather than
decoration. The system explicitly rejects generic corporate stock-photo B2B
(bland stock imagery, vague icon grids, interchangeable SaaS-template
layouts) and anything that reads as flashy consumer e-commerce — no gradients
for their own sake, no playful color, no motion that isn't functional.

**Key Characteristics:**
- Matte black/graphite structure (nav, footer) framing a white content canvas.
- One disciplined accent yellow (`#ffcd00`) reserved for calls to action.
- A cooler signal blue (`#3b63fb`) carries inline links and secondary CTAs.
- Large, confident type scale (55px display down to 22px body) that reads
  like a spec sheet, not a brochure.
- Flat surfaces at rest; shadows appear only on transient overlays
  (dropdowns, mobile nav drawer), never on static content.

## 2. Colors

The palette is a black-and-white instrument frame with exactly two accent
colors doing all the work: a warm yellow for action, a cooler blue for
navigation/links.

### Primary
- **EO Yellow** (`#ffcd00`): the single call-to-action color (`--cta-color`).
  Used for primary buttons' hover accents, the chatbot bubble, and inline
  "read more" glyphs. Reserved for interactive, action-oriented moments only.
- **EO Yellow Deep** (`#e6b900`): hover/active state for EO Yellow
  (`--cta-color-hover`).

### Secondary
- **Signal Blue** (`#3b63fb`): default link color (`--link-color`) and the
  `.button.accent` treatment. Used for in-body links and secondary/high-
  visibility CTAs that aren't the page's single primary action.
- **Signal Blue Deep** (`#1d3ecf`): link hover/active state
  (`--link-hover-color`).

### Neutral
- **Ink** (`#131313`): primary text color (`--text-color`) and the
  `.button.primary` fill.
- **Graphite** (`#505050`): secondary/muted text and primary-button hover
  fill (`--dark-color`).
- **Paper** (`#ffffff`): page background (`--background-color`).
- **Mist** (`#f8f8f8`): section background for `.light`/`.highlight`
  section variants (`--light-color`).
- **Nav Black** (`#000000`): header top bar background.
- **Nav Charcoal** (`#333333`): header sections bar, gradient-blended from
  Nav Black.
- **Footer Charcoal** (`#292929`): footer background.

### Named Rules
**The One Accent Rule.** EO Yellow appears only on interactive,
action-oriented elements (buttons, CTAs, the chatbot bubble). It never
appears as a decorative fill, background wash, or headline color.

## 3. Typography

**Display/Body Font:** sofia-pro (Adobe Fonts/Typekit), with a
metrics-matched local-Arial fallback (`sofia-pro-fallback`) tuned via
capsize so first paint doesn't reflow when the web font swaps in.

**Character:** A single confident sans-serif carries the whole system —
no serif or mono accents. Headings are set at 600 weight, body at 400,
giving a plain, technical-document voice rather than an editorial one.

### Hierarchy
- **Display** (600, 55px / 45px desktop, 1.25 line-height): page `h1`. The
  `primary-hero` block overrides this to a lighter 300 weight on white text
  over its background image (`primary-hero.css`) — an intentional exception
  for that component, not the page-level default.
- **Headline** (600, 44px / 36px desktop, 1.25): `h2`, major section titles.
- **Title** (600, 34px / 28px desktop, 1.25): `h3`, subsection titles.
- **Subtitle** (600, 27px / 22px desktop, 1.25): `h4`.
- **Body** (400, 22px / 18px desktop, 1.6): default paragraph text. Desktop
  drops to 18px/16px/14px (m/s/xs) since technical copy runs long — density
  over impact once past the hero.
- **Label** (500, inherits body size, pill buttons): button and nav label
  weight; no dedicated uppercase label style exists yet.

### Named Rules
**The Spec-Sheet Rule.** Body copy is sized for sustained technical reading
(18–22px), never compressed below 14px even at the smallest breakpoint.

## 4. Elevation

Flat by default. The content canvas has no shadows or tonal layering at
rest — depth is reserved entirely for transient, overlay-type surfaces
(header dropdowns, mobile nav drawer, floating action buttons) so a shadow
always signals "this is temporarily floating above the page," never
"this is a static card."

### Shadow Vocabulary
- **Overlay-low** (`box-shadow: 0 2px 8px rgb(0 0 0 / 30%)`): floating
  action buttons (back-to-top, chatbot bubble).
- **Overlay-high** (`box-shadow: 0 8px 32px rgb(0 0 0 / 20%)`): header
  mega-menu and dropdown panels.
- **Overlay-drawer** (`box-shadow: 4px 0 24px rgb(0 0 0 / 30%)`): mobile
  nav slide-in drawer.

### Named Rules
**The Floating-Only Rule.** A shadow appears exclusively on elements that
sit in a temporary overlay layer above the page. Cards, heroes, and
in-flow content stay flat.

## 5. Components

### Buttons
- **Shape:** pill (`border-radius: 2.4em`).
- **Primary:** Ink fill (`#131313`), Paper text, 2px transparent border,
  `0.5em 1.2em` padding.
- **Secondary:** transparent fill, Ink border and text.
- **Accent:** Signal Blue fill (`#3b63fb`), Paper text — reserved for a
  page's single highest-priority action when it needs more visual weight
  than Primary.
- **Hover/Focus:** Primary darkens to Graphite; Secondary fills Mist;
  Accent darkens to Signal Blue Deep. All transitions are instant color
  swaps, no motion easing.
- **Disabled:** Mist fill, Graphite text, `aria-disabled`/`:disabled`.

### Cards
- **Corner Style:** 12–16px radius depending on card type (product/featured
  cards 12px, hero and featured-event cards 16px).
- **Background:** Paper, occasionally Mist for grouped sections.
- **Shadow Strategy:** none at rest (see Elevation § Floating-Only Rule).
- **Border:** none; separation comes from whitespace and background color,
  not stroke.

### Navigation
- **Style:** two-tier bar — a 64px black top bar (logo, search, utility
  links) gradient-blending into a 45px charcoal (`#333`) section-links bar
  on desktop; both fold into a taller stacked mobile bar reserved via
  `min-height` to prevent layout shift on lazy load.
- **Typography:** Paper text on both bars, no visited-state distinction.
- **Active/hover:** underline or background tint, not color change (color
  stays white against the dark bar).
- **Mobile:** hamburger-triggered drawer sliding from the edge with
  Overlay-drawer shadow.

## 6. Do's and Don'ts

### Do:
- **Do** reserve EO Yellow (`#ffcd00`) exclusively for calls to action —
  it is the only "act now" signal on the page.
- **Do** keep body copy large (18–22px) — this is a spec-reading audience,
  not a skimming one.
- **Do** keep the content canvas flat; use shadow only on overlays
  (dropdowns, drawers, floating buttons).
- **Do** pair every technical claim with something concrete (a spec, a
  diagram, a real product image) per PRODUCT.md's "show, don't tell"
  principle.

### Don't:
- **Don't** use generic corporate stock-photo B2B imagery, vague icon
  grids, or interchangeable SaaS-template layouts (PRODUCT.md
  anti-reference).
- **Don't** introduce flashy consumer-e-commerce motion, gradients, or
  playful color that undercuts technical credibility (PRODUCT.md
  anti-reference).
- **Don't** add a shadow to static, in-flow content (cards, hero panels) —
  shadows are reserved for floating overlays only.
- **Don't** introduce a third accent color; Signal Blue and EO Yellow
  already divide "navigate/read" from "act."
