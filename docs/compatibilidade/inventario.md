---
title: Identifique exatamente o seu aparelho
description: Inventário de modelo, variante, arquitetura, software e funções antes de escolher um sistema.
sidebar_position: 1
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Resultado esperado

Ao terminar, você terá uma ficha verificável do telefone. Essa ficha permite procurar um port compatível, pedir ajuda sem ambiguidades e evitar imagens destinadas a variantes diferentes. **Nenhum comando desta página desbloqueia o aparelho ou grava partições.** Dificuldade: iniciante com acesso ao Android; intermediária se só houver terminal.

Um nome comercial não basta. Um fabricante pode vender o mesmo nome com outro processador, modem, controlador de tela ou política de bootloader. O codinome também não substitui a variante: páginas de comunidade às vezes agrupam modelos parecidos. “Snapdragon”, “ARM64” e “12 GB de RAM” descrevem partes do hardware, mas não comprovam que um sistema conseguirá inicializar nele.

## Requisitos e materiais

- Telefone ligado, bateria suficiente para consulta e cabo USB que transmita dados.
- Computador com [ADB preparado](../preparacao/adb-fastboot.md), se possível.
- Acesso à etiqueta, nota fiscal ou tela **Sobre o telefone**.
- Arquivo de anotações fora do aparelho. Não publique IMEI, número de série, endereços pessoais ou credenciais.

Se o display estiver inutilizável, veja [acesso com tela quebrada](../preparacao/tela-quebrada.md). ADB exige autorização prévia; conectar um cabo não concede acesso automaticamente.

## 1. Anote a identidade física

Registre fabricante, nome comercial, código do modelo, região e eventual variante de operadora. Fotografe apenas a parte da etiqueta necessária, ocultando identificadores pessoais. Compare com a página oficial de especificações. Se a comunidade exigir um codinome, confira a correspondência em duas evidências, como propriedade do sistema e documentação do port.

Não instale aplicativos de identificação de origem desconhecida. Aplicativos podem apresentar nome de marketing ou interpretar propriedades incorretamente. Um relatório de aplicativo ajuda, mas não é autorização para instalar uma imagem.

## 2. Consulte o Android sem modificar o sistema

**Local: terminal do computador, com o telefone em Android e autorizado no ADB.**

```bash
adb devices -l
adb shell getprop ro.product.manufacturer
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.product.board
adb shell getprop ro.product.cpu.abilist
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.security_patch
adb shell getprop ro.build.fingerprint
adb shell uname -a
```

`getprop` consulta propriedades que o Android disponibiliza. `ro.product.device` costuma fornecer o codinome; `ro.product.cpu.abilist` informa as ABIs aceitas pelos aplicativos. Uma lista contendo `arm64-v8a` indica suporte Android a programas ARM de 64 bits. Isso não significa que qualquer imagem Debian ARM64 seja inicializável. `uname` descreve o kernel em execução, que pode ter configuração e interfaces específicas do fabricante.

Uma propriedade vazia significa “não informada”, não “hardware ausente”. Em ROMs modificadas, algumas propriedades podem ter sido alteradas. Se houver vários dispositivos conectados, use `adb -s SERIAL ...`, substituindo `SERIAL` pelo identificador local que você conferiu. Não salve esse identificador no relatório público.

Para memória e espaço disponível:

```bash
adb shell cat /proc/meminfo
adb shell df -h /data
```

`MemTotal` é a memória apresentada ao kernel, não necessariamente a capacidade comercial: áreas reservadas ao firmware reduzem o total disponível. `df` informa o espaço do sistema de arquivos atual, não toda a capacidade do chip de armazenamento. Um rootfs Linux pequeno pode ocupar uma partição grande e precisar de expansão documentada; não redimensione antes de entender o mapa de partições.

## 3. Se o telefone já executa Linux nativo

**Local: terminal ou SSH no telefone.**

```bash
uname -a
uname -m
cat /etc/os-release
cat /proc/meminfo
lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINTS
```

`aarch64` normalmente identifica ARM de 64 bits; `armv7l`, ARM de 32 bits. `lsblk` depende de util-linux e pode não estar instalado. Nesse caso, consulte `cat /proc/partitions` para uma visão limitada e procure o pacote da distribuição. Não use comandos de formatação como substitutos de uma ferramenta de leitura.

Não associe `/dev/sda` automaticamente ao armazenamento interno: em telefones UFS podem existir várias unidades lógicas e o hub pode acrescentar discos externos. A relação entre nome do bloco, partição Android e slot deve ser documentada para o modelo.

## 4. Registre capacidades, não apenas especificações

Monte esta ficha:

| Campo | Evidência que vale registrar |
|---|---|
| Modelo e variante | Código oficial e correspondência do codinome |
| SoC e arquitetura | Especificação do fabricante e ABI consultada |
| Android e firmware de base | Versão, patch e fingerprint local |
| Bootloader | Política oficial e estado consultado; veja [bootloader](bootloader.md) |
| Tela e toque | Funcionam fisicamente? Aceitam desbloqueio e autorização ADB? |
| USB | Cabo de dados, host/OTG, saída de vídeo e PD são capacidades distintas |
| Rede | Wi-Fi disponível, adaptador externo possível, SSH já testado? |
| Objetivo | Manter Android? Desktop, servidor, programação ou laboratório? |
| Recuperação | Fonte do firmware correto, método suportado e acesso aos botões |

Faça um teste de referência ainda no sistema original: Wi-Fi, áudio, câmera, mouse/teclado USB, Bluetooth e monitor, quando houver suporte. Esse teste permite separar defeito físico de regressão de software. Não conclua que uma porta USB-C fornece vídeo porque carrega ou reconhece um pendrive.

## Verificação, erros e alternativas

Você deve conseguir apontar o código exato do modelo e a fonte que o relaciona ao port. Se houver divergência entre etiqueta e propriedades, investigue antes de continuar. Um aparelho recondicionado pode ter placa de outra variante. Se ADB informar `unauthorized`, autorize na tela; root não substitui essa etapa. Se informar `offline`, confira cabo, versão das ferramentas e reinicie somente o servidor ADB no computador.

Se não existir port, a ficha ainda é útil para escolher Linux sobre Android. Ausência de suporte nativo não impede programação em Termux. Também não transforma uma tentativa de porting em instalação comum.

## Recuperação/rollback e testes finais

Não há alteração no telefone a reverter. Guarde a ficha em local privado, faça uma cópia sem identificadores pessoais para contribuições e continue em [como avaliar a matriz de suporte](matriz.md). O teste final é conseguir explicar por que o tutorial escolhido se aplica à sua **variante**, e não apenas a um aparelho da mesma marca.

## Fontes e limites da verificação

Verificação documental em **10/10/2026**; consultas não executadas em todos os aparelhos.

- [Android: ABIs e arquitetura](https://developer.android.com/ndk/guides/abis) — diferenças entre arquiteturas de aplicativos.
- [Android: ADB](https://developer.android.com/tools/adb) — shell, seleção e autorização de dispositivos.
- [AOSP: organização de partições](https://source.android.com/docs/core/architecture/partitions) — nomes e funções não são intercambiáveis.
