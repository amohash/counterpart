# Feature & Prompt Reference — Counterpart

A complete reference for what Counterpart does and every prompt you can give
an AI agent while using it. If `DEMO_GUIDE.md` is "how to drive the demo,"
this file is "the full manual."

---

## 1. What Counterpart is, in one paragraph

Counterpart is a live financial model (MRR, churn, CAC, runway, ARR, LTV/CAC,
burn, cash) that both you and AI agents can see and reason about through
WebMCP. Agents can read the model, run temporary what-if scenarios, propose
changes, and argue with each other — but only a human click can ever change
a real number. Every meaningful action, human or agent, is recorded on a
timeline, and the whole thing can be summarized into a board-ready report.

---

## 2. The financial model — assumptions you can change

These eight values (`assumptions`) drive every projection, chart, and risk
in the app. An agent refers to them by these exact ids.

| id | What it means | Demo default ("SaaS in trouble") |
|---|---|---|
| `startingMRR` | Monthly recurring revenue at month 0 | $50,000 |
| `newCustomersPerMonth` | New customers added each month | 40 |
| `arpu` | Average revenue per user, per month | $250 |
| `monthlyChurnPct` | % of existing customers lost each month | 3% |
| `cac` | Customer acquisition cost (one-time, per new customer) | $1,200 |
| `grossMarginPct` | Gross margin on revenue | 80% |
| `monthlyOpex` | Fixed monthly operating expenses | $180,000 |
| `months` | Forecast horizon length | 24 |

From these, the model computes (per month, and as headline metrics): MRR,
ARR, customers, gross profit, burn, cumulative cash, runway (months until
cash runs out), LTV, and LTV/CAC ratio.

Computed monthly series an agent can chart (`seriesIds` for `add_chart`):
`customers`, `mrr`, `arr`, `grossProfit`, `burn`, `cumulativeCash`.

You can edit any assumption by hand on the **Forecast** tab. An agent can
only ever *propose* an edit — see §5.

---

## 3. Every WebMCP tool an agent can call

These are the actual tools registered on `document.modelContext`. You don't
call these yourself — you ask an agent in plain English, and the agent
decides which tool(s) to call. This section exists so you know what's
possible and can phrase your ask to trigger the right one.

### `get_model_state` — read everything
Returns current assumptions, the full monthly projection, headline metrics
(ARR, LTV, LTV/CAC, runway), and any pending proposals. Read-only, no side
effects. Every other tool's description tells the agent to call this first.

**Prompts that trigger it:**
- "What's our current runway?"
- "Summarize the financial model."
- "Are there any pending proposals right now?"

### `propose_edit` — suggest a change (never applies it)
Creates a pending proposal for one assumption. Nothing on the page changes
until you approve it. Requires a `targetId`, `newValue`, a `rationale`
(non-blank), and an `agentName`. If your instruction is ambiguous (unit,
which assumption, which time period), the agent is instructed to call
`ask_human` first rather than guess.

**Prompts that trigger it:**
- "Propose cutting monthly opex by 20% to protect runway."
- "Suggest raising ARPU to $280 and explain why."
- "You are the Growth agent — propose increasing new customers per month."

### `rebut_proposal` — argue against a pending proposal
Adds a counterargument beneath an existing proposal, attributed to an agent,
without changing the proposal's status. Requires the `proposalId` (format
`proposal-<number>`, from `get_model_state`), an `agentName`, and a
`rationale`.

**Prompts that trigger it:**
- "Rebut that proposal — it ignores the runway risk."
- "You're the Risk agent — respond to Growth's last proposal."

### `ask_human` — stop and ask, don't guess
Shows a question card on the page with 2–6 buttons and waits — indefinitely,
no timeout — for you to click one. The agent is told to use this whenever
your request is ambiguous (e.g. "model 15% churn" — monthly or annual?)
rather than silently pick an interpretation.

**Prompts that trigger it (indirectly — you don't ask for this tool, you
just phrase something ambiguous):**
- "Model 15% churn." (monthly vs. annual is unclear)
- "Increase CAC a bit." ("a bit" is unclear)
- "Change the assumption about spending." (which one?)

### `run_scenario` — temporary what-if, changes nothing
Computes headline metrics (ARR, LTV, LTV/CAC, runway) with temporary
`overrides` on top of current assumptions. Nothing on the page moves. This is
how an agent should explore before proposing.

**Prompts that trigger it:**
- "What happens to runway if we cut opex 20%?"
- "Run three churn scenarios: 3%, 5%, and 8%."
- "Compare the effect of raising CAC vs. raising ARPU."

### `annotate` — pin a note to an assumption row
Pins a short note next to one assumption on the page, visible to you. A
second call on the same `targetId` replaces the note rather than stacking.

**Prompts that trigger it:**
- "Add a note on CAC saying it's trending up this quarter."
- "Annotate monthly opex explaining why it's fixed for now."

### `add_chart` — add a new chart
Adds a new line chart below the existing MRR chart, plotting one or more of
the six monthly series, with a title. Doesn't replace the default chart.

**Prompts that trigger it:**
- "Chart cumulative cash next to burn."
- "Add a chart comparing customers and MRR over time."

### `highlight` — flash rows to draw attention
Flashes one or more assumption rows for two seconds — useful for "here's the
row driving this risk."

**Prompts that trigger it:**
- "Highlight the assumption that's causing the runway problem."
- "Point out CAC and gross margin — they're both weak."

### `list_scenarios` — read the saved scenario library
Lists Current Plan plus any built-in or human-saved scenarios, with runway,
ARR, LTV/CAC, burn, and which one is active. Read-only — activating a
scenario is a human action on the Scenarios tab.

**Prompts that trigger it:**
- "What scenarios do we have saved?"
- "Which scenario is currently active?"

### `generate_board_brief` — produce the board update
Generates a full deterministic Markdown board brief (snapshot, risks,
recommended actions, decisions, outlook) for a scenario — defaults to the
active one. Read-only; never touches the live model.

**Prompts that trigger it:**
- "Generate a board update for the current plan."
- "Write a board brief assuming we went with Cost Control instead."

### `get_decision_log` — read the timeline
Returns up to the last 25 human-agent decision events, most recent first —
proposals, rebuttals, approvals, rejections, scenario activity, board briefs.

**Prompts that trigger it:**
- "What's been decided so far?"
- "Has anyone already proposed a change to CAC?"

---

## 4. The rule: only one path changes the model

Ten of the eleven tools above are read-only or additive-but-non-binding
(notes, charts, highlights, rebuttals). Only `propose_edit` can ever lead to
a real change — and even then, only after you click **Approve** on the
resulting card. This is the whole point of the product: agents can think out
loud on your live data, but they cannot quietly edit it.

---

## 5. Decision Room (the default screen)

What you see when you open the app:

- **Health cards** — Runway, ARR, LTV/CAC, Monthly burn. Each shows a label,
  value, a severity color, and a one-sentence plain-English interpretation
  (not just a number and a color).
- **Risk list** — deterministic rules, not an LLM guess:

  | Condition | Risk |
  |---|---|
  | Runway < 3 months | Critical runway risk |
  | Runway 3–6 months | At-risk runway |
  | LTV/CAC < 3x | Weak unit economics |
  | Monthly churn > 8% | Retention risk |
  | Gross margin < 65% | Margin risk |
  | Monthly opex > ~1.2× gross profit | Operating-cost risk |

- **Recommendations** — for each active risk, a suggested action, a
  rationale, the expected effect, relevant assumptions, a button to try it as
  a scenario, and a button to turn it into a proposal.
- **30-day action plan** — a checklist derived live from current
  recommendations, grouped into four weekly buckets, with local
  (non-persisted-per-item, recomputed-live) completion checkboxes. Disappears
  once there's nothing left to act on.
- **Pending Decisions** — every open proposal, with current vs. proposed
  value, difference, rationale, estimated impact on all four headline
  metrics, the proposing agent's identity, any rebuttals, and Approve /
  Reject / Explore impact buttons.
- **Decision Timeline** — chronological log of every meaningful action
  (model reads, risk detection, scenario runs, proposals, rebuttals,
  approvals/rejections, board briefs, preset loads), each with a timestamp,
  actor, icon, and one-sentence description. Supports free-text **search**
  and an **actor filter** dropdown.

---

## 6. Scenarios tab

Temporary, saved, comparable plans that never silently touch the live model.

**Built-in scenarios** (seeded on first load):
| Scenario | What it changes |
|---|---|
| Current Plan | No overrides — the live model as-is |
| Cost Control | Monthly opex reduced ~20% |
| Retention Recovery | Churn reduced toward a sustainable rate (capped at 8%) |
| Growth Bet | ~25% more new customers/month, CAC allowed to rise ~10% |

Each scenario shows runway, ARR, LTV/CAC, burn, a status (critical / at-risk
/ healthy), and its delta versus Current Plan.

You can: **view**, **activate** (makes it the live plan — recorded on the
timeline), **duplicate**, **save** your own custom scenario, **delete** a
user-created one (built-ins can't be deleted), **reset** back to the seeded
four, and **compare** multiple scenarios side by side, including a runway
comparison bar chart.

---

## 7. Forecast tab

The original calculator, reorganized into three groups:

- **Revenue engine** — Starting MRR, New customers/month, ARPU
- **Retention & unit economics** — Monthly churn, CAC, Gross margin
- **Operating plan** — Monthly opex
- **Forecast horizon** — Months

Below the assumption groups: the full monthly projection table, the MRR
chart, and any agent-added annotations/extra charts.

---

## 8. Reports tab (board brief)

A deterministic, board-ready Markdown document generated from the model
(current or any saved scenario):

- Monthly Financial Update header
- Financial snapshot (ARR, runway, burn, LTV/CAC, active scenario)
- Key risks
- Recommended actions
- Decision requests (pending) and approved decisions
- Outlook

Actions: **Copy**, **Download** (Markdown/plain text), **Regenerate**, and a
selector to switch which scenario the brief reports on.

---

## 9. Demo presets

Three one-click presets that set assumptions, activate a matching scenario,
and log a timeline event:

| Preset | Story |
|---|---|
| **SaaS in trouble** (default) | Aggressive growth spend has outrun revenue; runway is critical |
| **Healthy growth** | Efficient acquisition and strong retention, comfortable runway |
| **Efficiency reset** | A leaner operating plan after deliberate cost discipline |

**Reset demo** returns you to the default preset ("SaaS in trouble") and
clears scenario/proposal state back to seeded defaults.

---

## 10. Multi-agent identity (Growth vs. Risk)

There's no built-in "Growth" or "Risk" bot — you create the identity by
telling your agent which seat to play, via the `agentName` field the tools
require:

> "You are the Growth agent: optimistic, argues for spending, expansion, and
> acquisition. Use the page tools, set agentName to Growth."

> "You are the Risk agent: cautious, argues for runway, efficiency, and
> retention. Use the page tools, set agentName to Risk."

Run two such sessions against the same Counterpart tab/URL and you get real
disagreement grounded in the same live numbers — proposals from one,
rebuttals from the other, both visible to you at once.

---

## 11. Cross-tab sync

Open the same Counterpart URL in two browser tabs. They stay in sync via
`BroadcastChannel` (with `localStorage` `storage` events as a fallback) —
model state, proposals, rebuttal threads, and scenario state all propagate.
Conflict policy is last-write-wins; there's no backend and no database.

---

## 12. A cheat-sheet of prompts by goal

**Just understand the numbers:**
- "What's our runway and why?"
- "Explain LTV/CAC in this model."
- "What's the biggest risk right now?"

**Explore without committing:**
- "What if churn dropped to 2%?"
- "Compare Cost Control and Growth Bet."
- "Chart burn against cumulative cash."

**Get a recommendation acted on:**
- "Propose the change you'd recommend to fix the runway risk."
- "Turn the Cost Control scenario into a proposal."

**Create disagreement:**
- "You are Growth — argue for spending more on acquisition."
- "You are Risk — rebut that proposal."

**Force a clarifying question:**
- "Model 15% churn." (agent should ask: monthly or annual?)

**Wrap up:**
- "What's been decided today?" → `get_decision_log`
- "Write the board update." → `generate_board_brief`

---

## 13. See also

- `DEMO_GUIDE.md` — step-by-step walkthrough for running the demo live.
- `DEMO_SCRIPT.md` — timed narration for a recorded video.
- `README.md` — product pitch, WebMCP rationale, local setup.
- `CLAUDE.md` — full product specification and constraints.
