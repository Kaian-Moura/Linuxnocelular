import {readdir, readFile} from 'node:fs/promises';
import path from 'node:path';
import {readFrontMatter} from './front-matter.mjs';
export const root = path.resolve(import.meta.dirname, '..');
export async function walk(dir) {
  const entries = await readdir(dir, {withFileTypes: true});
  const result = await Promise.all(entries.map(e => e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
  return result.flat().sort();
}
export async function documents() {
  const files = (await walk(path.join(root, 'docs'))).filter(f => /\.mdx?$/.test(f));
  return Promise.all(files.map(async file => {
    const source = await readFile(file, 'utf8');
    const {data, content} = readFrontMatter(source);
    return {file, name: path.relative(root, file), data, content, source};
  }));
}
