# Progress

## Phase 1 — DONE (2026-08-27)
Files created/changed: package.json, vite.config.ts, index.html, src/App.tsx,
src/index.css, src/main.tsx, README.md, PROGRESS.md; deleted demo assets/App.css/icons.svg.
Done Check result: `npm run build` succeeds; page title and h1 both read "Counterpart".
Decisions worth remembering: scaffolded via temp dir + rsync (create-vite refuses
non-empty dirs); Tailwind v4 installed via @tailwindcss/vite plugin + `@import "tailwindcss"`
in index.css, no tailwind.config.js needed.
Gotchas: `npm create vite@latest .` hangs/cancels in a non-empty directory even
with --force; worked around by scaffolding into a temp dir and rsyncing in.
Next: Phase 2

## Phase 2 — DONE (2026-08-27)
Files created/changed: src/model.ts, src/model.test.ts; package.json (added
vitest devDep + "test": "vitest run" script).
Done Check result: `npm test` passes, 5 green.
Decisions worth remembering: cumulativeCash starts at 0 (net cash position, not
absolute bank balance); 100% churn resets customers to newCustomersPerMonth
each month (steady state, not zero) — tested as decline vs 0% churn baseline.
Gotchas: none.
Next: Phase 3

## Phase 3 — DONE (2026-08-27)
Files created/changed: src/App.tsx (rewritten), src/hooks/useModelState.ts,
src/components/{AssumptionsPanel,ProjectionTable,MrrChart,Headline}.tsx;
package.json (added recharts dep).
Done Check result: `npm run build` and `npm test` pass (5 green); manual check
pending on your end (edit churn, reload, confirm persistence).
Decisions worth remembering: assumptions persist to localStorage key
"counterpart-assumptions" as raw Assumptions JSON, merged over DEFAULT_ASSUMPTIONS
on load; Reset model clears that key.
Gotchas: none.
Next: Phase 4

## Phase 4 — DONE (2026-08-27)
Files created/changed: src/proposal.ts, src/proposal.test.ts,
src/hooks/useProposals.ts, src/components/ProposalHighlight.tsx;
src/components/AssumptionsPanel.tsx, src/App.tsx (wired proposals).
Done Check result: `npm test` (8 green) and `npm run build` pass; manual
click-test (Fake a proposal -> amber highlight -> Accept moves numbers)
pending on your end.
Decisions worth remembering: proposals live in-memory only (useState, not
localStorage) since spec doesn't require persistence; accept applies via
setAssumption then marks status 'accepted' (kept in array, not removed).
Gotchas: none.
Next: Phase 5

## Phase 5 — DONE (2026-08-27)
Files created/changed: src/webmcp.ts, src/hooks/useWebmcp.ts,
src/components/WebmcpBadge.tsx, src/App.tsx.
Done Check result: Part 1 PASSED (Chrome + flag: registers once, executeTool
returns 793 chars). Part 2 NOT verified — ChatGPT's in-app browser reports
document.modelContext undefined and shows the badge; Amogh waived it for now
and wants it revisited before submission.
Decisions worth remembering: use `document.modelContext` ONLY (reading the
deprecated `navigator.modelContext` alias just emits a console warning);
registration is guarded by a module-level flag because StrictMode double-mounts
(second call throws "Duplicate tool name"); detection retries every 1s for the
life of the page since some browsers inject the API late; payload carries a
per-page-load `verificationCode` (temporary, drop in Phase 9) to tell a real
tool call apart from an agent reading the page.
Gotchas: Chrome's API is `getTools()` + `executeTool(toolObject, '{}')` — the
name string and a bare `{}` both fail. An agent quoting a code baked into the
JS bundle proves nothing; it can fetch the bundle.
Next: Phase 6

## Phase 6 — DONE (2026-08-28)
Files created/changed: src/webmcp.ts, src/webmcp.test.ts, src/model.ts
(+ASSUMPTION_IDS/isAssumptionId), src/hooks/useWebmcp.ts, src/App.tsx
(removed "Fake a proposal" button).
Done Check result: Chrome + flag — getTools() lists both tools; executeTool on
propose_edit returned "Proposed monthlyChurnPct 3 -> 15. Awaiting Amogh's
approval.", amber highlight appeared, numbers only moved on Accept. 14 tests green.
Decisions worth remembering: registerModelTools now takes a ModelActions object
({getSnapshot, proposeEdit}) held in one module-level ref, so tools registered
once still reach live React state; agent args are validated in
validateProposeEditInput, which THROWS (unknown targetId, non-finite newValue,
blank rationale) so the agent sees a correctable error.
UPDATE (Phase 11): propose_edit's schema changed — it now requires a fourth
agentName input; proposeEdit/addProposal/createProposal all take agentName too.
Gotchas: getTools() returns a Promise of a non-array iterable — use
Array.from(await ...). Chrome's own agent may ignore our tools and type into the
input via the DOM instead; that bypass is not preventable from the page. ChatGPT
app/extension still has no document.modelContext (Phase 5 part 2, still open).
Next: Phase 7

## Phase 7 — DONE (2026-08-28)
Files created/changed: src/questions.ts, src/questions.test.ts,
src/hooks/useQuestions.ts, src/components/QuestionCard.tsx; src/webmcp.ts
(+ask_human tool, formatAskHumanResult, stronger descriptions), src/webmcp.test.ts,
src/hooks/useWebmcp.ts, src/App.tsx.
Done Check result: PASSED in Chrome with the Model Context Tool Inspector
extension + Gemini API key — "model 15% churn" asked monthly vs annual, then
proposed the edit for accept. 22 tests green, tsc clean.
Decisions worth remembering: askHuman resolvers live in a useRef Map (not state)
so a StrictMode remount cannot drop a promise the agent awaits; only queue[0]
renders, others wait; ask_human returns the chosen option PLUS "continue the
task now using this answer" because Chrome's built-in agent otherwise ends its
turn after a blocking tool call. Chrome's built-in agent often skips ask_human
entirely (monthlyChurnPct reads as unambiguous to it) — demo on the inspector
extension, not Chrome's agent. Rejected a hard gate in propose_edit.
Gotchas: no timeout by design; an unanswered card blocks the agent forever.
Next: Phase 8

## Phase 8 — DONE (2026-08-28)
Files created/changed: src/model.ts (+MONTHLY_SERIES_IDS/isMonthlySeriesId),
src/webmcp.ts (+run_scenario, annotate, add_chart, highlight + validators),
src/webmcp.test.ts, src/hooks/{useAnnotations,useCharts,useHighlight}.ts (new),
src/hooks/useWebmcp.ts (actions-object signature), src/components/ExtraChart.tsx
(new), src/components/AssumptionsPanel.tsx, src/App.tsx.
Done Check result: 37 tests green, `tsc -b` and `npm run build` clean. Manual
check PASSED in both Chrome (flag on) and ChatGPT's in-app browser on the
deployed Vercel URL — "compare 3%, 8%, 15% churn, chart cumulative cash, flag
the risky one" fired all four tools in both. This also resolves the Phase 5
part 2 gap: ChatGPT's in-app browser now reports document.modelContext.
Decisions worth remembering: run_scenario is pure (no hook, no state — just
computeModel with validated overrides); annotate keeps one note per assumption
(later call replaces, doesn't append); useWebmcp now takes an actions object
`{proposeEdit, askHuman, annotate, addChart, highlight}` instead of positional
args since it grew past 2; chart/annotation ids follow the existing
`prefix-${nextId}` counter pattern, not crypto.randomUUID.
Gotchas: `useRef<number>()` fails under `tsc -b` (needs an initial value) even
though plain `tsc --noEmit` accepts it — always give useRef an explicit
`| undefined` type + initial value for timer refs.
Next: Phase 9

## Phase 9 — DONE (2026-08-28)
Files created/changed: src/index.css (+fade-in keyframes/class),
src/components/ProposalHighlight.tsx, src/components/QuestionCard.tsx
(applied animate-fade-in), src/App.tsx (+empty state with 3 example prompts).
Done Check result: 37 tests green, `tsc -b` and `npm run build` clean.
Decisions worth remembering: number formatting already used
Intl.NumberFormat with thousands separators since Phase 3/8 — no change
needed there; empty state shows only when no proposals/charts/annotations
exist yet, so it disappears once the agent does anything.
Gotchas: none.
Next: Phase 10

## Phase 10 — DONE (2026-08-28)
Files created/changed: README.md (rewritten), DEMO_SCRIPT.md (new).
Done Check result: README has all seven required headings in order; both files
exist. No code touched, LICENSE untouched.
Decisions worth remembering: live URL is https://counterpart-sandy.vercel.app;
README pastes the real get_model_state registerTool block from src/webmcp.ts
verbatim; DEMO_SCRIPT.md assumes recording in Chrome with the Model Context
Tool Inspector extension (Phase 7 decision), not Chrome's built-in agent.
Gotchas: none.
Next: Phase 11

## Phase 11 — DONE (2026-08-28)
Files created/changed: src/proposal.ts, src/proposal.test.ts, src/webmcp.ts,
src/webmcp.test.ts, src/hooks/useProposals.ts, src/hooks/useWebmcp.ts,
src/components/ProposalHighlight.tsx, PROGRESS.md (Phase 6 note updated).
Done Check result: two propose_edit calls with different agentName values
render two differently-colored badges; 37 tests green, tsc -b and build clean.
Decisions worth remembering: agentId is just the raw agentName string (no
separate slug); agentColor comes from a fixed 6-color palette assigned in
first-seen order via a module-level Map in proposal.ts (getAgentColor).
Gotchas: none.
Next: Phase 12

## Phase 12 — DONE (2026-08-29)
Files created/changed: src/hooks/useCrossTabSync.ts, src/hooks/useModelState.ts,
src/hooks/useProposals.ts, src/App.tsx, src/proposal.ts, src/proposal.test.ts.
Done Check result: accepted a 15% monthly churn proposal in tab A; tab B updated
within one second without reload. 38 tests green, source lint and build clean.
Decisions worth remembering: combined model + proposal snapshots use
BroadcastChannel("counterpart"), with localStorage storage-event fallback;
new tabs request current state, last-write-wins, and received ids advance nextId.
Gotchas: browser automation unavailable; Amogh completed the two-tab check.
Next: Phase 13

## Phase 13 — DONE (2026-08-29)
Files created/changed: README.md, src/{App,proposal,proposal.test,webmcp,webmcp.test}.ts(x),
src/hooks/{useProposals,useWebmcp}.ts, src/components/ProposalHighlight.tsx.
Done Check result: Growth proposed higher opex, Risk rebutted on runway, both arguments
rendered on one card, and the decision synced; passed in Chrome and ChatGPT in-app browser.
Decisions worth remembering: rebuttals are nested in proposals, so Phase 12 sync carries
threads; get_model_state exposes proposal/rebuttal authors for cross-agent context.
Gotchas: none. 41 tests green; source lint and production build pass.
Next: Phase 14

## Phase 14 — DONE (2026-08-29)
Files created/changed: PRODUCT.md, DESIGN.md, .impeccable/*, package*.json,
src/{App,index.css}.tsx/css, src/components/{AgentBadge,AssumptionsPanel,ExtraChart,
Headline,MrrChart,ProjectionTable,ProposalHighlight,QuestionCard,WebmcpBadge}.tsx.
Done Check result: Impeccable audit zero findings; desktop/mobile visual QA, Phase 13
Growth→Risk→accept regression, 41 tests, source lint, build, and clean console passed.
Decisions worth remembering: “Analyst's Workbench” direction; warm paper, workbench
ink, emerald human actions, amber review states; Framer Motion + Lucide added.
Gotchas: dependency install during Vite HMR caused a transient hook error; restart fixed it.
Next: Phase 15

## Phase 15 — DONE (2026-08-29)
Files created/changed: middleware.ts, PROGRESS.md; Vercel production secret configured.
Done Check result: live URL returns 401 without Basic Auth and 200 with it; build passes.
Decisions worth remembering: Basic Auth username is `counterpart`; passcode lives only in
Vercel's encrypted `COUNTERPART_PASSCODE` production variable; deleting middleware removes gate.
Gotchas: local Vercel CLI had no credentials, so the secret was configured in Vercel's dashboard.
Next: Phase 16

## Phase 16 — DONE (2026-08-31)
Files created/changed: README.md, DEMO_SCRIPT.md, PROGRESS.md.
Done Check result: README retains all seven Phase 10 H2 headings and now covers two
opposing agents/rebuttals; demo narration is 311 words (~2m24s at 130 wpm).
Decisions worth remembering: demo centerpiece is Growth proposes → Risk rebuts →
human accepts; README tells judges to use username `counterpart` plus submitted passcode.
Gotchas: README said seven registered tools although its table listed eight; corrected to eight.
Next: submission


# PROGRESS.md handling note

The existing `PROGRESS.md` is the authoritative chronological history through Phase 16.

Future Claude Code and Codex sessions must:
- preserve every existing entry;
- append exactly one new block after each completed Phase;
- update `AGENTS.md` during the same handoff;
- update `CLAUDE.md` during the same handoff;
- never rewrite earlier historical entries;
- use the exact Phase number completed;
- record files changed, verification, durable decisions, gotchas, and next Phase.

Do not replace the existing progress history with a summary.

## Phase 17 — DONE (2026-08-31)
Files created/changed: HACKATHON.md, AGENTS.md, PROGRESS.md.
Done Check result: official Devpost/OpenAI rules audited; every known requirement is
PASS or NEEDS ACTION; 41 tests, build, lint, repository/license API checks, deployment
status checks, and targeted secret scans completed; no product behavior changed.
Decisions worth remembering: repository and MIT license are public/detectable; remaining
external actions are the public <3-minute YouTube video, Devpost fields/credentials, and
continued judge access; avoid the default Vite favicon in the final recording.
Gotchas: full lint traverses vendored agent-skill bundles and emits warnings but exits 0;
authenticated production access was historically verified in Phase 15, not re-tested here.
Next: Phase 18

## Phase 18 — DONE (2026-08-31)
Files created/changed: src/webmcp.ts, src/webmcp.test.ts, CLAUDE.md, AGENTS.md, PROGRESS.md.
Done Check result: all eight tools are registered and executed in the test suite against live-style React actions; invalid rebuttal ids fail before lookup; tests and production build pass.
Decisions worth remembering: registration audit must remain in sync with the complete tool list; proposals are still created only through pending approval and never mutate assumptions during a tool call.
Gotchas: this phase's browser-independent audit verifies registration and execution mechanics; live Chrome/ChatGPT tool testing remains a final QA activity.
Next: Phase 19

## Phase 19 — DONE (2026-08-31)
Files created/changed: src/{health,risks,recommendations,timeline}.ts (+matching .test.ts),
src/hooks/useTimeline.ts, src/components/NavTabs.tsx,
src/components/decision-room/{HealthGrid,RiskList,RecommendationList,DecisionTimeline}.tsx,
src/App.tsx (restructured), AGENTS.md, PROGRESS.md.
Done Check result: 65 tests green, `tsc -b` and `npm run build` clean, `oxlint` shows only the two
pre-existing `useWebmcp.ts` ref warnings. Manual Chrome QA (dev server): Decision Room is the default
view and shows critical runway / healthy LTV+CAC for default assumptions within seconds; clicking
"Propose this change" created a pending proposal and a timeline event; accepting it in the Forecast
tab updated monthly opex, the model/table, and added an approval timeline event visible back in the
Decision Room; assumptions and timeline persisted across a reload with no console errors.
Decisions worth remembering: see AGENTS.md section 18A (Phase 19 durable decisions) for the full
list — deterministic health/risk/recommendation modules, timeline persistence pattern, the
human-recommendation-propose wiring decision, and the Forecast/Scenarios/Reports tab split.
Gotchas: the default assumptions immediately produce a 1-month (critical) runway, since burn is
monotonically non-decreasing under growth assumptions — an "at-risk" (3-6 month) runway test fixture
needs a declining-customer-base scenario (high churn) to land in that window, not just higher opex;
also caught and fixed a `$-13,545`-style negative-currency formatting bug in `health.ts` during
manual QA before it shipped.
Next: Phase 20

## Phase 20 — DONE (2026-08-31)
Files created/changed: src/scenarioViewModel.ts (+ .test.ts), src/App.tsx, AGENTS.md,
PROGRESS.md. src/scenarios.ts, src/scenarios.test.ts, src/hooks/useScenarios.ts,
src/components/scenarios/{ScenarioWorkspace,index}.tsx, and the AssumptionsPanel.tsx four-group
regrouping had already been built uncommitted by a prior Codex session; this Phase audited,
reconciled type mismatches, and wired them into the app rather than rebuilding them.
Done Check result: 88 tests green (6 new for the adapter), `tsc -b` and `npm run build` clean,
lint shows only the pre-existing vendored-bundle warnings. Manual Chrome QA (dev server): Scenarios
tab renders all 4 seeded scenarios with correct metrics/status/comparison deltas; activating "Cost
Control" logged a timeline event and updated the detail panel without changing Current Plan's
health metrics or Forecast assumptions; Forecast tab's four-group layout, chart, and projection
table all rendered correctly with no regression; no unexpected console errors.
Decisions worth remembering: see AGENTS.md section 19A (Phase 20 durable decisions) — the
scenarioViewModel.ts adapter reconciling two independently-built status vocabularies, the
selectedScenarioId/activeScenarioId split, and the *WithTimeline wrapper pattern extended to all
six scenario actions.
Gotchas: the adapter's first draft mislabeled the worst-severity scenario status ("critical") as
"At risk" (a softer label already used for the middle tier) — caught during manual Chrome QA before
shipping and corrected to Critical/At risk/Healthy, matching CLAUDE.md section 8's own risk wording.
Also discovered AGENTS.md's section 19 roadmap list was stale (referenced Phase 20-24 names from
before CLAUDE.md's Phase 17-24 rewrite); corrected it in this Phase's handoff.
Next: Phase 21

## Phase 21 — DONE (2026-08-31)
Files created/changed: src/proposalImpact.ts (+.test.ts), src/boardBrief.ts (+.test.ts),
src/presets.ts (+.test.ts), src/health.ts (exported formatCurrency/formatMonths/formatRatio),
src/components/decision-room/PendingDecisions.tsx, src/components/reports/BoardBrief.tsx,
src/components/PresetSwitcher.tsx, src/App.tsx (wired all three), AGENTS.md, PROGRESS.md.
Done Check result: 106 tests green (18 new), `tsc -b`, `npm run build`, and `oxlint` (only the two
pre-existing useWebmcp.ts ref warnings plus one pre-existing App.tsx set-state-in-effect warning,
none new) all clean. Manual Chrome QA (dev server): loaded "SaaS in trouble" preset (assumptions
reset, button marked pressed, timeline logged); proposed the recommendation and saw a Pending
Decisions card with current->proposed values, agent badge, and rationale; Explore impact showed
correct before/after runway/ARR/LTV-CAC/burn; Approve applied the change, cleared the card, and
updated Decision Room health metrics; Reports tab rendered a correct Markdown board brief reflecting
the approved decision; switching the brief's scenario selector to Cost Control changed only the
report, verified by reopening Decision Room and confirming Current Plan's live metrics were
untouched; Copy showed "Copied" feedback; no unexpected console errors.
Decisions worth remembering: see AGENTS.md section 18B (Phase 21 durable decisions) — the
proposalImpact/boardBrief/presets pure-logic design, the shared health.ts formatters, all three
demo presets activating scenarioId 'current-plan' (deliberate, not an oversight), and the
Pending Decisions/Board Brief/Preset Switcher wiring into App.tsx.
Gotchas: caught and fixed a real StrictMode double-invocation bug where the "Explore impact"
timeline log lived inside a setState updater function and fired twice per click in dev; moved the
side effect outside the updater before shipping. See AGENTS.md 18B for the reusable pattern.
Next: Phase 22

## Phase 22 — DONE (2026-08-31)
Files created/changed: src/App.tsx, src/components/reports/BoardBrief.tsx, AGENTS.md, PROGRESS.md.
Done Check result: audited all 8 WebMCP tools against the upgraded Decision Room/Scenarios/Forecast/
Reports UI — registration, live-state wiring, validation, and `[webmcp]` logging were all already
correct, no tool changes needed. Audited localStorage load paths (useModelState, useTimeline,
scenarios.ts's hydrateScenarioState) — all already guarded against malformed data with safe
fallbacks, no changes needed. Found and fixed two concrete gaps: (1) annotate/add_chart/highlight
tool calls were not recorded in the decision timeline despite being meaningful agent actions per
CLAUDE.md section 12; (2) BoardBrief's clipboard copy had no error handling. 106 tests pass (no new
tests needed — both fixes are UI-wiring, not new pure logic), `tsc -b` and `npm run build` clean,
source lint shows only the three pre-existing documented warnings (no new ones). Manual QA via
chrome-devtools MCP against the dev server: fresh load registers all 8 tools with zero console
errors; Decision Room, Scenarios, Forecast, and Reports all verified at desktop and 390x844 mobile
viewports with no layout regressions; Copy button exercises the new try/catch path successfully.
Decisions worth remembering: see AGENTS.md section 18C (Phase 22 durable decisions) for the full
audit findings, the *WithTimeline wrapper pattern extended to annotate/add_chart/highlight using
actor "Counterpart", and the BoardBrief copy-error handling.
Gotchas: none new. ChatGPT in-app browser leg of the two-environment WebMCP check was not
re-verified this session (no access) — flagged as a pending Phase 24 QA item, consistent with the
historical gap tracked since Phase 8/17.
Next: Phase 23
