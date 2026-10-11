---
title: Instale e aprenda a usar as ferramentas de diagnóstico
description: Do comando não encontrado à primeira consulta de USB, input, rede, gráficos e logs, com pacotes por distribuição.
sidebar_position: 1
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Os guias de hardware usam programas como `lsusb` e `evtest`. Esta página ensina **como obtê-los e fazer a primeira consulta**, sem exigir que você já saiba relacionar comando a pacote. Dificuldade: iniciante/intermediária. Resultado esperado: ferramentas instaladas no ambiente correto e um registro inicial do sistema; instalar essas ferramentas não instala drivers para hardware ausente.

## 1. Descubra onde você está conectado

Se o objetivo é investigar o USB do telefone com Linux nativo, abra um terminal **nele** ou entre por [SSH](../projetos/ssh-remoto.md). O notebook é outro sistema: seu `lsusb` mostra as portas do notebook. ADB conecta ao shell Android; ali os nomes de pacotes abaixo não se aplicam. PRoot compartilha o kernel Android e não concede automaticamente acesso aos dispositivos de input ou aos controles do host.

No Linux que você quer investigar:

```bash
cat /etc/os-release
uname -r
uname -m
id
```

Anote distribuição, kernel, arquitetura e identidade. Se estiver em Termux, use `termux-info`; siga o [guia Termux](../android/termux.md) para seus pacotes. Esta página concentra diagnósticos do **Linux nativo**. Para dúvidas de shell/senha/arquivos, faça a [aula prática](../comece-aqui/terminal-primeiros-passos.md).

## 2. Confira o que já existe

```bash
command -v lsusb
command -v evtest
command -v libinput
command -v udevadm
command -v ip
command -v bluetoothctl
command -v wpctl
```

Cada caminho retornado é uma ferramenta encontrada no `PATH`. Uma linha vazia significa “não encontrada”, não “o telefone não suporta esse recurso”. Alguns sistemas já trazem uma variante BusyBox de um comando; consulte `--help` antes de assumir que todas as opções GNU existem.

## 3. Encontre o pacote da sua release

| Comando/função | Alpine/postmarketOS: nome a consultar | Debian/Ubuntu: nome a consultar |
| --- | --- | --- |
| `lsusb`, árvore e descritores USB | `usbutils` | `usbutils` |
| `evtest`, eventos do kernel | `evtest` | `evtest` |
| `libinput list-devices`, `debug-events` | `libinput-tools` | `libinput-tools` |
| `lsblk`, ferramentas de armazenamento | `util-linux`, possíveis subpacotes | `util-linux` |
| `ip`, `ss`, interfaces/conexões | `iproute2` | `iproute2` |
| `bluetoothctl`, `btmon` | `bluez`, possíveis subpacotes da release | `bluez` |
| `rfkill` | `util-linux`, subpacote `rfkill` quando oferecido | `rfkill` |
| `nmcli` | `networkmanager-cli` quando oferecido | `network-manager` |
| `wpctl` | `wireplumber` | `wireplumber` |
| `aplay`, `arecord` | `alsa-utils` | `alsa-utils` |
| `pactl` | `pulseaudio-utils` | `pulseaudio-utils` |
| `upower` | `upower` | `upower` |
| `rg`, busca em texto | `ripgrep` | `ripgrep` |
| `ps` com opções completas | `procps-ng` | `procps` |
| `v4l2-ctl` | `v4l-utils` | `v4l-utils` |
| `glxinfo` | `mesa-utils` quando oferecido | `mesa-utils` |
| `eglinfo` | Confira qual subpacote Mesa fornece na release | `mesa-utils-extra` ou pacote correspondente da release |
| `unzip`, extrair ZIP | `unzip` | `unzip` |
| `nano`, editor de terminal | `nano` | `nano` |

São nomes de consulta, não garantia de disponibilidade em toda versão/arquitetura. No Alpine, pesquise no [catálogo de pacotes](https://pkgs.alpinelinux.org/packages) escolhendo **sua branch, repositório e arquitetura**. No Debian, use o [catálogo Debian](https://packages.debian.org/) com a release correta; no Ubuntu, [pacotes Ubuntu](https://packages.ubuntu.com/). `udevadm` vem da implementação udev utilizada pelo sistema: não substitua o gerenciador de dispositivos só para obter um comando.

No Alpine/postmarketOS:

```bash
apk search -e usbutils
apk search -e evtest
apk search -e libinput-tools
apk info usbutils
cat /etc/apk/repositories
```

No Debian/Ubuntu:

```bash
apt-cache policy usbutils evtest libinput-tools
apt show usbutils
```

Os comandos consultam o índice conhecido. Se nada aparece, atualize o índice pelo passo seguinte, confira rede e pesquise de novo. Não adicione edge/testing a uma release estável para preencher a tabela. Pacotes específicos do port precisam ser preservados.

## 4. Instale primeiro um conjunto pequeno

**Alpine/postmarketOS, usando o elevador configurado:**

```bash
doas apk update
doas apk add usbutils evtest libinput-tools
```

Se seu sistema usa sudo, substitua **somente `doas` por `sudo`**. Não há necessidade de instalar ambos. Se não tem autorização administrativa, peça ao administrador ou use o procedimento de conta da sua imagem; não altere a senha root aleatoriamente.

**Debian/Ubuntu, alternativa ao bloco anterior:**

```bash
sudo apt update
sudo apt install usbutils evtest libinput-tools
```

Leia a lista de pacotes/dependências e possíveis remoções antes de confirmar. Se um pacote da tabela não existe, instale os que foram encontrados separadamente e registre a ausência. Não desative verificações de assinatura ou copie bibliotecas de uma distribuição diferente.

**Verificação no mesmo terminal:**

```bash
command -v lsusb
command -v evtest
command -v libinput
lsusb --version
libinput --version
```

O executável deve ser encontrado e a versão deve aparecer, quando a opção for suportada. Anote a instalação no seu diário: distribuição, pacote, versão e data. Guarde a lista anterior de pacotes se pretende remover depois.

## 5. Primeira consulta USB, sem reinicializar o controlador

Com os periféricos conectados no **telefone**:

```bash
lsusb
lsusb -t
cat /proc/bus/input/devices
ls -l /dev/input
```

`lsusb` lista o que enumerou no barramento; `-t` organiza a árvore, velocidades e drivers; o arquivo em `/proc` lista os dispositivos de input registrados; `/dev/input` contém interfaces de eventos quando criadas. Um teclado ausente em `lsusb` não deve ser tratado como problema de keymap. Um teclado presente em `lsusb` ainda pode não produzir eventos.

Um mouse USB funcionando é referência útil, mas não comprova que outra porta, energia e interface de teclado funcionem. Siga a comparação em [teclados USB](../hardware/teclados-usb.md). Não escreva em arquivos `unbind`, `authorized`, `role` ou `power/control` como primeiro teste; isso altera o hardware e pode interromper monitor/rede/SSH.

## 6. Teste eventos sem ler senhas

`evtest` pode acessar os eventos brutos e registrar tudo que você digitar. Feche campos com informação sensível. Use o nível de privilégio exigido pela política da sessão; o exemplo Alpine usa doas:

```bash
doas evtest
```

A ferramenta lista os dispositivos e solicita seleção. Escolha **pelo nome do teclado** e número de evento apresentados, não um número copiado de outra máquina. Pressione uma letra e solte, sem escrever senha. O teste útil é observar eventos de tecla pressionada/solta para o dispositivo escolhido. Encerre com `Ctrl+C`. Não use captura exclusiva (`--grab`) nesse primeiro teste.

Depois, quando libinput estiver presente:

```bash
doas libinput list-devices
```

O teclado deve aparecer com capacidade de teclado, se integrado corretamente. Se evtest mostra eventos e o ambiente gráfico não recebe letras, o problema já passou do barramento/HID básico; investigue seat, sessão, libinput e foco da aplicação. Os [utilitários libinput](https://wayland.freedesktop.org/libinput/doc/latest/tools.html) são diagnósticos, não substitutos do compositor.

No Debian/Ubuntu troque o elevador por sudo. Nunca aplique `chmod 666 /dev/input/event*` ou coloque todo usuário em grupo de leitura de eventos para “resolver”: isso permite observar entradas que deveriam ser privadas.

## 7. Rede, Bluetooth, áudio e gráficos: obtenha só o necessário

Os guias de [Wi-Fi](../hardware/wifi.md), [Bluetooth](../hardware/bluetooth.md), [áudio](../hardware/audio.md), [GPU](../hardware/gpu.md) e [câmeras](../hardware/cameras.md) explicam os testes. Use a tabela para localizar as ferramentas faltantes; não instale/inicie todos os serviços só porque o comando existe.

Por exemplo, `wpctl status` pressupõe WirePlumber/PipeWire e sessão acessível. Instalar um segundo gerenciador de rede ou áudio por cima do existente pode introduzir conflito. `glxinfo` exige sessão gráfica X11 acessível; `DISPLAY` vazio numa conexão SSH não demonstra GPU quebrada. `v4l2-ctl` listar um dispositivo não comprova que o browser recebe uma câmera.

## 8. Capture um relatório pequeno antes de modificar

Crie uma pasta nova em sua conta e grave apenas as consultas pertinentes:

```bash
mkdir -p "$HOME/diagnostico-celular"
uname -a > "$HOME/diagnostico-celular/kernel.txt"
lsusb > "$HOME/diagnostico-celular/usb.txt"
lsusb -t > "$HOME/diagnostico-celular/arvore-usb.txt"
cat /proc/bus/input/devices > "$HOME/diagnostico-celular/input.txt"
```

Esses nomes substituem arquivos anteriores de mesmo nome; use uma pasta com data para preservar sessões diferentes. Para kernel, `dmesg` pode exigir privilégio. Em OpenRC/syslog procure os logs configurados; em systemd use `journalctl`. A falta de `journalctl` no Alpine não é defeito do registro — ele pode utilizar outro mecanismo.

Revise o texto antes de compartilhar: nomes, serial de dispositivos, endereços de rede e teclas podem ser privados. Cópias de `/sys` completas e dumps brutos não são necessários para uma pergunta inicial. O [método de diagnóstico](metodo.md) orienta hipótese e comparação antes/depois.

## Erros, reversão e teste final

`command not found` pede conferir instalação e ambiente; erro de permissão pede conferir a política do recurso; saída vazia pede conferir o subsistema investigado. São situações diferentes. Se a instalação precisa remover kernel, pacote do dispositivo ou desktop, cancele e confira a branch: ferramentas de leitura não deveriam exigir uma troca cega de port.

Se quiser remover uma ferramenta de teste, use o mesmo gerenciador e revise a simulação/lista de dependências antes. Não remova udev, libinput, BlueZ ou WirePlumber quando o desktop/hardware os utiliza apenas por aparecerem nesta página.

Conclua quando sabe onde as ferramentas rodam, quem tem permissão, onde o relatório foi salvo e qual camada o resultado observa. Agora volte ao guia de hardware correspondente e siga os testes na ordem proposta.

## Fontes e verificação

Revisão documental em **11/10/2026**, sem instalação em telefone nesta rodada. Fontes: [APK Alpine](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html), [catálogo Alpine](https://pkgs.alpinelinux.org/packages), [referência Debian](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html), [libinput tools](https://wayland.freedesktop.org/libinput/doc/latest/tools.html), [input no kernel](https://docs.kernel.org/input/input.html) e [usbmon](https://docs.kernel.org/usb/usbmon.html). usbmon é um diagnóstico avançado condicionado ao kernel; não é necessário para a primeira enumeração. A disponibilidade dos subpacotes deve ser confirmada na release/arquitetura do leitor.
