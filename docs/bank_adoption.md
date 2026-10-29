# Bank adoption

## First pilot

Choose one narrow obligation that has a public source and can be tested with synthetic data. Start with a bank approved interpretation and a named control owner. A local reporting team should confirm applicability, timing, field definitions, and the current regulator instructions before adapting code.

1. Choose the repository boundary first. Use a public fork for work intended for public review. A fork of this public GitHub repository stays public. For internal bank work, create a private repository from a reviewed release or approved source copy through the bank's process. See the [fork and privacy guide](fork_guide.md).
2. Run the three sample profiles and `npm test`.
3. Copy the [profile worksheet](../profiles/template/README.md) into the bank's private records.
4. Record the official source link, version, section, effective date, scope, trigger, deadline, and required fields.
5. Create synthetic valid, invalid, missing, boundary, excluded, and exception records.
6. Add the profile definition in `src/core/examples.js` and its deterministic validator in `src/core/validation.js`. Add golden cases in the profile and tests in `test/`.
7. Map the bank's own source columns locally. Record data owners, transforms, and quality assumptions in the bank's private system.
8. Review exceptions, report previews, and evidence with the reporting control owner.

The three shipped profiles are immediately runnable. A new reporting domain still needs code. A declarative rule format with an external profile loader is planned, but is not presented as working today.

## Data boundary

This public repository contains synthetic fixtures. Keep customer and trade records, internal table names, personal information, credentials, real approval identities, and execution evidence in the institution's approved environment. Do not put real bank CSV files in issues, pull requests, or a public fork.

The local web app processes an imported CSV in browser memory and does not upload it to a project service. Its approval and evidence controls are a demonstration. A production integration needs authenticated roles, separation of duties, protected storage, retention policy, monitoring, and a filing contract.

## Measure value honestly

For a pilot, measure time to map a field, time to understand a failed row, time to update a rule after a source change, and evidence completeness against the existing process. This project has not measured cost savings, error reduction, regulator acceptance, or audit outcomes.
