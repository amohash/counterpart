---
name: Counterpart
description: A calm, precise shared financial-model workspace for human and agent decisions.
colors:
  canvas: "#f3f1eb"
  surface: "#f8f7f3"
  ink: "#17211d"
  ink-soft: "#526059"
  rule: "#dedfd9"
  emerald: "#176f55"
  emerald-deep: "#115e47"
  amber: "#f3c878"
  proposal-surface: "#fffaf0"
  danger: "#a34832"
typography:
  title:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Avenir Next, Avenir, Segoe UI, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "0.1em"
rounded:
  control: "8px"
  surface: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.emerald}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.emerald-deep}"
    textColor: "#ffffff"
    rounded: "{rounded.control}"
  input:
    backgroundColor: "#ffffff"
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

**Creative North Star: "The Analyst's Workbench"**

Counterpart should feel like a focused instrument used during a consequential operating review: calm, dense, exact, and quietly tactile. Warm paper surfaces keep long financial sessions comfortable; a near-black green metric rail and restrained emerald actions establish authority without making the product feel like a generic SaaS dashboard.

The interface is an Operate surface. Hierarchy comes from alignment, tonal layers, compact section bars, and tabular numerals rather than decoration. Agent disagreement is the expressive moment: identity badges, proposal amber, and threaded rebuttals make competing incentives legible while the human's decision controls remain visually decisive.

**Key Characteristics:**
- Warm paper canvas with precise dark-ink contrast
- Compact operational density and strong numeric alignment
- Emerald reserved for human action, focus, and selected emphasis
- Amber reserved for proposals, caution, and runway pressure
- Motion limited to meaningful queue and state transitions

## Colors

The palette combines warm neutral work surfaces with deep green-black structure and narrow semantic accents.

### Primary
- **Operator Emerald** (#176f55): Human approval actions, focus, chart emphasis, and section icons.
- **Workbench Ink** (#17211d): Primary text, brand tile, and the headline metric rail.

### Secondary
- **Review Amber** (#f3c878): Runway warning emphasis and proposal-review context.
- **Decision Red** (#a34832): Negative cumulative cash and destructive financial outcomes, never general decoration.

### Neutral
- **Ledger Canvas** (#f3f1eb): Page background.
- **Paper Surface** (#f8f7f3): Assumption, chart, and table surfaces.
- **Measured Rule** (#dedfd9): Section dividers and quiet structure.
- **Secondary Ink** (#526059): Labels and supporting text.

**The Semantic Rarity Rule.** Emerald, amber, and red communicate meaning; do not spread them across decorative surfaces.

## Typography

**Display Font:** Avenir Next (with Avenir and Segoe UI fallbacks)
**Body Font:** Avenir Next (with Avenir and Segoe UI fallbacks)
**Label/Mono Treatment:** The body family with tabular numeral features for financial data.

**Character:** Restrained and highly legible. Financial values use stable tabular figures; compact uppercase labels identify data roles rather than creating promotional hierarchy.

### Hierarchy
- **Title** (600, 20–24px, 1.2): Product identity only.
- **Section title** (600, 14px, 1.3): Assumptions, charts, and projection table headers.
- **Body** (400, 14px, 1.5): Rationales, questions, notes, and table values.
- **Label** (600, 10px, 0.1em tracking, uppercase): Metric names, time ranges, and data cadence.

**The Numeric Stability Rule.** All changing financial values and model inputs use tabular numerals.

## Layout

The app uses a centered container capped at 1600px with 16px mobile, 24px tablet, and 32px desktop gutters. At large viewports, a 320px assumptions rail sits beside a fluid analysis column; below 1024px, the rail stacks above charts. The headline metrics remain a single compact rail at every size, while the approval action moves below it on narrow screens. Surface spacing follows an 8px base rhythm with 20px between major work areas.

Wide financial tables keep their information density and scroll inside a clearly focusable viewport on small screens rather than collapsing or hiding columns.

## Elevation & Depth

Depth is structural and quiet. Primary work surfaces use a soft downward ambient shadow without a competing border; internal section bars are separated with a single neutral rule. The metric rail and human approval action carry slightly stronger depth to establish the decision layer.

### Shadow Vocabulary
- **Surface ambient** (`0 10px 26px rgba(23,33,29,0.09)`): Assumption, chart, and table surfaces.
- **Decision lift** (`0 8px 18px rgba(23,111,85,0.18)`): Primary human approval actions.
- **Review lift** (`0 7px 18px rgba(107,75,19,0.10)`): Pending proposal cards.

**The Flat-Within Rule.** Use one lifted outer surface, then rules and tone—not nested shadows—to organize its contents.

## Shapes

Operational surfaces use 12px corners; inputs and buttons use 8px corners. Pills are reserved for compact status badges. Borders are thin and low contrast. Agent badges use a compact squared capsule so icon, name, and authored color read as one identity marker.

## Components

### Buttons
- **Shape:** Compact rounded rectangle (8px); 44px minimum touch height on small screens.
- **Primary:** Operator Emerald with white text and a meaningful Lucide icon.
- **Hover / Focus:** Darker emerald on hover; a two-stage paper-and-emerald focus ring stays visible on all surfaces.
- **Secondary:** Quiet neutral fill with dark ink, used for rejection and reset actions.

### Agent badges
- **Style:** White surface, authored agent-color border/text, and a role-specific icon: upward trend for Growth, shield alert for Risk, bot fallback for other agents.
- **Rule:** Never communicate identity by color alone; name and icon are always present.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Paper Surface for model work; Review Amber tint for pending proposals; Workbench Ink for metric and question rails.
- **Shadow Strategy:** One ambient shadow on the outer surface only.
- **Internal Padding:** 16px body padding with 14px section bars.

### Inputs / Fields
- **Style:** White fill, neutral rule border, right-aligned tabular value, 8px radius.
- **Focus:** Emerald border plus the global two-stage focus ring.

### Data surfaces
- **Charts:** Flat plotting field, horizontal dashed guides only, emerald primary line, dark compact tooltip.
- **Tables:** Sticky tonal header, tabular values, row hover, and semantic red/green outcomes.

## Do's and Don'ts

### Do:
- **Do** preserve the warm paper, dark workbench, and scarce semantic accent hierarchy.
- **Do** use Lucide icons only when they clarify role or action.
- **Do** keep financial data dense, aligned, and fully available at every viewport.
- **Do** animate proposals, rebuttals, generated charts, and agent questions as state changes with reduced-motion support.

### Don't:
- **Don't** introduce purple gradients, glassmorphism, italic serif headings, or generic SaaS-dashboard chrome.
- **Don't** turn every data group into an equal card or add decorative metric tiles.
- **Don't** use color alone for agent identity, proposal state, or financial outcomes.
- **Don't** add motion to static sections merely to advertise polish.
