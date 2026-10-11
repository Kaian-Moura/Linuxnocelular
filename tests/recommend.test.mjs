import test from 'node:test';
import assert from 'node:assert/strict';
import {recommend, paths} from '../src/lib/recommend.mjs';
const complete = {model:'Modelo e variante confirmados',arch:'arm64',intent:'replace',support:'documented',unlock:'yes',kernel:'documented',requiredHardware:'yes',backup:'yes',recovery:'yes',androidAccess:'yes',screen:'working',touch:'yes',adb:'authorized',video:'documented'};

test('respostas vazias não certificam port ou sugerem instalação nativa',()=>{
  const r=recommend();assert.equal(r.primary.key,'recovery');assert.equal(r.readyForNativeEvaluation,false);
});
test('apenas o nome OnePlus e ARM64 não provam suporte',()=>{
  const r=recommend({model:'OnePlus 9 Pro',arch:'arm64',intent:'replace',root:'yes',androidAccess:'yes'});
  assert.equal(r.primary.key,'inventory');assert.ok(r.warnings.some(w=>w.includes('port documentado')));
});
for(const requirement of ['model','arch','support','unlock','kernel','requiredHardware','backup','recovery']) {
  test(`instalação nativa exige ${requirement}, mesmo com os demais campos confirmados`,()=>{
    const a={...complete,[requirement]:requirement==='model'?'':'unknown'};
    const r=recommend(a);assert.equal(r.primary.key,'inventory');assert.equal(r.readyForNativeEvaluation,false);
  });
}
test('todas as evidências permitem avaliar, mas não prometem flash ou hardware',()=>{
  const r=recommend(complete);assert.equal(r.primary.key,'native');assert.ok(r.warnings.some(w=>w.includes('não certifica suporte')));
});
test('preservar Android nunca recomenda substituir o sistema',()=>{
  for(const goal of ['desktop','terminal','server','containers','ai']) {
    const r=recommend({...complete,intent:'keep',goal});assert.notEqual(r.primary.key,'native');assert.ok(!r.alternatives.some(a=>a.key==='native'));
  }
});
test('root não permite ignorar bootloader bloqueado',()=>{
  assert.equal(recommend({...complete,unlock:'no',root:'yes'}).primary.key,'inventory');
});
test('tela quebrada sem Android ou autorização dirige a recuperação',()=>{
  assert.equal(recommend({...complete,screen:'broken',androidAccess:'no',adb:'no'}).primary.key,'recovery');
});
test('uso terminal sobre Android escolhe Termux, desktop escolhe PRoot',()=>{
  assert.equal(recommend({androidAccess:'yes',intent:'keep',goal:'terminal'}).primary.key,'termux');
  assert.equal(recommend({androidAccess:'yes',intent:'keep',goal:'desktop'}).primary.key,'proot');
});
test('containers, vídeo e IA exigem avisos próprios, nunca capacidades implícitas',()=>{
  assert.ok(recommend({androidAccess:'yes',goal:'containers'}).warnings.some(w=>w.includes('namespaces')));
  assert.ok(recommend({androidAccess:'yes',goal:'ai'}).warnings.some(w=>w.includes('backends') || w.includes('backend')));
  assert.ok(recommend({video:'unknown'}).warnings.some(w=>w.includes('DisplayPort')));
});
test('chroot é alternativa avançada apenas quando root já foi validado',()=>{
  assert.ok(recommend({androidAccess:'yes',root:'yes'}).alternatives.some(a=>a.key==='chroot'));
  assert.ok(!recommend({androidAccess:'yes',root:'unknown'}).alternatives.some(a=>a.key==='chroot'));
});
test('arquitetura ARM32 não é declarada impossível por padrão',()=>{
  assert.equal(recommend({...complete,arch:'arm32'}).primary.key,'native');
});
test('todos os destinos são rotas internas explícitas',()=>{
  for(const p of Object.values(paths)) assert.match(p.href,/^\/docs\/[a-z0-9/-]+\/$/);
});
test('boot e SSH validados oferecem controle mesmo com tela quebrada',()=>{
  for(const alternateAccess of ['boot','ssh']) assert.equal(recommend({...complete,screen:'broken',androidAccess:'no',adb:'no',alternateAccess}).primary.key,'native');
});
test('todos os requisitos nativos sem canal de controle ainda exigem recuperação',()=>{
  const r=recommend({...complete,androidAccess:'no',adb:'no',alternateAccess:'unknown'});
  assert.equal(r.primary.key,'recovery');assert.equal(r.readyForNativeEvaluation,false);
});
test('containers não são apresentados como benefício implícito de PRoot',()=>{
  assert.equal(recommend({androidAccess:'yes',goal:'containers',root:'no'}).primary.key,'containers');
});
test('Linux já instalado e acessível por SSH segue configuração, não nova instalação',()=>{
  assert.equal(recommend({alternateAccess:'ssh',androidAccess:'no',intent:'explore'}).primary.key,'existing');
});
