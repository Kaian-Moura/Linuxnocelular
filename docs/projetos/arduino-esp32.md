---
title: Arduino Uno e ESP32 pelo mini PC
sidebar_position: 2
description: Separe compilação ARM64, drivers seriais e gravação de placas antes de preparar Arduino CLI.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, dificuldade e compatibilidade

**Dificuldade:** intermediária a avançada. **Resultado:** compilar um sketch para Uno R3 e, quando host USB/serial forem compatíveis, gravá-lo; preparar uma plataforma ESP32 correspondente à placa real. **Materiais:** hub/OTG funcional, cabo de dados, placa, alimentação estável, terminal e ferramentas de [desenvolvimento](./desenvolvimento.md).

Há três compatibilidades distintas: o programa Arduino CLI precisa executar no **telefone**; os compiladores auxiliares precisam ter builds para o **host**; o firmware compilado precisa ser para a **placa**. ARM64 do telefone não é a arquitetura AVR do Uno R3 nem necessariamente a arquitetura Xtensa/RISC-V do ESP32.

Arduino Uno R4, Nano, placas compatíveis e variantes ESP32 não são a mesma placa. O exemplo `arduino:avr:uno` abaixo é para **Uno R3 AVR ATmega328P**. Identifique modelo, chip e USB-UART antes de selecionar o FQBN, o nome completo que define o alvo de compilação.

## 0. Identificar materiais e escolher onde o programa executará

Um **sketch** é seu programa e os arquivos que o acompanham. A **placa** executa o firmware gravado. O **host** é a máquina que compila e envia esse firmware: pode ser o telefone com Linux ou o notebook. Neste primeiro teste, não ligue motores, relés ou sensores; mantenha somente a placa no USB e utilize seu LED ou a saída serial. Uma placa não é conectada diretamente aos GPIO internos do smartphone.

Anote a inscrição na placa e no módulo metálico do ESP32. Fotografe apenas a identificação necessária, sem divulgar etiquetas pessoais. Para Uno, confirme **R3/ATmega328P**, e não R4. Para ESP32, diferencie ESP32 original, C3, S3, C6 e outras famílias. O manual do fabricante da sua placa informa a interface USB, tensão e opções de memória. Um cabo que carrega um celular pode não transportar dados: utilize um cabo conhecido que já transfere arquivos.

Escolha um dos caminhos:

| Host de compilação/gravação | Preparação | Limite importante |
|---|---|---|
| Telefone Debian/Ubuntu ARM64 nativo | Arduino CLI Linux ARM64 e porta serial do kernel | Ainda precisa de toolchains ARM64 para o core |
| Telefone Alpine/postmarketOS | Pacote compatível ou build validado para sua libc | Download Linux não comprova execução de ferramentas glibc em musl |
| Android/Termux/PRoot | Avaliar apenas após verificar ferramentas e API USB | Um ambiente de terminal não fornece uma serial Linux automaticamente |
| Notebook Windows/macOS/Linux | CLI do sistema do notebook; placa ligada nele | O programa é desenvolvido para a placa; não roda por isso no telefone |

Se o hub está ligado ao telefone, o notebook não controla magicamente a placa pelo mesmo cabo. Para a alternativa pelo notebook, conecte a placa ao notebook. Se deseja armazenar os fontes no mini-PC, copie a pasta de projeto por [SFTP](arquivos-nas.md). Isso é uma alternativa explícita de desenvolvimento, não suporte USB nativo no Android.

Abra o terminal: **PowerShell** no Windows, **Aplicativos → Utilitários → Terminal** no macOS, ou Terminal/Console no Linux. Os comandos Arduino são comuns depois da instalação; comandos como `mkdir -p`, `nano` e `$HOME` no restante do guia são de uma shell Linux/macOS, salvo indicação de PowerShell. Não copie prompts ou as crases dos blocos.

:::warning Compilar não prova que USB funciona
PRoot não cria `/dev/ttyACM0` no Android. O Android pode disponibilizar USB pelo framework de aplicativos sem expor uma porta POSIX ao Termux. Root também não instala drivers ausentes. Um APK que grava placas é outro método, com API e manutenção próprias, não confirmação de compatibilidade do Arduino CLI.
:::

## 1. Obter uma versão que execute no host

A documentação oficial e releases consultadas oferecem **Arduino CLI 1.5.1 para Linux ARM64**. Use [a página de downloads](https://docs.arduino.cc/arduino-cli/installation/#download) ou [a release exata](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1). Baixe o arquivo da arquitetura correta e o checksum correspondente, confira integridade e extraia em uma pasta dedicada do usuário, sem sobrescrever um binário existente.

O artefato Linux ARM64 não é uma promessa de execução em Android/bionic ou Alpine/musl. Prefira um pacote construído para seu sistema; em Debian/Ubuntu ARM64, o ambiente glibc normalmente corresponde à família do download. Se houver erro de loader, investigue com `file CAMINHO_DO_BINARIO` e a documentação da release, ou compile o CLI pelo procedimento Go oficial. Não crie links de loader nem copie libc de outra distribuição.

### Linux ARM64: download e instalação em uma pasta do usuário

Este bloco é para **Debian/Ubuntu ARM64 com glibc**, no telefone ou numa máquina Linux ARM64. Verifique `uname -m` e `cat /etc/os-release`: deve ser `aarch64` e uma distribuição compatível. Prepare ferramentas por `sudo apt update` e `sudo apt install ca-certificates curl file tar nano`. Em Alpine/Termux, não aplique o APT; faça a verificação de compatibilidade descrita acima antes de escolher o artefato.

```bash
mkdir -p "$HOME/Downloads/arduino-cli-1.5.1" "$HOME/.local/bin"
cd "$HOME/Downloads/arduino-cli-1.5.1"
curl --fail --location --output arduino-cli_1.5.1_Linux_ARM64.tar.gz https://github.com/arduino/arduino-cli/releases/download/v1.5.1/arduino-cli_1.5.1_Linux_ARM64.tar.gz
curl --fail --location --output 1.5.1-checksums.txt https://github.com/arduino/arduino-cli/releases/download/v1.5.1/1.5.1-checksums.txt
sha256sum arduino-cli_1.5.1_Linux_ARM64.tar.gz
```

Abra `nano 1.5.1-checksums.txt`, procure o nome exato do arquivo e compare os 64 caracteres do hash. Os links correspondem aos assets da release oficial consultada; registrar checksum e versão permite detectar downloads truncados e reproduzir a escolha. Um checksum baixado da mesma origem não é uma prova independente de autenticidade. `curl: (22)` significa resposta HTTP de erro: não extraia uma página de erro como se fosse o programa.

Se o hash coincidir, extraia num diretório novo e inspecione:

```bash
mkdir extraido
tar -xzf arduino-cli_1.5.1_Linux_ARM64.tar.gz -C extraido
file extraido/arduino-cli
./extraido/arduino-cli version
```

Deve aparecer a versão 1.5.1, sem erro de arquitetura/loader. Antes da próxima linha, `ls -l "$HOME/.local/bin/arduino-cli"` deve informar que esse destino não existe. Se já existe, preserve-o e compare versões; não sobrescreva uma instalação em uso.

```bash
install -m 0755 extraido/arduino-cli "$HOME/.local/bin/arduino-cli"
export PATH="$HOME/.local/bin:$PATH"
arduino-cli version
```

`install` copia o binário com permissão de execução; `export` altera somente o PATH desta shell. Para uso persistente, preserve sua configuração de shell e acrescente a mesma linha de PATH ao arquivo de inicialização aplicável, por exemplo `~/.profile` numa shell que o lê. Reabra a shell e teste novamente; não modifique arquivos globais. É sempre possível utilizar o caminho completo, sem editar o PATH.

### Windows: instalar a edição do notebook

Na [release 1.5.1](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1), escolha **Windows_64bit.msi** para Windows x64 compatível. Confira as propriedades/assinatura oferecidas, execute o instalador, revise as telas e conclua. Reabra PowerShell e teste `arduino-cli version`. Se não for encontrado, procure a pasta onde instalou e use o caminho completo; não baixe um pacote Linux. Windows ARM64 precisa de um artefato/execução compatível documentados, não de uma promessa baseada no telefone ser ARM64.

Uma instalação ZIP é alternativa sem instalador: baixe `arduino-cli_1.5.1_Windows_64bit.zip` e o manifesto de checksums. No PowerShell, `Get-FileHash "$env:USERPROFILE\Downloads\arduino-cli_1.5.1_Windows_64bit.zip" -Algorithm SHA256` calcula o hash. Compare-o ao manifesto. No Explorador, **Extrair tudo** para uma pasta nova dentro de seu perfil, em `Tools\arduino-cli`; ali deve existir `arduino-cli.exe`. Se escolheu exatamente essa pasta, no PowerShell:

```powershell
$arduinoCliFolder = Join-Path $env:USERPROFILE 'Tools\arduino-cli'
Test-Path (Join-Path $arduinoCliFolder 'arduino-cli.exe')
$env:Path = "$arduinoCliFolder;$env:Path"
arduino-cli version
```

`Test-Path` precisa retornar `True` antes das últimas linhas. Esse PATH vale só na janela atual. Para persistir, procure **Editar as variáveis de ambiente para sua conta**, abra **Path** nas variáveis do usuário, escolha **Novo** e acrescente **o diretório real da ferramenta** sem substituir as entradas existentes; confirme as telas e reabra PowerShell. Se não quer editar o PATH, invoque `& "$arduinoCliFolder\arduino-cli.exe" version`; o operador `&` executa um caminho entre aspas. Ajuste a variável quando escolheu outra pasta. Não adicione Downloads inteira ao PATH.

### macOS e notebook Linux x86_64

Na mesma release, macOS Apple Silicon usa **macOS_ARM64**, Intel usa **macOS_64bit**, e notebook Linux x86_64 usa **Linux_64bit**. Baixe pelo navegador, confira o checksum com `shasum -a 256 ARQUIVO` no Mac ou `sha256sum ARQUIVO` no Linux. Extraia numa pasta nova, execute o binário local para testar e copie-o para `~/.local/bin` somente se o destino estiver livre. No Mac, consulte o manual do projeto e a autorização normal do sistema se Gatekeeper bloquear; não desative a proteção global. A instalação via Homebrew é oferecida oficialmente, mas exige primeiro um Homebrew instalado e administrado corretamente.

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

O `config init` imprime onde criou `arduino-cli.yaml`. Antes de editar futuramente, copie esse arquivo para um backup. `core update-index` baixa os catálogos; `core install` baixa a plataforma e ferramentas; `core list` deve mostrar `arduino:avr` instalado. Se a instalação falhar, guarde a mensagem inteira e não prossiga como se o core tivesse sido instalado. Erro de certificado pede verificar data, certificados e rede, sem desativar TLS. Para reproduzir um core, registre a versão e consulte `core install --help` para a forma `arduino:avr@VERSAO` disponível na sua edição.

Crie um sketch novo:

```bash
mkdir -p "$HOME/projetos/arduino"
cd "$HOME/projetos/arduino"
arduino-cli sketch new LuzMiniPC
```

Edite `LuzMiniPC/LuzMiniPC.ino`:

No Linux/macOS com nano, execute `nano LuzMiniPC/LuzMiniPC.ino`, apague somente o conteúdo inicial desse sketch novo e cole o programa. Salve por **Ctrl+O → Enter** e saia por **Ctrl+X**. No Windows, crie a pasta de trabalho em Documentos pelo Explorador, abra PowerShell nela com `cd "$env:USERPROFILE\Documents\arduino"` depois de criá-la, execute `arduino-cli sketch new LuzMiniPC` e use `notepad LuzMiniPC\LuzMiniPC.ino`. Confirme que o nome termina em `.ino`, não `.ino.txt`. O nome principal do sketch deve corresponder ao nome da pasta.

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
arduino-cli compile --fqbn arduino:avr:uno --output-dir build-uno LuzMiniPC
```

**Verificação:** compilação termina sem erro e informa uso de memória do alvo. O LED embutido elimina necessidade de circuito externo neste primeiro teste.

O diretório `build-uno` guarda explicitamente os artefatos usados no upload. Não é necessário ligar a placa para compilar. Se alterar o sketch, compile de novo: upload não garante compilar o fonte alterado. Não misture a pasta de saída AVR com a de ESP32.

## 3. Confirmar o caminho USB antes de gravar

No **Linux nativo**, conecte a placa e compare antes/depois:

```bash
lsusb
arduino-cli board list
ls -l /dev/ttyACM* /dev/ttyUSB* 2>/dev/null
```

No kernel, Uno original normalmente utiliza CDC ACM; compatíveis e ESP32 podem usar CH340, CP210x, FTDI ou USB nativo. Verifique `dmesg` com autorização adequada, o driver associado no sysfs e o nó criado. Só carregue um módulo se ele existir e corresponder ao kernel em execução. Acesso negado à porta deve ser tratado por grupo/udev compatível, sem `chmod 777`.

Se `lsusb` não existe, instale `usbutils` pelo gerenciador do Linux nativo: `sudo apt install usbutils` ou `sudo apk add usbutils`. Liste antes, conecte a placa e liste outra vez. A nova linha indica enumeração; `sudo dmesg | tail -n 40` pode mostrar `ttyACM0` ou `ttyUSB0`, quando o kernel permite esses logs. Se a placa nem enumera, teste cabo de dados e alimentação antes de mexer no Arduino CLI. Veja a [cadeia de diagnóstico USB](../hardware/teclados-usb.md), adaptando o driver de input para serial.

Em Debian, um nó pertencente ao grupo `dialout` pode exigir adicionar seu usuário a esse grupo e iniciar nova sessão; em Alpine, confira o grupo real com `ls -l`, pois os nomes podem diferir. Alterar grupos é operação administrativa; preserve regras existentes e não dê acesso indiscriminado a todos os dispositivos.

Somente se `ls -l /dev/ttyACM0` confirmar grupo **dialout** e esse for o nó da sua placa, no Debian/Ubuntu use `sudo usermod -aG dialout "$(id -un)"`. Em Alpine com `addgroup` BusyBox e grupo confirmado, `sudo addgroup "$(id -un)" dialout` acrescenta a conta ao grupo. A opção `-a` do usermod preserva outros grupos. Saia e entre novamente na sessão; um terminal antigo não recebe automaticamente os grupos novos. Confirme com `id`. Num port administrado por `doas`, use seu mecanismo configurado em vez de instalar `sudo` por tentativa.

No Windows, abra **Gerenciador de Dispositivos → Portas (COM e LPT)** e compare antes/depois. No macOS, compare `ls /dev/cu.*` antes/depois. `arduino-cli board list` deve mostrar a porta nesses sistemas também. Quando faltar um driver, identifique o chip USB-UART pelo manual da placa ou hardware ID: CP210x utiliza o [driver Silicon Labs](https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers); a [documentação Espressif de serial](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/establish-serial-connection.html) aponta fontes para chips comuns. Use o fornecedor correto, versão do seu OS e instalador assinado disponível. No Linux, esses chips normalmente usam drivers do kernel; instalar um driver Windows não cria um módulo Linux. Não instale pacotes de driver de um site agregador.

Se `board list` confirmou **a placa Uno no caminho `/dev/ttyACM0`**, por exemplo, e seu programa anterior pode ser substituído:

```bash
arduino-cli upload --port /dev/ttyACM0 --fqbn arduino:avr:uno --input-dir build-uno LuzMiniPC
```

Use o caminho observado, não necessariamente esse exemplo. A gravação substitui o sketch anterior na placa; salve o fonte original. Aguarde conclusão e veja o LED alternar. Isso não grava o smartphone.

No Windows, substitua `/dev/ttyACM0` pela porta observada, como `COM5`; no Mac, pelo caminho completo observado `/dev/cu.usbmodem...`. Feche monitores seriais e outros IDEs antes de gravar, pois podem manter a porta ocupada. Depois de upload concluído, o LED **L** do Uno R3 deve alternar a cada meio segundo. Um LED de alimentação aceso sozinho não comprova que a gravação passou.

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

### Primeiro programa ESP32 verificável por serial

Para não presumir em qual GPIO fica um LED de cada placa, crie `arduino-cli sketch new ESP32MiniPC` dentro da pasta de projetos. Edite `ESP32MiniPC/ESP32MiniPC.ino` pelo mesmo procedimento nano/Bloco de Notas e salve:

```cpp
void setup() {
  Serial.begin(115200);
}
void loop() {
  Serial.println("ESP32 funcionando");
  delay(1000);
}
```

Se você confirmou **um ESP32 original numa placa DevKit com UART** para a qual o fabricante indica o perfil genérico `esp32:esp32:esp32`, o exemplo é:

```bash
arduino-cli board details --fqbn esp32:esp32:esp32
arduino-cli compile --fqbn esp32:esp32:esp32 --output-dir build-esp32 ESP32MiniPC
```

Pare se esse não é o perfil da sua placa: substitua o FQBN pelo encontrado em `board listall` e validado no manual. ESP32 com USB nativo pode requerer selecionar a opção de USB CDC apropriada; confira as opções exibidas por `board details` antes de compilar. Não deduza memória PSRAM ou tamanho de flash pela aparência da placa.

Se o caminho confirmado da placa for `/dev/ttyUSB0`, a compilação acima tiver passado e o firmware anterior puder ser substituído:

```bash
arduino-cli upload --port /dev/ttyUSB0 --fqbn esp32:esp32:esp32 --input-dir build-esp32 ESP32MiniPC
arduino-cli monitor --port /dev/ttyUSB0 --config baudrate=115200
```

Troque tanto o FQBN quanto a porta quando necessário, como no Uno. O monitor deve mostrar a frase a cada segundo; finalize-o com Ctrl+C antes do próximo upload. Texto ilegível pede conferir **115200** no sketch e no monitor; silêncio pede revisar porta, modo USB e reset. Para certas placas com circuito de boot manual, o manual exige segurar BOOT durante a entrada no modo de gravação e soltá-lo no momento indicado. Não prescrevemos essa sequência a toda família: auto-reset, GPIO de boot e conectores mudam entre modelos. O [manual esptool para ESP32 original](https://docs.espressif.com/projects/esptool/en/latest/esp32/advanced-topics/boot-mode-selection.html) explica a negociação e não deve ser aplicado cegamente a outro chip.

## Erros, rollback e testes finais

`Permission denied` na serial pede conferir grupo; timeout pede identificar porta, cabo, bootloader e chip; `Unknown` em `board list` pede identificação manual, não proíbe toda gravação; incompatibilidade de toolchain pede tratar o host. Nunca tente corrigir tudo com execução do IDE inteiro como root.

Faça backup de sketches, versões dos cores e configuração. `core uninstall PLATAFORMA` deve ser precedido por revisão de projetos dependentes. Restaurar a placa normalmente significa recompilar e gravar seu firmware anterior pelo método suportado; alguns dados de flash podem ser substituídos e precisam de estratégia específica.

**Teste final:** compilar sem placa, listar e abrir a porta correta, gravar um programa conhecido, confirmar LED e repetir após desconectar/reconectar USB. Para ESP32, confirme também monitor serial e configuração elétrica antes de ligar sensores. Compilação e upload devem ter evidências separadas no registro do aparelho.

## Fontes e estado

Revisão documental: **11/10/2026**. [Arduino CLI, instalação](https://docs.arduino.cc/arduino-cli/installation/), [assets 1.5.1](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1), [primeiros passos](https://docs.arduino.cc/arduino-cli/getting-started/), [índices e arquiteturas](https://docs.arduino.cc/arduino-cli/package_index_json-specification/), [código de compile 1.5.1](https://github.com/arduino/arduino-cli/blob/v1.5.1/internal/cli/compile/compile.go), [upload 1.5.1](https://github.com/arduino/arduino-cli/blob/v1.5.1/internal/cli/upload/upload.go), [monitor 1.5.1](https://github.com/arduino/arduino-cli/blob/v1.5.1/internal/cli/monitor/monitor.go), [permissões Linux](https://support.arduino.cc/hc/en-us/articles/360016495679-Fix-port-access-on-Linux), [Espressif, instalação Arduino-ESP32](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html), [Uno R3](https://docs.arduino.cc/hardware/uno-rev3/). Nomes dos assets e flags foram conferidos em fontes oficiais; compatibilidade serial, libc e cada toolchain no telefone requerem teste local. Nenhum pacote foi instalado, executável executado ou sketch gravado nesta revisão.
