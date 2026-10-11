---
title: QEMU, emulação e virtualização
sidebar_position: 7
description: Diferencie emulação de programas, máquinas virtuais completas e aceleração KVM antes de escolher esse caminho.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## O que muda e resultado esperado

**Dificuldade:** avançada. **Resultado de referência:** uma VM Debian ARM64 com disco em arquivo e SSH encaminhado ao loopback de um host Linux compatível. Não instala Debian nas partições do telefone. O tutorial foi revisado documentalmente, não executado em todos os kernels móveis.

QEMU tem funções diferentes. **User-mode** executa um programa de outra arquitetura, traduzindo instruções e syscalls para o host; ele não inicia um kernel convidado. **System emulation** simula uma máquina completa e inicia outro kernel. **TCG** faz tradução em software e pode ser lento. **KVM** aproveita virtualização do processador, mas exige suporte do kernel, firmware e acesso autorizado a `/dev/kvm`. O chip anunciar virtualização não garante KVM utilizável no Android.

Um Linux ARM64 nativo de telefone pode executar QEMU e continuar sem KVM. No Android, Termux pode disponibilizar builds de QEMU: confirme por `pkg search qemu`, arquitetura, firmware e opções locais. Não instale um pacote Debian diretamente no Termux. O procedimento reproduzível abaixo utiliza um **host Debian/Ubuntu ARM64**, que pode ser um telefone com port nativo apropriado ou uma máquina de laboratório; não é receita universal para um Android bloqueado.

**Host** é o sistema que executa QEMU; **convidado** é o sistema dentro da VM. Nesta página, comandos `apt`, `qemu-img` e `qemu-system-aarch64` são executados no **terminal do host Debian/Ubuntu**, fora de PRoot. Depois do SSH, os comandos identificados como “dentro da VM” pertencem ao convidado. Não se usa ADB/Fastboot para gravar o arquivo qcow2 no telefone.

Para preparar um computador Linux, consulte [Linux no computador](../comece-aqui/linux-no-computador.md). Um PC x86_64 pode emular ARM64 com TCG, mas instalação de pacotes e caminhos precisam ser conferidos para esse host; a referência completa aqui pressupõe Debian/Ubuntu ARM64. Android em Termux exige uma adaptação dos executáveis, firmware e acesso a arquivos; não copie `sudo apt` para o terminal Termux. Root não é requisito de emulação TCG no espaço do aplicativo, embora restrições Android possam limitar esse uso.

## Materiais, requisitos e backup

Reserve RAM para o host e o convidado: o exemplo aloca 2 GiB e duas CPUs à VM, sem prometer desempenho. Tenha espaço para imagem original, overlay e snapshots, rede para baixar a imagem e uma chave SSH. O filesystem deve suportar qcow2 e escrita normal. Antes de testar, copie os projetos e não monte partições físicas dentro do convidado.

:::warning A VM não traz drivers do telefone
O convidado enxerga a máquina virtual `virt`, não o OnePlus/Samsung real. Câmera, saída USB-C, GPU e bateria do telefone continuam dependendo do host e de integrações explícitas. Não espere GNOME acelerado apenas porque o Debian iniciou.
:::

## 1. Inspecionar o host e instalar ferramentas

**No host Linux real, não em PRoot:**

```bash
uname -m
ls -l /dev/kvm
sudo apt update
sudo apt install qemu-system-arm qemu-utils qemu-efi-aarch64 cloud-image-utils openssh-client
qemu-system-aarch64 -accel help
```

A ausência de `/dev/kvm` é aceitável para o teste TCG. Não aplique `chmod 666` nesse dispositivo para conseguir aceleração: verifique grupo, política e suporte. `qemu-system-arm` fornece o executável ARM64 nessa família de distribuição; em outros sistemas, descubra o nome pelo gerenciador local.

Abra o terminal da sessão Linux, execute uma linha por vez e leia a lista de pacotes. Quando `sudo` pedir senha, digite a senha da conta **do host**; os caracteres não aparecem. `uname -m` deve informar `aarch64` para a referência desta página. `qemu-system-aarch64 -accel help` deve listar `tcg`; listar `kvm` informa que o binário conhece o acelerador, mas ainda não comprova acesso ao dispositivo de kernel.

## 2. Obter uma imagem oficial e criar disco de trabalho

Acesse o [diretório de imagens cloud do Debian 13](https://cloud.debian.org/images/cloud/trixie/latest/) e escolha o arquivo **genericcloud ARM64 qcow2**, não uma imagem Azure/EC2/amd64. O nome disponível na revisão foi `debian-13-genericcloud-arm64.qcow2`. Baixe também `SHA512SUMS` e consulte a publicação Debian sobre origem/assinaturas: um checksum baixado do mesmo lugar detecta corrupção, mas sozinho não é prova independente de autenticidade.

Salve os arquivos no diretório `~/vms/mini-pc` e confira a entrada correspondente:

### Download pelo navegador e organização dos arquivos

1. No terminal do host, execute `mkdir -p "$HOME/vms/mini-pc"` para criar uma pasta de trabalho. No gerenciador de arquivos, ela aparece dentro da pasta pessoal, em `vms/mini-pc`.
2. No navegador do host, abra o diretório oficial e clique no nome **`debian-13-genericcloud-arm64.qcow2`**. Espere o download terminar; não escolha `nocloud`, `amd64`, `raw` ou `tar.xz` só por ter nome parecido. O arquivo desta receita já é qcow2 e **não deve ser descompactado**.
3. Baixe também **`SHA512SUMS`** da mesma listagem. Se o navegador mostra seu conteúdo como texto, use **Salvar página/Salvar como** e preserve o arquivo de texto puro com esse nome, sem transformá-lo em HTML.
4. Abra **Downloads** do host, selecione os dois arquivos, copie ou mova para `vms/mini-pc`. Confira os nomes completos; um download repetido pode acrescentar `(1)` ao nome, e isso impede o checksum de encontrar o arquivo.
5. Volte ao terminal, execute `cd "$HOME/vms/mini-pc"` e `ls -lh`. Os dois nomes devem aparecer e o download qcow2 não pode estar num arquivo temporário incompleto do navegador.

Agora execute a verificação, antes de criar o disco de trabalho:

```bash
mkdir -p "$HOME/vms/mini-pc"
cd "$HOME/vms/mini-pc"
sha512sum --check --ignore-missing SHA512SUMS
qemu-img info debian-13-genericcloud-arm64.qcow2
qemu-img create -f qcow2 -F qcow2 -b "$HOME/vms/mini-pc/debian-13-genericcloud-arm64.qcow2" trabalho.qcow2
```

O overlay armazena mudanças e mantém a imagem base preservada. Não mova ou altere a base enquanto o overlay a referencia. Caso o diretório oficial mude o nome ou a estrutura, pare e adapte somente após conferir a listagem real.

O comando de checksum deve informar **OK** para `debian-13-genericcloud-arm64.qcow2`. `--ignore-missing` evita tentar verificar todas as outras imagens que você não baixou; não aceite “nenhum arquivo verificado” como sucesso. `FAILED` exige apagar apenas o download defeituoso depois de identificá-lo e baixar outra vez. `qemu-img info` deve informar formato qcow2; tamanho virtual e tamanho ocupado podem diferir.

Crie `trabalho.qcow2` somente quando esse nome ainda não existe. Ele é o disco em que a VM escreverá; não copie comandos de criação sobre um overlay com projetos. Arquivos de imagem base e de trabalho são **discos virtuais**, não firmware do smartphone.

## 3. Preparar acesso por cloud-init

### Criar a chave do cliente, sem sobrescrever outra

**No terminal do host:**

```bash
mkdir -p "$HOME/.ssh"
ls -l "$HOME/.ssh/mini-pc-vm" "$HOME/.ssh/mini-pc-vm.pub"
```

Somente quando os dois nomes estão livres, gere a chave por `ssh-keygen -t ed25519 -f "$HOME/.ssh/mini-pc-vm"`. Se algum já existe, preserve-o: use uma chave sua já verificada ou escolha um nome novo em todos os passos. O programa pede uma **passphrase**, frase/senha que protege a chave privada no host; não é a senha do usuário da VM. Digite-a duas vezes sem esperar caracteres na tela. Se a ferramenta perguntar se quer sobrescrever uma chave, responda negativamente até identificar a existente.

Execute `cat "$HOME/.ssh/mini-pc-vm.pub"`. Copie **a linha pública inteira**, iniciada por `ssh-ed25519`, incluindo o valor longo. Não abra/copiem o arquivo sem `.pub`: ele é privado. Essa chave pública poderá ser colocada na VM; sua chave privada fica no host.

### Escrever `user-data` e `meta-data`

Na pasta `~/vms/mini-pc`, abra `nano user-data` ou um editor de **texto puro**. Cole o bloco abaixo, mantendo espaços e recuos. O arquivo chama-se exatamente `user-data`, sem `.txt`. Troque `CHAVE_PUBLICA_ED25519_COMPLETA` pela linha pública recém-copiada; não deixe o marcador, não coloque uma imagem de tela e não cole várias linhas da chave privada.

```yaml
#cloud-config
users:
  - name: aluno
    groups: [sudo]
    shell: /bin/bash
    sudo: ["ALL=(ALL) NOPASSWD:ALL"]
    lock_passwd: true
    ssh_authorized_keys:
      - CHAVE_PUBLICA_ED25519_COMPLETA
ssh_pwauth: false
disable_root: true
runcmd:
  - [sh, -c, 'ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub > /dev/ttyAMA0']
```

O usuário administrador sem senha de sudo é exclusivo deste laboratório, acessível via chave e encaminhamento local; ajuste privilégios para produção. `lock_passwd: true` e `ssh_pwauth: false` significam que **não há senha de login padrão**. A linha `runcmd` manda imprimir no console serial `ttyAMA0` da máquina virtual ARM a fingerprint da chave do servidor, para comparação antes do primeiro SSH. Ela ocorre **no convidado**, não acessa as partições do telefone.

No nano, Ctrl+O, Enter salva; Ctrl+X sai. Abra `nano meta-data`, cole o próximo bloco e salve do mesmo modo:

```yaml
instance-id: mini-pc-lab-01
local-hostname: mini-pc-lab
```

Então:

```bash
cloud-localds seed.img user-data meta-data
```

Essa imagem fornece dados NoCloud ao primeiro boot. Mudanças posteriores podem precisar de uma nova identidade de instância ou procedimento cloud-init específico; não apague o estado do convidado para alterar credenciais sem backup.

`cloud-localds` normalmente termina sem mensagens e cria `seed.img`. Confira `ls -lh user-data meta-data seed.img` na pasta de trabalho. Erros de arquivo não encontrado indicam nome/pasta; tabs ou indentação errada no YAML podem fazer o primeiro boot não criar o usuário. Preserve os arquivos de configuração para poder revisar a causa.

## 4. Iniciar em emulação de software

Confirme o arquivo `/usr/share/qemu-efi-aarch64/QEMU_EFI.fd` instalado pelo pacote. Se não existir, use `dpkg -L qemu-efi-aarch64` e a documentação local para identificar o firmware correto. Com todos os caminhos confirmados:

```bash
qemu-system-aarch64 \
  -machine virt,accel=tcg -cpu cortex-a72 -smp 2 -m 2048 \
  -bios /usr/share/qemu-efi-aarch64/QEMU_EFI.fd \
  -drive file=trabalho.qcow2,if=virtio,format=qcow2 \
  -drive file=seed.img,if=virtio,format=raw \
  -netdev user,id=rede,hostfwd=tcp:127.0.0.1:2222-:22 \
  -device virtio-net-pci,netdev=rede -nographic
```

`virt` define hardware virtual genérico; TCG não exige KVM; as duas imagens são arquivos; `hostfwd` publica somente em `127.0.0.1:2222`; `-nographic` permite acompanhar o console. Aguarde o boot e a inicialização do cloud-init, que podem demorar.

As barras `\` no fim das linhas são continuação de comando **no shell Linux**: preserve-as ao copiar o bloco. Execute-o estando na pasta dos discos. O terminal passa a mostrar o console da VM; não digite comandos `apt` do host nele. Uma pergunta `login:` no console não autoriza inventar senha para `aluno`: o acesso foi preparado por chave no SSH.

Espere a conclusão do cloud-init e a linha de fingerprint ED25519 impressa pelo `runcmd`. Anote o valor que começa com `SHA256:`. Se ela não aparecer, não declare a chave verificada: revise console e configuração. Num laboratório local, recuperar esse registro pela inspeção de um disco **desligado** é outra possibilidade avançada; não desative a verificação SSH como substituto.

Em outro terminal do host:

```bash
ssh -i "$HOME/.ssh/mini-pc-vm" -o IdentitiesOnly=yes -p 2222 aluno@127.0.0.1
```

Abra **uma segunda janela de terminal do host**, sem fechar QEMU. No primeiro acesso, compare a fingerprint ED25519 apresentada pelo SSH com o valor do console. Só confirme `yes` quando concordarem. Se perguntar passphrase, use a da chave **do host**; não há senha de usuário da VM nesta configuração. A mudança do cursor após a conexão indica a shell remota, mas confirme por:

```bash
whoami
cat /etc/os-release
uname -r
cloud-init status --long
mkdir -p "$HOME/projetos"
printf '%s\n' 'Arquivo dentro da VM Debian' > "$HOME/projetos/teste.txt"
cat "$HOME/projetos/teste.txt"
```

Espere a conta `aluno`, Debian 13, estado cloud-init concluído e a frase do arquivo. O convidado deve informar seu próprio kernel. Se a versão do cloud-init sinaliza erros recuperáveis ou fatais, leia a mensagem e os logs; um boot com cursor não demonstra que sua configuração foi aplicada integralmente.

## KVM, falhas, encerramento e rollback

Somente com host ARM64, `/dev/kvm` autorizado e suporte documentado, experimente `-machine virt,accel=kvm -cpu host`, mantendo os outros discos e a porta local. Falha de aceleração não significa que o binário QEMU está quebrado: TCG é a alternativa, com custo de CPU e bateria.

| Sintoma | Onde investigar | Próximo passo |
| --- | --- | --- |
| `Could not open` um disco | Terminal do host, pasta atual e `ls` | Voltar à pasta de trabalho; conferir nome/arquivo completo |
| Porta 2222 em uso | Serviço ou VM anterior no host | Encerrar a VM anterior corretamente ou usar uma porta local nova nos dois comandos |
| SSH `Connection refused` | Console do QEMU e cloud-init | Aguardar boot; verificar configuração da seed e início do SSH |
| SSH `Permission denied (publickey)` | Chave pública em user-data e chave privada passada com `-i` | Conferir a linha pública completa e usuário; não inventar uma senha padrão |
| Não aparece console/boot | Firmware UEFI, arquitetura e formato | Conferir o caminho instalado e imagem ARM64; não tratar qcow2 como kernel |
| Chave de host mudou | Overlay/instância que você iniciou | Verificar fingerprint do novo convidado antes de alterar known_hosts |

No caso de chave trocada por uma **nova VM que você criou e confirmou no console**, preserve o `known_hosts` e remova somente a entrada desse endpoint pela ferramenta SSH apropriada. Não desative `StrictHostKeyChecking` globalmente. Se o convidado nunca chegou a criar a conta, desligue a VM pelo mecanismo adequado e prepare um overlay **novo**, mantendo o anterior para diagnóstico; editar `user-data` não implica reaplicação automática numa instância já inicializada.

Encerre pela VM com `sudo poweroff`, aguarde QEMU finalizar e só então copie o overlay. Um snapshot de disco sem desligamento não garante consistência de aplicações. Para voltar ao estado inicial, preserve o overlay atual e crie outro com nome novo sobre a base verificada. Nunca use `qemu-img` para modificar um disco aberto por QEMU.

O comando `sudo poweroff` é digitado **dentro da conexão SSH da VM**, e pode fechar essa conexão; não execute-o no host por engano. Aguarde o terminal QEMU voltar ao cursor. Para o segundo boot do mesmo disco, repita o comando QEMU com os mesmos caminhos, conecte por SSH e confirme `cat "$HOME/projetos/teste.txt"`. Para backup, preserve a base e o overlay conjuntamente, pois o overlay depende dela, além da chave/configuração conforme sua política de segurança.

## Teste separado: QEMU user-mode não inicia outro sistema

Este exemplo opcional é de laboratório no **host Debian/Ubuntu ARM64** e demonstra execução de um programa x86_64, sem convidado, boot ou KVM. Não é necessário para a VM anterior. Instale as ferramentas pelo repositório do host:

```bash
sudo apt install qemu-user gcc-x86-64-linux-gnu libc6-dev-amd64-cross file
mkdir -p "$HOME/lab-qemu-user"
cd "$HOME/lab-qemu-user"
```

Abra `nano ola.c`, salve este programa de sua autoria e feche o editor:

```c
#include <stdio.h>
int main(void) {
    puts("Programa x86_64 executado por QEMU user-mode");
    return 0;
}
```

**No host, na pasta do arquivo:**

```bash
x86_64-linux-gnu-gcc -static -O2 -o ola-x86_64 ola.c
file ola-x86_64
qemu-x86_64 ./ola-x86_64
```

`file` deve identificar x86-64; QEMU deve imprimir a frase. A compilação estática evita exigir um loader glibc estrangeiro para este exemplo. Se faltar um pacote cross ou ocorrer erro de link, confira disponibilidade na distribuição e arquitetura do host; não baixe uma libc avulsa para `/system`. Execução direta de `./ola-x86_64` em ARM64 pode falhar por arquitetura, a menos que o host já tenha integração binfmt. Aqui a invocação explícita de QEMU esclarece o que está sendo feito.

O programa continua dependendo do kernel host por syscalls traduzidas. Isso não cria `/dev/kvm`, não permite Docker em PRoot sem suporte e não fornece drivers da GPU do telefone. No Android, ferramentas user-mode devem vir dos pacotes Termux apropriados e o executável alvo precisa ser compatível; este bloco `apt` não deve ser copiado para Termux.

**Teste final:** boot, SSH com chave, arquivo persistente, desligamento limpo e segundo boot. Meça tempo e temperatura; se o projeto depende de desempenho constante, a emulação pode ser o caminho inadequado. [PRoot](./proot-distro.md) atende a muitos programas sem simular uma máquina inteira; [containers](../projetos/containers.md) exigem outra cadeia de suporte.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem teste de hardware. Foram consultados [QEMU user-mode](https://www.qemu.org/docs/master/user/main.html), [máquina ARM virt](https://www.qemu.org/docs/master/system/arm/virt.html), [invocação QEMU](https://www.qemu.org/docs/master/system/invocation.html), [aceleradores](https://www.qemu.org/docs/master/system/introduction.html), [Debian Cloud](https://cloud.debian.org/images/cloud/), [listagem Debian 13](https://cloud.debian.org/images/cloud/trixie/latest/), [pacote QEMU no Debian](https://packages.debian.org/trixie/qemu-system-arm), [cross-compilador x86_64](https://packages.debian.org/trixie/gcc-x86-64-linux-gnu), [headers/libs cross](https://packages.debian.org/trixie/libc6-dev-amd64-cross), [NoCloud](https://docs.cloud-init.io/en/latest/reference/datasources/nocloud.html) e [módulos cloud-init](https://docs.cloud-init.io/en/latest/reference/modules.html). A listagem Debian foi conferida por HTTP direto, pois o leitor web não a renderizou. KVM, políticas Android, console, tempo de boot, desempenho e funcionamento das imagens precisam ser testados no laboratório real; não houve teste da VM ou dos comandos nesta revisão.
