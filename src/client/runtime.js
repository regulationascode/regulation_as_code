import { DEFAULT_EXAMPLE_ID, EXAMPLES, exampleCsv, getExample } from "../core/examples.js";

const storeKey = "regulationAsCodeStudioState";

function defaultState(exampleId = DEFAULT_EXAMPLE_ID) {
  const example = getExample(exampleId);
  return {
    activeExample: example.id,
    view: "overview",
    stage: "source",
    sourceText: example.sourceText,
    sourceMeta: { ...example.sourceMeta },
    sourceVersion: "1.0",
    sourceHistory: [{ version: "1.0", text: example.sourceText, recordedAt: "Sample source" }],
    previousSourceText: null,
    candidate: null,
    reviewer: "Demo compliance reviewer",
    legalReviewer: "Demo legal reviewer",
    complianceReviewer: "Demo compliance reviewer",
    legalRationale: "Reviewed the cited material, scope, fields, and effective date for this sample.",
    complianceRationale: "Confirmed the sample reporting scope and operational fields.",
    ruleReviewer: "Demo control reviewer",
    mappingReviewer: "Demo data steward",
    releaseReviewer: "Demo release control owner",
    legalApproval: null,
    complianceApproval: null,
    obligationApproval: null,
    rule: JSON.parse(JSON.stringify(example.rule)),
    ruleHistory: [],
    ruleApproval: null,
    ruleNeedsUpdate: false,
    mappings: Object.fromEntries(example.fields.map((field) => [field.key, field.source])),
    mappingMeta: Object.fromEntries(example.fields.map((field) => [field.key, { system: field.generated ? "Generated locally" : "Local sample file", owner: "Data steward", transform: field.generated ? "Assigned by row order during import" : "Direct field copy", quality: field.scope ? "Used for scope or control only" : "Present and valid" }])),
    mappingVersion: "1.0.0",
    mappingHistory: [],
    mappingApproval: null,
    releaseApproval: null,
    exceptionReviews: {},
    roadmapDone: [],
    changeReview: null,
    runSummary: null,
    evidenceManifest: null
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(storeKey) || "null");
    const fresh = defaultState(saved && saved.activeExample);
    if (!saved) return fresh;
    return {
      ...fresh,
      ...saved,
      activeExample: fresh.activeExample,
      rule: { ...fresh.rule, ...(saved.rule || {}) },
      mappings: { ...fresh.mappings, ...(saved.mappings || {}) }
    };
  } catch {
    return defaultState();
  }
}

let state = loadState();
let activeExample = getExample(state.activeExample);
let reportFields = activeExample.fields;
let sampleRows = activeExample.sampleRows;
let runtimeRows = sampleRows.map((row) => ({ ...row }));
let runtimeHeaders = Object.keys(sampleRows[0]);
let runtimeFileName = activeExample.csvFile;
let runtimeCsvText = exampleCsv(activeExample);
let sessionRun = null;
let toastTimer = null;

const stages = [
  { id: "source", label: "Source", icon: "file" },
  { id: "obligation", label: "Obligation", icon: "search" },
  { id: "rule", label: "Rule", icon: "code" },
  { id: "mapping", label: "Mapping", icon: "grid" },
  { id: "validate", label: "Validate", icon: "check" },
  { id: "release", label: "Release", icon: "lock" },
  { id: "report", label: "Report", icon: "report" },
  { id: "evidence", label: "Evidence", icon: "shield" }
];

const navigation = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "examples", label: "Examples and adoption", icon: "layers" },
  { id: "pipeline", label: "Pipeline", icon: "flow" },
  { id: "changes", label: "Change desk", icon: "pulse" },
  { id: "shared", label: "Shared library", icon: "layers" },
  { id: "architecture", label: "Architecture", icon: "flow" },
  { id: "governance", label: "Governance", icon: "shield" },
  { id: "roadmap", label: "Roadmap", icon: "arrow" }
];

const iconPaths = {
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/><path d="M9 21v-6h6v6"/>',
  flow: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/><path d="M10 6h3a2 2 0 0 1 2 2v6M14 18h-3a2 2 0 0 1-2-2v-1"/>',
  pulse: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 12 9 5 9-5M3 16l9 5 9-5"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
  search: '<circle cx="10.8" cy="10.8" r="7.3"/><path d="m16.2 16.2 4.3 4.3M8 10.8h5.6M10.8 8v5.6"/>',
  code: '<path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 5l-4 14"/>',
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  check: '<path d="M20 7 10 17l-5-5"/><path d="M21 12a9 9 0 1 1-5.7-8.4"/>',
  report: '<path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z"/><path d="M7 16v-3M12 16V8M17 16v-5"/>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11"/><path d="m9 12 2 2 4-4"/>',
  chevron: '<path d="m9 18 6-6-6-6"/>',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5M12 15V3"/>',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};

function icon(name, size = 18) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name] || iconPaths.file}</svg>`;
}

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
}

function save() {
  try { localStorage.setItem(storeKey, JSON.stringify(state)); } catch { showToast("This browser could not save local workflow state."); }
}

function dateLabel(value = new Date()) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric" }).format(value);
}

function timeLabel(value = new Date()) {
  return new Intl.DateTimeFormat("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" }).format(value);
}

function utcLabel(value = new Date()) {
  return `${new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "medium", timeZone: "UTC" }).format(value)} UTC`;
}

function showToast(message) {
  const node = document.getElementById("toast");
  if (!node) return;
  node.textContent = message;
  node.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => node.classList.remove("visible"), 3200);
}

function approvalDone(key) {
  return Boolean(state[key]);
}

function stageStatus(id) {
  if (id === "source") return { kind: "done", label: "Source ready" };
  if (id === "obligation") return state.obligationApproval ? { kind: "done", label: "Approved" } : state.candidate ? { kind: "review", label: "Needs review" } : { kind: "pending", label: "Not drafted" };
  if (id === "rule") return state.ruleApproval ? { kind: "done", label: `Version ${state.rule.version}` } : state.ruleNeedsUpdate ? { kind: "review", label: "Update needed" } : { kind: "pending", label: "Needs approval" };
  if (id === "mapping") return state.mappingApproval ? { kind: "done", label: "Mapped" } : { kind: "pending", label: "Needs approval" };
  if (id === "validate") return state.runSummary ? { kind: "done", label: "Run complete" } : { kind: "pending", label: "Not run" };
  if (id === "report") return state.runSummary ? { kind: "done", label: `${state.runSummary.ready} ready` } : { kind: "pending", label: "Not generated" };
  if (id === "evidence") return state.evidenceManifest ? { kind: "done", label: "Pack created" } : { kind: "pending", label: "Not created" };
  return { kind: "pending", label: "Not started" };
}

function canRun() {
  return approvalDone("obligationApproval") && approvalDone("ruleApproval") && approvalDone("mappingApproval") && mappingsValid() && !state.ruleNeedsUpdate && (!state.changeReview || state.changeReview.status !== "open");
}

function mappingsValid() {
  return reportFields.every((field) => state.mappings[field.key] && runtimeHeaders.includes(state.mappings[field.key]));
}

function sidebar() {
  return `<aside class="sideRail">
    <div class="brandBlock"><div class="brandMark"><span></span><span></span><span></span></div><div><div class="brandName">civic<span>rules</span></div><div class="brandCaption">REPORTING WORKBENCH</div></div></div>
    <div class="workspacePicker"><div class="workspaceIcon">F</div><div class="workspaceCopy"><strong>Fictional Market Authority</strong><small>Local workspace</small></div><span class="pickerDots">•••</span></div>
    <div class="navLabel">WORKSPACE</div>
    <nav class="primaryNav">${navigation.map((item) => `<button class="navItem ${state.view === item.id ? "active" : ""}" data-view="${item.id}">${icon(item.icon, 17)}<span>${item.label}</span>${item.id === "changes" && state.changeReview?.status === "open" ? '<i class="navDot"></i>' : ""}</button>`).join("")}</nav>
    <div class="railDivider"></div>
    <div class="navLabel">CURRENT EXAMPLE</div>
    <button class="exampleCard" data-view="examples"><span class="exampleDot"></span><span><strong>${activeExample.shortName}</strong><small>${activeExample.domain}</small></span>${icon("chevron", 15)}</button>
    <div class="railSpacer"></div>
    <div class="privacyCard"><div class="privacyIcon">${icon("lock", 15)}</div><div><strong>Private by design</strong><p>Runs in this browser. No service is connected.</p></div></div>
    <button class="resetLink" data-action="reset">Reset demo data</button>
    <div class="railFoot"><span class="greenPing"></span>LOCAL SANDBOX <span class="versionTag">0.1</span></div>
  </aside>`;
}

function header() {
  const titles = { overview: "Overview", pipeline: "Pipeline workspace", changes: "Change desk", shared: "Shared library" };
  return `<header class="topBar"><div class="topTitle"><div class="crumb">REGULATION AS CODE <span>/</span> ${titles[state.view] || "Workspace"}</div><h1>${titles[state.view] || "Workspace"}</h1></div><div class="topActions"><div class="localTag">${icon("lock", 14)} <span>Local only</span></div><button class="iconButton helpButton" data-action="help" aria-label="About this prototype">?</button><div class="userChip"><span class="avatar">SR</span><span class="userName">Sandbox reviewer</span><span class="userMenu">⌄</span></div></div></header>`;
}

function appShell(content) {
  document.getElementById("app").innerHTML = `${sidebar()}<div class="mainShell">${header()}<main class="pageContent">${content}</main></div><div id="toast" class="toast" role="status"></div>`;
}

function statusPill(status, text) {
  return `<span class="statusPill ${status}"><i></i>${text}</span>`;
}

function stageTracker() {
  return `<div class="stageTrack">${stages.map((stage, index) => {
    const status = stageStatus(stage.id);
    return `<button class="stageNode ${state.stage === stage.id ? "selected" : ""} ${status.kind}" data-stage="${stage.id}"><span class="stageIcon">${icon(stage.icon, 15)}</span><span class="stageText"><strong>${stage.label}</strong><small>${status.label}</small></span>${index < stages.length - 1 ? '<span class="stageConnector"></span>' : ""}</button>`;
  }).join("")}</div>`;
}

function progressCount() {
  return ["obligationApproval", "ruleApproval", "mappingApproval", "runSummary", "evidenceManifest"].filter((key) => Boolean(state[key])).length;
}

function renderOverview() {
  const next = !state.candidate ? ["Draft the obligation", "Read the sample source, then create a structured candidate for human review.", "source"]
    : !state.obligationApproval ? ["Review the obligation", "Confirm the scope and required fields before drafting a rule.", "obligation"]
      : !state.ruleApproval ? [state.ruleNeedsUpdate ? "Update the rule" : "Approve the rule", state.ruleNeedsUpdate ? "A source change needs a new rule version before execution." : "Save and approve a deterministic rule version.", "rule"]
        : !state.mappingApproval ? ["Confirm data mapping", "Connect the common reporting fields to the input columns.", "mapping"]
          : !state.runSummary ? ["Run validation", "Execute the rule against synthetic records or your local CSV.", "validate"]
            : !state.evidenceManifest ? ["Create evidence", "Capture lineage, approvals, run results, and content fingerprints.", "evidence"]
              : ["Review the evidence pack", "Inspect the latest run and download its local evidence manifest.", "evidence"];
  const run = state.runSummary;
  const changeStatus = state.changeReview?.status;
  const changeLabel = !changeStatus ? "Clear" : changeStatus === "open" ? "Review" : changeStatus === "reviewed" ? "Reviewed" : "Resolved";
  const changeDetail = !changeStatus ? "No pending source change" : changeStatus === "open" ? `Version ${escapeHtml(state.sourceVersion)} needs impact review` : changeStatus === "reviewed" ? `Version ${escapeHtml(state.sourceVersion)} reviewed, rule approval pending` : `Version ${escapeHtml(state.sourceVersion)} resolved with rule ${escapeHtml(state.changeReview.ruleVersion || state.rule.version)}`;
  return `<section class="welcomeBand"><div><div class="eyebrow"><span class="eyebrowDot"></span>FICTIONAL MARKET AUTHORITY <span class="eyebrowSep">/</span> CORPORATE BOND REPORTING</div><h2>From obligation<br/>to evidence.</h2><p>One governed path from source text to a report you can explain.</p><div class="welcomeMeta"><span>${icon("file", 15)} Source version ${escapeHtml(state.sourceVersion)}</span><span>${icon("code", 15)} Rule version ${escapeHtml(state.rule.version)}</span><span>${icon("clock", 15)} Effective date Jan 01, 2027</span></div></div><div class="welcomeVisual"><div class="orbit orbitOne"></div><div class="orbit orbitTwo"></div><div class="orbit orbitThree"></div><div class="orbitCore"><div class="coreMark">${icon("shield", 24)}</div><span>TRACEABLE<br/>BY DESIGN</span></div><div class="orbitNode nodeA">${icon("file", 16)}</div><div class="orbitNode nodeB">${icon("code", 16)}</div><div class="orbitNode nodeC">${icon("check", 16)}</div><div class="orbitNode nodeD">${icon("report", 16)}</div><span class="orbitCaption capA">SOURCE</span><span class="orbitCaption capB">RULE</span><span class="orbitCaption capC">RUN</span><span class="orbitCaption capD">PROOF</span></div></section>
    <section class="statsRow"><article class="statCard"><span class="statLabel">PIPELINE READINESS</span><strong>${progressCount()}<small> / 5</small></strong><div class="statFoot"><span class="miniProgress"><i style="width:${progressCount() * 20}%"></i></span><span>governance steps</span></div></article><article class="statCard"><span class="statLabel">LATEST RUN</span><strong>${run ? run.ready : "Not set"}<small> ${run ? "ready" : "records"}</small></strong><div class="statFoot"><span class="statAccent">${run ? `${run.exceptions} exceptions, ${run.excluded} out of scope` : "No data leaves this browser"}</span></div></article><article class="statCard"><span class="statLabel">ACTIVE RULE</span><strong class="statRule">${escapeHtml(state.rule.version)}</strong><div class="statFoot">${state.ruleApproval ? '<span class="tinyCheck">✓</span> Human approval recorded' : '<span class="tinyPending">●</span> Approval pending'}</div></article><article class="statCard"><span class="statLabel">SOURCE CHANGE</span><strong class="statChange">${changeLabel}</strong><div class="statFoot">${changeDetail}</div></article></section>
    <div class="overviewGrid"><section class="panel journeyPanel"><div class="panelHeading"><div><span class="sectionEyebrow">THE REPORTING LIFECYCLE</span><h3>One chain, every decision visible</h3></div><button class="textAction" data-view="pipeline">Open pipeline ${icon("arrow", 15)}</button></div><div class="miniJourney">${stages.map((stage, index) => { const status = stageStatus(stage.id); return `<button class="miniStep ${status.kind}" data-stage="${stage.id}"><span class="miniStepNumber">${status.kind === "done" ? "✓" : String(index + 1).padStart(2, "0")}</span><span class="miniStepIcon">${icon(stage.icon, 16)}</span><strong>${stage.label}</strong><small>${status.label}</small>${index < stages.length - 1 ? '<i class="miniArrow">›</i>' : ""}</button>`; }).join("")}</div><div class="journeyNote"><span class="infoGlyph">i</span><p><strong>Human decisions stay human.</strong> The draft parser is a local demo. Only an explicit reviewer action approves an obligation or rule.</p></div></section><section class="panel nextPanel"><div class="nextTop"><span class="sectionEyebrow">RECOMMENDED NEXT STEP</span><span class="stepCounter">${String(stages.findIndex((stage) => stage.id === next[2]) + 1).padStart(2, "0")} <i>/</i> 07</span></div><div class="nextIcon">${icon(stages.find((stage) => stage.id === next[2])?.icon || "arrow", 20)}</div><h3>${next[0]}</h3><p>${next[1]}</p><button class="button primaryButton" data-stage="${next[2]}">Continue workflow ${icon("arrow", 16)}</button><div class="nextFoot">SAVED IN THIS BROWSER <span>•</span> ${dateLabel()}</div></section></div>
    <section class="bottomGrid"><article class="panel runPanel"><div class="panelHeading"><div><span class="sectionEyebrow">RECENT EXECUTION</span><h3>${run ? "Validation summary" : "Ready when you are"}</h3></div>${run ? statusPill(run.exceptions ? "warning" : "success", run.exceptions ? "Exceptions found" : "All clear") : statusPill("neutral", "Not run")}</div><div class="runSummaryRow"><div class="runSummaryMain"><span class="summaryIcon">${icon("check", 18)}</span><div><strong>${run ? `${run.total} records evaluated` : "Build the pipeline, then run it locally"}</strong><small>${run ? `${run.ready} ready for report · ${run.exceptions} exception${run.exceptions === 1 ? "" : "s"} · ${run.excluded} out of scope` : "Use the included fictional source and synthetic records to explore each stage."}</small></div></div><button class="quietButton" data-stage="${run ? "validate" : "source"}">${run ? "View run" : "Start here"} ${icon("chevron", 15)}</button></div></article><article class="panel trustPanel"><div class="trustIcon">${icon("lock", 18)}</div><div><span class="sectionEyebrow">DATA BOUNDARY</span><h3>Private execution, shared logic</h3><p>Reusable rule shapes and test cases can be shared. Firm data and local mappings stay on this device in this prototype.</p><button class="inlineAction" data-view="shared">See the shared model ${icon("arrow", 14)}</button></div></article></section>`;
}

function renderPipeline() {
  const pages = { source: renderSource, obligation: renderObligation, rule: renderRule, mapping: renderMapping, validate: renderValidate, report: renderReport, evidence: renderEvidence };
  return `<div class="pipelineHeader"><div><div class="eyebrow mutedEyebrow">FICTIONAL MARKET AUTHORITY <span class="eyebrowSep">/</span> CORPORATE BOND REPORTING</div><h2>Reporting pipeline</h2><p>Move from a cited source to a reviewed rule, a local run, and its evidence.</p></div><div class="pipelineHeaderRight">${statusPill(state.ruleApproval ? "success" : "warning", state.ruleApproval ? `Rule ${state.rule.version} approved` : "Draft workflow")}<button class="button subtleButton" data-action="reset">Reset demo</button></div></div>${stageTracker()}<section class="workPanel">${(pages[state.stage] || renderSource)()}</section><div class="pipelineFooter"><span><i class="greenPing"></i> Local execution only</span><span>Fictional rule, synthetic records</span><button data-action="help">Prototype scope ${icon("chevron", 13)}</button></div>`;
}

function pageIntro(step, title, description, right = "") {
  return `<div class="workIntro"><div><div class="stepOverline">${icon(step.icon, 15)} STEP ${String(stages.findIndex((s) => s.id === step.id) + 1).padStart(2, "0")} <span>/</span> ${step.label.toUpperCase()}</div><h3>${title}</h3><p>${description}</p></div>${right ? `<div class="introRight">${right}</div>` : ""}</div>`;
}

function renderSource() {
  return `${pageIntro(stages[0], "Start with the source", "Version the material that supports the reporting obligation.", statusPill("neutral", `Source ${state.sourceVersion}`))}<div class="twoColumn sourceColumns"><div class="sourceDocument cardInset"><div class="docTop"><div class="docMark">${icon("file", 17)}</div><div><span class="docType">REGULATORY SOURCE</span><strong>FMA Transaction Reporting Manual</strong><small>Fictional Market Authority · Section 4.3.2 · Paragraph 2</small></div><button class="moreButton" aria-label="Source options">•••</button></div><div class="sourceMeta"><span><small>JURISDICTION</small><strong>FMA</strong></span><span><small>DOMAIN</small><strong>Corporate bonds</strong></span><span><small>EFFECTIVE</small><strong>Jan 01, 2027</strong></span></div><label class="fieldLabel" for="sourceText">Source text <span>Editable sample</span></label><textarea id="sourceText" class="sourceEditor" spellcheck="false">${escapeHtml(state.sourceText)}</textarea><div class="sourceHint">This sample is fictional. Editing and saving creates a local source revision and opens a change review.</div><div class="sourceActions"><button class="button primaryButton" data-action="saveSource">${icon("file", 15)} Save source revision</button><span class="savedHint">${icon("lock", 13)} Stays in this browser</span></div></div><div class="sourceSide"><div class="sourceSideCard"><span class="sectionEyebrow">SOURCE LINEAGE</span><div class="lineageItem"><span class="lineageLine"></span><i class="lineageDot"></i><div><strong>Fictional reporting manual</strong><small>Section 4.3.2, paragraph 2</small></div></div><div class="lineageItem"><span class="lineageLine"></span><i class="lineageDot quietDot"></i><div><strong>Source version ${escapeHtml(state.sourceVersion)}</strong><small>Saved ${dateLabel()}</small></div></div><div class="lineageItem lastLineage"><i class="lineageDot quietDot"></i><div><strong>Obligation candidate</strong><small>${state.candidate ? "Draft ready for human review" : "Waiting for extraction"}</small></div></div></div>${renderSourceHistory()}<div class="noticeCard blueNotice"><div class="noticeIcon">${icon("search", 16)}</div><div><strong>Assisted discovery, visible limits</strong><p>This prototype uses a small deterministic parser. There is no AI service connected and no legal interpretation is produced.</p></div></div>${state.changeReview ? `<div class="noticeCard amberNotice"><div class="noticeIcon">${icon("pulse", 16)}</div><div><strong>${state.changeReview.status === "resolved" ? "Source change resolved" : "Source change detected"}</strong><p>${state.changeReview.status === "resolved" ? `Version ${escapeHtml(state.sourceVersion)} was resolved with approved rule ${escapeHtml(state.changeReview.ruleVersion || state.rule.version)}.` : state.changeReview.status === "reviewed" ? `Version ${escapeHtml(state.sourceVersion)} passed impact review. The updated rule still needs approval.` : `Version ${escapeHtml(state.sourceVersion)} has an open review. The current rule stays unchanged until a new version is approved.`}</p><button class="inlineAction" data-view="changes">${state.changeReview.status === "resolved" ? "View change record" : "Review change"} ${icon("arrow", 13)}</button></div></div>` : ""}</div></div><div class="stepBottom"><button class="button quietButton" disabled>Previous step</button><button class="button primaryButton" data-action="extract">Draft obligation ${icon("arrow", 15)}</button></div>`;
}

function draftFromSource(text = state.sourceText) {
  const cutoff = text.match(/after\s+(\d{1,2}:\d{2})/i)?.[1] || state.rule.cutoff;
  const deadline = text.match(/by\s+(\d{1,2}:\d{2})/i)?.[1] || state.rule.deadline;
  const required = reportFields.filter((field) => !field.scope).filter((field) => {
    const tokens = field.label.toLowerCase().split(" ");
    return tokens.some((token) => token.length > 3 && text.toLowerCase().includes(token));
  }).map((field) => field.key);
  return {
    id: state.rule.id,
    name: state.rule.name,
    scope: /corporate bond/i.test(text) ? "Same day corporate bond transactions" : "Scope needs reviewer clarification",
    cutoff,
    deadline,
    requiredFields: required.length ? required : reportFields.filter((field) => !field.scope).map((field) => field.key),
    sourceReference: `FMA Transaction Reporting Manual, section 4.3.2, paragraph 2`,
    status: "Candidate"
  };
}

function renderObligation() {
  const candidate = state.candidate;
  return `${pageIntro(stages[1], "Review the candidate obligation", "A candidate is a starting point. A person must confirm its meaning and scope before it becomes approved.", candidate ? statusPill(state.obligationApproval ? "success" : "warning", state.obligationApproval ? "Human review recorded" : "Candidate") : statusPill("neutral", "Waiting for draft"))}${candidate ? `<div class="obligationLayout"><div class="obligationMain"><div class="obligationCard"><div class="obligationCardTop"><div><span class="sectionEyebrow">CANDIDATE OBLIGATION</span><h4>${escapeHtml(candidate.name)}</h4></div><span class="candidateTag">DRAFT</span></div><div class="obligationId"><span>OBLIGATION ID</span><code>${escapeHtml(candidate.id)}</code><span class="idCopy">${icon("file", 13)}</span></div><div class="obligationFacts"><div><small>IN SCOPE</small><strong>${escapeHtml(candidate.scope)}</strong></div><div><small>TRIGGER</small><strong>Executed after ${escapeHtml(candidate.cutoff)} local market time</strong></div><div><small>REPORT DEADLINE</small><strong>By ${escapeHtml(candidate.deadline)} on the next business day</strong></div><div><small>SOURCE REFERENCE</small><strong>${escapeHtml(candidate.sourceReference)}</strong></div></div><div class="requiredBlock"><div class="requiredHeading"><span>REQUIRED REPORT FIELDS</span><small>${candidate.requiredFields.length} extracted</small></div><div class="fieldTokens">${candidate.requiredFields.map((key) => `<span class="fieldToken">${escapeHtml(reportFields.find((field) => field.key === key)?.label || key)}</span>`).join("")}</div></div><div class="obligationCardFoot"><span>${icon("file", 14)} Linked to source version ${escapeHtml(state.sourceVersion)}</span><button class="textAction smallText" data-stage="source">View source ${icon("arrow", 13)}</button></div></div><div class="noticeCard amberNotice"><div class="noticeIcon">!</div><div><strong>Interpretation still belongs to the reviewer</strong><p>Check the source, product scope, deadline, and reporting fields. Approval here is only a local demo record.</p></div></div></div><div class="reviewSide cardInset"><span class="sectionEyebrow">HUMAN REVIEW GATE</span><div class="reviewSeal">${icon(state.obligationApproval ? "check" : "search", 22)}</div><h4>${state.obligationApproval ? "Review recorded" : "Confirm this interpretation"}</h4><p>${state.obligationApproval ? `Recorded by ${escapeHtml(state.obligationApproval.reviewer)} at ${escapeHtml(state.obligationApproval.time)}.` : "The candidate will remain inactive until a reviewer records an explicit decision."}</p><label class="fieldLabel" for="reviewerName">Reviewer role</label><input id="reviewerName" class="textInput" value="${escapeHtml(state.reviewer)}" placeholder="For example, compliance reviewer" ${state.obligationApproval ? "disabled" : ""}/><button class="button ${state.obligationApproval ? "successButton" : "primaryButton"} fullButton" data-action="approveObligation" ${state.obligationApproval ? "disabled" : ""}>${state.obligationApproval ? `${icon("check", 15)} Approved locally` : "Approve interpretation"}</button><button class="reDraftLink" data-action="extract">Redraft from source</button><div class="reviewDisclaimer">No sign in or identity check is connected. This is not a legal approval.</div></div></div>` : `<div class="emptyState"><div class="emptyIcon">${icon("search", 23)}</div><h4>No candidate yet</h4><p>Draft an obligation from the fictional source. The parser only recognizes a few sample fields and times.</p><button class="button primaryButton" data-action="extract">Draft obligation ${icon("arrow", 15)}</button></div>`}<div class="stepBottom"><button class="button quietButton" data-stage="source">${icon("arrow", 15)} Source</button><button class="button primaryButton" data-stage="rule" ${state.obligationApproval ? "" : "disabled title=Approve the obligation first"}>Continue to rule ${icon("arrow", 15)}</button></div>`;
}

function incrementVersion(version) {
  const parts = String(version || "1.0.0").split(".").map((part) => Number(part) || 0);
  parts[2] = (parts[2] || 0) + 1;
  return parts.join(".");
}

function archiveRuleVersion() {
  const previous = state.ruleHistory.find((item) => item.version === state.rule.version && item.id === state.rule.id && item.name === state.rule.name && item.cutoff === state.rule.cutoff && item.deadline === state.rule.deadline);
  if (previous) return;
  state.ruleHistory.push({ ...state.rule, approval: state.ruleApproval || null, status: state.ruleApproval ? "Approved" : "Draft", archivedAt: timeLabel() });
  state.ruleHistory = state.ruleHistory.slice(-12);
}

function archiveMappingProfile() {
  const mappingText = JSON.stringify(state.mappings);
  const previous = state.mappingHistory.find((item) => item.version === state.mappingVersion && JSON.stringify(item.mappings) === mappingText);
  if (previous) return;
  state.mappingHistory.push({ version: state.mappingVersion, mappings: { ...state.mappings }, approval: state.mappingApproval || null, archivedAt: timeLabel() });
  state.mappingHistory = state.mappingHistory.slice(-12);
}

function renderRuleHistory() {
  const items = state.ruleHistory.slice().reverse().slice(0, 3);
  return `<div class="historyCard"><div class="historyHeading"><span class="sectionEyebrow">PRIOR RULE VERSIONS</span><span>${items.length} PRIOR</span></div>${items.length ? items.map((item) => `<div class="historyItem"><span class="historyStatus ${item.status === "Approved" ? "released" : "drafted"}"><i></i>${escapeHtml(item.status)}</span><code>v${escapeHtml(item.version)}</code><small>${escapeHtml(item.cutoff)} to ${escapeHtml(item.deadline)}</small></div>`).join("") : `<div class="noHistory">This is the first draft version.</div>`}</div>`;
}

function renderSourceHistory() {
  const items = state.sourceHistory.slice().reverse().slice(0, 4);
  return `<div class="historyCard sourceHistoryCard"><div class="historyHeading"><span class="sectionEyebrow">SOURCE VERSIONS</span><span>${state.sourceHistory.length} SAVED</span></div>${items.map((item) => `<div class="historyItem"><span class="historyStatus ${item.version === state.sourceVersion ? "released" : "drafted"}"><i></i>${item.version === state.sourceVersion ? "Current" : "Prior"}</span><code>v${escapeHtml(item.version)}</code><small>${escapeHtml(item.recordedAt)}</small></div>`).join("")}</div>`;
}

function renderRule() {
  const approval = state.ruleApproval;
  const candidateMatches = Boolean(state.candidate && state.rule.cutoff === state.candidate.cutoff && state.rule.deadline === state.candidate.deadline);
  const canApproveRule = Boolean(state.obligationApproval && candidateMatches && !state.ruleNeedsUpdate && (!state.changeReview || state.changeReview.status !== "open"));
  return `${pageIntro(stages[2], "Define a deterministic rule", "Turn the approved obligation into a versioned rule. This small rule engine does not use a language model.", statusPill(approval ? "success" : "warning", approval ? `Approved ${state.rule.version}` : `Draft ${state.rule.version}`))}
    ${state.ruleNeedsUpdate ? `<div class="noticeCard amberNotice ruleChangeBanner"><div class="noticeIcon">${icon("pulse", 16)}</div><div><strong>The source has changed</strong><p>Current source says ${escapeHtml((state.sourceText.match(/by\s+(\d{1,2}:\d{2})/i) || [])[1] || "a new deadline")}. Create a fresh rule draft before another run.</p></div><button class="button smallButton" data-action="draftRuleFromSource">Draft from source ${icon("arrow", 14)}</button></div>` : ""}
    <div class="ruleLayout">
      <div class="ruleEditor cardInset">
        <div class="editorTop"><div><span class="sectionEyebrow">RULE DEFINITION</span><h4>${escapeHtml(state.rule.name)}</h4></div><span class="versionBadge">v${escapeHtml(state.rule.version)}</span></div>
        <div class="ruleFormGrid">
          <label class="fieldLabel">Rule identifier<input id="ruleId" class="textInput monoInput" value="${escapeHtml(state.rule.id)}" ${approval ? "disabled" : ""}/></label>
          <label class="fieldLabel">Rule name<input id="ruleName" class="textInput" value="${escapeHtml(state.rule.name)}" ${approval ? "disabled" : ""}/></label>
          <label class="fieldLabel">Execution cutoff<input id="cutoff" class="textInput monoInput" value="${escapeHtml(state.rule.cutoff)}" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" ${approval ? "disabled" : ""}/></label>
          <label class="fieldLabel">Submission deadline<input id="deadline" class="textInput monoInput" value="${escapeHtml(state.rule.deadline)}" pattern="([01][0-9]|2[0-3]):[0-5][0-9]" ${approval ? "disabled" : ""}/></label>
        </div>
        <div class="ruleLogic"><div class="logicTop"><span>EXECUTION LOGIC</span><span class="deterministicTag">${icon("check", 13)} Deterministic</span></div><pre><code><span class="codeKeyword">WHEN</span> asset_class <span class="codeOperator">=</span> <span class="codeString">"Corporate Bond"</span>
  <span class="codeKeyword">AND</span> execution_time_local <span class="codeOperator">&gt;</span> <span class="codeString">"${escapeHtml(state.rule.cutoff)}"</span>
  <span class="codeKeyword">AND</span> trade_date <span class="codeOperator">=</span> execution date
<span class="codeKeyword">REQUIRE</span> ${reportFields.filter((field) => !field.scope).map((field) => escapeHtml(field.key)).join(", ")}
<span class="codeKeyword">DUE</span> next business day at <span class="codeString">"${escapeHtml(state.rule.deadline)}"</span></code></pre></div>
        <div class="ruleEditorFoot"><span>${icon("file", 14)} Source: ${escapeHtml(candidateReference())}</span><span>${icon("clock", 14)} Effective Jan 01, 2027</span></div>
      </div>
      <aside class="ruleAside">
        <div class="versionCard"><div class="versionStamp">${icon("code", 18)}</div><span class="sectionEyebrow">VERSION CONTROL</span><strong>${escapeHtml(state.rule.version)}</strong><p>Rule versions record every saved change. Approval is attached to one version.</p>${approval ? `<div class="approvedBy">${icon("check", 14)} Approved by ${escapeHtml(approval.reviewer)}</div>` : `<div class="pendingBy">${icon("clock", 14)} Approval required before execution</div>`}</div>
        ${renderRuleHistory()}
        <label class="fieldLabel approverField" for="ruleReviewer">Rule approver role<input id="ruleReviewer" class="textInput" value="${escapeHtml(state.ruleReviewer)}" ${approval ? "disabled" : ""}/></label>
        <div class="noticeCard blueNotice compactNotice"><div class="noticeIcon">${icon("shield", 15)}</div><div><strong>Readable rule, fixed behavior</strong><p>Edits are saved as a new version. The validator runs only the saved values.</p></div></div>
      </aside>
    </div>
    <div class="stepBottom"><button class="button quietButton" data-stage="obligation">${icon("arrow", 15)} Obligation</button><div class="stepBottomRight">${approval ? `<button class="button subtleButton" data-action="editRule">Edit approved rule</button>` : `<button class="button subtleButton" data-action="saveRule">Save draft version</button><button class="button primaryButton" data-action="approveRule" ${canApproveRule ? "" : "disabled"}>Approve rule ${icon("check", 15)}</button>`}<button class="button primaryButton" data-stage="mapping" ${approval ? "" : "disabled"}>Continue to mapping ${icon("arrow", 15)}</button></div></div>`;
}

function candidateReference() {
  return state.candidate?.sourceReference || "FMA Transaction Reporting Manual, section 4.3.2";
}

function renderMapping() {
  const approved = state.mappingApproval;
  const mappedCount = reportFields.filter((field) => state.mappings[field.key] && runtimeHeaders.includes(state.mappings[field.key])).length;
  const rows = reportFields.map((field) => {
    const mapped = Boolean(state.mappings[field.key] && runtimeHeaders.includes(state.mappings[field.key]));
    const options = [...new Set(["", ...runtimeHeaders, state.mappings[field.key]])];
    return `<tr><td><strong>${escapeHtml(field.label)}</strong><small>${escapeHtml(field.key)}${field.scope ? " · scope input" : ""}</small></td><td><span class="conceptDot"></span>${escapeHtml(field.concept)}</td><td><select class="mappingSelect" data-map="${field.key}" ${approved ? "disabled" : ""}>${options.map((value) => `<option value="${escapeHtml(value)}" ${value === state.mappings[field.key] ? "selected" : ""}>${value ? escapeHtml(value) : "Choose a column"}</option>`).join("")}</select></td><td>${mapped ? '<span class="mappedBadge"><i></i>Mapped</span>' : '<span class="missingBadge">Missing column</span>'}</td></tr>`;
  }).join("");
  return `${pageIntro(stages[3], "Map reporting fields to data", "Connect the generic reporting model to source columns. Mappings are local and belong to each institution.", statusPill(approved ? "success" : "warning", approved ? `Profile ${state.mappingVersion} approved` : "Needs review"))}<div class="mappingTop"><div class="mappingSummary"><span class="modelIcon">${icon("grid", 18)}</span><div><strong>Generic reporting model</strong><small>Illustrative field names, not a declared standard mapping</small></div><span class="mappingVersion">PROFILE ${escapeHtml(state.mappingVersion)}</span></div><label class="button subtleButton importButton">${icon("plus", 15)} Choose CSV on this device<input id="csvInput" type="file" accept=".csv,text/csv" hidden/></label></div><div class="tableFrame"><table class="mappingTable"><thead><tr><th>REPORT FIELD</th><th>GENERIC CONCEPT</th><th>SOURCE COLUMN</th><th>STATUS</th></tr></thead><tbody>${rows}</tbody></table></div><div class="mappingFoot"><div class="mappingFootLeft"><span class="mappingCount">${mappedCount} <i>/</i> ${reportFields.length}</span><span>fields connected</span><span class="mappingDivider"></span><span class="csvName">${icon("file", 13)} ${escapeHtml(runtimeFileName)}</span></div><span class="mappingPrivacy">${icon("lock", 13)} CSV data stays in memory</span></div><div class="mappingLower"><div class="noticeCard blueNotice"><div class="noticeIcon">i</div><div><strong>Common standards are extension points</strong><p>FINOS CDM, ISO 20022, XBRL, and institution catalogs need domain specific mapping and conformance work. This demo does not claim to implement them.</p></div></div><div class="mapApproval cardInset"><div class="mapReviewCopy"><span class="sectionEyebrow">DATA STEWARDSHIP</span><strong>${approved ? `Approved by ${escapeHtml(approved.reviewer)}` : "Review every source column"}</strong><small>${approved ? `Recorded ${escapeHtml(approved.time)}` : "Use a reviewer role different from the obligation and rule reviewers."}</small></div><div class="mapApprovalActions">${approved ? '<button class="button subtleButton" data-action="editMapping">Edit approved mapping</button>' : `<label class="fieldLabel" for="mappingReviewer">Mapping approver role<input id="mappingReviewer" class="textInput" value="${escapeHtml(state.mappingReviewer)}"/></label><button class="button primaryButton" data-action="approveMapping">Approve mapping</button>`}</div></div></div><div class="stepBottom"><button class="button quietButton" data-stage="rule">${icon("arrow", 15)} Rule</button><button class="button primaryButton" data-stage="validate" ${approved ? "" : "disabled"}>Continue to validation ${icon("arrow", 15)}</button></div>`;
}

function normalizedRecord(row) {
  const mapped = {};
  for (const field of reportFields) {
    const source = state.mappings[field.key];
    mapped[field.key] = source ? row[source] : undefined;
  }
  return mapped;
}

function parseTime(value) {
  const match = String(value || "").match(/(?:T|\s)?(\d{1,2}:\d{2})/);
  const time = match ? match[1].padStart(5, "0") : "";
  return /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time) ? time : "";
}

function isCorporateBond(value) {
  return /corporate[\s_]?bond/i.test(String(value || ""));
}

function dateDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

function evaluateRecord(raw) {
  const record = normalizedRecord(raw);
  const time = parseTime(record.execution_time_local || record.execution_timestamp);
  if (!record.asset_class || !time || !record.trade_date) return { status: "exception", record, raw, issues: [!record.asset_class ? "Product class is not mapped" : !time ? "Local execution time is not mapped" : "Trade date is not mapped"] };
  if (!isCorporateBond(record.asset_class) || time <= state.rule.cutoff) return { status: "excluded", record, raw, issues: [] };
  const issues = [];
  if (dateDigits(record.trade_date) !== dateDigits(record.execution_timestamp)) issues.push("Trade date does not match execution date");
  for (const field of reportFields.filter((item) => !item.scope)) {
    if (record[field.key] === undefined || String(record[field.key]).trim() === "") issues.push(`Missing ${field.label.toLowerCase()}`);
  }
  const notional = Number(record.notional_amount);
  const price = Number(record.price);
  if (record.notional_amount !== undefined && record.notional_amount !== "" && !(notional > 0)) issues.push("Notional amount must be above zero");
  if (record.price !== undefined && record.price !== "" && !(price > 0)) issues.push("Price must be above zero");
  return { status: issues.length ? "exception" : "ready", record, raw, issues };
}

function executionResults() {
  return runtimeRows.map(evaluateRecord);
}

function conformanceCases() {
  const good = { ...sampleRows[0], transaction_id: "TEST 001", execution_time_local: "16:15" };
  const missing = { ...good, transaction_id: "TEST 002", counterparty_classification: "" };
  const outside = { ...good, transaction_id: "TEST 003", execution_time_local: "15:59" };
  const zero = { ...good, transaction_id: "TEST 004", notional_amount: "0" };
  return [
    { name: "Complete late corporate bond", row: good, expected: "ready" },
    { name: "Missing counterparty class", row: missing, expected: "exception" },
    { name: "Trade before the cutoff", row: outside, expected: "excluded" },
    { name: "Zero notional amount", row: zero, expected: "exception" }
  ];
}

function renderValidate() {
  const allowed = canRun();
  const completed = Boolean(state.runSummary);
  return `${pageIntro(stages[4], "Run deterministic validation", "The same saved rule and mapped input produce the same checks. No data is sent to a model or service.", statusPill(completed ? "success" : allowed ? "neutral" : "warning", completed ? "Run complete" : allowed ? "Ready to run" : "Approval needed"))}${!allowed ? `<div class="noticeCard amberNotice gateNotice"><div class="noticeIcon">!</div><div><strong>Execution is gated</strong><p>Record an obligation approval, rule approval, mapping approval, and review any source change before running this pipeline.</p></div><button class="textAction" data-action="goNextGate">Resolve ${icon("arrow", 14)}</button></div>` : ""}<div class="validationControls"><div class="datasetCard cardInset"><div class="datasetGlyph">${icon("grid", 18)}</div><div class="datasetCopy"><span class="sectionEyebrow">INPUT DATASET</span><strong>${escapeHtml(runtimeFileName)}</strong><small>${runtimeRows.length} records · ${runtimeHeaders.length} columns · browser memory only</small></div><button class="button subtleButton" data-stage="mapping">Review mapping</button></div><div class="runControl"><div><span class="sectionEyebrow">RULE TO EXECUTE</span><strong>${escapeHtml(state.rule.id)}</strong><small>Version ${escapeHtml(state.rule.version)} · cutoff ${escapeHtml(state.rule.cutoff)}</small></div><button class="button primaryButton runButton" data-action="run" ${allowed ? "" : "disabled"}>${icon("check", 16)} Run validation</button></div></div><div class="validationResults">${completed ? renderRunResults(sessionRun || { results: [], summary: state.runSummary, conformance: state.runSummary.conformance, runId: state.runSummary.runId, at: state.runSummary.at, reloaded: true }) : `<div class="emptyRun"><div class="runGlyph">${icon("pulse", 22)}</div><h4>Ready to evaluate ${runtimeRows.length} records</h4><p>Run validation to see in scope records, field checks, and conformance results.</p><button class="button primaryButton" data-action="run" ${allowed ? "" : "disabled"}>Run local validation ${icon("arrow", 15)}</button></div>`}</div><div class="validationFoot"><span>${icon("shield", 14)} Rule execution is deterministic and explainable</span><span>Holiday calendars and filing submission are outside this prototype</span><span>Conformance runs on demand. No CI service is connected.</span></div><div class="stepBottom"><button class="button quietButton" data-stage="mapping">${icon("arrow", 15)} Mapping</button><button class="button primaryButton" data-stage="report" ${completed ? "" : "disabled"}>View report ${icon("arrow", 15)}</button></div>`;
}

function renderRunResults(run) {
  const results = run.results || [];
  const summary = run.summary || state.runSummary;
  const conformance = run.conformance || { passed: summary?.conformance || 0, total: 4, cases: [] };
  return `<div class="resultHeader"><div><span class="sectionEyebrow">EXECUTION ${escapeHtml(run.runId || "")}</span><strong>Completed ${escapeHtml(run.at || "in a previous browser session")}</strong></div>${statusPill(summary.exceptions ? "warning" : "success", summary.exceptions ? "Review exceptions" : "All checks passed")}</div><div class="resultStats"><div><span>READY</span><strong>${summary.ready}</strong><small>reportable rows</small></div><div><span>EXCEPTIONS</span><strong class="exceptionNumber">${summary.exceptions}</strong><small>need data review</small></div><div><span>OUT OF SCOPE</span><strong>${summary.excluded}</strong><small>not evaluated for reporting</small></div><div><span>CONFORMANCE</span><strong>${conformance.passed}<i> / ${conformance.total}</i></strong><small>synthetic test cases</small></div></div>${results.length ? `<div class="tableFrame resultTableFrame"><table class="resultTable"><thead><tr><th>TRANSACTION</th><th>PRODUCT</th><th>LOCAL TIME</th><th>RESULT</th><th>DETAIL</th></tr></thead><tbody>${results.map((result) => `<tr><td><strong>${escapeHtml(result.record.transaction_id || "Unnamed row")}</strong></td><td>${escapeHtml(result.record.asset_class || "Not mapped")}</td><td class="monoText">${escapeHtml(parseTime(result.record.execution_time_local || result.record.execution_timestamp) || "Not set")}</td><td>${statusPill(result.status === "ready" ? "success" : result.status === "exception" ? "warning" : "neutral", result.status === "ready" ? "Ready" : result.status === "exception" ? "Exception" : "Out of scope")}</td><td>${escapeHtml(result.issues.length ? result.issues.join("; ") : result.status === "excluded" ? `Does not meet the ${state.rule.cutoff} trigger` : "All required checks passed")}</td></tr>`).join("")}</tbody></table></div>` : `<div class="reloadedNote">Run details were cleared when this browser reopened. Run validation again to inspect individual rows.</div>`}<div class="conformanceBox"><div class="conformanceTop"><span>${icon("check", 15)} CONFORMANCE SUITE</span><strong>${conformance.passed} of ${conformance.total} expected outcomes</strong></div><div class="testCaseRow">${(conformance.cases || []).map((test) => `<span class="testCase ${test.pass === false ? "fail" : "pass"}"><i>${test.pass === false ? "!" : "✓"}</i>${escapeHtml(test.name)}</span>`).join("") || '<span class="testCase pass"><i>✓</i>Suite executed in prior session</span>'}</div></div>`;
}

function renderReport() {
  const summary = state.runSummary;
  const readyRows = sessionRun?.results?.filter((result) => result.status === "ready") || [];
  return `${pageIntro(stages[5], "Prepare a pre submission report", "Inspect the records that passed validation, then export a local CSV or JSON file.", summary ? statusPill("success", `${summary.ready} ready`) : statusPill("warning", "Run required"))}${summary ? `<div class="reportSummary"><div class="reportSummaryInfo"><span class="reportFileIcon">${icon("report", 21)}</span><div><span class="sectionEyebrow">REPORT PREVIEW</span><h4>FMA corporate bond reporting</h4><p>Generated from rule ${escapeHtml(state.rule.version)} · ${escapeHtml(summary.at)} · ${summary.ready} records ready</p></div></div><div class="reportBadge">LOCAL DRAFT</div></div><div class="reportMetrics"><div><small>REPORTABLE ROWS</small><strong>${summary.ready}</strong></div><div><small>OPEN EXCEPTIONS</small><strong class="exceptionNumber">${summary.exceptions}</strong></div><div><small>FILING STATUS</small><strong class="draftStatus">Not submitted</strong></div></div><div class="reportNotice"><span>${icon("file", 15)}</span><p><strong>This is a pre submission artifact.</strong> The prototype does not validate against an FMA schema or file a report.</p></div>${readyRows.length ? `<div class="tableFrame reportTableFrame"><table class="resultTable"><thead><tr><th>TRANSACTION</th><th>INSTRUMENT</th><th>EXECUTED</th><th>COUNTERPARTY</th><th>NOTIONAL</th><th>PRICE</th></tr></thead><tbody>${readyRows.map((item) => `<tr><td><strong>${escapeHtml(item.record.transaction_id)}</strong></td><td>${escapeHtml(item.record.instrument_id)}</td><td class="monoText">${escapeHtml(item.record.execution_timestamp)}</td><td>${escapeHtml(item.record.counterparty_classification)}</td><td>${formatAmount(item.record.notional_amount)}</td><td>${escapeHtml(item.record.price)}</td></tr>`).join("")}</tbody></table></div>` : `<div class="reloadedNote">The prior run summary is saved. Run validation again to rebuild report rows in this browser session.</div>`}<div class="exportActions"><div><strong>Export report</strong><small>Files are created on this device.</small></div><button class="button subtleButton" data-action="exportCsv" ${readyRows.length ? "" : "disabled"}>${icon("download", 15)} Download CSV</button><button class="button primaryButton" data-action="exportJson" ${readyRows.length ? "" : "disabled"}>${icon("download", 15)} Download JSON</button></div>` : `<div class="emptyState"><div class="emptyIcon">${icon("report", 23)}</div><h4>No report is ready</h4><p>Complete the approval gates and run deterministic validation first.</p><button class="button primaryButton" data-stage="validate">Go to validation ${icon("arrow", 15)}</button></div>`}<div class="stepBottom"><button class="button quietButton" data-stage="validate">${icon("arrow", 15)} Validation</button><button class="button primaryButton" data-stage="evidence" ${summary ? "" : "disabled"}>Create evidence pack ${icon("arrow", 15)}</button></div>`;
}

function formatAmount(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(numeric) : escapeHtml(value);
}

function renderEvidence() {
  const manifest = state.evidenceManifest;
  const verify = state.evidenceVerification;
  return `${pageIntro(stages[6], "Create an evidence pack", "Bundle lineage, approvals, rule and mapping versions, test results, and content fingerprints.", manifest ? statusPill(verify === "valid" ? "success" : verify === "changed" ? "warning" : "neutral", verify === "valid" ? "Fingerprints match" : verify === "partial" ? "Core artifacts match" : verify === "changed" ? "Content changed" : "Manifest saved") : statusPill("warning", "Not created"))}${state.runSummary ? `<div class="evidenceLayout"><div class="evidenceMain"><div class="evidenceCard"><div class="evidenceCardHead"><div class="evidenceSeal">${icon("shield", 22)}</div><div><span class="sectionEyebrow">EVIDENCE MANIFEST</span><h4>${manifest ? escapeHtml(manifest.evidenceId) : "Ready to assemble"}</h4><small>${manifest ? `Created ${escapeHtml(manifest.createdAt)}` : "A new pack will be generated from this run."}</small></div>${manifest ? '<span class="packTag">JSON PACK</span>' : ""}</div><div class="evidenceItems"><div class="evidenceItem"><span class="evidenceItemIcon">${icon("file", 15)}</span><div><strong>Source lineage</strong><small>${escapeHtml(candidateReference())} · source ${escapeHtml(state.sourceVersion)}</small></div><span class="evidenceItemState">${manifest ? "INCLUDED" : "READY"}</span></div><div class="evidenceItem"><span class="evidenceItemIcon">${icon("code", 15)}</span><div><strong>Approved rule</strong><small>${escapeHtml(state.rule.id)} · version ${escapeHtml(state.rule.version)}</small></div><span class="evidenceItemState">${manifest ? "INCLUDED" : "READY"}</span></div><div class="evidenceItem"><span class="evidenceItemIcon">${icon("grid", 15)}</span><div><strong>Data mapping</strong><small>Generic reporting model · profile ${escapeHtml(state.mappingVersion)}</small></div><span class="evidenceItemState">${manifest ? "INCLUDED" : "READY"}</span></div><div class="evidenceItem"><span class="evidenceItemIcon">${icon("check", 15)}</span><div><strong>Execution and conformance</strong><small>${state.runSummary.ready} ready · ${state.runSummary.exceptions} exceptions · ${state.runSummary.conformance} of 4 tests passed</small></div><span class="evidenceItemState">${manifest ? "INCLUDED" : "READY"}</span></div></div><div class="evidenceDigest"><div><span class="sectionEyebrow">CONTENT FINGERPRINT</span><code>${manifest ? escapeHtml(manifest.hashes.manifest) : "Generated when the pack is created"}</code></div><span class="fingerprintMark">SHA 256</span></div></div><div class="evidenceActionRow"><div><span class="noticeIcon">i</span><p><strong>Integrity has limits.</strong> A digest can show that content changed. This prototype does not sign files or provide immutable storage.</p></div><div class="evidenceButtons">${manifest ? `<button class="button subtleButton" data-action="verifyEvidence">${icon("check", 15)} Verify fingerprints</button><button class="button primaryButton" data-action="downloadEvidence" ${sessionRun ? "" : "disabled"}>${icon("download", 15)} ${sessionRun ? "Download evidence" : "Run again to rebuild pack"}</button>` : `<button class="button primaryButton" data-action="createEvidence">${icon("shield", 15)} Create evidence pack</button>`}</div></div></div><aside class="evidenceAside"><div class="privateEvidence"><div class="privateIcon">${icon("lock", 18)}</div><span class="sectionEyebrow">LOCAL EVIDENCE</span><h4>Firm data stays private</h4><p>The pack includes the report preview and a digest of the input. Raw input rows stay out of the evidence file.</p><div class="privateDivider"></div><div class="privateStat"><span>INPUT RECORDS</span><strong>${state.runSummary.total}</strong></div><div class="privateStat"><span>REPORT ROWS</span><strong>${state.runSummary.ready}</strong></div><div class="privateStat"><span>RULE APPROVAL</span><strong>${escapeHtml(state.ruleApproval?.reviewer || "Not recorded")}</strong></div></div><button class="textAction fullTextAction" data-view="shared">See shareable artifacts ${icon("arrow", 14)}</button></aside></div>` : `<div class="emptyState"><div class="emptyIcon">${icon("shield", 23)}</div><h4>Evidence follows execution</h4><p>Run validation first. The pack will record which source, rule, mapping, approvals, tests, and report were used.</p><button class="button primaryButton" data-stage="validate">Go to validation ${icon("arrow", 15)}</button></div>`}<div class="stepBottom"><button class="button quietButton" data-stage="report">${icon("arrow", 15)} Report</button><button class="button subtleButton" data-view="changes">Review source changes ${icon("arrow", 15)}</button></div>`;
}

function renderChanges() {
  const hasChange = Boolean(state.changeReview);
  const changeResolved = state.changeReview?.status === "resolved";
  const changePill = !hasChange ? "No change detected" : changeResolved ? "Change resolved" : state.changeReview.status === "reviewed" ? "Review recorded" : "Change needs review";
  const changeTone = !hasChange ? "neutral" : state.changeReview.status === "open" ? "warning" : "success";
  const changeActionText = !hasChange ? "" : changeResolved ? `${icon("check", 15)} Source change resolved` : state.changeReview.status === "reviewed" ? `${icon("check", 15)} Review recorded` : "Record impact review";
  const previous = state.previousSourceText || state.sourceText;
  const currentDeadline = (state.sourceText.match(/by\s+(\d{1,2}:\d{2})/i) || [])[1] || "unknown";
  const previousDeadline = (previous.match(/by\s+(\d{1,2}:\d{2})/i) || [])[1] || "unknown";
  return `<div class="pageHero compactHero"><div><div class="eyebrow mutedEyebrow">LIFECYCLE GOVERNANCE <span class="eyebrowSep">/</span> SOURCE CHANGE MONITORING</div><h2>Change desk</h2><p>Detect a source revision, trace its impact, and open a review. No rule changes automatically.</p></div><span class="monitorState"><i class="greenPing"></i> SAMPLE MONITOR ONLY</span></div><div class="changeGrid"><section class="panel changeMain"><div class="panelHeading"><div><span class="sectionEyebrow">REGULATORY SOURCE MONITOR</span><h3>FMA Transaction Reporting Manual</h3></div>${statusPill(changeTone, changePill)}</div><div class="sourceVersionRow"><div class="sourceVersionBlock"><span class="versionLabel">CURRENT SOURCE</span><strong>Version ${escapeHtml(state.sourceVersion)}</strong><small>Fictional Market Authority · Section 4.3.2</small></div><div class="versionArrow">${icon("arrow", 18)}</div><div class="sourceVersionBlock ${hasChange ? "changedVersion" : "quietVersion"}"><span class="versionLabel">${hasChange ? "PRIOR SOURCE" : "WATCH STATUS"}</span><strong>${hasChange ? `Version ${escapeHtml(state.changeReview.priorVersion)}` : "Feed not connected"}</strong><small>${hasChange ? `Deadline changed from ${previousDeadline} to ${currentDeadline}` : "Use the local sample change to explore impact review"}</small></div></div>${hasChange ? `<div class="changeDiff"><div class="diffLine"><span class="diffMark removed">OLD</span><code>${escapeHtml(previous)}</code></div><div class="diffLine"><span class="diffMark added">NEW</span><code>${escapeHtml(state.sourceText)}</code></div></div>` : `<div class="monitorEmpty"><div class="monitorGlyph">${icon("pulse", 22)}</div><div><strong>Waiting for a source revision</strong><p>The prototype does not scrape public sources. Load the sample amendment to see the review path.</p></div></div>`}<div class="impactCard"><div class="impactHeading"><span class="sectionEyebrow">IMPACTED ARTIFACTS</span><span class="impactCount">${hasChange ? "4" : "0"} ITEMS</span></div><div class="impactList"><span>${icon("search", 14)} Obligation interpretation</span><span>${icon("code", 14)} Rule deadline and version</span><span>${icon("check", 14)} Conformance cases</span><span>${icon("report", 14)} Report timing and evidence</span></div></div><div class="changeActions">${hasChange ? `<button class="button ${state.changeReview.status === "open" ? "primaryButton" : "successButton"}" data-action="reviewChange" ${state.changeReview.status === "open" ? "" : "disabled"}>${changeActionText}</button>${changeResolved ? "" : `<button class="button subtleButton" data-action="extractUpdated">Draft updated obligation ${icon("arrow", 14)}</button>`}` : `<button class="button primaryButton" data-action="sampleAmendment">${icon("pulse", 15)} Load sample amendment</button><button class="button subtleButton" data-view="pipeline">Edit source text ${icon("arrow", 14)}</button>`}</div></section><aside class="changeSide"><div class="panel changePrinciple"><div class="principleIcon">${icon("shield", 18)}</div><span class="sectionEyebrow">SAFE CHANGE CONTROL</span><h3>Review first.<br/>Release later.</h3><p>A source update can flag downstream work. It never edits an approved rule or activates a release by itself.</p><div class="principleFlow"><span>Source update</span><i></i><span>Human review</span><i></i><span>New rule version</span></div></div><div class="noticeCard blueNotice changeLimit"><div class="noticeIcon">i</div><div><strong>No live feed is connected</strong><p>The sample amendment is illustrative. Real monitoring needs an official source, feed policy, and maintained change detection.</p></div></div></aside></div>`;
}

function renderShared() {
  return `<div class="pageHero compactHero"><div><div class="eyebrow mutedEyebrow">OPEN GOVERNANCE <span class="eyebrowSep">/</span> REUSABLE INFRASTRUCTURE</div><h2>Shared library</h2><p>Make common work reusable while keeping firm data and local controls private.</p></div><button class="button primaryButton" data-action="exportShared">${icon("download", 15)} Export sample bundle</button></div><div class="sharedBanner"><div class="sharedMark">${icon("layers", 20)}</div><div><span class="sectionEyebrow">PROPOSED COMMUNITY MODEL</span><h3>Share the rule shape. Keep the execution local.</h3><p>A future public project can host schemas, reviewed rule artifacts, mappings, and conformance cases. Each institution can run approved artifacts against its own data.</p></div><div class="sharedLoop"><div class="loopCircle">${icon("flow", 18)}</div><span>CONTRIBUTE</span><i>↔</i><span>RUN LOCALLY</span></div></div><div class="libraryGrid"><section class="panel artifactPanel"><div class="panelHeading"><div><span class="sectionEyebrow">REUSABLE ARTIFACTS</span><h3>What can be shared</h3></div><span class="publicTag">PUBLIC SHAPE</span></div><div class="artifactList"><article class="artifactRow"><span class="artifactIcon indigoIcon">${icon("file", 17)}</span><div><strong>Obligation schema</strong><p>Source reference, scope, fields, severity, effective date, and owner.</p><span class="artifactMeta">SCHEMA · 0.1</span></div><span class="artifactReady">READY</span></article><article class="artifactRow"><span class="artifactIcon greenIcon">${icon("code", 17)}</span><div><strong>Rule definition</strong><p>Readable inputs, trigger logic, required checks, and approval metadata.</p><span class="artifactMeta">SAMPLE · ${escapeHtml(state.rule.version)}</span></div><span class="artifactReady">READY</span></article><article class="artifactRow"><span class="artifactIcon amberIcon">${icon("grid", 17)}</span><div><strong>Conformance cases</strong><p>Synthetic valid, missing field, boundary, and out of scope examples. A real project can run them in CI for each proposed change.</p><span class="artifactMeta">TEST SUITE · 0.1</span></div><span class="artifactReady">READY</span></article><article class="artifactRow"><span class="artifactIcon blueIcon">${icon("shield", 17)}</span><div><strong>Evidence manifest shape</strong><p>Lineage, release references, run results, and content fingerprints.</p><span class="artifactMeta">FORMAT · 0.1</span></div><span class="artifactReady">READY</span></article></div></section><section class="panel keepPrivatePanel"><div class="panelHeading"><div><span class="sectionEyebrow">INSTITUTIONAL BOUNDARY</span><h3>What stays private</h3></div><span class="privateTag">LOCAL DATA</span></div><div class="privateList"><div><span>${icon("lock", 16)}</span><p><strong>Source system mappings</strong><small>Internal table and column names</small></p><i>PRIVATE</i></div><div><span>${icon("lock", 16)}</span><p><strong>Customer and trade records</strong><small>Any real input used by a firm</small></p><i>PRIVATE</i></div><div><span>${icon("lock", 16)}</span><p><strong>Local approval records</strong><small>Institution identity and control trail</small></p><i>PRIVATE</i></div><div><span>${icon("lock", 16)}</span><p><strong>Execution evidence</strong><small>Operational detail and report output</small></p><i>PRIVATE</i></div></div><div class="privacyFoot">${icon("shield", 14)} No shared service is connected in this prototype.</div></section></div><section class="standardsPanel panel"><div><span class="sectionEyebrow">STANDARDS ARE EXTENSIONS, NOT BADGES</span><h3>Connect to established work</h3><p>This prototype uses a generic field model. Any standards alignment needs concrete schemas, mappings, and conformance evidence for the chosen reporting domain.</p></div><div class="standardLinks"><a href="https://cdm.finos.org/" target="_blank" rel="noreferrer"><strong>FINOS CDM</strong><small>Financial product and trade model</small>${icon("arrow", 13)}</a><a href="https://www.omg.org/dmn/index.htm" target="_blank" rel="noreferrer"><strong>OMG DMN</strong><small>Business decision notation</small>${icon("arrow", 13)}</a><a href="https://www.xbrl.org/" target="_blank" rel="noreferrer"><strong>XBRL</strong><small>Digital reporting specifications</small>${icon("arrow", 13)}</a><a href="https://www.iso20022.org/" target="_blank" rel="noreferrer"><strong>ISO 20022</strong><small>Financial messaging standard</small>${icon("arrow", 13)}</a></div></section><div class="governanceRow"><div class="governanceNote"><span class="governanceIcon">${icon("layers", 17)}</span><div><strong>Governance needs a neutral home</strong><p>No foundation, regulator, bank, or vendor has endorsed this prototype. A real project needs contribution rules, maintainers, review roles, dissent handling, and release policy.</p></div></div><div class="governanceSteps"><span>1 <small>Contribute</small></span><i></i><span>2 <small>Review</small></span><i></i><span>3 <small>Release</small></span><i></i><span>4 <small>Conform</small></span></div></div>`;
}

function renderHelp() {
  return `<div class="modalBackdrop" data-action="closeHelp"><section class="helpModal" role="dialog" aria-modal="true" aria-labelledby="helpTitle"><button class="modalClose" data-action="closeHelp" aria-label="Close">×</button><span class="sectionEyebrow">ABOUT THIS PROTOTYPE</span><h3 id="helpTitle">A governed pipeline, shown locally.</h3><p>This workbench uses one fictional reporting obligation and synthetic records to make the lifecycle concrete. It shows source lineage, human review, editable rule versions, mapping, deterministic checks, report creation, evidence fingerprints, and change review.</p><div class="helpLimitGrid"><div><strong>What works here</strong><p>All workflow actions run in this browser. CSV input is parsed in memory. Rule checks are deterministic.</p></div><div><strong>What is not connected</strong><p>No AI model, regulatory feed, identity service, real reporting format, public repository, or filing destination is connected.</p></div></div><button class="button primaryButton" data-action="closeHelp">Back to workbench</button></section></div>`;
}

function render() {
  const content = state.view === "overview" ? renderOverview() : state.view === "pipeline" ? renderPipeline() : state.view === "changes" ? renderChanges() : renderShared();
  appShell(content + (state.helpOpen ? renderHelp() : ""));
}

function setView(view) {
  state.view = view;
  save();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setStage(stage) {
  state.view = "pipeline";
  state.stage = stage;
  save();
  render();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function setApproval(key, reviewer) {
  state.reviewer = reviewer.trim();
  state[key] = { reviewer: state.reviewer, time: timeLabel() };
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast("Local review recorded for this demo.");
}

function extractObligation() {
  if (state.changeReview?.status === "open") return showToast("Record the source impact review before drafting a new obligation.");
  state.candidate = draftFromSource();
  state.obligationApproval = null;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  state.view = "pipeline";
  state.stage = "obligation";
  save();
  render();
  showToast("Draft candidate created. Human review is still required.");
}

function saveSourceRevision() {
  const input = document.getElementById("sourceText");
  const newText = input?.value.trim();
  if (!newText) return showToast("Source text cannot be empty.");
  if (newText === state.sourceText) return showToast("No source change to save.");
  const priorVersion = state.sourceVersion;
  const [major = 1, minor = 0] = priorVersion.split(".").map(Number);
  state.previousSourceText = state.sourceText;
  state.sourceText = newText;
  state.sourceVersion = `${major}.${minor + 1}`;
  state.sourceHistory.push({ version: state.sourceVersion, text: newText, recordedAt: timeLabel() });
  state.sourceHistory = state.sourceHistory.slice(-12);
  state.changeReview = { status: "open", priorVersion, newVersion: state.sourceVersion, openedAt: timeLabel(), reviewedAt: null };
  state.candidate = null;
  state.obligationApproval = null;
  state.ruleNeedsUpdate = true;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  setView("changes");
  showToast("New source version saved. Rule execution is paused pending review.");
}

function saveRuleDraft() {
  const id = document.getElementById("ruleId")?.value.trim();
  const name = document.getElementById("ruleName")?.value.trim();
  const cutoff = document.getElementById("cutoff")?.value.trim();
  const deadline = document.getElementById("deadline")?.value.trim();
  if (!id || !name || !parseTime(cutoff) || !parseTime(deadline)) return showToast("Enter a rule name and valid 24 hour times.");
  const prior = `${state.rule.id}|${state.rule.name}|${state.rule.cutoff}|${state.rule.deadline}`;
  const next = `${id}|${name}|${cutoff.padStart(5, "0")}|${deadline.padStart(5, "0")}`;
  if (state.ruleApproval || prior !== next) {
    archiveRuleVersion();
    state.rule.version = incrementVersion(state.rule.version);
  }
  state.rule = { ...state.rule, id, name, cutoff: cutoff.padStart(5, "0"), deadline: deadline.padStart(5, "0") };
  state.ruleApproval = null;
  state.ruleNeedsUpdate = false;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast(`Rule draft saved as version ${state.rule.version}.`);
}

function editApprovedRule() {
  archiveRuleVersion();
  state.ruleApproval = null;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast("Rule is now a draft. Review and approve this new version.");
}

function draftRuleFromSource() {
  if (state.changeReview?.status === "open") return showToast("Record the source impact review before drafting a new rule.");
  archiveRuleVersion();
  const draft = draftFromSource();
  state.rule = { ...state.rule, id: draft.id, name: draft.name, cutoff: draft.cutoff, deadline: draft.deadline, version: incrementVersion(state.rule.version) };
  state.ruleApproval = null;
  state.ruleNeedsUpdate = false;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  state.view = "pipeline";
  state.stage = "rule";
  save();
  render();
  showToast(`New rule draft created as version ${state.rule.version}.`);
}

function approveRule() {
  if (!state.obligationApproval) return showToast("Approve the obligation before approving its rule.");
  if (!state.candidate || state.ruleNeedsUpdate || state.rule.cutoff !== state.candidate.cutoff || state.rule.deadline !== state.candidate.deadline) return showToast("Save a rule version that matches the approved obligation first.");
  if (state.changeReview?.status === "open") return showToast("Record the source impact review before approving this rule.");
  const reviewer = document.getElementById("ruleReviewer")?.value.trim() || state.ruleReviewer;
  const priorReviewers = [state.obligationApproval?.reviewer, state.mappingApproval?.reviewer].filter(Boolean).map((value) => value.toLowerCase());
  if (priorReviewers.includes(reviewer.toLowerCase())) return showToast("Use a different reviewer role for the rule approval.");
  state.ruleReviewer = reviewer;
  state.ruleApproval = { reviewer, time: timeLabel(), version: state.rule.version };
  state.ruleNeedsUpdate = false;
  if (state.changeReview?.status === "reviewed") state.changeReview = { ...state.changeReview, status: "resolved", resolvedAt: timeLabel(), ruleVersion: state.rule.version };
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast(`Rule version ${state.rule.version} approved locally.`);
}

function approveMapping() {
  const missing = reportFields.filter((field) => !state.mappings[field.key] || !runtimeHeaders.includes(state.mappings[field.key]));
  if (missing.length) return showToast(`Map all ${reportFields.length} fields before approval.`);
  const reviewer = document.getElementById("mappingReviewer")?.value.trim() || state.mappingReviewer;
  const otherReviewers = [state.obligationApproval?.reviewer, state.ruleApproval?.reviewer].filter(Boolean).map((value) => value.toLowerCase());
  if (otherReviewers.includes(reviewer.toLowerCase())) return showToast("Use a different reviewer role for the mapping approval.");
  state.mappingReviewer = reviewer;
  state.mappingApproval = { reviewer, time: timeLabel(), version: state.mappingVersion };
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast("Mapping approval recorded locally.");
}

function setMapping(key, value) {
  if (state.mappings[key] === value) return;
  archiveMappingProfile();
  state.mappingVersion = incrementVersion(state.mappingVersion);
  if (state.mappingApproval) {
    state.mappingApproval = null;
  }
  state.mappings[key] = value;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
}

function editMapping() {
  archiveMappingProfile();
  state.mappingApproval = null;
  state.mappingVersion = incrementVersion(state.mappingVersion);
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast("Mapping is now a draft. Review the source columns before approval.");
}

function runValidation() {
  if (!canRun()) return showToast("Complete the approval and change review gates first.");
  const results = executionResults();
  const conformance = conformanceCases().map((test) => {
    const actual = evaluateRecord(test.row).status;
    return { name: test.name, expected: test.expected, actual, pass: actual === test.expected };
  });
  const summary = {
    total: results.length,
    ready: results.filter((row) => row.status === "ready").length,
    exceptions: results.filter((row) => row.status === "exception").length,
    excluded: results.filter((row) => row.status === "excluded").length,
    conformance: conformance.filter((test) => test.pass).length,
    at: timeLabel(),
    runId: `RUN_${Date.now()}`
  };
  sessionRun = { results, summary, conformance: { passed: summary.conformance, total: conformance.length, cases: conformance }, runId: summary.runId, at: summary.at, inputText: runtimeCsvText };
  state.runSummary = summary;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  save();
  render();
  showToast(`${summary.total} records evaluated. ${summary.ready} ready for the report.`);
}

function parseCsv(text) {
  const matrix = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (char === '"' && quoted && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { row.push(cell); cell = ""; }
    else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && text[i + 1] === "\n") i += 1;
      row.push(cell); cell = "";
      if (row.some((value) => value.trim())) matrix.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some((value) => value.trim())) matrix.push(row);
  if (matrix.length < 2) throw new Error("CSV needs a header and at least one data row.");
  const headers = matrix[0].map((value) => value.trim());
  const rows = matrix.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, (values[index] || "").trim()])));
  return { headers, rows };
}

function importCsv(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const text = String(reader.result || "");
      const parsed = parseCsv(text);
      runtimeRows = parsed.rows;
      runtimeHeaders = parsed.headers;
      runtimeFileName = file.name;
      runtimeCsvText = text;
      const priorMappings = { ...state.mappings };
      const suggestedMappings = { ...state.mappings };
      for (const field of reportFields) if (parsed.headers.includes(field.source)) suggestedMappings[field.key] = field.source;
      if (JSON.stringify(priorMappings) !== JSON.stringify(suggestedMappings)) {
        archiveMappingProfile();
        state.mappings = suggestedMappings;
        state.mappingVersion = incrementVersion(state.mappingVersion);
        state.mappingApproval = null;
      }
      if (!mappingsValid()) state.mappingApproval = null;
      state.runSummary = null;
      state.evidenceManifest = null;
      state.evidenceVerification = null;
      sessionRun = null;
      save();
      render();
      showToast(`${parsed.rows.length} CSV records loaded into browser memory.`);
    } catch (error) {
      showToast(error.message || "Could not read this CSV file.");
    }
  };
  reader.onerror = () => showToast("Could not read this CSV file.");
  reader.readAsText(file);
}

function csvEscape(value) {
  const text = String(value ?? "");
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadText(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function nextBusinessDate(value) {
  const digits = dateDigits(value);
  if (digits.length !== 8) return "Not calculated";
  const date = new Date(Date.UTC(Number(digits.slice(0, 4)), Number(digits.slice(4, 6)) - 1, Number(digits.slice(6, 8))));
  do { date.setUTCDate(date.getUTCDate() + 1); } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);
  return `${date.getUTCFullYear()}/${String(date.getUTCMonth() + 1).padStart(2, "0")}/${String(date.getUTCDate()).padStart(2, "0")}`;
}

function currentReportRows() {
  return sessionRun?.results?.filter((result) => result.status === "ready").map((result) => ({
    report_type: "FMA_CORPORATE_BOND_LATE_TRADE",
    reporting_date: nextBusinessDate(result.record.trade_date),
    submission_deadline: `${nextBusinessDate(result.record.trade_date)} ${state.rule.deadline}`,
    transaction_id: result.record.transaction_id,
    instrument_id: result.record.instrument_id,
    execution_timestamp: result.record.execution_timestamp,
    counterparty_classification: result.record.counterparty_classification,
    notional_amount: result.record.notional_amount,
    price: result.record.price,
    reporting_entity_id: result.record.reporting_entity_id,
    submission_readiness: "READY"
  })) || [];
}

function exportReport(format) {
  const rows = currentReportRows();
  if (!rows.length) return showToast("Run validation again to rebuild the report rows.");
  if (format === "json") downloadText("fma_report_preview.json", JSON.stringify(rows, null, 2));
  else {
    const headers = Object.keys(rows[0]);
    const body = [headers.join(","), ...rows.map((row) => headers.map((key) => csvEscape(row[key])).join(","))].join("\n");
    downloadText("fma_report_preview.csv", body, "text/csv;charset=utf-8");
  }
  showToast(`${format.toUpperCase()} report saved to your downloads.`);
}

async function digest(text) {
  const bytes = new TextEncoder().encode(text);
  const result = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(result)].map((value) => value.toString(16).padStart(2, "0")).join("");
}

async function createEvidence() {
  if (!state.runSummary || !sessionRun) return showToast("Run validation again to assemble complete evidence.");
  const report = currentReportRows();
  const ruleText = JSON.stringify(state.rule, Object.keys(state.rule).sort());
  const mappingText = JSON.stringify(state.mappings, Object.keys(state.mappings).sort());
  const sourceHash = await digest(state.sourceText);
  const ruleHash = await digest(ruleText);
  const mappingHash = await digest(mappingText);
  const inputHash = await digest(sessionRun.inputText);
  const reportText = JSON.stringify(report);
  const reportHash = await digest(reportText);
  const manifest = {
    format: "Regulation as Code evidence manifest",
    formatVersion: "0.1",
    evidenceId: `EV_FMA_${Date.now()}`,
    createdAt: utcLabel(),
    example: "Fictional Market Authority corporate bond reporting",
    source: { document: "FMA Transaction Reporting Manual", section: "4.3.2 paragraph 2", version: state.sourceVersion, textDigest: sourceHash },
    obligation: { id: state.candidate?.id || state.rule.id, scope: state.candidate?.scope || "Reviewed sample obligation", approvedBy: state.obligationApproval?.reviewer, approvedAt: state.obligationApproval?.time },
    rule: { id: state.rule.id, name: state.rule.name, version: state.rule.version, approvedBy: state.ruleApproval?.reviewer, approvedAt: state.ruleApproval?.time, digest: ruleHash },
    mapping: { profile: "Generic reporting model", version: state.mappingVersion, approvedBy: state.mappingApproval?.reviewer, approvedAt: state.mappingApproval?.time, digest: mappingHash },
    execution: { runId: sessionRun.runId, executedAt: utcLabel(), inputRecordCount: state.runSummary.total, ready: state.runSummary.ready, exceptions: state.runSummary.exceptions, outOfScope: state.runSummary.excluded, inputDigest: inputHash },
    conformance: { passed: sessionRun.conformance.passed, total: sessionRun.conformance.total, cases: sessionRun.conformance.cases.map(({ name, expected, actual, pass }) => ({ name, expected, actual, pass })) },
    report: { format: "JSON preview", recordCount: report.length, digest: reportHash },
    hashes: { source: sourceHash, rule: ruleHash, mapping: mappingHash, input: inputHash, report: reportHash },
    integrityNote: "SHA 256 digests identify content changes. This file is not digitally signed and is not stored immutably."
  };
  manifest.hashes.manifest = await digest(JSON.stringify(manifest));
  state.evidenceManifest = manifest;
  state.evidenceVerification = null;
  save();
  render();
  showToast("Evidence manifest assembled. It contains hashes, not raw input data.");
}

async function verifyEvidence() {
  const manifest = state.evidenceManifest;
  if (!manifest) return;
  const ruleText = JSON.stringify(state.rule, Object.keys(state.rule).sort());
  const mappingText = JSON.stringify(state.mappings, Object.keys(state.mappings).sort());
  const checks = [
    (await digest(state.sourceText)) === manifest.hashes.source,
    (await digest(ruleText)) === manifest.hashes.rule,
    (await digest(mappingText)) === manifest.hashes.mapping
  ];
  const manifestCopy = JSON.parse(JSON.stringify(manifest));
  delete manifestCopy.hashes.manifest;
  checks.push((await digest(JSON.stringify(manifestCopy))) === manifest.hashes.manifest);
  if (sessionRun) {
    checks.push((await digest(sessionRun.inputText)) === manifest.hashes.input);
    checks.push((await digest(JSON.stringify(currentReportRows()))) === manifest.hashes.report);
  }
  state.evidenceVerification = checks.every(Boolean) ? sessionRun ? "valid" : "partial" : "changed";
  save();
  render();
  showToast(checks.every(Boolean) ? sessionRun ? "All available fingerprints match." : "Source, rule, mapping, and manifest fingerprints match." : "One or more artifacts changed after pack creation.");
}

function downloadEvidence() {
  if (!state.evidenceManifest || !sessionRun) return showToast("Run validation again to include the report in this evidence pack.");
  const pack = { ...state.evidenceManifest, reportOutput: currentReportRows() };
  downloadText(`${state.evidenceManifest.evidenceId}.json`, JSON.stringify(pack, null, 2));
  showToast("Evidence pack with report output saved to your downloads.");
}

function applySampleAmendment() {
  const revised = state.sourceText.replace(/by\s+09:00/i, "by 08:00");
  if (revised === state.sourceText) return showToast("The sample source no longer contains the 09:00 deadline.");
  state.previousSourceText = state.sourceText;
  const [major = 1, minor = 0] = state.sourceVersion.split(".").map(Number);
  state.sourceVersion = `${major}.${minor + 1}`;
  state.sourceText = revised;
  state.sourceHistory.push({ version: state.sourceVersion, text: revised, recordedAt: timeLabel() });
  state.sourceHistory = state.sourceHistory.slice(-12);
  state.changeReview = { status: "open", priorVersion: `${major}.${minor}`, newVersion: state.sourceVersion, openedAt: timeLabel(), reviewedAt: null };
  state.candidate = null;
  state.obligationApproval = null;
  state.ruleNeedsUpdate = true;
  state.runSummary = null;
  state.evidenceManifest = null;
  state.evidenceVerification = null;
  sessionRun = null;
  save();
  render();
  showToast("Sample amendment loaded. The approved rule was not changed.");
}

function reviewChange() {
  if (!state.changeReview) return;
  state.changeReview = { ...state.changeReview, status: "reviewed", reviewedAt: timeLabel(), reviewer: state.reviewer || "Demo reviewer" };
  save();
  render();
  showToast("Impact review recorded. A new rule version still needs approval.");
}

function resetDemo(skipConfirmation = false) {
  if (!skipConfirmation && !window.confirm("Reset the local demo state and return to the fictional sample?")) return;
  const exampleId = state.activeExample;
  localStorage.removeItem(storeKey);
  state = defaultState(exampleId);
  activeExample = getExample(exampleId);
  reportFields = activeExample.fields;
  sampleRows = activeExample.sampleRows;
  runtimeRows = sampleRows.map((row) => ({ ...row }));
  runtimeHeaders = Object.keys(sampleRows[0]);
  runtimeFileName = activeExample.csvFile;
  runtimeCsvText = exampleCsv(activeExample);
  sessionRun = null;
  render();
  showToast("Local demo state reset.");
}

function loadExample(exampleId) {
  activeExample = getExample(exampleId);
  reportFields = activeExample.fields;
  sampleRows = activeExample.sampleRows;
  state = defaultState(activeExample.id);
  state.view = "examples";
  runtimeRows = sampleRows.map((row) => ({ ...row }));
  runtimeHeaders = Object.keys(sampleRows[0]);
  runtimeFileName = activeExample.csvFile;
  runtimeCsvText = exampleCsv(activeExample);
  sessionRun = null;
  save();
}

function exportShared() {
  const bundle = {
    bundleType: "Regulation as Code shared artifact sample",
    version: "0.1",
    note: "Illustrative artifacts only. No standards conformance or regulatory approval is asserted.",
    obligation: state.candidate || draftFromSource(),
    rule: state.rule,
    mappings: reportFields.map((field) => ({ field: field.key, genericConcept: field.concept })),
    conformanceCases: conformanceCases().map(({ name, expected }) => ({ name, expected })),
    sampleRecords: sampleRows,
    example: { id: activeExample.id, name: activeExample.name, sourceLinks: activeExample.sourceLinks }
  };
  downloadText("shared_artifact_sample.json", JSON.stringify(bundle, null, 2));
  showToast("Sample shared artifact bundle downloaded.");
}

function goNextGate() {
  if (!state.candidate) return setStage("obligation");
  if (!state.obligationApproval) return setStage("obligation");
  if (!state.ruleApproval || state.ruleNeedsUpdate) return setStage("rule");
  if (!state.mappingApproval) return setStage("mapping");
  if (state.changeReview?.status === "open") return setView("changes");
}

document.addEventListener("click", (event) => {
  const viewButton = event.target.closest("[data-view]");
  if (viewButton) { setView(viewButton.dataset.view); return; }
  const stageButton = event.target.closest("[data-stage]");
  if (stageButton && !stageButton.disabled) { setStage(stageButton.dataset.stage); return; }
  const actionButton = event.target.closest("[data-action]");
  if (!actionButton || actionButton.disabled) return;
  if (actionButton.classList.contains("modalBackdrop") && event.target !== actionButton) return;
  const action = actionButton.dataset.action;
  if (action === "extract") extractObligation();
  else if (action === "saveSource") saveSourceRevision();
  else if (action === "approveObligation") {
    const input = document.getElementById("reviewerName");
    const reviewer = input?.value.trim() || state.reviewer;
    if (!reviewer) return showToast("Enter the reviewer role before approving.");
    setApproval("obligationApproval", reviewer);
  }
  else if (action === "saveRule") saveRuleDraft();
  else if (action === "editRule") editApprovedRule();
  else if (action === "draftRuleFromSource") draftRuleFromSource();
  else if (action === "approveRule") approveRule();
  else if (action === "approveMapping") approveMapping();
  else if (action === "editMapping") editMapping();
  else if (action === "run") runValidation();
  else if (action === "exportCsv") exportReport("csv");
  else if (action === "exportJson") exportReport("json");
  else if (action === "createEvidence") createEvidence();
  else if (action === "verifyEvidence") verifyEvidence();
  else if (action === "downloadEvidence") downloadEvidence();
  else if (action === "sampleAmendment") applySampleAmendment();
  else if (action === "reviewChange") reviewChange();
  else if (action === "extractUpdated") { state.stage = "obligation"; extractObligation(); }
  else if (action === "reset") resetDemo();
  else if (action === "exportShared") exportShared();
  else if (action === "help") { state.helpOpen = true; render(); }
  else if (action === "closeHelp") { state.helpOpen = false; render(); }
  else if (action === "goNextGate") goNextGate();
});

document.addEventListener("change", (event) => {
  if (event.target.matches("[data-map]")) setMapping(event.target.dataset.map, event.target.value);
  if (event.target.id === "csvInput" && event.target.files?.[0]) importCsv(event.target.files[0]);
});

document.addEventListener("input", (event) => {
  if (event.target.id === "reviewerName") state.reviewer = event.target.value;
  if (event.target.id === "ruleReviewer") state.ruleReviewer = event.target.value;
  if (event.target.id === "mappingReviewer") state.mappingReviewer = event.target.value;
});

render();

window.RaCStudio = {
  get state() { return state; },
  set state(value) { state = value; },
  get rows() { return runtimeRows; },
  get headers() { return runtimeHeaders; },
  get fileName() { return runtimeFileName; },
  get csvText() { return runtimeCsvText; },
  setRuntime(rows, headers, fileName, csvText) {
    runtimeRows = rows;
    runtimeHeaders = headers;
    runtimeFileName = fileName;
    runtimeCsvText = csvText;
  },
  get reportFields() { return reportFields; },
  get sampleRows() { return sampleRows; },
  get example() { return activeExample; },
  get examples() { return EXAMPLES; },
  get exampleCsv() { return runtimeCsvText; },
  loadExample,
  save,
  showToast,
  dateLabel,
  timeLabel,
  parseCsv,
  downloadText,
  csvEscape,
  incrementVersion,
  resetDemo
};
