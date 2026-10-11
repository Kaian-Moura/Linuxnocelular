---
title: chroot com Android e root real
sidebar_position: 5
description: Prepare uma rootfs verificável e entenda montagens, SELinux, arquitetura e encerramento seguro.
last_verified: '2026-10-10'
validation: documental
---

## Resultado esperado e critérios para seguir

**Dificuldade:** avançada. **Resultado:** usuários e ferramentas Debian numa árvore de arquivos separada, compartilhando o kernel do Android. **Não substitui o Android.** O chroot altera a raiz de arquivos percebida por um processo; não cria, por si só, isolamento de rede, usuários ou processos.

Este procedimento de referência requer um telefone **ARM64 com root já funcional**, autorização consciente para executar código como root, espaço em `/data`, backup externo e caminho documentado de recuperação do Android. Também requer um computador **Linux ARM64** para construir a rootfs, ADB autorizado e ferramentas `mount`, `umount`, `tar`, `chroot` e `sha256sum` disponíveis na shell root do telefone. O `mount` precisa implementar bind e `--make-private`: confira sua ajuda antes de continuar. Se esse recurso estiver ausente, não improvise montagens compartilhadas; use PRoot ou prepare ferramentas por uma fonte compatível e revisada. Se seu computador é x86_64, não execute a etapa de bootstrap ARM64 diretamente: debootstrap estrangeiro requer segunda etapa e emulação/binfmt documentados. Use uma VM ARM64 ou estude essa diferença antes.

:::danger Root do Android é acesso real ao dispositivo
Os processos do chroot podem afetar o host, especialmente quando recebem `/dev`, `/proc` e `/sys`. Não execute software desconhecido ali e não confunda esse ambiente com um container isolado. Este guia não ensina a obter root: a instalação de root modifica o boot em muitos aparelhos e depende do modelo.
:::

## 1. Validar o host e o telefone

No computador Linux ARM64:

```bash
uname -m
adb devices -l
adb shell getprop ro.product.cpu.abilist
adb shell su -c id
```

O computador deve informar `aarch64`; as ABIs do telefone devem incluir `arm64-v8a`; a shell root deve informar `uid=0`. `adb devices` precisa mostrar uma conexão autorizada. Uma negativa do gerenciador de root não se corrige tentando outros caminhos de partições.

Na shell root do Android, registre `getenforce`, `df -h /data` e `mount`. Mantenha SELinux no estado existente. Políticas do aparelho podem impedir execução ou montagens: se isso ocorrer, identifique a negativa nos logs e pare. Não aplique `setenforce 0` como requisito automático de um desktop.

## 2. Construir a rootfs no computador

Em um **host Debian/Ubuntu ARM64**, instale debootstrap dos repositórios da sua distribuição:

```bash
sudo apt update
sudo apt install debootstrap adb
mkdir -p "$HOME/chroot-mini-pc"
sudo debootstrap --arch=arm64 --variant=minbase --include=ca-certificates trixie "$HOME/chroot-mini-pc/rootfs" https://deb.debian.org/debian
sudo tar -C "$HOME/chroot-mini-pc/rootfs" -cpf "$HOME/chroot-mini-pc/debian-arm64.tar" .
sha256sum "$HOME/chroot-mini-pc/debian-arm64.tar"
```

`trixie` identifica Debian 13; `minbase` cria um conjunto pequeno e `--include=ca-certificates` prepara certificados para as operações HTTPS dentro do ambiente. O pacote debootstrap verifica os índices assinados do Debian quando o keyring apropriado está presente: não desative essa verificação. O arquivo tar é construído de uma árvore local conhecida e contém caminhos relativos; não é uma boot image e não deve ser gravado em uma partição.

Em outro host Linux, instale debootstrap pelo gerenciador dessa distribuição. Se a release selecionada não é reconhecida, atualize a ferramenta por uma fonte suportada, em vez de adicionar scripts de bootstrap não verificados.

## 3. Transferir e extrair em um diretório novo

No computador:

```bash
adb push "$HOME/chroot-mini-pc/debian-arm64.tar" /data/local/tmp/debian-arm64.tar
adb shell
```

No Android, abra **uma única shell root** com `su`. Confirme as ferramentas por `command -v mount`, `command -v tar` e `command -v chroot`. Compare `sha256sum /data/local/tmp/debian-arm64.tar` com o resultado do computador.

O diretório `/data/local/linux-mini-pc` deve estar **ausente** antes da criação. Se já existe, inspecione-o e escolha outro nome; não extraia por cima de uma instalação.

```bash
mkdir /data/local/linux-mini-pc
chmod 700 /data/local/linux-mini-pc
tar -xpf /data/local/tmp/debian-arm64.tar -C /data/local/linux-mini-pc
ls /data/local/linux-mini-pc/bin
```

Esse bloco só se aplica ao arquivo produzido na etapa anterior. Arquivos tar não confiáveis podem conter links e caminhos perigosos; não extraia uma rootfs aleatória como root. Se o armazenamento interno não suporta execução ou o contexto SELinux bloqueia o binário, interrompa e investigue a política. Não use `/sdcard` para contornar o problema.

## 4. Montar os pontos necessários

Ainda na mesma shell root, confirme que os pontos da árvore **não estão montados** e leia `/proc/self/mountinfo`. Montagens com `shared:` podem propagar operações para outros lugares/namespaces do Android. Crie um bind da própria raiz do laboratório e torne-o privado antes de adicionar submontagens; torne privados também os destinos ligados ao hardware. **Não altere a propagação de `/`, `/dev` ou `/sys` do Android.** Se algum comando falhar, pare e desfaça apenas o que já montou, sem seguir ao próximo. Para a raiz recém-criada:

```bash
mount --bind /data/local/linux-mini-pc /data/local/linux-mini-pc
mount --make-private /data/local/linux-mini-pc
mount -t proc proc /data/local/linux-mini-pc/proc
mount --bind /sys /data/local/linux-mini-pc/sys
mount --make-private /data/local/linux-mini-pc/sys
mount --bind /dev /data/local/linux-mini-pc/dev
mount --make-private /data/local/linux-mini-pc/dev
mount --bind /dev/pts /data/local/linux-mini-pc/dev/pts
mount --make-private /data/local/linux-mini-pc/dev/pts
```

`proc` expõe informações de processos; `/sys`, hardware e kernel; `/dev`, dispositivos; `/dev/pts`, terminais. São acessos ao **host Android**, mesmo com a propagação privada: isso não torna o chroot um container seguro. Confira os destinos em `/proc/self/mountinfo`; eles não devem mostrar `shared:`/`master:` após `--make-private`. Montagens simples foram escolhidas em vez de uma cópia recursiva de toda a árvore de montagens. Root managers podem manter namespaces diferentes entre shells: monte, execute e desmonte a partir da mesma shell.

DNS exige um resolvedor válido e acessível. Inspecione `/data/local/linux-mini-pc/etc/resolv.conf` antes de editar, e preserve uma cópia. Utilize o resolvedor da rede autorizado pelo administrador; não fixe um DNS externo universal. Se Android fornecer DNS por mecanismos que não se traduzem a esse arquivo, trate essa integração separadamente.

## 5. Entrar, instalar e verificar

```bash
chroot /data/local/linux-mini-pc /usr/bin/env -i PATH=/usr/sbin:/usr/bin:/sbin:/bin TERM=xterm-256color /bin/bash --noprofile --norc
```

`env -i` evita herdar caminhos e variáveis de bibliotecas do Android. **Dentro do chroot:**

```bash
cat /etc/os-release
uname -r
id
apt update
apt install ca-certificates python3 nano
python3 -c 'print("chroot validado")'
exit
```

O kernel continua Android. `apt update` exige rede e DNS; uma falha de resolução não invalida automaticamente o filesystem. Não habilite todos os serviços do pacote: systemd não passa a ser PID 1 porque seu binário foi instalado. Execute um serviço de teste em primeiro plano e configure supervisão somente após o encerramento seguro estar entendido.

## 6. Encerrar e desfazer com segurança

Saia do chroot, encerre os processos que iniciou nele e, na shell Android que fez as montagens, desmonte em ordem inversa:

```bash
umount /data/local/linux-mini-pc/dev/pts
umount /data/local/linux-mini-pc/dev
umount /data/local/linux-mini-pc/sys
umount /data/local/linux-mini-pc/proc
umount /data/local/linux-mini-pc
```

Se houver `target is busy`, existe processo, shell ou diretório corrente mantendo referência. Identifique-o com ferramentas disponíveis como `fuser` ou `/proc`; não use desmontagem forçada ou lazy para esconder a referência e em seguida apagar a árvore. **Nunca apague o diretório enquanto houver bind mounts:** a remoção pode atingir arquivos do host.

Só arquive ou remova a rootfs depois que as montagens estiverem ausentes e os dados pessoais tiverem backup. O rollback consiste em parar os processos e desfazer essas montagens, preservando o Android e o arquivo original; não envolve Fastboot.

## Erros, alternativas e teste final

`No such file` para um executável existente pode indicar loader ou arquitetura incorreta. `Permission denied` pode indicar SELinux ou filesystem, não `chmod` ausente. `Operation not permitted` em namespaces evidencia suporte/permissão do kernel. Nenhum desses erros se resolve adicionando módulos de outro aparelho.

Valide executar Python, salvar um arquivo, sair, desmontar tudo e repetir o ciclo sem montagens duplicadas. Teste backup com a rootfs parada. Se não puder satisfazer os critérios de arquitetura ou políticas, use [PRoot sem root](./proot-distro.md). Uma instalação chroot estável ainda não comprova suporte a Docker, GPU, câmera ou saída de vídeo.

## Fontes e lacunas

Revisão documental: **10/10/2026**. [debootstrap](https://manpages.debian.org/trixie/debootstrap/debootstrap.8.en.html), [chroot(2)](https://man7.org/linux/man-pages/man2/chroot.2.html), [mount(8)](https://man7.org/linux/man-pages/man8/mount.8.html), [propagação de montagens no kernel](https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt), [SELinux no Android](https://source.android.com/docs/security/features/selinux). O procedimento é uma referência condicional para ARM64, não um teste em cada combinação de Android, root manager e política SELinux.
