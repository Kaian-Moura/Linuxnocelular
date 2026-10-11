---
title: Assistente por voz — áudio, transcrição e resposta
sidebar_position: 9
description: Construa uma cadeia de voz explícita com captura verificável, STT local e respostas limitadas.
last_verified: '2026-10-10'
validation: documental
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

No **Linux nativo com PipeWire funcional**, consulte `wpctl status` para encontrar a entrada correta. Se `pw-record --help` confirmar as opções, grave um WAV como usuário da sessão:

```bash
mkdir -p "$HOME/voz-mini-pc"
pw-record --rate 16000 --channels 1 --format s16 "$HOME/voz-mini-pc/entrada.wav"
```

Fale uma frase curta e finalize com Ctrl+C; reproduza com `pw-play "$HOME/voz-mini-pc/entrada.wav"`. Se estiver silencioso, confira fonte selecionada, mute, ganho, permissões e o driver. Não continue para Whisper antes de ouvir a gravação.

No **Android**, uma alternativa é gravar pelo aplicativo do fabricante e exportar o arquivo. Termux:API, quando instalado com assinatura compatível, também expõe funções de áudio mediante permissões Android; instale o aplicativo e pacote correspondentes e consulte `termux-microphone-record --help`. Não instale apenas o pacote CLI esperando dispensar o APK e a autorização de microfone.

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

O comando seguinte pressupõe que você obteve o arquivo oficial compatível `models/ggml-base.bin`:

```bash
./build/bin/whisper-cli \
  -m models/ggml-base.bin \
  -f "$HOME/voz-mini-pc/entrada.wav" \
  -l pt -otxt -of "$HOME/voz-mini-pc/transcricao"
```

Confira as opções na ajuda da versão. `-l pt` escolhe português; saída texto e prefixo produzem `transcricao.txt` quando esse formato é suportado. Leia o arquivo e compare com o que você falou. Meça duração da gravação versus duração do processamento: a latência pode ser inadequada para conversação contínua em CPU.

## 3. Responder a intenções limitadas

Crie `~/voz-mini-pc/responder.py`:

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

## 4. Síntese de voz e reprodução

Para uma síntese inicial leve, use eSpeak NG quando oferecido pelo sistema: em Debian/Ubuntu, `sudo apt install espeak-ng`; em outros ambientes, confirme o pacote e o executável disponíveis. Confira `espeak-ng --voices=pt` e sua ajuda antes de selecionar uma voz.

```bash
espeak-ng -v pt -f "$HOME/voz-mini-pc/resposta.txt" -w "$HOME/voz-mini-pc/resposta.wav"
```

Reproduza o WAV pelo player do sistema ou `pw-play` no PipeWire nativo. Assim, problemas de síntese e reprodução permanecem separáveis. Piper oferece vozes neurais locais; o projeto atual está em **OHF-Voice/piper1-gpl**, e não se deve presumir manutenção do repositório histórico. Verifique wheel/binário para sua arquitetura e libc, arquivo de configuração do modelo, licença e voz portuguesa antes de migrar.

## Integração, erros e alternativas

Só adicione um modelo de linguagem depois de [validar inferência](./ia-local.md). Envie-lhe texto de propósito limitado e nunca execute sua resposta como shell. Um servidor remoto reduz carga, mas envia fala/transcrição para outro equipamento. Documente quais dados ficam armazenados e como apagá-los.

Transcrição errada pede ouvir o áudio e confirmar idioma; ruído pede ganho/microfone; lentidão pede modelo menor ou backend remoto; síntese sem som pede reproduzir WAV isolado; falta de microfone nativo pede analisar driver e sessão de áudio ou usar microfone USB compatível. Escuta contínua eleva consumo e pode captar outras pessoas.

## Backup, rollback e testes finais

Guarde versões e configuração, não publique gravações pessoais. Pare a captura e os processos de inferência antes de remover pastas. Revogue permissões de microfone do Android se abandonar o projeto. Exclua dados de teste deliberadamente, sem apagar modelos/projetos não relacionados.

**Teste final:** áudio audível, transcrição comparada, resposta correta para hora/data, frase desconhecida sem ação, WAV de resposta reproduzível e indicador claro de gravação. Teste com e sem rede para comprovar que seu caminho declarado como local realmente funciona offline.

## Fontes e verificação

Revisão documental: **10/10/2026**. [whisper.cpp](https://github.com/ggml-org/whisper.cpp), [modelos](https://github.com/ggml-org/whisper.cpp/blob/master/models/README.md), [PipeWire pw-cat](https://docs.pipewire.org/page_man_pw-cat_1.html), [Termux:API](https://github.com/termux/termux-api), [eSpeak NG](https://github.com/espeak-ng/espeak-ng), [Piper atual](https://github.com/OHF-Voice/piper1-gpl). Modelos, captura e síntese devem ser validados no aparelho; o script Python é um exemplo original, não um produto de assistente completo.
