---
title: "Aula de C e C++: do arquivo ao programa compilado"
description: Aprenda editor, compilador, mensagens de erro, projetos com vários arquivos, Make, CMake, testes e reconstrução no ambiente correto.
sidebar_position: 12
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai escrever programas em **C** e **C++**, compilar e executar no ambiente escolhido. O projeto final calcula uma **estimativa de energia em watt-hora** a partir de números que você informa. Ele não lê bateria, sensores ou hardware: `10 W × 2 h = 20 Wh` é uma conta de prática, não uma medição do consumo do seu telefone.

A aula começa com um arquivo e termina com um projeto organizado, biblioteca compartilhada entre C e C++, testes, Make, CMake e backup de fontes. Dificuldade: iniciante, com uma segunda metade intermediária. Reserve **2–4 horas**, dividindo em etapas se necessário. Um teclado físico ajuda, mas o editor de terminal também pode ser usado no Termux.

## 1. Fonte, compilador e executável são coisas diferentes

O **código-fonte** é o texto que você escreve, como `ola.c`. O **compilador** verifica esse texto e o transforma em instruções para um alvo. A etapa de **linkagem** reúne objetos e bibliotecas para produzir um **executável**, como `build/ola`. Você pode editar o fonte, mas o executável não muda até reconstruí-lo.

C e C++ são linguagens diferentes, embora relacionadas. Compilaremos C com `cc`, C++ com `c++`. Esses nomes normalmente apontam para GCC ou Clang instalados pelo ambiente. Um arquivo `.cpp` não deve ser tratado como um arquivo C só porque os nomes parecem semelhantes.

Escolha **um** ambiente:

| Ambiente | Onde executar | Ferramentas escolhidas |
|---|---|---|
| Termux no Android, fora do PRoot | App Termux | Clang, GNU Make e CMake adaptados para Android |
| Debian/Ubuntu, nativo ou já preparado | Terminal da distribuição ou SSH conectado | GCC, Make e CMake do repositório |
| Alpine/postmarketOS | Terminal do sistema ou SSH conectado | GCC, Make e CMake da mesma release |

Root no Android não é requisito. Se ainda não tem terminal, comece pela [aula Termux](primeiro-projeto-termux.md) ou a [biblioteca de caminhos](biblioteca.mdx). Se usa SSH, o alvo é a máquina remota; não cole esses comandos no PowerShell local ou em ADB. Para um notebook Windows/macOS, [desenvolvimento](../projetos/desenvolvimento.md) oferece preparação própria; os executáveis produzidos lá terão outro alvo.

## 2. Instale as ferramentas corretas

Não baixe um “GCC para qualquer celular”. O gerenciador obtém a versão preparada para seu ambiente, com bibliotecas e arquivos de desenvolvimento. Consulte o plano da transação antes de aceitar, aguarde cada comando terminar e resolva erros de rede/espaço/assinatura antes da próxima etapa.

### Termux

Instale e abra o Termux pelos passos de [F-Droid da primeira aula](primeiro-projeto-termux.md#1-instale-termux-pelo-f-droid), se ainda não o utiliza. Preserve projetos de instalações existentes.

**Dentro do Termux, fora do Debian:**

```bash
pkg update
pkg install clang make cmake nano file
```

O pacote `clang` fornece o compilador e depende das ferramentas/bibliotecas Android necessárias; veja a [definição do subpacote oficial](https://github.com/termux/termux-packages/blob/master/packages/libllvm/clang.subpackage.sh). Não use `sudo` aqui.

### Debian/Ubuntu

**No terminal da distribuição:**

```bash
sudo apt update
sudo apt install build-essential cmake nano file
```

`build-essential` reúne compiladores, Make e requisitos de desenvolvimento, conforme o [catálogo Debian](https://packages.debian.org/trixie/build-essential). Num Debian PRoot já aberto como administrador simulado, retire apenas o `sudo` dessas linhas de instalação; não execute `apt` no Termux externo.

### Alpine/postmarketOS

**No terminal Alpine/postmarketOS:**

```bash
doas apk update
doas apk add build-base cmake nano file
```

Se o port usa `sudo`, substitua somente o prefixo. `build-base` é o conjunto Alpine de compilação. Não habilite repositório de outra release para seguir a aula. Senha administrativa não tem valor universal; use a conta configurada na instalação.

**Na opção escolhida, verifique:**

```bash
cc --version
c++ --version
make --version
cmake --version
file --version
```

**Checkpoint 1:** aparecem versões. O comando `make` desta aula precisa ser **GNU Make**, porque usaremos um recurso que evita tabs invisíveis no arquivo de regras. CMake precisa ser 3.20 ou posterior, incluindo a opção `ctest --test-dir`. Se um comando está ausente, confirme o ambiente e os pacotes, sem adicionar todo repositório encontrado na internet. Veja [erros para iniciantes](../diagnostico/erros-para-iniciantes.md).

## 3. Crie uma pasta nova e seu primeiro fonte C

**No terminal:**

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/energia-c-cpp"
cd "$HOME/projetos/energia-c-cpp"
mkdir build src tests
pwd
nano ola.c
```

Se `energia-c-cpp` já existe, pare a criação e confira seu conteúdo. Para retomar uma aula anterior, vá à etapa 12; para começar outra, use uma pasta nova e acompanhe esse caminho. Não sobrescreva um programa existente. `$HOME` é a sua pasta pessoal, com caminho próprio em cada ambiente.

**Dentro do nano**, cole:

```c
#include <stdio.h>

int main(void) {
    printf("Meu primeiro programa C.\n");
    return 0;
}
```

`#include` permite usar declarações de uma biblioteca; não é um download. `main` é o ponto de entrada. `printf` escreve no terminal; `\n` termina a linha. O ponto e vírgula encerra uma instrução. `return 0` sinaliza sucesso ao sistema.

Salve com **Ctrl+O**, Enter e **Ctrl+X**. No Termux, toque na tecla extra CTRL e depois na letra. O rodapé `^O` significa esse atalho, não um texto para digitar. **No terminal:**

```bash
cat ola.c
cc -std=c17 -Wall -Wextra -Wpedantic ola.c -o build/ola
./build/ola
```

`-std=c17` escolhe um padrão C; `-Wall -Wextra -Wpedantic` pede verificações úteis; `-o` informa o nome do executável de saída. O compilador pode terminar sem texto quando está tudo certo. `./` diz ao shell para executar pelo caminho indicado, pois a pasta atual normalmente não está no PATH.

**Saída ilustrativa:** `Meu primeiro programa C.`. Não execute `./ola.c`: esse arquivo é texto. Não use `chmod +x` no fonte como substituto para compilação. Os [avisos GCC](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html) e o [manual Clang](https://clang.llvm.org/docs/UsersManual.html) explicam as opções; os textos exatos dos diagnósticos diferem.

## 4. Provoque e conserte um erro sem perder a versão boa

**No terminal:**

```bash
cp -i ola.c ola-erro.c
nano ola-erro.c
```

Se esse destino já existe, preserve-o escolhendo outro nome para a experiência. **No editor**, remova somente o ponto e vírgula da linha `printf`, salve e saia. Compile para **outro nome**, sem substituir o executável que funcionou:

```bash
cc -std=c17 -Wall -Wextra -Wpedantic ola-erro.c -o build/ola-erro
echo $?
```

**Resultado esperado, descrição ilustrativa:** a compilação falha e aponta um ponto e vírgula ausente, muitas vezes perto da linha seguinte. A linha citada pode ser onde o parser percebeu o problema, não onde você o criou. `echo $?`, executado imediatamente depois, mostra um número diferente de zero. Não copie uma mensagem fictícia para o terminal.

Reabra `nano ola-erro.c`, recoloque `;`, salve, compile de novo e execute `./build/ola-erro`. Compare o sucesso com a falha. Um executável antigo pode permanecer após uma compilação malsucedida: ver “o programa rodou” não prova que o novo fonte compilou. Por isso você usou um nome separado.

**Checkpoint 2:** você consegue distinguir erro de compilação, ausência de executável e execução bem-sucedida. Não é preciso reinstalar compilador por um erro de pontuação.

## 5. Escreva uma função C reutilizável

Vamos separar o cálculo da interface. `energia.h` declara a função; `energia.c` a implementa. O cabeçalho também permite que um programa C++ chame a função C usando a ligação apropriada.

**No terminal:** `nano src/energia.h`. **No editor**, cole e salve:

```c
#ifndef ENERGIA_H
#define ENERGIA_H

#ifdef __cplusplus
extern "C" {
#endif

double energia_wh(double watts, double horas);

#ifdef __cplusplus
}
#endif

#endif
```

As linhas `#ifndef`/`#define` evitam incluir a declaração repetidamente. `double` representa um número de ponto flutuante. A parte `extern "C"` é lida somente pelo compilador C++ e informa a convenção de ligação da função; não transforma todo C em C++.

**No terminal:** `nano src/energia.c`. **No editor:**

```c
#include "energia.h"

double energia_wh(double watts, double horas) {
    return watts * horas;
}
```

Essa função faz uma conta, sem validar a origem dos números. A interface vai limitar entradas; testes da função verificarão resultados conhecidos. Salve ambos os arquivos antes de continuar.

## 6. Crie a interface C de linha de comando

**No terminal:** `nano src/main.c`. **Dentro do editor:**

```c
#include <errno.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include "energia.h"

static int numero_valido(const char *texto, double maximo, double *saida) {
    char *fim;
    errno = 0;
    double valor = strtod(texto, &fim);
    if (fim == texto || *fim != '\0' || errno == ERANGE || !isfinite(valor)) {
        return 0;
    }
    if (valor < 0 || valor > maximo) {
        return 0;
    }
    *saida = valor;
    return 1;
}

int main(int argc, char **argv) {
    double watts, horas;
    if (argc != 3) {
        fprintf(stderr, "Uso: energia-c WATTS HORAS (ponto para decimal)\n");
        return 1;
    }
    if (!numero_valido(argv[1], 1000, &watts) ||
        !numero_valido(argv[2], 24, &horas)) {
        fprintf(stderr, "Use watts de 0 a 1000 e horas de 0 a 24.\n");
        return 1;
    }
    printf("Energia estimada: %.2f Wh\n", energia_wh(watts, horas));
    return 0;
}
```

`argc` conta argumentos, incluindo o nome do programa; `argv` contém seus textos. `strtod` tenta converter texto em número e permite conferir onde parou. A validação rejeita texto incompleto, limites excedidos, infinito e NaN. `stderr` é a saída de erros; ela não altera arquivos.

O programa não chama `setlocale`: use **ponto** para decimal, como `2.5`, mesmo num desktop em português. O limite de 24 horas e 1000 W é uma regra deste exercício, não uma especificação do celular. Essa conta não permite concluir autonomia de bateria, porque há perdas, consumo variável, capacidade efetiva e outras grandezas.

**No terminal:**

```bash
cc -std=c17 -Wall -Wextra -Wpedantic -c src/energia.c -o build/energia.o
cc -std=c17 -Wall -Wextra -Wpedantic src/main.c build/energia.o -o build/energia-c
./build/energia-c 10 2
./build/energia-c 5 2.5
./build/energia-c texto 2
echo $?
```

`-c` produz um **arquivo objeto**, ainda sem um programa completo. O segundo comando liga esse objeto à interface. As saídas ilustrativas dos dois casos válidos são `20.00 Wh` e `12.50 Wh`. A entrada `texto` deve ser rejeitada, com estado 1. Se a compilação falhar, corrija antes de executar um binário anterior.

## 7. Use a mesma função em um programa C++

**No terminal:** `nano src/main.cpp`. **Dentro do editor:**

```cpp
#include <iomanip>
#include <iostream>
#include <vector>
#include "energia.h"

int main() {
    const double watts = 10.0;
    const std::vector<double> duracoes = {1.0, 2.0, 3.0};
    std::cout << std::fixed << std::setprecision(2);
    for (double horas : duracoes) {
        std::cout << horas << " h a " << watts << " W: "
                  << energia_wh(watts, horas) << " Wh\n";
    }
    return 0;
}
```

`std::vector` guarda uma sequência de durações. O `for` percorre os valores; `std::cout` apresenta texto; `setprecision(2)` com `fixed` escolhe duas casas decimais. É uma **simulação com valores constantes**, não leitura de consumo.

**No terminal:**

```bash
c++ -std=c++17 -Wall -Wextra -Wpedantic src/main.cpp build/energia.o -o build/energia-cpp
./build/energia-cpp
```

Espere três linhas, com resultados de **10.00**, **20.00** e **30.00 Wh**. Usar `c++` na linkagem fornece as bibliotecas C++ adequadas. Se surgir `undefined reference` para `energia_wh`, confira `build/energia.o`, inclusão do cabeçalho e o bloco `extern "C"`; não baixe uma biblioteca de energia aleatória.

**Checkpoint 3:** C e C++ executam; você sabe quais arquivos são texto (`.c`, `.cpp`, `.h`), objeto (`.o`) e executável. Alterar somente o fonte não muda os resultados do binário existente.

## 8. Escreva um teste da função de cálculo

**No terminal:** `nano tests/teste_energia.c`. **Dentro do editor:**

```c
#include <stdio.h>
#include "energia.h"

static int perto(double observado, double esperado) {
    double diferenca = observado - esperado;
    return diferenca > -0.000001 && diferenca < 0.000001;
}

int main(void) {
    if (!perto(energia_wh(10.0, 2.0), 20.0) ||
        !perto(energia_wh(5.0, 2.5), 12.5) ||
        !perto(energia_wh(0.0, 12.0), 0.0)) {
        fprintf(stderr, "Falha: energia não corresponde ao valor esperado.\n");
        return 1;
    }
    puts("Três casos de energia passaram.");
    return 0;
}
```

Ponto flutuante pode ter arredondamentos; `perto` usa uma tolerância para esses resultados pequenos. É um teste, não um sensor. O primeiro caso cobre valores inteiros; o segundo uma duração fracionária; o terceiro consumo zero. Um teste não prova todas as entradas possíveis.

**No terminal:**

```bash
cc -std=c17 -Wall -Wextra -Wpedantic -Isrc tests/teste_energia.c build/energia.o -o build/teste-energia
./build/teste-energia
```

`-Isrc` acrescenta a pasta onde o cabeçalho está. **Saída ilustrativa:** “Três casos de energia passaram.” Não substitua a função por um valor constante só para passar num único caso. **Exercício:** acrescente uma comparação de `energia_wh(12.0, 0.5)` com `6.0`, recompilando o teste.

## 9. Ensine Make a reconstruir o necessário

Repetir comandos longos é cansativo e favorece esquecer um arquivo. Um **Makefile** informa alvos, pré-requisitos e receitas. GNU Make verifica quais fontes mudaram e reconstrói o que depende deles; veja a [introdução oficial às regras](https://www.gnu.org/software/make/manual/html_node/Rule-Introduction.html).

**No terminal, na raiz `energia-c-cpp`:** `nano Makefile`. O nome tem `M` maiúsculo e nenhuma extensão. **No editor:**

```makefile
.RECIPEPREFIX := >
CC = cc
CXX = c++
CFLAGS = -std=c17 -Wall -Wextra -Wpedantic
CXXFLAGS = -std=c++17 -Wall -Wextra -Wpedantic

.PHONY: all testar
all: build/energia-c build/energia-cpp

build:
>mkdir -p build

build/energia.o: src/energia.c src/energia.h | build
>$(CC) $(CFLAGS) -c src/energia.c -o build/energia.o

build/energia-c: src/main.c src/energia.h build/energia.o | build
>$(CC) $(CFLAGS) src/main.c build/energia.o -o build/energia-c

build/energia-cpp: src/main.cpp src/energia.h build/energia.o | build
>$(CXX) $(CXXFLAGS) src/main.cpp build/energia.o -o build/energia-cpp

build/teste-energia: tests/teste_energia.c src/energia.h build/energia.o | build
>$(CC) $(CFLAGS) -Isrc tests/teste_energia.c build/energia.o -o build/teste-energia

testar: build/teste-energia
>./build/teste-energia
```

**Preserve os `>` no início das receitas.** A primeira linha configura GNU Make para usá-los no lugar da tabulação tradicional, evitando o erro de colar espaços em vez de tabs. `$(CC)` e outras variáveis deste arquivo são lidas por Make; não copie essas receitas soltas no shell.

**No terminal:**

```bash
make
make testar
make
```

O primeiro comando produz ou atualiza os dois programas; `make testar` constrói/executa o teste. A última chamada pode dizer que nada precisa ser feito, pois fontes e alvos estão atualizados. Isso é um resultado normal.

Para observar uma reconstrução real, copie `src/main.cpp` para um nome livre de backup com `cp -i`, abra-o e altere uma mensagem, por exemplo acrescentando “Estimativa: ” antes da duração. Salve, execute `make` e `./build/energia-cpp`. O comando de compilação C++ deve reaparecer, e a mensagem muda. Não altere a fórmula do cálculo só para provocar uma mudança.

Se aparece `missing separator`, confira se a primeira linha foi preservada e se receitas começam com `>`. Se `No rule to make target`, leia o nome e compare com `ls src tests`; maiúsculas e extensões importam. Não remova toda a pasta por causa de um nome incorreto.

## 10. Prepare também uma construção com CMake

**CMake gera arquivos de construção** a partir de uma configuração; `cmake --build` usa a ferramenta escolhida para construir. Ele não substitui o compilador. Manter a pasta de resultados separada evita misturar cache e executáveis de ferramentas diferentes. O [tutorial oficial](https://cmake.org/cmake/help/latest/guide/tutorial/index.html) apresenta esse fluxo.

**No terminal:** `nano CMakeLists.txt`. **No editor:**

```cmake
cmake_minimum_required(VERSION 3.20)
project(EnergiaDaAula LANGUAGES C CXX)

set(CMAKE_C_STANDARD 17)
set(CMAKE_C_STANDARD_REQUIRED ON)
set(CMAKE_C_EXTENSIONS OFF)
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_library(energia STATIC src/energia.c)
target_include_directories(energia PUBLIC src)
add_executable(energia-c src/main.c)
target_link_libraries(energia-c PRIVATE energia)
add_executable(energia-cpp src/main.cpp)
target_link_libraries(energia-cpp PRIVATE energia)
add_executable(teste-energia tests/teste_energia.c)
target_link_libraries(teste-energia PRIVATE energia)

enable_testing()
add_test(NAME calculo COMMAND teste-energia)
add_test(NAME cli_valida COMMAND energia-c 10 2)
set_tests_properties(cli_valida PROPERTIES PASS_REGULAR_EXPRESSION "20[.]00 Wh")
add_test(NAME cli_rejeita_texto COMMAND energia-c texto 2)
set_tests_properties(cli_rejeita_texto PROPERTIES WILL_FAIL TRUE)
```

`add_library` reúne a função reutilizável numa biblioteca estática. `target_link_libraries` conecta os programas a ela. A pasta do cabeçalho é propagada aos alvos que a utilizam. `add_test` registra verificações para CTest; `WILL_FAIL TRUE` significa que **esse caso específico** deve retornar falha, pois recebeu texto inválido.

**No terminal, na raiz do projeto:**

```bash
cmake -S . -B cmake-build
cmake --build cmake-build
ctest --test-dir cmake-build --output-on-failure
./cmake-build/energia-c 10 2
```

`-S .` aponta para a pasta de fontes atual; `-B` define uma pasta distinta de resultados. Configure antes de construir. O CTest deve indicar **três testes aprovados**, além dos três casos internos da função executados pelo teste `calculo`. A [referência CTest](https://cmake.org/cmake/help/latest/manual/ctest.1.html) documenta `--test-dir`, disponível desde 3.20.

Uma cópia de `cmake-build` não é um projeto portátil: o cache pode conter compilador, caminhos e alvo da máquina original. Em outro ambiente, comece numa **nova pasta de construção**, configurando a partir dos fontes. Isso também evita usar binários antigos por engano.

**Checkpoint 4:** Make e CMake constroem os mesmos fontes, em pastas diferentes, e os testes passam. Não há necessidade de alternar entre ambos durante cada edição; escolha um fluxo para trabalhar. Os dois foram apresentados para você reconhecer projetos da comunidade.

## 11. Por que o executável pode falhar em outro aparelho?

Confira no ambiente onde você compilou:

```bash
uname -m
cc -dumpmachine
file build/energia-c
```

**Saída ilustrativa, não garantida:** `file` identifica um executável ELF de 64 bits para ARM aarch64. O resultado real informa o que foi gerado, não todo requisito do programa. `cc -dumpmachine` acrescenta o alvo conhecido pelo compilador; as strings variam.

Há pelo menos três dimensões de compatibilidade: **arquitetura** (ARM64 não é x86_64), **sistema/ABI** e **bibliotecas**. Android usa bionic; Alpine normalmente musl; Debian normalmente glibc. Dois sistemas ARM64 podem precisar de executáveis diferentes. Um binário do Termux também pode depender de caminhos/bibliotecas daquele ambiente.

`Exec format error` sugere formato/alvo incompatível. “No such file or directory” ao executar um arquivo que realmente existe pode indicar um carregador dinâmico ausente. `Permission denied` pode envolver permissão ou montagem `noexec`, inclusive armazenamento compartilhado Android. **Mantenha fontes e builds na pasta privada do Termux ou pasta pessoal Linux**, sem tentar tornar Downloads executável ou desativar proteções.

A estratégia desta aula é transportar **fontes** e reconstruir no destino compatível. Compilação cruzada é outra técnica e exige toolchain/sysroot do alvo. Uma toolchain AVR/ESP32 para Arduino compila firmware para a placa, não um executável Linux do celular; prossiga em [Arduino e ESP32](../projetos/arduino-esp32.md) quando quiser esse objetivo.

## 12. Documente, faça backup e retome

**No terminal:** `nano MANIFESTO.md`. No editor, registre os valores reais obtidos nas verificações:

```text
# Energia — projeto de aula
Finalidade: cálculo com entradas manuais; não mede hardware.
Ambiente e arquitetura: preencher com o sistema e uname -m.
Compilador C/C++: preencher com as versões observadas.
Padrões: C17 e C++17.
Fontes: ola.c, src/, tests/, Makefile, CMakeLists.txt.
Construção habitual: make; make testar.
Alternativa: cmake -S . -B cmake-build; cmake --build cmake-build.
Dados de usuário persistidos: nenhum.
Executáveis: gerados localmente; reconstruir ao mudar de ambiente.
```

Preserve fontes e configurações. Os resultados de compilação podem ser reconstruídos, por isso o backup abaixo os exclui:

```bash
mkdir -p "$HOME/backups"
tar --exclude='build' --exclude='cmake-build' -czf "$HOME/backups/energia-c-cpp-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$HOME/projetos" energia-c-cpp
ls -lh "$HOME/backups"
```

Copie o arquivo concluído para outro dispositivo pelo [guia de backup](../preparacao/backup.md). Uma cópia no mesmo telefone não resolve perda do aparelho, limpeza de dados ou defeito de armazenamento.

Para testar restauração, substitua `NOME_REAL.tar.gz` pelo nome recém-criado. Use uma pasta nova e confira o conteúdo antes de extrair:

```bash
tar -tzf "$HOME/backups/NOME_REAL.tar.gz"
mkdir "$HOME/restauro-energia-aula"
tar -xzf "$HOME/backups/NOME_REAL.tar.gz" -C "$HOME/restauro-energia-aula"
cd "$HOME/restauro-energia-aula/energia-c-cpp"
make
make testar
./build/energia-c 10 2
```

Não extraia por cima do original, nem compile fontes de terceiros sem examinar o que as receitas fazem. Make e CMake podem executar comandos definidos pelo projeto; não são leitores inofensivos de qualquer arquivo baixado. Aqui você escreveu as receitas e pode ler cada uma.

No dia seguinte, abra o mesmo ambiente/conta:

```bash
cd "$HOME/projetos/energia-c-cpp"
make
make testar
./build/energia-c 10 2
./build/energia-cpp
```

Se atualizou compilador/bibliotecas e quer reconstruir tudo, use **uma pasta nova de CMake**, por exemplo `cmake -S . -B cmake-build-novo`, depois construa e teste nela; não apague seus fontes para limpar um cache. Para reverter uma edição, preserve a tentativa e restaure apenas o arquivo de fonte de uma cópia conhecida, usando confirmação; compile e teste de novo.

**Teste final:** você conserta o erro de ponto e vírgula; obtém 20.00 e 12.50 Wh; rejeita texto; executa o programa C++; passa os testes de Make/CTest; restaura fontes numa pasta nova e reconstrói. **Exercícios seguintes:** acrescentar outra duração ao C++, incluir um caso fracionário no teste e exibir também kWh dividindo Wh por 1000. Mantenha a distinção entre uma estimativa matemática e uma medição de energia real.

## Fontes e limites de verificação

Os arquivos de fonte e construção foram extraídos e testados **num notebook Linux x86_64, com GCC 16.2.1, GNU Make 4.4.1 e CMake 4.3.0**, em pastas temporárias em 11/10/2026. Passaram a compilação manual C/C++, os casos válidos e seis entradas inválidas da CLI, a construção por Make, a reconstrução após editar o fonte e os três testes CTest. A falta de ponto e vírgula produziu a falha esperada; os fontes restaurados do backup foram reconstruídos e testados. Não foram testados binários ARM64, Termux/bionic, Alpine/musl ou drivers do telefone.

Verificação documental em **11/10/2026**: [pacote Clang Termux](https://github.com/termux/termux-packages/blob/master/packages/libllvm/clang.subpackage.sh), [build-essential Debian](https://packages.debian.org/trixie/build-essential), [build-base Alpine](https://github.com/alpinelinux/aports/blob/master/main/build-base/APKBUILD), [opções GCC](https://gcc.gnu.org/onlinedocs/gcc/Warning-Options.html), [manual Clang](https://clang.llvm.org/docs/UsersManual.html), [GNU Make](https://www.gnu.org/software/make/manual/make.html) e [tutorial CMake](https://cmake.org/cmake/help/latest/guide/tutorial/index.html). Os programas e exercícios são originais desta aula. Os checkpoints verificam a instalação local; suporte do telefone e comportamento térmico não foram testados por esta página.
