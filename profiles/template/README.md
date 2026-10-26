# Profile worksheet

Use this worksheet in a private bank environment before adding a new public example.

1. **Source:** authority, title, URL, publication version, section, exact excerpt or approved summary, effective date, and access date.
2. **Interpretation:** jurisdiction, covered entities, products, scope, trigger, exclusions, deadline, and rationale.
3. **Review:** legal reviewer, compliance reviewer, reporting owner, decision, date, and any dissent. Keep real identities private.
4. **Rule:** stable identifier, version, parameters, required fields, severity, dependencies, and deterministic checks.
5. **Mapping:** generic field concept, local source column, owner, transform, unit, and quality assumption. Keep internal mapping private.
6. **Golden cases:** valid, invalid, missing, boundary, excluded, and exception inputs with expected outcomes.
7. **Output:** report fields, exception handling, evidence contents, and retention requirements.
8. **Change:** affected source version, rule version, mappings, tests, and release decision.

For this preview, implement the profile object in `src/core/examples.js` and its validator in `src/core/validation.js`. Use synthetic rows in the public repository. See [the rule format](../../docs/rule_format.md) and [the contribution guide](../../CONTRIBUTING.md).
