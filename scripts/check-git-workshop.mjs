// Ensaio restrito a arquivos próprios temporários. Não acessa telefone ou repositório do usuário.
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {execFileSync} from 'node:child_process';

const lab = mkdtempSync(join(tmpdir(), 'celular-linux-git-aula-'));
const work = join(lab, 'caderno-git');
mkdirSync(work);
const git = (...args) => execFileSync('git', args, {cwd: work, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
const checks = [];
try {
  const version = git('--version');
  git('init', '-b', 'main');
  git('config', '--local', 'user.name', 'Aluno de laboratorio');
  git('config', '--local', 'user.email', 'aluno@example.invalid');
  // A configuração isolada só evita que assinatura global do host interfira neste fixture.
  git('config', '--local', 'commit.gpgsign', 'false');
  const first = '# Meu laboratorio\n\nObjetivo: aprender a conservar versões.\nTeste atual: ainda não executei testes de hardware.\n';
  writeFileSync(join(work, 'anotacoes.md'), first);
  writeFileSync(join(work, '.gitignore'), 'privado.txt\n*.temporario\n');
  writeFileSync(join(work, 'privado.txt'), 'Este texto de exercicio nao deve entrar no historico\n');
  assert.equal(git('check-ignore', 'privado.txt'), 'privado.txt');
  git('add', 'anotacoes.md', '.gitignore');
  git('commit', '-m', 'Registra objetivo inicial do laboratorio');
  assert.equal(git('status', '--short'), '');
  checks.push('Primeiro commit e arquivo ignorado');
  const second = first + 'Aprendi: editar um arquivo nao cria um commit sozinho.\n';
  writeFileSync(join(work, 'anotacoes.md'), second);
  assert.match(git('diff'), /editar um arquivo/);
  git('add', 'anotacoes.md');
  const current = second + 'Aprendi: posso editar novamente depois de preparar.\n';
  writeFileSync(join(work, 'anotacoes.md'), current);
  assert.match(git('diff'), /depois de preparar/);
  assert.doesNotMatch(git('diff', '--cached'), /depois de preparar/);
  git('restore', '--staged', 'anotacoes.md');
  assert.equal(readFileSync(join(work, 'anotacoes.md'), 'utf8'), current);
  git('add', 'anotacoes.md');
  git('commit', '-m', 'Explica trabalho preparado e commit');
  assert.equal(git('rev-list', '--count', 'HEAD'), '2');
  checks.push('Trabalho/preparação separados e restore --staged preserva edição');
  mkdirSync(join(lab, 'caderno-recuperado'));
  writeFileSync(join(lab, 'caderno-recuperado', 'anotacoes-v1.md'), git('show', 'HEAD~1:anotacoes.md') + '\n');
  assert.equal(readFileSync(join(lab, 'caderno-recuperado', 'anotacoes-v1.md'), 'utf8'), first);
  assert.equal(readFileSync(join(work, 'anotacoes.md'), 'utf8'), current);
  checks.push('Recuperação em pasta nova sem alterar original');
  git('switch', '-c', 'experiencia');
  writeFileSync(join(work, 'anotacoes.md'), current + 'Experiencia: esta linha pertence a outra branch.\n');
  git('add', 'anotacoes.md'); git('commit', '-m', 'Experimenta uma anotacao separada');
  git('switch', 'main');
  assert.equal(readFileSync(join(work, 'anotacoes.md'), 'utf8'), current);
  const bundle = join(lab, 'caderno-exportacao', 'caderno.bundle');
  mkdirSync(join(lab, 'caderno-exportacao'));
  git('bundle', 'create', bundle, '--all'); git('bundle', 'verify', bundle);
  const clone = join(lab, 'caderno-restaurado');
  git('clone', bundle, clone);
  assert.equal(readFileSync(join(clone, 'anotacoes.md'), 'utf8'), current);
  assert.ok(!existsSync(join(clone, 'privado.txt')));
  assert.equal(git('-C', clone, 'rev-list', '--all', '--count'), '3');
  checks.push('Branch, bundle verificado e clone com três commits; ignorado ausente');
  console.log(JSON.stringify({verified: '2026-10-11', host: 'notebook; pasta temporária própria', tool: version, checks, hardwareTested: false, network: false}, null, 2));
} finally {
  rmSync(lab, {recursive: true, force: true});
}
