import {test, expect} from '@playwright/test';
import {createHash} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import packs from '../../static/downloads/catalog.json' with {type:'json'};
const route = pathname => (process.env.DOCUSAURUS_BASE_URL || '/') + pathname.replace(/^\//, '');
const panelName = 'Localizar a primeira lacuna da cadeia';

test('diagnóstico mantém desconhecido, foca resultado e invalida após edição', async ({page}) => {
  await page.goto(route('/docs/diagnostico/assistente-camadas/'));
  const panel = page.getByRole('region', {name:panelName});
  await panel.getByRole('button', {name:'Encontrar minha próxima verificação'}).click();
  const result = panel.getByRole('region', {name:'Próxima verificação sugerida'});
  await expect(result).toBeFocused();
  await expect(result).toContainText('Confirme: Controle e estado do sistema');
  await expect(result).toContainText('Uma lacuna não é um defeito comprovado');
  await panel.locator('select').nth(1).selectOption('yes');
  await expect(result).toHaveCount(0);
  await panel.getByRole('button', {name:'Encontrar minha próxima verificação'}).click();
  await expect(result).toContainText('Confirme: Montagem e papéis USB');
  await panel.getByRole('button', {name:'Limpar observações'}).click();
  await expect(panel.locator('select').nth(1)).toHaveValue('unknown');
});
test('eventos de teclado encaminham à sessão e exportam só marcações', async ({page}) => {
  await page.goto(route('/docs/diagnostico/assistente-camadas/'));
  const panel = page.getByRole('region', {name:panelName});
  for (let index=1; index<=5; index++) await panel.locator('select').nth(index).selectOption('yes');
  await panel.locator('select').nth(6).selectOption('no');
  await panel.getByRole('button', {name:'Encontrar minha próxima verificação'}).click();
  const result = panel.getByRole('region', {name:'Próxima verificação sugerida'});
  await expect(result).toContainText('Investigue: Sessão e aplicação');
  await expect(result.getByRole('link', {name:'Abrir o guia da próxima etapa'})).toHaveAttribute('href', route('/docs/desktop/acesso-remoto/'));
  const downloading = page.waitForEvent('download');
  await result.getByRole('link', {name:'Baixar estas marcações em Markdown'}).click();
  const download = await downloading;
  expect(download.suggestedFilename()).toBe('diagnostico-manual.md');
  expect(await readFile(await download.path(), 'utf8')).toContain('sem detecção automática');
  await page.reload();
  await expect(panel.locator('select').nth(1)).toHaveValue('unknown');
});
test('troca de investigação limpa estado e preserva incertezas posteriores', async ({page}) => {
  await page.goto(route('/docs/diagnostico/assistente-camadas/'));
  const panel = page.getByRole('region', {name:panelName});
  await panel.getByLabel('Qual sintoma investigar?').selectOption('video');
  await panel.locator('select').nth(1).selectOption('yes');
  await panel.locator('select').nth(3).selectOption('yes');
  await panel.getByRole('button', {name:'Encontrar minha próxima verificação'}).click();
  await expect(panel).toContainText('Confirme: Cadeia física compatível');
  await expect(panel).toContainText('elas não preenchem automaticamente a primeira lacuna');
  await panel.getByLabel('Qual sintoma investigar?').selectOption('ssh');
  await expect(panel.getByRole('region', {name:'Próxima verificação sugerida'})).toHaveCount(0);
  await expect(panel.locator('select').nth(1)).toHaveValue('unknown');
});
test('seis downloads no navegador correspondem aos hashes do catálogo', async ({page}) => {
  await page.goto(route('/docs/aulas/baixar-exemplos/'));
  const region = page.getByRole('region', {name:'Projetos originais para download'});
  for (const pack of packs) {
    const link = region.getByRole('link', {name:`Baixar fontes: ${pack.title}`, exact:true});
    await expect(link).toHaveAttribute('href', route(`/downloads/${pack.filename}`));
    const downloading = page.waitForEvent('download'); await link.click();
    const download = await downloading;
    expect(download.suggestedFilename()).toBe(pack.filename);
    const body = await readFile(await download.path());
    expect(body.length).toBe(pack.bytes);
    expect(createHash('sha256').update(body).digest('hex')).toBe(pack.sha256);
  }
});
test('novos recursos e trilha de administração funcionam no celular e teclado', async ({page}) => {
  await page.setViewportSize({width:390, height:844});
  for (const path of ['/docs/diagnostico/assistente-camadas/', '/docs/aulas/baixar-exemplos/', '/docs/aulas/sqlite-primeiro-banco/']) {
    await page.goto(route(path));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
  await page.goto(route('/docs/diagnostico/assistente-camadas/'));
  const panel = page.getByRole('region', {name:panelName});
  await panel.getByLabel('Qual sintoma investigar?').focus();
  await page.keyboard.press('ArrowDown'); await page.keyboard.press('Enter');
  await expect(panel.getByLabel('Qual sintoma investigar?')).toHaveValue('video');
  await panel.getByRole('button', {name:'Encontrar minha próxima verificação'}).focus();
  await page.keyboard.press('Enter');
  await expect(panel.getByRole('region', {name:'Próxima verificação sugerida'})).toBeFocused();
  await page.goto(route('/docs/comece-aqui/minha-trilha/'));
  const track = page.getByRole('region', {name:'Meu roteiro de aprendizado'});
  await track.getByRole('radio', {name:/Cuidar e investigar meu sistema/}).check();
  await expect(track).toContainText('0 de 13 aulas marcadas');
  await track.getByLabel('Estudei e conferi esta aula: Organizar uma falha por camadas', {exact:true}).check();
  await expect(track).toContainText('1 de 13 aulas marcadas');
});
