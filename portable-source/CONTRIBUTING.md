# Contributing

Contributions should improve generic, source-traceable reporting infrastructure. Do not submit confidential institution information, customer or trade data, bank-specific mappings, credentials, internal policies, or approval records.

## A regulation change must include

- Official source citation and URL; publication/version date; effective-date status; and a content hash when the source artifact is captured.
- A clear separation between source text and proposed human interpretation.
- Interpretation status and the accountable reviewer role; do not label a draft as approved.
- Deterministic implementation changes, synthetic tests, and the limitations of those tests.
- Model/schema versions for any CDM or reporting-schema crosswalk.
- A note about license, source attribution, confidential-data, and security review.

## Pull-request workflow

1. Create a topic branch and open a pull request; do not commit directly to the protected default branch.
2. Run `pnpm run validate:catalog`, `pnpm test`, and `pnpm run build`.
3. Request legal/compliance review for interpretation changes and engineering review for code/schema changes.
4. Address CI and review feedback. A CI pass verifies specified checks only; it is not legal approval or a compliance opinion.
5. Merge only under the repository owner's configured review policy.

AI-assisted extraction may be submitted only as a clearly labeled draft. A qualified human must verify the source, interpretation, and tests before approval.
