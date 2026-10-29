# Regulation as Code Studio

<img src="assets/regulation_as_code_mark.svg" alt="Regulation as Code logo" width="72" height="72" />

An open source local workbench for tracing a financial reporting obligation from its source through human review, an executable rule, data mapping, validation, report preview, and evidence.

**Release status:** public preview. The three bundled examples work locally. They are educational control examples, not official filing rules or production submission software.

## Conference experience

The conference experience builds on the reporting workflow in this repository. It extends that foundation with a selected CFTC Part 45 section 45.3 timing scenario, source and mapping views, a synthetic evaluation export, impact replay, an adoption journey, pilot economics, and presenter mode. The [conference guide](docs/conference_demo.md) describes the extension and its limits. The extra presentation views are not part of the local app in this checkout. Setup and example instructions below describe the repository app.

## Try it in five minutes

Install [Node.js 24 LTS](https://nodejs.org/en/download), then run:

```sh
git clone https://github.com/regulationascode/regulation_as_code.git
cd regulation_as_code
npm start
```

Open `http://127.0.0.1:4173`. No package installation or account is required. Choose an example, review its source and obligation, record local approvals, inspect the rule and mapping, run validation, review exceptions, release the local draft, then export a report preview and evidence pack. Run `npm test` to execute the bundled conformance checks.

The server listens on your own computer by default. Imported CSV data is processed in browser memory. Workflow entries are saved in that browser. Use **Reset demo** to clear them.

## Runnable examples

| Example | What a bank can evaluate | Data and source status |
| --- | --- | --- |
| [Corporate bond event reporting](profiles/bond_example/README.md) | A full reporting lifecycle with scope, timing, required fields, exceptions, release, and evidence | Entirely fictional obligation and synthetic rows |
| [HMDA loan register preflight](profiles/hmda_preflight/README.md) | Local checks for required values and selected field formats before formal HMDA review | Synthetic rows, with cited CFPB and FFIEC public references |
| [FFIEC Call Report balance check](profiles/call_report_check/README.md) | A Schedule RC balance check and exception review | Synthetic rows, with cited FFIEC and FDIC public references |

Each example includes valid and failing records and golden cases. The HMDA example can import a public Modified LAR CSV after a reviewer checks the suggested field mappings. A public Modified LAR is useful for exploration; it is not a bank's approved current filing source.

Only the fictional corporate bond profile demonstrates the full Studio workflow. HMDA and Call Report provide narrower preflight and reconciliation checks.

## How a bank uses this repository

Use a public fork only for contributions intended for public review. A fork of this public GitHub repository stays public. For internal bank work, create a private repository from a reviewed release or approved source copy through the bank's own process. See the [fork and privacy guide](docs/fork_guide.md).

1. Run the bundled profiles to understand the full control path.
2. Select one reporting obligation and record the official source, section, version, effective date, scope, and reporting period.
3. Have legal and compliance reviewers approve the interpretation outside this demo.
4. Add a profile and golden cases using [the adoption guide](docs/bank_adoption.md). Keep institution data, source system mappings, credentials, reviewer identities, and run evidence in the bank's private environment.
5. Connect approved identity, access, retention, and filing controls before operational use.

Today, adding a new reporting domain requires a developer to add its deterministic validator. The current application does not load arbitrary rule definitions as executable logic. That is a deliberate boundary for this preview, and the [roadmap](docs/roadmap.md) describes the planned profile format.

## What is shared and what stays local

Public contributions may include cited source metadata, approved rule shapes, generic field concepts, synthetic fixtures, and conformance cases. Do not contribute bank records, internal mappings, credentials, personal information, or operational evidence. The application has no cloud service or regulator connection.

## Documentation

| Start here | Purpose |
| --- | --- |
| [Quickstart](docs/quickstart.md) | Run and inspect every example |
| [Conference guide](docs/conference_demo.md) | Understand the extended CFTC timing walkthrough and its limits |
| [Bank adoption](docs/bank_adoption.md) | Fork safely and create a local pilot |
| [Fork and privacy](docs/fork_guide.md) | Choose a public contribution or private institutional copy |
| [Architecture](docs/architecture.md) | Understand the pipeline and code |
| [Rule format](docs/rule_format.md) | Understand fields, parameters, and conformance cases |
| [Evidence](docs/evidence.md) | Understand exports and integrity limits |
| [Standards](docs/standards.md) | See the real scope of standards alignment |
| [Governance](docs/governance.md) | See review, dissent, and release expectations |
| [Limitations](docs/limitations.md) | See what is not production ready |

See [CONTRIBUTING.md](CONTRIBUTING.md) for proposed changes, [SECURITY.md](SECURITY.md) for private vulnerability reports, and [SUPPORT.md](SUPPORT.md) for usage questions.

## Scope and trust

The rules here are deterministic and testable, but the cited public material has not been converted into an official regulator validation suite. Approval names entered in the app do not verify identity. Evidence hashes detect changes to captured content, but exports are not signed or held in immutable storage. No regulator, bank, standards body, or open source foundation endorses this preview.

The project is licensed under [Apache License 2.0](LICENSE). Reporting and legal accountability remain with the adopting institution.
