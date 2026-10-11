---
title: Glossário técnico
description: Termos de boot, Linux, Android, hardware, desktop e diagnóstico usados neste projeto.
last_verified: '2026-10-10'
---

Este glossário serve para localizar conceitos. Para executar procedimentos, siga os capítulos indicados e seus requisitos. Um termo reconhecido não comprova suporte do seu dispositivo.

## Sistema, arquitetura e programas

| Termo | O que significa e por que importa |
|---|---|
| ABI | Interface binária esperada entre programas e componentes. CPU compatível não basta se bibliotecas/ABI diferirem. |
| ARM / ARM64 / aarch64 | Arquiteturas/famílias de instruções; ARM64 e aarch64 identificam o ambiente de 64 bits em diferentes ferramentas. Confirme também o espaço de usuário. |
| Bionic / glibc / musl | Implementações de bibliotecas C usadas, respectivamente, no Android e em diferentes distribuições. Influenciam a compatibilidade de binários. |
| Distribuição | Integração de programas, bibliotecas, pacotes, políticas e normalmente kernel. Pode ser só um ambiente de usuário sobre outro sistema. |
| Espaço de usuário | Programas executados fora do núcleo; não inclui os drivers do kernel. |
| Kernel | Núcleo que gerencia processos, memória e interfaces de hardware. |
| Mainline / upstream | Desenvolvimento principal de um projeto; em kernel, contrapõe-se a conjuntos de modificações externos. |
| Downstream | Versão com adaptações fora do desenvolvimento principal, como kernels de fabricantes. Pode oferecer suporte específico sem manutenção equivalente ao principal. |
| Shell | Interpretador de comandos. O terminal é a interface que o apresenta. |
| Root | Identidade privilegiada no sistema. Não é sinônimo de bootloader desbloqueado. |
| APK / APT / pkg | Gerenciadores/comandos de pacotes de ambientes diferentes. APK do Alpine não significa arquivo de aplicativo Android neste contexto. |

Veja [Linux e Android](fundamentos/linux-android.md) e [terminal e pacotes](fundamentos/terminal-pacotes.md).

## Inicialização e recuperação

| Termo | Significado prático |
|---|---|
| Bootloader | Estágio que seleciona/valida o sistema a iniciar; sua política determina se novas imagens são aceitas. |
| Boot image | Arquivo de inicialização com formato específico, não um rootfs genérico. Pode ter componentes diferentes conforme geração Android. |
| Initramfs | Ambiente inicial em memória usado para preparar/montar o sistema antes de iniciar serviços finais. |
| Recovery | Ambiente separado de manutenção; capacidade de restauração varia por modelo. |
| ADB | Comunicação de depuração com Android/ambientes que implementam seu daemon; requer autorização e não implica root. |
| Fastboot | Protocolo/ferramenta de comunicação com modos de boot compatíveis. Não está disponível em todo smartphone. |
| fastbootd | Implementação em espaço de usuário relacionada a certas operações de partições; distinta do fastboot do bootloader. |
| Slot A/B | Duas seleções de componentes usadas por alguns esquemas de atualização. Alterar um slot não é procedimento universal de recuperação. |
| Partição dinâmica | Partição lógica gerida numa estrutura de armazenamento, comum em Android recente; não equivale a partição física simples. |
| Verified Boot / AVB | Verificação de integridade/autenticidade de componentes de boot Android. |
| Anti-rollback | Política que pode bloquear versões mais antigas; relevante antes de downgrade. |
| EDL / Download / emergência | Famílias de modos de serviço específicos. Nome visível não garante acesso a ferramenta, autorização ou arquivos de recuperação. |
| CrashDump / panic | Evidência de falha grave; requer coleta e identificação, não flash aleatório. |

Veja [boot e kernel](fundamentos/boot-kernel.md) e [triagem de recuperação](recuperacao/triagem.md).

## Drivers e ambientes

| Termo | Significado prático |
|---|---|
| Driver | Código que opera uma interface de hardware; deve combinar com dispositivo e versão. |
| Firmware | Código/dados usados por um componente, muitas vezes distribuídos pelo fabricante. Sua licença e compatibilidade importam. |
| Device tree / DTS / DTB | Descrição do hardware; fontes e representação compilada. Não substitui um driver ausente. |
| Módulo / `.ko` | Função/driver carregável do kernel. Versão e ABI precisam corresponder; um driver pode estar embutido e não aparecer em `lsmod`. |
| HAL | Camada Android que abstrai implementações específicas; recursos expostos nela podem não ter API Linux desktop equivalente. |
| Rootfs | Sistema de arquivos raiz com programas e configurações. Sozinho não define kernel nem modo de boot. |
| Chroot | Alteração da raiz de arquivos vista por um processo. Não é isolamento completo. |
| PRoot | Adaptação de caminhos/chamadas para ambiente semelhante a chroot sem root; usa kernel hospedeiro. |
| Namespace / cgroup | Recursos do kernel para separar visões e controlar recursos; importantes para containers. |
| Container OCI | Ambiente descrito/empacotado segundo padrões OCI. Formato de imagem não comprova isolamento na execução. |
| KVM / TCG | Virtualização assistida por kernel/hardware e emulação usada por QEMU; requisitos e desempenho diferentes. |

## Periféricos, energia e desktop

| Termo | Significado prático |
|---|---|
| OTG / host | Capacidade/papel de controlar dispositivos USB. Papéis de dados e energia precisam ser diferenciados. |
| USB-C | Formato e ecossistema de conexão; não garante todas as velocidades, potência ou vídeo. |
| USB PD | Negociação de energia por USB compatível. Watts no carregador não comprovam a negociação efetiva no conjunto. |
| DP Alt Mode | Transporte DisplayPort por uma conexão USB-C compatível; não nasce de uma porta de dados por configuração. |
| EDID / HPD | Informação do monitor e sinalização de conexão, usados para detectar modos e hotplug. |
| HID / evdev / libinput | Camadas de dispositivos humanos, eventos do kernel e processamento de entrada para sessões gráficas. |
| udev / seat | Gerenciamento/identificação de dispositivos e agrupamento de entrada/saída para sessões. |
| DRM/KMS | Interfaces do kernel para gráficos/configuração de display; neste contexto DRM não é proteção anticópia. |
| Mesa / renderer | Conjunto de drivers gráficos em espaço de usuário e o renderizador realmente usado pela aplicação. |
| llvmpipe | Renderizador por CPU; útil para compatibilidade, mas não comprova aceleração GPU. |
| Wayland / X11 | Sistemas/protocolos gráficos; dependem de servidores/compositores e integração correta. |
| Compositor | Organiza janelas e apresenta frames, normalmente também coordenando entrada na sessão Wayland. |
| Display manager | Serviço de login/início de sessão. Não é o mesmo que o desktop nem o driver de vídeo. |
| VNC / RDP | Protocolos de acesso gráfico remoto. Podem compartilhar uma sessão ou iniciar outra. |
| PipeWire / V4L2 | Infraestrutura multimídia e API do kernel para vídeo; aplicativos podem usar caminhos distintos de câmera. |
| Autosuspend / throttling | Economia de energia de dispositivos e redução de desempenho por limites térmicos/energia. |

Veja os guias de [USB-C](hardware/usb-c-hubs.md), [desktop](desktop/gnome-nativo.md), [GPU](hardware/gpu.md) e [câmera](hardware/cameras.md).

## Fontes e verificação

Revisão documental: **10/10/2026**. Definições introdutórias originais, aprofundadas nas referências dos respectivos capítulos. Referências centrais: [AOSP](https://source.android.com/docs/core/architecture), [kernel Linux](https://docs.kernel.org/), [Wayland](https://wayland.freedesktop.org/architecture.html) e [USB Type-C no kernel](https://docs.kernel.org/driver-api/usb/typec.html). O glossário não apresenta procedimentos de instalação.
