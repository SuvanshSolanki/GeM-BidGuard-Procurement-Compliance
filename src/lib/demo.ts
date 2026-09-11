import type { AppState, Bidder, Document, Evidence, Requirement } from "../types";
import { calculateRisk, createFindings, runCompliance } from "./engine";

const requirements: Requirement[] = [
  { id: "REQ-01", category: "Legal", title: "GST Registration", mandatory: true, operator: "==", requiredValue: "ACTIVE", weight: 7, sourceClause: "4.1", sourcePage: 8, requiredDocumentTypes: ["GST Certificate"], field: "gstStatus" },
  { id: "REQ-02", category: "Legal", title: "PAN", mandatory: true, operator: "exists", requiredValue: true, weight: 5, sourceClause: "4.2", sourcePage: 8, requiredDocumentTypes: ["PAN"], field: "pan" },
  { id: "REQ-03", category: "Financial", title: "Average Annual Turnover", mandatory: true, operator: ">=", requiredValue: 5, unit: "Crore INR", weight: 12, sourceClause: "5.3", sourcePage: 11, requiredDocumentTypes: ["Financial Statement", "Turnover Certificate"], field: "turnover" },
  { id: "REQ-04", category: "Statutory", title: "Udyam/MSME Registration", mandatory: true, operator: "exists", requiredValue: true, weight: 6, sourceClause: "4.4", sourcePage: 9, requiredDocumentTypes: ["Udyam/MSME"], field: "udyam" },
  { id: "REQ-05", category: "Statutory", title: "BIS Certification", mandatory: true, operator: "exists", requiredValue: true, weight: 7, sourceClause: "6.1", sourcePage: 14, requiredDocumentTypes: ["BIS Certificate"], field: "bis" },
  { id: "REQ-06", category: "Tender Specific", title: "OEM Authorization", mandatory: true, operator: "exists", requiredValue: true, weight: 6, sourceClause: "6.2", sourcePage: 14, requiredDocumentTypes: ["OEM Authorization"], field: "oem" },
  { id: "REQ-07", category: "Tender Specific", title: "Local Content", mandatory: true, operator: ">=", requiredValue: 40, unit: "%", weight: 5, sourceClause: "7.4", sourcePage: 18, requiredDocumentTypes: ["Local Content Declaration"], field: "localContent" },
  { id: "REQ-08", category: "Legal", title: "Blacklisting/Debarment Clearance", mandatory: true, operator: "!=", requiredValue: "BLACKLISTED", weight: 4, sourceClause: "4.7", sourcePage: 10, requiredDocumentTypes: ["Blacklisting Declaration"], field: "blacklistStatus" },
  { id: "REQ-09", category: "Technical", title: "Flow Rating", mandatory: true, operator: ">=", requiredValue: 100, unit: "L/min", weight: 7, sourceClause: "8.2.1", sourcePage: 22, requiredDocumentTypes: ["Technical Datasheet"], field: "flow" },
  { id: "REQ-10", category: "Technical", title: "Pressure Rating", mandatory: true, operator: ">=", requiredValue: 10, unit: "bar", weight: 6, sourceClause: "8.2.2", sourcePage: 22, requiredDocumentTypes: ["Technical Datasheet"], field: "pressure" },
  { id: "REQ-11", category: "Technical", title: "Pump Efficiency", mandatory: true, operator: ">=", requiredValue: 90, unit: "%", weight: 7, sourceClause: "8.2.3", sourcePage: 23, requiredDocumentTypes: ["Technical Datasheet"], field: "efficiency" },
  { id: "REQ-12", category: "Technical", title: "Motor Power", mandatory: true, operator: ">=", requiredValue: 10, unit: "HP", weight: 7, sourceClause: "8.2.4", sourcePage: 23, requiredDocumentTypes: ["Technical Datasheet"], field: "motorPower" },
  { id: "REQ-13", category: "Tender Specific", title: "Make in India Declaration", mandatory: true, operator: "exists", requiredValue: true, weight: 4, sourceClause: "7.3", sourcePage: 17, requiredDocumentTypes: ["Make in India Declaration"], field: "mii" },
  { id: "REQ-14", category: "Statutory", title: "EPFO Registration", mandatory: true, operator: "==", requiredValue: "ACTIVE", weight: 4, sourceClause: "4.8", sourcePage: 10, requiredDocumentTypes: ["EPFO"], field: "epfoStatus" },
  { id: "REQ-15", category: "Statutory", title: "ESIC Registration", mandatory: true, operator: "==", requiredValue: "ACTIVE", weight: 4, sourceClause: "4.9", sourcePage: 10, requiredDocumentTypes: ["ESIC"], field: "esicStatus" },
  { id: "REQ-16", category: "Financial", title: "Bid Security / EMD", mandatory: true, operator: "exists", requiredValue: true, weight: 5, sourceClause: "5.1", sourcePage: 11, requiredDocumentTypes: ["Other"], field: "emd" },
  { id: "REQ-17", category: "Legal", title: "Cross-Document Legal Identity", mandatory: true, operator: "matches", requiredValue: "REGISTERED ENTITY", weight: 4, sourceClause: "4.10", sourcePage: 10, requiredDocumentTypes: ["GST Certificate", "PAN", "Udyam/MSME"], field: "identityMatch" },
  { id: "REQ-18", category: "Tender Specific", title: "Warranty Commitment", mandatory: true, operator: ">=", requiredValue: 24, unit: "months", weight: 4, sourceClause: "9.2", sourcePage: 27, requiredDocumentTypes: ["Other"], field: "warrantyMonths" },
];

type DocSpec = [string, string, number, number, "PASS" | "FAIL" | "REVIEW", string?, string?];
const makeDocs = (bidderId: string, specs: DocSpec[]): Document[] => specs.map((spec, index) => ({
  id: `${bidderId}-DOC-${String(index + 1).padStart(2, "0")}`,
  bidderId,
  filename: spec[0], type: spec[1], pages: spec[2], status: spec[4] === "REVIEW" ? "REVIEW" : "READY", confidence: spec[3], expiry: spec[5], verification: spec[4], evidenceIds: [], extractedFields: [], previewText: spec[6] ?? `${spec[1]}\nDigitally submitted procurement document.\nBidder reference: ${bidderId}\nClassification confidence: ${spec[3]}%`,
}));

const bidders: Bidder[] = [
  {
    id: "BIDDER-ABC", bidId: "BID-001", company: "ABC INDUSTRIES PVT LTD", shortName: "ABC Industries", tenderId: "CPCL-2026-041", complianceScore: 87, riskLevel: "MEDIUM",
    values: { gstStatus: "ACTIVE", gstin: "09ABCDE1234F1Z5", pan: "ABCDE1234F", udyam: "UDYAM-UP-00-0012345", bis: "CM/L-6400123456", oem: true, oemModel: "IPX-110A", offeredModel: "IPX-110B", localContent: 43, blacklistStatus: "CLEAR", flow: 110, pressure: 8, efficiency: 92, motorPower: 12, mii: true, epfoStatus: "ACTIVE", esicStatus: "ACTIVE", emd: true, identityMatch: "ABC INDUSTRIES PVT LTD", warrantyMonths: 24, turnover: 7.5, entityMismatch: true, certificateExpired: false },
    categoryScores: { Legal: 100, Financial: 92, Technical: 76, Statutory: 100, "Tender Specific": 83 },
    documents: makeDocs("BIDDER-ABC", [
      ["vendor_doc_01.pdf", "GST Certificate", 2, 98, "PASS", undefined, "GST REGISTRATION CERTIFICATE\nLegal Name: ABC INDUSTRIES PRIVATE LIMITED\nGSTIN: 09ABCDE1234F1Z5\nStatus: ACTIVE\nState: Uttar Pradesh\nRegistration Date: 15/04/2022"],
      ["document_02.pdf", "PAN", 1, 99, "PASS", undefined, "INCOME TAX DEPARTMENT\nPAN: ABCDE1234F\nLegal Name: ABC INDUSTRIES PVT LTD"],
      ["certificate_03.pdf", "Udyam/MSME", 2, 86, "REVIEW", undefined, "UDYAM REGISTRATION\nUdyam Number: UDYAM-UP-00-0012345\nEnterprise Name: XYZ INDUSTRIES PRIVATE LIMITED\nStatus: ACTIVE"],
      ["Financial_Statements_2023-26.pdf", "Financial Statement", 18, 96, "PASS", undefined, "AUDITED FINANCIAL STATEMENTS\nFY 2023-24: INR 7.1 Crore\nFY 2024-25: INR 7.6 Crore\nFY 2025-26: INR 7.8 Crore\nAverage Turnover: INR 7.5 Crore"],
      ["file_04.pdf", "OEM Authorization", 2, 91, "REVIEW", "2027-03-31", "OEM AUTHORIZATION\nOEM: Indian Pump Works Limited\nProduct: Industrial Centrifugal Pump\nAuthorized Model: IPX-110A\nOffered Model: IPX-110B\nValidity: 31/03/2027"],
      ["BIS_Certificate.pdf", "BIS Certificate", 3, 97, "PASS", "2027-08-10"],
      ["spec_05.pdf", "Technical Datasheet", 6, 97, "PASS", undefined, "TECHNICAL DATASHEET — MODEL IPX-110B\nMotor Power: 12 HP\nFlow: 110 L/min\nPressure: 8 bar\nEfficiency: 92%\nTest Standard: IS 9079"],
      ["Local_Content_Declaration.pdf", "Local Content Declaration", 2, 94, "PASS"],
      ["MII_Declaration.pdf", "Make in India Declaration", 1, 96, "PASS"],
      ["Blacklisting_Declaration.pdf", "Blacklisting Declaration", 1, 95, "PASS"],
      ["EPFO_ESIC.pdf", "EPFO", 2, 93, "PASS"],
      ["ESIC_Registration.pdf", "ESIC", 2, 94, "PASS"],
      ["Bid_Security.pdf", "Other", 2, 98, "PASS"],
    ])
  },
  {
    id: "BIDDER-BHARAT", bidId: "BID-002", company: "BHARAT INDUSTRIAL SYSTEMS LTD", shortName: "Bharat Industrial Systems", tenderId: "CPCL-2026-041", complianceScore: 74, riskLevel: "HIGH",
    values: { gstStatus: "ACTIVE", gstin: "33AAACB4455K1Z2", pan: "AAACB4455K", udyam: "UDYAM-TN-02-0041182", bis: "CM/L-6400781321", oem: null, localContent: 42, blacklistStatus: "CLEAR", flow: 105, pressure: 11, efficiency: 91, motorPower: 11, mii: true, epfoStatus: "ACTIVE", esicStatus: "ACTIVE", emd: true, identityMatch: "REGISTERED ENTITY", warrantyMonths: 24, turnover: 3.9, certificateExpired: true },
    categoryScores: { Legal: 100, Financial: 65, Technical: 96, Statutory: 75, "Tender Specific": 55 },
    documents: makeDocs("BIDDER-BHARAT", [["GST_Bharat.pdf", "GST Certificate", 2, 98, "PASS"], ["PAN_Bharat.pdf", "PAN", 1, 99, "PASS"], ["Udyam_Bharat.pdf", "Udyam/MSME", 2, 96, "PASS"], ["Turnover_Bharat.pdf", "Turnover Certificate", 3, 95, "FAIL"], ["BIS_Bharat_Expired.pdf", "BIS Certificate", 3, 97, "FAIL", "2026-08-10"], ["Technical_Bharat.pdf", "Technical Datasheet", 5, 96, "PASS"], ["Local_Content_Bharat.pdf", "Local Content Declaration", 1, 94, "PASS"]])
  },
  {
    id: "BIDDER-NOVA", bidId: "BID-003", company: "NOVA ENGINEERING WORKS", shortName: "Nova Engineering", tenderId: "CPCL-2026-041", complianceScore: 62, riskLevel: "HIGH",
    values: { gstStatus: "ACTIVE", gstin: "27AABFN7721L1Z8", pan: "AABFN7721L", udyam: null, bis: null, oem: true, localContent: 31, blacklistStatus: "CLEAR", flow: 82, pressure: 7, efficiency: 87, motorPower: 9, mii: true, epfoStatus: "ACTIVE", esicStatus: "ACTIVE", emd: true, identityMatch: "REGISTERED ENTITY", warrantyMonths: 18, turnover: 4.1, certificateExpired: false, contradiction: true },
    categoryScores: { Legal: 95, Financial: 68, Technical: 42, Statutory: 50, "Tender Specific": 58 },
    documents: makeDocs("BIDDER-NOVA", [["GST_Nova.pdf", "GST Certificate", 2, 97, "PASS"], ["PAN_Nova.pdf", "PAN", 1, 98, "PASS"], ["Financial_Nova.pdf", "Financial Statement", 12, 91, "FAIL"], ["OEM_Nova.pdf", "OEM Authorization", 2, 88, "PASS"], ["Technical_Nova.pdf", "Technical Datasheet", 4, 89, "FAIL"], ["Local_Content_Nova.pdf", "Local Content Declaration", 1, 92, "FAIL"]])
  },
  {
    id: "BIDDER-DELTA", bidId: "BID-004", company: "DELTA MECHANICAL SOLUTIONS", shortName: "Delta Mechanical Solutions", tenderId: "CPCL-2026-041", complianceScore: 91, riskLevel: "LOW",
    values: { gstStatus: "ACTIVE", gstin: "29AACFD8890R1Z4", pan: "AACFD8890R", udyam: "UDYAM-KR-03-0088140", bis: "CM/L-6400991142", oem: true, localContent: 48, blacklistStatus: "CLEAR", flow: 125, pressure: 12, efficiency: 94, motorPower: 14, mii: true, epfoStatus: "ACTIVE", esicStatus: "ACTIVE", emd: true, identityMatch: "REGISTERED ENTITY", warrantyMonths: 36, turnover: 9.2, certificateExpired: false },
    categoryScores: { Legal: 100, Financial: 100, Technical: 100, Statutory: 100, "Tender Specific": 96 },
    documents: makeDocs("BIDDER-DELTA", [["GST_Delta.pdf", "GST Certificate", 2, 99, "PASS"], ["PAN_Delta.pdf", "PAN", 1, 99, "PASS"], ["Udyam_Delta.pdf", "Udyam/MSME", 2, 98, "PASS"], ["Financial_Delta.pdf", "Financial Statement", 16, 97, "PASS"], ["OEM_Delta.pdf", "OEM Authorization", 2, 98, "PASS", "2028-03-31"], ["BIS_Delta.pdf", "BIS Certificate", 3, 99, "PASS", "2028-01-01"], ["Technical_Delta.pdf", "Technical Datasheet", 5, 99, "PASS"], ["Local_Content_Delta.pdf", "Local Content Declaration", 1, 98, "PASS"]])
  }
];

const fieldMap: Record<string, { field: string; value: (b: Bidder) => string | number; page?: number }[]> = {
  "GST Certificate": [{ field: "gstStatus", value: b => String(b.values.gstStatus) }, { field: "gstin", value: b => String(b.values.gstin) }],
  PAN: [{ field: "pan", value: b => String(b.values.pan) }],
  "Udyam/MSME": [{ field: "udyam", value: b => String(b.values.udyam) }],
  "Financial Statement": [{ field: "turnover", value: b => Number(b.values.turnover), page: 8 }],
  "Turnover Certificate": [{ field: "turnover", value: b => Number(b.values.turnover), page: 2 }],
  "OEM Authorization": [{ field: "oem", value: b => String(b.values.oem), page: 1 }],
  "BIS Certificate": [{ field: "bis", value: b => String(b.values.bis), page: 3 }],
  "Technical Datasheet": [
    { field: "motorPower", value: b => Number(b.values.motorPower), page: 4 }, { field: "flow", value: b => Number(b.values.flow), page: 4 },
    { field: "pressure", value: b => Number(b.values.pressure), page: 4 }, { field: "efficiency", value: b => Number(b.values.efficiency), page: 4 },
  ],
  "Local Content Declaration": [{ field: "localContent", value: b => Number(b.values.localContent), page: 1 }],
};

const evidence: Evidence[] = [];
bidders.forEach((bidder) => bidder.documents.forEach((document) => {
  (fieldMap[document.type] ?? []).forEach((entry) => {
    if (entry.value(bidder) === "null" || Number.isNaN(entry.value(bidder))) return;
    const id = `EV-${String(evidence.length + 1).padStart(3, "0")}`;
    const value = entry.value(bidder);
    evidence.push({ id, bidderId: bidder.id, documentId: document.id, page: entry.page ?? 1, field: entry.field, value, text: `${entry.field.replace(/([A-Z])/g, " $1")}: ${value}`, confidence: document.confidence, sourceClause: requirements.find(r => r.field === entry.field)?.sourceClause ?? "Supporting document" });
    document.evidenceIds.push(id);
    document.extractedFields.push({ id: `FIELD-${id}`, documentId: document.id, field: entry.field, value, normalizedValue: value, confidence: document.confidence });
  });
}));

export function createDemoState(): AppState {
  const base: AppState = {
    user: { id: "USR-001", name: "Avneesh Yadav", email: "officer@cpcl.demo", role: "Procurement Officer", organization: "Chennai Petroleum Corporation Limited" },
    tender: { id: "CPCL-2026-041", title: "Supply of Industrial Pumps", department: "Procurement / Engineering", submissionDate: "2026-08-25", status: "Technical Evaluation", progress: 92, requirements },
    bidders, evidence, results: [], findings: [], risks: [], governmentVerifications: [], audit: [
      { id: "AUD-001", timestamp: "2026-08-18T09:12:00Z", user: "Ananya Rao", action: "Tender uploaded", entity: "CPCL-2026-041", result: "Success" },
      { id: "AUD-002", timestamp: "2026-08-18T09:14:00Z", user: "BidGuard Engine", action: "Requirements extracted", entity: "18 requirements", result: "Completed" },
      { id: "AUD-003", timestamp: "2026-08-26T10:05:00Z", user: "Verification Analyst", action: "Bidder documents classified", entity: "4 bidders", result: "Completed" },
    ], decisions: [], reports: [], categoryWeights: { Legal: 20, Financial: 20, Technical: 30, Statutory: 15, "Tender Specific": 15 },
    notifications: ["High-risk bidder detected: Bharat Industrial Systems", "Certificate expired: BIS_Bharat_Expired.pdf", "Missing document detected: Nova Engineering", "Review required: ABC Industries identity records"],
  };
  const allResults = bidders.flatMap((bidder) => runCompliance(base.tender, bidder, evidence));
  base.results = allResults;
  base.risks = bidders.map((bidder) => calculateRisk(bidder, allResults.filter(r => r.bidderId === bidder.id), base.tender));
  base.findings = createFindings(base, allResults);
  return structuredClone(base);
}

export const documentTypes = ["GST Certificate", "PAN", "Udyam/MSME", "ITR", "Financial Statement", "Turnover Certificate", "OEM Authorization", "BIS Certificate", "Technical Datasheet", "Make in India Declaration", "Local Content Declaration", "Blacklisting Declaration", "EPFO", "ESIC", "Other"];

export function classifyFilename(filename: string) {
  const name = filename.toLowerCase();
  if (name.includes("gst") || name.includes("vendor_doc_01")) return "GST Certificate";
  if (name.includes("pan") || name.includes("document_02")) return "PAN";
  if (name.includes("udyam") || name.includes("certificate_03")) return "Udyam/MSME";
  if (name.includes("oem") || name.includes("file_04")) return "OEM Authorization";
  if (name.includes("technical") || name.includes("spec_05") || name.includes("datasheet")) return "Technical Datasheet";
  if (name.includes("bis")) return "BIS Certificate";
  if (name.includes("turnover")) return "Turnover Certificate";
  if (name.includes("financial")) return "Financial Statement";
  return "Other";
}
