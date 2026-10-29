import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  Activity, ArrowRight, BookOpen, Braces, Check, CheckCircle2, ChevronDown, ChevronRight,
  Clock3, Download, FileCheck2, FileClock, FileText, GitBranch, GitCompareArrows, GitFork,
  LayoutDashboard, ListChecks, Menu, Network, Play, RotateCcw, ShieldCheck, X,
} from 'lucide-react';
import { DEMO_BRANCH_DAYS, DEMO_EXECUTION_DATE, evaluateDemoTiming, type TimingBranch } from './rule-timing';
import { PipelineExperience } from './components/PipelineExperience';
import { OverviewAudienceHero } from './components/OverviewAudienceHero';
import { calculateMeasured, calculateScenario, parseNonnegative, scenarioRoles, type MeasuredInput, type ScenarioRole, type ScenarioValues } from './economics-model';
import './economics.css';

type Branch = TimingBranch;
type State = { branch: Branch; reportTiming: 'on-time' | 'late'; role: string; approval: string; assumptions: { hours: number; cycles: number; reuse: number; rate: number; setup: number; maintenance: number }; chapter: number };
const STORAGE_KEY = 'rac-cftc-swap-demo-v2';
const seed: State = { branch: 'facility', reportTiming: 'on-time', role: 'Financial-services leader', approval: 'Pending', assumptions: { hours: 420, cycles: 3, reuse: 35, rate: 165, setup: 28000, maintenance: 18000 }, chapter: 0 };
const branchInfo: Record<Branch, { label: string; short: string; reporter: string; citation: string; days: number }> = {
  facility: { label: 'On-facility · SEF / DCM executed', short: 'SEF / DCM executed', reporter: 'SEF or DCM', citation: '§45.3(a)', days: DEMO_BRANCH_DAYS.facility },
  'off-sd': { label: 'Off-facility · reporting counterparty is SD / MSP / DCO', short: 'Off-facility · SD / MSP / DCO', reporter: 'Reporting counterparty (assumed SD / MSP / DCO)', citation: '§45.3(b)(1)', days: DEMO_BRANCH_DAYS['off-sd'] },
  'off-non-sd': { label: 'Off-facility · reporting counterparty is non-SD / MSP / DCO', short: 'Off-facility · non-SD / MSP / DCO', reporter: 'Reporting counterparty (assumed non-SD / MSP / DCO)', citation: '§45.3(b)(2)', days: DEMO_BRANCH_DAYS['off-non-sd'] },
};
const nav = [
  { group: 'WORKSPACE', items: [['/', 'Overview', LayoutDashboard], ['/sources', 'Sources', BookOpen], ['/obligations', 'Obligations', FileText], ['/rules', 'Rule draft', Braces], ['/mappings', 'Local mapping', Network], ['/validation', 'Validation', ListChecks], ['/evidence', 'Evidence preview', FileCheck2]] },
  { group: 'CONTROL & ADOPTION', items: [['/changes', 'Impact replay', GitCompareArrows], ['/governance', 'Governance', ShieldCheck], ['/adoption', 'Adoption journey', GitFork], ['/economics', 'Pilot economics', Activity]] },
  { group: 'BRIEFING', items: [['/presenter', 'Presenter mode', Play]] },
] as const;
const pages = [
  ['/', 'overview', 'Regulation as Code', 'Open, executable and auditable reporting pipelines for financial services. Explore a source-traceable, synthetic CFTC §45.3 timing prototype.'],
  ['/sources', 'sources', 'Public source record', 'An inspectable record of the cited CFTC text and its limits.'],
  ['/obligations', 'obligations', 'Obligation interpretation', 'Select the applicable §45.3 branch; reporter classification remains an explicit scenario assumption.'],
  ['/rules', 'rules', 'Rule draft', 'A compact, source-linked representation of the selected timing branch.'],
  ['/mappings', 'mappings', 'Local data mapping', 'A versioned vanilla-IRS crosswalk from selected CFTC fields to candidate CDM 7.0 locations. Not a production schema map.'],
  ['/validation', 'validation', 'Deterministic timing check', 'A weekday-only comparison against the selected §45.3 deadline branch. Not full compliance.'],
  ['/evidence', 'evidence', 'Synthetic evidence preview', 'An evaluation envelope for demonstration only—not a submission file.'],
  ['/changes', 'changes', 'Synthetic impact replay', 'Change the scenario branch or reporting date and inspect the resulting trace. No amendment is represented.'],
  ['/governance', 'governance', 'Governance & approval', 'Human review is distinct from a deterministic demonstration. No production access controls exist.'],
  ['/adoption', 'adoption', 'Adoption journey', 'A proposed path from a public obligation to institution-owned implementation.'],
  ['/economics', 'economics', 'Pilot economics & assumptions', 'Compare locally recorded baseline and post-pilot observations; keep illustrative assumptions separate.'],
  ['/presenter', 'presenter', 'Presenter mode', 'A 15-minute walkthrough structured around Open, Executable, and Auditable reporting pipelines.'],
] as const;
const chapters = [
  { title: 'The pain: fragmented reporting work', time: '01:30', mins: 1.5, summary: 'Frame three problems to validate with institutions: interpretation handoffs, change propagation across mappings and tests, and fragmented evidence. No unsupported market statistics.', path: '/changes' },
  { title: 'OPEN — shared foundations, local ownership', time: '02:00', mins: 2, summary: 'Contribute public annotations and generic tests; leverage CDM semantics and DRR interpretations where scope fits; keep bank data and mappings local.', path: '/mappings' },
  { title: 'EXECUTABLE — from rule to evaluation', time: '04:00', mins: 4, summary: 'Trace the synthetic §45.3 branch through assumptions, candidate mapping, deterministic timing check and evaluation output—not a filing.', path: '/' },
  { title: 'AUDITABLE — trace, review, evidence', time: '02:00', mins: 2, summary: 'Explain the proposed change-control record linking source, human interpretation, local mapping reference, tests, review and release. Separate today’s synthetic trace from future controls; nothing here is signed or tamper-evident.', path: '/governance' },
  { title: 'Fork to pilot — repository and CI path', time: '03:00', mins: 3, summary: 'Add the portable package to a repository you control. Its GitHub Actions workflow runs synthetic timing-branch tests, the locked install and typecheck/build on pull requests; it does not deploy.', path: '/adoption' },
  { title: 'Value and the measured pilot', time: '02:30', mins: 2.5, summary: 'Test whether linking sources, decisions, local mapping references and checks reduces context reconstruction and review rework. Share generic work, keep bank data local, and measure before making savings claims.', path: '/economics' },
];
const presentationPillars = [
  { title: 'OPEN', label: 'Shared foundations', proof: 'Public CFTC sources, FINOS CDM and ISDA DRR references, plus a portable source package.', boundary: 'The repository is already open source under its approved license. This prototype’s CDM/DRR crosswalk is conceptual, not a runtime integration.' },
  { title: 'EXECUTABLE', label: 'A narrow working trace', proof: 'One synthetic §45.3 branch, a weekday-only timing check, and a downloadable evaluation envelope.', boundary: 'No SDR submission, complete reporting payload, holiday calendar, or full compliance evaluation.' },
  { title: 'AUDITABLE', label: 'Inspectable evidence path', proof: 'Today: citations, assumptions, candidate mapping, result, and synthetic tests for three demo timing branches. Target: a change record linking source version, review, mapping reference, broader tests and release.', boundary: 'CI tests only the weekday-only demo calculation, then typechecks/builds. No authenticated approvals, signed record or tamper-evident audit log.' },
];
const painPoints = [
  { title: 'Interpretation handoffs', text: 'Legal text, reporting obligations, and engineering rules can be separated across teams and documents.' },
  { title: 'Change propagation', text: 'Rule changes can require coordinated updates to local mappings, tests, and operational procedures.' },
  { title: 'Evidence reconstruction', text: 'Reviewers may need to reconnect the source, decision, approval, test result, and output.' },
];
const sourceLinks = [
  ['17 CFR §45.3 — Swap creation data', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.3'],
  ['17 CFR §45.1 — Definitions', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.1'],
  ['17 CFR §45.8 — Reporting counterparty', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.8'],
  ['17 CFR §45.13 — Required data', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.13'],
  ['17 CFR Part 45 Appendix 1', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/appendix-Appendix%201%20to%20Part%2045'],
  ['17 CFR §45.5 — Unique transaction identifiers', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.5'],
  ['17 CFR §45.7 — Unique product identifiers', 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.7'],
  ['CFTC Parts 43/45 Technical Specification v3.2', 'https://www.cftc.gov/media/8261/Part43_45TechnicalSpecification03012023CLEAN/download'],
  ['CFTC v3.2 publication notice · March 10, 2023', 'https://www.cftc.gov/PressRoom/PressReleases/8673-23'],
  ['FINOS CDM 7.0.0 release', 'https://github.com/finos/common-domain-model/releases/tag/7.0.0'],
  ['FINOS CDM 7.0 · Event Model', 'https://cdm.finos.org/docs/event-model'],
  ['FINOS CDM 7.0 · Product Model', 'https://cdm.finos.org/docs/product-model'],
  ['ISDA Digital Regulatory Reporting', 'https://www.isda.org/isda-solutions-infohub/isda-digital-regulatory-reporting'],
];
const cftcCrosswalk = [
  {
    source: '#103 / current §45.5',
    title: 'Unique transaction identifier (UTI)',
    applicability: 'Required by current eCFR',
    cdmPath: 'Trade.tradeIdentifier[] · TradeIdentifier',
    status: 'Candidate',
    kind: 'blue',
    assessment: 'CDM supplies a generic trade-identifier location; §45.5 governs who generates the UTI, its LEI-plus-code structure, 52-character limit, and transmission by branch. CFTC v3.2 retains a UTI/USI alternative that conflicts with current §45.5, so do not use v3.2 alone as the implementation rule.',
  },
  {
    source: '#13 · Counterparty 1',
    title: 'Reporting counterparty identifier',
    applicability: 'Mandatory for IR in v3.2',
    cdmPath: 'Trade.counterparty[role=Party1].partyReference.partyId',
    status: 'Role mapping required',
    kind: 'amber',
    assessment: 'CFTC #13 means the party fulfilling the reporting obligation. CDM Party1 is an orientation role, not that legal determination. Resolve the reporting counterparty under §45.8 before assigning Party1; retain the applicable LEI or natural-person identifier semantics.',
  },
  {
    source: '#87 · Unique product identifier',
    title: 'UPI / product identity',
    applicability: 'Mandatory for IR in v3.2',
    cdmPath: 'Trade.product.identifier[] · ProductIdentifier',
    status: 'Candidate',
    kind: 'amber',
    assessment: 'This is a candidate location, not proof of a direct UPI match. Confirm the Commission-designated UPI path under §45.7, CDM identifier-type compatibility, issuer/reference-data handling, and SDR validation. Product taxonomy is not itself a UPI.',
  },
  {
    source: '#31–#32 · Notional',
    title: 'Per-leg notional amount and currency',
    applicability: 'Mandatory for IR in v3.2',
    cdmPath: 'Trade.product.economicTerms.payout[InterestRatePayout].priceQuantity.quantitySchedule',
    status: 'Per-leg adapter',
    kind: 'amber',
    assessment: 'Candidate economic location. CDM represents swap legs and quantity schedules; the adapter must preserve leg direction, currency/unit, and schedule semantics. CFTC v3.2 calls for the initial notional on a scheduled trade and the resulting outstanding notional for lifecycle events.',
  },
  {
    source: '#96 · Execution timestamp',
    title: 'Original execution date and time',
    applicability: 'Mandatory for IR in v3.2',
    cdmPath: 'Trade.tradeDate + Trade.tradeTime',
    status: 'Split conversion',
    kind: 'amber',
    assessment: 'CDM separates date and time, while the CFTC element is a UTC timestamp. Preserve UTC and seconds. For a clearing swap, the v3.2 footnote uses the time the DCO accepts the original swap—not a guessed venue timestamp.',
  },
  {
    source: '#97 · Reporting timestamp',
    title: 'Submission time to the SDR',
    applicability: 'Mandatory for IR in v3.2',
    cdmPath: 'Submission / transport audit metadata · outside core Trade',
    status: 'Separate layer',
    kind: 'neutral',
    assessment: 'The CFTC specification says the submitter records this UTC timestamp and validates it is not earlier than execution. No direct field was identified in the reviewed CDM Trade type; generate and persist it in the reporting envelope, not from the synthetic trade fixture.',
  },
  {
    source: '#98 · Platform identifier',
    title: 'Trading-facility MIC',
    applicability: 'Conditional in v3.2',
    cdmPath: 'Trade.executionDetails.executionVenue · LegalEntity',
    status: 'Reference-data join',
    kind: 'amber',
    assessment: 'CFTC expects an ISO 10383 Segment MIC (or Operating MIC where a Segment MIC does not exist); v3.2 makes it conditional on clearing status. CDM models the venue as a LegalEntity, so a maintained MIC-to-entity mapping is needed. This synthetic fixture does not specify clearing status.',
  },
] as const;
function loadState(): State {
  try { const saved = localStorage.getItem(STORAGE_KEY); return saved ? { ...seed, ...JSON.parse(saved), assumptions: { ...seed.assumptions, ...JSON.parse(saved).assumptions } } : seed; } catch { return seed; }
}
function prettyDate(value: string) { return new Date(`${value}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' }); }
function formatDuration(minutes: number) {
  const totalSeconds = Math.round(minutes * 60);
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, '0')}:${String(totalSeconds % 60).padStart(2, '0')}`;
}
function App() {
  const [state, setState] = useState<State>(loadState);
  const [path] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, [state]);
  useEffect(() => { if (!toast) return; const timer = window.setTimeout(() => setToast(''), 3000); return () => window.clearTimeout(timer); }, [toast]);
  const update = (patch: Partial<State>) => setState(old => ({ ...old, ...patch }));
  const branch = branchInfo[state.branch];
  const { deadline, reportDate, timingPass } = evaluateDemoTiming(state.branch, state.reportTiming);
  const current = pages.find(item => item[0] === path)?.[1] ?? 'overview';
  const title = pages.find(item => item[1] === current) ?? pages[0];
  const setBranch = (value: Branch) => update({ branch: value });
  const downloadEnvelope = () => {
    const payload = { envelopeType: 'synthetic-evaluation-envelope', purpose: 'synthetic demonstration only; not a submission file', source: { authority: 'eCFR', sections: [branch.citation, '§45.1'], snapshotDate: '2026-10-23', status: 'authoritative but unofficial' }, scenario: { executionDate: DEMO_EXECUTION_DATE, reportingDate: reportDate, branch: state.branch, reporter: branch.reporter, timingCheck: timingPass ? 'within-demo-deadline' : 'after-demo-deadline', calendar: 'weekday-only New York demo calendar; legal holidays not integrated' }, metadataBoundary: 'Selected conceptual CFTC-to-CDM crosswalk; not a complete Appendix 1 map, SDR schema, or DRR execution', createdAt: new Date().toISOString() };
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'synthetic-evaluation-envelope.json'; anchor.click(); URL.revokeObjectURL(url);
    setToast('Synthetic evaluation envelope downloaded.');
  };
  const reset = () => { if (window.confirm('Reset the local CFTC synthetic-swap scenario to its seed?')) { localStorage.removeItem(STORAGE_KEY); setState(seed); setToast('Scenario reset. Previous demo storage was left untouched.'); } };
  const props = { state, update, branch, deadline, reportDate, timingPass, setBranch, downloadEnvelope, setToast };
  return <div className="app-shell">
    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
      <Link href="/" className="brand" data-testid="link-home"><span className="brand-mark"><span /></span><span className="brand-copy"><strong>regulation<span>·</span>as<span>·</span>code</strong><small>OPEN FINANCE / LOCAL DEMO</small></span></Link>
      <div className="workspace-label"><span className="workspace-dot" /> SYNTHETIC WORKSPACE <ChevronDown size={13} /></div>
      <nav className="side-nav" aria-label="Workspace navigation">{nav.map(group => <div className="nav-group" key={group.group}><p>{group.group}</p>{group.items.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} className={`nav-link ${path === href ? 'active' : ''}`} data-testid={`nav-${label.toLowerCase().replaceAll(' ', '-')}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{path === href && <span className="nav-current" />}</Link>)}</div>)}</nav>
      <div className="sidebar-bottom"><div className="fictional-tag"><ShieldCheck size={15} /><span><b>Public source / synthetic values</b><small>No private or bank data</small></span></div><div className="sidebar-foot">Prototype only · no live integrations</div></div>
    </aside>
    {menuOpen && <button className="mobile-scrim" onClick={() => setMenuOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation" />}
    <main className="main-panel"><header className="topbar"><button className="mobile-menu button-plain" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle navigation" data-testid="button-toggle-navigation"><Menu size={20} /></button><div className="crumb"><span>Regulation as Code</span><ChevronRight size={14} /><b>{title[2]}</b></div><div className="top-actions"><a className="topbar-repo-placeholder" href="https://github.com/regulationascode/regulation_as_code" target="_blank" rel="noreferrer" aria-label="Open GitHub repository" data-testid="link-header-github"><GitBranch size={15} aria-hidden="true" /><span><strong>GitHub repository</strong><small>View source</small></span></a><span className="saved-indicator"><span /> Saved in this browser</span><Link href="/presenter" className="avatar-button avatar-link" title="Presenter lens" data-testid="link-presenter-mode">DEMO</Link></div></header>
      <div className="page-area"><div className="page-heading"><div><div className="eyebrow">{current === 'overview' ? 'INDEPENDENT REPORTING-ENGINE PROTOTYPE' : `CFTC PART 45 / ${String(pages.findIndex(p => p[1] === current)).padStart(2, '0')}`}</div><h1>{title[2]}</h1><p>{title[3]}</p></div><div className="heading-actions"><span className="badge badge-synthetic"><span className="badge-dot" /> Synthetic data</span><button className="button button-outline button-small" onClick={reset} data-testid="button-reset-demo"><RotateCcw size={14} /> Reset scenario</button></div></div>
        <div className="notice-strip"><span className="notice-symbol">i</span><p><b>Independent prototype · no endorsement.</b> CFTC source excerpts are public; all swap values are synthetic. This is not legal advice, a regulator or bank integration, a filing, or full CFTC compliance. No live AI, deployment, or production access controls.</p></div>
        <Switch>{pages.map(([href, key]) => <Route key={href} path={href}><Page page={key} {...props} /></Route>)}<Route><Page page="overview" {...props} /></Route></Switch>
      </div><footer className="app-footer"><span>Regulation as Code · synthetic workflow</span><span>State stored in this browser · synthetic fixture only</span></footer>
    </main>{toast && <div className="toast-message" role="status" data-testid="status-toast"><CheckCircle2 size={16} />{toast}</div>}
  </div>;
}
type Props = { page: string; state: State; update: (patch: Partial<State>) => void; branch: typeof branchInfo[Branch]; deadline: string; reportDate: string; timingPass: boolean; setBranch: (branch: Branch) => void; downloadEnvelope: () => void; setToast: (text: string) => void };
type PilotSide = { start: string; end: string; items: string; elapsed: string; legal: string; compliance: string; engineering: string; operations: string; rework: string; evidenceRequired: string; evidenceComplete: string };
type PilotDataMode = 'blank' | 'synthetic-example' | 'user-entered';
type PilotInputs = { scope: string; methodNotes: string; dataMode: PilotDataMode; baseline: PilotSide; pilot: PilotSide };
const blankPilotSide: PilotSide = { start: '', end: '', items: '', elapsed: '', legal: '', compliance: '', engineering: '', operations: '', rework: '', evidenceRequired: '', evidenceComplete: '' };
const blankPilot: PilotInputs = { scope: '', methodNotes: '', dataMode: 'blank', baseline: { ...blankPilotSide }, pilot: { ...blankPilotSide } };
const syntheticPilotExample: PilotInputs = {
  scope: 'SYNTHETIC EXAMPLE — public-rule change work item',
  methodNotes: 'Illustrative values only. One work item is one source-backed rule change. Apply the same inclusion criteria and start/end events in both windows. Role hours are fabricated aggregates; rework counts review loops; evidence completeness counts required provenance checks completed. No institution data was used.',
  dataMode: 'synthetic-example',
  baseline: { start: '2026-01-01', end: '2026-03-31', items: '24', elapsed: '40', legal: '48', compliance: '60', engineering: '144', operations: '48', rework: '18', evidenceRequired: '120', evidenceComplete: '84' },
  pilot: { start: '2026-04-01', end: '2026-06-30', items: '24', elapsed: '28', legal: '36', compliance: '42', engineering: '96', operations: '36', rework: '12', evidenceRequired: '120', evidenceComplete: '108' },
};
function hasPilotEntries(inputs: Partial<PilotInputs>) {
  const hasValue = (value: unknown) => String(value ?? '').trim().length > 0;
  return hasValue(inputs.scope) || hasValue(inputs.methodNotes) ||
    Object.values(inputs.baseline ?? {}).some(hasValue) ||
    Object.values(inputs.pilot ?? {}).some(hasValue);
}
const PILOT_STORAGE_KEY = 'rac-cftc-pilot-observations-v1';
function AdoptionGuide({ state, update }: { state: State; update: (patch: Partial<State>) => void }) {
  const stages = [
    { title: 'Choose one narrow public rule path', owner: 'Legal + compliance', demo: 'This prototype shows a cited §45.3 branch and a synthetic timing check.', institution: 'Select an obligation in scope; confirm the current source, applicable facts, reporting location and interpretation with accountable reviewers.', exit: 'Written scope and source snapshot agreed.' },
    { title: 'Create and own the repository', owner: 'Engineering / open-source lead', demo: 'The portable ZIP includes a YAML catalog scaffold, schema validation, synthetic timing tests and read-only GitHub Actions CI; this app still has no Git connection.', institution: 'Add the portable source to the repository you control, inspect the files and license notices, then open a pull request. CI checks catalog structure, demo calculations and build health; it does not establish full regulatory correctness or deploy.', exit: 'Repository ownership, permissions and any branch protections are set by the institution.' },
    { title: 'Run the portable example locally', owner: 'Engineering', demo: 'The example runs without a backend and uses synthetic values only.', institution: 'Use Node.js 22.12+ and pnpm 10.26.1: pnpm install --frozen-lockfile, pnpm test, pnpm run dev, then pnpm run build. The build runs TypeScript checking and creates static output in dist/.', exit: 'Tests and build are reviewed; host serves index.html for application routes.' },
    { title: 'Review the rule and technical boundary', owner: 'Legal + compliance + reporting', demo: 'One selected timing branch, weekday-only calendar and conceptual sample crosswalk.', institution: 'Reconcile current regulation, technical specifications, SDR validation, business-day calendars and obligation facts. Do not treat demo mapping paths as approved implementation.', exit: 'Documented interpretation and independently reviewed applicability.' },
    { title: 'Build private mappings and controls locally', owner: 'Reporting + data engineering + operations', demo: 'No bank schema, credentials, private data, local policy or production access controls are present.', institution: 'Implement and test institution-specific mappings, data handling, identity, approvals, evidence retention, monitoring, change control, release and recovery in approved systems.', exit: 'Local control owners sign off; private artifacts remain in institution-controlled systems.' },
    { title: 'Run a bounded pilot and measure', owner: 'Pilot sponsor + all workstream leads', demo: 'No production reporting or measured outcomes are supplied by this prototype.', institution: 'Predefine comparable work, periods, inclusion rules and role-hour capture. Record baseline and post-pilot observations; investigate confounders and rework before making claims.', exit: 'Evidence reviewed; observations are reported with limitations, not as causal guarantees.' },
    { title: 'Contribute only safe reusable improvements', owner: 'Repository owner + legal / security review', demo: 'Public contributions remain human-reviewed; CI checks synthetic timing behavior, type and build—not legal or regulatory correctness.', institution: 'Review for confidential data, mappings, policy, approval evidence, secrets and licensing before any voluntary public contribution.', exit: 'No private or restricted material crosses the institutional boundary.' },
  ];
  return <div className="content-stack">
    <Panel title="Choose a role lens" eyebrow="TAILORS THE GUIDE · NOT ACCESS CONTROL"><select className="role-select" value={state.role} onChange={e => update({ role: e.target.value })} data-testid="select-role-lens">{['Financial-services leader', 'Compliance/legal reviewer', 'Reporting/data engineer', 'Open-source contributor'].map(r => <option key={r}>{r}</option>)}</select><div className="role-explanation" data-testid="text-role-explanation"><b>{state.role}</b><p>{roleCopy(state.role)}</p></div></Panel>
    <section className="adoption-intro"><span className="eyebrow">PORTABLE SOURCE · INSTITUTION-OWNED REPOSITORY</span><h2>Start with public logic.<br /><em>Keep local accountability local.</em></h2><p>A practical path from a source-backed example to a carefully governed pilot. Your team creates and manages its own repository manually; this app never connects to Git.</p></section>
    <Panel title="Fork-to-pilot sequence" eyebrow="HUMAN-LED · MANUAL REPOSITORY SETUP"><div className="adoption-stage-list">{stages.map((stage, i) => <article className="adoption-stage" key={stage.title} data-testid={`stage-adoption-${i + 1}`}><div className="adoption-stage-index">{String(i + 1).padStart(2, '0')}</div><div className="adoption-stage-content"><div className="adoption-stage-heading"><h4>{stage.title}</h4><span>{stage.owner}</span></div><div className="adoption-stage-columns"><div><small>In this demo</small><p>{stage.demo}</p></div><div><small>Institution must build / review</small><p>{stage.institution}</p></div></div><div className="adoption-exit"><CheckCircle2 size={14} /><b>Checkpoint</b><span>{stage.exit}</span></div></div></article>)}</div></Panel>
    <div className="grid-two">
      <Panel title="Portable source: local run" eyebrow="CATALOG VALIDATION + GITHUB ACTIONS CI"><p className="panel-copy">Add the complete source ZIP to a repository you control. It includes one clearly marked CFTC §45.3 catalog scaffold, not a complete regulation catalog. This app does not connect to, create, fork, or push to Git.</p><a className="button button-primary button-small adoption-download" href={`${import.meta.env.BASE_URL}portable-source.zip`} download data-testid="link-download-portable-source"><Download size={13} /> Download clean source ZIP</a><div className="adoption-commands"><code>pnpm install --frozen-lockfile</code><code>pnpm run validate:catalog</code><code>pnpm test</code><code>pnpm run dev</code><code>pnpm run build</code></div><p className="small-note">Requires Node.js 22.12+ and pnpm 10.26.1. CI validates YAML schemas and source references, tests synthetic weekday-only branches, then typechecks and builds; it does not deploy or validate full regulatory correctness. Static output is in dist/.</p></Panel>
      <Panel title="Control boundary" eyebrow="PRIVATE BY DEFAULT"><div className="adoption-boundary"><div><span>Portable / potentially shareable</span><p>Public citations, generic scaffolding, synthetic test examples and reusable non-confidential improvements—after institutional review.</p></div><div><span>Remain institution-controlled</span><p>Private data, bank-specific mappings, credentials, local policy, approval evidence, operational controls and any restricted implementation detail.</p></div></div><div className="callout-amber"><ShieldCheck size={16} /><span>This prototype is not production-ready. A real institution must independently build, secure, validate and govern its own implementation.</span></div></Panel>
    </div>
  </div>;
}
function PilotComparison({ setToast }: { setToast: (text: string) => void }) {
  const [inputs, setInputs] = useState<PilotInputs>(() => {
    try {
      const saved = localStorage.getItem(PILOT_STORAGE_KEY);
      if (!saved) return blankPilot;
      const parsed = JSON.parse(saved) as Partial<PilotInputs>;
      const dataMode = parsed.dataMode === 'synthetic-example' || parsed.dataMode === 'user-entered' ? parsed.dataMode : hasPilotEntries(parsed) ? 'user-entered' : 'blank';
      return { ...blankPilot, ...parsed, dataMode, baseline: { ...blankPilotSide, ...parsed.baseline }, pilot: { ...blankPilotSide, ...parsed.pilot } };
    } catch { return blankPilot; }
  });
  useEffect(() => { try { localStorage.setItem(PILOT_STORAGE_KEY, JSON.stringify(inputs)); } catch { /* Browser storage may be unavailable; the page remains usable in memory. */ } }, [inputs]);
  const markUserEntered = (mode: PilotDataMode): PilotDataMode => mode === 'blank' ? 'user-entered' : mode;
  const change = (side: 'baseline' | 'pilot', key: keyof PilotSide, value: string) => setInputs(current => ({ ...current, dataMode: markUserEntered(current.dataMode), [side]: { ...current[side], [key]: value } }));
  const changeText = (key: 'scope' | 'methodNotes', value: string) => setInputs(current => ({ ...current, dataMode: markUserEntered(current.dataMode), [key]: value }));
  const validNumber = (value: string, integer = false) => value.trim() !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 && (!integer || Number.isInteger(Number(value)));
  const sideValid = (side: PilotSide) => {
    const datesOk = !!side.start && !!side.end && side.end >= side.start;
    return datesOk && validNumber(side.items, true) && Number(side.items) > 0 && validNumber(side.elapsed) &&
      ['legal', 'compliance', 'engineering', 'operations', 'rework'].every(key => validNumber(side[key as keyof PilotSide], key === 'rework')) &&
      validNumber(side.evidenceRequired, true) && Number(side.evidenceRequired) > 0 &&
      validNumber(side.evidenceComplete, true) && Number(side.evidenceComplete) <= Number(side.evidenceRequired);
  };
  const baselineValid = sideValid(inputs.baseline), pilotValid = sideValid(inputs.pilot);
  const comparable = inputs.scope.trim().length > 0 && inputs.methodNotes.trim().length > 0 && baselineValid && pilotValid && Number(inputs.baseline.items) === Number(inputs.pilot.items);
  const derive = () => {
    if (!comparable) return null;
    const base = inputs.baseline, post = inputs.pilot, count = Number(base.items);
    const deltaPerItem = (b: number, p: number) => ({ baselinePerItem: b / count, pilotPerItem: p / count, absoluteDeltaPerItem: p / count - b / count, percentDelta: b === 0 ? null : ((p - b) / b) * 100 });
    const deltaAveragePerItem = (b: number, p: number) => ({ baselinePerItem: b, pilotPerItem: p, absoluteDeltaPerItem: p - b, percentDelta: b === 0 ? null : ((p - b) / b) * 100 });
    const roles = ['legal', 'compliance', 'engineering', 'operations'] as const;
    const baseRoleHours = roles.reduce((sum, role) => sum + Number(base[role]), 0), pilotRoleHours = roles.reduce((sum, role) => sum + Number(post[role]), 0);
    const baseEvidence = Number(base.evidenceComplete) / Number(base.evidenceRequired) * 100, pilotEvidence = Number(post.evidenceComplete) / Number(post.evidenceRequired) * 100;
    return {
      comparableWorkItems: count,
      elapsedHoursPerItem: deltaAveragePerItem(Number(base.elapsed), Number(post.elapsed)),
      roleHoursPerItem: deltaPerItem(baseRoleHours, pilotRoleHours),
      roleHoursByRole: Object.fromEntries(roles.map(role => [role, deltaPerItem(Number(base[role]), Number(post[role]))])),
      reworkEventsPerItem: deltaPerItem(Number(base.rework), Number(post.rework)),
      evidenceCompletenessPercent: { baseline: baseEvidence, pilot: pilotEvidence, percentagePointDelta: pilotEvidence - baseEvidence },
    };
  };
  const metrics = derive();
  const fmt = (value: number, suffix = '') => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}${suffix}`;
  const deltaLabel = (value: { absoluteDeltaPerItem: number; percentDelta: number | null }, suffix = '') => `${value.absoluteDeltaPerItem > 0 ? '+' : ''}${fmt(value.absoluteDeltaPerItem, suffix)} / item${value.percentDelta === null ? ' · % change unavailable (baseline is zero)' : ` · ${value.percentDelta > 0 ? '+' : ''}${fmt(value.percentDelta, '%')}`}`;
  const comparisonStatus = inputs.dataMode === 'synthetic-example' ? 'SYNTHETIC EXAMPLE' : inputs.dataMode === 'user-entered' ? metrics ? 'USER-ENTERED · UNVERIFIED' : 'USER INPUTS INCOMPLETE' : 'INPUTS INCOMPLETE';
  const downloadSnapshot = () => {
    const snapshot = {
      snapshotType: 'local-pilot-observation-comparison',
      schemaVersion: 1,
      dataClassification: inputs.dataMode,
      recordIntegrity: 'Editable browser-local prototype snapshot; not signed, tamper-evident, or an audit log.',
      createdAt: new Date().toISOString(),
      rawInputs: inputs,
      comparisonWindows: { baseline: { start: inputs.baseline.start || null, end: inputs.baseline.end || null }, pilot: { start: inputs.pilot.start || null, end: inputs.pilot.end || null } },
      derivedMetrics: metrics,
      status: inputs.dataMode === 'synthetic-example' ? 'fictional synthetic walkthrough; not pilot evidence, causal savings, or a guarantee' : inputs.dataMode === 'user-entered' ? 'user-entered and unverified descriptive observations; not causal savings or a guarantee' : 'incomplete inputs; no derived comparison',
      limitations: ['Browser-local prototype only; this file is downloaded by the user and is not sent anywhere.', 'Editable user inputs are not signed, tamper-evident evidence, an audit log, or independent assurance.', 'Do not include personal, trade, customer, employee or bank identifiers; handle downloaded observations under institutional data policy.', 'Work-item counts must be positive and equal for comparability.', 'Elapsed cycle hours and role hours are descriptive; no attribution or causal inference is made.', 'Period scope, case mix, staffing, calendar, measurement method and external changes may differ.', 'Evidence completeness is complete items divided by required items; percentage-point delta is not a percent change.', 'No dollar savings are calculated from these observations; results are not a forecast, validated economic model, legal conclusion or guarantee.'],
    };
    const url = URL.createObjectURL(new Blob([JSON.stringify(snapshot, null, 2)], { type: 'application/json' }));
    const anchor = document.createElement('a'); anchor.href = url; anchor.download = 'pilot-observation-snapshot.json'; anchor.click(); URL.revokeObjectURL(url); setToast('Pilot snapshot downloaded.');
  };
  const resetInputs = () => { if (window.confirm('Clear locally stored pilot comparison inputs in this browser?')) { setInputs({ ...blankPilot, baseline: { ...blankPilotSide }, pilot: { ...blankPilotSide } }); setToast('Pilot comparison cleared from this browser.'); } };
  const loadExample = () => {
    if (hasPilotEntries(inputs) && !window.confirm('Replace the current pilot comparison inputs with the fictional synthetic example?')) return;
    setInputs({ ...syntheticPilotExample, baseline: { ...syntheticPilotExample.baseline }, pilot: { ...syntheticPilotExample.pilot } });
    setToast('Synthetic example loaded. These values are fictional, not bank results.');
  };
  const renderSide = (sideKey: 'baseline' | 'pilot', heading: string) => {
    const side = inputs[sideKey], prefix = sideKey;
    const field = (key: keyof PilotSide, label: string, type = 'number', step?: string) => <label key={key}>{label}<input type={type} min={type === 'number' ? '0' : undefined} step={step} value={side[key]} onChange={event => change(sideKey, key, event.target.value)} data-testid={`input-pilot-${prefix}-${key}`} /></label>;
    return <section className="pilot-period" key={sideKey}><div className="pilot-period-heading"><span>{sideKey === 'baseline' ? '01' : '02'}</span><div><h4>{heading}</h4><small>{sideKey === 'baseline' ? 'Before implementation' : 'After bounded pilot period'}</small></div></div><div className="pilot-field-grid">
      {field('start', 'Window start', 'date')}{field('end', 'Window end', 'date')}{field('items', 'Comparable work items')}{field('elapsed', 'Avg elapsed cycle hours / item', 'number', 'any')}
    </div><div className="pilot-subhead">Role hours across this window</div><div className="pilot-field-grid pilot-role-grid">{field('legal', 'Legal hours', 'number', 'any')}{field('compliance', 'Compliance hours', 'number', 'any')}{field('engineering', 'Engineering hours', 'number', 'any')}{field('operations', 'Operations hours', 'number', 'any')}</div><div className="pilot-subhead">Rework and evidence</div><div className="pilot-field-grid pilot-evidence-grid">{field('rework', 'Rework events', 'number', '1')}{field('evidenceRequired', 'Evidence items required', 'number', '1')}{field('evidenceComplete', 'Evidence items complete', 'number', '1')}</div></section>;
  };
  return <div className="content-stack">
    <div className="economics-warning"><Activity size={17} /><span><b>Illustrative assumptions only.</b> Scenario outputs are discussion estimates, not measured pilot evidence, a savings claim or a guarantee.</span></div>
    <EconomicsCalculator
      metrics={metrics ? { comparableWorkItems: metrics.comparableWorkItems, roles: metrics.roleHoursByRole } : null}
      dataMode={inputs.dataMode}
    />
    <div className="economics-warning pilot-observation-warning"><Activity size={17} /><span><b>Observed comparison, not causal savings.</b> Inputs are stored in this browser only. Nothing is sent to a service. Leave unknown values empty; empty is never interpreted as zero. Do not enter personal, trade, customer, employee or bank identifiers. Downloaded JSON contains entered values and must be handled under institutional data policy. The record is editable, not tamper-evident or an audit log.</span></div>
    <Panel title="Pilot baseline / post-pilot observations" eyebrow="LOCAL ONLY · DESCRIPTIVE COMPARISON" action={<div className="pilot-actions"><button className="button button-outline button-small" onClick={resetInputs} data-testid="button-clear-pilot-inputs"><RotateCcw size={13} /> Clear inputs</button><button className="button button-outline button-small" onClick={loadExample} data-testid="button-load-synthetic-pilot"><Activity size={13} /> Load synthetic example</button><button className="button button-primary button-small" onClick={downloadSnapshot} data-testid="button-download-pilot-snapshot"><Download size={13} /> Download JSON</button></div>}>
      {inputs.dataMode === 'synthetic-example' && <div className="callout-amber synthetic-example-callout" role="note" data-testid="notice-synthetic-pilot-example"><ShieldCheck size={15} /><span><b>Fictional synthetic walkthrough — not bank or pilot results.</b> The figures are invented to demonstrate the calculations. Editing them keeps this scenario labeled synthetic; clear inputs before entering a separate set of observations.</span></div>}
      {inputs.dataMode === 'user-entered' && <div className="pilot-user-data-note" role="note" data-testid="notice-user-entered-pilot"><ShieldCheck size={15} /><span><b>User-entered, not independently verified.</b> These values are descriptive observations only; the app does not verify their source or establish causation.</span></div>}
      <label className="pilot-scope-field">Pilot scope <input value={inputs.scope} onChange={event => changeText('scope', event.target.value)} placeholder="Describe the obligation or work type; do not enter personal or bank identifiers." data-testid="input-pilot-scope" /></label>
      <label className="pilot-scope-field">Work-item definition and measurement method <textarea rows={3} value={inputs.methodNotes} onChange={event => changeText('methodNotes', event.target.value)} placeholder="Define inclusion rules, start/end events, role-hour capture and evidence checks. No identifiers." data-testid="input-pilot-method-notes" /></label>
      <div className="pilot-period-grid">{renderSide('baseline', 'Baseline window')}{renderSide('pilot', 'Post-pilot window')}</div>
      <p className="small-note">Use equivalent work-item definitions and measurement methods in both periods. Periods need not be adjacent; explain differences during review.</p>
      <section className="pilot-results" aria-live="polite"><div className="pilot-results-heading"><div><span className="eyebrow">COMPARISON RESULTS</span><h4>Per-item observations</h4></div><span className="badge badge-amber" data-testid="status-pilot-comparison">{comparisonStatus}</span></div>
        {!metrics ? <p className="pilot-empty" data-testid="text-pilot-empty">Enter a scope and measurement method, valid date windows, matching positive work-item counts, non-negative role and cycle values, and valid evidence counts to calculate descriptive deltas.</p> : <><div className="pilot-result-grid">
          <div className="pilot-result"><span>Elapsed cycle time</span><b data-testid="value-pilot-elapsed-delta">{deltaLabel(metrics.elapsedHoursPerItem, ' h')}</b><small>Baseline {fmt(metrics.elapsedHoursPerItem.baselinePerItem, ' h')} / item · pilot {fmt(metrics.elapsedHoursPerItem.pilotPerItem, ' h')} / item</small></div>
          <div className="pilot-result"><span>Role effort per item</span><b data-testid="value-pilot-role-hours-delta">{deltaLabel(metrics.roleHoursPerItem, ' h')}</b><small>Legal + compliance + engineering + operations</small></div>
          <div className="pilot-result"><span>Rework events</span><b data-testid="value-pilot-rework-delta">{deltaLabel(metrics.reworkEventsPerItem)}</b><small>Events per comparable work item</small></div>
          <div className="pilot-result"><span>Evidence completeness</span><b data-testid="value-pilot-evidence-delta">{fmt(metrics.evidenceCompletenessPercent.percentagePointDelta, ' pp')}</b><small>{fmt(metrics.evidenceCompletenessPercent.baseline, '%')} baseline → {fmt(metrics.evidenceCompletenessPercent.pilot, '%')} pilot</small></div>
        </div><div className="pilot-role-results"><b>Role hours per item</b>{(['legal', 'compliance', 'engineering', 'operations'] as const).map(role => <span key={role} data-testid={`value-pilot-role-${role}`}>{role[0].toUpperCase() + role.slice(1)} <strong>{deltaLabel(metrics.roleHoursByRole[role], ' h')}</strong></span>)}</div></>}
        <div className="small-note">Delta = pilot minus baseline; a negative value means lower in the pilot window. Percent change is unavailable when the baseline is zero.</div><div className="callout-amber"><ShieldCheck size={15} /><span>Descriptive observations only. Differences may reflect scope, case mix, staffing, calendar, learning, or other changes; they do not establish causation or guarantee future results.</span></div>
      </section>
    </Panel>
  </div>;
}

const blankScenario = (): ScenarioValues => ({
  workItems: '', setup: '', maintenance: '', hardSavings: '', low: '', planning: '', high: '',
  hours_legal: '', hours_compliance: '', hours_operations: '', hours_engineering: '', hours_review: '',
  rate_legal: '', rate_compliance: '', rate_operations: '', rate_engineering: '', rate_review: '',
});

const fictionalScenario: ScenarioValues = {
  workItems: '12', setup: '0', maintenance: '0', hardSavings: '0',
  low: '5', planning: '10', high: '15',
  hours_legal: '30', hours_compliance: '30', hours_operations: '30', hours_engineering: '30', hours_review: '0',
  rate_legal: '240', rate_compliance: '190', rate_operations: '140', rate_engineering: '150', rate_review: '0',
};

function EconomicsCalculator({ metrics, dataMode }: { metrics: MeasuredInput | null; dataMode: PilotDataMode }) {
  const [mode, setMode] = useState<'scenario' | 'measured'>('scenario');
  const [scenario, setScenario] = useState<ScenarioValues>(blankScenario);
  const [scenarioExampleLoaded, setScenarioExampleLoaded] = useState(false);
  const [measuredCosts, setMeasuredCosts] = useState<Record<ScenarioRole, string>>({
    legal: '', compliance: '', operations: '', engineering: '', review: '',
  });
  const [measuredCash, setMeasuredCash] = useState({ savings: '', implementation: '', maintenance: '' });
  const result = calculateScenario(scenario);
  const measuredNumbers = {
    savings: parseNonnegative(measuredCash.savings),
    implementation: parseNonnegative(measuredCash.implementation),
    maintenance: parseNonnegative(measuredCash.maintenance),
  };
  const measuredRates = Object.fromEntries(scenarioRoles.map(({ key }) => [key, parseNonnegative(measuredCosts[key])])) as Partial<Record<ScenarioRole, number>>;
  const measuredResult = metrics && Object.values(measuredNumbers).every(value => value !== null)
    ? calculateMeasured(metrics, measuredRates, measuredNumbers.savings!, measuredNumbers.implementation!, measuredNumbers.maintenance!)
    : null;
  const setScenarioField = (key: keyof ScenarioValues, value: string) => setScenario(current => ({ ...current, [key]: value }));
  const moneyText = (value: number) => `${value < 0 ? '−' : ''}$${Math.abs(value).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  const numericField = (id: string, label: string, value: string, onChange: (value: string) => void, help?: string, max?: number) => (
    <label className="econ-field" key={id} htmlFor={id}>
      <span>{label}</span>
      <input id={id} type="number" min="0" max={max} step="any" inputMode="decimal" value={value} onChange={event => onChange(event.target.value)} data-testid={id} aria-describedby={help ? `${id}-help` : undefined} />
      {help && <small id={`${id}-help`}>{help}</small>}
    </label>
  );
  const scenarioFieldsValid = Object.entries(scenario).every(([key, value]) => parseNonnegative(value, ['low', 'planning', 'high'].includes(key) ? 100 : undefined) !== null) &&
    Number(scenario.workItems) > 0 && Number.isInteger(Number(scenario.workItems)) && Number(scenario.low) <= Number(scenario.planning) && Number(scenario.planning) <= Number(scenario.high);
  return <section className="econ-calculator" aria-labelledby="econ-calculator-title" data-testid="economics-calculator">
    <div className="econ-intro">
      <div><span className="eyebrow">VALUE REVIEW · ASSUMPTIONS STAY VISIBLE</span><h2 id="econ-calculator-title">Put dollars beside the evidence.</h2></div>
      <p>Capacity is not cash. Keep illustrative scenarios separate from observed pilot comparisons, and make every cost and rate inspectable.</p>
    </div>
    <div className="econ-mode-switch" role="group" aria-label="Economics view">
      <button type="button" aria-pressed={mode === 'scenario'} className={mode === 'scenario' ? 'selected' : ''} onClick={() => setMode('scenario')} data-testid="tab-economics-scenario">Illustrative scenario</button>
      <button type="button" aria-pressed={mode === 'measured'} className={mode === 'measured' ? 'selected' : ''} onClick={() => setMode('measured')} data-testid="tab-economics-measured">Measured-pilot dollars</button>
    </div>
    {mode === 'scenario' ? <div className="econ-layout" role="region" aria-label="Illustrative scenario calculator">
      <div className="econ-inputs">
        <div className="econ-scenario-head"><div><span className="econ-index">01 / SCENARIO MODEL</span><h3>Set the operating assumptions</h3></div><button type="button" className="button button-outline button-small" onClick={() => { setScenario({ ...fictionalScenario }); setScenarioExampleLoaded(true); }} data-testid="button-load-economic-example"><Activity size={14} /> Load 12 × 120-hour example</button></div>
        {scenarioExampleLoaded && <div className="econ-example-note" role="note" data-testid="notice-economic-example"><b>Fictional illustration, not measured savings.</b> Uses 12 changes × 120 hours × $180 blended loaded cost; the 10% planning case shows $25,920 of staff capacity, not cash. The four-role split and 5% / 15% sensitivity bounds are demonstration inputs. Setup, maintenance, and hard-dollar savings are set to $0 only to isolate capacity; replace them with institution-reviewed values before interpreting net value.</div>}
        <p className="econ-help">Blank until entered. Scenario values are held in React memory only and are not saved or transmitted.</p>
        <div className="econ-fields-grid">
          {numericField('input-econ-work-items', 'Comparable rule-change work items / year', scenario.workItems, value => setScenarioField('workItems', value), 'Annual volume within the defined scope.')}
        </div>
        <div className="econ-role-table">
          <div className="econ-table-head"><span>Role</span><span>Baseline hours / item</span><span>Loaded cost / hour</span></div>
          {scenarioRoles.map(({ key, label }) => <div className="econ-role-row" key={key}>
            <b>{label}</b>
            {numericField(`input-econ-hours-${key}`, `${label}: baseline hours per item`, scenario[`hours_${key}`], value => setScenarioField(`hours_${key}`, value))}
            {numericField(`input-econ-rate-${key}`, `${label}: loaded hourly cost`, scenario[`rate_${key}`], value => setScenarioField(`rate_${key}`, value))}
          </div>)}
        </div>
        <div className="econ-subheading"><h4>Time reduction assumptions</h4><span>0–100% · user supplied</span></div>
        <div className="econ-fields-grid econ-three">
          {(['low', 'planning', 'high'] as const).map(key => numericField(`input-econ-reduction-${key}`, `${key[0].toUpperCase()}${key.slice(1)} time reduction (%)`, scenario[key], value => setScenarioField(key, value), key === 'planning' ? 'Must sit between low and high.' : undefined, 100))}
        </div>
        <p className="econ-range-warning" data-testid="text-econ-range-validation">{scenario.low && scenario.planning && scenario.high && (Number(scenario.low) > Number(scenario.planning) || Number(scenario.planning) > Number(scenario.high)) ? 'Set low ≤ planning ≤ high to show scenario results.' : 'No productivity or savings rate is pre-applied.'}</p>
        <div className="econ-subheading"><h4>Costs and cash-only assumptions</h4><span>Explicit inputs</span></div>
        <div className="econ-fields-grid econ-three">
          {numericField('input-econ-setup', 'One-time implementation cost ($)', scenario.setup, value => setScenarioField('setup', value))}
          {numericField('input-econ-maintenance', 'Annual maintenance cost ($)', scenario.maintenance, value => setScenarioField('maintenance', value))}
          {numericField('input-econ-hard-savings', 'Assumed annual hard-dollar savings ($)', scenario.hardSavings, value => setScenarioField('hardSavings', value), 'Exclude staff capacity value. Do not infer from hours released.')}
        </div>
      </div>
      <ScenarioSummary result={result} complete={scenarioFieldsValid} moneyText={moneyText} />
    </div> : <div className="econ-layout" role="region" aria-label="Measured pilot dollar view">
      <div className="econ-inputs">
        <div className="econ-scenario-head"><div><span className="econ-index">02 / OBSERVED COMPARISON</span><h3>Price the validated sample</h3></div><span className={`badge ${metrics ? 'badge-blue' : 'badge-neutral'}`} data-testid="status-measured-pilot-source">{metrics ? `${metrics.comparableWorkItems} MATCHED ITEMS` : 'COMPARISON INCOMPLETE'}</span></div>
        <p className="econ-help">Role hours come directly from the validated baseline / pilot comparison below. Enter loaded rates and documented cash amounts for that same window. No annualization or causal claim.</p>
        {!metrics && <div className="econ-incomplete" role="status" data-testid="text-measured-source-incomplete">Measured comparison is incomplete. Complete the scope, method, dates, matching positive work-item counts and valid observations below.</div>}
        <div className="econ-role-table">
          <div className="econ-table-head"><span>Role</span><span>Sample hours released</span><span>Loaded cost / hour</span></div>
          {scenarioRoles.map(({ key, label, measured }) => {
            const observation = metrics?.roles[key];
            const hoursReleased = observation && metrics ? (observation.baselinePerItem - observation.pilotPerItem) * metrics.comparableWorkItems : null;
            return <div className="econ-role-row" key={key}>
              <b>{label}</b><span className="econ-observed-hours" data-testid={`value-measured-hours-${key}`}>{!measured ? 'Not captured in pilot inputs' : hoursReleased === null ? '—' : `${hoursReleased.toLocaleString('en-US', { maximumFractionDigits: 2 })} h`}</span>
              {measured
                ? numericField(`input-measured-rate-${key}`, `${label}: loaded hourly cost`, measuredCosts[key], value => setMeasuredCosts(current => ({ ...current, [key]: value })))
                : <span className="econ-not-captured" data-testid={`text-measured-rate-unavailable-${key}`}>Not captured</span>}
            </div>;
          })}
        </div>
        <div className="econ-subheading"><h4>Documented cash and actual costs</h4><span>Same measurement window</span></div>
        <div className="econ-fields-grid econ-three">
          {numericField('input-measured-hard-savings', 'Direct hard-dollar savings ($)', measuredCash.savings, value => setMeasuredCash(current => ({ ...current, savings: value })), 'Evidence source required in your review record; exclude capacity value.')}
          {numericField('input-measured-implementation', 'Actual implementation cost ($)', measuredCash.implementation, value => setMeasuredCash(current => ({ ...current, implementation: value })))}
          {numericField('input-measured-maintenance', 'Actual maintenance cost ($)', measuredCash.maintenance, value => setMeasuredCash(current => ({ ...current, maintenance: value })))}
        </div>
      </div>
      <MeasuredSummary result={measuredResult} sourceComplete={!!metrics} dataMode={dataMode} moneyText={moneyText} />
    </div>}
    <div className="econ-privacy" role="note"><ShieldCheck size={16} /><span><b>Local by design.</b> New scenario, rate and cash fields remain in memory for this page only. They are not written to browser storage, URL, cookies, analytics or a server. Existing pilot observations keep their current browser-local storage and warning.</span></div>
  </section>;
}

function ScenarioSummary({ result, complete, moneyText }: { result: ReturnType<typeof calculateScenario>; complete: boolean; moneyText: (value: number) => string }) {
  if (!result) return <aside className="econ-summary" aria-live="polite"><span className="econ-index">EXECUTIVE READOUT</span><h3>Scenario not yet calculable</h3><p className="econ-incomplete" data-testid="text-econ-scenario-incomplete">{complete ? 'Check that annual work items are a whole number and low ≤ planning ≤ high.' : 'Enter every scenario input, including role hours, loaded costs, reduction range, and cash/cost assumptions. Blank values are not zero.'}</p><SummaryBoundary /></aside>;
  return <aside className="econ-summary" aria-live="polite" data-testid="summary-econ-scenario">
    <span className="econ-index">EXECUTIVE READOUT · SCENARIO</span><h3>Capacity, cash, and costs stay distinct.</h3>
    <div className="econ-summary-primary"><small>Planning capacity value</small><b data-testid="value-econ-planning-capacity">{moneyText(result.cases.planning.capacityValue)}</b><span>Released staff time priced at user-entered loaded costs; not cash savings.</span></div>
    <dl className="econ-summary-list">
      <div><dt>Annual baseline effort</dt><dd data-testid="value-econ-baseline-hours">{result.annualBaselineHours.toLocaleString('en-US', { maximumFractionDigits: 1 })} h</dd></div>
      <div><dt>Annual baseline labor value</dt><dd data-testid="value-econ-baseline-value">{moneyText(result.annualBaselineLaborValue)}</dd></div>
      <div><dt>Planning hours released</dt><dd data-testid="value-econ-planning-hours">{result.cases.planning.releasedHours.toLocaleString('en-US', { maximumFractionDigits: 1 })} h</dd></div>
      <div><dt>Assumed annual hard-dollar savings</dt><dd data-testid="value-econ-hard-savings">{moneyText(result.annualHardDollarSavings)}</dd></div>
      <div><dt>Annual maintenance cost</dt><dd data-testid="value-econ-maintenance">{moneyText(result.annualMaintenanceCost)}</dd></div>
      <div><dt>One-time implementation cost</dt><dd data-testid="value-econ-setup">{moneyText(result.setupCost)}</dd></div>
      <div><dt>Annual economic value after maintenance</dt><dd data-testid="value-econ-annual-economic">{moneyText(result.cases.planning.annualEconomicValue)}</dd></div>
      <div><dt>First-year economic value after setup</dt><dd data-testid="value-econ-first-year-economic">{moneyText(result.cases.planning.firstYearEconomicValue)}</dd></div>
      <div><dt>Annual net cash impact</dt><dd data-testid="value-econ-annual-cash">{moneyText(result.annualCashImpact)}</dd></div>
      <div><dt>First-year net cash impact</dt><dd data-testid="value-econ-first-year-cash">{moneyText(result.firstYearCashImpact)}</dd></div>
    </dl>
    <div className="econ-sensitivity" data-testid="range-econ-sensitivity"><b>Sensitivity · low / planning / high</b>{(['low', 'planning', 'high'] as const).map(key => <span key={key}><small>{key}</small><strong>{moneyText(result.cases[key].capacityValue)}</strong><em>{moneyText(result.cases[key].annualEconomicValue)} annual economic value</em></span>)}</div>
    <div className={`econ-payback ${result.paybackYears === null ? 'not-demonstrated' : ''}`} data-testid="status-econ-payback"><span>Cash payback</span><b>{result.paybackYears === null ? 'Not demonstrated' : `${result.paybackYears.toLocaleString('en-US', { maximumFractionDigits: 2 })} years`}</b><small>{result.paybackYears === null ? 'Annual assumed hard-dollar savings do not exceed annual maintenance.' : 'Setup cost ÷ (annual hard-dollar savings − annual maintenance). Capacity value excluded.'}</small></div>
    <SummaryBoundary />
  </aside>;
}

function MeasuredSummary({ result, sourceComplete, dataMode, moneyText }: { result: ReturnType<typeof calculateMeasured>; sourceComplete: boolean; dataMode: PilotDataMode; moneyText: (value: number) => string }) {
  if (!result) return <aside className="econ-summary" aria-live="polite"><span className="econ-index">EXECUTIVE READOUT</span><h3>Measured dollars not yet calculable</h3><p className="econ-incomplete" data-testid="text-measured-incomplete">{!sourceComplete ? 'Complete the comparison inputs above first.' : 'Enter a finite non-negative loaded cost for each measured role, direct hard-dollar savings, and actual implementation and maintenance costs. Blank is not zero.'}</p><SummaryBoundary /></aside>;
  return <aside className="econ-summary" aria-live="polite" data-testid="summary-econ-measured">
    <span className="econ-index">EXECUTIVE READOUT · {dataMode === 'synthetic-example' ? 'SYNTHETIC EXAMPLE' : dataMode === 'user-entered' ? 'USER-ENTERED · UNVERIFIED' : 'OBSERVED WINDOW'}</span><h3>Observed sample, not an annual forecast.</h3>
    <div className="econ-summary-primary"><small>Observed sample capacity value</small><b data-testid="value-measured-capacity">{moneyText(result.observedCapacityValue)}</b><span>Calculated from observed role-hour deltas × user-entered loaded costs.</span></div>
    <dl className="econ-summary-list">
      {result.roles.map(role => <div key={role.role}><dt>{scenarioRoles.find(item => item.key === role.role)?.label} capacity value</dt><dd data-testid={`value-measured-capacity-${role.role}`}>{moneyText(role.capacityValue)}</dd></div>)}
      <div><dt>User-entered cash impact</dt><dd data-testid="value-measured-cash">{moneyText(result.cashImpact)}</dd></div>
      <div><dt>Observed economic value including capacity</dt><dd data-testid="value-measured-economic">{moneyText(result.economicValue)}</dd></div>
    </dl>
    <p className="econ-source-note"><b>Cash source:</b> direct user-entered hard-dollar savings less actual implementation and maintenance costs for this same window. <b>Capacity source:</b> existing comparable role-hour observations; no duplicate hours entered here.</p>
    <SummaryBoundary />
  </aside>;
}

function SummaryBoundary() {
  return <p className="econ-boundary"><b>Interpret with care.</b> Scenario outputs reflect supplied assumptions only. Measured differences are descriptive, not causal. No recovered staff hours are treated as cash savings; no result is validated or guaranteed.</p>;
}
function Page({ page, state, update, branch, deadline, reportDate, timingPass, setBranch, downloadEnvelope, setToast }: Props) {
  const [taskAdded, setTaskAdded] = useState(false);
  const scenarioControls = <ScenarioControls state={state} setBranch={setBranch} update={update} />;
  const trace = <Trace state={state} branch={branch} deadline={deadline} reportDate={reportDate} timingPass={timingPass} />;
  if (page === 'overview') return <div className="content-stack overview-story">
    <OverviewAudienceHero />

    <section id="pipeline" className="overview-section pipeline-explorer" aria-labelledby="pipeline-explorer-title" data-testid="overview-pipeline-explorer">
      <div className="section-marker"><span>00</span><span>BIRD'S-EYE PIPELINE</span></div>
      <h2 className="sr-only" id="pipeline-explorer-title">Bird's-eye reporting pipeline</h2>
      <PipelineExperience />
    </section>

    <section className="overview-section pain-section">
      <div className="section-marker"><span>01</span><span>THE FRICTION</span></div>
      <div className="section-intro"><h2>Important work gets split<br />across too many handoffs.</h2><p>These are practical questions to validate with institutions—not quantified industry-wide claims.</p></div>
      <div className="pain-ledger">{painPoints.map((point, i) => <article className="pain-ledger-row" key={point.title}><span className="ledger-no">{String(i + 1).padStart(2, '0')}</span><h3>{point.title}</h3><p>{point.text}</p><span className="ledger-mark" aria-hidden="true">↗</span></article>)}</div>
    </section>

    <section className="overview-section pipeline-section">
      <div className="section-marker"><span>02</span><span>THE PROTOTYPE</span></div>
      <div className="pipeline-heading"><div><h2>A trace you can<br /><em>actually follow.</em></h2><p>One public rule branch becomes a synthetic evaluation—not a submission.</p></div><Link href="/validation" className="button button-outline" data-testid="link-overview-validation">See the timing check <ArrowRight size={14} /></Link></div>
      <div className="pipeline-ribbon">
        {[['01','SOURCE','eCFR · §45.3'],['02','INTERPRET','Human-selected branch'],['03','MAP','Conceptual CDM candidates'],['04','CHECK','Weekday-only timing'],['05','INSPECT','Synthetic envelope']].map(([n,label,detail], i) => <div className="pipeline-node" key={label}><span>{n}</span><b>{label}</b><small>{detail}</small>{i < 4 && <i aria-hidden="true" />}</div>)}
      </div>
      <div className="pipeline-boundary"><span className="boundary-public"><b>Reusable public layer</b><small>Sources · generic rule scaffolding · shared tests</small></span><span className="boundary-cut" aria-label="clear boundary">LOCAL EDGE</span><span className="boundary-private"><b>Institution-controlled layer</b><small>Data · mappings · interpretation · approval</small></span></div>
      <div className="overview-proof">
        <div className="proof-number"><span>WORKING EXAMPLE</span><b>§45.3</b><small>CFTC swap creation timing</small></div>
        <p>All trade values are synthetic. The working demonstration checks one selected timing branch against a weekday-only calendar. It does not include legal holidays, a complete field map, SDR validation, or a filing.</p>
        <Link href="/obligations" className="text-link" data-testid="link-overview-obligation">Choose a scenario branch <ArrowRight size={14} /></Link>
      </div>
    </section>

    <section className="overview-section stakeholder-section">
      <div className="section-marker"><span>03</span><span>WHO IT COULD HELP</span></div>
      <div className="section-intro"><h2>Different roles.<br />A shared line of sight.</h2><p>The proposed change-control route aims to keep review context with each change. Validate its effect in a bounded pilot; no savings or outcomes are claimed.</p></div>
      <div className="stakeholder-list">
        <article><span className="stakeholder-code">01 / LEADERSHIP</span><h3>See ownership and readiness.</h3><p>See who reviews a rule change, what remains unvalidated, and what a bounded pilot must prove before investment.</p></article>
        <article><span className="stakeholder-code">02 / LEGAL & COMPLIANCE</span><h3>Review the basis for change.</h3><p>Keep source citations, applicability assumptions and human decisions visible; the workflow does not make legal judgments.</p></article>
        <article><span className="stakeholder-code">03 / ENGINEERING</span><h3>Reduce context reconstruction.</h3><p>Target a review package that links the source, mapping reference and tests; today’s CI tests only the synthetic weekday calculation, not regulatory or mapping correctness.</p></article>
        <article><span className="stakeholder-code">04 / OPEN-SOURCE</span><h3>Reuse without exposing bank data.</h3><p>Share generic annotations and synthetic tests while keeping institution-specific data, mappings and policy local.</p></article>
      </div>
    </section>

    <section className="overview-section ecosystem-section">
      <div className="section-marker"><span>04</span><span>WHERE IT FITS</span></div>
      <div className="section-intro"><h2>Build around the work<br />already in motion.</h2><p>This prototype is a demonstration layer, not a claim to replace standards, regulatory reporting initiatives, or reference implementations.</p></div>
      <div className="ecosystem-grid">
        <article><span className="ecosystem-tag">SEMANTICS</span><h3>FINOS CDM</h3><p>Shared machine-readable trade, product and lifecycle semantics. This demo uses selected candidate locations in a conceptual crosswalk; there is no CDM runtime integration.</p><a href="https://cdm.finos.org/docs/event-model" target="_blank" rel="noreferrer">Explore CDM <ArrowRight size={13} /></a></article>
        <article><span className="ecosystem-tag">INDUSTRY INTERPRETATION</span><h3>ISDA DRR</h3><p>Encodes industry-agreed interpretations of reporting rules using CDM. The prototype does not execute DRR or assert that a specific Part 45 package was inspected.</p><a href="https://www.isda.org/isda-solutions-infohub/isda-digital-regulatory-reporting" target="_blank" rel="noreferrer">Explore DRR <ArrowRight size={13} /></a></article>
        <article><span className="ecosystem-tag">REFERENCE EXECUTION</span><h3>FINOS Labs ORR</h3><p>Open Regulatory Reporting is a FINOS Labs reference path associated with Spark / Databricks. This prototype is not parity with ORR, nor a replacement or runtime extension.</p><Link href="/mappings" data-testid="link-overview-crosswalk">Inspect this prototype's boundary <ArrowRight size={13} /></Link></article>
      </div>
      <div className="ecosystem-note"><Network size={16} /><p><b>What is open source:</b> This project’s code is covered by its existing repository license. CFTC rule text and FINOS CDM are separate upstream sources; this app references them but does not claim to own or fully integrate them. Share generic code and tests; keep bank data, mappings, policy and approvals local.</p></div>
      <div className="change-governance-overview" data-testid="overview-change-governance">
        <div className="change-governance-head">
          <div><span className="ecosystem-tag">CANDIDATE DISTINCTION · MARKET COMPARISON REQUIRED</span><h3>Share generic logic. Keep institutional judgment local.</h3></div>
          <p>The proposed pipeline links public source, human interpretation, local mapping, tests and release evidence across an ownership boundary. This is a positioning hypothesis—not proof that no other tool can do it.</p>
        </div>
        <div className="change-governance-status">
          <div><b>Demonstrated now</b><p>Public source citations, a manually selected synthetic branch, candidate CDM paths, three weekday-only timing tests, and a portable source package.</p></div>
          <div><b>Institution must build</b><p>Approved legal interpretation, private mappings, tests against local requirements, authenticated review and release evidence.</p></div>
          <div><b>Distinctiveness to validate</b><p>The source-to-release path across public and bank-owned work may reduce context rebuilding. Market uniqueness is unproven; compare specific capabilities before claiming it.</p></div>
        </div>
        <Link href="/governance" className="text-link" data-testid="link-overview-change-governance">Review the proposed control record <ArrowRight size={14} /></Link>
      </div>
    </section>

    <section className="overview-closer">
      <div className="closer-topline"><span>THE 15-MINUTE PRODUCT WALKTHROUGH</span><span>OPEN · EXECUTABLE · AUDITABLE</span></div>
      <h2>Show the path.<br /><em>Keep the judgment human.</em></h2>
      <p>No live AI in this prototype. Human interpretation and approvals remain authoritative. The evaluation is inspectable, synthetic and deliberately narrow.</p>
      <div className="closer-actions"><Link href="/presenter" className="button button-light" data-testid="link-overview-presenter">Open presenter mode <ArrowRight size={15} /></Link><Link href="/validation" className="closer-text-link" data-testid="link-overview-validation-cta">Review the deterministic check <ArrowRight size={14} /></Link><Link href="/adoption" className="closer-text-link" data-testid="link-overview-adoption">See the fork-to-pilot path <ArrowRight size={14} /></Link></div>
    </section>
    <div className="overview-disclaimer"><ShieldCheck size={16} /><p><b>Prototype boundary.</b> Not a filing, full compliance engine, production system, legal determination, or tamper-evident audit system. No institution-specific data or live integrations. Potential stakeholder value must be validated, not assumed.</p></div>
  </div>;
  if (page === 'sources') return <div className="content-stack">
    <div className="grid-two">
      <Panel title="eCFR source record" eyebrow="TITLE 17 / PART 45 / SNAPSHOT 2026-10-23" icon={<FileClock size={17} />}>
        <div className="document-sheet">
          <div className="document-topline"><span>CODE OF FEDERAL REGULATIONS · TITLE 17</span><span>SNAPSHOT 2026-10-23</span></div>
          <div className="document-title">§45.3 Swap creation data</div>
          <div className="source-quote"><b>§45.3(a) · source excerpt</b> “For each swap executed on or pursuant to the rules of a swap execution facility or designated contract market, the swap execution facility or designated contract market shall report required swap creation data electronically to a swap data repository in the manner provided in §45.13(a) not later than the end of the next business day following the execution date.”</div>
          <div className="source-summary"><b>Off-facility branch summary · §45.3(b)(1)–(2)</b> If the reporting counterparty is an SD/MSP/DCO, the deadline is the end of the next business day. If it is a non-SD/MSP/DCO counterparty, the deadline is the end of the second business day. These are plain-language summaries, not quotations.</div>
        </div>
        <div className="callout-blue"><ShieldCheck size={16} /><span>eCFR is authoritative but unofficial. Snapshot current through <b>October 23, 2026</b>; this short excerpt is not a substitute for the complete rule.</span></div>
      </Panel>
      <Panel title="Traceable public references" eyebrow="SOURCE LINKS">
        <Definition rows={[
          ['Source authority', 'Electronic Code of Federal Regulations (eCFR)'],
          ['Snapshot date', '2026-10-23 · Title 17 current through this date'],
          ['Business-day definition', '§45.1 · excludes Saturdays, Sundays, and legal holidays in the relevant reporting location'],
          ['Reporting-counterparty determination', '§45.8 · not determined by this demo'],
          ['Technical data boundary', '§45.13(a) points to Appendix 1 and the Commission technical specifications; SDR validation also applies'],
          ['CFTC field reference', 'Technical Specification v3.2 · published March 2023; selected definitions reviewed, not treated as a current wire schema'],
          ['Appendix 1 / SDR mapping', 'Not exhaustive or validated against an SDR payload; see the version caveat on Local data mapping'],
        ]} />
        {sourceLinks.map(([label, url]) => <a className="source-link-row" href={url} target="_blank" rel="noreferrer" key={url} data-testid={`link-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}><span>{label}</span><ArrowRight size={14} /></a>)}
      </Panel>
    </div>
    <Panel title="Business day and interpretation limits" eyebrow="READ BEFORE APPLYING">
      <p className="panel-copy">§45.1 defines a business day as a 24-hour day excluding Saturdays, Sundays, and legal holidays in the location of the SEF, DCM, or reporting counterparty reporting the data. This demonstration uses a <b>weekday-only New York calendar</b>; legal-holiday calendars are not integrated. Reporter classification is an explicit scenario assumption, not an AI determination.</p>
    </Panel>
  </div>;
  if (page === 'obligations') return <div className="content-stack">{scenarioControls}<Panel title="Selected obligation branch" eyebrow="HUMAN-SELECTED INTERPRETATION"><div className="obligation-summary"><span className="branch-cite">{branch.citation}</span><div><h3>{branch.short}</h3><p>Responsible reporter: <b>{branch.reporter}</b></p><p>Deadline: end of the {branch.days === 1 ? 'next' : 'second'} business day after execution.</p></div></div><div className="callout-amber"><ShieldCheck size={16} /><span>Selection is a scenario assumption. The presenter chooses the branch; no automated classification or legal determination is made.</span></div></Panel>{trace}</div>;
  if (page === 'rules') return <div className="content-stack"><Panel title="Draft timing rule" eyebrow="SOURCE-LINKED / NOT EXECUTABLE REGULATORY SOFTWARE"><div className="rule-code"><span>rule</span> swap_creation_timing<br /><span>when</span> execution_channel = <b>{state.branch === 'facility' ? '"SEF_OR_DCM"' : '"OFF_FACILITY"'}</b><br /><span>and</span> {state.branch === 'facility' ? 'reporter = SEF_OR_DCM' : `reporter_class = ${state.branch === 'off-sd' ? 'SD_MSP_DCO' : 'NON_SD_MSP_DCO'}`}<br /><span>then</span> deadline = execution_date + <b>{branch.days} business day{branch.days > 1 ? 's' : ''}</b><br /><span>cite</span> {branch.citation} → 17 CFR Part 45</div><Definition rows={ [['Owner', 'Prototype scenario; human reviewer required'], ['Source', `${branch.citation} · eCFR snapshot 2026-10-23`], ['Execution calendar', 'Weekday-only New York demo calendar; legal holidays not integrated'], ['Status', 'Draft representation only · no live rule engine'] ]} /></Panel>{trace}</div>;
  if (page === 'mappings') return <div className="content-stack">
    <Panel title="CFTC → CDM field crosswalk" eyebrow="RATES · VANILLA IRS · SYNTHETIC / CONCEPTUAL">
      <div className="crosswalk-scope">
        <span><small>Asset class</small><b>Rates · vanilla interest-rate swap</b></span>
        <span><small>Fixture data</small><b>Synthetic only · no trade values</b></span>
        <span><small>Clearing status</small><b>Not specified</b></span>
      </div>
      <div className="callout-blue"><Network size={16} /><span>Selected CFTC elements are sourced to Technical Specification v3.2 (published March 2023). CDM paths are candidates from FINOS CDM 7.0.0—not a complete Appendix 1 map, SDR wire schema, or FINOS/ISDA-endorsed mapping.</span></div>
      <div className="crosswalk-list">
        {cftcCrosswalk.map(row => <article className="crosswalk-card" key={row.source}>
          <div className="crosswalk-card-heading">
            <div><span className="eyebrow">{row.source} · {row.applicability}</span><h4>{row.title}</h4></div>
            <Badge kind={row.kind}>{row.status}</Badge>
          </div>
          <div className="crosswalk-card-body">
            <div><small>FINOS CDM 7.0 candidate</small><code>{row.cdmPath}</code></div>
            <div><small>Mapping assessment</small><p>{row.assessment}</p></div>
          </div>
        </article>)}
      </div>
      <p className="small-note">CFTC field names describe data elements and are not necessarily literal wire keys. Exact required fields vary by transaction, lifecycle action, reporter, clearing state, UPI designation, current Commission technical specification, and SDR validation profile.</p>
    </Panel>
    <Panel title="How CDM and DRR fit" eyebrow="USE THE EXISTING OPEN-SOURCE LAYERS">
      <div className="comparison-grid">
        <div><b>FINOS CDM 7.0</b><p>Shared machine-readable trade, product and lifecycle semantics. It gives this crosswalk candidate model locations; it does not decide who reports or encode this app’s §45.3 timing rule.</p></div>
        <div><b>ISDA DRR</b><p>ISDA says DRR uses CDM to encode industry-agreed interpretations of reporting rules, including US CFTC and SEC coverage. This demo has not inspected a specific Part 45 package, version or DRR field path.</p></div>
        <div><b>This prototype</b><p>Demonstrates a public-source timing branch and a researched, conceptual crosswalk. It does not execute DRR, emit a submission, validate a bank mapping, or replace CDM or DRR.</p></div>
        <div><b>Potential complement</b><p>A future engine could bind rule sources, local mappings, deterministic tests, approvals and release evidence around standards or engines an institution already uses. Those integrations are not implemented here.</p></div>
      </div>
      <div className="callout-amber"><ShieldCheck size={16} /><span><b>Version reconciliation:</b> current eCFR §45.5 requires a UTI, while the 2023 v3.2 table retains a UTI/USI alternative. This demo follows current §45.5 for that legal requirement and flags the technical-spec difference for verification before implementation.</span></div>
      <div className="callout-amber"><BookOpen size={16} /><span>No live AI generated or approved this mapping. Reporting-counterparty classification, model alignment, SDR schema validation and release approval remain human and institution-specific work.</span></div>
      <div className="crosswalk-citations">
        {sourceLinks.filter(([label]) => /Technical Specification|FINOS CDM|ISDA Digital Regulatory/.test(label)).map(([label, url]) => <a href={url} key={url} target="_blank" rel="noreferrer">{label}<ArrowRight size={13} /></a>)}
      </div>
    </Panel>
    {trace}
  </div>;
  if (page === 'validation') return <div className="content-stack">{scenarioControls}<section className={`timing-result ${timingPass ? 'timing-pass' : 'timing-late'}`} data-testid="status-timing-result"><div className="result-mark">{timingPass ? <Check size={21} /> : <Clock3 size={21} />}</div><div><span className="eyebrow">DETERMINISTIC TIMING CHECK / {branch.citation}</span><h2>{timingPass ? 'Within selected demo deadline' : 'After selected demo deadline'}</h2><p>Report date {prettyDate(reportDate)} compared with branch deadline {prettyDate(deadline)}.</p></div><Badge kind={timingPass ? 'green' : 'red'}>{timingPass ? 'TIMING PASS' : 'TIMING FAIL'}</Badge></section><div className="grid-two"><Panel title="Evaluation inputs" eyebrow="SYNTHETIC VALUES"><Definition rows={ [['Execution date', 'November 4, 2026'], ['Report date', prettyDate(reportDate)], ['Selected branch', `${branch.citation} · ${branch.short}`], ['Responsible reporter', branch.reporter], ['Deadline branch', `End of ${branch.days === 1 ? 'next' : 'second'} business day`] ]} /></Panel><Panel title="Scope of this check" eyebrow="NO FULL COMPLIANCE CLAIM"><p className="panel-copy">This check evaluates only whether the synthetic report date is on or before the selected §45.3 timing deadline using a weekday-only New York demo calendar. It does not evaluate reporting scope, data elements, submission, acknowledgements, corrections, recordkeeping, or any other CFTC requirement.</p><div className="callout-amber"><Clock3 size={16} /><span>Legal-holiday calendars are not integrated. No actual report is sent.</span></div></Panel></div>{trace}</div>;
  if (page === 'evidence') return <div className="content-stack"><Panel title="Synthetic evaluation envelope" eyebrow="PREVIEW / NOT A SUBMISSION FILE" action={<button className="button button-primary button-small" onClick={downloadEnvelope} data-testid="button-download-envelope"><Download size={14} /> Download JSON</button>}><pre className="envelope-preview" data-testid="text-envelope-preview">{JSON.stringify({ type: 'synthetic-evaluation-envelope', sourceSnapshot: '2026-10-23', branch: branch.citation, reporterAssumption: branch.reporter, executionDate: DEMO_EXECUTION_DATE, reportDate, timingCheck: timingPass ? 'within-demo-deadline' : 'after-demo-deadline', calendar: 'weekday-only New York; legal holidays not integrated', data: 'synthetic only', fieldCrosswalk: 'selected conceptual CFTC v3.2 to CDM 7.0 candidates; not a validated SDR payload', status: 'not a submission file' }, null, 2)}</pre><div className="callout-amber"><FileCheck2 size={16} /><span>Preview and download are synthetic evaluation envelopes. They are not CFTC submission files and cannot be used to submit a report.</span></div></Panel>{trace}</div>;
  if (page === 'changes') return <div className="content-stack"><section className="change-hero"><span className="eyebrow">SYNTHETIC IMPACT REPLAY · NO REGULATORY AMENDMENT</span><h2>Change one input.<br /><em>Follow the consequence.</em></h2><p>Replay the local trace by switching the selected §45.3 branch or on-time/late report date. This is not a claimed CFTC source change.</p></section>{scenarioControls}<div className="grid-two"><Panel title="Before / after" eyebrow="LIVE SCENARIO COMPARISON"><Definition rows={ [['Scenario input', branch.short], ['Deadline branch', `${branch.citation} · ${branch.days} business day${branch.days > 1 ? 's' : ''}`], ['Synthetic report date', prettyDate(reportDate)], ['Outcome', timingPass ? 'Within selected timing branch' : 'After selected timing branch'] ]} /></Panel><Panel title="Review task" eyebrow="LOCAL ONLY"><p className="panel-copy">A human reviewer should confirm branch assumptions, calendar and interpretation before any real implementation.</p><button className="button button-outline" onClick={() => { setTaskAdded(true); setToast('Local review reminder added.'); }} data-testid="button-add-review-task">{taskAdded ? <Check size={14} /> : <FileText size={14} />}{taskAdded ? 'Review reminder added' : 'Add local review reminder'}</button></Panel></div>{trace}</div>;
  if (page === 'governance') return <div className="content-stack">
    <Panel title="Human release decision" eyebrow="ILLUSTRATIVE CONTROL / NOT ACCESS CONTROL">
      <Definition rows={ [['Rule author', 'Not authenticated · prototype'], ['Independent reviewer', 'Required in any real operating model'], ['Current decision', state.approval], ['Release state', 'Proposed only · no deployment'] ]} />
      <div className="approval-actions">
        <button className="button button-outline" onClick={() => update({ approval: 'Needs review' })} data-testid="button-request-review">Request review</button>
        <button className="button button-primary" onClick={() => update({ approval: 'Approved for prototype' })} data-testid="button-approve-prototype">Mark prototype reviewed</button>
        <button className="button button-outline" onClick={() => update({ approval: 'Rejected' })} data-testid="button-reject-prototype">Reject</button>
      </div>
      <div className="callout-amber"><ShieldCheck size={16} /><span>Buttons record a local demonstration state only. They do not authenticate a user, prove independence, authorize a release, or deploy software.</span></div>
    </Panel>
    <Panel title="Proposed change-control layer" eyebrow="TARGET DESIGN · NOT IMPLEMENTED">
      <p className="panel-copy">This is the control path around a reporting pipeline. For each regulatory change, it would connect the exact source and effective date to a human-reviewed interpretation, a reference to the institution’s local mapping, regression tests, pull-request and CI results, and a release record. It records decisions; it does not make legal judgments.</p>
      <div className="manifest-line">{['Source version', 'Interpretation', 'Local mapping ref', 'Rule tests', 'Reviewer', 'PR + CI', 'Release record'].map((v, i) => <span key={v}><b>{String(i + 1).padStart(2, '0')}</b>{v}</span>)}</div>
      <div className="change-value-callout" data-testid="governance-value-hypothesis">
        <b>Value to validate</b>
        <p>Make it easier to see what changed, who reviewed it, which checks ran, and what remains institution-controlled. The hypothesis is less context reconstruction and more repeatable impact review—not guaranteed savings or legal assurance.</p>
      </div>
      <p className="small-note">Demonstrated now: a synthetic §45.3 trace and weekday-only CI tests for the three displayed timing branches. Not implemented: full regulatory validation, holiday handling, authenticated approvals, a release manifest, or tamper-evident evidence.</p>
    </Panel>
    <Panel title="Ecosystem boundary & AI role" eyebrow="POSITIONING, NOT A FEATURE CLAIM">
      <div className="comparison-grid">
        <div><b>FINOS CDM</b><p>Shared trade-data semantics; it is not itself an interpretation of each reporting rule.</p></div>
        <div><b>ISDA DRR</b><p>Industry-agreed, executable rules for covered regimes; use the relevant package and version.</p></div>
        <div><b>FINOS Labs ORR</b><p>A reference execution path for DRR using Spark / Databricks; this prototype claims neither parity nor replacement.</p></div>
        <div><b>Proposed layer</b><p>Coordinate source-backed change context, local mapping references, tests, review and release records. No unique-capability claim until implemented and compared.</p></div>
      </div>
      <div className="ai-boundary"><b>AI boundary</b><p>No live AI runs here. Future assistance could draft change summaries or test candidates for human review; it must not determine legal applicability or approve releases. ISDA Tracer Agent is ISDA’s work—not ours—and is not integrated.</p></div>
    </Panel>
    {trace}
  </div>;
  if (page === 'adoption') return <AdoptionGuide state={state} update={update} />;
  if (page === 'economics') return <div className="content-stack"><PilotComparison setToast={setToast} /><Panel title="Pilot measurement checklist" eyebrow="MEASURE BEFORE CLAIMING VALUE"><div className="checklist">{['Cycle time: baseline and post-pilot elapsed time per obligation / change', 'Effort: role-based hours spent on interpretation, build, review and operations', 'Rework / defects: review loops, defects found, severity and remediation time', 'Evidence completeness: required provenance items present and independently reproducible'].map((item, i) => <label key={item}><input type="checkbox" data-testid={`check-pilot-measurement-${i}`} /><span>{item}</span></label>)}</div></Panel></div>;
  if (page === 'presenter') return <div className="content-stack">
    <section className="presenter-thesis" data-testid="presenter-thesis">
      <span className="eyebrow">REGULATION AS CODE · PRODUCT WALKTHROUGH</span>
      <h2>Regulation as Code</h2>
      <p className="presenter-thesis-title">Open, executable and auditable reporting pipelines for financial services</p>
      <p className="presenter-thesis-copy">The thesis: connect public rule context to institution-controlled implementation through a pipeline people can inspect, test, and govern.</p>
    </section>
    <Panel title="The operating problem" eyebrow="QUESTIONS TO VALIDATE · NOT QUANTIFIED INDUSTRY CLAIMS">
      <div className="presenter-pain-grid">{painPoints.map((point, i) => <article className="presenter-pain-card" key={point.title}><span>{String(i + 1).padStart(2, '0')}</span><div><b>{point.title}</b><p>{point.text}</p></div></article>)}</div>
      <p className="small-note">Treat these as hypotheses to validate with institutions; this prototype has no industry-wide baseline or measured impact.</p>
    </Panel>
    <section className="presenter-pillar-grid" aria-label="Open, Executable, and Auditable pillars">
      {presentationPillars.map((pillar, i) => <article className="presenter-pillar" key={pillar.title} data-testid={`presenter-pillar-${pillar.title.toLowerCase()}`}>
        <span className="presenter-pillar-index">{String(i + 1).padStart(2, '0')} · {pillar.title}</span><h3>{pillar.label}</h3>
        <div><small>What this demo shows</small><p>{pillar.proof}</p></div>
        <div className="presenter-pillar-boundary"><small>Boundary</small><p>{pillar.boundary}</p></div>
      </article>)}
    </section>
    <div className="callout-blue presenter-ai-boundary" role="note" data-testid="notice-presenter-ai-boundary"><Activity size={16} /><span><b>AI role today: none.</b> A future assistant could draft change summaries or test candidates; deterministic checks and accountable human reviewers retain decision and approval authority.</span></div>
    <div className="presenter-banner"><div><span className="eyebrow">15-MINUTE RUN OF SHOW · SIX CHAPTERS</span><h2>{chapters[state.chapter].title}</h2><p>{chapters[state.chapter].summary}</p></div><div className="pacing-card"><Clock3 size={18} /><strong>{chapters[state.chapter].time}</strong><span>chapter cue · total 15:00</span></div></div>
    <Panel title="Audience lens" eyebrow="CHANGES THE EXPLANATION ONLY"><select className="role-select" value={state.role} onChange={e => update({ role: e.target.value })} data-testid="select-presenter-role">{['Financial-services leader', 'Compliance/legal reviewer', 'Reporting/data engineer', 'Open-source contributor'].map(r => <option key={r}>{r}</option>)}</select><div className="role-explanation"><b>{state.role}</b><p>{roleCopy(state.role)}</p></div></Panel>
    <div className="presenter-steps">{chapters.map((c, i) => <button type="button" key={c.title} className={`presenter-step ${state.chapter === i ? 'presenter-active' : ''}`} onClick={() => update({ chapter: i })} aria-current={state.chapter === i ? 'step' : undefined} data-testid={`button-presenter-chapter-${i}`}><span className="presenter-step-number">{String(i + 1).padStart(2, '0')} · {c.time}</span><div><b>{c.title}</b><small>{c.summary}</small></div><ArrowRight size={15} /></button>)}</div>
    <div className="callout-amber presenter-actions-boundary" role="note" data-testid="notice-actions-boundary"><GitBranch size={16} /><span><b>Fork/Actions boundary.</b> This app does not connect to Git. The portable package includes read-only Actions CI for synthetic timing tests, typecheck and build; those tests cover only this demo calculation, not full regulatory correctness.</span></div>
    <div className="pacing-total" data-testid="text-pacing-total">{chapters.map(chapter => chapter.time).join(' + ')} = <b>{formatDuration(chapters.reduce((total, chapter) => total + chapter.mins, 0))} total</b></div>
    <div className="presenter-controls"><Link href={chapters[state.chapter].path} className="button button-primary" data-testid="link-open-chapter">Open this chapter <ArrowRight size={14} /></Link><button className="button button-outline" onClick={downloadEnvelope} data-testid="button-presenter-envelope"><Download size={14} /> Download synthetic envelope</button></div>
  </div>;
  return <div className="content-stack"><Panel title="Trace unavailable" eyebrow="LOCAL DEMONSTRATION"><p>Choose a scenario branch to rebuild the synthetic evaluation trace.</p>{scenarioControls}</Panel></div>;
}
function ScenarioControls({ state, setBranch, update }: { state: State; setBranch: (branch: Branch) => void; update: (patch: Partial<State>) => void }) {
  return <Panel title="Interactive synthetic scenario" eyebrow="SELECT BRANCH + REPORT TIMING"><div className="scenario-controls"><label>§45.3 branch<select value={state.branch} onChange={e => setBranch(e.target.value as Branch)} data-testid="select-scenario-branch">{(Object.keys(branchInfo) as Branch[]).map(key => <option key={key} value={key}>{branchInfo[key].label}</option>)}</select></label><label>Report timing<select value={state.reportTiming} onChange={e => update({ reportTiming: e.target.value as State['reportTiming'] })} data-testid="select-report-timing"><option value="on-time">On time · selected branch deadline</option><option value="late">Late · next business day after deadline</option></select></label></div><div className="scenario-assumption"><b>Explicit assumption:</b> the selected reporter classification is user-chosen for this synthetic scenario, not an AI determination. Execution date is fixed at November 4, 2026.</div></Panel>;
}
function Trace({ state, branch, deadline, reportDate, timingPass }: { state: State; branch: typeof branchInfo[Branch]; deadline: string; reportDate: string; timingPass: boolean }) {
  const steps: [string, string, string][] = [['Source', '§45.3 · eCFR snapshot 2026-10-23', '/sources'], ['Obligation', `${branch.citation} · ${branch.short}`, '/obligations'], ['Local mapping', 'Selected CFTC → CDM candidates · not validated', '/mappings'], ['Timing check', `${timingPass ? 'Within' : 'After'} ${prettyDate(deadline)} deadline`, '/validation'], ['Output envelope', 'Synthetic evaluation · not submission', '/evidence'], ['Release manifest', 'Proposed hypothesis · not implemented', '/governance']];
  return <Panel title="Inspectable rule path" eyebrow="SOURCE → SELECTED BRANCH → LOCAL → DETERMINISTIC"><div className="trace-list">{steps.map(([name, detail, href], i) => <Link href={href} key={name} className="trace-step" data-testid={`link-trace-${name.toLowerCase().replaceAll(' ', '-')}`}><span className={`trace-number ${i === 3 ? (timingPass ? 'trace-ok' : 'trace-alert') : ''}`}>{String(i + 1).padStart(2, '0')}</span><span className="trace-copy"><b>{name}</b><small>{detail}</small></span><ArrowRight size={15} /></Link>)}</div><div className="trace-facts"><span><small>REPORTER</small><b>{branch.reporter}</b></span><span><small>EXECUTION</small><b>{prettyDate(DEMO_EXECUTION_DATE)}</b></span><span><small>REPORT</small><b>{prettyDate(reportDate)}</b></span><span><small>TIMING</small><b>{timingPass ? 'Within branch' : 'Late'}</b></span></div><p className="trace-footnote">Timing branch only · weekday-only New York demo calendar · legal holidays not integrated · no full CFTC compliance conclusion.</p></Panel>;
}
function roleCopy(role: string) {
  if (role === 'Compliance/legal reviewer') return 'Review the source wording, branch assumptions and limitations. Confirm applicable facts and legal interpretation independently; the demo does not make a legal determination.';
  if (role === 'Reporting/data engineer') return 'Inspect the synthetic timing inputs and candidate CFTC-to-CDM paths. Reconcile the dated technical specification with current eCFR and SDR schemas before implementing any mapping.';
  if (role === 'Open-source contributor') return 'Focus on reusable source metadata, generic deterministic tests and transparent boundaries. Keep private mappings, bank data and local approvals out of shared work.';
  return 'See the reusable infrastructure proposal and its boundaries. Ask for independently reviewed controls and pilot measurements before making investment or savings claims.';
}
function money(value: number) { return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value); }
function Badge({ children, kind = 'neutral' }: { children: ReactNode; kind?: string }) { return <span className={`badge badge-${kind}`}>{children}</span>; }
function Panel({ children, title, eyebrow, icon, action, className = '' }: { children: ReactNode; title?: string; eyebrow?: string; icon?: ReactNode; action?: ReactNode; className?: string }) { return <section className={`panel ${className}`}>{(title || eyebrow || action) && <div className="panel-heading">{icon && <span className="panel-icon">{icon}</span>}<div>{eyebrow && <div className="eyebrow">{eyebrow}</div>}{title && <h3>{title}</h3>}</div>{action && <div className="panel-heading-action">{action}</div>}</div>}{children}</section>; }
function Stat({ label, value, note, icon, status = false }: { label: string; value: string; note: string; icon: ReactNode; status?: boolean }) { return <div className="stat-card" data-testid={`stat-${label.toLowerCase().replaceAll(' ', '-')}`}><div className="stat-icon">{icon}</div><span>{label}</span><b className={status ? 'stat-status' : ''}>{value}</b><small>{note}</small></div>; }
function Definition({ rows }: { rows: [string, string][] }) { return <dl className="definition-list">{rows.map(([key, value]) => <div key={key}><dt>{key}</dt><dd>{value}</dd></div>)}</dl>; }
export default App;
