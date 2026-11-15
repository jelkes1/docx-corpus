import test from 'node:test';
import assert from 'node:assert/strict';
import {siteFixtureEnvironment, assertSiteFixtureOutput} from '../scripts/site-build-checks.mjs';
const output=()=>({'privacy.html':'<link rel="canonical" href="https://docxcorp.us/privacy"><a href="/privacy.md">Markdown</a>Privacy and cookie choices','privacy.md':'# Privacy and cookie choices\n[Cookie settings](/privacy#cookie-settings)','sitemap.xml':'<urlset><url><loc>https://docxcorp.us/privacy</loc></url></urlset>','llms.txt':'[Privacy](https://docxcorp.us/privacy)\n[Markdown](https://docxcorp.us/privacy.md)'});
test('fixture appends its preload without dropping inherited Node options or mutating its caller',()=>{
 const before={NODE_OPTIONS:'--max-old-space-size=4096 --conditions=fixture-existing',OTHER:'preserved'};
 const env=siteFixtureEnvironment(before,'file:///synthetic-fixture.mjs');
 assert.equal(env.NODE_OPTIONS,before.NODE_OPTIONS+' --import=file:///synthetic-fixture.mjs');assert.equal(env.OTHER,'preserved');assert.equal(before.NODE_OPTIONS,'--max-old-space-size=4096 --conditions=fixture-existing');
 assert.equal(env.DATABASE_URL,'postgresql://synthetic:synthetic@privacy-fixture.invalid/corpus');
 assert.equal(siteFixtureEnvironment({},'file:///fixture.mjs').NODE_OPTIONS,'--import=file:///fixture.mjs');
});
test('actual canonical privacy HTML/Markdown and discovery destinations pass',()=>assert.doesNotThrow(()=>assertSiteFixtureOutput(output())));
for(const [file,value] of [['sitemap.xml','<urlset><!-- privacy --><loc>https://docxcorp.us/dataset</loc></urlset>'],['llms.txt','Privacy information lives somewhere else.'],['llms.txt','[Privacy](https://docxcorp.us/privacy)'],['privacy.html','Privacy and cookie choices'],['privacy.md','# Privacy and cookie choices']]){
 test(`missing actual privacy destination fails despite privacy wording: ${file} ${value.length}`,()=>{
  const files=output();files[file]=value;assert.throws(()=>assertSiteFixtureOutput(files));
 });
}
