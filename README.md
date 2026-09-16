# 🛡️ GeM-BidGuard

### AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

> **Smart document verification. Deterministic compliance. Evidence-based review. Human-authorized procurement decisions.**

---

## 📌 SIH Problem Statement

**PS ID:** 26100  
**Team ID:** `<YOUR TEAM ID>`  
**Idea ID:** `<YOUR IDEA ID>`  
**Ministry / Organization:** Ministry of Petroleum & Natural Gas · CPCL  
**Problem Statement:** AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement

---

## 🎯 Problem Description

Government procurement involves large tender documents, multiple bidders, numerous eligibility conditions, technical specifications, certificates, financial requirements and statutory documents.

A Procurement Officer may need to manually examine hundreds of pages of bidder documents and verify:

- Whether all mandatory documents are submitted
- Whether certificates are valid and not expired
- Whether financial requirements are satisfied
- Whether technical specifications meet tender requirements
- Whether information is consistent across multiple documents
- Whether the bidder has statutory registrations
- Whether submitted evidence actually supports the compliance claim

This manual process can be time-consuming and may make it difficult to trace every compliance decision back to its supporting evidence.

---

# 💡 Our Idea — GeM-BidGuard

**GeM-BidGuard** is an AI-assisted procurement compliance verification platform designed to help Procurement Officers systematically verify bidder submissions against tender requirements.

The platform takes the officer through the complete workflow:

```text
Tender Requirements
        ↓
Bidder Documents
        ↓
Document Classification
        ↓
Information Extraction
        ↓
Data Normalization
        ↓
Cross-Document Validation
        ↓
Deterministic Compliance Rule Engine
        ↓
Evidence & Findings
        ↓
Risk Assessment
        ↓
Compliance Report
        ↓
Procurement Officer Decision
```

The key principle of GeM-BidGuard is:

> **AI assists the Procurement Officer, but AI does not make the final procurement decision.**

Objective compliance calculations are performed using a **code-based deterministic rule engine**, while the authorized Procurement Officer retains complete decision-making authority.

---

# 🚀 What GeM-BidGuard Provides

### 📋 1. Tender Requirement Management

The prototype contains a structured CPCL tender:

**Tender ID:** `CPCL-2026-041`

It demonstrates **18 structured tender requirements** covering:

- Legal requirements
- Financial requirements
- Technical specifications
- Statutory registrations
- Tender-specific conditions

Each requirement contains information such as:

- Requirement ID
- Category
- Mandatory status
- Required value
- Comparison operator
- Weight
- Tender clause
- Source page
- Required document type
- Field to be verified

---

### 📂 2. Bidder Document Processing

Procurement Officers can work with bidder documents through a dedicated document workflow.

The prototype demonstrates:

- Document upload
- Filename-based classification
- Document type correction
- Simulated information extraction
- Field normalization
- Document preview
- Reprocessing
- Document deletion
- Processing status
- Extraction confidence

---

### 🤖 3. AI-Assisted Information Extraction

The system demonstrates an AI-assisted document processing workflow that converts unstructured procurement documents into structured information.

For example:

```text
Technical_Datasheet.pdf
        ↓
Document Classification
        ↓
Field Extraction
        ↓
Pressure = 8 bar
Flow = 110 L/min
Efficiency = 92%
Motor Power = 12 HP
        ↓
Compliance Engine
```

The extracted information can then be linked back to supporting evidence.

---

# ⚙️ 4. Deterministic Compliance Rule Engine

One of the core components of GeM-BidGuard is its **code-based compliance engine**.

The engine evaluates bidder information against predefined tender rules.

Supported operators include:

```text
==
!=
>
<
>=
<=
exists
not_exists
date_valid
date_expired
matches
contains
```

### Example

Suppose the tender requires:

```text
Pressure Rating >= 10 bar
```

A bidder submits:

```text
Pressure Rating = 8 bar
```

The rule engine evaluates:

```text
8 >= 10
```

Result:

```text
❌ FAIL
```

This makes the objective compliance calculation deterministic and reproducible.

---

# 🔍 5. Cross-Document Validation

GeM-BidGuard can compare information appearing across different documents.

For example:

```text
GST Certificate
       +
PAN
       +
Udyam Certificate
       ↓
Legal Entity Comparison
       ↓
PASS / REVIEW
```

This helps identify situations where bidder identity information differs between submitted documents.

The prototype specifically demonstrates:

- Legal entity matching
- Contradictory information
- Identity inconsistencies
- Cross-document evidence

---

# 🧾 6. Evidence-Based Compliance

Every compliance result can be connected to supporting evidence.

The Evidence Explorer provides a way to inspect:

- Source document
- Page number
- Extracted field
- Extracted value
- Supporting text
- Confidence
- Tender clause

Instead of simply showing:

> ❌ Requirement Failed

the system can show **why** the requirement failed and which evidence supports the result.

---

# 📊 7. Bidder Compliance Matrix

GeM-BidGuard provides a clickable compliance matrix allowing the Procurement Officer to compare bidders across tender requirements.

Example:

| Requirement | Bidder A | Bidder B | Bidder C |
|---|---|---|---|
| GST | ✅ | ✅ | ❌ |
| PAN | ✅ | ✅ | ✅ |
| Turnover | ✅ | ❌ | ✅ |
| BIS | ✅ | ⚠️ Review | ✅ |
| Pressure Rating | ❌ | ✅ | ✅ |
| Warranty | ⚠️ Review | ✅ | ❌ |

The officer can open individual results and inspect their evidence.

---

# ⚠️ 8. Risk Assessment

The system calculates risk using deterministic risk contributions.

Possible risk factors include:

- Technical failure
- Financial failure
- Missing mandatory documents
- Expired certificates
- Entity inconsistency
- Contradictory information
- Low extraction confidence
- Blacklist status

Risk levels are represented as:

```text
LOW
MEDIUM
HIGH
```

The purpose is to help the Procurement Officer identify submissions requiring closer review.

---

# 🏛️ 9. Government Verification Layer

The prototype demonstrates adapters for:

- GSTN
- Udyam
- PAN
- Blacklist verification

### ⚠️ Prototype Disclaimer

These integrations are **simulated/mock verification adapters** in the current SIH prototype.

They are clearly labelled as:

> **Prototype / Simulated**

They are not presented as live government API integrations.

---

# 💬 10. Ask BidGuard

The platform includes a deterministic **Ask BidGuard** assistant.

It can answer questions using the shared application dataset and provide explanatory information related to the current procurement scenario.

For example:

```text
"What are the failed requirements for ABC Industries?"
```

The assistant uses the available structured dataset rather than independently making a procurement decision.

---

# 📑 11. Compliance Reports

The system provides a reporting workflow for the current compliance state.

Reports can include:

- Bidder information
- Requirement results
- Findings
- Evidence
- Risk information
- Compliance scores
- Verification information

The prototype also demonstrates print/download workflows.

---

# 👨‍💼 12. Human-in-the-Loop Procurement Decision

This is a fundamental product boundary of GeM-BidGuard.

The system can provide:

- Compliance results
- Findings
- Evidence
- Risk information
- Explanations
- Reports

But the final decision remains with the authorized Procurement Officer.

Possible officer decisions include:

```text
ELIGIBLE
NOT ELIGIBLE
REQUIRES CLARIFICATION
MANUAL REVIEW
```

Therefore:

```text
AI / Automation
      ↓
Recommendation & Evidence
      ↓
Procurement Officer
      ↓
Authorized Final Decision
```

---

# 🕵️ 13. Audit Trail

The prototype maintains audit events for important actions.

This helps demonstrate traceability of the procurement verification workflow.

The audit layer records information such as:

- Timestamp
- User
- Action
- Entity
- Bidder
- Document
- Result

---

# 📈 Complete Prototype Workflow

```text
┌──────────────────────┐
│   CPCL Tender        │
│ CPCL-2026-041        │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ 18 Requirements      │
│ Legal / Financial    │
│ Technical / Statutory│
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Bidder Documents     │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Document Processing  │
│ Classification       │
│ Extraction           │
│ Normalization        │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Cross-Document       │
│ Validation            │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Compliance Rule      │
│ Engine               │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ PASS / FAIL / REVIEW │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Evidence + Findings  │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Risk Assessment      │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Compliance Report    │
└──────────┬───────────┘
           ↓
┌──────────────────────┐
│ Procurement Officer  │
│ Final Decision       │
└──────────────────────┘
```

---

# 🛠️ Technology Stack

### ⦿ Frontend

- React 19
- TypeScript
- Vite
- HTML5
- Custom Responsive CSS
- Lucide React

### ⦿ Backend / Serverless

- Netlify Functions
- REST-style `/api/state` endpoint

### ⦿ Database

- Netlify Database
- PostgreSQL
- Drizzle ORM

### ⦿ Development Tools

- Node.js
- npm
- Git
- GitHub

---

# 🏗️ Project Architecture

```text
GeM-BidGuard/
│
├── src/
│   ├── components/
│   ├── lib/
│   │   ├── demo.ts
│   │   └── engine.ts
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
│
├── netlify/
│   ├── functions/
│   │   └── state.ts
│   └── database/
│       └── migrations/
│
├── db/
│   ├── index.ts
│   └── schema.ts
│
├── package.json
├── netlify.toml
├── vite.config.ts
├── tsconfig.json
└── README.md
```

---

# 💾 Data & Persistence

The application starts with deterministic demonstration data from:

```text
src/lib/demo.ts
```

The application maintains a shared:

```text
AppState
```

Client-side interactions update this state.

The state is synchronized through:

```text
/api/state
```

The Netlify Function stores the application snapshot in the:

```text
app_snapshots
```

database table.

Database schema and migrations are maintained in:

```text
db/
netlify/database/migrations/
```

---

# 🧪 Demo Scenarios

The prototype includes **four consistent bidder scenarios** with associated:

- Bidder information
- Documents
- Extracted fields
- Evidence
- Compliance results
- Compliance scores
- Findings
- Risk assessments

This allows the complete procurement verification workflow to be demonstrated without requiring real bidder data.

---

# 🚀 How to Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/SuvanshSolanki/GeM-BidGuard-Procurement-Compliance.git
```

### 2. Open the project

```bash
cd GeM-BidGuard-Procurement-Compliance
```

### 3. Install dependencies

```bash
npm install
```

### 4. Start the development server

For the frontend:

```bash
npm run dev
```

If you want to run the Netlify Functions and database-backed `/api/state` workflow:

```bash
npx netlify dev --port 8889
```

Open the local URL displayed by Netlify CLI.

### 5. Launch the Demo

Use:

> **Continue Demo**

to enter the complete demonstration environment.

---

# 🔐 Important Product Boundary

GeM-BidGuard is an **AI-assisted decision-support prototype**.

AI-generated output is advisory and explanatory.

Objective compliance calculations are performed by the **code-based deterministic rule engine**.

The system does **not** autonomously make the final procurement decision.

### Final authority remains with:

> **The Authorized Procurement Officer**

This ensures that automation supports procurement professionals while maintaining human accountability and authorization.

---

# 🌟 Key Innovation

GeM-BidGuard brings multiple verification activities into a single procurement workflow:

```text
Document Processing
        +
Requirement Extraction
        +
Rule-Based Compliance
        +
Cross-Document Validation
        +
Evidence Traceability
        +
Technical Verification
        +
Risk Assessment
        +
Government Verification
        +
Audit Trail
        +
Human Decision
```

Instead of providing only an AI-generated answer, the platform focuses on **traceable, evidence-linked and deterministic compliance verification**.

---

# 🎥 Project Resources

### ⭐ Live Demo

**Coming Soon / Add Deployment URL**

`<ADD YOUR NETLIFY DEPLOYMENT LINK>`

### ⭐ Project Presentation

`<ADD PPT LINK>`

### ⭐ Project Demonstration Video

`<ADD VIDEO LINK>`

### ⭐ Project Report

`<ADD PROJECT REPORT LINK>`

### ⭐ GitHub Repository

[GeM-BidGuard — Procurement Compliance](https://github.com/SuvanshSolanki/GeM-BidGuard-Procurement-Compliance)

---

# 👨‍💻 Team

### GeM-BidGuard — SIH 2026

**Team Leader:**  
Suvansh Solanki

**Team Members:**  
- `<TEAM MEMBER 1>`
- `<TEAM MEMBER 2>`
- `<TEAM MEMBER 3>`
- `<TEAM MEMBER 4>`
- `<TEAM MEMBER 5>`
- `<TEAM MEMBER 6>`

**Team Mentor:**  
`<MENTOR NAME>`

---

# 🤝 Contributing

This project was developed as a **Smart India Hackathon prototype**.

Suggestions, improvements, issues and pull requests are welcome.

If you find the project useful, consider giving the repository a ⭐.

---

# 📜 Disclaimer

GeM-BidGuard is an SIH prototype created for demonstrating an AI-assisted procurement compliance workflow.

The bidder information, tender data, verification responses and government verification adapters used in the prototype are demonstration/simulated data unless explicitly stated otherwise.

The prototype does not represent an official GeM, CPCL or Government of India production system.

---

# ❤️ Built for Smarter Procurement

**GeM-BidGuard**

> *Verify faster. Trace every finding. Keep humans in control.*

🙏 **Thank You**
