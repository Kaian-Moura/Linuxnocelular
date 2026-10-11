# Calculadora em C e C++

Código original da documentação Celular Linux, revisão 11/10/2026.
Biblioteca C compartilhada, interfaces C/C++, Make, CMake e CTest.

## Antes de executar

Leia /docs/aulas/c-cpp-compilacao/ no site ou docs/aulas/c-cpp-compilacao.md no repositório.
Siga a aula para instalar as ferramentas oficiais, identificar o ambiente e conferir os pré-requisitos.
Extraia numa pasta nova. Nenhum arquivo deste pacote é executado durante o download ou a extração.
Requer compiladores C/C++ e CMake no host. Compila para o ambiente do compilador, não automaticamente para Arduino ou para outro celular. A alternativa Make está na aula.

## Chamadas de referência

No terminal do ambiente preparado, dentro da pasta energia-c-cpp:

```text
cmake -S . -B build-cmake
cmake --build build-cmake
ctest --test-dir build-cmake --output-on-failure
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
