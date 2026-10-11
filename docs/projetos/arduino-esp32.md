---
title: Arduino Uno e ESP32 pelo mini PC
sidebar_position: 2
description: Separe compilação ARM64, drivers seriais e gravação de placas antes de preparar Arduino CLI.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, dificuldade e compatibilidade

**Dificuldade:** intermediária a avançada. **Resultado:** compilar um sketch para Uno R3 e, quando host USB/serial forem compatíveis, gravá-lo; preparar uma plataforma ESP32 correspondente à placa real. **Materiais:** hub/OTG funcional, cabo de dados, placa, alimentação estável, terminal e ferramentas de [desenvolvimento](./desenvolvimento.md).

Há três compatibilidades distintas: o programa Arduino CLI precisa executar no **telefone**; os compiladores auxiliares precisam ter builds para o **host**; o firmware compilado precisa ser para a **placa**. ARM64 do telefone não é a arquitetura AVR do Uno R3 nem necessariamente a arquitetura Xtensa/RISC-V do ESP32.

Arduino Uno R4, Nano, placas compatíveis e variantes ESP32 não são a mesma placa. O exemplo `arduino:avr:uno` abaixo é para **Uno R3 AVR ATmega328P**. Identifique modelo, chip e USB-UART antes de selecionar o FQBN, o nome completo que define o alvo de compilação.

:::warning Compilar não prova que USB funciona
PRoot não cria `/dev/ttyACM0` no Android. O Android pode disponibilizar USB pelo framework de aplicativos sem expor uma porta POSIX ao Termux. Root também não instala drivers ausentes. Um APK que grava placas é outro método, com API e manutenção próprias, não confirmação de compatibilidade do Arduino CLI.
:::

## 1. Obter uma versão que execute no host

A documentação oficial e releases consultadas oferecem **Arduino CLI 1.5.1 para Linux ARM64**. Use [a página de downloads](https://docs.arduino.cc/arduino-cli/installation/#download) ou [a release exata](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1). Baixe o arquivo da arquitetura correta e o checksum correspondente, confira integridade e extraia em uma pasta dedicada do usuário, sem sobrescrever um binário existente.

O artefato Linux ARM64 não é uma promessa de execução em Android/bionic ou Alpine/musl. Prefira um pacote construído para seu sistema; em Debian/Ubuntu ARM64, o ambiente glibc normalmente corresponde à família do download. Se houver erro de loader, investigue com `file CAMINHO_DO_BINARIO` e a documentação da release, ou compile o CLI pelo procedimento Go oficial. Não crie links de loader nem copie libc de outra distribuição.

Após instalar o binário verificado em `~/.local/bin/arduino-cli`, utilize explicitamente:

```bash
"$HOME/.local/bin/arduino-cli" version
"$HOME/.local/bin/arduino-cli" core install --help
"$HOME/.local/bin/arduino-cli" upload --help
```

Os exemplos seguintes usam `arduino-cli` no PATH. Adicione `~/.local/bin` à configuração da sua shell somente após conferir que o diretório é seu e não contém programas não confiáveis.

## 2. Preparar e validar a plataforma Uno R3

Faça backup de uma configuração existente antes de `config init`; não force sobrescrita. Em uma instalação nova:

```bash
arduino-cli config init
arduino-cli core update-index
arduino-cli core install arduino:avr
arduino-cli core list
arduino-cli board details --fqbn arduino:avr:uno
```

O índice descreve também ferramentas exigidas no host. Se aparece ausência de toolchain para sua arquitetura, não mude o host para x86_64 só para baixar um pacote incompatível. Consulte versões suportadas ou use compilação remota num host apropriado. Registre a versão do core apresentada por `core list` para repetir a compilação no futuro.

Crie um sketch novo:

```bash
mkdir -p "$HOME/projetos/arduino"
cd "$HOME/projetos/arduino"
arduino-cli sketch new LuzMiniPC
```

Edite `LuzMiniPC/LuzMiniPC.ino`:

```cpp
void setup() { pinMode(LED_BUILTIN, OUTPUT); }
void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  delay(500);
  digitalWrite(LED_BUILTIN, LOW);
  delay(500);
}
```

```bash
arduino-cli compile --fqbn arduino:avr:uno LuzMiniPC
```

**Verificação:** compilação termina sem erro e informa uso de memória do alvo. O LED embutido elimina necessidade de circuito externo neste primeiro teste.

## 3. Confirmar o caminho USB antes de gravar

No **Linux nativo**, conecte a placa e compare antes/depois:

```bash
lsusb
arduino-cli board list
ls -l /dev/ttyACM* /dev/ttyUSB* 2>/dev/null
```

No kernel, Uno original normalmente utiliza CDC ACM; compatíveis e ESP32 podem usar CH340, CP210x, FTDI ou USB nativo. Verifique `dmesg` com autorização adequada, o driver associado no sysfs e o nó criado. Só carregue um módulo se ele existir e corresponder ao kernel em execução. Acesso negado à porta deve ser tratado por grupo/udev compatível, sem `chmod 777`.

Em Debian, um nó pertencente ao grupo `dialout` pode exigir adicionar seu usuário a esse grupo e iniciar nova sessão; em Alpine, confira o grupo real com `ls -l`, pois os nomes podem diferir. Alterar grupos é operação administrativa; preserve regras existentes e não dê acesso indiscriminado a todos os dispositivos.

Se `board list` confirmou **a placa Uno no caminho `/dev/ttyACM0`**, por exemplo, e seu programa anterior pode ser substituído:

```bash
arduino-cli upload --port /dev/ttyACM0 --fqbn arduino:avr:uno LuzMiniPC
```

Use o caminho observado, não necessariamente esse exemplo. A gravação substitui o sketch anterior na placa; salve o fonte original. Aguarde conclusão e veja o LED alternar. Isso não grava o smartphone.

## 4. Preparar ESP32 sem presumir o modelo

O índice estável indicado atualmente pela Espressif é:

```bash
arduino-cli config add board_manager.additional_urls https://espressif.github.io/arduino-esp32/package_esp32_index.json
arduino-cli core update-index
arduino-cli core install esp32:esp32
arduino-cli board listall esp32
```

Confira a configuração existente e evite adicionar o mesmo URL repetidamente. Selecione o FQBN documentado para **sua placa**, consultando fabricante e chip. `esp32:esp32:esp32` é um alvo genérico para certas placas ESP32 originais; não o use automaticamente em C3, S3, C6 ou outra variante. Confira `board details --fqbn FQBN_CONFIRMADO` e opções de flash, USB e memória.

O pacote pode precisar de ferramentas que não têm builds para o host escolhido. A plataforma aceitar o chip-alvo não comprova suporte ao host Android/musl. Se a instalação falha por arquitetura, mantenha os logs e utilize um host de compilação suportado; não instale cores de mirrors sem assinatura/origem.

O botão BOOT e reset necessários à gravação dependem da placa e do circuito USB. Siga o manual da placa quando a negociação automática falhar. Não aplique procedimentos de curto em pinos de alimentação.

## Erros, rollback e testes finais

`Permission denied` na serial pede conferir grupo; timeout pede identificar porta, cabo, bootloader e chip; `Unknown` em `board list` pede identificação manual, não proíbe toda gravação; incompatibilidade de toolchain pede tratar o host. Nunca tente corrigir tudo com execução do IDE inteiro como root.

Faça backup de sketches, versões dos cores e configuração. `core uninstall PLATAFORMA` deve ser precedido por revisão de projetos dependentes. Restaurar a placa normalmente significa recompilar e gravar seu firmware anterior pelo método suportado; alguns dados de flash podem ser substituídos e precisam de estratégia específica.

**Teste final:** compilar sem placa, listar e abrir a porta correta, gravar um programa conhecido, confirmar LED e repetir após desconectar/reconectar USB. Para ESP32, confirme também monitor serial e configuração elétrica antes de ligar sensores. Compilação e upload devem ter evidências separadas no registro do aparelho.

## Fontes e estado

Revisão documental: **10/10/2026**. [Arduino CLI, instalação](https://docs.arduino.cc/arduino-cli/installation/), [primeiros passos](https://docs.arduino.cc/arduino-cli/getting-started/), [índices e arquiteturas de ferramentas](https://docs.arduino.cc/arduino-cli/package_index_json-specification/), [Espressif, instalação Arduino-ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html), [Uno R3](https://docs.arduino.cc/hardware/uno-rev3/). Compatibilidade serial e de cada toolchain no telefone requer teste local; nenhum sketch foi gravado durante esta revisão documental.
