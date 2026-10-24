// Build the content bundle once per run, same output as `npm run content:build` (minus dimensions.ts).
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { buildBundle } from './src/content/build.js';

export default function setup() {
  const result = buildBundle(resolve(import.meta.dirname, 'content'), { now: new Date(), allowUnverified: true });
  if ('errors' in result) throw new Error(`content build failed:\n${result.errors.map((e) => `${e.file} ${e.rule} ${e.message}`).join('\n')}`);
  writeFileSync(resolve(import.meta.dirname, 'content-bundle.json'), `${JSON.stringify(result.bundle, null, 2)}\n`);
}
