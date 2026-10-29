# Regulation source to reviewed rule

## The distinction

“Machine-readable regulation” can mean different things:

1. **Machine-readable source:** official XML, JSON, or another structured publication that a program can download and parse.
2. **Structured provision:** a section and its paragraphs, citations, definitions, cross-references, and dates represented as data.
3. **Executable rule:** an approved interpretation encoded as deterministic logic with tests.

The first two do not automatically provide the third. Applicability, reporting responsibility, exceptions, and institution-specific facts require accountable human review.

## US CFTC source path

- eCFR publishes API documentation and point-in-time CFR content. The Versioner API exposes XML for a title or a requested subset; use a dated request and keep the selected provision hierarchy.
- GPO's GovInfo Bulk Data Repository publishes eCFR XML along with schemas and a user guide.
- CFTC swap reporting technical specifications are separate publications, not part of the §45.3 XML. Record their exact title, date/version, URL, format, and hash.
- CFTC's Real-Time Reporting page lists multiple Parts 43/45 technical-specification publications. The prototype has referenced the March 2023 v3.2 document; reconcile it against the December 2023 clean/redline publications and any later current agency material before treating the field crosswalk as current.
- FINOS CDM is a separately versioned model. Pin the exact release used; a CDM model path is not proof that a CFTC reporting field is legally or operationally mapped.

Official references:

- [eCFR API documentation](https://www.ecfr.gov/developers/documentation/api/v1)
- [eCFR developer resources](https://www.ecfr.gov/reader-aids/ecfr-developer-resources)
- [GovInfo eCFR bulk XML and resources](https://www.govinfo.gov/bulkdata/ECFR/resources)
- [CFTC Parts 43/45 technical specifications](https://www.cftc.gov/LawRegulation/DoddFrankAct/Rulemakings/DF_18_RealTimeReporting/index.htm)
- [FINOS CDM documentation](https://cdm.finos.org/docs/)

Example eCFR request pattern for a dated Title 17 XML source:

```text
https://www.ecfr.gov/api/versioner/v1/full/YYYY-MM-DD/title-17.xml
```

The ingestion script should select and preserve the relevant Title 17 / Chapter I / Part 45 provisions, record the requested date, and compute a SHA-256 digest. Do not commit a full-title snapshot on every update if a small cited provision extract and reproducible source metadata are sufficient. Follow source-specific reuse and attribution terms.

## Controlled ingestion workflow

1. **Discover:** monitor official source indexes and Federal Register actions; create an issue when a relevant source changes.
2. **Capture:** download the official source artifact; record publisher, canonical URL, publication/version date, retrieval time, effective date when known, format, and SHA-256.
3. **Diff:** identify changed provisions and related technical-specification versions. A text diff is a signal for review, not an interpretation.
4. **Interpret:** a qualified legal/compliance reviewer documents the obligation, decision points, applicability assumptions, exceptions, and unresolved questions in `interpretation.yaml`.
5. **Implement:** engineering translates only the approved interpretation into deterministic code or a deliberately small rule DSL. Pin model and schema versions.
6. **Test:** add synthetic positive, negative, boundary, exception, effective-date, and calendar cases. Keep private institution data out of public fixtures.
7. **Review:** require the relevant human reviewers through the organization's PR and `CODEOWNERS` process.
8. **Release:** tag a version tying together the source manifest, interpretation revision, implementation commit, test results, and review record.

Automated source checks may detect and report changes. They must not auto-approve an interpretation, silently rewrite executable logic, or claim full compliance.

## Expanding beyond CFTC Part 45

Add a source adapter and a separate regulation package for each authority and regime. Start with one focused obligation path, validate its governance and tests, then expand. Do not promise “all financial regulations” until the covered jurisdictions, agencies, rulebooks, technical standards, effective dates, and update responsibilities are explicitly inventoried.
