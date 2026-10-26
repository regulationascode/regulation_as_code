export const DEFAULT_EXAMPLE_ID = "bond_reporting";

const bondFields = [
  { key: "transaction_id", label: "Transaction identifier", concept: "Trade identifier", source: "transaction_id", sourceTerms: ["transaction identifier"] },
  { key: "instrument_id", label: "Instrument identifier", concept: "Instrument reference", source: "instrument_id", sourceTerms: ["instrument identifier"] },
  { key: "execution_timestamp", label: "Execution timestamp", concept: "Execution event time", source: "execution_timestamp", sourceTerms: ["execution timestamp"] },
  { key: "counterparty_classification", label: "Counterparty classification", concept: "Counterparty category", source: "counterparty_classification", sourceTerms: ["counterparty classification"] },
  { key: "notional_amount", label: "Notional amount", concept: "Trade amount", source: "notional_amount", sourceTerms: ["notional amount"] },
  { key: "price", label: "Price", concept: "Execution price", source: "price", sourceTerms: ["price"] },
  { key: "reporting_entity_id", label: "Reporting entity identifier", concept: "Reporting party", source: "reporting_entity_id", sourceTerms: ["reporting entity identifier"] },
  { key: "asset_class", label: "Product class", concept: "Product type", source: "asset_class", sourceTerms: [], scope: true },
  { key: "execution_time_local", label: "Local execution time", concept: "Local event time", source: "execution_time_local", sourceTerms: [], scope: true },
  { key: "trade_date", label: "Trade date", concept: "Trade date", source: "trade_date", sourceTerms: [], scope: true },
  { key: "submission_time_local", label: "Local submission time", concept: "Submission event time", source: "submission_time_local", sourceTerms: [], scope: true }
];

const hmdaFields = [
  { key: "record_key", label: "Local row key", concept: "Generated for local exception tracking", source: "record_key", sourceTerms: [], scope: true, generated: "row_number" },
  { key: "respondent_id", label: "Respondent identifier", concept: "Reporting institution LEI", source: "respondent_id", sourceAliases: ["lei"], sourceTerms: ["respondent identifier", "LEI"] },
  { key: "action_taken", label: "Action taken", concept: "Application outcome", source: "action_taken", sourceTerms: ["action taken"] },
  { key: "loan_type", label: "Loan type", concept: "Mortgage product", source: "loan_type", sourceTerms: ["loan type"] },
  { key: "loan_purpose", label: "Loan purpose", concept: "Purpose category", source: "loan_purpose", sourceTerms: ["loan purpose"] },
  { key: "loan_amount_dollars", label: "Loan amount in dollars", concept: "Reported loan amount", source: "loan_amount_dollars", sourceAliases: ["loan_amount"], sourceTerms: ["loan amount in dollars"] },
  { key: "dwelling_category", label: "Dwelling category", concept: "Derived dwelling category", source: "dwelling_category", sourceAliases: ["derived_dwelling_category"], sourceTerms: ["dwelling category"] },
  { key: "occupancy_type", label: "Occupancy type", concept: "Occupancy category", source: "occupancy_type", sourceTerms: ["occupancy type"] },
  { key: "state_code", label: "State code", concept: "Property geography", source: "state_code", sourceTerms: ["state code"] },
  { key: "county_code", label: "County FIPS code", concept: "Five digit state and county FIPS code", source: "county_code", sourceTerms: ["county FIPS code"] },
  { key: "census_tract", label: "Census tract", concept: "Property geography", source: "census_tract", sourceTerms: ["census tract"] },
  { key: "applicant_ethnicity", label: "Applicant ethnicity code", concept: "Applicant demographic data", source: "applicant_ethnicity", sourceAliases: ["applicant_ethnicity_1"], sourceTerms: ["applicant ethnicity"] },
  { key: "applicant_race", label: "Applicant race code", concept: "Applicant demographic data", source: "applicant_race", sourceAliases: ["applicant_race_1"], sourceTerms: ["applicant race"] },
  { key: "applicant_sex", label: "Applicant sex code", concept: "Applicant demographic data", source: "applicant_sex", sourceTerms: ["applicant sex"] },
  { key: "applicant_income_000s", label: "Applicant income in thousands", concept: "Applicant income", source: "applicant_income_000s", sourceAliases: ["income"], sourceTerms: ["applicant income"] }
];

const callReportFields = [
  { key: "rssd_id", label: "Synthetic institution key", concept: "Reporting institution", source: "rssd_id", sourceTerms: ["synthetic institution key"] },
  { key: "report_date", label: "Report date", concept: "Reporting period", source: "report_date", sourceTerms: ["report date"] },
  { key: "rcon2170_total_assets", label: "RCON 2170 total assets", concept: "Schedule RC item 12", source: "rcon2170_total_assets", sourceTerms: ["RCON 2170 total assets"], reference: "FFIEC MDRM RCON 2170" },
  { key: "rcon2948_total_liabilities", label: "RCON 2948 total liabilities", concept: "Schedule RC item 21", source: "rcon2948_total_liabilities", sourceTerms: ["RCON 2948 total liabilities"], reference: "FFIEC MDRM RCON 2948" },
  { key: "g105_total_equity", label: "G105 total equity capital", concept: "Schedule RC item 28", source: "g105_total_equity", sourceTerms: ["G105 total equity capital"], reference: "FFIEC MDRM G105" },
  { key: "rcon3300_liabilities_equity", label: "RCON 3300 liabilities and equity", concept: "Schedule RC item 29", source: "rcon3300_liabilities_equity", sourceTerms: ["RCON 3300 total liabilities and equity"], reference: "FFIEC MDRM RCON 3300" }
];

export const EXAMPLES = [
  {
    id: "bond_reporting",
    name: "Corporate bond event reporting",
    shortName: "Bond events",
    domain: "Capital markets",
    audience: "Trade reporting operations",
    description: "Screen same day bond activity, flag data defects, and prepare a reviewable report preview.",
    bankValue: "Shows how a shared obligation shape and test suite can be mapped to a bank’s private trade feed without sharing that feed.",
    dataNote: "All source text and records are synthetic.",
    sourceText: "Covered firms must report all same day corporate bond transactions executed after 16:00 local market time by 09:00 local market time on the next business day. The report must include transaction identifier, instrument identifier, execution timestamp, counterparty classification, notional amount, price, and reporting entity identifier.",
    sourceMeta: { title: "Synthetic transaction reporting manual", authority: "Fictional Market Authority", jurisdiction: "Illustrative", domain: "Corporate bonds", sourceType: "Synthetic sample rule", section: "4.3.2", paragraph: "2", effectiveDate: "2027-01-01" },
    sourceReference: "Synthetic transaction reporting manual, section 4.3.2, paragraph 2",
    sourceLinks: [],
    sourceTerms: [],
    obligation: { scope: "Same day corporate bond transactions", trigger: "Execution after the configured local cutoff", window: "Next business day by the configured deadline" },
    rule: { id: "FMA_CBOND_LATE_TRADE_001", name: "Next day reporting for late bond trades", cutoff: "16:00", deadline: "09:00", severity: "Blocking", effectiveDate: "2027-01-01", owner: "Reporting control owner", sourceReference: "Synthetic transaction reporting manual, section 4.3.2, paragraph 2", tests: "Conformance suite v0.1", dependencies: "Corporate bond scope fields and reporting field map", version: "1.0.0", settings: {} },
    parameters: [
      { key: "cutoff", label: "Execution cutoff", type: "time" },
      { key: "deadline", label: "Submission deadline", type: "time" }
    ],
    logic: "WHEN asset_class = \"Corporate Bond\"\nAND execution_time_local > \"{{cutoff}}\"\nAND trade_date = execution date\nREQUIRE transaction, instrument, counterparty, amount, price, and reporting entity fields\nCHECK required values, positive notional, positive price, matching dates, and timely submission\nDUE next business day at \"{{deadline}}\"",
    validator: "bond",
    requiredFields: ["transaction_id", "instrument_id", "execution_timestamp", "counterparty_classification", "notional_amount", "price", "reporting_entity_id"],
    duplicateFields: ["transaction_id"],
    tableFields: ["transaction_id", "asset_class", "execution_timestamp"],
    fields: bondFields,
    sampleRows: [
      { transaction_id: "TXN 10482", asset_class: "Corporate Bond", trade_date: "2027/01/04", execution_time_local: "16:42", instrument_id: "CB 4459001", execution_timestamp: "2027/01/04 16:42:18", counterparty_classification: "Institutional", notional_amount: "2500000", price: "99.875", reporting_entity_id: "LEI EXAMPLE 001", submission_time_local: "08:31" },
      { transaction_id: "TXN 10483", asset_class: "Corporate Bond", trade_date: "2027/01/04", execution_time_local: "17:20", instrument_id: "CB 4459002", execution_timestamp: "2027/01/04 17:20:02", counterparty_classification: "Dealer", notional_amount: "0", price: "100.125", reporting_entity_id: "LEI EXAMPLE 001", submission_time_local: "09:14" },
      { transaction_id: "TXN 10484", asset_class: "Government Bond", trade_date: "2027/01/04", execution_time_local: "16:35", instrument_id: "GB 3201804", execution_timestamp: "2027/01/04 16:35:00", counterparty_classification: "Institutional", notional_amount: "500000", price: "101.300", reporting_entity_id: "LEI EXAMPLE 001", submission_time_local: "08:45" },
      { transaction_id: "TXN 10485", asset_class: "Corporate Bond", trade_date: "2027/01/04", execution_time_local: "18:10", instrument_id: "CB 5532020", execution_timestamp: "2027/01/04 18:10:44", counterparty_classification: "", notional_amount: "1800000", price: "98.450", reporting_entity_id: "LEI EXAMPLE 001", submission_time_local: "08:50" },
      { transaction_id: "TXN 10486", asset_class: "Corporate Bond", trade_date: "2027/01/04", execution_time_local: "14:48", instrument_id: "CB 5532077", execution_timestamp: "2027/01/04 14:48:12", counterparty_classification: "Asset Manager", notional_amount: "920000", price: "100.025", reporting_entity_id: "LEI EXAMPLE 001", submission_time_local: "08:22" }
    ],
    cases: [
      { name: "Valid late bond trade", expected: "ready", values: { transaction_id: "TEST 001", instrument_id: "CB TEST 001", execution_timestamp: "2027/01/04 16:15:00", counterparty_classification: "Institutional", notional_amount: "1000", price: "99.500", reporting_entity_id: "LEI TEST 001", asset_class: "Corporate Bond", execution_time_local: "16:15", trade_date: "2027/01/04", submission_time_local: "08:59" } },
      { name: "At the cutoff", expected: "excluded", values: { transaction_id: "TEST 001", instrument_id: "CB TEST 001", execution_timestamp: "2027/01/04 16:00:00", counterparty_classification: "Institutional", notional_amount: "1000", price: "99.500", reporting_entity_id: "LEI TEST 001", asset_class: "Corporate Bond", execution_time_local: "16:00", trade_date: "2027/01/04", submission_time_local: "08:59" } },
      { name: "Missing counterparty", expected: "exception", values: { transaction_id: "TEST 001", instrument_id: "CB TEST 001", execution_timestamp: "2027/01/04 16:15:00", counterparty_classification: "", notional_amount: "1000", price: "99.500", reporting_entity_id: "LEI TEST 001", asset_class: "Corporate Bond", execution_time_local: "16:15", trade_date: "2027/01/04", submission_time_local: "08:59" } },
      { name: "Zero notional", expected: "exception", values: { transaction_id: "TEST 001", instrument_id: "CB TEST 001", execution_timestamp: "2027/01/04 16:15:00", counterparty_classification: "Institutional", notional_amount: "0", price: "99.500", reporting_entity_id: "LEI TEST 001", asset_class: "Corporate Bond", execution_time_local: "16:15", trade_date: "2027/01/04", submission_time_local: "08:59" } },
      { name: "Late submission", expected: "exception", values: { transaction_id: "TEST 001", instrument_id: "CB TEST 001", execution_timestamp: "2027/01/04 16:15:00", counterparty_classification: "Institutional", notional_amount: "1000", price: "99.500", reporting_entity_id: "LEI TEST 001", asset_class: "Corporate Bond", execution_time_local: "16:15", trade_date: "2027/01/04", submission_time_local: "09:01" } },
      { name: "Outside product scope", expected: "excluded", values: { transaction_id: "TEST 001", instrument_id: "GB TEST 001", execution_timestamp: "2027/01/04 16:15:00", counterparty_classification: "Institutional", notional_amount: "1000", price: "99.500", reporting_entity_id: "LEI TEST 001", asset_class: "Government Bond", execution_time_local: "16:15", trade_date: "2027/01/04", submission_time_local: "08:59" } }
    ],
    reportType: "Illustrative bond event report",
    reportWindow: "Next business day submission preview",
    change: { from: "by 09:00", to: "by 08:00", label: "Synthetic deadline change" },
    csvFile: "corporate_bond_events.csv",
    sourceChangeNote: "This sample amendment changes a fictional deadline. It is not a real regulatory update."
  },
  {
    id: "hmda_lar",
    name: "HMDA loan register preflight",
    shortName: "HMDA mortgage data",
    domain: "Mortgage lending",
    audience: "Mortgage reporting and fair lending operations",
    description: "Check a small annual loan register sample for required values, action codes, and record quality before review.",
    bankValue: "Shows how a bank can test a shared data quality profile against private loan records while keeping identifiers and source mappings local.",
    dataNote: "The field model follows public HMDA materials. Sample loan records are synthetic and use public location code formats. A local row key is generated for imports when needed.",
    privacyNote: "The sample contains no names, addresses, credit scores, or real loan identifiers. Demographic values are synthetic.",
    sourceText: "Illustrative control summary based on public HMDA materials, not official regulatory text. An in scope annual loan register can contain a respondent identifier, action taken, loan type, loan purpose, loan amount in dollars, dwelling category, occupancy type, state code, five digit state and county FIPS code, census tract, applicant ethnicity, applicant race, applicant sex, and applicant income in thousands. Synthetic profile guide revision 1.0.",
    sourceMeta: { title: "HMDA public filing materials and synthetic profile guide", authority: "CFPB and FFIEC public materials", jurisdiction: "United States", domain: "Mortgage lending", sourceType: "Public source reference with synthetic control summary", section: "Data points", paragraph: "Sample profile", effectiveDate: "2025-01-01" },
    sourceReference: "CFPB Regulation C and HMDA filing resources. The control text is an illustrative summary.",
    sourceLinks: [
      { label: "HMDA filing and submission resources", url: "https://www.consumerfinance.gov/compliance/registration-and-submission-programs/", description: "The CFPB describes how filers upload a register, review edits, certify, and submit." },
      { label: "Public HMDA data", url: "https://ffiec.cfpb.gov/data-publication/modified-lar", description: "Public loan register data is modified to protect applicant and borrower privacy." },
      { label: "Download a modified LAR file", url: "https://ffiec.cfpb.gov/documentation/api/file-serving/", description: "Official CSV download instructions for a submitted institution and reporting year." },
      { label: "Public LAR schema", url: "https://ffiec.cfpb.gov/documentation/publications/loan-level-datasets/public-lar-schema", description: "Official public field names, lengths, and types for the HMDA loan register." },
      { label: "Regulation C", url: "https://www.consumerfinance.gov/rules-policy/regulations/1003/", description: "Official CFPB rule resource. Confirm current scope and instructions with counsel." }
    ],
    sourceTerms: [],
    obligation: { scope: "Mortgage applications covered by the institution’s reporting profile", trigger: "A reportable application or covered loan reaches final action", window: "Annual reporting cycle. Confirm the current filing schedule and population." },
    rule: { id: "HMDA_LAR_PREFLIGHT_001", name: "Annual loan register data quality preflight", severity: "Blocking", effectiveDate: "2025-01-01", owner: "Mortgage reporting control owner", sourceReference: "CFPB Regulation C and HMDA filing resources", tests: "HMDA sample conformance suite v1", dependencies: "Local mortgage system map and current HMDA edits", version: "1.0.0", settings: { actionCodes: "1,2,3,4,5,6,7,8" } },
    parameters: [
      { key: "actionCodes", label: "Action values in this profile", type: "text", defaultValue: "1,2,3,4,5,6,7,8" }
    ],
    logic: "FOR EACH in scope loan register row\nREQUIRE respondent, action, loan type, purpose, amount, dwelling, occupancy, and geography fields\nCHECK action_taken is one of {{actionCodes}}\nCHECK loan_amount_dollars is a positive whole dollar amount\nCHECK state and county codes and census tract are present\nREVIEW demographic and income fields under the institution’s approved applicability rules\nOUTPUT a local preflight report only",
    validator: "hmda",
    requiredFields: ["respondent_id", "action_taken", "loan_type", "loan_purpose", "loan_amount_dollars", "dwelling_category", "occupancy_type", "state_code", "county_code", "census_tract"],
    duplicateFields: ["record_key"],
    tableFields: ["record_key", "action_taken", "state_code"],
    fields: hmdaFields,
    sampleRows: [
      { record_key: "SYNTHETIC LAR 001", respondent_id: "SYNTHETIC BANK A", action_taken: "1", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "320000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "NY", county_code: "36061", census_tract: "36061000100", applicant_ethnicity: "1", applicant_race: "5", applicant_sex: "1", applicant_income_000s: "125" },
      { record_key: "SYNTHETIC LAR 002", respondent_id: "SYNTHETIC BANK A", action_taken: "3", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "270000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "NY", county_code: "36005", census_tract: "36005000100", applicant_ethnicity: "2", applicant_race: "3", applicant_sex: "2", applicant_income_000s: "90" },
      { record_key: "SYNTHETIC LAR 003", respondent_id: "SYNTHETIC BANK A", action_taken: "2", loan_type: "2", loan_purpose: "2", loan_amount_dollars: "415000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "CA", county_code: "06037", census_tract: "06037000100", applicant_ethnicity: "3", applicant_race: "6", applicant_sex: "3", applicant_income_000s: "" },
      { record_key: "SYNTHETIC LAR 004", respondent_id: "SYNTHETIC BANK A", action_taken: "9", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "180000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "TX", county_code: "48201", census_tract: "48201000100", applicant_ethnicity: "1", applicant_race: "2", applicant_sex: "1", applicant_income_000s: "80" },
      { record_key: "SYNTHETIC LAR 005", respondent_id: "SYNTHETIC BANK A", action_taken: "1", loan_type: "1", loan_purpose: "3", loan_amount_dollars: "225000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "WA", county_code: "53033", census_tract: "53033000100", applicant_ethnicity: "2", applicant_race: "4", applicant_sex: "2", applicant_income_000s: "105" }
    ],
    cases: [
      { name: "Valid originated loan", expected: "ready", values: { record_key: "SYNTHETIC TEST 001", respondent_id: "SYNTHETIC BANK", action_taken: "1", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "275000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "NY", county_code: "36061", census_tract: "36061000100", applicant_ethnicity: "1", applicant_race: "5", applicant_sex: "1", applicant_income_000s: "120" } },
      { name: "Action value outside profile", expected: "exception", values: { record_key: "SYNTHETIC TEST 002", respondent_id: "SYNTHETIC BANK", action_taken: "9", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "275000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "NY", county_code: "36061", census_tract: "36061000100", applicant_ethnicity: "1", applicant_race: "5", applicant_sex: "1", applicant_income_000s: "120" } },
      { name: "Missing county code", expected: "exception", values: { record_key: "SYNTHETIC TEST 003", respondent_id: "SYNTHETIC BANK", action_taken: "1", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "275000", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "NY", county_code: "", census_tract: "36061000100", applicant_ethnicity: "1", applicant_race: "5", applicant_sex: "1", applicant_income_000s: "120" } },
      { name: "Zero loan amount", expected: "exception", values: { record_key: "SYNTHETIC TEST 004", respondent_id: "SYNTHETIC BANK", action_taken: "1", loan_type: "1", loan_purpose: "1", loan_amount_dollars: "0", dwelling_category: "Single Family (1-4 Units):Site-Built", occupancy_type: "1", state_code: "NY", county_code: "36061", census_tract: "36061000100", applicant_ethnicity: "1", applicant_race: "5", applicant_sex: "1", applicant_income_000s: "120" } }
    ],
    reportType: "Synthetic HMDA register preflight",
    reportWindow: "Annual local preview. This file is not a filing format.",
    change: { from: "Synthetic profile guide revision 1.0", to: "Synthetic profile guide revision 1.1", label: "Synthetic source revision" },
    csvFile: "hmda_synthetic_lar.csv",
    sourceChangeNote: "This synthetic guide revision exists only to demonstrate impact review. It is not a CFPB or FFIEC change."
  },
  {
    id: "ffiec_call_report",
    name: "FFIEC Call Report balance check",
    shortName: "Call Report",
    domain: "Quarterly financial reporting",
    audience: "Regulatory reporting and finance control teams",
    description: "Map Schedule RC balances and test a basic arithmetic tie out before a bank reviews its quarterly report package.",
    bankValue: "Shows how source line items can be tied to a shared check, with a visible exception list for finance and reporting teams to resolve.",
    dataNote: "Line item references come from the public FFIEC 041 form. Institution keys and amounts in the fixture are synthetic.",
    sourceText: "Illustrative control summary based on the public FFIEC 041 form, not official instructions. This sample reconciles a synthetic institution key and report date with RCON 2170 total assets, RCON 2948 total liabilities, G105 total equity capital, and RCON 3300 total liabilities and equity. Synthetic profile guide revision 1.0.",
    sourceMeta: { title: "FFIEC 041 Schedule RC and synthetic profile guide", authority: "Federal Financial Institutions Examination Council", jurisdiction: "United States", domain: "Quarterly bank condition and income reporting", sourceType: "Public reporting form with synthetic control summary", section: "Schedule RC", paragraph: "Items 12, 21, 28, and 29", effectiveDate: "2026-09-30" },
    sourceReference: "FFIEC 041 Schedule RC, items 12, 21, 28, and 29. Verify the current form and instructions.",
    sourceLinks: [
      { label: "Current FFIEC 041 form and instructions", url: "https://www.ffiec.gov/resources/reporting-forms/ffiec041", description: "Current public form, instructions, and revisions." },
      { label: "Public Call Report data downloads", url: "https://www.fdic.gov/bank-data-guide/data-downloads", description: "FDIC links to public Call Report downloads and quarterly bank data." },
      { label: "FFIEC Call Report data formats", url: "https://cdr.ffiec.gov/public/HelpFiles/DownloadHelp.htm", description: "FFIEC describes public PDF, delimited, and XBRL data downloads." }
    ],
    sourceTerms: [],
    obligation: { scope: "Reporting institutions and line items applicable to the selected Call Report form", trigger: "Quarter end condition data has been assembled", window: "Quarterly report cycle. Verify the current filing instructions and due date." },
    rule: { id: "FFIEC_041_RC_BALANCE_001", name: "Schedule RC balance sheet tie out", severity: "Blocking", effectiveDate: "2026-09-30", owner: "Quarterly reporting control owner", sourceReference: "FFIEC 041 Schedule RC, items 12, 21, 28, and 29", tests: "Schedule RC sample conformance suite v1", dependencies: "Institution mapping, report date, and current FFIEC 041 form version", version: "1.0.0", settings: { toleranceThousands: "0" } },
    parameters: [
      { key: "toleranceThousands", label: "Balance tolerance in thousands", type: "number", defaultValue: "0", min: "0", step: "1" }
    ],
    logic: "FOR EACH selected quarter end record\nREQUIRE institution key, report date, and the four mapped Schedule RC values\nCHECK RCON 2170 total assets = RCON 3300 total liabilities and equity\nCHECK RCON 2948 total liabilities + G105 total equity = RCON 3300\nALLOW configured rounding tolerance of {{toleranceThousands}} thousands\nOUTPUT a local reconciliation report only",
    validator: "call_report",
    requiredFields: ["rssd_id", "report_date", "rcon2170_total_assets", "rcon2948_total_liabilities", "g105_total_equity", "rcon3300_liabilities_equity"],
    duplicateFields: ["rssd_id", "report_date"],
    tableFields: ["rssd_id", "report_date", "rcon2170_total_assets"],
    fields: callReportFields,
    sampleRows: [
      { rssd_id: "SYNTHETIC 1001", report_date: "2026-06-30", rcon2170_total_assets: "12500000", rcon2948_total_liabilities: "11300000", g105_total_equity: "1200000", rcon3300_liabilities_equity: "12500000" },
      { rssd_id: "SYNTHETIC 1002", report_date: "2026-06-30", rcon2170_total_assets: "8600000", rcon2948_total_liabilities: "8000000", g105_total_equity: "600000", rcon3300_liabilities_equity: "8550000" },
      { rssd_id: "SYNTHETIC 1003", report_date: "2026-06-30", rcon2170_total_assets: "4000000", rcon2948_total_liabilities: "3650000", g105_total_equity: "", rcon3300_liabilities_equity: "4000000" },
      { rssd_id: "SYNTHETIC 1004", report_date: "2026-06-30", rcon2170_total_assets: "5100000", rcon2948_total_liabilities: "4650000", g105_total_equity: "450000", rcon3300_liabilities_equity: "5100000" }
    ],
    cases: [
      { name: "Balanced Schedule RC sample", expected: "ready", values: { rssd_id: "SYNTHETIC TEST 001", report_date: "2026-06-30", rcon2170_total_assets: "1000000", rcon2948_total_liabilities: "910000", g105_total_equity: "90000", rcon3300_liabilities_equity: "1000000" } },
      { name: "Assets do not tie", expected: "exception", values: { rssd_id: "SYNTHETIC TEST 002", report_date: "2026-06-30", rcon2170_total_assets: "1000000", rcon2948_total_liabilities: "910000", g105_total_equity: "90000", rcon3300_liabilities_equity: "999000" } },
      { name: "Liabilities and equity do not tie", expected: "exception", values: { rssd_id: "SYNTHETIC TEST 003", report_date: "2026-06-30", rcon2170_total_assets: "1000000", rcon2948_total_liabilities: "910000", g105_total_equity: "80000", rcon3300_liabilities_equity: "1000000" } },
      { name: "Missing total equity", expected: "exception", values: { rssd_id: "SYNTHETIC TEST 004", report_date: "2026-06-30", rcon2170_total_assets: "1000000", rcon2948_total_liabilities: "910000", g105_total_equity: "", rcon3300_liabilities_equity: "1000000" } },
      { name: "Non numeric line item", expected: "exception", values: { rssd_id: "SYNTHETIC TEST 005", report_date: "2026-06-30", rcon2170_total_assets: "one million", rcon2948_total_liabilities: "910000", g105_total_equity: "90000", rcon3300_liabilities_equity: "1000000" } }
    ],
    reportType: "Synthetic Schedule RC reconciliation preview",
    reportWindow: "Quarterly local review. This file is not a CDR submission.",
    change: { from: "Synthetic profile guide revision 1.0", to: "Synthetic profile guide revision 1.1", label: "Synthetic source revision" },
    csvFile: "ffiec_041_synthetic_rc.csv",
    sourceChangeNote: "This synthetic guide revision exists only to demonstrate impact review. It is not an FFIEC change."
  }
];

export const EXAMPLES_BY_ID = Object.fromEntries(EXAMPLES.map((example) => [example.id, example]));

export function getExample(id) {
  return EXAMPLES_BY_ID[id] || EXAMPLES_BY_ID[DEFAULT_EXAMPLE_ID];
}

export function exampleCsv(example) {
  const rows = example.sampleRows || [];
  if (!rows.length) return "";
  const headers = example.fields.map((field) => field.source);
  const quote = (value) => '"' + String(value == null ? "" : value).replace(/"/g, '""') + '"';
  return [headers.map(quote).join(","), ...rows.map((row) => headers.map((key) => quote(row[key])).join(","))].join("\n") + "\n";
}
