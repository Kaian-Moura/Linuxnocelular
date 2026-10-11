import {test, expect} from '@playwright/test';
import {createBench} from '../../src/lib/bench.mjs';
const route = pathname => (process.env.DOCUSAURUS_BASE_URL || '/') + pathname.replace(/^\//, '');
const jsonFile = value => ({name: 'ficha.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(value))});

test('biblioteca combina filtros, pesquisa sem acento e explica ausência de resultado', async ({page}) => {
  await page.goto(route('/docs/aulas/biblioteca/'));
  const panel = page.getByRole('region', {name: 'Biblioteca de aulas práticas'});
  await expect(panel.getByRole('status')).toContainText('13 aula(s)');
  await panel.getByLabel('O que você quer construir?').fill('compilacao');
  await expect(panel.getByRole('status')).toContainText('2 aula(s)');
  await panel.getByRole('combobox', {name: 'Objetivo', exact: true}).selectOption('programming');
  await expect(panel.getByRole('status')).toContainText('1 aula(s)');
  await panel.getByLabel('Onde pretende executar?').selectOption('termux');
  await panel.getByRole('combobox', {name: 'Objetivo', exact: true}).selectOption('electronics');
  await expect(panel).toContainText('Isso não prova incompatibilidade');
  await panel.getByRole('button', {name: 'Mostrar todas as aulas'}).click();
  await expect(panel.getByRole('status')).toContainText('13 aula(s)');
  await panel.getByRole('combobox', {name: 'Objetivo', exact: true}).selectOption('electronics');
  await expect(panel.getByRole('status')).toContainText('2 aula(s)');
  await panel.getByRole('link', {name: 'Abrir aula: Arduino Uno: primeiro projeto', exact: true}).click();
  await expect(page).toHaveURL(/\/docs\/aulas\/arduino-uno-primeiro-projeto\//);
  await expect(page.locator('article')).toContainText('Uno R3');
});

test('novas trilhas compartilham marcações sem alterar os roteiros antigos', async ({page}) => {
  await page.goto(route('/docs/comece-aqui/minha-trilha/'));
  const panel = page.getByRole('region', {name: 'Meu roteiro de aprendizado'});
  await expect(panel.getByRole('radio')).toHaveCount(6);
  await panel.getByLabel('Estudei e conferi esta aula: Conhecer meu aparelho', {exact: true}).check();
  await panel.getByRole('radio', {name: /Construir projetos de programação/}).check();
  await expect(panel).toContainText('1 de 9 aulas marcadas');
  await panel.getByLabel('Estudei e conferi esta aula: Restaurar uma cópia de exercício', {exact: true}).check();
  await panel.getByRole('radio', {name: /Servir e administrar na rede local/}).check();
  await expect(panel).toContainText('2 de 7 aulas marcadas');
  await expect(panel.getByLabel('Estudei e conferi esta aula: Verificar uma restauração de arquivos', {exact: true})).toBeChecked();
  await panel.getByRole('radio', {name: /Começar com Arduino Uno e ESP32/}).check();
  await expect(panel).toContainText('2 de 7 aulas marcadas');
  await expect(panel).toContainText('ABI do host');
});

test('ficha preserva entrada manual, exige revisão e baixa arquivos sem persistir', async ({page}) => {
  await page.goto(route('/docs/diagnostico/ficha-evidencias/'));
  const panel = page.getByRole('region', {name: 'Ficha de bancada do meu projeto'});
  const review = panel.getByLabel('Revisei o conteúdo e removi dados pessoais que não quero exportar.');
  await panel.getByLabel('Modelo e variante', {exact: true}).fill('Modelo fictício');
  await panel.getByLabel('Sistema, release e método').fill('Sistema de exercício');
  await panel.getByLabel('Meio de controle e recuperação').fill('Canal previamente confirmado');
  await panel.getByRole('combobox', {name: 'Resultado: Retirar e recolocar hub', exact: true}).selectOption('failed');
  await expect(panel.getByRole('link', {name: 'Investigar: Retirar e recolocar hub →'})).toHaveAttribute('href', route('/docs/hardware/video-hotplug/'));
  await expect(panel).toContainText('Retirar e recolocar hub: resultado marcado, mas a observação não foi descrita.');
  await panel.getByLabel('Observação: Retirar e recolocar hub', {exact: true}).fill('Cenário fictício: monitor preto; aplicação permaneceu.');
  await expect(panel.getByRole('link', {name: 'Baixar ficha JSON'})).toHaveCount(0);
  await review.check();
  const jsonLink = panel.getByRole('link', {name: 'Baixar ficha JSON'});
  const raw = decodeURIComponent((await jsonLink.getAttribute('href')).split(',')[1]);
  expect(JSON.parse(raw).checks['hub-hotplug'].status).toBe('failed');
  const downloading = page.waitForEvent('download');
  await jsonLink.click();
  expect((await downloading).suggestedFilename()).toBe('ficha-celular-linux.json');
  const mdLink = panel.getByRole('link', {name: 'Baixar ficha Markdown'});
  expect(decodeURIComponent((await mdLink.getAttribute('href')).split(',')[1])).toContain('Não certifica suporte');
  await panel.getByLabel('Hub e portas utilizadas').fill('Hub fictício');
  await expect(review).not.toBeChecked();
  await expect(jsonLink).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(localStorage).filter(key => /bench|ficha/.test(key)))).toEqual([]);
  await page.reload();
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue('');
});

test('ficha importa formato estrito, recusa arquivo inválido e exibe texto sem HTML', async ({page}) => {
  await page.goto(route('/docs/diagnostico/ficha-evidencias/'));
  const panel = page.getByRole('region', {name: 'Ficha de bancada do meu projeto'});
  const file = panel.getByLabel('Retomar de uma ficha JSON');
  const data = createBench();
  data.fields.model = '<img src=x onerror=alert(1)> *Modelo*';
  data.fields.system = 'Exercício';
  data.checks.video = {status: 'passed', evidence: 'Relato fictício.'};
  await file.setInputFiles(jsonFile(data));
  await expect(panel.getByRole('status')).toContainText('Ficha importada');
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue(data.fields.model);
  await expect(panel.locator('img')).toHaveCount(0);
  await panel.getByLabel('Revisei o conteúdo e removi dados pessoais que não quero exportar.').check();
  const md = decodeURIComponent((await panel.getByRole('link', {name: 'Baixar ficha Markdown'}).getAttribute('href')).split(',')[1]);
  expect(md).toContain('\\<img');
  await file.setInputFiles({name: 'invalido.json', mimeType: 'application/json', buffer: Buffer.from('{')});
  await expect(panel.getByRole('status')).toContainText('JSON inválido');
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue(data.fields.model);
  await expect(panel.getByRole('link', {name: 'Baixar ficha JSON'})).toHaveCount(0);
  await file.setInputFiles({name: 'grande.json', mimeType: 'application/json', buffer: Buffer.alloc(50001, 32)});
  await expect(panel.getByRole('status')).toContainText('Arquivo acima de 50 KB');
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue(data.fields.model);
  await panel.getByRole('button', {name: 'Limpar campos desta página'}).click();
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue('');
});

test('importação atrasada não substitui uma edição mais recente da ficha', async ({page}) => {
  await page.addInitScript(() => {
    const original = File.prototype.text;
    File.prototype.text = function() {
      window.benchImportStarted = true;
      return new Promise(resolve => {window.finishBenchImport = async () => resolve(await original.call(this));});
    };
  });
  await page.goto(route('/docs/diagnostico/ficha-evidencias/'));
  const panel = page.getByRole('region', {name: 'Ficha de bancada do meu projeto'});
  const data = createBench(); data.fields.model = 'Arquivo antigo';
  await panel.getByLabel('Retomar de uma ficha JSON').setInputFiles(jsonFile(data));
  await page.waitForFunction(() => window.benchImportStarted);
  await panel.getByLabel('Modelo e variante', {exact: true}).fill('Edição mais recente');
  await expect(panel.getByLabel('Retomar de uma ficha JSON')).toHaveValue('');
  await page.evaluate(async () => {await window.finishBenchImport();});
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue('Edição mais recente');
});

test('conclusão de importação lenta exige nova revisão dos dados recebidos', async ({page}) => {
  await page.addInitScript(() => {
    const original = File.prototype.text;
    File.prototype.text = function() {
      window.benchImportStarted = true;
      return new Promise(resolve => {window.finishBenchImport = async () => resolve(await original.call(this));});
    };
  });
  await page.goto(route('/docs/diagnostico/ficha-evidencias/'));
  const panel = page.getByRole('region', {name: 'Ficha de bancada do meu projeto'});
  const review = panel.getByLabel('Revisei o conteúdo e removi dados pessoais que não quero exportar.');
  const data = createBench(); data.fields.model = 'Dados ainda não revisados';
  await panel.getByLabel('Retomar de uma ficha JSON').setInputFiles(jsonFile(data));
  await page.waitForFunction(() => window.benchImportStarted);
  await review.check();
  await page.evaluate(async () => {await window.finishBenchImport();});
  await expect(panel.getByLabel('Modelo e variante', {exact: true})).toHaveValue(data.fields.model);
  await expect(review).not.toBeChecked();
  await expect(panel.getByRole('link', {name: 'Baixar ficha JSON'})).toHaveCount(0);
});

test('biblioteca, ficha e aulas extensas permanecem utilizáveis no celular', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  for (const path of ['/docs/aulas/biblioteca/', '/docs/diagnostico/ficha-evidencias/', '/docs/aulas/python-projeto-completo/', '/docs/hardware/montagem-validada/']) {
    await page.goto(route(path));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    await expect(page.getByRole('heading', {level: 1})).toBeVisible();
  }
  await page.goto(route('/docs/aulas/biblioteca/'));
  const panel = page.getByRole('region', {name: 'Biblioteca de aulas práticas'});
  await panel.getByLabel('O que você quer construir?').fill('Python');
  await panel.getByRole('button', {name: 'Limpar filtros'}).click();
  await expect(panel.getByRole('status')).toContainText('13 aula(s)');
});
