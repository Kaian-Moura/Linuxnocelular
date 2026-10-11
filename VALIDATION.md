# Validação da documentação

Primeira edição em **10/10/2026**; ampliação para iniciantes e nova validação em **11/10/2026**, horário de São Paulo. Os relatórios JSON usam timestamps UTC. Este relatório distingue a validação do site da validação dos procedimentos em hardware.

## Entrega implementada

O projeto contém **76 páginas de documentação**, com cerca de **110,2 mil palavras de texto**, além de blocos de código. Inclui fundamentos, inventário, decisão por requisitos, preparação, Linux nativo, alternativas sobre Android, desktop, nove capítulos de hardware, diagnóstico, recuperação, aplicações, estudo de caso, FAQ, glossário e contribuição.

A ampliação acrescentou **11 páginas**: trilha do zero, preparação do computador, primeira aula de terminal, origens de downloads, Linux temporário no notebook, desbloqueio, root com Magisk, scrcpy, primeira configuração visual do GNOME, instalação de aplicativos e ferramentas de diagnóstico. Os caminhos Android/nativos, restauração, desenvolvimento, Arduino/ESP32, SSH, acesso remoto, GNOME e aplicações também foram ampliados com downloads, extração/instalação, local de execução, edição de arquivos, resultados esperados, erros e recuperação. A revisão por pares corrigiu diferenças de CLI/versão, formato de checksum, dependências de extração, porta explícita VNC, pasta de chaves SSH, opções de `ps` no BusyBox, origem Flatpak e transição entre display managers.

O assistente oferece 16 perguntas estruturadas e identificação livre do aparelho. As regras são locais e determinísticas: desconhecer um requisito não comprova suporte. Ele distingue preservar/substituir Android, controle por ADB/SSH/modo de manutenção, necessidades de terminal/desktop/containers e evidências para uma instalação nativa. O catálogo inicial tem dois registros com contexto e limites, não uma base completa de compatibilidade.

O site inclui busca local em português/inglês, temas claro/escuro, sumário, navegação móvel, sete diagramas Mermaid, avisos, destaque de código e referências cruzadas. Código original tem licença MIT; documentação original, CC BY-SA 4.0. Há modelos de contribuição, CI e workflow manual de GitHub Pages.

## Verificações efetivamente realizadas

| Verificação | Resultado |
| --- | --- |
| Regras, catálogo, metadados e regressão de UTF-8 | 29 testes unitários passaram |
| Revisão editorial automática | 76 páginas, zero erros; dois avisos revisados |
| Sintaxe dos exemplos | 305 blocos Bash, 47 `sh` e dois Python; zero erros, sem executar o conteúdo |
| Build de produção na raiz | Passou; 79 páginas HTML contando home, busca e 404 |
| Links/âncoras na raiz | 4.914 verificados; zero erros e zero HTML com NUL |
| Build de produção em `/guia/` | Passou; 79 páginas HTML |
| Links/âncoras em `/guia/` | 4.914 verificados; zero erros e zero HTML com NUL |
| Chromium/Playwright na raiz | Oito testes passaram |
| Chromium/Playwright em `/guia/` | Os mesmos oito testes passaram |
| Referências externas | 399 URLs consultadas: 388 alcançáveis, sete respostas HTTP inconclusivas e quatro falhas de rede; nenhum 404/410 |
| Revisão de privacidade dos fontes | Não foram encontrados os identificadores/segredos privados procurados; nenhuma foto pessoal, dump ou firmware foi incluído |

Os testes de navegador conferiram temas, navegação, recomendações condicionais, busca real por “Bluetooth”, largura de 390 px, limpeza do formulário, sumário, filtros do catálogo e a renderização de todos os sete diagramas. O novo teste percorreu **home → trilha iniciante → downloads → root**, verificando links, largura móvel e condições expressas do procedimento. Capturas da trilha no desktop, Magisk no tema escuro e downloads no celular foram inspecionadas, além das capturas da primeira edição. Isso não representa uma certificação completa de acessibilidade ou de todos os navegadores.

Os 354 blocos passaram somente por parsers Bash/Python. PowerShell, C/C++, JavaScript, serviços, firmware e exemplos que dependem de hardware receberam revisão documental; não são declarados executados ou compilados por esse verificador. Disponibilidade HTTP também não comprova a precisão do conteúdo nem o suporte de um dispositivo.

Os avisos editoriais restantes são intencionais: a página do catálogo tem 422 palavras mais o componente interativo, e o guia de publicação usa um domínio `.example` explicitamente identificado como ilustração.

## Ambiente e reprodução

Ambiente local: Linux x86-64, Node.js 22.23.1, npm 10.9.8, Bash, Python 3 e Chromium do sistema. Dependências principais fixadas: Docusaurus 3.10.2, React/ReactDOM 19.3.0 e busca local 0.55.3. O lockfile acompanha os fontes.

Na pasta do projeto:

```bash
npm ci
npm run verify
npm run check:snippets
npx playwright install chromium
npm run test:browser
```

Na validação local, o Chromium existente foi selecionado com `PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/chromium-browser`. Em outro computador, use o navegador instalado pelo Playwright; o caminho local não é uma exigência do projeto. `check:snippets` precisa dos parsers Bash/Python, e não executa os exemplos.

O teste adicional de publicação é reproduzível:

```bash
DOCUSAURUS_URL=https://validation.invalid DOCUSAURUS_BASE_URL=/guia/ npm run build -- --out-dir build-subpath
DOCUSAURUS_BASE_URL=/guia/ DOCUSAURUS_BUILD_DIR=build-subpath npm run check:links
DOCUSAURUS_BASE_URL=/guia/ DOCUSAURUS_TEST_SUBPATH=1 npm run test:browser
```

`validation.invalid` é uma origem reservada para teste, não um site publicado. A CI executa os dois formatos; o workflow Pages obtém a origem/base reais pela ação oficial. Para a prévia local, use `npm run serve` e abra http://localhost:3000.

## Correções encontradas durante a revisão

Uma reprodução mínima confirmou o bug de UTF-8 do React 18.3.1: o renderizador de streaming inseria NUL junto ao limite de buffer, corrompendo algumas âncoras acentuadas. React 19 contém a correção upstream; a versão estável 19.3.0 foi adotada, com teste de regressão e checagem de HTML. Não foram removidos acentos dos títulos nem ignorados links inválidos. Referências: [relato e análise upstream](https://github.com/react/react/issues/31134) e [correção do buffer](https://github.com/facebook/react/pull/26228).

A busca usa `hashed: 'filename'`, opção do plugin que coloca o hash no arquivo. Isso evita o redirecionamento indevido que foi observado no servidor local ao buscar um índice com query string em subdiretório; pesquisa e navegação passaram depois da alteração.

A revisão técnica também corrigiu exemplos de chroot, certificados, montagens privadas, identidade SSH explícita, preparação do pip, diretórios temporários do Nginx e condições de publicação de portas do Docker. Comandos de gravação permanecem condicionados à receita do modelo. As páginas não fornecem uma sequência universal de flash.

## Dependências e alerta ainda aberto

As auditorias da primeira edição, completa e sem dependências de desenvolvimento, estão em `reports/npm-audit-full.json` e `reports/npm-audit.json`. Foram atualizadas dependências transitivas com correções publicadas. O parser editorial antigo foi substituído por `yaml`, eliminando sua cadeia de dependências com alerta moderado. A ampliação de 11/10 não modificou dependências nem o lockfile; esses relatórios não são uma nova auditoria do registro npm nesta data.

A auditoria da primeira edição registrou **um aviso de severidade alta em `braces`**, propagado para 30 entradas na árvore. Naquela consulta, não havia versão corrigida publicada. O problema é negação de serviço por padrões profundamente aninhados. O projeto não é declarado livre de vulnerabilidades. Veja [SECURITY.md](SECURITY.md) e o [aviso upstream](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm). Downgrades sugeridos pelo npm não foram aplicados sem análise.

## O que permanece limitado ou pendente

- **Hardware:** os builds e os testes web não demonstram suporte em todos os smartphones. As receitas foram revisadas documentalmente; variantes, firmware, kernel e periféricos precisam de testes próprios.
- **Iniciantes e procedimentos por modelo:** o tutorial Magisk ensina obtenção, extração, patch e verificação, mas a gravação depende de uma receita identificada para variante/build/slot. O exemplo completo de desbloqueio/restauração é Fairphone 4, não um comando válido para qualquer telefone. Downloads públicos de ferramentas OEM não confirmados e condições de downgrade desconhecidas permanecem lacunas explícitas.
- **OnePlus 9 Pro:** a página distingue registros históricos do projeto privado de suporte público reproduzível. Não foi publicada uma imagem completa nem um pacote dos patches privados. Energia/PD, hotplug, orientação, câmera e isolamento do navegador mantêm limites expressos; não são apresentados como resolvidos universalmente.
- **Fontes inconclusivas:** bloqueios, timeout e falhas de rede constam de `reports/external-links.json`. Não foram encontrados 404/410 na rodada final, mas isso não comprova o conteúdo técnico das páginas. As fontes bloqueadas exigem revisão manual quando usadas numa instalação concreta.
- **Catálogo:** começa com OnePlus 9 Pro e Fairphone 4 em combinações específicas. Os demais aparelhos devem seguir inventário e fontes do projeto escolhido, sem compatibilidade presumida.
- **Publicação:** o repositório Git local e os workflows estão preparados; nenhum remote público, upload, domínio ou deploy foi criado por esta entrega. O workflow hospedado só poderá ser validado de ponta a ponta após configurar o repositório real e GitHub Pages.
- **Manutenção:** novos aparelhos, atualizações dos ports, correção de `braces` e testes físicos precisam de contribuições com evidências, conforme `CONTRIBUTING.md` e os modelos em `templates/`.

Não foram executados procedimentos de instalação, gravação de partições ou alteração do telefone durante este trabalho de documentação.
