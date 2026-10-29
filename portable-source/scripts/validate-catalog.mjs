import { readFile } from "node:fs/promises";
import path from "node:path";
import Ajv from "ajv";
import { parse } from "yaml";

const root = process.cwd();
const catalogRoot = path.join(root, "catalog");
const ajv = new Ajv({ allErrors: true, strict: false });
const errors = [];

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

async function readYaml(relativePath) {
  return parse(await readFile(path.join(root, relativePath), "utf8"), {
    uniqueKeys: true,
  });
}

function validate(schema, data, label) {
  const check = ajv.compile(schema);
  if (check(data)) return;
  for (const issue of check.errors ?? []) {
    errors.push(`${label} ${issue.instancePath || "/"} ${issue.message}`);
  }
}

function assert(condition, message) {
  if (!condition) errors.push(message);
}

const schemas = {
  index: await readJson("catalog/schemas/catalog-index.schema.json"),
  sources: await readJson("catalog/schemas/source-manifest.schema.json"),
  interpretation: await readJson("catalog/schemas/interpretation.schema.json"),
  rule: await readJson("catalog/schemas/rule.schema.json"),
  testPlan: await readJson("catalog/schemas/test-plan.schema.json"),
};

const index = await readYaml("catalog/index.yaml");
validate(schemas.index, index, "catalog/index.yaml");

const seen = new Set();
for (const entry of index.entries ?? []) {
  assert(!seen.has(entry.id), `Duplicate catalog id: ${entry.id}`);
  seen.add(entry.id);

  const relativePackagePath = entry.package_path ?? "";
  assert(
    !path.isAbsolute(relativePackagePath) &&
      !relativePackagePath.split(/[\\/]+/).includes(".."),
    `Package ${entry.id}: package_path must stay inside catalog/`,
  );
  if (
    path.isAbsolute(relativePackagePath) ||
    relativePackagePath.split(/[\\/]+/).includes("..")
  ) {
    continue;
  }

  const packageRoot = path.join(catalogRoot, entry.package_path ?? "");
  const packageFiles = {
    sources: path.join(packageRoot, "sources.yaml"),
    interpretation: path.join(packageRoot, "interpretation.yaml"),
    rule: path.join(packageRoot, "rule.yaml"),
    testPlan: path.join(packageRoot, "test-plan.yaml"),
  };

  let sources;
  let interpretation;
  let rule;
  let testPlan;
  try {
    [sources, interpretation, rule, testPlan] = await Promise.all(
      Object.values(packageFiles).map(async (file) =>
        parse(await readFile(file, "utf8"), { uniqueKeys: true }),
      ),
    );
  } catch (error) {
    errors.push(
      `Package ${entry.id}: could not read required YAML files (${error.message})`,
    );
    continue;
  }

  validate(schemas.sources, sources, packageFiles.sources);
  validate(schemas.interpretation, interpretation, packageFiles.interpretation);
  validate(schemas.rule, rule, packageFiles.rule);
  validate(schemas.testPlan, testPlan, packageFiles.testPlan);

  const sourceIds = new Set((sources.sources ?? []).map((source) => source.id));
  for (const [label, document] of [
    ["interpretation", interpretation],
    ["rule", rule],
  ]) {
    for (const sourceRef of document.source_refs ?? []) {
      assert(
        sourceIds.has(sourceRef),
        `${entry.id} ${label} references missing source id: ${sourceRef}`,
      );
    }
  }

  assert(
    sources.regulation_id === entry.id &&
      interpretation.regulation_id === entry.id &&
      rule.regulation_id === entry.id &&
      testPlan.regulation_id === entry.id,
    `Package ${entry.id}: regulation_id must match across all package files`,
  );

  if (interpretation.status !== "legal-reviewed") {
    assert(
      rule.status !== "approved" && rule.implementation?.executable !== true,
      `Package ${entry.id}: executable/approved rule requires legal-reviewed interpretation`,
    );
  }
}

if (errors.length) {
  console.error("Catalog validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exitCode = 1;
} else {
  console.log(`Catalog valid: ${index.entries.length} package(s), schemas and source references checked.`);
}
