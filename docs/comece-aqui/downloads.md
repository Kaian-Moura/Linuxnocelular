---
title: Onde baixar cada ferramenta
description: Diretório de origens oficiais, escolha de arquivo e tutorial de instalação para cada caminho.
sidebar_position: 4
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Esta é a página de consulta para a pergunta “onde eu baixo?”. Cada linha liga **origem → tipo de arquivo → tutorial que ensina a instalar**. Você não deve instalar tudo. Escolha seu caminho e baixe apenas o que a etapa exige. Para aprender a extrair arquivos e abrir o terminal, use [preparação do computador](computador-downloads.md).

## Ferramentas de preparação no computador

| Ferramenta e origem | O que selecionar | Tutorial completo |
| --- | --- | --- |
| [Android Platform-Tools](https://developer.android.com/tools/releases/platform-tools) | ZIP de Windows, Mac ou Linux; pacote independente do Android Studio | [ADB e Fastboot](../preparacao/adb-fastboot.md) |
| [Drivers USB OEM, diretório Android](https://developer.android.com/studio/run/oem-usb) | Link do fabricante do seu telefone; somente se necessário no Windows | [ADB: identificação e drivers](../preparacao/adb-fastboot.md) |
| [scrcpy, releases Genymobile](https://github.com/Genymobile/scrcpy/releases) | Binário do computador e arquitetura; não “Source code” | [Espelhar o Android do zero](../preparacao/scrcpy.md) |
| [Ubuntu Desktop](https://ubuntu.com/download/desktop) | ISO correspondente ao computador; não é imagem de smartphone | [Linux no computador sem instalar](linux-no-computador.md) |
| [Rufus](https://rufus.ie/pt_BR/) | Executável Windows da arquitetura do computador | [Preparar pendrive live](linux-no-computador.md) |

Platform-Tools é ferramenta; driver OEM é integração do Windows com a interface USB; firmware é o sistema e dados destinados ao aparelho. São downloads diferentes. Um arquivo chamado “Universal ADB Driver” num anúncio não substitui a confirmação do fabricante.

## Aplicativos Android e ambientes Linux sobre Android

| Ferramenta e origem | O que selecionar | Tutorial completo |
| --- | --- | --- |
| [Termux no F-Droid](https://f-droid.org/packages/com.termux/) ou [releases do Termux](https://github.com/termux/termux-app/releases) | APK da origem escolhida, compatível com sua versão Android; mantenha complementos na mesma origem | [Termux do zero](../android/termux.md) |
| [F-Droid](https://f-droid.org/) | Aplicativo F-Droid, caso escolha usar seu cliente para instalar/atualizar Termux | [Instalação e origem dos APKs](../android/termux.md) |
| [PRoot-distro](https://github.com/termux/proot-distro) | Instalação pelo pacote Termux, não um APK de “Debian completo” encontrado na busca | [Debian/Ubuntu com PRoot](../android/proot-distro.md) |
| [Termux:X11](https://github.com/termux/termux-x11) | Aplicativo Android e pacote Termux correspondentes, conforme instrução upstream | [Desktop sobre Android](../android/desktop.md) |
| [Magisk](https://github.com/topjohnwu/Magisk/releases) | APK estável oficial; imagem original do boot vem do firmware do **seu** aparelho | [Root do zero, condicionado ao modelo](../preparacao/root-magisk.md) |
| [Linux Deploy](https://github.com/meefik/linuxdeploy) | Fonte/release do projeto; confira manutenção e compatibilidade antes | [Linux Deploy](../android/linux-deploy.md) |

No Android, instalar um APK pode exigir permitir instalação para o navegador/gerenciador de arquivos escolhido. O tutorial ensina a conceder essa permissão apenas à origem usada e revogá-la quando terminar. Não é necessário desligar todas as proteções do telefone.

Instalar **o APK Magisk não é suficiente para obter root**. Já PRoot não exige root real. Não confunda essas etapas nem procure uma imagem “Magisk patched” genérica de outro usuário. Root e desbloqueio têm implicações para dados, segurança e aplicações; leia o tutorial antes de qualquer alteração de boot.

## Linux que inicia diretamente no aparelho

| Projeto e origem | O que selecionar | Tutorial completo |
| --- | --- | --- |
| [postmarketOS/Nura: instalação](https://nura.eco/install/) | Modelo, variante, categoria de suporte e método oferecido | [Imagens e instalação](../nativo/postmarketos-imagens.md) |
| [pmbootstrap](https://docs.nura.eco/pmbootstrap/) | Método de instalar a ferramenta no computador Linux, não uma imagem pronta | [pmbootstrap do zero](../nativo/postmarketos-pmbootstrap.md) |
| [Ubuntu Touch: catálogo](https://devices.ubuntu-touch.io/) e [instalador UBports](https://github.com/ubports/ubports-installer/releases) | Página do modelo e instalador do computador; confira firmware base | [Ubuntu Touch](../nativo/ubuntu-touch.md) |
| [Mobian](https://mobian.org/) | Download **específico para hardware suportado** e instrução correspondente | [Mobian e Droidian](../nativo/mobian-droidian.md) |
| [Droidian: dispositivos](https://devices.droidian.org/) | Página do modelo, release e adaptações exigidas | [Mobian e Droidian](../nativo/mobian-droidian.md) |

Esses links não substituem a página da variante. No caso de Nura, o nome antigo postmarketOS aparece em ferramentas e referências históricas; não renomeie comandos por suposição. Se a wiki apresentar desafio de navegador, abra manualmente e confirme o conteúdo antes de gravar. “A página não abriu na automação” é diferente de “o modelo não tem suporte”.

## Programação, placas e acesso remoto

| Recurso e origem | Forma preferida no telefone Linux | Tutorial completo |
| --- | --- | --- |
| [Python](https://www.python.org/downloads/) e [Node.js](https://nodejs.org/en/download) | Pacotes da distribuição/Termux quando disponíveis; arquivos Windows são para o notebook Windows | [Python, JavaScript, C/C++](../projetos/desenvolvimento.md) |
| [GCC](https://gcc.gnu.org/) / [LLVM](https://llvm.org/) | Pacote da distribuição; não há um instalador C++ universal para todos os ambientes | [Primeiro programa compilado](../projetos/desenvolvimento.md) |
| [Arduino CLI](https://docs.arduino.cc/arduino-cli/installation/) / [Arduino IDE](https://www.arduino.cc/en/software) | CLI ARM quando compatível; desktop IDE depende dos binários/bibliotecas publicados | [Uno e ESP32](../projetos/arduino-esp32.md) |
| [ESP32: documentação Espressif](https://docs.espressif.com/projects/arduino-esp32/en/latest/installing.html) | Core e identificação da placa conforme o tutorial | [Compilar e gravar ESP32](../projetos/arduino-esp32.md) |
| [OpenSSH](https://www.openssh.com/) / [OpenSSH no Windows](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse) | Pacote SSH da distribuição; cliente no notebook e servidor no telefone são funções distintas | [SSH desde a instalação](../projetos/ssh-remoto.md) |
| [TigerVNC](https://tigervnc.org/) | Servidor compatível com a sessão e viewer no computador, quando esse caminho for escolhido | [Acesso remoto](../desktop/acesso-remoto.md) |

Ferramentas de diagnóstico como `lsusb`, `evtest` e `libinput` normalmente são obtidas pelo gerenciador de pacotes. Consulte [instalação das ferramentas de diagnóstico](../diagnostico/instalar-ferramentas.md), que relaciona comando a pacote e ensina a confirmar disponibilidade na sua release.

## Firmware e recuperação: não existe link único

O firmware original depende de modelo, variante, região e versão; um arquivo correto para outro aparelho pode causar perda do boot ou de funções essenciais. Comece por [restaurar Android](../recuperacao/restaurar-android.md), que apresenta as fontes por fabricante e distingue imagem completa, OTA e pacote de reparo. Não há nesta página uma coleção de firmwares de procedência não verificável.

Quando o fabricante não publica recuperação acessível ao usuário, registre essa limitação **antes** de substituir o sistema. Um tutorial muito detalhado não cria um modo de recuperação inexistente.

## Como usar a lista com segurança

Abra a origem, leia o tutorial, confira destino/sistema/arquitetura, baixe e registre versão/data. Se houver hash/assinatura, siga o método indicado. Guarde o arquivo original sem sobrescrever; arquivos modificados devem ter nome diferente. Não permita que um instalador baixe firmware de outra variante para contornar “modelo não suportado”.

**Critério de conclusão:** para cada ferramenta do seu caminho você sabe de onde veio, onde será instalada, como conferir a versão e qual página ensina a próxima etapa. Não há motivo para baixar as ferramentas dos outros caminhos.

## Fontes e verificação

Diretório editorial revisado em **11/10/2026** com as páginas primárias vinculadas e verificações registradas nos tutoriais. Links de download são páginas de projeto, não hashes fixos de versões futuras. Disponibilidade HTTP não é teste do programa em todas as plataformas; manutenção, assinaturas e suporte de hardware precisam ser conferidos na instalação concreta.
