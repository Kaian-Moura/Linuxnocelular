---
title: Construa um banco de tarefas com SQLite e Python
description: Do primeiro arquivo de banco a CRUD, restrições, transações, backup consistente e restauração em uma cópia separada.
sidebar_position: 61
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Nesta aula você construirá uma lista de tarefas que permanece salva depois de fechar o terminal. O programa terá comandos para adicionar, consultar, alterar, concluir e excluir **tarefas fictícias do exercício**. Depois você provocará erros controlados, fará um backup e restaurará uma cópia sem substituir o banco original. A intenção é aprender armazenamento com um resultado pequeno e completo, antes de juntar navegador, servidor, sincronização ou dados pessoais.

**Dificuldade:** iniciante com alguma prática de terminal e Python. Comece pela [aula de Python](python-projeto-completo.md) se ainda não sabe salvar um arquivo `.py`. Materiais: ambiente com Python 3.8 ou posterior, módulo `sqlite3` disponível, editor de texto, espaço para arquivos pequenos e uma segunda pasta para recuperação. Funciona como exercício em Termux, Debian PRoot ou Linux nativo quando esses requisitos existem; isso não comprova suporte a hardware do aparelho. Não precisa de root Android, conta online, serviço de banco, abertura de porta nem download de dados externos.

## O que será criado e o que precisa ser protegido

Um **banco de dados** organiza informações para consulta e atualização. Aqui haverá uma tabela chamada `tarefas`, com uma linha por tarefa e colunas para identificador, título e estado de conclusão. **SQL** é a linguagem usada para pedir essas operações. **SQLite** é a biblioteca que executa o SQL e mantém o arquivo; **Python** será o programa que interpreta seus comandos e solicita as operações. Não são quatro aplicativos diferentes que precisam ficar abertos.

O arquivo `tarefas.sqlite` conterá os dados. `tarefas.py` conterá as instruções do programa. Apagar o programa não equivale a apagar o banco; copiar só o programa não salva as tarefas. Essa diferença aparecerá no exercício de restauração. O SQLite não exige um processo servidor separado neste uso local, mas continua exigindo cuidados com acesso ao arquivo e alterações concorrentes. [Introdução oficial do SQLite](https://www.sqlite.org/whentouse.html).

Utilize somente tarefas inventadas, como “Revisar o cabo HDMI”. O banco desta aula não é criptografado, não pede senha e não implementa contas de usuário. Quem consegue ler o arquivo pode consultar seu conteúdo. Sua pasta de trabalho não deve ficar dentro da raiz de um servidor HTTP. Um arquivo com extensão `.sqlite` não é um cofre de senhas e não deve ser enviado para um repositório público como exemplo de dados reais.

**Resultado final verificável:** três tarefas criadas, uma alteração de título, uma conclusão, uma exclusão deliberada, rejeição de uma entrada inválida, teste de rollback, backup íntegro e duas cópias com o mesmo conteúdo lógico. Fechar e abrir novamente o programa deve preservar as tarefas confirmadas.

## 1. Prepare Python e confira o módulo

Escolha **um** ambiente e identifique onde está o terminal. No Termux, use o aplicativo já instalado conforme [o guia de instalação](../android/termux.md); não baixe um instalador Python para Windows dentro do Android. Execute fora do PRoot, se está seguindo a trilha Termux:

```bash
pkg update
pkg install python nano
python3 --version
```

No Debian/Ubuntu nativo, com administração autorizada para instalar pacotes:

```bash
sudo apt update
sudo apt install python3 nano
```

No Alpine/postmarketOS nativo, também com o mecanismo administrativo da sua instalação:

```bash
sudo apk update
sudo apk add python3 nano
```

Em Debian PRoot, `apt` pertence ao ambiente Debian; use as instruções específicas de [PRoot](../android/proot-distro.md) e não confunda o usuário root aparente desse ambiente com root Android. Não é necessário `pip install sqlite3`: o módulo deste exercício vem com a distribuição Python quando habilitado. A [documentação do módulo](https://docs.python.org/3.14/library/sqlite3.html) também explica que ele é opcional em algumas compilações. Se faltar, procure o pacote ou a compilação fornecida pelo distribuidor; instalar um pacote de nome parecido não é substituto automático.

Confira importação e versão da biblioteca realmente utilizada:

```bash
python3 -c 'import sqlite3; print("SQLite disponível:", sqlite3.sqlite_version)'
```

Você deve ver uma versão numérica, sem traceback. A versão do comando `sqlite3`, caso esteja instalado, pode ser diferente da biblioteca vinculada ao Python. Anote **a segunda**, porque nosso programa usa Python. A CLI separada é opcional; não será necessária para terminar a aula. Não transforme um erro de importação em motivo para reinstalar o sistema operacional.

**Checkpoint 1:** `python3` funciona, o módulo importa e você sabe qual ambiente está usando. No notebook a validação desta página utiliza o mesmo programa em uma pasta temporária; o teste não instala nada no seu telefone.

## 2. Abra uma pasta nova, sem sobrescrever projetos

**Local: terminal do ambiente escolhido, como usuário comum.** Confira `ls "$HOME"`. Se `aula-sqlite` já existe, abra-a para retomar ou escolha outro nome e ajuste os caminhos. Não use uma pasta de aplicativo desconhecido.

```bash
mkdir "$HOME/aula-sqlite"
cd "$HOME/aula-sqlite"
pwd
nano tarefas.py
```

`mkdir` sem `-p` avisa se a pasta existe; só continue para a criação inicial se ela realmente foi criada. No editor aberto, cole **o programa completo abaixo**, sem as cercas de Markdown. Grave com Ctrl+O, Enter e saia com Ctrl+X. As aspas e a indentação fazem parte de Python; colar as linhas diretamente no shell não cria o arquivo.

```python
import argparse
import sqlite3
from contextlib import contextmanager
from pathlib import Path

PASTA = Path(__file__).resolve().parent
BANCO = PASTA / "tarefas.sqlite"


@contextmanager
def transacao(conexao):
    conexao.execute("BEGIN IMMEDIATE")
    try:
        yield
        conexao.execute("COMMIT")
    except Exception:
        conexao.execute("ROLLBACK")
        raise


def abrir(criar=False):
    if not criar and not BANCO.is_file():
        raise ValueError("Banco ausente. Primeiro use o comando iniciar.")
    return sqlite3.connect(BANCO, isolation_level=None, timeout=3.0)


def main():
    parser = argparse.ArgumentParser(description="Tarefas locais de estudo")
    comandos = parser.add_subparsers(dest="acao", required=True)
    comandos.add_parser("iniciar")
    comandos.add_parser("listar")
    comandos.add_parser("schema")
    comandos.add_parser("verificar")
    comandos.add_parser("testar-rollback")
    novo = comandos.add_parser("adicionar")
    novo.add_argument("titulo")
    mudar = comandos.add_parser("renomear")
    mudar.add_argument("id", type=int)
    mudar.add_argument("titulo")
    for nome in ("concluir", "excluir"):
        comando = comandos.add_parser(nome)
        comando.add_argument("id", type=int)
    backup = comandos.add_parser("backup")
    backup.add_argument("nome", help="Nome novo, como primeira-copia.sqlite")
    args = parser.parse_args()
    conexao = abrir(criar=args.acao == "iniciar")
    try:
        if args.acao == "iniciar":
            with transacao(conexao):
                conexao.execute("""
                    CREATE TABLE IF NOT EXISTS tarefas (
                        id INTEGER PRIMARY KEY,
                        titulo TEXT NOT NULL
                            CHECK(length(trim(titulo)) >= 1 AND length(titulo) <= 120),
                        concluida INTEGER NOT NULL DEFAULT 0
                            CHECK(concluida IN (0, 1))
                    )
                """)
            print("Banco preparado:", BANCO)
        elif args.acao == "adicionar":
            with transacao(conexao):
                cursor = conexao.execute(
                    "INSERT INTO tarefas(titulo) VALUES (?)", (args.titulo,)
                )
            print("Criada a tarefa", cursor.lastrowid)
        elif args.acao == "listar":
            linhas = conexao.execute(
                "SELECT id, titulo, concluida FROM tarefas ORDER BY id"
            ).fetchall()
            for identificador, titulo, concluida in linhas:
                print(identificador, "[feito]" if concluida else "[aberto]", titulo)
            print("Total:", len(linhas))
        elif args.acao in ("renomear", "concluir", "excluir"):
            with transacao(conexao):
                if args.acao == "renomear":
                    cursor = conexao.execute(
                        "UPDATE tarefas SET titulo = ? WHERE id = ?",
                        (args.titulo, args.id),
                    )
                elif args.acao == "concluir":
                    cursor = conexao.execute(
                        "UPDATE tarefas SET concluida = 1 WHERE id = ?", (args.id,)
                    )
                else:
                    cursor = conexao.execute(
                        "DELETE FROM tarefas WHERE id = ?", (args.id,)
                    )
                if cursor.rowcount != 1:
                    raise ValueError("Nenhuma tarefa com esse identificador.")
            print("Operação confirmada:", args.acao, args.id)
        elif args.acao == "schema":
            linha = conexao.execute(
                "SELECT sql FROM sqlite_master WHERE name = 'tarefas'"
            ).fetchone()
            print(linha[0] if linha else "Tabela ausente.")
        elif args.acao == "verificar":
            print(conexao.execute("PRAGMA integrity_check").fetchone()[0])
        elif args.acao == "testar-rollback":
            antes = conexao.execute("SELECT count(*) FROM tarefas").fetchone()[0]
            try:
                with transacao(conexao):
                    conexao.execute(
                        "INSERT INTO tarefas(titulo) VALUES (?)", ("Não deve ficar",)
                    )
                    conexao.execute(
                        "INSERT INTO tarefas(titulo) VALUES (?)", ("",)
                    )
            except sqlite3.IntegrityError:
                depois = conexao.execute("SELECT count(*) FROM tarefas").fetchone()[0]
                assert depois == antes, "A contagem mudou inesperadamente."
                print("Rollback confirmado: nenhuma tarefa do teste ficou salva.")
        elif args.acao == "backup":
            if Path(args.nome).name != args.nome or not args.nome.endswith(".sqlite"):
                raise ValueError("Use apenas um nome de arquivo terminado em .sqlite.")
            pasta_backup = PASTA / "backups"
            pasta_backup.mkdir(exist_ok=True)
            destino = pasta_backup / args.nome
            with destino.open("xb"):
                pass
            copia = sqlite3.connect(destino, isolation_level=None)
            try:
                conexao.backup(copia)
                resultado = copia.execute("PRAGMA integrity_check").fetchone()[0]
                if resultado != "ok":
                    raise ValueError("A cópia não passou na verificação.")
                print("Backup verificado:", destino)
            finally:
                copia.close()
    finally:
        conexao.close()


if __name__ == "__main__":
    try:
        main()
    except (sqlite3.Error, OSError, ValueError) as erro:
        print("Erro:", erro)
        raise SystemExit(1)
```

Antes de executar, use `ls -l tarefas.py` e reabra o arquivo para conferir começo e fim. `PASTA` é calculada a partir do próprio programa, evitando criar outro banco acidentalmente ao mudar de diretório. Ainda assim, copiar o programa para outra pasta muda o banco que ele procura: essa característica será utilizada conscientemente na recuperação.

## 3. Entenda o schema antes de colocar dados

**Schema** é a estrutura do banco: quais tabelas existem e quais regras seus campos seguem. Nosso identificador inteiro é a chave primária. Um título não pode ser nulo, vazio depois de remover espaços nas pontas ou maior que 120 caracteres. O estado aceita apenas 0 e 1. Essas regras são **constraints**, verificações no banco, não só avisos da interface. [CREATE TABLE e constraints](https://www.sqlite.org/lang_createtable.html).

Inicie e examine:

```bash
python3 tarefas.py iniciar
python3 tarefas.py schema
python3 tarefas.py listar
```

Você deve ver o caminho do banco, a definição da tabela e `Total: 0`. `CREATE TABLE IF NOT EXISTS` não apaga uma tabela que já existe, mas também **não atualiza sua estrutura** se você editar o código depois. Alterar schema de um projeto real exige migração e backup; nesta aula mantenha a definição publicada até completar todos os testes.

**Checkpoint 3:** existe um banco novo, a tabela corresponde ao exemplo e não há dados. Se aparece uma lista antiga, você retomou outro laboratório; leia-a antes de excluir qualquer coisa. Não conclua que a data de criação do arquivo identifica sua origem com certeza.

## 4. Faça o primeiro CRUD com identificadores conferidos

**CRUD** resume quatro operações: criar, consultar, atualizar e excluir. Comece criando três registros fictícios:

```bash
python3 tarefas.py adicionar "Revisar o cabo HDMI"
python3 tarefas.py adicionar "Estudar Python"
python3 tarefas.py adicionar "Rascunho descartável"
python3 tarefas.py listar
```

Em um banco vazio elas normalmente recebem 1, 2 e 3. **Use os identificadores realmente mostrados por sua lista** nas próximas linhas; não adote 3 como “sempre descartável” em uma retomada. Aspas mantêm o título inteiro como um argumento do shell. A operação termina com confirmação e o programa fecha a conexão.

```bash
# Somente se a lista confirmou os mesmos identificadores do exemplo
python3 tarefas.py renomear 2 "Estudar Python e SQLite"
python3 tarefas.py concluir 1
python3 tarefas.py listar
```

A tarefa 1 deve estar `[feito]`; a 2 deve mostrar o novo título. Feche o terminal, reabra-o no mesmo ambiente e execute pelo caminho completo:

```bash
python3 "$HOME/aula-sqlite/tarefas.py" listar
```

Os mesmos registros devem reaparecer. Essa consulta depois de reabrir é mais forte que ver texto impresso no mesmo processo: mostra persistência do que foi confirmado. Ela não demonstra resistência a perda de energia durante toda operação possível, nem dispensa backup.

O identificador não é a posição visual da tarefa na tela. Se você exclui uma linha, a próxima consulta pode mostrar um salto na sequência. Nosso schema não promete que um número nunca será reutilizado depois de exclusões; também não reinicia os números só porque você fecha o terminal. Portanto, sempre associe o identificador ao título retornado no momento da operação. Não construa uma automação que execute `excluir 3` diariamente supondo que 3 sempre representa o rascunho inicial. Projetos com vínculos entre tabelas precisam definir essas regras de identidade e referência com mais cuidado.

O SQL usa `?` para separar texto de instrução. Um título com apóstrofo continua sendo dado, não altera a gramática da consulta:

```bash
python3 tarefas.py renomear 2 "Ler 'O Alienista'"
```

Não substitua os placeholders por `f"...{titulo}..."`. Valores vêm nos parâmetros; os nomes das tabelas e operações permanecem fixos no programa. Isso evita construir SQL a partir de texto arbitrário. Quando aprender consultas dinâmicas, deverá distinguir valores de identificadores, porque um placeholder não transforma qualquer parte da linguagem SQL em argumento.

## 5. Provoque uma rejeição e um rollback controlados

Tente adicionar um título vazio:

```bash
python3 tarefas.py adicionar ""
python3 tarefas.py listar
python3 tarefas.py testar-rollback
python3 tarefas.py listar
```

A primeira linha deve terminar com erro de constraint e código de saída diferente de zero. O banco deve continuar legível. O teste de rollback faz duas inserções dentro de **uma transação**: uma aparentemente válida e outra inválida. A segunda falha; a função desfaz o conjunto. A tarefa “Não deve ficar” não pode aparecer na lista final.

Uma transação delimita uma unidade de mudança. No programa, `BEGIN IMMEDIATE` inicia explicitamente; `COMMIT` confirma; `ROLLBACK` desfaz mudanças ainda não confirmadas. `isolation_level=None` evita depender da abertura implícita de transações que varia conforme a API Python utilizada. O laboratório usa uma conexão por comando e não inclui threads. [Transações do SQLite](https://www.sqlite.org/lang_transaction.html).

**Checkpoint 5:** a rejeição não acrescentou um título vazio e o teste não deixou sua primeira inserção. Se a contagem muda inesperadamente, pare de adicionar tarefas, preserve os arquivos e compare seu código. Um `assert` interrompido é uma falha do teste, não autorização para limpar o banco.

Uma exclusão confirmada não pode ser desfeita pelo `ROLLBACK` de um comando executado depois. **Rollback de transação e restauração de backup são coisas diferentes.** Para praticar a exclusão, confira mais uma vez o registro descartável e só então use seu identificador:

```bash
# Apenas se o identificador 3 ainda for o rascunho do exercício
python3 tarefas.py excluir 3
python3 tarefas.py listar
```

O `WHERE id = ?` limita a exclusão. `DELETE FROM tarefas` sem filtro removeria todos os registros da tabela e não faz parte desta aula. Não pratique comandos destrutivos num banco de aplicativo instalado, mesmo se tiver extensão semelhante.

## 6. Faça uma cópia consistente, não uma cópia às cegas

O banco pode utilizar arquivos auxiliares conforme seu modo de operação. Copiar apenas um arquivo principal enquanto outro processo escreve nem sempre produz a cópia desejada. Nosso programa usa a **API de backup do SQLite**, que trabalha com conexões ao banco. [Backup API](https://www.sqlite.org/backup.html).

Escolha um nome que ainda não exista:

```bash
python3 tarefas.py verificar
python3 tarefas.py backup primeira-copia.sqlite
ls -l "$HOME/aula-sqlite/backups"
```

`verificar` deve retornar `ok`. A operação de backup só confirma após verificar também a cópia. O modo `xb` recusa substituir um arquivo existente; um erro “File exists” significa que deve escolher um nome novo ou inspecionar o backup anterior, não apagar indiscriminadamente a pasta. Se uma tentativa falhou no meio, ela pode deixar um arquivo incompleto reservado: preserve-o como tentativa falha e use outro nome para repetir.

`integrity_check` procura problemas estruturais; **não prova que o conteúdo é o conteúdo correto**, que alguém não alterou suas tarefas ou que o destino resistirá à perda do telefone. Por isso a etapa seguinte compara registros, e a [aula de backup](backup-restauracao.md) ensina transferência e verificação em outro dispositivo. Uma cópia ao lado do original protege contra alguns erros de edição; não protege contra defeito do armazenamento ou perda física do aparelho.

### Como reconhecer uma cópia sem editá-la por engano

Quando você abre um gerenciador de bancos ou escreve outro programa, confirme se ele cria um banco vazio quando o caminho não existe. Esse comportamento pode esconder um nome digitado errado: o aplicativo abre, mas não mostra suas tarefas porque criou outro arquivo. Nosso comando `abrir` verifica a existência antes das operações comuns; só `iniciar` pode criar o banco. Já o bloco de recuperação utiliza `mode=ro`, modo somente de leitura, para recusar alterações nessa inspeção.

Uma comparação útil possui três partes: estrutura, conteúdo e origem. A estrutura mostra que a tabela esperada existe; o conteúdo mostra títulos e estados esperados; a origem registra de qual backup e momento veio o arquivo. Um nome como `backup-final.sqlite` não fornece sozinho nenhuma dessas garantias. Se pretende guardar várias versões, use nomes diferentes e anote o momento da criação, mantendo o procedimento de recusa a sobrescrever. Não abra o banco no editor de texto para “corrigir uma linha”: ele não é um CSV nem um arquivo Python.

## 7. Restaure em outra pasta e preserve o original

Crie um destino novo. Se o nome já existe, consulte o conteúdo e escolha outro; não reutilize automaticamente uma recuperação anterior.

```bash
mkdir "$HOME/recuperacao-sqlite"
```

**Só depois de confirmar que esse `mkdir` criou uma pasta vazia**, execute o bloco abaixo. Ele cria arquivos com exclusividade e compara os dados usando conexões somente de leitura:

```bash
python3 - <<'PY'
import shutil
import sqlite3
from pathlib import Path

origem = Path.home() / "aula-sqlite"
destino = Path.home() / "recuperacao-sqlite"
for entrada, saida in (
    (origem / "tarefas.py", destino / "tarefas.py"),
    (origem / "backups/primeira-copia.sqlite", destino / "tarefas.sqlite"),
):
    with entrada.open("rb") as leitura, saida.open("xb") as escrita:
        shutil.copyfileobj(leitura, escrita)

def consultar(caminho):
    con = sqlite3.connect(caminho.resolve().as_uri() + "?mode=ro", uri=True)
    try:
        assert con.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
        return con.execute(
            "SELECT id, titulo, concluida FROM tarefas ORDER BY id"
        ).fetchall()
    finally:
        con.close()

assert consultar(origem / "tarefas.sqlite") == consultar(destino / "tarefas.sqlite")
print("Conteúdo igual: original preservado e cópia recuperada legível.")
PY
python3 "$HOME/recuperacao-sqlite/tarefas.py" listar
```

Essa comparação pressupõe que você não alterou o original depois do backup. Se fez novas tarefas, uma diferença pode representar um backup mais antigo, não corrupção. Confira o momento e os registros esperados. Não sobrescreva o original para fazer a comparação “passar”. Agora o programa copiado procura o banco ao lado dele, por definição de `PASTA`; você executa conscientemente a recuperação.

**Checkpoint 7:** consulta na recuperação retorna as tarefas esperadas e o original ainda existe. Feche e reabra a recuperação mais uma vez. Para voltar a trabalhar no original, execute seu caminho original; não mova bancos entre pastas sem registrar qual é a versão utilizada. Transfira uma cópia validada a um destino independente quando o projeto começar a ter valor.

## Erros frequentes e como localizar a etapa

| Sintoma | Verificação específica | Próxima ação |
| --- | --- | --- |
| `SyntaxError` ou `IndentationError` | O arquivo termina no bloco principal? Houve perda de espaços? | Compare o trecho indicado com o programa; não edite o banco. |
| Banco ausente | Caminho do programa e pasta onde estão os dados | Use `iniciar` somente para o laboratório novo; procure a versão correta ao retomar. |
| `no such table` | `schema` e arquivo escolhido | Verifique se a preparação ocorreu nesse banco; não trate como falta de pacote. |
| Identificador inexistente | `listar` no mesmo programa | Use o identificador mostrado, preservando tarefas de outra execução. |
| `database is locked` | Outro processo aberto ou transação longa | Encerre somente a operação conhecida; não apague arquivos auxiliares. |
| `readonly database` | Permissão da pasta e mídia | Trabalhe numa pasta da sua conta; não aplique `chmod 777` ao armazenamento. |
| Arquivo não é um banco | Origem e backup selecionado | Preserve a tentativa e abra uma cópia verificada; extensão não garante formato. |
| Backup já existe | Nome informado | Escolha nome novo; a recusa evita perder uma cópia anterior. |

Um banco pequeno que funciona localmente não precisa ser convertido em servidor público para demonstrar utilidade. Antes de juntar ao [servidor JavaScript](javascript-servidor-local.md), estude autenticação, validação de entrada e concorrência da aplicação escolhida. O programa desta página não fornece API web e não aceita requisições de terceiros.

## Retomada e próximos projetos

Na próxima sessão, verifique o ambiente, consulte `python3 "$HOME/aula-sqlite/tarefas.py" listar` e anote o caminho do banco. Não rode o procedimento inicial inteiro por hábito. Guarde código e um exemplo fictício no Git; guarde bancos reais em backups privados. Acrescente novas funcionalidades uma por vez, mantendo uma cópia anterior e testes que confirmem conteúdo, não só mensagens de sucesso.

Exercícios úteis: implementar um comando para reabrir uma tarefa concluída usando um `UPDATE` parametrizado; criar um comando de contagem de tarefas abertas; exportar uma lista pública fictícia em JSON; escrever testes em um banco temporário sem alterar `tarefas.sqlite`. Mudar nomes de colunas ou criar tabelas relacionadas já exige pensar em migração. Faça essa evolução em um projeto de estudo separado até entender como preservar dados antigos.

Volte à [biblioteca de aulas](biblioteca.mdx) e registre na [ficha de evidências](../diagnostico/ficha-evidencias.mdx) quais comandos, ambiente e restauração você realmente verificou. Um banco funcionando não informa a versão do kernel, a qualidade da alimentação do hub nem o estado dos drivers de câmera.

**Validação desta página:** pesquisa documental em 11/10/2026; programa e recuperação executados em pasta temporária no notebook com Python 3.14.8, sem dados pessoais. Foram conferidos CRUD, rejeição, rollback, recusa de substituir backup e igualdade após recuperação. Não houve teste físico de telefone, Android, armazenamento defeituoso ou concorrência de aplicações reais.
