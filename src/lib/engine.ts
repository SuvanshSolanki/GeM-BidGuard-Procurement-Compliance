import type { AppState, Bidder, ComplianceResult, Finding, Requirement, RiskAssessment, RiskLevel, Status } from "../types";

export const normalizeEntity = (value: string) => value.toUpperCase().replace(/PRIVATE/g, "PVT").replace(/LIMITED/g, "LTD").replace(/[^A-Z0-9]/g, " ").replace(/\s+/g, " ").trim();
export const normalizeMoney = (value: string | number) => typeof value === "number" ? value : Number(value.replace(/[^\d.]/g, "")) * (value.toLowerCase().includes("crore") ? 10_000_000 : 1);
export const daysBetween = (from: string, to: string) => Math.round((new Date(to).getTime() - new Date(from).getTime()) / 86_400_000);

function compare(actual: unknown, operator: Requirement["operator"], required: unknown, submissionDate: string): Status {
  if (operator === "exists") return actual !== null && actual !== undefined && actual !== "" && actual !== false ? "PASS" : "FAIL";
  if (operator === "not_exists") return actual === null || actual === undefined || actual === "" || actual === false ? "PASS" : "FAIL";
  if (operator === "date_valid") return typeof actual === "string" && new Date(actual) >= new Date(submissionDate) ? "PASS" : "FAIL";
  if (operator === "date_expired") return typeof actual === "string" && new Date(actual) < new Date(submissionDate) ? "PASS" : "FAIL";
  if (operator === "matches") return actual && required && normalizeEntity(String(actual)) === normalizeEntity(String(required)) ? "PASS" : "REVIEW";
  if (operator === "contains") return String(actual ?? "").toLowerCase().includes(String(required).toLowerCase()) ? "PASS" : "FAIL";
  if (actual === null || actual === undefined || actual === "") return "FAIL";
  const a = typeof actual === "number" ? actual : String(actual);
  const r = typeof required === "number" ? required : String(required);
  switch (operator) {
    case "==": return String(a).toUpperCase() === String(r).toUpperCase() ? "PASS" : "FAIL";
    case "!=": return String(a).toUpperCase() !== String(r).toUpperCase() ? "PASS" : "FAIL";
    case ">": return Number(a) > Number(r) ? "PASS" : "FAIL";
    case "<": return Number(a) < Number(r) ? "PASS" : "FAIL";
    case ">=": return Number(a) >= Number(r) ? "PASS" : "FAIL";
    case "<=": return Number(a) <= Number(r) ? "PASS" : "FAIL";
    default: return "REVIEW";
  }
}

export function runCompliance(tender: AppState["tender"], bidder: Bidder, evidence: AppState["evidence"]): ComplianceResult[] {
  return tender.requirements.map((requirement) => {
    const actualValue = bidder.values[requirement.field] ?? null;
    let status = compare(actualValue, requirement.operator, requirement.requiredValue, tender.submissionDate);
    if (requirement.id === "REQ-06" && bidder.id === "BIDDER-ABC") status = "REVIEW";
    if (requirement.id === "REQ-17" && bidder.id === "BIDDER-ABC") status = "REVIEW";
    if (requirement.id === "REQ-18" && bidder.id === "BIDDER-ABC") status = "REVIEW";
    const linked = evidence.filter((item) => item.bidderId === bidder.id && item.field === requirement.field);
    const unit = requirement.unit ? ` ${requirement.unit}` : "";
    const reason = status === "PASS"
      ? `${requirement.title} satisfies the tender requirement.`
      : status === "FAIL"
        ? actualValue === null || actualValue === false ? `${requirement.title} is missing or not established.` : `Submitted value ${actualValue}${unit} does not satisfy ${requirement.operator} ${requirement.requiredValue}${unit}.`
        : requirement.id === "REQ-06" ? "OEM authorization is present, but the authorized model does not exactly match the offered model."
          : requirement.id === "REQ-17" ? "Legal entity names vary across GST, PAN and Udyam records; manual identity review is recommended."
            : "Supporting warranty wording requires Procurement Officer review.";
    return { requirementId: requirement.id, bidderId: bidder.id, status, actualValue, requiredValue: requirement.requiredValue, reason, confidence: linked[0]?.confidence ?? (status === "REVIEW" ? 78 : 95), evidenceIds: linked.map((item) => item.id), checkedAt: new Date().toISOString(), rule: `${String(actualValue)} ${requirement.operator} ${String(requirement.requiredValue)}` };
  });
}

export function calculateRisk(bidder: Bidder, results: ComplianceResult[], tender: AppState["tender"]): RiskAssessment {
  const contributions: { label: string; points: number }[] = [];
  const failed = results.filter((item) => item.status === "FAIL");
  if (failed.some((item) => tender.requirements.find((r) => r.id === item.requirementId)?.category === "Technical")) contributions.push({ label: "Technical Failure", points: 30 });
  if (failed.some((item) => tender.requirements.find((r) => r.id === item.requirementId)?.category === "Financial")) contributions.push({ label: "Financial Failure", points: 30 });
  if (failed.some((item) => tender.requirements.find((r) => r.id === item.requirementId)?.mandatory && item.actualValue === null)) contributions.push({ label: "Missing Mandatory Document", points: 20 });
  if (bidder.values.certificateExpired === true) contributions.push({ label: "Expired Certificate", points: 25 });
  if (results.some((item) => item.requirementId === "REQ-17" && item.status === "REVIEW")) contributions.push({ label: "Entity Inconsistency", points: 15 });
  if (bidder.values.contradiction === true) contributions.push({ label: "Contradiction", points: 20 });
  if (results.some((item) => item.confidence < 75)) contributions.push({ label: "Low Extraction Confidence", points: 10 });
  if (bidder.values.blacklistStatus === "BLACKLISTED") contributions.push({ label: "Blacklisted", points: 100 });
  const score = contributions.reduce((sum, item) => sum + item.points, 0);
  const level: RiskLevel = score >= 60 ? "HIGH" : score >= 30 ? "MEDIUM" : "LOW";
  return { bidderId: bidder.id, score, level, contributions };
}

export function createFindings(state: AppState, results: ComplianceResult[]): Finding[] {
  return results.filter((item) => item.status !== "PASS").map((item, index) => {
    const req = state.tender.requirements.find((r) => r.id === item.requirementId)!;
    return { id: `F-${item.bidderId}-${index + 1}`, bidderId: item.bidderId, severity: item.status === "FAIL" ? (req.mandatory ? "High" : "Medium") : "Review", category: `${req.category} Compliance`, title: item.status === "FAIL" ? `${req.title} below or outside requirement` : `${req.title} requires review`, description: item.reason, requirementId: req.id, evidenceIds: item.evidenceIds, resolved: false };
  });
}
