import { useState } from 'react';
import {
  ArrowRight, Check, ChevronRight, Code2, GitBranch, Landmark, Scale, ShieldCheck, Users,
} from 'lucide-react';
import { Link } from 'wouter';
import './overview-audience-hero.css';

type AudienceKey = 'institutions' | 'legal' | 'developers' | 'community';

const audiences: {
  id: AudienceKey;
  label: string;
  icon: typeof Landmark;
  value: string;
  actions: string[];
  note?: string;
}[] = [
  {
    id: 'institutions',
    label: 'Financial institutions',
    icon: Landmark,
    value: 'A reusable starting pattern; keep bank data and controls bank-owned.',
    actions: [
      'Confirm the applicable rule and version',
      'Add local mappings and institution controls',
      'Extend tests; configure reviewers and release ownership',
    ],
  },
  {
    id: 'legal',
    label: 'Legal & compliance',
    icon: Scale,
    value: 'Make assumptions and interpretation visible for review.',
    actions: [
      'Determine applicability',
      'Approve the institution interpretation',
      'Document assumptions for implementation and review',
    ],
    note: 'The prototype does not decide legal obligations.',
  },
  {
    id: 'developers',
    label: 'Developers',
    icon: Code2,
    value: 'Start with public citations, a synthetic example, tests, and a workflow definition.',
    actions: [
      'Connect local mappings and fixtures',
      'Add institution-specific tests',
      'Configure CI protections in the bank-owned repository',
    ],
  },
  {
    id: 'community',
    label: 'Open-source community',
    icon: Users,
    value: 'Share generic public-rule references, tests, and reusable improvements.',
    actions: [
      'Contribute improvements useful beyond one institution',
      'Keep institution-specific data, mappings, and policy decisions out of the shared project',
    ],
  },
];

const forkBenefits = [
  'Cited public rule',
  'Working synthetic example',
  'Human-selected reporting scenario',
  'Local mapping extension point',
  'Tests + GitHub Actions workflow definition',
  'Clear human handoff',
];

export function OverviewAudienceHero() {
  const [selected, setSelected] = useState<AudienceKey>('institutions');
  const activeAudience = audiences.find((audience) => audience.id === selected) ?? audiences[0];
  const activeIndex = audiences.findIndex((audience) => audience.id === selected);

  return (
    <section className="overview-audience-hero" aria-labelledby="overview-audience-title">
      <header className="oah-masthead">
        <span>FIELD NOTE 01</span>
        <span>OPEN SOURCE IN FINANCE · NYC 2026</span>
      </header>

      <div className="oah-hero">
        <div className="oah-intro">
          <div className="oah-kicker"><i aria-hidden="true" /> A 15-MINUTE WALK THROUGH A REPORTING PIPELINE</div>
          <h2 id="overview-audience-title">Regulation as Code</h2>
          <p className="oah-title-line">Open, executable and auditable reporting pipelines for financial services.</p>

          <div className="oah-thesis" data-testid="text-open-source-thesis">
            <span className="oah-thesis-label"><ShieldCheck size={17} aria-hidden="true" /> THE THESIS</span>
            <p>The open-source engine makes the work between rule and release easier to see, repeat, and review.</p>
          </div>

          <p className="oah-boundary">
            A transparent path from public rule to bank-owned, tested, reviewed change—while legal judgment, private data, and release authority stay inside the institution.
          </p>

          <div className="oah-actions">
            <Link href="/presenter" className="oah-cta" data-testid="link-start-presenter">
              Follow the 15-minute story <ArrowRight size={16} aria-hidden="true" />
            </Link>
            <a href="#pipeline" className="oah-secondary" data-testid="link-bird-eye-pipeline">
              View the bird’s-eye pipeline <ArrowRight size={15} aria-hidden="true" />
            </a>
            <button
              type="button"
              className="oah-repo-placeholder"
              disabled
              title="The public GitHub repository URL has not been added yet."
              data-testid="button-repo-pending"
            >
              <GitBranch size={16} aria-hidden="true" />
              <span><strong>GitHub repository</strong><small>Public link pending</small></span>
            </button>
          </div>
        </div>

        <aside className="oah-lens-panel" aria-label="Choose an audience lens">
          <div className="oah-lens-heading">
            <span>START WITH YOUR ROLE</span>
            <span className="oah-step" aria-hidden="true">0{activeIndex + 1} / 04</span>
          </div>
          <div className="oah-lens-list" role="group" aria-label="Audience">
            {audiences.map(({ id, label, icon: Icon }, index) => (
              <button
                key={id}
                type="button"
                className={`oah-lens-option${selected === id ? ' is-selected' : ''}`}
                aria-pressed={selected === id}
                data-testid={`button-audience-${id}`}
                onClick={() => setSelected(id)}
              >
                <span className="oah-lens-number">0{index + 1}</span>
                <Icon size={18} aria-hidden="true" />
                <span className="oah-lens-label">{label}</span>
                <ChevronRight size={15} className="oah-lens-arrow" aria-hidden="true" />
              </button>
            ))}
          </div>
          <div className="oah-lens-detail" aria-live="polite" data-testid="panel-audience-detail">
            <div className="oah-detail-eyebrow">AFTER FORKING · {activeAudience.label.toUpperCase()}</div>
            <p className="oah-lens-value">{activeAudience.value}</p>
            <ul>
              {activeAudience.actions.map((action) => (
                <li key={action}><Check size={15} aria-hidden="true" /><span>{action}</span></li>
              ))}
            </ul>
            {activeAudience.note && <p className="oah-audience-note">{activeAudience.note}</p>}
          </div>
        </aside>
      </div>

      <div className="oah-ownership" aria-label="Public and institution-owned responsibilities">
        <div className="oah-ownership-zone">
          <span>PUBLIC + SHAREABLE</span>
          <strong>Rule references and generic tests</strong>
          <small>Public sources · synthetic examples</small>
        </div>
        <div className="oah-fork-boundary">
          <GitBranch size={20} aria-hidden="true" />
          <strong>MANUAL FORK</strong>
          <small>Ownership changes here</small>
        </div>
        <div className="oah-ownership-zone oah-local-zone">
          <span>INSTITUTION-OWNED</span>
          <strong>Decisions, data, mappings, controls</strong>
          <small>Review and release authority stay local</small>
        </div>
      </div>

      <div className="oah-fork-strip" data-testid="panel-fork-benefits">
        <div className="oah-fork-heading">
          <span>IN THE PORTABLE SOURCE TEMPLATE</span>
          <strong>What you get after forking</strong>
        </div>
        <div className="oah-fork-items">
          {forkBenefits.map((benefit, index) => (
            <span key={benefit} data-testid={`text-fork-benefit-${index + 1}`}>{benefit}</span>
          ))}
        </div>
      </div>

      <footer className="oah-foot">
        <span>INDEPENDENT PROTOTYPE · NO ENDORSEMENT</span>
        <span>NO BANK DATA · NO LEGAL DECISION · NO AI IN THIS PROTOTYPE</span>
        <span>WORKFLOW DEFINITION INCLUDED · NOT CI OR RELEASE EVIDENCE</span>
      </footer>
    </section>
  );
}
