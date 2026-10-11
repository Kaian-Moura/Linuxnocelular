---
title: Bash — seu primeiro script útil, com erros e testes
description: Crie um leitor de anotações, entenda argumentos e aspas, teste falhas e guarde a saída sem alterar o arquivo de entrada.
sidebar_position: 53
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Um **script** é um arquivo que reúne instruções para um interpretador. Nesta aula, Bash vai ler um pequeno texto seu e informar quantas linhas e quantas anotações ele contém. Você vai construir o programa, entender cada parte, provocar erros controlados e repetir a execução. O arquivo de entrada permanece intacto.

**Resultado:** um relatório no terminal, outro salvo numa pasta do exercício e testes que distinguem sucesso de falha. **Dificuldade:** após aprender a criar pastas e salvar arquivos. **Materiais:** terminal, Bash e editor disponíveis, uma pasta nova e algumas linhas fictícias. **Pré-requisito:** [primeiro terminal](../comece-aqui/terminal-primeiros-passos.md) ou [primeiro projeto Termux](primeiro-projeto-termux.md). Não precisa de root, bootloader desbloqueado ou Linux nativo.

O exercício usa somente arquivos que você cria. Não controla o hub, modifica o kernel, instala um serviço ou coleta informações privadas do telefone. Não execute scripts encontrados na internet antes de ler seu conteúdo; uma extensão `.sh` não limita o que um programa pode fazer.

## 1. Identifique onde os comandos vão executar

Abra **Termux** no Android ou **Terminal** na sua distribuição já instalada. Se estiver em Debian PRoot, os comandos desta aula pertencem ao terminal **dentro do Debian**. Se entrou por SSH, pertencem ao destino dessa conexão. Consulte [onde digitar](../comece-aqui/terminal-primeiros-passos.md) quando estiver em dúvida.

Digite no prompt, uma linha de cada vez:

```sh
pwd
command -v bash
bash --version
command -v nano
```

`pwd` mostra a pasta atual. `command -v` procura o programa no ambiente atual; uma resposta vazia significa que ele não foi encontrado ali. `bash --version` identifica o interpretador, não a versão do Android ou da distribuição. Copie a versão para suas anotações privadas. A primeira linha pode dizer `GNU bash, version ...`; os números do seu ambiente podem ser diferentes.

**Checkpoint 1:** Bash responde e você sabe em qual sistema está. Não continue se estiver tentando usar o Prompt de Comando ou PowerShell como se fossem Bash. No Windows, esta aula pode ser executada dentro de uma distribuição WSL já preparada; consulte a [documentação oficial do WSL](https://learn.microsoft.com/en-us/windows/wsl/install) e prepare o ambiente separadamente. O [guia do computador](../comece-aqui/computador-downloads.md) explica onde abrir cada terminal. No macOS, confira a versão disponível e use `bash arquivo.sh`; o exercício evita recursos introduzidos depois de Bash 3.

### Se Bash ou o editor estiverem ausentes

Use somente o gerenciador correspondente ao ambiente identificado. Estes são caminhos alternativos, **não uma sequência para executar inteira**:

| Ambiente confirmado | Instalação quando os pacotes forem necessários |
|---|---|
| Termux, fora de PRoot | `pkg install bash nano` |
| Debian/Ubuntu com APT | `sudo apt update`, depois `sudo apt install bash nano` |
| Alpine/postmarketOS com APK | `sudo apk update`, depois `sudo apk add bash nano` |

No Debian PRoot, uma conta apresentada como root pode executar `apt` sem `sudo`; isso não dá root real no Android. Em Alpine, `/bin/sh` costuma ser outro shell: ter `sh` não prova ter Bash. Se a rede ou o repositório falhar, use a [aula de pacotes](pacotes-repositorios.md), conservando a mensagem exata. Não adicione repositórios aleatórios para conseguir um editor.

Os links oficiais de origem e preparação estão nos guias de [Termux](../android/termux.md) e [desenvolvimento](../projetos/desenvolvimento.md). Para a semântica do interpretador, usamos o [manual do GNU Bash](https://www.gnu.org/software/bash/manual/). A instalação no seu aparelho depende da distribuição, release e arquitetura; esta página não fornece um binário universal.

## 2. Prepare uma pasta nova e um texto pequeno

Confira primeiro se já fez a aula. Se a pasta existir e contiver trabalho seu, retome pela seção de retomada ou escolha outro nome. **Não sobrescreva um exercício anterior para começar de novo.** No terminal:

```sh
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/relatorio-bash"
cd "$HOME/projetos/relatorio-bash"
pwd
nano "minhas notas.txt"
```

`mkdir` sem `-p` na pasta final ajuda a perceber que ela já existe: nesse caso ele avisa, e você decide se retoma. `cd` deve terminar com sucesso antes de continuar. `$HOME` representa sua pasta pessoal; não substitua essa variável por um caminho de exemplo. As aspas mantêm `minhas notas.txt` como um argumento, apesar do espaço.

**Dentro do nano**, cole exatamente estas quatro linhas, incluindo a linha vazia:

```text
Verificar uma cópia do projeto

Aprender a encerrar meu servidor
Registrar o teste do monitor
```

Salve com **Ctrl+O**, confirme o nome com **Enter** e saia com **Ctrl+X**. No Termux, use a tecla extra CTRL ou o mecanismo disponível no teclado virtual. De volta ao prompt, confira:

```sh
cat "minhas notas.txt"
```

Você deve reconhecer o conteúdo. Esta é a entrada fictícia do programa. Não use lista de senhas, tokens, números de documentos ou mensagens pessoais: o relatório exibirá o nome do arquivo e poderá ser salvo.

## 3. Escreva o programa completo

No prompt:

```sh
nano relatorio.sh
```

**Dentro do editor**, cole o código. As três crases são delimitadores da documentação e não pertencem ao arquivo.

<!-- example-file: bash/relatorio.sh -->
```bash
# Execute com: bash relatorio.sh "minhas notas.txt"
ajuda() {
    printf '%s\n' 'Uso: bash relatorio.sh ARQUIVO_DE_TEXTO'
    printf '%s\n' 'Conta linhas e anotações sem modificar a entrada.'
}

if [[ $# -eq 1 && $1 == --help ]]; then
    ajuda
    exit 0
fi

if [[ $# -ne 1 ]]; then
    ajuda >&2
    exit 2
fi

relatorio_entrada=$1
if [[ ! -f "$relatorio_entrada" || ! -r "$relatorio_entrada" || -L "$relatorio_entrada" ]]; then
    printf '%s\n' 'Erro: escolha um arquivo regular legível, sem link simbólico.' >&2
    exit 1
fi

relatorio_linhas=0
relatorio_anotacoes=0
if ! {
    while IFS= read -r relatorio_linha || [[ -n "$relatorio_linha" ]]; do
        relatorio_linhas=$((relatorio_linhas + 1))
        if [[ "$relatorio_linha" =~ [^[:space:]] ]]; then
            relatorio_anotacoes=$((relatorio_anotacoes + 1))
        fi
    done
} < "$relatorio_entrada"; then
    printf '%s\n' 'Erro: não foi possível ler a entrada.' >&2
    exit 1
fi

printf 'Arquivo: %s\n' "$relatorio_entrada"
printf 'Linhas: %d\n' "$relatorio_linhas"
printf 'Anotações: %d\n' "$relatorio_anotacoes"
exit 0
```

Salve e saia. O arquivo não precisa de permissão de execução, pois chamaremos `bash relatorio.sh`. Essa escolha evita presumir o caminho do interpretador no Termux ou mudar permissões desnecessariamente. Não use `source relatorio.sh`: isso executaria o código no shell da sessão, e `exit` poderia fechá-la.

### Entenda o contrato do programa

Um **argumento** é um valor passado na chamada. `$#` conta os argumentos; `$1` contém o primeiro. O programa aceita um arquivo ou `--help`. Para zero ou dois argumentos, informa o uso e termina com código **2**. Um arquivo inadequado recebe código **1**. Ajuda e relatório concluído recebem **0**. Esses significados foram definidos para este projeto, não para todos os programas Linux.

`[[ ... ]]` faz verificações do Bash. `-f` verifica arquivo regular, `-r` indica legibilidade segundo o ambiente e `-L` detecta link simbólico. Rejeitar links é uma escolha pedagógica para manter a entrada simples. Esses testes não criam uma fronteira de segurança para arquivos trocados por outra pessoa durante a leitura. Use somente sua pasta de exercício. Consulte as [construções condicionais](https://www.gnu.org/s/bash/manual/html_node/Conditional-Constructs.html) para aprender a composição dos testes.

As variáveis têm nomes próprios do exercício. Não atribuímos valores a `HOME`, `PATH` ou variáveis do sistema. `$(( ... ))` calcula os contadores. `while` repete a leitura enquanto há uma linha; o teste adicional conserva a última linha quando o texto termina sem uma quebra de linha. Uma linha composta apenas de espaços conta como linha, mas não como anotação.

`IFS=` e `read -r` conservam espaços e barras invertidas do texto, em vez de tratá-los como instruções. A entrada é **texto**, nunca código: não há `eval`, interpretação de comandos contidos no arquivo ou execução de downloads. `printf` usa um formato fixo e passa o nome como dado em `%s`. Esses recursos estão nos [builtins do Bash](https://www.gnu.org/s/bash/manual/html_node/Bash-Builtins.html).

Aspas duplas ao redor de um caminho preservam sua passagem como um único argumento, inclusive com espaços. Não remova as aspas para “simplificar”. Consulte [quoting](https://www.gnu.org/software/bash/manual/html_node/Quoting.html). Este programa é um leitor de **texto pequeno**, não um contador otimizado para arquivos gigantes, binários ou logs infinitos.

## 4. Confira sintaxe e resultado

No prompt, na mesma pasta:

```bash
bash -n relatorio.sh
bash relatorio.sh --help
bash relatorio.sh "minhas notas.txt"
printf 'Estado: %d\n' "$?"
```

`-n` verifica a sintaxe sem executar o programa. Não prova que a lógica está correta. Normalmente não imprime nada quando passa. Se falhar, corrija antes de continuar.

**Saída ilustrativa** para o texto da etapa 2:

```text
Arquivo: minhas notas.txt
Linhas: 4
Anotações: 3
Estado: 0
```

`$?` é o estado do comando imediatamente anterior; consultar depois de outro comando já mostraria outro resultado. Confira o [manual sobre estado de saída](https://www.gnu.org/s/bash/manual/html_node/Exit-Status.html). O zero aqui significa que o script terminou conforme seu contrato. Ainda precisamos comparar as contagens com o texto.

**Checkpoint 2:** abra novamente o texto e conte as linhas. Se o editor acrescentou uma linha vazia extra, o resultado muda de forma coerente. Não edite a saída para torná-la igual ao exemplo: confira a entrada real. Acentos no nome não devem impedir a leitura; fonte e codificação do terminal podem afetar como aparecem.

## 5. Teste as falhas deliberadamente

Execute separadamente e observe o estado imediatamente após cada chamada:

```bash
bash relatorio.sh
printf 'Estado: %d\n' "$?"
bash relatorio.sh "nao-existe.txt"
printf 'Estado: %d\n' "$?"
bash relatorio.sh "minhas notas.txt" "outro.txt"
printf 'Estado: %d\n' "$?"
```

Os resultados esperados são **2**, **1**, **2**. A mensagem do arquivo inexistente não significa que suas notas foram apagadas. A chamada com dois argumentos verifica a regra do programa. Testar falhas ajuda a perceber se ele protege seu contrato ou apenas funciona no caso mais fácil.

Crie também, **somente nesta pasta**, dois casos pequenos:

```bash
printf '' > vazio.txt
printf 'Uma anotação sem quebra final' > sem-quebra.txt
bash relatorio.sh vazio.txt
bash relatorio.sh sem-quebra.txt
```

O primeiro deve indicar zero linhas e zero anotações. O segundo, uma de cada. `>` cria ou sobrescreve o arquivo nomeado: confira a pasta e use nomes novos. Nunca aponte essa redireção para seu arquivo de entrada ou para uma configuração do sistema.

## 6. Guarde o relatório e separe os erros

Antes desta etapa, confira se não há relatórios anteriores com os mesmos nomes. Para preservá-los, use nomes novos. Na pasta do exercício:

```bash
bash relatorio.sh "minhas notas.txt" > resultado.txt
cat resultado.txt
bash relatorio.sh "nao-existe.txt" > tentativa-saida.txt 2> tentativa-erro.txt
printf 'Estado: %d\n' "$?"
cat tentativa-erro.txt
```

**stdout** é a saída normal; **stderr**, o canal de mensagens de erro. `>` redireciona stdout. `2>` redireciona stderr. Um arquivo `tentativa-saida.txt` vazio é esperado quando a chamada falha antes do relatório. As notas originais continuam no lugar porque o script apenas as lê. Usar o **mesmo nome para entrada e saída** truncaria a entrada antes de o script ler: por isso mantemos nomes distintos.

**Checkpoint 3:** você explica por que erro e relatório foram para arquivos diferentes, reconhece o código 1 e abre seu texto original sem alterações. Guarde uma cópia do exercício usando [backup com restauração](backup-restauracao.md) ou acompanhe as edições com [Git](git-primeiro-repositorio.md).

## 7. Feche, retome e faça uma pequena alteração

Feche somente a janela de terminal quando nenhum outro trabalho depender dela. Abra uma nova e entre novamente em `"$HOME/projetos/relatorio-bash"`. Confira `pwd`, `ls` e execute `bash relatorio.sh "minhas notas.txt"`. O arquivo continua disponível, mas uma variável digitada num terminal anterior não é uma configuração persistente do sistema.

Abra as notas, acrescente uma anotação e salve. Execute de novo: a contagem de anotações deve aumentar em um. O programa não precisa ser recompilado; Bash lê o arquivo na execução. Se você modificar o script, repita **sintaxe, caso correto e casos inválidos**. Conserve uma versão anterior antes de mexer, em vez de tentar desfazer de memória.

## 8. Erros frequentes e recuperação

| Sintoma | Verificação | Correção pequena |
|---|---|---|
| `bash: command not found` | `command -v bash` no ambiente real | Prepare Bash pelo gerenciador desse ambiente |
| `relatorio.sh: No such file` | `pwd` e `ls` | Entre na pasta onde salvou; não recrie sobre outra cópia |
| Erro perto de `[[` usando `sh` | Confira a chamada | Execute com `bash`, conforme esta aula |
| Estado 2 com nome contendo espaço | Examine os argumentos | Coloque o caminho entre aspas duplas |
| `unexpected end of file` | `bash -n relatorio.sh` e o final do arquivo | Compare `fi`, `done`, chaves e aspas com o código completo |
| Símbolos `\r` ou comportamento estranho | Origem da edição | Salve em UTF-8 com quebras LF; preserve uma cópia antes da conversão |
| Relatório vazio | Leia stderr e código de saída | Investigue a chamada; não conclua que perdeu a entrada |
| Texto de entrada desapareceu após `>` | Compare nomes usados | Restaure uma cópia externa para outra pasta; redireção não tem desfazer universal |

Para abandonar a aula, encerre o editor e deixe a pasta guardada. Nenhuma configuração do boot foi criada. Só exclua a pasta pelo gerenciador de arquivos depois de confirmar que contém apenas este exercício e que sua cópia é legível. Não há motivo para desinstalar Bash se outros programas dependem dele.

## 9. Testes finais e próximos passos

Você concluiu quando consegue produzir o resultado conhecido, explicar as aspas, receber 1/2 nas falhas previstas, preservar a entrada, salvar stdout/stderr separados e retomar numa sessão nova. O script não é um serviço e não continuará executando após o boot: essa é outra aula, [trabalho em segundo plano](servico-em-background.md).

O código original deste exercício foi executado em pasta temporária do notebook de validação, com os casos descritos; os detalhes estão no relatório do repositório. Isso verifica a lógica no host testado, não o armazenamento, a política de segundo plano ou o kernel de todos os celulares. A revisão documental foi feita em **11/10/2026**. As páginas GNU podem bloquear leitura automatizada; os comandos `help read`, `help printf` e `help [[` no Bash instalado permitem conferir o comportamento da versão local. Continue com [processos](processos-terminal.md), [permissões](arquivos-permissoes.md) e [logs](logs-primeira-investigacao.md), relacionando cada programa ao ambiente onde executa.
