# Conference demonstration guide

## How it extends this Studio

The conference experience builds on the source, obligation, rule, mapping, validation, report, and evidence workflow in this repository. It carries that product story into a focused CFTC Part 45 section 45.3 timing scenario and adds source views, an evaluation preview, impact replay, governance, an adoption journey, pilot measurement, and presenter mode.

This guide documents the extended conference prototype. Its extra views are not part of the local app in this checkout. Use the [repository quickstart](quickstart.md) to run the Studio described by the main README.

## What the walkthrough demonstrates

The presentation follows the path from source text to a selected obligation, a human reviewed rule draft, a candidate data mapping, a deterministic timing check, a synthetic evaluation envelope, and a proposed evidence trail. Additional views show how a source or scenario change could be reviewed, how a bank might organize a pilot, what a pilot could measure, and how to present the product story.

The source, obligation, rule, mapping, validation, and evidence views make the decisions visible. The impact replay changes the selected scenario branch or date and recalculates the trace. It does not represent a real amendment to the regulation. Governance buttons change local demonstration review state. They do not authenticate a person or establish independent approval.

Presenter mode organizes the story into six chapters for a fifteen minute talk. Its audience lens changes the explanation shown to the presenter. It does not change the rule calculation.

The presentation can discuss AI as a future aid for finding candidate obligations or source changes. This prototype has no live AI. Human reviewers remain responsible for interpretation and approval.

## CFTC timing scenario

The prototype covers three selected branches of section 45.3:

* A swap executed on a swap execution facility or designated contract market, under section 45.3(a), with a next business day timing rule.
* An off facility swap where the reporting counterparty is a swap dealer, major swap participant, or derivatives clearing organization, under section 45.3(b)(1), with a next business day timing rule.
* An off facility swap where the reporting counterparty is outside those categories, under section 45.3(b)(2), with a second business day timing rule.

The presenter selects the reporting counterparty branch manually. The prototype uses November 4, 2026 as its fixed synthetic execution date and lets the user choose an on time or late report. It calculates with weekdays only. It does not account for legal holidays or the location relevant to the swap.

Section 45.1 defines a business day by excluding Saturdays, Sundays, and legal holidays in the location of the facility or reporting counterparty. As checked on October 28, 2026, the eCFR displayed Title 17 as current through October 27, 2026, with its last amendment on October 19, 2026. The prototype's weekday only calendar is therefore incomplete and must not be used as a deadline calculator. Review [eCFR section 45.1](https://www.ecfr.gov/current/title%2D17/chapter%2DI/part%2D45/section%2D45.1) and [eCFR section 45.3](https://www.ecfr.gov/current/title%2D17/chapter%2DI/part%2D45/section%2D45.3) before making any legal or operational decision.

These branches do not represent every condition in Part 45. The walkthrough does not calculate allocations, continuation data, reporting duties under other provisions, applicability, or an institution's reporting counterparty determination.

## Sources and mapping limits

The source view identifies an eCFR snapshot dated October 23, 2026. Its catalog does not populate retrieval date or content hash fields, so that label alone does not prove which text was captured. The CFTC source view references Technical Specification version 3.2 from March 2023. The [CFTC specification page](https://www.cftc.gov/LawRegulation/DoddFrankAct/Rulemakings/DF_18_RealTimeReporting/index.htm) also lists December 2023 clean and redline specifications. Reconcile the selected specification, source text, effective dates, and SDR requirements before relying on the prototype.

The mapping view presents candidate FINOS CDM 7.0.0 locations for selected vanilla interest rate swap fields. These are conceptual candidates. They are not a complete Appendix 1 mapping, an SDR payload schema, an implementation of ISDA DRR, or an approved mapping. The walkthrough does not validate a production report.

## Evaluation and evidence

The evaluation download is a synthetic JSON envelope that records the selected scenario and its calculated result. It is not a filing, an SDR message, or a regulator submission format. It is not signed or tamper evident and should not be treated as audit evidence.

The prototype saves editable demonstration state and pilot observations in the current browser's local storage. It has no service that receives those records, no authenticated identity, no regulator connection, no live source monitor, and no live AI source analysis. A button that records a review changes local presentation state only.

## Adoption path and pilot economics

The adoption view offers a clean source archive for manual use. It does not connect to Git, create or fork repositories, configure a remote, or push commits. The proposed path is to review the public source and package, add the material to an institution controlled repository, run local checks, and assign human review. Its included automation workflow has read only repository permissions. It validates catalog structure, installs locked dependencies, runs synthetic timing tests, then typechecks and builds the application. It does not deploy the app or establish legal correctness.

The pilot view compares baseline and post pilot observations. It checks that the two periods use matching positive work item counts, valid dates, and nonnegative role hours and rework values. It reports elapsed hours per item, role hours per item and by role, rework per item, and evidence completion. These are descriptive observations. Different scope, case mix, staffing, calendar, or measurement methods can affect the comparison, so the results do not establish cause or savings.

A separate editable cost model uses illustrative assumptions. Its figures are not measured outcomes, a forecast, or a guarantee. Browser saved observations and downloaded JSON are editable records, not signed evidence or an audit log. Do not enter personal, trade, customer, employee, or bank identifiers.

## Running the repository app

The main README and [repository quickstart](quickstart.md) remain the instructions for this checkout. They use Node.js 24 and npm. The extended prototype has its own source package and setup instructions; those instructions do not replace the repository setup.
