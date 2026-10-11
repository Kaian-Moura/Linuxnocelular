---
title: 'Primeira investigação de erro: logs e evidências'
description: Provoque um erro controlado num projeto próprio, conserve saída e status, filtre registros e prepare um relato técnico sem publicar dados pessoais.
sidebar_position: 72
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você executou um comando, apareceu uma mensagem e a primeira ideia foi tentar outro comando. Antes de fazer isso, conserve o que aconteceu. Uma investigação útil começa com **qual tarefa falhou, em qual ambiente, após qual ação e com qual evidência**. O log ajuda a localizar a falha; não é uma lista de frases para procurar uma correção automática.

Nesta aula você criará um programa próprio que funciona, produzirá um erro intencional sem afetar o sistema e registrará os dois casos. Depois aprenderá a consultar registros de aplicativo, serviço e kernel conforme o ambiente, com limites de acesso e privacidade.

**Resultado:** relatório curto reproduzível, com horários, status, saída, hipótese e próxima verificação. **Dificuldade:** iniciante. **Materiais:** terminal, Python 3.9 ou posterior, editor e uma pasta nova. A parte do projeto pode ser feita no Termux, PRoot ou Linux nativo; consultas do sistema dependem de permissões e implementação. Não exige CrashDump, root Android, kernel panic, reinício ou periféricos físicos.

## 1. Saiba de que tipo de registro precisa

Um aplicativo registra decisões do próprio código; o compositor registra sua sessão gráfica; um gerenciador de serviços registra início/encerramento; o kernel registra eventos de drivers. Uma mensagem numa camada pode ser consequência da falha em outra.

| Pergunta | Primeiro registro provável | Cuidado de interpretação |
|---|---|---|
| Meu script não cria arquivo | Saída/status/log do próprio script | Permissão, caminho e arquivo existente vêm antes de kernel |
| Serviço não inicia | Status e erro daquele serviço | “Failed” resume o resultado, não explica sozinho a causa |
| USB aparece, mas não digita | Kernel, HID e input | Presença no barramento não comprova eventos |
| Monitor some após reconectar | Kernel/DRM/Type-C e compositor | Sessão encerrada e cabo ausente são situações distintas |
| Linux convidado para no Android | Aplicativo e políticas Android | Não existe journal systemd nativo só porque o pacote foi instalado |

A [biblioteca de aulas](biblioteca.mdx) e os guias de [hardware](../hardware/montagem-validada.md) aprofundam essas cadeias. Nesta aula, o problema está deliberadamente dentro do próprio programa, para aprender o método sem arriscar o telefone.

**Log** é um registro de eventos. **Timestamp** indica quando uma linha foi registrada, segundo uma referência de tempo. **Severidade** é a classificação escolhida pelo autor: INFO, WARNING e ERROR, por exemplo. Uma linha com ERROR antiga pode não ter relação com o sintoma atual; uma falha importante pode ocorrer sem uma linha explícita com essa palavra.

## 2. Prepare ferramentas no ambiente certo

Se Python e editor já estão disponíveis, não reinstale. Consulte:

```sh
python3 --version
command -v nano
command -v rg
```

`rg` é ripgrep, uma busca textual opcional. Se falta, `grep` atende os filtros simples desta aula. Para instalação, escolha somente seu ambiente:

| Ambiente | Preparação correspondente |
|---|---|
| Termux, fora de PRoot | `pkg install python nano ripgrep` |
| Debian/Ubuntu administrado | `sudo apt install python3 nano ripgrep` |
| Alpine/postmarketOS, repositórios conferidos | `sudo apk add python3 nano ripgrep` |
| Debian PRoot com root convidado | `apt install python3 nano ripgrep` dentro do convidado |

Se os índices de pacotes estão desatualizados, atualize-os pelo gerenciador desse ambiente conforme a [aula de aplicativos](../desktop/instalar-aplicativos.md). Não acrescente repositórios de outra distribuição. O exercício usa somente biblioteca padrão Python; não é necessário `pip install`.

Crie uma pasta nova, sem reutilizar o nome silenciosamente:

```sh
mkdir "$HOME/mini-pc-aula-logs"
```

Se já existe, pare e escolha retomar a pasta ou outro nome. Depois da criação bem-sucedida:

```sh
cd "$HOME/mini-pc-aula-logs"
nano diagnostico.py
```

Cole o programa no editor, salve com `Ctrl+O`, Enter e saia com `Ctrl+X` no nano.

## 3. Crie um aplicativo que explica sua própria falha

```python
import argparse
from datetime import datetime, timezone
import logging
from pathlib import Path
import sys
import time


parser = argparse.ArgumentParser(description="Exercício original de diagnóstico")
parser.add_argument("--modo", choices=("normal", "erro"), default="normal")
parser.add_argument("--saida", default="resultado.txt")
args = parser.parse_args()
if Path(args.saida).name != args.saida or args.saida in ("", ".", ".."):
    parser.error("--saida precisa ser um nome simples dentro do projeto")

base = Path(__file__).resolve().parent
logger = logging.getLogger("minipc.aula.logs")
logger.setLevel(logging.INFO)
formato = logging.Formatter("%(asctime)sZ %(levelname)s %(message)s",
                            datefmt="%Y-%m-%dT%H:%M:%S")
formato.converter = time.gmtime
arquivo_log = logging.FileHandler(base / "aplicativo.log", encoding="utf-8")
console = logging.StreamHandler(sys.stderr)
for handler in (arquivo_log, console):
    handler.setFormatter(formato)
    logger.addHandler(handler)


def executar():
    logger.info("inicio modo=%s", args.modo)
    if args.modo == "erro":
        logger.error("etapa=validacao falha intencional do exercício")
        print("Não houve criação de resultado neste modo.", file=sys.stderr)
        return 20
    try:
        with (base / args.saida).open("x", encoding="utf-8") as fluxo:
            fluxo.write("Resultado fictício produzido pela aula.\n")
            fluxo.write(datetime.now(timezone.utc).isoformat() + "\n")
    except FileExistsError:
        logger.error("etapa=escrita arquivo já existe; preservado")
        print("Escolha outro --saida; o anterior continua intacto.", file=sys.stderr)
        return 3
    except OSError as erro:
        logger.error("etapa=escrita tipo=%s", type(erro).__name__)
        print("Falha de escrita; confira pasta e permissão.", file=sys.stderr)
        return 4
    logger.info("etapa=escrita concluída")
    print("Resultado criado:", args.saida)
    return 0


status = executar()
logger.info("fim status=%s", status)
logging.shutdown()
sys.exit(status)
```

O programa não inspeciona contas, rede nem USB. A saída é fictícia. O modo `erro` retorna uma falha proposital e não cria o resultado; o modo normal cria um arquivo novo, recusando substituição. Esse controle permite testar o método de investigação sem causar um problema real.

O [guia Python de logging](https://docs.python.org/3/howto/logging.html) apresenta eventos e níveis; o [argparse](https://docs.python.org/3/library/argparse.html) valida argumentos. A política de status e mensagens aqui é específica deste programa, não uma convenção universal para outros aplicativos.

`aplicativo.log` recebe os registros e conserva execuções anteriores. O console recebe registros via stderr, inclusive INFO: **estar em stderr não transforma automaticamente toda linha em erro**. O texto destinado ao resultado normal vai para stdout. `Z` nos timestamps deste programa representa UTC; não invente esse sufixo em logs que usam outro relógio.

Este arquivo de log não possui rotação automática. O exercício produz poucas linhas por execução; não deixe esse código num loop contínuo. Para um processo longo, use a [aula de serviço com rotação limitada](servico-em-background.md). Evite registrar senhas, conteúdo de documentos ou tokens, mesmo num aplicativo próprio.

## 4. Capture uma execução que funciona

Primeiro crie um diretório novo para esta captura:

```sh
mkdir captura-normal
```

Se ele já existe, conserve-o e use outro nome nos comandos seguintes; redirecionamentos `>` podem substituir arquivos. Depois de criação bem-sucedida:

```sh
date -u '+%Y-%m-%dT%H:%M:%SZ' > captura-normal/inicio.txt
python3 diagnostico.py > captura-normal/stdout.txt 2> captura-normal/stderr.txt
status_aula=$?
printf '%s\n' "$status_aula" > captura-normal/status.txt
date -u '+%Y-%m-%dT%H:%M:%SZ' > captura-normal/fim.txt
```

Execute este bloco no shell interativo comum. Se você habilitou `set -e` num script externo, uma falha pode encerrar o script antes da captura; o comportamento precisa ser tratado naquele script. Não é necessário alterar suas opções de shell para realizar esta aula.

`>` envia stdout ao primeiro arquivo. `2>` envia stderr ao segundo. `$?` é o status do comando imediatamente anterior, por isso guardamos esse valor **na linha seguinte**. Se rodar `date` ou `echo` antes da atribuição, você conserva o status desses comandos em vez do programa.

Confira:

```sh
cat captura-normal/status.txt
cat captura-normal/stdout.txt
cat captura-normal/stderr.txt
cat resultado.txt
```

O status deve ser `0`, stdout deve informar o nome e o arquivo deve conter duas linhas fictícias. stderr deve conter início, escrita concluída e fim, com nível INFO. Há texto em stderr mesmo com sucesso: agora você comprovou por que procurar somente “stderr não vazio” seria um teste incorreto.

## 5. Capture a falha controlada sem apagar o sucesso

Crie outro diretório:

```sh
mkdir captura-erro
```

Depois de sucesso na criação:

```sh
date -u '+%Y-%m-%dT%H:%M:%SZ' > captura-erro/inicio.txt
python3 diagnostico.py --modo erro > captura-erro/stdout.txt 2> captura-erro/stderr.txt
status_aula=$?
printf '%s\n' "$status_aula" > captura-erro/status.txt
date -u '+%Y-%m-%dT%H:%M:%SZ' > captura-erro/fim.txt
```

Leia os três registros. O status deve ser `20`, stdout deve ficar vazio, stderr explica `etapa=validacao` e `resultado.txt` da execução anterior continua existindo. A aplicação não travou o Linux nem perdeu vídeo: falhou deliberadamente numa etapa conhecida.

Execute o modo normal novamente, diretamente no terminal. Como `resultado.txt` já existe, o status será `3` e a mensagem explica preservação. Consulte `printf '%s\n' "$?"` imediatamente depois. Esse é um terceiro caso distinto, que não precisa apagar o arquivo para “corrigir”. Use `python3 diagnostico.py --saida resultado-02.txt` se quiser outra execução normal com saída nova.

| Caso deste programa | Status esperado | Evidência para diferenciar |
|---|---:|---|
| Normal, destino novo | 0 | Mensagem de criação, log concluído e arquivo |
| Modo erro intencional | 20 | Etapa validação e nenhuma criação nova |
| Normal, destino existente | 3 | Preservação do arquivo, sem substituição |
| Falha de escrita tratada | 4 | Tipo de OSError registrado |
| Argumento não aceito | 2 | Mensagem do argparse antes da lógica da aplicação |

Não provoque falha de filesystem mudando permissões da home ou enchendo a partição. Os dois erros seguros acima bastam para aprender a captura. Outros programas atribuem significado diferente aos códigos; consulte sua documentação e saída.

## 6. Filtre o registro sem perder o contexto

Use `tail -n 20 aplicativo.log` para ler as últimas vinte linhas. Para procurar eventos específicos com ripgrep:

```sh
rg -n -C 2 'ERROR|fim status=' aplicativo.log
```

`-n` apresenta o número de linha; `-C 2` conserva duas linhas antes e depois. O [guia ripgrep](https://github.com/BurntSushi/ripgrep/blob/master/GUIDE.md) descreve as opções. Procure também as linhas de início que delimitam cada execução. Se ripgrep falta:

```sh
grep -n -E 'ERROR|fim status=' aplicativo.log
tail -n 20 aplicativo.log
```

A implementação grep do seu ambiente pode não aceitar todas as extensões; use `grep --help` quando houver dúvida. A segunda leitura conserva contexto de forma simples. Um filtro que não encontra correspondência pode retornar status diferente de zero sem ter encontrado falha do sistema. “Não houve linha com ERROR” não prova sucesso.

Para acompanhar o arquivo em outro terminal, `tail -f aplicativo.log` mostra novas linhas; interrompa com `Ctrl+C`. Isso encerra o acompanhamento, não o aplicativo que outra sessão executa. Uma consulta contínua não precisa ficar ligada após concluir o teste.

Não publique só uma palavra isolada. A linha “arquivo já existe” precisa do comando, caminho lógico, status e informação de que o programa recusou sobrescrita. Cortar tudo ao redor pode transformar uma proteção correta num suposto defeito.

## 7. Separe horário de evento e horário de coleta

Nos arquivos de captura, `inicio.txt` e `fim.txt` delimitam quando você executou o teste segundo UTC. Os timestamps do log indicam quando cada mensagem foi produzida. Essa comparação ajuda a excluir mensagens antigas.

O kernel pode usar tempo desde o boot; ferramentas podem convertê-lo para um horário aproximado. Depois de suspensão, ajuste de relógio ou reinício, essas referências não devem ser misturadas sem cuidado. Um horário de relógio incorreto não prova ordem causal; anote o relógio usado e preserve a ordem original das linhas.

Quando dois equipamentos participam, conserve os horários em cada um e indique se relógios estavam sincronizados. Não reescreva todos os timestamps para parecerem iguais. Para começar, uma janela curta com ação anotada é suficiente: “aos 14:32 UTC iniciei o modo erro; às 14:32 UTC recebi status 20”.

## 8. Consulte registros nativos somente quando relevantes

Antes de usar ferramentas de serviço, identifique `/etc/os-release`, sua conta e o init ativo. A existência do executável `journalctl` não comprova que há journal do host dentro de PRoot. Não instale systemd ou OpenRC para obter um log que pertence ao Android.

### Linux com systemd ativo

Para o serviço **próprio** criado na aula anterior:

```sh
systemctl --user status minipc-aula-marcador.service --no-pager
journalctl --user -u minipc-aula-marcador.service --since '10 minutes ago' -n 60 --no-pager
```

Essas opções limitam conta, unidade, janela e quantidade de linhas. O [manual-fonte journalctl](https://github.com/systemd/systemd/blob/main/man/journalctl.xml) descreve os filtros. Um serviço do sistema requer consulta sem `--user` e pode exigir privilégios do sistema administrado; não altere grupos indiscriminadamente para ler todos os registros.

Journal vazio pode significar que o serviço envia logs a arquivo, não iniciou naquele período ou não existe persistência daquele boot. No nosso marcador, a evidência principal é `logs/marcador.log`; stdout/stderr do serviço apenas complementam. Não suponha que o conteúdo daquele arquivo estará automaticamente todo duplicado no journal.

### Linux com OpenRC ativo

Consulte `rc-service minipc-aula-marcador status` para o serviço próprio. O OpenRC organiza serviços, mas não impõe um único journal universal. Verifique para onde o programa foi configurado a gravar; nesta aula anterior, isso é a pasta do projeto.

Distribuições podem ter um syslog instalado que escreve em `/var/log/messages`, outro destino ou nenhum serviço de logging equivalente. Antes de pedir um arquivo, confira existência, permissão e configuração da distribuição. `rc-status` descreve estado de serviços, não substitui as mensagens da aplicação. O [guia OpenRC](https://github.com/OpenRC/openrc/blob/master/service-script-guide.md) esclarece o contrato dos scripts.

### Kernel Linux

`dmesg` consulta um buffer do kernel. Pode exigir privilégios e pode já ter perdido eventos antigos. Comece com `dmesg --help` porque util-linux e BusyBox oferecem opções diferentes. No util-linux que aceita o filtro, `dmesg --level=err,warn` seleciona níveis; isso ainda pode mostrar dados não relacionados e pessoais.

Não use opções de limpar o buffer ou escrever configuração de kernel. A [documentação dmesg no util-linux](https://github.com/util-linux/util-linux/blob/master/sys-utils/dmesg.1.adoc) distingue leitura e alterações. Uma negativa de permissão não é prova de driver ausente: registre “não pude ler como esta conta”. Elevação, quando necessária num Linux administrado por você, deve ser uma leitura específica e justificada, não root permanente do ambiente.

Para eventos USB/vídeo, registre a ação física e uma janela curta, conserve original privado e compartilhe apenas linhas pertinentes, com contexto. Não reproduza CrashDump ou panic só para conseguir logs. Se o sistema já falhou, primeiro siga a [triagem de recuperação](../recuperacao/triagem.md); pode não haver registro recuperável do último evento.

## 9. No Android, use o contexto Android

Logs do programa dentro de Termux/PRoot continuam disponíveis nos arquivos que você criou. Logs de serviços Android pertencem ao Android. Se ADB já está autorizado e você administra o aparelho, `adb devices` identifica a conexão; não publique seu identificador. Um comando que funciona no notebook não implica autorização no telefone.

`adb logcat` é outra fonte, documentada no [guia Android](https://developer.android.com/tools/logcat). Filtros dependem de aplicativo, versão e mensagens existentes; não invente uma tag universal “Linux”. Um recorte específico exige primeiro identificar o processo/tag da aplicação de interesse. Não use captura integral contínua como requisito de suporte público.

Logcat pode revelar notificações, nomes, URLs e dados de aplicativos. Guarde-o localmente, reduza a janela e revise o trecho antes de publicar. Não limpe o buffer para “ficar bonito”, pois isso destrói evidência útil. Se ADB não está autorizado e a tela está quebrada, a aula não oferece um método para burlar essa autorização.

No caso de PRoot encerrado após apagar a tela, registre versão Android, origem/versão Termux, atividade antes do fechamento, tempo aproximado e política de energia. Um status retornado pelo convidado e uma mensagem Android são evidências diferentes. A [página Termux](../android/termux.md) descreve limites e preparação.

## 10. Revise privacidade antes de montar o relato

Primeiro conserve o original privado, sem editar suas evidências. Depois produza uma cópia reduzida. Revise nomes de usuário, IPs públicos, MACs, SSIDs, identificadores, caminhos com nome pessoal, tokens, cabeçalhos Authorization, cookies e conteúdo de mensagens.

Substitua um valor privado por um rótulo consistente, como `USUARIO_LOCAL`, quando ele não é necessário para reproduzir. Se um endereço precisa ser distinguido, use `DISPOSITIVO_A` e `DISPOSITIVO_B`; não troque ambos por uma marca igual que destrói a relação. Preserve versão do software, código do erro e ordem de mensagens pertinentes.

Redação não é garantia automática de anonimização. Um filtro que remove a palavra “senha” pode deixar um token numa URL. Quando o diagnóstico depende de informação confidencial, registre a dependência e use um canal adequado; não peça que alguém publique o dump inteiro num issue.

Os arquivos deste exercício contêm somente texto fictício e horários, mas a política deve ser aprendida antes de investigar aplicações reais. Não acrescente captura de variáveis de ambiente completas: elas podem conter credenciais que seu programa nunca deveria registrar.

## 11. Produza um relato que outra pessoa consegue repetir

Crie `relato.md` no projeto. Este exemplo é **um relato do exercício, não diagnóstico de hardware**:

```text
Título: exercício retorna 20 no modo de erro controlado
Ambiente: preencher sistema, arquitetura e versão Python observados
Objetivo: criar resultado fictício numa pasta própria
Estado anterior: execução normal retornou 0 e criou resultado.txt
Comando: python3 diagnostico.py --modo erro
Esperado pela aula: status 20, nenhuma criação nova
Observado: status 20; stderr informa etapa=validacao
Janela: preencher os horários conservados na captura
Evidência: trecho de inicio, ERROR e fim daquela execução
Hipótese: falha proposital no caminho --modo erro
Teste: usar modo normal com destino novo resultado-02.txt
Resultado do teste: registrar status e existência do novo arquivo
Mudanças no sistema: nenhuma; somente arquivos deste projeto
Limite: não mede USB, kernel, rede nem disponibilidade de serviço
```

No exemplo, a hipótese pode ser confirmada lendo a condição `if args.modo == "erro"` e comparando o modo normal. Para um problema real, o código da aplicação pode não estar disponível; você ainda deve indicar o que foi observado e o que permanece incerto.

Não conclua que “todos os erros foram resolvidos” porque uma segunda execução funcionou. Conserve qual variável mudou e repita o gatilho original. Um relato reproduzível permite alguém descartar uma hipótese sem pedir novamente as informações básicas.

## 12. Termine conservando a evidência e o aprendizado

Confira que você consegue localizar a captura de sucesso, a de erro e o arquivo anterior preservado. Repita uma execução normal com nome novo e compare seu status com o erro. Se uma ferramenta de busca não existe, use a alternativa sem alterar o sistema inteiro.

Faça [backup do projeto](backup-restauracao.md) incluindo script, relato e recortes revisados, em destino externo quando disponível. Logs originais privados não precisam ir para um repositório público. No [Git](git-primeiro-repositorio.md), selecione o que versiona em vez de adicionar toda captura sem revisão.

O rollback da aula não precisa restaurar firmware: você só criou arquivos numa pasta própria. Deixe-a conservada, ou mova-a pelo gerenciador de arquivos depois de copiar o que deseja. Não há serviço instalado por esta aula nem comando de limpeza de journal/kernel.

**Escopo de validação:** o programa original foi executado em diretório temporário de um computador Linux; foram conferidos sucesso, falha controlada, destino existente, preservação dos dados e separação de stdout/stderr/status. Não foram coletados logs de telefone, alterados serviços do host ou reproduzidas falhas de hardware. Consultas nativas/Android são documentais e condicionais ao ambiente efetivamente disponível.
