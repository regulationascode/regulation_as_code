# Evidence and reports

The application produces local report previews in CSV or JSON and a JSON evidence pack. The pack captures the current source reference, rule and mapping versions, local approval entries, validation summary, report output, and content fingerprints.

These files support inspection of a demonstration run. They are not regulator submission files. The app does not digitally sign evidence, authenticate approval identities, apply institutional retention rules, or provide immutable storage. A fingerprint can reveal that captured content changed; it cannot prove who approved it or that the original content was correct.

An institution adopting the pattern should attach its own identity record, approval workflow, retention schedule, access controls, time source, immutable archive, and submission identifier. If evidence contains operational data, keep it within the bank's approved storage and sharing boundary.
