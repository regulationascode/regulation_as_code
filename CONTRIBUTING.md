# Contributing

Contributions should make reporting behavior easier to inspect, reproduce, and review. An executable rule requires a cited source, a recorded interpretation, deterministic behavior, and golden cases. A passing test does not establish legal correctness.

## Before proposing a change

Open an issue describing the reporting domain, official source, expected user benefit, and scope. Do not post confidential bank information in an issue or pull request. Maintainers may ask for a smaller profile or more precise source references before accepting implementation work.

## Add or update an example

1. Read [the profile format](docs/rule_format.md) and an existing profile guide under `profiles/`.
2. Record source title, authority, URL, publication or reporting version, relevant section, effective date, and any limits of interpretation.
3. Add source context, fields, rule metadata, sample rows, and cases in `src/core/examples.js`.
4. Add deterministic checks in `src/core/validation.js` when existing checks do not express the new domain.
5. Cover valid, invalid, missing, boundary, excluded, and exception scenarios as applicable.
6. Run `npm run examples:export` and `npm test`, then update the profile guide and README.

All committed records must be synthetic or explicitly approved public data with source, reporting period, retrieval date, privacy treatment, and redistribution rights documented. Keep internal field mappings and execution evidence out of this repository.

## Review rules

Changes to source interpretation, rule behavior, and expected results should be reviewed together. A rule author should not be the sole reviewer of the interpretation or release. When reviewers disagree, record the alternatives and rationale instead of silently choosing one. See [governance](docs/governance.md).

Please use respectful, specific language in issues and reviews. The [code of conduct](CODE_OF_CONDUCT.md) applies to project spaces.
