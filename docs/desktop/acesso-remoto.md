---
title: SSH, VNC e RDP sem dependência obrigatória do notebook
description: Configure manutenção protegida e diferencie compartilhar a sessão de criar outro desktop.
sidebar_position: 3
last_verified: '2026-10-10'
---

O notebook pode ajudar a instalar e manter o sistema, mas o mini-PC deve executar aplicações no próprio telefone. SSH/VNC/RDP são ferramentas de acesso; não determinam onde o sistema está instalado. É possível ter Linux nativo com tela remota, assim como Linux sobre Android com monitor local.

**Dificuldade:** básica a intermediária. **Resultado:** acesso de manutenção e, quando suportado, desktop remoto protegido. **Pré-requisitos:** rede autorizada ou USB networking funcional, usuário comum com senha/chave e capacidade de confirmar a identidade do servidor. Evite depender exclusivamente da interface que será alterada no teste.

## SSH: preparar o servidor

Identifique distribuição e init:

```sh
cat /etc/os-release
ps -p 1 -o comm,args
command -v sshd
```

No Alpine/postmarketOS com APK, consulte `apk search -x openssh` e instale `sudo apk add openssh` se o pacote for apropriado para o branch. No Debian/Ubuntu, o servidor normalmente é `openssh-server`. No Termux, servidor e porta são próprios desse ambiente: use o tutorial de Linux sobre Android, sem aplicar os serviços Linux nativos abaixo.

| Sistema já identificado | Consultar serviço | Habilitação, após revisar configuração |
|---|---|---|
| OpenRC com serviço sshd fornecido | `rc-service sshd status` | `sudo rc-update add sshd default` e `sudo rc-service sshd start` |
| systemd com unidade sshd | `systemctl status sshd` | `sudo systemctl enable --now sshd` |
| systemd com unidade ssh | `systemctl status ssh` | `sudo systemctl enable --now ssh` |
| init próprio do port | Ler supervisor/launcher | Usar integração específica documentada |

Escolha **uma linha realmente aplicável**, não tente todas. Confira configuração com `sudo sshd -t` antes de reiniciar. Instalações oficiais podem já fornecer SSH e USB networking; não duplique o daemon.

## Conectar e confirmar identidade

No telefone, `ip -br address` mostra endereços. No notebook:

```sh
ssh usuario@ENDERECO_DO_TELEFONE
```

Substitua usuário e destino. Na primeira conexão, compare a fingerprint com uma fonte local confiável, por exemplo `ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub` no telefone se essa chave existir. Não desative `StrictHostKeyChecking`. Se a identidade mudou após reinstalação, confirme a razão antes de atualizar known_hosts.

Para chave dedicada no notebook, escolha um nome que ainda não exista:

```sh
ssh-keygen -t ed25519 -f ~/.ssh/smartphone-linux
ssh-copy-id -i ~/.ssh/smartphone-linux.pub usuario@ENDERECO_DO_TELEFONE
ssh -i ~/.ssh/smartphone-linux usuario@ENDERECO_DO_TELEFONE
```

Use passphrase e nunca publique a chave privada. Teste uma segunda conexão antes de restringir autenticação por senha. Alterações no daemon exigem backup e `sshd -t`; mantenha a conexão atual até a nova funcionar. A rede pode bloquear clientes entre si ou mudar IP via DHCP; veja [Wi-Fi](../hardware/wifi.md).

## Desktop remoto: escolha a arquitetura

**Compartilhamento da sessão:** mostra o GNOME que já está rodando no telefone. É adequado para visualizar o desktop local sem trocar o sistema principal. Nas versões com integração disponível, Configurações → Sistema → Área de trabalho remota oferece compartilhamento e controle. Confira credenciais/porta e fingerprint de criptografia no cliente. Consulte a [ajuda GNOME](https://help.gnome.org/gnome-help/sharing-desktop.html).

**Login remoto:** cria/gerencia uma sessão por login. Pode não ser o mesmo desktop do monitor. Exige integração adicional com GDM/systemd e versão do GNOME; ports customizados podem não oferecer essa função.

**VNC virtual:** um servidor como Xvnc pode criar outro display X11. Útil para PRoot/chroot e aparelhos sem saída de vídeo, mas teclado físico do seat local não vai necessariamente controlar esse display. Não descreva isso como GNOME nativo físico.

Antes de instalar um servidor VNC, identifique se ele compartilha display existente ou cria outro. Configure autenticação e escuta em localhost conforme o manual da versão. Se o servidor estiver no telefone em `127.0.0.1:5901`, um túnel no notebook é:

```sh
ssh -N -L 5901:127.0.0.1:5901 usuario@ENDERECO_DO_TELEFONE
```

O cliente VNC conecta a `127.0.0.1:5901` no notebook. A porta local precisa estar livre; ajuste ambos os lados se necessário. Esse túnel não instala/ativa o servidor e não autoriza exposição pública de VNC. Para RDP, prefira a criptografia/autenticação e integração do GNOME documentadas, sem assumir que xrdp compartilha o Wayland físico.

## Segurança e recuperação

Não exponha SSH/VNC/RDP diretamente à internet como primeiro passo. Redes distintas exigem VPN ou caminho protegido administrado, não só conhecer o IP privado. Revogue acesso de terceiros ao terminar, mantenha patches e bloqueie/desative compartilhamento quando não precisar.

Se USB e hub compartilham a única porta, um coletor local temporário permite salvar evidências enquanto o notebook está desconectado. Ele não deve gravar teclas/fotos continuamente. Perder Wi-Fi não comprova crash: confirme boot, USB e registros antes de reiniciar.

## Reversão e testes finais

Desative apenas o serviço de teste, remova uma chave pública autorizada se não for mais usada e restaure configuração salva. Não delete todas as chaves de host. Teste reconexão SSH após boot, autenticação errada, desktop remoto com indicador de compartilhamento, encerramento do cliente e uso do monitor físico independente.

**Fontes e verificação:** **2026-10-10**; [OpenSSH manuais](https://www.openssh.com/manual.html), [sshd_config](https://man.openbsd.org/sshd_config), [GNOME desktop sharing](https://help.gnome.org/gnome-help/sharing-desktop.html), [TigerVNC](https://tigervnc.org/). Disponibilidade das interfaces gráficas depende da integração/versão do dispositivo.
