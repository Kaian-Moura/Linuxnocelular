---
title: SSH, VNC e RDP sem dependência obrigatória do notebook
description: Configure manutenção protegida e diferencie compartilhar a sessão de criar outro desktop.
sidebar_position: 5
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

O notebook pode ajudar a instalar e manter o sistema, mas o mini-PC deve executar aplicações no próprio telefone. SSH/VNC/RDP são ferramentas de acesso; não determinam onde o sistema está instalado. É possível ter Linux nativo com tela remota, assim como Linux sobre Android com monitor local.

**Dificuldade:** básica a intermediária. **Resultado:** acesso de manutenção e, quando suportado, desktop remoto protegido. **Pré-requisitos:** rede autorizada ou USB networking funcional, usuário comum com senha/chave e capacidade de confirmar a identidade do servidor. Evite depender exclusivamente da interface que será alterada no teste.

## 0. Escolher o que você quer visualizar

| Objetivo | Caminho | Precisa de programa de visualização? |
|---|---|---|
| Administrar pacotes/arquivos pelo terminal | SSH | Cliente OpenSSH, sem desktop remoto |
| Ver o GNOME que está no monitor do telefone | Compartilhamento GNOME/RDP integrado | Cliente RDP no notebook |
| Criar uma tela virtual para PRoot/desktop de laboratório | VNC virtual | Servidor no telefone e viewer no notebook |
| Espelhar o Android original | scrcpy, com requisitos Android | Não é visualização de Linux nativo |

Um **servidor** produz a sessão ou compartilha a tela no telefone; um **viewer/cliente** a mostra no notebook. Instalar um viewer não cria imagem se o servidor não existe. Um servidor VNC no notebook também não faz o telefone transmitir vídeo para ele. Escolha uma linha, prepare-a e teste, sem executar vários servidores concorrentes.

Tenha telefone e notebook na mesma rede confiável e anote usuário, IP e porta. Se ainda não sabe abrir o terminal ou instalar OpenSSH no Windows/macOS/Linux, siga [SSH do zero](../projetos/ssh-remoto.md), incluindo identificação, chave e alias `mini-pc`. As etapas seguintes pressupõem que `ssh mini-pc` chega **ao telefone**, inclusive quando o hub ocupa a porta USB.

## SSH: preparar o servidor

Identifique distribuição e init:

```sh
cat /etc/os-release
cat /proc/1/comm
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

Para chave dedicada no notebook Linux/macOS com `ssh-copy-id` disponível, escolha um nome que ainda não exista. No Windows ou quando esse programa faltar, siga a [instalação manual de chave](../projetos/ssh-remoto.md#windows-ou-cliente-sem-ssh-copy-id-instalação-manual-completa). Se já concluiu aquele tutorial, não crie nem copie a mesma chave novamente:

```sh
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
ssh-keygen -t ed25519 -f ~/.ssh/smartphone-linux
ssh-copy-id -i ~/.ssh/smartphone-linux.pub usuario@ENDERECO_DO_TELEFONE
ssh -i ~/.ssh/smartphone-linux -o IdentitiesOnly=yes -o PreferredAuthentications=publickey usuario@ENDERECO_DO_TELEFONE
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

O cliente VNC conecta à **porta 5901 do loopback do notebook**: TigerVNC utiliza `127.0.0.1::5901`, com dois dois-pontos para porta explícita; Remmina utiliza `127.0.0.1:5901`. A porta local precisa estar livre; ajuste o bind do túnel e o destino no viewer quando necessário. Esse túnel não instala/ativa o servidor e não autoriza exposição pública de VNC. Para RDP, prefira a criptografia/autenticação e integração do GNOME documentadas, sem assumir que xrdp compartilha o Wayland físico.

## Compartilhar o GNOME físico: do painel ao cliente RDP

Este caminho exige **GNOME local funcional**, integração GNOME Remote Desktop e a função oferecida pela versão/port. Não é a receita de uma instalação PRoot. Se não existe painel ou daemon compatível, vá ao diagnóstico abaixo; não iniciar outro GNOME dentro de VNC para afirmar que a tela física foi compartilhada.

### Preparar no telefone

1. Dentro do GNOME do telefone, pressione Super, procure **Configurações** e abra **Sistema → Área de trabalho remota**, ou o painel de compartilhamento correspondente à versão.
2. Escolha **Compartilhamento da área de trabalho**, e não Login remoto quando deseja a sessão já aberta. Habilite compartilhamento e, se quiser mouse/teclado do cliente, controle remoto.
3. Anote os campos **Como conectar**, porta e credenciais de login do compartilhamento. Essas credenciais podem ser diferentes da senha SSH. Não as publique em screenshot.
4. Abra **Verificar criptografia** e anote/confira a fingerprint do certificado para comparar no cliente.
5. Mantenha essa sessão local aberta para o primeiro teste. Uma máquina suspensa, sessão encerrada ou política de bloqueio pode alterar a disponibilidade; valide o comportamento da sua versão antes de depender dele.

Não fixe 3389 por suposição: a documentação informa que Login remoto e compartilhamento podem usar portas diferentes quando ambos estão ativos. Leia o número exibido. Em Debian nativo, confira `apt-cache policy gnome-remote-desktop` e instale `sudo apt install gnome-remote-desktop` se estiver ausente e a integração da release for aplicável. Em APK, busque `apk search -x gnome-remote-desktop` e siga o pacote do branch; presença do pacote não completa APIs ausentes num init customizado.

### Instalar/abrir o cliente no notebook

**Windows:** pressione Windows+R, digite `mstsc` e Enter. É o cliente RDP fornecido pelo Windows, não exige instalar um servidor nele. No campo Computador, informe o endereço e a porta observados; `endereco:3390` é o formato se a porta for 3390. Abra opções para informar o usuário de compartilhamento. Compare o certificado/fingerprint quando apresentado antes de confiar.

**Linux:** use [Remmina](https://remmina.org/how-to-install-remmina/) do repositório do notebook. Em Debian/Ubuntu, `sudo apt update` e `sudo apt install remmina remmina-plugin-rdp remmina-plugin-vnc` preparam os dois protocolos; Fedora fornece o pacote Remmina e plugins correspondentes da sua release. Abra Remmina pelo menu, crie uma conexão com **Protocolo RDP**, servidor `endereco:porta`, usuário/senha do painel e profundidade de cor automática. Não use protocolo VNC para uma porta RDP.

**macOS:** um cliente citado pela ajuda GNOME é [Thincast Client](https://thincast.com/en/products/client), disponível para o Mac. Ele é um aplicativo proprietário, embora a documentação deste projeto seja aberta. Na página oficial, selecione a edição macOS, confira requisitos/arquitetura, baixe e siga o instalador disponibilizado. Abra o aplicativo, crie uma conexão RDP e informe servidor, porta e credenciais do painel. Não baixe um executável Windows para o Mac. Outros clientes RDP podem funcionar, mas exigem testar a versão/protocolo com seu servidor.

**Verificação:** a janela deve mostrar a mesma aplicação aberta no monitor físico. Abra um documento de teste no telefone, mova o ponteiro pelo cliente e confirme se o documento/ponteiro correspondem nos dois displays. Um indicador de compartilhamento deve aparecer no GNOME quando a integração o fornece. Uma área de trabalho nova e vazia pode significar Login remoto/sessão secundária, e não a mesma tela.

### Usar um túnel quando a integração permitir esse destino

O RDP possui sua própria autenticação/criptografia. Para um laboratório protegido adicionalmente por SSH, se o servidor RDP aceita conexão a seu loopback, pode-se encaminhar a **porta observada**. Se o painel confirmou 3389 no telefone:

```sh
ssh -N -o ExitOnForwardFailure=yes -L 13389:127.0.0.1:3389 mini-pc
```

Execute no notebook e mantenha a janela aberta. No cliente RDP, informe `127.0.0.1:13389`, credenciais RDP e compare a fingerprint do **telefone**, não uma identidade inventada para localhost. Se a porta remota for outra, ajuste apenas o destino confirmado. Falha de conexão pelo túnel exige conferir escuta e integração; não prova que o GNOME foi encerrado. O encaminhamento não altera automaticamente o endereço em que o daemon RDP escuta: revise firewall/escuta para não supor que a LAN ficou bloqueada só por utilizar túnel.

## VNC virtual: servidor no telefone, viewer no computador

Para criar um desktop virtual em Android/PRoot, use primeiro [o tutorial de desktop Android](../android/desktop.md), que prepara o servidor, a sessão gráfica e a senha. Neste guia, considere apenas um servidor **já validado e escutando no loopback**. GNOME Wayland físico não deve ser capturado por Xvnc como se fosse um display X11 comum.

### Instalar um viewer de fonte oficial

- **Windows/macOS:** abra [TigerVNC](https://tigervnc.org/) e siga **Downloads** para a release oficial. Escolha o **viewer** adequado ao sistema/arquitetura, confira o hash quando oferecido e execute o instalador/abra o aplicativo conforme a release. Você precisa do cliente no notebook; não habilite um serviço VNC servidor do Windows. Nem toda release oferece todos os artefatos/arquiteturas.
- **Debian/Ubuntu do notebook:** `sudo apt update` e `sudo apt install tigervnc-viewer`; abra **TigerVNC Viewer** no menu ou execute `vncviewer`.
- **Linux com Remmina já instalado:** crie uma conexão **VNC**, usando o plugin VNC; não selecione RDP.

O protocolo VNC clássico oferece autenticação limitada e pode não criptografar a sessão. Por isso este laboratório usa SSH. Confirme a porta **no servidor**: display `:1` normalmente corresponde a 5901, mas argumentos do daemon podem escolher outra; `:2` não significa automaticamente 5901.

### Abrir o túnel e a tela

Suponha que o teste do servidor no telefone confirmou **5902**, como um desktop virtual `:2`. No notebook, numa janela Terminal/PowerShell:

```sh
ssh -N -o ExitOnForwardFailure=yes -L 15902:127.0.0.1:5902 mini-pc
```

Deixe-a aberta. No TigerVNC Viewer, o endereço que especifica explicitamente uma porta é:

```text
127.0.0.1::15902
```

Os **dois dois-pontos** distinguem porta de número de display no TigerVNC; consulte o formato do seu cliente se usar outro. No Remmina, informe servidor `127.0.0.1:15902` no perfil VNC. Forneça a senha **VNC** criada no telefone, não a passphrase da chave SSH. O prompt de autenticação aparecer sem expor a senha em comandos.

Se abrir uma janela com o desktop de teste, crie nela um arquivo, feche somente o viewer e reconecte. O arquivo deve permanecer. Encerrar o viewer não significa encerrar o servidor; botões de parada de uma sessão virtual podem, por outro lado, finalizar seus aplicativos. Teste teclado do notebook e explique qual teclado controla qual sessão: o dispositivo físico conectado ao hub pode pertencer ao seat local e não entrar no display virtual.

Ao terminar, feche o viewer e use Ctrl+C na janela do túnel. Pare o **servidor de teste** pelo mecanismo documentado no tutorial que o iniciou; não mate todos os processos gráficos do telefone. Um telefone com desktop virtual ainda depende da inicialização desse ambiente/supervisor, não do viewer, para manter aplicações.

## Quando não conecta ou mostra uma tela diferente

| Sintoma | Verificação antes de mudar configuração |
|---|---|
| `ssh` não existe no notebook | Instale o cliente pelo guia SSH e repita `ssh -V` |
| Túnel informa bind em uso | Escolha outra porta **local**, mantendo o destino remoto confirmado |
| Cliente conecta, mas nega senha | Distinga conta SSH, credenciais RDP, senha VNC e passphrase da chave |
| RDP não aparece no painel GNOME | Verifique versão, pacote, integração de sessão e PipeWire do port |
| VNC conecta e só há fundo vazio | O servidor existe, mas o desktop não iniciou; leia logs da sessão |
| Tela remota não corresponde ao HDMI | Identifique sessão virtual versus compartilhamento físico |
| Notebook mostra imagem, monitor segue preto | [Diagnostique vídeo físico](../hardware/video-hotplug.md); viewer não valida DisplayPort |
| Para de responder com tela apagada | Separe suspensão do sistema, política Android e servidor encerrado |

Prefira uma conexão por vez no primeiro teste, resolução conservadora e logs do servidor. Reduzir qualidade pode diminuir tráfego, mas não corrige GPU, USB-C ou crashes de kernel.

## Segurança e recuperação

Não exponha SSH/VNC/RDP diretamente à internet como primeiro passo. Redes distintas exigem VPN ou caminho protegido administrado, não só conhecer o IP privado. Revogue acesso de terceiros ao terminar, mantenha patches e bloqueie/desative compartilhamento quando não precisar.

Se USB e hub compartilham a única porta, um coletor local temporário permite salvar evidências enquanto o notebook está desconectado. Ele não deve gravar teclas/fotos continuamente. Perder Wi-Fi não comprova crash: confirme boot, USB e registros antes de reiniciar.

## Reversão e testes finais

Desative apenas o serviço de teste, remova uma chave pública autorizada se não for mais usada e restaure configuração salva. Não delete todas as chaves de host. Teste reconexão SSH após boot, autenticação errada, desktop remoto com indicador de compartilhamento, encerramento do cliente e uso do monitor físico independente.

**Fontes e verificação:** **2026-10-11**, documental, sem abrir sessão remota no telefone. [OpenSSH manuais](https://www.openssh.com/manual.html), [sshd_config](https://man.openbsd.org/sshd_config), [GNOME desktop sharing](https://help.gnome.org/gnome-help/sharing-desktop.html), [Remmina: instalação](https://remmina.org/how-to-install-remmina/), [Thincast: cliente por sistema](https://thincast.com/en/products/client), [TigerVNC e downloads](https://tigervnc.org/), [sintaxe do viewer](https://tigervnc.org/doc/vncviewer.html). Interfaces, bloqueio, Login remoto e performance dependem da integração/versão do dispositivo; as telas descritas precisam ser confrontadas com a edição instalada.
