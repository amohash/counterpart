# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary user is one human operating a shared financial model while AI agents call the page's tools. The human reviews competing agent proposals, reads their rationales and rebuttals, and remains the sole decision-maker for accepting or rejecting changes.

## Product Purpose

Counterpart is a live financial-model canvas where a human and AI agents work from the same model state. It makes agent reasoning visible and reviewable so the human can evaluate changes before they affect the model. Success means the operator can understand the model, compare opposing recommendations, and make a confident decision without losing control of the underlying assumptions.

## Positioning

Agents cannot edit the model directly. They propose changes under a named identity, may rebut one another on the same proposal, and must wait for the human to arbitrate. The page is both the working model and the visible approval surface.

## Operating Context

Counterpart is a single-page working tool, not a landing page. A human uses the interface while Growth and Risk agents operate through WebMCP tools, potentially from separate same-origin tabs. Model and proposal state synchronize across tabs, and the product is evaluated in Chrome and ChatGPT's desktop in-app browser.

## Capabilities and Constraints

- The interface exposes editable assumptions, headline metrics, projections, charts, annotations, highlights, agent questions, proposals, rebuttals, and human accept/reject controls.
- Model state is in memory and localStorage; cross-tab synchronization uses BroadcastChannel with storage-event fallback.
- There is no traditional backend, database, or user-account system.
- The approved stack is Vite, React, TypeScript, Tailwind, and Recharts. Framer Motion, Lucide React, and restyled shadcn/ui primitives are allowed when the design pass calls for them.
- WebMCP must feature-detect safely, remain usable when unavailable, and log tool calls with a `[webmcp]` prefix.
- Visual work must not change product mechanics or behavior.

## Brand Commitments

The product name is Counterpart. Its voice is calm and precise, like a financial terminal rather than marketing hype. Purple gradients, glassmorphism, generic SaaS-dashboard styling, and italic serif headers are explicit anti-references.

## Evidence on Hand

The repository contains the working application, model tests, WebMCP integration tests, a README, and a timed demo script. No customer testimonials, external benchmarks, or marketing claims are available and future work must not fabricate them.

## Product Principles

- Keep the human visibly in control of every model change.
- Make agent identity, incentives, and disagreement legible at a glance.
- Favor operational clarity and dense, accurate information over promotional decoration.
- Preserve trustworthy behavior across tabs and supported browser environments.
- Treat motion as feedback for state changes, never as spectacle.

## Accessibility & Inclusion

The working interface must remain keyboard-operable, readable at responsive viewport sizes, and understandable without relying on color alone.
