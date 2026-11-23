---
name: SecureStart Visual Identity
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#43474d'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#74777e'
  outline-variant: '#c3c6ce'
  surface-tint: '#48607c'
  primary: '#001529'
  on-primary: '#ffffff'
  primary-container: '#0f2a43'
  on-primary-container: '#7992b0'
  inverse-primary: '#b0c9e9'
  secondary: '#006b5f'
  on-secondary: '#ffffff'
  secondary-container: '#7ef3e0'
  on-secondary-container: '#006f63'
  tertiary: '#001626'
  on-tertiary: '#ffffff'
  tertiary-container: '#002b45'
  on-tertiary-container: '#2f96db'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d0e4ff'
  primary-fixed-dim: '#b0c9e9'
  on-primary-fixed: '#001d35'
  on-primary-fixed-variant: '#304963'
  secondary-fixed: '#81f6e3'
  secondary-fixed-dim: '#63dac7'
  on-secondary-fixed: '#00201c'
  on-secondary-fixed-variant: '#005047'
  tertiary-fixed: '#cce5ff'
  tertiary-fixed-dim: '#93ccff'
  on-tertiary-fixed: '#001d31'
  on-tertiary-fixed-variant: '#004b73'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Newsreader
    fontSize: 2.75rem
    fontWeight: '600'
    lineHeight: 3.25rem
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Newsreader
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Newsreader
    fontSize: 2rem
    fontWeight: '600'
    lineHeight: 2.5rem
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Newsreader
    fontSize: 1.625rem
    fontWeight: '600'
    lineHeight: 2.125rem
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Newsreader
    fontSize: 1.5rem
    fontWeight: '600'
    lineHeight: 2rem
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Work Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: 1.625rem
  body-lg:
    fontFamily: Work Sans
    fontSize: 1.125rem
    fontWeight: '400'
    lineHeight: 1.75rem
  body-md:
    fontFamily: Work Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: 1.5rem
  body-sm:
    fontFamily: Work Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: 1.375rem
  label-md:
    fontFamily: Work Sans
    fontSize: 0.875rem
    fontWeight: '500'
    lineHeight: 1.25rem
  label-sm:
    fontFamily: Work Sans
    fontSize: 0.75rem
    fontWeight: '600'
    lineHeight: 1rem
    letterSpacing: 0.025em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 1rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system establishes an authoritative, composed, and institutional atmosphere tailored for South African regulated professions—namely legal advocates, audit partnerships, and medical practitioners managing statutory cybersecurity and POPIA (Protection of Personal Information Act) mandates.

The design philosophy unites deliberate editorial gravitas with sharp technical utility:
- **Authority without Opacity:** Conveys the statutory permanence of established chambers and fiduciary trust. Typography and structure evoke verified legal documentation rather than ephemeral software.
- **Calm Vigilance:** Mitigates compliance fatigue and incident panic through disciplined white space, structured tabular layouts, and precise, non-alarmist status signposting.
- **Architectural Precision:** Interfaces favor planar surfaces, hairline architectural borders, deliberate vertical rhythms, and unadorned clarity. Decorative artifacts, gratuitous micro-interactions, and neon saturations are strictly avoided.

## Colors

The palette employs deep naval pigments rooted in corporate stewardship, reinforced by an active teal accent for procedural movement and verified states.

### Core Canvas & Surfaces
- **Canvas Base:** `#FFFFFF` (Primary application surface) and `#F8FAFC` (Secondary canvas backdrop).
- **Surface Elevation:** `#FFFFFF` cards resting on `#F8FAFC` or `#F4F6F8` neutral background containers.
- **Structural Dividing Lines:** `#E2E8F0` across borders, column partitions, and row divisions.

### Structural Brand Accents
- **Headings & Institutional Chrome:** Deep Navy (`#0F2A43`). Used for primary structural frames, headers, mastheads, navigation anchors, and dominant display titling.
- **Action & Verification Primary:** Teal (`#0E9F8E`). Used for primary action buttons, key compliance progress indicators, and verified toggles.
- **Action Hover / Pressed:** Dark Teal (`#0B8072`).
- **Interactive Tint Background:** Subtle Teal (`#E6F7F5`).

### Typographic Contrast Hierarchy
- **Body & Data Cells:** Deep Slate (`#1E293B` to `#334155`).
- **Secondary Guidance & Table Metadata:** Slate Muted (`#64748B`).
- **De-emphasized / Placeholder:** Light Slate (`#94A3B8`).

### Priority Tokens (Requires combined icon/dot and text label; WCAG AA compliant)
- **Critical:** `#DC2626` text, `#FEE2E2` fill, `#F87171` stroke.
- **High:** `#EA580C` text, `#FFEDD5` fill, `#FB923C` stroke.
- **Medium:** `#D97706` text, `#FEF3C7` fill, `#FBBF24` stroke.
- **Low:** `#475569` text, `#F1F5F9` fill, `#94A3B8` stroke.

### Regulatory Status Tokens (Requires combined icon and text label)
- **Open:** `#475569` text, `#F1F5F9` fill.
- **In Progress:** `#0284C7` text, `#E0F2FE` fill.
- **Resolved:** `#16A34A` text, `#DCFCE7` fill.
- **Accepted Risk:** `#9333EA` text, `#F3E8FF` fill.

## Typography

The typographic hierarchy pairs the editorial permanence of Newsreader with the systematic, neutral legibility of Work Sans.

- **Newsreader (Editorial Serif):** Reserved strictly for primary dashboard headings, module titles, legal certification stamps, and executive audit summaries. It projects historical accountability and legal rigor.
- **Work Sans (Grotesque Sans):** Deployed across all operational UI surfaces, dense data grids, POPIA assessment questionnaires, metric values, form inputs, and status tags. Its open counters and geometric discipline maintain legibility across dense statutory matrices.
- **Numeric Tabulation:** All numerical values, dates, statutory deadlines, and risk scores must be rendered using tabular figures (`font-variant-numeric: tabular-nums`) to ensure vertical alignment across compliance registries.

## Layout & Spacing

The layout operates on a standardized 8px geometric scale, prioritizing predictable horizontal rhythm and dense informational density without visual friction.

### Grid Structures
- **Desktop (1024px+):** 12-column responsive fluid grid. `margin`: `2rem` (32px), `gutter`: `1.5rem` (24px). Sidebar navigations occupy a persistent 280px left rail.
- **Tablet (768px – 1023px):** 8-column grid. `margin`: `1.5rem` (24px), `gutter`: `1rem` (16px).
- **Mobile (Below 768px):** 4-column grid. `margin-mobile`: `1rem` (16px), `gutter-mobile`: `1rem` (16px). Left rail collapses entirely into a persistent bottom navigation bar.

### Spacing Principles
- Padding within compliance cards must maintain uniform `space-lg` (24px) for desktop and `space-md` (16px) for mobile.
- Section margins between unrelated statutory groups utilize `space-xl` (32px).
- Compact UI components (table rows, input clusters, badge internals) rely strictly on `space-xs` (4px) and `space-sm` (8px).

## Elevation & Depth

Visual hierarchy uses physical sheet-layering and directional navy-tinted ambient shadowing rather than artificial depth or heavy drop shadows.

### Atmospheric Shadow Parameters
Shadows are calculated with deep navy undertones (`#0F2A43`) to simulate overhead lighting over pressed parchment and architectural board:
- **Card Surface Rest:** `0 1px 3px rgba(15, 42, 67, 0.06), 0 4px 12px rgba(15, 42, 67, 0.05)`
- **Hover / Interactive Card:** `0 4px 6px -1px rgba(15, 42, 67, 0.08), 0 10px 20px -2px rgba(15, 42, 67, 0.06)`
- **Overlay Panels & Modals:** `0 12px 28px -4px rgba(15, 42, 67, 0.12), 0 4px 10px -2px rgba(15, 42, 67, 0.04)`

### Hairline Borders
Every elevated card, flyout panel, and table header retains a structural `1px` border using `#E2E8F0`. Depth must never rely purely on shadow; the hairline border ensures WCAG non-text contrast against both `#FFFFFF` and `#F8FAFC` backgrounds.

## Shapes

The design system enforces architectural corner geometry to preserve a restrained, professional tone appropriate for legal and fiduciary contexts.

- **Primary Cards & Form Containers:** Fixed corner curvature of `0.75rem` (12px), balancing modern software conventions with grounded discipline.
- **Buttons & Interactive Controls:** Fixed curvature of `0.5rem` (8px), maintaining clean alignment with adjacent input boundaries.
- **Status & Priority Badges:** Fully rounded capsule/pill silhouettes (`rounded-full`), visually distinguishing micro-metadata tags from actionable card boxes.
- **Nested Inner Containers:** Table cell highlights, active row indicators, and nested child boxes adopt `0.25rem` (4px) to retain concentric visual balance within parent 12px cards.

## Components

### Buttons
- **Touch & Pointer Target:** Minimum height of 44px (48px recommended on mobile displays).
- **Primary Button:** Deep Teal (`#0E9F8E`) fill, `#FFFFFF` text, `0.5rem` (8px) radius. Active hover transitions smoothly to Dark Teal (`#0B8072`).
- **Secondary Button:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, Deep Navy text (`#0F2A43`). On hover, background shifts to `#F8FAFC` with border `#94A3B8`.
- **Destructive Action:** `#DC2626` fill, `#FFFFFF` text, with mandatory double-step confirmation for critical data purges under POPIA regulations.

### Status & Priority Badges
- **Shape:** Full pill shape (`border-radius: 9999px`), internal padding `0.25rem` (4px) vertical by `0.625rem` (10px) horizontal.
- **Mandatory Accessibility Rule:** Color must never be the sole indicator of condition. Every priority badge must contain a filled 6px geometric dot or SVG icon paired with explicit Work Sans text (`label-sm`).
- **Priority Variants:**
  - Critical: Text `#DC2626`, Background `#FEE2E2`, Border `1px solid #F87171`.
  - High: Text `#EA580C`, Background `#FFEDD5`, Border `1px solid #FB923C`.
  - Medium: Text `#D97706`, Background `#FEF3C7`, Border `1px solid #FBBF24`.
  - Low: Text `#475569`, Background `#F1F5F9`, Border `1px solid #94A3B8`.
- **Lifecycle Status Variants:**
  - Open: Text `#475569`, Background `#F1F5F9`.
  - In Progress: Text `#0284C7`, Background `#E0F2FE`.
  - Resolved: Text `#16A34A`, Background `#DCFCE7`.
  - Accepted Risk: Text `#9333EA`, Background `#F3E8FF`.

### Input Fields & Controls
- **Height & Radius:** 44px field height, `0.75rem` (12px) border radius, border `1px solid #E2E8F0`.
- **States:** Focus rings utilize a crisp 2px outline in `#0E9F8E` with an outer soft spread `0 0 0 3px rgba(14, 159, 142, 0.15)`. Error states apply `#DC2626` border with immediate descriptive validation text below.
- **Checkboxes & Radios:** 20px hit-box enclosed within a minimum 44px accessible touch zone. Checked state utilizes `#0E9F8E` fill with an optical white checkmark or center pip.

### Cards & Compliance Panels
- **Structure:** Surface `#FFFFFF`, border `1px solid #E2E8F0`, corner radius `0.75rem` (12px), shadow `0 1px 3px rgba(15, 42, 67, 0.06), 0 4px 12px rgba(15, 42, 67, 0.05)`.
- **Header Divider:** Prominent cards separate the Newsreader title zone from internal body data using a full-width hairline border `#E2E8F0`.

### Data Grids & Compliance Registries
- **Headers:** Background `#F8FAFC`, text `#64748B` in uppercase `label-sm`, bottom border `1px solid #E2E8F0`.
- **Rows:** Alternating subtle row striping or white-to-hover transitions (`#F8FAFC`). Height minimum 52px to facilitate pointer navigation and touch auditing.

### Mobile Navigation Rail
- **Format:** Persistent bottom bar on mobile viewports (<768px), anchored to the viewport base with safe-area padding.
- **Surface:** `#FFFFFF` background with top border `1px solid #E2E8F0` and upward elevation shadow `0 -4px 12px rgba(15, 42, 67, 0.05)`.
- **Item Geometry:** Height 64px, minimum 48px touch targets, featuring iconography stacked above micro-labels (`label-sm`). Active destination highlighted with `#0E9F8E` indicator and bold text weight.