import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Archive,
  BadgeCheck,
  Bell,
  Bot,
  Building2,
  Check,
  ChevronRight,
  CircleUserRound,
  ClipboardCheck,
  Download,
  FileCheck2,
  FileSearch,
  FileText,
  Gauge,
  HelpCircle,
  History,
  Home,
  Landmark,
  LayoutGrid,
  LockKeyhole,
  Menu,
  Play,
  Plus,
  Printer,
  RefreshCw,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { classifyFilename, createDemoState, documentTypes } from "./lib/demo";
import {
  calculateRisk,
  createFindings,
  daysBetween,
  runCompliance,
} from "./lib/engine";
import type {
  AppState,
  Bidder,
  ComplianceResult,
  Document,
  Evidence,
  RequirementCategory,
  Status,
} from "./types";

type Page =
  | "dashboard"
  | "tenders"
  | "tender"
  | "create-tender"
  | "bidders"
  | "bidder"
  | "documents"
  | "compliance"
  | "matrix"
  | "verification"
  | "technical"
  | "evidence"
  | "risk"
  | "government"
  | "reports"
  | "audit"
  | "settings";

const nav: { id: Page; label: string; icon: typeof Home }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "tenders", label: "Tenders", icon: FileText },
  { id: "bidders", label: "Bidders", icon: Users },
  { id: "documents", label: "Documents", icon: Archive },
  { id: "compliance", label: "Compliance", icon: ClipboardCheck },
  { id: "verification", label: "Verification Center", icon: ShieldCheck },
  { id: "technical", label: "Technical Compliance", icon: SlidersHorizontal },
  { id: "evidence", label: "Evidence Explorer", icon: FileSearch },
  { id: "risk", label: "Risk & Findings", icon: AlertTriangle },
  { id: "government", label: "Government Verification", icon: Landmark },
  { id: "reports", label: "Reports", icon: FileCheck2 },
  { id: "audit", label: "Audit Trail", icon: History },
  { id: "settings", label: "Settings", icon: Settings },
];
const verificationSteps = [
  "Reading Tender",
  "Extracting Requirements",
  "Loading Bidder Documents",
  "Classifying Documents",
  "Extracting Fields",
  "Normalizing Values",
  "Checking Validity",
  "Cross-Checking Identity",
  "Comparing Technical Data",
  "Running Compliance Rules",
  "Calculating Score",
  "Calculating Risk",
  "Linking Evidence",
  "Preparing Findings",
];
const processingSteps = [
  "Reading document",
  "Classifying document",
  "Extracting information",
  "Normalizing fields",
  "Creating evidence",
  "Finished",
];
const statusClass = (status: string) =>
  `status status-${status.toLowerCase().replace(/\s/g, "-")}`;
const labelValue = (value: unknown, unit?: string) =>
  value === null || value === undefined || value === false
    ? "Not submitted"
    : `${String(value)}${unit ? ` ${unit}` : ""}`;

export default function App() {
  const [screen, setScreen] = useState<"landing" | "login" | "app">("landing");
  const [page, setPage] = useState<Page>("dashboard");
  const [state, setState] = useState<AppState>(() => createDemoState());
  const [selectedBidderId, setSelectedBidderId] = useState("BIDDER-ABC");
  const [selectedResult, setSelectedResult] = useState<ComplianceResult | null>(
    null,
  );
  const [selectedEvidenceId, setSelectedEvidenceId] = useState("EV-001");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [toast, setToast] = useState("");
  const firstLoad = useRef(true);

  useEffect(() => {
    fetch("/api/state")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.snapshot?.tender) setState(data.snapshot);
      })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    const timer = window.setTimeout(
      () =>
        fetch("/api/state", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ snapshot: state }),
        }).catch(() => undefined),
      400,
    );
    return () => window.clearTimeout(timer);
  }, [state]);
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(""), 2800);
    return () => window.clearTimeout(id);
  }, [toast]);

  const bidder =
    state.bidders.find((item) => item.id === selectedBidderId) ??
    state.bidders[0];
  const navigate = (next: Page, bidderId?: string) => {
    if (bidderId) setSelectedBidderId(bidderId);
    setPage(next);
    setSidebarOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const updateState = (
    updater: (current: AppState) => AppState,
    message?: string,
  ) => {
    setState(updater);
    if (message) setToast(message);
  };
  const openResult = (result: ComplianceResult) => {
    setSelectedResult(result);
    const evidenceId = result.evidenceIds[0];
    if (evidenceId) setSelectedEvidenceId(evidenceId);
  };

  if (screen === "landing")
    return <Landing onLaunch={() => setScreen("login")} />;
  if (screen === "login") return <Login onContinue={() => setScreen("app")} />;

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard state={state} navigate={navigate} />;
      case "tenders":
        return <Tenders state={state} navigate={navigate} />;
      case "tender":
        return (
          <TenderDetail
            state={state}
            navigate={navigate}
            openResult={openResult}
          />
        );
      case "create-tender":
        return (
          <CreateTender
            onCreated={() => {
              setToast("Draft tender created");
              navigate("tenders");
            }}
            onCancel={() => navigate("tenders")}
          />
        );
      case "bidders":
        return <Bidders state={state} navigate={navigate} />;
      case "bidder":
        return (
          <BidderDetail
            state={state}
            bidder={bidder}
            navigate={navigate}
            openResult={openResult}
          />
        );
      case "documents":
        return (
          <DocumentsPage
            state={state}
            selectedBidderId={selectedBidderId}
            setSelectedBidderId={setSelectedBidderId}
            updateState={updateState}
          />
        );
      case "compliance":
        return (
          <CompliancePage
            state={state}
            bidder={bidder}
            setSelectedBidderId={setSelectedBidderId}
            openResult={openResult}
            navigate={navigate}
          />
        );
      case "matrix":
        return <ComplianceMatrix state={state} openResult={openResult} />;
      case "verification":
        return (
          <VerificationCenter
            state={state}
            bidder={bidder}
            setSelectedBidderId={setSelectedBidderId}
            updateState={updateState}
          />
        );
      case "technical":
        return (
          <TechnicalPage
            state={state}
            bidder={bidder}
            setSelectedBidderId={setSelectedBidderId}
            openResult={openResult}
          />
        );
      case "evidence":
        return (
          <EvidenceExplorer
            state={state}
            evidenceId={selectedEvidenceId}
            setEvidenceId={setSelectedEvidenceId}
          />
        );
      case "risk":
        return (
          <RiskFindings
            state={state}
            setSelectedBidderId={setSelectedBidderId}
            openResult={openResult}
            updateState={updateState}
          />
        );
      case "government":
        return (
          <GovernmentCenter
            state={state}
            bidder={bidder}
            setSelectedBidderId={setSelectedBidderId}
            updateState={updateState}
          />
        );
      case "reports":
        return (
          <Reports
            state={state}
            bidder={bidder}
            setSelectedBidderId={setSelectedBidderId}
            updateState={updateState}
          />
        );
      case "audit":
        return <AuditTrail state={state} />;
      case "settings":
        return <SettingsPage state={state} updateState={updateState} />;
    }
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>
          <X size={20} />
        </button>
        <div className="brand-block">
          <div className="brand-mark">
            <ShieldCheck size={22} />
          </div>
          <div>
            <strong>GeM-BidGuard</strong>
            <small>CPCL · Smart Automation</small>
          </div>
        </div>
        <nav>
          {nav.map((item) => (
            <button
              key={item.id}
              className={
                page === item.id ||
                (page === "matrix" && item.id === "compliance")
                  ? "active"
                  : ""
              }
              onClick={() => navigate(item.id)}
            >
              <item.icon size={17} />
              <span>{item.label}</span>
              {item.id === "risk" && <b>5</b>}
            </button>
          ))}
        </nav>
        <div className="sidebar-note">
          <Bot size={18} />
          <div>
            <strong>AI-assisted only</strong>
            <span>Final decisions remain with the Procurement Officer.</span>
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu />
            </button>
            <div>
              <b>GeM-BidGuard</b>
              <span>Procurement Compliance System</span>
            </div>
          </div>
          <div className="topbar-right">
            <span className="org-chip">
              <Building2 size={15} /> CPCL
            </span>
            <div className="popover-wrap">
              <button
                className="icon-button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <Bell size={19} />
                <i />
              </button>
              {notificationsOpen && (
                <div className="notifications">
                  <div className="popover-title">
                    Notifications <span>{state.notifications.length}</span>
                  </div>
                  {state.notifications.map((note) => (
                    <p key={note}>
                      <AlertTriangle size={14} />
                      {note}
                    </p>
                  ))}
                </div>
              )}
            </div>
            <div className="profile">
              <div className="avatar">AR</div>
              <div>
                <strong>Ananya Rao</strong>
                <span>Procurement Officer</span>
              </div>
            </div>
          </div>
        </header>
        <main>{renderPage()}</main>
        <button
          className="ask-fab"
          onClick={() => setAssistantOpen(!assistantOpen)}
        >
          <Sparkles size={18} /> Ask BidGuard
        </button>
        {assistantOpen && (
          <AskBidGuard
            state={state}
            bidder={bidder}
            onClose={() => setAssistantOpen(false)}
          />
        )}
      </div>
      {sidebarOpen && (
        <div className="scrim" onClick={() => setSidebarOpen(false)} />
      )}
      {selectedResult && (
        <WhyPanel
          state={state}
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
          onEvidence={(id) => {
            setSelectedEvidenceId(id);
            setSelectedResult(null);
            navigate("evidence");
          }}
        />
      )}
      {toast && (
        <div className="toast">
          <Check size={17} />
          {toast}
        </div>
      )}
    </div>
  );
}

function Landing({ onLaunch }: { onLaunch: () => void }) {
  const workflow = [
    "Tender",
    "Documents",
    "AI Extraction",
    "Compliance Engine",
    "Risk",
    "Evidence",
    "Officer Decision",
  ];
  const features = [
    [FileSearch, "AI Document Verification"],
    [ClipboardCheck, "Tender Requirement Extraction"],
    [RefreshCw, "Cross-Document Validation"],
    [Gauge, "Technical Compliance"],
    [AlertTriangle, "Risk Scoring"],
    [FileCheck2, "Evidence Traceability"],
    [History, "Audit Trail"],
    [CircleUserRound, "Human-in-the-Loop"],
  ] as const;
  return (
    <div className="landing">
      <header className="landing-nav">
        <div className="brand-block">
          <div className="brand-mark">
            <ShieldCheck />
          </div>
          <div>
            <strong>GeM-BidGuard</strong>
            <small>SIH 26100 · CPCL</small>
          </div>
        </div>
        <button className="button button-outline" onClick={onLaunch}>
          LAUNCH DEMO <ChevronRight size={16} />
        </button>
      </header>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow">
            <Landmark size={15} /> Ministry of Petroleum & Natural Gas · CPCL
          </div>
          <h1>
            AI-Powered Bid Compliance Verification for <em>GeM Procurement</em>
          </h1>
          <p>
            Automate document verification, tender compliance analysis,
            cross-document validation, risk assessment and evidence-based
            review.
          </p>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onLaunch}>
              LAUNCH DEMO <ChevronRight size={17} />
            </button>
            <a className="button button-ghost" href="#workflow">
              VIEW WORKFLOW
            </a>
          </div>
          <div className="trust-row">
            <BadgeCheck size={18} />
            <span>Deterministic rules</span>
            <BadgeCheck size={18} />
            <span>Evidence-linked findings</span>
            <BadgeCheck size={18} />
            <span>Human authority retained</span>
          </div>
        </div>
        <div className="hero-console">
          <div className="console-top">
            <span>LIVE COMPLIANCE ASSESSMENT</span>
            <i>PROTOTYPE</i>
          </div>
          <div className="console-score">
            <div className="score-ring">
              <b>87</b>
              <span>/100</span>
            </div>
            <div>
              <small>ABC INDUSTRIES PVT LTD</small>
              <h3>Substantially compliant</h3>
              <span className="status status-medium">MEDIUM RISK</span>
            </div>
          </div>
          <div className="console-checks">
            <p>
              <Check /> GST, PAN, Udyam and BIS verified
            </p>
            <p>
              <XCircle /> Pressure: 8 bar vs required 10 bar
            </p>
            <p>
              <AlertTriangle /> OEM model and entity identity need review
            </p>
          </div>
          <div className="evidence-strip">
            <FileSearch />
            <div>
              <small>EVIDENCE LINKED</small>
              <b>Technical_Datasheet.pdf · Page 4</b>
            </div>
            <span>97%</span>
          </div>
        </div>
      </section>
      <section id="workflow" className="workflow-section">
        <div className="section-label">END-TO-END WORKFLOW</div>
        <h2>From tender clause to officer decision</h2>
        <div className="workflow-track">
          {workflow.map((item, index) => (
            <div key={item} className="workflow-item">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <b>{item}</b>
              {index < workflow.length - 1 && <ChevronRight />}
            </div>
          ))}
        </div>
      </section>
      <section className="feature-section">
        <div className="section-label">CORE CAPABILITIES</div>
        <div className="feature-grid">
          {features.map(([Icon, title], index) => (
            <article key={title}>
              <div>
                <Icon />
              </div>
              <span>0{index + 1}</span>
              <h3>{title}</h3>
              <p>
                {
                  [
                    "Classify, extract and verify submitted procurement documents.",
                    "Convert tender clauses into reusable structured requirements.",
                    "Surface information inconsistencies without alleging fraud.",
                    "Compare offered specifications using code-based arithmetic.",
                    "Trace every risk point to an exact contributor.",
                    "Open every result at its source document and page.",
                    "Preserve a timestamped history of review activity.",
                    "Keep qualification and award authority with officials.",
                  ][index]
                }
              </p>
            </article>
          ))}
        </div>
      </section>
      <section className="impact">
        <div>
          <span>INTENDED OUTCOMES</span>
          <h2>Expected Impact</h2>
          <p>
            Problem-statement outcomes targeted by an integrated compliance
            workflow.
          </p>
        </div>
        <ul>
          {[
            "60–80% Reduction in Verification Effort",
            "Faster Tender Evaluation & Award",
            "Improved Compliance & Transparency",
            "Reduced Human Errors & Inconsistencies",
            "Better Bidder Screening & Risk Identification",
            "Standardized Verification Across CPSEs",
            "Complete Auditability & Traceability",
          ].map((item) => (
            <li key={item}>
              <Check />
              {item}
            </li>
          ))}
        </ul>
      </section>
      <footer className="landing-footer">
        <div>
          <strong>AI VERIFIES.</strong>
          <b>HUMANS DECIDE.</b>
        </div>
        <p>
          AI-assisted verification only. Final procurement
          qualification/disqualification and award decisions remain with the
          authorized Procurement Officer.
        </p>
      </footer>
    </div>
  );
}

function Login({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="login-page">
      <div className="login-context">
        <div className="brand-block light">
          <div className="brand-mark">
            <ShieldCheck />
          </div>
          <div>
            <strong>GeM-BidGuard</strong>
            <small>Government Procurement Compliance</small>
          </div>
        </div>
        <div className="login-message">
          <span>SIH PROBLEM 26100</span>
          <h1>
            One evidence trail.
            <br />
            Every compliance decision.
          </h1>
          <p>
            AI-assisted verification for GeM procurement by Chennai Petroleum
            Corporation Limited.
          </p>
        </div>
        <div className="login-principle">
          <Bot />
          <div>
            <strong>AI VERIFIES.</strong>
            <b>HUMANS DECIDE.</b>
          </div>
        </div>
      </div>
      <div className="login-card-wrap">
        <form
          className="login-card"
          onSubmit={(e) => {
            e.preventDefault();
            onContinue();
          }}
        >
          <span className="section-label">SECURE DEMO ACCESS</span>
          <h2>Continue to GeM-BidGuard</h2>
          <p>Load the complete CPCL procurement verification scenario.</p>
          <label>
            Email
            <input type="email" defaultValue="officer@cpcl.demo" />
          </label>
          <label>
            Password
            <input type="password" defaultValue="prototype2026" />
          </label>
          <label>
            Role
            <select defaultValue="Procurement Officer">
              <option>Procurement Officer</option>
              <option>Verification Analyst</option>
              <option>Administrator</option>
            </select>
          </label>
          <button className="button button-primary full" type="submit">
            <LockKeyhole size={17} /> CONTINUE DEMO
          </button>
          <small>
            No external authentication required. Prototype environment only.
          </small>
        </form>
      </div>
    </div>
  );
}

function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="page-header">
      <div>
        {eyebrow && <span>{eyebrow}</span>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}
function MetricCard({
  icon: Icon,
  label,
  value,
  tone = "blue",
  detail,
}: {
  icon: typeof Home;
  label: string;
  value: string | number;
  tone?: string;
  detail?: string;
}) {
  return (
    <article className={`metric-card tone-${tone}`}>
      <div>
        <span>{label}</span>
        <b>{value}</b>
        {detail && <small>{detail}</small>}
      </div>
      <Icon />
    </article>
  );
}
function BidderSelect({
  state,
  value,
  onChange,
}: {
  state: AppState;
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <select
      className="bidder-select"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {state.bidders.map((b) => (
        <option key={b.id} value={b.id}>
          {b.company} · {b.bidId}
        </option>
      ))}
    </select>
  );
}
function StatusPill({ status }: { status: string }) {
  return <span className={statusClass(status)}>{status}</span>;
}

function Dashboard({
  state,
  navigate,
}: {
  state: AppState;
  navigate: (p: Page, id?: string) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="CPCL · PROCUREMENT / ENGINEERING"
        title="Procurement Compliance Dashboard"
        description="Unified tender verification, bidder compliance and evidence-based review."
        actions={
          <button
            className="button button-primary"
            onClick={() => navigate("verification", "BIDDER-ABC")}
          >
            <Play size={16} /> RUN VERIFICATION
          </button>
        }
      />
      <div className="metrics-grid">
        <MetricCard
          icon={FileText}
          label="ACTIVE TENDERS"
          value="4"
          detail="2 nearing evaluation"
        />
        <MetricCard
          icon={Users}
          label="TOTAL BIDDERS"
          value="27"
          tone="indigo"
          detail="Across active tenders"
        />
        <MetricCard
          icon={ClipboardCheck}
          label="PENDING REVIEWS"
          value="6"
          tone="amber"
          detail="Officer action required"
        />
        <MetricCard
          icon={AlertTriangle}
          label="HIGH-RISK BIDS"
          value="5"
          tone="red"
          detail="Prioritized for review"
        />
      </div>
      <div className="dashboard-grid">
        <section className="panel overall-panel">
          <div className="panel-heading">
            <div>
              <span className="kicker">PORTFOLIO ASSESSMENT</span>
              <h2>Overall Compliance</h2>
            </div>
            <span>Updated today</span>
          </div>
          <div className="overall-body">
            <div className="big-score">
              <b>86</b>
              <span>%</span>
              <small>COMPLIANCE</small>
            </div>
            <div className="result-bars">
              <div>
                <span>
                  <i className="dot pass" />
                  PASS <b>17</b>
                </span>
                <div>
                  <i style={{ width: "63%" }} />
                </div>
              </div>
              <div>
                <span>
                  <i className="dot fail" />
                  FAIL <b>4</b>
                </span>
                <div>
                  <i style={{ width: "15%" }} />
                </div>
              </div>
              <div>
                <span>
                  <i className="dot review" />
                  REVIEW <b>6</b>
                </span>
                <div>
                  <i style={{ width: "22%" }} />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="panel attention-panel">
          <div className="panel-heading">
            <div>
              <span className="kicker">ACTION QUEUE</span>
              <h2>Needs Attention</h2>
            </div>
            <button onClick={() => navigate("risk")}>View all</button>
          </div>
          <div className="attention-list">
            <p>
              <span className="risk-icon high">
                <AlertTriangle />
              </span>
              <span>
                <b>Pressure rating failed</b>
                <small>ABC Industries · Technical</small>
              </span>
              <StatusPill status="HIGH" />
            </p>
            <p>
              <span className="risk-icon expire">
                <History />
              </span>
              <span>
                <b>BIS certificate expired</b>
                <small>Bharat Industrial Systems</small>
              </span>
              <StatusPill status="HIGH" />
            </p>
            <p>
              <span className="risk-icon review">
                <RefreshCw />
              </span>
              <span>
                <b>Identity inconsistency</b>
                <small>ABC Industries · Cross-check</small>
              </span>
              <StatusPill status="REVIEW" />
            </p>
          </div>
        </section>
      </div>
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">ACTIVE TENDER EVALUATIONS</span>
            <h2>Evaluation Workspace</h2>
          </div>
          <button
            className="button button-small button-outline"
            onClick={() => navigate("tenders")}
          >
            ALL TENDERS
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Tender ID</th>
                <th>Tender</th>
                <th>Bidders</th>
                <th>Requirements</th>
                <th>Progress</th>
                <th>Compliance</th>
                <th>Risk</th>
                <th />
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <b>{state.tender.id}</b>
                </td>
                <td>
                  <strong>{state.tender.title}</strong>
                  <small>{state.tender.department}</small>
                </td>
                <td>4 bidders</td>
                <td>18 requirements</td>
                <td>
                  <div className="progress">
                    <i style={{ width: "92%" }} />
                  </div>
                  <small>92%</small>
                </td>
                <td>
                  <b className="score-text">86%</b>
                </td>
                <td>
                  <StatusPill status="MEDIUM" />
                </td>
                <td>
                  <button
                    className="table-action"
                    onClick={() => navigate("tender")}
                  >
                    OPEN EVALUATION <ChevronRight size={14} />
                  </button>
                </td>
              </tr>
              <tr className="muted-row">
                <td>
                  <b>CPCL-2026-038</b>
                </td>
                <td>
                  <strong>Industrial Safety Valves</strong>
                  <small>Operations</small>
                </td>
                <td>7 bidders</td>
                <td>21 requirements</td>
                <td>
                  <div className="progress">
                    <i style={{ width: "64%" }} />
                  </div>
                  <small>64%</small>
                </td>
                <td>
                  <b>79%</b>
                </td>
                <td>
                  <StatusPill status="HIGH" />
                </td>
                <td>
                  <button className="table-action" disabled>
                    IN REVIEW
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Tenders({
  state,
  navigate,
}: {
  state: AppState;
  navigate: (p: Page) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="PROCUREMENT WORKSPACE"
        title="Tenders"
        description="Create, analyze and monitor GeM tender compliance evaluations."
        actions={
          <button
            className="button button-primary"
            onClick={() => navigate("create-tender")}
          >
            <Plus size={16} /> CREATE TENDER
          </button>
        }
      />
      <div className="filter-row">
        <div className="search">
          <Search />
          <input placeholder="Search tender ID, title or department" />
        </div>
        <button className="filter active">Active 4</button>
        <button className="filter">Draft 2</button>
        <button className="filter">Completed 11</button>
      </div>
      <section className="tender-card featured">
        <div className="tender-card-top">
          <span className="status status-active">TECHNICAL EVALUATION</span>
          <span>92% complete</span>
        </div>
        <div className="tender-card-main">
          <div className="document-emblem">
            <FileText />
          </div>
          <div>
            <span>{state.tender.id}</span>
            <h2>{state.tender.title}</h2>
            <p>{state.tender.department} · Bid submission: 25 August 2026</p>
          </div>
          <button
            className="button button-primary"
            onClick={() => navigate("tender")}
          >
            OPEN EVALUATION <ChevronRight size={16} />
          </button>
        </div>
        <div className="tender-stats">
          <span>
            <b>4</b>Bidders
          </span>
          <span>
            <b>18</b>Requirements
          </span>
          <span>
            <b>86%</b>Overall compliance
          </span>
          <span>
            <b>5</b>Open findings
          </span>
        </div>
      </section>
      <div className="mini-tender-grid">
        {[
          "CPCL-2026-038|Industrial Safety Valves|7|64",
          "CPCL-2026-033|Mechanical Seals & Spares|9|78",
          "CPCL-2026-029|Flameproof Motors|7|43",
        ].map((row) => {
          const [id, title, bids, progress] = row.split("|");
          return (
            <article className="mini-tender" key={id}>
              <span className="status status-active">ACTIVE</span>
              <small>{id}</small>
              <h3>{title}</h3>
              <p>Procurement / Engineering</p>
              <div>
                <span>{bids} bidders</span>
                <span>{progress}% reviewed</span>
              </div>
              <div className="progress">
                <i style={{ width: `${progress}%` }} />
              </div>
              <button onClick={() => navigate("tender")}>
                OPEN WORKSPACE <ChevronRight />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function TenderDetail({
  state,
  navigate,
  openResult,
}: {
  state: AppState;
  navigate: (p: Page, id?: string) => void;
  openResult: (r: ComplianceResult) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow={`${state.tender.id} · TECHNICAL EVALUATION`}
        title={state.tender.title}
        description={`${state.tender.department} · Bid submission date: 25 August 2026`}
        actions={
          <>
            <button
              className="button button-outline"
              onClick={() => navigate("matrix")}
            >
              <LayoutGrid size={16} /> COMPLIANCE MATRIX
            </button>
            <button
              className="button button-primary"
              onClick={() => navigate("verification", "BIDDER-ABC")}
            >
              <Play size={16} /> RUN FULL VERIFICATION
            </button>
          </>
        }
      />
      <div className="tender-summary">
        <div>
          <span>TENDER STATUS</span>
          <b>Technical Evaluation</b>
        </div>
        <div>
          <span>REQUIREMENTS</span>
          <b>18 extracted</b>
        </div>
        <div>
          <span>BIDDERS</span>
          <b>4 submissions</b>
        </div>
        <div>
          <span>REVIEW PROGRESS</span>
          <b>92%</b>
        </div>
      </div>
      <div className="content-grid wide-left">
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="kicker">STRUCTURED TENDER REQUIREMENTS</span>
              <h2>18 Compliance Requirements</h2>
            </div>
            <span>Source linked</span>
          </div>
          <div className="requirement-list">
            {state.tender.requirements.map((req) => (
              <div key={req.id}>
                <span
                  className={`category-icon ${req.category.toLowerCase().replace(" ", "-")}`}
                >
                  {req.id.slice(-2)}
                </span>
                <div>
                  <b>{req.title}</b>
                  <small>
                    {req.category} · Clause {req.sourceClause}, page{" "}
                    {req.sourcePage}
                  </small>
                </div>
                <span className="rule-chip">
                  {req.operator} {String(req.requiredValue)} {req.unit}
                </span>
                <span>{req.mandatory ? "MANDATORY" : "OPTIONAL"}</span>
              </div>
            ))}
          </div>
        </section>
        <aside>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="kicker">BIDDER RANKING</span>
                <h2>Compliance Snapshot</h2>
              </div>
            </div>
            {state.bidders.map((b, index) => (
              <button
                className="rank-row"
                key={b.id}
                onClick={() => navigate("bidder", b.id)}
              >
                <i>{index + 1}</i>
                <span>
                  <b>{b.shortName}</b>
                  <small>{b.bidId}</small>
                </span>
                <strong>{b.complianceScore}%</strong>
                <StatusPill status={b.riskLevel} />
              </button>
            ))}
          </section>
          <section className="panel disclaimer-card">
            <Bot />
            <div>
              <b>AI-assisted verification only</b>
              <p>
                Final procurement qualification/disqualification and award
                decisions remain with the authorized Procurement Officer.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

function CreateTender({
  onCreated,
  onCancel,
}: {
  onCreated: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="page narrow-page">
      <PageHeader
        eyebrow="NEW PROCUREMENT"
        title="Create Tender"
        description="Set up a structured compliance evaluation workspace."
      />
      <form
        className="panel form-grid"
        onSubmit={(e) => {
          e.preventDefault();
          onCreated();
        }}
      >
        <label>
          Tender ID
          <input required placeholder="CPCL-2026-042" />
        </label>
        <label>
          Tender Title
          <input required placeholder="Supply of process equipment" />
        </label>
        <label>
          Department
          <select>
            <option>Procurement / Engineering</option>
            <option>Operations</option>
            <option>Maintenance</option>
          </select>
        </label>
        <label>
          Bid Submission Date
          <input required type="date" />
        </label>
        <label className="full-field">
          Tender Document
          <input type="file" accept=".pdf,.doc,.docx" />
        </label>
        <div className="extraction-notice full-field">
          <Sparkles />
          <div>
            <b>AI-assisted requirement extraction</b>
            <span>
              The prototype creates structured clauses for officer review.
              Deterministic compliance rules remain editable before
              verification.
            </span>
          </div>
        </div>
        <div className="form-actions full-field">
          <button
            type="button"
            className="button button-ghost"
            onClick={onCancel}
          >
            CANCEL
          </button>
          <button className="button button-primary">
            CREATE & ANALYZE TENDER
          </button>
        </div>
      </form>
    </div>
  );
}

function Bidders({
  state,
  navigate,
}: {
  state: AppState;
  navigate: (p: Page, id?: string) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow={state.tender.id}
        title="Bidders"
        description={`Technical evaluation for ${state.tender.title}.`}
      />
      <div className="bidder-grid">
        {state.bidders.map((b) => {
          const risk = state.risks.find((r) => r.bidderId === b.id)!;
          const results = state.results.filter((r) => r.bidderId === b.id);
          return (
            <article className="bidder-card" key={b.id}>
              <div className="bidder-card-head">
                <div className="company-avatar">
                  {b.shortName
                    .split(" ")
                    .map((x) => x[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <small>{b.bidId}</small>
                  <h2>{b.company}</h2>
                </div>
                <StatusPill status={risk.level} />
              </div>
              <div className="score-band">
                <div>
                  <b>{b.complianceScore}</b>
                  <span>/100</span>
                  <small>COMPLIANCE SCORE</small>
                </div>
                <div>
                  <span>
                    <i className="dot pass" />
                    {results.filter((r) => r.status === "PASS").length} Pass
                  </span>
                  <span>
                    <i className="dot fail" />
                    {results.filter((r) => r.status === "FAIL").length} Fail
                  </span>
                  <span>
                    <i className="dot review" />
                    {results.filter((r) => r.status === "REVIEW").length} Review
                  </span>
                </div>
              </div>
              <div className="bidder-facts">
                <span>
                  <b>{b.documents.length}</b>Documents
                </span>
                <span>
                  <b>{risk.score}</b>Risk points
                </span>
                <span>
                  <b>
                    {state.findings.filter((f) => f.bidderId === b.id).length}
                  </b>
                  Findings
                </span>
              </div>
              <button
                className="button button-primary full"
                onClick={() => navigate("bidder", b.id)}
              >
                OPEN BIDDER REVIEW <ChevronRight size={16} />
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function BidderDetail({
  state,
  bidder,
  navigate,
  openResult,
}: {
  state: AppState;
  bidder: Bidder;
  navigate: (p: Page, id?: string) => void;
  openResult: (r: ComplianceResult) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const results = state.results.filter((r) => r.bidderId === bidder.id);
  const risk = state.risks.find((r) => r.bidderId === bidder.id)!;
  return (
    <div className="page">
      <PageHeader
        eyebrow={`${bidder.bidId} · ${state.tender.id}`}
        title={bidder.company}
        description={state.tender.title}
        actions={
          <button
            className="button button-primary"
            onClick={() => navigate("verification", bidder.id)}
          >
            <Play size={16} /> RUN FULL VERIFICATION
          </button>
        }
      />
      <div className="bidder-hero">
        <div className="bidder-main-score">
          <span>COMPLIANCE SCORE</span>
          <b>
            {bidder.complianceScore}
            <small>/100</small>
          </b>
          <StatusPill status={`${risk.level} RISK`} />
        </div>
        <div className="category-score-list">
          {Object.entries(bidder.categoryScores).map(([name, score]) => (
            <div key={name}>
              <span>
                {name}
                <b>{score}%</b>
              </span>
              <div>
                <i style={{ width: `${score}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="bidder-hero-actions">
          <button onClick={() => navigate("reports", bidder.id)}>
            <FileText />
            Generate report
          </button>
          <button onClick={() => navigate("evidence", bidder.id)}>
            <FileSearch />
            Explore evidence
          </button>
        </div>
      </div>
      <div className="tabs">
        {[
          "Overview",
          "Documents",
          "Compliance",
          "Technical",
          "Cross-Checks",
          "Evidence",
          "Audit",
        ].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {tab === "Overview" && (
        <div className="dashboard-grid">
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="kicker">COMPLIANCE ASSESSMENT</span>
                <h2>Key Results</h2>
              </div>
            </div>
            <div className="key-result-grid">
              {results.slice(0, 12).map((r) => {
                const req = state.tender.requirements.find(
                  (x) => x.id === r.requirementId,
                )!;
                return (
                  <button key={r.requirementId} onClick={() => openResult(r)}>
                    <StatusPill status={r.status} />
                    <span>
                      <b>{req.title}</b>
                      <small>{labelValue(r.actualValue, req.unit)}</small>
                    </span>
                    {r.status !== "PASS" && <em>WHY?</em>}
                  </button>
                );
              })}
            </div>
          </section>
          <section className="panel">
            <div className="panel-heading">
              <div>
                <span className="kicker">RISK ASSESSMENT</span>
                <h2>
                  {risk.score} points · {risk.level}
                </h2>
              </div>
            </div>
            <div className="risk-meter">
              <i style={{ width: `${Math.min(risk.score, 100)}%` }} />
            </div>
            <div className="risk-contributors">
              {risk.contributions.map((c) => (
                <p key={c.label}>
                  <span>{c.label}</span>
                  <b>+{c.points}</b>
                </p>
              ))}
            </div>
            <button
              className="button button-outline full"
              onClick={() => navigate("risk", bidder.id)}
            >
              OPEN RISK & FINDINGS
            </button>
          </section>
        </div>
      )}
      {tab === "Documents" && <InlineDocuments bidder={bidder} />}
      {tab === "Compliance" && (
        <InlineResults state={state} bidder={bidder} openResult={openResult} />
      )}
      {tab === "Technical" && (
        <TechnicalTable state={state} bidder={bidder} openResult={openResult} />
      )}
      {tab === "Cross-Checks" && <CrossChecks bidder={bidder} />}
      {tab === "Evidence" && (
        <EvidenceList state={state} bidder={bidder} navigate={navigate} />
      )}
      {tab === "Audit" && <AuditTrail state={state} compact />}
    </div>
  );
}

function InlineDocuments({ bidder }: { bidder: Bidder }) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">BIDDER DOCUMENTS</span>
          <h2>{bidder.documents.length} submitted files</h2>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Document</th>
              <th>Type</th>
              <th>Pages</th>
              <th>Confidence</th>
              <th>Verification</th>
            </tr>
          </thead>
          <tbody>
            {bidder.documents.map((doc) => (
              <tr key={doc.id}>
                <td>
                  <strong>{doc.filename}</strong>
                  <small>{doc.id}</small>
                </td>
                <td>{doc.type}</td>
                <td>{doc.pages}</td>
                <td>{doc.confidence}%</td>
                <td>
                  <StatusPill status={doc.verification} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function InlineResults({
  state,
  bidder,
  openResult,
}: {
  state: AppState;
  bidder: Bidder;
  openResult: (r: ComplianceResult) => void;
}) {
  const results = state.results.filter((r) => r.bidderId === bidder.id);
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">RULE ENGINE RESULTS</span>
          <h2>Compliance Assessment</h2>
        </div>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Requirement</th>
              <th>Required</th>
              <th>Found</th>
              <th>Result</th>
              <th>Confidence</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {results.map((result) => {
              const req = state.tender.requirements.find(
                (r) => r.id === result.requirementId,
              )!;
              return (
                <tr key={result.requirementId}>
                  <td>
                    <strong>{req.title}</strong>
                    <small>Clause {req.sourceClause}</small>
                  </td>
                  <td>
                    {req.operator} {req.requiredValue} {req.unit}
                  </td>
                  <td>{labelValue(result.actualValue, req.unit)}</td>
                  <td>
                    <StatusPill status={result.status} />
                  </td>
                  <td>{result.confidence}%</td>
                  <td>
                    {result.status !== "PASS" && (
                      <button
                        className="why-button"
                        onClick={() => openResult(result)}
                      >
                        WHY?
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function CrossChecks({ bidder }: { bidder: Bidder }) {
  const abc = bidder.id === "BIDDER-ABC";
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">CROSS-DOCUMENT VALIDATION</span>
          <h2>Identity & information consistency</h2>
        </div>
        <StatusPill status={abc ? "REVIEW" : "PASS"} />
      </div>
      <div className="cross-grid">
        <div>
          <span>GST</span>
          <b>{bidder.company.replace("PVT LTD", "PRIVATE LIMITED")}</b>
          <small>GST Certificate</small>
        </div>
        <div>
          <span>PAN</span>
          <b>{bidder.company}</b>
          <small>PAN Card</small>
        </div>
        <div>
          <span>Udyam</span>
          <b>{abc ? "XYZ INDUSTRIES PRIVATE LIMITED" : bidder.company}</b>
          <small>Udyam Certificate</small>
        </div>
      </div>
      {abc ? (
        <div className="finding-callout review">
          <AlertTriangle />
          <div>
            <b>INFORMATION INCONSISTENCY</b>
            <p>
              The Udyam enterprise name differs from GST and PAN records. This
              is not labeled as fraud. Manual verification is recommended.
            </p>
          </div>
        </div>
      ) : (
        <div className="finding-callout pass">
          <Check />
          <div>
            <b>ENTITY INFORMATION CONSISTENT</b>
            <p>
              Normalized legal names are likely equivalent across submitted
              records.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
function EvidenceList({
  state,
  bidder,
  navigate,
}: {
  state: AppState;
  bidder: Bidder;
  navigate: (p: Page) => void;
}) {
  return (
    <section className="panel evidence-cards">
      {state.evidence
        .filter((e) => e.bidderId === bidder.id)
        .map((e) => {
          const doc = bidder.documents.find((d) => d.id === e.documentId)!;
          return (
            <button key={e.id} onClick={() => navigate("evidence")}>
              <FileSearch />
              <span>
                <b>{e.field}</b>
                <small>
                  {doc.filename} · Page {e.page}
                </small>
              </span>
              <strong>{String(e.value)}</strong>
              <em>{e.confidence}%</em>
            </button>
          );
        })}
    </section>
  );
}

function DocumentsPage({
  state,
  selectedBidderId,
  setSelectedBidderId,
  updateState,
}: {
  state: AppState;
  selectedBidderId: string;
  setSelectedBidderId: (id: string) => void;
  updateState: (u: (s: AppState) => AppState, m?: string) => void;
}) {
  const bidder = state.bidders.find((b) => b.id === selectedBidderId)!;
  const [processing, setProcessing] = useState<{
    name: string;
    step: number;
  } | null>(null);
  const [viewing, setViewing] = useState<Document | null>(null);
  const processFile = (file: File) => {
    setProcessing({ name: file.name, step: 0 });
    let step = 0;
    const id = window.setInterval(() => {
      step++;
      if (step >= processingSteps.length) {
        window.clearInterval(id);
        const type = classifyFilename(file.name);
        updateState((current) => {
          const next = structuredClone(current);
          const target = next.bidders.find((b) => b.id === selectedBidderId)!;
          const doc: Document = {
            id: `${selectedBidderId}-DOC-${Date.now()}`,
            bidderId: selectedBidderId,
            filename: file.name,
            type,
            pages: 1,
            status: "REVIEW",
            confidence: 82,
            verification: "REVIEW",
            evidenceIds: [],
            extractedFields: [],
            previewText: `${type}\nUploaded in demo mode.\nText extraction confidence is insufficient. Manual verification is recommended.`,
          };
          target.documents.unshift(doc);
          next.audit.unshift({
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: current.user.name,
            action: "Document uploaded and classified",
            entity: type,
            bidder: target.company,
            document: file.name,
            result: "Manual Review Recommended",
          });
          return next;
        }, `${file.name} classified as ${type}`);
        setProcessing(null);
      } else setProcessing({ name: file.name, step });
    }, 260);
  };
  const changeType = (docId: string, type: string) =>
    updateState((current) => {
      const next = structuredClone(current);
      const doc = next.bidders
        .find((b) => b.id === selectedBidderId)!
        .documents.find((d) => d.id === docId)!;
      doc.type = type;
      doc.status = "REVIEW";
      return next;
    }, "Document type updated");
  const remove = (docId: string) =>
    updateState((current) => {
      const next = structuredClone(current);
      const target = next.bidders.find((b) => b.id === selectedBidderId)!;
      target.documents = target.documents.filter((d) => d.id !== docId);
      next.audit.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: current.user.name,
        action: "Document deleted",
        entity: docId,
        bidder: target.company,
        result: "Completed",
      });
      return next;
    }, "Document removed; missing document status updated");
  return (
    <div className="page">
      <PageHeader
        eyebrow="DOCUMENT INTELLIGENCE"
        title="Documents"
        description="Upload, classify, extract and index bidder submission evidence."
        actions={
          <label className="button button-primary file-button">
            <Upload size={16} /> UPLOAD DOCUMENTS
            <input
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) =>
                Array.from(e.target.files ?? []).forEach(processFile)
              }
            />
          </label>
        }
      />
      <div className="toolbar">
        <BidderSelect
          state={state}
          value={selectedBidderId}
          onChange={setSelectedBidderId}
        />
        <span>
          {bidder.documents.length} documents ·{" "}
          {bidder.documents.filter((d) => d.status === "READY").length} ready
        </span>
      </div>
      <div className="upload-zone">
        <Upload />
        <div>
          <b>Drop procurement documents here</b>
          <span>
            PDF, PNG or JPG · Multiple uploads supported · Demo OCR fallback
            enabled
          </span>
        </div>
        <label className="button button-outline file-button">
          BROWSE FILES
          <input
            type="file"
            multiple
            onChange={(e) =>
              Array.from(e.target.files ?? []).forEach(processFile)
            }
          />
        </label>
      </div>
      <section className="panel table-panel">
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Filename</th>
                <th>Document Type</th>
                <th>Pages</th>
                <th>Processing</th>
                <th>Confidence</th>
                <th>Expiry</th>
                <th>Verification</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bidder.documents.map((doc) => (
                <tr key={doc.id}>
                  <td>
                    <strong>{doc.filename}</strong>
                    <small>{doc.evidenceIds.length} evidence items</small>
                  </td>
                  <td>
                    <select
                      className="type-select"
                      value={doc.type}
                      onChange={(e) => changeType(doc.id, e.target.value)}
                    >
                      {documentTypes.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </td>
                  <td>{doc.pages}</td>
                  <td>
                    <StatusPill status={doc.status} />
                  </td>
                  <td>{doc.confidence}%</td>
                  <td>
                    {doc.expiry ? (
                      new Date(doc.expiry) <
                      new Date(state.tender.submissionDate) ? (
                        <>
                          <StatusPill status="EXPIRED" />
                          <small>
                            {daysBetween(
                              doc.expiry,
                              state.tender.submissionDate,
                            )}{" "}
                            days expired
                          </small>
                        </>
                      ) : (
                        new Date(doc.expiry).toLocaleDateString("en-IN")
                      )
                    ) : (
                      "—"
                    )}
                  </td>
                  <td>
                    <StatusPill status={doc.verification} />
                  </td>
                  <td>
                    <div className="row-actions">
                      <button title="View" onClick={() => setViewing(doc)}>
                        <FileSearch />
                      </button>
                      <button
                        title="Reprocess"
                        onClick={() =>
                          setProcessing({ name: doc.filename, step: 0 })
                        }
                      >
                        <RefreshCw />
                      </button>
                      <button title="Delete" onClick={() => remove(doc.id)}>
                        <X />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {processing && (
        <ProcessingModal
          name={processing.name}
          step={processing.step}
          onClose={() => setProcessing(null)}
        />
      )}
      {viewing && (
        <DocumentPreviewModal
          document={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
function ProcessingModal({
  name,
  step,
  onClose,
}: {
  name: string;
  step: number;
  onClose: () => void;
}) {
  useEffect(() => {
    if (step !== 0) return;
    let current = 0;
    const id = window.setInterval(() => {
      current++;
      if (current >= processingSteps.length) {
        window.clearInterval(id);
        window.setTimeout(onClose, 500);
      }
    }, 280);
    return () => window.clearInterval(id);
  }, []);
  return (
    <div className="modal-backdrop">
      <div className="processing-modal">
        <div className="processing-orbit">
          <FileSearch />
          <i />
        </div>
        <span>DOCUMENT PROCESSING</span>
        <h2>{name}</h2>
        <div className="processing-list">
          {processingSteps.map((item, index) => (
            <p
              key={item}
              className={index < step ? "done" : index === step ? "active" : ""}
            >
              {index < step ? (
                <Check />
              ) : index === step ? (
                <RefreshCw className="spin" />
              ) : (
                <i />
              )}
              {item}
            </p>
          ))}
        </div>
        <small>
          Demo mode uses deterministic extraction data when direct OCR is
          unavailable.
        </small>
      </div>
    </div>
  );
}
function DocumentPreviewModal({
  document,
  onClose,
}: {
  document: Document;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="document-preview-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <FileText />
            <span>
              <b>{document.filename}</b>
              <small>
                {document.type} · {document.pages} pages
              </small>
            </span>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="preview-paper">
          <div className="paper-brand">
            <ShieldCheck />
            <div>
              <b>{document.type.toUpperCase()}</b>
              <span>Submitted Procurement Document</span>
            </div>
          </div>
          <div className="paper-rule" />
          <pre>{document.previewText}</pre>
          <footer>
            Prototype document preview <span>Page 1 of {document.pages}</span>
          </footer>
        </div>
        <div className="preview-meta">
          <StatusPill status={document.verification} />
          <span>Classification confidence: {document.confidence}%</span>
          <span>{document.evidenceIds.length} evidence items indexed</span>
        </div>
      </div>
    </div>
  );
}

function CompliancePage({
  state,
  bidder,
  setSelectedBidderId,
  openResult,
  navigate,
}: {
  state: AppState;
  bidder: Bidder;
  setSelectedBidderId: (id: string) => void;
  openResult: (r: ComplianceResult) => void;
  navigate: (p: Page) => void;
}) {
  const [view, setView] = useState<"results" | "missing" | "cross">("results");
  const results = state.results.filter((r) => r.bidderId === bidder.id);
  const missing = state.tender.requirements.filter(
    (req) =>
      req.requiredDocumentTypes.length &&
      !req.requiredDocumentTypes.some((type) =>
        bidder.documents.some((doc) => doc.type === type),
      ),
  );
  return (
    <div className="page">
      <PageHeader
        eyebrow="DETERMINISTIC RULE ENGINE"
        title="Compliance Assessment"
        description="Code-based tender evaluation with evidence-linked PASS, FAIL and REVIEW results."
        actions={
          <button
            className="button button-outline"
            onClick={() => navigate("matrix")}
          >
            <LayoutGrid size={16} /> BIDDER MATRIX
          </button>
        }
      />
      <div className="toolbar">
        <BidderSelect
          state={state}
          value={bidder.id}
          onChange={setSelectedBidderId}
        />
        <div className="segmented">
          <button
            className={view === "results" ? "active" : ""}
            onClick={() => setView("results")}
          >
            Rule Results
          </button>
          <button
            className={view === "missing" ? "active" : ""}
            onClick={() => setView("missing")}
          >
            Missing Documents
          </button>
          <button
            className={view === "cross" ? "active" : ""}
            onClick={() => setView("cross")}
          >
            Cross-Document
          </button>
        </div>
      </div>
      {view === "results" && (
        <InlineResults state={state} bidder={bidder} openResult={openResult} />
      )}
      {view === "cross" && <CrossChecks bidder={bidder} />}
      {view === "missing" && (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <span className="kicker">MISSING DOCUMENT DETECTOR</span>
              <h2>
                {missing.length
                  ? `${missing.length} required document gaps`
                  : "Submission set complete"}
              </h2>
            </div>
            <StatusPill status={missing.length ? "FAIL" : "PASS"} />
          </div>
          {missing.length ? (
            <div className="missing-list">
              {missing.map((req) => (
                <div key={req.id}>
                  <XCircle />
                  <div>
                    <span>MISSING DOCUMENT</span>
                    <b>{req.requiredDocumentTypes.join(" or ")}</b>
                    <small>
                      Required by Tender Clause {req.sourceClause} · {req.title}
                    </small>
                  </div>
                  <button>REQUEST CLARIFICATION</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-success">
              <BadgeCheck />
              <h3>No required documents are missing</h3>
              <p>
                The current submitted document set covers all tender document
                requirements.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function ComplianceMatrix({
  state,
  openResult,
}: {
  state: AppState;
  openResult: (r: ComplianceResult) => void;
}) {
  const rows = state.tender.requirements.slice(0, 13);
  return (
    <div className="page">
      <PageHeader
        eyebrow={`${state.tender.id} · COMPARATIVE REVIEW`}
        title="Bidder Compliance Matrix"
        description="Click any result to inspect the rule, found value, reason, confidence and evidence."
      />
      <section className="matrix-wrap">
        <table className="matrix-table">
          <thead>
            <tr>
              <th>Requirement</th>
              {state.bidders.map((b) => (
                <th key={b.id}>
                  <span>{b.shortName}</span>
                  <small>{b.bidId}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((req) => (
              <tr key={req.id}>
                <th>
                  <b>{req.title}</b>
                  <small>{req.category}</small>
                </th>
                {state.bidders.map((b) => {
                  const result = state.results.find(
                    (r) => r.bidderId === b.id && r.requirementId === req.id,
                  )!;
                  return (
                    <td key={b.id}>
                      <button
                        className={`matrix-cell ${result.status.toLowerCase()}`}
                        onClick={() => openResult(result)}
                      >
                        <StatusPill status={result.status} />
                        <small>
                          {labelValue(result.actualValue, req.unit)}
                        </small>
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>OVERALL SCORE</th>
              {state.bidders.map((b) => (
                <td key={b.id}>
                  <strong>{b.complianceScore}%</strong>
                  <StatusPill status={b.riskLevel} />
                </td>
              ))}
            </tr>
          </tfoot>
        </table>
      </section>
      <div className="matrix-note">
        <HelpCircle />
        <p>
          Objective mathematical rules are evaluated in code. AI-generated
          language only explains the deterministic result and never makes the
          final procurement decision.
        </p>
      </div>
    </div>
  );
}

function TechnicalTable({
  state,
  bidder,
  openResult,
}: {
  state: AppState;
  bidder: Bidder;
  openResult: (r: ComplianceResult) => void;
}) {
  const technical = state.tender.requirements.filter(
    (r) => r.category === "Technical",
  );
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <div>
          <span className="kicker">OBJECTIVE TECHNICAL COMPARISON</span>
          <h2>{bidder.company}</h2>
        </div>
        <span>Arithmetic rules · Code-based</span>
      </div>
      <div className="table-scroll">
        <table className="technical-table">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Required</th>
              <th>Offered</th>
              <th>Difference</th>
              <th>Result</th>
              <th>Evidence</th>
            </tr>
          </thead>
          <tbody>
            {technical.map((req) => {
              const result = state.results.find(
                (r) => r.bidderId === bidder.id && r.requirementId === req.id,
              )!;
              const diff =
                Number(result.actualValue) - Number(req.requiredValue);
              return (
                <tr
                  key={req.id}
                  className={result.status === "FAIL" ? "failed-row" : ""}
                >
                  <td>
                    <strong>{req.title}</strong>
                    <small>Clause {req.sourceClause}</small>
                  </td>
                  <td>
                    {req.operator}
                    {req.requiredValue} {req.unit}
                  </td>
                  <td>
                    <b>{labelValue(result.actualValue, req.unit)}</b>
                  </td>
                  <td className={diff < 0 ? "negative" : "positive"}>
                    {diff > 0 ? "+" : ""}
                    {diff} {req.unit}
                  </td>
                  <td>
                    <StatusPill status={result.status} />
                  </td>
                  <td>
                    <button
                      className="table-action"
                      onClick={() => openResult(result)}
                    >
                      OPEN EVIDENCE <ChevronRight />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
function TechnicalPage({
  state,
  bidder,
  setSelectedBidderId,
  openResult,
}: {
  state: AppState;
  bidder: Bidder;
  setSelectedBidderId: (id: string) => void;
  openResult: (r: ComplianceResult) => void;
}) {
  return (
    <div className="page">
      <PageHeader
        eyebrow="SPECIFICATION VALIDATION"
        title="Technical Compliance"
        description="Tender requirements compared directly with submitted technical values."
      />
      <div className="toolbar">
        <BidderSelect
          state={state}
          value={bidder.id}
          onChange={setSelectedBidderId}
        />
        <div className="rule-assurance">
          <ShieldCheck /> Objective rules run in code
        </div>
      </div>
      <TechnicalTable state={state} bidder={bidder} openResult={openResult} />
    </div>
  );
}

function VerificationCenter({
  state,
  bidder,
  setSelectedBidderId,
  updateState,
}: {
  state: AppState;
  bidder: Bidder;
  setSelectedBidderId: (id: string) => void;
  updateState: (u: (s: AppState) => AppState, m?: string) => void;
}) {
  const [running, setRunning] = useState(false);
  const [step, setStep] = useState(-1);
  const [complete, setComplete] = useState(false);
  const run = () => {
    setRunning(true);
    setComplete(false);
    setStep(0);
    let index = 0;
    const id = window.setInterval(() => {
      index++;
      setStep(index);
      if (index >= verificationSteps.length) {
        window.clearInterval(id);
        updateState((current) => {
          const next = structuredClone(current);
          const target = next.bidders.find((b) => b.id === bidder.id)!;
          const results = runCompliance(next.tender, target, next.evidence);
          next.results = [
            ...next.results.filter((r) => r.bidderId !== bidder.id),
            ...results,
          ];
          const risk = calculateRisk(target, results, next.tender);
          next.risks = [
            ...next.risks.filter((r) => r.bidderId !== bidder.id),
            risk,
          ];
          next.findings = [
            ...next.findings.filter((f) => f.bidderId !== bidder.id),
            ...createFindings(next, results),
          ];
          next.audit.unshift({
            id: `AUD-${Date.now()}`,
            timestamp: new Date().toISOString(),
            user: current.user.name,
            action: "Verification completed",
            entity: next.tender.id,
            bidder: target.company,
            result: `${target.complianceScore}% · ${risk.level} risk`,
          });
          next.notifications.unshift(
            `Verification completed: ${target.shortName}`,
          );
          return next;
        });
        setRunning(false);
        setComplete(true);
      }
    }, 190);
  };
  const results = state.results.filter((r) => r.bidderId === bidder.id);
  return (
    <div className="page">
      <PageHeader
        eyebrow="END-TO-END ORCHESTRATION"
        title="Full Verification Center"
        description="Execute the complete tender-to-evidence compliance pipeline."
        actions={
          <button
            className="button button-primary"
            onClick={run}
            disabled={running}
          >
            <Play size={16} />{" "}
            {running ? "VERIFICATION RUNNING" : "RUN FULL VERIFICATION"}
          </button>
        }
      />
      <div className="toolbar">
        <BidderSelect
          state={state}
          value={bidder.id}
          onChange={setSelectedBidderId}
        />
        <span>Last completed: 06 September 2026</span>
      </div>
      <section className={`verification-stage ${running ? "running" : ""}`}>
        <div className="pipeline-summary">
          {[
            "Tender",
            "Documents",
            "Identity",
            "Statutory",
            "Financial",
            "Technical",
            "Cross-Document",
            "Compliance",
            "Risk",
            "Evidence",
            "Report",
          ].map((item, i) => (
            <div key={item}>
              <span>
                <Check />
              </span>
              <b>{item}</b>
              {i < 10 && <i />}
            </div>
          ))}
        </div>
        {running && (
          <div className="verification-progress">
            <div className="scan-line" />
            <div className="verification-emblem">
              <ShieldCheck />
              <span>
                {Math.round((step / verificationSteps.length) * 100)}%
              </span>
            </div>
            <h2>
              {verificationSteps[Math.min(step, verificationSteps.length - 1)]}
            </h2>
            <p>
              Running deterministic compliance checks and linking source
              evidence…
            </p>
            <div className="step-progress">
              <i
                style={{ width: `${(step / verificationSteps.length) * 100}%` }}
              />
            </div>
            <div className="step-columns">
              {verificationSteps.map((item, index) => (
                <span
                  key={item}
                  className={
                    index < step ? "done" : index === step ? "active" : ""
                  }
                >
                  {index < step ? <Check /> : <i />}
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
        {!running && !complete && (
          <div className="verification-ready">
            <div className="ready-emblem">
              <ShieldCheck />
            </div>
            <span>READY TO VERIFY</span>
            <h2>{bidder.company}</h2>
            <p>
              18 requirements · {bidder.documents.length} documents ·{" "}
              {state.evidence.filter((e) => e.bidderId === bidder.id).length}{" "}
              evidence points
            </p>
            <button className="button button-primary" onClick={run}>
              <Play /> RUN FULL VERIFICATION
            </button>
          </div>
        )}
        {complete && (
          <div className="verification-complete">
            <div className="complete-mark">
              <Check />
            </div>
            <span>VERIFICATION COMPLETED</span>
            <h2>18 requirements checked</h2>
            <div className="completion-stats">
              <div>
                <b>{results.filter((r) => r.status === "PASS").length}</b>
                <span>PASS</span>
              </div>
              <div>
                <b>{results.filter((r) => r.status === "FAIL").length}</b>
                <span>FAIL</span>
              </div>
              <div>
                <b>{results.filter((r) => r.status === "REVIEW").length}</b>
                <span>REVIEW</span>
              </div>
              <div>
                <b>{bidder.complianceScore}%</b>
                <span>COMPLIANCE</span>
              </div>
              <div>
                <b>
                  {state.risks.find((r) => r.bidderId === bidder.id)?.level}
                </b>
                <span>RISK</span>
              </div>
            </div>
            <p>
              AI-assisted verification complete. Procurement Officer review
              remains required.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function EvidenceExplorer({
  state,
  evidenceId,
  setEvidenceId,
}: {
  state: AppState;
  evidenceId: string;
  setEvidenceId: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [zoom, setZoom] = useState(100);
  const evidence =
    state.evidence.find((e) => e.id === evidenceId) ?? state.evidence[0];
  const bidder = state.bidders.find((b) => b.id === evidence.bidderId)!;
  const doc = bidder.documents.find((d) => d.id === evidence.documentId)!;
  const result = state.results.find(
    (r) =>
      r.bidderId === evidence.bidderId && r.evidenceIds.includes(evidence.id),
  );
  const req =
    result &&
    state.tender.requirements.find((r) => r.id === result.requirementId);
  const items = state.evidence.filter((e) => {
    const d = state.bidders
      .find((b) => b.id === e.bidderId)
      ?.documents.find((doc) => doc.id === e.documentId);
    return (
      !query ||
      `${e.field} ${d?.filename} ${e.value}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  });
  return (
    <div className="page evidence-page">
      <PageHeader
        eyebrow="SOURCE-LEVEL TRACEABILITY"
        title="Evidence Explorer"
        description="Inspect the exact document, page, field and deterministic rule behind each result."
      />
      <div className="evidence-layout">
        <aside className="evidence-sidebar">
          <div className="search">
            <Search />
            <input
              placeholder="Search evidence"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {items.map((item) => {
            const b = state.bidders.find((x) => x.id === item.bidderId)!;
            const d = b.documents.find((x) => x.id === item.documentId)!;
            return (
              <button
                key={item.id}
                className={item.id === evidence.id ? "active" : ""}
                onClick={() => setEvidenceId(item.id)}
              >
                <FileText />
                <span>
                  <b>{item.field.replace(/([A-Z])/g, " $1")}</b>
                  <small>
                    {b.shortName} · {d.filename}
                  </small>
                </span>
                <em>{item.confidence}%</em>
              </button>
            );
          })}
        </aside>
        <section className="document-viewer">
          <div className="viewer-toolbar">
            <span>{doc.filename}</span>
            <div>
              <button
                onClick={() => setZoom((value) => Math.max(70, value - 10))}
              >
                −
              </button>
              <span>{zoom}%</span>
              <button
                onClick={() => setZoom((value) => Math.min(140, value + 10))}
              >
                +
              </button>
              <button onClick={() => window.print()}>
                <Printer />
              </button>
              <button onClick={() => window.print()}>
                <Download />
              </button>
            </div>
          </div>
          <div
            className="paper"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <div className="paper-brand">
              <ShieldCheck />
              <div>
                <b>{doc.type.toUpperCase()}</b>
                <span>Bid Submission Document</span>
              </div>
            </div>
            <div className="paper-rule" />
            <pre>{doc.previewText}</pre>
            {doc.type === "Technical Datasheet" && (
              <div className="spec-sheet">
                <h3>PERFORMANCE PARAMETERS</h3>
                <div>
                  <span>Motor Power</span>
                  <b>{bidder.values.motorPower} HP</b>
                </div>
                <div>
                  <span>Rated Flow</span>
                  <b>{bidder.values.flow} L/min</b>
                </div>
                <div
                  className={evidence.field === "pressure" ? "highlight" : ""}
                >
                  <span>Rated Pressure</span>
                  <b>{bidder.values.pressure} bar</b>
                  {evidence.field === "pressure" && (
                    <i>Evidence {evidence.id}</i>
                  )}
                </div>
                <div>
                  <span>Efficiency</span>
                  <b>{bidder.values.efficiency}%</b>
                </div>
              </div>
            )}
            <footer>
              Digitally submitted with Bid {bidder.bidId}
              <span>
                Page {evidence.page} of {doc.pages}
              </span>
            </footer>
          </div>
        </section>
        <aside className="evidence-detail">
          <div className="evidence-detail-head">
            <span>EVIDENCE DETAILS</span>
            <StatusPill status={result?.status ?? doc.verification} />
          </div>
          <h2>{req?.title ?? evidence.field}</h2>
          <div className="evidence-value">
            <span>FOUND VALUE</span>
            <b>
              {String(evidence.value)} {req?.unit}
            </b>
            <small>{evidence.confidence}% extraction confidence</small>
          </div>
          {req && result && (
            <>
              <div className="comparison-box">
                <div>
                  <span>Required</span>
                  <b>
                    {req.operator} {req.requiredValue} {req.unit}
                  </b>
                </div>
                <ChevronRight />
                <div>
                  <span>Found</span>
                  <b>{labelValue(result.actualValue, req.unit)}</b>
                </div>
              </div>
              <div className="rule-box">
                <span>DETERMINISTIC RULE</span>
                <code>{result.rule}</code>
                <b>
                  Result:{" "}
                  {result.status === "PASS"
                    ? "TRUE"
                    : result.status === "FAIL"
                      ? "FALSE"
                      : "MANUAL REVIEW"}
                </b>
              </div>
            </>
          )}
          <dl>
            <div>
              <dt>Document</dt>
              <dd>{doc.filename}</dd>
            </div>
            <div>
              <dt>Page</dt>
              <dd>{evidence.page}</dd>
            </div>
            <div>
              <dt>Field</dt>
              <dd>{evidence.field}</dd>
            </div>
            <div>
              <dt>Source clause</dt>
              <dd>{evidence.sourceClause}</dd>
            </div>
            <div>
              <dt>Bidder</dt>
              <dd>{bidder.company}</dd>
            </div>
          </dl>
          {result && (
            <div className={`explanation-box ${result.status.toLowerCase()}`}>
              <b>WHY?</b>
              <p>{result.reason}</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function RiskFindings({
  state,
  setSelectedBidderId,
  openResult,
  updateState,
}: {
  state: AppState;
  setSelectedBidderId: (id: string) => void;
  openResult: (r: ComplianceResult) => void;
  updateState: (u: (s: AppState) => AppState, m?: string) => void;
}) {
  const [filter, setFilter] = useState("All");
  const visible = state.findings.filter(
    (f) =>
      filter === "All" ||
      (filter === "Resolved" ? f.resolved : f.severity === filter),
  );
  return (
    <div className="page">
      <PageHeader
        eyebrow="PRIORITIZED PROCUREMENT REVIEW"
        title="Risk & Findings"
        description="Transparent risk contributors and evidence-backed findings for officer action."
      />
      <div className="risk-overview">
        {state.bidders.map((b) => {
          const risk = state.risks.find((r) => r.bidderId === b.id)!;
          return (
            <button key={b.id} onClick={() => setSelectedBidderId(b.id)}>
              <span>{b.shortName}</span>
              <b>{risk.score}</b>
              <StatusPill status={risk.level} />
              <small>{risk.contributions.length} contributors</small>
            </button>
          );
        })}
      </div>
      <div className="filter-tabs">
        {["All", "Critical", "High", "Medium", "Low", "Review", "Resolved"].map(
          (x) => (
            <button
              className={filter === x ? "active" : ""}
              key={x}
              onClick={() => setFilter(x)}
            >
              {x}
            </button>
          ),
        )}
      </div>
      <div className="findings-list">
        {visible.map((f) => {
          const b = state.bidders.find((x) => x.id === f.bidderId)!;
          const result = state.results.find(
            (r) =>
              r.bidderId === f.bidderId && r.requirementId === f.requirementId,
          );
          const req = state.tender.requirements.find(
            (r) => r.id === f.requirementId,
          );
          const ev = state.evidence.find((e) => f.evidenceIds.includes(e.id));
          const doc = ev && b.documents.find((d) => d.id === ev.documentId);
          return (
            <article key={f.id} className={f.resolved ? "resolved" : ""}>
              <div className={`severity ${f.severity.toLowerCase()}`}>
                <AlertTriangle />
                <span>{f.severity.toUpperCase()}</span>
              </div>
              <div className="finding-body">
                <span>{f.category}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
                <div>
                  <span>
                    Bidder: <b>{b.shortName}</b>
                  </span>
                  {req && (
                    <span>
                      Required:{" "}
                      <b>
                        {req.operator} {req.requiredValue} {req.unit}
                      </b>
                    </span>
                  )}
                  {result && (
                    <span>
                      Found: <b>{labelValue(result.actualValue, req?.unit)}</b>
                    </span>
                  )}
                  {doc && ev && (
                    <span>
                      Evidence:{" "}
                      <b>
                        {doc.filename} · Page {ev.page}
                      </b>
                    </span>
                  )}
                </div>
              </div>
              <div className="finding-actions">
                <button
                  className="button button-outline"
                  onClick={() => result && openResult(result)}
                >
                  WHY? / EVIDENCE
                </button>
                <button
                  className="button button-ghost"
                  onClick={() =>
                    updateState(
                      (current) => {
                        const next = structuredClone(current);
                        const target = next.findings.find(
                          (x) => x.id === f.id,
                        )!;
                        target.resolved = !target.resolved;
                        next.audit.unshift({
                          id: `AUD-${Date.now()}`,
                          timestamp: new Date().toISOString(),
                          user: current.user.name,
                          action: "Finding reviewed",
                          entity: f.id,
                          bidder: b.company,
                          result: target.resolved ? "Resolved" : "Reopened",
                        });
                        return next;
                      },
                      f.resolved ? "Finding reopened" : "Finding resolved",
                    )
                  }
                >
                  {f.resolved ? "REOPEN" : "MARK RESOLVED"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

const govServices = [
  "GSTN",
  "Udyam",
  "PAN",
  "Income Tax",
  "MCA21",
  "Startup India",
  "NSIC",
  "EPFO",
  "ESIC",
  "DigiLocker",
  "BIS",
  "DPIIT",
  "GeM",
  "Blacklist",
];
function GovernmentCenter({
  state,
  bidder,
  setSelectedBidderId,
  updateState,
}: {
  state: AppState;
  bidder: Bidder;
  setSelectedBidderId: (id: string) => void;
  updateState: (u: (s: AppState) => AppState, m?: string) => void;
}) {
  const [service, setService] = useState("GSTN");
  const [identifier, setIdentifier] = useState(String(bidder.values.gstin));
  const [checking, setChecking] = useState(false);
  const result = state.governmentVerifications.find(
    (v) => v.bidderId === bidder.id && v.service === service,
  );
  const verify = () => {
    setChecking(true);
    window.setTimeout(() => {
      updateState((current) => {
        const next = structuredClone(current);
        const details =
          service === "GSTN"
            ? {
                "Legal Name": bidder.company.replace(
                  "PVT LTD",
                  "PRIVATE LIMITED",
                ),
                State: "Uttar Pradesh",
                "Registration Date": "15/04/2022",
                Source: "GST Verification Adapter",
              }
            : service === "PAN"
              ? {
                  "Legal Name": bidder.company,
                  "PAN Status": "VALID",
                  Source: "PAN Verification Adapter",
                }
              : service === "Udyam"
                ? {
                    "Enterprise Name":
                      bidder.id === "BIDDER-ABC"
                        ? "XYZ INDUSTRIES PRIVATE LIMITED"
                        : bidder.company,
                    Status: "VALID",
                    Source: "Udyam Verification Adapter",
                  }
                : {
                    "Debarment Status": "CLEAR",
                    "Search Scope": "Prototype reference list",
                    Source: "Blacklist Verification Adapter",
                  };
        next.governmentVerifications = next.governmentVerifications.filter(
          (v) => !(v.bidderId === bidder.id && v.service === service),
        );
        next.governmentVerifications.push({
          id: `GOV-${Date.now()}`,
          bidderId: bidder.id,
          service,
          identifier,
          status:
            service === "Blacklist"
              ? "CLEAR"
              : service === "GSTN"
                ? "ACTIVE"
                : "VALID",
          details,
          mode: "Prototype / Simulated",
          checkedAt: new Date().toISOString(),
        });
        next.audit.unshift({
          id: `AUD-${Date.now()}`,
          timestamp: new Date().toISOString(),
          user: current.user.name,
          action: "Government verification simulated",
          entity: service,
          bidder: bidder.company,
          result: service === "Blacklist" ? "CLEAR" : "VALID",
        });
        return next;
      }, `${service} verification completed`);
      setChecking(false);
    }, 650);
  };
  return (
    <div className="page">
      <PageHeader
        eyebrow="PROTOTYPE / SIMULATED"
        title="Government Verification Center"
        description="Mock adapters demonstrate verification workflows without claiming access to live government systems."
      />
      <div className="prototype-banner">
        <AlertTriangle />
        <p>
          <b>Prototype adapters only.</b> No real GSTN, Income Tax, MCA, GeM or
          other government API is accessed by this demonstration.
        </p>
      </div>
      <div className="gov-grid">
        {govServices.map((name) => (
          <button
            key={name}
            className={service === name ? "active" : ""}
            onClick={() => {
              setService(name);
              setIdentifier(
                name === "GSTN"
                  ? String(bidder.values.gstin)
                  : name === "PAN"
                    ? String(bidder.values.pan)
                    : name === "Udyam"
                      ? String(bidder.values.udyam ?? "")
                      : bidder.company,
              );
            }}
          >
            <Landmark />
            <span>
              <b>{name}</b>
              <small>PROTOTYPE / SIMULATED</small>
            </span>
            {["GSTN", "Udyam", "PAN", "Blacklist"].includes(name) ? (
              <i>AVAILABLE</i>
            ) : (
              <em>MOCK</em>
            )}
          </button>
        ))}
      </div>
      <section className="panel gov-console">
        <div className="gov-form">
          <span>SELECTED ADAPTER</span>
          <h2>{service} Verification</h2>
          <BidderSelect
            state={state}
            value={bidder.id}
            onChange={(id) => {
              setSelectedBidderId(id);
              const b = state.bidders.find((x) => x.id === id)!;
              setIdentifier(
                service === "GSTN"
                  ? String(b.values.gstin)
                  : service === "PAN"
                    ? String(b.values.pan)
                    : String(b.values.udyam ?? b.company),
              );
            }}
          />
          <label>
            {service === "GSTN"
              ? "GSTIN"
              : service === "PAN"
                ? "PAN"
                : service === "Udyam"
                  ? "Udyam Number"
                  : "Entity Name"}
            <input
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </label>
          <button
            className="button button-primary"
            disabled={
              checking ||
              !["GSTN", "Udyam", "PAN", "Blacklist"].includes(service)
            }
            onClick={verify}
          >
            {checking ? <RefreshCw className="spin" /> : <ShieldCheck />} VERIFY
            USING MOCK ADAPTER
          </button>
          {!["GSTN", "Udyam", "PAN", "Blacklist"].includes(service) && (
            <small>
              This adapter is represented for workflow completeness; interactive
              simulation is available for GSTN, Udyam, PAN and Blacklist.
            </small>
          )}
        </div>
        <div className="gov-result">
          {result ? (
            <>
              <div className="result-seal">
                <BadgeCheck />
              </div>
              <span>VERIFICATION RESULT</span>
              <h2>{result.status}</h2>
              {Object.entries(result.details).map(([key, value]) => (
                <p key={key}>
                  <span>{key}</span>
                  <b>{value}</b>
                </p>
              ))}
              <p>
                <span>Mode</span>
                <b>{result.mode}</b>
              </p>
            </>
          ) : (
            <div className="empty-gov">
              <Landmark />
              <h3>No verification result</h3>
              <p>
                Run an available prototype adapter to view structured
                verification data.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Reports({
  state,
  bidder,
  setSelectedBidderId,
  updateState,
}: {
  state: AppState;
  bidder: Bidder;
  setSelectedBidderId: (id: string) => void;
  updateState: (u: (s: AppState) => AppState, m?: string) => void;
}) {
  const [preview, setPreview] = useState(false);
  const [decision, setDecision] = useState("REQUIRES CLARIFICATION");
  const [comment, setComment] = useState("");
  const risk = state.risks.find((r) => r.bidderId === bidder.id)!;
  const results = state.results.filter((r) => r.bidderId === bidder.id);
  const generate = () =>
    updateState((current) => {
      const next = structuredClone(current);
      next.reports.unshift({
        id: `RPT-${Date.now()}`,
        bidderId: bidder.id,
        generatedAt: new Date().toISOString(),
        status: "Generated",
      });
      next.audit.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: current.user.name,
        action: "Compliance report generated",
        entity: current.tender.id,
        bidder: bidder.company,
        result: "Generated",
      });
      next.notifications.unshift(`Report generated: ${bidder.shortName}`);
      return next;
    }, "Compliance report generated");
  const submit = () =>
    updateState((current) => {
      const next = structuredClone(current);
      next.decisions = next.decisions.filter((d) => d.bidderId !== bidder.id);
      next.decisions.push({
        bidderId: bidder.id,
        decision: decision as any,
        comment,
        decidedBy: current.user.name,
        decidedAt: new Date().toISOString(),
      });
      next.audit.unshift({
        id: `AUD-${Date.now()}`,
        timestamp: new Date().toISOString(),
        user: current.user.name,
        action: "Officer decision recorded",
        entity: current.tender.id,
        bidder: bidder.company,
        result: decision,
      });
      return next;
    }, "Official Procurement Officer decision recorded");
  const existing = state.decisions.find((d) => d.bidderId === bidder.id);
  return (
    <div className="page">
      <PageHeader
        eyebrow="CURRENT BIDDER DATA"
        title="Compliance Report"
        description="Generate an evidence-linked procurement review report and record the authorized officer decision."
        actions={
          <>
            <button
              className="button button-outline"
              onClick={() => setPreview(!preview)}
            >
              <FileSearch size={16} /> PREVIEW
            </button>
            <button className="button button-primary" onClick={generate}>
              <FileCheck2 size={16} /> GENERATE
            </button>
            <button
              className="button button-outline"
              onClick={() => window.print()}
            >
              <Printer size={16} /> PRINT
            </button>
          </>
        }
      />
      <div className="toolbar">
        <BidderSelect
          state={state}
          value={bidder.id}
          onChange={setSelectedBidderId}
        />
        <button className="button button-ghost" onClick={() => window.print()}>
          <Download size={16} /> DOWNLOAD / SAVE PDF
        </button>
      </div>
      <div className="report-layout">
        <article className={`report-paper ${preview ? "previewing" : ""}`}>
          <header>
            <div className="report-logo">
              <ShieldCheck />
              <div>
                <b>GeM-BidGuard</b>
                <span>CPCL Procurement Compliance</span>
              </div>
            </div>
            <div>
              <span>COMPLIANCE REPORT</span>
              <b>
                {state.tender.id} / {bidder.bidId}
              </b>
            </div>
          </header>
          <section className="report-title">
            <span>AI-ASSISTED COMPLIANCE ASSESSMENT</span>
            <h1>{state.tender.title}</h1>
            <p>{bidder.company}</p>
          </section>
          <div className="report-summary">
            <div>
              <span>COMPLIANCE SCORE</span>
              <b>
                {bidder.complianceScore}
                <small>/100</small>
              </b>
            </div>
            <div>
              <span>RISK ASSESSMENT</span>
              <StatusPill status={risk.level} />
              <small>{risk.score} risk points</small>
            </div>
            <div>
              <span>REQUIREMENTS</span>
              <b>18</b>
              <small>
                {results.filter((r) => r.status === "PASS").length} pass ·{" "}
                {results.filter((r) => r.status === "FAIL").length} fail ·{" "}
                {results.filter((r) => r.status === "REVIEW").length} review
              </small>
            </div>
          </div>
          {[
            "Tender Information",
            "Bidder Information",
            "Executive Summary",
            "Requirement Results",
            "Documents",
            "Technical Compliance",
            "Cross-Document Findings",
            "Missing Documents",
            "Government Verification",
            "Evidence",
            "Audit Trail",
          ].map((section, index) => (
            <section className="report-section" key={section}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div>
                <h3>{section}</h3>
                <p>
                  {section === "Executive Summary"
                    ? `The bidder scored ${bidder.complianceScore}/100 with ${risk.level.toLowerCase()} risk. Deterministic checks identified ${results.filter((r) => r.status === "FAIL").length} failed and ${results.filter((r) => r.status === "REVIEW").length} review requirements.`
                    : section === "Technical Compliance"
                      ? `Motor ${bidder.values.motorPower} HP · Flow ${bidder.values.flow} L/min · Pressure ${bidder.values.pressure} bar · Efficiency ${bidder.values.efficiency}%.`
                      : "Structured details are compiled from the current shared tender, bidder, document, evidence and audit dataset."}
                </p>
              </div>
            </section>
          ))}
          <section className="ai-recommendation">
            <Bot />
            <div>
              <span>AI RECOMMENDATION</span>
              <p>
                {bidder.id === "BIDDER-ABC"
                  ? "Bidder appears substantially compliant but requires Procurement Officer review of the pressure requirement and OEM authorization."
                  : risk.level === "LOW"
                    ? "Bidder appears substantially compliant based on submitted evidence. Procurement Officer validation remains required."
                    : "Material compliance gaps require Procurement Officer review and potential clarification."}
              </p>
            </div>
          </section>
          <footer>
            AI-assisted verification only. Final qualification/disqualification
            and award decisions remain with the authorized Procurement Officer.
          </footer>
        </article>
        <aside className="decision-card panel">
          <span className="kicker">AUTHORIZED HUMAN DECISION</span>
          <h2>Procurement Officer Decision</h2>
          <div className="decision-warning">
            <AlertTriangle />
            <p>
              You are recording the official procurement review decision. AI
              findings are advisory and do not replace procurement authority.
            </p>
          </div>
          {[
            "ELIGIBLE",
            "NOT ELIGIBLE",
            "REQUIRES CLARIFICATION",
            "MANUAL REVIEW",
          ].map((item) => (
            <label
              className={`decision-option ${decision === item ? "selected" : ""}`}
              key={item}
            >
              <input
                type="radio"
                name="decision"
                checked={decision === item}
                onChange={() => setDecision(item)}
              />
              <span>{item}</span>
            </label>
          ))}
          <label>
            Officer Comment
            <textarea
              rows={5}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Record the basis for the official review decision…"
            />
          </label>
          <button className="button button-primary full" onClick={submit}>
            SUBMIT OFFICIAL DECISION
          </button>
          {existing && (
            <div className="existing-decision">
              <Check />
              <div>
                <b>{existing.decision}</b>
                <span>Recorded by {existing.decidedBy}</span>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function AuditTrail({
  state,
  compact = false,
}: {
  state: AppState;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "" : "page"}>
      {!compact && (
        <PageHeader
          eyebrow="IMMUTABLE REVIEW HISTORY"
          title="Audit Trail"
          description="Timestamped actions across tender analysis, document processing, verification, reports and officer decisions."
        />
      )}
      <section className="panel table-panel">
        <div className="panel-heading">
          <div>
            <span className="kicker">ACTIVITY LEDGER</span>
            <h2>{state.audit.length} recorded events</h2>
          </div>
          <button
            className="button button-outline button-small"
            onClick={() => window.print()}
          >
            <Download size={15} /> EXPORT LOG
          </button>
        </div>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>User</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Bidder</th>
                <th>Document</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {state.audit.map((log) => (
                <tr key={log.id}>
                  <td>
                    <b>{new Date(log.timestamp).toLocaleDateString("en-IN")}</b>
                    <small>
                      {new Date(log.timestamp).toLocaleTimeString("en-IN")}
                    </small>
                  </td>
                  <td>{log.user}</td>
                  <td>
                    <strong>{log.action}</strong>
                  </td>
                  <td>{log.entity}</td>
                  <td>{log.bidder ?? "—"}</td>
                  <td>{log.document ?? "—"}</td>
                  <td>
                    <StatusPill
                      status={
                        log.result.includes("Completed") ||
                        log.result.includes("Generated") ||
                        log.result.includes("Success")
                          ? "PASS"
                          : log.result.includes("Review")
                            ? "REVIEW"
                            : log.result
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function SettingsPage({
  state,
  updateState,
}: {
  state: AppState;
  updateState: (u: (s: AppState) => AppState, m?: string) => void;
}) {
  const [section, setSection] = useState("Scoring Rules");
  const total = Object.values(state.categoryWeights).reduce((a, b) => a + b, 0);
  const reset = () =>
    updateState(() => createDemoState(), "Complete demo scenario restored");
  return (
    <div className="page">
      <PageHeader
        eyebrow="PLATFORM CONFIGURATION"
        title="Settings"
        description="Configure organization preferences, scoring categories and prototype integrations."
        actions={
          <>
            <button className="button button-outline" onClick={reset}>
              <RotateCcw size={16} /> RESET DEMO DATA
            </button>
            <button className="button button-primary" onClick={reset}>
              <RefreshCw size={16} /> LOAD DEMO SCENARIO
            </button>
          </>
        }
      />
      <div className="settings-layout">
        <aside>
          {[
            "Organization",
            "Users",
            "Scoring Rules",
            "Compliance Categories",
            "Government Integrations",
            "AI Configuration",
            "Audit Settings",
          ].map((item) => (
            <button
              className={section === item ? "active" : ""}
              key={item}
              onClick={() => setSection(item)}
            >
              {item}
            </button>
          ))}
        </aside>
        <section className="panel settings-content">
          <span className="kicker">{section.toUpperCase()}</span>
          <h2>{section}</h2>
          {section === "Scoring Rules" ? (
            <>
              <p>
                Edit weighted compliance categories. The total must equal 100%.
              </p>
              <div className="weight-list">
                {Object.entries(state.categoryWeights).map(
                  ([category, value]) => (
                    <label key={category}>
                      <span>
                        <b>{category}</b>
                        <small>
                          {category === "Technical"
                            ? "Specifications and performance"
                            : "Registration, declarations and tender clauses"}
                        </small>
                      </span>
                      <div>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={value}
                          onChange={(e) =>
                            updateState((current) => {
                              const next = structuredClone(current);
                              next.categoryWeights[
                                category as RequirementCategory
                              ] = Number(e.target.value);
                              return next;
                            })
                          }
                        />
                        <em>%</em>
                      </div>
                    </label>
                  ),
                )}
              </div>
              <div
                className={`weight-total ${total === 100 ? "valid" : "invalid"}`}
              >
                <span>Total weight</span>
                <b>{total}%</b>
                <small>
                  {total === 100
                    ? "Valid scoring configuration"
                    : "Weights must total exactly 100%"}
                </small>
              </div>
              <button
                disabled={total !== 100}
                className="button button-primary"
                onClick={() =>
                  updateState((current) => current, "Scoring rules saved")
                }
              >
                SAVE SCORING RULES
              </button>
            </>
          ) : (
            <GenericSettings section={section} />
          )}
        </section>
      </div>
    </div>
  );
}
function GenericSettings({ section }: { section: string }) {
  const content: Record<string, string[]> = {
    Organization: [
      "Chennai Petroleum Corporation Limited",
      "Ministry of Petroleum & Natural Gas",
      "Procurement / Engineering",
    ],
    Users: [
      "Ananya Rao · Procurement Officer",
      "Verification Analyst · Review access",
      "Administrator · Configuration access",
    ],
    "Compliance Categories": [
      "Legal / Registration",
      "Financial",
      "Technical",
      "Statutory",
      "Tender Specific",
    ],
    "Government Integrations": [
      "GSTN · Prototype / Simulated",
      "Udyam · Prototype / Simulated",
      "PAN · Prototype / Simulated",
      "Blacklist · Prototype / Simulated",
    ],
    "AI Configuration": [
      "Deterministic answer mode enabled",
      "Evidence fabrication disabled",
      "Mathematical compliance delegated to rule engine",
    ],
    "Audit Settings": [
      "Record verification lifecycle events",
      "Record finding review actions",
      "Record officer decisions and report generation",
    ],
  };
  return (
    <div className="generic-settings">
      {(content[section] ?? []).map((item) => (
        <div key={item}>
          <Check />
          <span>{item}</span>
          <button disabled>CONFIGURED</button>
        </div>
      ))}
    </div>
  );
}

function WhyPanel({
  state,
  result,
  onClose,
  onEvidence,
}: {
  state: AppState;
  result: ComplianceResult;
  onClose: () => void;
  onEvidence: (id: string) => void;
}) {
  const bidder = state.bidders.find((b) => b.id === result.bidderId)!;
  const req = state.tender.requirements.find(
    (r) => r.id === result.requirementId,
  )!;
  const evidence = state.evidence.find((e) =>
    result.evidenceIds.includes(e.id),
  );
  const doc =
    evidence && bidder.documents.find((d) => d.id === evidence.documentId);
  const diff =
    typeof result.actualValue === "number" &&
    typeof req.requiredValue === "number"
      ? result.actualValue - req.requiredValue
      : null;
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="why-panel" onClick={(e) => e.stopPropagation()}>
        <header>
          <div>
            <StatusPill status={result.status} />
            <span>WHY?</span>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </header>
        <div className="why-content">
          <span className="kicker">
            {req.category.toUpperCase()} COMPLIANCE
          </span>
          <h2>
            {result.status} — {req.title}
          </h2>
          <p>
            {bidder.company} · {bidder.bidId}
          </p>
          <div className="why-comparison">
            <div>
              <span>REQUIRED</span>
              <b>
                {req.operator} {req.requiredValue} {req.unit}
              </b>
            </div>
            <div>
              <span>FOUND</span>
              <b>{labelValue(result.actualValue, req.unit)}</b>
            </div>
            {diff !== null && (
              <div>
                <span>DIFFERENCE</span>
                <b className={diff < 0 ? "negative" : "positive"}>
                  {diff > 0 ? "+" : ""}
                  {diff} {req.unit}
                </b>
              </div>
            )}
          </div>
          <dl>
            <div>
              <dt>Rule</dt>
              <dd>
                <code>{result.rule}</code>
              </dd>
            </div>
            <div>
              <dt>Evidence</dt>
              <dd>{doc?.filename ?? "Submitted document set"}</dd>
            </div>
            <div>
              <dt>Page</dt>
              <dd>{evidence?.page ?? "—"}</dd>
            </div>
            <div>
              <dt>Confidence</dt>
              <dd>{result.confidence}%</dd>
            </div>
            <div>
              <dt>Source clause</dt>
              <dd>
                {req.sourceClause} · Page {req.sourcePage}
              </dd>
            </div>
          </dl>
          <div className={`explanation-card ${result.status.toLowerCase()}`}>
            <Bot />
            <div>
              <span>AI-ASSISTED EXPLANATION</span>
              <p>{result.reason}</p>
            </div>
          </div>
          <div className="recommended-action">
            <b>Recommended Action</b>
            <p>
              {result.status === "FAIL"
                ? "Procurement Officer review is required. Seek clarification only if permitted by tender conditions."
                : "Compare original records and confirm the information manually before recording the procurement decision."}
            </p>
          </div>
          {evidence && (
            <button
              className="button button-primary full"
              onClick={() => onEvidence(evidence.id)}
            >
              <FileSearch /> OPEN SOURCE EVIDENCE
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function AskBidGuard({
  state,
  bidder,
  onClose,
}: {
  state: AppState;
  bidder: Bidder;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "ai"; text: string }[]
  >([
    {
      role: "ai",
      text: `I can explain ${bidder.shortName}'s compliance using only linked prototype evidence.`,
    },
  ]);
  const [input, setInput] = useState("");
  const answer = (question: string) => {
    const q = question.toLowerCase();
    const results = state.results.filter((r) => r.bidderId === bidder.id);
    const failed = results
      .filter((r) => r.status === "FAIL")
      .map(
        (r) =>
          state.tender.requirements.find((req) => req.id === r.requirementId)
            ?.title,
      );
    const missing = state.tender.requirements
      .filter(
        (req) =>
          !req.requiredDocumentTypes.some((type) =>
            bidder.documents.some((d) => d.type === type),
          ),
      )
      .map((r) => r.requiredDocumentTypes[0]);
    const risk = state.risks.find((r) => r.bidderId === bidder.id)!;
    if (q.includes("pressure") || q.includes("why did") || q.includes("failed"))
      return bidder.id === "BIDDER-ABC"
        ? "ABC Industries failed the pressure requirement because the tender requires ≥10 bar and Technical_Datasheet.pdf, page 4, reports 8 bar. The deterministic rule 8 ≥ 10 is false. Confidence: 97%."
        : `Failed requirements: ${failed.join(", ") || "none"}.`;
    if (q.includes("missing"))
      return missing.length
        ? `Missing required document types: ${[...new Set(missing)].join(", ")}.`
        : "No required document types are currently missing for this bidder.";
    if (q.includes("risk"))
      return `Risk is ${risk.level} at ${risk.score} points: ${risk.contributions.map((c) => `${c.label} +${c.points}`).join("; ") || "no material contributors"}.`;
    if (q.includes("strongest"))
      return "Delta Mechanical Solutions has the strongest compliance in the current dataset at 91/100 with LOW risk.";
    if (q.includes("inconsisten"))
      return bidder.id === "BIDDER-ABC"
        ? "GST and PAN names normalize as likely equivalent, but the Udyam document names XYZ Industries Private Limited. This is an Information Inconsistency requiring manual review, not a fraud finding."
        : "No material identity inconsistency is recorded for this bidder.";
    return `For ${bidder.shortName}: ${results.filter((r) => r.status === "PASS").length} PASS, ${results.filter((r) => r.status === "FAIL").length} FAIL and ${results.filter((r) => r.status === "REVIEW").length} REVIEW. Ask about failures, missing documents, risk, evidence or inconsistencies.`;
  };
  const send = (text = input) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      { role: "ai", text: answer(text) },
    ]);
    setInput("");
  };
  return (
    <aside className="assistant">
      <header>
        <div>
          <div className="assistant-mark">
            <Sparkles />
          </div>
          <span>
            <b>Ask BidGuard</b>
            <small>Deterministic demo assistant</small>
          </span>
        </div>
        <button onClick={onClose}>
          <X />
        </button>
      </header>
      <div className="assistant-context">
        <ShieldCheck />
        Using current data for {bidder.shortName}
      </div>
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={m.role}>
            <span>{m.role === "ai" ? <Bot /> : "AR"}</span>
            <p>{m.text}</p>
          </div>
        ))}
      </div>
      <div className="suggestions">
        {[
          "Why did ABC fail?",
          "What documents are missing?",
          "Why is the risk medium?",
          "Which bidder is strongest?",
        ].map((q) => (
          <button key={q} onClick={() => send(q)}>
            {q}
          </button>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about current evidence…"
        />
        <button>
          <ChevronRight />
        </button>
      </form>
      <footer>Answers use the current application dataset only.</footer>
    </aside>
  );
}
