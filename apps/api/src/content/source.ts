import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import type { Bundle } from './build.js';

export interface ContentSource {
  load(): Promise<Bundle>;
}

// apps/api is the nearest ancestor with a package.json: src/content/ under tsx, dist/src/content/ compiled.
function apiRoot(): string {
  let dir = import.meta.dirname;
  while (!existsSync(join(dir, 'package.json'))) {
    const up = dirname(dir);
    if (up === dir) throw new Error('apps/api root not found');
    dir = up;
  }
  return dir;
}

export class FileContentSource implements ContentSource {
  constructor(readonly path = resolve(apiRoot(), 'content-bundle.json')) {}
  async load(): Promise<Bundle> {
    return JSON.parse(await readFile(this.path, 'utf8')) as Bundle;
  }
}
