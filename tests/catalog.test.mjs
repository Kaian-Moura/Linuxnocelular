import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile, access} from 'node:fs/promises';
const devices=JSON.parse(await readFile(new URL('../data/devices.json',import.meta.url),'utf8'));
test('registros exigem contexto, data, fonte e limites, sem estado genérico funciona',async()=>{
  const seen=new Set();
  for(const d of devices) {
    for(const field of ['id','manufacturer','model','environment','evidence','lastReviewed','guide','source','limits']) assert.ok(d[field]?.length>0,`${d.id}: falta ${field}`);
    assert.ok(!seen.has(d.id));seen.add(d.id);
    assert.ok(['experimental','documental','hardware'].includes(d.status));
    assert.match(d.lastReviewed,/^\d{4}-\d{2}-\d{2}$/);
    assert.equal(new URL(d.source).protocol,'https:');
    assert.match(d.guide,/^\/docs\/[a-z0-9/-]+\/$/);
    const relative=d.guide.replace(/^\/docs\//,'').replace(/\/$/,'');
    await access(new URL(`../docs/${relative}.md`,import.meta.url));
  }
});
