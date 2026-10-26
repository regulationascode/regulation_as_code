# Corporate bond event reporting

This example walks through the complete pipeline using a fictional authority and a fictional late day corporate bond reporting obligation. No real regulation is represented.

The rule checks product scope, a local execution time cutoff, required transaction fields, positive amount and price, trade date consistency, and a local submission deadline. The sample includes ready, excluded, warning, and exception outcomes. The source amendment changes the fictional deadline and requires a new review.

Run `npm start`, select **Bond events** under **Examples and adoption**, then follow **Pipeline** through source, obligation, rule, mapping, validation, release, report, and evidence. The sample CSV is [corporate_bond_events.csv](../../examples/corporate_bond_events.csv).

This profile demonstrates the workflow and control pattern. It must not be presented as a regulator requirement or used to file a report.
