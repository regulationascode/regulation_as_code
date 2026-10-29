import { useState } from 'react';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronRight,
  CircleDashed,
  FileCheck2,
  GitFork,
  Landmark,
  Scale,
  ShieldCheck,
  TestTube2,
} from 'lucide-react';
import { Link } from 'wouter';
import './pipeline-experience.css';

type PipelineStep = {
  number: string;
  role: string;
  title: string;
  status: string;
  summary: string;
  input: string;
  output: string;
  today: string;
  next: string;
  artifact: string;
  artifactStatus: string;
  evidenceNote: string;
  actionLabel: string;
  actionHref: string;
  actionType?: 'external' | 'download';
};

const sharedSteps: PipelineStep[] = [
  {
    number: '01',
    role: 'REGULATOR · PUBLIC',
    title: 'Public rule',
    status: 'SOURCE CITED',
    summary: 'Start with the public obligation, not private institution data.',
    input: 'Published CFTC rule text, such as 17 CFR §45.3.',
    output: 'A cited source and the exact rule version selected for review.',
    today: 'The prototype links public source material and labels demo assumptions. It does not own or interpret the law.',
    next: 'Legal and compliance confirm which rule and version apply.',
    artifact: 'CFTC §45.3 source text',
    artifactStatus: 'AVAILABLE · OFFICIAL SOURCE',
    evidenceNote: 'The citation is public. Legal meaning and applicability remain for people to determine.',
    actionLabel: 'Open official eCFR text',
    actionHref: 'https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.3',
    actionType: 'external',
  },
  {
    number: '02',
    role: 'OPEN-SOURCE PROJECT',
    title: 'Shared code + tests',
    status: 'PORTABLE PACKAGE',
    summary: 'Share generic code and synthetic tests under the repository license.',
    input: 'Public citations, generic rule scaffolding, and synthetic examples.',
    output: 'A portable source package with tests and a CI workflow.',
    today: 'The package includes synthetic weekday timing tests and build checks—not bank trades, private mappings, or approved policy.',
    next: 'A bank adds the package to a repository it controls and decides what generic changes to contribute back.',
    artifact: 'Portable source + CI workflow',
    artifactStatus: 'AVAILABLE · SYNTHETIC',
    evidenceNote: 'The package contains synthetic weekday tests and build checks. It does not handle holidays or validate an institution.',
    actionLabel: 'Download portable source',
    actionHref: `${import.meta.env.BASE_URL}portable-source.zip`,
    actionType: 'download',
  },
];

const institutionSteps: PipelineStep[] = [
  {
    number: '03',
    role: 'BANK LEGAL + COMPLIANCE',
    title: 'Human decision',
    status: 'HUMAN-OWNED',
    summary: 'People determine applicability and approve the institution’s interpretation.',
    input: 'The cited public rule, institution context, and legal analysis.',
    output: 'An institution-approved interpretation and documented assumptions.',
    today: 'The prototype exposes scenario assumptions but does not decide applicability or provide legal advice.',
    next: 'The bank records who approved its interpretation and under what authority.',
    artifact: 'Institution decision record',
    artifactStatus: 'NOT PROVIDED BY PROTOTYPE',
    evidenceNote: 'The institution must create and retain the decision, approver, authority, and rationale.',
    actionLabel: 'Explore the demo obligation',
    actionHref: '/obligations',
  },
  {
    number: '04',
    role: 'BANK REPORTING + DATA',
    title: 'Local mapping',
    status: 'LOCAL / PRIVATE',
    summary: 'Map institution fields to reporting concepts and standards.',
    input: 'Approved interpretation, internal data definitions, and candidate CDM semantics.',
    output: 'A bank-owned mapping from internal fields to its reporting model.',
    today: 'The app shows a conceptual FINOS CDM crosswalk only; there is no CDM runtime integration or bank data.',
    next: 'The institution validates and versions its own field mappings locally.',
    artifact: 'Conceptual FINOS CDM crosswalk',
    artifactStatus: 'CONCEPTUAL · NO RUNTIME',
    evidenceNote: 'This is not a bank mapping. The prototype has no CDM runtime or internal institution data.',
    actionLabel: 'Inspect conceptual mapping',
    actionHref: '/mappings',
  },
  {
    number: '05',
    role: 'ENGINEERING + CI',
    title: 'Run tests',
    status: 'LIMITED DEMO TESTS',
    summary: 'Run synthetic checks, then add institution-specific validation.',
    input: 'Rule assumptions, local mappings, synthetic fixtures, and test code.',
    output: 'A repeatable pass/fail result attached to a proposed change.',
    today: 'Portable tests cover synthetic weekday timing branches and build checks—not legal meaning, holidays, or bank mappings.',
    next: 'Developers add and maintain tests for the institution’s approved interpretation and data.',
    artifact: 'Weekday timing test results',
    artifactStatus: 'AVAILABLE · SYNTHETIC',
    evidenceNote: 'The timing checks are narrow demonstrations; passing them does not establish compliance or mapping correctness.',
    actionLabel: 'Open synthetic timing checks',
    actionHref: '/validation',
  },
  {
    number: '06',
    role: 'REVIEWER + CODE OWNER',
    title: 'Review code change',
    status: 'HUMAN REVIEW',
    summary: 'A named reviewer assesses the change; CI is supporting evidence.',
    input: 'Source references, approved decisions, mapping changes, and test results.',
    output: 'A reviewed change with an accountable human decision.',
    today: 'The portable package includes a CI workflow; authenticated approvals and repository protections are not part of this demo.',
    next: 'The bank configures reviewers, access rules, and approval requirements in its own repository.',
    artifact: 'Authenticated reviewer approval',
    artifactStatus: 'NOT IMPLEMENTED',
    evidenceNote: 'The institution must provide the reviewer identity, approval policy, and repository protections.',
    actionLabel: 'Review governance boundaries',
    actionHref: '/governance',
  },
  {
    number: '07',
    role: 'INSTITUTION RELEASE OWNER',
    title: 'Release evidence',
    status: 'FUTURE / LOCAL',
    summary: 'Release under the institution’s controls and retain its evidence.',
    input: 'Approved code, reviewer decisions, test results, and local release controls.',
    output: 'An institution-owned release record and trace to the reviewed change.',
    today: 'Release evidence capture is not implemented in this prototype.',
    next: 'The release owner connects the workflow to existing change and records controls.',
    artifact: 'Institution release record',
    artifactStatus: 'NOT IMPLEMENTED',
    evidenceNote: 'Production release evidence must come from institution-controlled systems and processes.',
    actionLabel: 'See the synthetic evaluation preview',
    actionHref: '/evidence',
  },
];

const steps = [...sharedSteps, ...institutionSteps];

function StageCard({
  step,
  selected,
  onSelect,
}: {
  step: PipelineStep;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={`ep-stage${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-controls="ep-stage-detail"
      data-testid={`pipeline-step-${step.number}`}
    >
      <span className="ep-stage-index">{step.number}<ChevronRight size={17} aria-hidden="true" /></span>
      <span className="ep-stage-role">{step.role}</span>
      <strong>{step.title}</strong>
      <span className="ep-stage-status">{step.status}</span>
      <span className="ep-stage-view">INSPECT EVIDENCE <ArrowRight size={14} aria-hidden="true" /></span>
    </button>
  );
}

function EvidenceAction({ step }: { step: PipelineStep }) {
  if (step.actionType === 'external') {
    return <a className="ep-artifact-link" href={step.actionHref} target="_blank" rel="noreferrer" data-testid={`pipeline-evidence-link-${step.number}`}>{step.actionLabel}<ArrowRight size={15} aria-hidden="true" /></a>;
  }
  if (step.actionType === 'download') {
    return <a className="ep-artifact-link" href={step.actionHref} download data-testid={`pipeline-evidence-link-${step.number}`}>{step.actionLabel}<ArrowRight size={15} aria-hidden="true" /></a>;
  }
  return <Link className="ep-artifact-link" href={step.actionHref} data-testid={`pipeline-evidence-link-${step.number}`}>{step.actionLabel}<ArrowRight size={15} aria-hidden="true" /></Link>;
}

export function PipelineExperience() {
  const [selectedNumber, setSelectedNumber] = useState('01');
  const active = steps.find((step) => step.number === selectedNumber) ?? steps[0];
  const isShared = Number(active.number) <= 2;
  const isSynthetic = active.number === '02' || active.number === '05';
  const ArtifactIcon = active.number === '05' ? TestTube2 : ['03', '06', '07'].includes(active.number) ? CircleDashed : FileCheck2;
  const artifactPresent = active.artifactStatus.startsWith('AVAILABLE');

  return (
    <div className="evidence-pathway">
      <section className="ep-map-section" aria-labelledby="ep-map-title">
        <div className="ep-section-heading">
          <div>
            <span className="ep-overline">SEVEN STAGES · TWO OWNERSHIP DOMAINS</span>
            <h2 id="ep-map-title">From public rule to local release.</h2>
          </div>
          <p>One synthetic CFTC §45.3 example. Select a stage to inspect its evidence and limits.</p>
        </div>

        <div className="ep-map" role="group" aria-label="Seven clickable pipeline stages, split by a manual repository fork">
          <section className="ep-domain ep-domain-public" aria-labelledby="ep-public-title">
            <div className="ep-domain-heading">
              <span className="ep-domain-symbol"><Landmark size={18} aria-hidden="true" /></span>
              <div><span>01—02 · SHAREABLE</span><h3 id="ep-public-title">Public + open project</h3></div>
              <span className="ep-domain-tag">PUBLIC RECORD</span>
            </div>
            <div className="ep-stages ep-stages-public">
              {sharedSteps.map((step) => <StageCard key={step.number} step={step} selected={selectedNumber === step.number} onSelect={() => setSelectedNumber(step.number)} />)}
            </div>
          </section>

          <div className="ep-handoff" aria-label="Manual repository fork; institution owns work beyond this point">
            <div className="ep-handoff-rule" />
            <span className="ep-handoff-icon"><GitFork size={20} aria-hidden="true" /></span>
            <b>MANUAL<br />FORK</b>
            <span className="ep-handoff-caption">Institution takes control</span>
            <ArrowRight className="ep-handoff-arrow" size={20} aria-hidden="true" />
            <div className="ep-handoff-rule" />
          </div>

          <section className="ep-domain ep-domain-local" aria-labelledby="ep-local-title">
            <div className="ep-domain-heading">
              <span className="ep-domain-symbol"><ShieldCheck size={18} aria-hidden="true" /></span>
              <div><span>03—07 · AFTER FORK</span><h3 id="ep-local-title">Institution-controlled</h3></div>
              <span className="ep-domain-tag">LOCAL / PRIVATE</span>
            </div>
            <div className="ep-stages ep-stages-local">
              {institutionSteps.map((step) => <StageCard key={step.number} step={step} selected={selectedNumber === step.number} onSelect={() => setSelectedNumber(step.number)} />)}
            </div>
          </section>
        </div>

        <div className="ep-map-legend">
          <span><i className="ep-legend-public" /> Shareable upstream</span>
          <span><i className="ep-legend-local" /> Institution-owned after fork</span>
          <span className="ep-map-hint">All stages stay visible as details change</span>
        </div>
      </section>

      <section className="ep-detail" id="ep-stage-detail" role="region" aria-live="polite" aria-labelledby="ep-detail-title" data-testid="pipeline-stage-detail">
        <div className="ep-detail-heading">
          <div className="ep-detail-index">{active.number}</div>
          <div className="ep-detail-title">
            <span className="ep-overline">{active.role}</span>
            <h2 id="ep-detail-title">{active.title}</h2>
            <p>{active.summary}</p>
          </div>
          <span className={`ep-ownership-pill ${isShared ? 'is-shared' : 'is-local'}`}>{isShared ? 'PUBLIC / SHAREABLE' : 'INSTITUTION-OWNED'}</span>
        </div>

        <div className="ep-detail-columns">
          <div className="ep-detail-copy">
            <div className="ep-input-output">
              <article><span>INPUT</span><p>{active.input}</p></article>
              <article><span>OUTPUT</span><p>{active.output}</p></article>
            </div>
            <div className="ep-reality"><span className="ep-overline">WHAT THIS PROTOTYPE ACTUALLY DOES</span><p>{active.today}</p></div>
            <div className="ep-next"><span><ArrowRight size={17} aria-hidden="true" /> INSTITUTION'S NEXT STEP</span><p>{active.next}</p></div>
          </div>

          <aside className="ep-evidence" aria-label={`Evidence artifact: ${active.artifact}`}>
            <div className="ep-evidence-top"><span className="ep-overline">EVIDENCE ARTIFACT</span><span className="ep-evidence-index">E / {active.number}</span></div>
            <div className="ep-artifact-icon"><ArtifactIcon size={24} aria-hidden="true" /></div>
            <h3>{active.artifact}</h3>
            <span className={`ep-artifact-status ${artifactPresent ? 'is-present' : 'is-pending'}`}>
              {artifactPresent ? <Check size={16} aria-hidden="true" /> : <CircleDashed size={16} aria-hidden="true" />}
              {active.artifactStatus}
            </span>
            <p>{active.evidenceNote}</p>
            {isSynthetic ? <div className="ep-synthetic-note"><span>SYNTHETIC DATA</span><span>Demonstration fixture · not institution data</span></div> : null}
            <EvidenceAction step={active} />
          </aside>
        </div>
      </section>

      <section className="ep-boundaries" aria-label="Prototype boundaries">
        <div className="ep-boundary-heading"><span className="ep-overline">READ THE BOUNDARIES</span><ArrowDown size={18} aria-hidden="true" /></div>
        <div className="ep-boundary-grid">
          <p><b>Tests are not legal evidence.</b> Synthetic weekday checks do not establish legal meaning, holiday handling, or bank mapping correctness.</p>
          <p><b>People make the decisions.</b> No live AI is used. Any future AI may suggest drafts for human review—not legal or release decisions.</p>
          <p><b>Release evidence stays local.</b> Authenticated approvals and production release evidence are not implemented here.</p>
        </div>
        <div className="ep-footer-line"><span>INDEPENDENT OPEN-SOURCE REPORTING-ENGINE PROTOTYPE</span><span>TRACE THE EVIDENCE · KEEP OWNERSHIP CLEAR</span></div>
      </section>
    </div>
  );
}
