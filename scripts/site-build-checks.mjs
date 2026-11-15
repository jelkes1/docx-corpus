import assert from 'node:assert/strict';

export function siteFixtureEnvironment(environment, fixtureImport) {
  return {
    ...environment,
    DATABASE_URL: 'postgresql://synthetic:synthetic@privacy-fixture.invalid/corpus',
    NODE_OPTIONS: [environment.NODE_OPTIONS, `--import=${fixtureImport}`].filter(Boolean).join(' '),
  };
}

export function assertSiteFixtureOutput(output) {
  const html=output['privacy.html'];
  const canonical=[...html.matchAll(/<link\b[^>]*>/gi)].some(([tag])=>
    /\brel="canonical"/.test(tag)&&/\bhref="https:\/\/docxcorp\.us\/privacy"/.test(tag));
  assert.ok(canonical,'Privacy HTML must identify its canonical /privacy URL');
  assert.match(html,/href="\/privacy\.md"/,'Privacy HTML must link its Markdown notice');
  assert.match(output['privacy.md'],/\[Cookie settings\]\(\/privacy#cookie-settings\)/);
  assert.match(output['sitemap.xml'],/<loc>https:\/\/docxcorp\.us\/privacy<\/loc>/,'Sitemap must list the exact privacy route');
  assert.match(output['llms.txt'],/\]\(https:\/\/docxcorp\.us\/privacy\)/,'Agent index must link the HTML privacy route');
  assert.match(output['llms.txt'],/\]\(https:\/\/docxcorp\.us\/privacy\.md\)/,'Agent index must link the Markdown privacy route');
}
