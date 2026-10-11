import {test,expect} from '@playwright/test';
const route=pathname=>(process.env.DOCUSAURUS_BASE_URL||'/')+pathname.replace(/^\//,'');
test('home, tema e navegação principal funcionam',async({page})=>{
  await page.goto(route('/'));
  await expect(page.getByRole('heading',{name:/Seu celular ainda/})).toBeVisible();
  const initialTheme=await page.locator('html').getAttribute('data-theme');
  const themeButton=page.getByRole('button',{name:/Mudar entre modo claro e escuro/});
  // Docusaurus permite sistema → claro → escuro; sistema e claro podem coincidir.
  for(let i=0;i<3 && await page.locator('html').getAttribute('data-theme')===initialTheme;i++) await themeButton.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme',initialTheme==='dark'?'light':'dark');
  await page.getByRole('link',{name:/Qual caminho devo seguir/}).click();
  await expect(page.getByRole('heading',{name:'Qual caminho devo seguir com meu celular?',exact:true})).toBeVisible();
  await expect(page.locator('form select')).toHaveCount(16);
});
test('assistente não recomenda nativo sem evidências e atualiza após respostas',async({page})=>{
  await page.goto(route('/docs/escolha/'));
  await page.locator('[name=model]').fill('Aparelho desconhecido');
  await page.locator('[name=arch]').selectOption('arm64');
  await page.locator('[name=intent]').selectOption('replace');
  await page.getByRole('button',{name:'Ver recomendação',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Recupere primeiro um meio de controle'})).toBeVisible();
  await page.locator('[name=alternateAccess]').selectOption('boot');
  await page.getByRole('button',{name:'Ver recomendação',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Investigue a compatibilidade primeiro'})).toBeVisible();
  for(const [name,value] of Object.entries({alternateAccess:'boot',support:'documented',unlock:'yes',kernel:'documented',requiredHardware:'yes',backup:'yes',recovery:'yes'})) await page.locator(`[name=${name}]`).selectOption(value);
  await page.getByRole('button',{name:'Ver recomendação',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Avalie uma instalação Linux nativa documentada'})).toBeVisible();
  await expect(page.getByText(/não certifica suporte nem autoriza/)).toBeVisible();
  await page.getByRole('link',{name:'Abrir o guia recomendado'}).click();
  await expect(page).toHaveURL(/\/docs\/nativo\/visao-geral\//);
});
test('busca de produção encontra diagnóstico de Bluetooth',async({page})=>{
  await page.goto(route('/'));
  const search=page.locator('.navbar input').first();
  await expect(search).toHaveAttribute('aria-label','Pesquisar na documentação');
  await search.fill('Bluetooth');
  await expect(page.locator('[class*=suggestion]').first()).toBeVisible({timeout:15000});
  await expect(page.locator('[class*=suggestion]').first()).toContainText(/Bluetooth/i);
  await search.press('ArrowDown');await search.press('Enter');
  await expect(page).toHaveURL(/\/docs\//);
});
test('mobile não transborda e formulário permanece acessível',async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto(route('/'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  await page.goto(route('/docs/escolha/'));
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  await page.getByRole('button',{name:'Ver recomendação',exact:true}).click();
  await expect(page.getByRole('heading',{name:'Recupere primeiro um meio de controle'})).toBeVisible();
  await page.getByRole('button',{name:'Limpar respostas'}).click();
  await expect(page.getByRole('heading',{name:'Recupere primeiro um meio de controle'})).toHaveCount(0);
});
test('Mermaid gera diagrama e documentação mantém sumário',async({page})=>{
  await page.goto(route('/docs/fundamentos/linux-android/'));
  await expect(page.locator('.docusaurus-mermaid-container svg')).toBeVisible({timeout:15000});
  await expect(page.locator('.table-of-contents').first()).toContainText('Kernel não é o desktop');
});
test('catálogo distingue documentação de teste físico e filtra modelos',async({page})=>{
  await page.goto(route('/docs/compatibilidade/catalogo/'));
  await expect(page.getByText('2 registro(s). Estado documental não significa teste físico.')).toBeVisible();
  await page.getByLabel('Filtrar modelo, fabricante ou ambiente').fill('Fairphone');
  await expect(page.getByText('1 registro(s). Estado documental não significa teste físico.')).toBeVisible();
  await expect(page.getByRole('cell',{name:/Fairphone 4/})).toBeVisible();
  await page.getByLabel('Filtrar modelo, fabricante ou ambiente').fill('Aparelho sem registro');
  await expect(page.getByText(/Isso não prova incompatibilidade/)).toBeVisible();
});
test('trilha iniciante chega ao download e ao root com condições explícitas',async({page})=>{
  await page.goto(route('/'));
  await page.getByRole('link',{name:'Nunca fiz isso: começar do zero →'}).click();
  await expect(page).toHaveURL(/\/docs\/comece-aqui\/do-zero\//);
  await page.locator('article').getByRole('link',{name:'onde baixar cada ferramenta'}).click();
  await expect(page).toHaveURL(/\/docs\/comece-aqui\/downloads\//);
  await page.setViewportSize({width:390,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
  await page.locator('article').getByRole('link',{name:'Root do zero, condicionado ao modelo',exact:true}).click();
  await expect(page).toHaveURL(/\/docs\/preparacao\/root-magisk\//);
  await expect(page.getByRole('heading',{name:'Root real no Android com Magisk',exact:true})).toBeVisible();
  await expect(page.locator('article')).toContainText('Instalar o APK do Magisk, sozinho');
  await expect(page.locator('article')).toContainText('não constituem um método universal');
});
test('todos os sete fluxogramas da edição renderizam',async({page})=>{
  for(const pathname of [
    '/docs/nativo/visao-geral/',
    '/docs/fundamentos/boot-kernel/',
    '/docs/fundamentos/linux-android/',
    '/docs/projetos/assistente-voz/',
    '/docs/hardware/teclados-usb/',
    '/docs/hardware/video-hotplug/',
    '/docs/escolha/',
  ]) {
    await page.goto(route(pathname));
    const diagram=page.locator('.docusaurus-mermaid-container');
    await expect(diagram.locator('svg')).toBeVisible({timeout:10000});
    await expect(diagram).not.toContainText('Syntax error');
  }
});
