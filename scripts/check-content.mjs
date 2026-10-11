import {mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {documents, root} from './files.mjs';

const docs = await documents(), errors = [], warnings = [];
const metrics = docs.map(doc => {
  const prose = doc.content.replace(/```[\s\S]*?```/g, '').replace(/<[^>]*>/g, '');
  const words = prose.split(/\s+/).filter(Boolean).length;
  const commands = [...doc.content.matchAll(/```(?:bash|sh|shell|console)\n/g)].length;
  const sources = [...new Set([...doc.content.matchAll(/\]\((https?:\/\/[^\s)]+)\)/g)].map(m => m[1]))];
  if (!doc.data.title || !doc.data.description) errors.push(`${doc.name}: faltam título ou descrição`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(doc.data.last_verified || ''))) errors.push(`${doc.name}: falta data last_verified válida`);
  if (!/(?:fontes|referências|verificação)/iu.test(doc.content)) errors.push(`${doc.name}: falta contexto de evidência`);
  if (sources.length === 0 && !doc.name.includes('/escolha/criterios')) errors.push(`${doc.name}: faltam fontes externas`);
  if (words < 300) errors.push(`${doc.name}: apenas ${words} palavras de conteúdo; revise a profundidade`);
  if (words < 500) warnings.push(`${doc.name}: ${words} palavras; confira se o escopo está completo`);
  if (/-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----/.test(doc.source)) errors.push(`${doc.name}: possível chave privada`);
  if (/https?:\/\/[^\s)]*\.example(?:[\/\s)]|$)/.test(doc.content)) warnings.push(`${doc.name}: contém domínio ilustrativo; confirme identificação explícita`);
  if (/^\s*(?:TODO|FIXME|TBD)\b/m.test(doc.content)) errors.push(`${doc.name}: marcador de conteúdo incompleto`);
  return {file: doc.name, title: doc.data.title, lastVerified: doc.data.last_verified, words, commandBlocks: commands, sourceCount: sources.length};
});
await mkdir(path.join(root, 'reports'), {recursive: true});
await writeFile(path.join(root, 'reports/content.json'), JSON.stringify({generatedAt: new Date().toISOString(), pages: docs.length, words: metrics.reduce((sum,m) => sum+m.words,0), metrics, warnings, errors}, null, 2)+'\n');
for (const error of errors) console.error(error);
for (const warning of warnings) console.warn(warning);
console.log(`${docs.length} páginas; ${metrics.reduce((sum,m) => sum+m.words,0).toLocaleString('pt-BR')} palavras de texto; ${errors.length} erros editoriais automáticos.`);
if (errors.length) process.exitCode = 1;
