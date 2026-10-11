---
title: Linux mantendo o Android — panorama
sidebar_position: 1
description: Entenda as diferenças entre Termux, PRoot, chroot, containers, máquinas virtuais e acesso remoto.
last_verified: '2026-10-10'
validation: documental
---

## Resultado esperado e escolha do método

Manter o Android permite reaproveitar um aparelho com bootloader bloqueado e conservar drivers de câmera, modem, carregamento e GPU oferecidos pelo fabricante. O Linux adicional pode fornecer ferramentas de programação, um servidor ou uma interface gráfica. Isso não transforma automaticamente o telefone em um computador com kernel Linux de desktop.

O Android já utiliza um kernel Linux, mas seus aplicativos, bibliotecas, permissões e serviços diferem de uma distribuição GNU/Linux. Instalar um programa Linux envolve mais que copiar um executável: arquitetura da CPU, biblioteca C e acesso ao kernel precisam ser compatíveis. Um binário Debian ARM64 não é necessariamente executável diretamente no Android ARM64.

| Caminho | Android continua? | Root real necessário? | Kernel usado | Para que serve melhor |
| --- | --- | --- | --- | --- |
| [Termux](./termux.md) | Sim | Não | Android | Terminal, programação e serviços simples |
| [PRoot](./proot-distro.md) | Sim | Não | Android | Bibliotecas e pacotes de uma distribuição |
| [chroot](./chroot.md) | Sim | Sim | Android | Usuários Linux sem a tradução de caminhos do PRoot |
| [Linux Deploy](./linux-deploy.md) | Sim | Geralmente sim na versão analisada | Android | Gerenciar chroot em aparelhos compatíveis; projeto legado |
| [Container OCI](../projetos/containers.md) | Depende do host | Não necessariamente, mas exige suporte do kernel | Compartilhado com o host | Serviços isolados em kernel compatível |
| [Máquina virtual](./virtualizacao.md) | Depende do host | TCG não exige KVM; KVM exige acesso autorizado | Kernel próprio do convidado | Laboratório e isolamento mais forte |
| SSH/VNC/RDP para outro computador | Sim | Não | Do computador remoto | Acessar recursos que o telefone não executa |

:::info Desktop local e remoto são resultados diferentes
Uma janela Linux exibida pelo Termux:X11 é desenhada pelo telefone, com o Android ainda funcionando. VNC pode mostrar uma sessão virtual executada no próprio telefone ou uma sessão em outra máquina: verifique onde o servidor está. Instalar GNOME dentro de PRoot não configura o boot do aparelho para iniciar diretamente em GNOME.
:::

## Requisitos, dificuldade e materiais

O ponto de entrada mais acessível é Termux, para Android com suporte atual ao aplicativo e aos pacotes. Reserve armazenamento interno para programas e projetos; desktops e compiladores podem consumir vários gigabytes. Um teclado facilita o uso, mas não é obrigatório. Conexão de rede é necessária para baixar pacotes; depois, várias atividades funcionam offline.

Para PRoot, recomende-se conhecer navegação pelo terminal, diferença entre usuário comum e administrador e gerenciamento de pacotes. Chroot, containers e virtualização exigem estudo adicional do kernel e da segurança. Root não é requisito para começar e não deve ser adquirido apenas por presumir que ele dará saída HDMI ou aceleração de vídeo.

## Preparação e segurança

Faça backup dos arquivos pessoais e dos projetos existentes antes de substituir aplicativos ou fontes de instalação. Trocar a assinatura do Termux pode exigir desinstalação, apagando seus dados privados. Uma distribuição adicional ocupa armazenamento, pode manter CPU acordada e pode ser encerrada pelo gerenciamento de processos do Android.

Comece com uma sessão de terminal pequena. Registre a versão do Android, a origem do APK, as versões dos pacotes e o resultado de uma tarefa simples. Só adicione desktop e serviços automáticos depois que essa base estiver estável. Não instale APKs, rootfs e scripts distribuídos por terceiros sem origem, versão e integridade verificáveis.

## Como verificar o que está realmente executando

No ambiente em que você trabalha:

```bash
uname -m
uname -r
id
cat /etc/os-release
```

`uname -m` identifica a arquitetura visível; `uname -r`, o kernel compartilhado ou virtualizado; `id`, o usuário; `/etc/os-release`, a distribuição quando o arquivo existe. No Termux, esse arquivo pode não existir: use `termux-info`. Em PRoot, aparecer `uid=0` significa identidade simulada dentro do ambiente, não autorização de administrador do Android. Compare o kernel dentro e fora dele.

Para um serviço, descubra o PID, o usuário e a porta. Para um desktop, anote o servidor gráfico utilizado. Essas verificações evitam diagnosticar um problema do Android com comandos de uma distribuição que não controla o dispositivo.

## Limitações e alternativas

PRoot não fornece módulos de kernel, acesso irrestrito ao USB ou namespaces que faltam no Android. Chroot elimina parte do custo de tradução, mas também não adiciona drivers. Uma máquina virtual emulada pode iniciar um kernel diferente e continuar muito lenta. A saída de vídeo exige hardware e implementação compatíveis: instalar um desktop não cria DisplayPort onde ele não existe.

Se o objetivo é apenas programação, permanecer no Termux pode ser mais simples que manter uma distribuição inteira. Se um pacote exige glibc, PRoot pode ser útil. Se o objetivo é GNOME no boot com controle direto de monitor e periféricos, investigue um port nativo documentado para o modelo exato. Sem port, uma sessão remota continua sendo uma alternativa viável, desde que a dependência do outro computador seja explícita.

## Testes finais e recuperação

Uma primeira instalação está pronta quando você consegue abrir e encerrar a sessão, executar um programa, salvar um projeto e recuperar esse arquivo por backup. Teste também a suspensão do Android: se o serviço desaparece, ainda falta tratar seu ciclo de vida. Antes de remover o aplicativo ou o ambiente, exporte os arquivos e encerre os processos; não apague uma árvore com montagens ativas de um chroot.

O próximo passo recomendado é [preparar o Termux](./termux.md). Escolha [PRoot](./proot-distro.md) somente se precisar de uma distribuição adicional e [desktop](./desktop.md) quando a parte de terminal já tiver sido validada.

## Fontes e estado da verificação

Revisão documental em **10/10/2026**; não constitui teste de todos os modelos Android. Fontes primárias: [Termux App](https://github.com/termux/termux-app), [PRoot-distro](https://github.com/termux/proot-distro), [chroot no GNU Coreutils](https://www.gnu.org/software/coreutils/manual/html_node/chroot-invocation.html), [QEMU](https://www.qemu.org/docs/master/system/introduction.html). As versões e permissões do aparelho precisam ser verificadas localmente.
