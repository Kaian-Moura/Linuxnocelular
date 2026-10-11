---
title: "Aula prática: Debian com desktop sobre Android"
description: Instale uma instância Debian identificada, abra uma única sessão XFCE pelo Termux:X11 e aprenda a salvar, exportar, encerrar e retomar.
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Nesta aula, seu Android vai executar um **Debian em PRoot**, com uma conta chamada `aluno` e um desktop XFCE exibido pelo aplicativo **Termux:X11**. Você terminará abrindo um editor gráfico, salvando um documento, exportando uma cópia para Downloads e retomando o mesmo desktop em outro momento.

O Android continua instalado e controla os drivers e a energia. Isso **não** inicia Debian no lugar do Android, nem transforma o XFCE em sessão nativa de boot. É uma forma de experimentar aplicações Linux sem root. A instalação de Linux nativo é [outro caminho, condicionado ao modelo](../escolha/index.mdx).

Usaremos **uma rota gráfica**: servidor Termux:X11 no Termux, XFCE dentro do Debian. Não iniciaremos XFCE do próprio Termux nem VNC. Dificuldade: iniciante/intermediária depois da [primeira aula Termux](primeiro-projeto-termux.md). Reserve aproximadamente **60–120 minutos**, mais o tempo de download; não é promessa de duração ou desempenho.

## Preparação e pontos de parada

Para acompanhar, tenha:

- Android **8 ou posterior**, requisito publicado pelo [Termux:X11](https://github.com/termux/termux-x11#setup-instructions), com tela utilizável e permissão para instalar o APK.
- Termux da origem que você já escolheu, funcionando: `pkg` deve executar e seus projetos devem ter backup. A aula anterior utiliza F-Droid.
- Internet para baixar a distribuição e os pacotes; espaço para a instalação **e** os backups. Reservar ao menos 5 GB livres é uma orientação para começar este exercício, não um tamanho garantido: confirme os totais oferecidos pelo instalador.
- Bateria suficiente ou alimentação estável, telefone ventilado e tempo para deixar os downloads terminarem. Quatro GB de RAM dão mais margem para esta prática leve; não são requisito universal do PRoot.

Teclado físico, mouse, monitor, root e notebook são opcionais. Faça primeiro o teste na tela Android. Um desktop que aparece aqui não comprova HDMI, aceleração Adreno/Mali, câmera ou suspensão de um Linux nativo.

Se já tem um desktop Linux ativo sobre Android, salve seus documentos e encerre-o pelo método que você utilizou antes. Não misture este exercício com outra sessão em andamento. A instância desta aula terá nome próprio, **`debian-aula`**, para não substituir uma instalação chamada `debian`.

### Reconheça os três lugares

| Rótulo nesta aula | Onde você digita | Como confirmar |
| --- | --- | --- |
| **Termux** | Aplicativo Termux, fora do Debian | `command -v proot-distro` encontra a ferramenta; `pkg` pertence a este ambiente |
| **Debian, administrador simulado** | Shell aberta por `proot-distro login debian-aula` | `cat /etc/os-release` identifica Debian; `whoami` mostra `root` |
| **Debian, aluno** | Shell aberta com `--user aluno` ou terminal do desktop | `whoami` mostra `aluno`; pasta pessoal é `/home/aluno` |

O `root` simulado organiza permissões e instalação **dentro do ambiente**; não concede root Android nem isolamento forte. Um arquivo compartilhado com o ambiente pode continuar acessível aos processos do aplicativo. O [guia PRoot](../android/proot-distro.md) explica essa distinção.

Não copie blocos para um lugar diferente do rótulo. Se perdeu o fio, use `whoami` e `cat /etc/os-release` no Debian; para retornar ao Termux de uma shell Debian ociosa, use `exit`. Não use `exit` numa operação de pacote ainda em andamento.

## 1. Prepare e identifique o PRoot-distro

Abra **Termux no telefone**. Antes de atualizar, confira se já existe uma instalação da ferramenta:

```bash
command -v proot-distro
```

Se um caminho aparece, **antes de `pkg upgrade`**, consulte a versão e os ambientes na implementação que você já usa:

```bash
apt-cache policy proot-distro
proot-distro list
proot-distro backup --help
```

Anote nomes/versão, salve e encerre sessões e faça backup dos ambientes importantes pelo [procedimento da versão instalada](../android/proot-distro.md). Confira a cópia externa. Se não consegue inventariar ou preservar um ambiente existente, pare aqui; atualização não deve ser usada para descobrir o que havia nele. Se a primeira consulta não encontrou a ferramenta e você nunca a instalou, continue com a preparação abaixo.

Com o inventário e os backups necessários prontos, execute uma linha por vez, confirmando apenas as transações que você solicitou:

```bash
pkg update
pkg upgrade
pkg install proot-distro procps
df -h "$HOME"
apt-cache policy proot-distro
proot-distro install --help
proot-distro login --help
proot-distro list
```

`procps` fornece ferramentas de consulta de processos usadas no encerramento. `apt-cache policy` consulta a versão do pacote Termux, sem instalar Debian. O último comando mostra a lista conforme a implementação instalada.

**Pare para ler as duas ajudas.** Em 11/10/2026, o projeto atual documenta instalação de imagens OCI, enquanto a série anterior utiliza aliases de distribuições. A versão empacotada no seu aparelho pode ser diferente do código atual. [Documentação atual](https://github.com/termux/proot-distro) e [documentação da série 4.35.0](https://github.com/termux/proot-distro/blob/v4.35.0/README.md) descrevem essas duas interfaces.

| O que a ajuda local descreve | Escolha na etapa 2 |
| --- | --- |
| Imagem/`IMAGE`, referências com tag e opção `--name` | **2A: OCI atual** |
| Alias/`DISTRO` da lista e opção `--override-alias` | **2B: catálogo legado** |
| Outra interface ou opções ausentes | Não instale por tentativa; use o guia da versão instalada |

A implementação atual também pode aceitar `--override-alias` por compatibilidade; **a presença dessa opção sozinha não identifica a versão antiga**. Leia o tipo de entrada aceito. Na ajuda de `login`, confirme as opções **`--user`**, **`--shared-tmp`** e **`--bind`**, utilizadas nesta aula.

**Atenção após atualizar de uma versão antiga:** a listagem atual mostra o layout `containers`; um ambiente legado ainda em `installed-rootfs` pode não aparecer até o primeiro `login`, que o migra. Portanto, ausência na lista **não prova que seus arquivos não existem**. Compare com o inventário anterior. Para uma instância conhecida, preservada e com migração aplicável, siga [Legacy migration](https://github.com/termux/proot-distro#legacy-migration): entre pelo nome já registrado, espere terminar e confira os arquivos; não instale outro ambiente com esse nome. Falha ou inventário ausente exige investigar pelo [guia PRoot](../android/proot-distro.md), sem `remove/reset` nem renomear diretórios manualmente.

**Checkpoint 1:** você anotou a versão do pacote, sabe qual bloco de instalação utilizar e confirmou que `debian-aula` não é uma instância nova ou legada já existente com seus arquivos. Se existe, identifique-a antes: para retomar uma aula anterior concluída, vá à etapa 10; não use `reset`.

## 2. Instale uma única instância Debian

### 2A. Se a ajuda local aceita imagens OCI

**No Termux, apenas neste caminho:**

```bash
proot-distro install --name debian-aula debian:trixie
```

`debian:trixie` escolhe a imagem oficial Debian dessa release, em vez de uma tag `latest` que pode mudar de distribuição no futuro. `--name` define o nome local usado nos próximos comandos. O [registro oficial das imagens Debian](https://github.com/docker-library/official-images/blob/master/library/debian) publicava a tag e suas arquiteturas na data desta revisão.

Deixe o programa selecionar a arquitetura adequada. Não force x86_64 num telefone ARM para tentar resolver um download: isso mudaria o exercício para emulação. A imagem OCI é apenas a fonte do filesystem neste procedimento; não há daemon Docker executando.

Uma tag pode receber novas reconstruções. Anote referência e versão obtidas; para reprodução estrita, também registre o digest exibido/metadados da imagem, conforme a versão do gerenciador.

### 2B. Se a ajuda local utiliza o catálogo legado

**No Termux, apenas neste caminho:**

```bash
proot-distro list
proot-distro install --override-alias debian-aula debian
```

Execute a instalação **somente se** `debian` aparece como distribuição disponível e a ajuda confirma `--override-alias`. Aqui `debian` é o alias do catálogo, e `debian-aula` é o nome dado à cópia. A release vem desse catálogo; não se seleciona `debian:trixie` como se fosse a interface OCI.

A série consultada publicava Debian trixie. Sua versão instalada pode fornecer outra release: vamos conferi-la na etapa 3. Não substitua os repositórios APT por trixie para “corrigir” um catálogo antigo; isso seria uma migração de release, fora desta aula.

### Verificação comum aos dois caminhos

Quando **a única instalação escolhida** terminar, ainda no Termux:

```bash
proot-distro list
proot-distro login debian-aula
```

O nome `debian-aula` deve constar como instalado. `login` muda para uma shell dentro do Debian. Algumas etapas de extração ficam sem percentual por um tempo; texto parado não autoriza apagar dados. Em caso de erro, preserve a mensagem e confira rede/espaço antes de tentar de novo.

**Checkpoint 2:** você entrou na distribuição, sem executar o outro bloco de instalação. Um erro “já instalado” não é pedido para remover o ambiente; consulte a lista e identifique o que existe.

## 3. Confira Debian e instale os componentes do desktop

**Agora dentro do Debian, como administrador simulado:**

```bash
cat /etc/os-release
whoami
dpkg --print-architecture
df -h /
```

**Saída fictícia parcial para o caminho OCI; não copie como comando:**

```text
ID=debian
VERSION_CODENAME=trixie
root
arm64
```

Os comandos produzem saídas separadas. Sua arquitetura pode ser outra. `/etc/os-release` precisa identificar Debian; para OCI desta aula, a release deve ser trixie. Para o catálogo legado, registre a release real e confirme que ainda recebe suporte Debian antes de instalar; uma release diferente tem versões/menus possivelmente diferentes. Não troque `/etc/apt/sources.list` por uma lista de outra release.

Na **mesma shell Debian**:

```bash
apt update
apt upgrade
apt install --no-install-recommends ca-certificates adduser xfce4 xfce4-terminal dbus-x11 mousepad fonts-dejavu-core x11-utils
```

Não use `pkg` aqui. Não é necessário `sudo` nesta shell, que já é o administrador simulado.

`apt update` atualiza índices; `apt upgrade` apresenta atualizações da imagem. Confira o tamanho e espere terminar. O comando de instalação acrescenta:

| Pacote | Por que precisamos dele |
| --- | --- |
| `xfce4` | Sessão, painel, gerenciador de janelas e demais componentes básicos XFCE |
| `xfce4-terminal` | Terminal que você abrirá pelo desktop |
| `dbus-x11` | `dbus-launch` para a comunicação entre componentes da sessão |
| `mousepad` | Editor gráfico para nosso documento |
| `fonts-dejavu-core` | Fontes básicas para apresentar texto |
| `x11-utils` | `xdpyinfo` para verificar a conexão ao servidor gráfico |
| `adduser` | Criação da conta de trabalho |
| `ca-certificates` | Certificados das conexões HTTPS utilizadas por ferramentas |

`--no-install-recommends` mantém este exercício menor e evita tratar um servidor Xorg convencional recomendado como obrigatório: o servidor de imagem será Termux:X11. Isso também significa que componentes opcionais de um Debian desktop completo não estão incluídos.

Confirme:

```bash
command -v xfce4-session
command -v dbus-launch
command -v mousepad
command -v xdpyinfo
```

**Checkpoint 3:** os quatro comandos mostram caminhos. Se APT falhou, resolva o erro real antes de continuar; uma linha posterior encontrar algum programa não comprova que a transação inteira terminou.

## 4. Crie o usuário para o trabalho diário

**Ainda no Debian, administrador simulado:**

```bash
adduser aluno
```

Esse é o nome concreto da conta desta aula. Quando perguntar a senha, digite uma senha sua e Enter; caracteres e asteriscos podem **não aparecer**. Repita na confirmação. Anote-a de forma protegida se precisar, sem colocá-la no arquivo de prática.

Nos campos opcionais de nome completo e outros dados, Enter aceita o valor vazio/padrão. Confira o resumo e confirme quando correto. Se o comando diz que a conta já existe, consulte-a abaixo; não apague nem recrie sua pasta pessoal por tentativa.

```bash
id aluno
getent passwd aluno
ls -ld /home/aluno
mkdir -p /mnt/aula-exportada
exit
```

A conta e `/home/aluno` devem existir. `/mnt/aula-exportada` é um diretório vazio preparado para a exportação posterior. `exit` retorna **ao Termux**.

`proot-distro login --user aluno` não funciona como uma tela de login normal: o gerenciador escolhe a identidade simulada, sem pedir essa senha. Isso não transforma a conta numa barreira forte contra outros processos PRoot. Também não estamos configurando SSH, internet pública ou um display manager.

**Checkpoint 4:** você voltou ao Termux e existe uma conta `aluno` no Debian. Não tente instalar o APK do próximo passo por `apt`.

## 5. Instale as duas partes do Termux:X11

O projeto exige **um aplicativo Android e um pacote no Termux**. Instalar apenas um deles não basta.

### Parte Android: APK oficial regular

1. **No navegador do telefone**, abra a [release nightly oficial](https://github.com/termux/termux-x11/releases/tag/nightly). Confira `termux/termux-x11` no endereço.
2. Expanda **Assets** e selecione **`termux-x11-universal-debug.apk`**. É o APK regular indicado pelo projeto. Não baixe **Source code**, `.deb` nem o APK com `sharedUid` no nome para esta aula.
3. Quando o download terminar, abra **Arquivos → Downloads**, toque no APK e use o instalador Android. Se precisar, permita instalação apenas ao navegador/Arquivos utilizado, como na [aula anterior](primeiro-projeto-termux.md).
4. Abra **Termux:X11** pelo novo ícone. Em Android 13 ou mais recente, autorize notificações quando solicitado para acessar os controles oferecidos.

Agora há dois ícones: **Termux** e **Termux:X11**. Uma tela vazia ou sem cliente conectado nesta etapa é esperada: ainda não iniciamos a sessão.

A variante `sharedUid` tem requisitos próprios, incluindo Termux de origem GitHub. O APK regular evita misturar essa variante com o Termux F-Droid usado na aula inicial. Nightly é uma linha de desenvolvimento: registre a data/build baixado e confira a documentação da release ao atualizar.

### Parte Termux: servidor gráfico

Volte ao ícone **Termux**. Confira que está fora do Debian e execute:

```bash
pkg install x11-repo
pkg update
pkg install termux-x11-nightly
command -v termux-x11
apt-cache policy termux-x11-nightly
```

`x11-repo` habilita o repositório gráfico **do Termux**; `termux-x11-nightly` instala o comando auxiliar. **Não instale `xfce` no Termux nesta aula**: o XFCE já está dentro do Debian.

O `command -v` deve mostrar o comando do servidor. Se APK e pacote auxiliar vêm de builds incompatíveis, revise ambos pelo procedimento do projeto, preservando dados. Não baixe bibliotecas de uma distribuição diferente para resolver essa incompatibilidade.

**Checkpoint 5:** os dois ícones existem e o comando `termux-x11` existe no Termux. Ainda não há VNC nem segundo desktop.

## 6. Conecte o servidor à sessão Debian

Antes de abrir, **no Termux**, consulte:

```bash
pgrep -af termux-x11
```

Se não há servidor correspondente, o comando pode não imprimir nada; isso é normal. Se já existe uma sessão sua, identifique-a e encerre corretamente antes de continuar. Não abra outro servidor em `:1` para contornar um erro de display ocupado.

Quando a sessão anterior está encerrada, **no Termux**:

```bash
termux-x11 :1 > "$HOME/termux-x11-aula.log" 2>&1 &
proot-distro login --shared-tmp --user aluno debian-aula
```

`:1` é o número da tela X; `&` deixa **apenas o servidor** em segundo plano. O redirecionamento guarda a saída para diagnóstico e substitui o log de um teste anterior com esse nome; preserve-o antes se precisar investigar aquele teste. Não contém um comando de flash.

O segundo comando abre Debian como `aluno` e compartilha a pasta temporária para que os processos encontrem o socket X. Socket é um ponto de comunicação entre programas; aqui ele liga os aplicativos Debian ao servidor Termux:X11.

**Agora no Debian, como aluno:**

```bash
whoami
ls -l /tmp/.X11-unix
export DISPLAY=:1
xdpyinfo | head -n 12
```

`whoami` deve mostrar `aluno`. A listagem deve permitir identificar o socket de `X1`, e `xdpyinfo` deve mostrar informações do display sem `unable to open display`. O conteúdo exato varia. `DISPLAY` vale nesta shell e indica a tela à qual conectar; não é uma senha.

Se essa consulta falha, vá ao diagnóstico antes de iniciar o desktop. Não use `xhost +` para remover controles de acesso indiscriminadamente.

Na **mesma shell Debian**:

```bash
dbus-launch --exit-with-session xfce4-session
```

Este comando inicia o desktop e permanece ligado à sessão. **Não espere o prompt voltar para abrir a imagem.** Use o seletor de aplicativos recentes do Android e toque em **Termux:X11**.

Espere painel, fundo e janelas XFCE. Se a primeira execução perguntar entre configuração padrão e painel vazio, escolha **Use default config/Usar configuração padrão**. O layout e idioma dependem da release.

**Checkpoint 6:** aparece um desktop, há um único XFCE desta aula, e você consegue mover o ponteiro/tocar um item. A shell que iniciou `xfce4-session` continua ocupada; não cole comandos nela durante o uso.

## 7. Use o desktop para produzir um documento

### Entrada e apresentação

No modo touchpad do Termux:X11, arrastar move o ponteiro; toque clica; dois dedos podem clicar com o botão direito e rolar. O botão **Voltar do Android** alterna o teclado de tela do aplicativo. Confira o [guia de gestos do projeto](https://github.com/termux/termux-x11#touch-gestures) para o modo selecionado.

Se tiver teclado e mouse físicos já reconhecidos pelo Android, clique dentro da janela antes de digitar. A tecla funcionar aqui verifica o encaminhamento do Android ao aplicativo, não os drivers USB de um postmarketOS instalado.

Para paisagem, habilite rotação no Android e vire o aparelho, quando a interface suportar. Se fontes ficaram grandes demais, abra **Applications/Aplicativos → Settings/Configurações → Appearance/Aparência** e registre o tamanho/DPI antes de ajustar. Comece com uma mudança pequena; não troque kernel para corrigir escala.

### Abra um terminal dentro do XFCE

Use o ícone de terminal no painel ou **Applications → System → Xfce Terminal**, conforme o menu. Esse terminal já é **Debian como aluno**. Execute:

```bash
whoami
cat /etc/os-release
mkdir -p "$HOME/Documentos"
mousepad "$HOME/Documentos/pratica-debian.txt"
```

`aluno` e Debian confirmam que esta janela não é o terminal Termux. `mkdir` prepara uma pasta de documentos, e `mousepad` abre o editor gráfico. A shell pode ficar ocupada enquanto essa janela está aberta.

No editor, digite três linhas suas. Por exemplo, **texto fictício para o documento**:

```text
Meu desktop Debian abriu sobre Android.
Consegui escrever, usar acentos e salvar um arquivo.
Na próxima aula vou abrir este mesmo documento.
```

Pressione **Ctrl+S** ou use **File/Arquivo → Save/Salvar**. Se perguntar o local, confirme **`/home/aluno/Documentos/pratica-debian.txt`**. Se esse arquivo já existe de uma aula anterior, leia-o e acrescente uma linha em vez de apagar o conteúdo.

Feche o editor pela janela; se perguntar sobre salvar alterações, confira o arquivo e escolha salvar. Volte ao terminal gráfico:

```bash
cat "$HOME/Documentos/pratica-debian.txt"
```

As três linhas devem aparecer. Abra o gerenciador de arquivos pelo ícone **Home/Pasta pessoal** e navegue até **Documentos**. Abra `pratica-debian.txt` por duplo clique e confira o conteúdo, usando “Abrir com Mousepad” se a associação não foi configurada.

**Checkpoint 7:** você salvou pela interface e leu pelo terminal. Teste também letras, Shift, Backspace, clique e rolagem antes de instalar aplicações maiores.

Não instalaremos navegador, GNOME ou áudio nesta prática: esses recursos têm requisitos adicionais. O documento salvo já verifica a rota inteira **Android → Termux:X11 → sessão Debian → aplicativo → arquivo persistente**.

## 8. Encerre corretamente antes de exportar

Salve e feche seu documento e o terminal gráfico. No menu XFCE, procure **Log Out/Sair/Encerrar sessão**; no diálogo, escolha **Log Out/Encerrar sessão**, sem solicitar desligar/reiniciar o Android. Nesta aula, não é uma sessão controlada por um display manager.

Volte ao aplicativo Termux. O comando de sessão deve ter terminado, e a shell **Debian, aluno** volta a mostrar o prompt. Execute:

```bash
exit
```

Você voltou ao **Termux**. Fechar apenas a atividade Termux:X11 não encerra necessariamente seu servidor. Consulte:

```bash
pgrep -af termux-x11
```

Se a consulta identifica somente o servidor que você abriu para esta aula, e todos os documentos/sessões correspondentes já estão encerrados, use o método do projeto:

```bash
pkill -f termux-x11
pgrep -af termux-x11
```

`pkill -f` atinge **todos os processos que correspondem ao padrão**, não somente um número de display. Não use esse encerramento se você mantém outro trabalho Termux:X11 ativo. Neste exercício, tínhamos um servidor e uma sessão. A segunda consulta deve deixar de apresentar o servidor correspondente; sem correspondência, retornar sem texto não significa uma falha a corrigir.

**Checkpoint 8:** você está no Termux, os arquivos estão salvos e a sessão gráfica terminou. Não limpou dados de nenhum aplicativo.

## 9. Exporte o documento e faça backup

### Prepare uma pasta de troca no Termux

**No Termux:** se a aula anterior já preparou armazenamento e `ls "$HOME/storage/shared/Download"` funciona, não precisa repetir `termux-setup-storage`. Caso ainda não exista:

```bash
termux-setup-storage
```

Confirme o acesso solicitado no Android, conforme [armazenamento no Termux](../android/termux.md). Depois:

```bash
ls "$HOME/storage/shared/Download"
mkdir -p "$HOME/storage/shared/Download/aula-debian"
proot-distro login --user aluno --bind "$HOME/storage/shared/Download/aula-debian:/mnt/aula-exportada" debian-aula
```

`--bind` apresenta **somente essa pasta de troca** no caminho `/mnt/aula-exportada` do Debian. O primeiro lado é uma pasta Android acessível ao Termux; o segundo é um caminho dentro do Debian. O compartilhamento permite escrever nos dois lados e não constitui isolamento de segurança.

**Agora no Debian, aluno:**

```bash
cp -i "$HOME/Documentos/pratica-debian.txt" /mnt/aula-exportada/
cmp "$HOME/Documentos/pratica-debian.txt" /mnt/aula-exportada/pratica-debian.txt
echo $?
exit
```

`cp -i` pede confirmação se já existe um destino; confirme substituição somente quando a intenção for atualizar a cópia. `cmp` compara os arquivos; se são iguais, não mostra texto e o `echo $?` **imediatamente posterior** deve mostrar `0`. Qualquer erro precisa ser investigado; não conclua a exportação pela presença de um arquivo antigo.

`exit` retorna ao Termux. Abra **Arquivos Android → Downloads → aula-debian**. O documento deve estar ali e conter o texto salvo. Esse arquivo é uma cópia: editar no Debian depois não o atualiza automaticamente.

### Backup da instância completa

Com a sessão gráfica encerrada e fora de todas as shells dessa instância, **no Termux**:

```bash
proot-distro backup --help
```

Confirme que sua versão aceita `--output`. Os dois caminhos de instalação desta aula documentam esse parâmetro. Havendo espaço para o arquivo, na mesma shell:

```bash
aula_debian_backup="$HOME/storage/shared/Download/aula-debian/debian-aula-$(date +%Y%m%d-%H%M%S).tar.gz"
proot-distro backup --output "$aula_debian_backup" debian-aula
tar -tzf "$aula_debian_backup" > "$HOME/debian-aula-conteudo-backup.txt"
sed -n '1,15p' "$HOME/debian-aula-conteudo-backup.txt"
sha256sum "$aula_debian_backup"
```

O nome inclui data/hora para conservar versões; o comando de listagem escreve um arquivo de consulta, e `sed` mostra apenas seu início. O **layout do arquivo** varia entre versões PRoot-distro: não procure um único prefixo como prova universal. Confira na listagem a presença dos arquivos da instância, incluindo seu documento, e a ausência de erro de arquivo truncado.

Copie o backup e o documento para um destino **fora do telefone**, seguindo o procedimento MTP/backup da [aula anterior](primeiro-projeto-termux.md). Compare SHA256 das cópias. Uma cópia no mesmo aparelho não protege contra perda do hardware.

**Não teste `restore` em cima de `debian-aula`:** a implementação atual pode substituir uma instância com o nome contido no arquivo. Um backup válido ainda precisa de teste de restauração numa instalação de laboratório separada, com versão/layout conferidos; veja [backup e restauração do PRoot](../android/proot-distro.md). Nesta aula, a validação realizada pelo leitor é a listagem íntegra e a exportação comparada do documento, não uma restauração completa presumida.

**Checkpoint 9:** você exportou uma cópia idêntica, sabe qual arquivo é o backup da instância e preservou-o fora do aparelho. Não apagou nem sobrescreveu a distribuição para “testar” o backup.

## 10. Reabra amanhã sem reinstalar

Abra **Termux**. Se fez logout/encerramento da etapa 8, a sessão anterior terminou. Após um reinício Android, os processos precisam ser iniciados outra vez; os arquivos persistem se os dados dos aplicativos não foram apagados.

**No Termux:**

```bash
proot-distro list
pgrep -af termux-x11
```

Confirme `debian-aula` instalada e ausência de outro servidor que ocupe esta aula. Se você atualizou o gerenciador desde a última sessão e a instância sumiu da lista, retorne às condições de migração da etapa 1; não reinstale por cima. Se existe sessão ativa sua, use-a ou encerre-a conscientemente, em vez de duplicá-la.

Quando o servidor está encerrado, **no Termux**:

```bash
termux-x11 :1 > "$HOME/termux-x11-aula.log" 2>&1 &
proot-distro login --shared-tmp --user aluno debian-aula
```

**Dentro do Debian, aluno:**

```bash
export DISPLAY=:1
dbus-launch --exit-with-session xfce4-session
```

Abra **Termux:X11**, entre na pasta Documentos pelo gerenciador e abra `pratica-debian.txt`. As linhas anteriores devem continuar ali. Acrescente uma linha, salve e repita a exportação quando quiser atualizar a cópia Android.

**Checkpoint 10:** o desktop abre novamente e o documento anterior existe. Você não repetiu instalação, criação de usuário ou escrita por cima dos arquivos.

Isso é inicialização **manual de um ambiente sobre Android**. Não configuramos boot automático porque primeiro precisamos validar esse ciclo. A continuidade com tela apagada depende das [políticas Android de energia e processos](../android/termux.md); um wake lock ou exceção de bateria não elimina todos os limites do fabricante.

## Diagnóstico: volte ao último checkpoint que passou

Quando o desktop não abriu, descubra primeiro qual etapa falhou. Não instale outra rota gráfica por cima desta.

| Sintoma | Verificação concreta | Retorno ao procedimento |
| --- | --- | --- |
| `pkg` não existe | Você está em Debian, ADB ou outro terminal? | Volte ao Termux para instalar ferramentas Termux |
| `install` rejeita tag/`--name` | Leia `proot-distro install --help` | Use somente o bloco que corresponde à interface local |
| Download não tem sua arquitetura | Confira `uname -m` no Termux, ajuda e mensagem da imagem | Investigue suporte sem forçar x86; emulação é outra aula |
| `debian-aula` já existe | Consulte a lista e os arquivos da instância | Retome a instalação identificada; não use `remove/reset` como reparo |
| APT diz pacote não encontrado | Confira Debian/release e se `apt update` terminou | Corrija índice/rede/origem na mesma release; não misture repositórios |
| APT informa assinatura inválida | Confira data/hora, origem e erro completo | Preserve verificação; não use flags de permitir pacotes não autenticados |
| `user aluno does not exist` | Consulte `id aluno` na shell administrativa dessa instância | Conclua criação de usuário no Debian correto |
| `termux-x11: command not found` | Digitação ocorreu no Termux? pacote auxiliar instalado? | Complete a parte Termux da etapa 5 |
| `Server is already active for display 1` | Consulte `pgrep -af termux-x11` no Termux | Identifique/encerre a sessão antiga; não apague locks de um servidor vivo |
| `unable to open display` | `DISPLAY=:1`, servidor vivo e socket `X1` acessível? | Reabra `login` com `--shared-tmp` após salvar/sair; confira log |
| Só fundo/cursor, sem painel | `xdpyinfo` passou? `xfce4-session` apresentou erro? | Leia a saída da shell Debian; confirme pacotes/D-Bus antes de iniciar outra sessão |
| Imagem preta mesmo com servidor acessível | Sintoma documentado Termux:X11 | Faça o teste dirigido abaixo, depois de encerrar a sessão anterior |
| Cores trocadas | Sintoma específico de apresentação | Veja `-force-bgra` no guia profundo; não some parâmetros aleatórios |
| Editor não recebe teclado | Clique no campo, confira teclado Android/mode do aplicativo | Teste entrada pequena antes de tratar layout/XKB |
| Tudo encerra ao trocar de aplicativo | Registre horário, RAM, estado da tela e mensagem de sinal | Reduza carga, revise política de bateria; não é prova de defeito no Debian |
| Documento não aparece em Arquivos Android | Foi exportado para a pasta compartilhada? `cmp` passou? | Repita etapa 9; home Debian não é Downloads Android |

### Como consultar sem digitar na shell ocupada

Se a linha de `xfce4-session` continua executando, abra **uma sessão nova no Termux** pelo menu lateral: deslize da borda esquerda para a direita e use **NEW SESSION/Nova sessão**, quando apresentado. Essa sessão nova começa no Termux; confirme o ambiente. Use-a somente para consultas:

```bash
pgrep -af termux-x11
tail -n 60 "$HOME/termux-x11-aula.log"
```

Não inicie um segundo desktop nela. Os logs podem conter detalhes pessoais; revise antes de publicá-los. Para corrigir ou repetir a rota, salve os documentos e encerre a sessão original como na etapa 8.

### Teste dirigido para tela preta

O projeto documenta `-legacy-drawing` para certos aparelhos com tela preta/cursor. **Somente após salvar, sair do desktop e encerrar o servidor anterior**, no Termux:

```bash
termux-x11 :1 -legacy-drawing > "$HOME/termux-x11-aula.log" 2>&1 &
proot-distro login --shared-tmp --user aluno debian-aula
```

Repita **apenas** `export DISPLAY=:1` e a linha `dbus-launch` no Debian como aluno, depois abra Termux:X11. Se resolver, registre a opção e use-a no próximo início. Se não resolver, preserve a saída real e avance no [diagnóstico do desktop Android](../android/desktop.md), sem apresentar esse parâmetro como correção de HDMI ou GPU.

Avisos sobre systemd/logind/energia podem refletir serviços não presentes neste ambiente. Não tente iniciar GDM ou reiniciar o Android com `systemctl` para conseguir abrir Mousepad. Este exercício usa uma sessão X11 diretamente; [containers e virtualização](../android/virtualizacao.md) têm requisitos diferentes.

## Retorno e remoção, se você não quiser manter a aula

Para simplesmente voltar ao Android, salve e faça logout do desktop, saia da shell e encerre o servidor como na etapa 8. Não alteramos partições ou bootloader; não há imagem de firmware a regravar.

Se quiser liberar espaço apagando **a instância da aula**, primeiro confirme:

1. Nenhuma sessão dessa instância está ativa.
2. O documento e backup necessário estão fora do telefone e foram conferidos.
3. `proot-distro list` identifica exatamente `debian-aula` como o ambiente que deseja apagar.
4. Você entende que programas, contas e arquivos internos dessa instância serão removidos.

Somente depois, **no Termux**, `proot-distro remove debian-aula` é o comando de remoção dessa instância, conforme a ajuda da versão instalada. Ele não significa “fechar o desktop” e não deve ser executado como teste. Não precisa remover Termux ou seus projetos para encerrar este exercício.

## Resultado, limites e próximos passos

A aula está concluída quando você passa o ciclo **abrir → editar → salvar → exportar → sair → reabrir** sem reinstalar e distingue os comandos Termux dos comandos Debian. A instalação e o backup completos precisam das verificações físicas/localmente executadas pelo leitor; a redação não presumiu resultados no aparelho.

Agora consulte [PRoot em profundidade](../android/proot-distro.md) para arquivos, atualização e limites; [desktop Android](../android/desktop.md) para diagnóstico e outras rotas **escolhidas separadamente**; e [desenvolvimento](../projetos/desenvolvimento.md) para programas de terminal. Se quer remover Android e iniciar diretamente num desktop, retorne à [decisão por compatibilidade](../escolha/index.mdx).

## Referências e limites da verificação

Revisão **documental em 11/10/2026**, sem execução dos comandos no telefone. Foram consultados o código/documentação das interfaces e os pacotes da release. Instalação real, recursos do kernel Android, entrada, apresentação, temperatura e persistência com tela apagada continuam dependentes do dispositivo.

- [PRoot-distro atual](https://github.com/termux/proot-distro), [parser das opções atuais](https://github.com/termux/proot-distro/blob/master/proot_distro/parser.py) e [interface legada 4.35.0](https://github.com/termux/proot-distro/blob/v4.35.0/README.md).
- [Tags e arquiteturas das imagens Debian oficiais](https://github.com/docker-library/official-images/blob/master/library/debian).
- [Pacote Debian trixie: XFCE](https://packages.debian.org/trixie/xfce4), [D-Bus X11](https://packages.debian.org/trixie/dbus-x11) e [Mousepad](https://packages.debian.org/trixie/mousepad).
- [Debian: adduser](https://manpages.debian.org/trixie/adduser/adduser.8.en.html).
- [Termux:X11: instruções, PRoot, apresentação e encerramento](https://github.com/termux/termux-x11/blob/master/README.md) e [APK nightly oficial](https://github.com/termux/termux-x11/releases/tag/nightly).
- [XFCE: sessão](https://docs.xfce.org/xfce/xfce4-session/4.20/start), [logout](https://docs.xfce.org/xfce/xfce4-session/4.20/logout), [terminal](https://docs.xfce.org/apps/xfce4-terminal/4.20/start), [Mousepad](https://docs.xfce.org/apps/mousepad/start) e [Thunar](https://docs.xfce.org/xfce/thunar/start).
