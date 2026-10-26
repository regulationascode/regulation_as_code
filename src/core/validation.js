export function normalizeRecord(profile, raw, mappings) {
  const record = {};
  profile.fields.forEach((field) => {
    record[field.key] = raw && mappings[field.key] ? raw[mappings[field.key]] : undefined;
  });
  return record;
}

export function withGeneratedFields(profile, inputRows, inputHeaders) {
  const headers = inputHeaders.slice();
  const rows = inputRows.map((row) => ({ ...row }));
  profile.fields.filter((field) => field.generated === "row_number" && !headers.includes(field.source)).forEach((field) => {
    headers.push(field.source);
    rows.forEach((row, index) => {
      row[field.source] = "LOCAL ROW " + String(index + 1).padStart(6, "0");
    });
  });
  return { headers, rows };
}

export function suggestSourceMappings(profile, headers, currentMappings = {}) {
  const next = { ...currentMappings };
  profile.fields.forEach((field) => {
    const candidates = [field.source, ...(field.sourceAliases || [])].filter(Boolean);
    const match = candidates.find((candidate) => headers.includes(candidate));
    if (match) next[field.key] = match;
  });
  return next;
}

function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function missingRequired(profile, record) {
  return profile.requiredFields
    .filter((key) => isBlank(record[key]))
    .map((key) => {
      const field = profile.fields.find((item) => item.key === key);
      return "Missing " + (field ? field.label.toLowerCase() : key);
    });
}

function clockValue(value) {
  const match = String(value || "").match(/(?:T|\s)?([01]?\d|2[0-3]):([0-5]\d)/);
  return match ? String(match[1]).padStart(2, "0") + ":" + match[2] : "";
}

function dateDigits(value) {
  return String(value || "").replace(/\D/g, "").slice(0, 8);
}

function numericValue(value) {
  if (isBlank(value)) return NaN;
  return Number(String(value).replace(/,/g, ""));
}

function evaluateBond(profile, record, raw, rule) {
  const issues = [];
  const time = clockValue(record.execution_time_local || record.execution_timestamp);
  if (isBlank(record.asset_class) || !time || isBlank(record.trade_date)) {
    const issue = isBlank(record.asset_class) ? "Product class is not mapped" : !time ? "Local execution time is not mapped" : "Trade date is not mapped";
    return { status: "exception", record, raw, issues: [issue] };
  }
  if (!/corporate[\s_]?bond/i.test(String(record.asset_class)) || time <= rule.cutoff) {
    return { status: "excluded", record, raw, issues };
  }
  if (dateDigits(record.trade_date) !== dateDigits(record.execution_timestamp)) issues.push("Trade date does not match execution date");
  issues.push(...missingRequired(profile, record));
  const notional = numericValue(record.notional_amount);
  const price = numericValue(record.price);
  if (!isBlank(record.notional_amount) && !(notional > 0)) issues.push("Notional amount must be above zero");
  if (!isBlank(record.price) && !(price > 0)) issues.push("Price must be above zero");
  const submissionTime = clockValue(record.submission_time_local || raw.reported_at_local);
  if (!submissionTime) issues.push("Submission time is missing or invalid");
  else if (submissionTime > rule.deadline) issues.push("Submission was recorded after the deadline");
  if (issues.length) return { status: "exception", record, raw, issues };
  const knownClasses = ["Institutional", "Dealer", "Asset Manager"];
  if (record.counterparty_classification && !knownClasses.includes(String(record.counterparty_classification))) {
    return { status: "warning", record, raw, issues: ["Counterparty category is outside this synthetic example list"] };
  }
  return { status: "ready", record, raw, issues };
}

function evaluateHmda(profile, record, raw, rule) {
  const issues = missingRequired(profile, record);
  if (!isBlank(record.action_taken)) {
    const validActions = String(rule.settings && rule.settings.actionCodes || "1,2,3,4,5,6,7,8")
      .split(",").map((item) => item.trim()).filter(Boolean);
    if (!validActions.includes(String(record.action_taken).trim())) issues.push("Action value is outside the approved profile list");
  }
  if (!isBlank(record.loan_amount_dollars)) {
    const amount = numericValue(record.loan_amount_dollars);
    if (!(amount > 0) || !Number.isInteger(amount)) issues.push("Loan amount must be a positive whole dollar amount");
  }
  if (!isBlank(record.state_code) && !/^[A-Z]{2}$/.test(String(record.state_code).trim())) issues.push("State code must use two uppercase letters");
  if (!isBlank(record.county_code) && !/^\d{5}$/.test(String(record.county_code).trim())) issues.push("County code must use a five digit state and county FIPS code");
  return { status: issues.length ? "exception" : "ready", record, raw, issues };
}

function evaluateCallReport(profile, record, raw, rule) {
  const issues = missingRequired(profile, record);
  if (!isBlank(record.report_date) && !/^\d{4}-\d{2}-\d{2}$/.test(String(record.report_date).trim())) issues.push("Report date must use YYYY-MM-DD format");
  const fields = ["rcon2170_total_assets", "rcon2948_total_liabilities", "g105_total_equity", "rcon3300_liabilities_equity"];
  const values = {};
  fields.forEach((key) => {
    if (!isBlank(record[key])) {
      values[key] = numericValue(record[key]);
      if (!Number.isFinite(values[key])) issues.push("" + key.toUpperCase() + " must be numeric");
    }
  });
  if (Object.keys(values).length === fields.length && Object.values(values).every(Number.isFinite)) {
    const tolerance = Math.max(0, numericValue(rule.settings && rule.settings.toleranceThousands || "0"));
    if (Math.abs(values.rcon2170_total_assets - values.rcon3300_liabilities_equity) > tolerance) {
      issues.push("Total assets do not tie to total liabilities and equity");
    }
    if (Math.abs(values.rcon2948_total_liabilities + values.g105_total_equity - values.rcon3300_liabilities_equity) > tolerance) {
      issues.push("Total liabilities plus equity do not tie to the reported total");
    }
  }
  return { status: issues.length ? "exception" : "ready", record, raw, issues };
}

export function evaluateProfile(profile, raw, mappings, rule) {
  const record = normalizeRecord(profile, raw, mappings);
  if (profile.validator === "bond") return evaluateBond(profile, record, raw || {}, rule);
  if (profile.validator === "hmda") return evaluateHmda(profile, record, raw || {}, rule);
  if (profile.validator === "call_report") return evaluateCallReport(profile, record, raw || {}, rule);
  return { status: "exception", record, raw, issues: ["No validator is configured for this example"] };
}

export function duplicateKey(profile, record) {
  const keys = profile.duplicateFields || [];
  if (!keys.length) return "";
  const values = keys.map((key) => String(record[key] == null ? "" : record[key]).trim());
  return values.some((value) => !value) ? "" : values.join("|");
}

export function rawFromValues(profile, values, mappings) {
  const raw = {};
  profile.fields.forEach((field) => {
    raw[mappings[field.key]] = values[field.key] == null ? "" : values[field.key];
  });
  return raw;
}

export function runConformance(profile, mappings, rule) {
  return profile.cases.map((test) => {
    const raw = rawFromValues(profile, test.values, mappings);
    const actual = evaluateProfile(profile, raw, mappings, rule).status;
    return { name: test.name, expected: test.expected, actual, pass: actual === test.expected };
  });
}
