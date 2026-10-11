---
title: Termux — primeiro ambiente de terminal
sidebar_position: 2
description: Instale e valide um ambiente Linux sobre Android, com pacotes, backup e diagnóstico de processos.
last_verified: '2026-10-10'
validation: documental
---

## Visão geral, dificuldade e compatibilidade

**Resultado:** terminal com ferramentas compiladas para Android, mantendo seu sistema e seus aplicativos. **Dificuldade:** inicial. **Root:** dispensável. O suporte completo aos pacotes atuais do Termux requer Android 7 ou mais recente conforme a documentação consultada; aparelhos antigos podem executar uma versão do aplicativo sem receber um conjunto de pacotes atualizado.

Você precisará do telefone desbloqueado para instalar o APK e conceder permissões, internet, armazenamento livre e uma fonte confiável de instalação. Aprenda três comandos antes de começar: `pwd` mostra o diretório atual, `ls` lista arquivos e `cd` muda de diretório. Pressionar Ctrl+C interrompe um programa em primeiro plano.

## 1. Escolher a origem do aplicativo

Use a página de [instalação do projeto](https://github.com/termux/termux-app#installation), que direciona às distribuições do F-Droid, GitHub e à variante da Google Play. A versão da Play tem desenvolvimento e limitações próprias: não repita a afirmação histórica de que qualquer versão da Play é necessariamente a mesma edição antiga abandonada.

Termux e extensões que compartilham sua identidade precisam de assinaturas compatíveis. Não misture APK do Termux de uma origem com Termux:API ou Termux:Boot de outra. A edição compartilhada do Termux:X11 tem restrições adicionais explicadas no [guia de desktop](./desktop.md).

:::warning Desinstalar apaga o ambiente privado
Se já utiliza Termux, exporte seus projetos antes de trocar a origem do APK. A tela de confirmação de desinstalação não faz backup da pasta privada do aplicativo. Uma atualização com assinatura incompatível não se resolve apagando os dados primeiro.
:::

Instale o APK obtido da fonte escolhida, abra o aplicativo e aguarde a preparação inicial. Não é necessário desbloquear bootloader, usar Fastboot ou alterar partições.

## 2. Registrar e atualizar a base

**Execute no Termux, sem `sudo`:**

```bash
termux-info
uname -m
df -h "$HOME"
pkg update
pkg upgrade
pkg install git openssh python nano
```

`termux-info` reúne versões e origem dos repositórios. `df` informa o espaço livre da área em que trabalhará. `pkg update` atualiza os índices; `pkg upgrade` apresenta as atualizações instaláveis. Leia os prompts sobre arquivos de configuração existentes. O último comando instala ferramentas de versionamento, SSH, Python e editor; não instala uma distribuição separada.

**Verificação:** execute `python --version`, `git --version` e `ssh -V`. Se o download falhar, confirme rede, data/hora e mensagem exata. Consulte os repositórios oficiais e utilize `termux-change-repo` para selecionar um mirror oferecido pelo projeto. Não corrija erro de assinatura desativando a verificação.

## 3. Criar um projeto e entender o armazenamento

```bash
mkdir -p "$HOME/projetos/primeiro"
cd "$HOME/projetos/primeiro"
printf '%s\n' 'print("Meu smartphone executa Python")' > ola.py
python ola.py
```

A saída esperada é a frase do programa. `mkdir -p` cria o diretório; o comando `printf` escreve apenas esse novo arquivo. Faça seus projetos em `$HOME`: o armazenamento compartilhado do Android não oferece todas as propriedades de um filesystem Linux, como permissões e links simbólicos.

Para copiar arquivos ao espaço compartilhado, execute:

```bash
termux-setup-storage
ls "$HOME/storage/shared"
```

Conceda a permissão solicitada pelo Android quando apropriado. A pasta vinculada depende das políticas da sua versão. Não extraia uma rootfs Linux nela apenas porque há mais espaço. Copie somente os documentos que deseja compartilhar.

## 4. Fazer backup verificável

Após a permissão de armazenamento:

```bash
cd "$HOME"
tar -czf "$HOME/storage/shared/Download/projetos-termux.tar.gz" projetos
tar -tzf "$HOME/storage/shared/Download/projetos-termux.tar.gz"
sha256sum "$HOME/storage/shared/Download/projetos-termux.tar.gz"
```

O arquivo contém a pasta `projetos`, não uma cópia de todo o sistema. Transfira-o para outro local e confira o checksum lá. Para validar a restauração sem sobrescrever o original, crie um diretório de teste e extraia o arquivo nele com `tar -xzf ARQUIVO -C DIRETORIO`. Substitua os nomes pelos caminhos confirmados. Mantenha backups de chaves e credenciais separados, criptografados; não publique esses arquivos.

## 5. Processos em segundo plano e energia

O Android pode encerrar processos mesmo quando o terminal parece estar funcionando, especialmente sob pressão de memória, limites de processos e políticas do fabricante. Uma mensagem de sinal 9 não prova falha do Python ou do PRoot.

Durante uma operação curta que precisa continuar com a tela apagada, `termux-wake-lock` solicita manter a CPU acordada; finalize com `termux-wake-unlock`. Isso aumenta o consumo e não impede todas as políticas do Android. Ajuste as permissões de bateria do aplicativo pela interface do fabricante e teste o comportamento com a tela apagada, mantendo o aparelho ventilado.

Não copie comandos ADB que alteram limites globais de processos sem entender a versão e o efeito. Primeiro reduza processos, feche desktops duplicados e consulte os logs disponíveis. Um telefone com Android não recebe as mesmas garantias de disponibilidade de um servidor Linux dedicado.

## Erros, alternativas e rollback

| Sintoma | Verificação | Ação segura |
| --- | --- | --- |
| APK não instala | Origem e assinatura dos aplicativos existentes | Backup; escolher uma família de APKs compatível |
| Pacote não existe | `pkg search NOME` | Buscar nome real; não adicionar repositório Debian ao Termux |
| Script dá `Permission denied` | Diretório e permissões | Executar projeto no `$HOME`, identificar a política que bloqueia |
| Programa desaparece | Hora do encerramento, RAM e estado da tela | Teste menor; tratar restrições do Android |
| Falta glibc para um binário Linux | `file ARQUIVO`, arquitetura e loader esperado | Compilar para Termux ou usar [PRoot](./proot-distro.md) |

Para desfazer apenas a instalação de um pacote, `pkg uninstall NOME` mostra a transação: revise o que será removido. Faça backup antes. Não use uma limpeza recursiva no diretório do aplicativo como estratégia de reparo.

## Testes finais e próximos passos

Confirme o programa de exemplo, a presença de seus arquivos depois de fechar/reabrir o aplicativo e a restauração do backup em uma pasta separada. Em seguida, use o [ambiente de desenvolvimento](../projetos/desenvolvimento.md) ou [SSH](../projetos/ssh-remoto.md). Instalar PRoot é opcional; o Termux por si só já pode atender ao seu objetivo.

## Fontes e verificação

Revisão documental: **10/10/2026**. [Instalação e restrições do Termux](https://github.com/termux/termux-app#installation), [repositórios de pacotes](https://github.com/termux/termux-packages), [código de termux-setup-storage](https://github.com/termux/termux-tools), [políticas de energia do Android](https://developer.android.com/training/monitoring-device-state/doze-standby). Esses procedimentos não foram executados em todos os telefones.
