# Regulation as Code Studio

<img src="assets/regulation_as_code_mark.svg" alt="Regulation as Code logo" width="72" height="72" />

An open source workbench for exploring how a public financial reporting obligation can move through human interpretation, machine readable rules, data mapping, deterministic checks, and reviewable evidence.

**Release status:** public preview. The workspace demonstrates selected CFTC Part 45 section 45.3 timing branches with synthetic values. It is not an official rule engine, a filing service, or a production reporting system.

## Run locally

Install [Node.js 24](https://nodejs.org/en/download), then run:

```sh
git clone https://github.com/regulationascode/regulation_as_code.git
cd regulation_as_code
npm ci
npm start
```

Open `http://127.0.0.1:4173`. The app runs in your browser and needs no account or backend service.

## Explore the workflow

The workspace follows a synthetic timing scenario through these views:

1. Overview and public source record
2. Obligation branch selection and rule draft
3. Candidate data mapping and deterministic timing check
4. Synthetic evaluation envelope and impact replay
5. Governance, adoption, pilot economics, and presenter mode

The app keeps scenario, review, and pilot values in browser storage. Review buttons change demonstration state only. The Evidence view downloads a synthetic JSON envelope, not a filing. See the [CFTC timing guide](docs/cftc_timing_demo.md) for source versions and limits.

## Portable catalog scaffold

The Adoption view offers a downloadable catalog scaffold with schemas, one CFTC timing example, synthetic tests, and a continuous integration workflow. The scaffold validates its own catalog files. The workspace does not load catalog rules as executable logic.

To package the scaffold again after changing its files, run:

```sh
npm run package:source
```

## Data and trust boundaries

The app has no backend database, live AI, regulator feed, institution connection, filing connection, or identity service. Scenario values remain in this browser. Downloaded files contain the values shown in the app and should be handled under your institution's data policy.

The timing calculation counts weekdays only. It does not apply legal holidays or determine the relevant reporting location. Candidate CDM paths are conceptual. Human reviewers must confirm the applicable source, version, interpretation, mapping, calendar, and controls before operational use.

## Documentation

| Guide | Purpose |
| --- | --- |
| [Quickstart](docs/quickstart.md) | Install, run, and verify the workspace |
| [CFTC timing](docs/cftc_timing_demo.md) | Review branches, source versions, calendar, and mapping limits |
| [Architecture](docs/architecture.md) | See how the app and catalog scaffold fit together |
| [Adoption](docs/adoption.md) | Plan an institution owned pilot |
| [Rule format](docs/rule_format.md) | Understand the timing code and catalog files |
| [Evidence](docs/evidence.md) | Understand the evaluation envelope and browser storage |
| [Standards](docs/standards.md) | Review the standards references and their limits |
| [Governance](docs/governance.md) | Review human ownership and local approval controls |
| [Fork and privacy](docs/fork_guide.md) | Set repository and data boundaries |
| [Limitations](docs/limitations.md) | Review what the prototype does not provide |
| [Roadmap](docs/roadmap.md) | See proposed future work |

See [CONTRIBUTING.md](CONTRIBUTING.md), [SECURITY.md](SECURITY.md), and [SUPPORT.md](SUPPORT.md) for project guidance.

The project uses the [Apache License 2.0](LICENSE). Legal interpretation and reporting decisions remain with the adopting institution.
