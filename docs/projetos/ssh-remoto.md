---
title: SSH, administração remota e túneis
sidebar_position: 3
description: Configure acesso autenticado ao telefone e separe LAN, internet, shell e compartilhamento de tela.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, materiais e dificuldade

**Dificuldade:** intermediária. **Resultado:** abrir uma shell do telefone no computador com autenticação por chave, transferir arquivos e acessar serviços privados por túnel. SSH fornece controle de terminal; não cria GNOME nem compartilha a tela por si só.

Tenha uma sessão local de recuperação, telefone e computador numa rede confiável, usuário confirmado e um IP alcançável. Em Linux nativo com tela quebrada, valide SSH antes de trocar configurações gráficas. Em Android, [Termux](../android/termux.md) precisa estar operacional e pode sofrer restrições de bateria.

Um endereço privado funciona somente numa rede com rota até ele. O telefone em casa e o notebook na faculdade não ficam conectados por conhecer o mesmo IP `192.168.x.x`. Para acesso externo, configure VPN privada com autenticação e documentação própria; não abra SSH/VNC indiscriminadamente no roteador.

## 1. Preparar o servidor no ambiente correto

**Termux:**

```bash
pkg install openssh
whoami
ssh-keygen -A
passwd
sshd -D -e -p 8022
```

`whoami` informa o nome de conta do aplicativo. `ssh-keygen -A` cria host keys ausentes; não substitui as existentes. `passwd` configura uma senha temporária para preparar a chave. `-D -e` mantém o servidor em primeiro plano com logs visíveis; a porta 8022 é não privilegiada. Este teste pode escutar nas interfaces de rede: execute apenas em LAN controlada, sem redirecionamento do roteador, e encerre com Ctrl+C depois do preparo.

**Debian/Ubuntu nativo:** instale `openssh-server` por `sudo apt install openssh-server`. Com systemd e serviço `ssh` confirmado, `sudo systemctl enable --now ssh` inicia e habilita o daemon. **Alpine/postmarketOS com OpenRC:** `sudo apk add openssh`, `sudo rc-service sshd start` e `sudo rc-update add sshd default`. Não execute comandos de dois sistemas init nem use `systemctl` em PRoot esperando controlar o Android.

A porta nativa costuma ser 22, mas confira configuração e escuta. Não suponha um usuário ou senha padrão para todos os ports.

## 2. Identificar endereço e verificar a identidade

No Linux nativo, `ip -br address` mostra interfaces e endereços. No Android, consulte os detalhes do Wi-Fi nas configurações; comandos netlink podem estar limitados ao aplicativo. Não publique endereço MAC, IP público e dados pessoais nos registros comunitários.

No telefone, calcule a fingerprint pública da host key. No Termux:

```bash
ssh-keygen -lf "$PREFIX/etc/ssh/ssh_host_ed25519_key.pub"
```

No Linux nativo, o caminho padrão correspondente é `/etc/ssh/ssh_host_ed25519_key.pub`; se indisponível, confira os `HostKey` configurados. A chave **pública** pode ser inspecionada; nunca compartilhe os arquivos privados sem `.pub`.

No computador, substitua `USUARIO` e `IP_DO_TELEFONE` pelos valores confirmados:

```bash
ssh -p 8022 USUARIO@IP_DO_TELEFONE
```

Use a porta real, 22 quando aplicável. Compare a fingerprint apresentada antes de aceitar. Uma mudança inesperada pede investigação; não use `StrictHostKeyChecking=no` como reparo. Pode ser reinstalação legítima, outro aparelho no mesmo IP ou ataque.

## 3. Criar e instalar uma chave de cliente

No computador:

```bash
ssh-keygen -t ed25519 -f "$HOME/.ssh/smartphone-linux"
ssh-copy-id -i "$HOME/.ssh/smartphone-linux.pub" -p 8022 USUARIO@IP_DO_TELEFONE
ssh -i "$HOME/.ssh/smartphone-linux" -p 8022 -o IdentitiesOnly=yes -o PreferredAuthentications=publickey USUARIO@IP_DO_TELEFONE
```

Antes do primeiro comando, confira que `~/.ssh/smartphone-linux` e sua chave pública correspondente não existem. Se existirem, preserve-as e escolha outro nome em **todas** as linhas; não aceite sobrescrita. Proteja a chave privada com passphrase e use o agente da sessão quando apropriado. `ssh-copy-id -i` copia a chave pública indicada à conta remota. O último comando valida essa chave, sem escolher uma identidade antiga por acaso. Se `ssh-copy-id` não estiver instalado, use o procedimento manual do OpenSSH para `authorized_keys`, com diretório 700 e arquivo 600; não coloque a chave privada no telefone.

**Mantenha uma sessão funcional aberta** enquanto testa alterações, além da recuperação local. Depois de validar a chave, pare o daemon de teste Termux com Ctrl+C e inicie:

```bash
sshd -D -e -p 8022 -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no -o PermitRootLogin=no
```

Confirme em nova conexão que a chave entra e a senha não. Para persistência, salve essas políticas na configuração do daemon após fazer backup e validar com `sshd -t`. OpenSSH usa, em geral, o primeiro valor obtido de uma opção: apenas anexar outra linha no fim pode não sobrescrever a antiga. Revise também `Include` e blocos `Match`.

## 4. Configurar um alias no cliente sem substituir seu arquivo

Para os exemplos seguintes, configure o alias `mini-pc` no **computador cliente**. Preserve `~/.ssh/config` se já existir: abra-o no editor, faça uma cópia antes de modificar e acrescente somente um bloco para um nome ainda não utilizado. Não substitua os hosts existentes. Se há um bloco `Host *`, coloque a configuração específica antes dele para evitar valores globais obtidos primeiro.

```sshconfig
Host mini-pc
    HostName IP_DO_TELEFONE
    User USUARIO_CONFIRMADO
    Port 8022
    IdentityFile ~/.ssh/smartphone-linux
    IdentitiesOnly yes
```

Substitua IP e usuário pelos valores reais. Utilize a porta observada, normalmente 8022 no Termux ou 22 no Linux nativo. O arquivo `IdentityFile` deve ser a chave **privada local** criada na etapa anterior, sem enviá-la ao telefone. Se utilizou outra chave, ajuste esse caminho. Não adicione `StrictHostKeyChecking no`.

Confira `ssh -G mini-pc` e depois `ssh mini-pc`; compare endereço, usuário, porta e caminho da chave antes de confiar no alias. O alias passa a funcionar também em SFTP, rsync e encaminhamentos, sem depender de uma chave de nome padrão. Mantenha o arquivo de configuração e chaves com permissões que não permitam escrita por outros usuários.

## 5. Túneis e compartilhamento de tela

Para acessar um servidor web do telefone que escuta em `127.0.0.1:8080`, no computador:

```bash
ssh -N -L 8080:127.0.0.1:8080 mini-pc
```

Abra `http://127.0.0.1:8080` **no computador**. O encaminhamento liga seu loopback ao loopback remoto, protegido pelo SSH. Mude a porta local se já estiver ocupada. Ctrl+C encerra o túnel, não o servidor remoto.

Para VNC, use a porta confirmada no [guia de desktop Android](../android/desktop.md). Em Linux nativo, descubra se o servidor compartilha a sessão física existente ou cria outra. RDP e VNC não equivalem a GNOME nativo, e uma sessão secundária pode receber teclado/mouse de outro seat. Não instale todos os servidores de tela ao mesmo tempo para tentar resolver entrada.

## Persistência, erros e recuperação

No Termux, `termux-services` oferece supervisão compatível com o aplicativo; consulte os nomes de serviços instalados e use `sv-enable sshd` apenas quando o serviço correspondente existir e o teste manual tiver sido encerrado. Termux:Boot é opcional, precisa de origem/assinatura compatível e um script revisado. Isso não impede encerramentos pelo Android.

No Linux real, valide serviço, política de firewall e rota após boot. Ative a regra LAN apropriada pela ferramenta existente; não substitua o firewall inteiro. `Connection refused` costuma indicar ausência de escuta; timeout, rota/firewall/aparelho dormindo; `Permission denied`, conta/chave; `Host key changed`, identidade diferente. Inspecione logs antes de apagar configurações.

Para rollback, restaure a cópia do arquivo, valide sintaxe e recarregue pelo mecanismo do seu sistema. Não encerre a única sessão antes de confirmar a recuperação. Antes de compartilhar logs, remova credenciais e endereços pessoais.

## Testes finais e próximos passos

Valide uma conexão por chave, transferência de um arquivo, túnel web, retorno após suspender a tela e após reiniciar. Registre separadamente o que funciona por USB, LAN e VPN. Use [servidor web](./servidor-web.md) e [arquivos](./arquivos-nas.md) sem exposição pública desnecessária.

## Fontes e verificação

Revisão documental: **10/10/2026**. [ssh](https://man.openbsd.org/ssh), [sshd_config](https://man.openbsd.org/sshd_config), [ssh-keygen](https://man.openbsd.org/ssh-keygen), [pacote OpenSSH do Termux](https://github.com/termux/termux-packages/tree/master/packages/openssh), [Termux Services](https://github.com/termux/termux-services), [Termux Boot](https://github.com/termux/termux-boot). A wiki Termux apresentou bloqueio anti-automação nesta revisão; não foi utilizada como evidência de procedimentos não lidos.
