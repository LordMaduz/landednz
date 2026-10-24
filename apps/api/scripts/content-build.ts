// npm run content:build -w @landednz/api — validate content, write the bundle and packages/types/dimensions.ts.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildBundle, dimensionsTs } from '../src/content/build.js';

const api = resolve(import.meta.dirname, '..');
const dir = process.env.CONTENT_DIR ? resolve(process.env.CONTENT_DIR) : resolve(api, 'content');
const result = buildBundle(dir, { now: new Date(), allowUnverified: process.env.CONTENT_ALLOW_UNVERIFIED === 'true' });

if ('errors' in result) {
  for (const e of result.errors) console.error(`${e.file}${e.id ? `:${e.id}` : ''} ${e.rule} — ${e.message}`);
  console.error(`content:build failed: ${result.errors.length} error(s)`);
  process.exit(1);
}
const { bundle } = result;
writeFileSync(resolve(api, 'content-bundle.json'), `${JSON.stringify(bundle, null, 2)}\n`);
writeFileSync(resolve(api, '../../packages/types/dimensions.ts'), dimensionsTs(bundle.dimensions));
console.log(`content:build ${bundle.version}: ${bundle.tasks.length} tasks, ${Object.keys(bundle.facts).length} facts`);
