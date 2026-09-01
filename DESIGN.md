---
name: Counterpart
description: A monochrome, single-accent institutional finance instrument for human-agent decisions.
colors:
  canvas: "#f7f6f2"
  surface: "#ffffff"
  surface-sunken: "#f0efe9"
  ink: "#0b0d0c"
  ink-soft: "#55605a"
  ink-faint: "#8b928c"
  rule: "#e4e3dc"
  rule-strong: "#c7c6bd"
  accent: "#8a6a26"
  accent-deep: "#6f5620"
  accent-tint: "#f4ecd8"
typography:
  display:
    fontFamily: "Newsreader, Georgia, serif"
    fontSize: "26px"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  title:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "IBM Plex Sans Variable, IBM Plex Sans, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
  mono:
    fontFamily: "IBM Plex Mono, ui-monospace, monospace"
rounded:
  control: "0px"
  surface: "0px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.accent-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    height: "36px"
  data-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.surface}"
---

# Design System: Counterpart

## Overview

**Creative North Star: "The Institutional Instrument"**

Counterpart reads like private-banking and institutional trading software —
Bloomberg's authority, Stripe/Ramp/Linear's typographic restraint, Mercury's
quiet confidence — not a generic AI dashboard. This is a **replacement** of
the prior "Analyst's Workbench" warm-paper identity, not a refinement of it:
the old multi-hue semantic palette (emerald/amber/red) and Avenir Next
typography are retained only as historical reference in git history, never
as a fallback or hybrid.

The system is deliberately monochrome: a single ink-to-paper grayscale carries
almost everything, and exactly **one accent color** — a muted antique-bronze
gold, evoking ticker brass and vault-door restraint rather than a SaaS teal
or purple — marks every moment a human can act (approve, activate a
scenario, focus a control, the primary CTA). Severity and status are carried
by weight, inversion, and text label, never by introducing a second hue.

**Key Characteristics:**
- Near-black ink on warm-white paper; pure white card surfaces for crisp
  figure/ground contrast against the sunken canvas
- A serif display face (Newsreader) reserved for the product title only —
  the one moment of editorial character
- A real monospace face (IBM Plex Mono) for every financial figure, not just
  `font-variant-numeric` — numbers should look like they came off a terminal
- Exactly one accent (`--accent`, muted bronze-gold) for every human-actionable
  moment; nothing else on the page competes with it for attention
- Severity expressed by weight/inversion/label, not by color count: critical
  states invert to solid ink, cautionary states use the accent tint, healthy
  states stay plain
- Sharp, unrounded surfaces; pills reserved for status badges and icon-only
  circular controls only
- Motion limited to meaningful queue and state transitions

**Anti-goal.** No purple/blue SaaS gradients, no glassmorphism, no rainbow
per-agent identity colors, no rounded glassmorphic tiles, no hover-glow on
static stat cards, no gradient sheen, no ambient blur, no system-default
display face standing in for a considered typographic choice. Agent identity
(Growth vs. Risk) is carried by icon and name text alone, per the existing
"never communicate identity by color alone" rule — it does not spend the
one accent color, and it does not reintroduce a second hue.

## Colors

A near-monochrome ink/paper scale plus one accent. Nothing else.

### Ink scale
- **Ink** (`#0b0d0c`): Primary text, headline figures, and — inverted as a
  background — the "critical" severity state.
- **Ink Soft** (`#55605a`): Secondary text, supporting copy.
- **Ink Faint** (`#8b928c`): Tertiary labels, timestamps, placeholder text.

### Paper scale
- **Canvas** (`#f7f6f2`): Page background — a warm off-white, not lab white.
- **Surface** (`#ffffff`): Card/section backgrounds; pure white against the
  warmer canvas is the primary depth cue, replacing soft ambient shadows.
- **Surface Sunken** (`#f0efe9`): Nested panels (rebuttal threads, impact
  disclosures) one step recessed from their parent card.
- **Rule** (`#e4e3dc`) / **Rule Strong** (`#c7c6bd`): Hairline dividers and
  emphasized borders (selected/active state), respectively.

### The one accent
- **Accent** (`#8a6a26`) / **Accent Deep** (`#6f5620` hover-pressed) /
  **Accent Tint** (`#f4ecd8` wash): Every primary human action — approve,
  propose, activate, the focus ring, the brand mark. Nothing decorative
  gets it.

**The One-Accent Rule.** If a new UI moment feels like it needs a color,
reach for ink-scale weight/inversion first. Only spend the accent when a
human can act on that exact element right now.

## Typography

**Display Font:** Newsreader (self-hosted, masthead only)
**Body/UI Font:** IBM Plex Sans Variable (self-hosted)
**Data Font:** IBM Plex Mono (self-hosted, every tabular financial figure)

**Character:** A serif display voice signals institutional gravity at the
masthead and section anchors; everything else is a clean, restrained grotesk;
every number a person compares digit-by-digit renders in real monospace.

### Hierarchy
- **Display** (Newsreader 600–700, 20–26px, 1.15, -0.01em): The product title
  only — one masthead moment, not a recurring section treatment.
- **Title** (IBM Plex Sans 600, 14px, 1.3): Section headers (Assumptions, charts,
  proposals, timeline).
- **Body** (IBM Plex Sans 400, 14px, 1.5): Rationales, questions, notes, table values.
- **Label** (IBM Plex Sans 600, 10px, 0.1em tracking, uppercase): Metric names, time
  ranges, data cadence.
- **Mono** (IBM Plex Mono, tabular): Every changing financial value — hero
  metric figures, table cells, impact-row before/after pairs. This is the
  system's numeric voice; it never competes with Newsreader, which is reserved
  for the masthead alone.

**The Numeric Stability Rule.** All financial values and model inputs render
in IBM Plex Mono, not the UI grotesk — this is the system's one deliberate
"instrument" texture, reserved for numbers alone.

## Layout

Unchanged from the prior system: a centered container capped at 1600px with
16/24/32px gutters, a 320px assumptions rail beside a fluid analysis column
above 1024px (stacked below it), and an 8px spacing base with 20px between
major work areas. Wide financial tables keep density and scroll rather than
collapsing columns.

## Elevation & Depth

Depth comes primarily from **surface contrast** (white cards on off-white
canvas) plus a thin hairline border — not layered shadow. A single quiet
ambient shadow remains on primary work surfaces to lift them off the canvas;
nested content is separated by rule lines and the sunken-surface tone, never
by nested shadows.

### Shadow Vocabulary
- **Surface ambient** (`0 8px 20px rgba(11,13,12,0.06)`): Assumption, chart,
  table, and card surfaces — lighter and cooler than the old warm-toned
  shadow, since white-on-canvas contrast now does most of the lifting.
- **Card lift** (`0 16px 32px rgba(11,13,12,0.10)`, `.card-lift` utility):
  Hover/focus state for actionable cards only (proposals, scenarios,
  recommendations with a propose action).

**The Flat-Within Rule.** Use one lifted outer surface, then rules and the
sunken tone — not nested shadows — to organize its contents.

**The Actionable-Lift Rule.** A card lifts on hover/focus only if it is
something the human acts on directly. Read-only tiles (health metrics, risk
rows, board-brief sections) never lift.

## Shapes

Every surface, input, and button uses sharp, unrounded (0px) corners. Pills
remain reserved for compact status badges and icon-only circular controls
(present-mode transport), since those are a distinct functional shape, not a
card treatment. Borders are thin and low contrast except where `rule-strong`
marks an active/selected state.

## Components

### Buttons
- **Shape:** Compact sharp-cornered rectangle (0px); 44px minimum touch
  height on small screens.
- **Primary:** Solid ink fill, white text, a meaningful Lucide icon —
  reserved for the single most consequential action on a surface (approve,
  the top-level CTA). Hover moves to Accent Deep, not a darker ink, so the
  one accent still signals "this is the action."
- **Secondary:** Quiet neutral fill (`surface-sunken`) with ink text, used
  for rejection, reset, and dismissive actions.
- **Focus:** A two-stage canvas-and-accent ring stays visible on every
  surface.

### Agent badges
- **Style:** White surface, ink border/text, and a role-specific icon:
  upward trend for Growth, shield alert for Risk, bot fallback for other
  agents. No per-agent hue — identity is carried by icon and name text only,
  which also means agent identity never competes with the one accent.

### Severity (no color-per-state)
Severity is expressed by weight and inversion, not by adding hues:
- **Critical:** Solid ink fill, white text, bold — a stamped-alert
  treatment, the strongest possible visual weight on the page.
- **Watch / At risk / Proposal review:** Accent-tint background
  (`--accent-tint`) with an accent-colored border — visually quieter than
  critical, still distinct from a plain surface.
- **Healthy / Good / Tracked:** Plain white surface with a rule border — no
  emphasis at all, because "fine" should not compete for attention.
Every severity state keeps its text label (CRITICAL / AT RISK / HEALTHY,
etc.) regardless of the visual treatment — never color alone.

### Cards / Containers
- **Corner Style:** 0px (sharp).
- **Background:** White surface on the off-white canvas; proposals use the
  accent tint; the metric rail and question surfaces use solid ink.
- **Shadow Strategy:** One ambient shadow on the outer surface only; an
  actionable card additionally lifts via `.card-lift`.
- **Internal Padding:** 16px body padding with 14px section bars.

### Inputs / Fields
- **Style:** White fill, rule border, right-aligned mono value, sharp (0px)
  corners.
- **Focus:** Accent border plus the global two-stage focus ring.

### Data surfaces
- **Charts:** Flat plotting field, horizontal dashed guides only, accent
  primary line, dark (ink) compact tooltip.
- **Tables:** Sticky tonal header, mono values, row hover via
  `surface-sunken`, outcomes distinguished by weight/label rather than a
  red/green pair.

## Do's and Don'ts

### Do:
- **Do** keep the ink/paper/accent system to exactly three color roles —
  everything else is weight, inversion, or the sunken tone.
- **Do** use Newsreader only at the masthead; never for
  body copy, buttons, or labels.
- **Do** render every financial figure in IBM Plex Mono.
- **Do** use Lucide icons only when they clarify role or action.
- **Do** keep financial data dense, aligned, and fully available at every
  viewport.
- **Do** animate proposals, rebuttals, and timeline entries as real state
  changes, with reduced-motion support.

### Don't:
- **Don't** introduce a second hue for severity, agent identity, or
  decoration — reach for ink weight/inversion first.
- **Don't** bring back the prior warm-paper/emerald/amber palette as a
  fallback or a "softer" variant; it is retired, not backup.
- **Don't** turn every data group into an equal card or add decorative
  metric tiles.
- **Don't** add motion to static sections merely to advertise polish.
- **Don't** apply hover lift, tilt, or glow to a read-only tile (health
  metrics, risk rows, board-brief sections) — reserve depth response for
  surfaces the human can actually act on.
- **Don't** round card, button, or input corners — sharpness is deliberate
  instrument-panel language; pills stay pills only for status badges and
  icon-only circular controls.
- **Don't** fall back to a system sans (Arial/Helvetica/platform default)
  for the display voice — Newsreader is self-hosted specifically so it never
  degrades to a system face.
