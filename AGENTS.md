# GeM-BidGuard Agent Guide

## Architecture

This is a Vite React single-page prototype deployed on Netlify. Navigation is handled as application state in `src/App.tsx`, which keeps the demo fast and avoids unnecessary routing dependencies. The app has three entry states: landing, demo login, and the authenticated procurement workspace.

## Key directories

- `src/App.tsx` — pages, workflow components, interactions, and shared-state orchestration
- `src/styles.css` — complete responsive government-enterprise design system
- `src/types.ts` — procurement domain models
- `src/lib/demo.ts` — canonical tender, bidder, document, evidence, and scenario data
- `src/lib/engine.ts` — deterministic compliance, normalization, finding, and risk logic
- `db/` — Drizzle schema and Netlify Database client
- `netlify/functions/state.ts` — persisted snapshot API
- `netlify/database/migrations/` — generated database migration

## Conventions

- Keep all displayed bidder facts derived from the shared `AppState`; do not introduce page-specific copies.
- Objective comparisons must remain deterministic and code-based. AI-style text may explain results but must not decide them.
- Use the product language `AI-assisted verification`, `Information Inconsistency`, and `Procurement Officer Decision`.
- Never describe a bidder as fraudulent or claim access to live government systems.
- Preserve PASS, FAIL, and REVIEW semantics and their green, red, and amber visual treatments.
- Add evidence links for any new important compliance result.
- Any persisted state must use the Netlify Database snapshot endpoint rather than local files or browser-only persistence.

## Non-obvious decisions

The default scores shown for the four SIH demo bidders are scenario benchmarks supplied by the problem brief. The reusable rule engine independently produces requirement-level PASS, FAIL, and REVIEW outcomes and transparent risk points. ABC Industries intentionally produces 14 PASS, 1 FAIL, and 3 REVIEW results with a 45-point MEDIUM risk assessment.

The document viewer uses a realistic extracted-document preview instead of requiring a PDF-rendering dependency. Uploaded files use deterministic filename classification and a clearly labeled demo extraction fallback.
