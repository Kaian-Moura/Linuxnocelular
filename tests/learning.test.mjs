import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {PROGRESS_VERSION, readProgress, exportProgress, tracks, questions} from '../src/lib/learning.mjs';

test('progresso descarta versões desconhecidas e registros malformados', () => {
  for (const raw of [null, {}, '', '{', 'null', '[]', 'x'.repeat(10001), JSON.stringify({version: 2, track: 'termux', completed: []}), JSON.stringify({version: 1, track: 'inventado', completed: []}), JSON.stringify({version: 1, track: 'native', completed: 'identity'})]) assert.equal(readProgress(raw), null);
});

test('restauração minimiza dados, remove IDs estranhos e preserva aulas compartilhadas', () => {
  const raw = JSON.stringify({version: PROGRESS_VERSION, track: 'desktop', completed: ['identity', 'identity', 'termux-project', 'backup', 'unknown', null, 1, {}], serial: 'SEGREDO', password: 'SENHA'});
  assert.deepEqual(readProgress(raw), {version: 1, track: 'desktop', completed: ['identity', 'termux-project', 'backup']});
});

test('exportação conserva marcações e limites sem dados desconhecidos', () => {
  const markdown = exportProgress('native', ['identity', 'unknown', 'SEGREDO']);
  assert.match(markdown, /\[x\] Conhecer meu aparelho/);
  assert.match(markdown, /\[ \] Preparar um plano concreto de retorno/);
  assert.match(markdown, /Não comprovam compatibilidade/);
  assert.match(markdown, /Local: /);
  assert.doesNotMatch(markdown, /unknown|SEGREDO/);
});

test('cada aula e revisão de conceito aponta a um documento existente', () => {
  const links = [...tracks.flatMap(track => track.lessons.map(lesson => lesson.href)), ...questions.map(question => question.href)];
  for (const href of links) {
    const stem = href.replace(/^\//, '').replace(/\/$/, '');
    assert.ok([`${stem}.md`, `${stem}.mdx`, `${stem}/index.md`, `${stem}/index.mdx`].some(path => existsSync(new URL(`../${path}`, import.meta.url))), `Documento ausente: ${href}`);
  }
});

test('novas trilhas preservam registros antigos e compartilham somente identificadores conhecidos', () => {
  assert.equal(tracks.length, 6);
  assert.deepEqual(tracks.slice(0, 3).map(track => [track.id, track.lessons.length]), [['termux', 6], ['desktop', 7], ['native', 10]]);
  for (const id of ['development', 'server', 'electronics']) {
    const restored = readProgress(JSON.stringify({version: 1, track: id, completed: ['identity', 'backup-workshop', 'sem-aula']}));
    assert.deepEqual(restored.completed, ['identity', 'backup-workshop']);
    assert.ok(tracks.find(track => track.id === id).lessons.some(item => item.id === 'backup-workshop'));
  }
});
