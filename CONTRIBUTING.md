# Contribuições

Leia [o padrão editorial](docs/comunidade/contribuir.md) e [a política de evidências](docs/comunidade/fontes.md).

1. Crie uma branch para uma alteração delimitada.
2. Use os modelos em `templates/`; publique somente conteúdo preenchido e verificado.
3. Registre modelo, variante, versões, fontes e data. Separe revisão documental e testes físicos.
4. Explique comandos, ambiente, privilégio, riscos e rollback. Para cada ferramenta, inclua origem oficial, escolha do arquivo, instalação/extração e teste. Cada etapa deve dizer o que fazer, o que deve aparecer e como tratar divergências; não suponha conhecimento de terminal/arquivos. Use a trilha `docs/comece-aqui/` para fundamentos compartilhados. Não invente flash universal.
5. Remova segredos, dados pessoais e arquivos sem licença de redistribuição.
6. Execute `npm ci` e `npm run verify`. Para interfaces, execute os testes de navegador.
7. No pull request, informe mudança, evidências, testes e limitações.

Um novo dispositivo não herda suporte por usar o mesmo SoC. “Boot funciona” não deve virar “desktop estável”. Ajustes no assistente precisam preservar suas condições de segurança e ter testes de regressão.

Para uma nova aula, use também `templates/aula-pratica.md`. Complete um único percurso do início até salvar, encerrar e retomar, sem misturar alternativas na mesma sessão. Inclua erros esperados e checkpoints, distinguindo saída ilustrativa de resultado medido. Ao acrescentar aulas a `src/lib/learning.mjs`, preserve IDs já usados ou documente a migração do progresso local. Perguntas de compreensão devem explicar por que a resposta está correta e apontar ao guia relevante; notas e checkboxes nunca certificam compatibilidade. A simulação de terminal deve permanecer sem execução, rede ou acesso ao hardware.

Código original recebe contribuições sob MIT; documentação sob CC BY-SA 4.0. Identifique origem/licença de material externo; prefira explicação original e referência primária. Mantenha comunicação respeitosa com pessoas de todos os níveis técnicos.

Para incluir uma aula na biblioteca, acrescente um registro em `src/lib/courses.mjs` com resultado, requisitos e ambientes realmente tratados. Esses filtros organizam conteúdo e não são uma lista de aparelhos suportados. Confirme todos os links e adicione cenários em `tests/courses.test.mjs` quando alterar o comportamento. Preserve os IDs das trilhas antigas: progresso salvo deve continuar legível depois de acrescentar aulas.

Uma ficha exportada é um relato manual, não um teste certificado. A ferramenta `BenchRecord` não deve coletar hardware, persistir dados automaticamente ou abrir endpoints de envio. Mudanças no formato precisam manter validação estrita, limites de texto, importação sem execução e preservação dos campos atuais quando o arquivo é inválido. Revise downloads, substituição de estado e importações atrasadas em testes de navegador. Para contribuir com evidências, revise os dados pessoais antes de copiar o relato para uma issue; importar/exportar pela página não publica nada.

Quando executar código de aula, registre ferramenta, host, cenário e observações reais. Um teste x86-64 no notebook pode confirmar a lógica do programa, mas não comprova drivers, ABI ARM64, upload em placa, Android ou comportamento de um telefone. `npm run check:git-workshop` exemplifica um ensaio reproduzível restrito a uma pasta temporária própria; requer Git e não usa rede ou dispositivo.

Para oferecer fontes para download, identifique cada bloco completo da aula com um comentário `example-file: ID/CAMINHO` no formato usado pelas seis aulas existentes. Acrescente somente fontes originais/licenciados a `scripts/source-packs.json`, com lista explícita de arquivos, raiz, comandos e limites. Não inclua firmware, binário de ferramenta, chaves, dados pessoais, ambiente virtual ou script de instalação automática.

Execute `npm run examples:generate` para regenerar os arquivos conhecidos de `examples/` e `static/downloads/`; preserve edições próprias fora dessas áreas geradas. Execute `npm run check:examples` e revise a diferença do manifesto/catálogo. O gerador não remove arquivos inesperados e recusa pais simbólicos, para não escrever fora da área prevista. O ZIP determinístico permite comparar a versão publicada ao código da aula; um hash não é assinatura independente nem certificado de hardware.

`npm run check:source-workshops` repete os ensaios de host a partir dos ZIPs em temporários próprios, com ferramentas existentes. Não instala pacotes, inicia serviços do sistema ou envia código para placas. Use Python 3.9+, Bash, Node, C/C++, CMake e CTest no computador Linux de validação e registre versões/limites. Ao incluir um novo projeto, acrescente testes que verifiquem comportamento e preservação de dados, em vez de apenas copiar a implementação para a asserção.

No diagnóstico guiado, mantenha desconhecido como desconhecido, normalize estados na análise e exportação e explique os momentos de um ensaio antes/depois. Um teste posterior não autoriza inferir a etapa anterior; nenhuma regra deve disparar comando real ou tratar uma resposta manual como causa raiz comprovada. Revise foco, troca/limpeza, largura móvel, download e `baseUrl` em testes de navegador.
