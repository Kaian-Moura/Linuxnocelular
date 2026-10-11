# Primeiro sketch do ESP32 clássico

Código original da documentação Celular Linux, revisão 11/10/2026.
LED externo no GPIO23 do DevKitC V4 com WROOM-32E-N4, conforme o circuito da aula.

## Antes de executar

Leia /docs/aulas/esp32-primeiro-projeto/ no site ou docs/aulas/esp32-primeiro-projeto.md no repositório.
Siga a aula para instalar as ferramentas oficiais, identificar o ambiente e conferir os pré-requisitos.
Extraia numa pasta nova. Nenhum arquivo deste pacote é executado durante o download ou a extração.
Prepare core/toolchain e confira placa e circuito antes. O exemplo não é genérico para ESP32-S2/S3/C3/C6 nem para qualquer LED integrado. Não inclui upload automático ou binário para gravação.

## Chamadas de referência

No terminal do ambiente preparado, dentro da pasta esp32-aula:

```text
arduino-cli compile --fqbn esp32:esp32:esp32:FlashSize=4M,PSRAM=disabled,UploadSpeed=115200 --jobs 1 --warnings all --output-dir ./build/Esp32Primeiro ./Esp32Primeiro
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
