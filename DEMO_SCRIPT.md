# Demo script — Counterpart (2m45s)

Word-for-word narration. Timestamps are cues, not hard cuts.
Record in Chrome with `chrome://flags/#enable-webmcp-testing` enabled and the
Model Context Tool Inspector extension open beside the page, or in ChatGPT's
in-app browser with site tools enabled.

---

## 0:00 — Decision Room and the risk

*Open Counterpart. It loads on the Decision Room with the "SaaS in trouble"
preset active. Point to the four health cards (Runway, ARR, LTV/CAC, Monthly
burn) and the deterministic risk list below them.*

> "This is Counterpart: a live financial model where AI agents can read,
> analyze, and propose changes — but only I can apply one. Right now the model
> is in trouble: runway is critical, and the risk list says so in plain
> language, not just a red number."

## 0:20 — Agent reads the model

*In an agent session, type:*

> **"You are the Risk agent. Read the current model and tell me the biggest
> threat. Use agentName Risk."**

*Let it call `get_model_state`. Point to the `[webmcp]`-prefixed console log.*

> "The agent reads the exact same model I'm looking at through
> `get_model_state` — assumptions, projections, and pending proposals — before
> it says anything."

## 0:40 — Scenario exploration

*Same session, type:*

> **"Run the Cost Control scenario and tell me the effect on runway before
> proposing anything."**

*Let `run_scenario` fire. Switch to the Scenarios tab to show Cost Control's
projected runway/ARR/LTV/CAC/burn beside Current Plan — nothing on the active
plan has moved.*

> "Scenarios are temporary. `run_scenario` computes Cost Control's numbers
> without touching the live plan — I can see the tradeoff before anyone
> commits to it."

## 1:05 — Growth proposes, Risk rebuts

*Switch to a Growth session:*

> **"You are the Growth agent. Propose raising new customers per month to grow
> faster. Use agentName Growth."**

*Growth calls `propose_edit`; an amber proposal card appears in Pending
Decisions with current vs. proposed values and estimated impact on runway,
ARR, LTV/CAC, and burn. Switch back to the Risk session:*

> **"Review Growth's pending proposal and rebut it using the runway risk."**

*Risk calls `rebut_proposal`. Point to the attributed rebuttal thread beneath
Growth's card.*

> "Growth and Risk see the same pending proposal and argue from the same
> numbers. Neither can change the model — only I can."

## 1:40 — Human decision

*Point to the proposal, Growth's rationale, and Risk's rebuttal side by side.*

> "I can weigh both cases against the runway risk I saw a minute ago. Given
> where runway sits, I'm protecting it first."

*Click **Reject** on Growth's proposal. Show the model unchanged and a new
timeline entry recording the rejection.*

> "Rejecting leaves every number exactly where it was — and the decision is
> now part of the record, not lost in a chat transcript."

## 2:05 — Timeline and board brief

*Scroll the Decision Timeline: model read, risk identified, scenario run,
proposal, rebuttal, rejection — each with an actor and a timestamp. Switch to
Reports.*

> "Every meaningful action — human or agent — lands on this timeline. And from
> the same model, Reports generates a board-ready update: snapshot, risks,
> recommended actions, and outlook, ready to copy or download."

## 2:30 — Close

*Return to the Decision Room.*

> "Eleven tools register on `document.modelContext`, but only one of them,
> `propose_edit`, can ever touch the model — and only after I approve it.
> Agents shouldn't work behind our back. They should work beside us."

*Hold on the page. End.*
