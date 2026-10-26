import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { EXAMPLES, exampleCsv } from "../src/core/examples.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = resolve(root, "examples");
await mkdir(output, { recursive: true });

for (const example of EXAMPLES) {
  const path = resolve(output, example.csvFile);
  await writeFile(path, exampleCsv(example), "utf8");
  process.stdout.write("Wrote " + path.slice(root.length + 1) + "\n");
}
