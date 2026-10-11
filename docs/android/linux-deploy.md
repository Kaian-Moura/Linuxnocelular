---
title: Linux Deploy — avaliar uma solução legada
sidebar_position: 6
description: Requisitos, configuração verificável e limites de uma ferramenta histórica de chroot no Android.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado e estado do projeto

Linux Deploy oferece uma interface Android para criar e iniciar um ambiente GNU/Linux, normalmente por chroot na edição analisada. O Android permanece e o kernel não muda. **Dificuldade:** avançada, apesar da interface gráfica, porque os requisitos de root, montagens e segurança continuam existentes.

A página oficial de releases consultada apresenta **Linux Deploy 2.6.0, de 01/02/2020**, como última release publicada. Isso não prova inexistência de commits posteriores ou forks; demonstra que a release oficial disponível é antiga. O projeto retirou suporte a PRoot na release 2.5.0. Portanto, não apresente essa versão como opção moderna sem root para qualquer Android.

:::warning Uso legado, com validação por aparelho
Este guia serve para avaliar instalações compatíveis e documentar um caminho histórico. Não recomenda baixar APKs de repositórios de terceiros nem reutilizar mirrors antigos sem verificar se a distribuição ainda recebe atualizações. Para um novo projeto sem root, comece por [Termux](./termux.md) ou [PRoot-distro](./proot-distro.md).
:::

## Requisitos e materiais

Exija root real já configurado, compatibilidade da versão do aplicativo com seu Android, utilitários de montagem/chroot, espaço em filesystem apropriado, uma release Linux com repositórios atuais e acesso de recuperação independente. Você deve entender o [procedimento de chroot](./chroot.md), principalmente o perigo de excluir uma árvore com bind mounts.

Se root ainda não existe, [Magisk](../preparacao/root-magisk.md) é uma preparação separada, condicionada ao firmware. Não instale root só para abrir um terminal: [Termux](./termux.md) e [PRoot](./proot-distro.md) não precisam disso. Aqui a interface gráfica apenas organiza operações que continuam sendo privilegiadas.

Tenha computador com ADB autorizado para coleta de logs quando possível, backup dos dados e um perfil separado de teste. Não substitua um perfil em funcionamento. Root managers, namespaces de montagem e SELinux podem mudar o comportamento entre aparelhos que usam a mesma versão do Android.

## 1. Identificar exatamente o software utilizado

### Download e primeiro início no Android

1. No navegador **do telefone**, abra [Releases do autor meefik/linuxdeploy](https://github.com/meefik/linuxdeploy/releases). Entre na release 2.6.0 e expanda **Assets**.
2. Baixe **`linuxdeploy-2.6.0-259.apk`**, asset confirmado nesta revisão. **Source code** não é aplicativo instalável.
3. Abra **Arquivos → Downloads**, toque no APK e siga **Instalar → Abrir**. Se Android exigir autorização de origem, permita a instalação somente ao navegador/Arquivos que abriu o APK, como explicado no [guia Termux](./termux.md). Não contorne erro de incompatibilidade escolhendo um APK aleatório de outro site.
4. Quando o gerenciador de root apresentar um pedido de Linux Deploy, confira o aplicativo solicitante e a operação. Conceder acesso permite modificar arquivos e realizar montagens; não é uma permissão comum de fotos.
5. Na tela principal, observe a área de log. Anote versão do aplicativo/Android e a hora de abertura; copie o log pela função de compartilhamento/cópia que a versão oferece quando precisar diagnosticar.

O pacote esperado é `ru.meefik.linuxdeploy`. Registre também o hash do APK baixado, por exemplo com `sha256sum` depois de copiá-lo ao computador. Não confunda esse cálculo com um hash oficial não publicado. A primeira abertura do app não significa que uma distribuição já está instalada.

No **terminal do computador**, com [ADB autorizado](../preparacao/adb-fastboot.md), execute:

```bash
adb shell getprop ro.product.cpu.abilist
adb shell su -c id
adb shell getenforce
```

O primeiro comando informa as ABIs; o segundo confirma root; o terceiro informa SELinux. Esses resultados não comprovam que chroot será permitido. Não altere SELinux globalmente para passar dessa etapa.

Em ARM64, espere `arm64-v8a` entre as ABIs e `uid=0` no teste de root. Uma autorização pode aparecer na tela do telefone durante o segundo comando. Se o aplicativo ou a shell não obtêm root, não avance para instalar: anote a negativa. Um Android novo também pode rejeitar um aplicativo antigo; a release de 2020 não é uma promessa de compatibilidade em Android atual.

## 2. Criar um perfil que não toca em partições

### Criar o perfil e abrir suas propriedades

Abra o menu lateral do aplicativo e escolha **Perfis/Profiles**. Na tela de perfis, toque em **+ / Adicionar**, informe `mini-pc-lab` em **Nome do perfil**, confirme e selecione esse perfil. Volte à tela principal. Abra **Propriedades/Properties**, pelo controle de propriedades disponível na versão — em edições do aplicativo, ele pode aparecer como ícone de ajustes na barra. Não escolha **Excluir perfil** para começar um perfil novo.

Os textos abaixo foram conferidos nos recursos de interface do projeto, incluindo a tradução portuguesa. Posição e tradução podem variar entre APKs; compare o significado do campo, não apenas seu ícone.

### Configuração mínima de referência

No perfil novo, configure:

| Campo | Critério de escolha |
| --- | --- |
| Distribuição/Distribution | Debian para este exemplo; não ativar uma opção Docker esperando suporte de kernel |
| Suíte de distribuição/Distribution suite | Release ainda suportada e realmente oferecida pelo bootstrap; veja a verificação abaixo |
| URL de espelho/Source path | Mirror oficial da distribuição, por exemplo `https://deb.debian.org/debian`, quando o bootstrap dessa versão admite HTTPS |
| Arquitetura/Architecture | `arm64` quando essa opção e a ABI ARM64 foram confirmadas; não selecionar x86_64 em ARM64 por conveniência |
| Tipo de instalação/Installation type | **Diretório/Directory**, para este laboratório |
| Caminho da instalação/Installation path | `/data/local/linux-deploy-lab`, somente se ainda não existir e não tiver montagens |
| Filesystem | Suportado pelo kernel e pelo método; não formatar disco real |
| Nome de usuário/User name | `aluno`, conta de teste própria |
| Senha do usuário/User password | Definir sua senha; não publicar nem reutilizar a do Android |
| GUI e inicialização/Init | Desktop e init automático desabilitados no primeiro teste; SSH local conforme a etapa abaixo |

Não use o tipo **partição** neste tutorial. A ferramenta pode oferecer essa opção, mas o mapa de partições e a recuperação não foram identificados. Uma imagem em arquivo também requer cuidado: tamanho máximo, loop devices, ferramentas ext4 e armazenamento Android precisam ser compatíveis.

Para conferir a existência do destino sem ambiguidades de aspas entre shells, no terminal **do computador** execute `adb shell`. Na shell **Android**, execute `su`, confirme a autorização e então `ls -ld /data/local/linux-deploy-lab`. O resultado **No such file or directory**, nesse teste de existência, é o esperado para um destino novo. Saia com `exit` da shell root e depois `exit` da shell Android. Se o diretório existe, não clique em Instalar: escolha outro nome exclusivo no perfil. Na implementação consultada, instalação do tipo diretório pode **remover o conteúdo anterior do destino** antes de criar o novo sistema. Reinstalação não é atualização.

### Confirmar uma release utilizável antes da instalação

Listas de suítes e arquivos de bootstrap podem estar desatualizados no APK oficial antigo. Debian `buster` ou `stretch` não se tornam sistemas atuais por aparecerem no menu. Não selecione uma release sem manutenção como servidor conectado à rede. Para conferir suporte, consulte a [lista oficial de releases Debian](https://www.debian.org/releases/) e a documentação LTS correspondente.

Se a versão efetivamente usada oferece `bookworm` ou `trixie`, confirme o script de bootstrap, chaves e mirrors para essa suíte antes de seguir. **Não afirmamos que o APK 2.6.0 oferece automaticamente esses nomes.** Selecionar `stable` também não fixa a versão: esse alias muda e um bootstrap antigo pode falhar. Se a lista não permite uma suíte compatível e mantida, não transforme este tutorial numa instalação antiga só para obter sucesso; use [chroot com debootstrap atual](./chroot.md) ou [PRoot](./proot-distro.md).

Linux Deploy oferece importação de rootfs em suas opções, mas uma árvore importada exige criação de usuário, servidor e configuração compatíveis. Ela não deve ser trocada por uma imagem de boot. Um caminho manual reproduzível para obter essa árvore é o guia chroot; esta revisão não validou a importação de todas as versões modernas na release APK antiga.

### Habilitar SSH apenas no próprio telefone

No perfil, ative **SSH** e abra **Configurações SSH/SSH settings**. Em **Porta/Port**, use **2222**, para não conflitar com SSH Termux em 8022 ou servidor nativo em 22. Em **Opções SSH/SSH options**, a implementação consultada passa argumentos ao `sshd`; para este laboratório use:

```text
-o ListenAddress=127.0.0.1 -o PermitRootLogin=no -o PasswordAuthentication=yes
```

Esses parâmetros limitam a escuta ao loopback, impedem login direto de root e permitem a senha da conta de teste. A configuração antiga do componente SSH pode habilitar login de root por padrão; não assuma que as opções de segurança já são as desejadas. Se os argumentos não forem aceitos pela sua versão, mantenha SSH desabilitado até inspecionar sua configuração: não inicie um servidor com escuta ampla como substituto silencioso.

## 3. Revisar a operação e instalar

Volte à tela principal, confirme que o perfil selecionado é `mini-pc-lab` e revise as propriedades. Pelo menu de ações, escolha **Instalar/Install** e leia a confirmação antes de aceitar. Essa ação não é o botão INICIAR: a primeira prepara o sistema; o segundo monta/inicia um sistema já instalado.

Acompanhe o log até a conclusão. A operação deve tocar somente no destino novo escolhido. Não trate uma linha de download como prova de instalação concluída. Se aparecer erro de suíte, assinatura, TLS, montagem, execução ou criação do usuário, salve o registro e pare; não selecione outro URL arbitrário para desabilitar verificações.

Quando a instalação tiver concluído e a configuração da conta/SSH tiver sido aplicada sem erros, toque em **INICIAR/START**. Espere o log de montagem e início do SSH. Não habilite **Início automático** ainda. Se o perfil não conseguiu criar uma conta, não existe uma senha universal para adivinhar.

### Entrar pelo cliente SSH do Termux

No mesmo telefone, abra [Termux](./termux.md). Ele é usado aqui como **cliente**, e não como local de instalação dos pacotes Debian. Fora de PRoot, execute:

```bash
pkg install openssh
ssh -p 2222 aluno@127.0.0.1
```

A primeira linha instala o cliente se ainda não existe; a segunda acessa o serviço local do perfil. Ao encontrar a chave do servidor pela primeira vez, confira que o serviço/perfil esperado acabou de ser iniciado e registre a fingerprint. Não use uma opção para ignorar automaticamente mudanças de chave. Quando pedir senha, digite a **Senha do usuário** definida nas propriedades; os caracteres não aparecem. O PIN Android e `passwd` do usuário Termux são senhas de contas diferentes.

Se `Connection refused`, confira INICIAR, porta e erros no log. Se `Permission denied`, confira criação da conta `aluno` e a senha configurada; não habilite root login para contornar isso. Após conectar, você está numa shell da distribuição:

```bash
cat /etc/os-release
uname -m
uname -r
id
```

Confirme release, arquitetura e identidade. Só então atualize os índices com o gerenciador dessa distribuição — `apt update` em Debian/Ubuntu, `apk update` em Alpine — sem misturar os repositórios. Salve um arquivo e confirme sua existência após parar/reiniciar o perfil.

`id` deve mostrar `aluno`, não root. Se a conta foi configurada como administradora e `sudo` está instalado, `sudo apt update` usa a senha Linux da conta; sem sudo, volte à administração prevista do perfil, sem conceder acesso irrestrito a todo usuário. Para um teste simples que não requer privilégios:

```bash
mkdir -p "$HOME/projetos"
printf '%s\n' 'Linux Deploy: arquivo de teste' > "$HOME/projetos/teste.txt"
cat "$HOME/projetos/teste.txt"
exit
```

Espere a frase do arquivo; `exit` volta ao Termux. Toque em **PARAR/STOP** no Linux Deploy e espere os serviços pararem e montagens serem desfeitas antes de reiniciar o perfil.

## 4. Rede e desktop com controle de acesso

Antes de habilitar SSH ou VNC, confira a porta, o endereço de escuta e o método de autenticação. Um servidor iniciado com root da rootfs pode ter efeitos sobre o Android. Prefira conta comum e túnel SSH para VNC. Consulte [SSH](../projetos/ssh-remoto.md) e [desktop](./desktop.md), adaptando somente os nomes e opções confirmados no perfil.

O perfil local em 2222 não responde diretamente a outro computador por Wi-Fi: isso é uma consequência desejada de `ListenAddress=127.0.0.1`. Para acessar do notebook, configure primeiro SSH do **Termux** e o alias `mini-pc` pelo guia SSH. Um túnel no notebook, `ssh -N -L 2222:127.0.0.1:2222 mini-pc`, torna o serviço local do perfil acessível no loopback do notebook. Em outro terminal do notebook, `ssh -p 2222 aluno@127.0.0.1` acessa o perfil, com sua chave e sua senha próprias. Se 2222 já está em uso no notebook, escolha uma porta local nova e altere-a nos dois comandos.

Para desktop, comece somente depois desses testes de terminal. O campo de senha da interface histórica tem limite documentado no código de oito caracteres, ligado também ao uso VNC; isso não é uma senha forte universal para SSH exposto. Quando necessário, configure autenticação por chave e política SSH dentro da distribuição antes de acesso além deste laboratório local.

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

O campo relacionado ao caminho de utilitários aparece como **PATH variable** em inglês e pode ter tradução antiga **Diretório do BusyBox**. Ele não pede que você sobrescreva os binários de `/system`. Se faltam funções de mount/chroot, identifique o utilitário e sua origem; a escolha de uma ferramenta alternativa requer suporte documentado. A ação **Atualizar ENV** do aplicativo atualiza seu ambiente auxiliar, não o kernel nem o Android inteiro.

## Backup, rollback e testes finais

Pare os processos do perfil pela ação adequada, confirme que os pontos de montagem foram desfeitos e copie os dados pessoais. A saída limpa deve aparecer nos logs. Se a montagem está ocupada, encontre o processo que a mantém; não exclua diretórios nem imagens em uso.

Faça backup dos projetos enquanto a conta está acessível e valide a cópia. Para guardar a árvore completa, use um procedimento de arquivo com o perfil parado, root e namespace corretos, como explicado em [chroot](./chroot.md). Exportar um **perfil** nas opções do aplicativo guarda parâmetros; não deve ser tratado como backup dos arquivos Debian. Desinstalar o APK também não comprova que seus dados ou montagens foram recuperados corretamente.

Um perfil só é considerado utilizável depois de passar por instalação assinada, execução de programa, salvamento de arquivo, encerramento sem montagens restantes, reabertura e restauração de backup. Mesmo assim, seu estado é **comunitário/legado e dependente do aparelho**. Sem evidência de manutenção para sua versão Android, prefira um caminho mais atual.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem teste de hardware. Foram consultados [código e README do Linux Deploy](https://github.com/meefik/linuxdeploy), [releases/asset 2.6.0](https://github.com/meefik/linuxdeploy/releases), [textos da interface](https://github.com/meefik/linuxdeploy/blob/master/app/src/main/res/values/strings.xml), [tradução portuguesa](https://github.com/meefik/linuxdeploy/blob/master/app/src/main/res/values-pt/strings.xml), [propriedades](https://github.com/meefik/linuxdeploy/blob/master/app/src/main/res/xml/properties.xml), [menu de perfis](https://github.com/meefik/linuxdeploy/blob/master/app/src/main/res/menu/activity_profiles.xml), [implementação CLI](https://github.com/meefik/linuxdeploy-cli), [criação do destino](https://github.com/meefik/linuxdeploy-cli/blob/master/include/bootstrap/rootfs/deploy.sh) e [componente SSH](https://github.com/meefik/linuxdeploy-cli/blob/master/include/extra/ssh/deploy.sh). A versão do código atual e o conteúdo embarcado no APK antigo não são necessariamente iguais. Não foi validado um fork moderno, bootstrap atual no APK antigo ou instalação física: falta de uma suíte mantida e compatível bloqueia a instalação e encaminha para o método manual/PRoot, sem recomendar distribuição abandonada.
