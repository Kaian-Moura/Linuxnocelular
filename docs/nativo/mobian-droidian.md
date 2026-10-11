---
title: Mobian, Droidian e outras alternativas móveis
description: Escolha entre Linux mainline e adaptações Android sem presumir compatibilidade de imagens ARM64.
sidebar_position: 5
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Dois projetos, requisitos diferentes

**Mobian** integra Debian ao hardware móvel, com foco em dispositivos que conseguem usar kernel próximo de mainline. **Droidian** utiliza uma adaptação baseada em Halium e componentes Android para disponibilizar um ambiente GNU/Linux em aparelhos compatíveis. Compartilhar parte do ecossistema Debian não torna imagens e kernels intercambiáveis.

Resultado esperado: escolher uma opção com suporte demonstrável e instalar pela receita específica, preservando a capacidade de recuperação. Dificuldade: intermediária em modelo mantido; avançada em adaptação. Se não existe port, o resultado desta página é uma investigação de viabilidade, não um flash tentativo.

## Compatibilidade, materiais e preparação

Use os catálogos [Mobian](https://wiki.debian.org/Mobian/Devices) e [Droidian](https://devices.droidian.org/). Confirme variante, nível de suporte, imagem, firmware e instruções. O catálogo Mobian consultado distingue níveis de suporte e aparelhos Android como OnePlus 6/6T e Pixel 3a; **isso não estende suporte ao OnePlus 9 Pro ou a qualquer outro Snapdragon**.

Você precisa de computador, ferramentas do método, cabo de dados, espaço, backup e plano de restauração. Prepare uma ficha do estado original. Em A/B, confira a base nos slots conforme o projeto; não altere slot apenas porque um tutorial de outro aparelho usa `a`.

Se você nunca utilizou um terminal, faça antes [os primeiros passos](../comece-aqui/terminal-primeiros-passos.md) e prepare [ADB/Fastboot](../preparacao/adb-fastboot.md). Os comandos de download, extração, assinatura e gravação desta página são executados **no computador**, não no Android. Somente os comandos de identificação e senha depois do primeiro boot são executados **no telefone com Linux**, por seu terminal ou SSH.

Em Linux, instale as ferramentas de inspeção pelo gerenciador da sua distribuição. Escolha apenas o bloco correspondente ao computador:

```bash title="Computador Ubuntu ou Debian"
sudo apt update
sudo apt install file xz-utils unzip gnupg ca-certificates
```

```bash title="Computador Fedora"
sudo dnf install file xz unzip gnupg2 ca-certificates
```

`file` identifica formatos; `xz` e `unzip` verificam/extraem arquivos; GnuPG verifica assinaturas. Isso não instala drivers no telefone. No Windows/macOS, um instalador gráfico pode ser mais acessível, mas uma sequência manual feita para shell Linux não deve ser colada no PowerShell.

## Backup e riscos

Os métodos nativos podem apagar Android e `userdata`. Imagens Droidian específicas podem suportar criptografia e ocupar o armazenamento disponível, mas a capacidade depende da imagem escolhida. Um ZIP genérico de rootfs não fornece automaticamente o kernel da sua placa.

Preserve as partições e o firmware que o port precisa acessar. Remover “restos do Android” pode eliminar exatamente as bibliotecas/firmwares necessários. Não force a instalação de kernel genérico Debian ARM64 se o port usa um kernel ou initramfs específicos.

## Caminho A: Mobian em dispositivo listado

### 1. Abra a instalação da variante

Parta de [Mobian/Devices](https://wiki.debian.org/Mobian/Devices), depois da página do aparelho. O guia [OnePlus 6 e 6T](https://wiki.debian.org/InstallingDebianOn/OnePlus/OnePlus6), por exemplo, diferencia boot images pelos device trees e registra imagens semanais testadas. Uma imagem de rootfs compartilhada por uma família não permite compartilhar cegamente a boot image.

Preencha esta pequena ficha **antes do download**:

| Informação | Onde encontrar | Quando parar |
|---|---|---|
| Modelo e codename | Inventário do Android e página do aparelho | Nome comercial parecido, mas variante ausente |
| Família da imagem | Link fornecido pela instalação do modelo | Você só encontrou uma imagem ARM64 genérica |
| Interface e release | Catálogo de imagens e instrução vigente | A receita só registra uma imagem antiga e não valida a atual |
| Firmware Android preservado | Requisitos da página do modelo | Não sabe qual versão está nos slots necessários |
| Recursos indispensáveis | Matriz e bugs do kernel daquela imagem | USB, Wi-Fi ou vídeo exigidos pelo seu projeto estão quebrados |

Por exemplo, a instrução do OnePlus 6/6T usa imagens da família `sdm845`, mas distingue o boot do OnePlus 6 (`enchilada`) e do 6T (`fajita`). Na revisão de 11/10/2026, a página também registrava **USB OTG sem funcionar com kernel 7.1 ou posterior**. Portanto, um boot bem-sucedido com essa combinação não satisfaz o objetivo de mouse e teclado no hub. Esse registro é um motivo para verificar kernel/imagem e discutir uma versão documentada com o mantenedor, não para instalar um kernel anterior por palpite.

Se houver instruções diferentes para SD, eMMC e Android/UFS, siga somente a do seu hardware. Uma receita PinePhone não é uma receita para smartphone Android.

### 2. Baixe e verifique

Abra o [catálogo oficial de imagens](https://images.mobian.org/) pelo link da página do modelo. Ele pode aparecer como uma listagem de pastas e arquivos: isso é normal. Escolha a família, a release e a interface documentadas. Para os dispositivos Qualcomm citados, a página do OnePlus aponta para a [pasta `qcom/weekly`](https://images.mobian.org/qcom/weekly/); **não escolha essa pasta para qualquer Qualcomm**.

Baixe a coleção `.tar.xz` oferecida e os arquivos de verificação que correspondem à mesma publicação. Uma coleção pode conter mais de uma boot image e uma rootfs; ela não é necessariamente uma imagem única para gravar num disco. Aguarde o navegador terminar: arquivos `.part` ou `.crdownload` são incompletos. Mova os downloads para uma pasta nova, por exemplo `smartphone-linux/mobian` dentro da sua pasta pessoal, e abra um terminal nessa pasta. Confira `pwd` e `ls` antes de prosseguir.

A [verificação oficial Mobian](https://wiki.debian.org/Mobian/Verify) utiliza assinatura GPG dos checksums e o chaveiro `mobian-archive-keyring`. **A assinatura identifica o publicador; o checksum confere os bytes da imagem.** Baixar a chave de um comentário aleatório e ver “Good signature” não comprova que ela pertence ao Mobian.

O projeto anunciou uma [rotação de chaves em outubro de 2025](https://blog.mobian.org/posts/2025/10/new-stable-rotating-keys/). A chave de assinatura de imagens publicada nesse anúncio tem fingerprint:

```text
782C 6C58 B583 FE96 6CEE 44EB F8BD AB78 BEE2 46C2
```

Confira na fonte atual se ela continua válida. Um chaveiro antigo do Debian stable pode não conter a chave que assinou uma imagem recente. Consulte a [página oficial do pacote](https://packages.debian.org/mobian-archive-keyring) e a instrução Mobian antes de instalar/importar uma versão. Não troque todos os repositórios do computador para unstable apenas para obter uma chave, e não ignore a assinatura por ter recebido “No public key”.

Se você já tem o **chaveiro atualizado obtido da fonte documentada**, verifique um conjunto cujos nomes reais terminem em `.sha256sums` e `.sha256sums.sig`:

```bash title="Computador Linux, na pasta dos arquivos baixados"
gpg --keyring /usr/share/keyrings/mobian-archive-keyring.gpg --verify COLECAO.sha256sums.sig COLECAO.sha256sums
sha256sum --check COLECAO.sha256sums
```

`COLECAO` é um marcador: substitua pelo nome integral daquele download, mantendo as extensões reais. O primeiro comando precisa terminar com verificação válida da chave Mobian esperada; só depois execute o segundo. `OK`/`SUCESSO` no segundo é o resultado de integridade esperado. Um aviso de confiança do GPG e uma assinatura incorreta são situações diferentes: confira o fingerprint na fonte confiável; nunca trate `BAD signature` como aviso dispensável. Se a publicação mudou o formato, siga seu arquivo de instruções; não aplique `--check` a um arquivo que contém apenas um hash sem nome.

Depois, confira formato e conteúdo no computador:

```bash
file ARQUIVO.tar.xz
xz --test ARQUIVO.tar.xz
sha256sum ARQUIVO.tar.xz
tar -tf ARQUIVO.tar.xz
```

`ARQUIVO.tar.xz` é o nome real obtido da publicação, não um download oferecido aqui. `tar -tf` lista conteúdo sem gravar no telefone. Esses comandos verificam aspectos de integridade e formato; assinatura/autenticidade seguem o método Mobian. Não execute scripts de um arquivo não verificado.

Extraia sem privilégios e sem misturar coleções:

```bash
mkdir imagem-extraida
tar -xJf ARQUIVO.tar.xz -C imagem-extraida
ls -lh imagem-extraida
```

`-x` extrai, `-J` descomprime XZ e `-C` define a pasta de destino. O resultado esperado são os artefatos descritos na página do modelo, não “um instalador Android”. Se a extração relata fim inesperado, volte à verificação/download; nenhum desses comandos exige alterar o telefone.

### 3. Instale pela receita, depois verifique no telefone

Execute a sequência específica de mídia/bootloader/partições da página do dispositivo. Não extrapole comandos que apagam `dtbo` ou `userdata` para outro modelo. Antes da execução, registre arquivos, slots, destinos e forma de retorno.

Na instalação manual, há uma fronteira que este guia não pode substituir por um comando universal: **a página do modelo define onde cada artefato será gravado**. Abra essa página ao lado do terminal e associe, linha por linha, arquivo → partição → condição. Faça primeiro apenas as consultas de comunicação recomendadas. Confirme que o telefone mostra o modo exigido e que só existe um alvo conectado. Uma instrução para `boot` de `enchilada` não autoriza gravar essa imagem em `fajita` ou `lemonadep`.

Se a página depender de uma versão específica de firmware, tenha essa base verificada antes. Se ela pedir uma ação destrutiva sem você compreender a condição, leve a ficha e o log ao mantenedor; manter Android com [PRoot](../android/proot-distro.md) é uma alternativa enquanto a lacuna é resolvida. A ausência de uma receita completa para o modelo é um resultado do diagnóstico, não uma justificativa para ensaiar destinos de flash.

Depois do boot:

```bash
cat /etc/os-release
uname -a
df -h
passwd
```

Confira versão e troque imediatamente a senha publicada pela imagem. Se houver expansão automática no primeiro boot, espere o tempo previsto antes de desligar. Use os repositórios correspondentes à release instalada; não mude stable/testing/unstable para resolver um driver sem entender as consequências.

## Caminho B: Droidian com adaptação correta

### 1. Escolha imagem específica ou estágio de porting

O [repositório canônico de imagens Droidian](https://github.com/droidian-images/droidian) distingue imagens graváveis por Fastboot de ZIPs graváveis por recovery. O primeiro é recomendado quando existe para o dispositivo. ZIPs genéricos servem também a fases de adaptação e dependem de kernel/configuração apropriados.

Confira a API do **vendor Android**, a arquitetura e o pacote de adaptação. O repositório descreve variantes API28/29/30/32/33 conforme base Android; isso não autoriza instalar um ZIP por adivinhar a versão exibida no aparelho. Firmware vendor e Android da interface podem ter históricos diferentes após ROMs customizadas.

| Base vendor descrita pelo projeto | Variante do rootfs genérico |
|---|---|
| Android 9 | `api28` |
| Android 10 | `api29` |
| Android 11 | `api30` |
| Android 12 ou 12.1 | `api32` |
| Android 13 | `api33` |

Essa tabela explica a nomenclatura do repositório; **não é uma matriz de aparelhos compatíveis**. O kernel precisa de configuração para Halium e a adaptação precisa corresponder ao telefone. No [catálogo Droidian](https://devices.droidian.org/), abra o aparelho e siga seu link de instalação/adaptação. Se não há registro, você está no caminho de [porting](porting.md), que exige desenvolvimento, não num tutorial pronto para usuário final.

### 2. Baixe e execute o Droidian Installer quando houver receita

Abra as [releases oficiais do Droidian Installer](https://github.com/droidian-releng/droidian-installer/releases). Na revisão, a versão publicada era **0.0.6**. Expanda **Assets** e escolha o pacote do computador, não a arquitetura do telefone. Não baixe “Source code” se você quer o aplicativo pronto.

| Computador | Pacote publicado na versão consultada |
|---|---|
| Ubuntu/Debian x86-64 | [`droidian-installer_0.0.6_linux_amd64.deb`](https://github.com/droidian-releng/droidian-installer/releases/download/0.0.6/droidian-installer_0.0.6_linux_amd64.deb) |
| Linux x86-64 com AppImage | [`droidian-installer_0.0.6_linux_x86_64.AppImage`](https://github.com/droidian-releng/droidian-installer/releases/download/0.0.6/droidian-installer_0.0.6_linux_x86_64.AppImage) |
| Windows x64 | [`droidian-installer_0.0.6_win_x64.exe`](https://github.com/droidian-releng/droidian-installer/releases/download/0.0.6/droidian-installer_0.0.6_win_x64.exe) |
| macOS x64 | [`droidian-installer_0.0.6_mac_x64.dmg`](https://github.com/droidian-releng/droidian-installer/releases/download/0.0.6/droidian-installer_0.0.6_mac_x64.dmg) |

Se seu computador é ARM64, essa tabela não oferece um pacote nativo para ele. Consulte o suporte atual do aplicativo em vez de renomear um x86-64. Cada pacote tem um arquivo `.sha256` nos mesmos Assets. Os arquivos dessa release consultados continham apenas o hash; compare os valores, sem `sha256sum -c` direto:

```bash title="Computador Linux, na pasta do DEB e seu checksum"
cat droidian-installer_0.0.6_linux_amd64.deb.sha256
sha256sum droidian-installer_0.0.6_linux_amd64.deb
```

Para esta publicação específica, o checksum do DEB lido era `fe523925beca493ee84e6e20b2ec48447dc66283fabb033a876a2d7a50898850`. Ainda confira o arquivo publicado na release e a correspondência exata de versão. Uma release nova exige valores novos. No Windows use `Get-FileHash NOME.exe -Algorithm SHA256`; no macOS, `shasum -a 256 NOME.dmg`, substituindo os nomes reais.

No Ubuntu/Debian, instale o DEB verificado na pasta onde o baixou:

```bash
sudo apt install ./droidian-installer_0.0.6_linux_amd64.deb
```

Depois abra **Droidian Installer** pelo menu como usuário comum. Para o AppImage verificado:

```bash
chmod u+x droidian-installer_0.0.6_linux_x86_64.AppImage
./droidian-installer_0.0.6_linux_x86_64.AppImage
```

`chmod` permite executar apenas esse arquivo. Em caso de erro FUSE, consulte as [orientações AppImage](https://docs.appimage.org/user-guide/troubleshooting/fuse.html), incluindo extração quando apropriada; não execute o aplicativo como root nem acrescente uma opção que desabilite sua sandbox. Windows usa o `.exe` e seu assistente; macOS abre o `.dmg`, instala o aplicativo e concede somente permissões necessárias. Se o sistema bloquear um aplicativo cuja origem você ainda não verificou, não contorne o bloqueio primeiro.

A janela deve permitir escolher/identificar um dispositivo. Confirme **modelo exato**, opções apresentadas e requisitos de firmware. Se a receita não existe ou o nome não coincide, pare. Não acrescente uma configuração local de outro aparelho. O fluxo pode pedir acesso ADB, desbloqueio, Fastboot ou recovery; execute cada instrução física exibida e não envie flashes simultâneos por outro terminal.

Preserve o log do instalador. O [README upstream](https://github.com/droidian-releng/droidian-installer) publica estes locais:

- Linux: `~/.cache/droidian/droidian-installer.log`.
- Windows: `%APPDATA%\droidian\droidian-installer.log`.
- macOS: `$HOME/Library/Caches/droidian/droidian-installer.log`.

Se estiver usando pacote sandboxed, consulte o caminho correspondente do README; não presuma que o arquivo ficará no local do DEB. Retire números de série e dados pessoais antes de publicar.

### 3. Alternativa manual: imagem específica com script

Use apenas um arquivo que o catálogo/port declara destinado ao seu codename e firmware. Baixe pelo [repositório canônico](https://github.com/droidian-images/droidian) ou link da adaptação, acompanhe sua release e verifique o formato/hash que ela publica. **Não existe nesta página um ZIP genérico certificado para seu aparelho.**

No computador Linux, liste o conteúdo antes de extraí-lo: `unzip -l NOME.zip` para ZIP, ou `tar -tf NOME.tar.xz` para coleção TAR/XZ. Substitua `NOME` pelo arquivo real e use uma pasta nova. Leia `README` e `flash_all.sh` no editor. Identifique a checagem de produto, partições, limpeza e reboot, e compare com a instrução do modelo. Scripts precisam ser tratados como programas que alteram seu dispositivo, mesmo quando são curtos.

O repositório exige atenção à mesma versão Android nos slots A/B. Isso é uma condição desse método, não um motivo para copiar partições brutas entre slots sem guia. Em método recovery, confirme que o recovery aceita a base e o formato. Sideload fornece um pacote ao recovery, que decide quais operações executar; não é uma cópia inocente de arquivo.

**Somente se** o arquivo foi verificado, é específico do seu modelo, a receita atual pede esse script, os pré-requisitos A/B/vendor foram cumpridos e a recuperação está preparada, entre na pasta extraída e execute a instrução upstream:

```bash title="Computador Linux, pasta da imagem específica já validada"
./flash_all.sh
```

Este é um comando de **instalação destrutiva condicionado à imagem específica**, não um comando para descobrir compatibilidade. O script fornecido determina os flashes. Se `Permission denied` se refere a USB, corrija a [permissão das ferramentas](../preparacao/adb-fastboot.md); se se refere ao arquivo, confira a autorização de execução do script autenticado. Não repita com `sudo` automaticamente nem remova sua checagem de produto.

O método upstream prevê reboot automático ao terminar. Espere seu resultado de sucesso antes de tocar no cabo. Se a transferência falhar, preserve a tela de manutenção e o log, identifique qual etapa concluiu e procure a orientação de retomada do port.

### 4. Recovery ZIP: caminho dependente de adaptação

Esse caminho exige recovery compatível, kernel preparado e, quando indicado, bundle de adaptação **daquele modelo**. A opção “Advanced → ADB Sideload” descrita pelo projeto se refere a recoveries que a oferecem; a interface de um recovery stock pode ser diferente ou rejeitar o pacote.

No computador, `adb devices` deve listar o alvo no estado `sideload` após ativar a opção física. Para entender a forma do comando, a operação documentada é `adb sideload ARQUIVO-VALIDADO.zip`: ele envia ao recovery um pacote previamente escolhido, que pode instalar e apagar dados. **Não execute enquanto não tiver os nomes exatos e a ordem confirmados pela adaptação.** Use os nomes realmente baixados; não copie erros de grafia de nomes de exemplo como nomes de arquivos existentes.

Quando há rootfs, devtools opcional e adaptação separados, o upstream pede sair e reabrir ADB Sideload entre os pacotes. Depois faça o reboot que a receita especifica; alguns fluxos reiniciam outra vez antes de apresentar Phosh. Se o recovery rejeita assinatura, arquitetura ou versão, não desative a validação e não formate `userdata` para “tentar”. Retorne à identificação da base/kernel/pacote.

### 5. Acompanhe o primeiro boot e a integração

Após instalação, identifique kernel e release, troque credenciais padrão e teste recursos da adaptação. Se falta rede, preserve logs antes de alterar pacotes. Um pacote de adaptação contém configurações e eventualmente binários necessários; remover como “bloatware” pode quebrar o port.

O repositório de imagens consultado publica passcode inicial `1234`. Use esse valor somente se a **sua release** o confirma, e troque-o imediatamente no sistema. O resultado visível esperado é a tela de desbloqueio/Phosh descrita pela imagem; um loop na logo Android não é uma instalação concluída. No terminal do telefone, `cat /etc/os-release`, `uname -a` e `df -h` conferem distribuição, kernel e espaço. Não confunda mudar o passcode gráfico com trocar a senha de todas as contas: siga a documentação da sessão e confira o usuário administrativo.

A recomendação de formatar dados encontrada numa seção de troubleshooting upstream é destrutiva. Não a transforme na primeira tentativa genérica para toda falha de boot. Confirme primeiro estado da partição, variante, firmware, boot image e instrução vigente.

## Outras distribuições

Sailfish OS disponibiliza versões para modelos oficiais e ports comunitários, com componentes e licenças que podem variar. Consulte [dispositivos e versões Android requeridas](https://docs.sailfishos.org/Support/Supported_Devices/) e o guia específico. Uma documentação de HADK ensina adaptação, não prova suporte pronto ao seu telefone.

Para qualquer outro projeto, exija a mesma combinação: código/variante, mantenedor, imagem rastreável, instrução de instalação, matriz de funções e recuperação. Uma demonstração de boot ou uma distribuição genérica aarch64 é evidência de possibilidade, não tutorial completo de instalação.

## Erros, alternativas e recuperação/rollback

| Sintoma | Verificação antes de qualquer mudança destrutiva |
|---|---|
| Arquivo `.part` ou extração incompleta | Aguarde/refaça o download; compare hash e espaço no computador |
| GPG não conhece a chave Mobian | Confira versão do chaveiro, fingerprint e rotação oficial |
| Assinatura inválida ou hash diferente | Não execute; refaça o download da fonte e investigue a divergência |
| Instalador não oferece o modelo | Não force seleção; confirme catálogo/receita ou escolha Android com Linux |
| ADB aparece `unauthorized` | Autorize no Android; não é erro de assinatura da imagem |
| Fastboot não encontra alvo | Confirme modo, cabo de dados e permissões/driver do computador |
| Script rejeita produto | Compare codename e pacote; não retire a proteção |
| Phosh abre, mas periféricos falham | Compare matriz/kernel/firmware e diagnostique a camada específica |
| Loop no primeiro boot | Preserve logs e confirme base, adaptação e slots antes de formatar |

Se o catálogo só apresenta demonstração, use como laboratório, mantendo outra máquina para tarefas diárias. Se faltar kernel/adaptação, leia [porting](porting.md). Se o arquivo está disponível apenas em mirror pessoal sem origem verificável, registre a lacuna e não o recomende como distribuição oficial.

Para retorno a Android, execute o método específico preparado. Se havia dados criptografados, uma imagem antiga pode não recuperar chaves. Não religue bootloader sobre imagens não reconhecidas. Após reinstalação, revise firmware e recursos originais antes de uma nova tentativa.

## Testes finais

Inicialize sem computador, confirme rede, entrada, carga e interface, reinicie e repita periféricos. Registre nome da imagem, kernel, firmware de base e funções testadas. Uma alternativa só é melhor para seu mini-PC quando cumpre esses requisitos, não porque oferece `apt`.

Seu registro final deve distinguir **“o projeto oferece imagem”**, **“a página afirma suporte”** e **“eu testei esta função”**. Teste pelo menos bloqueio/desbloqueio da tela, áudio, Wi-Fi após reboot, carga sob uso e reconexão de hub. Não considere falha de hardware um motivo para misturar pacotes Ubuntu com Debian ou instalar todos os repositórios possíveis.

## Fontes e limites da verificação

Consulta em **11/10/2026**, sem flash físico. Parte do Debian Wiki retornou 403; conteúdo indexado foi usado para localizar a referência, e a instrução vigente precisa ser lida antes da gravação. O site de instalação Droidian não forneceu seu conteúdo completo ao leitor automatizado; o README canônico de imagens, o README do instalador e seus Assets foram lidos diretamente. A referência ao USB OTG do OnePlus 6/6T descreve aquela página/kernel, não um teste físico deste projeto.

- [Mobian: objetivos](https://wiki.debian.org/Mobian/) e [dispositivos](https://wiki.debian.org/Mobian/Devices).
- [Mobian: OnePlus 6/6T](https://wiki.debian.org/InstallingDebianOn/OnePlus/OnePlus6).
- [Mobian: assinatura das imagens](https://wiki.debian.org/Mobian/Verify), [chaveiro Debian](https://packages.debian.org/mobian-archive-keyring) e [rotação de chaves](https://blog.mobian.org/posts/2025/10/new-stable-rotating-keys/).
- [Mobian: catálogo de imagens](https://images.mobian.org/).
- [Droidian: imagens canônicas](https://github.com/droidian-images/droidian).
- [Droidian: instalação](https://docs.droidian.org/install/) e [Droidian Installer](https://github.com/droidian-releng/droidian-installer), com [releases oficiais](https://github.com/droidian-releng/droidian-installer/releases).
- [Droidian: kernel/adaptação](https://docs.droidian.org/porting-guide/).
- [Sailfish: suporte oficial e comunitário](https://docs.sailfishos.org/Support/Supported_Devices/).
