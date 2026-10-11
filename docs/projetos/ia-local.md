---
title: IA local e acesso a modelos remotos
sidebar_position: 8
description: Execute uma inferência pequena, meça recursos e não confunda presença de GPU com aceleração disponível.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, dificuldade e requisitos

**Dificuldade:** avançada. **Resultado:** compilar uma ferramenta de inferência, executar um modelo pequeno em CPU e medir se o telefone atende ao objetivo. Alternativamente, o smartphone pode ser cliente de um servidor de IA privado, conservando bateria e RAM.

Tenha toolchain C/C++, CMake, Git, rede, armazenamento para fonte/build/modelo, backup e memória disponível. Comece sem desktop pesado aberto. ARM64 e instruções vetoriais ajudam, mas número de gigabytes de RAM e nome da Adreno não são uma garantia de velocidade. Android/Termux, glibc e musl exigem builds compatíveis.

Um modelo quantizado armazena pesos em menos bits. Uma estimativa mínima de pesos para 1 bilhão de parâmetros a 4 bits é cerca de 0,5 GB, mas arquivos, metadados, buffers, KV cache e contexto acrescentam memória. O consumo depende da arquitetura do modelo; não use essa conta como limite seguro da aplicação.

:::warning Origem, licença e privacidade
Modelos e runtimes devem ter origem verificável e licença adequada. Não trate respostas como fatos confirmados. Dados enviados a uma API remota saem do telefone; tokens de acesso não devem entrar em código, screenshots ou repositórios. Este laboratório não executa comandos do sistema sugeridos pelo modelo.
:::

## 1. Preparar a toolchain do ambiente

Siga [desenvolvimento](./desenvolvimento.md). Em Debian/Ubuntu nativo ou na distribuição correspondente:

```bash
sudo apt update
sudo apt install build-essential cmake git libcurl4-openssl-dev
```

No administrador simulado do PRoot, retire `sudo` somente da instalação. No Termux, use `pkg install clang cmake git` e bibliotecas de desenvolvimento correspondentes quando o build solicitar. Em Alpine/postmarketOS, confira os pacotes da sua release, como `build-base cmake git curl-dev`, antes de `sudo apk add`. Não misture artefatos Debian com Android para contornar linker errors.

Para uma versão reproduzível, escolha uma release/commit do [llama.cpp oficial](https://github.com/ggml-org/llama.cpp) e consulte seu guia de build. O exemplo abaixo busca o source atual e **registra o commit**, por isso é um teste experimental até você fixar e validar essa versão:

```bash
mkdir -p "$HOME/projetos/ia-mini-pc"
cd "$HOME/projetos/ia-mini-pc"
git clone --depth 1 https://github.com/ggml-org/llama.cpp.git
cd llama.cpp
git rev-parse HEAD > versao-fonte.txt
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel 2
```

CMake identifica arquitetura e dependências; duas tarefas limitam a concorrência inicial. Se a configuração falha, registre o primeiro erro e o commit; não remova checks de dependências sem entender o componente. O guia Android oficial cobre também cross-compilation com NDK quando uma compilação no próprio telefone não atende.

## 2. Verificar executáveis e obter um modelo

```bash
./build/bin/llama-cli --help
./build/bin/llama-bench --help
```

Nomes e opções podem evoluir: a ajuda do build utilizado é a referência. Baixe um arquivo GGUF **compatível com essa versão**, por um publisher confiável, depois de conferir model card, licença, quantização, arquitetura, tamanho e checksum quando publicado. Um GGUF com arquitetura ainda não implementada não se corrige renomeando o arquivo.

Salve o modelo escolhido em `~/modelos/modelo-pequeno.gguf`; esse nome é um **arquivo local que você deve providenciar**, não um link nem promessa de modelo distribuído por este projeto. Registre URL exato, revisão do publisher e `sha256sum`. Comece com modelo pequeno e contexto curto, sem tentar carregar imediatamente um modelo de dezenas de bilhões de parâmetros.

## 3. Inferência inicial em CPU

Com o arquivo confirmado e as opções presentes na ajuda:

```bash
./build/bin/llama-cli \
  -m "$HOME/modelos/modelo-pequeno.gguf" \
  -p 'Explique o que é uma pasta em duas frases.' \
  -n 64 -c 2048 -t 2 -ngl 0
```

`-m` escolhe pesos; `-n` limita geração; `-c` limita contexto; `-t` controla threads; `-ngl 0` inicia sem offload GPU. Observe tempo até o primeiro token, velocidade, memória e temperatura. Alguns modelos conversacionais requerem template apropriado; consulte sua model card e a ajuda em vez de considerar qualquer texto estranho como problema do processador.

Faça um benchmark curto para comparar mudanças:

```bash
./build/bin/llama-bench -m "$HOME/modelos/modelo-pequeno.gguf" -t 2 -ngl 0 -p 128 -n 32
```

Registre modelo, commit, opções, temperatura inicial, fonte de energia e outros aplicativos ativos. Compare resultados da mesma tarefa; tokens por segundo de modelos e contextos distintos não medem a mesma carga.

## 4. GPU, NPU e limites térmicos

Suporte Vulkan/OpenCL do runtime exige driver utilizável, bibliotecas compatíveis, extensão necessária e estabilidade de buffers. Um teste OpenGL que passou não valida automaticamente Vulkan de compute nem apresentação do compositor. Aceleradores proprietários do Android podem depender de SDK/HAL específicos, e Linux nativo pode não expô-los.

Trate offload como outra etapa de diagnóstico: valide primeiro driver e exemplo pequeno, consulte os flags da versão e mantenha o backend CPU disponível. Não substitua o kernel nem instale bibliotecas privadas de outro aparelho apenas para tentar um benchmark. Uma aceleração que entra em CrashDump não está pronta para uso diário.

Meça após vários minutos, porque temperatura altera frequência e desempenho sustentado. Não desative controle térmico ou carregamento seguro. Se a inferência prejudica o desktop, reduza modelo, contexto, threads e concorrência ou utilize servidor remoto.

## 5. Servidor local ou cliente remoto

Quando o binário `llama-server` existir e sua inferência CLI estiver estável:

```bash
./build/bin/llama-server -m "$HOME/modelos/modelo-pequeno.gguf" --host 127.0.0.1 --port 8081 -c 2048 -t 2 -ngl 0
```

Consulte a interface/rotas da versão e use [túnel SSH](./ssh-remoto.md) para acessar do computador, sem abrir o serviço na LAN. Um servidor de inferência precisa de autenticação e limitação de recursos antes de exposição a outros usuários.

Para usar outro computador como backend, mantenha nele o servidor no loopback e abra um túnel SSH a partir do cliente. Se esse servidor utiliza Ollama, por exemplo, a API `/api/generate` aceita modelo instalado, prompt e opção de streaming conforme a documentação. O smartphone é cliente nessa configuração; o cálculo está na outra máquina. Não apresente essa alternativa como IA local offline no telefone.

## Erros, rollback e testes finais

OOM pede reduzir consumo real; `Illegal instruction`, arquitetura/build e capacidades do host; modelo incompatível, suporte do runtime; build sem GPU, bibliotecas e configuração; lentidão após aquecer, desempenho sustentado. Os logs podem conter prompts privados: remova-os antes de publicar.

O laboratório fica em pastas do usuário. Para rollback, encerre o processo, preserve modelo e código se desejado e retorne à configuração CPU conhecida. Não há flash do telefone. **Teste final:** resposta curta, benchmark registrado, memória dentro do limite, temperatura aceitável, encerramento limpo e repetição após reabrir sessão. Integre voz somente após essa base: [assistente por voz](./assistente-voz.md).

## Fontes e verificação

Revisão documental: **10/10/2026**. [llama.cpp, build](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md), [Android](https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md), [benchmark](https://github.com/ggml-org/llama.cpp/blob/master/tools/llama-bench/README.md), [servidor](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md), [Ollama API](https://docs.ollama.com/api/generate). Não foram verificados modelos, velocidades ou aceleração para todos os smartphones; cada resultado precisa de registro local.
