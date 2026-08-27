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
