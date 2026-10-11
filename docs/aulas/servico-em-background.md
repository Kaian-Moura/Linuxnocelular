---
title: 'Deixar um programa trabalhando e retomá-lo'
description: Crie um marcador com logs limitados, teste tmux, entenda os limites do Android e prepare um serviço próprio somente no Linux nativo adequado.
sidebar_position: 70
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Fechar a janela do terminal, perder a conexão SSH e reiniciar o telefone são três acontecimentos diferentes. Nesta aula você fará um programa pequeno continuar trabalhando quando sai do terminal, voltará para vê-lo e o encerrará conscientemente. Depois entenderá o que falta para transformá-lo num serviço iniciado pelo sistema.

**Resultado:** um marcador que registra uma linha a cada dez segundos, conserva poucos arquivos de log e aceita encerramento normal. **Dificuldade:** iniciante na parte de Python/tmux; intermediária na integração com o Linux nativo. **Materiais:** terminal utilizável, Python 3.9 ou superior, tmux e uma pasta nova. Não há servidor de rede, senha, leitura de sensores nem comunicação com outra máquina neste exercício.

Se ainda não instalou seu ambiente, comece pela [primeira aula Termux](primeiro-projeto-termux.md), pela [aula de Linux nativo](mini-pc-nativo.md) ou pelo [Linux no computador](../comece-aqui/linux-no-computador.md). Não substitua o sistema operacional para aprender a manter um processo: a primeira parte funciona num ambiente já disponível.

## 1. Entenda as quatro peças

**Programa** é o código que você escreveu. **Processo** é uma execução desse código; abrir duas vezes pode criar dois processos escrevendo no mesmo arquivo. **Terminal** é o lugar onde você interage com aquela execução. **Gerenciador de serviços** é a ferramenta que inicia, acompanha e encerra processos conforme regras do sistema.

O tmux conserva uma sessão de terminal à qual você pode se conectar novamente. Ele não instala um serviço de boot nem ressuscita o programa depois que o sistema desliga. Essa distinção é a função descrita no [guia oficial do tmux](https://github.com/tmux/tmux/wiki/Getting-Started): separar a conexão do terminal dos programas que continuam naquele servidor tmux.

Pense num caderno aberto sobre a mesa. Desconectar SSH é sair da sala; retomar o tmux é voltar ao caderno. Reboot desmonta a sala inteira. Salvar o conteúdo em arquivo conserva as anotações, mas não conserva o processo que as produziu.

| Situação | O que se espera deste exercício | O que não foi garantido |
|---|---|---|
| Sair da sessão tmux | Marcador continua enquanto o sistema o mantém vivo | Sobreviver ao encerramento do aplicativo pelo Android |
| SSH desconecta | Sessão tmux pode ser retomada | Disponibilidade da rede ou do servidor SSH |
| Tela apaga | Comportamento depende do sistema e da energia | Execução periódica pontual em suspensão/Doze |
| Sistema reinicia | Arquivos anteriores permanecem se salvos | Marcador reiniciar sem integração própria |

## 2. Instale somente as ferramentas do seu ambiente

Execute **um** dos blocos abaixo, no ambiente indicado. `pkg`, `apt` e `apk` não são nomes diferentes do mesmo comando: administram conjuntos de pacotes distintos.

No Termux original, fora de PRoot:

```sh
pkg update
pkg install python tmux nano
```

No Debian/Ubuntu já instalado, com uma conta que administra aquele sistema:

```sh
sudo apt update
sudo apt install python3 tmux nano
```

Dentro de um Debian PRoot em que sua conta já aparece como root, a preparação é `apt update` e `apt install python3 tmux nano`, sem acrescentar `sudo`. Esse root é do ambiente convidado, não desbloqueio do Android.

No Alpine/postmarketOS, com os repositórios da release já conferidos:

```sh
sudo apk add python3 tmux nano
```

Se a instalação exige um privilégio que você não possui, não instale outro gerenciador para contornar. Volte à preparação da distribuição. A [administração de aplicativos](../desktop/instalar-aplicativos.md) explica origens e arquiteturas.

Confira:

```sh
python3 --version
tmux -V
command -v python3
```

A primeira consulta precisa responder Python 3.9 ou posterior. O caminho retornado pela terceira importa na integração nativa: no Termux ele normalmente pertence à área privada do aplicativo, e não ao `/usr/bin` de uma distribuição convencional.

## 3. Crie uma pasta sem substituir outro projeto

No terminal, consulte `pwd` para saber onde está. Crie a pasta com `mkdir`, sem `-p`, para que um nome já existente produza erro:

```sh
mkdir "$HOME/mini-pc-aula-servico"
```

**Se apareceu “File exists”, pare:** pode ser seu exercício anterior. Confira o conteúdo e retome-o ou escolha outro nome; não prossiga sobrescrevendo arquivos. Se a criação funcionou:

```sh
cd "$HOME/mini-pc-aula-servico"
nano marcador.py
```

Cole o código inteiro. No nano, `Ctrl+O`, Enter e `Ctrl+X` salvam e saem. O bloco Python é conteúdo de arquivo; não digite suas linhas soltas no shell.

```python
import argparse
import logging
import math
from logging.handlers import RotatingFileHandler
from pathlib import Path
import signal
import threading


parser = argparse.ArgumentParser(description="Marcador didático local")
parser.add_argument("--passos", type=int, default=0)
parser.add_argument("--intervalo", type=float, default=10.0)
args = parser.parse_args()
if args.passos < 0 or args.passos > 1000:
    parser.error("--passos precisa estar entre 0 e 1000")
if not math.isfinite(args.intervalo) or args.intervalo < 0.1 or args.intervalo > 3600:
    parser.error("--intervalo precisa estar entre 0.1 e 3600 segundos")

base = Path(__file__).resolve().parent
logs = base / "logs"
logs.mkdir(exist_ok=True)
logger = logging.getLogger("minipc.marcador")
logger.setLevel(logging.INFO)
handler = RotatingFileHandler(
    logs / "marcador.log", maxBytes=16384, backupCount=2, encoding="utf-8"
)
handler.setFormatter(logging.Formatter("%(asctime)s %(levelname)s %(message)s"))
logger.addHandler(handler)
parar = threading.Event()


def pedir_parada(numero, quadro):
    parar.set()


signal.signal(signal.SIGINT, pedir_parada)
signal.signal(signal.SIGTERM, pedir_parada)
logger.info("inicio intervalo=%s passos=%s", args.intervalo, args.passos)
print("Marcador iniciado; log em", logs / "marcador.log", flush=True)
contador = 0
try:
    while not parar.is_set():
        contador += 1
        logger.info("passo=%s", contador)
        if args.passos and contador >= args.passos:
            break
        parar.wait(args.intervalo)
finally:
    logger.info("fim passos_registrados=%s", contador)
    logging.shutdown()
    print("Marcador encerrado normalmente.", flush=True)
```

O caminho do log é calculado a partir do próprio script, evitando que o programa escreva numa pasta diferente só porque foi iniciado de outro terminal. A opção `--passos 0`, padrão, repete até um sinal de encerramento; valores positivos limitam a quantidade. O intervalo padrão é dez segundos, para que o exercício não desperdice escrita nem energia.

A rotação conserva o arquivo ativo e no máximo duas cópias, com limite aproximado de 16 KiB por arquivo para estas linhas curtas. Os registros mais antigos serão substituídos conforme o exercício continua. Não use essa política como arquivo histórico de um serviço real. A [referência Python de rotação](https://docs.python.org/3/library/logging.handlers.html#rotatingfilehandler) descreve a API; os limites e o marcador desta aula são escolhas didáticas.

O programa não lê sua bateria nem prova que um serviço importante está saudável. A linha `passo=3` comprova apenas que esta execução chegou àquele ponto. Não coloque duas instâncias simultâneas no mesmo diretório: esta rotação simples não coordena múltiplos escritores.

## 4. Faça primeiro um teste que termina sozinho

Execute:

```sh
python3 marcador.py --passos 3 --intervalo 1
```

Você deve ver início e encerramento, com duração de aproximadamente dois segundos entre os três passos. Depois:

```sh
tail -n 10 logs/marcador.log
```

Procure `inicio`, três linhas `passo=` e `fim passos_registrados=3`. Horários e separadores variam com o ambiente. Se apareceu traceback, não avance para tmux: confirme nome, indentação e versão Python. `python3 -m py_compile marcador.py` verifica sintaxe e cria uma pequena pasta `__pycache__` neste projeto; não executa o marcador.

O log pode já conter uma execução anterior. Separe os grupos por `inicio` e `fim`, em vez de afirmar que todas as linhas pertencem ao último comando. Em caso de erro de permissão, consulte `pwd` e `ls -ld . logs`; não use `chmod 777` nem execute todo o programa como root.

**Checkpoint:** o teste limitado termina sozinho e você localiza suas cinco linhas no log.

## 5. Abra uma sessão tmux identificada

Crie uma sessão só para a aula:

```sh
tmux new-session -s minipc-aula-marcador
```

Se o nome já existe, não crie outra sessão nem encerre todas. Use `tmux list-sessions` e retome `tmux attach-session -t minipc-aula-marcador`. Dentro dela, confirme a pasta e inicie **uma** execução:

```sh
cd "$HOME/mini-pc-aula-servico"
python3 marcador.py
```

Agora o prompt não volta, pois o marcador está em primeiro plano dentro do terminal tmux. Pressione `Ctrl+B`, solte as teclas e pressione `D`. Isso desacopla a sessão; não é `Ctrl+D`. O shell externo volta, enquanto o processo continua na sessão conservada.

Aguarde cerca de vinte segundos. No shell externo:

```sh
tmux list-sessions
tail -n 5 "$HOME/mini-pc-aula-servico/logs/marcador.log"
```

Repita a leitura após mais dez segundos e compare o último contador. Uma linha mais recente comprova continuidade nesse intervalo. O simples nome da sessão na lista não prova que seu programa ainda executa: ela pode conter apenas um shell.

## 6. Retome e pare sem atingir outras sessões

Reconecte:

```sh
tmux attach-session -t minipc-aula-marcador
```

Você deve encontrar o marcador. Pressione `Ctrl+C` uma vez e espere a mensagem de encerramento. Confira no log `fim`, seguido de um contador que deixa de crescer. Depois digite `exit` no shell dessa sessão, caso queira encerrar somente esse terminal.

O comando de encerramento global do servidor tmux afetaria outros trabalhos. Nesta aula ele não é necessário. Se você acidentalmente criou duas sessões, liste os nomes e encerre o programa de cada sessão consciente do conteúdo; não mate todo processo Python do sistema.

Teste a retomada uma segunda vez: abra a sessão, inicie o marcador, desacople e retome. Essa repetição exercita seu procedimento, sem reboot. Num acesso SSH, só teste queda de conexão depois de confirmar outra forma de retornar ao aparelho e de salvar o endereço; [aula de SSH](ssh-arquivos.md).

## 7. O que muda no Android

Termux e PRoot continuam subordinados ao Android. A documentação Android descreve restrições de CPU e rede durante [Doze e App Standby](https://developer.android.com/training/monitoring-device-state/doze-standby); os mantenedores do Termux também registram [limitações de processos em versões Android](https://github.com/termux/termux-app#android-12-support). Um tmux não transforma o aplicativo em um init Linux independente.

Para um teste curto no Termux, se os comandos estiverem disponíveis, `termux-wake-lock` solicita um wake lock e `termux-wake-unlock` o libera. Antes, consulte `command -v termux-wake-lock`; não instale complementos aleatórios quando o comando falta. Mantenha o aplicativo visível, observe o consumo e libere o lock ao concluir. Essa solicitação não elimina todas as políticas de bateria, nem promete sobreviver a Doze, fechamento forçado ou reboot.

Não aplique os exemplos systemd/OpenRC seguintes dentro de PRoot. Instalar seus pacotes não cria o init real do telefone. Para automação Android, plugins como Termux:Boot têm instalação, assinatura, permissões e políticas próprias; siga a [documentação Termux](../android/termux.md) e trate boot automático como teste separado. Esta aula não instala nenhum plugin nem promete inicialização Android antes do desbloqueio da tela.

## 8. Antes de criar um serviço nativo

As próximas variantes são **alternativas**, executadas somente num Linux nativo administrado por você. Não faça ambas. O exercício Python precisa ter passado, você deve saber retornar ao sistema e nenhum marcador pode continuar aberto no tmux.

Confira o sistema real, não apenas programas disponíveis:

```sh
cat /etc/os-release
cat /proc/1/comm
command -v python3
```

Se `/proc/1/comm` não puder ser lido, registre a restrição; isso não identifica o init. systemd precisa ser o gerenciador ativo, com uma sessão de usuário funcional. Para OpenRC, consulte também `rc-status` e `rc-update show`; seu PID 1 pode ter outro nome, portanto não identifique OpenRC somente por essa linha. Escolha a variante conforme a integração documentada da distribuição.

Antes de editar um arquivo já existente, preserve uma cópia e revise o serviço. Os exemplos usam um nome específico da aula e **não substituem arquivos existentes**. O rollback desativa somente esse nome; não remove GNOME, SSH, rede ou outros serviços.

## 9. Variante systemd: serviço da sua conta

Esta variante exige Python em `/usr/bin/python3`, a pasta criada com o nome original e uma conta comum. Se o caminho retornado foi diferente, ajuste o arquivo após conferir o executável; não crie um link sobre outro Python. Faça as verificações sem `sudo`:

```sh
systemctl --user is-system-running
test -x /usr/bin/python3
test -f "$HOME/mini-pc-aula-servico/marcador.py"
```

Se a primeira consulta disser que não conecta ao bus, encerre esta variante. Ela não foi preparada para sessão sem gerenciador de usuário. Um estado `degraded` indica falhas que precisam ser identificadas, não ausência do gerenciador; não altere serviços alheios para esconder o aviso. Confira manualmente que o nome não existe em `systemctl --user cat minipc-aula-marcador.service` e em `~/.config/systemd/user/` antes de criar o arquivo:

```sh
mkdir -p "$HOME/.config/systemd/user"
nano "$HOME/.config/systemd/user/minipc-aula-marcador.service"
```

Conteúdo do arquivo, **não comando do terminal**:

```ini
[Unit]
Description=Marcador didatico do mini-PC

[Service]
Type=simple
ExecStart=/usr/bin/python3 %h/mini-pc-aula-servico/marcador.py
Restart=no

[Install]
WantedBy=default.target
```

`%h` é interpretado pelo systemd como a pasta da conta; não é sintaxe shell. O serviço não usa root e não expõe rede. `Restart=no` evita esconder uma falha atrás de uma repetição automática. As opções estão na [referência do serviço no repositório systemd](https://github.com/systemd/systemd/blob/main/man/systemd.service.xml); confira também os manuais instalados da sua versão.

Valide e inicie manualmente antes de habilitar:

```sh
systemd-analyze --user verify "$HOME/.config/systemd/user/minipc-aula-marcador.service"
systemctl --user daemon-reload
systemctl --user start minipc-aula-marcador.service
systemctl --user status minipc-aula-marcador.service --no-pager
```

Se a validação acusa erro, corrija-o antes de `start`. Confira duas leituras do log separadas por dez segundos e pare:

```sh
systemctl --user stop minipc-aula-marcador.service
```

Só depois do ensaio, `systemctl --user enable minipc-aula-marcador.service` registra início junto ao gerenciador da conta. Isso não basta para prometer execução antes de login. Para esse comportamento, verifique `loginctl show-user "$USER" -p Linger` e a [documentação loginctl](https://github.com/systemd/systemd/blob/main/man/loginctl.xml). Habilitar linger é uma decisão administrativa separada: `sudo loginctl enable-linger "$USER"` pode manter processos da conta após logout e no boot. Faça isso apenas na sua conta identificada, anote o valor anterior e avalie energia. Não é necessário para terminar o exercício.

Rollback: `systemctl --user disable --now minipc-aula-marcador.service`. Se você alterou Linger de `no` para `yes` exclusivamente nesta aula, restaure com `sudo loginctl disable-linger "$USER"`; não desative um valor anterior usado por outros projetos. Conserve o arquivo desativado e suas anotações, sem apagar logs.

## 10. Variante OpenRC: serviço do sistema, processo sem root

Esta variante exige Linux nativo OpenRC, administração disponível, `/usr/bin/python3`, conta existente e uma home acessível no momento de inicialização. **Home criptografada ou montada só após login não serve automaticamente a esta receita.** Não instale um script que aponte para arquivos indisponíveis durante boot.

Registre `id -un`, `id -gn`, `id -u` e `pwd` dentro da pasta do projeto. A conta escolhida para o processo precisa ser comum, com UID diferente de zero; se está trabalhando como root, volte à conta adequada antes de preparar esta variante. O exemplo seguinte é um **modelo a editar**, não um download pronto. Substitua `CONTA_AULA`, `GRUPO_AULA` e `/home/CONTA_AULA` pelos valores efetivamente conferidos. Se seus nomes/caminhos têm espaços ou caracteres especiais, a simples substituição exige tratamento adicional; prefira a variante tmux até revisar a sintaxe com alguém experiente.

Crie primeiro `minipc-aula-marcador.openrc` dentro do projeto, pelo editor:

```sh
#!/sbin/openrc-run
description="Marcador didatico do mini-PC"
command="/usr/bin/python3"
command_args="/home/CONTA_AULA/mini-pc-aula-servico/marcador.py"
command_user="CONTA_AULA:GRUPO_AULA"
command_background=true
pidfile="/run/${RC_SVCNAME}.pid"
```

O [guia oficial OpenRC](https://github.com/OpenRC/openrc/blob/master/service-script-guide.md) fundamenta execução em background e conta sem privilégio. O PID fica em `/run`, administrado pelo sistema, e não num diretório que a conta pode substituir. O programa grava somente na própria pasta. Ele não depende de rede, portanto não recebe uma dependência de rede inventada.

Leia o arquivo com `cat`, verifique que todas as substituições foram feitas, confira a conta com `id CONTA_REAL` e rode `sh -n minipc-aula-marcador.openrc`. Essa consulta verifica sintaxe shell, **não** comprova usuário, Python, integração ou boot. Pare se `/etc/init.d/minipc-aula-marcador` já existe; conserve/revise o anterior em vez de sobrescrevê-lo.

Somente depois desses gates, instale o arquivo **novo** e teste:

```sh
sudo install -m 755 minipc-aula-marcador.openrc /etc/init.d/minipc-aula-marcador
sudo rc-service minipc-aula-marcador start
sudo rc-service minipc-aula-marcador status
```

Confirme o log e o dono do processo antes de habilitar. Pare com `sudo rc-service minipc-aula-marcador stop`; depois de passar o ensaio, `sudo rc-update add minipc-aula-marcador default` registra a aula no runlevel padrão. Um serviço marcado como iniciado não substitui sua verificação do contador.

Rollback: pare somente esse serviço e use `sudo rc-update del minipc-aula-marcador default`. Conserve o arquivo e o projeto para revisão. O exemplo não instala um supervisor de reinício automático: falhas devem continuar visíveis. Reinício supervisionado é um passo posterior, quando você definiu limites, intervalos e ações para falhas reais.

## 11. Valide persistência sem confundir com a primeira execução

Reboot é opcional e exige arquivos salvos, energia estável, acesso alternativo e plano de retorno. Não reinicie apenas para completar uma caixa. Anote horário, última linha e modo habilitado. Quando realmente reiniciar, confira se existe **novo** `inicio` e se o contador cresce, mesmo sem abrir o programa manualmente.

| Verificação | Evidência adequada |
|---|---|
| Continua depois de desacoplar tmux | Duas linhas novas entre leituras, sessão correta |
| Encerra normalmente | Linha `fim`, retorno do prompt, contador para |
| Serviço manual funciona | Status, processo da conta certa e log novo |
| Início persistente funciona | Novo grupo após boot/login esperado sem comando manual |
| Rollback funciona | Serviço desativado e nenhuma escrita posterior |

Na [ficha de evidências](../diagnostico/ficha-evidencias.mdx), separe “testado nesta sessão” de “validado após reboot”. Não declare alta disponibilidade por um teste de um minuto. Para produção, ainda faltam alertas, backups, segurança, limites de recursos, atualização e ensaio de recuperação.

## 12. Erros comuns e próximos passos

**“Duplicate session”:** a sessão tmux já existe; liste e retome. **“No server running”:** não há sessão ativa naquele usuário/socket; isso pode ser normal depois de encerramento. **Log parado:** confirme o processo, o horário e a pasta antes de iniciar outra cópia. **“Permission denied”:** identifique o arquivo e a conta; não mude permissões de toda a home.

**Serviço failed:** confira o caminho Python e o erro específico no [exercício de logs](logs-primeira-investigacao.md). **Android encerra após tela apagar:** registre tempo/política e limites do método; não atribua automaticamente à rotação. **Depois do boot não inicia:** verifique qual gerenciador/conta foi habilitado e disponibilidade dos arquivos. **CPU ou bateria elevada:** pare a aula e compare [desempenho](diagnostico-desempenho.md) antes de tentar prolongar sua execução.

O marcador pode ser adaptado para uma automação própria, mas não substitua seu conteúdo por comandos baixados sem revisão. Comece com uma tarefa que já funciona em primeiro plano; acrescente logs limitados, teste encerramento e apenas então use um gerenciador. Para um servidor educativo, siga a [aula Python HTTP](servidor-python.md); para conservação do código, [Git](git-primeiro-repositorio.md) e [backup](backup-restauracao.md).

**Escopo da validação desta aula:** o script original e as operações isoladas de tmux foram exercitados num computador Linux, em diretório temporário. Não foi instalado serviço systemd/OpenRC, alterado init ou acessado smartphone. Os exemplos de integração são documentais e exigem os gates e testes no seu próprio sistema; não comprovam boot, bateria nem políticas Android de qualquer aparelho.
