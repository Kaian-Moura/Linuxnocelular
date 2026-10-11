# Primeiro sketch do Uno R3

Código original da documentação Celular Linux, revisão 11/10/2026.
LED integrado e saída serial para o Arduino Uno R3, ATmega328P.

## Antes de executar

Leia /docs/aulas/arduino-uno-primeiro-projeto/ no site ou docs/aulas/arduino-uno-primeiro-projeto.md no repositório.
Siga a aula para instalar as ferramentas oficiais, identificar o ambiente e conferir os pré-requisitos.
Extraia numa pasta nova. Nenhum arquivo deste pacote é executado durante o download ou a extração.
Somente após identificar a placa e preparar CLI/core/toolchain do host conforme a aula. O pacote não inclui firmware pronto, compilador nem upload automático. Uno R4 e outros chips exigem outra receita.

## Chamadas de referência

No terminal do ambiente preparado, dentro da pasta arduino-uno-aula:

```text
arduino-cli compile --fqbn arduino:avr:uno --warnings all --output-dir ./build/UnoPrimeiro ./UnoPrimeiro
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
