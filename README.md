# GeM-BidGuard

GeM-BidGuard is a complete SIH prototype for problem 26100: AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement. It demonstrates how a CPCL Procurement Officer can move from tender requirements through document processing, deterministic compliance checks, evidence review, risk assessment, reporting, and an authorized human decision.

## What it includes

- Government-enterprise landing page and instant demo login
- CPCL tender `CPCL-2026-041` with 18 structured requirements
- Four consistent bidder scenarios with documents, extracted fields, evidence, results, scores, and risk
- Code-based rule engine supporting comparison, existence, date, match, and containment operators
- Document upload, filename classification, simulated extraction pipeline, type correction, preview, reprocess, and delete
- Missing-document detection, expiry calculations, cross-document validation, and technical comparison
- Clickable bidder compliance matrix and three-pane evidence explorer
- Deterministic Ask BidGuard assistant that only answers from the shared dataset
- Mock GSTN, Udyam, PAN, and blacklist verification adapters clearly labeled as simulated
- Current-data compliance reports, print/download workflow, Procurement Officer decisions, and audit events
- Netlify Database persistence for the complete prototype snapshot

## Technology

- React 19 and TypeScript
- Vite
- Lucide React icons
- Custom responsive CSS design system
- Netlify Functions
- Netlify Database with Drizzle ORM

## Run locally

```bash
npm install
netlify dev --port 8889
```

Open the local URL shown by Netlify CLI. Use **Continue Demo** to load the complete scenario.

## Data and persistence

The app starts with deterministic data from `src/lib/demo.ts`. Client interactions update one shared `AppState`, then synchronize the snapshot through `/api/state`. The Netlify Function stores it in the `app_snapshots` table. Database schema and migrations are located in `db/` and `netlify/database/migrations/`.

## Important product boundary

AI output is advisory and explanatory. Objective compliance arithmetic is evaluated by the code-based rule engine. Final procurement qualification, disqualification, clarification, and award authority always remains with the authorized Procurement Officer.
