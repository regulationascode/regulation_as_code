# Quickstart

Use Node.js 24 LTS. This repository has no runtime package dependencies.

1. Run `npm start`.
2. Open `http://127.0.0.1:4173`.
3. Select **Examples and adoption** and choose one of the three bundled profiles.
4. Open **Pipeline**. Read the source, draft the candidate obligation, and record the local legal and compliance review entries.
5. Review the rule, data mapping, and golden cases. Run validation.
6. Review exceptions. Record the local release decision, then inspect the report and download the evidence pack.
7. Open **Change desk** to apply the sample source amendment and inspect which artifacts need review.

Run `npm test` to execute the bundled conformance checks. Run `npm run examples:export` to regenerate the checked in sample CSV files.

The default port is 4173. Set `REGULATION_AS_CODE_PORT` to use another port. The default host is your own computer. Do not expose the demo to a network with real bank data.

The browser saves workflow decisions locally. Imported CSV rows remain in browser memory. After a page reload, run validation again to rebuild report rows for a complete evidence export. **Reset demo** removes the saved workflow state.

The example approval fields accept typed names or roles. They do not authenticate a person. Treat all exports as local drafts.
