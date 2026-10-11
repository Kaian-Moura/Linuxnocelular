---
title: OnePlus 9 Pro — estudo de caso e limitações reais
description: O que foi demonstrado no aparelho do projeto e por que não equivale ao port público.
sidebar_position: 1
last_verified: '2026-10-10'
---

Este projeto começou com um **OnePlus 9 Pro, Snapdragon 888/SM8350, Adreno 660 e 12 GB de RAM**, com tela danificada. Foram explorados Linux sobre Android e desktop remoto antes de uma instalação nativa baseada em postmarketOS. O objetivo passou a ser GNOME local, monitor externo, teclado, mouse, rede e aplicações rodando no próprio telefone.

:::warning Estudo experimental, não imagem universal
Esta página resume evidências locais de **setembro de 2026**, revisadas em **2026-10-10**. O sistema usa kernel vendor e adaptações privadas. Não é um instalador reproduzível completo, não certifica todos os OnePlus 9 Pro e não demonstra suporte upstream a todos os componentes. Arquivos de firmware, chaves, calibração, fotos pessoais e dados de rede não foram publicados.
:::

## Identidade e duas pilhas diferentes

| Item | Instalação deste projeto | Port público examinado |
|---|---|---|
| Aparelho | OnePlus 9 Pro, codinome lemonadep | Pacote device-oneplus-lemonadep |
| Kernel | `5.4.147-qgki-g5d92ddfddb85`, downstream Android | Fork próximo de mainline SM8350 6.7-r2 no snapshot examinado |
| Boot/serviços | PID 1 e supervisores próprios | Integração descrita pelos pacotes do port |
| Display | Driver vendor `msm_drm`, adaptações DRM | Recursos publicados na wiki/MRs, não equivalentes ao vendor |
| GPU | Turnip/KGSL + Zink em prefixo privado | Não inferir o mesmo suporte pela ficha pública |

Na árvore pmaports local, commit `ff200725a39d95a375d9e7c84fc7dde30eb85ad8`, os pacotes do aparelho/SoC estavam em `device/archived`. O commit `cfbc1de3c7de56251800d53d20afcf92c313aa12`, de 2026-06-22, marcou pacotes não mantidos; APKBUILDs examinados trazem `Archived: unmaintained`. Essa evidência foi conferida no Git local durante a revisão. Consulte o [commit histórico](https://gitlab.com/postmarketOS/pmaports/-/commit/cfbc1de3c7de56251800d53d20afcf92c313aa12) e a versão atual do projeto antes de decidir instalar.

A [MR de introdução do aparelho](https://gitlab.com/postmarketOS/pmaports/-/merge_requests/4729), de janeiro de 2024, registra funcionalidades daquela proposta. A [wiki OnePlus 9/9 Pro](https://wiki.postmarketos.org/wiki/OnePlus_9_%26_9_Pro_%28oneplus-lemonade_%26_oneplus-lemonadep%29) disponível no índice de busca correspondia a uma revisão de 2025-05-29; o acesso direto foi bloqueado/redirecionado nesta revisão. **Não use esse snapshot como matriz atual de compatibilidade.** O arquivamento do pacote também não identifica, por si só, a causa de um defeito do sistema vendor personalizado.

## Resultado por subsistema

| Função | Evidência local | Limitação importante |
|---|---|---|
| GNOME nativo | Sessão local GNOME Shell/Mutter 50.4, boot direto, confirmação física | Integração customizada com elogind/init, não instalação GNOME padrão completa |
| Teclado/mouse USB | Eventos e digitação reais, reconexão, outro teclado além do Dell | Não testa todos os hubs, protocolos proprietários ou NKRO |
| Bluetooth | Rádio, pareamento e tráfego; teclado e mouse confirmados em etapas posteriores | Perfis adicionais e suspensão exigem testes próprios |
| Wi-Fi | Acesso de manutenção e navegação | Não certifica todas as redes, bandas, roaming ou suspensão |
| Alto-falante/HDMI | Som confirmado fisicamente | Demais entradas/saídas não são automaticamente validadas |
| GPU | Adreno real, Vulkan/GL e WebGL demonstrados | Código privado/experimental e sem benchmark prolongado |
| Câmeras | Frontal/principal via HAL e ponte PipeWire, imagem real | Outros sensores, V4L2 genérico e recursos fotográficos não garantidos |
| Vídeo externo | Monitor físico e alguns ciclos de hotplug passaram | Orientação e transição PD continuam com falhas conhecidas |
| Energia | Carga observada em montagens específicas | Gauge inconsistente em episódios e pass-through não plenamente estável |

## Causa real do teclado USB

A investigação demonstrou problemas entre evdev e libinput, não ausência geral de HID:

1. Um nó `eventN` reutilizado mantinha propriedades udev de um mouse anterior. O kernel enviava teclas, mas libinput inicializava o dispositivo como ponteiro.
2. Não havia um canal udev funcional para notificar continuamente consumidores de input. Criar nós uma vez no boot não implementava hotplug.
3. `/dev` era tmpfs comum, sem devtmpfs. A integração precisava criar e remover corretamente os nós, além de aplicar propriedades/permissões.

O ajuste usou classificação por capacidades, processamento de eventos e hooks restritos a input. Não dependia do VID:PID Dell. USB_HID, HID_GENERIC e EVDEV já eram embutidos no kernel. Testes virtuais exercitaram o caminho kernel/HID/input, mas foram separados dos testes físicos do hub. A confirmação final incluiu um teclado Evision diferente do Dell inicial. Leia o [método genérico](../hardware/teclados-usb.md) antes de copiar qualquer regra.

## GNOME: de sessão aninhada para sessão principal

O estado antigo era aproximadamente Weston DRM → Xwayland → XFCE → GNOME em modo de desenvolvimento. O botão Stop encerrava a camada GNOME e expunha o XFCE.

A migração passou a uma sessão GNOME/Wayland com Mutter acessando DRM físico, elogind e autologin pelo init próprio. XFCE/Weston deixaram de ser o desktop subjacente; os pacotes antigos foram removidos após simulação e confirmação física, preservando dependências de hardware/acessibilidade. Xwayland permaneceu para aplicações X11.

Foram necessários tratamento de seat/udev, variantes Alpine compatíveis com elogind e adaptações ao DRM vendor: conectores internos inadequados para essa montagem, KMS legacy, cursor por software, formatos/planos e timestamps. Uma tradução de eventos DP permitiu que o compositor reconsultasse a conexão sem matar aplicações. Testes HDMI e hub preservaram Shell e uma janela com texto; boots posteriores iniciaram automaticamente. Esses resultados não eliminam os defeitos elétricos/de negociação descobertos depois.

## GPU Adreno e desempenho

O GNOME inicialmente renderizava por llvmpipe. A adaptação compilou Mesa 26.2.2 com Turnip/KGSL e Zink em prefixos privados. Um patch local associou buffers KGSL ao controlador `msm_drm`; uma seleção de apresentação EGL evitou uma falha observada no caminho Kopper do Firefox.

Foram demonstrados cálculo Vulkan com resultados conferidos, pixels GL corretos, exportação/importação de buffers de teste e WebGL no monitor físico. Uma animação leve produziu **52,96 fps em aproximadamente dez segundos**, em desktop 1920×1080. Isso não é benchmark de jogo, prova de codecs por hardware ou garantia de estabilidade prolongada.

Uma tentativa de captura direta por mmap DRM coincidiu com CrashDump. A stack do panic não sobreviveu, então sua causa exata não foi comprovada; a análise encontrou um caminho vendor incompatível com certos buffers importados. O capturador passou a evitar esse mmap. Exportação segura do framebuffer físico ainda falhou com EINVAL em um teste, sem crash. Não distribua o método de captura antigo.

## Câmeras e “webcam nativa”

O sensor interno usa Spectra/HAL Qualcomm privado, não um pipeline libcamera convencional já funcional. Um runtime Bionic isolado, componentes legítimos do aparelho e adaptador HAL3 permitiram captura YUV; uma ponte publica fontes PipeWire para clientes compatíveis.

| Perfil validado em 2026-09-28 | Captura HAL | Após rotação | Cadência publicada |
|---|---|---|---|
| Frontal Full HD | 1920×1080 | 1080×1920 | 25 fps |
| Principal Full HD | 1920×1080 | 1080×1920 | 25 fps |
| Frontal máxima YUV | 2328×1748 | 1748×2328 | 15 fps |
| Principal 4K | 3840×2160 | 2160×3840 | 15 fps |
| Principal máxima YUV | 4000×3008 | 3008×4000 | 10 fps |

“Máxima” significa máximo YUV exposto pelo HAL adaptado, não todos os megapixels comerciais do sensor. O modo Full HD é mais equilibrado. Só um sensor/perfil captura por vez. Houve imagem real e encerramento limpo em teste local Firefox `getUserMedia`; não foi realizada chamada Meet de validação nem enviado vídeo a terceiros.

Um ajuste de memória dos buffers da ponte evitou um crash do Firefox; a câmera não foi “corrigida” desativando sandbox. A ponte PipeWire não cria automaticamente `/dev/videoN`, então clientes apenas V4L2 podem continuar sem webcam. O módulo camera permaneceu carregado: descarregá-lo foi evitado após um CrashDump histórico durante limpeza. Reboot completo da integração final de alta resolução não foi validado naquela etapa.

## Vídeo, orientação e PD ainda não estão resolvidos universalmente

Em setembro, HDMI/hub chegaram a retomar vídeo e preservar aplicações. Em investigação posterior, monitor preto persistiu mesmo com DRM `connected/enabled`, e até barras KMS sem o desktop ficaram invisíveis. Girar **somente o plug USB-C do hub no telefone em 180°** recuperou a imagem física, com mudança da orientação reportada pelo driver.

Isso comprova comportamento dependente de orientação naquela montagem. Não distingue definitivamente contato, cabo, mux, PHY ou implementação de driver. Também não significa que todo cabo deva ser usado numa orientação fixa como solução definitiva.

Inserir alimentação PD depois que mouse/hub estavam funcionando provocou desconexão e falhas de enumeração `EPROTO -71`. Em algumas tentativas, conectar o hub já alimentado recuperou periféricos. Isso continua sendo um workaround/diagnóstico, **não uma correção permanente da transição PD**. Não force OTG boost contra alimentação externa e não adicione reset USB automático baseado só nesses sintomas.

## Como investigar seu próprio OnePlus com segurança

1. Identifique variante exata e versão Android/firmware. Não confunda 9 e 9 Pro só por terem o mesmo SoC.
2. Confira o estado atual do port e a linha de kernel desejada; a experiência vendor aqui não certifica mainline.
3. Prepare backup, recuperação específica e acesso de manutenção antes de substituir Android.
4. Faça inventário com [diagnóstico](../diagnostico/metodo.md) e teste USB/input, display, energia e GPU separadamente.
5. Registre resultados e limitações. Para repetir adaptações privadas, seria necessário publicar/revisar seus fontes, builds, dependências e licenças, com nova validação de boot/hardware.

Não há nesta página comando de flash para a imagem histórica, porque as condições de reprodução completa não estão reunidas num artefato público auditado. Há métodos gerais reproduzíveis e um registro honesto do que foi aprendido.

**Fontes e verificação:** revisão **2026-10-10**; [OnePlus kernel OSS](https://github.com/OnePlusOSS/android_kernel_oneplus_sm8350), [módulos/DT OnePlus](https://github.com/OnePlusOSS/android_kernel_modules_and_devicetree_oneplus_sm8350), [MR pública](https://gitlab.com/postmarketOS/pmaports/-/merge_requests/4729), [Freedreno](https://docs.mesa3d.org/drivers/freedreno.html), [HAL3 Android 12](https://android.googlesource.com/platform/hardware/libhardware/+/refs/heads/android12-release/include/hardware/camera3.h). Evidências privadas consultadas: relatórios de input, GNOME nativo, Bluetooth, Adreno, monitor/PD e câmera/webcam de setembro de 2026. Este resumo não publica suas capturas, chaves ou blobs e não transforma evidência local em suporte oficial.
