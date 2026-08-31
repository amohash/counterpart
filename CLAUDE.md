# Counterpart — WebMCP Challenge
# MASTER INSTRUCTIONS FOR CLAUDE CODE

## 0. READ THIS FIRST — SESSION PROTOCOL

These instructions govern all Claude Code work on Counterpart.

### Mandatory session behavior

1. Begin every message to the user with `Amogh:`.
2. Work on exactly **one Phase per session**.
3. At the beginning of every session, read:
   - `CLAUDE.md`
   - `AGENTS.md`
   - `PROGRESS.md`
   before making changes.
4. After the current Phase passes its Done Check:
   - update `PROGRESS.md`;
   - update `AGENTS.md` with any durable implementation decisions, constraints, gotchas, or workflow changes learned in the Phase;
   - run the required tests/checks;
   - commit the Phase with `Phase N: <short description>`;
   - push the commit if git credentials/remotes are already configured;
   - report completion;
   - STOP.
5. Do not begin the next Phase in the same session.
6. End with:
   `Amogh: Phase N complete. Run /clear and start Phase N+1.`
7. Keep user-facing replies concise. Do not recap large amounts of work.
8. If a required decision is genuinely ambiguous, stop and ask one focused question. Do not invent product requirements.
9. Never create a GitHub repository, run `gh repo create`, or replace an existing `LICENSE`.
10. Amogh does not write code. Give copy-paste commands when a manual action is required, with a one-line explanation.

### Scope rule

Do not implement anything outside the current Phase unless it is required to make the current Phase function or to fix a regression caused by the current Phase.

Do not add:
- extra pages;
- extra libraries;
- extra tools;
- speculative features;
- unrelated refactors;
- unnecessary animations;
- backend infrastructure;
- "nice to have" functionality.

If something is useful but belongs to a later Phase, record it in `PROGRESS.md` or `AGENTS.md` and wait.

---

# 1. PROJECT MISSION

Counterpart is a WebMCP-powered financial decision room for founders and operators.

It is not an autonomous finance bot.

Counterpart gives AI agents meaningful access to a live financial model so an agent can:
1. read the current model;
2. identify financial risks;
3. explore temporary scenarios;
4. compare tradeoffs;
5. recommend actions;
6. propose meaningful model changes;
7. ask the human for clarification when necessary;
8. let the human approve or reject consequential changes;
9. record the human-agent decision process;
10. produce a concise board-ready update.

The human remains the final decision-maker.

The central product idea is:

**Agents can reason about and operate on the same financial model as the human, but consequential model changes require human approval.**

This human-agent collaboration is the core reason Counterpart uses WebMCP.

---

# 2. HACKATHON ALIGNMENT

The OpenAI WebMCP Challenge requires a WebMCP-powered web app that explores humans and agents interacting, collaborating, and creating together.

The four judging criteria are equally weighted:
1. WebMCP Leverage
2. Execution
3. Potential Impact
4. Creativity & Ambition

Optimize the product for all four.

### WebMCP Leverage

WebMCP must be central to the product, not a superficial add-on.

A judge should be able to see a meaningful flow such as:

Agent reads model
→ agent identifies risk
→ agent runs a scenario
→ agent recommends an action
→ agent proposes a change
→ human reviews
→ human approves/rejects
→ model updates
→ timeline records the decision.

### Execution

The project must feel complete and reliable rather than like a technical proof of concept.

### Potential Impact

Counterpart should clearly solve a real problem:
founders need to make financial decisions under uncertainty and understand tradeoffs without surrendering control to automation.

### Creativity & Ambition

The product should feel like a new interaction model for financial planning:
a shared decision room where multiple agents can reason from the same live model and disagree, while a human remains the arbiter.

---

# 3. EXISTING REPOSITORY — PRESERVE IT

Counterpart already exists and has completed Phases 1–16.

Do not rebuild it from scratch.

Before modifying anything:
1. inspect the files relevant to the current Phase;
2. understand the existing implementation;
3. preserve existing calculations;
4. preserve existing WebMCP tools;
5. preserve existing behavior unless the current Phase explicitly changes it;
6. run the appropriate tests/build before and after changes.

Do not rewrite the financial engine merely to make the UI work.

Do not remove existing capabilities because they are not mentioned in a later Phase.

---

# 4. CURRENT PROJECT STATE

Phases 1–16 are complete. Their historical details are in `PROGRESS.md`.

Important existing capabilities include:

### Financial model
- Starting MRR
- New customers per month
- ARPU
- Monthly churn percentage
- CAC
- Gross margin percentage
- Monthly operating expenses
- Forecast duration
- ARR
- LTV
- LTV/CAC
- runway
- monthly MRR
- burn
- cumulative cash
- projections
- charts

### Existing WebMCP tools

Preserve all existing tools:

- `get_model_state`
- `propose_edit`
- `ask_human`
- `run_scenario`
- `annotate`
- `add_chart`
- `highlight`
- `rebut_proposal`

Do not rename or remove existing tools unless a future Phase explicitly requires it.

### Existing agent model

There are two opposing agent identities:
- Growth
- Risk

They can:
- see the same model;
- make proposals;
- see each other's proposals;
- rebut proposals;
- leave the final decision to the human.

### Existing synchronization

Cross-tab synchronization uses:
- `BroadcastChannel("counterpart")`
- `storage` events as fallback
- last-write-wins

No backend is used.

### Existing visual direction

The product direction is "Analyst's Workbench":
- warm paper;
- workbench ink;
- emerald human actions;
- amber review states;
- calm and precise;
- financial-terminal influence;
- no generic AI dashboard aesthetic.

`PRODUCT.md` and `DESIGN.md` contain the detailed design decisions.

### Existing deployment

A Vercel deployment exists.

The project has previously been verified in:
- Chrome with WebMCP testing enabled;
- ChatGPT's desktop in-app browser.

### Existing submission materials

- `README.md`
- `DEMO_SCRIPT.md`
- `LICENSE`

Do not replace the existing LICENSE.

---

# 5. HARD TECHNICAL CONSTRAINTS

- No traditional backend.
- No database.
- No user accounts.
- Static/client application + Vercel.
- Vite + React + TypeScript + Tailwind.
- Recharts for charts.
- `framer-motion` and `lucide-react` are already allowed/installed from the design Phase.
- `shadcn/ui` is allowed only as component primitives and must be restyled to match Counterpart.
- Do not add other libraries without asking.
- Model state remains client-side.
- Persistence uses localStorage where specified.
- Cross-tab synchronization uses BroadcastChannel + storage events only.
- No server-side financial state.
- No external LLM API is required for core financial reasoning.
- Do not expose secrets in client-side code.
- WebMCP must degrade gracefully if `document.modelContext` is unavailable.
- Never crash because WebMCP is unavailable.
- Log WebMCP calls with a `[webmcp]` prefix where existing implementation expects logging.
- Preserve the existing MIT LICENSE.

---

# 6. WEBMCP IMPLEMENTATION RULES

Use the standard WebMCP registration mechanism:

`document.modelContext.registerTool(...)`

Every WebMCP tool must have:
- a clear and specific name;
- a useful description;
- a valid input schema;
- predictable structured output;
- validation;
- safe error behavior;
- clearly defined side effects.

Do not create fake tools whose only purpose is to simulate WebMCP.

The tool must perform a meaningful product operation.

### Human control

The following rules are mandatory:

- Read current state before recommendations.
- Use `run_scenario` before making model-change recommendations when scenario exploration is relevant.
- Use `ask_human` when instructions or choices are genuinely ambiguous.
- Use `propose_edit` for meaningful model changes.
- Never silently mutate the financial model from an agent action.
- Approval must remain human-controlled.
- Rejection leaves the model unchanged.
- Approved changes update all dependent metrics/charts.
- Meaningful agent actions should appear in the decision history/timeline.

### Tool safety

Agent inputs must be validated.

Reject:
- unknown model targets;
- invalid numeric values;
- non-finite values;
- malformed proposal IDs;
- blank rationales;
- invalid scenario identifiers;
- malformed inputs.

Do not weaken validation to make demos pass.

---

# 7. PRODUCT EXPERIENCE

The default experience should immediately communicate:

**Counterpart is an AI financial decision partner. You make the call.**

The primary narrative should be understandable within 30 seconds.

The core experience should make these concepts obvious:
- current financial health;
- major risks;
- scenarios;
- recommendations;
- proposals;
- human approval;
- agent disagreement;
- decision history;
- board communication.

---

# 8. DECISION ROOM

The Decision Room is the default product surface.

It should include:

### Header
- current page title;
- concise subtitle;
- model status;
- active scenario status where applicable.

### Financial health
Show:
- Runway
- ARR
- LTV/CAC
- Monthly burn

Each must include:
- label;
- value;
- severity/state;
- one-sentence interpretation;
- text status in addition to color.

### Deterministic risks

Use deterministic rules for core financial risk detection.

Rules:
- runway < 3 months: Critical runway risk;
- runway 3–6 months: At-risk runway;
- LTV/CAC < 3x: weak unit economics;
- monthly churn > 8%: retention risk;
- gross margin < 65%: margin risk;
- monthly opex significantly exceeds gross profit: operating-cost risk.

Do not replace these core rules with external LLM calls.

### Recommendations

Recommendations should explain:
- action;
- rationale;
- expected effect;
- relevant assumptions;
- scenario to test;
- proposal option.

The default high-risk narrative is:

**Protect runway before investing in growth.**

---

# 9. SCENARIOS

Scenarios are temporary explorations and must not silently change the active model.

Persist scenarios with localStorage.

Seed:
- Current Plan
- Cost Control
- Retention Recovery
- Growth Bet

Scenario records should include:
- ID;
- name;
- description;
- assumption overrides;
- runway;
- ARR;
- LTV/CAC;
- monthly burn;
- status;
- creation/update time.

Current scenario definitions:
- Current Plan: no overrides.
- Cost Control: approximately 20% lower monthly opex.
- Retention Recovery: churn reduced to a more sustainable level such as 8%.
- Growth Bet: higher new customers per month and, if useful, slightly higher CAC.

The Scenarios experience should support:
- view;
- activate;
- duplicate;
- save;
- delete user-created scenarios;
- reset scenarios;
- compare scenarios.

---

# 10. PROPOSALS

A proposal is not an applied model change.

Proposal cards should show:
- assumption name;
- current value;
- proposed value;
- difference;
- rationale;
- estimated impact on runway;
- estimated impact on ARR;
- estimated impact on LTV/CAC;
- estimated impact on burn;
- agent identity;
- rebuttal thread when applicable.

Actions:
- Approve
- Reject
- Explore impact

Approval:
- applies through existing model behavior;
- updates dependent metrics/charts;
- records a timeline event;
- shows success feedback;
- marks proposal approved.

Rejection:
- leaves the model unchanged;
- records a timeline event;
- marks proposal rejected;
- offers alternatives/exploration where appropriate.

---

# 11. MULTI-AGENT EXPERIENCE

Growth and Risk are opposing seats.

Growth is optimistic and can argue for:
- spending;
- expansion;
- acquisition;
- growth investment.

Risk is cautious and can argue for:
- runway;
- efficiency;
- retention;
- reducing downside.

Agents can rebut each other.

A rebuttal:
- references a proposal;
- identifies the responding agent;
- includes rationale;
- does not change proposal status;
- renders as a thread beneath the proposal.

The human is the sole arbiter.

The disagreement should be useful, not theatrical.

---

# 12. DECISION TIMELINE

Maintain a human-agent timeline.

Persist it using localStorage where the relevant implementation requires persistence.

Events may include:
- model read;
- risk identified;
- scenario opened;
- proposal created;
- rebuttal created;
- human approval;
- human rejection;
- board brief generated;
- preset loaded.

Each event should have:
- timestamp;
- actor;
- icon;
- concise sentence;
- optional detail.

The timeline exists to make collaboration understandable at a glance.

---

# 13. FORECAST

The Forecast surface contains the existing calculator.

Group assumptions:
- Revenue engine:
  - Starting MRR
  - New customers per month
  - ARPU
- Retention and unit economics:
  - Monthly churn
  - CAC
  - Gross margin
- Operating plan:
  - Monthly opex
- Forecast horizon:
  - Months

Preserve:
- existing financial calculations;
- projection table;
- charts;
- annotation functionality;
- custom-chart functionality.

---

# 14. BOARD BRIEF

The Reports surface should generate a deterministic board-ready update.

Structure:
- Monthly Financial Update
- Financial snapshot
- Key risks
- Recommended actions
- Decision requests
- Outlook

Include:
- ARR;
- runway;
- monthly burn;
- LTV/CAC;
- active scenario;
- largest risks;
- recommendations;
- approved decisions;
- pending decisions;
- realistic scenario-based outlook.

Actions:
- copy;
- download as Markdown/plain text;
- regenerate;
- switch Current Plan/active scenario.

No PDF generation unless explicitly requested later.

---

# 15. DEMO PRESETS

Presets:
- SaaS in trouble
- Healthy growth
- Efficiency reset

Each preset:
- updates model values;
- activates a relevant scenario;
- records a timeline event;
- updates the Decision Room immediately;
- clearly identifies the active preset.

Default:
**SaaS in trouble**

It should provide the strongest narrative for demonstrating why Counterpart exists.

---

# 16. TESTING REQUIREMENTS

For every meaningful implementation:
1. run the relevant unit tests;
2. run TypeScript/build checks;
3. inspect console errors;
4. manually test the affected UI;
5. manually test the relevant WebMCP tool;
6. verify state synchronization if affected;
7. verify no regression to existing functionality.

Before declaring P0-equivalent work complete:
- all existing WebMCP tools work;
- navigation works;
- scenario activation/comparison works;
- proposal approval/rejection works;
- reset works;
- board brief works;
- fresh-load demo works;
- responsive layout is usable;
- no blocking console errors remain.

For WebMCP-specific phases, test in:
1. Chrome with WebMCP testing enabled;
2. ChatGPT desktop in-app browser with site tools enabled.

These environments are not interchangeable.

---

# 17. HACKATHON COMPLIANCE

The application must be prepared for a submission that includes:
- working live URL;
- public source repository;
- open-source license;
- setup instructions;
- WebMCP implementation;
- submission description;
- demonstration video under three minutes.

If Counterpart existed before the Hackathon Submission Period, do not falsely represent old work as hackathon-created.

Maintain timestamped git history for hackathon work.

Maintain documentation distinguishing:
- pre-existing work;
- new WebMCP work;
- meaningful extensions made during the submission period.

Do not expose secrets.

Do not add unauthorized copyrighted assets or music.

Do not alter the existing LICENSE unless explicitly required by the repository owner.

---

# 18. README / SUBMISSION DOCUMENTATION

The README should explain:
1. what Counterpart is;
2. why WebMCP is a strong fit;
3. how WebMCP improves the user experience;
4. what people and agents can accomplish together;
5. how WebMCP is implemented;
6. available tools;
7. human approval/safety model;
8. how to run locally;
9. how judges can test it;
10. how the two-agent Growth/Risk demo works.

Do not claim capabilities that the application does not actually implement.

---

# 19. JUDGE DEMO PATH

The finished product must support this flow:

1. Open Counterpart.
2. See the SaaS-in-trouble financial state.
3. Understand the primary financial risk.
4. Agent calls `get_model_state`.
5. Agent explores Cost Control with `run_scenario`.
6. Scenario results appear without changing the current plan.
7. Agent recommends protecting runway.
8. Agent creates a `propose_edit`.
9. Human sees current vs proposed values and expected impact.
10. Risk/Growth disagreement can be demonstrated where relevant.
11. Human approves or rejects.
12. Model changes only after approval.
13. Metrics/charts update.
14. Timeline records the decision.
15. Board brief is generated.

The flow should be achievable in roughly two minutes during a live demo.

---

# 20. AGENTS.MD IS PERSISTENT IMPLEMENTATION MEMORY

`AGENTS.md` is not a replacement for `PROGRESS.md`.

Use them differently:

### `CLAUDE.md`
The authoritative product specification, architecture constraints, challenge requirements, phase definitions, and operating rules.

### `AGENTS.md`
Durable instructions for future coding agents:
- current architecture;
- conventions;
- dangerous areas;
- tool behavior;
- testing commands;
- design decisions;
- recurring gotchas;
- workflow rules;
- anything future agents must not contradict.

### `PROGRESS.md`
Chronological phase history:
- what changed;
- what was verified;
- decisions;
- gotchas;
- next Phase.

After every Phase, update **both** `AGENTS.md` and `PROGRESS.md`.

Never erase historical `PROGRESS.md` entries.

---

# 21. AGENTS.MD UPDATE RULE

At the end of every Phase, before committing:

1. Read the current `AGENTS.md`.
2. Add or update only durable information learned during the Phase.
3. Do not turn AGENTS.md into a duplicate of this file.
4. Do not delete useful existing conventions.
5. If a previous instruction became obsolete, update it explicitly rather than silently contradicting it.
6. Keep the file concise enough for future agents to read.
7. Include:
   - architecture changes;
   - important APIs/tool behavior;
   - new testing commands;
   - important implementation constraints;
   - new gotchas;
   - decisions that future agents must preserve.

Then update `PROGRESS.md` with the chronological Phase entry.

---

# 22. PHASE EXECUTION PROTOCOL

Every Phase follows this exact loop:

### Start
- Read CLAUDE.md.
- Read AGENTS.md.
- Read PROGRESS.md.
- Read only files needed for the current Phase.
- Confirm the Phase's scope.

### Implement
- Make the smallest coherent implementation.
- Preserve all existing behavior.
- Do not start later Phases.

### Verify
- Run tests.
- Run TypeScript/build checks.
- Manually test the Phase.
- Run WebMCP checks where relevant.
- Fix issues caused by the Phase.

### Handoff
Update `AGENTS.md`.

Append to `PROGRESS.md`:

```md
## Phase N — DONE (YYYY-MM-DD)
Files created/changed: <list>
Done Check result: <what was verified>
Decisions worth remembering: <durable decisions>
Gotchas: <anything that broke and how it was fixed>
Next: Phase N+1
```

Then:
- commit `Phase N: <short description>`;
- push if configured;
- tell Amogh the Phase is complete;
- STOP.

---

# 23. CURRENT PHASE ROADMAP

Phases 1–18 are DONE. Do not redo them.

## PHASE 17 — Hackathon compliance audit

Goal:
Audit the existing project against the technical submission requirements without changing product behavior.

Tasks:
- inspect repository structure relevant to submission;
- verify WebMCP registrations;
- verify all existing tools;
- verify README;
- verify LICENSE;
- verify judge instructions;
- verify deployment configuration;
- identify missing compliance documentation;
- identify any accidental secrets or unsafe files;
- create/update a concise `HACKATHON.md` only if needed;
- do not redesign the product.

Done Check:
- audit completed;
- every known requirement has PASS / NEEDS ACTION;
- no product behavior changed unnecessarily;
- AGENTS.md and PROGRESS.md updated.

---

## PHASE 18 — WebMCP registration and tool audit

Goal:
Make the WebMCP implementation clearly non-trivial, valid, and judge-testable.

Tasks:
- audit every registered tool;
- verify `document.modelContext.registerTool(...)`;
- verify schemas and descriptions;
- verify validation;
- verify meaningful structured outputs;
- verify tools reach live React state where needed;
- verify no silent model mutations;
- verify tool logging;
- verify graceful WebMCP absence.

Do not add tools unless an existing product requirement requires them.

Done Check:
- all existing tools can be discovered;
- all relevant tools can be executed successfully;
- invalid inputs fail safely;
- no agent can bypass human approval for meaningful model changes;
- tests/build clean.

---

## PHASE 19 — End-to-end human-agent workflow

Goal:
Make the core WebMCP collaboration flow bulletproof.

Required flow:
get_model_state
→ risk understanding
→ run_scenario
→ recommendation
→ propose_edit
→ human approval/rejection
→ model update
→ timeline event.

Tasks:
- test the complete flow;
- fix broken state propagation;
- verify scenario isolation;
- verify approval semantics;
- verify timeline accuracy;
- verify metrics/charts update.

Done Check:
- full flow works from a fresh state;
- rejected proposals do not alter the model;
- approved proposals do;
- timeline accurately records the sequence.

---

## PHASE 20 — Multi-agent Growth/Risk workflow audit

Goal:
Make opposing-agent collaboration reliable and easy to demonstrate.

Tasks:
- verify Growth and Risk identities;
- verify proposal authorship;
- verify rebuttal threads;
- verify cross-tab synchronization;
- verify the human can arbitrate;
- verify both Chrome and ChatGPT in-app browser where available.

Done Check:
- Growth proposes;
- Risk rebuts;
- both arguments render on the same proposal;
- human accepts/rejects;
- state synchronizes correctly.

---

## PHASE 21 — Judge experience and demo reliability

Goal:
Make the first-run experience optimized for judges without adding unnecessary functionality.

Tasks:
- verify default preset;
- verify first-screen narrative;
- verify WebMCP status is understandable;
- verify important actions are discoverable;
- remove accidental dead ends;
- verify judge instructions;
- test the two-minute demo path.

Do not add a generic chatbot.

Done Check:
A fresh judge can understand the product quickly and complete the primary demo flow without developer assistance beyond the documented WebMCP setup.

---

## PHASE 22 — Submission documentation audit

Goal:
Ensure the repository is ready for Devpost submission.

Tasks:
- audit README;
- audit DEMO_SCRIPT.md;
- audit LICENSE;
- audit setup instructions;
- audit WebMCP explanation;
- audit judge instructions;
- document pre-existing vs hackathon-added work where applicable;
- verify no unsupported claims;
- create/update `HACKATHON.md` if required.

Done Check:
A reviewer can understand the product, WebMCP implementation, setup, judge flow, and hackathon-era changes from the repository.

---

## PHASE 23 — Final production QA

Goal:
Perform a final release-quality test.

Tasks:
- production build;
- unit tests;
- TypeScript;
- lint if configured;
- clean console;
- responsive QA;
- WebMCP QA;
- proposal QA;
- scenario QA;
- multi-agent QA;
- board brief QA;
- reset QA;
- deployment QA.

Done Check:
No known blocking defects remain.

Do not add features during this Phase.

---

## PHASE 24 — Final demo rehearsal

Goal:
Prepare the product for the under-three-minute video.

Tasks:
- rehearse the exact judge path;
- verify Growth/Risk disagreement can be demonstrated;
- verify the human approval moment is visually clear;
- verify board brief generation;
- update `DEMO_SCRIPT.md` only where needed;
- keep narration under three minutes;
- do not add product features.

Done Check:
The complete demonstration can be performed reliably in under three minutes.

---

# 24. DO NOT OPTIMIZE FOR FEATURE COUNT

A smaller, reliable, deeply WebMCP-integrated product is better than a large collection of shallow features.

Prioritize:
1. WebMCP Leverage
2. reliable execution
3. real financial decision-making impact
4. distinctive human-agent collaboration

Never sacrifice P0/core reliability for optional functionality.

---

# 25. FINAL DEFINITION OF DONE

Counterpart is ready when a judge can:

1. Open the app.
2. Immediately understand that Counterpart is an AI financial decision partner.
3. See a meaningful financial risk.
4. Use WebMCP to inspect the model.
5. Explore Current Plan, Cost Control, and Retention Recovery.
6. See agent reasoning/recommendation reflected in the product.
7. Review a meaningful proposed change.
8. Approve or reject it as the human.
9. See the model update only after approval.
10. See Growth and Risk disagree where applicable.
11. See the human-agent decision timeline.
12. Generate a board-ready update.
13. Understand why WebMCP is central to the experience.
14. Test the live project without developer intervention beyond documented setup.

When this is true, stop building features and focus on submission.
