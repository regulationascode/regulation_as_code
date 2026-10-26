import assert from "node:assert/strict";
import test from "node:test";
import { EXAMPLES } from "../src/core/examples.js";
import { duplicateKey, evaluateProfile, runConformance, suggestSourceMappings, withGeneratedFields } from "../src/core/validation.js";

function mappingsFor(profile) {
  return Object.fromEntries(profile.fields.map((field) => [field.key, field.source]));
}

function copyRule(profile) {
  return JSON.parse(JSON.stringify(profile.rule));
}

test("every example validates its bundled rows and conformance cases", () => {
  assert.equal(EXAMPLES.length, 3);

  for (const profile of EXAMPLES) {
    const mappings = mappingsFor(profile);
    const results = profile.sampleRows.map((row) => evaluateProfile(profile, row, mappings, copyRule(profile)));
    const conformance = runConformance(profile, mappings, copyRule(profile));

    assert.ok(results.some((result) => result.status === "ready"), profile.id + " needs a ready row");
    assert.ok(results.some((result) => result.status === "exception"), profile.id + " needs a visible exception");
    assert.ok(profile.cases.length >= 4, profile.id + " needs a useful conformance suite");
    assert.ok(conformance.every((result) => result.pass), profile.id + " has a failing conformance case");
  }
});

test("bond thresholds change the decision at the configured cutoff", () => {
  const profile = EXAMPLES.find((example) => example.validator === "bond");
  const row = {
    transaction_id: "SYNTHETIC TEST",
    asset_class: "Corporate Bond",
    trade_date: "2027/01/04",
    execution_time_local: "16:30",
    instrument_id: "BOND TEST",
    execution_timestamp: "2027/01/04 16:30:00",
    counterparty_classification: "Institutional",
    notional_amount: "1000",
    price: "99.5",
    reporting_entity_id: "SYNTHETIC BANK",
    submission_time_local: "08:59"
  };
  const rule = copyRule(profile);
  const mappings = mappingsFor(profile);

  assert.equal(evaluateProfile(profile, row, mappings, rule).status, "ready");
  rule.cutoff = "16:30";
  assert.equal(evaluateProfile(profile, row, mappings, rule).status, "excluded");
});

test("HMDA action values follow the saved rule setting", () => {
  const profile = EXAMPLES.find((example) => example.validator === "hmda");
  const row = profile.sampleRows[2];
  const mappings = mappingsFor(profile);
  const rule = copyRule(profile);

  assert.equal(evaluateProfile(profile, row, mappings, rule).status, "ready");
  rule.settings.actionCodes = "1,3";
  assert.equal(evaluateProfile(profile, row, mappings, rule).status, "exception");
});

test("Call Report tolerance is applied to both balance checks", () => {
  const profile = EXAMPLES.find((example) => example.validator === "call_report");
  const row = {
    rssd_id: "SYNTHETIC TEST",
    report_date: "2026-06-30",
    rcon2170_total_assets: "1000",
    rcon2948_total_liabilities: "910",
    g105_total_equity: "90",
    rcon3300_liabilities_equity: "1001"
  };
  const mappings = mappingsFor(profile);
  const rule = copyRule(profile);

  assert.equal(evaluateProfile(profile, row, mappings, rule).status, "exception");
  rule.settings.toleranceThousands = "1";
  assert.equal(evaluateProfile(profile, row, mappings, rule).status, "ready");
});

test("a public HMDA file without a local key receives stable local row keys", () => {
  const profile = EXAMPLES.find((example) => example.validator === "hmda");
  const inputRows = [{ lei: "SYNTHETIC LEI A" }, { lei: "SYNTHETIC LEI B" }];
  const inputHeaders = ["lei"];
  const prepared = withGeneratedFields(profile, inputRows, inputHeaders);

  assert.deepEqual(prepared.headers, ["lei", "record_key"]);
  assert.deepEqual(prepared.rows.map((row) => row.record_key), ["LOCAL ROW 000001", "LOCAL ROW 000002"]);
  assert.equal(inputRows[0].record_key, undefined);
  assert.equal(inputHeaders.includes("record_key"), false);
});

test("public HMDA headers suggest local mappings and pass the profile checks", () => {
  const profile = EXAMPLES.find((example) => example.validator === "hmda");
  const headers = [
    "lei", "action_taken", "loan_type", "loan_purpose", "loan_amount", "derived_dwelling_category",
    "occupancy_type", "state_code", "county_code", "census_tract", "applicant_ethnicity_1",
    "applicant_race_1", "applicant_sex", "income"
  ];
  const publicRow = {
    lei: "SYNTHETIC PUBLIC LEI",
    action_taken: "1",
    loan_type: "1",
    loan_purpose: "1",
    loan_amount: "320000",
    derived_dwelling_category: "Single Family (1-4 Units):Site-Built",
    occupancy_type: "1",
    state_code: "NY",
    county_code: "36061",
    census_tract: "36061000100",
    applicant_ethnicity_1: "1",
    applicant_race_1: "5",
    applicant_sex: "1",
    income: "125"
  };
  const prepared = withGeneratedFields(profile, [publicRow], headers);
  const mappings = suggestSourceMappings(profile, prepared.headers);
  const result = evaluateProfile(profile, prepared.rows[0], mappings, copyRule(profile));

  assert.equal(mappings.respondent_id, "lei");
  assert.equal(mappings.loan_amount_dollars, "loan_amount");
  assert.equal(mappings.dwelling_category, "derived_dwelling_category");
  assert.equal(mappings.applicant_ethnicity, "applicant_ethnicity_1");
  assert.equal(mappings.applicant_race, "applicant_race_1");
  assert.equal(mappings.applicant_income_000s, "income");
  assert.equal(mappings.record_key, "record_key");
  assert.equal(result.status, "ready");

  const invalidCounty = { ...prepared.rows[0], county_code: "061" };
  assert.ok(evaluateProfile(profile, invalidCounty, mappings, copyRule(profile)).issues.includes("County code must use a five digit state and county FIPS code"));
});

test("compound Call Report keys include the reporting period", () => {
  const profile = EXAMPLES.find((example) => example.validator === "call_report");

  assert.equal(duplicateKey(profile, { rssd_id: "SYNTHETIC 1001", report_date: "2026-06-30" }), "SYNTHETIC 1001|2026-06-30");
  assert.equal(duplicateKey(profile, { rssd_id: "SYNTHETIC 1001", report_date: "" }), "");
});
