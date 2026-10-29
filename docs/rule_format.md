# Rule format

The main app implements its selected timing branches directly in TypeScript in `src/rule-timing.ts`. The branch, reporter assumption, source reference, and weekday calculation are shown together. The app does not determine legal applicability.

The portable catalog scaffold under `portable-source/catalog/` defines YAML structures for source, interpretation, rule, test plan, and catalog index. `npm run validate:catalog` checks the repository catalog copy. The application does not load catalog files as executable rules.

Any future rule format should preserve source lineage, scope, trigger, required fields, severity, effective date, owner, parameters, dependencies, test suite version, and release version. It should define a finite set of operations and stable outcomes before claiming interoperability.
