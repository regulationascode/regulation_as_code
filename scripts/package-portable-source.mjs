import archiver from 'archiver';
import { createWriteStream } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'portable-source');
const outputPath = path.join(root, 'public', 'portable-source.zip');

await new Promise((resolve, reject) => {
  const output = createWriteStream(outputPath);
  const archive = archiver('zip', { zlib: { level: 9 } });
  output.once('close', resolve);
  output.once('error', reject);
  archive.once('error', reject);
  archive.pipe(output);
  archive.directory(source, false);
  archive.finalize();
});

console.log(`Created ${path.relative(root, outputPath)}`);
