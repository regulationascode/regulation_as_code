import { duplicateKey, evaluateProfile, rawFromValues, runConformance, suggestSourceMappings, withGeneratedFields } from "../core/validation.js";
import { exampleCsv } from "../core/examples.js";

const studio = window.RaCStudio;
const sourceMetaDefaults = { title: "Synthetic transaction reporting manual", authority: "Fictional Market Authority", jurisdiction: "Illustrative", domain: "Corporate bonds", sourceType: "Sample rule text", section: "4.3.2", paragraph: "2", effectiveDate: "2027-01-01" };
const ruleDefaults = { id: "FMA_CBOND_LATE_TRADE_001", name: "Next day reporting for late bond trades", cutoff: "16:00", deadline: "09:00", severity: "Blocking", effectiveDate: "2027-01-01", owner: "Reporting control owner", sourceReference: "Synthetic transaction reporting manual, section 4.3.2, paragraph 2", tests: "Conformance suite v0.1", dependencies: "Corporate bond scope fields and reporting field map", version: "1.0.0" };
const navItems = [
  { id: "overview", label: "Overview" },
  { id: "examples", label: "Examples and adoption" },
  { id: "pipeline", label: "Pipeline" },
  { id: "changes", label: "Change desk" },
  { id: "shared", label: "Shared library" },
  { id: "architecture", label: "Architecture" },
  { id: "governance", label: "Governance" },
  { id: "roadmap", label: "Roadmap" }
];
const stepItems = [
  { id: "source", label: "Source" },
  { id: "obligation", label: "Obligation" },
  { id: "rule", label: "Rule" },
  { id: "mapping", label: "Mapping" },
  { id: "validate", label: "Validate" },
  { id: "release", label: "Release" },
  { id: "report", label: "Report" },
  { id: "evidence", label: "Evidence" }
];
const standardHints = {
  transaction_id: "Trade identifier, generic",
  instrument_id: "Instrument reference, generic",
  execution_timestamp: "Execution event time, generic",
  counterparty_classification: "Party classification, generic",
  notional_amount: "Trade amount, generic",
  price: "Execution price, generic",
  reporting_entity_id: "Reporting party, generic",
  asset_class: "Product class, generic",
  execution_time_local: "Local event time, generic",
  trade_date: "Trade date, generic",
  submission_time_local: "Submission event time, generic"
};
const roadmapPhases = [
  { title: "Create an obligation taxonomy", detail: "Agree on source records, jurisdictions, products, and a shared obligation schema.", output: "Reviewed taxonomy and source registry" },
  { title: "Define the rule language", detail: "Choose a readable rule shape, domain, version policy, and initial reporting use case.", output: "Versioned rule format with examples" },
  { title: "Map common data", detail: "Select a domain model and document firm level mappings, owners, transformations, and data quality assumptions.", output: "Candidate common model profiles" },
  { title: "Build validation and conformance", detail: "Publish synthetic examples for valid, invalid, boundary, missing, late, excluded, and exception cases.", output: "Shared conformance suite" },
  { title: "Connect evidence and audit", detail: "Define report formats, evidence manifests, local retention, approvals, and verification controls.", output: "Auditable local execution pattern" },
  { title: "Set industry governance", detail: "Agree on neutral hosting, maintainers, contribution review, dissent records, and regulator engagement.", output: "Open governance charter and release policy" }
];
const riskRows = [
  ["Incorrect interpretation", "Require separate legal and compliance review, cited source lineage, and a recorded rationale."],
  ["Overreliance on automation", "Keep machine suggestions separate from approval and activation. Execute only reviewed, versioned rules."],
  ["Governance disputes", "Publish review roles, dissent records, escalation paths, and version decisions."],
  ["Data quality gaps", "Name field owners, transformations, assumptions, and conformance cases. Keep local exceptions visible."],
  ["Incomplete standards adoption", "Use explicit domain profiles and conformance evidence. Never infer conformance from a field name."],
  ["Liability and accountability", "Identify the responsible firm and reviewer for each local decision. Shared artifacts do not transfer legal duty."],
  ["Security and access", "Keep firm data local, restrict access in a production deployment, and define safe artifact handling."],
  ["Version fragmentation", "Use stable identifiers, release notes, compatibility rules, and a maintained deprecation policy."]
];
let helpOpen = false;
let resetConfirmOpen = false;
let toastMessage = "";
let toastTimerRefresh = null;

function s() { return studio.state; }
function esc(value) { return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
function countLabel(count, singular, plural) { return count + " " + (count === 1 ? singular : plural); }
function saveState() { studio.save(); }
function sourceDefaults() { return studio.example.sourceMeta || sourceMetaDefaults; }
function ruleDefaultsForExample() { return studio.example.rule || ruleDefaults; }
function invalidateRun() {
  s().runSummary = null;
  s().releaseApproval = null;
  s().evidenceManifest = null;
  s().evidenceVerification = null;
}
function plainBtn(label, action, kind, disabled, extra) {
  return '<button type="button" class="button ' + (kind || "secondary") + '" data-rac-action="' + esc(action) + '"' + (disabled ? " disabled" : "") + (extra || "") + '>' + label + '</button>';
}
function pill(label, tone) { return '<span class="pill ' + esc(tone || "plain") + '">' + esc(label) + '</span>'; }
function titleBlock(kicker, title, copy, right) {
  return '<header class="pageHead"><div><p class="eyebrow">' + esc(kicker) + '</p><h1>' + esc(title) + '</h1><p class="lede">' + esc(copy) + '</p></div>' + (right || "") + '</header>';
}
function panel(title, body, extra) {
  return '<section class="panel ' + (extra || "") + '"><div class="panelHead"><h2>' + esc(title) + '</h2></div>' + body + '</section>';
}
function field(label, id, value, type, attrs) {
  return '<label class="field"><span>' + esc(label) + '</span><input id="' + esc(id) + '" type="' + (type || "text") + '" value="' + esc(value) + '"' + (attrs || "") + '></label>';
}
function textArea(label, id, value, attrs) {
  return '<label class="field"><span>' + esc(label) + '</span><textarea id="' + esc(id) + '"' + (attrs || "") + '>' + esc(value) + '</textarea></label>';
}
function navStatus(id) {
  const st = s();
  if (id === "source") return "Saved";
  if (id === "obligation") return st.legalApproval && st.complianceApproval ? "Reviewed" : st.candidate ? "Review needed" : "Not drafted";
  if (id === "rule") return st.ruleApproval ? "Approved v" + st.rule.version : "Draft";
  if (id === "mapping") return st.mappingApproval ? "Approved" : "Review needed";
  if (id === "validate") return st.runSummary ? "Run complete" : "Not run";
  if (id === "release") return st.releaseApproval ? "Released v" + st.rule.version : "Not released";
  if (id === "report") return st.runSummary ? countLabel(st.runSummary.ready + st.runSummary.warning, "row", "rows") : "Not generated";
  if (id === "evidence") return st.evidenceManifest ? "Pack created" : "Not created";
  return "Not started";
}
function shell(content) {
  const st = s();
  const headings = { overview: "Overview", examples: "Examples and adoption", pipeline: "Pipeline", changes: "Change desk", shared: "Shared library", architecture: "Architecture", governance: "Governance", roadmap: "Roadmap" };
  const nav = navItems.map(function (item) {
    return '<button type="button" class="navLink ' + (st.view === item.id ? "current" : "") + '" data-rac-view="' + item.id + '"><span class="navGlyph">' + ({ overview: "01", examples: "02", pipeline: "03", changes: "04", shared: "05", architecture: "06", governance: "07", roadmap: "08" }[item.id]) + '</span><span>' + item.label + '</span>' + (item.id === "changes" && st.changeReview && st.changeReview.status === "open" ? '<i class="navAlert"></i>' : "") + '</button>';
  }).join("");
  document.getElementById("app").innerHTML =
    '<aside class="appRail"><a class="brand" href="#" data-rac-view="overview"><img class="brandMark" src="/assets/regulation_as_code_mark.svg" alt=""><span><strong>Regulation as Code</strong><small>Studio</small></span></a>' +
    '<div class="railCaption">WORKSPACE</div><nav class="railNav" aria-label="Main navigation">' + nav + '</nav>' +
    '<div class="railExample"><p class="railCaption">CURRENT EXAMPLE</p><strong>' + esc(studio.example.shortName) + '</strong><span>' + esc(studio.example.dataNote) + '</span><button data-rac-view="examples">Choose another example</button></div>' +
    '<div class="railBoundary"><strong>Local prototype</strong><p>Workflow state is saved in this browser. Imported rows stay in memory.</p></div>' +
    '<div class="railBottom"><span><i></i> Local workspace</span><button data-rac-action="reset">Reset demo</button></div></aside>' +
    '<div class="mainArea"><header class="topbar"><div><span class="crumb">REGULATION AS CODE STUDIO</span><strong>' + esc(headings[st.view] || "Workspace") + '</strong></div><div class="topControls"><span class="localBadge">LOCAL ONLY</span><button class="topReset" data-rac-action="reset" aria-label="Reset demo">Reset demo</button><button class="helpBtn" data-rac-action="help" aria-label="About this prototype">?</button></div></header><main id="mainContent" class="contentArea">' + content + '</main></div>' +
    (helpOpen ? renderHelp() : "") + (resetConfirmOpen ? renderResetConfirm() : "") + '<div class="toastProxy ' + (toastMessage ? "show" : "") + '" role="status">' + esc(toastMessage) + '</div>';
  document.title = (headings[st.view] || "Workspace") + " | Regulation as Code Studio";
}
function statusForStep(id) {
  const st = s();
  const done = {
    source: true,
    obligation: Boolean(st.legalApproval && st.complianceApproval),
    rule: Boolean(st.ruleApproval),
    mapping: Boolean(st.mappingApproval),
    validate: Boolean(st.runSummary && st.runSummary.conformance === st.runSummary.conformanceTotal),
    release: Boolean(st.releaseApproval),
    report: Boolean(st.runSummary && st.releaseApproval),
    evidence: Boolean(st.evidenceManifest)
  };
  return done[id] ? "done" : (id === st.stage ? "active" : "");
}
function stepRail() {
  return '<nav class="stepRail" aria-label="Reporting pipeline">' + stepItems.map(function (step, index) {
    return '<button type="button" class="stepLink ' + statusForStep(step.id) + '" data-rac-step="' + step.id + '"><span class="stepCount">' + (index + 1) + '</span><span><strong>' + step.label + '</strong><small>' + esc(navStatus(step.id)) + '</small></span></button>';
  }).join("") + '</nav>';
}
function pipelinePage() {
  const st = s();
  const page = {
    source: renderSourcePage,
    obligation: renderObligationPage,
    rule: renderRulePage,
    mapping: renderMappingPage,
    validate: renderValidatePage,
    release: renderReleasePage,
    report: renderReportPage,
    evidence: renderEvidencePage
  };
  return titleBlock(studio.example.name.toUpperCase(), "Reporting pipeline", "Follow this example from source and human review through local validation, report preview, and evidence.", pill(st.ruleApproval ? "Rule approved" : "Draft workflow", st.ruleApproval ? "good" : "review")) +
    stepRail() + '<section class="stepPanel">' + (page[st.stage] || renderSourcePage)() + '</section>' +
    '<footer class="pageFoot"><span>' + esc(studio.example.dataNote) + '</span><span>No identity service or filing destination is connected</span><button data-rac-action="help">Prototype limits</button></footer>';
}
function fieldPills(items) { return '<div class="tokenList">' + items.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join("") + '</div>'; }
function overviewPage() {
  const st = s();
  const next = nextStep();
  const readyCount = [st.legalApproval && st.complianceApproval, st.ruleApproval, st.mappingApproval, st.runSummary, st.releaseApproval, st.evidenceManifest].filter(Boolean).length;
  const run = st.runSummary;
  const stepCards = stepItems.map(function (item, index) {
    return '<button type="button" class="overviewStep ' + statusForStep(item.id) + '" data-rac-step="' + item.id + '"><span>' + String(index + 1).padStart(2, "0") + '</span><strong>' + item.label + '</strong><small>' + esc(navStatus(item.id)) + '</small></button>';
  }).join("");
  return '<section class="overviewHero"><div><p class="eyebrow">OPEN, EXECUTABLE, AUDITABLE REPORTING</p><h1>Make the reporting path visible.</h1><p class="lede">' + esc(studio.example.description) + '</p><div class="heroMeta"><span>' + esc(studio.example.name) + '</span><span>Rule v' + esc(st.rule.version) + '</span><span>Source v' + esc(st.sourceVersion) + '</span></div></div><aside class="nextAction"><p class="eyebrow">NEXT STEP</p><h2>' + esc(next.title) + '</h2><p>' + esc(next.copy) + '</p><button class="button primary" data-rac-step="' + next.step + '">Continue to ' + esc(stepItems.find(function (x) { return x.id === next.step; }).label) + ' <span aria-hidden="true">→</span></button><small>Progress ' + readyCount + ' of 6 control points</small></aside></section>' +
    '<section class="overviewSummary"><div><span class="summaryLabel">LATEST RUN</span><strong>' + (run ? countLabel(run.ready + run.warning, "reportable row", "reportable rows") : "Not run") + '</strong><small>' + (run ? run.exceptions + " exceptions, " + run.warning + " warnings, " + run.excluded + " excluded" : "Synthetic sample is loaded locally") + '</small></div><div><span class="summaryLabel">RELEASE</span><strong>' + (st.releaseApproval ? "Approved" : "Waiting") + '</strong><small>' + (st.releaseApproval ? "Version " + esc(st.releaseApproval.version) + " by " + esc(st.releaseApproval.reviewer) : "Independent control approval is required") + '</small></div><div><span class="summaryLabel">SOURCE CHANGE</span><strong>' + (st.changeReview ? (st.changeReview.status === "resolved" ? "Resolved" : st.changeReview.status === "reviewed" ? "Review recorded" : "Review needed") : "No change") + '</strong><small>' + (st.changeReview ? "Version " + esc(st.changeReview.newVersion) + " has an impact record" : "No live source monitor is connected") + '</small></div></section>' +
    panel("Reporting lifecycle", '<p class="sectionCopy">Each stage leaves a reviewable artifact. Approval and release are separate actions.</p><div class="overviewSteps">' + stepCards + '</div>') +
    '<section class="twoPanels">' + panel("Why shared infrastructure", '<p>Firms often repeat source interpretation, field mapping, validation, and evidence work for the same obligation. Shared schemas, reviewed rule shapes, and conformance examples can make that work reusable while local execution keeps firm data under firm control.</p><div class="benefitList"><span>Less duplicated rule and test work</span><span>More consistent mappings and outputs</span><span>Clearer change impact and audit trail</span></div>') +
    panel("How this helps a bank", '<p>' + esc(studio.example.bankValue) + '</p><div class="benefitList"><span>Start from a complete example</span><span>Keep institution data and mappings private</span><span>Find and review exceptions before release</span></div><p class="smallNote">These are workflow benefits to validate in a bank pilot. No cost saving or compliance outcome is measured here.</p>') + '</section>';
}
function nextStep() {
  const st = s();
  if (!st.candidate || !st.legalApproval || !st.complianceApproval) return { title: st.candidate ? "Complete the interpretation review" : "Draft the obligation", copy: "Read the source passage and record separate legal and compliance decisions.", step: "obligation" };
  if (!st.ruleApproval) return { title: "Approve the rule version", copy: "Confirm trigger, scope, fields, checks, owner, and dependencies.", step: "rule" };
  if (!st.mappingApproval) return { title: "Review the data mapping", copy: "Connect each reporting field to its local source and document its owner.", step: "mapping" };
  if (!st.runSummary) return { title: "Run the conformance suite", copy: "Evaluate the synthetic rows and golden cases with deterministic checks.", step: "validate" };
  if (!st.releaseApproval) return { title: "Record release approval", copy: "An independent control owner reviews the approved artifacts and passing tests.", step: "release" };
  if (!st.evidenceManifest) return { title: "Create the evidence pack", copy: "Capture source lineage, approvals, tests, run outcomes, report, and fingerprints.", step: "evidence" };
  return { title: "Review the change path", copy: "Explore how a source revision creates an impact review without changing the rule.", step: "changes" };
}
function sourcePageIntro() {
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 1 OF 8 · SOURCE</span><h2>Record the source and its lineage</h2><p>Review the source context and the sample text before drafting an obligation.</p></div>' + pill("Version " + s().sourceVersion, "plain") + '</div>';
}
function renderSourcePage() {
  const st = s();
  const m = Object.assign({}, sourceDefaults(), st.sourceMeta || {});
  const history = (st.sourceHistory || []).slice().reverse().map(function (item) {
    return '<li><span>Version ' + esc(item.version) + '</span><small>' + esc(item.recordedAt) + '</small></li>';
  }).join("");
  return sourcePageIntro() + '<div class="sourceLayout"><section class="sourceMain">' +
    '<div class="formGrid three">' + field("Source title", "sourceTitle", m.title) + field("Issuing body", "sourceAuthority", m.authority) + field("Jurisdiction", "sourceJurisdiction", m.jurisdiction) +
    field("Domain", "sourceDomain", m.domain) + field("Source type", "sourceType", m.sourceType) + field("Effective date", "sourceEffectiveDate", m.effectiveDate, "date") +
    field("Section", "sourceSection", m.section) + field("Paragraph", "sourceParagraph", m.paragraph) + '</div>' +
    textArea("Exact source passage", "sourceTextNew", st.sourceText, ' rows="8"') +
    '<div class="sourceNote"><strong>' + (studio.example.sourceLinks.length ? "Illustrative control summary" : "Synthetic source") + '</strong><span>' + esc(studio.example.dataNote) + ' Editing the text creates a local revision and opens a change review.</span></div>' +
    '<div class="actionRow">' + plainBtn("Save source revision", "saveSource", "primary") + plainBtn("Draft obligation from this passage", "draftObligation", "secondary") + '</div></section>' +
    '<aside class="lineagePanel"><p class="eyebrow">SOURCE LINEAGE</p><h3>' + esc(m.authority) + '</h3><p>' + esc(m.title) + '</p><dl><div><dt>Reference</dt><dd>' + esc(studio.example.sourceReference) + '</dd></div><div><dt>Effective</dt><dd>' + esc(m.effectiveDate) + '</dd></div><div><dt>Saved versions</dt><dd>' + ((st.sourceHistory || []).length) + '</dd></div></dl>' + (studio.example.sourceLinks.length ? '<h4>Official source links</h4><ul class="historyList sourceRefs">' + studio.example.sourceLinks.map(function (link) { return '<li><a href="' + esc(link.url) + '" target="_blank" rel="noreferrer">' + esc(link.label) + '</a><small>' + esc(link.description) + '</small></li>'; }).join("") + '</ul>' : '') + '<h4>Version history</h4><ul class="historyList">' + history + '</ul><p class="smallNote">Source monitoring is manual. No official source is being scraped.</p></aside></div>';
}
function reviewBox(role, label, approval, reviewer, rationale) {
  const title = role === "legal" ? "Confirm the interpretation" : "Confirm reporting scope";
  const name = role === "legal" ? "Legal reviewer role" : "Compliance reviewer role";
  const rationaleLabel = role === "legal" ? "Legal rationale" : "Compliance rationale";
  const id = role === "legal" ? "legalReviewer" : "complianceReviewer";
  const noteId = role === "legal" ? "legalRationaleNew" : "complianceRationaleNew";
  return '<article class="reviewBox"><p class="eyebrow">' + label + '</p><h3>' + (approval ? "Decision recorded" : title) + '</h3>' +
    (approval ? '<p>Role: ' + esc(approval.reviewer) + '<br>Recorded: ' + esc(approval.time) + '</p><blockquote>' + esc(approval.rationale) + '</blockquote>' : field(name, id, reviewer) + textArea(rationaleLabel, noteId, rationale, ' rows="3"')) +
    plainBtn(approval ? label + " recorded" : "Approve " + role + " interpretation", role === "legal" ? "approveLegal" : "approveCompliance", approval ? "secondary" : "primary", Boolean(approval)) + '</article>';
}
function missingCandidateFields(candidate) {
  const required = studio.example.requiredFields;
  const found = candidate && Array.isArray(candidate.requiredFields) ? candidate.requiredFields : [];
  return required.filter(function (key) { return !found.includes(key); });
}
function renderObligationPage() {
  const st = s();
  const c = st.candidate;
  if (!c) return '<div class="stepIntro"><div><span class="stepOverline">STEP 2 OF 8 · OBLIGATION</span><h2>Extract a candidate for review</h2><p>A small parser identifies sample times, product scope, and fields. It does not make legal decisions.</p></div></div><div class="emptyPanel"><h3>No candidate yet</h3><p>Draft an obligation from the exact source passage. A reviewer must check every extracted value.</p>' + plainBtn("Draft obligation", "draftObligation", "primary") + '</div>';
  const missingFields = missingCandidateFields(c);
  const missingFieldLabels = missingFields.map(function (key) { const field = studio.reportFields.find(function (f) { return f.key === key; }); return field ? field.label : key; });
  const approvals = '<section class="reviewGrid">' +
    reviewBox("legal", "LEGAL REVIEW", st.legalApproval, st.legalReviewer || "Demo legal reviewer", st.legalRationale || "Reviewed the cited material, scope, fields, and effective date for this sample.") +
    reviewBox("compliance", "COMPLIANCE REVIEW", st.complianceApproval, st.complianceReviewer || "Demo compliance reviewer", st.complianceRationale || "Confirmed the sample reporting scope and operational fields.") + '</section>';
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 2 OF 8 · OBLIGATION</span><h2>Review the obligation candidate</h2><p>Source text and extracted fields remain side by side so reviewers can challenge the interpretation.</p></div>' + pill(st.legalApproval && st.complianceApproval ? "Both reviews recorded" : "Awaiting two reviews", st.legalApproval && st.complianceApproval ? "good" : "review") + '</div>' +
    '<div class="obligationLayout"><section class="obligationCard"><div class="cardTopline"><span>OBLIGATION CANDIDATE</span><code>' + esc(c.id) + '</code></div><h3>' + esc(c.name || st.rule.name) + '</h3><dl class="factGrid"><div><dt>Scope</dt><dd>' + esc(c.scope) + '</dd></div><div><dt>Trigger</dt><dd>' + esc(c.trigger) + '</dd></div><div><dt>Reporting window</dt><dd>' + esc(c.reportingWindow) + '</dd></div><div><dt>Severity</dt><dd>' + esc(c.severity || st.rule.severity) + '</dd></div><div><dt>Effective date</dt><dd>' + esc(c.effectiveDate || st.rule.effectiveDate) + '</dd></div><div><dt>Source</dt><dd>Version ' + esc(st.sourceVersion) + ', ' + esc((st.sourceMeta || sourceDefaults()).section) + ', ' + esc((st.sourceMeta || sourceDefaults()).paragraph) + '</dd></div></dl><h4>Required fields</h4>' + fieldPills((c.requiredFields || []).map(function (key) { const f = studio.reportFields.find(function (x) { return x.key === key; }); return f ? f.label : key; })) + (missingFields.length ? '<div class="notice warning"><strong>Source fields need attention.</strong> Not found in this sample passage: ' + esc(missingFieldLabels.join(", ")) + '. Update the source and draft again before review.</div>' : '') + '<h4>Sample source text</h4><blockquote>' + esc(st.sourceText) + '</blockquote><div class="sourceNote"><strong>Extraction method</strong><span>Local pattern matching only. A person must review the candidate against the cited source.</span></div></section>' +
    '<aside class="interpretationPanel"><p class="eyebrow">REVIEW RECORD</p><p>Both roles must review this candidate. A local entry is a demo record, not a verified identity or legal approval.</p><div class="reviewState"><span>Legal review</span>' + pill(st.legalApproval ? "Recorded" : "Required", st.legalApproval ? "good" : "review") + '</div><div class="reviewState"><span>Compliance review</span>' + pill(st.complianceApproval ? "Recorded" : "Required", st.complianceApproval ? "good" : "review") + '</div>' + plainBtn("Redraft from current source", "draftObligation", "secondary") + '</aside></div>' + approvals +
    '<div class="stepActions"><button class="button secondary" data-rac-step="source">Back to source</button><button class="button primary" data-rac-step="rule"' + (st.legalApproval && st.complianceApproval ? "" : " disabled") + '>Continue to rule</button></div>';
}
function renderRulePage() {
  const st = s();
  const profile = studio.example;
  const r = Object.assign({}, ruleDefaultsForExample(), st.rule || {});
  const settings = Object.assign({}, profile.rule.settings || {}, r.settings || {});
  const parameterInputs = profile.parameters.map(function (parameter) {
    const attrs = parameter.min !== undefined ? ' min="' + esc(parameter.min) + '" step="' + esc(parameter.step || "1") + '"' : "";
    const value = settings[parameter.key] == null ? (r[parameter.key] == null ? parameter.defaultValue || "" : r[parameter.key]) : settings[parameter.key];
    return field(parameter.label, "ruleParam_" + parameter.key, value, parameter.type || "text", attrs);
  }).join("");
  const logic = profile.logic.replace(/\{\{([^}]+)\}\}/g, function (_, key) { return settings[key] == null ? r[key] || "" : settings[key]; });
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 3 OF 8 · RULE</span><h2>Define an executable rule</h2><p>The validator uses fixed conditions and values. Every edit creates a draft version that needs approval.</p></div>' + pill(st.ruleApproval ? "Approved v" + r.version : "Draft v" + r.version, st.ruleApproval ? "good" : "review") + '</div>' +
    (st.ruleNeedsUpdate ? '<div class="notice warning"><strong>Source review is required.</strong> Complete the impact review, then draft a new obligation and rule version.</div>' : "") +
    '<div class="ruleLayout"><section class="ruleEditor">' +
    '<div class="formGrid two">' + field("Rule identifier", "ruleIdNew", r.id) + field("Rule name", "ruleNameNew", r.name) + parameterInputs + field("Severity", "ruleSeverityNew", r.severity) + field("Effective date", "ruleEffectiveNew", r.effectiveDate, "date") + field("Rule owner", "ruleOwnerNew", r.owner) + field("Source reference", "ruleSourceReferenceNew", r.sourceReference) + field("Conformance tests", "ruleTestsNew", r.tests, "text", " disabled") + field("Dependencies", "ruleDependenciesNew", r.dependencies) + '</div>' +
    '<div class="logicBlock"><div class="logicHeading"><strong>Deterministic rule shape</strong><span>Rule version ' + esc(r.version) + '</span></div><pre>' + esc(logic) + '</pre></div>' +
    '<p class="smallNote">This is an illustrative rule profile, not an approved regulator rule, an official validation suite, or a filing specification. Confirm the source version and applicability before use.</p>' +
    '<div class="actionRow">' + plainBtn("Save draft version", "saveRule", "secondary", false) + plainBtn(st.ruleApproval ? "Create new draft from approved rule" : "Approve rule", st.ruleApproval ? "editRule" : "approveRule", st.ruleApproval ? "secondary" : "primary", !st.ruleApproval && !(st.legalApproval && st.complianceApproval && st.candidate)) + '</div></section>' +
    '<aside class="ruleSide"><p class="eyebrow">VERSION HISTORY</p><h3>Rule ' + esc(r.version) + '</h3><p>' + (st.ruleApproval ? "Approved by " + esc(st.ruleApproval.reviewer) + " at " + esc(st.ruleApproval.time) : "Draft. No execution is allowed until an independent approval is recorded.") + '</p><label class="field"><span>Rule approver role</span><input id="ruleReviewerNew" value="' + esc(st.ruleReviewer || "Demo control reviewer") + '"></label><p class="smallNote">Rule approval must be separate from legal, compliance, data steward, and release review.</p>' + ((st.ruleHistory || []).length ? '<h4>Prior versions</h4><ul class="historyList">' + st.ruleHistory.slice().reverse().map(function (x) { return '<li><span>Version ' + esc(x.version) + '</span><small>' + esc(x.status || "Draft") + '</small></li>'; }).join("") + '</ul>' : '<p class="smallNote">No prior versions recorded.</p>') + '</aside></div>' +
    '<div class="stepActions"><button class="button secondary" data-rac-step="obligation">Back to obligation</button><button class="button primary" data-rac-step="mapping"' + (st.ruleApproval ? "" : " disabled") + '>Continue to mapping</button></div>';
}
function renderMappingPage() {
  const st = s();
  const sourceUse = {};
  studio.reportFields.forEach(function (f) { if (st.mappings[f.key]) sourceUse[st.mappings[f.key]] = (sourceUse[st.mappings[f.key]] || 0) + 1; });
  const duplicateSources = Object.keys(sourceUse).filter(function (key) { return sourceUse[key] > 1; });
  const rows = studio.reportFields.map(function (f) {
    const meta = Object.assign({ system: f.generated ? "Generated locally" : "Local sample file", owner: "Data steward", transform: f.generated ? "Assigned by row order during import" : "Direct field copy", quality: f.scope ? "Used for scope or control only" : "Present and valid" }, (st.mappingMeta || {})[f.key] || {});
    const sourceOptions = Array.from(new Set(["", ...studio.headers, st.mappings[f.key] || ""])).filter(function (x) { return x !== undefined; }).map(function (x) { return '<option value="' + esc(x) + '"' + (x === st.mappings[f.key] ? " selected" : "") + '>' + esc(x || "Choose local source column") + '</option>'; }).join("");
    return '<tr><th scope="row"><code>' + esc(f.key) + '</code><small>' + esc(f.label) + (f.generated ? " · generated during import" : f.scope ? " · scope input" : " · report field") + '</small></th><td>' + esc(f.concept) + '</td><td><span class="standardHint">' + esc(f.reference || standardHints[f.key] || "Generic model") + '</span></td><td><select data-rac-map="' + esc(f.key) + '" aria-label="Local source column for ' + esc(f.label) + '">' + sourceOptions + '</select></td><td><input data-rac-map-meta="' + esc(f.key) + '|system" aria-label="System of record for ' + esc(f.label) + '" value="' + esc(meta.system) + '"><input data-rac-map-meta="' + esc(f.key) + '|owner" aria-label="Data owner for ' + esc(f.label) + '" value="' + esc(meta.owner) + '"></td><td><input data-rac-map-meta="' + esc(f.key) + '|transform" aria-label="Transformation note for ' + esc(f.label) + '" value="' + esc(meta.transform) + '"><input data-rac-map-meta="' + esc(f.key) + '|quality" aria-label="Quality assumption for ' + esc(f.label) + '" value="' + esc(meta.quality) + '"></td></tr>';
  }).join("");
  const count = studio.reportFields.filter(function (f) { return st.mappings[f.key] && studio.headers.includes(st.mappings[f.key]); }).length;
  const duplicateNames = duplicateSources.map(function (key) { return studio.reportFields.filter(function (f) { return st.mappings[f.key] === key; }).map(function (f) { return f.label; }).join(" and "); });
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 4 OF 8 · MAPPING</span><h2>Map reporting fields to local data</h2><p>Connect every field to a local column, source system, owner, and documented quality assumption.</p></div>' + pill(count + " of " + studio.reportFields.length + " fields mapped", st.mappingApproval && !duplicateSources.length ? "good" : "review") + '</div>' +
    '<div class="mappingTools"><div><strong>' + esc(studio.example.name) + ' field profile</strong><small>References point to public materials where available. They do not claim conformance.</small></div><label class="button secondary filePick">Choose CSV on this device<input id="csvInputNew" type="file" accept=".csv,text/csv"></label></div>' +
    (duplicateSources.length ? '<div class="notice warning"><strong>Resolve repeated source columns.</strong> These direct links use one column more than once: ' + duplicateNames.map(esc).join("; ") + '.</div>' : '<div class="smallNote">Transformation and quality entries are documentation only. This sample runs direct field copies and fixed checks.</div>') +
    '<div class="tableScroll"><table class="mappingTableNew"><thead><tr><th>Reporting field</th><th>Common concept</th><th>Possible reference</th><th>Local source column</th><th>System and owner</th><th>Transform note and quality</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
    '<div class="mappingMetaFoot"><span>Current data: ' + esc(studio.fileName) + ' · ' + studio.rows.length + ' rows</span><span>Imported rows stay in browser memory.</span></div>' +
    '<div class="notice neutral"><strong>Domain specific mapping is required.</strong> FINOS CDM, ISDA DRR, XBRL, ISO 20022, and internal catalogs are possible connections only where the reporting domain and authority format support them.</div>' +
    '<div class="approvalStrip"><div><p class="eyebrow">DATA STEWARDSHIP REVIEW</p><strong>' + (st.mappingApproval ? "Approved by " + esc(st.mappingApproval.reviewer) : "The data steward owns this profile") + '</strong><small>' + (st.mappingApproval ? esc(st.mappingApproval.time) : "The mapping reviewer cannot approve the release.") + '</small></div>' + (st.mappingApproval ? plainBtn("Edit mapping profile", "editMapping", "secondary") : '<div class="approvalAction">' + field("Mapping reviewer role", "mappingReviewerNew", st.mappingReviewer || "Demo data steward") + plainBtn("Approve mapping", "approveMapping", "primary", count !== studio.reportFields.length || duplicateSources.length > 0) + '</div>') + '</div>' +
    '<div class="stepActions"><button class="button secondary" data-rac-step="rule">Back to rule</button><button class="button primary" data-rac-step="validate"' + (st.mappingApproval ? "" : " disabled") + '>Continue to validation</button></div>';
}
function evaluate(raw) { return evaluateProfile(studio.example, raw, s().mappings, s().rule); }
function caseRow(values) { return rawFromValues(studio.example, values, s().mappings); }
function goldenCases() {
  return studio.example.cases.map(function (test) {
    return { name: test.name, expected: test.expected, row: caseRow(test.values) };
  });
}
function approvalsComplete() {
  const st = s();
  return Boolean(st.candidate && st.legalApproval && st.complianceApproval && st.ruleApproval && st.mappingApproval && !st.ruleNeedsUpdate && (!st.changeReview || st.changeReview.status === "resolved"));
}
function runNow() {
  if (!approvalsComplete()) return toast("Complete all reviews and source change checks before running.");
  const rows = studio.rows.map(evaluate);
  const identifierCounts = {};
  rows.forEach(function (result) {
    const id = duplicateKey(studio.example, result.record);
    if (id && result.status !== "excluded") identifierCounts[id] = (identifierCounts[id] || 0) + 1;
  });
  rows.forEach(function (result) {
    const id = duplicateKey(studio.example, result.record);
    if (id && result.status !== "excluded" && identifierCounts[id] > 1) {
      result.status = "exception";
      result.issues.push("The configured record key is repeated in the input");
    }
  });
  const cases = runConformance(studio.example, s().mappings, s().rule);
  const summary = {
    total: rows.length,
    ready: rows.filter(function (x) { return x.status === "ready"; }).length,
    warning: rows.filter(function (x) { return x.status === "warning"; }).length,
    exceptions: rows.filter(function (x) { return x.status === "exception"; }).length,
    excluded: rows.filter(function (x) { return x.status === "excluded"; }).length,
    conformance: cases.filter(function (x) { return x.pass; }).length,
    conformanceTotal: cases.length,
    at: studio.timeLabel(),
    runId: "RUN_" + Date.now()
  };
  s().runSummary = summary;
  s().releaseApproval = null;
  s().evidenceManifest = null;
  s().evidenceVerification = null;
  s().exceptionReviews = {};
  window.sessionRunRaC = { results: rows, conformance: cases, inputText: studio.csvText, runId: summary.runId, at: summary.at };
  saveState();
  s().stage = "validate";
  renderApp();
  toast(countLabel(summary.total, "record", "records") + " checked. " + countLabel(summary.ready, "record is ready", "records are ready") + " for the report.");
}
function toast(message) {
  toastMessage = message;
  clearTimeout(toastTimerRefresh);
  toastTimerRefresh = setTimeout(function () { toastMessage = ""; renderToast(); }, 3200);
  renderToast();
}
function renderToast() {
  const node = document.querySelector(".toastProxy");
  if (!node) return;
  node.textContent = toastMessage;
  node.classList.toggle("show", Boolean(toastMessage));
}
function statusLabel(status) {
  return status === "ready" ? pill("Ready", "good") : status === "warning" ? pill("Warning", "review") : status === "excluded" ? pill("Out of scope", "plain") : pill("Exception", "bad");
}
function digitsDate(value) { return String(value || "").replace(/\D/g, "").slice(0, 8); }
function shortDate(value) {
  const d = digitsDate(value);
  return d.length === 8 ? d.slice(0, 4) + "/" + d.slice(4, 6) + "/" + d.slice(6, 8) : "Not calculated";
}
function nextBusinessDate(value) {
  const d = digitsDate(value);
  if (d.length !== 8) return "Not calculated";
  const day = new Date(Date.UTC(Number(d.slice(0, 4)), Number(d.slice(4, 6)) - 1, Number(d.slice(6, 8))));
  do { day.setUTCDate(day.getUTCDate() + 1); } while (day.getUTCDay() === 0 || day.getUTCDay() === 6);
  return day.getUTCFullYear() + "/" + String(day.getUTCMonth() + 1).padStart(2, "0") + "/" + String(day.getUTCDate()).padStart(2, "0");
}
function currentResults() {
  return window.sessionRunRaC ? window.sessionRunRaC.results : [];
}
function conformanceResults() {
  return window.sessionRunRaC ? window.sessionRunRaC.conformance : [];
}
function resultRecordKey(record, index) {
  return duplicateKey(studio.example, record) || String(record[studio.example.tableFields[0]] || "Record " + (index + 1));
}
function renderValidatePage() {
  const st = s();
  const canRun = approvalsComplete();
  const run = st.runSummary;
  const results = currentResults();
  const cases = conformanceResults();
  const tableFields = studio.example.tableFields.map(function (key) { return studio.reportFields.find(function (field) { return field.key === key; }); }).filter(Boolean);
  const rowHtml = run ? results.map(function (result, index) {
    const id = resultRecordKey(result.record, index);
    const reviewed = st.exceptionReviews && st.exceptionReviews[id];
    return '<tr>' + tableFields.map(function (field) { return '<td>' + (field.key === studio.example.tableFields[0] ? '<code>' + esc(result.record[field.key] || id) + '</code>' : esc(result.record[field.key] || "Not provided")) + '</td>'; }).join("") + '<td>' + statusLabel(result.status) + '</td><td>' + esc(result.issues.join("; ") || (result.status === "excluded" ? "Outside the configured scope" : "All checks passed")) + (result.status === "exception" ? '<div class="rowAction">' + (reviewed ? '<div><span class="reviewedTag">Reviewed by ' + esc(reviewed.reviewer) + '</span> <small>Note: ' + esc(reviewed.rationale) + '</small></div>' : '<label class="field"><span>Exception review note</span><textarea data-rac-exception-note="' + esc(id) + '" aria-label="Review note for exception ' + esc(id) + '" rows="2"></textarea></label><button data-rac-action="reviewException" data-record="' + esc(id) + '">Record review</button>') + '</div>' : "") + '</td></tr>';
  }).join("") : "";
  const caseHtml = cases.map(function (test) {
    return '<tr><td>' + esc(test.name) + '</td><td>' + esc(test.expected) + '</td><td>' + esc(test.actual) + '</td><td>' + pill(test.pass ? "Passed" : "Failed", test.pass ? "good" : "bad") + '</td></tr>';
  }).join("");
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 5 OF 8 · VALIDATE</span><h2>Run deterministic checks</h2><p>' + esc(studio.example.description) + ' The rule runs locally against the selected rows and conformance cases.</p></div>' + pill(run ? "Run " + run.runId : canRun ? "Ready to run" : "Approvals needed", run ? "good" : canRun ? "plain" : "review") + '</div>' +
    (!canRun ? '<div class="notice warning"><strong>Execution is gated.</strong> Complete the two obligation reviews, rule approval, mapping approval, and any open source change review.</div>' : "") +
    '<div class="validationToolbar"><div><strong>Input data</strong><span>' + esc(studio.fileName) + ' · ' + studio.rows.length + ' rows · kept in browser memory</span></div><label class="button secondary filePick">Choose CSV<input id="csvInputNew" type="file" accept=".csv,text/csv"></label>' + field("Exception reviewer role", "exceptionReviewerNew", st.exceptionReviewer || "Demo reporting control reviewer") + plainBtn("Run checks", "runValidation", "primary", !canRun) + '</div>' +
    (run ? '<section class="resultSummary"><div><strong>' + run.total + '</strong><span>Records checked</span></div><div><strong class="greenText">' + run.ready + '</strong><span>Ready</span></div><div><strong class="amberText">' + run.warning + '</strong><span>Warnings</span></div><div><strong class="redText">' + run.exceptions + '</strong><span>Exceptions</span></div><div><strong>' + run.excluded + '</strong><span>Out of scope</span></div></section>' : "") +
    (run ? '<div class="tableScroll"><table class="dataTable"><thead><tr>' + tableFields.map(function (field) { return '<th>' + esc(field.label) + '</th>'; }).join("") + '<th>Result</th><th>Details and review</th></tr></thead><tbody>' + rowHtml + '</tbody></table></div>' : '<div class="emptyPanel"><h3>Validation has not run</h3><p>The rule cannot run until both reviewers, the rule owner, and the data steward have recorded approval.</p></div>') +
    (run ? '<section class="panel conformancePanel"><div class="panelHead"><div><h2>Golden conformance cases</h2><p>' + run.conformance + ' of ' + run.conformanceTotal + ' cases passed. Any failed case blocks release.</p></div>' + pill(run.conformance === run.conformanceTotal ? "All cases pass" : "Release blocked", run.conformance === run.conformanceTotal ? "good" : "bad") + '</div><div class="tableScroll"><table class="dataTable"><thead><tr><th>Case</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead><tbody>' + caseHtml + '</tbody></table></div></section>' : "") +
    '<div class="smallNote">' + esc(studio.example.dataNote) + ' Confirm every rule against the current source, reporting period, and institution policy before production use.</div>' +
    '<div class="stepActions"><button class="button secondary" data-rac-step="mapping">Back to mapping</button><button class="button primary" data-rac-step="release"' + (run && run.conformance === run.conformanceTotal ? "" : " disabled") + '>Review release gates</button></div>';
}
function releaseGates() {
  const st = s();
  const result = st.runSummary;
  const exceptionResults = currentResults().filter(function (x) { return x.status === "exception"; });
  const reviewedExceptions = exceptionResults.filter(function (x, index) { return st.exceptionReviews && st.exceptionReviews[resultRecordKey(x.record, index)]; }).length;
  const exceptionsReady = reviewedExceptions === exceptionResults.length;
  return [
    ["Legal interpretation", Boolean(st.legalApproval), st.legalApproval && st.legalApproval.reviewer],
    ["Compliance interpretation", Boolean(st.complianceApproval), st.complianceApproval && st.complianceApproval.reviewer],
    ["Rule version", Boolean(st.ruleApproval && st.ruleApproval.version === st.rule.version), st.ruleApproval && "Version " + st.ruleApproval.version],
    ["Data mapping", Boolean(st.mappingApproval), st.mappingApproval && st.mappingApproval.reviewer],
    ["Conformance suite", Boolean(result && result.conformance === result.conformanceTotal), result && result.conformance + " of " + result.conformanceTotal + " cases passed"],
    ["Exception review", exceptionsReady, exceptionResults.length ? reviewedExceptions + " of " + exceptionResults.length + " exception records reviewed" : "No exception records"],
    ["Independent release review", Boolean(st.releaseApproval), st.releaseApproval && st.releaseApproval.reviewer]
  ];
}
function releaseReady() {
  const st = s();
  const exceptionResults = currentResults().filter(function (x) { return x.status === "exception"; });
  const exceptionsReviewed = exceptionResults.every(function (x, index) { return st.exceptionReviews && st.exceptionReviews[resultRecordKey(x.record, index)]; });
  return Boolean(st.legalApproval && st.complianceApproval && st.ruleApproval && st.mappingApproval && st.runSummary &&
    st.runSummary.conformance === st.runSummary.conformanceTotal && !st.ruleNeedsUpdate &&
    exceptionsReviewed && (!st.changeReview || st.changeReview.status === "resolved"));
}
function approveRelease() {
  if (!releaseReady()) return toast("Complete all release gates before recording release approval.");
  const role = document.getElementById("releaseReviewerNew");
  const reviewer = (role && role.value.trim()) || stReleaseReviewer();
  if (!reviewer) return toast("Enter the independent release control role.");
  const exceptionReviewers = Object.values(s().exceptionReviews || {}).map(function (review) { return review.reviewer; });
  const all = [s().legalApproval.reviewer, s().complianceApproval.reviewer, s().ruleApproval.reviewer, s().mappingApproval.reviewer].concat(exceptionReviewers).map(function (x) { return String(x).toLowerCase(); });
  if (all.includes(reviewer.toLowerCase())) return toast("Choose a release reviewer who did not approve an earlier gate.");
  s().releaseReviewer = reviewer;
  s().releaseApproval = { reviewer: reviewer, time: studio.timeLabel(), version: s().rule.version, runId: s().runSummary.runId };
  s().evidenceManifest = null;
  saveState();
  renderApp();
  toast("Release approval recorded locally.");
}
function stReleaseReviewer() { return s().releaseReviewer || "Demo release control owner"; }
function renderReleasePage() {
  const st = s();
  const gates = releaseGates();
  const ready = releaseReady();
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 6 OF 8 · RELEASE</span><h2>Review and release the rule package</h2><p>Release activates an approved rule version for local reporting use. It does not file a report or certify compliance.</p></div>' + pill(st.releaseApproval ? "Released v" + st.releaseApproval.version : "Release review", st.releaseApproval ? "good" : "review") + '</div>' +
    '<section class="panel releasePanel"><div class="panelHead"><div><h2>Release gates</h2><p>Every gate must pass. The final approver must be separate from all prior reviewers.</p></div></div><ul class="gateList">' + gates.map(function (x) { return '<li><span class="gateMark ' + (x[1] ? "pass" : "pending") + '">' + (x[1] ? "✓" : "·") + '</span><strong>' + esc(x[0]) + '</strong><span>' + esc(x[2] || "Waiting for approval") + '</span></li>'; }).join("") + '</ul><div class="releaseForm"><label class="field"><span>Independent release control owner</span><input id="releaseReviewerNew" value="' + esc(st.releaseReviewer || "Demo release control owner") + '"' + (st.releaseApproval ? " disabled" : "") + '></label>' +
    (st.releaseApproval ? '<div class="releasedNote"><strong>Release recorded</strong><span>Version ' + esc(st.releaseApproval.version) + ' approved by ' + esc(st.releaseApproval.reviewer) + ' at ' + esc(st.releaseApproval.time) + '.</span></div>' : plainBtn("Approve and release version " + esc(st.rule.version), "approveRelease", "primary", !ready)) +
    '</div><p class="smallNote">This local record does not use a verified identity, cryptographic signature, repository tag, or immutable release store.</p></section>' +
    '<div class="stepActions"><button class="button secondary" data-rac-step="validate">Back to validation</button><button class="button primary" data-rac-step="report"' + (st.releaseApproval ? "" : " disabled") + '>Continue to report</button></div>';
}
function reportRows() {
  return currentResults().filter(function (result) { return result.status === "ready" || result.status === "warning"; }).map(function (result) {
    const r = result.record;
    const output = {};
    studio.example.fields.filter(function (field) { return !field.scope; }).forEach(function (field) { output[field.key] = r[field.key] == null ? "" : r[field.key]; });
    output.validation_status = result.status === "warning" ? "READY WITH WARNING" : "READY";
    output.rule_version = s().rule.version;
    return output;
  });
}
function exportReport(format) {
  if (!s().releaseApproval || !s().runSummary) return toast("Release the approved rule and run validation before exporting a report.");
  const rows = reportRows();
  if (!rows.length) return toast("There are no ready records to export.");
  const fileBase = studio.example.id + "_report_preview";
  if (format === "json") studio.downloadText(fileBase + ".json", JSON.stringify(rows, null, 2));
  else {
    const keys = Object.keys(rows[0]);
    const csv = [keys.join(","), ...rows.map(function (row) { return keys.map(function (key) { return studio.csvEscape(row[key]); }).join(","); })].join("\n");
    studio.downloadText(fileBase + ".csv", csv, "text/csv;charset=utf-8");
  }
  toast(format.toUpperCase() + " preview saved to downloads.");
}
function renderReportPage() {
  const st = s();
  const rows = reportRows();
  const ready = Boolean(st.releaseApproval && st.runSummary);
  const headers = rows.length ? Object.keys(rows[0]) : studio.example.fields.filter(function (field) { return !field.scope; }).map(function (field) { return field.key; }).concat(["validation_status", "rule_version"]);
  const preview = rows.slice(0, 8).map(function (row) { return '<tr>' + headers.map(function (key) { return '<td>' + esc(row[key]) + '</td>'; }).join("") + '</tr>'; }).join("");
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 7 OF 8 · REPORT</span><h2>Generate a report preview</h2><p>Review the records eligible for this output. Warnings remain labeled, exceptions are omitted, and this file is not a regulator submission format.</p></div>' + pill(ready ? countLabel(rows.length, "reportable row", "reportable rows") : "Release required", ready ? "good" : "review") + '</div>' +
    (!ready ? '<div class="notice warning"><strong>Report generation is gated.</strong> Record an independent release approval and run validation first.</div>' : "") +
    (ready && st.runSummary.exceptions ? '<div class="notice warning"><strong>' + countLabel(st.runSummary.exceptions, "exception row is", "exception rows are") + ' excluded from the report preview.</strong> Review these records separately before using the output.</div>' : "") +
    '<div class="reportSummary"><div><span>Rule version</span><strong>' + esc(st.rule.version) + '</strong></div><div><span>Release reviewer</span><strong>' + esc(st.releaseApproval ? st.releaseApproval.reviewer : "Not recorded") + '</strong></div><div><span>Input records</span><strong>' + (st.runSummary ? st.runSummary.total : "0") + '</strong></div><div><span>Reportable records</span><strong>' + rows.length + '</strong></div></div>' +
    '<section class="panel reportPanel"><div class="panelHead"><div><h2>Output preview</h2><p>' + esc(studio.example.reportType) + '. This file is a local review artifact, not a regulator submission.</p></div><div class="actionRow compact">' + plainBtn("Export CSV", "exportCsv", "secondary", !ready || !rows.length) + plainBtn("Export JSON", "exportJson", "secondary", !ready || !rows.length) + '</div></div>' +
    (rows.length ? '<div class="tableScroll"><table class="dataTable reportTable"><thead><tr>' + headers.map(function (key) { return '<th>' + esc(key.replace(/_/g, " ")) + '</th>'; }).join("") + '</tr></thead><tbody>' + preview + '</tbody></table></div><p class="smallNote">Showing ' + Math.min(rows.length, 8) + ' of ' + rows.length + ' rows. Exceptions and out of scope records are excluded.</p>' : '<div class="emptyPanel"><h3>No report rows are ready</h3><p>Review the validation exceptions or load a dataset with records that satisfy the approved rule.</p></div>') +
    '</section><div class="notice neutral"><strong>Reporting window.</strong> ' + esc(studio.example.reportWindow) + '</div>' +
    '<div class="stepActions"><button class="button secondary" data-rac-step="release">Back to release</button><button class="button primary" data-rac-step="evidence"' + (st.runSummary ? "" : " disabled") + '>Continue to evidence</button></div>';
}
function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    const result = {};
    Object.keys(value).sort().forEach(function (key) { result[key] = stable(value[key]); });
    return result;
  }
  return value;
}
function stableJson(value) { return JSON.stringify(stable(value)); }
async function sha256(value) {
  const bytes = new TextEncoder().encode(String(value));
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash)).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
}
function evidenceParts() {
  const st = s();
  const results = currentResults();
  const rows = reportRows();
  const failures = results.filter(function (x) { return x.status === "exception"; }).map(function (x) {
    const id = resultRecordKey(x.record, results.indexOf(x));
    return { recordId: id, issues: x.issues, review: st.exceptionReviews && st.exceptionReviews[id] || null };
  });
  return { results: results, rows: rows, failures: failures };
}
async function createEvidencePack() {
  const st = s();
  if (!st.releaseApproval || !st.runSummary || !window.sessionRunRaC) return toast("Release the rule and run validation in this session before creating evidence.");
  const data = evidenceParts();
  const sourcePayload = { meta: st.sourceMeta, version: st.sourceVersion, text: st.sourceText, history: st.sourceHistory };
  const rulePayload = { rule: st.rule, approval: st.ruleApproval };
  const mappingPayload = { fields: st.mappings, metadata: st.mappingMeta, version: st.mappingVersion, approval: st.mappingApproval };
  const reportDigest = await sha256(stableJson(data.rows));
  const inputDigest = await sha256(window.sessionRunRaC.inputText);
  const manifest = {
    format: "Regulation as Code evidence pack",
    formatVersion: "0.2",
    evidenceId: "EV_" + studio.example.id.toUpperCase() + "_" + Date.now(),
    createdAt: new Date().toISOString(),
    example: { id: studio.example.id, name: studio.example.name, sourceLinks: studio.example.sourceLinks },
    source: { metadata: st.sourceMeta, version: st.sourceVersion, sourceReference: studio.example.sourceReference, textDigest: await sha256(st.sourceText), changeReview: st.changeReview },
    obligation: { candidate: st.candidate, legalReview: st.legalApproval, complianceReview: st.complianceApproval },
    rule: { definition: st.rule, approval: st.ruleApproval, digest: await sha256(stableJson(rulePayload)) },
    mapping: { version: st.mappingVersion, fields: st.mappings, metadata: st.mappingMeta, approval: st.mappingApproval, digest: await sha256(stableJson(mappingPayload)) },
    release: st.releaseApproval,
    execution: { runId: st.runSummary.runId, executedAt: st.runSummary.at, counts: st.runSummary, inputDigest: inputDigest, exceptions: data.failures },
    conformance: { passed: st.runSummary.conformance, total: st.runSummary.conformanceTotal, cases: window.sessionRunRaC.conformance },
    report: { format: "Local CSV or JSON preview", rowCount: data.rows.length, digest: reportDigest },
    hashes: { source: await sha256(stableJson(sourcePayload)), rule: await sha256(stableJson(rulePayload)), mapping: await sha256(stableJson(mappingPayload)), input: inputDigest, report: reportDigest },
    integrityNote: "Content fingerprints can show whether data changed. This pack is not digitally signed or stored immutably. It contains no raw input rows."
  };
  manifest.hashes.manifest = await sha256(stableJson(manifest));
  st.evidenceManifest = manifest;
  st.evidenceVerification = null;
  saveState();
  renderApp();
  toast("Evidence pack created with lineage, decisions, tests, outcomes, and fingerprints.");
}
async function verifyEvidencePack() {
  const st = s();
  const pack = st.evidenceManifest;
  if (!pack) return toast("Create an evidence pack first.");
  const sourcePayload = { meta: st.sourceMeta, version: st.sourceVersion, text: st.sourceText, history: st.sourceHistory };
  const rulePayload = { rule: st.rule, approval: st.ruleApproval };
  const mappingPayload = { fields: st.mappings, metadata: st.mappingMeta, version: st.mappingVersion, approval: st.mappingApproval };
  const check = [];
  check.push((await sha256(stableJson(sourcePayload))) === pack.hashes.source);
  check.push((await sha256(stableJson(rulePayload))) === pack.hashes.rule);
  check.push((await sha256(stableJson(mappingPayload))) === pack.hashes.mapping);
  const copy = JSON.parse(JSON.stringify(pack));
  delete copy.hashes.manifest;
  check.push((await sha256(stableJson(copy))) === pack.hashes.manifest);
  if (window.sessionRunRaC) {
    check.push((await sha256(window.sessionRunRaC.inputText)) === pack.hashes.input);
    check.push((await sha256(stableJson(reportRows()))) === pack.hashes.report);
  }
  st.evidenceVerification = check.every(Boolean) ? (window.sessionRunRaC ? "verified" : "partial") : "changed";
  saveState();
  renderApp();
  toast(st.evidenceVerification === "verified" ? "All available fingerprints match." : st.evidenceVerification === "partial" ? "Artifact fingerprints match. Input rows are no longer in memory." : "A fingerprint changed after pack creation.");
}
function downloadEvidencePack() {
  const st = s();
  if (!st.evidenceManifest) return toast("Create an evidence pack first.");
  if (!window.sessionRunRaC) return toast("Run validation again in this session to include its report output.");
  const pack = Object.assign({}, st.evidenceManifest, { reportOutput: reportRows() });
  studio.downloadText(st.evidenceManifest.evidenceId + ".json", JSON.stringify(pack, null, 2));
  toast("Evidence pack saved to downloads.");
}
function renderEvidencePage() {
  const st = s();
  const m = st.evidenceManifest;
  if (!m) return '<div class="stepIntro"><div><span class="stepOverline">STEP 8 OF 8 · EVIDENCE</span><h2>Assemble the evidence pack</h2><p>Capture the source lineage, interpretations, versions, tests, outcomes, exceptions, release, report digest, and content fingerprints.</p></div>' + pill("Not created", "plain") + '</div><div class="emptyPanel"><h3>Evidence follows release and execution</h3><p>The pack records a digest of the input and report. It does not include raw input rows.</p><button class="button primary" data-rac-action="createEvidence"' + (st.releaseApproval && st.runSummary ? "" : " disabled") + '>Create evidence pack</button></div><div class="stepActions"><button class="button secondary" data-rac-step="report">Back to report</button></div>';
  const fields = [
    ["Source lineage", m.source.metadata.title + " · version " + m.source.version + " · " + m.source.sourceReference],
    ["Interpretation", "Legal and compliance decisions recorded"],
    ["Rule version", m.rule.definition.id + " · version " + m.rule.definition.version],
    ["Mapping profile", "Generic model · version " + m.mapping.version],
    ["Conformance", m.conformance.passed + " of " + m.conformance.total + " cases passed"],
    ["Execution", countLabel(m.execution.counts.total, "record", "records") + " · " + m.execution.counts.ready + " ready · " + countLabel(m.execution.counts.warning, "warning", "warnings") + " · " + countLabel(m.execution.counts.exceptions, "exception", "exceptions") + " · " + m.execution.counts.excluded + " excluded"],
    ["Exception review", countLabel(m.execution.exceptions.length, "exception record captured", "exception records captured")],
    ["Release", "Version " + m.release.version + " approved by " + m.release.reviewer],
    ["Report output", countLabel(m.report.rowCount, "row", "rows") + " · " + m.report.format]
  ];
  const fingerprintRows = Object.keys(m.hashes).map(function (key) {
    return '<li><strong>' + esc(key) + '</strong><code>' + esc(m.hashes[key]) + '</code></li>';
  }).join("");
  return '<div class="stepIntro"><div><span class="stepOverline">STEP 8 OF 8 · EVIDENCE</span><h2>Evidence pack</h2><p>Review the decisions and artifacts behind this local reporting run.</p></div>' + pill(st.evidenceVerification === "verified" ? "Verified in this session" : st.evidenceVerification === "partial" ? "Partially checked" : st.evidenceVerification === "changed" ? "Changed" : "Pack created", st.evidenceVerification === "changed" ? "bad" : "good") + '</div>' +
    '<section class="panel evidencePanel"><div class="panelHead"><div><h2>Pack contents</h2><p>' + esc(m.evidenceId) + ' · ' + esc(m.createdAt) + '</p></div></div><dl class="evidenceList">' + fields.map(function (item) { return '<div><dt>' + esc(item[0]) + '</dt><dd>' + esc(item[1]) + '</dd></div>'; }).join("") + '</dl></section>' +
    '<section class="panel fingerprintPanel"><div class="panelHead"><div><h2>Content fingerprints</h2><p>SHA 256 digests identify content changes. They do not prove who created a file.</p></div></div><ul class="fingerprintList">' + fingerprintRows + '</ul>' +
    '<div class="notice neutral"><strong>Integrity limit.</strong> This file is not digitally signed, does not use an immutable store, and is not a format accepted by regulators.</div>' +
    '<div class="actionRow">' + plainBtn("Verify available fingerprints", "verifyEvidence", "primary") + plainBtn("Download evidence pack", "downloadEvidence", "secondary") + '</div></section>' +
    '<div class="stepActions"><button class="button secondary" data-rac-step="report">Back to report</button><button class="button secondary" data-rac-view="shared">Open shared library</button></div>';
}
function renderChangesPage() {
  const st = s();
  const change = st.changeReview;
  const oldText = st.previousSourceText || st.sourceText;
  const newText = st.sourceText;
  const prior = change ? change.priorVersion : "No prior version";
  const current = change ? change.newVersion : st.sourceVersion;
  const status = !change ? pill("No local change", "plain") : pill(change.status === "resolved" ? "Resolved" : change.status === "reviewed" ? "Review recorded" : "Review needed", change.status === "open" ? "review" : "good");
  const reviewAction = change && change.status === "open" ? field("Impact reviewer role", "changeReviewerNew", st.changeReviewer || "Demo change reviewer") + textArea("Impact review note", "changeRationaleNew", st.changeRationale || "Compare the source revision and assess its effect on the obligation, rule, tests, output, and evidence.") + plainBtn("Record impact review", "reviewChange", "primary") : "";
  const draftAction = change && change.status !== "open" && change.status !== "resolved" ? plainBtn("Draft updated obligation", "draftUpdatedObligation", "secondary") : "";
  const sourceComparison = change
    ? '<section class="panel changeCompare"><div><p class="eyebrow">CURRENT SOURCE · VERSION ' + esc(current) + '</p><h2>Revised passage</h2><blockquote>' + esc(newText) + '</blockquote></div><div><p class="eyebrow">PRIOR SOURCE · VERSION ' + esc(prior) + '</p><h2>Prior passage</h2><blockquote>' + esc(oldText) + '</blockquote></div><aside><p class="eyebrow">SAMPLE CHANGE</p><strong>' + (studio.example.validator === "bond" ? "Sample reporting deadline changed from " + esc(extractDeadline(oldText)) + " to " + esc(extractDeadline(newText)) : esc(studio.example.change.label)) + '</strong><small>' + esc(studio.example.sourceChangeNote) + '</small></aside></section>'
    : '<section class="panel changeBaseline"><div><p class="eyebrow">CURRENT SAMPLE SOURCE · VERSION ' + esc(current) + '</p><h2>Waiting for a local revision</h2><blockquote>' + esc(newText) + '</blockquote></div><aside><p class="eyebrow">CHANGE STATUS</p><strong>No source revision has been recorded.</strong> <small>Load the sample amendment or edit the source record to start an impact review.</small></aside></section>';
  return titleBlock("CHANGE INTELLIGENCE", "Change desk", "Compare a local source revision, trace dependent artifacts, and record a human impact review.", status) +
    sourceComparison +
    '<section class="panel impactPanel"><div class="panelHead"><div><h2>Impacted artifacts</h2><p>These objects depend on the source version and should be reviewed before a new release.</p></div>' + (change ? pill("5 artifacts", "review") : pill("No impact record", "plain")) + '</div><ul class="impactList"><li><span>01</span><strong>Obligation interpretation</strong><small>Draft a revised candidate and repeat both reviews.</small></li><li><span>02</span><strong>Rule definition</strong><small>Compare trigger, deadline, fields, severity, and dependencies.</small></li><li><span>03</span><strong>Mapping and conformance</strong><small>Review scope and field assumptions, then rerun the golden cases.</small></li><li><span>04</span><strong>Report output</strong><small>Check the target schema, period, and submission time.</small></li><li><span>05</span><strong>Evidence pack</strong><small>Create a new pack linked to the revised source and released rule.</small></li></ul>' +
    '<div class="changeReviewBar"><div><p class="eyebrow">REVIEW STATUS</p><strong>' + (change ? esc(change.status === "resolved" ? "Resolved with rule version " + change.ruleVersion : change.status === "reviewed" ? "Impact review recorded" : "Awaiting human impact review") : "No source update loaded") + '</strong> <small>' + (change && change.reviewer ? "Reviewed by " + esc(change.reviewer) + " at " + esc(change.reviewedAt) : "This prototype does not monitor official sources.") + '</small></div><div>' +
    (change ? reviewAction + draftAction : plainBtn("Load sample source change", "sampleAmendment", "primary")) +
    plainBtn("Edit source text", "openSource", "secondary") + '</div></div></section>' +
    '<div class="notice neutral"><strong>Change detection boundary.</strong> A production system needs an official source registry, polling policy, preserved source copies, and a reviewed comparison method. No scraping or alert feed is active here.</div>';
}
function standardLinks() {
  return '<div class="standardGrid">' +
    '<a href="https://cdm.finos.org/" target="_blank" rel="noreferrer"><strong>FINOS CDM</strong><span>Possible model for financial products, trades, and lifecycle events.</span><small>Use only after domain mapping and conformance work.</small></a>' +
    '<a href="https://www.isda.org/isda-solutions-infohub/isda-digital-regulatory-reporting/" target="_blank" rel="noreferrer"><strong>ISDA Digital Regulatory Reporting</strong><span>Relevant to supported derivatives reporting regimes and their model work.</span><small>The corporate bond example is not a DRR conformance example.</small></a>' +
    '<a href="https://www.xbrl.org/the-standard/what/the-standard-for-reporting/" target="_blank" rel="noreferrer"><strong>XBRL</strong><span>Digital reporting format where the authority uses an XBRL taxonomy.</span><small>A field name alone does not establish alignment.</small></a>' +
    '<a href="https://www.iso20022.org/faq" target="_blank" rel="noreferrer"><strong>ISO 20022</strong><span>Structured financial messages where the community and use case require them.</span><small>There is no universal certification claim in this prototype.</small></a></div>';
}
function renderSharedPage() {
  const st = s();
  const artifacts = [
    ["Obligation schema", "Source reference, scope, trigger, required fields, severity, effective date, owner, and review history."],
    ["Rule definition", "Readable deterministic conditions, checks, version, dependencies, and approving role."],
    ["Mapping profile", "Common concepts and candidate links to private systems, owners, transforms, and quality assumptions."],
    ["Conformance suite", "Synthetic valid, boundary, missing, invalid, late, excluded, and exception cases."],
    ["Evidence manifest", "Source lineage, approvals, tests, run outcomes, report digest, and content fingerprints."]
  ];
  return titleBlock("REUSABLE INFRASTRUCTURE", "Shared library", "Share reviewed artifact shapes and conformance examples. Keep firm data and system mappings under local control.", plainBtn("Export contribution draft", "exportShared", "primary")) +
    '<section class="sharedBanner"><div><p class="eyebrow">OPEN SOURCE MODEL</p><h2>Share the rules and tests. Run them against local data.</h2><p>The source repository is public. This contribution draft is downloaded to your device. No foundation or shared execution service is connected.</p></div><div class="sharedFlow"><span>Review</span><b>→</b><span>Release</span><b>→</b><span>Run locally</span></div></section>' +
    '<div class="libraryLayout"><section class="panel artifactPanel"><div class="panelHead"><div><h2>Reusable artifact types</h2><p>These are proposed shapes in this prototype, not a published standard.</p></div></div><div class="artifactRows">' + artifacts.map(function (item, index) { return '<article><span class="artifactNumber">0' + (index + 1) + '</span><div><strong>' + esc(item[0]) + '</strong><p>' + esc(item[1]) + '</p></div><span class="artifactState">' + (index === 0 && st.candidate ? "Local draft" : index === 1 && st.rule ? "Local draft" : "Shape only") + '</span></article>'; }).join("") + '</div></section>' +
    '<aside class="panel privatePanel"><div class="panelHead"><div><h2>Firm controlled information</h2><p>Shared artifacts should not include private execution inputs.</p></div></div><ul class="privateRows"><li><strong>Trade and customer records</strong><span>Remain at the firm and out of a contribution bundle.</span></li><li><strong>Internal system mappings</strong><span>Source tables and ownership stay within each institution.</span></li><li><strong>Local approvals</strong><span>Firm identity and final decisions remain in local controls.</span></li><li><strong>Run evidence</strong><span>Private evidence is generated locally for each execution.</span></li></ul><p class="smallNote">This prototype downloads a sample contribution file. It does not send data anywhere.</p></aside></div>' +
    '<section class="panel standardsPanel"><div class="panelHead"><div><h2>Possible standards connections</h2><p>Select standards based on the reporting domain, regulator format, and actual conformance tests.</p></div></div>' + standardLinks() + '</section>' +
    '<section class="sharedBenefits"><div><strong>Less repeated work</strong><p>Reuse reviewed rule shapes and synthetic tests where firms face the same obligation.</p></div><div><strong>More comparable outputs</strong><p>Common concepts can reduce avoidable differences when mappings are reviewed.</p></div><div><strong>Clearer evidence</strong><p>Versions and approvals can make local reporting decisions easier to inspect.</p></div></section>' +
    '<div class="notice neutral"><strong>Governance is still developing.</strong> This project has an Apache 2.0 license, contribution rules, and initial maintainers. It has no neutral foundation or institutional endorsement.</div>';
}
function renderArchitecturePage() {
  const layers = [
    ["01", "Data and standards", "Source registry, obligation metadata, common model, local mappings, and explicit domain profiles.", "Possible links: FINOS CDM for financial product concepts, ISO 20022 for structured messages, and XBRL where a reporting taxonomy is required."],
    ["02", "Rule execution", "Versioned rule definitions, deterministic evaluation, synthetic conformance tests, and report preview output.", "A future implementation could use DMN or a domain rule language. This prototype uses browser JavaScript and a fixed sample rule."],
    ["03", "Governance", "Separate legal and compliance review, data stewardship, rule approval, independent release approval, and recorded dissent.", "The local role names are unverified entries. A production system needs identity, access, retention, and approval controls."],
    ["04", "Change intelligence", "Source versioning, impact links, review queue, change rationale, and renewed tests before release.", "AI may assist discovery or change comparison. It cannot approve, edit an approved rule, or activate a release."]
  ];
  return titleBlock("SYSTEM DESIGN", "Architecture", "A modular design connects shared artifacts to firm controlled execution and an auditable change process.", "") +
    '<section class="architectureFlow"><div class="flowNode sourceNode"><span>01</span><strong>Regulatory source</strong><small>Versioned text and metadata</small></div><i>↓</i><div class="flowNode"><span>02</span><strong>Reviewed obligation</strong><small>Legal and compliance decisions</small></div><i>↓</i><div class="flowNode"><span>03</span><strong>Rule and model</strong><small>Versioned logic and local mapping</small></div><i>↓</i><div class="flowNode"><span>04</span><strong>Validation and release</strong><small>Deterministic tests and independent control</small></div><i>↓</i><div class="flowNode outputNode"><span>05</span><strong>Report and evidence</strong><small>Local output, lineage, and fingerprints</small></div></section>' +
    '<section class="layerGrid">' + layers.map(function (layer) { return '<article class="layerCard"><span class="layerNumber">' + layer[0] + '</span><h2>' + esc(layer[1]) + '</h2><p>' + esc(layer[2]) + '</p><div><strong>Design note</strong><span>' + esc(layer[3]) + '</span></div></article>'; }).join("") + '</section>' +
    '<section class="panel connectionPanel"><div class="panelHead"><div><h2>Standards boundary</h2><p>Each connection depends on the relevant domain and target format. The sample does not claim conformance.</p></div></div>' + standardLinks() + '</section>' +
    '<div class="notice neutral"><strong>Execution boundary.</strong> This app runs in one browser. It does not use a cloud engine, public registry, build pipeline, or external approval system. A production architecture must add those parts without moving private data outside approved controls.</div>';
}
function renderGovernancePage() {
  const roles = [
    ["Legal reviewer", "Confirms the source meaning and interpretation."],
    ["Compliance reviewer", "Confirms scope, reporting intent, and operational application."],
    ["Data steward", "Reviews local fields, source systems, transforms, and quality assumptions."],
    ["Rule owner", "Maintains the deterministic definition, tests, and version notes."],
    ["Release control owner", "Independently approves activation after all gates pass."],
    ["Maintainer", "Reviews shared contributions, compatibility, releases, and deprecation."]
  ];
  return titleBlock("CONTROL MODEL", "Governance", "Human review, role separation, version history, conformance tests, and clear accountability make the pipeline reviewable.", "") +
    '<section class="panel governanceIntro"><div><p class="eyebrow">DECISION RIGHTS</p><h2>Automation can prepare work. People approve the rule.</h2><p>The local prototype has no identity service. Reviewer names are editable demo roles and must not be treated as legal sign off.</p></div><div class="aiBoundary"><span>AI boundary</span><strong>Discovery may be assisted. Approval and activation remain human decisions.</strong></div></section>' +
    '<section class="panel"><div class="panelHead"><div><h2>Role separation</h2><p>Each role leaves a separate record. Release review must be independent of earlier approvals.</p></div></div><div class="roleGrid">' + roles.map(function (role, index) { return '<article><span>0' + (index + 1) + '</span><strong>' + esc(role[0]) + '</strong><p>' + esc(role[1]) + '</p></article>'; }).join("") + '</div></section>' +
    '<section class="panel"><div class="panelHead"><div><h2>Risks and mitigations</h2><p>These are implementation concerns that need policy and operational controls.</p></div></div><div class="riskTable">' + riskRows.map(function (row) { return '<div><strong>' + esc(row[0]) + '</strong><p>' + esc(row[1]) + '</p></div>'; }).join("") + '</div></section>' +
    '<section class="twoPanels">' + panel("Open contribution process", '<ol class="numberList"><li>Submit a source citation, rationale, rule draft, and tests.</li><li>Require domain review from legal, compliance, and engineering contributors.</li><li>Record dissent and unresolved interpretations instead of hiding disagreement.</li><li>Run conformance and compatibility checks before a version is released.</li><li>Publish release notes, effective dates, deprecation guidance, and owners.</li></ol>') +
    panel("Industry outcomes to validate", '<p>Shared infrastructure may reduce duplicated implementation work, improve consistency, simplify change response, and make evidence easier to inspect.</p><p>These are intended benefits, not measured results. Regulator trust depends on the evidence, governance, adoption, and the authority involved.</p>') + '</section>' +
    '<div class="notice warning"><strong>AI is not the compliance authority.</strong> If used in a future implementation, AI output should include source citations and uncertainty, remain visibly marked as a suggestion, and enter the same human review and test process as any other draft.</div>';
}
function renderRoadmapPage() {
  const st = s();
  const done = Array.isArray(st.roadmapDone) ? st.roadmapDone : [];
  const cards = roadmapPhases.map(function (phase, index) {
    const checked = done.includes(index);
    return '<label class="roadmapCard ' + (checked ? "complete" : "") + '"><input type="checkbox" data-rac-roadmap="' + index + '"' + (checked ? " checked" : "") + '><span class="roadmapNumber">0' + (index + 1) + '</span><span class="roadmapText"><strong>' + esc(phase.title) + '</strong><small>' + esc(phase.detail) + '</small><em>Output: ' + esc(phase.output) + '</em></span><span class="phaseState">' + (checked ? "Marked complete" : "Planned") + '</span></label>';
  }).join("");
  return titleBlock("ADOPTION PLAN", "Roadmap", "A phased path from a shared obligation vocabulary to governed, tested, locally executed reporting.", pill(done.length + " of 6 marked complete", done.length === 6 ? "good" : "plain")) +
    '<div class="roadmapProgress"><span style="width:' + (done.length / roadmapPhases.length * 100) + '%"></span></div>' +
    '<section class="roadmapList">' + cards + '</section>' +
    '<div class="notice neutral"><strong>This is a planning aid.</strong> Check marks are saved in this browser only. They do not represent industry adoption, a committed delivery date, or regulator endorsement.</div>' +
    '<section class="sharedBenefits"><div><strong>Start with a narrow domain</strong><p>Choose one obligation and publish the source lineage and review policy first.</p></div><div><strong>Test with synthetic data</strong><p>Publish boundary and exception cases before any production connection.</p></div><div><strong>Govern before scaling</strong><p>Set contribution, licensing, release, and dispute rules with participating firms.</p></div></section>';
}
function renderHelp() {
  return '<div class="modalBackdrop" data-rac-action="closeHelp"><section class="helpDialog" role="dialog" aria-modal="true" aria-labelledby="helpTitle"><button class="closeHelp" data-rac-action="closeHelp" aria-label="Close">×</button><p class="eyebrow">ABOUT THIS PREVIEW</p><h2 id="helpTitle">Local workflow, clear limits.</h2><p>This workbench offers three examples with synthetic rows. It demonstrates source lineage, separate legal and compliance reviews, versioned rules, local mappings, deterministic checks, release gates, report preview, exception review, change impact, and evidence fingerprints.</p><div class="helpColumns"><div><strong>What works here</strong><p>Workflow state saves in this browser. CSV rows are parsed in memory. The rule checks run locally and produce downloadable previews.</p></div><div><strong>What is not connected</strong><p>No AI model, regulatory source feed, identity service, shared execution service, production standard, official holiday calendar, regulator format, digital signature, or filing destination is connected.</p></div></div><button class="button primary" data-rac-action="closeHelp">Return to workbench</button></section></div>';
}
function renderResetConfirm() {
  return '<div class="modalBackdrop" data-rac-action="cancelReset"><section class="helpDialog resetDialog" role="dialog" aria-modal="true" aria-labelledby="resetTitle"><button class="closeHelp" data-rac-action="cancelReset" aria-label="Close">×</button><p class="eyebrow">RESET LOCAL EXAMPLE</p><h2 id="resetTitle">Return to the fictional sample?</h2><p>This clears saved workflow decisions, mapping edits, run results, and roadmap marks in this browser. Your downloaded files remain in Downloads.</p><div class="actionRow"><button class="button secondary" data-rac-action="cancelReset">Keep current work</button><button class="button primary" data-rac-action="confirmReset">Reset demo</button></div></section></div>';
}
function renderApp() {
  const st = s();
  const views = {
    overview: overviewPage,
    examples: renderExamplesPage,
    pipeline: pipelinePage,
    changes: renderChangesPage,
    shared: renderSharedPage,
    architecture: renderArchitecturePage,
    governance: renderGovernancePage,
    roadmap: renderRoadmapPage
  };
  shell((views[st.view] || overviewPage)());
}
function renderExamplesPage() {
  const profiles = studio.examples.map(function (example) {
    const active = example.id === studio.example.id;
    const links = example.sourceLinks.length
      ? '<div class="exampleSources"><span>Public source material</span>' + example.sourceLinks.map(function (source) { return '<a href="' + esc(source.url) + '" target="_blank" rel="noreferrer">' + esc(source.label) + ' ↗</a>'; }).join("") + '</div>'
      : '<div class="exampleSources"><span>Public source material</span><small>No official source is claimed for this fictional example.</small></div>';
    return '<article class="exampleProfile ' + (active ? "selected" : "") + '"><div class="exampleProfileTop"><span>' + esc(example.domain) + '</span>' + pill(active ? "Loaded" : "Runnable", active ? "good" : "plain") + '</div><h2>' + esc(example.name) + '</h2><p>' + esc(example.description) + '</p><div class="exampleBankUse"><strong>Bank use</strong><span>' + esc(example.bankValue) + '</span></div><div class="exampleProfileMeta"><span>' + example.sampleRows.length + ' sample rows</span><span>' + example.cases.length + ' conformance cases</span><span>' + esc(example.audience) + '</span></div><p class="smallNote">' + esc(example.dataNote) + (example.privacyNote ? ' ' + esc(example.privacyNote) : '') + '</p>' + links + '<div class="exampleActions">' + plainBtn(active ? "Reload this example" : "Load this example", "useExample", active ? "secondary" : "primary", false, ' data-example="' + esc(example.id) + '"') + plainBtn("Download sample CSV", "downloadExample", "secondary", false, ' data-example="' + esc(example.id) + '"') + '</div></article>';
  }).join("");
  const steps = [
    ["01", "Fork and run", "Fork the repository, install Node.js, run npm start, and open the local address shown in the README."],
    ["02", "Choose one reporting use", "Start with the closest example. Replace its source reference with the applicable official text and record the version, section, and effective date."],
    ["03", "Review the interpretation", "Have legal and compliance reviewers confirm who reports, which records are in scope, what fields are required, and which dates apply."],
    ["04", "Map local data", "Load a privacy reviewed test file, connect its columns to the common fields, and keep source names and transformations inside the bank."],
    ["05", "Build the bank test suite", "Add valid, boundary, missing, invalid, duplicate, and changed source cases. Run them before accepting each rule version."],
    ["06", "Review output and evidence", "Resolve exceptions, record independent approval, then export a local report preview and evidence pack for the bank’s control process."]
  ];
  return titleBlock("EXAMPLES AND BANK ADOPTION", "Start with a complete reporting example", "Each profile includes source context, a rule, field mappings, synthetic input, deterministic checks, conformance cases, report output, and evidence. Public materials are linked where available.", pill(studio.examples.length + " working profiles", "good")) +
    '<div class="examplesBanner"><div><p class="eyebrow">CURRENT PROFILE</p><h2>' + esc(studio.example.name) + '</h2><p>' + esc(studio.example.bankValue) + '</p></div><div class="examplesBannerActions"><button class="button primary" data-rac-step="source">Open the selected pipeline</button><span>Bundled records are synthetic</span></div></div>' +
    '<section class="exampleGrid">' + profiles + '</section>' +
    '<section class="adoptionPanel"><div class="adoptionHeading"><div><p class="eyebrow">A PRACTICAL BANK FORK</p><h2>Start locally, keep bank data under bank control.</h2><p>This repository provides a working pattern. Each institution supplies its own approved interpretation, data access, identity controls, output contract, and release process.</p></div><div class="adoptionBoundary"><strong>What can be shared</strong><span>Public source references, rule shapes, field concepts, synthetic test cases, and compatibility notes.</span><strong>What stays private</strong><span>Customer rows, institution mappings, credentials, reviewer identities, and local evidence.</span></div></div><div class="adoptionSteps">' + steps.map(function (item) { return '<article><span>' + item[0] + '</span><strong>' + esc(item[1]) + '</strong><p>' + esc(item[2]) + '</p></article>'; }).join("") + '</div></section>' +
    '<div class="notice neutral"><strong>Value to validate in a pilot.</strong> Reusing a reviewed profile can reduce repeated interpretation and test setup. Local mapping can make exceptions easier to trace. Versioned source and rule records can help teams explain why a report changed. This prototype has not measured time saved, error reduction, regulator acceptance, or audit outcomes.</div>' +
    '<div class="notice warning"><strong>Before production use.</strong> Confirm legal applicability and current instructions. Add institutional identity and access controls, change approval, retention, security review, regulator schemas, supported calendars, and an approved delivery channel.</div>';
}
function updateSourceMetaFromForm() {
  return {
    title: document.getElementById("sourceTitle").value.trim(),
    authority: document.getElementById("sourceAuthority").value.trim(),
    jurisdiction: document.getElementById("sourceJurisdiction").value.trim(),
    domain: document.getElementById("sourceDomain").value.trim(),
    sourceType: document.getElementById("sourceType").value.trim(),
    section: document.getElementById("sourceSection").value.trim(),
    paragraph: document.getElementById("sourceParagraph").value.trim(),
    effectiveDate: document.getElementById("sourceEffectiveDate").value
  };
}
function createSourceRevision(newText, newMeta) {
  const st = s();
  const same = newText === st.sourceText && stableJson(newMeta) === stableJson(Object.assign({}, sourceDefaults(), st.sourceMeta || {}));
  if (same) return toast("No source change to save.");
  const prior = st.sourceVersion;
  const parts = String(prior || "1.0").split(".").map(Number);
  st.previousSourceText = st.sourceText;
  st.sourceText = newText;
  st.sourceMeta = newMeta;
  st.sourceVersion = (parts[0] || 1) + "." + ((parts[1] || 0) + 1);
  st.sourceHistory = (st.sourceHistory || []).concat([{ version: st.sourceVersion, text: newText, recordedAt: studio.timeLabel(), metadata: newMeta }]).slice(-20);
  st.changeReview = { status: "open", priorVersion: prior, newVersion: st.sourceVersion, openedAt: studio.timeLabel(), reviewedAt: null, reviewer: null };
  st.candidate = null;
  st.legalApproval = null;
  st.complianceApproval = null;
  st.obligationApproval = null;
  st.ruleApproval = null;
  st.mappingApproval = null;
  st.ruleNeedsUpdate = true;
  invalidateRun();
  saveState();
  renderApp();
  toast("Source version " + st.sourceVersion + " saved. Downstream work needs review.");
}
function saveSourceForm() {
  const text = document.getElementById("sourceTextNew").value.trim();
  if (!text) return toast("Source passage cannot be empty.");
  createSourceRevision(text, updateSourceMetaFromForm());
}
function extractDeadline(text) {
  return (String(text).match(/by\s+(\d{1,2}:\d{2})/i) || [])[1] || "Not found";
}
function extractCutoff(text) {
  return (String(text).match(/after\s+(\d{1,2}:\d{2})/i) || [])[1] || s().rule.cutoff;
}
function draftObligation() {
  const st = s();
  if (st.changeReview && st.changeReview.status === "open") return toast("Record the impact review before drafting from a revised source.");
  const text = st.sourceText;
  const source = st.sourceMeta || sourceDefaults();
  const lowered = text.toLowerCase();
  const fields = studio.example.requiredFields.filter(function (key) {
    const field = studio.reportFields.find(function (item) { return item.key === key; });
    return field && (field.sourceTerms || []).some(function (term) { return lowered.includes(term.toLowerCase()); });
  });
  const configured = ruleDefaultsForExample();
  const candidate = {
    id: st.rule.id || configured.id,
    name: st.rule.name || configured.name,
    scope: studio.example.obligation.scope,
    trigger: studio.example.obligation.trigger,
    reportingWindow: studio.example.obligation.window,
    cutoff: studio.example.validator === "bond" ? extractCutoff(text) : "",
    deadline: studio.example.validator === "bond" ? extractDeadline(text) : "",
    severity: st.rule.severity || "Blocking",
    effectiveDate: source.effectiveDate,
    owner: st.rule.owner || "Reporting control owner",
    sourceReference: studio.example.sourceReference,
    requiredFields: fields,
    status: "Candidate"
  };
  if (st.ruleNeedsUpdate || st.ruleApproval) {
    st.ruleHistory = (st.ruleHistory || []).concat([Object.assign({}, st.rule, { approval: st.ruleApproval || null, status: st.ruleApproval ? "Approved" : "Draft", archivedAt: studio.timeLabel() })]).slice(-20);
    st.rule = Object.assign({}, st.rule, { id: candidate.id, name: candidate.name, cutoff: candidate.cutoff, deadline: candidate.deadline, effectiveDate: candidate.effectiveDate, sourceReference: candidate.sourceReference, tests: studio.example.rule.tests, version: studio.incrementVersion(st.rule.version) });
    st.ruleApproval = null;
    st.ruleNeedsUpdate = false;
  }
  st.candidate = candidate;
  st.legalApproval = null;
  st.complianceApproval = null;
  st.obligationApproval = null;
  invalidateRun();
  st.view = "pipeline";
  st.stage = "obligation";
  saveState();
  renderApp();
  toast("Candidate drafted from the current source passage. Human review is required.");
}
function recordReview(role) {
  const st = s();
  if (!st.candidate) return toast("Draft an obligation before recording a review.");
  if (missingCandidateFields(st.candidate).length) return toast("Resolve every required field in the source text before recording a review.");
  const inputId = role === "legal" ? "legalReviewer" : "complianceReviewer";
  const reviewer = document.getElementById(inputId).value.trim();
  if (!reviewer) return toast("Enter the reviewer role before approving.");
  const rationaleId = role === "legal" ? "legalRationaleNew" : "complianceRationaleNew";
  const rationale = document.getElementById(rationaleId).value.trim();
  if (!rationale) return toast("Record a short rationale before approving the interpretation.");
  const other = role === "legal" ? st.complianceApproval : st.legalApproval;
  if (other && other.reviewer.toLowerCase() === reviewer.toLowerCase()) return toast("Legal and compliance review must use separate reviewers.");
  const entry = { reviewer: reviewer, rationale: rationale, time: studio.timeLabel(), sourceVersion: st.sourceVersion, obligationId: st.candidate.id };
  if (role === "legal") { st.legalReviewer = reviewer; st.legalRationale = rationale; st.legalApproval = entry; }
  else { st.complianceReviewer = reviewer; st.complianceRationale = rationale; st.complianceApproval = entry; }
  st.obligationApproval = st.legalApproval && st.complianceApproval ? { legal: st.legalApproval, compliance: st.complianceApproval, time: studio.timeLabel() } : null;
  invalidateRun();
  saveState();
  renderApp();
  toast(role.charAt(0).toUpperCase() + role.slice(1) + " review recorded locally.");
}
function archiveRule() {
  const st = s();
  st.ruleHistory = (st.ruleHistory || []).concat([Object.assign({}, st.rule, { approval: st.ruleApproval || null, status: st.ruleApproval ? "Approved" : "Draft", archivedAt: studio.timeLabel() })]).slice(-20);
}
function saveRuleForm() {
  const st = s();
  const settings = Object.assign({}, st.rule.settings || {});
  for (const parameter of studio.example.parameters) {
    const input = document.getElementById("ruleParam_" + parameter.key);
    if (input) settings[parameter.key] = input.value.trim();
  }
  const next = Object.assign({}, st.rule, {
    id: document.getElementById("ruleIdNew").value.trim(),
    name: document.getElementById("ruleNameNew").value.trim(),
    severity: document.getElementById("ruleSeverityNew").value.trim(),
    effectiveDate: document.getElementById("ruleEffectiveNew").value,
    owner: document.getElementById("ruleOwnerNew").value.trim(),
    sourceReference: document.getElementById("ruleSourceReferenceNew").value.trim(),
    tests: document.getElementById("ruleTestsNew").value.trim(),
    dependencies: document.getElementById("ruleDependenciesNew").value.trim(),
    settings: settings
  });
  if (!next.id || !next.name || !next.owner || !next.severity || !next.tests || !next.sourceReference) return toast("Complete the rule identifier, name, severity, owner, source, and test suite.");
  for (const parameter of studio.example.parameters) {
    const value = settings[parameter.key];
    if (parameter.type === "time" && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value || "")) return toast("Enter a valid 24 hour value for " + parameter.label.toLowerCase() + ".");
    if (parameter.type === "number" && (!Number.isFinite(Number(value)) || Number(value) < Number(parameter.min || 0))) return toast("Enter a valid nonnegative value for " + parameter.label.toLowerCase() + ".");
    if (parameter.key === "actionCodes" && !/^[1-8](,[1-8])*$/.test(value || "")) return toast("Enter action values from 1 to 8, separated by commas.");
  }
  if (studio.example.validator === "bond") {
    next.cutoff = settings.cutoff;
    next.deadline = settings.deadline;
  }
  const changed = stableJson(Object.assign({}, st.rule, { version: "" })) !== stableJson(Object.assign({}, next, { version: "" }));
  if (changed || st.ruleNeedsUpdate) {
    archiveRule();
    next.version = studio.incrementVersion(st.rule.version);
  }
  st.rule = next;
  st.ruleApproval = null;
  st.ruleNeedsUpdate = false;
  st.ruleReviewer = (document.getElementById("ruleReviewerNew").value || st.ruleReviewer).trim();
  invalidateRun();
  saveState();
  renderApp();
  toast("Rule draft saved as version " + st.rule.version + ".");
}
function approveRuleNow() {
  const st = s();
  if (!st.candidate || !st.legalApproval || !st.complianceApproval) return toast("Complete both obligation reviews first.");
  if (missingCandidateFields(st.candidate).length) return toast("Resolve every required field in the source text before approving the rule.");
  if (st.ruleNeedsUpdate || (st.rule.cutoff || "") !== st.candidate.cutoff || (st.rule.deadline || "") !== st.candidate.deadline) return toast("Save a rule version that matches the reviewed obligation.");
  if (st.changeReview && st.changeReview.status === "open") return toast("Record the source impact review before approving the rule.");
  const reviewer = (document.getElementById("ruleReviewerNew").value || st.ruleReviewer || "").trim();
  const prior = [st.legalApproval.reviewer, st.complianceApproval.reviewer, st.mappingApproval && st.mappingApproval.reviewer].filter(Boolean).map(function (x) { return x.toLowerCase(); });
  if (!reviewer) return toast("Enter the rule approver role.");
  if (prior.includes(reviewer.toLowerCase())) return toast("Rule approval must be separate from legal, compliance, and mapping review.");
  st.ruleReviewer = reviewer;
  st.ruleApproval = { reviewer: reviewer, time: studio.timeLabel(), version: st.rule.version };
  if (st.changeReview && st.changeReview.status === "reviewed") st.changeReview = Object.assign({}, st.changeReview, { status: "resolved", resolvedAt: studio.timeLabel(), ruleVersion: st.rule.version });
  invalidateRun();
  saveState();
  renderApp();
  toast("Rule version " + st.rule.version + " approved locally.");
}
function editApprovedRule() {
  const st = s();
  if (st.ruleApproval) archiveRule();
  st.ruleApproval = null;
  st.ruleNeedsUpdate = true;
  invalidateRun();
  saveState();
  renderApp();
  toast("Create a new rule version before editing the approved definition.");
}
function setMappingValue(key, value) {
  const st = s();
  if (st.mappings[key] === value) return;
  st.mappingHistory = (st.mappingHistory || []).concat([{ version: st.mappingVersion, mappings: Object.assign({}, st.mappings), approval: st.mappingApproval || null, archivedAt: studio.timeLabel() }]).slice(-20);
  st.mappings[key] = value;
  st.mappingVersion = studio.incrementVersion(st.mappingVersion);
  st.mappingApproval = null;
  invalidateRun();
  saveState();
  renderApp();
}
function setMappingMeta(key, prop, value) {
  const st = s();
  st.mappingMeta = st.mappingMeta || {};
  st.mappingMeta[key] = Object.assign({ system: "Local sample file", owner: "Data steward", transform: "Direct field copy", quality: "Present and valid" }, st.mappingMeta[key] || {});
  if (st.mappingMeta[key][prop] === value) return;
  st.mappingMeta[key][prop] = value;
  st.mappingVersion = studio.incrementVersion(st.mappingVersion);
  st.mappingApproval = null;
  invalidateRun();
  saveState();
}
function approveMappingNow() {
  const st = s();
  const missing = studio.reportFields.filter(function (f) { return !st.mappings[f.key] || !studio.headers.includes(st.mappings[f.key]); });
  if (missing.length) return toast("Map all reporting and scope fields to the current input.");
  const sources = studio.reportFields.map(function (f) { return st.mappings[f.key]; });
  if (new Set(sources).size !== sources.length) return toast("Resolve repeated source columns before approving this direct mapping.");
  const reviewer = (document.getElementById("mappingReviewerNew").value || st.mappingReviewer || "").trim();
  const prior = [st.legalApproval && st.legalApproval.reviewer, st.complianceApproval && st.complianceApproval.reviewer, st.ruleApproval && st.ruleApproval.reviewer].filter(Boolean).map(function (x) { return x.toLowerCase(); });
  if (!reviewer) return toast("Enter the data steward role.");
  if (prior.includes(reviewer.toLowerCase())) return toast("Mapping review must be separate from legal, compliance, and rule review.");
  st.mappingReviewer = reviewer;
  st.mappingApproval = { reviewer: reviewer, time: studio.timeLabel(), version: st.mappingVersion };
  invalidateRun();
  saveState();
  renderApp();
  toast("Mapping review recorded locally.");
}
function editMappingNow() {
  const st = s();
  st.mappingHistory = (st.mappingHistory || []).concat([{ version: st.mappingVersion, mappings: Object.assign({}, st.mappings), approval: st.mappingApproval || null, archivedAt: studio.timeLabel() }]).slice(-20);
  st.mappingVersion = studio.incrementVersion(st.mappingVersion);
  st.mappingApproval = null;
  invalidateRun();
  saveState();
  renderApp();
  toast("Mapping profile is now a draft.");
}
function approveReleaseNow() { approveRelease(); }
function recordExceptionReview(id) {
  const st = s();
  const reviewerInput = document.getElementById("exceptionReviewerNew");
  const reviewer = reviewerInput && reviewerInput.value.trim();
  if (!reviewer) return toast("Enter a reviewer role before recording the exception review.");
  const noteInput = Array.from(document.querySelectorAll("[data-rac-exception-note]")).find(function (node) { return node.dataset.racExceptionNote === id; });
  const rationale = noteInput && noteInput.value.trim();
  if (!rationale) return toast("Add a review note before recording the exception.");
  st.exceptionReviews = st.exceptionReviews || {};
  st.exceptionReviews[id] = { reviewer: reviewer, rationale: rationale, time: studio.timeLabel(), status: "Reviewed, not waived" };
  st.exceptionReviewer = reviewer;
  saveState();
  renderApp();
  toast("Exception review recorded. The validation result remains visible.");
}
function importCsvFile(file) {
  const reader = new FileReader();
  reader.onload = function () {
    try {
      const text = String(reader.result || "");
      const parsed = studio.parseCsv(text);
      const prepared = withGeneratedFields(studio.example, parsed.rows, parsed.headers);
      const headers = prepared.headers;
      const rows = prepared.rows;
      const normalizedText = [headers.map(studio.csvEscape).join(","), ...rows.map(function (row) { return headers.map(function (header) { return studio.csvEscape(row[header]); }).join(","); })].join("\n") + "\n";
      studio.setRuntime(rows, headers, file.name, normalizedText);
      const st = s();
      const suggestedMappings = suggestSourceMappings(studio.example, headers, st.mappings);
      const changed = Object.keys(suggestedMappings).some(function (key) { return st.mappings[key] !== suggestedMappings[key]; });
      if (changed) {
        st.mappings = suggestedMappings;
        st.mappingVersion = studio.incrementVersion(st.mappingVersion);
        st.mappingApproval = null;
      }
      invalidateRun();
      saveState();
      renderApp();
      toast(parsed.rows.length + " CSV rows loaded into browser memory.");
    } catch (error) {
      toast(error.message || "Could not read this CSV file.");
    }
  };
  reader.onerror = function () { toast("Could not read this CSV file."); };
  reader.readAsText(file);
}
function reviewChangeNow() {
  const st = s();
  if (!st.changeReview || st.changeReview.status !== "open") return toast("There is no open source impact review.");
  const reviewer = (document.getElementById("changeReviewerNew") && document.getElementById("changeReviewerNew").value.trim()) || "Demo change reviewer";
  const rationale = document.getElementById("changeRationaleNew").value.trim();
  if (!rationale) return toast("Add a short impact note before recording the review.");
  st.changeReviewer = reviewer;
  st.changeRationale = rationale;
  st.changeReview = Object.assign({}, st.changeReview, { status: "reviewed", reviewer: reviewer, rationale: rationale, reviewedAt: studio.timeLabel(), impact: ["obligation", "rule", "mapping", "conformance", "report", "evidence"] });
  invalidateRun();
  saveState();
  renderApp();
  toast("Impact review recorded. A new rule version still needs approval.");
}
function sampleAmendment() {
  const st = s();
  const amendment = studio.example.change;
  const amended = st.sourceText.replace(amendment.from, amendment.to);
  if (amended === st.sourceText) return toast("This sample source change has already been applied. Reset the example to load it again.");
  createSourceRevision(amended, Object.assign({}, sourceDefaults(), st.sourceMeta || {}));
}
function openSource() {
  s().view = "pipeline";
  s().stage = "source";
  saveState();
  renderApp();
}
function exportContribution() {
  const st = s();
  const cases = goldenCases().map(function (item) { return { name: item.name, expected: item.expected }; });
  const bundle = {
    bundleType: "Regulation as Code contribution draft",
    bundleVersion: "0.2",
    status: "Illustrative local draft",
    note: "This local draft is not legally approved and makes no standards conformance claim.",
    source: { metadata: st.sourceMeta, version: st.sourceVersion, text: st.sourceText },
    obligation: st.candidate,
    rule: st.rule,
    ruleApproval: st.ruleApproval,
    example: { id: studio.example.id, name: studio.example.name, sourceLinks: studio.example.sourceLinks },
    mappingShape: studio.reportFields.map(function (f) { return { field: f.key, concept: f.concept, possibleReference: f.reference || standardHints[f.key] || null }; }),
    localMappingsExcluded: true,
    conformanceCases: cases,
    evidenceShape: ["source lineage", "interpretation decisions", "rule version", "mapping profile", "release", "execution outcomes", "report digest", "content fingerprints"],
    sampleRowsIncluded: false,
    governance: { license: "Apache License 2.0", maintainer: "Repository maintainers", contributionReview: "See CONTRIBUTING.md and docs/governance.md" }
  };
  studio.downloadText("regulation_as_code_contribution_draft.json", JSON.stringify(bundle, null, 2));
  toast("Contribution draft downloaded. It excludes private mappings and input rows.");
}
function toggleRoadmap(index, checked) {
  const st = s();
  const done = new Set(Array.isArray(st.roadmapDone) ? st.roadmapDone : []);
  if (checked) done.add(index); else done.delete(index);
  st.roadmapDone = Array.from(done).sort();
  saveState();
  renderApp();
}
function resetAll() {
  studio.resetDemo(true);
  window.sessionRunRaC = null;
  helpOpen = false;
  resetConfirmOpen = false;
  renderApp();
}
function useExample(exampleId) {
  studio.loadExample(exampleId);
  window.sessionRunRaC = null;
  helpOpen = false;
  resetConfirmOpen = false;
  renderApp();
  toast("" + studio.example.name + " loaded. Start at the source review.");
}
function downloadExample(exampleId) {
  const example = studio.examples.find(function (item) { return item.id === exampleId; });
  if (!example) return toast("This example could not be found.");
  studio.downloadText(example.csvFile, exampleCsv(example), "text/csv;charset=utf-8");
  toast("Synthetic sample CSV saved to downloads.");
}
function handleAction(action, target) {
  if (action === "help") { helpOpen = true; renderApp(); return; }
  if (action === "closeHelp") { helpOpen = false; renderApp(); return; }
  if (action === "reset") { resetConfirmOpen = true; helpOpen = false; renderApp(); return; }
  if (action === "cancelReset") { resetConfirmOpen = false; renderApp(); return; }
  if (action === "confirmReset") return resetAll();
  if (action === "useExample") return useExample(target.dataset.example);
  if (action === "downloadExample") return downloadExample(target.dataset.example);
  if (action === "saveSource") return saveSourceForm();
  if (action === "draftObligation") return draftObligation();
  if (action === "approveLegal") return recordReview("legal");
  if (action === "approveCompliance") return recordReview("compliance");
  if (action === "saveRule") return saveRuleForm();
  if (action === "approveRule") return approveRuleNow();
  if (action === "editRule") return editApprovedRule();
  if (action === "approveMapping") return approveMappingNow();
  if (action === "editMapping") return editMappingNow();
  if (action === "runValidation") return runNow();
  if (action === "approveRelease") return approveReleaseNow();
  if (action === "exportCsv") return exportReport("csv");
  if (action === "exportJson") return exportReport("json");
  if (action === "createEvidence") return createEvidencePack();
  if (action === "verifyEvidence") return verifyEvidencePack();
  if (action === "downloadEvidence") return downloadEvidencePack();
  if (action === "reviewException") return recordExceptionReview(target.dataset.record);
  if (action === "reviewChange") return reviewChangeNow();
  if (action === "draftUpdatedObligation") return draftObligation();
  if (action === "sampleAmendment") return sampleAmendment();
  if (action === "openSource") return openSource();
  if (action === "exportShared") return exportContribution();
}
document.addEventListener("click", function (event) {
  const view = event.target.closest("[data-rac-view]");
  if (view) {
    event.preventDefault();
    s().view = view.dataset.racView;
    saveState();
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const step = event.target.closest("[data-rac-step]");
  if (step && !step.disabled) {
    s().view = "pipeline";
    s().stage = step.dataset.racStep;
    saveState();
    renderApp();
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }
  const action = event.target.closest("[data-rac-action]");
  if (!action || action.disabled) return;
  if (action.classList.contains("modalBackdrop") && event.target !== action) return;
  handleAction(action.dataset.racAction, action);
});
document.addEventListener("change", function (event) {
  const target = event.target;
  if (target.matches("[data-rac-map]")) return setMappingValue(target.dataset.racMap, target.value);
  if (target.matches("[data-rac-map-meta]")) {
    const parts = target.dataset.racMapMeta.split("|");
    return setMappingMeta(parts[0], parts[1], target.value);
  }
  if (target.id === "csvInputNew" && target.files && target.files[0]) return importCsvFile(target.files[0]);
  if (target.matches("[data-rac-roadmap]")) return toggleRoadmap(Number(target.dataset.racRoadmap), target.checked);
});
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && helpOpen) { helpOpen = false; renderApp(); }
  if (event.key === "Escape" && resetConfirmOpen) { resetConfirmOpen = false; renderApp(); }
});
function initializeRefresh() {
  const st = s();
  st.sourceMeta = Object.assign({}, sourceDefaults(), st.sourceMeta || {});
  st.rule = Object.assign({}, ruleDefaultsForExample(), st.rule || {});
  st.rule.settings = Object.assign({}, studio.example.rule.settings || {}, st.rule.settings || {});
  st.mappingMeta = Object.assign({}, Object.fromEntries(studio.reportFields.map(function (f) { return [f.key, { system: f.generated ? "Generated locally" : "Local sample file", owner: "Data steward", transform: f.generated ? "Assigned by row order during import" : "Direct field copy", quality: f.scope ? "Used for scope or control only" : "Present and valid" }]; })), st.mappingMeta || {});
  st.legalApproval = st.legalApproval || null;
  st.complianceApproval = st.complianceApproval || null;
  st.releaseApproval = st.releaseApproval || null;
  st.exceptionReviews = st.exceptionReviews || {};
  st.roadmapDone = st.roadmapDone || [];
  if (st.obligationApproval && (!st.legalApproval || !st.complianceApproval)) st.obligationApproval = null;
  if (!st.legalApproval || !st.complianceApproval) {
    st.ruleApproval = null;
    st.mappingApproval = null;
    st.releaseApproval = null;
    st.runSummary = null;
  }
  if (!window.sessionRunRaC && st.runSummary) {
    st.runSummary = null;
    st.releaseApproval = null;
  }
  if (st.evidenceManifest && (!st.evidenceManifest.rule || !st.evidenceManifest.rule.definition)) st.evidenceManifest = null;
  if (!stepItems.some(function (x) { return x.id === st.stage; })) st.stage = "source";
  if (st.stage === "evidence" && !st.evidenceManifest) st.stage = nextStep().step;
  if (!navItems.some(function (x) { return x.id === st.view; })) st.view = "overview";
  saveState();
  renderApp();
}
initializeRefresh();
