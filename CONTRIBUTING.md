# Contributing

Contributions should make reporting behavior easier to inspect, reproduce, and review. A test pass does not establish legal correctness.

## Propose a source or interpretation

Open an issue with the public source, relevant version and section, intended scope, and expected behavior. Do not post confidential institution information in an issue or pull request. Maintainers may ask for a narrower proposal or clearer source references.

## Change the workspace

1. Keep the source version, interpretation, rule display, calculation, and tests consistent.
2. Record the source title, authority, URL, publication or reporting version, section, effective date, and interpretation limits.
3. Update synthetic scenarios when behavior changes. Include valid, invalid, missing, boundary, and excluded cases where relevant.
4. Keep candidate mapping claims explicit. The app does not load the catalog as executable rules.
5. Update the [CFTC timing guide](docs/cftc_timing_demo.md) when source versions, branches, dates, or mapping claims change.

## Verify changes

Run:

```sh
npm ci
npm test
npm run validate:catalog
npm run package:source
npm run build
```

Update documentation when commands, outputs, browser storage, or limitations change. Keep committed records synthetic or approved public data with source, reporting period, retrieval date, privacy treatment, and redistribution rights documented. Keep internal mappings and operational evidence out of this repository.

When reviewers disagree, record alternatives and rationale. See [governance](docs/governance.md) and the [code of conduct](CODE_OF_CONDUCT.md).
