# Demo Guide — how to run the Counterpart demo

This is the practical, step-by-step guide for *you* (Amogh) to actually run
the demo — in rehearsal, on a call, or for a judge. It's the "how do I drive
this thing" companion to `DEMO_SCRIPT.md` (which is the word-for-word
narration/timestamps for a recorded video).

Use this file when you want to know: what to click, what to type into an
agent, what should happen, and what to do if something doesn't look right.

---

## 1. Before you start

1. **Pick your browser.**
   - **Chrome** with WebMCP testing enabled: go to
     `chrome://flags/#enable-webmcp-testing`, set it to Enabled, relaunch
     Chrome. Open the Model Context Tool Inspector extension so you can see
     tool calls fire in real time.
   - **ChatGPT desktop app's in-app browser**, with site tools enabled for the
     Counterpart tab.
   - These two environments are **not interchangeable** — a tool that works in
     one may behave slightly differently in the other (timing, how the agent
     narrates a call). Test in whichever one you'll actually demo in.
2. **Open the app.** Either `http://localhost:5173` (after `npm run dev`) or
   the deployed URL. It loads on the **Decision Room** with the "SaaS in
   trouble" preset active by default — critical runway, real risks, nothing
   you need to configure.
3. **Optional: reset first.** If a previous session left proposals/scenarios
   in a weird state, use **Reset demo** (top nav) to snap back to a clean
   "SaaS in trouble" starting point.
4. **Open two agent sessions** if you want to show Growth vs. Risk disagreeing
   — e.g. two ChatGPT tabs, or two windows of whatever WebMCP-capable agent
   you're using, both pointed at the *same* Counterpart tab/URL so they share
   state through `BroadcastChannel`.

---

## 2. The core loop, in order

This is the shape of every good demo run. You don't have to do all of it —
pick a subset for your time budget — but do it in this order, because each
step sets up the next one.

### Step 1 — Show the human state first (no agent yet)

Point at the Decision Room without touching an agent:
- **Health cards**: Runway, ARR, LTV/CAC, Monthly burn — each has a plain-
  language interpretation, not just a number.
- **Risk list**: deterministic, rule-based risks (see the "risk rules" table
  in `FEATURES.md`). With the default preset you should see a critical
  runway risk at minimum.
- **Recommendations**: below the risks, one or more grounded suggestions,
  each with a rationale, expected effect, and a button to explore it as a
  scenario or turn it into a proposal.

Say something like: *"This is the financial state before any AI touches it.
The product already tells me what's wrong and what to consider — the agent
adds exploration and negotiation on top of this, not the analysis itself."*

### Step 2 — Have an agent read the model

In an agent session, type something like:

> "You are the Risk agent. Read the current financial model and tell me the
> single biggest threat to the business. Use agentName Risk."

Expected: the agent calls `get_model_state`, then answers referencing your
actual numbers (not made up ones). Point out the `[webmcp]` console log line
if you're in Chrome with the inspector open.

### Step 3 — Explore a scenario (no mutation)

> "Run the Cost Control scenario and tell me what it does to runway before
> proposing anything."

Expected: the agent calls `run_scenario` with `overrides: { monthlyOpex: ... }`
(roughly 20% lower opex) and reports back ARR/LTV/CAC/runway for that
hypothetical — **without the live model changing**. Switch to the
**Scenarios** tab and show Cost Control sitting there with its own numbers,
separate from Current Plan, to prove nothing moved.

### Step 4 — Growth proposes, Risk rebuts

Switch to a "Growth" agent session:

> "You are the Growth agent. Propose raising new customers per month to grow
> faster. Use agentName Growth."

Expected: a new amber card appears under **Pending Decisions** with the old
value, proposed value, difference, rationale, and estimated impact on
runway/ARR/LTV-CAC/burn.

Switch to the Risk session:

> "Review Growth's pending proposal and rebut it, citing the runway risk."

Expected: the agent calls `get_model_state` (to see the pending proposal),
then `rebut_proposal`. A rebuttal thread appears under Growth's card,
attributed to Risk. **The proposal's status does not change** — it's still
pending.

### Step 5 — You decide

This is the moment to narrate: *"Both agents made their case. I'm the only
one who can move a number."*

- Click **Approve** → the model updates, all dependent metrics/charts
  recompute, a success toast appears, and a timeline entry records it.
- Click **Reject** → nothing on the model changes, but the decision is still
  recorded on the timeline.
- Either way, try **Explore impact** first if you want to show the estimated
  effect before deciding.

### Step 6 — Timeline and Reports

Scroll the **Decision Timeline** (bottom of Decision Room, or wherever it's
docked) — you should see, in order: model read, risk identified, scenario
run, proposal created, rebuttal created, your approval/rejection. Each entry
has an actor, an icon, and a plain sentence. Use the actor filter or search
box to show it's a real queryable log, not just a feed.

Switch to **Reports** and either let an agent call `generate_board_brief`, or
click **Regenerate** yourself. Show the structure: financial snapshot, key
risks, recommended actions, decision requests, outlook. Use **Copy** or
**Download** to show it's a real deliverable, not just on-screen text.

---

## 3. Fast versions of the loop

**60-second version** (health check + one decision):
Decision Room risk card → agent `get_model_state` → agent `propose_edit` →
you Approve → point at the updated metric.

**2-3 minute version** (the full judge path):
Steps 1–6 above, roughly matching `DEMO_SCRIPT.md`'s timestamps.

**Multi-agent disagreement only** (if someone specifically wants to see
Growth vs. Risk): Step 4 → Step 5, skip the scenario detour.

---

## 4. Things that make the demo land

- **Narrate what did *not* happen.** The single most important beat in this
  product is "the number didn't move until I clicked." Say it out loud every
  time.
- **Show the console `[webmcp]` logs** in Chrome — it's concrete proof the
  tool calls are real, not narrated fiction by the agent.
- **Use the cross-tab sync.** Open two tabs, approve a proposal in one, point
  at the other tab updating live. That's a "no backend" flex worth showing.
- **If an agent misbehaves** (guesses instead of asking, or tries to phrase
  something as already-applied), that's actually a good moment — it shows why
  `ask_human` and the pending/approved split exist. Don't panic, narrate it.

---

## 5. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| "WebMCP not detected" badge | Browser has no `document.modelContext`, or the flag isn't set | Enable `chrome://flags/#enable-webmcp-testing` and relaunch, or use ChatGPT's in-app browser instead |
| Agent calls a tool but nothing appears on the page | You're looking at a different tab/window than the agent is controlling | Confirm the agent's target tab is the same Counterpart URL you're watching |
| Second tab doesn't update after approving in the first | `BroadcastChannel`/`storage` sync hasn't fired yet, or the second tab was opened before state existed | Wait a second, or reload the second tab once |
| Model looks "normal" instead of "SaaS in trouble" | A previous session left different assumptions active | Click **Reset demo** |
| Agent guesses a unit instead of asking | The instruction wasn't ambiguous enough to trigger `ask_human`, or the agent ignored the tool description | Rephrase your ask to be genuinely ambiguous (e.g. "model 15% churn" without saying monthly/annual) |

---

## 6. See also

- `DEMO_SCRIPT.md` — word-for-word narration and timestamps for a recorded
  video (under 3 minutes).
- `FEATURES.md` — every prompt you can give an agent, every WebMCP tool, and
  every feature of the site explained in depth.
- `README.md` — product pitch, why WebMCP fits, local setup.
- `CLAUDE.md` §19 — the canonical "judge demo path" this guide expands on.
