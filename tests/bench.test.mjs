import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {createBench,readBench,benchMarkdown,benchGaps,benchChecks,encodeDownloadText} from '../src/lib/bench.mjs';
test('ficha exportada retoma campos e resultados sem importar metadados estranhos',()=>{
  const data=createBench(); data.fields.model='Aparelho fictício';data.checks.video={status:'failed',evidence:'Montagem X; sem imagem; 11/10, 5 minutos.'};
  const source={...data,password:'não importar',fields:{...data.fields,serial:'não importar'},checks:{...data.checks,extra:{status:'passed'}}};
  assert.deepEqual(readBench(JSON.stringify(source)),{data});
  assert.equal(createBench().fields.model,'');
});
test('importação recusa formato, versão, campos, estados e limites inválidos',()=>{
  for(const raw of ['{','null','[]',JSON.stringify({...createBench(),version:9}),'x'.repeat(50001)]) assert.ok(readBench(raw).error);
  for(const modify of [data=>{data.fields.model=null;},data=>{data.fields.notes='x'.repeat(1501);},data=>{data.fields.model='\u0000';},data=>{delete data.checks.video;},data=>{data.checks.video.status='certified';},data=>{data.checks.video.status=['passed'];},data=>{data.checks.video.evidence='x'.repeat(801);}]) {const data=createBench();modify(data);assert.ok(readBench(JSON.stringify(data)).error);}
});
test('resultados sem observação são lacunas e não viram certificação',()=>{
  const data=createBench();data.checks.video.status='passed';
  assert.ok(benchGaps(data).some(item=>item.startsWith('Vídeo')));
  const markdown=benchMarkdown(data);
  assert.match(markdown,/Não certifica suporte/);
  assert.match(markdown,/Observação: Não descrita/);
  assert.match(markdown,/ainda sem registro/);
});
test('texto de leitor é escapado no Markdown e não injeta títulos, HTML ou links',()=>{
  const data=createBench();data.fields.model='<script>\n# modelo [clique](https://exemplo.invalid)';
  const markdown=benchMarkdown(data);
  assert.ok(markdown.includes('\\<script\\> / \\# modelo \\[clique\\]'));
  assert.ok(!markdown.includes('\n# modelo'));
  assert.ok(!markdown.includes('<script>'));
});
test('todos os guias de diagnóstico da ficha existem',()=>{
  for(const item of benchChecks) {const stem=item.href.slice(1,-1);assert.ok([`${stem}.md`,`${stem}.mdx`,`${stem}/index.md`,`${stem}/index.mdx`].some(name=>existsSync(new URL(`../${name}`,import.meta.url))),item.href);}
});
test('Unicode malformado é recusado na importação e não quebra a codificação de download',()=>{
  for (const invalid of ['\uD800', '\uDFFF', 'antes\uD800depois']) {
    const data=createBench();data.fields.model=invalid;
    assert.ok(readBench(JSON.stringify(data)).error);
    data.fields.model='Modelo';data.checks.video.evidence=invalid;
    assert.ok(readBench(JSON.stringify(data)).error);
    assert.doesNotThrow(()=>encodeDownloadText(benchMarkdown(data)));
  }
  const data=createBench();data.fields.model='Aparelho 🐧 com acentuação';
  assert.deepEqual(readBench(JSON.stringify(data)),{data});
  assert.equal(decodeURIComponent(encodeDownloadText(data.fields.model)),data.fields.model);
});
