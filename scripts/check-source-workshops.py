"""Run only the repository's reviewed teaching projects in fresh notebook fixtures.

No OS package installation, device access, upload, LAN listener or system service changes.
The two sketches receive archive/source checks only; this script does not compile or flash them.
"""
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import shutil
import sqlite3
import subprocess
import sys
import tempfile
import zipfile

ROOT = Path(__file__).resolve().parent.parent
ENV = dict(os.environ)
for name in ("BASH_ENV", "ENV", "NODE_OPTIONS", "PYTHONPATH", "PYTHONSTARTUP"):
    ENV.pop(name, None)
checks = []


def run(arguments, cwd, expected=0):
    result = subprocess.run(arguments, cwd=cwd, env=ENV, capture_output=True, text=True, timeout=90)
    if result.returncode != expected:
        raise AssertionError(f"Unexpected status for {arguments[0]}: {result.returncode}; {result.stdout[-2000:]} {result.stderr[-2000:]}")
    return result


def passed(name, details):
    checks.append({"check": name, "status": "passed", "details": details})


def exercise_sqlite(folder):
    text = (ROOT / "docs/aulas/sqlite-primeiro-banco.md").read_text(encoding="utf-8")
    candidates = re.findall(r"^```python\n(.*?)^```", text, re.MULTILINE | re.DOTALL)
    code = next(body for body in candidates if "PASTA = Path(__file__)" in body and "CREATE TABLE" in body)
    source = folder / "tarefas.py"
    source.write_text(code, encoding="utf-8")
    command = [sys.executable, str(source)]
    run(command + ["iniciar"], folder)
    run(command + ["adicionar", "Revisar cabo"], folder)
    run(command + ["adicionar", "Estudar Python"], folder)
    run(command + ["adicionar", "Descartável"], folder)
    run(command + ["renomear", "2", "Ler 'O Alienista'"], folder)
    run(command + ["concluir", "1"], folder)
    run(command + ["excluir", "3"], folder)
    database = folder / "tarefas.sqlite"
    with sqlite3.connect(database) as connection:
        before = connection.execute("SELECT id, titulo, concluida FROM tarefas ORDER BY id").fetchall()
    assert before == [(1, "Revisar cabo", 1), (2, "Ler 'O Alienista'", 0)]
    # Exercise the exact published schema through the CLI, not a mirrored schema.
    for title in ("", " " * 121, " " * 1000 + "x", "x" * 121):
        result = subprocess.run(command + ["adicionar", title], cwd=folder, env=ENV, capture_output=True, text=True, timeout=10)
        assert result.returncode != 0
    result = run(command + ["testar-rollback"], folder)
    assert "Rollback confirmado" in result.stdout
    with sqlite3.connect(database) as connection:
        assert connection.execute("SELECT id, titulo, concluida FROM tarefas ORDER BY id").fetchall() == before
        assert connection.execute("PRAGMA integrity_check").fetchone()[0] == "ok"
    passed("sqlite-published-schema", "CRUD, apostrophe through UPDATE, empty/long/padded-long title rejection, rollback, integrity and preserved rows in fresh fixture.")


def main():
    for executable in ("python3", "node", "bash", "cmake", "ctest"):
        if not shutil.which(executable):
            raise SystemExit(f"Required existing tool missing: {executable}; no package will be installed by this script.")
    run([sys.executable, "scripts/package-examples.py", "--check"], ROOT)
    catalog = json.loads((ROOT / "static/downloads/catalog.json").read_text(encoding="utf-8"))
    with tempfile.TemporaryDirectory(prefix="source-workshops-") as temporary:
        base = Path(temporary)
        projects = {}
        for pack in catalog:
            body = (ROOT / "static/downloads" / pack["filename"]).read_bytes()
            assert len(body) == pack["bytes"] and hashlib.sha256(body).hexdigest() == pack["sha256"]
            with zipfile.ZipFile(ROOT / "static/downloads" / pack["filename"]) as archive:
                for info in archive.infolist():
                    assert info.filename.startswith(pack["root"] + "/")
                    assert not Path(info.filename).is_absolute() and ".." not in Path(info.filename).parts
                    assert (info.external_attr >> 16) & 0o170000 == 0o100000
                assert archive.testzip() is None
                archive.extractall(base)
            project = base / pack["root"]
            projects[pack["id"]] = project
            manifest = json.loads((project / "MANIFEST.json").read_text(encoding="utf-8"))
            for item in manifest["files"]:
                source = (project / item["path"]).read_bytes()
                assert len(source) == item["bytes"] and hashlib.sha256(source).hexdigest() == item["sha256"]
            passed("archive-" + pack["id"], "SHA-256, bytes, safe regular paths, ZIP integrity and manifest verified after extraction; no hardware execution.")
        project = projects["python"]
        result = run([sys.executable, "-m", "unittest", "-v", "teste_inventario.py"], project)
        assert "Ran 4 tests" in result.stderr and "OK" in result.stderr
        run([sys.executable, "inventario.py", "--help"], project)
        passed("python-downloaded-source", "Four unittest cases and help executed from extracted original ZIP.")
        project = projects["javascript"]
        run(["node", "--check", "servidor.cjs"], project)
        result = run(["node", "--test", "teste-servidor.cjs"], project)
        assert "pass 5" in result.stdout
        passed("node-downloaded-source", "Five no-socket Node tests and syntax check executed from extracted original ZIP.")
        project = projects["c-cpp"]
        run(["cmake", "-S", ".", "-B", "build-cmake"], project)
        run(["cmake", "--build", "build-cmake"], project)
        result = run(["ctest", "--test-dir", "build-cmake", "--output-on-failure"], project)
        assert "100% tests passed" in result.stdout and "out of 3" in result.stdout
        passed("cpp-downloaded-source", "Fresh CMake configure/build and three CTest cases from extracted ZIP, without system install.")
        project = projects["bash"]
        run(["bash", "-n", "relatorio.sh"], project)
        run(["bash", "relatorio.sh", "--help"], project)
        source = project / "minhas notas.txt"
        source.write_text("Primeira\n\n  \nÚltima sem quebra", encoding="utf-8")
        before = source.read_bytes()
        result = run(["bash", "relatorio.sh", source.name], project)
        assert "Linhas: 4" in result.stdout and "Anotações: 2" in result.stdout
        assert source.read_bytes() == before
        run(["bash", "relatorio.sh"], project, expected=2)
        run(["bash", "relatorio.sh", "ausente.txt"], project, expected=1)
        run(["bash", "relatorio.sh", source.name, "extra"], project, expected=2)
        (project / "link.txt").symlink_to(source)
        run(["bash", "relatorio.sh", "link.txt"], project, expected=1)
        passed("bash-downloaded-source", "Syntax, help, whitespace/path/last line, unchanged input and failure statuses including symbolic link checked.")
        sqlite_folder = base / "sqlite-fresh"
        sqlite_folder.mkdir()
        exercise_sqlite(sqlite_folder)
    report = {"generatedAt": datetime.now(timezone.utc).isoformat(), "scope": "Fresh temporary notebook fixtures from published ZIPs and SQLite document; all removed after test.", "versions": {"python": sys.version.split()[0], "sqlite": sqlite3.sqlite_version, "node": run(["node", "--version"], ROOT).stdout.strip(), "bash": run(["bash", "--version"], ROOT).stdout.splitlines()[0], "cmake": run(["cmake", "--version"], ROOT).stdout.splitlines()[0]}, "checks": checks, "limits": ["No phone, Android or PRoot test", "No host package/service/init/firewall change", "No LAN or hardware upload", "Uno and ESP32 only source/archive parity in this run; previous compilation recorded separately", "No production deployment or security certification"]}
    (ROOT / "reports/source-workshops.json").write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"{len(checks)} workshop verification groups passed; report written; temporary fixtures removed.")


if __name__ == "__main__":
    main()
