import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync, mkdirSync, readFileSync, writeFileSync, cpSync, symlinkSync, existsSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';

const root = fileURLToPath(new URL('../', import.meta.url));
const run = (cwd, mode) => execFileSync('python3', ['scripts/package-examples.py', mode], {cwd, encoding:'utf8', stdio:'pipe'});
function fixture(callback) {
  const temporary = mkdtempSync(path.join(tmpdir(), 'source-packs-test-'));
  const repo = path.join(temporary, 'repo');
  mkdirSync(path.join(repo, 'scripts'), {recursive:true});
  mkdirSync(path.join(repo, 'docs/aulas'), {recursive:true});
  cpSync(path.join(root, 'scripts/package-examples.py'), path.join(repo, 'scripts/package-examples.py'));
  writeFileSync(path.join(repo, 'LICENSE'), 'Licença fictícia de teste\n');
  writeFileSync(path.join(repo, 'scripts/source-packs.json'), JSON.stringify([{id:'bash', title:'Fixture', doc:'fixture', root:'fixture', files:['demo.sh'], description:'Somente teste', commands:['bash demo.sh'], limits:'Sem execução nesta geração.'}]));
  writeFileSync(path.join(repo, 'docs/aulas/fixture.md'), '<!-- example-file: bash/demo.sh -->\n```bash\nprintf "teste\\n"\n```\n');
  try {callback(repo, temporary);} finally {rmSync(temporary, {recursive:true, force:true});}
}
test('pacotes publicados têm paridade exata com fontes documentados', () => {
  assert.match(run(root, '--check'), /6 source packs/);
});
test('geração repetida é idêntica e divergência é detectada sem escrever', () => {
  fixture(repo => {
    run(repo, '--write');
    const filename = path.join(repo, 'static/downloads/projeto-bash.zip');
    const first = readFileSync(filename);
    run(repo, '--write');
    assert.deepEqual(readFileSync(filename), first);
    const source = path.join(repo, 'examples/bash/demo.sh');
    writeFileSync(source, 'Modificação própria\n');
    assert.throws(() => run(repo, '--check'), /differ from documentation/);
    assert.equal(readFileSync(source, 'utf8'), 'Modificação própria\n');
  });
});
test('pai simbólico é recusado antes de qualquer escrita', () => {
  fixture((repo, temporary) => {
    const external = path.join(temporary, 'external');
    mkdirSync(external); mkdirSync(path.join(repo, 'examples'));
    symlinkSync(external, path.join(repo, 'examples/bash'), 'dir');
    assert.throws(() => run(repo, '--write'), /Refusing symlink/);
    assert.equal(existsSync(path.join(external, 'demo.sh')), false);
    assert.equal(existsSync(path.join(repo, 'static/downloads')), false);
  });
});
test('fontes fora da lista ou com travessia são recusados', () => {
  fixture(repo => {
    writeFileSync(path.join(repo, 'docs/aulas/fixture.md'), '<!-- example-file: bash/../escape.sh -->\n```bash\nprintf "teste\\n"\n```\n');
    assert.throws(() => run(repo, '--write'), /Unsafe generated path/);
    assert.equal(existsSync(path.join(repo, 'examples')), false);
  });
});
