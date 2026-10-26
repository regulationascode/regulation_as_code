# Architecture

The local product has a browser interface, deterministic validation functions, bundled profile definitions, synthetic CSV files, and a small local HTTP server.

| Layer | Current implementation |
| --- | --- |
| Source and obligation | Profile metadata and a human review flow in `src/core/examples.js` and `src/client/studio.js` |
| Rule and mapping | Versioned local workflow state and mapped CSV fields |
| Validation | Pure functions in `src/core/validation.js` |
| Report and evidence | Browser generated downloads with hashes and lineage metadata |
| Change review | Sample source amendment, impact review, and approval reset |
| Conformance | Golden cases in each profile, executed by `test/examples.test.js` |
| Local server | `server.mjs`, which serves only the explicit application assets |

The browser stores workflow decisions in local storage. Imported records are retained in memory for the session. There is no backend database, external registry, identity provider, regulator feed, or submission connection.

The paper describes an eventual separation between public shared artifacts and private institutional execution. The public side can contain cited sources, common field concepts, reviewed rules, and synthetic conformance cases. A bank controlled deployment would hold internal mappings, approvals, records, exceptions, and operational evidence.

The product may later add a profile schema and loader so a new domain can be expressed without editing application JavaScript. That requires a deliberately bounded rule language and conformance review; arbitrary uploaded scripts would weaken auditability.
