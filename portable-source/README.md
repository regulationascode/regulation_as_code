# Regulation-as-Code

A synthetic data demonstration that traces selected CFTC Part 45 §45.3 swap creation timing branches from public source text to a local evaluation.

Keep the organization's approved root `LICENSE` and required notices when adding this package. This source bundle does not replace the repository owner's license choice.

## Regulation catalog

This package now includes a catalog scaffold for adding reviewed regulation packages. It does **not** contain every financial regulation, a complete CFTC Part 45 implementation, or a legal interpretation approved for any institution.

- `catalog/index.yaml` lists packages and their review status.
- Each regulation package separates source provenance, human interpretation, implementation status, and synthetic test coverage.
- `pnpm run validate:catalog` checks YAML syntax, schema shape, required source references, and release-state safeguards.
- The example package remains `draft` / `prototype-only`; a green CI run is not legal approval or compliance evidence.

See [`docs/repository-architecture.md`](docs/repository-architecture.md) and [`docs/regulation-ingestion.md`](docs/regulation-ingestion.md) before adding another rule.

## Run locally

Requirements: Node.js 22.12+ and pnpm 10.26.1.

```sh
pnpm install --frozen-lockfile
pnpm run validate:catalog
pnpm test
pnpm run dev
```

Create a production build with:

```sh
pnpm run build
```

The built static site is in `dist/`. Deploy that folder to a static host of your choice. Configure the host to serve `index.html` for application routes such as `/presenter` and `/adoption`.

## GitHub Actions

The included `.github/workflows/ci.yml` runs on pull requests to `main`, pushes to `main`, and manual dispatch. It validates the catalog, installs locked dependencies, runs synthetic timing tests, and builds the app. It uses read-only repository permissions and does not deploy the site or access secrets.

The timing tests verify only the prototype's weekday-only date calculation for its three selected branches. They do not verify regulatory interpretation, legal applicability, field mappings, holiday calendars, SDR requirements, or compliance.

## Forking and institutional privacy

Public forks of a public GitHub repository are public. Use a public fork only for work intended for public contribution. For an institution's private mappings, policies, fixtures, credentials, approvals, or operational controls, create an institution-controlled private repository from a reviewed release or copy of the shared package. Keep those artifacts out of the public upstream and public forks. See [`docs/fork-guide.md`](docs/fork-guide.md).

## Regulation-source lifecycle

Official source files and structured rules are separate. The eCFR API can provide CFR text as XML, while CFTC reporting technical specifications are separate, versioned publications. The repository records source URLs, dates, versions, and hashes; a person reviews legal meaning and applicability before executable logic is approved. Source monitoring may open a review issue or pull request, but it must not silently rewrite or auto-approve a rule.

## Demo boundaries

- Uses public CFTC source text and synthetic scenario values only.
- Stores editable demo and pilot-observation state in the current browser's local storage.
- Does not call a live AI model, backend, regulator, bank, vendor, or standards system.
- Evaluates only the selected §45.3 timing branch with a weekday-only demo calendar; legal holidays are not integrated.
- Includes a selected, conceptual vanilla-IRS crosswalk from CFTC technical-specification field definitions to candidate FINOS CDM 7.0.0 model locations. It is not a complete Appendix 1 map, SDR payload schema, DRR execution, or full compliance validation.
- The prototype references CFTC Technical Specification v3.2 from March 2023. The CFTC source page also lists December 2023 clean/redline publications; reconcile those and any later current materials before implementation. The observed UTI/USI versus UTI discrepancy across source versions must be resolved against the current Commission specification and SDR profile.
- Does not verify institution-specific mappings, UPI designation or identifier compatibility, submissions, or the exact current ISDA DRR Part 45 package and version.
- The downloadable JSON is a synthetic evaluation envelope, not a submission file, legal advice, or production control.
- No live AI is used; interpretation and approval remain human responsibilities.
- The change-control and release-record experience is a target design, not an implemented production governance system. CI validates catalog structure, runs only the synthetic timing tests, typechecks and builds; there are no authenticated approval records or full regulatory rule validations.
- Modeled economics are editable assumptions, not measured savings or guarantees.
- Pilot comparisons require a written work-item definition and measurement method, matching positive item counts, date windows, role hours, rework and evidence counts. They are descriptive, not causal.
- An optional button-loaded walkthrough uses invented values to demonstrate the calculations; it stays explicitly labeled synthetic in the interface and exported JSON.
- Pilot inputs are editable browser-local records, not signed, tamper-evident evidence, an audit log or independent assurance.

## Fork-to-pilot path

1. For public generic work, fork the public repository to an organization or account you control. For institution-specific work, create a private internal repository from a reviewed release; a public-repository fork stays public. Keep `.github/workflows/ci.yml` and `pnpm-lock.yaml` at the repository root. This app does not connect to Git, create or fork a repository, configure a remote, or push commits.
2. Review the source, repository permissions, branch protections and release process under your institution's policy; retain the approved license and required notices when copying the package.
3. Open a pull request and confirm the **Regulation catalog CI** check passes. Configure protected-branch rules and require this check before merging, with reviewer teams selected by the repository owner. CI checks schema shape, synthetic calculations, and build health; it is not legal validation.
4. Run the synthetic example locally with the commands above. Review the public rule interpretation, current technical specifications, SDR requirements, business-day calendar and applicable facts with accountable legal and compliance owners.
5. Keep institution-specific mappings, policy, identifiers, credentials, approval evidence and operational controls in institution-controlled systems. Build and independently validate those controls before considering a pilot.
6. Define comparable work, windows, inclusion rules and role-hour capture before the pilot. Record baseline and post-pilot observations and investigate confounders; do not present differences as causal savings or guarantees.
7. Review any proposed public contribution for confidential information, institution-specific mappings, policy, approval evidence, secrets and licensing before sharing.

The pilot-observation inputs in the demo are stored in the current browser only. The optional JSON download contains the values entered and is not tamper-evident; follow institutional data-handling policy and do not enter personal, trade, customer, employee or bank identifiers. The optional example is fictional and is not pilot evidence. The separate editable cost model is illustrative, not measured savings.

This is a portable standalone frontend. It contains no credentials or institution data.
