import {spawnSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {root, documents} from './files.mjs';

// Somente parsers: nunca executar o conteúdo dos exemplos.
const environment={...process.env};
delete environment.BASH_ENV;
delete environment.ENV;
const counts={bash:0,sh:0,python:0};
const errors=[];
for (const doc of await documents()) {
  for (const match of doc.source.matchAll(/^```(bash|sh|python)[^\n]*\n([\s\S]*?)^```\s*$/gm)) {
    const [,language,code]=match;
    const line=doc.source.slice(0,match.index).split('\n').length;
    const executable=language==='python'?'python3':'bash';
    const args=language==='python'
      ? ['-c','import ast,sys; ast.parse(sys.stdin.read(), filename="documentation-snippet")']
      : ['--noprofile','--norc','-n'];
    const result=spawnSync(executable,args,{input:code,encoding:'utf8',env:environment,timeout:10000});
    counts[language]++;
    if(result.error||result.status!==0) errors.push(`${doc.name}:${line}: ${result.error?.message||result.stderr.trim()||'parser falhou'}`);
  }
}
await mkdir(path.join(root,'reports'),{recursive:true});
await writeFile(path.join(root,'reports/snippets.json'),JSON.stringify({generatedAt:new Date().toISOString(),meaning:'Validação sintática apenas; nenhum comando documentado foi executado.',counts,errors},null,2)+'\n');
errors.forEach(error=>console.error(error));
console.log(`${Object.values(counts).reduce((a,b)=>a+b,0)} blocos analisados sem execução; ${errors.length} erros.`);
if(errors.length) process.exitCode=1;
