import test from 'node:test';
import assert from 'node:assert/strict';
import {readFrontMatter} from '../scripts/front-matter.mjs';

test('metadados YAML preservam data textual, lista e corpo Markdown',()=>{
  const result=readFrontMatter('---\ntitle: Guia\nlast_verified: "2026-10-10"\ntags: [linux, android]\n---\n## Corpo\n');
  assert.deepEqual(result.data,{title:'Guia',last_verified:'2026-10-10',tags:['linux','android']});
  assert.equal(result.content,'## Corpo\n');
});
test('arquivo sem metadados não perde conteúdo',()=>{
  assert.deepEqual(readFrontMatter('# Conteúdo\n---\n'),{data:{},content:'# Conteúdo\n---\n'});
});
test('metadados truncados, escalares e chaves duplicadas são rejeitados',()=>{
  for(const source of ['---\ntitle: Guia\n','---\ntexto\n---\n','---\ntitle: A\ntitle: B\n---\n']) assert.throws(()=>readFrontMatter(source));
});
test('delimitadores CRLF e BOM são aceitos sem alterar o corpo',()=>{
  assert.deepEqual(readFrontMatter('\uFEFF---\r\ntitle: Guia\r\n---\r\nCorpo'),{data:{title:'Guia'},content:'Corpo'});
  assert.deepEqual(readFrontMatter('---\n---\nCorpo'),{data:{},content:'Corpo'});
});
