---
title: "Aula de Python: um projeto completo de inventário"
description: Escreva uma ferramenta de terminal que guarda itens em JSON, usando editor, ambiente virtual, testes e backup.
sidebar_position: 10
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai construir um **inventário manual de materiais**: cadastrar cabos, adaptadores ou peças, listar quantidades e guardar os dados para outro dia. O programa **não examina o hardware**, não lê identificadores do aparelho e não acessa a rede. Você escreve os nomes dos itens que deseja organizar.

Ao terminar, sua pasta terá código-fonte, dados em JSON, testes e um manifesto que explica como executar o projeto. Isso é um projeto pequeno completo: resolver um problema, tratar entradas incorretas, verificar o comportamento e preservar o trabalho. Dificuldade: iniciante, com uma segunda parte intermediária. Reserve aproximadamente **2–3 horas**, podendo dividir a aula em dois dias. O tempo depende da familiaridade com o teclado e o terminal.

## 1. Escolha onde o programa vai funcionar

Esta aula usa uma shell Linux em **um** destes ambientes:

| Ambiente escolhido | Onde abrir o terminal | O que permanece instalado |
|---|---|---|
| Android com Termux | Ícone Termux do Android, fora de qualquer PRoot | Android continua sendo o sistema principal |
| Debian/Ubuntu, nativo ou já preparado sobre Android | Terminal da distribuição, ou SSH já conectado a ela | Depende do caminho que você instalou |
| Alpine/postmarketOS | Terminal do sistema, ou SSH já conectado a ele | Linux nativo quando essa é a instalação do aparelho |

Se ainda não tem um terminal, faça primeiro a [aula de Termux desde a instalação](primeiro-projeto-termux.md), ou escolha uma rota na [biblioteca de aulas](biblioteca.mdx). Não precisa fazer root para programar no Termux/PRoot. Usar `root` num PRoot também não concede acesso administrativo ao Android.

Os comandos seguintes são executados **no ambiente escolhido**, como usuário comum, e não no PowerShell local, ADB ou console Python. Quando você acessa por SSH, está escrevendo na máquina remota até executar `exit`. Não instale ferramentas no notebook supondo que isso as instalará no telefone.

Confirme a pasta e a conta:

```bash
pwd
id
uname -m
```

`pwd` mostra a pasta atual; `id`, a conta; `uname -m`, a arquitetura. O resultado pode ser `aarch64` num telefone e `x86_64` no notebook. O nosso código Python não fixa uma arquitetura, mas o interpretador instalado precisa funcionar nesse ambiente.

Tenha internet **somente para instalar as ferramentas**, espaço livre e um destino de backup fora do telefone. Evite iniciar atualizações extensas com bateria quase vazia. Os dados desta aula podem descrever objetos pessoais: não coloque senhas, números de série, documentos ou credenciais no inventário de prática.

## 2. Obtenha Python e o editor da origem correta

Python é o programa que lê e executa seu código. Nano é um editor de texto. Um **pacote** instala esses programas a partir dos repositórios da distribuição, com dependências e verificações próprias. Aqui o download acontece pelo gerenciador; não é preciso procurar um “Python APK” num site aleatório.

### Android/Termux

Para instalar o aplicativo Termux, siga os passos de F-Droid da [primeira aula](primeiro-projeto-termux.md#1-instale-termux-pelo-f-droid), incluindo APK, permissões e abertura. Se já o utiliza, preserve os projetos existentes; não limpe dados nem troque a origem do APK para esta aula.

**Dentro do Termux, fora do Debian:**

```bash
pkg update
pkg install python python-pip python-ensurepip-wheels nano
```

O Python do Termux tem adaptações para Android. Os dois pacotes auxiliares tornam explícita a preparação para criar um ambiente virtual com `pip`, conforme a [receita oficial do pacote](https://github.com/termux/termux-packages/blob/master/packages/python/build.sh). Não use `sudo` nesse bloco.

### Debian/Ubuntu

**No terminal dessa distribuição**, com administração já configurada:

```bash
sudo apt update
sudo apt install python3 python3-venv nano
```

`python3-venv` fornece o suporte correspondente ao Python da distribuição; veja o [pacote Debian](https://packages.debian.org/trixie/python3-venv). Dentro de um PRoot em que você já entrou como administrador simulado, retire **somente o `sudo` dessas duas linhas de instalação**. Não confunda isso com obter root no Android.

### Alpine/postmarketOS

**No terminal Alpine/postmarketOS**, use a ferramenta administrativa já configurada:

```bash
doas apk update
doas apk add python3 py3-pip nano
```

Se o port usa `sudo` em vez de `doas`, troque apenas esse prefixo. Se nenhuma ferramenta está configurada, resolva a conta administrativa pelo procedimento da instalação; não invente uma senha. Os pacotes precisam ser da **mesma release** do seu sistema.

Leia o resumo antes de confirmar a instalação. Em `sudo`/`doas`, a senha pode não mostrar asteriscos; digite e pressione Enter. Erros de rede, assinatura, espaço ou pacote ausente precisam ser resolvidos antes de continuar, usando o [guia de erros](../diagnostico/erros-para-iniciantes.md). Não adicione repositórios Debian ao Termux ou `edge` a um Alpine estável para contornar um erro.

Em qualquer uma das três rotas, confirme:

```bash
python3 --version
nano --version
```

**Checkpoint 1:** duas versões aparecem e o prompt volta. Use um Python 3 mantido pelo fornecedor do ambiente. O projeto usa recursos disponíveis a partir de Python 3.9; isso é um requisito de linguagem, não uma recomendação de instalar uma versão antiga sem manutenção. Para instalar Python **no notebook Windows/macOS**, consulte as origens e os instaladores em [desenvolvimento](../projetos/desenvolvimento.md); os caminhos dessa plataforma diferem desta aula.

## 3. Crie uma pasta nova e um ambiente virtual

Um **ambiente virtual**, ou `venv`, separa o Python e os pacotes de um projeto dos de outros projetos. Ele não é uma máquina virtual nem protege o sistema contra código malicioso. Seu programa continua podendo acessar os arquivos permitidos à sua conta. O [tutorial Python](https://docs.python.org/3/tutorial/venv.html) explica essa separação.

**No terminal escolhido:**

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/inventario-python"
cd "$HOME/projetos/inventario-python"
pwd
ls -la
```

`$HOME` representa a pasta da sua conta; não o substitua por um nome. O segundo `mkdir` avisa se a pasta já existe. Nesse caso, **não prossiga substituindo arquivos**: para retomar um projeto dessa aula, vá à etapa 11; para outra tentativa, escolha uma pasta nova e mantenha esse novo caminho nas etapas seguintes.

Crie o ambiente virtual apenas na pasta nova:

```bash
python3 -m venv .venv
.venv/bin/python --version
.venv/bin/python -m pip --version
```

`-m venv` pede ao Python que execute o módulo de criação. `.venv` é a pasta escolhida; `.venv/bin/python` é o interpretador dela. `pip --version` verifica a ferramenta de pacotes **desse ambiente**, sem baixar pacotes. Nesta aula, todas as bibliotecas utilizadas já vêm com Python.

Se surgir “ensurepip is not available”, confira o pacote `python3-venv` no Debian ou os auxiliares indicados para Termux e a versão realmente executada. Não use `--break-system-packages`, não baixe `get-pip.py` para remendar o Python do sistema e não copie uma `.venv` de outra máquina.

**Checkpoint 2:** os comandos mostram a versão e um caminho de `pip` dentro de `inventario-python/.venv`. Vamos usar esse caminho explícito, sem ativação: funciona também após fechar e abrir o terminal. Você não precisa decorar `source`, nem depende de um prefixo visual no prompt.

## 4. Aprenda a criar e salvar um arquivo

**No prompt do terminal:**

```bash
nano primeiro.py
```

O editor ocupa a tela. **Dentro do nano**, cole estas duas linhas, sem as crases do bloco:

<!-- example-file: python/primeiro.py -->
```python
nome = "Meu inventário"
print(nome)
```

`nome` é uma variável: guarda um valor. Aspas delimitam texto; `print` mostra esse texto. Para salvar, pressione **Ctrl+O**, confira `primeiro.py`, pressione Enter e depois **Ctrl+X**. No Termux, a tecla extra **CTRL** seguida de `o` envia Ctrl+O. `^O` no rodapé significa esse atalho; não digite o caractere `^`.

De volta ao terminal:

```bash
cat primeiro.py
.venv/bin/python primeiro.py
```

**Saída ilustrativa:** `Meu inventário`. Se aparece `>>>`, você entrou no console Python, geralmente por executar apenas `python`. Digite `exit()` ali para voltar ao shell. Se o programa não foi salvo, reabra nano e confira o arquivo; não execute o bloco Python diretamente no shell.

## 5. Escreva a ferramenta de inventário

Agora crie outro arquivo; mantenha `primeiro.py` como seu primeiro exercício:

```bash
nano inventario.py
```

**Dentro do nano**, cole todo o código abaixo. Preserve os espaços no início das linhas: em Python a indentação define os blocos. Salve com Ctrl+O, Enter e Ctrl+X.

<!-- example-file: python/inventario.py -->
```python
import argparse
import json
from pathlib import Path
import sys
import tempfile


def validar(dados):
    if not isinstance(dados, dict) or dados.get("versao") != 1:
        raise ValueError("Formato do inventário não reconhecido.")
    itens = dados.get("itens")
    if not isinstance(itens, list):
        raise ValueError("O campo itens precisa ser uma lista.")
    for item in itens:
        if not isinstance(item, dict):
            raise ValueError("Há um item inválido no arquivo.")
        nome = item.get("nome")
        quantidade = item.get("quantidade")
        if not isinstance(nome, str) or not 1 <= len(nome.strip()) <= 80:
            raise ValueError("Cada item precisa de nome com 1 a 80 caracteres.")
        if type(quantidade) is not int or not 1 <= quantidade <= 9999:
            raise ValueError("Cada quantidade precisa estar entre 1 e 9999.")
    return dados


def ler(arquivo):
    if not arquivo.exists():
        return {"versao": 1, "itens": []}
    return validar(json.loads(arquivo.read_text(encoding="utf-8")))


def incluir(dados, nome, quantidade):
    nome = nome.strip()
    if not 1 <= len(nome) <= 80:
        raise ValueError("Digite um nome com 1 a 80 caracteres.")
    if type(quantidade) is not int or not 1 <= quantidade <= 9999:
        raise ValueError("Quantidade precisa estar entre 1 e 9999.")
    novo = {"versao": 1, "itens": [dict(item) for item in validar(dados)["itens"]]}
    for item in novo["itens"]:
        if item["nome"].casefold() == nome.casefold():
            item["quantidade"] += quantidade
            return validar(novo)
    novo["itens"].append({"nome": nome, "quantidade": quantidade})
    return validar(novo)


def gravar(arquivo, dados):
    validar(dados)
    temporario = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w", encoding="utf-8", dir=arquivo.parent,
            prefix=".inventario-", suffix=".tmp", delete=False
        ) as saida:
            temporario = Path(saida.name)
            json.dump(dados, saida, ensure_ascii=False, indent=2)
            saida.write("\n")
        temporario.replace(arquivo)
    finally:
        if temporario is not None and temporario.exists():
            temporario.unlink()


def main():
    parser = argparse.ArgumentParser(description="Inventário manual de materiais.")
    parser.add_argument("--arquivo", type=Path,
                        default=Path(__file__).resolve().with_name("inventario.json"))
    comandos = parser.add_subparsers(dest="comando", required=True)
    adicionar = comandos.add_parser("adicionar", help="Cadastrar ou somar um item")
    adicionar.add_argument("nome")
    adicionar.add_argument("--quantidade", type=int, default=1)
    comandos.add_parser("listar", help="Mostrar os itens salvos")
    comandos.add_parser("resumo", help="Contar tipos e unidades")
    args = parser.parse_args()
    try:
        dados = ler(args.arquivo)
        if args.comando == "adicionar":
            dados = incluir(dados, args.nome, args.quantidade)
            gravar(args.arquivo, dados)
            print(f"Salvo em: {args.arquivo}")
        elif args.comando == "listar":
            if not dados["itens"]:
                print("Inventário vazio.")
            for item in dados["itens"]:
                print(f'{item["quantidade"]:4}  {item["nome"]}')
        else:
            print(f'Tipos: {len(dados["itens"])}')
            print(f'Unidades: {sum(item["quantidade"] for item in dados["itens"])}')
    except (OSError, UnicodeError, ValueError) as erro:
        print(f"Erro: {erro}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
```

### Entenda as partes, antes de cadastrar

Os `import` trazem ferramentas da biblioteca padrão. `Path` representa caminhos; `json` converte dados entre objetos Python e texto JSON; `argparse` interpreta os argumentos da linha de comando. `tempfile` cria um arquivo temporário com nome próprio. Nenhum desses imports instala um pacote de terceiros.

Cada `def` define uma função. `validar` verifica a estrutura do arquivo; `ler` devolve um inventário vazio somente quando o arquivo **não existe**. Um arquivo existente danificado provoca erro, em vez de ser tratado como vazio e substituído. `incluir` cria uma nova lista e soma nomes iguais desconsiderando maiúsculas. `gravar` escreve num temporário da mesma pasta e depois o coloca no lugar do JSON. Isso evita substituir o original por uma escrita parcial comum; não substitui backup nem garante sobrevivência a qualquer perda de energia.

`main` escolhe a ação solicitada. O trecho `if __name__ ...` executa a CLI quando você chama o arquivo, mas deixa os testes importarem as funções sem cadastrar nada. `return 1` indica falha ao shell; sucesso retorna zero. As mensagens técnicas do próprio sistema, como “Permission denied”, podem estar em outro idioma.

A [referência de argparse](https://docs.python.org/3/library/argparse.html) descreve ajuda e subcomandos, e a [referência JSON](https://docs.python.org/3/library/json.html) explica as conversões. Nosso programa é original da aula; as bibliotecas são ferramentas, não um inventário pronto baixado da internet.

## 6. Use a CLI e confira os dados

**No terminal, na pasta do projeto:**

```bash
.venv/bin/python inventario.py --help
.venv/bin/python inventario.py listar
.venv/bin/python inventario.py adicionar "Cabo HDMI" --quantidade 2
.venv/bin/python inventario.py adicionar "Adaptador USB" --quantidade 1
.venv/bin/python inventario.py listar
.venv/bin/python inventario.py resumo
cat inventario.json
```

`--help` não cadastra itens. As aspas fazem `Cabo HDMI` chegar como **um** nome, mesmo com espaço. Na primeira listagem de uma pasta nova, aparece “Inventário vazio.” A inclusão cria `inventario.json` ao lado do programa, independentemente da pasta de onde você o chamar.

**Saída ilustrativa do resumo após esses dois cadastros:**

```text
Tipos: 2
Unidades: 3
```

No JSON, as chaves `nome` e `quantidade` identificam os campos; `[]` delimitam a lista de itens e `{}` delimitam cada objeto. É um arquivo legível, mas editar manualmente requer manter aspas e vírgulas corretas. Para esta etapa, cadastre pelo programa.

Teste também uma entrada incorreta:

```bash
.venv/bin/python inventario.py adicionar "Peça de teste" --quantidade 0
echo $?
.venv/bin/python inventario.py resumo
```

O erro esperado informa a faixa válida; `echo $?` deve ser **a linha imediatamente seguinte** e mostrar `1`. Ele lê o estado do último comando, não um histórico de erros. O resumo continua com os valores anteriores: falha de validação não deve acrescentar o item.

**Checkpoint 3:** você consegue cadastrar, fechar o programa e listar de novo. Experimente `"cabo hdmi" --quantidade 1`: o nome existente recebe mais uma unidade. Não use esse exemplo se quer manter exatamente o resumo ilustrativo anterior.

## 7. Escreva testes que não alteram seu inventário

Um teste compara comportamento observado e esperado. Aqui vamos verificar soma de nomes, rejeição de quantidade, leitura/escrita e tratamento de JSON danificado. Os arquivos de teste ficam em uma pasta temporária própria, não em `inventario.json`.

**No prompt:**

```bash
nano teste_inventario.py
```

**Dentro do editor:**

<!-- example-file: python/teste_inventario.py -->
```python
import json
from pathlib import Path
import tempfile
import unittest
from inventario import gravar, incluir, ler


class TesteInventario(unittest.TestCase):
    def test_soma_sem_alterar_original(self):
        original = {"versao": 1, "itens": [{"nome": "Cabo", "quantidade": 2}]}
        novo = incluir(original, "cabo", 3)
        self.assertEqual(novo["itens"][0]["quantidade"], 5)
        self.assertEqual(original["itens"][0]["quantidade"], 2)

    def test_quantidade_invalida(self):
        with self.assertRaises(ValueError):
            incluir({"versao": 1, "itens": []}, "Cabo", 0)

    def test_arquivo_guarda_acentos(self):
        with tempfile.TemporaryDirectory() as pasta:
            arquivo = Path(pasta) / "dados.json"
            dados = incluir(ler(arquivo), "Extensão", 2)
            gravar(arquivo, dados)
            self.assertEqual(ler(arquivo), dados)
            self.assertIn("Extensão", arquivo.read_text(encoding="utf-8"))

    def test_json_danificado_nao_e_apagado(self):
        with tempfile.TemporaryDirectory() as pasta:
            arquivo = Path(pasta) / "dados.json"
            arquivo.write_text("{incompleto", encoding="utf-8")
            with self.assertRaises(json.JSONDecodeError):
                ler(arquivo)
            self.assertEqual(arquivo.read_text(encoding="utf-8"), "{incompleto")


if __name__ == "__main__":
    unittest.main()
```

Salve e saia. **No terminal:**

```bash
.venv/bin/python -m unittest -v teste_inventario.py
```

**Saída ilustrativa abreviada:** `Ran 4 tests ... OK`. Um `FAIL` significa que uma comparação não bateu; `ERROR` significa que o teste não conseguiu completar. Leia o nome do teste e as últimas linhas da mensagem. Os testes não certificam todo comportamento possível: não simulam bateria descarregando, uso simultâneo ou falhas de armazenamento. A [documentação unittest](https://docs.python.org/3/library/unittest.html) explica os métodos usados.

**Exercício:** copie a estrutura de `test_quantidade_invalida` para testar um nome contendo apenas espaços. Execute de novo e confirme cinco testes. Não altere os valores esperados só para esconder uma falha.

## 8. Guarde um manifesto e faça uma mudança controlada

**No terminal:**

```bash
nano MANIFESTO.md
```

No editor, escreva este registro, preenchendo a versão com a saída real de `.venv/bin/python --version`:

```text
# Inventário manual
Objetivo: organizar materiais cadastrados por mim; não detectar hardware.
Python usado: preencher com a versão observada.
Dependências externas: nenhuma; somente biblioteca padrão.
Executar: .venv/bin/python inventario.py listar
Testar: .venv/bin/python -m unittest -v teste_inventario.py
Dados: inventario.json; manter cópia fora deste aparelho.
Limite: uma execução de cadastro por vez; não usar como banco multiusuário.
```

O manifesto comunica requisitos que você poderia esquecer. Não registre senhas, endereço SSH ou informações pessoais nele. Antes de modificar o programa:

```bash
cp -i inventario.py inventario-versao-1.py
nano inventario.py
```

`cp -i` pergunta antes de substituir um destino. Se a cópia já existe, responda `n` e preserve-a; use outro nome para uma nova versão. No editor, encontre a descrição “Inventário manual de materiais.” e troque por uma descrição sua. Execute `--help` e os testes novamente. Você fez uma mudança pequena e consegue provar que o programa ainda funciona.

Para voltar, preserve a versão alterada com outro nome e copie a versão anterior **somente sobre o arquivo desse projeto**, usando `cp -i`. Não há motivo para reinstalar Python, apagar dados do Termux ou restaurar o telefone por causa de um erro de código.

## 9. Erros comuns com uma ação concreta

| Sintoma | Verifique | Como continuar |
|---|---|---|
| `SyntaxError` ou `IndentationError` | Arquivo e linha citados; aspas comuns e indentação | Reabra esse arquivo no nano, corrija e execute novamente |
| `.venv/bin/python: No such file` | `pwd`, `ls -la`; ambiente virtual realmente criado | Volte à pasta certa; se ainda não existe, crie ali o venv |
| `unrecognized arguments` | Ordem e nome das opções | Use `--help`; `--arquivo` vem **antes** do subcomando |
| Erro de JSON | JSON foi editado ou interrompido? Há backup? | Preserve o arquivo; restaure uma cópia verificada ou trabalhe com outro arquivo |
| `Permission denied` ao gravar | Pasta e conta atuais | Trabalhe na sua pasta pessoal; não use `sudo` para criar dados do projeto |
| Nome com espaço vira argumentos separados | Aspas na chamada | Use `"Cabo HDMI"`, não aspas tipográficas de processador de texto |

Para experimentar outro arquivo sem substituir o principal:

```bash
.venv/bin/python inventario.py --arquivo laboratorio.json adicionar "Item de laboratório"
.venv/bin/python inventario.py --arquivo laboratorio.json listar
```

Isso cria um **novo conjunto de dados** na pasta atual. Um erro de JSON não autoriza apagar o arquivo original: procure a linha inválida em uma cópia ou recupere o backup. Não rode dois cadastros em paralelo; a troca de arquivo não impede perda de atualização concorrente.

## 10. Faça backup e teste a restauração numa pasta separada

Feche as execuções de cadastro. Confira arquivos e versões salvos. O backup inclui código, dados e manifesto; exclui `.venv`, pois ela será reconstruída para a máquina de destino.

**No terminal:**

```bash
mkdir -p "$HOME/backups"
tar --exclude='.venv' --exclude='__pycache__' -czf "$HOME/backups/inventario-python-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$HOME/projetos" inventario-python
ls -lh "$HOME/backups"
```

O nome contém data/hora para separar as cópias. Espere o prompt voltar; um erro do `tar` precisa ser investigado. Veja [backup e exportação](../preparacao/backup.md) para copiar o arquivo para outro equipamento. No Termux, exportar para armazenamento compartilhado não é a mesma coisa que criar um backup fora do telefone; limpar os dados do aplicativo ou perder o aparelho pode eliminar cópias locais.

Para verificar um arquivo específico, **substitua `NOME_REAL.tar.gz` pelo nome observado no `ls`**, mantendo as aspas. Não cole o marcador literalmente:

```bash
tar -tzf "$HOME/backups/NOME_REAL.tar.gz"
mkdir "$HOME/restauro-inventario-aula"
tar -xzf "$HOME/backups/NOME_REAL.tar.gz" -C "$HOME/restauro-inventario-aula"
cd "$HOME/restauro-inventario-aula/inventario-python"
python3 -m venv .venv
.venv/bin/python -m unittest -v teste_inventario.py
.venv/bin/python inventario.py listar
```

A pasta de restauração deve ser **nova**; se já existe, escolha outra. Extraia somente o arquivo que você acabou de produzir e conferir. Esses comandos não substituem o projeto original. A listagem deve mostrar seus itens e os testes devem passar; isso demonstra recuperação dos dados nesse ambiente, não compatibilidade de todas as bibliotecas em outra plataforma.

## 11. Retome no dia seguinte

Abra o mesmo ambiente e a mesma conta. Não execute os passos de criação sobre a pasta existente:

```bash
cd "$HOME/projetos/inventario-python"
pwd
.venv/bin/python --version
.venv/bin/python inventario.py listar
.venv/bin/python -m unittest -v teste_inventario.py
```

Não precisa internet para usar o programa. Se o Python da distribuição mudou e o venv deixou de funcionar, primeiro preserve fonte e JSON. Renomeie a `.venv` antiga para um nome livre, reconstrua com o Python mantido do ambiente e teste; não copie o venv do notebook por cima. Pacotes binários futuros também terão requisitos de arquitetura e libc.

Seu teste final é: cadastrar um item, listar, fechar o terminal, reabrir, listar o mesmo item, executar os testes e recuperar uma cópia separada. Registre no manifesto a data e o resultado reais. **Próximos exercícios:** implementar remoção por nome com confirmação, exportar CSV ou ordenar a listagem. Cada recurso deve ganhar um teste antes de você confiar seus dados a ele.

## Fontes e limites de verificação

Os blocos de programa desta página foram extraídos e executados **num notebook Linux x86_64, com Python 3.14.8**, em pastas temporárias em 11/10/2026. Os quatro testes passaram; a CLI cadastrou/listou itens, rejeitou quantidade zero e preservou um JSON danificado. Uma cópia foi restaurada em pasta separada, com venv novo e testes aprovados. Isso valida os exemplos nesse ambiente; não é um teste de instalação em Termux, Debian, Alpine ou no telefone.

Verificação documental em **11/10/2026**: [instalação Termux](https://github.com/termux/termux-app#installation), [pacote Python Termux](https://github.com/termux/termux-packages/blob/master/packages/python/build.sh), [venv](https://docs.python.org/3/tutorial/venv.html), [argparse](https://docs.python.org/3/library/argparse.html), [JSON](https://docs.python.org/3/library/json.html), [unittest](https://docs.python.org/3/library/unittest.html) e [pacote Debian venv](https://packages.debian.org/trixie/python3-venv). Os exemplos são originais desta documentação. Compatibilidade com seu port, teclado, armazenamento e versão instalada precisa dos checkpoints no aparelho; esta página não registra teste de hardware.
