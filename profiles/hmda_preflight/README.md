# HMDA loan register preflight

This profile demonstrates selected data quality checks on a synthetic annual loan register before formal HMDA review. It checks required values, an approved example action code list, positive whole dollar loan amounts, and selected geography formats. It does not implement all HMDA edits, reporting exceptions, or filing rules.

The bundled [hmda_synthetic_lar.csv](../../examples/hmda_synthetic_lar.csv) contains invented records. The profile can also import a public Modified LAR CSV from the [CFPB and FFIEC download service](https://ffiec.cfpb.gov/documentation/api/file-serving/). Review suggested mappings before approval. The importer creates a local row key if needed; that key is not an official HMDA field.

Public context:

1. [CFPB Regulation C](https://www.consumerfinance.gov/rules-policy/regulations/1003/)
2. [HMDA filing resources](https://www.consumerfinance.gov/compliance/registration-and-submission-programs/)
3. [Public Modified LAR schema](https://ffiec.cfpb.gov/documentation/publications/loan-level-datasets/public-lar-schema)
4. [Public Modified LAR data](https://ffiec.cfpb.gov/data-publication/modified-lar)

The source text in the app is an illustrative summary, not a quotation of an official obligation. Confirm current scope, filing instructions, and edits with the institution's reporting and legal teams.
