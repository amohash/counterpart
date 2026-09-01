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

## Phase 23 (partial) — DONE (2026-08-31)
Files created/changed: src/webmcp.ts (+list_scenarios tool, +formatListScenariosResult,
+ModelActions.getScenarios), src/webmcp.test.ts, src/hooks/useWebmcp.ts (+getScenarios param),
src/App.tsx (wired useScenarios into useWebmcp), AGENTS.md, PROGRESS.md.
Done Check result: identified `list_scenarios` as the single highest-value remaining P1 item
(agents had no visibility into the human-curated scenario library that `get_model_state` never
exposed and `run_scenario` doesn't reference by id). TDD: wrote failing tests first (registration
audit expected a 9th tool + a dedicated `formatListScenariosResult` test), confirmed red, then
implemented. 107 tests green (2 new), `tsc -b` and `npm run build` clean, `oxlint` shows only the
pre-existing documented warning categories (one more `useWebmcp.ts` ref warning from the new
`getScenariosRef`, same pattern as the existing two, no new category).
Decisions worth remembering: see AGENTS.md section 18D (Phase 23 durable decisions) — read-only
tool, no timeline event (same precedent as get_model_state), reuses DerivedScenario verbatim.
Gotchas: none. Live-browser (Chrome flag / ChatGPT in-app) manual QA for this tool was not
performed this session (no browser automation access) — flagged as a pending Phase 24 QA item,
same historical pattern as prior WebMCP phases.
Next: Phase 23 remaining P1 candidates (save_scenario, compare_scenarios, generate_board_brief,
get_decision_log, then Present mode / 30-day plan / audit view / a11y), one item per session.

## Phase 23 (partial, continued) — DONE (2026-08-31)
Files created/changed: src/webmcp.ts (+generate_board_brief tool, +validateGenerateBoardBriefInput,
+ModelActions.logBoardBriefGenerated), src/webmcp.test.ts, src/hooks/useWebmcp.ts
(+logBoardBriefGenerated forwarding), src/App.tsx (+agentBoardBriefGeneratedWithTimeline, wired into
useWebmcp), AGENTS.md, PROGRESS.md.
Done Check result: independently re-evaluated the Phase 23 candidate list and chose
`generate_board_brief` over the previously-recorded next item (`save_scenario`) because it closes
the largest remaining WebMCP-Leverage gap — producing the board-ready update was still human-only.
TDD: extended webmcp.test.ts first (registration count 9->10, a new validator describe block, and
three new assertions in the registration audit for a default-scenario call, an explicit-scenarioId
call, and an unknown-scenarioId rejection), confirmed red (4 failing), then implemented. 110 tests
green (4 new), `tsc -b` and `npm run build` clean, `oxlint` shows only the four pre-existing
documented warnings (no new categories). Manual QA: started the dev server, mocked
`document.modelContext.registerTool` via a page initScript (no WebMCP-flag browser session this
Phase) and called the real registered tool directly — default call matched the Reports tab's Current
Plan brief; an explicit `cost-control` scenarioId produced Cost Control's brief; an unknown
scenarioId threw the expected error and logged nothing; `get_model_state`'s assumptions were
unchanged before/after both successful calls; two `'Counterpart'`-actor timeline events appeared,
most-recent-first; console showed only expected `[webmcp]` logs.
Decisions worth remembering: see AGENTS.md section 18E — the tool computes everything inline in
webmcp.ts reusing boardBrief.ts/risks.ts/recommendations.ts verbatim (no new brief logic); a new
agent-actor timeline wrapper (`'Counterpart'`) is kept separate from the existing human-actor one
BoardBrief.tsx's UI still uses.
Gotchas: none new. Real Chrome-flag / ChatGPT in-app browser verification of this tool remains a
pending Phase 24 QA item, same historical pattern as list_scenarios and prior WebMCP phases.
Next: Phase 23 remaining P1 candidates (save_scenario, compare_scenarios, get_decision_log, then
Present mode / 30-day plan / audit view / a11y), one item per session.

## Phase 23 (partial, continued 2) — DONE (2026-08-31)
Files created/changed: src/webmcp.ts (+get_decision_log tool, +formatDecisionLogResult,
+ModelActions.getTimeline), src/webmcp.test.ts, src/hooks/useWebmcp.ts (+getTimeline param),
src/App.tsx (wired useTimeline's events into useWebmcp), AGENTS.md, PROGRESS.md.
Done Check result: chose `get_decision_log` over `save_scenario`/`compare_scenarios` because
`list_scenarios` already returns every scenario's metrics side by side (making compare_scenarios
redundant) and scenario creation is deliberately human-only; `get_model_state` never exposed decided
history, only pending proposals, which is the largest remaining WebMCP-Leverage gap in CLAUDE.md
section 12's timeline. TDD: extended webmcp.test.ts first (a new formatDecisionLogResult describe
block covering newest-first sorting and a 25-event cap, plus the registration audit's tool count
10->11, a getTimeline action, and a get_decision_log execute() assertion), confirmed 3 failing, then
implemented. 112 tests green (3 new), `tsc -b` and `npm run build` clean, `oxlint` shows one more
useWebmcp.ts ref warning (getTimelineRef, same existing category) plus the one pre-existing App.tsx
warning, no new categories.
Decisions worth remembering: see AGENTS.md section 18F — the sort-then-cap formatter design, the
getTimeline wiring pattern, and the read-only/no-timeline-event-of-its-own precedent.
Gotchas: attempted live-browser QA via chrome-devtools MCP (initScript-mocked
document.modelContext.registerTool, same technique that worked for generate_board_brief) but this
session's evaluate_script executes in a context that does not share window/document expando state
(nor, tested, cross-context CustomEvent dispatch) with the page's main-world React app — registration
was confirmed via the `[webmcp] registered ...` console log listing all 11 tools, but the captured
tool reference was unreachable from evaluate_script, and a CustomEvent bridge hung and was aborted.
This is a session/harness limitation, not a code defect; webmcp.test.ts's registration-audit test
(real execute() calls against live-style actions in Node) is this Phase's verification instead. Real
Chrome-flag / ChatGPT in-app browser verification remains a pending Phase 24 QA item.
Next: Phase 23 remaining P1 candidates (save_scenario, compare_scenarios — both now lower priority
given list_scenarios' overlap and scenario-creation's human-only design — then Present mode / 30-day
plan / audit view / a11y), one item per session.

## Phase 23 (planning only, continued 3) — DONE (2026-08-31)
Files created/changed: PROGRESS.md, AGENTS.md (planning-only session; no source files touched).
Done Check result: ran `/orch-add-feature` restricted to plan-only scope. Re-evaluated remaining
Phase 23 candidates and chose **Present mode** (founder/investor walkthrough) as the next P1 item,
ahead of `save_scenario`/`compare_scenarios` (already downgraded in Phase 23 continued/continued-2)
and ahead of the 30-day action plan / richer audit view / extra charts+a11y, because it most directly
serves CLAUDE.md section 19/24's "achievable in roughly two minutes"/"under three minutes" judge-demo
requirement without touching the model, WebMCP tools, or persistence layer P0 reliability depends on.
Classified tier: Small. No new library/skeleton research needed (reuses NavTabs, framer-motion,
existing Decision Room/Scenarios/Pending Decisions/Board Brief components). Stopped at Gate 1 as
instructed; plan was presented and approved by Amogh but **not implemented this session**.
Decisions worth remembering (approved plan, to implement next session):
- `src/hooks/usePresentMode.ts` (+ test): in-memory-only state (`isPresentMode`, `enter`/`exit`,
  `step`, `next`/`prev`) — deliberately no localStorage persistence; presentation state is ephemeral
  and not a CLAUDE.md-listed persistence requirement (YAGNI).
- `src/components/PresentModeBar.tsx` (+ test): fixed overlay with exit, step label, Prev/Next;
  drives `App.tsx`'s existing `view`/`selectedScenarioId` state rather than owning its own routing.
- `App.tsx` wiring: header toggle near `PresetSwitcher`/`WebmcpBadge`; fixed 5-step script —
  Decision Room (health) -> Decision Room (risks/recommendation) -> Scenarios (Cost Control) ->
  Pending Decisions -> Board Brief. No new timeline event for entering/stepping present mode (mirrors
  the `get_model_state`/`list_scenarios` "reading/presenting isn't itself a decision-room action"
  precedent).
- While `isPresentMode` is true, dim/disable `AssumptionsPanel` inputs and `PresetSwitcher` so a
  investor walkthrough can't accidentally knock the model off-script.
- Respect `prefers-reduced-motion` for step transitions (reuse `App.tsx`'s existing `MotionConfig`).
- Explicit non-goals for that session: no new WebMCP tool, no present-mode persistence, no 30-day
  plan / richer audit view / a11y work (still queued after Present mode).
Gotchas: none (no code written).
Next: implement the approved Present mode plan above (Gate 2 = commit confirmation after TDD +
review), then remaining Phase 23 candidates (30-day plan, richer audit view, extra charts/a11y).

## Phase 23 (partial, continued 4) — DONE (2026-09-01)
Files created/changed: src/presentMode.ts (+.test.ts), src/hooks/usePresentMode.ts,
src/components/PresentModeBar.tsx, src/components/PresetSwitcher.tsx (+disabled prop),
src/components/AssumptionsPanel.tsx (+disabled prop), src/App.tsx (wired Present mode), AGENTS.md,
PROGRESS.md.
Done Check result: implemented the Present mode plan approved in the prior (planning-only) session
via `/orch-add-feature`, re-confirmed at Gate 1 before writing code. TDD: wrote presentMode.test.ts
first (7 assertions covering PRESENT_MODE_STEPS shape and clampStepIndex boundary behavior),
confirmed red (`Cannot find module './presentMode'`), then implemented presentMode.ts to green.
119 tests pass (7 new), `tsc -b` and `npm run build` clean, `oxlint` shows one additional
pre-existing-category `react(set-state-in-effect)` warning in App.tsx (the new view-sync effect,
same category as the pre-existing selectedScenarioId sync effect) and no new categories. Manual
Chrome QA via chrome-devtools MCP against the dev server: "Present" button disabled all three preset
buttons and stepped through all 5 script steps correctly (Decision Room health -> Decision Room
risks/recommendation -> Scenarios with Cost Control selected -> Decision Room pending decisions ->
Reports board brief), Prev/Next correctly disabled at the first/last step, Exit restored normal
state exactly; `counterpart-assumptions` localStorage was byte-identical before and after the
walkthrough (Present mode never touched the model); console showed zero errors or warnings
throughout; also re-verified at a 390x844 mobile viewport with no overlay overflow.
Decisions worth remembering: see AGENTS.md section 18H — in-memory-only present-mode state (no
localStorage, by design), the pure presentMode.ts/clampStepIndex test-coverage split (mirroring the
codebase's existing "only pure logic gets tests" convention), the view-only scenario-selection step
(never calls scenarios.activate), and the new optional `disabled` prop on PresetSwitcher/
AssumptionsPanel.
Gotchas: none new.
Next: Phase 23 remaining P1 candidates (30-day action plan, richer audit/history view, extra
comparison charts, accessibility refinements — save_scenario/compare_scenarios stay deprioritized),
one item per session.

## Phase 23 (planning only, continued 5) — DONE (2026-08-31)
Files created/changed: PROGRESS.md, AGENTS.md (planning-only session; no source files touched).
Done Check result: ran `/orch-add-feature` restricted to plan-only scope. Chose the **30-day action
plan with local completion state** as the next P1 item — the first item in CLAUDE.md section 23's
own listed P1 candidate order that is not yet done (Present mode is done; `save_scenario`/
`compare_scenarios` remain deprioritized per AGENTS.md 18D/18F). Classified tier: Small — no new
library/skeleton research needed (reuses `recommendations.ts`, the existing `*WithTimeline`/
localStorage-hook conventions, and `DecisionTimeline.tsx`'s icon map). Stopped at Gate 1 as
instructed; plan was presented and approved by Amogh but **not implemented this session**.
Decisions worth remembering (approved plan, to implement next session):
- `src/actionPlan.ts` (+ `.test.ts`): pure function `computeActionPlanItems(recommendations)` maps
  each active `Recommendation` (from `recommendations.ts`, already ordered most-severe-first) to one
  `ActionPlanItem = { id: 'plan-<recommendationId>', week: 1|2|3|4, title, detail, recommendationId }`
  by index (1st recommendation -> Week 1, 2nd -> Week 2, ... capped at Week 4). Item ids are derived
  from the stable `recommendationId`, not a counter, so completion state survives a reload even as
  the active-recommendation set changes.
- `src/hooks/useActionPlan.ts`: `Record<itemId, boolean>` completion map persisted to a new
  localStorage key `counterpart-action-plan-completion`, same load/try-catch-fallback/save pattern as
  `useTimeline.ts`/`useProposals.ts`. Exposes `completed` map + `toggle(itemId)`.
- `TimelineIconKey` (in `timeline.ts`) gains one new value, `'plan'`, and `DecisionTimeline.tsx`'s
  `ICONS` map gains a matching Lucide icon (e.g. `ListChecks` or `CheckSquare`) — the only non-test
  source change outside the new files.
- `src/components/decision-room/ActionPlan.tsx` (new): renders the plan grouped by week with a
  checkbox per item; checking/unchecking calls a prop callback (not `useActionPlan` directly) so
  `App.tsx` can wrap it as `toggleActionPlanItemWithTimeline`, logging one timeline event per toggle
  (actor `'Amogh'`, icon `'plan'`, sentence e.g. `Marked "<title>" complete` / `"<title>" incomplete`
  as `detail`) — mirrors the existing `*WithTimeline` wrapper pattern used everywhere else in
  `App.tsx`. Renders nothing (or a "no action items" empty state) when there are zero active
  recommendations, so it disappears once every risk is resolved.
- Placement: below `RecommendationList` in the Decision Room, since the plan is literally derived
  from the same recommendations already shown there.
- Explicit non-goals: no new WebMCP tool (this is a human-only checklist, not an agent capability);
  no separate persisted item list (only the completion map persists — items are always recomputed
  live from current recommendations); no due-date/calendar logic beyond the fixed Week 1-4 buckets.
Gotchas: none (no code written).
Next: implement the approved 30-day action plan above (Gate 2 = commit confirmation after TDD +
review), then remaining Phase 23 candidates (richer audit/history view, extra comparison charts,
accessibility refinements).

## Phase 23 (planning only, continued 6) — DONE (2026-08-31)
Files created/changed: PROGRESS.md, AGENTS.md (planning-only session; no source files touched).
Done Check result: ran `/orch-add-feature` restricted to plan-only scope, re-confirming the plan
already approved in the prior planning-only session (§18I/continued 5) for the **30-day action plan
with local completion state** — still the highest-value not-yet-done P1 item in CLAUDE.md §23's
candidate order. Tier: Small, no new libraries/skeletons needed. Presented the plan again at Gate 1
this session; Amogh explicitly approved it ("approve"). Stopped at Gate 1 as instructed — **no
source files were touched this session**.
Decisions worth remembering: plan content is unchanged from §18I (see that section for the full
task breakdown: `src/actionPlan.ts`, `src/hooks/useActionPlan.ts`, `TimelineIconKey` +`'plan'`,
`src/components/decision-room/ActionPlan.tsx`, placement below `RecommendationList`, no new WebMCP
tool).
Gotchas: none (no code written).
Next: implement the approved 30-day action plan (Gate 2 = commit confirmation after TDD + review),
then remaining Phase 23 candidates (richer audit/history view, extra comparison charts,
accessibility refinements).

## Phase 23 (partial, continued 7) — DONE (2026-08-31)
Files created/changed: src/actionPlan.ts (+.test.ts), src/hooks/useActionPlan.ts,
src/components/decision-room/ActionPlan.tsx, src/timeline.ts (+'plan' TimelineIconKey),
src/components/decision-room/DecisionTimeline.tsx (+ListChecks icon), src/App.tsx (wired
useActionPlan + ActionPlan + toggleActionPlanItemWithTimeline), AGENTS.md, PROGRESS.md.
Done Check result: implemented the 30-day action plan approved in the prior planning-only sessions
(18I/18J) via `/orch-add-feature`, re-confirmed at Gate 1 before writing code. TDD: wrote
actionPlan.test.ts first (4 assertions: week ordering/1-indexing, stable plan-<recommendationId>
ids, Week-4 cap with 5+ recommendations, empty input), then implemented computeActionPlanItems.
123 tests green (4 new), `tsc -b` and `npm run build` clean, `oxlint` shows only the six
pre-existing documented warnings (no new categories). code-reviewer agent returned 0
critical/high/medium/low findings (APPROVE).
Decisions worth remembering: see AGENTS.md section 18K for the full list — completion-map-only
persistence (items always recomputed live from recommendations), the *WithTimeline wrapper pattern
extended to action-plan toggles, and the deliberate choice not to add a WebMCP tool for this
human-only checklist.
Gotchas: none new. Manual browser QA was not performed this session (no browser automation
access) — flagged as a pending Phase 24 QA item, same historical pattern as prior phases.
Next: Phase 23 remaining P1 candidates (richer audit/history view, extra comparison charts,
accessibility refinements) — save_scenario/compare_scenarios stay deprioritized.

## Phase 23 (partial, continued 8) — DONE (2026-08-31)
Files created/changed: src/timeline.ts (+filterTimelineEvents), src/timeline.test.ts (+3 tests),
src/components/decision-room/DecisionTimeline.tsx (actor-filter select), AGENTS.md, PROGRESS.md.
Done Check result: implemented a Gate-1-approved, deliberately minimal slice of the "richer
audit/history view" P1 candidate — an actor filter for the Decision timeline — via
`/orch-add-feature`. TDD: wrote 3 new assertions in timeline.test.ts first (all-actors passthrough,
actor match, no-match empty array), confirmed red (`filterTimelineEvents is not a function`), then
implemented the pure `filterTimelineEvents(events, actor)`. 126 tests green (3 new), `tsc -b` and
`npm run build` clean, `oxlint` shows only the six pre-existing documented warnings (no new
categories). code-reviewer agent returned 0 critical/high/medium findings, 1 LOW note (stale
`<select>` value if the actor set changes while filtered — non-blocking, actor names are static for
the app's lifetime); verdict APPROVE.
Decisions worth remembering: see AGENTS.md section 18L — local-only (unpersisted, non-cross-tab)
`actorFilter` state in DecisionTimeline.tsx, the actor `<select>` only renders with >1 distinct
actor, and the deferred (not abandoned) further slices: free-text search, event-type filter,
expand/collapse of long detail text.
Gotchas: none new. Manual browser QA not performed this session (no browser automation access) —
flagged as a pending Phase 24 QA item alongside the existing backlog.
Next: Phase 23 remaining P1 candidates (further audit/history view slices, extra comparison charts,
accessibility refinements) — save_scenario/compare_scenarios stay deprioritized.

## Phase 23 (continued 9, final) — DONE (2026-08-31)
Files created/changed: src/timeline.ts (+searchTimelineEvents), src/timeline.test.ts (+4 tests),
src/scenarioViewModel.ts (+buildRunwayComparisonData, +DEFAULT_RUNWAY_CAP_MONTHS),
src/scenarioViewModel.test.ts (+3 tests), src/components/decision-room/DecisionTimeline.tsx
(search box + aria-live status region), src/components/scenarios/ScenarioComparisonChart.tsx (new),
src/components/scenarios/ScenarioWorkspace.tsx (renders comparison chart + table a11y: caption,
scope attrs, aria-live compared-count region), AGENTS.md, PROGRESS.md.
Done Check result: Amogh explicitly asked to "complete all the remaining phase 23 tasks" via
`/orch-add-feature`; confirmed via `AskUserQuestion` to batch the remaining P1 candidates into one
session instead of the established one-item-per-session cadence. Implemented all three remaining
candidates from CLAUDE.md section 23/AGENTS.md 18L: further audit/history-view slice (timeline
free-text search), extra comparison charts (scenario runway bar chart), and accessibility
refinements (table caption/scope, two new aria-live status regions). TDD: wrote 7 new assertions
first (4 for searchTimelineEvents, 3 for buildRunwayComparisonData), confirmed both red, then
implemented to green. 133 tests pass (7 new), `tsc -b` and `npm run build` clean, `oxlint src` shows
only the same six pre-existing documented warnings (no new categories). `code-reviewer` agent
returned 0 critical/high findings (1 MEDIUM readability nit and 1 LOW duplicated-literal nit, both
addressed); verdict APPROVE.
Decisions worth remembering: see AGENTS.md section 18M for the full list — search composes with the
existing actor filter (narrow-then-narrow), the shared `DEFAULT_RUNWAY_CAP_MONTHS` constant keeps
the chart caption and the capping logic in sync, and `save_scenario`/`compare_scenarios` remain
intentionally out of scope (not required by CLAUDE.md's Phase 23 list). Phase 23 is now fully DONE.
Gotchas: an initial `formatter={(value: number) => ...}` annotation on the Recharts `Tooltip` broke
`tsc -b` (Recharts' `Formatter` type accepts `ValueType | undefined`, not a bare `number`) — reverted
to inferred typing, matching the pattern review flagged as a nit rather than a real type-safety gap.
Manual browser QA not performed this session (no browser automation access) — flagged as a pending
Phase 24 QA item alongside the existing backlog.
Next: Phase 24 — Submission and final demo readiness.

## Phase 24 — DONE (2026-08-31)
Files created/changed: README.md (tool table/count "eight"→"eleven", added
`list_scenarios`/`generate_board_brief`/`get_decision_log` rows, test-count
"41"→"133", registration doc-comment line), DEMO_SCRIPT.md (full rewrite to
walk the current Decision Room → scenario → propose/rebut → human decision →
timeline → board brief judge path instead of the pre-Phase-19 calculator-era
flow), AGENTS.md (new §19 audit summary), PROGRESS.md.
Done Check result: ran as a verification/audit pass (not a new-feature build),
directly against CLAUDE.md's Phase Execution Protocol rather than
`/orch-add-feature`'s TDD gates. `npm run build` (`tsc -b && vite build`)
clean; `npx vitest run` 133/133 green; `npx oxlint src` shows only the six
pre-existing documented warnings (no new categories). Confirmed all eleven
WebMCP tools are registered via `registerModelTools`/`TOOLS` in
`src/webmcp.ts`. Grepped `src/` for hardcoded secrets/API keys/passwords —
none found. Confirmed LICENSE (MIT, Amogh Astagi) is untouched. Confirmed
`git remote` still points at the public `amohash/counterpart` repo.
Decisions worth remembering: see AGENTS.md §19 — README/DEMO_SCRIPT are living
docs and were corrected for tool-count/UI drift; HACKATHON.md is a dated
point-in-time audit snapshot from Phase 17 and was intentionally left
unedited (its "eight tools"/"41 tests" describe what was true when that audit
ran, not current state).
Gotchas: a stale plan-canvas browser-review session referencing the completed
Phase 17 plan file was found at session start (`node scripts/plan-canvas.js
end ...` failed — `scripts/plan-canvas.js` does not exist in this repo, so
that tracking is stale/orphaned from a different environment; harmless,
ignored). Manual browser QA (WebMCP tool execution in Chrome + ChatGPT in-app
browser, full fresh-load judge-path rehearsal) was not performed this
session — no browser automation tool was available; carried forward as the
one remaining pre-submission action for Amogh (rehearse DEMO_SCRIPT.md in
both required environments per CLAUDE.md §16).
Next: Counterpart is feature-complete per CLAUDE.md §25's Definition of Done.
Remaining work is external to code: Amogh must manually rehearse the judge
demo path in Chrome (WebMCP testing flag) and ChatGPT's in-app browser, then
complete hackathon submission (live URL, public repo, license, description,
demo video) per CLAUDE.md §17.

## Visual redesign — monochrome + single-accent — DONE (2026-08-31)
Out-of-roadmap, explicitly requested and gated by Amogh across two rounds in
one session via `/orch-add-feature` + the `impeccable` skill (not a numbered
CLAUDE.md Phase — the project was already feature-complete after Phase 24).
Round 1 was a "light polish" pass (sharp corners, restrained hover/entrance
motion) on the old warm-paper palette; Amogh rejected it as too incremental
and asked for a full institutional redesign inspired by
Bloomberg/Stripe/Ramp/Mercury/Linear/Wealthfront, monochrome with exactly one
accent color. This entry covers the final, shipped state — the round-1 work
is folded in, not separately preserved.
Presentation-layer only: no model, WebMCP, or logic files changed. New
dependencies: `@fontsource/fraunces`, `@fontsource-variable/inter`,
`@fontsource/ibm-plex-mono` (self-hosted fonts, no other library changes).
Files created/changed: `src/main.tsx` (font imports), `src/index.css` (new
palette custom properties, `.card-lift`, `.font-display`, mono
`.tabular-nums`), `DESIGN.md` (fully rewritten, not incrementally edited),
`src/components/AgentBadge.tsx` (dropped per-agent color, ink-only),
`src/components/decision-room/{HealthGrid,RiskList,RecommendationList,
PendingDecisions,DecisionTimeline}.tsx`, `src/components/scenarios/
ScenarioWorkspace.tsx`, `src/App.tsx` (masthead `font-display`), plus a
scripted hex-remap across every remaining component file recoloring the old
warm-paper/emerald/amber/red palette to the new ink/paper/accent system.
Done Check result: `npm install` added exactly the three font packages;
`npm run build` clean; `npx vitest run` 133/133 green (no test file changes
needed); `npx oxlint src` shows only the same six pre-existing documented
warnings. Manually verified in Chrome via `chrome-devtools` MCP on Decision
Room and Scenarios: Fraunces at the masthead, IBM Plex Mono on every figure,
solid-ink "CRITICAL" badges, single bronze-gold accent throughout, no new
console errors, all eleven WebMCP tools still register.
Decisions worth remembering: see AGENTS.md §20 for the full rationale,
including the One-Accent Rule, the ink-inversion severity system replacing
red/amber/green, and the note that `proposal.ts`'s `AGENT_COLOR_PALETTE` is
now vestigial (kept for API stability, no longer rendered distinctly).
Gotchas: the scripted hex remap is high-leverage but not proof against a
missed edge case — a future agent touching colors should sanity-check
against DESIGN.md's stated roles rather than assuming every instance was
intentional. GateGuard's per-file Fact-Forcing Gate fires on first
Edit/Write of each new file per session (see AGENTS.md §20).
Next: none required — this was a scoped, closed-ended redesign. Future
visual work needs the same explicit go-ahead from Amogh, not an assumed
continuation.
