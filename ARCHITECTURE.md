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
| Aprendizado | `src/lib/learning.mjs`, `LearningPath/`, `KnowledgeCheck/` | Sete roteiros, marcações opcionais, exportação e perguntas com explicação |
| Biblioteca | `src/lib/courses.mjs` e `CourseLibrary/` | Vinte e três aulas e filtros por objetivo, ambiente, nível e texto, sem inferir compatibilidade |
| Ficha de bancada | `src/lib/bench.mjs` e `BenchRecord/` | Relato manual em memória, validação de importação e exportação local após revisão |
| Laboratório | `src/lib/terminal-lab.mjs` e `TerminalLab/` | Sistema de arquivos fictício e comandos limitados, sem execução no host |
| Ajuda em páginas | `src/theme/DocItem/Content/` | Data e escopo declarados nos metadados, links de orientação comuns |
| Apresentação | `src/pages/`, `src/css/`, `static/img/` | Home, temas, responsividade e ilustrações originais |
| Busca | Tema de busca local e `i18n/pt-BR/` | Índice gerado no build, pesquisa sem serviço externo e rótulos em português |
| Qualidade | `scripts/`, `tests/`, `reports/` | Metadados, rotas/âncoras, fontes externas, regras e navegador |
| Publicação | `.github/workflows/` | CI e publicação manual de arquivos estáticos no GitHub Pages |

## Decisão sem inventar suporte

O formulário recebe informações fornecidas pelo leitor. Conhecer o nome ou a arquitetura não prova que exista um port. Uma recomendação nativa exige identidade, arquitetura conhecida, canal de controle, receita documentada para a variante, possibilidade de desbloqueio, kernel, hardware necessário, backup e recuperação. Mesmo assim, o resultado é **avaliar a instalação documentada**, não certificar hardware nem autorizar uma sequência universal de flash.

Um Linux já instalado e acessível por SSH segue para configuração, sem recomendar reinstalação. Root não equivale a bootloader desbloqueado. Containers seguem para requisitos de kernel próprios, sem tratar PRoot como Docker. Respostas desconhecidas continuam desconhecidas; o catálogo de dois registros não preenche respostas automaticamente nem determina compatibilidade dos demais aparelhos.

Para alterar regras, escreva primeiro o cenário esperado e acrescente um teste em `tests/recommend.test.mjs`. Verifique também os textos que explicam essas regras em `docs/escolha/`. Os testes do site nunca executam comandos documentados no telefone.

## Aprendizado sem acesso ao aparelho

`docs/aulas/` contém vinte e três percursos completos, do primeiro projeto/desktop a linguagens, Git, SSH, servidor web, backup, placas e manutenção. `docs/comece-aqui/` acrescenta microaulas, treino de terminal e perguntas de compreensão. As sete trilhas reaproveitam IDs compartilhados e preservam os seis roteiros anteriores e seus registros. Concluir um roteiro não desbloqueia flash nem modifica a recomendação de compatibilidade.

`LearningPath` mantém marcações na memória da página por padrão. Somente ao optar por salvar usa a chave versionada `celular-linux:learning:v1`: versão, trilha e IDs conhecidos das aulas. Não grava modelo, respostas do assistente, serial, credenciais ou arquivos do leitor. O parser rejeita versões desconhecidas, limita o tamanho e descarta campos/IDs inesperados. A desativação explícita remove somente essa chave; registros inválidos não são apagados ao visitar a página. Erros de armazenamento são informados sem impedir o estudo. O arquivo Markdown exportado é gerado localmente e suas marcações continuam sendo declarações do leitor.

`terminal-lab.mjs` interpreta somente `pwd`, `ls`, `cd`, `cat`, `help` e `clear`, em diretórios e arquivos artificiais. Não usa `eval`, shell, rede, API de arquivos ou conexão com dispositivos. Operadores, variáveis e caminhos fora do cenário são recusados; isto não é uma implementação completa do Bash. O estado é por instância React, com histórico limitado e IDs estáveis. Consultas fora do roteiro não avançam a missão, e a interface orienta a recuperar a pasta de partida.

As perguntas mantêm respostas apenas em memória e contam a primeira tentativa, mesmo após uma correção. Ao avançar ou repetir, o foco vai para a pergunta/resultado, sem capturar foco na abertura inicial. Os testes unitários cobrem parsing, limites e isolamento do simulador; os testes de navegador cobrem persistência opcional, exportação, erros, retomada, foco e layout móvel. Não são provas de suporte a hardware.

`courses.mjs` conserva resultado, requisitos e ambientes tratados em cada aula. `filterCourses` combina filtros e termos de busca com normalização de acentos. Um conjunto vazio não significa aparelho incompatível: a interface explica isso e aponta à investigação. A escolha de ambiente não instala ferramentas nem certifica ABI/drivers.

`bench.mjs` define uma ficha versionada com nove campos e treze cenários. `BenchRecord` mantém dados somente na memória da página; JSON exportado é o mecanismo de retomada manual. Importação aceita apenas campos/resultados conhecidos, tamanho limitado, estados válidos e texto sem NUL ou pares UTF-16 malformados. Um erro preserva os campos atuais. Uma sequência de importação invalida resultados atrasados após edição, limpeza ou outra importação. Toda edição e toda conclusão de importação atual pedem nova revisão antes dos downloads. A codificação de download também trata Unicode inválido defensivamente. Markdown escapa texto informado; nada executa comandos, reconhece hardware, envia dados ou publica uma issue.

Os ensaios de programas da documentação são separados dos testes do site. `scripts/check-git-workshop.mjs` usa Git e uma pasta temporária própria para conferir conservação e recuperação de trabalho; a CI também o executa. As outras verificações locais de exemplos estão descritas no relatório, com host e limites, sem convertê-las em testes físicos.

## Adicionar e revisar páginas

O diagnóstico guiado usa `layer-guide.mjs` e `LayerGuide/`: quatro investigações e estados `unknown/yes/no`. A primeira etapa sem sim relatado é uma lacuna ou fronteira, nunca causa raiz certificada. Observações posteriores não preenchem a lacuna por inferência. Vídeo distingue a ligação inicial da reconexão no mesmo ensaio. A interface não persiste dados, invalida resultado após edição e foca a indicação por ação do leitor. Markdown contém somente estados padronizados, sem coleta ou execução de comandos.

Os seis downloads usam `source-packs.json`, `package-examples.py` e `SourcePacks/`. Comentários `example-file` identificam blocos completos nas aulas; a lista explícita define arquivos, pasta e instruções. O gerador rejeita divergências, duplicação, travessia e symlinks em toda a cadeia de saída antes de escrever; não apaga arquivos inesperados. ZIP usa timestamp fixo e arquivos regulares sem compressão variável. `--check` compara texto, exemplos, manifestos e ZIP byte a byte, sem escrever. A interface usa `useBaseUrl` para downloads e `Link` para guias.

`check-source-workshops.py` extrai os pacotes conhecidos em temporários próprios e executa quatro testes Python, cinco Node sem socket, três CTest e casos Bash, além do SQLite extraído da aula. Exige ferramentas existentes, não instala dependências. Sketches recebem somente verificação de fonte/arquivo nesta rotina; a compilação anterior está registrada separadamente. Não testa telefone, upload, reboot, LAN, Android ou PRoot. Os validadores de pacotes exigem Python 3.9 ou posterior; veja os outros requisitos no README.

Use os modelos em `templates/` e o padrão descrito em `CONTRIBUTING.md`. Metadados incluem título, descrição e `last_verified`; páginas técnicas distinguem revisão documental, evidência histórica e teste físico. Uma nova data só deve ser registrada quando a informação for revista. As fontes devem sustentar condições e comandos, e não aparecer apenas como uma lista decorativa.

A entrada para iniciantes fica em `docs/comece-aqui/`: escolha de caminho, preparação do computador, primeira aula de terminal, origens de download e um ambiente Linux temporário no notebook. Um tutorial técnico deve explicar a cadeia **origem → escolha do arquivo → download → extração/instalação → abrir → verificar**, identificar onde cada comando roda e apresentar o resultado esperado. Os capítulos avançados podem reutilizar esses fundamentos por links, mas não dispensar os requisitos específicos de hardware, firmware, privilégios e recuperação.

Links entre documentos usam caminhos relativos quando possível. Links de componentes usam `@docusaurus/Link`, que respeita o `baseUrl`. Não use uma URL de hospedagem provisória dentro dos tutoriais. Os metadados de edição/GitHub dependem da variável real `GITHUB_REPOSITORY`; nenhuma conta é presumida.

## Construção e portabilidade

`npm ci` reproduz o lockfile em Node.js 22. `npm run verify` executa os testes de regras, revisão editorial, paridade de fontes, build e verificação de rotas/âncoras. Links e âncoras quebrados reprovam o build; a checagem do HTML acrescenta conferência do resultado gerado. O build gera HTML, recursos e índice local de busca em `build/`. O teste de navegador revisa o resultado de produção, pois o servidor de desenvolvimento não fornece a mesma busca.

A configuração aceita `DOCUSAURUS_URL` e `DOCUSAURUS_BASE_URL`. Um build separado em `build-subpath/` permite verificar publicação em subdiretório sem substituir a prévia local. O verificador aceita `DOCUSAURUS_BUILD_DIR` e gera um relatório distinto para esse caso. Ambientes e artefatos temporários ficam fora do Git.

CI e deploy não testam suporte físico nos smartphones. A validação de hardware exige registros com modelo, firmware, kernel, artefatos, cenário e resultado. Os limites efetivos desta entrega estão em [VALIDATION.md](VALIDATION.md).
