---
title: QEMU, emulação e virtualização
sidebar_position: 7
description: Diferencie emulação de programas, máquinas virtuais completas e aceleração KVM antes de escolher esse caminho.
last_verified: '2026-10-10'
validation: documental
---

## O que muda e resultado esperado

**Dificuldade:** avançada. **Resultado de referência:** uma VM Debian ARM64 com disco em arquivo e SSH encaminhado ao loopback de um host Linux compatível. Não instala Debian nas partições do telefone. O tutorial foi revisado documentalmente, não executado em todos os kernels móveis.

QEMU tem funções diferentes. **User-mode** executa um programa de outra arquitetura, traduzindo instruções e syscalls para o host; ele não inicia um kernel convidado. **System emulation** simula uma máquina completa e inicia outro kernel. **TCG** faz tradução em software e pode ser lento. **KVM** aproveita virtualização do processador, mas exige suporte do kernel, firmware e acesso autorizado a `/dev/kvm`. O chip anunciar virtualização não garante KVM utilizável no Android.

Um Linux ARM64 nativo de telefone pode executar QEMU e continuar sem KVM. No Android, Termux pode disponibilizar builds de QEMU: confirme por `pkg search qemu`, arquitetura, firmware e opções locais. Não instale um pacote Debian diretamente no Termux. O procedimento reproduzível abaixo utiliza um **host Debian/Ubuntu ARM64**, que pode ser um telefone com port nativo apropriado ou uma máquina de laboratório; não é receita universal para um Android bloqueado.

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

## 2. Obter uma imagem oficial e criar disco de trabalho

Acesse o [diretório de imagens cloud do Debian 13](https://cloud.debian.org/images/cloud/trixie/latest/) e escolha o arquivo **genericcloud ARM64 qcow2**, não uma imagem Azure/EC2/amd64. O nome disponível na revisão foi `debian-13-genericcloud-arm64.qcow2`. Baixe também `SHA512SUMS` e consulte a publicação Debian sobre origem/assinaturas: um checksum baixado do mesmo lugar detecta corrupção, mas sozinho não é prova independente de autenticidade.

Salve os arquivos no diretório `~/vms/mini-pc` e confira a entrada correspondente:

```bash
mkdir -p "$HOME/vms/mini-pc"
cd "$HOME/vms/mini-pc"
sha512sum --check --ignore-missing SHA512SUMS
qemu-img info debian-13-genericcloud-arm64.qcow2
qemu-img create -f qcow2 -F qcow2 -b "$HOME/vms/mini-pc/debian-13-genericcloud-arm64.qcow2" trabalho.qcow2
```

O overlay armazena mudanças e mantém a imagem base preservada. Não mova ou altere a base enquanto o overlay a referencia. Caso o diretório oficial mude o nome ou a estrutura, pare e adapte somente após conferir a listagem real.

## 3. Preparar acesso por cloud-init

Gere uma chave no host se ainda não possuir uma adequada: `ssh-keygen -t ed25519 -f "$HOME/.ssh/mini-pc-vm"`, somente se esse caminho e seu `.pub` não existirem. Caso escolha outro nome, use-o também no comando SSH abaixo. Proteja a chave privada com passphrase. Copie **a linha pública do arquivo `.pub`** para o campo abaixo. Crie `user-data` com este conteúdo:

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
```

Substitua o marcador pela chave real; não coloque chave privada. O usuário administrador sem senha de sudo é exclusivo deste laboratório, acessível apenas via a chave e o encaminhamento local; ajuste privilégios para um servidor de produção. Crie `meta-data`:

```yaml
instance-id: mini-pc-lab-01
local-hostname: mini-pc-lab
```

Então:

```bash
cloud-localds seed.img user-data meta-data
```

Essa imagem fornece dados NoCloud ao primeiro boot. Mudanças posteriores podem precisar de uma nova identidade de instância ou procedimento cloud-init específico; não apague o estado do convidado para alterar credenciais sem backup.

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

Em outro terminal do host:

```bash
ssh -i "$HOME/.ssh/mini-pc-vm" -o IdentitiesOnly=yes -p 2222 aluno@127.0.0.1
```

Confira a fingerprint por um canal de console confiável, não desative a checagem da host key. Dentro da VM, execute `uname -r`, `cat /etc/os-release` e `cloud-init status --long`. O convidado deve informar seu próprio kernel.

## KVM, falhas, encerramento e rollback

Somente com host ARM64, `/dev/kvm` autorizado e suporte documentado, experimente `-machine virt,accel=kvm -cpu host`, mantendo os outros discos e a porta local. Falha de aceleração não significa que o binário QEMU está quebrado: TCG é a alternativa, com custo de CPU e bateria.

Se o SSH não sobe, verifique boot, cloud-init, chave pública e conflito na porta 2222. Se não há console, revise firmware e arquitetura. Uma imagem cloud não costuma oferecer senha padrão: a preparação anterior é necessária.

Encerre pela VM com `sudo poweroff`, aguarde QEMU finalizar e só então copie o overlay. Um snapshot de disco sem desligamento não garante consistência de aplicações. Para voltar ao estado inicial, preserve o overlay atual e crie outro com nome novo sobre a base verificada. Nunca use `qemu-img` para modificar um disco aberto por QEMU.

**Teste final:** boot, SSH com chave, arquivo persistente, desligamento limpo e segundo boot. Meça tempo e temperatura; se o projeto depende de desempenho constante, a emulação pode ser o caminho inadequado. [PRoot](./proot-distro.md) atende a muitos programas sem simular uma máquina inteira; [containers](../projetos/containers.md) exigem outra cadeia de suporte.

## Fontes e verificação

Revisão documental: **10/10/2026**. [QEMU user-mode](https://www.qemu.org/docs/master/user/main.html), [máquina ARM virt](https://www.qemu.org/docs/master/system/arm/virt.html), [aceleradores QEMU](https://www.qemu.org/docs/master/system/introduction.html), [Debian Cloud](https://cloud.debian.org/images/cloud/), [NoCloud](https://docs.cloud-init.io/en/latest/reference/datasources/nocloud.html). A listagem Debian foi conferida por HTTP direto; disponibilidade KVM e desempenho no aparelho permanecem verificações locais obrigatórias.
