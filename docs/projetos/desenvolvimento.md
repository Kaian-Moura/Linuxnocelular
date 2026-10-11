---
title: Programação — Python, JavaScript, C e C++
sidebar_position: 1
description: Monte um ambiente de desenvolvimento ARM com projetos isolados e sem misturar repositórios.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, dificuldade e requisitos

**Dificuldade:** inicial a intermediária. **Resultado:** três programas executados no telefone, projetos versionados e dependências separadas. Funciona em Termux, Debian/Ubuntu sobre PRoot/chroot e Linux nativo que ofereça os pacotes; os nomes e bibliotecas diferem. Não exige interface gráfica.

Tenha terminal estável, alguns gigabytes livres para compiladores/dependências, rede e backup. Trabalhe como usuário comum; use privilégios apenas para instalar pacotes no Linux nativo. Conheça diretório, arquivo, shell e a diferença entre código-fonte e executável. ARM64 é a arquitetura do host; o compilador pode gerar programas para outro alvo, como AVR ou ESP32, quando a toolchain apropriada existe.

:::warning Repositórios adicionais não significam acesso ilimitado
Termux usa pacotes feitos para Android/bionic; Alpine usa musl; Debian usa glibc. Não misture esses repositórios nem releases de uma mesma distribuição. Um pacote x86_64 não vira ARM64 por ser instalado como root. Consulte origem, assinatura, arquitetura e manutenção antes de adicionar uma fonte.
:::

## 1. Instalar somente o bloco correspondente ao ambiente

**Termux, fora do PRoot:**

```bash
pkg update
pkg install python python-pip python-ensurepip-wheels nodejs clang make cmake git nano
```

**Debian/Ubuntu, Linux real ou ambiente correspondente:**

```bash
sudo apt update
sudo apt install python3 python3-venv python3-pip nodejs npm build-essential cmake git nano
```

No administrador simulado do PRoot, retire o `sudo` somente da instalação. **Alpine/postmarketOS com repositórios da release correta:**

```bash
sudo apk update
sudo apk add python3 py3-pip nodejs npm build-base cmake git nano
```

`build-essential` ou `build-base` reúne compilador e ferramentas; Termux utiliza Clang. Pacotes podem estar em `community` no Alpine: confirme que o repositório oficial é da **mesma release**, sem adicionar `edge` a um sistema estável para obter um editor.

**Verificação:** `python3 --version`, `node --version`, `npm --version`, `c++ --version` e `git --version`. Registre essas versões no projeto. Não prometa a mesma versão Node entre os três ambientes.

## 2. Python com ambiente virtual

```bash
mkdir -p "$HOME/projetos/python-mini-pc"
cd "$HOME/projetos/python-mini-pc"
python3 -m venv .venv
. .venv/bin/activate
python -c 'import platform; print("Python:", platform.python_version(), "CPU:", platform.machine())'
```

`venv` separa as bibliotecas desse projeto das bibliotecas do sistema. A ativação ajusta o PATH desta shell; não altera o Android ou o kernel. Para instalar uma dependência, use `python -m pip install NOME` dentro do venv, depois de revisar origem e versão. Não utilize `sudo pip`, `--break-system-packages` ou atualização global de pip como rotina.

Para registrar as dependências instaladas:

```bash
python -m pip freeze > requirements.txt
deactivate
```

`freeze` gera um inventário de versões, não uma garantia de disponibilidade futura de wheels ARM64. Bibliotecas com extensões C podem exigir headers, compiler e bibliotecas específicas. Um wheel `manylinux` pressupõe glibc; Alpine e Termux podem precisar de outro artefato ou compilação própria.

## 3. JavaScript com Node.js

```bash
mkdir -p "$HOME/projetos/js-mini-pc"
cd "$HOME/projetos/js-mini-pc"
npm init -y
printf '%s\n' 'console.log("JavaScript no smartphone", process.arch);' > index.js
node index.js
```

A saída deve incluir a arquitetura visível ao Node. Dependências locais entram em `node_modules`; `package.json` descreve o projeto e `package-lock.json` registra a resolução. Use `npm ci` para reproduzir um lockfile existente e `npm install PACOTE` para uma adição deliberada. Scripts de instalação de pacotes podem executar código: revise projetos desconhecidos antes de instalar.

JavaScript no navegador e Node.js não têm as mesmas APIs. Electron e editores distribuídos como binário podem não oferecer ARM64/musl/Android. Se um editor gráfico não tem build adequado, utilize um editor de terminal ou desenvolva pelo notebook via SSH, mantendo o código e a execução no telefone.

## 4. C e C++ com compilação local

Crie um arquivo novo `ola.cpp` numa pasta de projeto:

```cpp
#include <iostream>
int main() {
    std::cout << "C++ executado no mini PC\n";
    return 0;
}
```

No mesmo diretório:

```bash
c++ -std=c++20 -Wall -Wextra -O2 ola.cpp -o ola
./ola
```

`-std` seleciona o padrão; `-Wall -Wextra` habilita avisos úteis; `-O2` otimiza; `-o` define o novo executável. Este programa usa apenas biblioteca padrão; projetos que dependem de OpenGL, câmera ou drivers precisam dos componentes do host. Executável compilado no Termux não deve ser distribuído como se fosse Debian ARM64 genérico.

## 5. Versionamento, backup e limites de recursos

Inicialize Git somente no diretório do projeto: `git init`, revise `git status` e adicione seus arquivos de fonte. Coloque `.venv/`, `node_modules/`, artefatos de compilação e `.env` com segredos no `.gitignore`. Git local não é backup externo; exporte ou envie para um repositório que você controla, depois de revisar o diff para não vazar tokens.

Comece compilações com poucas tarefas paralelas, por exemplo `cmake --build build --parallel 2`. Usar todas as CPUs pode aquecer o telefone e deixar o desktop sem resposta. Monitore RAM, armazenamento e temperatura; uma compilação que dispara OOM precisa de ajuste de recursos, não de desativar proteções térmicas.

## Erros, alternativas, rollback e testes finais

`Exec format error` pede conferir arquitetura; `No such file` num binário existente pode ser loader ausente; falha de `pip` pode indicar wheel indisponível; erro de linker pede identificar biblioteca e headers exatos. Não copie bibliotecas aleatórias para `/usr/lib` como conserto.

Para desfazer dependências, preserve o fonte e os manifests e recrie o venv ou a pasta de dependências em outro local. Remova pacotes do sistema apenas depois de revisar a transação. O teste final é executar os três exemplos, reabrir a sessão, restaurar um projeto de backup e reconstruí-lo com as versões registradas. Para microcontroladores, siga [Arduino Uno e ESP32](./arduino-esp32.md).

## Fontes e verificação

Revisão documental: **10/10/2026**. [Python venv](https://docs.python.org/3/library/venv.html), [Node.js](https://nodejs.org/en/learn/getting-started/introduction-to-nodejs), [npm ci](https://docs.npmjs.com/cli/commands/npm-ci), [opções GCC](https://gcc.gnu.org/onlinedocs/gcc/Invoking-GCC.html), [pacotes Termux](https://github.com/termux/termux-packages). As receitas são condicionais ao gerenciador e não constituem teste de todas as toolchains ARM.
