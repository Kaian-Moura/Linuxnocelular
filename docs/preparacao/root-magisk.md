---
title: Root real no Android com Magisk
sidebar_position: 4
description: Identifique a variante e a imagem correta, instale o aplicativo oficial, faça o patch no próprio telefone e valide um método de instalação específico.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## O que este guia entrega e quando ele é necessário

**Dificuldade:** avançada. **Resultado esperado:** Android continua instalado; aplicativos que você autorizar podem obter privilégios de administrador por meio do Magisk. O procedimento exige uma combinação identificada de aparelho, variante regional, firmware, bootloader e método de instalação. Não existe um arquivo Magisk já modificado que seja correto para todos os celulares.

Root significa executar como o usuário administrativo, identificado no Linux por `uid=0`. Isso permite, por exemplo, as montagens de um [chroot](../android/chroot.md). Instalar o APK do Magisk, sozinho, **não** concede root: o aplicativo prepara e administra componentes que precisam ser integrados à inicialização do aparelho.

| Situação | Precisa deste guia? |
| --- | --- |
| Usar [Termux](../android/termux.md) ou [PRoot-distro](../android/proot-distro.md) | Não: funcionam sem root real |
| Instalar Linux nativo com um port compatível | Magisk não é um requisito geral; siga os requisitos do port e do bootloader |
| Montar um chroot no Android | Normalmente exige root real e políticas de montagem compatíveis |
| Ver `root` dentro de PRoot | Isso não comprova root no Android |
| Bootloader já desbloqueado | Ainda falta instalar e verificar o mecanismo de root |

Desbloquear o bootloader permite determinadas alterações de inicialização; não é a mesma coisa que conceder privilégios a um aplicativo. A opção **Desbloqueio de OEM** apenas permite o desbloqueio nos aparelhos que o oferecem. Ela não demonstra que o estado atual seja desbloqueado. Consulte [ADB, Fastboot e identificação do dispositivo](./adb-fastboot.md) antes de prosseguir.

:::danger Antes de alterar a inicialização
Desbloqueio normalmente apaga dados. Um patch errado pode impedir o boot; uma restauração pode também apagar dados. Tenha [backup externo](./backup.md), firmware apropriado e um método de recuperação confirmado **antes** da gravação. Não aplique root num aparelho administrado por empresa ou com bloqueios que você não está autorizado a remover. Não bloqueie novamente o bootloader enquanto imagens modificadas estiverem instaladas.
:::

## 1. Materiais e uma ficha para o seu aparelho

Use um computador, cabo USB de dados, conexão estável, bateria suficiente para o procedimento indicado pelo fabricante, Android utilizável e uma forma de confirmar pedidos na tela. Um telefone cuja tela não permite autorizar ADB, instalar APKs ou conceder root precisa primeiro do [caminho para tela quebrada](./tela-quebrada.md). Não há comando que contorne universalmente essas confirmações.

Crie no computador uma pasta chamada `root-meu-celular`. No gerenciador de arquivos, entre na sua pasta pessoal, clique em **Nova pasta**, digite o nome e abra-a. Ela receberá um arquivo de notas, o pacote original do firmware e uma cópia da imagem modificada. Evite caminhos de pasta com caracteres que você não sabe representar no terminal.

No telefone, abra **Configurações → Sobre o telefone**; os nomes variam conforme fabricante. Anote modelo completo, versão Android, número da compilação e atualização de segurança. Modelo comercial, como “Galaxy S” ou “OnePlus 9 Pro”, é insuficiente: códigos como `SM-...`, variante de operadora, região e codinome podem alterar firmware e desbloqueio.

Com ADB configurado pelo guia anterior, abra o terminal do **computador** dentro da pasta `platform-tools` para confirmar as ferramentas. O [guia ADB/Fastboot](./adb-fastboot.md) ensina adicionar essa pasta ao `PATH` **somente da janela atual**, tanto em PowerShell como em macOS/Linux. Faça essa configuração e confirme `adb version` e `fastboot --version`; os exemplos abaixo pressupõem comandos reconhecidos sem prefixo.

Depois, **na mesma janela que recebeu o PATH**, entre na pasta de trabalho que criou. No PowerShell:

```powershell
Set-Location "$env:USERPROFILE\root-meu-celular"
Get-Location
```

No terminal Linux/macOS:

```bash
cd "$HOME/root-meu-celular"
pwd
```

Se criou a pasta em outro local, copie o caminho real do gerenciador de arquivos e substitua somente o caminho entre aspas. O resultado deve identificar sua pasta de trabalho. Não copie as imagens para uma pasta qualquer só porque `adb.exe` está lá: PATH permite usar as ferramentas enquanto você trabalha na pasta dos arquivos. Ao abrir outra janela, configure novamente o PATH ou use o caminho completo da ferramenta oficial. Agora consulte o telefone:

```bash
adb devices -l
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.build.fingerprint
adb shell getprop ro.build.version.incremental
adb shell getprop ro.product.cpu.abilist
adb shell getprop ro.boot.slot_suffix
adb shell getprop ro.boot.flash.locked
```

Execute uma linha por vez. `devices` deve listar um serial com o estado `device`; `unauthorized` exige aceitar a chave no telefone. Para os exemplos sem seleção de alvo, mantenha **somente o aparelho deste procedimento** conectado e encerre emuladores ADB. Se houver vários alvos, o guia ADB ensina selecionar o serial; a seleção precisa acompanhar todas as operações correspondentes, inclusive a confirmação independente em Fastboot. As outras linhas consultam informações, sem gravar partições. Uma propriedade vazia significa que esse firmware não a expôs: não significa que o aparelho esteja desbloqueado ou que não use slots. Guarde as saídas no arquivo de notas, removendo serial e outros identificadores antes de publicá-lo.

Complete esta ficha antes de qualquer flash:

| Informação | Como obter e conferir |
| --- | --- |
| Modelo/variante exatos | Etiqueta, Configurações e propriedades ADB; devem concordar |
| Build instalado | Fingerprint e número da compilação, não apenas “Android 14” |
| Firmware original correspondente | Página do fabricante ou publicação do mantenedor da ROM que você realmente usa |
| Estado do bootloader | Interface do bootloader e procedimento documentado do modelo; uma propriedade isolada pode ser inconclusiva |
| Método de gravação | Fastboot de bootloader, Download Mode/Odin ou outro, conforme o modelo |
| Imagem-alvo e slot | Instrução verificável para esse build e variante |
| Retorno ao sistema original | Arquivos disponíveis, ferramenta e procedimento de restauração |

Se uma dessas informações está desconhecida, você ainda pode baixar o aplicativo e estudar o firmware. A etapa de gravação permanece bloqueada até resolver a diferença. Não use uma imagem publicada como “serve para todos os aparelhos com esse processador”.

## 2. Baixar e instalar o aplicativo oficial

Abra no navegador do **telefone** a [página oficial de releases do Magisk](https://github.com/topjohnwu/Magisk/releases). O endereço deve ter o proprietário `topjohnwu` e o projeto `Magisk`. Na revisão de 11/10/2026, **v30.7** está marcada como **Latest**; v31.0 aparece como **Pre-release**, com uma interface redesenhada. Este guia usa os nomes da instalação estável documentada. Quando houver uma versão posterior, leia sua release e a documentação correspondente antes de adaptar os cliques.

1. Entre na release estável e expanda **Assets**, se estiver recolhido.
2. Toque no APK de lançamento, por exemplo `Magisk-v30.7.apk`. Não escolha `app-debug.apk` para este tutorial e não baixe os arquivos **Source code** esperando instalar um aplicativo.
3. Aguarde o download. Abra **Arquivos → Downloads** ou a notificação do navegador e toque no APK.
4. Se o Android bloquear a instalação, toque em **Configurações** no aviso e permita **Instalar apps desconhecidos** somente para o navegador ou aplicativo Arquivos usado nessa operação. Volte ao instalador, escolha **Instalar** e depois **Abrir**. O texto exato depende do Android.
5. Depois de instalar, você pode revogar essa permissão na mesma tela. Não desative verificações de segurança globalmente para permitir um APK de procedência incerta.

O resultado inicial esperado é a tela do aplicativo, com informações de Magisk e a opção de instalação. A versão do aplicativo estar instalada e a parte principal do Magisk aparecer como indisponível ainda é normal: a imagem de inicialização não foi modificada.

Opcionalmente, confirme a integridade do APK no computador, depois de transferi-lo, com `sha256sum Magisk-v30.7.apk` no Linux ou `Get-FileHash .\Magisk-v30.7.apk -Algorithm SHA256` no PowerShell. O digest publicado pelo GitHub para o APK estável consultado foi:

```text
e0d32d2123532860f97123d927b1bb86c4e08e6fd8a48bfc6b5bee0afae9ebd5
```

Esse valor se aplica **somente** ao asset `Magisk-v30.7.apk` consultado. Uma versão diferente exige seu próprio digest. Hash ajuda a reconhecer um arquivo, mas não torna confiável um download de um proprietário diferente.

## 3. Obter o arquivo original: firmware não é o APK

O Magisk precisa receber a imagem de inicialização **do build instalado**. O arquivo original deve permanecer intacto no computador; faça o patch em uma cópia no telefone.

Exemplos de fontes oficiais são as [factory images do Google Pixel](https://developers.google.com/android/images) e as [imagens OTA completas do Pixel](https://developers.google.com/android/ota). Isso não torna esses arquivos compatíveis com OnePlus, Motorola ou Samsung. Nas páginas do fabricante, filtre pelo modelo/codinome, região e build anotados na ficha. Para ROM comunitária, use o pacote e as instruções do mantenedor dessa ROM, não o boot de uma ROM stock diferente.

No navegador do computador, escolha o pacote confirmado, faça o download e aguarde terminar. Confira tamanho e hash quando o publicador os disponibilizar. Não execute `flash-all` nem outro script que venha no ZIP apenas para “extrair o boot”: abrir um arquivo é uma operação diferente de reinstalar o firmware.

### Se o pacote já contém `boot.img` ou `init_boot.img`

No Windows, clique com o botão direito no ZIP e escolha **Extrair tudo** para uma pasta nova. No Linux, abra o arquivo no gerenciador de arquivos compactados e use **Extrair**; no macOS, a extração de ZIP pode ser feita pelo Finder. Alguns pacotes contêm outro ZIP: abra-o e procure os nomes de imagem. Ative a exibição de extensões no gerenciador, para não confundir `boot.img` com `boot.img.zip`.

Não renomeie qualquer arquivo grande para `boot.img`. A existência do nome, sem correspondência de build e estrutura do pacote, não comprova o alvo correto.

### Se há um `payload.bin` numa OTA completa

Esse arquivo reúne imagens de atualização; ele não é uma boot image. Uma ferramenta comunitária verificável é o [payload-dumper-go, do autor ssut](https://github.com/ssut/payload-dumper-go). Ela não fornece o firmware: extrai o pacote que você já verificou. Prefira uma **OTA completa**, pois pacotes incrementais podem exigir imagens-base exatas e operações adicionais.

Na [página de releases da ferramenta](https://github.com/ssut/payload-dumper-go/releases), baixe o asset para o **computador que fará a extração**, não automaticamente para a arquitetura do telefone. Na versão 2.1.0 consultada, há arquivos `linux_amd64`, `linux_arm64`, `darwin_...` e `windows_...`, além de `payload-dumper-go_sha256checksums.txt`.

Em Windows, uma opção de extração é o [7-Zip oficial](https://www.7-zip.org/): baixe o instalador x64 para um PC Windows x64, ou ARM64 somente para Windows ARM64; execute-o, escolha **Install** e feche ao concluir. Pelo gerenciador 7-Zip, abra o `.tar.gz`, extraia a camada `.gz` e depois o `.tar` para uma pasta nova. Não baixe um “dumper” de um vídeo sem origem conhecida. No Linux, o gerenciador de arquivos compactados pode extrair as duas camadas.

A ferramenta depende do executável **`xz`**, que é diferente do programa 7-Zip usado para abrir o download. Em Debian/Ubuntu, instale-o com `sudo apt update` e `sudo apt install xz-utils`, no terminal do computador; confirme por `xz --version`. A senha de sudo é da conta do computador. Em Fedora, o pacote correspondente é `xz`, pelo gerenciador da distribuição. No macOS, se você **já** usa Homebrew instalado e verificado, `brew install xz` é uma opção; sem gerenciador preparado, use um ambiente Linux de laboratório descrito em [Linux no computador](../comece-aqui/linux-no-computador.md), em vez de copiar um script de instalação desconhecido.

Para **Windows x64**, o projeto XZ publica um ZIP na seção **Binary packages → Windows** de [XZ Utils](https://tukaani.org/xz/). Na revisão, o arquivo é `xz-5.8.4-windows.zip`. Baixe-o, clique com o botão direito → **Extrair tudo**, e escolha uma pasta nova `root-meu-celular/ferramentas/xz`. Confira que ela contém `bin_x86-64/xz.exe`; se a extração criou uma camada extra, use o caminho real correspondente. No PowerShell:

```powershell
$magiskXzDir = "$env:USERPROFILE\root-meu-celular\ferramentas\xz\bin_x86-64"
Get-ChildItem "$magiskXzDir\xz.exe"
$env:Path = "$magiskXzDir;$env:Path"
xz --version
```

Somente prossiga quando o executável estiver confirmado e a versão for exibida. A mudança de PATH vale para essa janela. O ZIP consultado oferece binários x86/x64; não foi confirmado um binário nativo ARM64 de XZ nesse asset. Num Windows ARM64, não presuma que o asset do dumper, sozinho, resolve essa dependência: use um ambiente suportado ou valide a execução compatível separadamente.

Coloque o executável extraído e `payload.bin` na mesma pasta de trabalho. Confira o hash do asset compactado contra a entrada de mesmo nome no arquivo de checksums. No terminal dessa pasta, **Linux**, liste primeiro:

```bash
chmod u+x ./payload-dumper-go
./payload-dumper-go -l ./payload.bin
```

No PowerShell, o equivalente para a ferramenta Windows é `./payload-dumper-go.exe -l ./payload.bin`, usando o nome efetivamente extraído e o `xz` confirmado nessa sessão. A lista deve mostrar as partições contidas. Depois de decidir o alvo na próxima seção, extraia **só esse alvo**. Por exemplo, exclusivamente para um método que exige `boot`:

```bash
./payload-dumper-go -p boot -o ./extraidas ./payload.bin
```

No PowerShell, use `./payload-dumper-go.exe -p boot -o ./extraidas ./payload.bin` sob a mesma condição. Para um método confirmado de `init_boot`, substitua o argumento `boot` por `init_boot`; não execute os dois como estratégia de descoberta. O resultado esperado é a imagem correspondente em `extraidas`, com conclusão sem erro de verificação. Se faltar a partição, houver falha de operação incremental ou erro de integridade, volte à seleção do pacote. Não use `-no-verify` para transformar uma extração falha em aparentemente correta.

## 4. Escolher entre `boot`, `init_boot`, `recovery` e Samsung

Na tela inicial do Magisk, observe **Ramdisk**. A documentação oficial usa esse resultado em conjunto com as imagens existentes e as particularidades do aparelho. Um ramdisk contém arquivos usados no início do boot; onde ele está depende da arquitetura de inicialização.

| Caso confirmado | Caminho a estudar |
| --- | --- |
| Aparelho não Samsung, boot ramdisk presente, pacote e instruções usam `boot.img` | Patch de `boot.img` |
| Aparelho não Samsung, `init_boot.img` existe e o método desse build o usa | Patch de `init_boot.img` |
| Sem boot ramdisk e método oficial do Magisk para esse aparelho usa recuperação | Patch de `recovery.img`, com a opção de recuperação e forma de boot específicas |
| Samsung compatível | Patch do arquivo **AP completo**; siga a seção Samsung |
| Método exige `vendor_boot` ou uma disposição especial | Exige instrução específica atual; não adapte o ramo `boot` por renomeação |

Dispositivos **lançados** com Android 13 podem separar o ramdisk em `init_boot`; um aparelho atualizado para Android 13 não necessariamente mudou seu mapa dessa maneira. As [partições de boot documentadas pelo AOSP](https://source.android.com/docs/core/architecture/partitions/generic-boot) explicam a diferença. Não escolha pelo número Android isoladamente.

Releases recentes do Magisk incluem suporte a `vendor_boot`, mas isso não demonstra que seja o alvo do seu celular. Aparelhos A/B têm slots; alguns não têm uma partição de recuperação independente. Anote a imagem original, o alvo de gravação e o slot, quando aplicável. Se o guia do aparelho contradiz o resultado de Ramdisk, investigue a versão e a exceção antes do patch.

## 5. Fazer o patch no próprio telefone

Esta etapa prepara um arquivo e ainda não grava uma partição. Para o ramo não Samsung, use a imagem decidida na ficha, sem modificações de outro aparelho. Pelo gerenciador de arquivos **do computador**, copie essa imagem extraída para a pasta `root-meu-celular`, mantendo o mesmo nome e preservando outra cópia original junto ao firmware. Confirme que o terminal está nessa pasta e que ADB permanece reconhecido. A transferência de um `boot.img` guardado na pasta atual seria:

```bash
adb push ./boot.img /sdcard/Download/boot.img
```

Esse comando é apenas para o caso `boot.img`. Se o alvo confirmado é `init_boot.img`, use esse nome nas duas posições. Se é recuperação, use `recovery.img`. `adb push` deve concluir com o total de bytes transferidos; `cannot stat` significa que o arquivo não está na pasta atual ou que seu nome foi digitado incorretamente. Confira com o gerenciador de arquivos, sem trocar por uma imagem de origem diferente.

No **telefone**:

1. Abra Magisk e toque em **Install/Instalar** no cartão do Magisk, não num módulo.
2. Escolha **Select and Patch a File/Selecionar e modificar um arquivo**.
3. No seletor Android, entre em **Downloads** e selecione a imagem original transferida. Não selecione o próprio APK.
4. Marque **Recovery Mode/Modo de recuperação** somente no ramo que exige `recovery.img`. Para os outros ramos, preserve as opções recomendadas pelo método do aparelho.
5. Inicie a operação pelo botão de confirmação mostrado e aguarde o log terminar. Anote o caminho final do arquivo `magisk_patched_...img`.

O arquivo de saída deve estar em Downloads. O texto `...` neste guia não é parte do nome. Abra **Arquivos → Downloads** ou use, no computador, a consulta:

```bash
adb shell ls -l /sdcard/Download/
```

Encontre o arquivo recém-criado pelo horário e copie seu nome completo. Para evitar um marcador perigoso num comando, digite `adb pull `, acrescente `/sdcard/Download/` seguido desse nome exato, e por último ` ./magisk-patched.img`. Por exemplo, um arquivo realmente chamado `magisk_patched_30700_AbCdE.img` produziria:

```bash
adb pull /sdcard/Download/magisk_patched_30700_AbCdE.img ./magisk-patched.img
```

**Substitua o nome de exemplo pelo seu antes de executar.** Confirme que a transferência terminou e guarde a imagem original em separado. Nunca distribua a imagem modificada como solução para outra pessoa: o patch deve ser feito no dispositivo-alvo, mesmo que o modelo comercial seja igual.

## 6. Gravar num aparelho que usa Fastboot: ramo condicionado

Você deve ter uma instrução publicada para sua variante/build que confirme: bootloader desbloqueado; modo Fastboot correto; imagem-alvo; comportamento de slots; necessidade ou ausência de etapas extras; e retorno com o arquivo original. Encontre essa instrução no guia do fabricante/ROM ou no guia de dispositivo mantido pela comunidade, e compare modelo, fingerprint e data. Um vídeo que não mostra esses dados não resolve a compatibilidade.

**Os comandos abaixo não constituem um método universal de root.** Eles são a transcrição mínima da operação de imagem que o Magisk documenta, utilizável apenas quando o procedimento específico já confirmou **esse mesmo alvo e essa mesma forma de comando**. Não se aplicam a Samsung, a partições diferentes, a um aparelho bloqueado, nem a uma instrução que exige outro slot ou outra ferramenta.

Depois de preservar os arquivos e atender às condições, **no terminal do computador**:

```bash
adb reboot bootloader
fastboot devices
```

O telefone muda de modo; ADB deixar de responder nesse momento é esperado. Fastboot deve listar o serial. Se não listar, trate cabo, driver e modo pelo [guia de ADB/Fastboot](./adb-fastboot.md), sem começar a gravar.

Escolha **um único ramo**, já decidido, e não os execute em sequência:

| Ramo da instrução específica | Operação correspondente, com o arquivo local já confirmado |
| --- | --- |
| A instrução confirma gravação de `boot` no slot pretendido pela forma sem sufixo | `fastboot flash boot ./magisk-patched.img` |
| A instrução confirma gravação de `init_boot` no slot pretendido pela forma sem sufixo | `fastboot flash init_boot ./magisk-patched.img` |

Para recuperação, `vendor_boot`, slots explicitamente nomeados ou fastbootd, use a sequência **específica** que foi verificada; este guia não inventa uma equivalência. `fastboot boot` também não é substituto geral de `flash`: suporte e tipo de imagem necessários variam.

A ferramenta deve informar envio e gravação concluídos sem `FAILED`. Se aparecer `partition not found`, `not allowed`, erro de tamanho ou de verificação, pare; não teste nomes alternativos nem apague partições. Registre o erro e volte à ficha. Se tudo concluiu como a instrução exige, `fastboot reboot` retorna ao Android. Na primeira abertura do Magisk, aceite a configuração adicional solicitada pelo aplicativo oficial; ela pode causar mais um reinício.

Não acrescente comandos para desabilitar AVB, apagar `vbmeta`, mudar slot, formatar `userdata` ou relock porque apareceram em outro tutorial. Se uma alteração adicional for realmente requerida, precisa de justificativa, arquivos e recuperação próprios para esse aparelho.

## 7. Samsung: AP, Download Mode e recuperação próprios

Samsung tem um fluxo separado no [guia oficial de instalação do Magisk](https://topjohnwu.github.io/Magisk/install.html). O desbloqueio não está disponível em todas as variantes. Além de possíveis apagamentos de dados, a alteração pode marcar permanentemente o **Knox Warranty Bit**; restaurar Android original não desfaz essa marca. O [white paper oficial do Knox](https://docs.samsungknox.com/admin/fundamentals/whitepaper/samsung-knox-mobile-security/assets/Knox-security-white-paper-r1.pdf) descreve esse registro persistente e proteção contra rollback.

### Identificação e obtenção do pacote

Registre o código `SM-...`, CSC/região, build e revisão do bootloader. Consulte o método de entrada em **Download Mode** do modelo: não use uma combinação de botões de outro Galaxy. Verifique os estados OEM Lock e Knox Guard conforme a documentação do Magisk. Uma restrição empresarial, estado Locked/Active ou variante sem desbloqueio não se resolve com este tutorial.

Use [Smart Switch oficial](https://www.samsung.com/br/apps/smart-switch/) quando aplicável ao backup, lembrando que ele não garante cópia de todos os dados nem entrega universal da imagem de boot. A documentação Magisk aponta ferramentas comunitárias para obter firmware, como [SamFirm.NET](https://github.com/jesec/SamFirm.NET). Elas não são o suporte oficial Samsung. Só aceite o pacote quando modelo, CSC e build forem os pretendidos; não use um pacote de downgrade sem verificar a proteção de rollback.

Extraia o ZIP completo para uma pasta nova. Um pacote desse fluxo normalmente oferece arquivos com prefixos **BL**, **AP**, **CP** e **CSC**, possivelmente também **HOME_CSC**. Se não possui o pacote completo correspondente ou não sabe qual revisão ele contém, a etapa de flash fica bloqueada. Não extraia e grave isoladamente um boot desse pacote seguindo o ramo Fastboot.

### Patch e campo de instalação

Transfira o **AP inteiro**, incluindo sua extensão `.tar.md5`, para Downloads do telefone. No Magisk, siga **Instalar → Selecionar e modificar um arquivo** e escolha esse AP. O resultado esperado é um arquivo modificado em formato `.tar`, conforme o fluxo Samsung documentado. Copie-o de volta com **ADB**, usando o nome real mostrado pelo aplicativo; a documentação Magisk alerta sobre corrupção de arquivos grandes nesse fluxo quando transferidos por MTP.

No Windows, os [drivers USB oficiais Samsung](https://developer.samsung.com/android-usb-driver) têm um instalador: baixe pelo botão da página do fabricante, abra o `.exe`, siga **Next/Avançar → Install/Instalar** e conclua. Reconecte e confirme que a ferramenta de gravação reconhece o aparelho em Download Mode. Isso instala comunicação USB, não desbloqueia o telefone.

A documentação Magisk utiliza Odin, mas esta revisão **não confirmou um download público oficial Samsung de Odin para consumidores**. Os links de distribuição indicados são de terceiros; a disponibilidade de um deles não pôde ser confirmada. Antes de usar uma ferramenta obtida dessa forma, valide procedência e versão exigida pelo modelo. Heimdall também não é automaticamente intercambiável com Odin para todo aparelho.

Com ferramenta e método específicos validados, a associação de arquivos no fluxo de **primeira instalação** descrito pelo Magisk é:

| Campo | Arquivo do pacote correspondente |
| --- | --- |
| AP | AP modificado no próprio telefone |
| BL | BL original do mesmo pacote |
| CP | CP original do mesmo pacote |
| CSC | CSC previsto para a primeira instalação, com apagamento; não substituir automaticamente por HOME_CSC |

Essa tabela permite reconhecer os arquivos e conferir o plano; não autoriza clicar em **Start** sem confirmar o procedimento do seu modelo. Configurações de reparticionamento/PIT não são parte desta receita. A primeira instalação e uma atualização posterior têm regras diferentes, incluindo a escolha de CSC/HOME_CSC. Use a seção correspondente da documentação atual, e não a mesma tabela para atualizações.

Espere os estados de sucesso previstos, reinícios, eventual restauração de fábrica e configuração adicional do Magisk. Um erro durante a gravação exige registrar a mensagem e consultar o método de recuperação da variante. **Num Samsung com Magisk, a documentação proíbe tratar a restauração isolada de boot/init_boot/recovery/vbmeta como retorno seguro:** o caminho documentado é restaurar o conjunto original completo pela ferramenta apropriada, com possibilidade de apagar dados.

## 8. Confirmar root de verdade e controlar autorizações

Após o boot, abra Magisk. A versão principal instalada deve ser reconhecida; ter apenas a versão do APK ainda não confirma root. No [Termux](../android/termux.md), **fora de qualquer PRoot**, execute:

```bash
id
su -c id
```

O primeiro mostra a identidade normal do aplicativo, geralmente um `uid` próprio do Android. O segundo deve abrir no telefone um pedido de **superusuário**. Confirme que o aplicativo solicitante é o Termux que você acabou de utilizar; permita somente a solicitação esperada. A saída `uid=0(root)` confirma privilégio naquele processo.

Se aparecer `su: not found`, o mecanismo não está disponível nessa sessão; não baixe um binário `su` avulso. Se houver negativa, abra o painel **Superuser/Superusuário** no Magisk e confira a autorização do aplicativo. Em aparelhos com método de recuperação, a forma de boot pode decidir se root foi carregado: siga a combinação específica, sem presumir que todo boot normal carrega Magisk.

Reinicie pelo menu Android e repita o teste conforme o método do modelo. Verifique também Wi-Fi, chamadas quando utilizadas, armazenamento e acesso de recuperação. Não instale módulos nessa primeira validação: primeiro registre um estado básico estável. Root não garante USB-C, GPU, câmera ou containers; essas funções também dependem do kernel e dos drivers.

## 9. Problemas, backup e retorno

| Sintoma | Evidência a recolher | Próximo passo |
| --- | --- | --- |
| APK instalado, Magisk principal indisponível | Build, imagem, log do patch e método de boot | Distinguir instalação do app de instalação no boot; não repetir flash de outra imagem |
| Arquivo modificado não aparece | Últimas linhas do log, espaço e pasta Downloads | Corrigir a causa do patch; transferir somente um arquivo concluído |
| Fastboot não vê o telefone | Estado na tela, driver, cabo e `fastboot devices` | Guia ADB/Fastboot; não tentar ADB em modo Fastboot |
| Bootloop após primeira gravação | Alvo, slot, build e imagem original guardados | Procedimento de restauração específico, sem relock |
| Falha começou após módulo | Nome do módulo e último boot funcional | Desabilitar/remover pelo Magisk, quando Android acessível |
| Aplicativo bancário/DRM deixa de funcionar | Requisitos desse aplicativo e integridade do sistema | Root altera a confiança; não há garantia de compatibilidade ou receita universal de ocultação |

Se Android ainda funciona, a opção de **desinstalação do próprio Magisk** é o retorno preferencial documentado. Leia o que será restaurado e tenha o original preservado. Não substitua manualmente uma imagem que já não corresponde ao build atual depois de uma OTA.

Para uma falha causada por módulos, a [FAQ oficial](https://topjohnwu.github.io/Magisk/faq.html) documenta `magisk --remove-modules` numa shell apropriada com acesso ao Magisk. Esse comando **remove todos os módulos e reinicia**; não é uma correção geral de firmware. Só se aplica quando ADB/root necessários continuam acessíveis e os módulos são a causa identificada. O modo seguro do Android pode ajudar em alguns casos, mas sua entrada e disponibilidade dependem do aparelho.

Se o boot não volta, use [triagem](../recuperacao/triagem.md) e [restauração do Android](../recuperacao/restaurar-android.md). Antes de qualquer restauração, confira que o original é da mesma variante e de uma revisão permitida pelo bootloader. No ramo Samsung, preserve a exigência do pacote completo. Não experimente imagens de outro aparelho, comandos de formatação ou ferramentas de emergência com credenciais desconhecidas.

## Teste final e o que permanece específico

O caminho só foi concluído quando o Android inicia, Magisk reconhece a instalação, `su -c id` funciona fora de PRoot, o comportamento permanece após o boot adequado, seus dados estão recuperáveis e o método de retorno está documentado. Guarde a ficha, versões, hashes e logs sem credenciais.

Esta página tem **verificação documental em 11/10/2026 e nenhum teste de hardware**. Ela não confirma root de todas as variantes, desbloqueio de operadoras, funcionamento de Odin em qualquer Samsung ou restauração sem perda de dados. Essas verificações são bloqueadas sem o modelo/build e o procedimento específico; os passos de preparação, identificação, obtenção e patch permanecem úteis antes dessa decisão.

## Fontes consultadas

- [Magisk: instalação oficial e ramos por tipo de imagem/Samsung](https://topjohnwu.github.io/Magisk/install.html), [releases oficiais](https://github.com/topjohnwu/Magisk/releases), [FAQ](https://topjohnwu.github.io/Magisk/faq.html), [ferramentas](https://topjohnwu.github.io/Magisk/tools.html) e [arquitetura de boot](https://github.com/topjohnwu/Magisk/blob/master/docs/boot.md).
- [AOSP: bloqueio/desbloqueio](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking) e [partições genéricas de boot](https://source.android.com/docs/core/architecture/partitions/generic-boot).
- [Google: factory images](https://developers.google.com/android/images) e [OTAs completas](https://developers.google.com/android/ota).
- [payload-dumper-go: implementação e uso](https://github.com/ssut/payload-dumper-go), [assets publicados](https://github.com/ssut/payload-dumper-go/releases), [7-Zip](https://www.7-zip.org/) e [XZ Utils, incluindo binários Windows](https://tukaani.org/xz/).
- [Samsung: driver USB](https://developer.samsung.com/android-usb-driver), [Smart Switch](https://www.samsung.com/br/apps/smart-switch/), [white paper Knox](https://docs.samsungknox.com/admin/fundamentals/whitepaper/samsung-knox-mobile-security/assets/Knox-security-white-paper-r1.pdf) e [SamFirm.NET, ferramenta comunitária do autor](https://github.com/jesec/SamFirm.NET).
