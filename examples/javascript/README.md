# Planejador HTTP em JavaScript

Código original da documentação Celular Linux, revisão 11/10/2026.
Formulário, rotas JSON e cinco testes com Node.js. Sem npm install.

## Antes de executar

Leia /docs/aulas/javascript-servidor-local/ no site ou docs/aulas/javascript-servidor-local.md no repositório.
Siga a aula para instalar as ferramentas oficiais, identificar o ambiente e conferir os pré-requisitos.
Extraia numa pasta nova. Nenhum arquivo deste pacote é executado durante o download ou a extração.
A última chamada continua em primeiro plano e escuta somente 127.0.0.1:8765. Abra essa URL no mesmo aparelho e encerre com Ctrl+C. Não é um serviço público de produção.

## Chamadas de referência

No terminal do ambiente preparado, dentro da pasta planejador-js:

```text
node --check servidor.cjs
node --test teste-servidor.cjs
node servidor.cjs
```

Não há instalador automático. Confira e explique cada chamada na aula antes de executar.
Resultados no notebook de validação não certificam compatibilidade com todo celular ou placa.
Os dois sketches foram compilados anteriormente para os alvos documentados, sem upload físico.

## Integridade, origem e licença

MANIFEST.json contém SHA-256 e tamanho dos fontes, deste README e da licença.
O catálogo do site informa o SHA-256 do ZIP. Um hash verifica correspondência, não a confiança da origem.
Os fontes são copiados dos blocos identificados da aula e comparados pelo verificador do repositório.
Licença do código: MIT, veja LICENSE. A documentação do site tem licença própria CC BY-SA 4.0.
Conserve suas alterações em outra cópia; gerar os exemplos novamente substitui apenas os arquivos gerados.
