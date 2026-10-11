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
