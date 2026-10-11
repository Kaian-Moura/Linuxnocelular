---
title: Linux Deploy — avaliar uma solução legada
sidebar_position: 6
description: Requisitos, configuração verificável e limites de uma ferramenta histórica de chroot no Android.
last_verified: '2026-10-10'
validation: documental
---

## Resultado e estado do projeto

Linux Deploy oferece uma interface Android para criar e iniciar um ambiente GNU/Linux, normalmente por chroot na edição analisada. O Android permanece e o kernel não muda. **Dificuldade:** avançada, apesar da interface gráfica, porque os requisitos de root, montagens e segurança continuam existentes.

A página oficial de releases consultada apresenta **Linux Deploy 2.6.0, de 01/02/2020**, como última release publicada. Isso não prova inexistência de commits posteriores ou forks; demonstra que a release oficial disponível é antiga. O projeto retirou suporte a PRoot na release 2.5.0. Portanto, não apresente essa versão como opção moderna sem root para qualquer Android.

:::warning Uso legado, com validação por aparelho
Este guia serve para avaliar instalações compatíveis e documentar um caminho histórico. Não recomenda baixar APKs de repositórios de terceiros nem reutilizar mirrors antigos sem verificar se a distribuição ainda recebe atualizações. Para um novo projeto sem root, comece por [Termux](./termux.md) ou [PRoot-distro](./proot-distro.md).
:::

## Requisitos e materiais

Exija root real já configurado, compatibilidade da versão do aplicativo com seu Android, utilitários de montagem/chroot, espaço em filesystem apropriado, uma release Linux com repositórios atuais e acesso de recuperação independente. Você deve entender o [procedimento de chroot](./chroot.md), principalmente o perigo de excluir uma árvore com bind mounts.

Tenha computador com ADB autorizado para coleta de logs quando possível, backup dos dados e um perfil separado de teste. Não substitua um perfil em funcionamento. Root managers, namespaces de montagem e SELinux podem mudar o comportamento entre aparelhos que usam a mesma versão do Android.

## 1. Identificar exatamente o software utilizado

Obtenha a release somente pelo [repositório do autor](https://github.com/meefik/linuxdeploy/releases). Registre versão, hash do APK, versão Android e origem. Ao instalar, confira o identificador e as permissões concedidas. Abra os logs do aplicativo e guarde uma cópia antes de modificar o perfil.

No Android, se ADB estiver autorizado:

```bash
adb shell getprop ro.product.cpu.abilist
adb shell su -c id
adb shell getenforce
```

O primeiro comando informa as ABIs; o segundo confirma root; o terceiro informa SELinux. Esses resultados não comprovam que chroot será permitido. Não altere SELinux globalmente para passar dessa etapa.

## 2. Criar um perfil que não toca em partições

As opções da interface variam por versão e idioma. No perfil novo, configure:

| Campo | Critério de escolha |
| --- | --- |
| Distribuição e release | Release suportada cuja URL e assinatura você verificou |
| Arquitetura | Compatível com ABI e kernel; não selecionar x86_64 em ARM64 por conveniência |
| Tipo de instalação | Diretório dedicado ou imagem em arquivo, conforme suporte documentado |
| Caminho | Local novo, exclusivo e com espaço; nunca `/dev/block/...` |
| Filesystem | Suportado pelo kernel e pelo método; não formatar disco real |
| Usuário e senha | Conta própria de teste; senha única e sem publicação em logs |
| Interface inicial | Terminal ou SSH controlado; desktop apenas após a base funcionar |

Não use o tipo **partição** neste tutorial. A ferramenta pode oferecer essa opção, mas o mapa de partições e a recuperação não foram identificados. Uma imagem em arquivo também requer cuidado: tamanho máximo, loop devices, ferramentas ext4 e armazenamento Android precisam ser compatíveis.

## 3. Revisar a operação e instalar

Revise o resumo do perfil e os logs antes de escolher a ação de instalação. A operação deve criar somente o diretório ou arquivo escolhido. Se o aplicativo mostra uma release sem suporte ou um mirror inválido, interrompa: não substitua por um URL arbitrário que fornece pacotes sem assinatura.

Após instalação, inicie o perfil e abra um terminal pelo mecanismo configurado. Execute:

```bash
cat /etc/os-release
uname -m
uname -r
id
```

Confirme release, arquitetura e identidade. Só então atualize os índices com o gerenciador dessa distribuição — `apt update` em Debian/Ubuntu, `apk update` em Alpine — sem misturar os repositórios. Salve um arquivo e confirme sua existência após parar/reiniciar o perfil.

## 4. Rede e desktop com controle de acesso

Antes de habilitar SSH ou VNC, confira a porta, o endereço de escuta e o método de autenticação. Um servidor iniciado com root da rootfs pode ter efeitos sobre o Android. Prefira conta comum e túnel SSH para VNC. Consulte [SSH](../projetos/ssh-remoto.md) e [desktop](./desktop.md), adaptando somente os nomes e opções confirmados no perfil.

Não desative firewall ou autorizações do servidor X para resolver conexão. Se a interface gráfica depende de uma sessão Android, ela continuará dependendo do ciclo de vida do aplicativo e das políticas de bateria.

## Falhas e alternativas

| Falha | Evidência necessária | Decisão |
| --- | --- | --- |
| Instalação não baixa pacotes | URL, release, erro TLS/assinatura | Corrigir fonte verificável ou abandonar esse perfil |
| Montagem não é visível | Shell e namespace que fizeram a montagem | Manter operação no mesmo namespace; não relaxar segurança às cegas |
| `Permission denied` | Caminho, filesystem, negativa SELinux | Diagnosticar política; PRoot é alternativa |
| BusyBox incompatível | Versão e opção que falhou | Consultar ferramenta específica, não sobrescrever `/system` |
| Desktop encerra | Logs do servidor e da sessão Android | Validar terminal primeiro e reduzir processos |

O README histórico menciona técnicas ligadas a SuperSU, BusyBox e Android antigo. Não replique instruções de escrita em `/system/xbin` ou alterações globais no Android atual como se fossem requisitos universais.

## Backup, rollback e testes finais

Pare os processos do perfil pela ação adequada, confirme que os pontos de montagem foram desfeitos e copie os dados pessoais. A saída limpa deve aparecer nos logs. Se a montagem está ocupada, encontre o processo que a mantém; não exclua diretórios nem imagens em uso.

Um perfil só é considerado utilizável depois de passar por instalação assinada, execução de programa, salvamento de arquivo, encerramento sem montagens restantes, reabertura e restauração de backup. Mesmo assim, seu estado é **comunitário/legado e dependente do aparelho**. Sem evidência de manutenção para sua versão Android, prefira um caminho mais atual.

## Fontes e verificação

Revisão documental: **10/10/2026**. [Código e README do Linux Deploy](https://github.com/meefik/linuxdeploy), [releases e histórico](https://github.com/meefik/linuxdeploy/releases), [implementação CLI](https://github.com/meefik/linuxdeploy-cli). Não foi verificado um fork moderno para cada fabricante nem executada instalação física deste aplicativo nesta revisão.
