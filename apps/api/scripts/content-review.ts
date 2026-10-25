// npm run content:review -w @landednz/api -- <taskId> — write apps/api/content-review/<taskId>.html for owner review.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadContent } from '../src/content/index.js';
import { reviewHtml } from '../src/content/review.js';

const id = process.argv[2];
if (!id) {
  console.error('usage: npm run content:review -w @landednz/api -- <taskId>');
  process.exit(1);
}
const out = resolve(import.meta.dirname, '../content-review');
mkdirSync(out, { recursive: true });
const file = resolve(out, `${id}.html`);
writeFileSync(file, reviewHtml(await loadContent(), id));
console.log(file);
