---
title: Áudio no telefone, HDMI, USB e Bluetooth
description: Diagnostique ALSA, perfis, servidor de áudio, roteamento e microfone.
sidebar_position: 6
last_verified: '2026-10-10'
---

Áudio pode falhar em quatro pontos: o kernel não cria a placa; a placa existe mas o codec/amplificador não tem configuração; o servidor de áudio não oferece o perfil correto; ou o aplicativo usa outra saída. Alto-falante, HDMI, microfone, USB e Bluetooth exigem testes independentes.

**Dificuldade:** intermediária. **Resultado esperado:** reprodução e captura no destino escolhido, com volume seguro. **Materiais:** arquivo de som local conhecido, fone/alto-falante quando necessário, terminal na sessão do usuário. **Pré-requisitos:** suporte do port ou dispositivo USB Audio reconhecido. Em Android/PRoot, pode ser necessário integrar o áudio ao Android, em vez de acessar ALSA diretamente.

## Preparação e segurança

Reduza o volume antes de testar. Amplificadores internos podem precisar de calibração e limites definidos pelo fabricante; escrever valores aleatórios em controles ALSA pode gerar volume perigoso ou comportamento inadequado. Registre configuração anterior e não substitua todos os arquivos de áudio por exemplos de outro telefone.

## 1. Existe dispositivo ALSA?

```sh
cat /proc/asound/cards
aplay -l
arecord -l
ls -l /dev/snd
```

`aplay -l` lista hardware de reprodução; `arecord -l`, captura. Esses utilitários vêm normalmente de ALSA utils. `-L`, diferente de `-l`, lista também PCMs virtuais/plugins. Uma placa existente não prova rota física do alto-falante. Falta de placa indica investigar driver, DT, firmware e erro de inicialização.

Em smartphones, o caminho pode depender de mixer, DSP e configuração UCM do modelo. A presença de um pacote `alsa-ucm-conf` não garante um perfil para seu aparelho. Consulte o port e os [perfis mantidos pelo ALSA](https://github.com/alsa-project/alsa-ucm-conf), com versão e hardware correspondentes.

## 2. Qual servidor está ativo?

```sh
ps -eo pid,user,args | rg 'pipewire|wireplumber|pulseaudio'
wpctl status
pactl info
```

`wpctl` controla WirePlumber/PipeWire; `pactl` pode conversar com PulseAudio verdadeiro ou com a camada pipewire-pulse. PipeWire e PulseAudio aparecerem como processos não implica necessariamente conflito: um pode estar reservado a vídeo. Já dois servidores disputando a mesma placa de áudio exigem revisão da arquitetura.

Execute esses comandos como o usuário da **sessão gráfica**, não com `sudo` por padrão. SSH pode ter outro ambiente de runtime; um erro de socket não comprova daemon parado no desktop.

## 3. Saída, volume e roteamento

Na configuração GNOME, escolha explicitamente saída, perfil e volume. Pelo terminal:

```sh
wpctl status
wpctl get-volume @DEFAULT_AUDIO_SINK@
pactl list short sinks
pactl list short sources
```

Uma saída `SUSPENDED` quando não há reprodução costuma significar ociosidade normal. Durante reprodução, confira o destino da aplicação. Depois de identificar o nó correto, `wpctl set-default ID` altera o padrão; substitua ID pelo número atual, pois IDs podem mudar a cada sessão. Anote o padrão antigo para reverter. No PulseAudio, consulte `pactl --help` e use `set-default-sink NOME` com o nome real.

Reproduza um arquivo local pela aplicação comum. Se ALSA direto funciona mas a aplicação não, concentre-se no servidor/roteamento. Se nenhum funciona, investigue o caminho da placa. Evite tocar diretamente no dispositivo ALSA ocupado pelo desktop; `Device or resource busy` pode ser exclusividade legítima.

## HDMI e Bluetooth

HDMI precisa de display/link ativo e informações de áudio do monitor. Alguns monitores não têm alto-falante; podem oferecer só saída para fone. Confira capacidades do monitor antes de concluir que o driver falhou. A perda de áudio após hotplug pode ser perfil ou saída padrão voltando para o telefone.

Bluetooth precisa de BlueZ funcional e integração do servidor de áudio. A2DP é normalmente adequado para reprodução; perfis de headset com microfone têm características e qualidade diferentes. Um teclado Bluetooth pareado não valida áudio. Veja [Bluetooth](bluetooth.md).

## Microfone e privacidade

Teste primeiro num gravador local com consentimento de quem estiver perto. Confira o medidor, gravar, ouvir e apagar o arquivo de teste. Depois teste a aplicação de chamada; permissões do navegador/portal são uma camada adicional. Fonte de monitor de saída grava o áudio do desktop, não o microfone físico.

Se fizer diagnóstico por `arecord`, escolha formato/taxa/canais que o dispositivo anuncia e encerre a captura após poucos segundos. Não publique gravações de pessoas como evidência técnica.

## Persistência, erros e reversão

O servidor costuma persistir escolhas de usuário; perfis UCM devem pertencer à integração do dispositivo. Evite autostarts com dez comandos de mixer sem explicar ordem e finalidade. Copie o perfil anterior antes de ajustes e reverta exatamente os arquivos alterados. Não descarregue módulos DSP em operação sem suporte do port.

Teste boot, reprodução no telefone, HDMI reconnect, volume, captura e uso de fone/periférico conforme seu objetivo. Um DAC USB class-compliant pode ser alternativa quando o áudio interno é incompleto, com requisitos adicionais de host/energia.

**Fontes e verificação:** **2026-10-10**; [wpctl](https://pipewire.pages.freedesktop.org/wireplumber/man/wpctl.html), [PipeWire overview](https://docs.pipewire.org/page_overview.html), [PulseAudio CLI](https://www.freedesktop.org/wiki/Software/PulseAudio/Documentation/User/CLI/), [ALSA UCM](https://github.com/alsa-project/alsa-ucm-conf). Áudio interno exige dados específicos do modelo.
