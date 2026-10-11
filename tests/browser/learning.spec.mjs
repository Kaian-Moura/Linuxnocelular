import {test, expect} from '@playwright/test';
const route = pathname => (process.env.DOCUSAURUS_BASE_URL || '/') + pathname.replace(/^\//, '');
const progressKey = 'celular-linux:learning:v1';

test('trilha não persiste sem opção e preserva aulas compartilhadas quando escolhida', async ({page}) => {
  await page.goto(route('/docs/comece-aqui/minha-trilha/'));
  const panel = page.getByRole('region', {name: 'Meu roteiro de aprendizado'});
  const mark = panel.getByLabel('Estudei e conferi esta aula: Conhecer meu aparelho', {exact: true});
  await mark.check();
  await expect(panel.getByText('1 de 6 aulas marcadas', {exact: true})).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBeNull();
  await page.reload();
  await expect(mark).not.toBeChecked();
  await mark.check();
  await panel.getByLabel('Salvar progresso neste navegador', {exact: true}).check();
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key) || '{}').completed?.includes('identity'), progressKey);
  await panel.getByRole('radio', {name: /Ter um desktop mantendo Android/}).check();
  await expect(panel.getByText('1 de 7 aulas marcadas', {exact: true})).toBeVisible();
  await page.waitForFunction(key => JSON.parse(localStorage.getItem(key) || '{}').track === 'desktop', progressKey);
  await page.reload();
  await expect(mark).toBeChecked();
  await expect(panel.getByRole('radio', {name: /Ter um desktop mantendo Android/})).toBeChecked();
  await page.evaluate(() => localStorage.setItem('outra-chave', 'conservar'));
  await panel.getByLabel('Salvar progresso neste navegador', {exact: true}).uncheck();
  await page.waitForFunction(key => localStorage.getItem(key) === null, progressKey);
  expect(await page.evaluate(() => localStorage.getItem('outra-chave'))).toBe('conservar');
  await expect(mark).toBeChecked();
});

test('roteiro exporta estado real, reset é local e trilha nativa não certifica suporte', async ({page}) => {
  await page.goto(route('/docs/comece-aqui/minha-trilha/'));
  const panel = page.getByRole('region', {name: 'Meu roteiro de aprendizado'});
  await panel.getByRole('radio', {name: /Investigar Linux no lugar do Android/}).check();
  await expect(panel).toContainText('não libera comandos de gravação');
  await panel.getByLabel('Estudei e conferi esta aula: Conhecer meu aparelho', {exact: true}).check();
  const link = panel.getByRole('link', {name: 'Baixar meu roteiro'});
  const href = await link.getAttribute('href');
  const text = decodeURIComponent(href.split(',')[1]);
  expect(text).toContain('[x] Conhecer meu aparelho');
  expect(text).toContain('Não comprovam compatibilidade');
  const downloading = page.waitForEvent('download');
  await link.click();
  expect((await downloading).suggestedFilename()).toBe('meu-roteiro-celular-linux.md');
  await panel.getByRole('button', {name: 'Apagar minhas marcações'}).click();
  await expect(panel.getByText('0 de 10 aulas marcadas', {exact: true})).toBeVisible();
});

test('armazenamento inválido ou bloqueado não impede estudar', async ({page}) => {
  await page.addInitScript(key => localStorage.setItem(key, '{invalido'), progressKey);
  await page.goto(route('/docs/comece-aqui/minha-trilha/'));
  const panel = page.getByRole('region', {name: 'Meu roteiro de aprendizado'});
  await expect(panel).toContainText('registro antigo não foi reconhecido');
  expect(await page.evaluate(key => localStorage.getItem(key), progressKey)).toBe('{invalido');
  await panel.getByLabel('Estudei e conferi esta aula: Conhecer meu aparelho', {exact: true}).check();
  await expect(panel.getByText('1 de 6 aulas marcadas', {exact: true})).toBeVisible();
  await page.addInitScript(() => {
    Storage.prototype.getItem = () => {throw new Error('blocked');};
    Storage.prototype.setItem = () => {throw new Error('blocked');};
    Storage.prototype.removeItem = () => {throw new Error('blocked');};
  });
  await page.reload();
  await panel.getByLabel('Estudei e conferi esta aula: Conhecer meu aparelho', {exact: true}).check();
  await expect(panel.getByText('1 de 6 aulas marcadas', {exact: true})).toBeVisible();
  await expect(panel).toContainText(/Não foi possível gravar|não permite acessar/);
});

test('terminal funciona por teclado, relata erros e conclui sem transbordar no celular', async ({page}) => {
  await page.setViewportSize({width: 390, height: 844});
  await page.goto(route('/docs/comece-aqui/laboratorio/'));
  const panel = page.getByRole('region', {name: 'Laboratório de terminal simulado'});
  const input = panel.getByLabel('Comando de prática', {exact: true});
  await input.fill('cd projetos'); await input.press('Enter');
  await expect(panel).toContainText('Você navegou para outra pasta.');
  await input.fill('cd /home/aluno'); await input.press('Enter');
  const commands = ['cat /etc/passwd', 'pwd', 'ls', 'cd Projetos', 'cd projetos', 'cat "boas-vindas.txt', 'cat boas-vindas.txt', 'cd ..', 'cat "nome com espaço.txt"'];
  for (const command of commands) {await input.fill(command); await input.press('Enter');}
  await expect(panel).toContainText('Os seis exercícios foram concluídos.');
  await expect(panel.getByRole('log')).toContainText('Faltou fechar uma aspa');
  await expect(panel.getByRole('log')).toContainText('não encontrado neste cenário');
  await expect(input).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const log = panel.getByRole('log');
  expect(await log.evaluate(element => element.scrollHeight - element.clientHeight - element.scrollTop < 2)).toBe(true);
  await log.evaluate(element => {element.scrollTop = 0;});
  await input.fill('help'); await input.press('Enter');
  expect(await log.evaluate(element => element.scrollTop)).toBe(0);
  await panel.getByRole('button', {name: 'Recomeçar os exercícios'}).click();
  await expect(panel).toContainText('0/6 exercícios');
});

test('compreensão explica respostas erradas, mantém primeira tentativa e permite repetir', async ({page}) => {
  await page.goto(route('/docs/comece-aqui/conferir-compreensao/'));
  const panel = page.getByRole('region', {name: 'Exercício de compreensão'});
  await expect(panel.getByRole('button', {name: 'Conferir resposta'})).toBeDisabled();
  await panel.getByRole('radio', {name: 'Sim, basta o ícone aparecer.'}).check();
  await panel.getByRole('button', {name: 'Conferir resposta'}).click();
  await expect(panel).toContainText('Vamos rever este ponto.');
  await panel.getByRole('radio', {name: 'Não. É preciso concluir o método específico e validar privilégio real.'}).check();
  await panel.getByRole('button', {name: 'Conferir resposta'}).click();
  await expect(panel).toContainText('Correto.');
  await panel.getByRole('button', {name: 'Próxima pergunta'}).click();
  await expect(panel.locator('legend')).toBeFocused();
  for (const answer of [2, 0, 1, 2, 0]) {
    await panel.getByRole('radio').nth(answer).check();
    await panel.getByRole('button', {name: 'Conferir resposta'}).click();
    await panel.getByRole('button', {name: /Próxima pergunta|Ver meu resultado/}).click();
  }
  await expect(panel).toContainText('5 de 6 respostas corretas na primeira tentativa.');
  await expect(panel.getByRole('heading', {name: 'Exercício concluído'})).toBeFocused();
  await expect(panel).toContainText('não autoriza gravar firmware');
  await panel.getByRole('button', {name: 'Repetir as perguntas'}).click();
  await expect(panel).toContainText('Pergunta 1 de 6');
});

test('aulas apresentam contexto documental, apoio e navegação pelo site publicado', async ({page}) => {
  await page.goto(route('/'));
  await page.getByRole('link', {name: 'Montar minha trilha →', exact: true}).click();
  await expect(page).toHaveURL(/\/docs\/comece-aqui\/minha-trilha\//);
  await page.getByRole('region', {name: 'Meu roteiro de aprendizado'}).getByRole('link', {name: 'Construir meu primeiro projeto', exact: true}).click();
  await expect(page).toHaveURL(/\/docs\/aulas\/primeiro-projeto-termux\//);
  const context = page.locator('.guide-context');
  await expect(context).toContainText('Revisão documental');
  await expect(context).toContainText('Sem teste físico nesta revisão');
  await expect(context.getByRole('link', {name: 'Onde digitar?'})).toHaveAttribute('href', route('/docs/comece-aqui/terminal-primeiros-passos/'));
  await context.getByRole('link', {name: 'Não funcionou?'}).click();
  await expect(page.getByRole('heading', {level: 1})).toContainText(/erros|iniciantes/i);
});
