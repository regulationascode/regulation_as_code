# Governance

## Status lifecycle

Every regulation package declares its status independently for source provenance, interpretation, implementation, and tests:

`source-identified → source-captured → interpretation-draft → human-reviewed → implementation-reviewed → tested → released`

These statuses describe repository work. None means “compliant,” “regulator-approved,” or applicable to a particular institution.

## Review responsibilities

- **Legal/compliance:** confirms source selection, interpretation, applicability assumptions, and unresolved legal questions.
- **Reporting/data:** reviews reporting fields, data lineage, and local mapping boundaries.
- **Engineering:** reviews deterministic behavior, test coverage, dependency and workflow changes.
- **Repository maintainers:** enforce the organization's branch, license, release, and contribution policies.

The organization should map these roles to actual `CODEOWNERS` teams and protected-branch settings. This template does not configure those remote settings.

## Release evidence

A release should identify the source snapshot(s), effective dates, interpretation revision, implementation commit, test result, and human approvals. Git history and a green Actions run alone are not tamper-evident audit evidence or proof of legal correctness.
