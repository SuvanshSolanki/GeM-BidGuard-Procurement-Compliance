export type Status = "PASS" | "FAIL" | "REVIEW";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";
export type RequirementCategory = "Legal" | "Financial" | "Technical" | "Statutory" | "Tender Specific";
export type Operator = "==" | "!=" | ">" | "<" | ">=" | "<=" | "exists" | "not_exists" | "date_valid" | "date_expired" | "matches" | "contains";

export interface User { id: string; name: string; email: string; role: "Procurement Officer" | "Verification Analyst" | "Administrator"; organization: string; }
export interface Requirement { id: string; category: RequirementCategory; title: string; mandatory: boolean; operator: Operator; requiredValue: string | number | boolean; unit?: string; weight: number; sourceClause: string; sourcePage: number; requiredDocumentTypes: string[]; field: string; }
export interface Tender { id: string; title: string; department: string; submissionDate: string; status: string; progress: number; requirements: Requirement[]; }
export interface ExtractedField { id: string; documentId: string; field: string; value: string | number; normalizedValue: string | number; confidence: number; }
export interface Document { id: string; bidderId: string; filename: string; type: string; pages: number; status: "READY" | "PROCESSING" | "REVIEW"; confidence: number; expiry?: string; verification: Status; evidenceIds: string[]; extractedFields: ExtractedField[]; previewText: string; }
export interface Evidence { id: string; bidderId: string; documentId: string; page: number; field: string; value: string | number; text: string; confidence: number; sourceClause: string; }
export interface Bidder { id: string; bidId: string; company: string; shortName: string; tenderId: string; complianceScore: number; riskLevel: RiskLevel; values: Record<string, string | number | boolean | null>; documents: Document[]; categoryScores: Record<RequirementCategory, number>; }
export interface ComplianceResult { requirementId: string; bidderId: string; status: Status; actualValue: string | number | boolean | null; requiredValue: string | number | boolean; reason: string; confidence: number; evidenceIds: string[]; checkedAt: string; rule: string; }
export interface Finding { id: string; bidderId: string; severity: "Critical" | "High" | "Medium" | "Low" | "Review"; category: string; title: string; description: string; requirementId?: string; evidenceIds: string[]; resolved: boolean; }
export interface RiskContribution { label: string; points: number; }
export interface RiskAssessment { bidderId: string; score: number; level: RiskLevel; contributions: RiskContribution[]; }
export interface GovernmentVerification { id: string; bidderId: string; service: string; identifier: string; status: string; details: Record<string, string>; mode: "Prototype / Simulated"; checkedAt: string; }
export interface AuditLog { id: string; timestamp: string; user: string; action: string; entity: string; bidder?: string; document?: string; result: string; }
export interface OfficerDecision { bidderId: string; decision: "ELIGIBLE" | "NOT ELIGIBLE" | "REQUIRES CLARIFICATION" | "MANUAL REVIEW"; comment: string; decidedBy: string; decidedAt: string; }
export interface Report { id: string; bidderId: string; generatedAt: string; status: "Generated"; }
export interface AppState { user: User; tender: Tender; bidders: Bidder[]; evidence: Evidence[]; results: ComplianceResult[]; findings: Finding[]; risks: RiskAssessment[]; governmentVerifications: GovernmentVerification[]; audit: AuditLog[]; decisions: OfficerDecision[]; reports: Report[]; categoryWeights: Record<RequirementCategory, number>; notifications: string[]; }
