---
title: Desktop sobre Android — Termux:X11 e VNC
sidebar_position: 4
description: Rode uma interface gráfica no telefone e entenda o que uma sessão X11 ou VNC fornece.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, requisitos e limites

**Dificuldade:** intermediária. **Resultado:** desktop executado pelo telefone e exibido no Android, ou por um cliente VNC. O Android permanece como sistema principal. Para Termux:X11, a documentação consultada exige Android 8 ou posterior, aplicativo Android e pacote auxiliar. Para o exemplo VNC, utiliza-se Ubuntu/Debian em PRoot já funcional.

Você precisará de rede para instalar pacotes, armazenamento, acesso à interface Android para instalar o APK e uma forma de entrada. Um monitor externo é opcional. Antes de preparar a interface, execute um programa de terminal e teste um backup pelos guias [Termux](./termux.md) e [PRoot](./proot-distro.md).

Escolha **um caminho por vez**. A usa pacotes do próprio Termux; B usa o servidor Termux:X11 para exibir programas de Ubuntu/Debian; C cria uma tela virtual VNC. Não inicie dois desktops no mesmo display `:1`. O número `:1` identifica uma tela do servidor X; não é uma senha nem um endereço IP.

:::info Não equivale a GNOME nativo no boot
Termux:X11 é um servidor gráfico apresentado por um aplicativo Android. VNC cria ou compartilha uma sessão conforme o servidor escolhido. Os procedimentos desta página não removem o Android nem controlam diretamente KMS, USB-C ou o display manager de uma instalação Linux nativa.
:::

## Caminho A — XFCE do próprio Termux

### Baixar o APK e compreender as duas partes

1. No navegador **do telefone**, abra a [release nightly oficial do Termux:X11](https://github.com/termux/termux-x11/releases/tag/nightly). Confira o proprietário `termux` e o projeto `termux-x11`.
2. Expanda **Assets** e toque em **`termux-x11-universal-debug.apk`**. O nome `debug` faz parte do asset que a documentação oficial indica; não escolha **Source code** nem um pacote `.deb` para instalar pelo Android.
3. Abra **Arquivos → Downloads**, toque nesse APK e instale pelo fluxo de autorização de origem explicado em [Termux](./termux.md). Abra Termux:X11 após concluir.
4. Em Android 13 ou posterior, permita notificações quando solicitado: a notificação oferece controles úteis da sessão. Isso não concede root.

Você deve agora ter **dois ícones Android**: Termux e Termux:X11. Abrir somente Termux:X11, antes de iniciar um programa gráfico, pode mostrar uma área sem desktop. Isso é esperado. Falta o pacote auxiliar **dentro do Termux**, instalado abaixo.

A variante `termux-x11-universal-sharedUid-debug.apk` tem uma finalidade diferente e exige a assinatura do Termux de origem GitHub. Não a combine com F-Droid ou Google Play por tentativa. O APK regular é o ponto de partida aqui; a escolha de sharedUid exige preservar dados e conferir a família de APKs primeiro.

### Instalar o servidor e desktop

**No Termux:**

```bash
pkg update
pkg install x11-repo
pkg install termux-x11-nightly xfce
termux-x11 :1 -xstartup 'dbus-launch --exit-with-session xfce4-session'
```

`x11-repo` habilita o repositório gráfico do Termux; `:1` escolhe um número de display; D-Bus organiza a comunicação dos aplicativos dessa sessão. Abra o aplicativo Termux:X11 no Android se sua janela não for trazida à frente. Se `dbus-launch` não existir, use `pkg search dbus` e confira o pacote da sua versão em vez de instalar arquivos Debian no Termux.

Execute as três linhas de instalação, confirmando a transação, antes da linha que inicia a sessão. Essa última pode manter o terminal ocupado: não espere o cursor voltar para abrir Termux:X11. Use o seletor de aplicativos recentes do Android e toque em Termux:X11. O resultado esperado é o desktop XFCE, com painel/menu e gerenciador de janelas.

Não há usuário e senha Linux a digitar para iniciar o caminho A: os processos usam a identidade do Termux. A senha do Android continua sendo do Android. Uma janela pedindo uma senha inesperada deve ser identificada antes de responder.

### Usar tela, mouse e teclado

Em modo touchpad, um toque faz clique; dois dedos fazem clique direito; deslizar verticalmente com dois dedos faz rolagem. A documentação do aplicativo explica também modo de touchscreen. O botão **Voltar** do Android alterna o teclado virtual na atividade Termux:X11; confirme que não está acionando o logout do XFCE.

Para preferências, abra **Preferences** na tela sem cliente conectado, use a ação da notificação quando disponível, ou mantenha pressionado o ícone Termux:X11 no launcher e escolha o atalho de preferências. Ajuste entrada e apresentação ali, registrando a opção que mudou. Rotacione o telefone com a rotação Android habilitada quando quiser testar paisagem; isso não habilita saída HDMI num aparelho sem suporte.

Para fontes enormes, no XFCE abra **Applications/Aplicativos → Settings/Configurações → Appearance/Aparência**, e confira DPI/tamanho de fonte. Comece com uma mudança pequena e preserve o valor anterior. Para registrar preferências do servidor sem adivinhar nomes de opções, `termux-x11-preference list` lista os nomes da versão instalada; a atividade Termux:X11 deve estar aberta ou em segundo plano para essa consulta.

**Verificação:** abra o terminal gráfico, crie um arquivo e encerre o desktop pelo seu menu. Confirme que o arquivo aparece no Termux. Teste teclado, caracteres acentuados, mouse e rolagem. Isso valida entrada no aplicativo, não USB HID numa distribuição nativa.

### Diagnóstico e encerramento

Tela preta com cursor pode exigir a opção documentada `-legacy-drawing`; cores trocadas podem requerer `-force-bgra`. Teste somente a opção ligada ao sintoma, encerrando a sessão anterior antes. Por exemplo, depois de confirmar que `:1` está livre, o teste de tela preta é:

```bash
termux-x11 :1 -legacy-drawing -xstartup 'dbus-launch --exit-with-session xfce4-session'
```

Se resolver, registre que seu aparelho necessita dessa opção; isso não prova uma correção do driver HDMI. Para capturar logs, com a sessão anterior encerrada:

```bash
TERMUX_X11_DEBUG=1 termux-x11 :1 -xstartup 'xfce4-session' > "$HOME/termux-x11.log" 2>&1
```

A opção `Exit` na notificação pode fechar a atividade sem terminar o processo servidor. Encerre primeiro aplicativos e desktop; consulte `pgrep -a -f termux-x11` para identificar os processos. A documentação oferece `pkill -f termux-x11`, mas esse padrão encerra todas as sessões correspondentes: utilize-o apenas quando tiver confirmado que não há outro trabalho ativo.

Pelo menu XFCE, use **Log Out/Sair** para encerrar a sessão e salve os documentos pedidos. Não escolha apagar dados de Termux no Android para “parar o desktop”. Se aparecer `Server is already active for display 1`, identifique a sessão existente e encerre-a corretamente; não apague arquivos de lock enquanto o servidor está funcionando.

## Caminho B — desktop da distribuição em PRoot

Instale a distribuição e crie a conta `aluno` conforme [PRoot-distro](./proot-distro.md). Instale também o APK e pacote auxiliar Termux:X11 do caminho A, **sem iniciar seu XFCE do Termux**. Você utilizará o XFCE da distribuição.

**No Termux**, execute `proot-distro login ubuntu` para entrar no administrador simulado. **Dentro do Ubuntu/Debian:**

```bash
apt update
apt install xfce4 xfce4-terminal dbus-x11
exit
```

**De volta ao Termux:**

```bash
termux-x11 :1 &
proot-distro login --shared-tmp --user aluno ubuntu
```

Substitua `ubuntu` pelo nome existente se escolheu outro. `--shared-tmp` disponibiliza o socket do servidor X na sessão, quando a versão aceita essa opção; `--user aluno` usa a conta já criada. A ajuda local deve confirmar ambas. **Dentro da distribuição, como aluno:**

```bash
export DISPLAY=:1
dbus-launch --exit-with-session xfce4-session
```

Se o comando não encontra o display, verifique se o servidor está vivo e se `/tmp/.X11-unix` contém o socket correspondente. Não use `xhost +`: remover indiscriminadamente a autorização do X não resolve uma montagem `/tmp` ausente e amplia acesso à sessão.

Abra Termux:X11 no Android; espere o desktop da distribuição. No terminal gráfico, `cat /etc/os-release` identifica Ubuntu/Debian, e `whoami` deve mostrar `aluno`. Os programas e a configuração desse desktop são diferentes dos pacotes do caminho A, mesmo quando a aparência parece igual.

Para fechar, use logout do XFCE, saia da shell da distribuição com `exit` e confira o servidor X ainda ativo no Termux antes de encerrá-lo. Não crie um serviço de boot automático enquanto esse ciclo manual não passa duas vezes. Um erro de systemd/logind não se resolve instalando outra sessão por cima do XFCE.

## Caminho C — VNC local ou por túnel SSH

Este caminho cria um display virtual. Ele não mostra automaticamente a sessão do monitor físico e pode receber entrada de maneira diferente. Não exige o APK Termux:X11. Para um teste sobre Android, use a distribuição PRoot já validada.

**No Termux**, entre com `proot-distro login ubuntu`. **Dentro da distribuição, na shell administrativa simulada:**

```bash
apt update
apt install tigervnc-standalone-server tigervnc-tools dbus-x11 xfce4
exit
```

Agora, **no Termux**, entre com `proot-distro login --user aluno ubuntu`. **Dentro do Ubuntu, como aluno**, prepare a senha:

```bash
mkdir -p "$HOME/.local/state/vnc"
tigervncpasswd "$HOME/.local/state/vnc/passwd"
chmod 600 "$HOME/.local/state/vnc/passwd"
```

Digite uma senha própria na pergunta `Password`, sem esperar asteriscos, pressione Enter e repita em `Verify`. Para este teste de uso normal, responda `n` se perguntar por senha somente de visualização. Essa senha **VNC** é diferente da conta Ubuntu e do PIN Android. O método VNCAuth clássico considera apenas os primeiros oito caracteres e exige pelo menos seis; o arquivo é uma representação reversível que precisa das permissões restritas. Por isso mantemos escuta local e túnel para acesso do notebook.

Na **mesma shell Ubuntu**, inicie:

```bash
Xtigervnc :2 -geometry 1280x720 -depth 24 -rfbport 5902 -localhost -SecurityTypes VncAuth -PasswordFile "$HOME/.local/state/vnc/passwd" &
vnc_pid=$!
DISPLAY=:2 dbus-run-session -- xfce4-session
```

`Xtigervnc` publica somente no loopback por `-localhost`; `:2` é a tela virtual, e escolhemos explicitamente a porta 5902. O desktop permanece em primeiro plano e o cursor não volta enquanto ele está ativo. Não feche a sessão PRoot que o mantém. A senha não é transmitida digitando-a num comando que ficará no histórico.

### Ver a tela no próprio Android: AVNC

1. No cliente F-Droid do telefone, busque **AVNC**, do projeto de Gaurav Ujjwal, ou abra sua [página no catálogo](https://f-droid.org/en/packages/com.gaurav.avnc/). Instale pelo cliente; para APK direto, use o fluxo de Downloads e autorização explicado no tutorial Termux.
2. Abra AVNC e toque em **+** para adicionar um servidor. Os campos do projeto incluem **Name/Nome**, **Host**, **Port/Porta** e **Password/Senha**.
3. Em Nome, use `Ubuntu local`; em Host, **`127.0.0.1`**; em Porta, **`5902`**; em Senha, a senha criada pelo `tigervncpasswd`. Salve em **Save/Salvar**.
4. Toque no perfil salvo para conectar. O resultado esperado é o desktop XFCE em 1280×720, apresentado pelo viewer. Se preferir não salvar a senha, forneça-a no pedido da conexão.

Esse Host representa o próprio telefone, não o notebook. Não digite `:2` no campo Porta e não use 5900 só porque um aplicativo oferece esse valor padrão. Uma falha `Connection refused` exige conferir que a sessão anterior permanece ativa e a porta é 5902; `Authentication failed` exige conferir a senha VNC, não redefinir a senha do Android.

### Ver no notebook: viewer e túnel SSH

Prepare primeiro [SSH no Termux e o alias de cliente `mini-pc`](../projetos/ssh-remoto.md), com conta, IP, porta e chave confirmados. Em um terminal **do notebook**, confirme `ssh mini-pc`; depois saia com `exit`. Abra o túnel:

```bash
ssh -N -L 5902:127.0.0.1:5902 mini-pc
```

Esse terminal pode ficar sem texto depois de autenticar: `-N` mantém somente o túnel. Não o feche durante o uso. `Address already in use` significa que 5902 no notebook já está ocupada; identifique a conexão anterior em vez de iniciar túneis duplicados.

Use [TigerVNC Viewer do projeto](https://tigervnc.org/) seguindo a seção de downloads e os [releases publicados](https://github.com/TigerVNC/tigervnc/releases). Escolha um **viewer** para o sistema/arquitetura do notebook, não um servidor Windows nem Source code. No Debian/Ubuntu do notebook, `sudo apt install tigervnc-viewer` instala o cliente pelo repositório da distribuição; em Windows, baixe a distribuição Windows indicada pelo projeto, abra o instalador ou viewer conforme o asset e inicie **TigerVNC Viewer**.

Na janela que pede o servidor VNC, digite **`127.0.0.1::5902`**. Os **dois pontos duplos** no TigerVNC indicam porta explícita; `127.0.0.1:2` indicaria número de display. Quando pedir senha, use a senha VNC. Espere uma janela com o desktop virtual. Nesse caso `127.0.0.1` representa o notebook e o túnel encaminha até o loopback do telefone.

VNCAuth não substitui criptografia: o túnel SSH protege o tráfego entre dispositivos. Não exponha VNC na internet nem use `SecurityTypes None`. Esta página não depende de port-forward no roteador.

### Encerrar a sessão VNC

Fechar o viewer normalmente deixa os aplicativos do desktop virtual executando. Para encerrar o trabalho, faça **logout do XFCE**, não apenas feche o viewer. Quando a linha de `dbus-run-session` terminar, **na mesma shell Ubuntu que criou o servidor**:

```bash
kill "$vnc_pid"
exit
```

`kill` usa o PID registrado nessa shell. Não reutilize esse bloco num terminal em que a variável esteja vazia ou pertença a outra sessão. No notebook, Ctrl+C no terminal do túnel encerra o encaminhamento. O arquivo de senha permanece para uma próxima sessão, protegido em seu home.

## Desempenho, erros e alternativas

Comece em 1280×720, com poucas aplicações e sem composições pesadas. Compare uso de CPU com o desktop fechado e aberto. Termux:X11 e PRoot não garantem aceleração Adreno/Mali; a aparência de uma janela não comprova um renderer de hardware. VNC acrescenta captura, compressão e transmissão e não é uma boa medida de latência do monitor físico.

Para aplicativos que exigem uma sessão logind/Wayland completa, um XFCE simples pode ser mais viável sobre Android. GNOME dentro de uma janela continua sendo uma sessão secundária. Se o requisito é controlar o boot e a GPU diretamente, investigue Linux nativo para o modelo.

| Sintoma | Primeiro diagnóstico | Correção correspondente |
| --- | --- | --- |
| Termux:X11 abre vazio | APK instalado, mas servidor/desktop não iniciado | Executar o caminho A ou B no terminal correto |
| `termux-x11: command not found` | Pacote auxiliar ausente ou comando digitado dentro da distro | Instalar o pacote no Termux; iniciar o servidor fora de PRoot |
| Desktop Ubuntu não encontra `DISPLAY` | `--shared-tmp`, socket e servidor de `:1` | Reabrir a sessão com os parâmetros documentados, sem `xhost +` |
| VNC conecta mas só mostra fundo | Servidor virtual ativo, XFCE/D-Bus falhou | Ler saída da shell que iniciou `dbus-run-session`; não criar outro servidor |
| Teclado físico não digita no viewer | Foco da janela e modo somente visualização | Clicar num editor do desktop, desabilitar view-only quando adequado e testar letras/Shift |
| Sessão some com tela apagada | Hora, bateria e processo Android encerrado | Guia Termux sobre políticas de energia; reduzir carga e processos |

## Backup, rollback e teste final

Faça backup das configurações pessoais antes de substituí-las. O caminho A pode ser desfeito removendo seus pacotes gráficos após revisar a transação; B e C permanecem contidos no ambiente da distribuição. Não desinstale o Termux para corrigir um desktop sem antes exportar projetos.

Valide abrir e fechar duas sessões em momentos diferentes, persistência de um arquivo, entrada física e virtual, retorno após apagar a tela e consumo térmico. Se utiliza monitor, teste a reconexão separadamente: seu resultado depende do hardware Android, não apenas do servidor X.

## Fontes e estado

Revisão documental: **11/10/2026**, sem teste de hardware. Foram consultados [Termux:X11, execução e opções](https://github.com/termux/termux-x11/blob/master/README.md), [APK nightly oficial](https://github.com/termux/termux-x11/releases/tag/nightly), [pacotes X11 do Termux](https://github.com/termux/termux-packages/tree/master/x11-packages), [parâmetros do TigerVNC](https://tigervnc.org/doc/Xvnc.html), [senhas VNC](https://tigervnc.org/doc/vncpasswd.html), [sintaxe do viewer](https://tigervnc.org/doc/vncviewer.html), [releases TigerVNC](https://github.com/TigerVNC/tigervnc/releases), [AVNC do autor](https://github.com/gujjwal00/avnc), [campos da interface AVNC](https://github.com/gujjwal00/avnc/blob/master/app/src/main/res/values/strings.xml), [catálogo AVNC no F-Droid](https://f-droid.org/en/packages/com.gaurav.avnc/) e [SSH/redirecionamentos](https://man.openbsd.org/ssh). Desempenho, teclados, permissões e persistência com tela apagada precisam de testes no aparelho; aparecer um desktop não confirma aceleração GPU nem saída física de vídeo.
