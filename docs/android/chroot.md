---
title: chroot com Android e root real
sidebar_position: 5
description: Prepare uma rootfs verificável e entenda montagens, SELinux, arquitetura e encerramento seguro.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado esperado e critérios para seguir

**Dificuldade:** avançada. **Resultado:** usuários e ferramentas Debian numa árvore de arquivos separada, compartilhando o kernel do Android. **Não substitui o Android.** O chroot altera a raiz de arquivos percebida por um processo; não cria, por si só, isolamento de rede, usuários ou processos.

Este procedimento de referência requer um telefone **ARM64 com root já funcional**, autorização consciente para executar código como root, espaço em `/data`, backup externo e caminho documentado de recuperação do Android. Também requer um computador **Debian/Ubuntu Linux ARM64** para construir a rootfs, ADB autorizado e ferramentas `mount`, `umount`, `tar`, `chroot` e `sha256sum` disponíveis na shell root do telefone. O `mount` precisa implementar bind e `--make-private`: confira sua ajuda antes de continuar. Se esse recurso estiver ausente, não improvise montagens compartilhadas; use PRoot ou prepare ferramentas por uma fonte compatível e revisada. Se seu computador é x86_64, não execute a etapa de bootstrap ARM64 diretamente: debootstrap estrangeiro requer segunda etapa e emulação/binfmt documentados. Uma [VM Debian ARM64](./virtualizacao.md) é um laboratório possível para construir a árvore, mas seu compartilhamento com o computador precisa estar configurado.

Se precisa preparar Linux no computador, use [Linux no computador](../comece-aqui/linux-no-computador.md), conferindo a arquitetura. Uma instalação Linux x86_64 não vira ARM64 só por estar numa máquina virtual. Se não consegue fornecer um host ARM64 para este caminho, [PRoot-distro](./proot-distro.md) oferece uma preparação mais simples sem root; o requisito explícito aqui evita entregar uma árvore incompleta a um iniciante.

:::danger Root do Android é acesso real ao dispositivo
Os processos do chroot podem afetar o host, especialmente quando recebem `/dev`, `/proc` e `/sys`. Não execute software desconhecido ali e não confunda esse ambiente com um container isolado. Se root ainda não existe, consulte o [guia condicionado de Magisk](../preparacao/root-magisk.md), que é uma tarefa separada e pode modificar a inicialização. Root não é necessário para Termux/PRoot nem um requisito geral de Linux nativo.
:::

## 1. Validar o host e o telefone

Abra o terminal **do computador Debian/Ubuntu ARM64**, não o Termux. ADB deve ter sido configurado pelo [guia de ADB](../preparacao/adb-fastboot.md). Confirme primeiro:

```bash
uname -m
adb devices -l
adb shell getprop ro.product.cpu.abilist
adb shell su -c id
```

O computador deve informar `aarch64`; as ABIs do telefone devem incluir `arm64-v8a`; a shell root deve informar `uid=0`. `adb devices` precisa mostrar uma conexão autorizada. Uma negativa do gerenciador de root não se corrige tentando outros caminhos de partições.

O comando `adb shell su -c id` pode abrir um pedido Magisk no **telefone**: confira que corresponde ao acesso shell que você acabou de solicitar e autorize-o apenas se previsto. Se a tela não pode mostrar esse pedido, não há confirmação automática de root. `su: not found`, uma negativa ou identidade diferente de root bloqueiam as montagens seguintes.

Entre com `adb shell`, então digite `su` **nessa shell Android**. A aparência do cursor pode mudar, mas execute `id` para confirmar. Registre `getenforce`, `df -h /data`, `mount` e as ajudas de `mount`, `umount`, `tar` e `chroot`. Você precisa distinguir montagem bind e propagação privada na ferramenta realmente instalada. `command -v mount` mostra qual executável está sendo utilizado; a presença de “BusyBox” em algum aplicativo não confirma que essa shell usa suas funções.

Mantenha SELinux no estado existente. Políticas do aparelho podem impedir execução ou montagens: se isso ocorrer, identifique a negativa nos logs e pare. Não aplique `setenforce 0` como requisito automático de um desktop. Depois dessa inspeção, digite `exit` para sair da shell root e outro `exit` para voltar ao terminal do computador; não mantenha várias shells de montagem sem saber qual é a ativa.

## 2. Construir a rootfs no computador

Em um **host Debian/Ubuntu ARM64**, instale debootstrap dos repositórios da sua distribuição:

```bash
sudo apt update
sudo apt install debootstrap debian-archive-keyring adb ca-certificates
mkdir -p "$HOME/chroot-mini-pc"
sudo debootstrap --arch=arm64 --variant=minbase --include=ca-certificates --force-check-sig trixie "$HOME/chroot-mini-pc/rootfs" https://deb.debian.org/debian
sudo tar -C "$HOME/chroot-mini-pc/rootfs" -cpf "$HOME/chroot-mini-pc/debian-arm64.tar" .
sha256sum "$HOME/chroot-mini-pc/debian-arm64.tar"
```

Digite a senha **do usuário do computador** quando `sudo` pedir, sem esperar caracteres na tela. Essa senha não é a do Android/Magisk. Confira os pacotes antes de aceitar a instalação.

`trixie` identifica Debian 13; `minbase` cria um conjunto pequeno e `--include=ca-certificates` prepara certificados para as operações HTTPS dentro do ambiente. O pacote `debian-archive-keyring` fornece chaves Debian; `--force-check-sig` impede a ferramenta de tratar a ausência de um keyring como motivo para continuar só com HTTPS. Não desative essa verificação. O arquivo tar é construído de uma árvore local conhecida e contém caminhos relativos; não é uma boot image e não deve ser gravado em uma partição.

Antes da construção, `debootstrap --help` deve oferecer `--force-check-sig`; a grafia usada aqui exige uma versão recente da ferramenta. Se seu Ubuntu fornece uma versão anterior, não retire silenciosamente a exigência de assinatura: use um host Debian/Ubuntu suportado com a ferramenta adequada ou consulte o parâmetro equivalente documentado daquela versão. Execute `debootstrap` somente se a pasta `rootfs` está ausente ou vazia e pertence a este laboratório. Espere a conclusão de instalação da base antes de executar `tar`: a preparação baixa muitos pacotes. Um erro de assinatura, download ou execução interrompe a sequência. Guarde o log `$HOME/chroot-mini-pc/rootfs/debootstrap/debootstrap.log` se ainda estiver presente na falha. Não envie uma rootfs de uma operação interrompida como se estivesse pronta.

Em outro host Linux, instale debootstrap pelo gerenciador dessa distribuição. Se a release selecionada não é reconhecida, atualize a ferramenta por uma fonte suportada, em vez de adicionar scripts de bootstrap não verificados.

## 3. Transferir e extrair em um diretório novo

No computador:

```bash
adb push "$HOME/chroot-mini-pc/debian-arm64.tar" /data/local/tmp/debian-arm64.tar
adb shell
```

No Android, abra **uma única shell root** com `su`. Confirme as ferramentas por `command -v mount`, `command -v tar` e `command -v chroot`. Compare `sha256sum /data/local/tmp/debian-arm64.tar` com o resultado do computador.

O `adb push` deve concluir informando bytes transferidos. A consulta de hash no telefone tem que apresentar o mesmo digest de 64 caracteres calculado no computador. `Permission denied` para o arquivo não autoriza trocar por `/dev/block/...`; confira o caminho e a shell que está usando.

O diretório `/data/local/linux-mini-pc` deve estar **ausente** antes da criação. Se já existe, inspecione-o e escolha outro nome; não extraia por cima de uma instalação.

```bash
mkdir /data/local/linux-mini-pc
chmod 700 /data/local/linux-mini-pc
tar -xpf /data/local/tmp/debian-arm64.tar -C /data/local/linux-mini-pc
ls /data/local/linux-mini-pc/bin
```

Esse bloco só se aplica ao arquivo produzido na etapa anterior. Arquivos tar não confiáveis podem conter links e caminhos perigosos; não extraia uma rootfs aleatória como root. Se o armazenamento interno não suporta execução ou o contexto SELinux bloqueia o binário, interrompa e investigue a política. Não use `/sdcard` para contornar o problema.

`mkdir` sem `-p` foi escolhido para não ocultar um diretório existente. Se receber `File exists`, pare: escolha um nome novo e substitua-o **em todos os comandos de montagem, entrada e desmontagem**, preservando a instalação anterior. `ls .../bin` deve listar executáveis da base Debian; em versões com merged-/usr, `bin` pode ser um link para `usr/bin`, o que é esperado.

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

Execute **uma linha por vez**, verificando sua saída; não cole a sequência inteira para que continue após uma falha. Comandos de montagem bem-sucedidos normalmente não imprimem texto. `cat /proc/self/mountinfo` deve mostrar os destinos deste laboratório. Se o destino `dev/pts` não está acessível depois do bind de `/dev`, a árvore Android não fornece esse ponto da forma esperada: pare e desfaça o que já montou, em vez de criar diretórios no `/dev` do host.

`proc` expõe informações de processos; `/sys`, hardware e kernel; `/dev`, dispositivos; `/dev/pts`, terminais. São acessos ao **host Android**, mesmo com a propagação privada: isso não torna o chroot um container seguro. Confira os destinos em `/proc/self/mountinfo`; eles não devem mostrar `shared:`/`master:` após `--make-private`. Montagens simples foram escolhidas em vez de uma cópia recursiva de toda a árvore de montagens. Root managers podem manter namespaces diferentes entre shells: monte, execute e desmonte a partir da mesma shell.

### Preparar DNS sem adivinhar um servidor

DNS traduz nomes como `deb.debian.org` para endereços de rede. A rootfs pode herdar do computador um `resolv.conf` contendo `127.0.0.53`: esse endereço de loopback não passa a apontar para o resolvedor do computador quando o arquivo vai ao telefone.

Na shell root Android, inspecione `ls -l /data/local/linux-mini-pc/etc/resolv.conf` e o conteúdo com `cat`. Se for um **arquivo regular**, preserve uma cópia por `cp /data/local/linux-mini-pc/etc/resolv.conf /data/local/linux-mini-pc/etc/resolv.conf.antes-chroot`, somente se esse nome de backup ainda estiver livre. Se for um link, anote seu destino e investigue antes de escrever: não siga cegamente um link absoluto da rootfs pela shell host.

Obtenha um endereço IP de resolvedor autorizado da rede: procure os detalhes da conexão Wi-Fi no Android ou consulte o administrador. Não assuma que gateway e DNS são sempre iguais. Um nome de **DNS privado** Android ou um arquivo de um PC com VPN também não é automaticamente um endereço utilizável pelo chroot. Sem um resolvedor identificado, a instalação de pacotes por nome permanece bloqueada, mas você pode testar o shell offline.

No computador, abra seu editor de texto ou `nano "$HOME/chroot-mini-pc/resolv-chroot.conf"`. Escreva uma linha com o formato abaixo, substituindo o marcador pelo **IP real autorizado**, sem os sinais `<`/`>`:

```text
nameserver IP_DNS_AUTORIZADO
```

Salve o arquivo; no nano, Ctrl+O, Enter e Ctrl+X. Numa segunda janela de terminal **do computador**, transfira-o com `adb push "$HOME/chroot-mini-pc/resolv-chroot.conf" /data/local/tmp/resolv-chroot.conf`. Na shell root que controla o laboratório, somente depois de confirmar arquivo regular e backup, use `cp /data/local/tmp/resolv-chroot.conf /data/local/linux-mini-pc/etc/resolv.conf`. Essa alteração é na rootfs, não no DNS global Android. Mantenha a primeira shell aberta para preservar o namespace das montagens.

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
```

O kernel continua Android. `apt update` exige rede e DNS; uma falha de resolução não invalida automaticamente o filesystem. Não habilite todos os serviços do pacote: systemd não passa a ser PID 1 porque seu binário foi instalado. Execute um serviço de teste em primeiro plano e configure supervisão somente após o encerramento seguro estar entendido.

Espere `PRETTY_NAME` correspondente ao Debian 13 e `uid=0` neste shell: aqui o privilégio é **real**, não a simulação do PRoot. A instalação de pacotes deve mostrar a transação e concluir sem erro; não aceite fontes de uma distribuição diferente. Antes de `exit`, teste um arquivo:

```bash
mkdir -p /root/projetos
printf '%s\n' 'print("Arquivo persistente no chroot")' > /root/projetos/ola.py
python3 /root/projetos/ola.py
exit
```

No próximo ciclo de entrada, execute apenas o último comando para confirmar persistência. Não use essa shell administrativa para navegar ou executar programas de procedência desconhecida. Uma conta de trabalho e serviços precisam de uma integração própria, considerando que identidades, rede e dispositivos são compartilhados com Android.

## 6. Encerrar e desfazer com segurança

Saia do chroot, encerre os processos que iniciou nele e, na shell Android que fez as montagens, desmonte em ordem inversa:

```bash
cd /
umount /data/local/linux-mini-pc/dev/pts
umount /data/local/linux-mini-pc/dev
umount /data/local/linux-mini-pc/sys
umount /data/local/linux-mini-pc/proc
umount /data/local/linux-mini-pc
```

Se houver `target is busy`, existe processo, shell ou diretório corrente mantendo referência. Identifique-o com ferramentas disponíveis como `fuser` ou `/proc`; não use desmontagem forçada ou lazy para esconder a referência e em seguida apagar a árvore. **Nunca apague o diretório enquanto houver bind mounts:** a remoção pode atingir arquivos do host.

O `exit` da etapa anterior deve retornar à **mesma shell root Android**. Execute `cd /` nessa shell antes de desmontar, para não manter seu diretório corrente dentro da rootfs. Desmonte apenas os destinos que foram realmente montados, em ordem inversa; se uma montagem anterior falhou, sua correspondente desmontagem não é exigida. Confira de novo `/proc/self/mountinfo`: nenhuma entrada desse laboratório deve permanecer. Uma consulta em outro namespace não comprova que a primeira shell desmontou seus pontos.

Só arquive ou remova a rootfs depois que as montagens estiverem ausentes e os dados pessoais tiverem backup. O rollback consiste em parar os processos e desfazer essas montagens, preservando o Android e o arquivo original; não envolve Fastboot.

Depois de desligar os processos e desmontar, ainda na shell root Android, um backup com nome novo pode ser feito por `tar -C /data/local/linux-mini-pc -cpf /data/local/tmp/chroot-mini-pc-backup.tar .`. Volte ao computador e use `adb pull /data/local/tmp/chroot-mini-pc-backup.tar ./chroot-mini-pc-backup.tar`. Confira a listagem e o hash, e teste restauração **num diretório novo sem montagens**, sem extrair sobre a árvore atual. O arquivo pode conter segredos; não publique-o. Espaço em `/data/local/tmp` precisa comportar a cópia antes de produzi-la.

## Erros, alternativas e teste final

| Erro | O que verificar | Resposta apropriada |
| --- | --- | --- |
| `No such file` para executável existente | Arquitetura e loader da imagem | Conferir host ARM64 e bootstrap concluído; não renomear um binário x86_64 |
| `Permission denied` | Filesystem, contexto e log SELinux | Identificar a política; não executar `chmod -R 777` |
| `Operation not permitted` no mount | `uid=0`, opções da ferramenta, namespace e política | Parar a sequência e desfazer as montagens já feitas |
| `Temporary failure resolving` no apt | IP do DNS no `resolv.conf` da rootfs e rede | Corrigir a integração DNS autorizada, sem desativar TLS |
| `System has not been booted with systemd` | PID 1 Android, não Debian | Testar o programa em primeiro plano; não instalar systemd como correção automática |
| `target is busy` no encerramento | Processos, shells e diretórios correntes | Fechar quem utiliza a árvore e desmontar normalmente |

Para negativas SELinux, a documentação AOSP indica registros em logs do kernel/Android. A coleta disponível depende das permissões do build; um `logcat -d`/`dmesg` autorizado pode revelar mensagens `avc: denied`. Registre hora, operação e campos da negativa, retirando dados privados antes de compartilhar. Não conclua que “SELinux é o problema” só porque a mensagem diz permissão negada. Nenhum desses erros se resolve adicionando módulos de outro aparelho.

Valide executar Python, salvar um arquivo, sair, desmontar tudo e repetir o ciclo sem montagens duplicadas. Teste backup com a rootfs parada. Se não puder satisfazer os critérios de arquitetura ou políticas, use [PRoot sem root](./proot-distro.md). Uma instalação chroot estável ainda não comprova suporte a Docker, GPU, câmera ou saída de vídeo.

## Fontes e lacunas

Revisão documental: **11/10/2026**, sem teste de hardware. [debootstrap](https://manpages.debian.org/trixie/debootstrap/debootstrap.8.en.html), [chroot(2)](https://man7.org/linux/man-pages/man2/chroot.2.html), [mount(8)](https://man7.org/linux/man-pages/man8/mount.8.html), [propagação de montagens no kernel](https://www.kernel.org/doc/Documentation/filesystems/sharedsubtree.txt) e [SELinux no Android](https://source.android.com/docs/security/features/selinux). Foram revistos novamente debootstrap e SELinux; o acesso web ao manual mount sofreu timeout nesta rodada, embora a referência tenha sido consultada na revisão anterior. O procedimento é condicionado a ARM64, ferramentas e política; root funcional não comprova todos esses requisitos. Ausência de host apropriado, método de root, opções mount ou resolvedor autorizado bloqueia a etapa correspondente, em vez de justificar comandos inventados.
