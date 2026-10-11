---
title: Desktop sobre Android — Termux:X11 e VNC
sidebar_position: 4
description: Rode uma interface gráfica no telefone e entenda o que uma sessão X11 ou VNC fornece.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, requisitos e limites

**Dificuldade:** intermediária. **Resultado:** desktop executado pelo telefone e exibido no Android, ou por um cliente VNC. O Android permanece como sistema principal. Para Termux:X11, a documentação consultada exige Android 8 ou posterior, aplicativo Android e pacote auxiliar. Para o exemplo VNC, utiliza-se Ubuntu/Debian em PRoot já funcional.

Você precisará de rede para instalar pacotes, armazenamento, acesso à interface Android para instalar o APK e uma forma de entrada. Um monitor externo é opcional. Antes de preparar a interface, execute um programa de terminal e teste um backup pelos guias [Termux](./termux.md) e [PRoot](./proot-distro.md).

:::info Não equivale a GNOME nativo no boot
Termux:X11 é um servidor gráfico apresentado por um aplicativo Android. VNC cria ou compartilha uma sessão conforme o servidor escolhido. Os procedimentos desta página não removem o Android nem controlam diretamente KMS, USB-C ou o display manager de uma instalação Linux nativa.
:::

## Caminho A — XFCE do próprio Termux

### Instalar o servidor e desktop

Obtenha o APK pela [release do Termux:X11](https://github.com/termux/termux-x11/releases/tag/nightly), seguindo a documentação da versão. Instale `termux-x11-universal-debug.apk`, salvo se tiver motivo e assinatura compatível para a variante sharedUid. Essa variante é documentada como compatível somente com Termux de origem GitHub; não a combine com F-Droid por tentativa.

**No Termux:**

```bash
pkg update
pkg install x11-repo
pkg install termux-x11-nightly xfce
termux-x11 :1 -xstartup 'dbus-launch --exit-with-session xfce4-session'
```

`x11-repo` habilita o repositório gráfico do Termux; `:1` escolhe um número de display; D-Bus organiza a comunicação dos aplicativos dessa sessão. Abra o aplicativo Termux:X11 no Android se sua janela não for trazida à frente. Se `dbus-launch` não existir, use `pkg search dbus` e confira o pacote da sua versão em vez de instalar arquivos Debian no Termux.

**Verificação:** abra o terminal gráfico, crie um arquivo e encerre o desktop pelo seu menu. Confirme que o arquivo aparece no Termux. Teste teclado, caracteres acentuados, mouse e rolagem. Isso valida entrada no aplicativo, não USB HID numa distribuição nativa.

### Diagnóstico e encerramento

Tela preta com cursor pode exigir a opção documentada `-legacy-drawing`; cores trocadas podem requerer `-force-bgra`. Teste somente a opção ligada ao sintoma, encerrando a sessão anterior antes. Para capturar logs:

```bash
TERMUX_X11_DEBUG=1 termux-x11 :1 -xstartup 'xfce4-session' > "$HOME/termux-x11.log" 2>&1
```

A opção `Exit` na notificação pode fechar a atividade sem terminar o processo servidor. Encerre primeiro aplicativos e desktop; consulte `pgrep -a -f termux-x11` para identificar os processos. A documentação oferece `pkill -f termux-x11`, mas esse padrão encerra todas as sessões correspondentes: utilize-o apenas quando tiver confirmado que não há outro trabalho ativo.

## Caminho B — desktop da distribuição em PRoot

Instale a distribuição conforme a [ajuda local do PRoot-distro](./proot-distro.md). No Ubuntu/Debian:

```bash
apt update
apt install xfce4 xfce4-terminal dbus-x11
exit
```

**De volta ao Termux:**

```bash
termux-x11 :1 &
proot-distro login ubuntu --shared-tmp
```

Substitua `ubuntu` pelo nome existente. `--shared-tmp` disponibiliza o socket do servidor X na sessão, quando a versão aceita essa opção. **Dentro da distribuição:**

```bash
export DISPLAY=:1
dbus-launch --exit-with-session xfce4-session
```

Se o comando não encontra o display, verifique se o servidor está vivo e se `/tmp/.X11-unix` contém o socket correspondente. Não use `xhost +`: remover indiscriminadamente a autorização do X não resolve uma montagem `/tmp` ausente e amplia acesso à sessão.

## Caminho C — VNC local ou por túnel SSH

Este caminho cria um display virtual. Ele não mostra automaticamente a sessão do monitor físico e pode receber entrada de maneira diferente. No Ubuntu/Debian, como usuário comum da sessão:

```bash
sudo apt install tigervnc-standalone-server tigervnc-tools dbus-x11 xfce4
mkdir -p "$HOME/.local/state/vnc"
tigervncpasswd "$HOME/.local/state/vnc/passwd"
chmod 600 "$HOME/.local/state/vnc/passwd"
Xtigervnc :2 -geometry 1280x720 -depth 24 -rfbport 5902 -localhost -SecurityTypes VncAuth -PasswordFile "$HOME/.local/state/vnc/passwd" &
vnc_pid=$!
DISPLAY=:2 dbus-run-session -- xfce4-session
kill "$vnc_pid"
```

Se estiver no administrador simulado do PRoot, a instalação usa `apt` sem `sudo`; a sessão diária deve utilizar um usuário comum quando suportado. `tigervncpasswd` cria a senha. `Xtigervnc` publica somente no loopback por `-localhost`. O desktop permanece em primeiro plano; depois de sair, `kill` encerra **o PID criado nessa shell**. Não copie a linha final para outra sessão com variável ausente.

Para um viewer no mesmo Android, conecte a `127.0.0.1:5902`. No notebook, prepare primeiro [SSH no Termux e o alias de cliente `mini-pc`](../projetos/ssh-remoto.md), com conta, IP, porta e chave confirmados, e execute:

```bash
ssh -N -L 5902:127.0.0.1:5902 mini-pc
```

Abra o viewer do notebook em `127.0.0.1:5902`. VNCAuth não substitui criptografia: o túnel SSH protege o tráfego. Não exponha VNC na internet nem use `SecurityTypes None`.

## Desempenho, erros e alternativas

Comece em 1280×720, com poucas aplicações e sem composições pesadas. Compare uso de CPU com o desktop fechado e aberto. Termux:X11 e PRoot não garantem aceleração Adreno/Mali; a aparência de uma janela não comprova um renderer de hardware. VNC acrescenta captura, compressão e transmissão e não é uma boa medida de latência do monitor físico.

Para aplicativos que exigem uma sessão logind/Wayland completa, um XFCE simples pode ser mais viável sobre Android. GNOME dentro de uma janela continua sendo uma sessão secundária. Se o requisito é controlar o boot e a GPU diretamente, investigue Linux nativo para o modelo.

## Backup, rollback e teste final

Faça backup das configurações pessoais antes de substituí-las. O caminho A pode ser desfeito removendo seus pacotes gráficos após revisar a transação; B e C permanecem contidos no ambiente da distribuição. Não desinstale o Termux para corrigir um desktop sem antes exportar projetos.

Valide abrir e fechar duas sessões em momentos diferentes, persistência de um arquivo, entrada física e virtual, retorno após apagar a tela e consumo térmico. Se utiliza monitor, teste a reconexão separadamente: seu resultado depende do hardware Android, não apenas do servidor X.

## Fontes e estado

Revisão documental: **10/10/2026**. [Termux:X11, execução e opções](https://github.com/termux/termux-x11/blob/master/README.md), [pacotes X11 do Termux](https://github.com/termux/termux-packages/tree/master/x11-packages), [parâmetros do TigerVNC](https://tigervnc.org/doc/Xvnc.html), [SSH e redirecionamentos](https://man.openbsd.org/ssh). Não houve validação física deste tutorial em todos os modelos.
