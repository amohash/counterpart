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
