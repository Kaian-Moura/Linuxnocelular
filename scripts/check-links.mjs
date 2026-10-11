import {readFile, mkdir, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {load} from 'cheerio';
import {root, walk} from './files.mjs';

const build = path.resolve(root, process.env.DOCUSAURUS_BUILD_DIR || 'build');
const files = await walk(build);
const allFiles = new Set(files.map(f => path.relative(build, f).split(path.sep).join('/')));
const htmlFiles = files.filter(f => f.endsWith('.html'));
const baseUrl = process.env.DOCUSAURUS_BASE_URL || '/';
const pages = new Map();
const errors = [];
for (const file of htmlFiles) {
  const relative = path.relative(build, file).split(path.sep).join('/');
  const route = baseUrl + relative.replace(/index\.html$/, '');
  const source = await readFile(file, 'utf8');
  if (source.includes('\u0000')) errors.push(`${relative}: HTML contém byte NUL; confira o renderizador React antes de publicar`);
  const $ = load(source);
  const ids = new Set($('[id]').map((_,el) => $(el).attr('id')).get());
  const links = $('a[href]').map((_,el) => $(el).attr('href')).get();
  pages.set(route, {ids, links, file: relative});
}
let checked = 0;
for (const [route, page] of pages) {
  for (const href of page.links) {
    if (!href || /^(?:https?:|mailto:|tel:|data:|javascript:|\/\/)/i.test(href)) continue;
    const url = new URL(href, `https://local.invalid${route}`);
    if (!url.pathname.startsWith(baseUrl)) {errors.push(`${page.file} → ${href}: fora da base ${baseUrl}`); continue;}
    let pathname;
    try {pathname = decodeURIComponent(url.pathname);} catch {errors.push(`${page.file} → ${href}: URL inválida`);continue;}
    const target = pages.get(pathname) || pages.get(pathname.endsWith('/') ? pathname.slice(0,-1) : pathname+'/');
    const staticPath = pathname.slice(baseUrl.length);
    checked++;
    if (!target) {
      if (!allFiles.has(staticPath)) errors.push(`${page.file} → ${href}: destino não existe`);
      continue;
    }
    if (url.hash) {
      let anchor;
      try {anchor = decodeURIComponent(url.hash.slice(1));} catch {errors.push(`${page.file} → ${href}: âncora inválida`);continue;}
      if (!target.ids.has(anchor)) errors.push(`${page.file} → ${href}: âncora não existe`);
    }
  }
}
await mkdir(path.join(root, 'reports'), {recursive: true});
const report = process.env.DOCUSAURUS_BUILD_DIR ? 'internal-links-subpath.json' : 'internal-links.json';
await writeFile(path.join(root, 'reports', report), JSON.stringify({generatedAt: new Date().toISOString(), baseUrl, pages: pages.size, checked, errors},null,2)+'\n');
for (const error of errors) console.error(error);
console.log(`${pages.size} páginas HTML; ${checked} links/âncoras locais verificados; ${errors.length} erros.`);
if (errors.length) process.exitCode = 1;
