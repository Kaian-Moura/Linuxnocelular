---
title: GNOME nativo como desktop principal
description: Identifique sessão, compositor, init e display manager antes de migrar ou remover outro desktop.
sidebar_position: 1
last_verified: '2026-10-10'
---

GNOME nativo é uma sessão local que controla os dispositivos gráficos e de entrada do sistema. GNOME em `--nested`/`--devkit`, dentro de Weston/XFCE ou de uma janela VNC, é outra arquitetura. Ambas podem ser úteis, mas uma sessão aninhada não atende ao requisito de boot direto no GNOME físico.

**Dificuldade:** intermediária em port mantido; avançada em kernel downstream personalizado. **Resultado:** uma única sessão principal GNOME, com inicialização e recuperação conhecidas. **Pré-requisitos:** suporte gráfico/input suficiente, repositórios da distribuição coerentes, acesso de manutenção e plano de rollback. Não é necessário instalar Fedora para usar GNOME; Fedora inclui uma integração que não é automaticamente transferida ao telefone.

## Descubra o estado real

```sh
cat /etc/os-release
ps -p 1 -o pid,comm,args
ps -eo pid,ppid,user,args | rg 'gnome-session|gnome-shell|xfce4-session|weston|Xorg|Xwayland|gdm|lightdm|vnc|rdp'
ls /usr/share/wayland-sessions /usr/share/xsessions 2>/dev/null
```

Verifique a árvore de processos, não só o desktop visível. `Xwayland` iniciado por Mutter fornece compatibilidade com aplicações X11; **não é outro desktop**. Um processo `gnome-shell --nested` indica composição dentro de outro display. Um display manager instalado mas inativo não explica quem inicia a sessão.

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

Em sistema com GDM já integrado, a tela de login pode oferecer GNOME na lista de sessões. Teste a sessão manualmente antes de configurar autologin. Autologin facilita um aparelho com tela quebrada, mas dá acesso local à conta sem senha; não equivale a bloquear ou criptografar dados.

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

## Layout, acessibilidade e limites

Comece com o GNOME padrão: barra superior, Atividades, workspaces e dash. Use Configurações para escala, disposição de monitores, tema claro/escuro e teclado. `gnome-extensions list` ajuda a identificar extensões instaladas. Habilite poucas extensões compatíveis com a versão exata do Shell e teste cada uma; extensões não são requisito para tornar GNOME nativo.

Teclado na tela, bloqueio, energia e remote desktop podem depender da integração de sessão. Ausência de systemd/GDM num port customizado pode exigir trabalho específico, sem garantia de todas as APIs GNOME. O [OnePlus deste projeto](../dispositivos/oneplus-9-pro.md) exigiu adaptações de DRM e sessão; elas não substituem uma receita genérica.

## Reversão e teste final

Se GNOME falhar, selecione a sessão anterior pelo display manager ou restaure sua configuração de boot via SSH. Reinstalar pacotes removidos exige repositório/versões disponíveis; preserve a lista e cache conforme a política da distribuição. Não remover XFCE antes de comprovar esse caminho.

Valide boot direto, sessão local, aplicações com foco, [GPU](../hardware/gpu.md), [hotplug](../hardware/video-hotplug.md) e [sessão sem monitor](sessao-portatil.md). Nenhum botão Stop de uma janela de teste deve encerrar o desktop principal.

**Fontes e verificação:** **2026-10-10**; [GNOME session](https://gitlab.gnome.org/GNOME/gnome-session), [Mutter](https://gitlab.gnome.org/GNOME/mutter), [elogind](https://github.com/elogind/elogind), [GNOME no Alpine](https://wiki.alpinelinux.org/wiki/Gnome), [GNOME no postmarketOS](https://wiki.postmarketos.org/wiki/GNOME). As duas wikis de integração bloquearam consulta direta automatizada nesta revisão; confirme suas instruções atuais e APKBUILDs do branch antes de migrar. O diagnóstico e a simulação acima não dependem de presumir seu conteúdo.
