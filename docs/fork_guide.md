# Fork and privacy guide

## Public contributions

Use a public fork for generic work intended for public review, such as source citations, reusable rule proposals, synthetic values, and conformance cases. Do not put institution records, internal mappings, private policies, credentials, reviewer identities, approval records, or operational evidence in the public repository or a public fork.

A GitHub fork of a public repository stays public. Do not use a public fork as the private workspace for an institutional pilot. [GitHub documents the visibility rules for forks](https://docs.github.com/en/pull%2Drequests/reference/forks).

## Private institutional pilots

For an institutional pilot, follow the institution's approved process to create a private repository from a reviewed release or approved source copy. Record the upstream repository, release or commit, and import date in the private project. Preserve the approved license and required notices.

Keep source system mappings, policy, data, identifiers, credentials, approvals, exceptions, and run evidence in systems controlled by the institution. Review access, retention, identity, and release controls before using real records.

## Review before operating

Update the existing `.github/CODEOWNERS` file for the institution's reviewer teams. Configure protected branches and required checks under its policy. Assign interpretation review to accountable legal and compliance staff, data mapping review to reporting and data owners, and implementation review to engineering maintainers.

A passing CI check confirms only the automated checks that ran. It does not establish legal approval, applicability, a correct mapping, regulator acceptance, or compliance. People must review and approve any interpretation or rule change.

The Studio does not create repositories, configure Git remotes, or push changes. Repository setup, private copies, review policy, and release decisions remain with the adopting institution.
