# Celular → Linux

Base de conhecimento em português brasileiro sobre reaproveitar smartphones como computadores Linux. Inclui Linux nativo, Android com Termux/PRoot/chroot, decisão por requisitos, hardware, recuperação e projetos. O estudo original é um OnePlus 9 Pro; **não existe imagem ou método universal**.

## Executar

Para **ler e seguir** os tutoriais, monte [sua trilha](docs/comece-aqui/minha-trilha.mdx), pratique no [terminal simulado](docs/comece-aqui/laboratorio.mdx) e siga a [primeira aula Termux](docs/aulas/primeiro-projeto-termux.md). O [guia do zero](docs/comece-aqui/do-zero.md) e o [diretório de downloads oficiais](docs/comece-aqui/downloads.md) explicam os preparativos. Não é necessário instalar Node ou Docusaurus no telefone para usar Linux; as ferramentas abaixo servem para executar **este site de documentação** no computador.

Para abrir o site localmente pela primeira vez:

1. Obtenha Node.js **22** pelo [site oficial](https://nodejs.org/en/download), escolhendo a plataforma/arquitetura do computador. O projeto fixa a série 22 em `.nvmrc`; não use automaticamente a edição mais nova da página. Os pacotes de instalação incluem npm; consulte as instruções oficiais para a plataforma.
2. Conclua o instalador ou método indicado e reabra Terminal/PowerShell. Confira `node --version` e `npm --version`. Não execute instaladores ARM no notebook x64 apenas porque a documentação trata de smartphones.
3. Extraia o ZIP de fontes para uma pasta própria ou clone o repositório real quando publicado. Abra essa pasta no VS Code, use Terminal → Novo Terminal e confira que `package.json` está ali. No PowerShell consulte `Get-ChildItem package.json`; em Linux/macOS, `ls package.json`.
4. Dentro da pasta, execute os dois comandos abaixo. `npm ci` baixa exatamente as dependências do lockfile; precisa de internet. `npm start` inicia o servidor e permanece ativo, portanto o prompt não retorna até encerrar com Ctrl+C.
5. Abra a URL informada pelo terminal. Se a porta 3000 já está usada, leia a alternativa oferecida pela ferramenta e use a porta realmente escolhida. Busca local deve ser testada no build de produção, no segundo bloco.

Com Node/npm já preparados, dentro desta pasta:

```bash
npm ci
npm start
```

Abra http://localhost:3000. Para produção e busca local:

```bash
npm run verify
npm run serve
```

Se `node` ou `npm` não for encontrado, confira instalação e PATH do computador. No Windows, se a política do PowerShell bloquear somente o wrapper `npm.ps1`, utilize `npm.cmd ci`, `npm.cmd start` etc.; não desligue políticas de segurança globalmente por hábito. Se a instalação pedir privilégios para escrever dentro do projeto, confira proprietário/pasta em vez de executar toda a construção como root.

## Testar

```bash
npm test
npm run check:content
npm run check:snippets
npm run check:git-workshop
npm run check:examples
npm run check:source-workshops
npm run build
npm run check:links
npx playwright install chromium
npm run test:browser
npm run check:external
```

O último comando faz requisições HTTP e registra resultados inconclusivos/bloqueados; não é parte da CI obrigatória. Os testes do site **não validam procedimentos em todos os smartphones**.

`check:snippets` requer Bash e Python 3 e confere apenas sintaxe, sem executar os exemplos. `check:git-workshop` exige Git e ensaia histórico, diferenças, recuperação e clone somente em uma pasta temporária própria, sem rede ou telefone. O relatório de validação também contém os comandos para repetir os testes em subdiretório.

Os testes unitários e `verify` também requerem **Python 3.9 ou posterior**, chamado `python3`, para verificar pacotes de fontes. `check:examples` compara bytes e hashes sem executar projetos. `check:source-workshops` exige Python, Node, Bash, compiladores C/C++, CMake e CTest já disponíveis: extrai ZIPs originais em temporários e executa exemplos de host e o SQLite publicado. Não instala ferramentas, abre serviços de rede ou faz upload para placas. Essa rotina de ensaios usa ambiente Linux; se uma ferramenta faltar, prepare o computador conforme a distribuição ou execute somente as verificações disponíveis e registre a lacuna. O build do site por si só continua exigindo Node/npm, sem compiladores para placas.

## Organização

- `docs/`: conceitos, caminhos, compatibilidade, preparação, hardware, diagnóstico, recuperação, projetos e comunidade.
- `src/`: home, tema, assistentes de decisão/diagnóstico, trilhas, biblioteca, downloads, ficha de bancada, simulador e perguntas React, sem backend ou coleta própria; progresso local somente se o leitor optar.
- `examples/`: fontes gerados dos blocos identificados das aulas, com README, licença e manifesto.
- `static/downloads/`: seis ZIPs determinísticos e catálogo SHA-256; regenere por `npm run examples:generate`.
- `templates/`: modelos de tutorial, dispositivo e registro de teste.
- `scripts/`: validação editorial, links internos e disponibilidade de fontes externas.
- `tests/`: invariantes de decisão e testes de navegador.
- `.github/workflows/`: CI e publicação manual no GitHub Pages.

## Publicar

Crie um repositório real e configure GitHub Pages para GitHub Actions. Execute manualmente o workflow Pages. O domínio/subcaminho são obtidos pela ação oficial; links GitHub só aparecem quando `GITHUB_REPOSITORY` é definido. Não há origem fictícia nem deploy executado automaticamente por esta entrega.

Outra hospedagem estática: build `npm ci && npm run build`, saída `build/`. Configure `DOCUSAURUS_URL` e `DOCUSAURUS_BASE_URL` conforme [.env.example](.env.example). Leia o [guia completo](docs/comunidade/publicacao.md).

## Evidências e limites

Revisão inicial: 10/10/2026; ampliações para iniciantes em 11/10/2026. São **111 páginas**, incluindo dez microaulas, downloads oficiais, ADB/Fastboot, desbloqueio, root com Magisk, kit de recuperação e manual de erros. A [biblioteca](docs/aulas/biblioteca.mdx) organiza **23 aulas práticas**: Termux, Debian/desktop, mini-PC nativo, Python, JavaScript, C/C++, Git, SSH, servidor web, backup, Arduino Uno, ESP32, manutenção, permissões, processos, pacotes, Bash, rede, SQLite, Nginx, tarefas em segundo plano, desempenho e logs. **Sete trilhas** acompanham o aprendizado; seis exercícios simulam um terminal fictício, e seis perguntas explicam equívocos frequentes.

Os [seis projetos para download](docs/aulas/baixar-exemplos.mdx) têm fontes iguais aos tutoriais, README e manifesto. O [diagnóstico guiado](docs/diagnostico/assistente-camadas.mdx) organiza quatro sintomas em 23 etapas manuais, distingue lacuna de falha e aponta à próxima observação. A nova trilha de administração usa exercícios próprios e explicita limites de boot/Android.

A [ficha de bancada](docs/diagnostico/ficha-evidencias.mdx) exporta Markdown e JSON e importa somente o formato validado. É preenchida manualmente, sem coleta, armazenamento automático ou envio. A [montagem progressiva](docs/hardware/montagem-validada.md) e a aula de [ler o manual do dispositivo](docs/comece-aqui/ler-manual-do-dispositivo.md) ajudam a registrar evidências e reconhecer quando uma receita não se aplica.

Os capítulos indicam fontes, condições e limites; o anúncio de mudança de postmarketOS para Nura está contextualizado. Os programas originais de várias aulas foram executados no notebook, com o escopo descrito em [VALIDATION.md](VALIDATION.md). Isso não comprova execução em todos os hosts ou suporte em hardware. Adaptações privadas do OnePlus não são distribuídas como suporte genérico. Fontes que bloquearam automação são identificadas.

## Contribuir e licenças

Veja a [arquitetura](ARCHITECTURE.md) e o [relatório de validação e pendências](VALIDATION.md) para manutenção e avaliação desta entrega.

Veja [CONTRIBUTING.md](CONTRIBUTING.md) e [SECURITY.md](SECURITY.md). Código original: [MIT](LICENSE). Documentação original: [CC BY-SA 4.0](LICENSE-DOCS.md). Material externo conserva sua licença e não é relicenciado por citação. Não envie firmware proprietário, credenciais ou imagens pessoais.
