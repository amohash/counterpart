# Counterpart

A live financial model where a human arbitrates between opposing AI agents —
and no agent can change a number behind your back.

## Live demo

https://counterpart-sandy.vercel.app

The deployed demo uses Basic Auth. Judges should use the shared username
`counterpart` and the passcode supplied in the submission form.

Open it in Chrome with `chrome://flags/#enable-webmcp-testing` enabled, or in
ChatGPT's in-app browser. If the page shows a "WebMCP not detected" badge, the
browser has no WebMCP support — the app still works as a normal financial model.

## Why this fits WebMCP

WebMCP lets a page hand agents a set of tools scoped to *this page*, running in
*their tabs*, against *this user's* live state. Counterpart uses that to create
a visible debate: a Growth agent can propose an aggressive edit, a Risk agent
can rebut it, and the human sees both arguments before deciding. Agents get
rich read access and zero direct write access.

Eight tools are registered on `document.modelContext`:

| Tool | What it does |
|---|---|
| `get_model_state` | Reads assumptions, 24-month projections, headline metrics, pending proposals |
| `propose_edit` | Creates a **pending** proposal — does not apply it, does not recompute |
| `rebut_proposal` | Adds an attributed counterargument beneath a proposal without changing its status |
| `ask_human` | Blocks the agent until the human clicks an answer on the page |
| `run_scenario` | Computes with temporary overrides; changes nothing on screen |
| `annotate` | Pins a note next to an assumption |
| `add_chart` | Adds a chart of chosen series below the existing one |
| `highlight` | Flashes elements for two seconds to direct attention |

Only `propose_edit` can ever touch the model, and it only queues a request. The
human is the sole writer. That guarantee lives in the tool layer, not in a
system prompt the agent can talk itself out of.

## How it improves the user experience

Financial modelling with AI assistants today means copying numbers into chat
windows, comparing separate walls of prose, and retyping the result into a
spreadsheet. The model, the agents' disagreement, and the decision live in
different places, so you have to reconcile them by hand.

Counterpart puts the debate on the model itself. Growth and Risk read the same
live numbers across synchronized tabs. Each proposal appears as an attributed
`old → new` highlight with a rationale; the other agent can attach an attributed
rebuttal directly beneath it. You accept or reject with one click, and only then
does the chart redraw. Nothing moves while the agents argue.

## What humans and agents can now do together that was impossible before

**The agent can stop and ask.** `ask_human(question, options[])` returns a
Promise that resolves only when you click one of the buttons on the page. There
is no timeout. If you never answer, the agent waits.

That turns an ambiguity from a guess into a question. Say "model 15% churn" and
the agent doesn't quietly pick a reading — a card appears at the top of the page
asking "monthly or annual?", you click "monthly", and the agent continues from
your answer. Before WebMCP, a web app had no way to make an agent block on a
click in its own UI; the agent would assume, be wrong, and you'd find out three
charts later.

Combined with proposals and rebuttals, three parties now share one workspace:
Growth argues for expansion, Risk argues for runway, and the human arbitrates
with both cases visible. Every proposal and counterargument has an author, and
only the human's decision can change the model.

## How WebMCP is implemented

`src/webmcp.ts` registers all eight tools once on mount, guarded by a
module-level flag so React StrictMode's double-mount doesn't throw a duplicate
name error. The tools reach live React state through a module-level actions ref,
so registration happens once and never goes stale.

```ts
document.modelContext.registerTool({
  name: 'get_model_state',
  description:
    'Returns the current financial model: assumptions, computed monthly projections, headline metrics, and any pending proposals. Call this first, before anything else.',
  inputSchema: { type: 'object', properties: {}, additionalProperties: false },
  execute: async () => {
    const snapshot = currentActions?.getSnapshot();
    if (!snapshot) {
      console.error(`${LOG_PREFIX} get_model_state called with no snapshot available`);
      return { content: [{ type: 'text', text: '{"error":"model state unavailable"}' }] };
    }

    const text = compactJson(snapshot);
    console.log(`${LOG_PREFIX} get_model_state -> ${text.length} chars`);
    return { content: [{ type: 'text', text }] };
  },
});
```

Every tool call logs with a `[webmcp]` prefix. `document.modelContext` is
feature-detected — if it is missing the app renders a badge instead of crashing,
and retries detection once a second since some browsers inject the API late.

### Run the Growth and Risk agents together

Open the same Counterpart URL in two tabs. In one ChatGPT session, say:

> You are the Growth agent: optimistic, argues for spending and expansion. Use
> the page tools, set `agentName` to `Growth`, and propose edits that support growth.

In the other ChatGPT session, say:

> You are the Risk agent: cautious, argues for runway and caution. Use the page
> tools, set `agentName` to `Risk`, and rebut risky pending proposals.

The tabs synchronize the model, proposal queue, and rebuttal threads through
`BroadcastChannel`, with localStorage events as a fallback. Both agents can see
the same pending debate, while only the human can accept or reject a proposal.

## Local setup

```bash
git clone https://github.com/amohash/counterpart.git
cd counterpart
npm install
npm run dev     # http://localhost:5173
npm test        # 41 tests
npm run build
```

No backend, no database, no API keys. Static site, state in memory and
localStorage.

## License

MIT — see [LICENSE](./LICENSE).
