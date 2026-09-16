# GeM-BidGuard

**AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**

---

## PS Details

**PS ID :** 26100  
**Team ID :** `<YOUR TEAM ID>`  
**Idea ID :** `<YOUR IDEA ID>`  
**Ministry / Organization :** Ministry of Petroleum and Natural Gas / CPCL  

### PS Title :

**AI-Powered Integrated Bid Compliance Verification Platform for GeM Procurement**

---

## PS Description

In government procurement, Procurement Officers have to verify a large number of documents submitted by different bidders against the requirements mentioned in a tender.

This includes checking:

- Required documents are submitted or not
- Certificates are valid or expired
- Technical specifications match the tender requirements
- Financial requirements are satisfied
- Information is consistent across different documents
- Supporting evidence is available for each compliance result

Doing these checks manually can take a lot of time, especially when there are multiple bidders and large tender documents.

The objective of this problem is to develop a system that can assist Procurement Officers in checking bidder compliance in a faster and more structured way.

---

# Idea Title

## GeM-BidGuard

### Idea Description

GeM-BidGuard is an AI-assisted platform developed as an SIH prototype for bid compliance verification.

The system takes a tender and bidder documents as input and helps the Procurement Officer go through the complete verification process.

The basic workflow is:

**Tender Requirements → Bidder Documents → Document Processing → Compliance Checks → Evidence Review → Risk Assessment → Report → Officer Decision**

The system does not make the final procurement decision on its own. AI is used to assist with document processing, information extraction and explanation, while objective compliance checks are performed using a code-based rule engine.

The final decision remains with the authorized Procurement Officer.

---

# What We Have Implemented

### 1. CPCL Tender

We have created a demo CPCL tender:

**Tender ID : `CPCL-2026-041`**

The tender contains **18 structured requirements** covering different types of procurement conditions.

---

### 2. Bidder Scenarios

The prototype contains **four bidder scenarios** with sample documents and different compliance situations.

Each bidder has associated:

- Documents
- Extracted information
- Evidence
- Compliance results
- Compliance score
- Risk information

This allows us to demonstrate different cases during the project demo.

---

### 3. Document Processing

The system provides a document workflow where users can:

- Upload documents
- Classify documents
- Correct document types
- Preview documents
- Reprocess documents
- Delete documents
- View extracted information

The current SIH prototype uses simulated extraction data for demonstration.

---

### 4. Compliance Rule Engine

The main compliance checking is performed using a **code-based rule engine**.

The engine supports different types of checks such as:

- Comparison
- Existence
- Date validation
- Matching
- Containment

For example:

If the tender requires:

**Minimum turnover = ₹10 Crore**

and the bidder's extracted turnover is:

**₹7 Crore**

the rule engine checks the values and marks the requirement accordingly.

This makes the objective compliance calculation deterministic rather than depending only on an AI response.

---

### 5. Missing Document & Expiry Checks

The system can identify:

- Missing mandatory documents
- Expired certificates
- Invalid/insufficient document information
- Other compliance issues

This helps the officer quickly identify areas that require attention.

---

### 6. Cross-Document Validation

Information from different bidder documents can be compared.

For example:

**PAN + GST + Udyam**

can be checked for consistency of bidder information.

This helps identify contradictions or mismatched information between documents.

---

### 7. Bidder Compliance Matrix

The application provides a compliance matrix where the Procurement Officer can compare bidder results against individual tender requirements.

The officer can see which requirements are:

- Passed
- Failed
- Require review

Individual results can then be opened for further investigation.

---

### 8. Evidence Explorer

The system provides an evidence view for compliance results.

The officer can review the information supporting a particular result instead of relying only on a final PASS/FAIL status.

This improves traceability of the verification process.

---

### 9. Risk Assessment

The prototype provides risk information based on the compliance findings.

Some of the factors considered include:

- Failed requirements
- Missing documents
- Expired certificates
- Information mismatch
- Technical issues
- Other verification findings

---

### 10. Ask BidGuard

The application includes an **Ask BidGuard** assistant.

It can answer questions related to the current demo dataset and help the officer understand bidder compliance information.

The assistant is designed as a support feature and does not independently make the final procurement decision.

---

### 11. Verification Adapters

The prototype includes simulated verification adapters for:

- GSTN
- Udyam
- PAN
- Blacklist verification

**Note:** These are currently **mock/simulated integrations** for the SIH prototype and should not be considered live government API integrations.

---

### 12. Compliance Reports

The application can generate compliance reports containing information such as:

- Bidder details
- Requirement results
- Findings
- Evidence
- Risk information
- Compliance score

The prototype also provides print/download functionality.

---

### 13. Procurement Officer Decision

After reviewing the compliance results and evidence, the authorized Procurement Officer can record the final decision.

The important design principle is:

> **The system assists the officer; it does not replace the officer.**

Final qualification, disqualification, clarification and award decisions remain with the authorized Procurement Officer.

---

### 14. Audit Events

The application also maintains audit events for important actions performed during the verification workflow.

This helps maintain a record of activities performed during the procurement review.

---

# How GeM-BidGuard Works

```text
CPCL Tender
     ↓
Tender Requirements
     ↓
Bidder Documents
     ↓
Document Processing
     ↓
Information Extraction
     ↓
Compliance Rule Engine
     ↓
Evidence & Findings
     ↓
Risk Assessment
     ↓
Compliance Report
     ↓
Procurement Officer Review
     ↓
Final Decision
```

---

# Technology Used

### ⦿ Frontend

- React 19
- TypeScript
- Vite
- HTML
- CSS
- Lucide React

### ⦿ Backend

- Netlify Functions

### ⦿ Database

- Netlify Database
- PostgreSQL
- Drizzle ORM

### ⦿ Development

- Node.js
- npm
- Git
- GitHub

---

# Project Structure

```text
GeM-BidGuard/
│
├── src/
│   ├── components/
│   ├── lib/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── types.ts
│
├── db/
├── netlify/
├── package.json
├── netlify.toml
├── vite.config.ts
└── README.md
```

---

# Screenshots

Add screenshots of the actual application here.

### Landing Page

```text
![Landing Page](screenshots/landing-page.png)
```

### Dashboard

```text
![Dashboard](screenshots/dashboard.png)
```

### Bidder Compliance Matrix

```text
![Compliance Matrix](screenshots/compliance-matrix.png)
```

### Evidence Explorer

```text
![Evidence Explorer](screenshots/evidence-explorer.png)
```

### Compliance Report

```text
![Compliance Report](screenshots/compliance-report.png)
```

---

# Demo

The project contains a preloaded demo environment so that the complete workflow can be tested without entering real procurement data.

### To start the demo:

1. Open the application.
2. Click **Continue Demo**.
3. Select a bidder.
4. Review the bidder documents.
5. Check the compliance results.
6. Open the evidence for individual requirements.
7. Review risk and compliance information.
8. Generate/review the compliance report.
9. Record the Procurement Officer decision.

---

# How to Run

### 1. Clone the Repository

```bash
git clone https://github.com/SuvanshSolanki/GeM-BidGuard-Procurement-Compliance.git
```

### 2. Open the Project

```bash
cd GeM-BidGuard-Procurement-Compliance
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run the Application

For the normal Vite development server:

```bash
npm run dev
```

For the Netlify Functions workflow:

```bash
npx netlify dev --port 8889
```

Open the URL shown in the terminal.

Then select:

**Continue Demo**

---

# Data and Persistence

The initial demo data is available in:

```text
src/lib/demo.ts
```

The application maintains a shared `AppState` for the current prototype state.

Client-side changes are synchronized through:

```text
/api/state
```

The Netlify Function stores the prototype snapshot in the:

```text
app_snapshots
```

table.

Database schema and migrations are available in:

```text
db/
netlify/database/migrations/
```

---

# Future Scope

The current version is an SIH prototype. Some areas that can be developed further include:

- Integration with authorized GeM workflows and APIs
- Live government verification APIs where officially permitted
- Production-grade OCR and document extraction
- More tender-specific rule templates
- More advanced document comparison
- Role-based access for different procurement users
- Improved audit and reporting features
- Secure deployment on suitable government infrastructure
- Support for larger real-world tender datasets

---

# Important Note

GeM-BidGuard is an **SIH prototype** created to demonstrate an AI-assisted bid compliance verification workflow.

The tender, bidder documents and verification data used in the prototype are demonstration data.

GSTN, PAN, Udyam and blacklist verification adapters are simulated in the current prototype.

The project does not represent an official GeM or CPCL production system.

---

# Project Team

## Team `<TEAM NAME>`

**Team Leader:**  
Suvansh Solanki

**Team Members:**

- `<Member 1>`
- `<Member 2>`
- `<Member 3>`
- `<Member 4>`
- `<Member 5>`
- `<Member 6>`

**Team Mentor:**  
`<Mentor Name>`

---

# Important URLs

⭐ **GitHub Repository**

https://github.com/SuvanshSolanki/GeM-BidGuard-Procurement-Compliance

⭐ **Live Demo**

`<Add Netlify URL>`

⭐ **Project PPT**

`<Add PPT Link>`

⭐ **Project Video**

`<Add Video Link>`

⭐ **Project Report**

`<Add Report Link>`

---

# Support

If you find this project useful, please give the repository a ⭐.

Feedback and suggestions are welcome.

---

## GeM-BidGuard

**AI-assisted compliance verification for smarter and more transparent procurement.**

🙏 **Thank You**
