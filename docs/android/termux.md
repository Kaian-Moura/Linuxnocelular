---
title: Termux — primeiro ambiente de terminal
sidebar_position: 2
description: Instale e valide um ambiente Linux sobre Android, com pacotes, backup e diagnóstico de processos.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Visão geral, dificuldade e compatibilidade

**Resultado:** terminal com ferramentas compiladas para Android, mantendo seu sistema e seus aplicativos. **Dificuldade:** inicial. **Root:** dispensável. O suporte completo aos pacotes atuais do Termux requer Android 7 ou mais recente conforme a documentação consultada; aparelhos antigos podem executar uma versão do aplicativo sem receber um conjunto de pacotes atualizado.

Você precisará conseguir abrir aplicativos e confirmar permissões na tela do telefone, além de internet, armazenamento livre e uma fonte confiável de instalação. Aqui, conseguir desbloquear **a tela** com seu PIN não significa desbloquear o bootloader. Não é preciso modificar o bootloader nem instalar [Magisk](../preparacao/root-magisk.md).

Se nunca utilizou terminal, leia [primeiros passos](../comece-aqui/terminal-primeiros-passos.md). `pwd` mostra o diretório atual, `ls` lista arquivos e `cd` muda de diretório. Os comandos desta página são digitados **no aplicativo Termux do telefone**, e não no PowerShell do notebook, num terminal Linux nativo ou numa distribuição PRoot. Não copie o símbolo `$` que possa aparecer antes do cursor.

## 1. Escolher a origem do aplicativo

Use a página de [instalação do projeto](https://github.com/termux/termux-app#installation), que direciona às distribuições do F-Droid, GitHub e à variante da Google Play. A versão da Play tem desenvolvimento e limitações próprias: não repita a afirmação histórica de que qualquer versão da Play é necessariamente a mesma edição antiga abandonada.

Termux e extensões que compartilham sua identidade precisam de assinaturas compatíveis. Não misture APK do Termux de uma origem com Termux:API ou Termux:Boot de outra. A edição compartilhada do Termux:X11 tem restrições adicionais explicadas no [guia de desktop](./desktop.md).

:::warning Desinstalar apaga o ambiente privado
Se já utiliza Termux, exporte seus projetos antes de trocar a origem do APK. A tela de confirmação de desinstalação não faz backup da pasta privada do aplicativo. Uma atualização com assinatura incompatível não se resolve apagando os dados primeiro.
:::

### Caminho A: F-Droid, com atualizações pelo cliente

Este é um caminho concreto para uma instalação nova:

1. No navegador **do telefone**, entre em [f-droid.org](https://f-droid.org/) e toque em **Download F-Droid/Baixar F-Droid**. Aguarde o download do APK do cliente.
2. Abra a notificação de download ou **Arquivos → Downloads** e toque no APK. Se aparecer um bloqueio de instalação, toque em **Configurações** no aviso e permita **Instalar apps desconhecidos** para o navegador ou aplicativo Arquivos que abriu esse arquivo. Volte ao instalador e toque em **Instalar**, depois **Abrir**. Essa autorização é da fonte específica; não habilite todas as fontes.
3. No cliente F-Droid, aguarde terminar a atualização inicial do catálogo, usando internet. Se a lista está vazia, atualize o catálogo pela ação de atualizar disponível na interface antes de pesquisar.
4. Toque na busca, procure **Termux** e confira que a página corresponde ao pacote `com.termux`. A [página oficial no catálogo F-Droid](https://f-droid.org/en/packages/com.termux/) permite conferir nome, descrição e requisitos.
5. Escolha **Instalar**. Quando Android pedir permissão para o F-Droid instalar aplicativos, conceda-a ao F-Droid e retorne. Confirme a instalação do Termux e escolha **Abrir**.

Você também pode baixar o APK sugerido diretamente da página F-Droid do Termux, pelo botão **Download APK** na seção de versões. Isso dispensa instalar o cliente, mas não oferece o mesmo acompanhamento de atualizações; registre a versão e volte à origem para atualizá-la. Não confunda o botão que baixa **F-Droid** com aquele que baixa **Termux**.

### Caminho B: APK publicado pelo próprio Termux no GitHub

No navegador do telefone, abra [Releases de termux/termux-app](https://github.com/termux/termux-app/releases). Entre numa release estável, expanda **Assets** e leia os nomes. Escolha o APK de aplicativo compatível com sua versão Android. Quando houver o asset **universal** da variante `apt-android-7`, ele evita escolher manualmente uma arquitetura; não é o ZIP **Source code**. Instale pelo fluxo **Downloads → APK → Instalar → Abrir** explicado acima.

Não instale a edição GitHub sobre a edição F-Droid sem verificar assinaturas e preservar os dados. O erro de pacote conflitante pode indicar justamente essa mistura. As instruções oficiais alertam ainda para não baixar os APKs GitHub fora do projeto: a confiança envolve também a origem da publicação, não apenas o nome do arquivo.

### Primeiro início e resultado esperado

Ao abrir Termux pela primeira vez, aguarde a preparação do ambiente básico. O resultado é uma tela de terminal com texto e um cursor, frequentemente após um símbolo `$`. Não surge automaticamente um desktop ou uma distribuição Ubuntu: isso é esperado.

Toque na área do terminal para mostrar o teclado Android. Em geral há uma linha de teclas extras, como **ESC**, **CTRL** e **ALT**. Para Ctrl+C, toque em **CTRL** e depois em `c`; num teclado físico, mantenha Ctrl pressionado e pressione C. Use essa combinação para interromper um programa em primeiro plano, e não para confirmar a instalação de um pacote.

Se a preparação falhar, guarde a mensagem exata e confirme rede e espaço antes de tocar em limpar dados. A limpeza apaga o ambiente. Se a tela do telefone é inutilizável, siga [tela quebrada](../preparacao/tela-quebrada.md): instalar por ADB exige autorização já possível e não elimina as confirmações necessárias.

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

Digite uma linha e pressione **Enter**, aguarde o cursor voltar e passe à próxima. Quando aparecer `Do you want to continue? [Y/n]`, leia a lista e digite `y` apenas para confirmar a operação que você solicitou. Um prompt sobre uma configuração já alterada é diferente: preserve sua configuração quando não entende a mudança e anote o arquivo para revisá-lo. Não copie uma resposta `yes` repetidamente para toda pergunta.

**Verificação:** execute `python --version`, `git --version` e `ssh -V`. Se o download falhar, confirme rede, data/hora e mensagem exata. Consulte os repositórios oficiais e utilize `termux-change-repo` para selecionar um mirror oferecido pelo projeto. Não corrija erro de assinatura desativando a verificação.

Se `pkg: command not found` aparece num shell que diz Ubuntu/Debian, você está no ambiente errado: saia com `exit` até voltar ao Termux. Se isso ocorre no primeiro início de um Termux realmente novo, investigue falha do bootstrap e origem do APK; não adicione repositórios Debian para criar o comando.

## 3. Criar um projeto e entender o armazenamento

```bash
mkdir -p "$HOME/projetos/primeiro"
cd "$HOME/projetos/primeiro"
printf '%s\n' 'print("Meu smartphone executa Python")' > ola.py
python ola.py
```

A saída esperada é a frase do programa. `mkdir -p` cria o diretório; o comando `printf` escreve apenas esse novo arquivo. Faça seus projetos em `$HOME`: o armazenamento compartilhado do Android não oferece todas as propriedades de um filesystem Linux, como permissões e links simbólicos.

Para aprender a editar em vez de escrever pelo comando, execute `nano ola.py`. O editor abre o arquivo. Altere a frase entre aspas; pressione **Ctrl+O** para salvar, **Enter** para confirmar o nome e **Ctrl+X** para sair. No teclado de tela, a tecla extra CTRL permite essas combinações. Execute `python ola.py` outra vez: a frase nova comprova que você salvou e executou seu próprio arquivo. Python é o programa; `ola.py` é o arquivo na pasta atual.

Para copiar arquivos ao espaço compartilhado, execute:

```bash
termux-setup-storage
ls "$HOME/storage/shared"
```

Conceda a permissão solicitada pelo Android quando apropriado. A pasta vinculada depende das políticas da sua versão. Não extraia uma rootfs Linux nela apenas porque há mais espaço. Copie somente os documentos que deseja compartilhar.

No pedido de acesso, permita o acesso a arquivos necessário para esse recurso; nome e alcance da permissão variam por Android. Depois execute `ls "$HOME/storage/shared/Download"`: deve listar Downloads, possivelmente vazio. Se receber `Permission denied`, abra **Configurações Android → Aplicativos → Termux → Permissões**, confira a permissão solicitada e tente novamente. Não execute `chmod` em todo o armazenamento do Android.

Para ver o arquivo de exemplo fora do Termux:

```bash
cp "$HOME/projetos/primeiro/ola.py" "$HOME/storage/shared/Download/ola-termux.py"
```

Abra o aplicativo **Arquivos**, entre em **Downloads** e procure `ola-termux.py`. Essa é uma cópia: editar uma delas não altera automaticamente a outra.

## 4. Fazer backup verificável

Após a permissão de armazenamento:

```bash
cd "$HOME"
tar -czf "$HOME/storage/shared/Download/projetos-termux.tar.gz" projetos
tar -tzf "$HOME/storage/shared/Download/projetos-termux.tar.gz"
sha256sum "$HOME/storage/shared/Download/projetos-termux.tar.gz"
```

O arquivo contém a pasta `projetos`, não uma cópia de todo o sistema. Um arquivo com esse nome já existente será substituído; use um novo nome para conservar backups antigos. O comando de listagem deve mostrar `projetos/primeiro/ola.py`, entre outros arquivos, sem erro de arquivo truncado.

Abra **Arquivos → Downloads**, selecione `projetos-termux.tar.gz` e copie-o para seu computador por USB/MTP ou outro destino de backup. Confira o checksum lá. Um arquivo deixado apenas no mesmo telefone não protege contra perda do aparelho. Mantenha chaves e credenciais em backup separado e protegido; não publique o arquivo.

Para testar a restauração **no Termux**, escolha uma pasta de teste ainda não usada:

```bash
mkdir "$HOME/restauracao-termux-teste"
tar -xzf "$HOME/storage/shared/Download/projetos-termux.tar.gz" -C "$HOME/restauracao-termux-teste"
python "$HOME/restauracao-termux-teste/projetos/primeiro/ola.py"
```

Se `mkdir` informa que a pasta já existe, escolha outro nome em todas as linhas; não extraia sobre projetos em uso. A frase do programa confirma a recuperação básica. Esses comandos extraem somente o arquivo produzido por você; não extraia um arquivo desconhecido como receita de instalação.

## 5. Processos em segundo plano e energia

O Android pode encerrar processos mesmo quando o terminal parece estar funcionando, especialmente sob pressão de memória, limites de processos e políticas do fabricante. Uma mensagem de sinal 9 não prova falha do Python ou do PRoot.

Durante uma operação curta que precisa continuar com a tela apagada, `termux-wake-lock` solicita manter a CPU acordada; finalize com `termux-wake-unlock`. Isso aumenta o consumo e não impede todas as políticas do Android. Ajuste as permissões de bateria do aplicativo pela interface do fabricante e teste o comportamento com a tela apagada, mantendo o aparelho ventilado.

Não copie comandos ADB que alteram limites globais de processos sem entender a versão e o efeito. Primeiro reduza processos, feche desktops duplicados e consulte os logs disponíveis. Um telefone com Android não recebe as mesmas garantias de disponibilidade de um servidor Linux dedicado.

Na interface Android, procure **Configurações → Aplicativos → Termux → Bateria**. Se há opções como **Sem restrições/Não otimizar**, você pode usá-las para um teste controlado e registrar o nome da opção no seu aparelho. Não há uma sequência idêntica em todas as marcas. Faça uma tarefa pequena, apague a tela por alguns minutos, volte e observe se o processo continuou. Se não continuou, o teste identificou uma limitação a tratar; root não é automaticamente a solução.

## Erros, alternativas e rollback

| Sintoma | Verificação | Ação segura |
| --- | --- | --- |
| APK não instala | Origem e assinatura dos aplicativos existentes | Backup; escolher uma família de APKs compatível |
| Download é ZIP e não abre como aplicativo | Nome termina em `.zip`/`.tar.gz` ou diz Source code | Voltar aos Assets e baixar o APK correto |
| Android diz que o APK não é compatível | Versão Android, variante e arquitetura do asset | Conferir os requisitos publicados; não forçar instalação de arquitetura errada |
| Pacote não existe | `pkg search NOME` | Buscar nome real; não adicionar repositório Debian ao Termux |
| Script dá `Permission denied` | Diretório e permissões | Executar projeto no `$HOME`, identificar a política que bloqueia |
| Programa desaparece | Hora do encerramento, RAM e estado da tela | Teste menor; tratar restrições do Android |
| Falta glibc para um binário Linux | `file ARQUIVO`, arquitetura e loader esperado | Compilar para Termux ou usar [PRoot](./proot-distro.md) |

Para desfazer apenas a instalação de um pacote, `pkg uninstall NOME` mostra a transação: revise o que será removido. Faça backup antes. Não use uma limpeza recursiva no diretório do aplicativo como estratégia de reparo.

## Testes finais e próximos passos

Confirme o programa de exemplo, a presença de seus arquivos depois de fechar/reabrir o aplicativo e a restauração do backup em uma pasta separada. Em seguida, use o [ambiente de desenvolvimento](../projetos/desenvolvimento.md) ou [SSH](../projetos/ssh-remoto.md). Instalar PRoot é opcional; o Termux por si só já pode atender ao seu objetivo.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem teste de hardware. Foram consultadas [instalação e restrições do Termux](https://github.com/termux/termux-app#installation), [releases do aplicativo](https://github.com/termux/termux-app/releases), [catálogo F-Droid do Termux](https://f-droid.org/en/packages/com.termux/), [cliente F-Droid](https://f-droid.org/), [repositórios de pacotes](https://github.com/termux/termux-packages), [código de termux-setup-storage](https://github.com/termux/termux-tools) e [políticas de energia do Android](https://developer.android.com/training/monitoring-device-state/doze-standby). Os nomes dos menus de permissões e bateria precisam ser confirmados na versão do fabricante; isso não altera a distinção entre o APK Android e os comandos dentro do Termux.
