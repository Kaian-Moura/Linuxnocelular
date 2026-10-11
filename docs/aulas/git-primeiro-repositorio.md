---
title: 'Git: seu primeiro histórico de versões'
description: Crie um repositório local de exercício, compare mudanças, conserve versões e recupere uma cópia sem apagar seu trabalho.
sidebar_position: 15
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai produzir um caderno de projeto com **duas versões guardadas**, criar uma experiência separada e recuperar um texto antigo para um arquivo novo. Isso ensina uma habilidade útil antes de personalizar Linux: saber o que mudou, por que mudou e como consultar o estado anterior.

**Dificuldade:** primeiros passos, após entender arquivos e terminal. **Materiais:** Git, editor, uma pasta nova e espaço para um backup. **Resultado:** histórico local e um pacote de histórico cuja recuperação pode ser ensaiada em outro diretório. Não precisa de conta GitHub, internet durante o exercício ou root. Git não instala Linux, não faz backup de todas as partições e não conserva automaticamente arquivos que você não registrou.

## 1. Prepare a ferramenta no ambiente escolhido

Abra o terminal **onde seus arquivos serão produzidos**: Termux, Linux do telefone ou computador. Se entrou por SSH, os comandos executam no destino, não na máquina que exibe a janela. Consulte `pwd`, `whoami` e `git --version` antes de instalar algo. Se Git já mostra versão, não instale uma segunda cópia por outro método.

Quando precisar instalar, escolha **somente o bloco do seu ambiente**:

```bash
# Termux, fora do PRoot
pkg update
pkg install git nano
```

```bash
# Debian/Ubuntu nativo, com administração já configurada
sudo apt update
sudo apt install git nano
```

```bash
# Alpine/postmarketOS da release correta, com sudo já configurado
sudo apk update
sudo apk add git nano
```

Em Debian PRoot administrativo, a instalação é feita sem `sudo` dentro daquela instância. Em Linux nativo com `doas`, siga a ferramenta administrativa do port; não instale mecanismos de privilégio só para copiar o exemplo. A [instalação de aplicativos](../desktop/instalar-aplicativos.md) explica consulta, confirmações e fontes. Antes de atualizar um Termux com ambientes existentes, preserve seus backups, conforme [PRoot](../android/proot-distro.md).

**Windows:** abra [instalação oficial do Git](https://git-scm.com/install/windows), selecione o pacote para a arquitetura do computador e siga o instalador indicado. Leia escolhas de PATH, editor e terminal; não precisa instalar servidor SSH nem alterar firewall para esta aula. Depois abra **Git Bash** pelo menu Iniciar: os blocos do exercício usam Bash, não PowerShell. Confira `git --version`. Nano pode estar disponível nessa instalação; se `nano --version` não funciona, use um editor já conhecido para criar os mesmos arquivos UTF-8 sem extensão `.txt` adicional. Veja [primeira aula de arquivos](../comece-aqui/terminal-primeiros-passos.md).

**macOS:** consulte [as opções oficiais](https://git-scm.com/install/mac) e escolha uma compatível com a versão/arquitetura do Mac. `xcode-select --install` abre a instalação das ferramentas Apple quando aplicável. Conclua a janela e confira `git --version` no Terminal. Não substitua executáveis do sistema manualmente. A presença de Git no Mac não significa que ele existe no telefone.

Utilize **Git 2.28 ou posterior** para a opção `git init -b` desta aula; `git switch` e `git restore` também precisam existir. Repositórios com versões muito antigas exigem documentação daquela versão ou atualização pelo fornecedor correto. Não transforme `command not found` em um problema de bootloader.

**Checkpoint 1:** a versão aparece e você sabe qual máquina e shell vai usar. Git só precisará modificar a pasta de exercício.

## 2. Crie uma pasta realmente nova

No terminal escolhido:

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/caderno-git"
cd "$HOME/projetos/caderno-git"
pwd
ls -la
```

O primeiro comando permite que `projetos` já exista. O segundo deve criar **uma pasta nova**. Se informar que `caderno-git` existe, pare e examine: para retomar, siga a etapa 10; para outro exercício, escolha outro nome em todas as instruções. Não apague uma pasta para conseguir prosseguir.

Numa pasta vazia, inicie o histórico:

```bash
git init -b main
git status
```

Git prepara `.git`, uma pasta de metadados oculta que registra o histórico. `main` é o nome que **esta aula escolheu** para a primeira branch; outras instalações podem ter nomes diferentes. Branch é uma linha de versões, não uma cópia completa visível numa segunda pasta. [Inicialização](https://git-scm.com/docs/git-init).

Não faça `git init` na pasta pessoal inteira ou em `/etc`. A fronteira do repositório deve ser só seu projeto. Para conferir:

```bash
git rev-parse --show-toplevel
```

O resultado deve terminar em `caderno-git`. Se mostra outro repositório, resolva o contexto antes de adicionar arquivos.

## 3. Identifique commits sem cadastrar uma conta

Um commit guarda autoria e mensagem. Essas informações **não autenticam** no GitHub e podem aparecer quando o histórico for compartilhado. Nesta pasta de laboratório, configuraremos uma identidade fictícia local:

```bash
git config --local user.name "Aluno de laboratorio"
git config --local user.email "aluno@example.invalid"
git config --local --get user.name
git config --local --get user.email
```

`--local` limita a configuração ao repositório. Não alteramos sua identidade global nem a de outros projetos. `example.invalid` é reservado para exemplos, sem caixa postal real; não tente entrar num serviço com ele. Para publicar trabalho seu depois, escolha a identidade e o endereço de privacidade aceitos pelo serviço, conscientemente. [Escopos do Git config](https://git-scm.com/docs/git-config).

**Checkpoint 3:** Git consulta a identidade fictícia desta pasta; você não cadastrou uma conta online nem enviou dados.

## 4. Escreva e registre a primeira versão

Abra `nano anotacoes.md`. Cole **somente o texto**, não as crases do bloco:

```text
# Meu laboratorio

Objetivo: aprender a conservar versões.
Teste atual: ainda não executei testes de hardware.
```

No nano, **Ctrl+O → Enter** salva e **Ctrl+X** sai. No Termux, a tecla CTRL adicional permite enviar essas combinações. Se usa editor gráfico, salve UTF-8 exatamente como `anotacoes.md` na pasta de exercício e volte ao terminal.

Crie também `nano .gitignore` e salve:

```text
privado.txt
*.temporario
```

O arquivo `.gitignore` indica arquivos não rastreados que não devem ser incluídos por padrão. Ele não criptografa nada nem remove segredos de commits anteriores. [Regras de ignorar arquivos](https://git-scm.com/docs/gitignore).

Para testar sem usar uma senha, crie `nano privado.txt` com a frase fictícia `Este texto de exercicio nao deve entrar no historico`. Nunca coloque uma credencial real para verificar `.gitignore`.

```bash
cat anotacoes.md
git status --short
git check-ignore privado.txt
git add anotacoes.md .gitignore
git diff --cached
```

`status --short` deve mostrar os dois arquivos de trabalho ainda não rastreados (`??`), sem listar `privado.txt`. `check-ignore` deve imprimir o nome ignorado. `git add` copia o conteúdo atual para a área de preparação, chamada **index/staging**. Não envia arquivos a servidor. `diff --cached` mostra exatamente o conteúdo preparado para o próximo commit.

Se aparecer informação que não quer conservar, pare **antes** do commit. Não use `git add .` por hábito: nomes explícitos permitem começar com uma revisão pequena.

```bash
git commit -m "Registra objetivo inicial do laboratorio"
git status --short
git log --oneline
```

Espere uma entrada no log e nenhuma alteração pendente nos arquivos rastreados. O hash mostrado será diferente em cada execução; não copie um hash desta documentação. Commit é um ponto do histórico, não um teste do telefone. [Tutorial oficial](https://git-scm.com/docs/gittutorial).

**Checkpoint 4:** a primeira versão existe no log; `privado.txt` continua fora do histórico.

## 5. Entenda a diferença entre editar, preparar e guardar

Reabra `nano anotacoes.md` e acrescente:

```text
Aprendi: editar um arquivo nao cria um commit sozinho.
```

Salve e consulte:

```bash
git diff
git status --short
git add anotacoes.md
git diff --cached
```

`git diff` compara o arquivo de trabalho com a versão preparada. Depois de `add`, o mesmo conteúdo aparece no comparativo `--cached`, entre preparação e último commit. Linhas com `+` são adições; `-` são remoções. Elas pertencem à saída do diff, não devem ser acrescentadas ao seu arquivo. [Comparações no Git](https://git-scm.com/docs/git-diff).

Faça uma experiência segura: depois do `add`, abra o editor e acrescente **mais uma linha**: `Aprendi: posso editar novamente depois de preparar.` Salve e rode os dois diffs outra vez. Há uma alteração preparada e outra ainda fora da preparação. O commit sem um novo `add` conservaria somente a primeira.

Quando quiser guardar ambas:

```bash
git add anotacoes.md
git diff --cached
git commit -m "Explica trabalho preparado e commit"
git log --oneline
git status --short
```

**Checkpoint 5:** há dois commits e nenhuma alteração pendente. Você sabe que salvar no editor, preparar e fazer commit são ações diferentes.

## 6. Recupere texto antigo sem substituir o atual

Consultar o histórico é seguro para os arquivos de trabalho:

```bash
git show HEAD~1:anotacoes.md
```

`HEAD` aponta à versão atual; `~1` seleciona seu primeiro ancestral. Nesta aula, com dois commits, é a primeira versão. O texto impresso deve não incluir as duas linhas novas. Um repositório com um único commit não tem esse ancestral. [Consulta de objetos e versões](https://git-scm.com/docs/git-show).

Para conservar uma cópia antiga, use uma **pasta nova** de recuperação:

```bash
mkdir "$HOME/projetos/caderno-recuperado"
git show HEAD~1:anotacoes.md > "$HOME/projetos/caderno-recuperado/anotacoes-v1.md"
cat "$HOME/projetos/caderno-recuperado/anotacoes-v1.md"
cat anotacoes.md
```

Execute a linha de redirecionamento somente se o `mkdir` acabou de criar a pasta. Se a pasta já existe, escolha outra e ajuste o destino: `>` substitui o arquivo de destino quando existe. Estamos copiando para **fora** do repositório, sem sobrescrever `anotacoes.md`. Compare a versão antiga com a atual no editor; ambas devem existir.

`git restore --staged anotacoes.md`, quando houver um commit anterior e uma alteração preparada, **retira essa alteração da preparação**, conservando o arquivo de trabalho. Isso é diferente de `git restore anotacoes.md`, que pode substituir alterações locais do arquivo. Esta aula não pede o segundo comando. [Diferença de destinos do restore](https://git-scm.com/docs/git-restore).

**Checkpoint 6:** você leu uma versão antiga e recuperou uma cópia nova; seu trabalho atual permanece.

## 7. Faça uma experiência numa branch

Com os arquivos rastreados sem mudanças pendentes:

```bash
git switch -c experiencia
git branch --show-current
nano anotacoes.md
```

Acrescente `Experiencia: esta linha pertence a outra branch.` e salve. Revise e guarde:

```bash
git diff
git add anotacoes.md
git commit -m "Experimenta uma anotacao separada"
git switch main
cat anotacoes.md
```

Na `main`, a linha da experiência não aparece porque não foi incorporada ali. Para vê-la de novo, `git switch experiencia` e `cat anotacoes.md`. Volte à `main` ao terminar. Não é necessário apagar branches nem fazer merge nesta primeira aula. [Troca de branch](https://git-scm.com/docs/git-switch).

Se Git impedir a troca por mudanças locais, isso protege seu trabalho. Confira `status` e salve/registe conscientemente antes de mudar. Não use opções de força nem `reset --hard` como resposta inicial. Uma branch também não isola serviços, compiladores ou partições: ela organiza versões dos arquivos rastreados.

## 8. Conserve e teste um pacote do histórico

Com seus commits revisados, crie outra pasta **nova**:

```bash
mkdir "$HOME/projetos/caderno-exportacao"
git bundle create "$HOME/projetos/caderno-exportacao/caderno.bundle" --all
git bundle verify "$HOME/projetos/caderno-exportacao/caderno.bundle"
```

Se a pasta existe, escolha outro destino antes do `bundle create`. `--all` inclui as referências e seus objetos alcançáveis. O bundle **não inclui mudanças sem commit, arquivos ignorados ou configurações locais**. Preserve esses dados separadamente quando forem necessários. Verificação válida não significa que seu projeto inteiro foi incluído. [Formato e uso do bundle](https://git-scm.com/docs/git-bundle).

Para ensaiar recuperação, num destino ainda inexistente:

```bash
git clone "$HOME/projetos/caderno-exportacao/caderno.bundle" "$HOME/projetos/caderno-restaurado"
git -C "$HOME/projetos/caderno-restaurado" log --all --oneline
cat "$HOME/projetos/caderno-restaurado/anotacoes.md"
```

O clone deve conter o histórico e o texto da branch inicial correspondente. Confira as outras branches por `git -C ... branch -a`. Não espere `privado.txt` nem sua configuração local de autoria nessa cópia. Usar um bundle local não envia nada à internet.

Copie o bundle para um **destino fora do aparelho**, seguindo [backup e restauração](backup-restauracao.md) ou [SSH e arquivos](ssh-arquivos.md). Confira hash e teste o clone na cópia externa quando possível. Histórico só no telefone pode desaparecer junto com ele.

## 9. Erros comuns

| Mensagem/sintoma | Verificação | Ação adequada |
|---|---|---|
| `git: command not found` | Máquina, shell e instalação da ferramenta | Corrija a etapa 1; root Android não instala Git por si só |
| `not a git repository` | `pwd` e pasta `.git` | Entre na pasta do projeto; não inicialize outra pasta aleatoriamente |
| `Author identity unknown` | Configuração `--local` | Complete a etapa 3 naquele repositório |
| `nothing to commit` | `status`, arquivo e etapa de preparação | Pode estar tudo guardado; confirme o conteúdo esperado |
| Diff vazio, arquivo novo existe | `status --short` | Arquivo não rastreado ainda não aparece como alteração rastreada |
| Arquivo ignorado aparece em commits | Ele já havia sido rastreado? | `.gitignore` não apaga histórico; investigue antes de publicar |
| `HEAD~1` inválido | Quantos commits existem? | Nesta aula precisa de dois; consulte versões existentes sem inventar hash |
| Clone diz que destino existe | `ls` e arquivos no destino | Use outra pasta vazia/inexistente; não apague a antiga |
| Git questiona propriedade da pasta | Origem, dono e como foi copiada | Corrija a situação real; não desative validação para todas as pastas |

Se uma credencial real entrou no histórico, **não publique**: removê-la do último arquivo não remove versões anteriores. Revogue/rotacione o segredo no fornecedor e siga uma política específica de limpeza do histórico. Esta aula não promete que um comando universal resolve exposição. Consulte [segurança](../fundamentos/seguranca.md).

## 10. Encerre, retome e valide

Não há daemon Git a encerrar. Feche o editor depois de salvar e confira `git status`. No próximo dia:

```bash
cd "$HOME/projetos/caderno-git"
git branch --show-current
git status
git log --all --oneline
cat anotacoes.md
```

Não repita `init`, recriação dos arquivos ou identidade se está só retomando. Você concluiu quando consegue explicar dois commits, os dois diffs, uma branch e uma cópia recuperada, e quando o bundle pode ser clonado sem alterar o original. Para aplicar ao seu programa, inicialize Git **somente na pasta desse programa**, com um `.gitignore` apropriado; revise segredos antes do primeiro commit.

## Fontes e verificação

Receita original de laboratório, revisão documental em **11/10/2026**. Manuais primários citados junto às etapas; origem de instalação: [Git](https://git-scm.com/install/). Um ensaio com **Git 2.56.0 no notebook**, em diretório temporário próprio, confirmou dois commits na `main`, diferenças entre trabalho e preparação, preservação da edição com `restore --staged`, consulta/recuperação separada, branch de experiência, bundle verificado e clone com três commits alcançáveis. O arquivo ignorado ficou fora do clone e o original permaneceu intacto. O ensaio usou autoria fictícia local e desativou assinatura somente naquele fixture para evitar dependência da configuração global do host.

O código reproduzível desse ensaio é `scripts/check-git-workshop.mjs` no repositório da documentação; `npm run check:git-workshop` exige Git disponível e cria/apaga somente sua própria pasta temporária. Ele não instala ferramentas, não acessa rede ou telefone e não valida todos os hosts. Os exemplos da aula não requerem alteração de firmware, serviços ou partições.
