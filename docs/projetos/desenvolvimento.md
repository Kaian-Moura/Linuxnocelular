---
title: Programação — Python, JavaScript, C e C++
sidebar_position: 1
description: Monte um ambiente de desenvolvimento ARM com projetos isolados e sem misturar repositórios.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, dificuldade e requisitos

**Dificuldade:** inicial a intermediária. **Resultado:** três programas executados no telefone, projetos versionados e dependências separadas. Funciona em Termux, Debian/Ubuntu sobre PRoot/chroot e Linux nativo que ofereça os pacotes; os nomes e bibliotecas diferem. Não exige interface gráfica.

Tenha terminal estável, alguns gigabytes livres para compiladores/dependências, rede e backup. Trabalhe como usuário comum; use privilégios apenas para instalar pacotes no Linux nativo. Conheça diretório, arquivo, shell e a diferença entre código-fonte e executável. ARM64 é a arquitetura do host; o compilador pode gerar programas para outro alvo, como AVR ou ESP32, quando a toolchain apropriada existe.

## 0. Começar sem confundir computador e telefone

Você pode escrever o código pelo notebook e executá-lo no telefone. Para isso, o notebook precisa inicialmente de um **cliente SSH**, e o telefone precisa das linguagens. Instalar Python no Windows não instala Python no telefone. Se ainda não consegue abrir um terminal do telefone, faça primeiro [Termux](../android/termux.md), [PRoot](../android/proot-distro.md) ou uma [instalação nativa compatível](../nativo/visao-geral.md). Depois prepare [SSH desde o início](ssh-remoto.md).

No GNOME do telefone, pressione a tecla Super/Windows, procure **Terminal** ou **Console** e abra o aplicativo. No Android, abra o aplicativo Termux. No notebook com SSH, depois de conectar, a janela passa a executar comandos **no telefone** até você escrever `exit`. Os exemplos principais desta página usam uma shell Linux; não os cole no PowerShell local.

Execute `pwd`, `whoami` e `uname -m` no terminal escolhido. `pwd` mostra onde seus arquivos serão criados; `whoami`, qual conta os possuirá; `uname -m`, a arquitetura. `$HOME` significa a pasta dessa conta, por exemplo `/home/aluno` no Linux, ou a pasta privada do aplicativo no Termux. Não precisa substituir `$HOME` por esse exemplo. Os símbolos `$` e `#` vistos antes dos comandos de outros tutoriais podem ser prompts: **não são parte do comando**.

### Se também quiser programar localmente no Windows

Esta preparação é opcional e vale para o notebook, não para o telefone:

1. Abra [Python para Windows](https://www.python.org/downloads/windows/). Escolha uma release suportada e o instalador correspondente a **x64 ou ARM64 do computador**. Use o Install Manager ou o instalador tradicional oferecido na release; o pacote **embeddable** não é o caminho de iniciante.
2. Execute o instalador e leia as opções. No instalador tradicional, habilite a opção de acrescentar Python ao PATH quando oferecida. No Install Manager, siga as instruções da edição instalada. Feche e reabra o PowerShell e execute `py --version`; se não funcionar, veja [a documentação Windows](https://docs.python.org/3/using/windows.html), em vez de baixar outro Python de um anúncio.
3. Abra [Node.js](https://nodejs.org/en/download), selecione uma versão **LTS**, Windows e a arquitetura do notebook. Baixe o instalador oferecido, normalmente `.msi`, revise as telas e mantenha Node/npm selecionados. Reabra o PowerShell e teste `node --version` e `npm.cmd --version`. `npm.cmd` evita confundir um bloqueio da política de scripts do PowerShell com ausência do Node.
4. Para C/C++ num Windows **x64**, [MSYS2](https://www.msys2.org/) fornece GCC. Baixe o instalador oficial x86_64, conclua as telas e abra **MSYS2 UCRT64** pelo menu Iniciar. Atualize por `pacman -Syu`; se pedir fechar o terminal, feche, reabra UCRT64 e repita a atualização. Instale `pacman -S mingw-w64-ucrt-x86_64-gcc nano` e confirme `g++ --version`. Esses programas geram executáveis Windows. O exemplo UCRT64 não se aplica diretamente a Windows ARM64: consulte o ambiente ARM64 documentado pelo MSYS2.

Para adaptar o exemplo Python abaixo ao Windows, use `py -m venv .venv` e execute `.\.venv\Scripts\python.exe ola.py`; pode usar o executável do ambiente diretamente, sem alterar a política global do PowerShell. Crie `ola.py` no Bloco de Notas, com tipo **Todos os arquivos** e codificação UTF-8, evitando salvar `ola.py.txt`. Os caminhos, ativação e executáveis Windows diferem dos exemplos Linux.

### Se também quiser programar localmente no macOS

Abra **Aplicativos → Utilitários → Terminal**. Para Python, baixe o `.pkg` da [página oficial](https://www.python.org/downloads/macos/), confira a versão macOS suportada, execute o instalador e conclua as telas. A edição oficial pode pedir executar **Install Certificates.command**, na pasta Python criada em Aplicativos; faça isso conforme [o manual macOS](https://docs.python.org/3/using/mac.html). Reabra o Terminal e teste `python3 --version`. Não apague o Python administrado pela Apple.

Para Node, use o instalador macOS oferecido na [página Node.js](https://nodejs.org/en/download), escolhendo LTS e uma arquitetura compatível. Para C/C++, `xcode-select --install` abre o instalador das [Command Line Tools da Apple](https://developer.apple.com/documentation/xcode/installing-the-command-line-tools). Conclua a janela e teste `clang++ --version`; o compilador é Clang, e não GCC apesar de certos aliases. Os exemplos `c++` seguintes funcionam se esse comando estiver disponível; os executáveis produzidos são para o Mac.

### Se o notebook já usa Linux

Use o gerenciador **da distribuição do notebook**. O bloco Debian/Ubuntu da próxima seção também serve para um notebook dessas distribuições. Em Fedora, um conjunto inicial é `sudo dnf install python3 python3-pip nodejs npm gcc gcc-c++ make cmake git nano`. Instalação no notebook não altera o sistema do telefone. Não baixe binários ARM64 apenas porque o destino final é um smartphone: o programa que executa agora precisa corresponder à máquina onde você o inicia.

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

Durante a instalação, o gerenciador mostra o que vai baixar, quanto espaço utilizará e uma confirmação. Confira o plano antes de aceitar. A senha de `sudo` pode não exibir asteriscos enquanto você digita; isso é normal. `sudo: command not found` em Alpine não autoriza instalar qualquer substituto: utilize a ferramenta administrativa já configurada pelo port, como `doas`, ou a conta administrativa documentada. No PRoot, o `root` simulado e a retirada de `sudo` se aplicam somente à distribuição convidada.

Se um pacote não existe, registre o nome e a release. No Termux, `pkg search nano`; no APT, `apt-cache policy nano`; no APK, `apk search -x nano` consultam disponibilidade. `Unable to locate package` pode significar índice desatualizado ou fonte errada. Não adicione um repositório de outra distribuição para seguir adiante.

## Criar e salvar um arquivo pela primeira vez

Após instalar nano, abra `nano ola.py` na pasta do projeto indicada adiante. O nome na parte superior identifica o arquivo que está editando. Cole o conteúdo **sem as linhas de crases que delimitam o bloco da documentação**. Para salvar, pressione **Ctrl+O**, confira o nome e pressione Enter. Para sair, **Ctrl+X**. `^O` na ajuda significa Ctrl+O, não digitar esses caracteres. Em Termux, a barra de teclas adicionais pode oferecer Ctrl.

Antes de executar, use `ls -l ola.py` e `cat ola.py`: deve existir um arquivo de texto com o programa. Se nano perguntou outro nome, você pode ter salvo noutra pasta; confira `pwd`. Para editar de novo, execute o mesmo `nano ola.py`. Faça uma pasta nova para estes testes; `printf > arquivo` e salvar pelo editor podem substituir um arquivo que já existe.

## 2. Python com ambiente virtual

```bash
mkdir -p "$HOME/projetos/python-mini-pc"
cd "$HOME/projetos/python-mini-pc"
python3 -m venv .venv
. .venv/bin/activate
python -c 'import platform; print("Python:", platform.python_version(), "CPU:", platform.machine())'
```

`venv` separa as bibliotecas desse projeto das bibliotecas do sistema. A ativação ajusta o PATH desta shell; não altera o Android ou o kernel. Para instalar uma dependência, use `python -m pip install NOME` dentro do venv, depois de revisar origem e versão. Não utilize `sudo pip`, `--break-system-packages` ou atualização global de pip como rotina.

O prompt pode ganhar o prefixo `(.venv)`. Confirme com `python -c 'import sys; print(sys.executable)'`: o caminho deve estar dentro da pasta `.venv` deste projeto. Agora execute `nano ola.py` e salve:

```python
from pathlib import Path

mensagem = "Python funcionando no telefone"
print(mensagem)
Path("resultado.txt").write_text(mensagem + "\n", encoding="utf-8")
```

Execute `python ola.py` e depois `cat resultado.txt`. Ambos devem mostrar a mesma frase. Esta primeira verificação usa somente a biblioteca padrão: não depende de downloads do PyPI. Ao fechar o terminal, o ambiente virtual continua no disco, mas sua ativação acaba. Para voltar, execute `cd "$HOME/projetos/python-mini-pc"` e `. .venv/bin/activate` na nova shell.

Se `venv` falhar por ausência de ensurepip, confira os pacotes `python3-venv` no Debian ou `python-ensurepip-wheels` no Termux. `externally-managed-environment` geralmente significa que você está tentando instalar no Python do sistema; confirme o executável do venv antes de continuar. Não use uma opção de quebrar o gerenciamento de pacotes como primeira correção.

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

`npm init -y` cria um manifesto com respostas iniciais padrão. Abra `nano index.js` para mudar a frase, salve e execute `node index.js` outra vez. `cat package.json` mostra o manifesto; nenhum navegador é necessário para esse teste. `Cannot find module` ao executar o próprio arquivo pode ser simplesmente pasta errada: confira `pwd` e `ls`, antes de instalar dependências aleatórias.

JavaScript no navegador e Node.js não têm as mesmas APIs. Electron e editores distribuídos como binário podem não oferecer ARM64/musl/Android. Se um editor gráfico não tem build adequado, utilize um editor de terminal ou desenvolva pelo notebook via SSH, mantendo o código e a execução no telefone.

## 4. C e C++ com compilação local

Crie um arquivo novo `ola.cpp` numa pasta de projeto:

```bash
mkdir -p "$HOME/projetos/cpp-mini-pc"
cd "$HOME/projetos/cpp-mini-pc"
nano ola.cpp
```

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

O compilador normalmente não imprime nada quando este programa simples compila com sucesso. `./ola` pede executar o arquivo **desta pasta** e deve mostrar `C++ executado no mini PC`. Alterar o fonte não atualiza automaticamente `ola`: compile novamente. Se aparecer `error:`, leia a primeira mensagem, confira a linha indicada no editor e corrija o fonte; não continue supondo que um executável antigo corresponde ao fonte novo.

Para C, crie `nano ola.c`, salve o programa abaixo e utilize o compilador C:

```c
#include <stdio.h>
int main(void) {
    puts("C executado no mini PC");
    return 0;
}
```

```bash
cc -std=c17 -Wall -Wextra -O2 ola.c -o ola-c
./ola-c
```

`cc` e `c++` podem selecionar GCC ou Clang conforme o sistema. No MSYS2 Windows, escolha saída `ola.exe` e execute `./ola.exe` na shell UCRT64; não envie esse `.exe` ao telefone como um aplicativo Linux. Compartilhe o **fonte**, depois compile na arquitetura e libc de destino.

## 5. Versionamento, backup e limites de recursos

Inicialize Git somente no diretório do projeto: `git init`, revise `git status` e adicione seus arquivos de fonte. Coloque `.venv/`, `node_modules/`, artefatos de compilação e `.env` com segredos no `.gitignore`. Git local não é backup externo; exporte ou envie para um repositório que você controla, depois de revisar o diff para não vazar tokens.

Para este laboratório, abra `nano .gitignore` e salve uma linha para cada item: `.venv/`, `node_modules/`, `.env`, `ola` e `ola-c`. O ponto inicial torna o nome oculto em muitos gerenciadores; `ls -a` mostra-o. Não precisa criar conta GitHub para executar os programas. Antes de publicar, `git status` e `git diff` permitem revisar o que entrará no repositório; a senha e as chaves do telefone não fazem parte do código.

Comece compilações com poucas tarefas paralelas, por exemplo `cmake --build build --parallel 2`. Usar todas as CPUs pode aquecer o telefone e deixar o desktop sem resposta. Monitore RAM, armazenamento e temperatura; uma compilação que dispara OOM precisa de ajuste de recursos, não de desativar proteções térmicas.

## Erros, alternativas, rollback e testes finais

`Exec format error` pede conferir arquitetura; `No such file` num binário existente pode ser loader ausente; falha de `pip` pode indicar wheel indisponível; erro de linker pede identificar biblioteca e headers exatos. Não copie bibliotecas aleatórias para `/usr/lib` como conserto.

Para desfazer dependências, preserve o fonte e os manifests e recrie o venv ou a pasta de dependências em outro local. Remova pacotes do sistema apenas depois de revisar a transação. O teste final é executar os três exemplos, reabrir a sessão, restaurar um projeto de backup e reconstruí-lo com as versões registradas. Para microcontroladores, siga [Arduino Uno e ESP32](./arduino-esp32.md).

## Fontes e verificação

Revisão documental: **11/10/2026**, sem instalar pacotes ou executar os programas no telefone nesta revisão. [Python: downloads](https://www.python.org/downloads/), [Windows](https://docs.python.org/3/using/windows.html), [macOS](https://docs.python.org/3/using/mac.html), [venv](https://docs.python.org/3/library/venv.html), [Node: downloads](https://nodejs.org/en/download), [ciclo LTS](https://nodejs.org/en/about/previous-releases), [npm ci](https://docs.npmjs.com/cli/commands/npm-ci), [GCC: binários por sistema](https://gcc.gnu.org/install/binaries.html), [opções GCC](https://gcc.gnu.org/onlinedocs/gcc/Invoking-GCC.html), [MSYS2](https://www.msys2.org/), [nano](https://www.nano-editor.org/dist/latest/nano.html), [Python no Termux](https://github.com/termux/termux-packages/blob/master/packages/python/build.sh). As receitas são condicionais ao gerenciador e não constituem teste de todas as toolchains ARM. As versões instaladas pelo repositório podem diferir dos downloads mais novos sem significar instalação incorreta.
