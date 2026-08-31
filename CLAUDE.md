# Counterpart — WebMCP Challenge

## RULES FOR CLAUDE CODE — READ FIRST, OBEY ALWAYS

1. **Begin every single message you write to me with `Amogh:`** — no exceptions.
   If you forget, Amogh will `/clear` and restart the phase.
2. **Do exactly one Phase per session.** When a Phase's Done Check passes, do the
   Handoff (below), say `Amogh: Phase N complete. Run /clear and start Phase N+1.`
   Then STOP.
3. **Never add anything not written in the current Phase.** No extra pages,
   libraries, animations, or "nice to have" anything. Ask, don't guess.
4. **Never read the whole repo.** Only open files named in the current Phase.
5. If unsure or an assumption is required, stop and ask one question.
6. Keep replies under 8 lines. No recap of what you just did.
7. Never create a GitHub repo, run `gh repo create`, or touch the `LICENSE` file —
   they already exist. Never run ECC's `install.sh` on top of the plugin install.

## HOW SESSIONS REMEMBER EACH OTHER

`PROGRESS.md` is the memory between sessions. At the **start** of every session, read
`CLAUDE.md` then `PROGRESS.md` before anything else. At the **end** of every Phase
(the Handoff), append one block (≤10 lines) to `PROGRESS.md`:

```
## Phase N — DONE (date)
Files created/changed: <list>
Done Check result: <what was verified>
Decisions worth remembering: <anything a future session must not contradict>
Gotchas: <anything that broke and how it was fixed>
Next: Phase N+1
```

Then commit as `Phase N: <short description>` and push. Save the same decisions to
ECC memory. Never rewrite earlier entries — only append.

## WHAT WE ARE BUILDING

**Counterpart.** A shared financial-model canvas where a human and AI agents edit
the same live model together. Agents cannot change anything directly — they
*propose*, tagged by which agent made the proposal, and the human accepts or
rejects. Agents can pause and ask the human a question via a card on the page.
As of Phase 11, there are **two agents with opposing incentives** — a Growth
agent and a Risk agent — who can see and rebut each other's proposals, and the
human is the sole arbiter between them.

## HARD CONSTRAINTS

- No traditional backend, no database, no user accounts. Static site + Vercel only.
- Vite + React + TypeScript + Tailwind. Recharts for charts.
  Also allowed, added in Phase 14: `framer-motion` (motion), `lucide-react`
  (icons), `shadcn/ui` (component primitives only — restyle everything per the
  Visual Direction below, do not ship shadcn's default look). Nothing beyond
  this list without asking.
- Model state in memory + localStorage. Cross-tab sync (Phase 12+) via
  `BroadcastChannel` + `storage` events only — same-origin, no server, no keys.
- Must work in Chrome with `chrome://flags/#enable-webmcp-testing`, and in
  ChatGPT's desktop in-app browser on a model with site tools enabled.
- MIT LICENSE at repo root, detectable in the GitHub About panel.
- Amogh does not write code. Give copy-paste commands with one-line explanations.

## BROWSER TESTING

Two environments, not interchangeable:
- **Chrome** (flag enabled) — normal development and debugging.
- **ChatGPT desktop in-app browser**, on a model with site tools enabled — what
  judges use. Verify here at the end of Phase 5, Phase 8, and Phase 13.
Feature-detect `document.modelContext`; degrade to a visible badge, never a crash.
Log every tool call to the console with a `[webmcp]` prefix.

---

## PHASES 1–10 — STATUS: DONE

Skeleton + deploy, model math engine, human-only canvas, propose/reject system,
first WebMCP tool (`get_model_state`), `propose_edit`, `ask_human`, remaining
tools (`run_scenario`, `annotate`, `add_chart`, `highlight`), polish, and the
submission package (README + demo script). See `PROGRESS.md` for exact detail
and decisions already made — do not redo or contradict them.

---

## PHASE 11 — Agent identity on proposals

Goal: every proposal is tagged with which agent made it. No new agents yet —
just the data model and UI for it.

- Add `agentId: string` and `agentColor: string` to the proposal type.
- `propose_edit` gains a required `agentName` input (e.g. "Growth", "Risk").
  First time a name is seen, assign it a color from a small fixed palette.
- Proposal cards show a colored name badge.
- Update `PROGRESS.md`'s Phase 6 note: `propose_edit`'s schema changed here.

**Done Check:** Two fake proposals from `propose_edit` with different
`agentName` values render with two different colored badges.

## PHASE 12 — Cross-tab sync (no backend)

Goal: two browser tabs on the same machine, same URL, show the same live model
and proposal queue, instantly, with no server.

- Use `BroadcastChannel("counterpart")` to broadcast model + proposal state
  changes; every tab listens and merges.
- Fall back to the `storage` event on `localStorage` if `BroadcastChannel` is
  unsupported.
- Last-write-wins is fine. Do not build conflict resolution.

**Done Check:** Open the localhost URL in two tabs side by side. Accept a
proposal in tab A. It appears accepted in tab B within one second, with no
reload.

## PHASE 13 — Two agent seats + rebuttals

Goal: a Growth agent and a Risk agent, each in its own tab, can propose,
see each other's pending proposals, and rebut.

- Document (in `README.md`, not code) how to open two tabs: same URL in each,
  and in each ChatGPT session tell the agent its persona — e.g. "You are the
  Growth agent: optimistic, argues for spending and expansion" / "You are the
  Risk agent: cautious, argues for runway and caution."
- Add tool `rebut_proposal({proposalId, agentName, rationale})` — attaches a
  threaded counter-note under the target proposal. Does not change its status.
- Proposal card shows the rebuttal thread beneath it, if any.

**Done Check:** In Chrome AND ChatGPT's in-app browser: Growth proposes raising
opex, Risk rebuts citing runway, both show on the same card, Amogh accepts or
rejects with both arguments visible.

## PHASE 14 — Real design pass (using Impeccable)

Goal: it looks like a shipped product, not default-Tailwind AI slop. No new
mechanics — visual and motion only.

- Confirm the Impeccable plugin is installed (Amogh does this once, see
  STEPS_FOR_AMOGH). If `/impeccable` is not available, stop and ask Amogh.
- Run `/impeccable init` if this is the first use in this repo — it will
  scan the codebase and write `PRODUCT.md` / `DESIGN.md`.
- For `PRODUCT.md`, when it asks: users are the one human using this page
  plus AI agents calling its tools; mode is "Operate" (a working tool, not a
  landing page); brand voice is calm and precise, like a financial terminal,
  not hype; anti-references are purple gradients, glassmorphism, generic
  SaaS-dashboard look, italic serif headers.
- Run `/impeccable polish` on the whole app. Then `/impeccable audit` and fix
  whatever it flags.
- Install `framer-motion` and `lucide-react` only if Impeccable's own pass
  calls for them — let the tool decide, don't add libraries preemptively.
- Agent badges (Growth/Risk) get real visual identity, not just a color chip.
  Headline metrics get a proper compact header. Smooth transitions on
  proposals, rebuttals, and the question card.
- Nothing here changes behavior — visual and motion only.

**Done Check:** `/impeccable audit` reports zero findings (or Amogh has
consciously accepted whatever remains). Amogh compares it to the Phase 9
screenshot and agrees it's a clear step up, with no functional regressions
in the Phase 13 Done Check.

## PHASE 15 — Optional: passcode gate

Goal: a single shared passcode protects the deployed URL, so Amogh can supply
credentials on the Submission Form if he chooses. This is NOT user accounts.

- Vercel Edge Middleware (`middleware.ts`) checks a single hardcoded/env-var
  passcode via a simple form or Basic Auth. One shared credential, no signup,
  no database, no per-user anything.
- Store the passcode in a Vercel environment variable, not committed to git.
- Must be trivially removable — this is optional per the rules ("you may
  authenticate if you wish"); do not let it block judges who don't have it.
  If Amogh decides against it later, this Phase's middleware file can be
  deleted with no effect on anything else.

**Done Check:** Visiting the URL without the passcode is blocked; with it,
the app loads normally; the passcode is not visible in the GitHub repo.

## PHASE 16 — Resubmission package update

Goal: README and demo script reflect the multi-agent version.

- Update README's four required sections to describe two opposing agents and
  rebuttals, not just one agent.
- Update `DEMO_SCRIPT.md`: new centerpiece is Growth and Risk disagreeing on
  screen and Amogh arbitrating. Still under 2m45s.
- If Phase 15 was kept, add the passcode note for judges to the README.

**Done Check:** README has all seven headings from Phase 10, updated for two
agents; `DEMO_SCRIPT.md` still fits under 3 minutes read aloud.
