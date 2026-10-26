import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL(".", import.meta.url));
const host = process.env.REGULATION_AS_CODE_HOST || "127.0.0.1";
const port = Number(process.env.REGULATION_AS_CODE_PORT || 4173);
const publicAssets = new Set([
  "/index.html",
  "/src/client/styles.css",
  "/src/client/runtime.js",
  "/src/client/studio.js",
  "/src/core/examples.js",
  "/src/core/validation.js"
]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml"
};

createServer(async (request, response) => {
  const url = new URL(request.url || "/", "http://localhost");
  const requested = url.pathname === "/" ? "/index.html" : url.pathname;
  if (!publicAssets.has(requested)) {
    response.writeHead(404).end("Not found");
    return;
  }
  const path = join(root, requested);
  try {
    const info = await stat(path);
    if (!info.isFile()) throw new Error("Not a file");
    const content = await readFile(path);
    response.writeHead(200, { "content-type": types[extname(path)] || "application/octet-stream", "cache-control": "no-store" });
    response.end(content);
  } catch {
    response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not found");
  }
}).listen(port, host, () => {
  process.stdout.write("Regulation as Code Studio is ready at http://" + host + ":" + port + "\n");
});
