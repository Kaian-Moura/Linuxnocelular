import {parse} from 'yaml';

// O projeto só aceita metadados YAML delimitados por --- no início do arquivo.
// A sintaxe YAML é lida pela biblioteca mantida; não há avaliação de JavaScript.
export function readFrontMatter(source) {
  const normalized=source.replace(/^\uFEFF/,'');
  if(!/^---[ \t]*\r?\n/.test(normalized)) return {data:{},content:normalized};
  const match=normalized.match(/^---[ \t]*\r?\n([\s\S]*?)^---[ \t]*(?:\r?\n|$)/m);
  if(!match) throw new Error('Metadados YAML sem delimitador de fechamento');
  const data=parse(match[1],{maxAliasCount:0})??{};
  if(typeof data!=='object'||Array.isArray(data)) throw new Error('Metadados YAML precisam formar um mapa');
  return {data,content:normalized.slice(match[0].length)};
}
