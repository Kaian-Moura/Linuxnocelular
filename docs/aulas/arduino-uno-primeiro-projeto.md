---
title: Arduino Uno R3 — seu primeiro programa, do zero
description: Identifique o host e a placa, instale Arduino CLI, escreva um Blink, compile e grave somente na porta serial confirmada.
sidebar_position: 30
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## O que você vai construir

Você escreverá um programa que acende e apaga o LED integrado de um **Arduino Uno R3 com ATmega328P**. O computador prepara o programa; o Uno o executa depois da gravação. Pode ser um notebook ou um smartphone com Linux nativo compatível. Não é preciso instalar Linux no Uno, desbloquear o telefone ou conectar fios aos pinos para este primeiro projeto.

**Dificuldade:** iniciante na programação; intermediária quando o host é um telefone. Reserve uma sessão para instalação e compilação, e outra para USB e teste físico. A aula foi revisada documentalmente em **11/10/2026**, e o sketch foi compilado num notebook Linux x86_64 com as versões indicadas. Não houve gravação ou ensaio de placa nessa revisão; saídas ilustrativas não são resultados de hardware.

Esta aula é para **Uno R3**, incluindo uma placa compatível cuja documentação confirme esse alvo. **Uno R4 Minima/WiFi, Uno Q, Nano, Mega e placas ESP32 precisam de outra seleção.** O nome Uno não identifica sozinho o microcontrolador. Confira a inscrição da placa e compare com a [página oficial do Uno R3](https://docs.arduino.cc/hardware/uno-rev3/).

## 1. Materiais, vocabulário e ponto de partida

Prepare um Uno R3, um cabo USB **de dados** adequado ao conector da sua placa, Internet para baixar ferramentas e um computador suportado. O Uno R3 oficial tem USB tipo B; placas compatíveis podem ter outro conector e outro chip USB. Não conecte motores, relés, sensores, fontes nos pinos ou alimentação pelo conector redondo neste exercício. Use somente o USB para alimentação e comunicação.

Se o computador for o telefone, acrescente hub/OTG com host USB já validado. Um hub funcionando com mouse não comprova suporte a uma placa serial. Antes de colocar o Uno, faça a [montagem e os testes progressivos](../hardware/montagem-validada.md). A placa não deve ocupar uma porta identificada apenas como entrada PD de energia.

Estes nomes aparecerão nos passos:

| Termo | Significado nesta aula |
|---|---|
| Host | Máquina que executa Arduino CLI e envia o programa: telefone **ou** notebook |
| Sketch | Pasta do projeto Arduino e seu arquivo principal `.ino` |
| Core | Pacote que descreve uma família de placas e traz receitas de compilação |
| Toolchain | Compilador e ferramentas auxiliares que executam no host |
| FQBN | Identificador completo da placa; aqui, `arduino:avr:uno` |
| Porta serial | Canal de comunicação do host com a placa, como COM ou `/dev/ttyACM…` |

São três verificações independentes: **Arduino CLI executa no host → o compilador AVR executa no host → a porta USB permite gravar o Uno**. O firmware final é AVR, embora o telefone possa ser ARM64. Uma janela Termux ou Debian por PRoot não transforma o kernel Android em um kernel Linux desktop nem cria uma porta serial ausente. Consulte [Arduino no mini-PC](../projetos/arduino-esp32.md) para esses limites.

Abra **PowerShell** pelo menu Iniciar no Windows; **Terminal**, em Aplicativos → Utilitários, no macOS; **Terminal/Console** no Linux. Digite os comandos no host escolhido. Não execute uma metade no notebook e a outra no telefone sem copiar os arquivos e preparar ambos. Para terminal, pastas e editor, há a [primeira aula de terminal](../comece-aqui/terminal-primeiros-passos.md).

## 2. Identificar o sistema antes do download

No Linux, execute:

```sh
uname -m
cat /etc/os-release
```

`x86_64` indica o download Linux 64bit; `aarch64` indica Linux ARM64. A distribuição também importa: os toolchains oficiais podem depender de **glibc**. Um arquivo Linux ARM64 não confirma execução em **Alpine/postmarketOS com musl** nem em **Termux com Bionic**. Para esses ambientes, pare antes da instalação dos binários e procure pacotes/compilações documentados para o host; a alternativa desta aula é usar o notebook. Não tente resolver um loader ausente copiando bibliotecas de outro sistema.

No macOS, `uname -m` normalmente mostra `arm64` em Apple Silicon ou `x86_64` em Intel. No Windows, abra **Configurações → Sistema → Sobre → Tipo de sistema**. O download Windows abaixo é x64; não constitui garantia de execução em Windows ARM. Um sistema de 32 bits precisa de uma versão e toolchains que documentem esse suporte.

**Checkpoint:** anote sistema, arquitetura e local da placa. “Telefone ARM64, Alpine/musl” é uma informação mais útil que “Linux”. Se ainda não sabe distinguir os ambientes, leia [Linux no computador](../comece-aqui/linux-no-computador.md) antes de continuar.

## 3. Baixar e instalar Arduino CLI no host

Vamos usar a versão **1.5.1**, escolhida e conferida na [release oficial](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1). Não significa que continuará sendo a versão mais recente. Baixe também `1.5.1-checksums.txt`: o hash permite detectar um arquivo alterado ou incompleto, mas um manifesto da mesma origem não é uma certificação independente de autenticidade. A [documentação de instalação](https://docs.arduino.cc/arduino-cli/installation/) informa os sistemas e métodos disponíveis.

### Windows x64: ZIP sem privilégios administrativos

No navegador, abra a release e, em **Assets**, baixe `arduino-cli_1.5.1_Windows_64bit.zip` e `1.5.1-checksums.txt`. Salve ambos em Downloads do seu usuário. Se o navegador pergunta onde salvar, escolha essa pasta explicitamente. No PowerShell:

```powershell
Get-FileHash "$env:USERPROFILE\Downloads\arduino-cli_1.5.1_Windows_64bit.zip" -Algorithm SHA256
notepad "$env:USERPROFILE\Downloads\1.5.1-checksums.txt"
```

Compare os 64 caracteres do hash com a linha do **mesmo nome de arquivo**. Maiúsculas e minúsculas não mudam o valor hexadecimal. Se diferirem, não extraia nem execute; descarte apenas esse download e obtenha-o novamente da release.

No Explorador, crie a pasta `Tools\arduino-cli-1.5.1` dentro do seu perfil. Clique com o botão direito no ZIP → **Extrair tudo** e indique essa pasta. Ela deve conter `arduino-cli.exe`. Se houver uma subpasta adicional, use o diretório que realmente contém o executável:

```powershell
$arduinoCliFolder = Join-Path $env:USERPROFILE 'Tools\arduino-cli-1.5.1'
Test-Path (Join-Path $arduinoCliFolder 'arduino-cli.exe')
$env:Path = "$arduinoCliFolder;$env:Path"
arduino-cli version
```

Só avance se `Test-Path` retornar `True` e a versão aparecer. A alteração de PATH vale nesta janela. Para persistir, procure **Editar as variáveis de ambiente para sua conta**, abra **Path** nas variáveis **do usuário**, clique em **Novo** e acrescente o caminho real dessa pasta. Confirme e reabra PowerShell. Preserve todas as entradas existentes. Não acrescente Downloads inteira ao PATH.

Se não quiser alterar PATH, pode executar `& "$arduinoCliFolder\arduino-cli.exe" version`, e substituir `arduino-cli` pelo mesmo caminho nas próximas linhas. O `&` executa um caminho entre aspas. O MSI oficial é uma alternativa; ZIP e MSI não precisam ser instalados simultaneamente.

### Debian/Ubuntu Linux com glibc: x86_64 ou ARM64

Este bloco usa APT **somente** num Debian/Ubuntu compatível. Se `sudo` não existir ou a conta não administrar o sistema, utilize a preparação autorizada da sua distribuição; não invente uma senha nem faça toda a aula como root.

```sh
sudo apt update
sudo apt install ca-certificates curl file tar nano
mkdir -p "$HOME/Downloads/arduino-cli-1.5.1" "$HOME/.local/bin"
cd "$HOME/Downloads/arduino-cli-1.5.1"
```

Escolha **uma** destas definições conforme o `uname -m`; não copie ambas:

```sh
# Linux x86_64:
arduinoCliArquivo=arduino-cli_1.5.1_Linux_64bit.tar.gz
```

```sh
# Linux aarch64:
arduinoCliArquivo=arduino-cli_1.5.1_Linux_ARM64.tar.gz
```

Agora baixe o arquivo escolhido e o manifesto:

```sh
curl --fail --location --output "$arduinoCliArquivo" "https://github.com/arduino/arduino-cli/releases/download/v1.5.1/$arduinoCliArquivo"
curl --fail --location --output 1.5.1-checksums.txt https://github.com/arduino/arduino-cli/releases/download/v1.5.1/1.5.1-checksums.txt
sha256sum "$arduinoCliArquivo"
nano 1.5.1-checksums.txt
```

Confira a linha correta no manifesto; saia do editor com **Ctrl+X**, sem alterá-lo. `curl --fail` recusa respostas HTTP de erro. Um erro 404 é download indisponível, não licença para usar um arquivo de origem desconhecida. Depois do hash coincidir:

```sh
mkdir extraido
tar -xzf "$arduinoCliArquivo" -C extraido
file extraido/arduino-cli
./extraido/arduino-cli version
```

`mkdir extraido` deve criar uma pasta nova. Se ela já existe de uma tentativa anterior, inspecione-a e escolha outra pasta em vez de misturar versões. `file` verifica o formato/arquitetura; `version` testa execução, não a compatibilidade futura do compilador AVR.

Antes de copiar, consulte `ls -l "$HOME/.local/bin/arduino-cli"`. Se já existe uma ferramenta nesse destino, preserve-a; mantenha a nova versão na pasta extraída e use seu caminho completo. Se o destino não existe:

```sh
install -m 0755 extraido/arduino-cli "$HOME/.local/bin/arduino-cli"
export PATH="$HOME/.local/bin:$PATH"
arduino-cli version
```

O PATH vale só para esta shell. Em outra janela, execute novamente `export PATH="$HOME/.local/bin:$PATH"` ou use `$HOME/.local/bin/arduino-cli`. Para persistência, acrescente essa linha ao arquivo de inicialização **da shell que você realmente utiliza**, após backup, como explicado na aula de terminal. Não sobrescreva `.profile` ou arquivos globais.

### macOS: arquivo da arquitetura correta

Na release, baixe `arduino-cli_1.5.1_macOS_ARM64.tar.gz` para Apple Silicon ou `arduino-cli_1.5.1_macOS_64bit.tar.gz` para Intel, junto do manifesto. Salve em Downloads. No Terminal, entre nessa pasta:

```sh
cd "$HOME/Downloads"
```

Defina `arduinoCliArquivo` com **o nome exato do download**, por exemplo:

```sh
# Apple Silicon; no Intel substitua ARM64 por 64bit:
arduinoCliArquivo=arduino-cli_1.5.1_macOS_ARM64.tar.gz
shasum -a 256 "$arduinoCliArquivo"
nano 1.5.1-checksums.txt
```

Compare o hash; depois crie `mkdir arduino-cli-1.5.1-extraido` e extraia com `tar -xzf "$arduinoCliArquivo" -C arduino-cli-1.5.1-extraido`. Teste `./arduino-cli-1.5.1-extraido/arduino-cli version`. Crie `mkdir -p "$HOME/.local/bin"`, preserve um executável existente e, com destino livre, copie com `install -m 0755 arduino-cli-1.5.1-extraido/arduino-cli "$HOME/.local/bin/arduino-cli"`. Ative o mesmo PATH mostrado no Linux.

Use a autorização normal do macOS se ele bloquear a abertura; confira origem e consulte o suporte Apple. Não desative Gatekeeper globalmente. Na revisão dos índices, os auxiliares AVR ainda incluíam binários Intel para Mac, mesmo quando o CLI é ARM64. Pode ser necessário **Rosetta num macOS que ainda a suporte**; siga a [orientação da Apple](https://support.apple.com/en-us/102527). Isso não deve ser prometido para futuras versões do sistema. Se o auxiliar falhar por arquitetura, registre o nome da ferramenta e escolha um host suportado.

## 4. Instalar o core certo, antes de conectar a placa

Com `arduino-cli version` funcionando, execute no mesmo terminal:

```sh
arduino-cli config init
arduino-cli core update-index
arduino-cli core install arduino:avr@1.8.8
arduino-cli core list
arduino-cli board details --fqbn arduino:avr:uno
```

`config init` cria a configuração do usuário. Se informar que ela já existe, mantenha-a e continue; não use `--overwrite` para substituir índices ou pastas existentes. `update-index` baixa o catálogo. `core install` instala a versão **1.8.8** do Arduino AVR Boards, presente no [índice oficial consultado](https://downloads.arduino.cc/packages/package_index.json). `core list` deve mostrar `arduino:avr`, e `board details` deve descrever Arduino Uno.

Esses downloads incluem programas que serão executados no host. O índice possui auxiliares Linux ARM64, mas isso não garante a libc de qualquer sistema. Se houver erro TLS, confira data/hora e certificados. Se houver `exec format error` ou loader ausente, identifique o auxiliar que falhou; reinstalar o mesmo pacote repetidamente não troca sua arquitetura.

**Checkpoint:** guarde a saída de `version`, `core list` e o FQBN num arquivo de anotações. Ainda não há prova de USB nem foi alterado o Uno. A configuração não exige adicionar repositórios aleatórios ou executar Arduino CLI com `sudo`.

## 5. Criar pasta e escrever o programa

No Linux/macOS:

```sh
mkdir -p "$HOME/projetos/arduino"
cd "$HOME/projetos/arduino"
arduino-cli sketch new UnoPrimeiro
nano UnoPrimeiro/UnoPrimeiro.ino
```

No Windows, use este bloco **em vez** do anterior:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\projetos\arduino"
Set-Location "$env:USERPROFILE\projetos\arduino"
arduino-cli sketch new UnoPrimeiro
notepad .\UnoPrimeiro\UnoPrimeiro.ino
```

Se o sketch já existir, abra-o sem repetir `sketch new`; preserve um projeto antigo antes de substituí-lo. Apague somente o texto inicial **desse novo arquivo** e coloque:

```cpp
void setup() {
  pinMode(LED_BUILTIN, OUTPUT);
  Serial.begin(9600);
}

void loop() {
  digitalWrite(LED_BUILTIN, HIGH);
  Serial.println("LED ligado");
  delay(1000);
  digitalWrite(LED_BUILTIN, LOW);
  Serial.println("LED desligado");
  delay(1000);
}
```

`setup()` roda uma vez ao iniciar; `loop()` se repete. `pinMode` configura o LED como saída. `HIGH`/`LOW` escolhem o estado, e `delay(1000)` espera um segundo. `Serial.begin(9600)` estabelece a velocidade da saída textual. A constante `LED_BUILTIN` é definida para o Uno R3 pelo core; não é uma autorização para adivinhar o LED de qualquer placa. Veja o [exemplo Blink oficial](https://github.com/arduino/arduino-examples/blob/main/examples/01.Basics/Blink/Blink.ino).

No nano: **Ctrl+O**, **Enter**, **Ctrl+X**. No Bloco de Notas: **Ctrl+S** e feche. Como você abriu um arquivo `.ino` já criado, mantenha esse nome; não salve como `.ino.txt`. Confira com `ls UnoPrimeiro` ou `Get-ChildItem .\UnoPrimeiro`. A pasta e o arquivo principal devem chamar-se `UnoPrimeiro` e `UnoPrimeiro.ino`.

## 6. Compilar sem gravar

Mantenha o terminal na pasta `projetos/arduino`. O comando abaixo funciona após a instalação em qualquer um dos hosts suportados:

```sh
arduino-cli compile --fqbn arduino:avr:uno --warnings all --output-dir ./build/UnoPrimeiro ./UnoPrimeiro
```

O FQBN seleciona o alvo; `--warnings all` mostra avisos; `--output-dir` guarda os artefatos. **Não usamos `--upload`**. Uma compilação bem-sucedida pode terminar com um resumo de uso de memória, por exemplo:

```text
Sketch uses ... bytes (...) of program storage space.
Global variables use ... bytes (...) of dynamic memory.
```

Os números dependem do core e do código. Confira os arquivos em `build/UnoPrimeiro`. Se aparecer `expected ';'`, o compilador geralmente indica a linha do erro; confira também a linha anterior, salve e compile novamente. Se disser `platform not installed`, volte ao core. `No such file or directory` pode indicar pasta errada: use `pwd`/`Get-Location`, não crie um novo projeto ao acaso.

**Checkpoint:** o compilador executou no host e produziu firmware para o Uno. Isso ainda não comprova que a placa está conectada. A separação entre [compilar](https://arduino.github.io/arduino-cli/1.5/commands/arduino-cli_compile/) e [gravar](https://arduino.github.io/arduino-cli/1.5/commands/arduino-cli_upload/) evita confundir falhas do código com falhas USB.

## 7. Identificar a porta e liberar acesso corretamente

Execute `arduino-cli board list` com a placa desconectada, conecte **somente o Uno** ao host escolhido e repita. Um LED aceso comprova energia; a nova porta comprova outra etapa. O programa pode reconhecer a porta sem reconhecer automaticamente o modelo, especialmente num clone. Nesse caso, use a identificação física confirmada para o FQBN.

No Windows, abra **Gerenciador de Dispositivos → Portas (COM e LPT)** e veja qual porta apareceu. Se aparecer dispositivo desconhecido, leia suas propriedades/ID de hardware e obtenha o driver **do fabricante do chip ou da placa**. Não instale um pacote genérico de “todos os drivers”. No Mac, compare `ls /dev/cu.*` antes e depois. Não escolha uma porta Bluetooth porque ela também aparece na lista.

No Debian/Ubuntu Linux, prepare `lsusb` com `sudo apt install usbutils` e consulte:

```sh
lsusb
lsusb -t
ls -l /dev/ttyACM* /dev/ttyUSB*
id
```

Um `ls` pode informar que um dos padrões não existe enquanto o outro existe; leia os resultados. No host Linux, `/dev/ttyACM0` é apenas um exemplo possível. Se USB aparece mas nenhuma porta serial é criada, consulte `sudo dmesg | tail -n 60`: o kernel pode não ter o driver adequado. Em telefone, esse problema pode ser do port; criar um arquivo com esse nome não cria o driver.

Se a porta real pertencer ao grupo `dialout` e sua conta não estiver nele, num Debian/Ubuntu administrado por você use `sudo usermod -aG dialout "$USER"`, encerre a sessão e entre novamente. Confira `id` e as permissões reais. Outro sistema pode usar outro grupo/método: siga [acesso serial no Linux](https://support.arduino.cc/hc/en-us/articles/360016495679-Fix-port-access-on-Linux). Não aplique `chmod 777`, não substitua grupos existentes e não execute toda a IDE como root.

## 8. Gravar e observar o resultado físico

O upload substituirá o programa atualmente no Uno. Se ele pertence a outro projeto, obtenha e guarde os fontes desse projeto antes de continuar; normalmente não se recupera o fonte original simplesmente lendo a flash. Feche qualquer monitor serial que esteja usando a porta.

Substitua **somente** a porta do exemplo pela porta que você confirmou. No Linux, se ela realmente for `/dev/ttyACM0`:

```sh
arduino-cli upload --fqbn arduino:avr:uno --port /dev/ttyACM0 --input-dir ./build/UnoPrimeiro ./UnoPrimeiro
```

No Windows, se realmente for COM5, use a mesma linha com `--port COM5`. No Mac, use o caminho `/dev/cu.…` exato da lista. Não escolha automaticamente a primeira porta: pode ser outro equipamento. `upload` utiliza os artefatos da compilação anterior e **não compila novamente**.

Após sucesso, observe o LED marcado **L**, não apenas o indicador de alimentação. Ele deve ficar aproximadamente um segundo aceso e um segundo apagado. Para acompanhar o texto no exemplo Linux:

```sh
arduino-cli monitor --port /dev/ttyACM0 --config baudrate=9600
```

Use a mesma porta real de antes. Devem alternar `LED ligado` e `LED desligado`. **Ctrl+C** encerra o monitor, mas não apaga o programa: o Uno continua executando enquanto alimentado. Abrir a serial pode reiniciar o Uno; espere alguns segundos.

## 9. Erros, retomada e exercícios

| Sintoma | Próxima ação segura | O que não concluir |
|---|---|---|
| CLI não encontrado | Testar caminho completo e PATH da janela atual | Não prova falta do core |
| Compila, mas não aparece porta | Comparar USB antes/depois, cabo de dados, host e driver | Não é erro no Blink |
| `Permission denied` | Ver permissões/grupo da porta, reentrar após ajuste autorizado | Não exige root permanente |
| Porta ocupada | Fechar seu monitor serial/IDE e tentar novamente | Não matar processos desconhecidos |
| `avrdude` sem comunicação | Confirmar R3, porta e cabo; consultar [erros oficiais](https://support.arduino.cc/hc/en-us/articles/4401874331410--Error-avrdude-when-uploading) | Não prova bootloader apagado |
| LED de alimentação aceso, L sem mudança | Confirmar upload concluído, placa correta e resumo serial | Energia não prova gravação |

Para retomar, abra o terminal, confirme `arduino-cli version`, entre na pasta e abra o `.ino`. Copie a pasta `UnoPrimeiro` para seu backup; não guarde apenas o `.hex`. A pasta `build` é regenerável. Se editar o programa, compile **antes** de fazer novo upload, pois a gravação usa o binário anterior até você recompilar.

Faça um exercício: mude os dois atrasos de 1000 para 500, salve, compile e grave. O período deve cair pela metade. Depois restaure 1000. Registre versão do CLI/core, FQBN, sistema do host, chip USB identificado, porta e observação física. Isso transforma “funcionou” em uma experiência reproduzível.

Para reverter, grave o projeto anterior com sua placa/porta corretas. Desconectar a alimentação não apaga o firmware. Não use `burn-bootloader`, comandos de flash do telefone ou mudanças de kernel para desfazer este Blink. Se a ferramenta antiga foi preservada, pode voltar a invocá-la pelo caminho original, sem apagar configurações do usuário.

**Resultado final verificável:** fonte salvo, compilação bem-sucedida, upload para a placa identificada, LED L alternando e texto serial correspondente. Um resultado só de compilação deve ser registrado como tal. Continue para [ESP32, com placa e circuito explicitamente identificados](esp32-primeiro-projeto.md).

## Fontes e limites da verificação

**Compilação executada em 11/10/2026:** o bloco original `.ino` desta página foi extraído sem alterações e compilado num notebook Fedora Linux 44 x86_64, glibc 2.43, com Arduino CLI **1.5.1**, core **arduino:avr 1.8.8**, compilador **avr-g++ 7.3.0** e FQBN **`arduino:avr:uno`**. O download Linux 64bit foi conferido pelo SHA-256 do manifesto oficial. Configuração, dados, downloads, cache e construção ficaram num diretório descartável isolado; scripts de pós-instalação foram omitidos. A compilação terminou com estado **0**, produziu artefatos HEX/ELF e reportou **2.002 bytes de programa e 212 bytes de memória global**. `--warnings all` mostrou quatro avisos de parâmetro não utilizado em `new.cpp` do core, sem erro no sketch. Não houve `upload`, monitor serial, acesso a placa ou telefone. Esse ensaio não comprova execução dos auxiliares em ARM64/musl/Bionic, porta USB, LED ou hardware de um clone.

Consulta documental em **2026-10-11**: [release CLI 1.5.1](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1), [índice Arduino](https://downloads.arduino.cc/packages/package_index.json), [configuração do Uno no core AVR](https://github.com/arduino/ArduinoCore-avr/blob/master/boards.txt), [definição de LED_BUILTIN](https://github.com/arduino/ArduinoCore-avr/blob/master/variants/standard/pins_arduino.h) e [início com Arduino CLI](https://docs.arduino.cc/arduino-cli/getting-started/). A compatibilidade de um clone, do seu hub, do kernel do telefone e dos auxiliares no seu sistema precisa ser validada fisicamente; esta página não os certifica.
