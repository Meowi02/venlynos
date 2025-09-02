import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const outDir = join(__dirname, '..', '.next');
  const outFile = join(outDir, 'mock.json');
  await mkdir(outDir, { recursive: true });
  const data = { seededAt: new Date().toISOString() };
  await writeFile(outFile, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Wrote', outFile);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

