import { execFileSync } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import {siteFixtureEnvironment, assertSiteFixtureOutput} from './site-build-checks.mjs';

const app = new URL('../apps/site/', import.meta.url);
const astro = JSON.parse(await readFile(new URL('node_modules/astro/package.json', app), 'utf8'));
const binary = typeof astro.bin === 'string' ? astro.bin : astro.bin.astro;
execFileSync(process.execPath, [fileURLToPath(new URL('node_modules/astro/' + binary, app)), 'build'], {
  cwd: fileURLToPath(app),
  stdio: 'inherit',
  env: siteFixtureEnvironment(process.env,new URL('./site-build-fixture.mjs', import.meta.url).href),
});
// Prove a useful build: synthetic SQL facets and documents reached actual HTML,
// while privacy content and discovery surfaces are present in the output.
assert.match(await readFile(new URL('dist/types/legal.html', app), 'utf8'), /Synthetic contract/);
assert.match(await readFile(new URL('dist/types/technical.html', app), 'utf8'), /Synthetic specification/);
const output={};
for(const name of ['privacy.html','privacy.md','sitemap.xml','llms.txt'])output[name]=await readFile(new URL('dist/'+name,app),'utf8');
assertSiteFixtureOutput(output);
console.log('Synthetic site build and privacy discovery output verified.');
