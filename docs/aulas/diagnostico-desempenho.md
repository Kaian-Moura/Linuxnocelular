---
title: 'Descobrir por que o mini-PC está lento'
description: Faça uma linha de base repetível, separe CPU, memória, armazenamento, rede e renderização e execute um ensaio pequeno somente no seu projeto.
sidebar_position: 71
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

“Está lento” pode significar que o ponteiro engasga, uma página demora para carregar, um programa leva muito tempo para compilar ou a interface congela quando você abre várias aplicações. Esses sintomas não têm necessariamente a mesma causa. Instalar mais RAM virtual ou selecionar “máximo desempenho” sem medir pode esconder o problema e piorar energia e temperatura.

**Resultado:** um registro com tarefas observáveis, consultas que não alteram o sistema e um ensaio Python limitado à sua própria pasta. **Dificuldade:** iniciante para a medição; intermediária para interpretar drivers e renderização. **Materiais:** sistema já utilizável, terminal, Python 3.9 ou posterior, aproximadamente 20 MiB livres para o exercício e um meio seguro de retomar o controle. Não há testes destrutivos de disco nem mudanças de frequências, drivers ou proteção térmica.

Você não precisa executar toda ferramenta para ter um diagnóstico útil. Um dado indisponível deve ser registrado como indisponível, com a razão. Não instale kernels ou dê root somente para preencher uma tabela. Este exercício não estabelece uma nota universal para comparar todos os celulares.

## 1. Transforme a reclamação numa ação mensurável

Escolha uma tarefa curta, que possa repetir sem acessar dados pessoais. Exemplos: abrir uma cópia local de um documento, mover uma janela durante dez segundos, executar o teste do seu projeto Python ou compilar o mesmo código pequeno. Defina o que você considera aceitável antes de mudar alguma configuração.

| Sintoma inicial | Uma pergunta melhor | Observação útil |
|---|---|---|
| Mouse lento | O ponteiro engasga também sem navegador? | Tipo de mouse, conexão, resolução e tarefa |
| Navegador demora | Página local e página da Internet diferem? | Tempo até resposta e até interação |
| Compilação lenta | O mesmo projeto demora mais após aquecer? | Versão, comando, três durações, estado térmico |
| Abas fecham | A aplicação encerra ou apenas recarrega uma aba? | Horário, processo, pressão de memória/log |
| Arquivo demora | Está na área privada, cartão ou compartilhamento de rede? | Caminho do teste e tamanho, sem conteúdo |

Essas perguntas não são conclusões. Ponteiro lento pode vir de Bluetooth fraco, renderização por software, transmissão remota, compositor ou carga. Página lenta pode vir de rede, JavaScript, gráfico ou armazenamento. Descreva o gatilho antes de escolher uma camada.

A [ficha de evidências](../diagnostico/ficha-evidencias.mdx) ajuda a conservar sistema, montagem e observações. Para um problema novo, exporte uma revisão distinta, preservando a anterior; não altere silenciosamente o registro que embasou sua comparação.

## 2. Identifique onde está medindo

No Linux nativo:

```sh
cat /etc/os-release
uname -r
uname -m
python3 --version
```

No Termux, use `termux-info` para sua consulta local e guarde somente os campos relevantes após revisar informações pessoais. Dentro de PRoot, `/etc/os-release` identifica o convidado, enquanto `uname` ainda se relaciona ao kernel Android. O desempenho do convidado inclui tradução de chamadas e armazenamento daquele caminho; não é resultado de um Linux que substituiu o Android.

Anote se observa o monitor físico, uma janela remota ou uma sessão gráfica aninhada. A latência de VNC/RDP envolve captura, compressão, rede e cliente. Um jogo lento numa sessão remota não comprova que a Adreno está lenta. Da mesma forma, renderização acelerada de um aplicativo não comprova aceleração de outro.

Registre versão do projeto e dependências. Um ensaio com Python de versão distinta, executado em PRoot em vez de Termux, pode mudar sem que o hardware tenha mudado. A arquitetura `aarch64` sozinha não identifica biblioteca C, driver, suporte a Vulkan nem clock efetivo.

## 3. Controle o cenário antes de repetir

Salve seu trabalho. Feche somente as aplicações pessoais que você decide retirar do cenário; não encerre processos do sistema em massa. Aguarde a atividade de instalação/atualização terminar. Mantenha a mesma resolução, montagem de cabos, origem da alimentação, brilho e tarefa entre repetições.

Evite testar num aparelho quase descarregado, exposto ao sol ou já quente por uma carga anterior. Não deixe benchmarks trabalhando indefinidamente para “estabilizar”. Se a carcaça aquece anormalmente, há aviso térmico ou cheiro/deformação de bateria, interrompa o ensaio; esse estado não é um alvo de otimização.

Para a primeira linha de base, faça três repetições da mesma tarefa e anote todas. A mediana é o valor do meio após ordenar três tempos, útil para não escolher somente a tentativa mais rápida. Não descarte a repetição lenta sem explicar uma interferência observada.

Na comparação seguinte, altere **uma** variável: por exemplo, menos abas ou uma resolução menor que já seja suportada. Volte ao estado anterior quando possível e repita. Uma melhoria em uma única tentativa é pista, não prova. Alternar A, B e A novamente ajuda a perceber se o aquecimento ou uma atividade externa explica a diferença.

## 4. Observe CPU sem mudar sua política

Use o monitor do sistema disponível no desktop ou `top` no terminal. Deixe-o alguns segundos aberto, reproduza a tarefa e saia com `Q` quando aplicável. A primeira tela pode não representar um intervalo útil. BusyBox, procps e ferramentas Android exibem colunas diferentes; confira sua ajuda antes de interpretar números como idênticos.

Um processo pode aparecer com uso superior a 100% quando a ferramenta soma atividade de vários núcleos. Por outro lado, um trabalho limitado a uma única thread pode esgotar seu núcleo enquanto a utilização total parece moderada. “CPU total abaixo de 100%” não descarta limitação de processamento.

Em Linux, estas consultas são de leitura:

```sh
cat /proc/loadavg
cat /proc/uptime
```

Não trate load average como percentual de CPU. Ele resume tarefas executáveis e certas esperas; exige contexto de capacidade e período. Se um terminal Android bloqueia a leitura, registre a restrição e use uma ferramenta do próprio sistema, sem reduzir sua segurança.

O escalonamento de frequência tem integração específica com o kernel e o hardware, descrita no [guia CPUFreq](https://www.kernel.org/doc/html/latest/admin-guide/pm/cpufreq.html). Esta aula não escreve em governors, não prende processos a núcleos e não desativa limites. Primeiro descubra se a tarefa realmente espera CPU; depois trate qualquer mudança como experimento específico com retorno.

## 5. Leia memória: “livre” não é “disponível”

No Linux que oferece a ferramenta, execute `free -h`. Se ela falta ou sua implementação tem formato diferente, consulte os campos do kernel:

```sh
grep -E '^(MemTotal|MemFree|MemAvailable|Buffers|Cached|SwapTotal|SwapFree):' /proc/meminfo
```

A [documentação de `/proc`](https://docs.kernel.org/filesystems/proc.html) descreve esses campos. `MemFree` é memória imediatamente sem uso; `MemAvailable` é uma estimativa do que pode ficar disponível sem swapping. Cache guarda dados já lidos e pode ser aproveitado ou recuperado. RAM ocupada por cache não equivale automaticamente a vazamento. As unidades indicadas como `kB` nesses campos são tradicionalmente de 1.024 bytes.

GB comercial usa bilhões de bytes; GiB usa potências de 1.024. Um anúncio de 12 GB, reserva de hardware, kernel e arredondamentos não precisa produzir “12” numa ferramenta em GiB. Também não confunda RAM com os 128/256 GB de armazenamento. A [introdução de memória do kernel](https://docs.kernel.org/admin-guide/mm/concepts.html) fornece a distinção entre memória física e endereçamento virtual.

O tamanho virtual de um processo não é a quantidade inteira ocupada na RAM. Bibliotecas podem ser compartilhadas. Somar as colunas de todos os processos do navegador também pode contar partes compartilhadas mais de uma vez. Para começar, observe tendência, atividade e encerramentos em vez de atribuir precisão absoluta a uma única coluna.

Compare o mesmo cenário com uma, três e depois mais abas apenas se houver margem e o aparelho permanecer estável. Se memória disponível cai e processos são encerrados, conserve o horário e os logs relevantes. Não crie um swap gigante nem limpe caches como resposta automática; isso pode gerar escrita, mascarar o cenário e competir com espaço. Esta aula não altera [parâmetros VM](https://docs.kernel.org/admin-guide/sysctl/vm.html).

## 6. Confira espaço e local de escrita

Na pasta onde está seu projeto:

```sh
df -h .
df -i .
```

`df -h` informa capacidade do sistema de arquivos que contém aquela pasta. Isso não equivale à capacidade nominal inteira do aparelho. `df -i` consulta inodes quando a ferramenta/sistema oferece essa informação; um erro ou um formato sem inodes deve ser registrado, não corrigido com reparticionamento.

Um volume pode ter espaço em bytes e ainda não conseguir criar arquivos por quotas, inodes, permissões ou montagem somente leitura. Em PRoot, um caminho em armazenamento compartilhado Android pode ter comportamento diferente da área privada. No Termux, começar dentro da home do aplicativo evita misturar o ensaio com permissões de uma pasta externa.

Não use comandos `dd` contra `/dev/...`, ferramentas de teste de flash inteiro nem gravações maiores que o espaço livre. Não execute testes em dados do banco, cartões com arquivos importantes ou volumes de boot. O ensaio a seguir cria um arquivo temporário pequeno próprio, confere seu conteúdo e o remove ao terminar.

## 7. Prepare o ensaio original e limitado

Instale Python somente se falta: `pkg install python` no Termux; `sudo apt install python3` no Debian/Ubuntu; `sudo apk add python3` no Alpine/postmarketOS com repositórios conferidos. Não execute todas as variantes. Dentro de PRoot com usuário root convidado, use seu APT sem `sudo`. Volte à [aula Python](python-projeto-completo.md) se ainda não sabe criar/salvar um arquivo.

Crie uma pasta **nova**:

```sh
mkdir "$HOME/mini-pc-aula-medicoes"
```

Se já existe, pare e retome o exercício anterior sem substituir arquivos. Depois de criação bem-sucedida:

```sh
cd "$HOME/mini-pc-aula-medicoes"
nano medir.py
```

Cole este programa original:

```python
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import platform
import statistics
import tempfile
import time


parser = argparse.ArgumentParser(description="Ensaio pequeno do projeto")
parser.add_argument("--saida", default="medicao-01.json")
args = parser.parse_args()
if Path(args.saida).name != args.saida or not args.saida.endswith(".json"):
    parser.error("Use somente um nome de arquivo .json nesta pasta")
base = Path(__file__).resolve().parent
destino = base / args.saida
if destino.exists():
    parser.error("O arquivo de resultado já existe; escolha outro nome")
scratch = base / "scratch"
scratch.mkdir(exist_ok=True)
payload = b"minipc-aula-0123" * (524288)
digest = hashlib.sha256(payload).hexdigest()
amostras = []

with tempfile.TemporaryDirectory(prefix="ensaio-", dir=scratch) as pasta:
    arquivo = Path(pasta) / "dados-proprios.bin"
    for numero in range(1, 4):
        inicio = time.perf_counter()
        resultado = sum((n * n) % 1009 for n in range(300000))
        cpu_s = time.perf_counter() - inicio
        inicio = time.perf_counter()
        with arquivo.open("wb") as fluxo:
            fluxo.write(payload)
            fluxo.flush()
            os.fsync(fluxo.fileno())
        escrita_s = time.perf_counter() - inicio
        inicio = time.perf_counter()
        with arquivo.open("rb") as fluxo:
            lido = fluxo.read()
        leitura_s = time.perf_counter() - inicio
        if hashlib.sha256(lido).hexdigest() != digest:
            raise RuntimeError("Conteúdo lido não corresponde ao próprio arquivo")
        amostras.append({
            "repeticao": numero, "calculo_s": cpu_s,
            "escrita_fsync_s": escrita_s, "leitura_cache_s": leitura_s,
            "resultado_calculo": resultado,
        })
        del lido
        time.sleep(1)

relatorio = {
    "tipo": "ensaio-didatico-nao-ranking", "bytes_arquivo": len(payload),
    "utc": datetime.now(timezone.utc).isoformat(),
    "python": platform.python_version(), "arquitetura": platform.machine(),
    "amostras": amostras,
    "medianas_s": {
        campo: statistics.median(item[campo] for item in amostras)
        for campo in ("calculo_s", "escrita_fsync_s", "leitura_cache_s")
    },
}
with destino.open("x", encoding="utf-8") as fluxo:
    json.dump(relatorio, fluxo, ensure_ascii=False, indent=2)
    fluxo.write("\n")
print("Resultado salvo em", destino.name)
print(json.dumps(relatorio["medianas_s"], indent=2))
```

O arquivo de dados tem 8 MiB, reescrito três vezes: aproximadamente 24 MiB de conteúdo escrito, além de metadados. A maior parte da memória é payload mais cópia lida, não um teste de toda a RAM. O cálculo é Python puro de quantidade fixa; ele não mede todos os núcleos, GPU nem instruções ARM específicas.

`perf_counter()` mede duração, não relógio de parede; `fsync()` solicita sincronização do arquivo. Mesmo assim, filesystem, camadas de armazenamento e hardware influenciam o significado do tempo. A leitura acontece depois da escrita e pode aproveitar cache; por isso seu nome é `leitura_cache_s`. Veja [tempo em Python](https://docs.python.org/3/library/time.html#time.perf_counter) e [sincronização](https://docs.python.org/3/library/os.html#os.fsync).

## 8. Execute e confira o que foi conservado

```sh
python3 medir.py
cat medicao-01.json
ls -la scratch
```

O JSON deve ter três amostras e três medianas. A pasta `scratch` deve ficar sem subpastas de ensaio depois de conclusão normal. Se houve desligamento ou erro, pode restar uma pasta `ensaio-...`; confira que contém somente o arquivo gerado antes de removê-la manualmente. Não apague toda a pasta de projetos como limpeza.

Para repetir em outro momento:

```sh
python3 medir.py --saida medicao-02.json
```

O programa se recusa a substituir um resultado existente. Preserve ambos e acrescente seu cenário num arquivo `contexto.md`, porque o JSON não coleta versão da distribuição, montagem de energia, aplicações abertas ou temperatura automaticamente.

**Checkpoint:** três amostras válidas, nome distinto por execução e dados próprios verificados por hash. Um tempo muito pequeno não permite concluir que o armazenamento inteiro é rápido; uma duração alta não identifica sozinha o componente que atrasou.

## 9. Interprete números sem inventar causa

A tabela seguinte é **ilustrativa, não medição de um telefone**:

| Cenário fictício | Cálculo: mediana | Escrita/fsync: mediana | Observação |
|---|---:|---:|---|
| A: sessão tranquila | 0,050 s | 0,020 s | Poucas aplicações |
| B: compilação simultânea | 0,120 s | 0,024 s | CPU concorrente observada |
| A novamente | 0,052 s | 0,021 s | Retorno próximo à linha de base |

Nesse exemplo, a hipótese de concorrência de CPU recebe apoio porque o cálculo varia e volta. Ainda não existe prova de defeito de hardware. Se todos os números mudam junto com a fonte de energia e a temperatura, seu experimento não isolou a variável.

Comparar um notebook x86 com um telefone ARM serve para testar o programa, não para prometer o desempenho do telefone. Versão Python, kernel, PRoot, filesystem, recursos compartilhados e condições físicas precisam acompanhar a interpretação. Não apresente o menor número como “velocidade do Snapdragon”.

## 10. Separe fluidez gráfica de rede e cálculo

Reproduza a lentidão numa aplicação local simples. Se ela ocorre no monitor físico sem rede, investigue compositor/renderer/input. Se aparece somente em VNC, compare com o monitor e consulte [acesso remoto](../desktop/acesso-remoto.md). Se somente uma página online engasga, teste conteúdo local e veja ferramentas do próprio navegador sem instalar “otimizadores”.

No Linux com ferramentas Mesa **já disponíveis**, `glxinfo -B` examina um contexto GLX/X11; `eglinfo` trata EGL e pode imprimir vários dispositivos/plataformas. No Wayland, GLX pode representar Xwayland e não o compositor. Consulte primeiro `command -v glxinfo` ou `command -v eglinfo`. Pacotes e permissões variam; a [página GPU](../hardware/gpu.md) ensina identificação em vez de receitar um pacote universal.

Renderer contendo `llvmpipe` ou `softpipe` sugere renderização por CPU naquele contexto. Um nome de GPU não comprova todos os caminhos de aceleração. As [variáveis Mesa](https://docs.mesa3d.org/envvars.html) são controles diagnósticos, não um conjunto para colar no perfil global. Não force `LIBGL_ALWAYS_SOFTWARE`, drivers Vulkan, flags de navegador ou bibliotecas Android nesta aula.

Frequência do monitor, FPS da aplicação e taxa de envio remoto são medidas distintas. Um monitor em 60 Hz pode apresentar animação irregular. Um teste WebGL rápido não comprova decodificação de vídeo por hardware. Observe também frametimes e pausas quando a aplicação fornece essas métricas: a média pode esconder travamentos.

## 11. Observe calor e energia sem escrever em sysfs

Em Linux nativo, sensores suportados podem aparecer em `/sys/class/thermal/thermal_zone*/`. Leia somente `type` e `temp` dos sensores identificados:

```sh
for zona in /sys/class/thermal/thermal_zone*; do
    [ -r "$zona/type" ] && [ -r "$zona/temp" ] || continue
    printf '%s: ' "$zona"
    cat "$zona/type" "$zona/temp"
done
```

Não interprete todo sensor como temperatura da CPU. A [interface térmica do kernel](https://docs.kernel.org/driver-api/thermal/sysfs-api.html) define a representação habitual em milésimos de grau Celsius; drivers e ports precisam implementar dados corretos. No Android, acesso pode estar bloqueado. A ausência da leitura não prova ausência de proteção.

Para energia, consulte os dispositivos oferecidos pelo sistema em `/sys/class/power_supply/`, sem assumir que a bateria se chama `BAT0`. Escolha o diretório identificado como bateria e leia `status` e `capacity` quando presentes. Consulte unidades e sinais na [classe power supply](https://docs.kernel.org/power/power_supply_class.html), antes de converter tensão/corrente. Um campo “Charging” não garante que a carga total supera o consumo do seu desktop.

Registre tendência de porcentagem durante vários minutos do cenário conhecido, sem colocar ou retirar PD no meio de um benchmark. Mudança de energia/hub pode afetar USB e vídeo, não apenas CPU. Use a [montagem validada](../hardware/montagem-validada.md) e a [página de energia](../hardware/energia.md) para isolar a negociação elétrica.

## 12. Escreva uma conclusão com limites e retorno

Seu relatório deve ligar evidência a hipótese: “Cálculo manteve mediana semelhante; ponteiro engasga apenas na sessão remota; monitor físico responde; vou investigar captura/rede” é melhor que “ARM é lento”. Outra conclusão válida é “Não pude medir renderer porque não há sessão gráfica acessível; CPU/RAM sozinhas não resolvem a dúvida”.

Conserve o comando, as três amostras, contexto, alteração e resultado posterior. Se o ensaio falha por permissão ou filesystem, leia a [aula de logs](logs-primeira-investigacao.md). Se um ajuste melhora fluidez, repita a tarefa real e o ensaio de retomada. Não deixe uma variável global experimental depois de concluir sem entender quais aplicações ela afeta.

O rollback desta aula consiste em parar o script, conservar ou mover seus JSON e manter o sistema com os parâmetros originais: nenhum governor, módulo, init, firmware ou regra de energia foi alterado pelo exercício. Os arquivos próprios cabem no [backup de projetos](backup-restauracao.md).

**Escopo de validação:** o programa original foi executado num computador Linux em diretório temporário, com três amostras, verificação do arquivo e recusa de sobrescrita. Isso valida o funcionamento do exercício, não as taxas de um smartphone, a GPU Adreno, sensores, hubs ou estabilidade térmica de qualquer port. Registre suas próprias observações antes de comparar desempenho.
