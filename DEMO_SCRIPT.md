# Demo script — Counterpart (2m40s)

Word-for-word narration. Timestamps are cues, not hard cuts.
Record in Chrome with `chrome://flags/#enable-webmcp-testing` enabled and the
Model Context Tool Inspector extension open beside the page.

---

## 0:00 — Pitch and canvas

> "This is Counterpart: a live financial model where two AI agents disagree in
> public, and I make the decision. Neither agent can change a single number."

*Show the full page. Cursor across the assumptions on the left, the 24-month
projection, MRR chart, and headline metrics. Keep two agent sessions beside it:
Growth and Risk, both on the same URL.*

## 0:18 — Growth proposes

*In the Growth session, type:*

> **"You are the Growth agent. Review the model and propose raising monthly
> operating expenses to accelerate expansion. Use agentName Growth."**

*Let it call `get_model_state`, then `propose_edit`. A Growth-tagged amber card
appears showing the old and proposed values.*

> "Growth reads the live model through WebMCP and makes its case on the canvas.
> This is a proposal, not a mutation: ARR, runway, and the chart have not moved."

## 0:48 — Risk rebuts

*Switch to the Risk session. Type:*

> **"You are the Risk agent. Review Growth's pending proposal, assess runway,
> and rebut it on the proposal card. Use agentName Risk."**

*Risk calls `get_model_state`, sees Growth's proposal, and calls
`rebut_proposal`. Point to the Risk-tagged counterargument beneath Growth's
case.*

> "Risk sees the exact same pending proposal in its synchronized tab and argues
> against it without changing its status. The disagreement is attached to the
> decision, not buried in two chat transcripts."

## 1:18 — Human arbitration

*Point to Growth's rationale, Risk's rebuttal, and the unchanged runway metric.*

> "Both agents have incentives and identities. Neither gets the final word. I
> can compare the upside with the runway warning while the original model stays
> untouched."

*Click **Accept** on Growth's proposal. The assumption, projection, chart, and
runway update in both tabs.*

> "I accept it. Only now does the model move, and both agents see my decision
> within a second. If Risk had convinced me, Reject would have preserved the
> original model. The human is the sole writer and arbiter."

## 1:48 — Ask, analyze, and explain

*In either agent session, type:*

> **"Compare three runway scenarios, chart cumulative cash, and flag the risky
> one. Ask me if any assumption is ambiguous."**

*Let `run_scenario`, `add_chart`, `annotate`, and `highlight` fire. If the agent
asks a question, answer its card on the page.*

> "The agents can calculate temporary scenarios, add a chart, annotate the
> model, highlight risk, or pause on an on-page question. Those tools enrich the
> shared workspace; none bypass approval. Every call logs with a `webmcp`
> prefix."

## 2:15 — The code and close

*Cut to `src/webmcp.ts`, then scroll from `get_model_state` to `propose_edit`
and `rebut_proposal`.*

> "Eight tools register on `document.modelContext`. `propose_edit` queues a
> request. `rebut_proposal` attaches an argument. The guarantee lives in the
> tool layer: neither path can mutate an assumption."

*Return to the accepted proposal with both agent identities visible.*

> "Agents shouldn't work behind our back. They should work beside us."

*Hold on the page. End.*
