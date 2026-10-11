---
title: Fairphone 4 — exemplo de instalação por modelo
description: Um roteiro condicionado para FP4 com UBports Installer, Ubuntu Touch ou imagem postmarketOS/Nura.
sidebar_position: 7
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Escopo e resultado esperado

Este guia é **exclusivo ao Fairphone 4, código FP4**. Não serve para FP3, FP5 ou Fairphone de outra geração. Mostra como utilizar um instalador que possui uma receita real para a placa, em vez de aplicar comandos genéricos a qualquer telefone. Resultado esperado: sistema escolhido inicializando diretamente, com os recursos que o port documenta. Dificuldade: intermediária.

Este projeto não executou a instalação num FP4 físico. A elegibilidade e o fluxo foram conferidos em documentação e configuração upstream, em **11/10/2026**. Se o aparelho não cumprir as condições atuais, pare antes de desbloquear ou gravar.

## Compatibilidade, requisitos e materiais

- FP4 identificado em etiqueta e sistema; confirme por [inventário](../compatibilidade/inventario.md).
- Computador Linux/macOS/Windows aceito pelo UBports Installer e pacote correspondente à arquitetura do computador.
- Cabo USB direto com dados, botões utilizáveis, tela para confirmações e energia suficiente.
- Backup externo validado e pacote de recuperação Fairphone correto.
- Tempo para preparar a base Android e verificar riscos de downgrade.

A [página UBports do FP4](https://devices.ubuntu-touch.io/device/fp4/) indica Halium 11, instalador e saída de vídeo. Exige **Fairphone OS Android 11**, e diz que uma custom ROM previamente instalada não satisfaz a condição. Na [receita do UBports Installer lida nesta revisão](https://github.com/ubports/installer-configs/blob/master/v2/devices/FP4.yml), essa confirmação faz parte da preparação **global**, antes da escolha do sistema. Portanto, **também se aplica ao caminho postmarketOS oferecido por essa receita**, enquanto a configuração vigente permanecer assim.

Para instalar **postmarketOS/Nura por outro método**, confirme a [página do port FP4](https://wiki.postmarketos.org/wiki/Fairphone_4_%28fairphone-fp4%29), a versão atual e suas condições de firmware. O FP4 aparece nas imagens community da [página Nura](https://nura.eco/install/). A exigência da receita UBports não deve ser extrapolada para toda imagem Nura, nem ignorada dentro desse instalador. Uma categoria mantida não elimina possíveis limitações de recursos.

Antes de começar, escolha uma das duas rotas abaixo e mantenha-a até o fim:

| Rota | O que será usado | Condição que você precisa confirmar |
|---|---|---|
| UBports Installer → Ubuntu Touch | Receita FP4, imagens do canal oferecido | Fairphone OS Android 11, desbloqueio e requisitos da página UBports |
| UBports Installer → postmarketOS | Receita FP4, release/interface oferecidas | Mesma preparação global Android 11 enquanto essa receita a exigir |
| Imagem Nura/pmbootstrap → método do port | Artefatos `fairphone-fp4` e instrução atual | Firmware e destinos definidos pelo port dessa versão |

Não combine a preparação de uma rota com os comandos da outra sem confirmar a equivalência na fonte. Em particular, uma interface exibida no catálogo não promete GNOME desktop acelerado, vídeo externo ou todas as câmeras.

## Backup e riscos específicos

Desbloquear e instalar podem apagar todos os dados. O FP4 tem esquema A/B e partições dinâmicas; o instalador controla destinos conforme sua receita. Não altere manualmente os slots ou apague `dtbo` fora desse procedimento. Retornar ao firmware original pode requerer reconstruir o conjunto de partições correto.

A Fairphone alerta que relock após instalar software com patch mais antigo pode inutilizar o boot. Se a base necessária for Android 11 e seu estado atual for mais novo, avalie o procedimento oficial e **não religue a trava para esconder o aviso**. Não confunda reinicializar o telefone com restaurar suas proteções e chaves.

## 1. Prepare a referência original e a saída de emergência

Reserve uma pasta no computador, por exemplo `smartphone-linux/fp4`, com subpastas `inventario`, `backup`, `recuperacao` e `instalador`. Isso evita confundir o pacote Android de retorno com a imagem Linux. Se estiver começando do zero no computador, leia [downloads e ferramentas](../comece-aqui/computador-downloads.md) e [terminal](../comece-aqui/terminal-primeiros-passos.md) antes. Não use uma sessão live sem espaço persistente suficiente para guardar downloads e backups após reiniciar.

Abra o [guia oficial de restauração manual](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone) e localize **FP4**. Baixe somente o pacote cuja origem e condições você conferiu. Anote hashes publicados e requisitos, incluindo carga. Não use um pacote FP3 nem um script renomeado.

No computador com Android autorizado:

```bash
adb devices -l
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.security_patch
adb shell getprop ro.build.fingerprint
```

Esses comandos são executados no **terminal do computador**, com ADB instalado e o Android autorizado. Se você usa Platform Tools extraído e está em sua pasta, utilize `./adb` no Linux/macOS ou `./adb.exe` no PowerShell, conforme [preparação](../preparacao/adb-fastboot.md). O primeiro comando precisa mostrar o aparelho em estado `device`; `unauthorized` exige aceitar o diálogo no telefone. `getprop` apenas lê propriedades.

Salve os valores sem publicar serial/IMEI. Se a identidade divergir de FP4, não continue. Faça exportação de fotos, documentos, autenticadores e dados de aplicativos conforme [backup](../preparacao/backup.md). Abra alguns arquivos copiados no computador para confirmar que o backup existe fora do armazenamento que será apagado.

O resultado esperado desta etapa é: identidade FP4 confirmada, ficha de firmware/patch salva, backup legível e pacote original de recuperação rastreável. Ainda não há Linux no aparelho e nenhuma partição precisa ter sido alterada.

## 2. Prepare bootloader e firmware pela instrução correta

Siga o [roteiro de desbloqueio com exemplo FP4](../preparacao/desbloquear-bootloader.md) e o [procedimento oficial Fairphone](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader). Ele inclui a preparação no Android, a comunicação pelo computador e as confirmações físicas. Leia todo o processo antes de aceitar a limpeza. Não substitua a etapa por um comando encontrado para OnePlus.

Quando uma limpeza retornar ao Android inicial, restabeleça o acesso e confira novamente base/variante. Para as duas opções da **receita UBports FP4 consultada**, cumpra a base Fairphone OS Android 11. Se o aparelho está numa versão mais nova, isso implica avaliar um downgrade; não é uma etapa inofensiva nem se resolve mudando o nome da versão no instalador.

### Onde obter a base Android 11 documentada

Na [página oficial Fairphone de instalação manual](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone), abra a seção **Fairphone 4 → Android 11**. A publicação consultada oferecia:

- Arquivo: [`FP4-FP4K-factory.zip`](https://fairphone-android-builds.ams3.digitaloceanspaces.com/FP4/A11/FP4-FP4K-factory.zip).
- Versão: `FP4.FP4K.A.179`; release de 03/02/2023; patch de segurança de 05/01/2023.
- SHA-256: `1f019c4fdd27b6e57086cea11acf4f81f19888efb47869200cb332812b09e510`.

Esse registro identifica o artefato da instrução; **não recomenda usar Android 11 antigo como sistema cotidiano**. Antes de instalá-lo, leia as condições atuais do fabricante, o estado de proteção contra rollback e o guia do port. **A disponibilidade do ZIP antigo não autoriza rollback de Android 15 ou de qualquer estado mais novo.** Se você não consegue confirmar a versão/base/patch permitidos para o seu estado, a rota UBports permanece bloqueada: não force nem use relock como tentativa. Consulte o mantenedor ou escolha uma rota cujas condições você consegue cumprir, incluindo manter Android e usar Linux sem flash.

Baixe pelo navegador, espere terminar e mantenha o nome original. No computador Linux, na pasta do download:

```bash
sha256sum FP4-FP4K-factory.zip
unzip -l FP4-FP4K-factory.zip
```

Compare os 64 caracteres do hash com o valor da **página oficial vigente**. `unzip -l` só lista o arquivo. A extração e execução do script específico são explicadas no [exemplo de restauração FP4](../recuperacao/restaurar-android.md#exemplo-completo-fairphone-4-com-imagem-de-fábrica); para preparar Android 11, selecione o pacote Android 11 e suas condições, não o pacote atual de retorno Android 15 desse exemplo. A forma de extrair não torna versões intercambiáveis.

Depois de gravar a base por um método permitido, deixe Android concluir o boot e confirme novamente `ro.build.version.release`, `ro.build.fingerprint` e patch. “11” sozinho não basta: deve ser **Fairphone OS** esperado, não outra ROM cuja interface também diz Android 11. Faça uma captura de sua ficha e só depois volte ao instalador Linux.

Para instalação Nura fora do UBports, use a condição de firmware da página vigente do port, não faça esse downgrade automaticamente. **Se fontes ou instruções divergirem, suspenda a gravação e consulte o mantenedor.**

Testar consultas em Fastboot permite confirmar comunicação, quando estiver no modo certo:

```bash
fastboot devices
fastboot getvar product
fastboot getvar current-slot
fastboot getvar unlocked
```

Confira resultados e documentação; não altere `current-slot` manualmente nesta etapa. Um retorno que não corresponda ao esperado pelo instalador pede investigação, não `--force`.

### Reconheça os modos físicos do FP4

A receita upstream orienta entrar no bootloader com o telefone desligado, segurando **Volume para baixo** enquanto conecta o cabo USB ao computador. O menu **FastBoot Mode** aparece no telefone. Se já existe Android com ADB autorizado, `adb reboot bootloader` é a alternativa por software, executada no computador.

O instalador também distingue **bootloader Fastboot**, **recovery** e **fastbootd**. Na receita consultada, a passagem para recovery usa os botões de volume no menu FastBoot Mode para selecionar **Recovery mode** e Power para confirmar; a passagem para fastbootd envolve a opção de Fastboot no recovery. Siga os nomes e imagens do instalador atual. Se você está em fastbootd e ele pede bootloader, a opção **Reboot to bootloader** faz essa passagem; reiniciar para Android é outra coisa.

Não pressione combinações aleatórias durante uma gravação. Uma tela de manutenção e a espera por ação física podem ser normais; a conclusão depende do estado e da instrução exibidos no computador.

## 3. Instale e abra o UBports Installer

Obtenha o instalador pelo link da página do FP4 ou pelas [releases upstream](https://github.com/ubports/ubports-installer/releases). O [tutorial do UBports Installer](ubuntu-touch.md#2-obtenha-e-execute-o-ubports-installer) mostra os arquivos oficiais consultados, como conferir SHA-256 e instalar o DEB/AppImage/EXE/DMG. Na revisão, a release era 0.11.2; não baixe “Source code” se quer a janela pronta.

Execute como usuário comum, sem `sudo`. Conecte o aparelho diretamente ao computador; retire o hub durante a gravação para reduzir variáveis, salvo orientação explícita diferente. A janela inicial deve detectar ou permitir escolher o telefone. Se não houver detecção automática, selecione manualmente **Fairphone 4** somente depois de confirmar que o aparelho é FP4; isso não é uma forma de contornar incompatibilidade.

Confira a detecção FP4 e a seleção de sistema:

- **Ubuntu Touch:** escolha o canal estável oferecido para o FP4 e leia as opções de bootstrap, particionamento e limpeza da primeira instalação. Não use a opção de preservar dados como método de migrar Android intacto.
- **postmarketOS/Nura:** só prossiga se o instalador atual realmente oferecer esse sistema e uma release/interface para FP4. Se a opção desaparecer ou falhar, use a página vigente de imagens/instalação, sem importar uma configuração local de outro modelo.

Salve versão do instalador, sistema, release, interface e opções escolhidas. Interfaces disponíveis podem mudar; não prometemos GNOME acelerado por simplesmente selecioná-lo.

### O que selecionar e esperar na interface

No fluxo Ubuntu Touch da configuração consultada, os campos são **Channel**, **Wipe Userdata**, **Partitioning** e **Bootstrap**. A receita marca a preparação/limpeza de primeira instalação como necessária. Leia o texto de cada campo antes de avançar: migrar Android para Ubuntu Touch é diferente de reinstalar Ubuntu Touch preservando dados já compatíveis. Não desmarque uma preparação necessária para tentar proteger um backup que deveria estar fora do telefone.

No fluxo postmarketOS da receita, os campos são **Release** e **User Interface**. Escolha uma combinação efetivamente oferecida e confira sua matriz. O nome histórico postmarketOS pode continuar em receitas/arquivos depois da mudança de nome do projeto para Nura. Isso não autoriza adicionar à mão uma release que o instalador não suporta.

Durante o processo, espere telas de confirmação de modelo/base/desbloqueio, pedidos de mudar modo, download de imagens e progresso de gravação. Deixe a rede do computador disponível. Quando o telefone se desconecta e reconecta ao mudar de modo, o sistema do computador pode emitir som de USB; o instalador deve continuar a acompanhar. Se ficar numa espera, anote qual modo ele pede e qual o telefone mostra, em vez de reiniciar serviços ao acaso.

## 4. Entenda o que o instalador pode fazer

A [configuração upstream FP4](https://github.com/ubports/installer-configs/blob/master/v2/devices/FP4.yml), lida durante esta revisão, possui receitas diferentes para Ubuntu Touch e postmarketOS. Ela verifica desbloqueio e controla slots. O fluxo Ubuntu Touch pode reorganizar partições lógicas; o fluxo postmarketOS seleciona slot A, remove `dtbo` e grava imagens em `userdata` e `boot`.

Essa descrição explica **por que é destrutivo e específico**; não é uma lista de comandos para repetir por conta própria. Uma futura versão do instalador pode mudar a receita. A fonte aberta permite revisar o código que executará ações reais, preservando transparência.

Siga cada instrução de modo exibida. Não envie comandos simultâneos por outro terminal enquanto o instalador grava. Se houver erro, copie o log e a última etapa; não reinicie repetidamente nem misture sequências manuais.

## 5. Primeiro boot e verificação

Aguarde inicialização e expansão previstas. Configure senha/bloqueio, rede e atualizações pelo método do sistema escolhido. Se obtiver terminal:

```bash
cat /etc/os-release
uname -a
df -h
```

Essas consultas verificam distribuição, kernel e espaço. Troque credenciais padrão conforme a imagem; não use as de outra distribuição por hábito. Teste Wi-Fi, áudio, carga, entrada e vídeo externo. Ter “Display out” no catálogo não certifica seu hub, cabo e perfil de energia.

O resultado visual esperado é o assistente/tela de bloqueio da distribuição e interface escolhidas. A logo Fairphone sozinha não comprova que o Linux abriu. Se o instalador diz que concluiu e o telefone fica na logo além do tempo indicado pelo projeto, salve os logs e confirme firmware, opção de bootstrap e imagem, sem alternar rotas de instalação.

Para Ubuntu Touch, siga as configurações e atualizações do próprio sistema; não transforme sua rootfs em Ubuntu desktop com `apt` arbitrariamente. Para Nura, use `apk` e repositórios da release instalada. Primeiro comprove o sistema básico; personalização do desktop, programação e serviços são etapas posteriores.

## Alternativa: inspecione uma imagem Nura do FP4

O [catálogo oficial FP4 v26.06](https://images.postmarketos.org/bpo/v26.06/fairphone-fp4/) consultado oferecia subpastas por interface. Em **Phosh → 20261009-0127**, havia um par com nomes completos:

```text
20261009-0127-postmarketOS-v26.06-phosh-29.1-fairphone-fp4-boot.img.xz
20261009-0127-postmarketOS-v26.06-phosh-29.1-fairphone-fp4.img.xz
```

Isso é um exemplo real de **seleção e identificação** de arquivos, não uma garantia física da build. Baixe ambos da [mesma pasta datada](https://images.postmarketos.org/bpo/v26.06/fairphone-fp4/phosh/20261009-0127/), com os checksums correspondentes. O [tutorial de imagens](postmarketos-imagens.md) explica verificação e descompressão XZ. O primeiro é boot; o segundo é a imagem de sistema. Não misture datas/interfaces e não escolha um FP5 por ter processador Qualcomm.

Antes de qualquer flash manual, abra a instrução atual do port e confirme firmware, partições e condições dessa rota. A wiki limitou a leitura automatizada desta revisão, então **não publicamos uma sequência manual de flash FP4 como se a tivéssemos validado para essa build**. Você pode usar a rota UBports quando suas condições forem cumpridas, ou obter a confirmação da rota manual junto ao port. `pmbootstrap` também pode gerar os artefatos, mas o resultado da geração não resolve essa checagem de instalação.

## Erros e alternativas

| Problema | Ação fundamentada |
|---|---|
| Não detecta FP4 | Confirme cabo, ADB/driver/permissões e modo atual |
| Instalador pede desbloqueio já realizado | Consulte variável e logs; não repita operação destrutiva para diagnosticar |
| Instalador exige Android 11, mas o aparelho usa Android 15 | Resolva a condição da rota e o risco de downgrade antes; não ignore a confirmação |
| Download ou hash falha | Refaça apenas o download do artefato da mesma publicação; não use uma imagem de outra data |
| Interface parece travada ao mudar para recovery | Compare o modo pedido e o menu físico; preserve log antes de encerrar |
| Não inicializa depois de concluir | Confira base original, variante e log da receita |
| Sistema desejado não é oferecido | Use a instalação vigente do port; não force opção antiga |
| Monitor não funciona | Primeiro confirme suporte, cabo e camada USB/display; não reflasheie firmware imediatamente |

Há um [relato no próprio repositório do instalador](https://github.com/ubports/ubports-installer/issues/4714) de detecção de desbloqueio travada num FP4. Ele ajuda a formular a hipótese, mas não prova que todo erro seja o mesmo. Compare versão, etapa e saída real antes de aplicar uma solução.

## Recuperação/rollback

Para voltar ao original, use o pacote FP4 e fluxo oficial que você preparou; poderá haver limpeza. Não copie `dtbo` ou partições de identidade de outro aparelho. Depois do boot original, teste sensores e funções antes de relock; siga as condições atuais do fabricante sobre versão e patch. Se não houver recuperação confirmada para seu estado, procure suporte.

A base Android 11 necessária para uma rota não é obrigatoriamente o pacote desejável de **retorno definitivo** a Android. A página oficial também oferece versões atuais. Use o [guia de restauração](../recuperacao/restaurar-android.md) para escolher o retorno segundo modelo/estado/patch, e mantenha a ficha do downgrade e dos flashes realizados. Recuperar o sistema e recuperar arquivos pessoais são tarefas distintas.

## Testes finais e registro público

Reinicie sem computador, teste acesso administrativo e reconexão de hub/monitor/entrada. Registre modelo, firmware base, release, kernel, instalador, periféricos e funções confirmadas. Relate os resultados como teste da sua montagem, sem transformá-los em certificação de todos os FP4.

- Confirme a distribuição pelo sistema, não apenas pela aparência.
- Confira Wi-Fi depois do boot e depois de bloquear/desbloquear.
- Teste teclado/mouse USB e Bluetooth separadamente, se a matriz os prevê.
- Teste saída externa com cabos/hub conhecidos e reconexão sem reiniciar a sessão.
- Observe carga e temperatura durante uso; uma tela acesa não comprova carga da bateria.
- Faça um reboot sem computador e verifique se continua administrável.

Se uma função indispensável falhar, registre a camada e a versão antes de personalizar. Uma instalação reproduzível deve permitir explicar tanto o sucesso quanto a limitação.

## Fontes e limites da verificação

Documental, **11/10/2026**. Fontes de fabricante, catálogo de imagens, página UBports e configuração FP4 lidas; não houve flash físico. Os URLs dos pacotes Android são links do fabricante. O diretório ZIP e scripts pequenos foram inspecionados por HTTP Range, sem baixar os pacotes completos nem recalcular seus hashes globais; o leitor precisa verificar o download completo antes da execução. A wiki postmarketOS/Nura teve acesso automatizado limitado, portanto a instrução atual da rota manual deve ser reconferida pelo leitor. As referências primárias estão ligadas nos passos acima; nenhum firmware ou código de desbloqueio é redistribuído por esta base.
