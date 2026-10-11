---
title: Perguntas frequentes
description: Respostas diretas para dúvidas sobre compatibilidade, Android, boot, vídeo, programas e segurança.
last_verified: '2026-10-10'
---

## Isso funciona em qualquer celular?

Não existe método de Linux nativo universal. Cada aparelho combina bootloader, formato de imagens, descrição do hardware, firmware e drivers. Termux/PRoot alcançam mais aparelhos com Android funcional, mas também têm requisitos de versão, arquitetura e limitações. O objetivo desta base é permitir **investigar qualquer aparelho**, não garantir um resultado idêntico em todos. Comece pelo [assistente](escolha/index.mdx).

## Preciso desbloquear ou fazer root para começar?

Para Termux e PRoot, não. Para um chroot convencional no Android, geralmente é necessário privilégio adequado. Para instalar um sistema nativo, siga a exigência do port e do bootloader. Root, desbloqueio e ADB são três coisas diferentes; nenhum deve ser feito apenas porque apareceu num tutorial de outro caminho.

## Vou perder os dados ao desbloquear?

O desbloqueio normalmente provoca reset e perda de dados. Planeje como se isso fosse acontecer, inclusive quanto à autorização ADB e aplicativos de autenticação. Copiar arquivos para outra pasta no mesmo telefone não é backup contra essa operação. Consulte [backup](preparacao/backup.md) e o procedimento específico do fabricante antes de começar.

## Ubuntu ARM64 pode ser instalado como num notebook?

Não por ser ARM64 apenas. Um rootfs contém programas, mas ainda precisa de kernel, formato de boot e suporte ao hardware. Uma imagem de VM pode esperar hardware virtual; uma imagem genérica pode esperar UEFI. Smartphone com ARM64 não implica oferecer qualquer um deles. Use um port documentado ou o ambiente de distribuição sobre Android.

## postmarketOS virou Nura? Meus comandos mudaram?

O [anúncio oficial de 27/09/2026](https://nura.eco/blog/2026/09/27/nura-rename/) confirma o novo nome. Isso não autoriza renomear ferramentas, pacotes ou URLs na mão. Leia o manual atual; esta base preserva nomes como `pmbootstrap` quando são os documentados. Relatos antigos continuam úteis quando suas versões e limites são registrados.

## GNOME é uma distribuição? Posso usá-lo nativamente?

GNOME é um ambiente desktop. Ele pode ser a sessão principal quando a distribuição e o port integram seus requisitos. Rodá-lo dentro de outra sessão ou via um servidor gráfico virtual é outra configuração. Veja [GNOME nativo](desktop/gnome-nativo.md), identifique display manager e serviços antes de remover o desktop anterior, e preserve acesso de recuperação.

## Instalei Debian em PRoot. Por que o kernel ainda parece Android?

Porque PRoot não inicia um kernel Debian. Ele apresenta outro ambiente de arquivos e adapta chamadas dos programas. `cat /etc/os-release` e `uname -a` observam camadas diferentes. Docker, drivers, namespaces e suspensão continuam dependendo do kernel hospedeiro. O [guia PRoot](android/proot-distro.md) explica essas limitações.

## Meu hub tem USB-C de 5 Gbps. Por que não dá vídeo nessa porta?

Velocidade de dados, alimentação e DisplayPort são capacidades separadas. Uma porta de dados pode alimentar o monitor sem transmitir vídeo. A saída HDMI do hub pode usar uma cadeia diferente da USB-C downstream. Leia especificações explícitas de entrada/saída de vídeo e teste uma montagem conhecida. Veja [USB-C e hubs](hardware/usb-c-hubs.md).

## Posso carregar e usar teclado/mouse ao mesmo tempo?

Somente se aparelho, hub, alimentação e software coordenarem os papéis necessários. Receber energia não é igual a deixar de ser host de dados, mas a implementação pode falhar nessa troca. Uma luz acesa não comprova corrente suficiente nem enumeração. O [guia de energia](hardware/energia.md) ensina a observar carga, USB e temperatura sem forçar papéis cegamente.

## O mouse funciona. Isso prova que o teclado está correto?

Não. Eles podem enumerar em interfaces, drivers e nós de input diferentes. Compare USB, HID, `/dev/input`, eventos e sessão. Se o kernel recebe teclas e o compositor não, resetar o hub pode atacar a camada errada. Veja [teclados USB](hardware/teclados-usb.md).

## Posso usar somente SSH se a tela está quebrada?

Se o sistema já tem rede, servidor SSH, credenciais e inicialização configurados, sim. Isso não cria um acesso que nunca foi preparado. ADB no Android pode exigir aprovação na tela; desbloquear pode apagar essa autorização. Estabeleça um canal alternativo confirmado e o teste depois de reiniciar. Consulte [tela quebrada](diagnostico/tela-quebrada.md).

## Por que o desktop tem poucos FPS num telefone potente?

CPU rápida não substitui um driver de GPU integrado. Renderização por software, resolução alta, captura remota, temperatura e energia podem reduzir desempenho. Confirme renderer e teste local, distinguindo composição, WebGL e decodificação de vídeo. Veja [GPU](hardware/gpu.md). Não desative controles térmicos para esconder a causa.

## A câmera funciona no app. Por que o Meet não a vê?

Um app pode usar uma HAL específica; o navegador pode procurar PipeWire/portal ou V4L2. A resolução anunciada também pode ser limitada pelo modo exposto, conversão e aplicação. O [guia de câmera](hardware/cameras.md) distingue essas interfaces. Instalar um navegador não cria automaticamente uma câmera padrão.

## Qual é a senha do sudo? É apt para tudo?

Não há senha universal. Ela depende da conta/configuração do sistema. Alpine/postmarketOS usam APK; Debian/Ubuntu usam APT; Termux usa seus próprios pacotes. Execute os comandos no ambiente certo, sem misturar repositórios. Consulte [terminal e pacotes](fundamentos/terminal-pacotes.md).

## Vou poder usar qualquer programa de PC?

Depende de arquitetura, ABI, bibliotecas, kernel, licença e disponibilidade do pacote. Muitos projetos livres compilam em ARM; binários exclusivos x86 e dependências glibc não são automaticamente executáveis em Android ou Alpine. Emulação tem custo e não resolve drivers. Verifique requisitos de cada programa e procure uma alternativa quando a cadeia não for compatível.

## A documentação foi testada em todos os aparelhos?

Não. A documentação reúne revisão de fontes e um estudo de caso real, marcando os limites de evidência. Builds e testes do site verificam navegação, links e o assistente; não são testes de hardware. Novos relatos devem especificar modelo, versões, periféricos, passos e resultados. Veja [como contribuir](comunidade/contribuir.md).

## Fontes e atualização

Revisão documental: **10/10/2026**. As respostas apontam para capítulos com fontes e procedimentos próprios. Os princípios de boot derivam da [documentação AOSP](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking); o escopo de ambientes Android está no [Termux](https://github.com/termux/termux-app). Divergências devem ser verificadas na versão concreta antes de executar alterações.
