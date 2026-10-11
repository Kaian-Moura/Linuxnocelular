---
title: GNOME nativo como desktop principal
description: Identifique sessão, compositor, init e display manager antes de migrar ou remover outro desktop.
sidebar_position: 1
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

GNOME nativo é uma sessão local que controla os dispositivos gráficos e de entrada do sistema. GNOME em `--nested`/`--devkit`, dentro de Weston/XFCE ou de uma janela VNC, é outra arquitetura. Ambas podem ser úteis, mas uma sessão aninhada não atende ao requisito de boot direto no GNOME físico.

**Dificuldade:** intermediária em port mantido; avançada em kernel downstream personalizado. **Resultado:** uma única sessão principal GNOME, com inicialização e recuperação conhecidas. **Pré-requisitos:** suporte gráfico/input suficiente, repositórios da distribuição coerentes, acesso de manutenção e plano de rollback. Não é necessário instalar Fedora para usar GNOME; Fedora inclui uma integração que não é automaticamente transferida ao telefone.

## 0. Antes de instalar: o que você precisa ter pronto

Este guia começa **depois** que um Linux compatível já inicia no telefone. Para instalar o sistema operacional, use [o caminho nativo](../nativo/visao-geral.md). Se você está num aplicativo Termux/PRoot, vá ao [desktop sobre Android](../android/desktop.md): instalar o pacote GNOME ali não transforma o aplicativo em sistema principal.

Separe o telefone, um monitor/periféricos já validados se a tela local não funciona, rede, espaço para pacotes e uma conta comum. Prepare [SSH desde zero](../projetos/ssh-remoto.md) e confirme uma conexão pelo notebook antes de alterar o display manager. A conexão por Wi-Fi deve continuar quando o hub ocupar a porta USB. Salve todos os documentos; mudar o gerenciador de login pode encerrar a sessão gráfica atual.

Abra o terminal **no telefone**: procure Terminal/Console pelo menu do desktop existente, use um console documentado pelo port ou conecte pelo SSH. No Windows/macOS/Linux do notebook, apenas o cliente SSH é necessário; os comandos APT/APK seguintes serão executados na shell remota do telefone. Uma instalação GNOME no notebook não modifica o celular.

**Critério para prosseguir:** você consegue identificar distribuição/init, localizar os pacotes no branch correto e explicar como voltará à sessão anterior por SSH ou console. Sem vídeo/input suportados, GNOME não fornece os drivers que faltam. Kernel downstream com boot customizado requer a receita específica do port; a migração genérica abaixo não substitui esse trabalho.

## Descubra o estado real

```sh
cat /etc/os-release
cat /proc/1/comm
```

O segundo comando identifica o nome do processo PID 1 sem exigir opções adicionais do `ps` BusyBox. Para a listagem detalhada seguinte, prepare **procps e ripgrep** da distribuição antes de utilizá-la, se ainda não estão instalados:

```sh
# Debian/Ubuntu
sudo apt update
sudo apt install procps ripgrep
```

```sh
# Alpine/postmarketOS, somente pacotes da própria release
sudo apk add procps-ng ripgrep
```

Os nomes foram conferidos no [catálogo Debian](https://packages.debian.org/trixie/procps) e no [catálogo Alpine](https://pkgs.alpinelinux.org/package/edge/main/aarch64/procps-ng); a referência `edge` demonstra o nome do pacote, **não recomenda adicionar edge** a outra release. Escolha somente o bloco do seu ambiente. Como alternativa sem instalar essas ferramentas, leia a saída simples de `ps`, reconhecendo que a implementação mínima pode truncar argumentos e não fornecer a árvore detalhada. Erro de opção não indica ausência dos processos.

Com procps/ripgrep disponíveis:

```sh
ps -eo pid,ppid,user,args | rg 'gnome-session|gnome-shell|xfce4-session|weston|Xorg|Xwayland|gdm|lightdm|vnc|rdp'
ls /usr/share/wayland-sessions /usr/share/xsessions 2>/dev/null
```

Verifique a árvore de processos, não só o desktop visível. `Xwayland` iniciado por Mutter fornece compatibilidade com aplicações X11; **não é outro desktop**. Um processo `gnome-shell --nested` indica composição dentro de outro display. Um display manager instalado mas inativo não explica quem inicia a sessão.

Se preferir inspecionar a lista inteira depois de preparar procps, execute `ps -eo pid,ppid,user,args`, sem o filtro ripgrep. Anote, por exemplo, **Debian 13 + systemd + LightDM** ou **postmarketOS de determinado branch + OpenRC + GDM**; não copie esses valores se o aparelho mostra outros. `gnome-shell --version` informa uma versão instalada quando o executável existe, sem confirmar que ele controla a tela.

Dentro do terminal do desktop:

```sh
printf 'desktop=%s type=%s session=%s\n' "$XDG_CURRENT_DESKTOP" "$XDG_SESSION_TYPE" "$XDG_SESSION_ID"
loginctl list-sessions
```

`loginctl` pode vir de systemd-logind ou elogind; se ausente, consulte a integração do port. Não exporte variáveis falsas para “transformar” uma sessão em GNOME: elas descrevem/selecionam comportamento, não criam controle físico.

## Init, display manager e sessão

| Componente | Papel |
|---|---|
| PID 1 / init | Inicia e supervisiona o sistema |
| logind/elogind ou integração de seat | Administra sessões e acesso a DRM/input |
| GDM/LightDM/outro display manager | Login e seleção de sessão, quando usado |
| gnome-session | Coordena componentes da sessão |
| GNOME Shell/Mutter | Interface, compositor Wayland e display físico |

postmarketOS pode usar diferentes integrações conforme imagem/versão. Não execute `systemctl` só porque ele está instalado: confira PID 1. Em OpenRC, examine `rc-status -a` e `rc-update show`; em systemd, `systemctl status display-manager` e `systemctl cat display-manager`. Em init próprio, leia o script de PID 1 e o supervisor antes de substituir qualquer serviço.

## Caminho preferencial: integração fornecida pelo port

Na preparação da imagem nativa, escolha a interface GNOME oferecida pelo instalador/pmbootstrap para **o aparelho suportado**, seguindo [instalação nativa com pmbootstrap](../nativo/postmarketos-pmbootstrap.md). Essa abordagem evita transportar uma configuração XFCE experimental para uma migração improvisada.

Numa instalação Alpine/postmarketOS existente, primeiro consulte:

```sh
apk search -x postmarketos-ui-gnome
apk info -e postmarketos-ui-gnome
sudo apk add --simulate postmarketos-ui-gnome
```

Esses comandos só se aplicam se você usa APK e um branch que realmente fornece esse metapacote. A simulação mostra o plano de pacotes; não estabelece compatibilidade do hardware ou autoriza remover o init. Se o pacote não estiver disponível, confira a documentação/repositório do branch: não acrescente repositórios de outra versão para obtê-lo.

Antes de executar a instalação real, copie `/etc/apk/world`, configurações do display manager e listas de serviços para backup privado. Revise conflitos de init, elogind/systemd, udev e servidor de áudio. Se a integração oficial do branch e modelo é aplicável e a simulação não apresenta substituição inesperada, `sudo apk add postmarketos-ui-gnome` instala o pacote. A seleção/inicialização da sessão deve seguir o serviço que esse pacote e a imagem documentam; não existe um nome de serviço universal para todo port.

:::caution A instalação pode modificar o próximo boot
Na integração OpenRC conferida do metapacote, o post-install acrescenta **GDM ao runlevel default**. Não reinicie entre instalar esse pacote e concluir a transição documentada abaixo: confira `rc-update show` e retire do runlevel o display manager anterior confirmado antes do próximo boot. Caso contrário, dois gerenciadores podem ser iniciados pelo sistema. Preserve o desktop anterior e sua recuperação até validar GNOME; remover pacotes XFCE ainda não é essa etapa.
:::

### Alpine/postmarketOS: preparar backup e seguir a integração disponível

No telefone com APK, crie uma pasta de backup **nova**, por exemplo `mkdir "$HOME/backup-desktop-antes-gnome"`. Se já existir, escolha outro nome para preservar o histórico. Copie a lista de pacotes desejados por `cp /etc/apk/world "$HOME/backup-desktop-antes-gnome/world"` e grave `apk info -vv > "$HOME/backup-desktop-antes-gnome/pacotes.txt"`. Em OpenRC, `rc-update show > "$HOME/backup-desktop-antes-gnome/servicos.txt"` registra o estado; copie também os arquivos do gerenciador de login que encontrou, usando privilégios quando necessário. Essas cópias não são backup dos documentos pessoais, que continuam precisando de outro dispositivo.

Os comandos de busca/simulação acima devem mostrar um pacote do **branch já utilizado** e uma instalação coerente. Não existe um arquivo `.exe` GNOME para baixar e executar no celular. O gerenciador de pacotes obtém o metapacote e suas dependências assinadas. Se a documentação do modelo e branch recomenda esse metapacote, instale por `sudo apk add postmarketos-ui-gnome` e espere a transação terminar sem erro.

Para **OpenRC**, somente se os pacotes instalados fornecerem o serviço GDM, confirme:

```sh
apk info -e postmarketos-ui-gnome-openrc
apk info -e gdm-openrc
ls -l /etc/init.d/gdm
rc-update show
rc-service dbus status
rc-service elogind status
```

Uma resposta negativa de `apk info -e` indica pacote ausente, não sucesso. D-Bus e a gestão de seat precisam estar integrados pelo pacote/port; elogind não deve ser instalado por cima de systemd-logind. Se a receita do branch escolhe outro mecanismo, siga-a. Não ative GDM até resolver as dependências e preservar a forma de recuperação.

Com **GDM OpenRC confirmado**, faça a transição somente depois de salvar trabalhos: retire do runlevel o display manager antigo realmente observado e pare seu serviço. Por exemplo, **apenas se LightDM era o anterior**, `sudo rc-update del lightdm default` e `sudo rc-service lightdm stop`. Em seguida:

```sh
sudo rc-update add gdm default
sudo rc-service gdm start
sudo rc-service gdm status
```

Essas linhas são específicas do serviço `gdm` verificado; não servem para um launcher customizado de PID 1. A tela de login deve aparecer. Se GDM falhar, preserve logs e restaure o gerenciador anterior por SSH, em vez de remover XFCE. Em postmarketOS com **systemd**, examine `systemctl cat display-manager` e o serviço `gdm` fornecido; use a integração systemd do branch, sem executar a receita OpenRC. O metapacote de UI não garante que um kernel vendor personalizado tenha o DRM necessário.

### Debian nativo: exemplo completo com pacotes da própria release

Este caminho é para um telefone que já executa **Debian nativo com systemd**, GPU/DRM/input utilizáveis e receita do port compatível com GDM. O catálogo Debian 13 consultado fornece `gnome-core` para ARM64 e depende de GDM. Não aplique este bloco a Debian dentro de PRoot/chroot.

No telefone, faça backup do estado, salve os trabalhos e consulte:

```sh
cat /etc/os-release
dpkg --print-architecture
apt-cache policy gnome-core gdm3
systemctl status display-manager --no-pager
```

`arm64` identifica a arquitetura de pacotes do telefone. Deve haver candidatos dos repositórios da sua release. Crie uma pasta **nova** de backup:

```sh
mkdir "$HOME/backup-desktop-antes-gnome"
dpkg-query -W > "$HOME/backup-desktop-antes-gnome/pacotes.txt"
systemctl get-default > "$HOME/backup-desktop-antes-gnome/alvo.txt"
systemctl cat display-manager > "$HOME/backup-desktop-antes-gnome/display-manager.txt"
```

Se a pasta já existir, escolha outro nome em todas as linhas. Preserve também o arquivo/diretório de configuração **real do display manager observado**; por exemplo, somente se LightDM for o atual e `/etc/lightdm` existir, `sudo cp -a /etc/lightdm "$HOME/backup-desktop-antes-gnome/lightdm"` cria sua cópia administrativa. O inventário não substitui backup dos documentos. Então:

```sh
sudo apt update
sudo apt install --simulate gnome-core gdm3
```

Leia o plano, espaço e remoções. Se não houver conflito inesperado e a integração do port admitir GDM:

```sh
sudo apt install gnome-core gdm3
```

Se aparecer um diálogo de escolha de display manager, selecione **gdm3**, use Tab para **OK** e Enter. Quando a escolha não tiver sido oferecida e houver mais de um display manager instalado, `sudo dpkg-reconfigure gdm3` permite selecionar o padrão Debian. Isso não adapta drivers nem autoriza trocar o init.

Depois confirme `systemctl cat display-manager` e `systemctl get-default`. Se o alvo padrão era deliberadamente textual e você quer boot gráfico, com recuperação pronta, `sudo systemctl set-default graphical.target` muda esse padrão. Reinicie apenas após salvar tudo e conferir SSH persistente, com `sudo reboot`. O teste esperado é a tela **GDM → sua conta → GNOME**, sem notebook iniciando o desktop.

Ubuntu nativo e outras distribuições podem fornecer `gnome-session`, `gdm3` e metapacotes diferentes, incluindo sessões customizadas. Consulte `apt-cache policy` e a documentação da release em vez de copiar `gnome-core` como se fosse obrigatório em todos os sistemas. No Fedora, o GNOME costuma ser integrado pela edição Workstation; não é necessário converter a distribuição do telefone para obter esse visual.

Em sistema com GDM já integrado, a tela de login pode oferecer GNOME na lista de sessões. Teste a sessão manualmente antes de configurar autologin. Autologin facilita um aparelho com tela quebrada, mas dá acesso local à conta sem senha; não equivale a bloquear ou criptografar dados.

## Entrar na sessão e reconhecer sucesso

Na tela GDM, selecione sua conta. Quando houver seletor de sessão/ícone de engrenagem, escolha **GNOME** entre as sessões realmente disponíveis; ele costuma aparecer depois de selecionar o usuário e antes da senha. Não escolha GNOME Classic ou uma sessão Xorg sem entender o objetivo. A disponibilidade Wayland depende da versão do GNOME, driver e políticas do GDM; não force `WaylandEnable` por tentativa.

Digite a senha da conta criada na instalação. Dentro do desktop, pressione Super/Windows: deve abrir Atividades. Procure **Configurações** e **Arquivos**, abra um terminal e repita os checks `XDG_CURRENT_DESKTOP`, `XDG_SESSION_TYPE` e `loginctl`. Um terminal informa Wayland quando essa for a sessão. Abrir um aplicativo X11 via Xwayland continua compatível com uma sessão GNOME Wayland nativa.

Se o login retorna imediatamente para GDM, recolha o log da sessão: em systemd, identifique a unidade por `systemctl status display-manager --no-pager`. No Debian com unidade `gdm3` confirmada, use `sudo journalctl -b -u gdm3 --no-pager -n 100`; para uma unidade `gdm`, troque somente esse nome. `journalctl --user -b` consulta o gerenciador do usuário quando ele existe. Em OpenRC, consulte o arquivo/log do serviço e o daemon de syslog da imagem. `journalctl` não é universal no OpenRC. Tela preta com SSH ativo pede investigar [GPU](../hardware/gpu.md), [DRM/vídeo](../hardware/video-hotplug.md), permissões e compositor antes de reinstalar.

### Login automático opcional, somente após o teste manual

No GNOME, **Configurações → Sistema → Usuários**, ou o painel Usuários da sua versão, pode oferecer **Login automático** depois de desbloquear a administração. Habilite-o apenas para a conta comum escolhida. Isso não remove a senha sudo nem desbloqueia necessariamente o chaveiro.

Quando a integração usa GDM mas o painel não oferece a opção, [o manual GNOME](https://help.gnome.org/system-admin-guide/login-automatic.html) documenta `AutomaticLoginEnable=True` e `AutomaticLogin=CONTA_REAL` na seção `[daemon]`. Confirme o arquivo da distribuição: Debian costuma fornecer `/etc/gdm3/daemon.conf`, enquanto outras usam `/etc/gdm/custom.conf`. Abra o arquivo existente, faça backup e edite **a seção existente**, sem duplicá-la. Não copie um nome de conta de exemplo, nem configure root. O autologin será testado no próximo boot; reiniciar GDM encerra os aplicativos da sessão atual.

## Migração controlada e remoção do XFCE

1. Salve documentos e mantenha SSH funcional.
2. Instale/teste GNOME com outro desktop ainda instalado, mas **sem executá-los simultaneamente como desktops principais**.
3. Configure a sessão padrão pelo display manager real e teste um boot completo.
4. Confirme mouse, teclado, áudio, rede, permissões Polkit e monitor externo.
5. Identifique quais pacotes XFCE estão instalados e quais dependências a remoção levaria.

No APK:

```sh
apk info | rg '^(xfce|thunar|lightdm)'
sudo apk del --simulate xfce4 xfce4-session lightdm
```

A segunda linha é uma **simulação de exemplo**, válida apenas se esses pacotes estão instalados e LightDM realmente será substituído. Não execute a remoção real se ela retirar ALSA, libinput, Xwayland, fontes, ferramentas de acessibilidade ou componentes do port necessários. Pacotes mantidos apenas como dependências do desktop antigo precisam ser registrados explicitamente como desejados antes da remoção, usando os nomes e versões do sistema.

Arquive autostarts que iniciam XFCE/Weston/nested GNOME e confira o launcher do boot. Preserve configurações pessoais em backup. Remover pacotes sem retirar um supervisor antigo pode deixá-lo reiniciando processos inexistentes. Confirme uma única sessão gráfica principal após a limpeza; sessões SSH adicionais são normais.

No Debian, liste os pacotes com `dpkg-query -W 'xfce4*' 'thunar*' 'lightdm*'` e simule apenas os nomes instalados por `sudo apt remove --simulate NOMES_CONFIRMADOS`. `NOMES_CONFIRMADOS` é marcador, não comando pronto. Não execute `autoremove` sem revisar dependências. No APK, a lista `world` preservada explica quais pacotes eram desejados; se o kernel, pacote do dispositivo ou daemon de hardware sair no plano, interrompa. A remoção só vem depois de **login, reinício e recuperação** já funcionarem no GNOME.

## Layout, acessibilidade e limites

Comece com o GNOME padrão: barra superior, Atividades, workspaces e dash. Use Configurações para escala, disposição de monitores, tema claro/escuro e teclado. `gnome-extensions list` ajuda a identificar extensões instaladas. Habilite poucas extensões compatíveis com a versão exata do Shell e teste cada uma; extensões não são requisito para tornar GNOME nativo.

Teclado na tela, bloqueio, energia e remote desktop podem depender da integração de sessão. Ausência de systemd/GDM num port customizado pode exigir trabalho específico, sem garantia de todas as APIs GNOME. O [OnePlus deste projeto](../dispositivos/oneplus-9-pro.md) exigiu adaptações de DRM e sessão; elas não substituem uma receita genérica.

## Reversão e teste final

Se GNOME falhar, selecione a sessão anterior pelo display manager ou restaure sua configuração de boot via SSH. Reinstalar pacotes removidos exige repositório/versões disponíveis; preserve a lista e cache conforme a política da distribuição. Não remover XFCE antes de comprovar esse caminho.

Valide boot direto, sessão local, aplicações com foco, [GPU](../hardware/gpu.md), [hotplug](../hardware/video-hotplug.md) e [sessão sem monitor](sessao-portatil.md). Nenhum botão Stop de uma janela de teste deve encerrar o desktop principal.

**Fontes e verificação:** **2026-10-11**, documental, sem instalar/migrar o desktop do telefone. [Debian 13: gnome-core ARM64 e dependências](https://packages.debian.org/trixie/gnome-core), [GDM Debian](https://packages.debian.org/trixie/gdm3), [GNOME: login automático](https://help.gnome.org/system-admin-guide/login-automatic.html), [GNOME session](https://gitlab.gnome.org/GNOME/gnome-session), [Mutter](https://gitlab.gnome.org/GNOME/mutter), [elogind](https://github.com/elogind/elogind), [GNOME no Alpine](https://wiki.alpinelinux.org/wiki/Gnome), [GNOME no postmarketOS/Nura](https://wiki.postmarketos.org/wiki/GNOME), [metapacote de UI, branch main](https://gitlab.postmarketos.org/postmarketOS/pmaports/-/tree/main/main/postmarketos-ui-gnome), [APKBUILD conferido](https://gitlab.postmarketos.org/postmarketOS/pmaports/-/raw/main/main/postmarketos-ui-gnome/APKBUILD), [post-install OpenRC conferido](https://gitlab.postmarketos.org/postmarketOS/pmaports/-/raw/main/main/postmarketos-ui-gnome/postmarketos-ui-gnome-openrc.post-install). As duas wikis bloquearam a consulta automatizada. Os dois arquivos raw do branch main foram lidos como texto por HTTPS nesta revisão e confirmam dependência de `gdm-openrc` e habilitação de GDM no runlevel default. Esse branch não certifica outra release nem o hardware de cada leitor: confirme pacote, script e documentação efetivamente instalados antes de migrar. O guia não garante GNOME atual sobre um kernel vendor sem adaptações.
