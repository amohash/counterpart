# WebMCP Challenge compliance audit

Audit date: August 31, 2026

Authoritative sources:
- [WebMCP Challenge requirements](https://webmcp.devpost.com/)
- [WebMCP Challenge official rules](https://webmcp.devpost.com/rules)
- [OpenAI challenge overview](https://openai.com/webmcp-challenge/)

## Status matrix

| Requirement | Status | Evidence / action |
|---|---|---|
| Entrant eligibility, registration, and ownership attestations | NEEDS ACTION | Amogh must confirm eligibility, join the challenge, identify any team representative, and attest that the submission is original/owned and respects third-party licenses when completing Devpost. These personal/legal facts cannot be verified from the repository. |
| WebMCP-powered app for human-agent collaboration | PASS | Counterpart exposes a shared financial model to agents while reserving consequential edits for human approval. The eight-tool surface is documented in `README.md` and implemented in `src/webmcp.ts`. |
| Project runs consistently as described | PASS | `npm test` passes 41 tests, `npm run build` passes, and Phases 8, 13, and 14 record successful browser checks in `PROGRESS.md`. |
| New or meaningfully extended during the Submission Period | PASS | The official period began August 25, 2026. The repository was created August 27; the first app scaffold is commit `c829862`, followed by timestamped Phase commits for all WebMCP and collaboration work. No pre-period application code appears in git history. |
| Working live URL | PASS | `https://counterpart-sandy.vercel.app` responds and is hosted on Vercel. Its unauthenticated `401` response is the intentional Basic Auth gate permitted by the rules. |
| Judge access to authenticated deployment | NEEDS ACTION | Put username `counterpart` and the production passcode in the Devpost testing instructions, then verify both ChatGPT's in-app browser and Chrome can authenticate before submission. Never commit the passcode. |
| Required four-part project description | PASS | `README.md` explains why WebMCP fits, the UX improvement, what humans and agents can do together, and the implementation. |
| Public code repository | PASS | `https://github.com/amohash/counterpart` returns `200`; GitHub reports `private: false`. |
| Complete source, assets, and setup instructions | PASS | The repository contains the Vite/React/TypeScript source, lockfile, local commands, deployment middleware, and the sole runtime asset. No backend or external API key is required. |
| Detectable open-source license | PASS | Root `LICENSE` is MIT and GitHub's repository metadata detects SPDX `MIT`. The license must not be replaced. |
| WebMCP registration present in the repository | PASS | `src/webmcp.ts` obtains `document.modelContext` and registers all eight tools with `registerTool`; the README includes a literal `document.modelContext.registerTool(...)` excerpt. The deprecated navigator alias is mentioned only in a warning comment, not accessed. |
| Public demo video under three minutes with audio | NEEDS ACTION | Record the approved flow, keep the final cut under 3:00, include narration covering the product and WebMCP use, upload it as a publicly visible YouTube video, and add its URL to Devpost. `DEMO_SCRIPT.md` is the rehearsal source, not the required video. |
| Video/IP compliance | NEEDS ACTION | Use no unlicensed music, media, or third-party marks. The current `public/favicon.svg` is the default Vite mark; replace it with an original Counterpart asset or keep it out of the final recording before submission. |
| No exposed secrets or unsafe tracked files | PASS | Targeted scans found no committed private-key, token, or passcode assignment. `COUNTERPART_PASSCODE` is read only from Vercel's environment. `.env*`, local settings, `.DS_Store`, `dist`, and `node_modules` are ignored. |
| Submission form and deadline | NEEDS ACTION | Complete all Devpost fields, including the live URL, public repository, public YouTube URL, description, and judge credentials, before September 3, 2026 at 1:00 p.m. Pacific. |
| Free judge availability through judging | NEEDS ACTION | Keep the live deployment and supplied credentials working without charge or restriction through the judging period ending September 21, 2026 at 5:00 p.m. Pacific. |

## Provenance

Counterpart's tracked application was created entirely within the Submission Period. Git history provides the evidence:

- August 27: repository/license and Phase 1 application scaffold.
- August 27–28: financial model, proposal approval, and eight WebMCP tools.
- August 28–29: agent identity, cross-tab synchronization, Growth/Risk rebuttals, and product design.
- August 29–31: optional deployment gate and submission documentation.

This project should be described as hackathon-period work. Do not claim work outside the timestamped repository history.

## Audit boundaries

Phase 17 verified submission-facing structure and registration evidence. Phase 18 owns exhaustive per-tool schema, validation, output, live-state, logging, and failure-mode testing. Manual submission, credential entry, video publication, and keeping the deployment online remain Amogh's external actions.
