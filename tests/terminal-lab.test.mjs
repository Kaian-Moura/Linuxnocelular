import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLab, runLab, missions} from '../src/lib/terminal-lab.mjs';

test('prática conclui seis exercícios com navegação e aspas', () => {
  let state = createLab();
  for (const [index, command] of ['pwd', 'ls', 'cd projetos', 'cat boas-vindas.txt', 'cd ..', "cat 'nome com espaço.txt'"].entries()) {
    state = runLab(state, command);
    assert.equal(state.error, false);
    assert.equal(state.mission, index + 1);
  }
  assert.equal(state.cwd, '/home/aluno');
  assert.equal(state.mission, missions.length);
  assert.match(state.history.at(-1).output, /Aspas/);
  assert.equal(runLab(state, 'pwd').mission, missions.length);
});

test('erro de pasta, argumento ou aspas não completa a missão nem modifica o estado anterior', () => {
  const before = createLab();
  assert.equal(runLab(before, 'pwd extra').mission, 0);
  assert.deepEqual(before, createLab());
  let state = runLab(runLab(before, 'pwd'), 'ls');
  state = runLab(state, 'cd Projetos');
  assert.equal(state.error, true);
  assert.equal(state.mission, 2);
  assert.equal(state.cwd, '/home/aluno');
  state = runLab(state, 'cd projetos');
  assert.equal(runLab(state, 'cat "boas-vindas.txt').mission, 3);
  assert.equal(runLab(state, 'cat boas-vindas.txt').mission, 4);
});

test('comandos do host, metacaracteres, excesso e caminhos externos ficam restritos ao cenário', () => {
  for (const input of ['sudo reboot', 'adb devices', 'ssh usuario@host', 'rm arquivo', 'cat /etc/passwd', 'cd /', 'cat __proto__', 'pwd; whoami', '$(id)', '`id`', 'cat a > b', 'pwd\nls', 'pwd|ls', 'pwd\\', 'x'.repeat(161)]) {
    const next = runLab(createLab(), input);
    assert.equal(next.error, true, input);
    assert.equal(next.cwd, '/home/aluno', input);
    assert.equal(next.mission, 0, input);
  }
});

test('normalização só permite o sistema fictício e arquivos são somente leitura', () => {
  const next = runLab(createLab(), 'cat ~/projetos/../projetos/boas-vindas.txt');
  assert.equal(next.error, false);
  assert.match(next.history[0].output, /Meu projeto/);
  assert.equal(runLab(createLab(), 'cat "nome com espaço.txt"').error, false);
  assert.equal(runLab(createLab(), 'cat nome com espaço.txt').error, true);
  assert.equal(runLab(createLab(), 'cd ../../etc').error, true);
});

test('histórico tem limite e IDs estáveis, clear preserva o aprendizado, reset recomeça', () => {
  let state = runLab(createLab(), 'pwd');
  for (let i = 0; i < 30; i++) state = runLab(state, 'help');
  assert.equal(state.history.length, 24);
  assert.equal(new Set(state.history.map(item => item.id)).size, 24);
  const cleared = runLab(state, 'clear');
  assert.equal(cleared.history.length, 0);
  assert.equal(cleared.mission, 1);
  assert.equal(runLab(cleared, 'help').history[0].id, state.sequence + 1);
  assert.equal(runLab(state, '   '), state);
  assert.equal(createLab().mission, 0);
});
