# Current rule format

Profiles are JavaScript objects in `src/core/examples.js`. Each profile records an identifier, name, source metadata and links, obligation scope and trigger, rule identifier and version, fields, sample rows, golden cases, and a validator key. The validator key selects a deterministic function in `src/core/validation.js`.

The current format is executable application code, not a published rule language. Do not treat the display text of a rule as proof that the engine executes every sentence in that text. Review the selected validator and its golden cases together.

Each golden case records input values and an expected outcome. The suite compares the expected outcome with the validator result. Cases should cover applicable and excluded populations, valid and invalid rows, required fields, boundaries, dates, duplicate keys, and exceptions where relevant.

For a new profile, start with [the template](../profiles/template/README.md) and [the contribution guide](../CONTRIBUTING.md). Keep source interpretation and executable checks synchronized. Where a jurisdiction permits more than one defensible interpretation, document the alternatives and approval decision.

A future portable profile schema should include source lineage, scope, trigger, required fields, severity, effective date, owner, parameters, dependencies, test suite version, and release version. It must define a finite set of operations and stable outcomes before claiming interoperability.
