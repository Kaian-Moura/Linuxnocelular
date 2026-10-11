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
