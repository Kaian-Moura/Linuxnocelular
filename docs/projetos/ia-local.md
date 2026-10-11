---
title: IA local e acesso a modelos remotos
sidebar_position: 8
description: Execute uma inferência pequena, meça recursos e não confunda presença de GPU com aceleração disponível.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
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
sudo apt install build-essential cmake git curl libcurl4-openssl-dev libssl-dev nano ca-certificates
```

Abra o terminal **do telefone**, diretamente no Linux nativo, por SSH ou no Termux/PRoot escolhido. Confira `pwd`, `uname -m`, `cmake --version` e `git --version`. Uma build no notebook gera programas para aquele notebook, salvo cross-compilation explícita; não copie um `.exe` ou ELF x86 para um telefone ARM64. No administrador simulado do PRoot, retire `sudo` somente da instalação. Para os outros ambientes:

```bash
# Termux direto — bibliotecas Android, sem sudo
pkg update
pkg install clang cmake make git curl openssl nano
```

```bash
# Alpine/postmarketOS — pacotes musl da própria release
sudo apk update
sudo apk add build-base cmake git curl curl-dev openssl-dev nano ca-certificates
```

No Termux, bibliotecas e headers pertencem aos pacotes Termux, não a pacotes `*-dev` copiados do Debian. Um `cmake` antigo pode não atender ao `cmake_minimum_required` do source novo; consulte esse valor no `CMakeLists.txt` e use uma release de runtime compatível ou um caminho de atualização mantido pelo seu ambiente. Não misture repositórios de distribuições diferentes para corrigir linker errors.

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

Espere a compilação terminar e o prompt voltar; linhas de progresso não são confirmação final. `No space left on device` pede verificar `df -h "$HOME"`; processo `Killed` pode ser pressão de memória e precisa de diagnóstico, não aumento automático das tarefas. Para voltar à pasta numa sessão nova: `cd "$HOME/projetos/ia-mini-pc/llama.cpp"`. Não repita `git clone` dentro dela nem apague uma pasta já modificada por conta de `destination path already exists`.

## 2. Verificar executáveis e obter um modelo

```bash
./build/bin/llama-cli --help
./build/bin/llama-bench --help
```

Nomes e opções podem evoluir: a ajuda do build utilizado é a referência. Baixe um arquivo GGUF **compatível com essa versão**, por um publisher confiável, depois de conferir model card, licença, quantização, arquitetura, tamanho e checksum quando publicado. Um GGUF com arquitetura ainda não implementada não se corrige renomeando o arquivo.

### Exemplo com origem e arquivo exatos: Qwen3 0.6B Q8_0

Para não deixar a primeira execução dependente de um nome de arquivo inventado, este exemplo utiliza **Qwen/Qwen3-0.6B-GGUF**, publicado pela organização Qwen, licença Apache-2.0. A [model card e os arquivos](https://huggingface.co/Qwen/Qwen3-0.6B-GGUF) foram consultados; o arquivo Q8_0 possui **639.446.688 bytes** na revisão abaixo. Isso não é a memória total necessária: reserve também espaço para compilação e RAM para contexto/buffers. Se o telefone tem pouca RAM disponível, escolha um modelo menor com fonte verificável ou use o caminho remoto.

No telefone, baixe a revisão fixa para um nome local simples:

```bash
mkdir -p "$HOME/modelos"
curl --fail --location --output "$HOME/modelos/modelo-pequeno.gguf.part" \
  https://huggingface.co/Qwen/Qwen3-0.6B-GGUF/resolve/23749fefcc72300e3a2ad315e1317431b06b590a/Qwen3-0.6B-Q8_0.gguf
sha256sum "$HOME/modelos/modelo-pequeno.gguf.part"
```

Compare **exatamente** com o SHA-256 publicado nos metadados LFS desse arquivo:

```text
9465e63a22add5354d9bb4b99e90117043c7124007664907259bd16d043bb031
```

Se bater e não existir um modelo anterior que você queira preservar, `mv "$HOME/modelos/modelo-pequeno.gguf.part" "$HOME/modelos/modelo-pequeno.gguf"` torna o download confirmado o modelo do laboratório. Se não bater, não execute inferência com esse arquivo: reveja resposta HTTP, espaço e revisão. Um download interrompido não é um modelo menor válido. Os metadados podem ser conferidos em [API pública do publisher via Hugging Face](https://huggingface.co/api/models/Qwen/Qwen3-0.6B-GGUF?blobs=true) e na aba Files. A URL fixa evita que `main` mude silenciosamente.

## 3. Inferência inicial em CPU

Com o arquivo confirmado e as opções presentes na ajuda:

```bash
./build/bin/llama-cli \
  -m "$HOME/modelos/modelo-pequeno.gguf" \
  --jinja --single-turn \
  -p 'Explique o que é uma pasta em duas frases. /no_think' \
  -n 64 -c 2048 -t 2 -ngl 0
```

`-m` escolhe pesos; `-n` limita geração; `-c` limita contexto; `-t` controla threads; `-ngl 0` inicia sem offload GPU. `--jinja` utiliza o template do modelo e `--single-turn` encerra depois da resposta; `/no_think` é uma convenção **desse Qwen**, não de todos os modelos. Confira esses flags na ajuda do build. A saída esperada contém carregamento, texto de resposta e medidas de execução; o conteúdo pode estar errado. Observe tempo até o primeiro token, velocidade, memória e temperatura. Pressione Ctrl+C para encerrar se necessário. Não considere tokens especiais ou falha de template automaticamente um problema do processador.

Para guardar uma execução simples em arquivo de projeto, execute `nano "$HOME/projetos/ia-mini-pc/anotacoes.md"`, anote revisão do modelo/source, comando, tempo, RAM e temperatura; salve por Ctrl+O, Enter, Ctrl+X. Use texto sem prompts pessoais. O hash identifica o artefato, mas não mede qualidade ou segurança de suas respostas.

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

Esse processo fica em primeiro plano. No notebook com alias SSH `mini-pc` pronto, abra `ssh -N -o ExitOnForwardFailure=yes -L 18081:127.0.0.1:8081 mini-pc`, mantenha a janela aberta e acesse `http://127.0.0.1:18081` no navegador para a interface disponibilizada pela versão. Consulte suas rotas e logs; conexão recusada pede conferir o processo no telefone antes do túnel. Um servidor de inferência precisa de autenticação e limitação de recursos antes de exposição a outros usuários.

Para usar outro computador como backend, mantenha nele o servidor no loopback e abra um túnel SSH a partir do cliente. Se esse servidor utiliza Ollama, por exemplo, a API `/api/generate` aceita modelo instalado, prompt e opção de streaming conforme a documentação. O smartphone é cliente nessa configuração; o cálculo está na outra máquina. Não apresente essa alternativa como IA local offline no telefone.

## Erros, rollback e testes finais

OOM pede reduzir consumo real; `Illegal instruction`, arquitetura/build e capacidades do host; modelo incompatível, suporte do runtime; build sem GPU, bibliotecas e configuração; lentidão após aquecer, desempenho sustentado. Os logs podem conter prompts privados: remova-os antes de publicar.

O laboratório fica em pastas do usuário. Para rollback, encerre o processo, preserve modelo e código se desejado e retorne à configuração CPU conhecida. Não há flash do telefone. **Teste final:** resposta curta, benchmark registrado, memória dentro do limite, temperatura aceitável, encerramento limpo e repetição após reabrir sessão. Integre voz somente após essa base: [assistente por voz](./assistente-voz.md).

## Fontes e verificação

Revisão documental: **11/10/2026**, sem compilar ou executar inferência no aparelho. [llama.cpp, build](https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md), [Android](https://github.com/ggml-org/llama.cpp/blob/master/docs/android.md), [flags no source](https://github.com/ggml-org/llama.cpp/blob/master/common/arg.cpp), [benchmark](https://github.com/ggml-org/llama.cpp/blob/master/tools/llama-bench/README.md), [servidor](https://github.com/ggml-org/llama.cpp/blob/master/tools/server/README.md), [Ollama API](https://docs.ollama.com/api/generate). Nome, revisão, tamanho e SHA-256 do GGUF foram conferidos nos metadados públicos, sem baixar os pesos. Compatibilidade do build, consumo, velocidade e aceleração exigem validação no hardware; este modelo é um exemplo de laboratório, não uma recomendação de qualidade para todas as aplicações.
