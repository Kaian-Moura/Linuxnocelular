# Arquitetura e manutenção

Este projeto é um site estático Docusaurus em português brasileiro. O conteúdo em Markdown/MDX é a base de conhecimento; componentes React acrescentam decisão por requisitos e consulta a registros de dispositivos. Não há API que identifique aparelhos, coleta de respostas ou mecanismo de execução de comandos.

## Camadas

| Camada | Arquivos | Responsabilidade |
| --- | --- | --- |
| Conteúdo | `docs/` | Explicações, condições, procedimentos, verificações, recuperação e fontes |
| Navegação | `sidebars.js` | Categorias explícitas e páginas geradas a partir dos diretórios |
| Regras de decisão | `src/lib/recommend.mjs` | Recomendações determinísticas, avisos e condições para avaliação nativa |
| Formulário | `src/components/PathAssistant/` | Perguntas, foco, leitura dos resultados e links aos tutoriais |
| Registros | `data/devices.json` e `src/components/DeviceCatalog/` | Evidências de combinações específicas, filtros e limites |
| Apresentação | `src/pages/`, `src/css/`, `static/img/` | Home, temas, responsividade e ilustrações originais |
| Busca | Tema de busca local e `i18n/pt-BR/` | Índice gerado no build, pesquisa sem serviço externo e rótulos em português |
| Qualidade | `scripts/`, `tests/`, `reports/` | Metadados, rotas/âncoras, fontes externas, regras e navegador |
| Publicação | `.github/workflows/` | CI e publicação manual de arquivos estáticos no GitHub Pages |

## Decisão sem inventar suporte

O formulário recebe informações fornecidas pelo leitor. Conhecer o nome ou a arquitetura não prova que exista um port. Uma recomendação nativa exige identidade, arquitetura conhecida, canal de controle, receita documentada para a variante, possibilidade de desbloqueio, kernel, hardware necessário, backup e recuperação. Mesmo assim, o resultado é **avaliar a instalação documentada**, não certificar hardware nem autorizar uma sequência universal de flash.

Um Linux já instalado e acessível por SSH segue para configuração, sem recomendar reinstalação. Root não equivale a bootloader desbloqueado. Containers seguem para requisitos de kernel próprios, sem tratar PRoot como Docker. Respostas desconhecidas continuam desconhecidas; o catálogo de dois registros não preenche respostas automaticamente nem determina compatibilidade dos demais aparelhos.

Para alterar regras, escreva primeiro o cenário esperado e acrescente um teste em `tests/recommend.test.mjs`. Verifique também os textos que explicam essas regras em `docs/escolha/`. Os testes do site nunca executam comandos documentados no telefone.

## Adicionar e revisar páginas

Use os modelos em `templates/` e o padrão descrito em `CONTRIBUTING.md`. Metadados incluem título, descrição e `last_verified`; páginas técnicas distinguem revisão documental, evidência histórica e teste físico. Uma nova data só deve ser registrada quando a informação for revista. As fontes devem sustentar condições e comandos, e não aparecer apenas como uma lista decorativa.

Links entre documentos usam caminhos relativos quando possível. Links de componentes usam `@docusaurus/Link`, que respeita o `baseUrl`. Não use uma URL de hospedagem provisória dentro dos tutoriais. Os metadados de edição/GitHub dependem da variável real `GITHUB_REPOSITORY`; nenhuma conta é presumida.

## Construção e portabilidade

`npm ci` reproduz o lockfile em Node.js 22. `npm run verify` executa os testes de regras, revisão editorial, build e verificação de rotas/âncoras. O build gera HTML, recursos e índice local de busca em `build/`. O teste de navegador revisa o resultado de produção, pois o servidor de desenvolvimento não fornece a mesma busca.

A configuração aceita `DOCUSAURUS_URL` e `DOCUSAURUS_BASE_URL`. Um build separado em `build-subpath/` permite verificar publicação em subdiretório sem substituir a prévia local. O verificador aceita `DOCUSAURUS_BUILD_DIR` e gera um relatório distinto para esse caso. Ambientes e artefatos temporários ficam fora do Git.

CI e deploy não testam suporte físico nos smartphones. A validação de hardware exige registros com modelo, firmware, kernel, artefatos, cenário e resultado. Os limites efetivos desta entrega estão em [VALIDATION.md](VALIDATION.md).
