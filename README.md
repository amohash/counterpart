# Counterpart

A live financial model that a human and an AI agent edit together — where the
agent cannot change anything behind your back.

## Live demo

https://counterpart-sandy.vercel.app

Open it in Chrome with `chrome://flags/#enable-webmcp-testing` enabled, or in
ChatGPT's in-app browser. If the page shows a "WebMCP not detected" badge, the
browser has no WebMCP support — the app still works as a normal financial model.

## Why this fits WebMCP

WebMCP lets a page hand an agent a set of tools that are scoped to *this page*,
running in *this tab*, against *this user's* live state. Counterpart uses that
to invert the usual arrangement: the agent gets rich read access and zero write
access.

Seven tools are registered on `document.modelContext`:

| Tool | What it does |
|---|---|
| `get_model_state` | Reads assumptions, 24-month projections, headline metrics, pending proposals |
| `propose_edit` | Creates a **pending** proposal — does not apply it, does not recompute |
| `ask_human` | Blocks the agent until the human clicks an answer on the page |
| `run_scenario` | Computes with temporary overrides; changes nothing on screen |
| `annotate` | Pins a note next to an assumption |
| `add_chart` | Adds a chart of chosen series below the existing one |
| `highlight` | Flashes elements for two seconds to direct attention |

Only `propose_edit` can ever touch the model, and it only queues a request. The
human is the sole writer. That guarantee lives in the tool layer, not in a
system prompt the agent can talk itself out of.

## How it improves the user experience

Financial modelling with an AI assistant today means copying numbers into a chat
window, reading a wall of prose back, and retyping the result into your
spreadsheet. The model and the conversation live in different places, and you
have to reconcile them by hand.

Counterpart removes the copying. The agent reads the same numbers you are
looking at and writes its suggestions onto the same page — as amber highlights
showing `old → new` with a one-line rationale. You accept or reject with one
click, and the chart redraws. Nothing moves until you say so, so you can leave
five proposals sitting on screen and compare them before committing to any.

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

Combined with proposals, the two sides now have a shared workspace: the agent
proposes and asks, the human decides, and every change has a visible author.

## How WebMCP is implemented

`src/webmcp.ts` registers all seven tools once on mount, guarded by a
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

## Local setup

```bash
git clone https://github.com/amohash/counterpart.git
cd counterpart
npm install
npm run dev     # http://localhost:5173
npm test        # 37 tests
npm run build
```

No backend, no database, no API keys. Static site, state in memory and
localStorage.

## License

MIT — see [LICENSE](./LICENSE).
