# Counterpart — AGENTS.md

## Purpose

This file is persistent implementation memory for coding agents working on Counterpart.

`CLAUDE.md` is authoritative for product requirements and Phase scope.
`PROGRESS.md` is the chronological history of completed Phases.
This file contains durable engineering instructions and decisions that future
agents must preserve.

---

# 1. NON-NEGOTIABLE WORKFLOW

1. Begin every user-facing message with `Amogh:`.
2. Complete exactly one Phase per session.
3. Read `CLAUDE.md`, `AGENTS.md`, and `PROGRESS.md` before editing.
4. Read only files necessary for the current Phase.
5. Do not implement later-Phase work early.
6. If something is ambiguous and materially affects architecture/product behavior, ask one focused question.
7. At Phase completion:
   - test;
   - update this file with durable knowledge;
   - append the Phase entry to `PROGRESS.md`;
   - commit `Phase N: <short description>`;
   - push if configured;
   - stop and instruct Amogh to `/clear`.

Required handoff:
`Amogh: Phase N complete. Run /clear and start Phase N+1.`

---

# 2. PROJECT IDENTITY

Counterpart is a WebMCP-powered financial decision room.

The human and AI agents work against the same live financial model.

Agents can inspect, analyze, scenario-test, recommend, propose, annotate,
highlight, and rebut.

Agents cannot silently apply consequential financial changes.

The human is the final arbiter.

Current agent identities:
- Growth
- Risk

The Growth and Risk agents may disagree and rebut each other's proposals.
Their disagreement is useful only when grounded in the model.

---

# 3. ARCHITECTURE

Current architecture is client-side:
- Vite
- React
- TypeScript
- Tailwind
- Recharts
- Framer Motion
- Lucide React

No traditional backend.
No database.
No user accounts.

State:
- React/in-memory state for live behavior;
- localStorage for required persistence;
- BroadcastChannel for cross-tab synchronization;
- storage events as fallback.

Cross-tab conflict policy:
- last-write-wins;
- no custom conflict-resolution system.

Do not introduce server state without an explicit Phase requiring it.

---

# 4. WEBMCP

Use:
`document.modelContext.registerTool(...)`

Never switch to the deprecated `navigator.modelContext` alias.

WebMCP must:
- register safely once;
- tolerate late API injection;
- degrade visibly instead of crashing when unavailable;
- validate all agent inputs;
- produce useful structured outputs;
- avoid hidden side effects.

Existing tools:
- `get_model_state`
- `propose_edit`
- `ask_human`
- `run_scenario`
- `annotate`
- `add_chart`
- `highlight`
- `rebut_proposal`

Do not remove existing tools.

Phase 18 audit coverage: the WebMCP test suite captures all eight registered
tools and executes their meaningful paths against live-style actions. Keep this
registration audit current when changing a tool name, schema, action, or output.
`rebut_proposal` accepts only locally generated `proposal-<positive integer>` ids
before resolving the proposal from live state.

Do not add a tool merely to increase the tool count.

A WebMCP tool should represent a meaningful capability an agent can use.

---

# 5. HUMAN APPROVAL

Meaningful financial model changes must go through:
`propose_edit` → human review → approve/reject.

Approval:
- applies the model change;
- updates dependent calculations;
- updates visualizations;
- records the decision.

Rejection:
- does not change the model;
- records the rejection;
- keeps the proposal available for context.

Never add an agent bypass around the approval system.

---

# 6. PROPOSAL / AGENT IDENTITY

Proposal records include agent identity.

Current identity behavior:
- `agentId` is based on the raw agent name;
- agent colors are assigned from a fixed palette in first-seen order;
- proposal cards display agent identity;
- rebuttals are nested under the proposal.

Do not replace this with a backend identity system.

---

# 7. CROSS-TAB SYNC

Use:
`BroadcastChannel("counterpart")`

Fallback:
`localStorage` storage events.

Current expected behavior:
- model state syncs;
- proposal state syncs;
- accepted/rejected status syncs;
- rebuttal threads sync;
- new tabs can obtain current state;
- last-write-wins is acceptable.

Do not build distributed conflict resolution.

---

# 8. FINANCIAL MODEL

Preserve the existing financial engine.

Do not rewrite calculations without a Phase explicitly requiring it.

Important historical decisions:
- `cumulativeCash` represents the modeled net cash position starting at 0, not an absolute bank balance.
- 100% churn resets customers to the new-customer steady state used by the existing model.
- assumptions persist under the existing localStorage strategy.
- model IDs and validation helpers should be reused rather than duplicated.

Financial risk rules are deterministic:
- runway < 3 months = Critical;
- runway 3–6 months = At Risk;
- LTV/CAC < 3x = weak unit economics;
- monthly churn > 8% = retention risk;
- gross margin < 65% = margin risk;
- monthly opex materially above gross profit = operating-cost risk.

---

# 9. DESIGN SYSTEM

Current design direction:
**Analyst's Workbench**

Use:
- warm paper;
- workbench ink;
- emerald for human/approved actions;
- amber for review states;
- restrained risk treatment;
- compact financial-terminal hierarchy;
- strong typography;
- whitespace;
- subtle borders.

Avoid:
- purple gradients;
- glassmorphism;
- generic AI dashboard styling;
- excessive gradients;
- fake dashboard clutter;
- italic serif headline treatment.

The product should feel like a serious working financial tool.

---

# 10. TESTING

Before Phase completion, use the appropriate checks.

Typical checks include:
- `npm test`
- `npm run build`
- TypeScript checks where configured
- lint/source checks where configured

For WebMCP phases:
- Chrome with WebMCP testing enabled;
- ChatGPT desktop in-app browser when the Phase requires it.

Do not claim a manual browser test passed unless it was actually performed.

Remember that browser automation may not be available.

---

# 10A. UPGRADE DELIVERY CONTRACT

The next work is a product upgrade, not an audit-only sequence. Future agents
must implement it in the P0/P1 order defined in `CLAUDE.md`.

P0 turns the current calculator into a complete Founder Decision Room:
- decision-room default surface with health metrics, deterministic risks, and
  recommendations;
- persisted local scenarios (Current Plan, Cost Control, Retention Recovery,
  Growth Bet) and a clear comparison experience;
- a first-class proposal review surface showing the model impact before human
  approval or rejection;
- a persistent human-agent decision timeline;
- forecast organization that preserves the existing financial engine and tools;
- a deterministic board brief with copy/download actions;
- demo presets for SaaS in trouble, Healthy growth, and Efficiency reset.

P1 begins only after P0 is complete and polished. It may add a small number of
meaningful scenario/report/history WebMCP tools, Present mode, a lightweight
30-day action plan, richer history, and accessibility/responsive refinements.

Do not add authentication, billing, a database, real financial integrations,
multi-user collaboration, an external LLM dependency, or a backend during
either tier. Use client state, localStorage, and the existing sync mechanism.

The central interaction must remain: agent reads → analyzes → runs a temporary
scenario → proposes → human approves/rejects → model changes only after
approval → decision is visible in the timeline and board brief.

If a manual check must be performed by Amogh, give an exact copy-paste instruction and record it as pending rather than pretending it passed.

---

# 11. KNOWN WEBMCP TESTING NOTES

Historical lessons:
- Chrome's WebMCP API uses `getTools()` and `executeTool(toolObject, '{}')`.
- The result of `getTools()` may be a Promise of a non-array iterable; use `Array.from(await ...)`.
- StrictMode can cause duplicate tool registration, so registration must be guarded.
- `document.modelContext` may be injected after page load, so detection can need retries.
- Chrome's built-in agent may sometimes interact with DOM inputs instead of calling tools.
- `ask_human` requires care because a blocking unanswered question can suspend the agent indefinitely.
- Do not add a timeout merely to hide the behavior unless a Phase explicitly changes this decision.
- Agent-readable verification values must not be treated as proof that a call came from an agent.

These are historical constraints; verify current code before changing behavior.

---

# 12. VISUAL QA

Phase 14 established the current visual direction.

Before changing visuals:
- preserve the Analyst's Workbench language;
- avoid regressions;
- do not reintroduce generic Tailwind/shadcn styling;
- do not change product mechanics during a visual-only Phase.

For visual work, test:
- desktop;
- mobile;
- proposal/rebuttal states;
- empty states;
- WebMCP status;
- human approval states.

---

# 13. SUBMISSION SAFETY

Do not:
- commit secrets;
- expose credentials;
- create unauthorized third-party integrations;
- replace the existing LICENSE;
- create a GitHub repository;
- misrepresent pre-existing work as hackathon-created;
- add copyrighted media without permission.

The project must remain publicly testable according to the final submission plan.

---

# 14. DOCUMENTATION RULES

Keep these files conceptually separate:

### CLAUDE.md
Authoritative product + challenge + phase instructions.

### AGENTS.md
Durable engineering memory and conventions.

### PROGRESS.md
Chronological record of completed Phases.

### README.md
Public project documentation and judge setup.

### DEMO_SCRIPT.md
Demo narration and sequence.

### HACKATHON.md
Only if needed for compliance/change-history documentation.

Do not duplicate the entire CLAUDE.md into this file.

---

# 15. PHASE UPDATE RULE — MANDATORY

At the end of every completed Phase, update this file.

Add only durable information.

Good additions:
- new architecture decisions;
- important state-flow decisions;
- tool behavior;
- validation behavior;
- test commands;
- known browser limitations;
- design decisions;
- gotchas future agents could easily repeat;
- decisions that must not be contradicted.

Bad additions:
- a full copy of the Phase specification;
- temporary debugging notes;
- long chronological progress reports;
- speculative future features.

If an old instruction becomes obsolete:
- update it;
- do not leave contradictory instructions;
- mention the change in the Phase's `PROGRESS.md` entry.

---

# 16. PHASE UPDATE TEMPLATE

When a Phase changes durable behavior, append/update a compact section such as:

```md
## Phase N durable decisions

- Architecture:
- WebMCP:
- State:
- Testing:
- Gotchas:
- Must preserve:
```

Then add the chronological detail to `PROGRESS.md`.

---

# 17. PHASE 17 DURABLE DECISIONS

- Compliance evidence lives in `HACKATHON.md` as a PASS / NEEDS ACTION matrix.
- The official Devpost requirements and rules are the compliance source of truth; recheck them because they may change.
- GitHub reports the repository as public and detects the root license as MIT.
- The deployment may remain behind Basic Auth only if judge credentials are supplied in the submission form and kept working through judging.
- Never commit `COUNTERPART_PASSCODE`; it remains a Vercel environment variable.
- Submission still requires an external public YouTube demo under three minutes and completed Devpost fields.
- The default Vite favicon should not appear in the final video; replace it with an original asset or keep it out of frame.
- `npm run lint` currently exits successfully but scans vendored agent-skill bundles and emits third-party warnings; source-only lint has two non-blocking React ref warnings in `useWebmcp.ts`.

---

# 18. CURRENT STATUS

Phases 1–19 are complete.

Current known major capabilities:
- financial model;
- projection engine;
- proposal approval system;
- WebMCP tools;
- human questions;
- scenario execution;
- annotations;
- custom charts;
- highlighting;
- agent identity;
- cross-tab synchronization;
- Growth/Risk rebuttals;
- polished Analyst's Workbench UI;
- optional Basic Auth deployment gate;
- README;
- demo script.
- hackathon compliance matrix.

The Phase 5 WebMCP ChatGPT-browser gap was resolved in Phase 8.
Do not reintroduce the deprecated API behavior.

---

# 18A. PHASE 19 DURABLE DECISIONS

- Decision Room is the default view (`useState<ViewId>('decision-room')` in `App.tsx`); tabs are
  `NavTabs` (`decision-room`, `scenarios`, `forecast`, `reports`), no router library, plain
  client-side view state.
- New pure logic modules (no React, no I/O): `src/health.ts` (4 interpreted metrics: runway, ARR,
  LTV/CAC, monthly burn), `src/risks.ts` (deterministic risk rules from section 8, verbatim), and
  `src/recommendations.ts` (one recommendation per active risk id, `runway-critical`/`runway-at-risk`
  collapse into a single `protect-runway` recommendation). Each has a matching `*.test.ts`; keep
  these three files test-covered before changing thresholds.
- `OPERATING_COST_RISK_MULTIPLIER = 1.2` in `risks.ts` is this project's fixed, documented reading of
  CLAUDE.md's "materially exceeds" — opex must be >20% above gross profit. Change deliberately, not
  silently, since it's not specified numerically upstream.
- `src/timeline.ts` + `src/hooks/useTimeline.ts` persist a human-agent decision timeline to
  localStorage key `counterpart-timeline`, same load/observe-id/save pattern as
  `proposal.ts`/`useProposals.ts`. Events render most-recent-first. `App.tsx` wraps
  `addProposal`/`addRebuttal`/`accept`/`reject` once (`proposeWithTimeline`, `rebutWithTimeline`,
  `acceptWithTimeline`, `rejectWithTimeline`) so every path — WebMCP tool calls and the human UI —
  logs the same way. There is deliberately no "model read" timeline event yet; wiring that requires
  a callback into `webmcp.ts`'s `get_model_state` execution and was judged out of scope for this
  phase.
- Following existing convention: only pure logic modules get `*.test.ts` files; no hook has a
  dedicated unit test (no jsdom/testing-library dependency exists or was added). `useTimeline` is
  exercised through manual QA and existing hooks' patterns, not a new test file — don't add
  jsdom/testing-library without asking, per the "no new libraries" constraint.
- The Decision Room's "Propose this change" button (`RecommendationList`) calls the same
  `proposeWithTimeline` path as agents, tagged with agent name `"Amogh"` — so a human-initiated
  recommendation proposal still goes through the existing pending/accept/reject flow and appears
  with an `AgentBadge` labeled AMOGH. This was an explicit scope decision (wire now vs. defer to
  Phase 21), confirmed with Amogh.
- The Forecast tab is the exact pre-Phase-19 calculator UI (Headline, AssumptionsPanel, Accept all,
  MrrChart, ProjectionTable, ExtraChart, empty-state prompt), moved verbatim under `view === 'forecast'`.
  Scenarios and Reports tabs are honest placeholders ("coming in a later phase") — Phase 20/21 fill
  these in; do not add fake functionality to them early.
- `formatCurrency` in `health.ts` handles negative values as `-$1,234`, not `$-1,234` — copy this
  pattern (`Math.abs` + sign prefix) if another module needs signed currency formatting.
- Manually verified in Chrome (dev server, not the WebMCP-flag build): Decision Room renders
  health/risks/recommendations for default assumptions (critical runway, healthy LTV/CAC), proposing
  via the recommendation button creates a proposal + timeline event, accepting it in the Forecast tab
  updates the model and adds an approval timeline event visible back in the Decision Room, and
  assumptions/timeline persist across reload. WebMCP tool execution itself was not re-verified this
  phase (no browser flag session) — Phase 18's registration/execution audit still stands.

# 19. CURRENT ROADMAP

The next planned Phases are defined in `CLAUDE.md`:

- Phase 18: WebMCP registration/tool audit
- Phase 19: End-to-end human-agent workflow
- Phase 20: Multi-agent Growth/Risk workflow audit
- Phase 21: Judge experience/demo reliability
- Phase 22: Submission documentation audit
- Phase 23: Final production QA
- Phase 24: Final demo rehearsal

Do not skip to a later Phase unless Amogh explicitly instructs you to do so.

---

# 20. FINAL PRINCIPLE

Counterpart wins by making WebMCP necessary to the experience.

Do not build:
"an AI dashboard that happens to have WebMCP."

Build:
"a financial decision environment where an agent can meaningfully inspect,
explore, propose, disagree, and collaborate with a human through WebMCP,
while the human remains in control."

Reliability and clarity are more important than feature count.
