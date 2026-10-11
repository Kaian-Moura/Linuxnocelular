---
title: Assistente por voz — áudio, transcrição e resposta
sidebar_position: 9
description: Construa uma cadeia de voz explícita com captura verificável, STT local e respostas limitadas.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, materiais e limites

**Dificuldade:** avançada. **Resultado:** gravar uma frase, transcrevê-la localmente e responder a um comando limitado, sem execução arbitrária. Microfone, transcrição, interpretação e síntese são componentes independentes. Instalar um modelo não corrige um microfone ausente do sistema.

Tenha entrada e saída de áudio funcionais, fonte de áudio de teste sem dados sensíveis, toolchain C/C++, CMake, FFmpeg, Python e espaço para modelo/build. No Android, uma API do sistema pode captar áudio mesmo quando uma distribuição PRoot não vê ALSA. No Linux nativo, o port precisa fornecer driver e integração de áudio.

```mermaid
flowchart LR
  A[Microfone ou arquivo] --> B[PCM WAV]
  B --> C[Reconhecimento de fala]
  C --> D[Texto validado]
  D --> E[Intenção permitida]
  E --> F[Resposta em texto]
  F --> G[Áudio de resposta]
```

:::warning Privacidade e acionamento
Capture somente áudio autorizado e deixe evidente quando está gravando. Comece com acionamento manual, sem escuta contínua. Uma transcrição ou saída de LLM não deve virar comando shell por concatenação; restrinja intenções e peça confirmação explícita para ações com efeitos relevantes.
:::

## 1. Verificar captura antes de instalar reconhecimento

### Instalar ferramentas, sem criar um segundo servidor de áudio

Abra o terminal **do telefone**, na sessão gráfica nativa quando for usar PipeWire. Uma shell SSH pode não possuir o ambiente de áudio da sessão; não invente `XDG_RUNTIME_DIR` para ocultar esse problema. No Android, os comandos Termux ficam no aplicativo Termux, não dentro de uma distribuição PRoot que não tem permissão Android de microfone. Confira `cat /etc/os-release` no Linux ou `termux-info` no Termux.

Os pacotes seguintes preparam compilação, conversão, Python e editor; não fornecem o driver do microfone:

```bash
# Debian/Ubuntu
sudo apt update
sudo apt install build-essential cmake git curl ffmpeg python3 nano ca-certificates
```

```bash
# Alpine/postmarketOS, somente repositórios da própria release
sudo apk update
sudo apk add build-base cmake git curl ffmpeg python3 nano ca-certificates
```

```bash
# Termux direto
pkg update
pkg install clang cmake make git curl ffmpeg python nano
```

No PRoot Debian, a instalação usa o APT da distribuição, sem sudo quando você está no administrador simulado; a captura deve ser feita pelo host Android e o arquivo transferido conforme abaixo. Confira `cmake --version`, `git --version`, `ffmpeg -version` e `python3 --version` antes de compilar. `command not found` ainda é problema de pacote/PATH, não de inteligência artificial.

Se **PipeWire e WirePlumber já estão integrados e funcionais no desktop nativo**, mas faltam suas ferramentas, Debian fornece `sudo apt install pipewire-bin wireplumber`; Alpine fornece `sudo apk add pipewire-tools wireplumber` quando presentes na release. Confira `command -v pw-record`, `command -v pw-play` e `command -v wpctl`. Não inicie uma nova instância de PipeWire como root nem substitua PulseAudio por tentativa: a integração de áudio é uma etapa anterior no [guia de áudio](../hardware/audio.md).

No **Linux nativo com PipeWire funcional**, consulte `wpctl status` para encontrar a entrada correta. Se `pw-record --help` confirmar as opções, grave um WAV como usuário da sessão:

```bash
mkdir -p "$HOME/voz-mini-pc"
pw-record --rate 16000 --channels 1 --format s16 "$HOME/voz-mini-pc/entrada.wav"
```

Fale uma frase curta e finalize com Ctrl+C; reproduza com `pw-play "$HOME/voz-mini-pc/entrada.wav"`. Se estiver silencioso, confira fonte selecionada, mute, ganho, permissões e o driver. Não continue para Whisper antes de ouvir a gravação.

### Alternativa Android: gravação autorizada pelo Termux:API

O aplicativo Gravador do fabricante é a opção mais simples: grave uma frase, use Compartilhar/Salvar para uma pasta que consegue acessar e copie esse arquivo ao projeto. Para automação, Termux:API exige **dois componentes**: aplicativo Android com assinatura compatível e pacote de comandos dentro do Termux. A origem oficial está no [README Termux:API](https://github.com/termux/termux-api).

Se seu Termux veio do **F-Droid**, abra o cliente F-Droid, procure **Termux:API**, confira o identificador `com.termux.api` e instale o [aplicativo correspondente](https://f-droid.org/en/packages/com.termux.api/). Não misture esse APK com Termux assinado por outra origem. Se a origem do Termux é diferente, confirme a distribuição de plug-ins compatível antes de prosseguir; não desinstale um Termux com dados para apenas repetir este teste. A alternativa do Gravador continua disponível.

No Termux direto, execute:

```bash
pkg install termux-api
mkdir -p "$HOME/voz-mini-pc"
termux-microphone-record -h
termux-microphone-record -f "$HOME/voz-mini-pc/gravacao.m4a" -l 10 -e aac
```

Ao surgir a autorização Android de microfone, conceda-a somente se deseja gravar e mantenha o aplicativo permitido pelo sistema. Fale “Que horas são?” durante os dez segundos. `-l 10` limita a gravação; AAC/M4A é uma entrada de conversão, não o WAV final. Consulte `termux-microphone-record -i` para o estado; `termux-microphone-record -q` interrompe uma gravação ainda ativa. Use nome novo quando o arquivo já existir. Confira `ls -lh "$HOME/voz-mini-pc/gravacao.m4a"` e reproduza pelo aplicativo ou pela conversão a seguir. O pacote CLI sozinho não dispensa APK, assinatura nem autorização.

Para passar um arquivo exportado de Downloads para a pasta privada, somente depois de `termux-setup-storage` e permissão aprovados, confirme seu **nome exato** com `ls "$HOME/storage/downloads"`. Por exemplo, se você salvou ali `minha-frase.m4a`, `cp "$HOME/storage/downloads/minha-frase.m4a" "$HOME/voz-mini-pc/gravacao.m4a"` copia o arquivo; não execute esse exemplo com nome fictício ou destino já importante. PRoot exige também um bind documentado ou uma cópia para sua home: não assuma que as duas homes têm o mesmo caminho.

Se já gravou o WAV 16 kHz mono com PipeWire, siga diretamente à próxima etapa. Para uma gravação exportada em outro formato, como M4A, converta-a para o formato inicial de referência, substituindo o arquivo de entrada real e escolhendo um destino sem gravação que deseje preservar:

```bash
ffmpeg -i "$HOME/voz-mini-pc/gravacao.m4a" -ar 16000 -ac 1 -c:a pcm_s16le "$HOME/voz-mini-pc/entrada.wav"
```

Não sobrescreva uma gravação que deseja preservar. `-ar` define taxa, `-ac` mono e `pcm_s16le` amostras PCM 16-bit. A conversão não recupera som que nunca foi capturado.

## 2. Compilar whisper.cpp e escolher modelo

Com as ferramentas do [guia de desenvolvimento](./desenvolvimento.md):

```bash
mkdir -p "$HOME/projetos/voz-mini-pc"
cd "$HOME/projetos/voz-mini-pc"
git clone --depth 1 https://github.com/ggml-org/whisper.cpp.git
cd whisper.cpp
git rev-parse HEAD > versao-fonte.txt
cmake -B build -DCMAKE_BUILD_TYPE=Release
cmake --build build --config Release --parallel 2
./build/bin/whisper-cli --help
```

Registre o commit e fixe uma versão validada antes de depender dela. Escolha um modelo multilíngue, por exemplo `base`, se deseja português; `base.en` é direcionado a inglês. O repositório descreve os modelos e um script de download. Leia `models/download-ggml-model.sh`, confira origem e destino e só então execute o script local revisado para baixar o modelo; alternativamente, baixe o artefato pelas fontes indicadas no README e valide seu checksum quando disponível. Não execute script remoto diretamente em pipe.

### Baixar o modelo base e verificar antes de transcrever

Continue **dentro de** `~/projetos/voz-mini-pc/whisper.cpp`. Para inspecionar o script, use `sed -n '1,240p' models/download-ggml-model.sh`: ele deve baixar arquivos do publisher indicado no README, sem privilégios, para a pasta de modelos. Numa pasta sem `models/ggml-base.bin` anterior, `sh ./models/download-ggml-model.sh base` realiza o download previsto pelo projeto. Não confunda um arquivo parcial com download concluído: o script consultado pula um arquivo que já existe.

Como alternativa com **revisão fixa**, sem executar o script, baixe diretamente:

```bash
curl --fail --location --output models/ggml-base.bin.part \
  https://huggingface.co/ggerganov/whisper.cpp/resolve/5359861c739e955e79d9a303bcbc70fb988958b1/ggml-base.bin
sha256sum models/ggml-base.bin.part
```

O arquivo consultado tem **147.951.465 bytes**, e o SHA-256 publicado é:

```text
60ed5bc3dd14eea856493d334349b405782ddcaf0028d4b5df4088345fba2efe
```

Compare o hash exatamente. Somente se bater e não houver um modelo anterior a preservar, `mv models/ggml-base.bin.part models/ggml-base.bin` conclui essa alternativa. Confira `ls -lh models/ggml-base.bin`. A fonte e os metadados estão no [publisher apontado pelo whisper.cpp](https://huggingface.co/ggerganov/whisper.cpp/tree/main) e na [API pública](https://huggingface.co/api/models/ggerganov/whisper.cpp?blobs=true). Um modelo `base` requer RAM além do tamanho dos pesos; se não couber, escolha `tiny` multilíngue e atualize nome, hash e comando deliberadamente. Não troque por `base.en` esperando português equivalente.

O comando seguinte pressupõe que você obteve o arquivo oficial compatível `models/ggml-base.bin`:

```bash
./build/bin/whisper-cli \
  -m models/ggml-base.bin \
  -f "$HOME/voz-mini-pc/entrada.wav" \
  -l pt -otxt -of "$HOME/voz-mini-pc/transcricao"
```

Confira as opções na ajuda da versão. `-l pt` escolhe português; saída texto e prefixo produzem `transcricao.txt` quando esse formato é suportado. Leia o arquivo e compare com o que você falou. Meça duração da gravação versus duração do processamento: a latência pode ser inadequada para conversação contínua em CPU.

Use `cat "$HOME/voz-mini-pc/transcricao.txt"` para a verificação. Arquivo vazio pede ouvir a entrada e ler os logs. A compilação permanece na pasta do projeto; numa nova sessão, retorne com `cd "$HOME/projetos/voz-mini-pc/whisper.cpp"` antes dos comandos `./build/bin/...`. Não repita o clone dentro do repositório já existente.

## 3. Responder a intenções limitadas

No telefone, execute `nano "$HOME/voz-mini-pc/responder.py"`. Cole o programa abaixo, salve com **Ctrl+O → Enter** e saia com **Ctrl+X**. Se a pasta ainda não existe, crie-a antes por `mkdir -p "$HOME/voz-mini-pc"`; se já há um programa nesse nome, preserve sua cópia.

```python
from datetime import datetime
from pathlib import Path

texto = (Path.home() / "voz-mini-pc/transcricao.txt").read_text(encoding="utf-8").lower()
agora = datetime.now()
if "hora" in texto:
    resposta = f"Agora são {agora:%H:%M}."
elif "data" in texto:
    resposta = f"Hoje é {agora:%d/%m/%Y}."
else:
    resposta = "Neste laboratório consigo informar a hora ou a data."
(Path.home() / "voz-mini-pc/resposta.txt").write_text(resposta, encoding="utf-8")
print(resposta)
```

```bash
python3 "$HOME/voz-mini-pc/responder.py"
```

Esse programa não recebe comandos shell nem controla hardware. A regra é propositalmente simples e pode ser enganada por frases ambíguas; serve para aprender o pipeline. Um assistente real deve ter intenções estruturadas, autenticação e controles para não acionar algo por ruído ou conversa ao fundo.

O terminal deve imprimir a hora/data quando a transcrição contém a palavra correspondente e criar `resposta.txt`. Confira por `cat "$HOME/voz-mini-pc/resposta.txt"`. `FileNotFoundError` para `transcricao.txt` significa que falta a saída da etapa anterior; não é motivo para instalar mais bibliotecas. `SyntaxError` pede comparar indentação e conteúdo salvos; o exemplo usa somente a biblioteca padrão Python, sem pip.

## 4. Síntese de voz e reprodução

Para uma síntese inicial leve, use eSpeak NG: Debian/Ubuntu oferece `sudo apt install espeak-ng`; Alpine/postmarketOS, `sudo apk add espeak-ng` quando disponível na release; Termux empacota eSpeak NG sob o nome **`espeak`**, instalado por `pkg install espeak`. Confira `command -v espeak-ng`, `espeak-ng --voices=pt` e sua ajuda. Pacotes de síntese não habilitam automaticamente uma saída de áudio ausente.

```bash
espeak-ng -v pt -f "$HOME/voz-mini-pc/resposta.txt" -w "$HOME/voz-mini-pc/resposta.wav"
```

Reproduza o WAV com `pw-play "$HOME/voz-mini-pc/resposta.wav"` no PipeWire nativo. No Termux:API preparado, `termux-media-player play "$HOME/voz-mini-pc/resposta.wav"` usa o player Android; `termux-media-player stop` o encerra. Alternativamente, abra o arquivo com um player compatível. Assim, problemas de síntese e reprodução permanecem separáveis. Piper oferece vozes neurais locais; o projeto atual está em **OHF-Voice/piper1-gpl**, e não se deve presumir manutenção do repositório histórico. Verifique wheel/binário para sua arquitetura e libc, arquivo de configuração do modelo, licença e voz portuguesa antes de migrar.

## Integração, erros e alternativas

Só adicione um modelo de linguagem depois de [validar inferência](./ia-local.md). Envie-lhe texto de propósito limitado e nunca execute sua resposta como shell. Um servidor remoto reduz carga, mas envia fala/transcrição para outro equipamento. Documente quais dados ficam armazenados e como apagá-los.

Transcrição errada pede ouvir o áudio e confirmar idioma; ruído pede ganho/microfone; lentidão pede modelo menor ou backend remoto; síntese sem som pede reproduzir WAV isolado; falta de microfone nativo pede analisar driver e sessão de áudio ou usar microfone USB compatível. Escuta contínua eleva consumo e pode captar outras pessoas.

## Backup, rollback e testes finais

Guarde versões e configuração, não publique gravações pessoais. Pare a captura e os processos de inferência antes de remover pastas. Revogue permissões de microfone do Android se abandonar o projeto. Exclua dados de teste deliberadamente, sem apagar modelos/projetos não relacionados.

**Teste final:** áudio audível, transcrição comparada, resposta correta para hora/data, frase desconhecida sem ação, WAV de resposta reproduzível e indicador claro de gravação. Teste com e sem rede para comprovar que seu caminho declarado como local realmente funciona offline.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem instalar ferramentas, captar áudio ou executar modelos no telefone. [whisper.cpp](https://github.com/ggml-org/whisper.cpp), [modelos](https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md), [download revisado](https://github.com/ggml-org/whisper.cpp/blob/master/models/download-ggml-model.sh), [PipeWire pw-cat](https://docs.pipewire.org/page_man_pw-cat_1.html), [comando Termux de microfone](https://github.com/termux/termux-api-package/blob/master/scripts/termux-microphone-record.in), [eSpeak NG](https://github.com/espeak-ng/espeak-ng), [empacotamento Termux espeak](https://github.com/termux/termux-packages/blob/master/packages/espeak/build.sh), [Piper atual](https://github.com/OHF-Voice/piper1-gpl). Nome, revisão, tamanho e SHA-256 do modelo foram conferidos em metadados públicos sem baixar os pesos. Captura, conversão, transcrição e síntese exigem validação no aparelho; o script Python é um exemplo original, não um assistente completo.
