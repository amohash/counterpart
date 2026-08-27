# Counterpart — WebMCP Challenge

## RULES FOR CLAUDE CODE — READ FIRST, OBEY ALWAYS

1. **Begin every single message you write to me with `Amogh:`** — no exceptions, including
   short replies and error messages. If you ever forget, I will stop and reset the session.
2. **Do exactly one Phase per session.** When a Phase's Done Check passes, first do
   the Handoff (below), then say `Amogh: Phase N complete. Run /clear and start
   Phase N+1.` Then STOP. Do not continue.
3. **Never add a feature that is not written in this file.** No extra pages, libraries,
   settings, dark mode, mobile layout, animations, or "nice to have" anything.
   If you think something is missing, ask me. Do not build it.
4. **Never read the whole repo.** Only open files named in the current Phase.
5. **If you are unsure or an assumption is required, stop and ask me one question.**
   Do not guess. Guessing is the failure mode I am trying to prevent.
6. Keep your replies under 8 lines. No summaries of what you just did — I watched.
7. Do not re-explain this file back to me.

## HOW SESSIONS REMEMBER EACH OTHER

There is a file `PROGRESS.md` in the repo root. It is the memory between sessions.

**At the START of every session:** read `CLAUDE.md`, then read `PROGRESS.md`. Those
two files tell you everything. Do not read anything else until you know which Phase
you are on.

**At the END of every Phase (the Handoff), before you stop:**

1. Append one block to `PROGRESS.md`, in exactly this shape — keep it under 10 lines:

```
## Phase N — DONE (date)
Files created/changed: <list>
Done Check result: <what I verified>
Decisions worth remembering: <any choice a future session must not contradict>
Gotchas: <anything that broke and how it was fixed>
Next: Phase N+1
```

2. Commit and push. The commit message must be `Phase N: <short description>`.
3. Save the same decisions to ECC memory.

If `PROGRESS.md` does not exist, create it with the heading `# Progress` and nothing
else. Never rewrite or shorten earlier entries — only append.

If `PROGRESS.md` says Phase 5 is done and I ask for Phase 5 again, say so and ask
whether I want it redone.

## WHAT WE ARE BUILDING

One web page: a live financial model that a human and an AI agent edit together.
The agent **cannot change anything directly**. It can only *propose* changes, which
appear as colored pending highlights that I accept or reject. The agent can also
*ask me a question* mid-task via a card on the page.

## HARD CONSTRAINTS

- No backend, no database, no login, no API keys. Static site only.
- Vite + React + TypeScript. Tailwind for styling. Nothing else.
- All state in memory + localStorage.
- Must work in Chrome with `chrome://flags/#enable-webmcp-testing` enabled.
- Deploys to Vercel. MIT LICENSE at repo root.
- I do not write code. Give me copy-paste commands, one line of plain-English
  explanation each.

---

## GIT AND DEPLOYMENT — ALREADY SET UP

The GitHub repo and the Vercel project **already exist**. I created them before you
started. Therefore:

- **Never run `gh repo create`, never create a repository, never install the `gh` CLI.**
  If the remote isn't set, ask me for the URL. Do not invent one.
- A `LICENSE` file (MIT) already exists in the repo. **Do not create, replace, or
  edit it.** If you don't see it locally, you need to pull, not write a new one.
- Vercel auto-deploys on every push to `main`. So pushing = deploying. There is
  nothing to configure and no Vercel CLI to install.
- Push at the end of every Phase as part of the Handoff. Never force-push.

## BROWSER TESTING

I test in two places and they are not the same:

- **Chrome** with `chrome://flags/#enable-webmcp-testing` — normal development.
- **ChatGPT's in-app browser** — what the judges use. I verify here at the end of
  Phase 5 and Phase 8.

Consequences for you:

- Never rely on a browser API that might be missing. Feature-detect
  `document.modelContext` and degrade to a visible badge, never a crash.
- No experimental CSS or JS. Widely-supported syntax only.
- Log tool calls to the console with a clear `[webmcp]` prefix so I can screenshot
  errors for you.
- If I say "it works in Chrome but not the ChatGPT browser," treat it as an
  environment difference, not a logic bug. Ask me for the console output before
  changing any code.

---

## PHASE 1 — Skeleton on the internet

Goal: an ugly page with the title "Counterpart", live at the existing Vercel URL.

- Scaffold in place: `npm create vite@latest . -- --template react-ts`
  (in place — do NOT create a nested `counterpart/` folder).
- Install Tailwind. Delete all Vite boilerplate and demo content.
- `git remote add origin <the URL I give you>`, then pull first (the repo already has
  a LICENSE commit), then commit and push to `main`.
- Add a one-line `README.md`. Do not touch `LICENSE`.
- Create `PROGRESS.md`.

**Done Check:** I open the Vercel URL on my phone and see the word "Counterpart".

---

## PHASE 2 — The math engine

Goal: correct numbers, no UI yet.

File: `src/model.ts`

Assumptions (with these defaults):
startingMRR 50000, newCustomersPerMonth 40, arpu 250, monthlyChurnPct 3,
cac 1200, grossMarginPct 80, monthlyOpex 180000, months 24.

Computed per month: customers, MRR, ARR, grossProfit, burn, cumulativeCash.
Plus overall: ltv, ltvOverCac, runwayMonths.

- Pure functions only. No React, no DOM in this file.
- Export `computeModel(assumptions)` and `computeModel(assumptions, overrides)`.
- Write `src/model.test.ts` with 5 tests, including: zero churn grows,
  100% churn collapses, runway is finite when burning.

**Done Check:** `npm test` passes, 5 green.

---

## PHASE 3 — The canvas (human side only)

Goal: I can use the app alone, with no agent.

- Left: assumptions panel, one editable number input per assumption.
- Right: projection table (24 rows) + one line chart of MRR (Recharts).
- Top: the headline numbers — ARR, LTV/CAC, runway.
- Editing an assumption recomputes instantly. State persists in localStorage.
- "Reset model" button.

**Done Check:** I change churn from 3 to 15, the chart bends down, I reload the
page and my change is still there.

---

## PHASE 4 — The proposal system

Goal: the trust mechanic. Still no agent.

- Add a `proposals` array to state: `{id, targetId, newValue, rationale, status}`.
- A pending proposal renders as an amber highlight on that assumption, showing
  old → new and the rationale.
- Accept applies it and recomputes. Reject discards it. "Accept all" button.
- Pending proposals do NOT affect the numbers until accepted.
- Add a temporary dev button "Fake a proposal" so I can test this by hand.

**Done Check:** I click "Fake a proposal", see amber highlight, numbers unchanged;
I click Accept, numbers change.

---

## PHASE 5 — First WebMCP tool

Goal: prove the agent can see us. **This is the riskiest Phase. Only one tool.**

File: `src/webmcp.ts`, called once on mount.

```ts
document.modelContext.registerTool({
  name: "get_model_state",
  description: "Returns the current financial model: assumptions, computed monthly projections, headline metrics, and any pending proposals. Call this first, before anything else.",
  inputSchema: { type: "object", properties: {}, additionalProperties: false },
  execute: async () => ({ content: [{ type: "text", text: compactJson() }] })
});
```

- Guard for `document.modelContext` being undefined (older browsers) — show a
  small "WebMCP not detected" badge instead of crashing.
- Return compact JSON. Round to whole numbers. Keep it under ~1500 characters.

**Done Check (two parts, both required):**
1. In Chrome with the WebMCP flag on, I ask the agent "what's our runway?" and it
   answers correctly.
2. I open the Vercel URL in **ChatGPT's in-app browser** and the same question works.
   Do not mark this Phase done until part 2 passes. This is the earliest point a
   browser difference can surface and I want to find it now, not on submission day.

---

## PHASE 6 — propose_edit

```
propose_edit(targetId, newValue, rationale) -> proposalId
```

- Creates a PENDING proposal. Must not apply it. Must not recompute.
- Returns text like: `Proposed monthlyChurnPct 3 -> 15. Awaiting Amogh's approval.`
- Reject the call with a clear error if `targetId` is not a real assumption.
- Remove the "Fake a proposal" dev button.

**Done Check:** I say "raise churn to 15%", amber highlight appears, numbers do
not move until I click Accept.

---

## PHASE 7 — ask_human (the centerpiece)

```
ask_human(question, options[]) -> the option I chose
```

- `execute` returns a Promise that resolves only when I click an option.
- Renders a distinct card at the top of the page with the question and buttons.
- No timeout. If I never click, it waits.
- Only one question card at a time; queue any others.

**Done Check:** I say "model 15% churn"; the agent asks "monthly or annual churn?";
I click "monthly"; the agent continues and proposes the edit.

---

## PHASE 8 — Remaining tools

Add in this order, one at a time:

- `run_scenario(overrides)` — computes with temporary overrides, returns headline
  metrics, changes nothing on screen.
- `annotate(targetId, text)` — pins a small note next to a row.
- `add_chart(seriesIds, title)` — adds a chart below the existing one.
- `highlight(targetIds)` — flashes those elements for 2 seconds.

**Done Check:** I say "compare 3%, 8% and 15% churn, then chart cumulative cash
and flag the risky one" and all four tools fire — **in Chrome AND in ChatGPT's
in-app browser.** Both, before this Phase is done.

---

## PHASE 9 — Polish

- Smooth fade-in for proposals and the question card.
- Empty state text explaining what to try, with 3 example prompts.
- Clean spacing, readable numbers with thousands separators.
- Nothing new. Polish only.

**Done Check:** It looks like a product, not a prototype.

---

## PHASE 10 — Submission package

Write `README.md` with exactly these headings:

- Live demo (URL)
- Why this fits WebMCP
- How it improves the user experience
- What humans and agents can now do together that was impossible before
- How WebMCP is implemented (paste the registerTool snippet)
- Local setup
- License

Then write `DEMO_SCRIPT.md` — a word-for-word narration for a 2m45s video:

- 0:00 one-sentence pitch, show the canvas
- 0:20 prompt: "Model this at 15% churn and tell me if we run out of money"
- 0:30 the agent asks me a question; I answer — narrate why this is new
- 0:50 proposals appear; reject one, accept the rest; numbers move
- 1:30 scenarios, chart, annotation
- 2:10 show the registerTool code
- 2:30 closing line: agents shouldn't work behind our back, they should work beside us

**Done Check:** Both files exist and the README has all seven headings.
