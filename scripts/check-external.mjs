import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {documents, root} from './files.mjs';
import {reportUrl} from './report-url.mjs';

const refs = new Map();
for (const doc of await documents()) {
  for (const match of doc.content.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)) {
    const url = match[1];
    if (!refs.has(url)) refs.set(url, new Set());
    refs.get(url).add(doc.name);
  }
}
const queue = [...refs], results = [];
let cursor = 0;
async function worker() {
  while (cursor < queue.length) {
    const [url, sources] = queue[cursor++];
    const result = {url, pages: [...sources]};
    try {
      const response = await fetch(url, {signal: AbortSignal.timeout(12000), redirect: 'follow', headers: {'User-Agent': 'CelularLinuxDocs-LinkCheck/1.0 (documentation reference availability)'}});
      result.status = response.status;
      result.finalUrl = reportUrl(response.url);
      if (result.finalUrl !== response.url) result.finalUrlParametersRemoved = true;
      result.redirected = response.redirected;
      const reader = response.body?.getReader();
      let sample = '', bytes = 0;
      if (reader) {
        while (bytes < 16000) {
          const {value,done} = await reader.read(); if(done) break;
          bytes += value.byteLength; sample += new TextDecoder().decode(value);
        }
        await reader.cancel();
      }
      result.automationBlocked = /(?:<title>[^<]*(?:access denied|making sure|denied)|anubis_challenge|anubis_version)/i.test(sample);
      result.outcome = result.automationBlocked ? 'inconclusive-blocked' : [404,410].includes(response.status) ? 'missing' : response.ok ? 'reachable' : 'inconclusive-http';
    } catch(error) {result.outcome='inconclusive-network';result.error=error.message;}
    results.push(result);
    if (results.length%25 === 0) console.log(`${results.length}/${queue.length} fontes consultadas`);
  }
}
await Promise.all(Array.from({length:6}, worker));
results.sort((a,b)=>a.url.localeCompare(b.url));
const counts = results.reduce((all,r)=>(all[r.outcome]=(all[r.outcome]||0)+1,all),{});
await mkdir(path.join(root,'reports'),{recursive:true});
await writeFile(path.join(root,'reports/external-links.json'),JSON.stringify({generatedAt:new Date().toISOString(),meaning:'Disponibilidade HTTP; não valida conteúdo ou suporte de hardware. Bloqueios/timeouts são inconclusivos.',counts,results},null,2)+'\n');
console.log(JSON.stringify(counts));
for (const item of results.filter(r=>r.outcome==='missing')) console.error(`${item.status} ${item.url}`);
if (counts.missing) process.exitCode=1;
