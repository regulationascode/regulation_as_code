# Repository architecture

The public repository should hold reusable, non-confidential material: the engine, source references, human-reviewed generic interpretations, synthetic tests, and contributor guidance. An institution's private implementation belongs in an institution-controlled private repository.

```text
regulation-as-code/
├── README.md
├── LICENSE                         # Keep the organization's approved license
├── CONTRIBUTING.md
├── GOVERNANCE.md
├── SECURITY.md
├── CODE_OF_CONDUCT.md              # Optional; use the organization's chosen policy
├── .gitignore
├── .github/
│   ├── CODEOWNERS                  # Replace example teams with real org teams
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml
├── docs/
│   ├── repository-architecture.md
│   ├── fork-guide.md
│   └── regulation-ingestion.md
├── catalog/
│   ├── index.yaml
│   ├── schemas/
│   │   ├── catalog-index.schema.json
│   │   ├── source-manifest.schema.json
│   │   ├── interpretation.schema.json
│   │   ├── rule.schema.json
│   │   └── test-plan.schema.json
│   └── jurisdictions/
│       └── us/
│           └── cftc/
│               └── part-45/
│                   └── section-45-3/
│                       ├── sources.yaml
│                       ├── interpretation.yaml
│                       ├── rule.yaml
│                       └── test-plan.yaml
├── scripts/
│   └── validate-catalog.mjs
├── src/
│   ├── rule-timing.ts              # Existing narrow synthetic demo logic
│   └── ...
├── tests/
│   └── rule-timing.test.mjs
├── package.json
└── pnpm-lock.yaml
```

## What belongs in each layer

- `catalog/index.yaml`: the discoverable catalog and each package's lifecycle status.
- `sources.yaml`: official citations, source URLs, format, version/as-of dates, retrieval metadata, and content hashes.
- `interpretation.yaml`: a human-authored account of applicability decisions, obligation, assumptions, owner, and limitations.
- `rule.yaml`: the implementation reference and scope. Do not put an unreviewed legal conclusion into executable logic.
- `test-plan.yaml`: which synthetic cases exist, which boundary cases are required, and what the tests do not establish.
- `catalog/schemas/`: machine-readable contracts for those YAML documents. The validator enforces these shapes; schemas validate structure, not legal correctness.
- `src/` and `tests/`: deterministic implementation and synthetic test fixtures. Private bank mappings do not go here in a public repository.

Each regulation has its own package. Do not make one giant YAML file for every jurisdiction, regulator, instrument, and effective date.

## Versioning

Keep legal-source versioning separate from software releases:

- **Source snapshot:** the publication or point-in-time text, retrieval date, effective date, and content hash.
- **Interpretation revision:** a reviewed interpretation linked to source IDs and reviewers.
- **Implementation release:** a Git tag or commit containing code, tests, and the catalog revision.

A source update can create a review task. It must not silently change the approved interpretation or executable rule.
