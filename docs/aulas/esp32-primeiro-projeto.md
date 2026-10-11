---
title: ESP32 — identificar a placa e fazer o primeiro Blink
description: Prepare Arduino CLI e um core verificado, compile para uma placa concreta e teste um LED externo sem presumir pinagem universal.
sidebar_position: 31
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Resultado e limites desta aula

Vamos escrever um programa que alterna um **LED externo** e informa o estado pela serial. O exemplo físico é uma **Espressif ESP32-DevKitC V4 com módulo ESP32-WROOM-32E-N4**, com 4 MB de flash e sem PSRAM. A escolha é explícita para que pinagem, memória e método de gravação possam ser conferidos. **Não selecione essa placa para qualquer produto vendido como ESP32.**

**Dificuldade:** iniciante com cuidado na identificação e na montagem. **Resultado completo:** compilar no host, gravar na placa identificada, observar o LED e receber mensagens seriais. Compilar sem uma placa é um resultado parcial válido, mas deve ser registrado como tal. Esta aula foi conferida documentalmente em **11/10/2026**, e o sketch foi compilado num notebook Linux x86_64. Não houve ensaio físico de placa, resistor ou hub durante a revisão.

O telefone reaproveitado pode ser o computador que executa as ferramentas; o ESP32 é outro equipamento e executará o firmware. Esta aula não altera o sistema operacional do telefone. Ela também funciona pelo notebook quando ele é o host compatível, com a placa conectada ao notebook.

## 1. Identificar antes de comprar, baixar ou ligar fios

Leia a inscrição na **placa de desenvolvimento**, no **módulo metálico** e, quando possível, no conversor USB. O chip sozinho, o módulo e a placa não são a mesma coisa. ESP32 original, ESP32-S3, C3, C6 e outras famílias podem usar arquiteturas e caminhos USB diferentes. Uma placa com formato parecido não necessariamente compartilha pinos, flash, PSRAM ou circuito de reset.

Abra o [manual da ESP32-DevKitC V4](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html). Compare o desenho, o conector Micro-USB, os botões **BOOT** e **EN**, e as inscrições dos pinos. Confira a identificação completa do módulo na embalagem/documentação quando ela não estiver toda impressa no metal. O [datasheet WROOM-32E/32UE](https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.pdf) distingue N4, N8, N16 e variantes com PSRAM. **N4 e N4R2 não são a mesma configuração.**

Monte uma ficha antes de continuar:

```text
Fabricante e modelo da placa:
Revisão da placa:
Módulo e variante completos:
Flash confirmada na documentação:
PSRAM confirmada na documentação:
Conector usado para comunicação:
Chip/interface USB identificado:
Link do manual/pinout:
```

Se sua placa for outra, encontre o manual e o perfil correspondente. A lista `arduino-cli board listall esp32` ajuda a localizar nomes, mas não prova que um perfil genérico corresponde ao seu hardware. Não grave um binário para ESP32 original numa placa C3 ou S3 para “ver se funciona”. Primeiro resolva a identificação; depois adapte FQBN e circuito com a documentação da variante.

**Checkpoint:** você consegue apontar no manual o modelo, a interface USB e os pinos IO23/GND da placa concreta desta aula. Se não, pode continuar apenas na parte conceitual; não monte o circuito nem use o FQBN do exemplo em outra placa.

## 2. Separar o host do alvo e preparar materiais

Você precisa da placa identificada, cabo USB **de dados**, um LED indicador vermelho comum com polaridade conhecida, **resistor de 1 kΩ**, protoboard e fios de conexão. O LED não é fita endereçável, módulo RGB ou LED de potência. A protoboard deve acomodar a placa sem curto entre as duas fileiras de pinos; se não couber corretamente, use uma montagem compatível, sem forçar os contatos.

O resistor limita a corrente. Ele não deve ser substituído por um fio. O exemplo usa GPIO de **3,3 V**, e não uma alimentação de 5 V no sinal. Trabalhe com a USB desconectada durante a montagem. Mantenha somente essa alimentação USB na placa: o manual da DevKitC informa que USB, alimentação por 5V/GND e alimentação por 3V3/GND são alternativas mutuamente exclusivas. Não combine fontes nos pinos.

Escolha o host:

| Host | O que precisa funcionar | Ponto que exige verificação |
|---|---|---|
| Windows x64 compatível | Arduino CLI e auxiliares Windows | Driver real da interface USB |
| macOS Intel/Apple Silicon | CLI e auxiliares da arquitetura/OS | Python e suporte de eventuais auxiliares Intel |
| Debian/Ubuntu Linux x86_64 ou ARM64 | CLI, toolchain e bibliotecas de host | Porta serial, grupo e USB do kernel |
| Alpine/postmarketOS | Pacotes/binários compatíveis com musl | Um download Linux glibc não prova compatibilidade |
| Android com Termux/PRoot | Ferramentas Android e acesso USB implementado | PRoot não fornece `/dev/ttyUSB0` por si só |

O índice oficial atual oferece vários auxiliares Linux ARM64. Isso evita uma proibição genérica de compilar em ARM, mas **não elimina a diferença entre glibc, musl e Bionic**. Veja [Arduino pelo mini-PC](../projetos/arduino-esp32.md). Se o host do telefone não for suportado, use notebook para compilar/gravar e copie seus fontes por [SFTP](../projetos/arquivos-nas.md); descreva essa divisão no registro.

Abra PowerShell no Windows ou Terminal no Linux/macOS. No Linux, `uname -m` e `cat /etc/os-release` identificam arquitetura/distribuição. No Mac, `uname -m` ajuda a escolher ARM64 ou Intel. No Windows, consulte Configurações → Sistema → Sobre. Não use ferramentas Linux no PowerShell só porque seu telefone é ARM64.

## 3. Instalar e verificar Arduino CLI, desde a origem

Use **Arduino CLI 1.5.1**, versão escolhida e verificada na [release oficial](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1), junto de `1.5.1-checksums.txt`. A [aula do Uno](arduino-uno-primeiro-projeto.md) ensina os passos completos de download, hash, extração, PATH, instalação por sistema e reabertura. **Não é necessário possuir um Uno** para executar aquela seção de instalação; pare antes de instalar o core AVR, que não é requisito desta aula.

Use este checklist para concluir a instalação no seu host:

1. No navegador, abra a release oficial e identifique o arquivo do sistema **e** arquitetura. Linux x86_64 usa `Linux_64bit.tar.gz`; Linux ARM64 usa `Linux_ARM64.tar.gz`; Mac Intel usa `macOS_64bit.tar.gz`; Apple Silicon usa `macOS_ARM64.tar.gz`; Windows x64 usa `Windows_64bit.zip` ou MSI. Os nomes completos começam por `arduino-cli_1.5.1_`.
2. Salve o arquivo e o manifesto numa pasta conhecida. Confira SHA-256 com `sha256sum` no Linux, `shasum -a 256` no Mac ou `Get-FileHash -Algorithm SHA256` no PowerShell, comparando a linha exata do manifesto.
3. Extraia em uma pasta nova. No Windows, Explorador → **Extrair tudo**; no Linux/Mac, `tar -xzf` conforme a aula do Uno. Não execute um download cujo hash difere.
4. Execute o binário local e confirme a versão. Somente depois prepare o PATH do usuário; preserve ferramentas e configurações que já existam.
5. Reabra o terminal e execute `arduino-cli version`. Se não for encontrado, restaure o PATH para esta janela ou use o caminho completo confirmado. Não reinstale o core para resolver PATH.

No Debian/Ubuntu, os scripts do core escolhido também utilizam `python3` e `bash`. Prepare essas ferramentas no host compatível:

```sh
sudo apt update
sudo apt install ca-certificates curl file tar nano python3 bash usbutils
python3 --version
bash --version
arduino-cli version
```

Esse APT não deve ser usado no Alpine ou no Termux. No Mac, teste `python3 --version`. Se faltar, abra [Python para macOS](https://www.python.org/downloads/macos/), escolha um instalador oficial de uma versão Python 3 mantida e compatível com seu macOS, baixe o `.pkg`, confira a origem, abra o instalador, revise as telas e conclua. Reabra Terminal e confirme `python3 --version`. Há detalhes de instalação e ambientes em [desenvolvimento](../projetos/desenvolvimento.md). Não utilize `sudo pip` ou scripts `get-pip.py` de tutoriais antigos para preparar este core.

No Windows, a receita do core 3.3.12 usa auxiliares executáveis para várias dessas operações; não copie a instalação APT ou instale um Python aleatório para consertar qualquer erro. Leia o nome exato da ferramenta que falha. Se aparecer erro de arquitetura/loader, a execução do CLI não comprova a execução dos seus auxiliares.

## 4. Instalar o core ESP32 com índice e versão conhecidos

O suporte Arduino-ESP32 vem da Espressif. Vamos usar seu **índice estável** e o core **3.3.12**, conferidos no [catálogo oficial](https://espressif.github.io/arduino-esp32/package_esp32_index.json) em 11/10/2026. Essa versão é uma escolha reproduzível, não uma recomendação de manter software antigo para sempre. A [documentação Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html) diferencia os índices estável e de desenvolvimento.

Execute:

```sh
arduino-cli config init
arduino-cli config get board_manager.additional_urls
```

Se a configuração já existe, preserve-a. Anote o caminho indicado por `config init`; faça uma cópia desse arquivo pelo gerenciador de arquivos antes de modificar uma configuração utilizada por outros projetos. Se a URL abaixo **ainda não estiver na lista**, acrescente:

```sh
arduino-cli config add board_manager.additional_urls https://espressif.github.io/arduino-esp32/package_esp32_index.json
```

`add` acrescenta uma origem; não substitui todas as outras. Não acrescente a mesma URL repetidamente. Continue:

```sh
arduino-cli core update-index
arduino-cli core install esp32:esp32@3.3.12
arduino-cli core list
arduino-cli board listall esp32
arduino-cli board details --fqbn "esp32:esp32:esp32:FlashSize=4M,PSRAM=disabled,UploadSpeed=115200"
```

A instalação pode baixar arquivos grandes e levar tempo. Garanta espaço livre e não deixe um telefone em bateria crítica fazendo isso. `core list` deve mostrar `esp32:esp32` na versão escolhida. `board details` deve reconhecer **ESP32 Dev Module** e as opções. A [definição dessa versão](https://github.com/espressif/arduino-esp32/blob/3.3.12/boards.txt) contém `FlashSize=4M`, `PSRAM=disabled` e `UploadSpeed=115200` para esse perfil.

Usamos o perfil genérico **somente para a DevKitC/WROOM-32E-N4 identificada**, com 4 MB e sem PSRAM. Se a placa tiver um perfil oficial específico, siga-o. Se não conseguir confirmar memória ou família, não tente compensar mudando opções ao acaso. Salve versão, FQBN e URL no registro.

## 5. Criar e salvar o primeiro sketch

Mantenha a placa desconectada enquanto escreve. No Linux/macOS:

```sh
mkdir -p "$HOME/projetos/arduino"
cd "$HOME/projetos/arduino"
arduino-cli sketch new Esp32Primeiro
nano Esp32Primeiro/Esp32Primeiro.ino
```

No Windows, use:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\projetos\arduino"
Set-Location "$env:USERPROFILE\projetos\arduino"
arduino-cli sketch new Esp32Primeiro
notepad .\Esp32Primeiro\Esp32Primeiro.ino
```

Se essa pasta já contém um projeto, preserve-o ou escolha outro nome, mantendo iguais os nomes da pasta e do `.ino`. Substitua o texto inicial do **novo arquivo** por:

<!-- example-file: esp32/Esp32Primeiro/Esp32Primeiro.ino -->
```cpp
constexpr unsigned LED_PIN = 23;

void setup() {
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
  Serial.begin(115200);
}

void loop() {
  digitalWrite(LED_PIN, HIGH);
  Serial.println("GPIO23 ligado");
  delay(1000);
  digitalWrite(LED_PIN, LOW);
  Serial.println("GPIO23 desligado");
  delay(1000);
}
```

No nano, salve com **Ctrl+O → Enter** e saia com **Ctrl+X**. No Bloco de Notas, **Ctrl+S**. Confira o arquivo com `ls Esp32Primeiro` ou `Get-ChildItem .\Esp32Primeiro`; o nome não deve terminar em `.ino.txt`.

`LED_PIN` indica **GPIO23**, não a posição física 23 do conector. `setup()` prepara a saída e a serial; `loop()` alterna estado e mensagem. A placa concreta expõe GPIO23 no pino marcado **IO23**, documentado como I/O. Não usamos `LED_BUILTIN`: LEDs integrados podem faltar, ser só indicadores de alimentação, usar outro pino ou exigir outro protocolo.

## 6. Compilar e conferir artefatos, sem upload

Na pasta `projetos/arduino`, execute:

```sh
arduino-cli compile --fqbn "esp32:esp32:esp32:FlashSize=4M,PSRAM=disabled,UploadSpeed=115200" --jobs 1 --warnings all --output-dir ./build/Esp32Primeiro ./Esp32Primeiro
```

`--jobs 1` limita paralelismo, útil para reduzir pico de memória/temperatura no primeiro ensaio. Não é uma mudança no firmware de energia do telefone. O FQBN escolhe alvo e opções; `--output-dir` guarda binários. O [comando de compilação](https://arduino.github.io/arduino-cli/1.5/commands/arduino-cli_compile/) não grava nada sem a opção correspondente.

Espere o processo concluir. Um resumo de memória sem erro final indica compilação bem-sucedida; os números variam. Em `build/Esp32Primeiro`, deve haver artefatos do sketch e de inicialização/partições. Não envie um `.bin` isolado para um endereço de flash copiado de outra placa: o upload do core deve utilizar os artefatos e a receita correspondentes.

**Checkpoint:** a compilação concluiu no host. Se uma ferramenta não executa, registre o caminho e erro; isso é incompatibilidade de host ou dependência, não defeito do LED. Se o erro aponta o seu `.ino`, confira ponto e vírgula/chaves e a linha anterior. Salve antes de recompilar. Um erro Python deve ser investigado com `python3 --version` e com a [receita do core escolhido](https://github.com/espressif/arduino-esp32/blob/3.3.12/platform.txt), sem substituir bibliotecas do sistema.

## 7. Encontrar a porta USB, sem depender do LED

Primeiro conecte **apenas a placa**, sem o circuito externo. Execute `arduino-cli board list` antes e depois. Na DevKitC deste exemplo, a comunicação passa por USB-UART; outras famílias podem usar USB nativo e opções diferentes de USB-CDC. A inscrição ESP32 não determina qual interface foi conectada.

No Windows, compare **Gerenciador de Dispositivos → Portas (COM e LPT)**. No Mac, compare `ls /dev/cu.*`. No Linux, compare:

```sh
lsusb
lsusb -t
ls -l /dev/ttyUSB* /dev/ttyACM*
id
```

Uma porta Linux típica do conversor pode ser `/dev/ttyUSB0`; não presuma esse número. O fabricante do conversor pode aparecer no USB, em vez da palavra Espressif. Se faltar driver no Windows/macOS, identifique o chip/ID de hardware e use a origem indicada pelo manual, por exemplo [Silicon Labs VCP](https://www.silabs.com/software-and-tools/usb-to-uart-bridge-vcp-drivers) **se o conversor real for dessa família**. Consulte [identificação serial da Espressif](https://docs.espressif.com/projects/esp-idf/en/stable/esp32/get-started/establish-serial-connection.html).

No Linux, USB enumerado sem `/dev/tty…` pode indicar driver ausente no kernel. Consulte `sudo dmesg | tail -n 60`; não crie manualmente o nó. Uma serial presente com acesso negado exige verificar proprietário/grupo. Num Debian/Ubuntu, **somente se** a porta real pertencer a `dialout`, use `sudo usermod -aG dialout "$USER"`, saia e entre novamente, e confira `id`. Não substitua grupos, não use `chmod 777` e não inicie toda a ferramenta como root.

Se o hub do telefone não enumera a placa, compare o mesmo cabo/placa no notebook, sem concluir que o Blink está errado. Registre separadamente o resultado no notebook e no telefone. Framework USB Android e acesso POSIX pelo terminal são caminhos diferentes; PRoot não corrige um driver ausente.

## 8. Montar o LED com a placa sem energia

Desconecte a USB. Confirme o pino **IO23** e um **GND** no manual/pinout da DevKitC V4. Para este exemplo, a cadeia elétrica é:

```text
IO23 (GPIO23) → resistor de 1 kΩ → anodo do LED → catodo do LED → GND
```

O resistor pode estar em qualquer lado **em série** com o LED; não o coloque em paralelo. Identifique anodo/catodo pela documentação do LED e, num LED convencional, suas marcações físicas. Comprimento de perna deixa de ser uma referência confiável depois de cortá-la. Confira a continuidade das fileiras da protoboard para não ligar ambas as pernas no mesmo contato.

Não conecte o LED diretamente entre GPIO e GND; não utilize 5V, VIN, CMD, CLK ou um pino escolhido pela posição. Os pinos ligados à flash não devem ser usados nesse circuito. O manual também diferencia pinos reservados conforme o módulo. GPIO23 foi escolhido para **esta placa**, sem outros periféricos SPI conectados; não é pinagem universal para ESP32.

**Checkpoint físico antes da energia:** resistor realmente marcado/medido como 1 kΩ, polaridade identificada, GPIO23 e GND confirmados, nenhuma ligação à alimentação externa ou curto nas fileiras. Se houver dúvida, deixe o LED desconectado e valide apenas a saída serial até conseguir revisar o circuito.

## 9. Gravar na placa identificada

Reconecte a USB de dados. O upload substituirá o programa anterior da placa e pode modificar conteúdo de flash conforme a receita/partições. Guarde o projeto e dados anteriores antes. Não marque opções de apagar toda a flash nem execute ferramentas de eFuse/segurança para esta aula. Feche o monitor serial que estiver ocupando a porta.

Se a porta confirmada no Linux realmente for `/dev/ttyUSB0`, execute:

```sh
arduino-cli upload --fqbn "esp32:esp32:esp32:FlashSize=4M,PSRAM=disabled,UploadSpeed=115200" --port /dev/ttyUSB0 --input-dir ./build/Esp32Primeiro ./Esp32Primeiro
```

No Windows, troque **somente a porta** por sua COM real; no Mac, pelo caminho `/dev/cu.…` identificado. Não grave na primeira porta da lista por conveniência. O [upload](https://arduino.github.io/arduino-cli/1.5/commands/arduino-cli_upload/) usa o resultado anterior; alterações no fonte só entram depois de nova compilação.

Muitas DevKitC usam reset automático. Se ocorrer falha de conexão, confirme primeiro porta, permissões e cabo. **Apenas para a DevKitC V4 identificada**, o manual orienta entrar em download mantendo **BOOT** pressionado, pressionando e soltando **EN**, e então soltando BOOT. Faça isso, repita o upload e aguarde sua conclusão; se permanecer em download após gravar, pressione e solte EN com BOOT liberado. Não extrapole os botões/pinos para outra placa nem solde capacitores como primeira tentativa.

## 10. Validar, retomar e preservar o projeto

Observe o LED externo: aproximadamente um segundo aceso, um segundo apagado. Abra a serial na **mesma porta real** e na velocidade do seu programa:

```sh
arduino-cli monitor --port /dev/ttyUSB0 --config baudrate=115200
```

Devem alternar `GPIO23 ligado` e `GPIO23 desligado`. Algumas linhas de boot antes disso são normais; caracteres ilegíveis podem indicar velocidade incorreta. **Ctrl+C** fecha o monitor. Fechá-lo não encerra o firmware; abrir a serial ou apertar EN pode reiniciar a execução.

| Evidência | Conclusão permitida |
|---|---|
| Compilação concluiu | CLI e auxiliares conseguiram produzir o programa nesse host |
| Upload concluiu na porta confirmada | Comunicação de gravação funcionou nessa montagem |
| Mensagens alternam | Seu firmware está executando e a serial está recebendo |
| LED acompanha as mensagens | Circuito e GPIO do exemplo passaram no teste físico |
| Repetição após religar USB | O programa persistiu e voltou a executar na placa |

Se a serial funciona e o LED não, desligue a USB e revise polaridade, resistor, contatos e pinagem. Se a placa reinicia repetidamente ou informa brownout, examine alimentação/cabo e o circuito com energia removida; não desative o detector de brownout para esconder o problema. Se o dispositivo desaparecer da USB, volte à camada de energia/host, não ao código de `digitalWrite`. Para falhas específicas, consulte [troubleshooting Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/troubleshooting.html), respeitando a versão e o hardware envolvidos.

Para retomar: abra o terminal, confirme CLI, entre em `projetos/arduino`, confira `core list`, abra `Esp32Primeiro/Esp32Primeiro.ino` e redescubra a porta. Ela pode mudar após reconectar. Faça backup da **pasta do sketch** e da ficha com versão/FQBN/pinagem. O diretório `build` pode ser regenerado; um binário sozinho não substitui seus fontes.

Exercício seguro: reduza os dois atrasos para 500, salve, compile e grave. Depois restaure 1000. Não acrescente Wi-Fi, sensores e fontes ao mesmo tempo: valide cada mudança. Para voltar ao firmware anterior, use seus fontes e opções originais. Para retirar o LED, desconecte a USB antes dos fios. Nenhum passo desta aula altera o bootloader do smartphone.

## Fontes, reprodução e lacunas

**Compilação executada em 11/10/2026:** o bloco original `.ino` foi extraído desta página e compilado, sem alterações, num notebook Fedora Linux 44 x86_64, glibc 2.43 e Python 3.14.8. Foram usados Arduino CLI **1.5.1**, core **esp32:esp32 3.3.12**, compilador **xtensa-esp-elf-g++ 14.2.0** (toolchain esp-14.2.0_20260121), o FQBN exato **`esp32:esp32:esp32:FlashSize=4M,PSRAM=disabled,UploadSpeed=115200`**, `--jobs 1` e `--warnings all`. O CLI foi conferido pelo manifesto SHA-256 oficial, e configuração/dados/downloads/cache/construção foram isolados numa área descartável em disco; scripts de pós-instalação foram omitidos. A compilação terminou com estado **0**, sem avisos, e reportou **271.760 bytes de programa e 22.116 bytes de memória global**. Foram gerados os binários do sketch e artefatos de inicialização/partições. O fixture completo, incluindo downloads e ferramentas das várias famílias instaladas pelo core, ocupou cerca de **8,1 GiB lógicos** nessa experiência; planeje espaço e não pressuponha que uma pasta temporária em RAM comportará a instalação. Não houve upload, monitor serial ou acesso a placa/telefone. O ensaio não valida ferramentas ARM64/musl/Bionic, USB, pinagem física, alimentação ou circuito.

Verificação documental em **2026-10-11**: [CLI 1.5.1](https://github.com/arduino/arduino-cli/releases/tag/v1.5.1), [índice estável ESP32](https://espressif.github.io/arduino-esp32/package_esp32_index.json), [core 3.3.12](https://github.com/espressif/arduino-esp32/tree/3.3.12), [manual DevKitC V4](https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32/esp32-devkitc/user_guide.html) e [datasheet do módulo](https://www.espressif.com/sites/default/files/documentation/esp32-wroom-32e_esp32-wroom-32ue_datasheet_en.pdf). Não houve teste físico nesta revisão. Outras placas, versões, libc, hubs e kernels precisam de sua própria ficha de evidências; este exemplo não certifica compatibilidade universal.
