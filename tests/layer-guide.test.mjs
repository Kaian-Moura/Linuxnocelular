import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {analyzeLayers, investigations, layerMarkdown, layerStates} from '../src/lib/layer-guide.mjs';

test('lacunas desconhecidas não viram falha nem certeza de suporte', () => {
  for (const guide of investigations) {
    const result = analyzeLayers(guide.id);
    assert.equal(result.kind, 'gap');
    assert.equal(result.step.id, guide.steps[0].id);
    assert.equal(result.confirmed.length, 0);
    assert.match(result.explanation, /não é um defeito comprovado/);
  }
});
test('primeira falha exige prefixo observado e não se torna causa raiz', () => {
  const guide = investigations[0];
  const answers = {control:'yes', assembly:'yes', enumeration:'yes', hid:'yes', events:'yes', session:'no'};
  const result = analyzeLayers(guide.id, answers);
  assert.equal(result.kind, 'boundary');
  assert.equal(result.step.id, 'session');
  assert.equal(result.confirmed.length, 5);
  answers.enumeration = 'unknown';
  assert.equal(analyzeLayers(guide.id, answers).kind, 'gap');
  assert.equal(analyzeLayers(guide.id, answers).step.id, 'enumeration');
});
test('observações posteriores são preservadas e não preenchem etapa desconhecida', () => {
  const result = analyzeLayers('video', {control:'yes', assembly:'unknown', connector:'yes', pixels:'no'});
  assert.equal(result.step.id, 'assembly');
  assert.deepEqual(result.later.map(item => item.id), ['connector', 'pixels']);
});
test('todos os sims continuam sendo um relato de uma única tentativa', () => {
  for (const guide of investigations) {
    const result = analyzeLayers(guide.id, Object.fromEntries(guide.steps.map(item => [item.id, 'yes'])));
    assert.equal(result.kind, 'observed');
    assert.match(result.explanation, /não certifica/);
  }
});
test('tipos e estados inválidos são desconhecidos também na exportação', () => {
  for (const value of [null, 1, ['yes'], {}, 'constructor', '__proto__', '<script>', true]) {
    const answers = {control: value};
    assert.equal(analyzeLayers('usb-keyboard', answers).kind, 'gap');
    assert.ok(layerMarkdown('usb-keyboard', answers).includes(`Controle e estado do sistema: ${layerStates.unknown}`));
  }
  assert.equal(analyzeLayers('desconhecido').kind, 'invalid');
  assert.equal(analyzeLayers('ssh', null).kind, 'gap');
});
test('IDs, caminhos e textos das etapas possuem destinos documentados', () => {
  assert.equal(new Set(investigations.map(item => item.id)).size, investigations.length);
  for (const guide of investigations) {
    assert.equal(new Set(guide.steps.map(item => item.id)).size, guide.steps.length);
    for (const item of guide.steps) {
      assert.ok(item.question && item.hint && item.failed);
      const stem = item.href.slice(1, -1);
      assert.ok([`${stem}.md`, `${stem}.mdx`].some(name => existsSync(new URL(`../${name}`, import.meta.url))), item.href);
    }
  }
});
