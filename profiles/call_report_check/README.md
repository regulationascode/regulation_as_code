# FFIEC Call Report balance check

This profile demonstrates a selected Schedule RC balance check using synthetic values. It compares total assets, total liabilities, equity, and total liabilities plus equity, with a configurable tolerance in thousands. It also reports missing and nonnumeric values.

The bundled [ffiec_041_synthetic_rc.csv](../../examples/ffiec_041_synthetic_rc.csv) contains invented institution keys and amounts. It is designed to show how a finance reporting team can identify breaks before its own reconciliation and filing process.

Public context:

1. [Current FFIEC 041 form and instructions](https://www.ffiec.gov/resources/reporting-forms/ffiec041)
2. [FDIC public data downloads](https://www.fdic.gov/bank-data-guide/data-downloads)
3. [FFIEC download formats](https://cdr.ffiec.gov/public/HelpFiles/DownloadHelp.htm)

The profile is not an official FFIEC edit suite or a filing file generator. A bank must verify the current line definitions, population, units, reporting period, and applicable instructions.
