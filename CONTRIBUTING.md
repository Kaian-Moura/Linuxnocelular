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

Código original recebe contribuições sob MIT; documentação sob CC BY-SA 4.0. Identifique origem/licença de material externo; prefira explicação original e referência primária. Mantenha comunicação respeitosa com pessoas de todos os níveis técnicos.
