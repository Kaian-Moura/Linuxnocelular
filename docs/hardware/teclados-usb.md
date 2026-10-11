---
title: Teclado USB não funciona, mas o mouse funciona
description: Compare USB, HID, evdev, udev, seat e compositor para encontrar a primeira divergência.
sidebar_position: 3
last_verified: '2026-10-10'
---

O mouse funcionar prova que **um caminho de entrada** está funcionando. Um teclado pode ter outra velocidade USB, múltiplas interfaces HID, consumo diferente, outros descritores e outra classificação de input. O diagnóstico deve acompanhar cada interface até a aplicação.

**Resultado esperado:** localizar a primeira falha e corrigir sua camada, preferencialmente para teclados HID comuns. **Dificuldade:** intermediária. **Pré-requisitos:** Linux nativo, hub acessível, teclado/mouse e SSH ou teclado virtual. **Ferramentas:** `usbutils`, `evtest`, ferramentas do libinput e `udevadm` quando disponível. Confira o nome e a disponibilidade do pacote no repositório da sua distribuição antes de instalar; no Alpine, `apk search usbutils evtest libinput` é uma consulta.

:::warning Não capture senhas
`evtest` e ferramentas de input podem revelar tudo o que for digitado durante a captura. Use uma janela de teste, limite a duração, evite senhas e revise logs antes de publicar. Não use `--grab`: isso pode impedir que o desktop receba as teclas.
:::

## Cadeia de diagnóstico

```mermaid
flowchart LR
  K[Teclado] --> U[USB e hub]
  U --> H[usbhid e parser HID]
  H --> I[Input do kernel]
  I --> E["/dev/input/event*"]
  E --> D[udev e permissões]
  D --> L[libinput e seat]
  L --> C[Compositor e XKB]
  C --> A[Aplicativo com foco]
```

### 1. Enumeração: o teclado existe no USB?

```sh
lsusb
lsusb -t
sudo dmesg | tail -100
```

Identifique VID:PID pela saída, não pela etiqueta da carcaça. Em `lsusb -t`, compare driver, velocidade e porta com o mouse. Um teclado composto pode criar interfaces Keyboard, Consumer Control e System Control. Para descritores de um dispositivo identificado, use `sudo lsusb -v -d VID:PID`, substituindo `VID:PID` pelos números reais.

Se o teclado nem enumera, investigue [hub/energia](usb-c-hubs.md), outro cabo/porta, erros `-71`, `-110` e transaction translator de hubs. Keymap, GNOME e permissões de evdev não corrigem essa etapa.

### 2. HID e kernel: há driver e capacidades?

```sh
cat /proc/bus/input/devices
ls /sys/bus/hid/devices
ls -l /dev/input
lsmod
```

`lsmod` lista módulos carregáveis; drivers embutidos no kernel não aparecem. Se `/proc/config.gz` existir:

```sh
zcat /proc/config.gz | rg 'CONFIG_(HID|HID_GENERIC|USB_HID|INPUT_EVDEV)='
```

`=y` indica embutido, `=m` módulo. Só use `modprobe usbhid` se a configuração e o pacote de módulos **da mesma versão exata do kernel** mostrarem que isso é necessário. Não descarregue `usbhid` com seu mouse de manutenção em uso. Ausência de `/proc/config.gz` não prova ausência do recurso; procure o arquivo de configuração correspondente ao pacote/kernel.

### 3. Evdev: as teclas chegam ao kernel?

O bloco do teclado em `/proc/bus/input/devices` mostra `Handlers=... eventN`. Escolha esse nó:

```sh
sudo evtest /dev/input/eventN
```

Substitua `eventN`. Pressione e solte A, Shift e Enter. Espera-se `EV_KEY` com valor 1 na pressão e 0 na liberação; repetição pode usar 2. Finalize com Ctrl+C. `SYN_DROPPED` significa que esse leitor perdeu eventos por fila cheia: não é prova automática de teclado defeituoso.

Eventos presentes descartam ausência total de transporte/HID/input para as teclas testadas. Ainda é necessário verificar libinput e a aplicação.

### 4. Udev, nós e seat

```sh
udevadm info --query=property --name=/dev/input/eventN
ls -l /dev/input/eventN
sudo libinput list-devices
```

Compare `ID_INPUT`, `ID_INPUT_KEYBOARD`, caminho, seat e capacidades com um teclado funcional. Um nó criado não garante que o compositor foi notificado. Propriedades classificando teclado como mouse, eventos de remoção ausentes ou base udev obsoleta podem impedir o uso.

Não aplique `chmod 777 /dev/input/*`. Isso expõe entradas de outros usuários e desaparece na reconexão. Corrija a política de acesso da distribuição, o gerenciador de sessão ou uma regra específica **com causa demonstrada**. Em instalações normais, regras genéricas classificam capacidades; copiar uma regra VID:PID sem diagnosticar cria dependência desnecessária de modelo.

### 5. Libinput, compositor e aplicação

```sh
sudo libinput debug-events --device /dev/input/eventN
```

Sem a opção de exibir códigos completos, algumas versões ocultam detalhes por privacidade. A presença de eventos de teclado já ajuda. Finalize e teste num editor: letras, modificadores, Caps Lock, Backspace e acentos. Em Wayland, `xinput`/`xev` observam principalmente clientes Xwayland; não servem para excluir uma falha da sessão Wayland inteira.

Se evdev funciona e libinput não lista o dispositivo, investigue classificação e suporte. Se libinput funciona mas a aplicação não, confira foco, sessão/seat e mapa XKB. LED Caps Lock depende de uma resposta do desktop e do suporte ao relatório de saída; sozinho não prova ausência de entrada.

## Correção, backup e persistência

Antes de modificar uma regra, copie somente o arquivo afetado para um diretório de backup datado e registre o pacote/versão. Prefira corrigir o serviço udev/gerenciador normal. Ports com `/dev` tmpfs e init próprio podem precisar completar criação/remoção de nós e emissão de hotplug; esse cenário não é motivo para instalar um segundo udev global sem revisar conflitos.

Valide o usuário comum, reconecte apenas o teclado, depois o hub, e reinicie. Teste dois teclados comuns quando disponíveis, mantendo mouse e vídeo. Reverter significa restaurar a regra/serviço salvo e retornar ao pacote anterior compatível; nunca apagar `/dev/input` inteiro.

No [OnePlus do projeto](../dispositivos/oneplus-9-pro.md), a correção comprovada foi na classificação/hotplug de input sob uma integração customizada. USB_HID, HID_GENERIC e EVDEV já eram embutidos. Essa evidência não autoriza instalar os helpers privados em outro modelo.

**Fontes e verificação:** **2026-10-10**; [HID e descritores](https://docs.kernel.org/hid/hidintro.html), [eventos input](https://docs.kernel.org/input/event-codes.html), [libinput tools](https://wayland.freedesktop.org/libinput/doc/latest/tools.html), [classificação via udev](https://wayland.freedesktop.org/libinput/doc/latest/device-configuration-via-udev.html). Testes físicos adicionais dependem do leitor e do port.
