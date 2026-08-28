# Demo script — Counterpart (2m45s)

Word-for-word narration. Timestamps are cues, not hard cuts.
Record in Chrome with `chrome://flags/#enable-webmcp-testing` enabled and the
Model Context Tool Inspector extension open beside the page.

---

## 0:00 — Pitch and canvas

> "This is Counterpart. It's a live financial model that I edit with an AI agent
> — except the agent can't change a single number. It can only ask, and propose."

*Show the full page. Cursor across the assumptions on the left, the 24-month
projection and MRR chart on the right, the ARR, LTV over CAC and runway figures
along the top. Click into churn, type a value, click away — the chart redraws
instantly. That's me editing. Now the agent.*

## 0:20 — The prompt

> "So let's give it something ambiguous on purpose."

*Type into the agent:*

> **"Model this at 15% churn and tell me if we run out of money."**

*Let it call `get_model_state` first. Point at the console — every tool call
logs with a `webmcp` prefix.*

## 0:30 — The agent asks me a question

*A card appears at the top of the page: "Is that 15% monthly or annual?" with
two buttons.*

> "Here's the part that wasn't possible before. The agent hit an ambiguity —
> fifteen percent churn could be monthly or annual, and those are wildly
> different companies — so instead of guessing, it called `ask_human`. That tool
> returns a promise that only resolves when I click. There's no timeout. It is
> sitting there, blocked, waiting for me."

*Click **monthly**.*

> "A web page just made an agent stop and wait for a human. That's the whole
> idea."

## 0:50 — Proposals appear; reject one, accept the rest

*Amber highlights appear on the assumptions, each showing old → new with a
one-line rationale.*

> "It's come back with proposals, not changes. Churn three to fifteen. And it
> wants to raise CAC too, because it reckons the churn implies a worse
> acquisition mix."

*Point at the headline numbers.*

> "Look at the top — ARR, runway, LTV over CAC. Nothing has moved. Pending
> proposals don't touch the math."

*Click reject on the CAC proposal.*

> "I don't buy that one. Rejected."

*Click accept on churn.*

> "This one I do."

*The chart bends down; runway drops.*

> "And now the numbers move. Every change on this page has an author, and it's
> me."

## 1:30 — Scenarios, chart, annotation

> "Now let it work at full width."

*Type:*

> **"Compare 3, 8 and 15 percent churn, chart cumulative cash, and flag the
> risky one."**

*Watch the inspector as the tools fire.*

> "`run_scenario` three times — that computes with temporary overrides and
> returns the headline metrics without touching anything on screen. Then
> `add_chart` drops a cumulative cash chart in below the first one. Then
> `annotate` pins a note next to churn, and `highlight` flashes the row it's
> worried about."

*The highlight flashes for two seconds.*

> "Four tools, one sentence, and the page is still mine."

## 2:10 — The code

*Cut to `src/webmcp.ts`, the `registerTool` call for `get_model_state`.*

> "This is all it takes. `document.modelContext.registerTool` — a name, a
> description, an input schema, and an execute function that reads live React
> state. Seven tools registered on mount. Six of them are read-only. The one
> that writes, `propose_edit`, doesn't apply anything — it queues a request and
> returns 'awaiting approval'."

*Scroll to the `propose_edit` execute body.*

> "The guarantee is in the tool layer, not in a prompt. There is no code path
> where the agent changes a number."

## 2:30 — Close

*Back to the page, question card and proposals visible.*

> "We keep building agents that go off and do things and hand us the result.
> Counterpart is the other shape: it asks when it's unsure, it proposes instead
> of acting, and I stay the one who decides."

> "Agents shouldn't work behind our back. They should work beside us."

*Hold on the page. End.*
