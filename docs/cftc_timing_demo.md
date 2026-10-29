# CFTC timing demonstration

The main application follows a narrow, synthetic CFTC Part 45 section 45.3 example. It demonstrates a source view, obligation selection, human review state, rule draft, candidate data mapping, deterministic timing check, synthetic evaluation download, impact replay, governance notes, adoption path, pilot economics, and presenter mode.

The screens make a possible source to implementation path visible. Several parts are proposed controls or explanatory views. They do not establish legal interpretation, production approval, or compliance.

## Selected branches

The app offers three manually selected branches:

1. A swap executed on or pursuant to the rules of a swap execution facility or designated contract market, under section 45.3(a), with a next business day deadline.
2. An off facility swap where the reporting counterparty is a swap dealer, major swap participant, or derivatives clearing organization, under section 45.3(b)(1), with a next business day deadline.
3. An off facility swap where the reporting counterparty is outside those categories, under section 45.3(b)(2), with a second business day deadline.

The execution date is fixed at November 4, 2026. The user chooses a branch and whether the synthetic report is on time or late. The app does not determine the reporting counterparty or decide which rule branch applies.

## Calendar limit

The calculation counts weekdays only. It does not skip legal holidays or determine the relevant location. Under [17 CFR section 45.1](https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.1), a business day excludes Saturdays, Sundays, and legal holidays in the location of the swap execution facility, designated contract market, or reporting counterparty reporting data for the swap. The demonstration is not a full deadline calculator and must not be used to decide an actual reporting deadline. [17 CFR section 45.3](https://www.ecfr.gov/current/title-17/chapter-I/part-45/section-45.3) contains the selected branches and additional requirements the demonstration does not calculate.

## Source and mapping versions

The source view identifies an eCFR snapshot dated October 23, 2026. The current eCFR page displayed Title 17 through October 27, 2026 when checked on October 28, 2026. The snapshot label is not a content hash and does not prove which text was captured.

The interface references CFTC Parts 43 and 45 Technical Specification version 3.2 from March 2023. The [CFTC specification archive](https://www.cftc.gov/LawRegulation/DoddFrankAct/Rulemakings/DF_18_RealTimeReporting/index.htm) also lists December 2023 clean and redline versions. Do not assume that the demonstration's version is current. Confirm the applicable specification and SDR requirements before implementation.

The mapping view presents selected FINOS CDM 7.0.0 locations as candidates for a vanilla interest rate swap. These are conceptual mappings. They are not an exhaustive Appendix 1 map, SDR payload schema, approved bank mapping, or execution of ISDA Digital Regulatory Reporting.

## Outputs and browser state

The Evidence Preview download is a synthetic JSON evaluation envelope. It is not a report, filing, SDR message, or regulator submission format. It is not signed or tamper evident.

Scenario choices, demonstration review state, and pilot inputs are saved in the current browser's local storage. A review button changes local demonstration state only. The app does not authenticate users, connect to a backend, send data to a regulator, monitor source changes, or run live AI.

The Pilot Economics view separates editable scenario assumptions from user entered baseline and pilot observations. It reports descriptive differences. It does not establish savings, causation, or business value. Do not enter customer, trade, employee, or bank identifiers.

## Repository checks

The root GitHub Actions workflow installs npm dependencies, validates the portable catalog, runs the application tests, packages the portable source, and builds the workspace. It does not deploy the site or validate legal interpretation, reporting counterparty, data mappings, holiday treatment, SDR acceptance, or production compliance.
