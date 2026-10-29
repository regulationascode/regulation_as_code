# Quickstart

Use Node.js 24 and npm. From the repository root, install the locked dependencies and start the local site:

```sh
npm ci
npm start
```

Open `http://127.0.0.1:4173`. Select a timing branch, inspect the source and candidate mapping, change the synthetic report timing, review the Validation view, and download the evaluation envelope from Evidence. Read the [CFTC timing guide](cftc_timing_demo.md) before interpreting results.

## Useful commands

```sh
npm test
npm run validate:catalog
npm run package:source
npm run build
npm run preview
```

`npm test` runs the timing and economics model tests. `npm run validate:catalog` checks the catalog schema and source references. `npm run package:source` refreshes the download at `public/portable-source.zip`. `npm run build` typechecks the app and creates static output in `dist/`. After building, `npm run preview` serves the output at `http://127.0.0.1:4174`.

The development server listens on your own computer. Do not expose it to a network with real institution data.

## Browser storage

The app stores selected branches, review state, scenario choices, and pilot economics observations in this browser. It does not send values to a project service. Use Reset Scenario to clear the local demonstration state. Approval fields accept text and do not verify a person's identity.
