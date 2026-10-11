"""Generate original source packs from explicit markers in the course text.

Only --write mutates the allowlisted generated files. --check compares bytes.
Neither mode runs downloaded or extracted source, installs packages or contacts devices.
"""
import argparse
import hashlib
import io
import json
from pathlib import Path, PurePosixPath
import re
import zipfile

ROOT = Path(__file__).resolve().parent.parent
PACKS = json.loads((ROOT / "scripts/source-packs.json").read_text(encoding="utf-8"))
MARKER = re.compile(r"^<!-- example-file: ([a-z0-9-]+)/([^\s]+) -->$", re.MULTILINE)
LANGUAGES = {"python", "javascript", "c", "cpp", "makefile", "cmake", "bash"}


def safe_path(value):
    path = PurePosixPath(value)
    if (not value or path.is_absolute() or "\\" in value or "\x00" in value
            or any(part in ("", ".", "..") for part in value.split("/"))):
        raise ValueError(f"Unsafe generated path: {value!r}")
    return value


def marked_sources(pack):
    document = ROOT / "docs/aulas" / (pack["doc"] + ".md")
    text = document.read_text(encoding="utf-8")
    found = {}
    for marker in MARKER.finditer(text):
        identity, filename = marker.groups()
        if identity != pack["id"]:
            raise ValueError(f"Wrong pack marker in {document.name}: {identity}")
        safe_path(filename)
        fence = re.match(r"\n```([^\n]+)\n(.*?)^```[ \t]*$", text[marker.end():], re.MULTILINE | re.DOTALL)
        if not fence or fence[1] not in LANGUAGES:
            raise ValueError(f"Missing supported fence immediately after {filename}")
        if filename in found:
            raise ValueError(f"Duplicate source: {filename}")
        found[filename] = fence[2].encode("utf-8")
    if set(found) != set(pack["files"]):
        raise ValueError(f"Source set mismatch for {pack['id']}: {sorted(found)}")
    return found


def pack_files(pack):
    files = marked_sources(pack)
    commands = "\n".join(pack["commands"])
    readme = f"""# {pack['title']}

Código original da documentação Celular Linux, revisão 11/10/2026.
{pack['description']}

## Antes de executar

Leia /docs/aulas/{pack['doc']}/ no site ou docs/aulas/{pack['doc']}.md no repositório.
Siga a aula para instalar as ferramentas oficiais, identificar o ambiente e conferir os pré-requisitos.
Extraia numa pasta nova. Nenhum arquivo deste pacote é executado durante o download ou a extração.
{pack['limits']}

## Chamadas de referência

No terminal do ambiente preparado, dentro da pasta {pack['root']}:

```text
{commands}
```

Não há instalador automático. Confira e explique cada chamada na aula antes de executar.
Resultados no notebook de validação não certificam compatibilidade com todo celular ou placa.
Os dois sketches foram compilados anteriormente para os alvos documentados, sem upload físico.

## Integridade, origem e licença

MANIFEST.json contém SHA-256 e tamanho dos fontes, deste README e da licença.
O catálogo do site informa o SHA-256 do ZIP. Um hash verifica correspondência, não a confiança da origem.
Os fontes são copiados dos blocos identificados da aula e comparados pelo verificador do repositório.
Licença do código: MIT, veja LICENSE. A documentação do site tem licença própria CC BY-SA 4.0.
Conserve suas alterações em outra cópia; gerar os exemplos novamente substitui apenas os arquivos gerados.
"""
    files["README.md"] = readme.encode("utf-8")
    files["LICENSE"] = (ROOT / "LICENSE").read_bytes()
    manifest = {"schemaVersion": 1, "pack": pack["id"], "sourceDocument": f"docs/aulas/{pack['doc']}.md", "files": [
        {"path": name, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest()}
        for name, body in sorted(files.items())
    ]}
    files["MANIFEST.json"] = (json.dumps(manifest, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    return files


def archive(pack, files):
    stream = io.BytesIO()
    with zipfile.ZipFile(stream, "w", compression=zipfile.ZIP_STORED) as output:
        for filename, content in sorted(files.items()):
            info = zipfile.ZipInfo(safe_path(pack["root"]) + "/" + safe_path(filename), (1980, 1, 1, 0, 0, 0))
            info.create_system = 3
            info.external_attr = 0o100644 << 16
            info.compress_type = zipfile.ZIP_STORED
            output.writestr(info, content)
    return stream.getvalue()


def expected_files():
    generated = {}
    catalog = []
    if len({pack["id"] for pack in PACKS}) != len(PACKS):
        raise ValueError("Duplicate pack ID")
    for pack in PACKS:
        files = pack_files(pack)
        for filename, body in files.items():
            generated[f"examples/{safe_path(pack['id'])}/{safe_path(filename)}"] = body
        body = archive(pack, files)
        name = f"projeto-{pack['id']}.zip"
        generated[f"static/downloads/{name}"] = body
        catalog.append({key: pack[key] for key in ("id", "title", "doc", "root", "description", "limits")}
                       | {"filename": name, "bytes": len(body), "sha256": hashlib.sha256(body).hexdigest(), "sourceFiles": len(pack["files"])})
    generated["static/downloads/catalog.json"] = (json.dumps(catalog, ensure_ascii=False, indent=2) + "\n").encode("utf-8")
    return generated


def checked_target(filename):
    safe_path(filename)
    target = ROOT / filename
    # Reject every symlink in the output chain before *any* mutation.
    current = ROOT
    for part in PurePosixPath(filename).parts:
        current = current / part
        if current.is_symlink():
            raise ValueError(f"Refusing symlink in generated path: {filename}")
    if not target.resolve().is_relative_to(ROOT):
        raise ValueError(f"Output escapes repository: {filename}")
    return target


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument("--check", action="store_true")
    mode.add_argument("--write", action="store_true")
    args = parser.parse_args()
    generated = expected_files()
    targets = {filename: checked_target(filename) for filename in generated}
    expected = set(generated)
    existing = {str(p.relative_to(ROOT)) for folder in (ROOT / "examples", ROOT / "static/downloads")
                if folder.exists() for p in folder.rglob("*") if p.is_file()}
    if existing - expected:
        raise ValueError(f"Unexpected files preserved; review manually: {sorted(existing - expected)}")
    errors = []
    for filename, body in generated.items():
        target = targets[filename]
        if args.write:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(body)
        elif not target.exists() or target.read_bytes() != body:
            errors.append(filename)
    if errors:
        raise SystemExit("Generated sources or ZIP differ from documentation: " + ", ".join(errors))
    print(f"{len(PACKS)} source packs; {len(generated)} generated files; " + ("written." if args.write else "exact parity verified."))


if __name__ == "__main__":
    main()
