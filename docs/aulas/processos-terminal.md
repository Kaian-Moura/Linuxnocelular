---
title: 'Processos: inicie, acompanhe e encerre seu próprio programa'
description: Pratique primeiro plano, jobs, PID, sinais, retorno e registros num programa de laboratório, sem interromper serviços reais.
sidebar_position: 51
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai iniciar um programa pequeno, observar sua atividade, guardar mensagens num arquivo e encerrá-lo corretamente. Depois vai distinguir um programa em execução de um terminal que mostra sua saída. Essa diferença ajuda a compreender servidores, conexões SSH, aplicativos encerrados pelo Android e sessões gráficas que desaparecem.

**Dificuldade:** iniciante, após [arquivos e permissões](arquivos-permissoes.md). **Materiais:** ambiente Linux/Termux já acessível, Bash interativo, `sleep` e uma pasta nova. **Resultado:** um script fictício, registros de execução e um procedimento para controlar apenas processos que você iniciou. Não faremos benchmark, instalação de serviço ou mudança no boot.

:::warning Trabalhe numa janela dedicada
Os sinais desta aula têm como alvo somente `relatorio-aula.sh`, criado aqui. Não use nomes de GNOME, SSH, Bluetooth, USB ou gerenciadores de pacotes como alvo de comandos de encerramento. Não execute como administrador. Se perdeu a identificação de um processo, consulte novamente antes de agir; PID antigo não é uma autorização permanente.
:::

## 1. Entenda programa, processo e terminal

Programa é o código preparado para executar; processo é uma instância em execução. Abrir duas vezes um programa pode criar duas instâncias, cada qual com identificação e estado próprios. Um arquivo `.sh` parado no armazenamento não está consumindo CPU só por existir. Quando Bash o interpreta, surge trabalho em execução.

Terminal transmite entrada e exibe saída. Shell, como Bash, interpreta os comandos digitados. Aplicativo gráfico, terminal e shell podem ser processos diferentes. Fechar uma janela pode encerrar a sessão ou interromper programas associados, mas não constitui uma forma universal de desligar todo servidor.

PID é um número que identifica um processo enquanto ele existe naquele contexto. PPID identifica o processo pai. O kernel pode reutilizar PIDs depois: nunca guarde um número por dias para enviar um sinal sem conferir a identidade atual. Job é um registro de trabalho mantido pelo shell; `%1` não significa PID 1.

Esta aula pede uma janela exclusiva porque controle de jobs pertence ao shell que iniciou os trabalhos. Outra aba não herda automaticamente sua lista. Pela interface remota, confirme também em qual máquina o shell executa; a tela do notebook pode controlar processos do telefone por SSH.

## 2. Prepare o ambiente sem reinstalar Linux

Abra um terminal e consulte:

```sh
pwd
whoami
command -v bash
command -v sleep
command -v ps
```

Se Bash está presente, digite `bash` e depois `bash --version`. Em Termux, utilize o aplicativo das [origens oficiais documentadas](https://github.com/termux/termux-app#installation) e a [instalação detalhada](../android/termux.md). Em Linux nativo, abra o terminal do desktop ou uma sessão de usuário. Não é necessário ter root no Android.

Se falta Bash, siga somente a instalação correspondente:

```bash
# Termux, fora do PRoot
pkg update
pkg install bash
```

```bash
# Debian/Ubuntu nativo, administração já configurada
sudo apt update
sudo apt install bash
```

```bash
# Alpine/postmarketOS, administração e repositórios do port já configurados
sudo apk update
sudo apk add bash
```

No port com `doas`, use o mecanismo documentado. Dentro de Debian PRoot administrativo, a instalação interna pode dispensar `sudo`; isso não concede administração do Android. Caso falte `ps`, não escolha imediatamente um pacote de outra distribuição: consulte [pacotes e repositórios](pacotes-repositorios.md). Alpine costuma oferecer `ps` BusyBox; Debian e Termux podem usar procps, com opções diferentes.

`jobs`, `fg`, `bg`, `wait` e `kill` existem como comandos internos do Bash. Para consultar localmente suas opções, use `help jobs`, por exemplo. O [manual do Bash publicado pelo Debian](https://manpages.debian.org/trixie/bash/bash.1.en.html#JOB_CONTROL) explica controle de jobs e comandos internos. Não confunda um script executado sem terminal com uma sessão interativa capaz de receber atalhos.

**Checkpoint 2:** uma sessão Bash de usuário está aberta, `sleep` está disponível e você sabe qual implementação fornece a consulta de processos.

## 3. Crie um programa que termina sozinho

Execute as linhas separadamente:

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/processos-aula"
cd "$HOME/projetos/processos-aula"
mkdir logs
pwd
```

Se `processos-aula` já existe, não continue criando arquivos por cima: consulte a retomada na seção 13 ou escolha outro nome. Se `cd` falhar, pare. Na pasta nova, crie o script com um editor conhecido ou pelo bloco abaixo. Copie desde `cat` até a última linha `EOF`, incluindo ambas:

```bash
cat > relatorio-aula.sh <<'EOF'
printf 'PID=%s inicio do relatorio ficticio\n' "$$"
trap 'printf "%s\n" "TERM recebido: encerramento preparado."; exit 0' TERM
trap 'printf "%s\n" "INT recebido: usuario interrompeu."; exit 130' INT
for etapa in 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20
do
  printf 'Etapa ficticia %s de 20\n' "$etapa"
  sleep 2
done
printf '%s\n' 'Relatorio ficticio concluido.'
EOF
cat relatorio-aula.sh
bash -n relatorio-aula.sh
```

O marcador entre aspas `<<'EOF'` conserva o texto literalmente: `$$` será interpretado quando o programa rodar, não durante a criação. `>` só é apropriado aqui porque o arquivo é novo. `bash -n` verifica sintaxe sem executar o trabalho; ausência de mensagem e retorno zero é o sucesso esperado. Isso não constitui auditoria de segurança de um script desconhecido.

O programa anuncia seu PID, conta 20 etapas e espera dois segundos por etapa. Deve terminar em aproximadamente 40 segundos, conforme escalonamento. Não faz rede, não altera hardware e não contém repetição infinita. `trap` define como ele reage a dois sinais; nenhum programa precisa adotar exatamente essa política.

**Checkpoint 3:** você leu o script e sabe que a atividade consiste somente em mensagens e esperas. Não execute código que não consegue relacionar a um objetivo.

## 4. Observe o primeiro plano e a conclusão natural

Inicie:

```bash
bash relatorio-aula.sh
```

Enquanto ele executa, o prompt não está disponível para receber outro comando da mesma sessão. Esse é o primeiro plano. Não digite uma sequência de tentativas achando que o terminal travou: aguarde as mensagens. Ao terminar naturalmente, deve aparecer `Relatorio ficticio concluido.` e o prompt retorna.

Imediatamente depois, consulte:

```bash
printf 'Retorno da execucao: %s\n' "$?"
```

`$?` representa o retorno do comando anterior. Para essa conclusão planejada esperamos `0`, convencionalmente sucesso. Se executar `pwd` antes de consultar, terá o retorno de `pwd`, não do script. Anote operação, momento e código; um número sozinho não explica por que algo falhou.

Agora repita e, após duas etapas, pressione **Ctrl+C** uma vez. Ctrl é a tecla de controle; não é necessário Shift. No Termux, o botão CTRL adicional permite enviar a combinação. O script deve mostrar sua mensagem de interrupção e devolver o prompt. Consulte `$?` imediatamente: escolhemos `130` para esse encerramento.

O terminal geralmente envia INT ao grupo do trabalho em primeiro plano. Nosso programa trata esse sinal. Outros programas podem terminar sem mensagem, pedir confirmação ou preservar dados por regras próprias. Primeiro salve documentos e use a saída oferecida pelo aplicativo; Ctrl+C não garante que um banco finalize uma transação.

## 5. Suspenda e retome na mesma sessão

Inicie novamente `bash relatorio-aula.sh` e, antes de terminar, pressione **Ctrl+Z**. Numa sessão com controle de jobs ativo, isso suspende o trabalho e devolve o prompt. Suspender não é concluir e não equivale à suspensão do telefone.

Consulte:

```bash
jobs -l
```

A saída deve identificar um trabalho parado relacionado a `bash relatorio-aula.sh`, com número de job e PID. Números variam. Se não existe esse registro, ou aparece outro programa, não use os comandos seguintes cegamente. Não há obrigação de sua listagem mostrar `%1`.

Retome especificamente o trabalho cujo nome contém o script da aula:

```bash
fg %?relatorio-aula.sh
```

`%?texto` é uma especificação de job por parte do comando, na tabela do Bash atual. Ela precisa encontrar **um único** trabalho; correspondência ausente ou ambígua deve produzir erro, não uma escolha arbitrária. No primeiro plano, pressione Ctrl+C para encerrar a fixture, ou aguarde a conclusão.

Você também pode experimentar Ctrl+Z, conferir `jobs -l` e usar `bg %?relatorio-aula.sh`. O programa retomado escreve mensagens enquanto o prompt já está disponível. Isso pode misturar visualmente texto digitado e saída. Antes de passar ao próximo exercício, traga essa fixture com `fg` e conclua-a. Não deixe múltiplas instâncias indistinguíveis.

## 6. Guarde a saída antes de iniciar em segundo plano

Quando não houver trabalho da aula ativo, execute:

```bash
bash relatorio-aula.sh > logs/segundo-plano.log 2>&1 &
aula_pid=$!
printf 'PID capturado nesta sessao: %s\n' "$aula_pid"
jobs -l
```

`&` pede execução em segundo plano. `$!` captura a identificação do último trabalho assíncrono iniciado por esse shell; atribuímos a `aula_pid` **imediatamente**, antes de iniciar outra coisa. A variável existe só na sessão atual e não será um inventário permanente.

`>` dirige saída normal ao arquivo novo; `2>&1` dirige mensagens de erro para o mesmo destino. A ordem importa. Cada nova execução usando `>` substitui aquele registro: para conservar uma tentativa anterior, escolha outro nome ou faça uma cópia antes. `>>` acrescenta e pode misturar tentativas sem separação; não é automaticamente melhor.

Leia uma fotografia do registro:

```bash
cat logs/segundo-plano.log
```

O conteúdo pode apresentar só as primeiras etapas, pois o processo ainda está trabalhando. Um arquivo que cresce não indica que a aplicação já terminou. Segundo plano também não cria um serviço de boot, não garante sobrevivência à desconexão SSH e não impede políticas do Android de encerrar o processo.

**Checkpoint 6:** `jobs -l` relaciona script e identificação; o prompt está disponível; mensagens estão no arquivo escolhido, sem nenhuma mudança em `/var/log`.

## 7. Consulte a identidade com a implementação de `ps`

Em procps, consultamos somente o PID que acabamos de capturar:

```bash
ps -p "$aula_pid" -o pid=,ppid=,stat=,args=
```

Devem aparecer identificação, pai, estado e argumentos ligados ao nosso script. Quando o trabalho já terminou, a linha pode não existir; não invente um substituto para o número. Essa ausência pode ser uma conclusão natural, não um crash do telefone. A [documentação de ps procps](https://manpages.debian.org/trixie/procps/ps.1.en.html) descreve formatos e seleção.

Se a opção `-p` ou um campo não existe, consulte `ps --help`. No BusyBox, use a listagem disponível, normalmente `ps`, e procure **visualmente** o PID e comando da aula. `ps -o pid,ppid,args` só deve ser usado se esses campos forem suportados pela versão local. A [referência BusyBox](https://busybox.net/downloads/BusyBox.html) tem comandos configuráveis; a compilação instalada pode conter menos opções.

Não instale ferramentas mais pesadas apenas para a tela ficar igual ao exemplo. Android pode limitar a visibilidade de processos e PRoot pode apresentar um contexto parcial. Consulte em conjunto `jobs -l` e o registro que anuncia PID. Não conclua que existe isolamento completo porque uma listagem não mostra outros aplicativos.

Estados como espera/dormindo, execução e parada descrevem um momento. Nosso script passa a maior parte do tempo esperando `sleep`, então CPU baixa é esperada. Vinte mensagens ao longo do tempo não significam 20 processos. Esta aula não mede FPS, GPU ou desempenho do desktop.

## 8. Encerre somente a fixture identificada

Ainda na sessão que a iniciou, consulte `jobs -l`. Se houver **um único trabalho ativo** associado a `relatorio-aula.sh`, encerre-o com:

```bash
kill -TERM %?relatorio-aula.sh
wait "$aula_pid"
printf 'Retorno observado pelo wait: %s\n' "$?"
cat logs/segundo-plano.log
```

`kill` envia um sinal; seu nome não significa destruição imediata. Escolhemos TERM, que o script trata exibindo uma mensagem e saindo com zero. O trap pode aguardar o retorno da espera atual, então conceda alguns segundos. `wait` aguarda a conclusão do filho registrado por esse shell e devolve seu status.

A especificação de job evita transformar um PID anotado numa seleção ampla de processos. Se o job já terminou, o Bash deve informar que não o encontra; conserve esse resultado. `wait` pode devolver um estado de conclusão previamente conhecido, ou informar que não é filho dessa sessão, dependendo do contexto. Não ignore o erro e passe a encerrar programas por nome parecido.

Não usaremos comandos para encerrar “todos os Bash”, “todos os Python” ou todos os usuários. Isso poderia cortar SSH, servidores ou trabalho não salvo. Sinal KILL é abrupto, não pode ser tratado pelo programa e impede esse encerramento preparado; não é o primeiro recurso para uma aplicação que dispõe de saída normal.

**Checkpoint 8:** a mensagem TERM está no registro quando o envio ocorreu durante a atividade, e `jobs -l` já não apresenta a fixture em execução. Se ela concluiu antes do envio, anote conclusão natural e repita conscientemente num novo registro.

## 9. Diferencie conclusão, espera e erro

Um comando sem saída pode ter dado certo. Um comando com texto pode ter falhado. Retorno e mensagens devem ser interpretados juntos. Pratique dois resultados sem provocar um problema real:

```bash
bash -c 'exit 0'
printf 'Primeiro retorno: %s\n' "$?"
bash -c 'exit 7'
printf 'Segundo retorno: %s\n' "$?"
```

Escolhemos `7` para representar uma falha fictícia. Ele não é um diagnóstico universal. Sua aplicação pode definir outros códigos. Também não se deve comparar esse número com o estado de um serviço sem consultar a ferramenta que o produziu.

Faça um registro separado de dois canais:

```bash
bash -c 'printf "%s\n" "Saida normal ficticia"; printf "%s\n" "Erro ficticio" >&2; exit 7' > logs/canais.log 2>&1
printf 'Retorno do exemplo de canais: %s\n' "$?"
cat logs/canais.log
```

O arquivo deve conter as duas mensagens, embora o comando retorne `7`. O texto “Erro ficticio” foi escrito deliberadamente, não prova uma falha de driver. Ao pedir ajuda, diga qual mensagem veio do sistema e qual foi criada no exercício. Isso evita investigar um exemplo como incidente verdadeiro.

## 10. Leia um registro crescente sem interromper o autor

Se `tail` está disponível, `tail -f logs/segundo-plano.log` acompanha acréscimos ao arquivo. Num segundo terminal aberto **no mesmo ambiente**, entre na pasta de laboratório e use esse comando enquanto a fixture escreve. Ctrl+C nesse terminal encerra o acompanhamento, não envia automaticamente TERM ao programa do primeiro terminal.

Se `tail` falta, `cat` repetido oferece fotografias suficientes para esta aula; não precisamos instalar um sistema de logs. `tail -f` continua esperando mesmo após o autor terminar, portanto a permanência dessa consulta não significa que o servidor ainda está ativo.

Registros podem conter endereços, caminhos, tokens e dados de outras pessoas. Nosso conteúdo é fictício, mas logs reais exigem revisão antes de publicar. Preserve os horários e trechos relevantes; retirar um segredo não precisa apagar a evidência técnica que permite compreender o erro. Use a [ficha de evidências](../diagnostico/ficha-evidencias.mdx) para registrar causa ainda não confirmada como inconclusiva.

## 11. Saiba por que desconectar pode mudar tudo

Desconectar um hub não deveria automaticamente apagar documentos salvos, mas o port pode ter falhas de vídeo ou reiniciar a sessão. Encerramento de GNOME, perda do monitor, perda de SSH e falha do kernel são eventos diferentes. Esta aula ensina a identidade dos processos; não autoriza matar o compositor para recuperar vídeo.

Se a conexão SSH caiu, retorne pelo canal disponível e confira o estado atual. Não reutilize `aula_pid` de uma sessão antiga para enviar sinais. Para um servidor importante, é necessário definir método de supervisão, logs, limites de reinício e dados persistentes; `&` sozinho não oferece esses recursos. Consulte [serviços e servidor web](../projetos/servidor-web.md).

No Termux, o sistema Android pode limitar ou encerrar trabalho por políticas de processos/energia. Um wake lock não concede suporte a drivers nem garantia de continuidade. A [nota do projeto Termux sobre Android 12 e processos](https://github.com/termux/termux-app#readme) descreve limitações. Não desative proteções do aparelho só porque um contador de exercício acabou.

Linux nativo precisa de suspensão, energia e drivers integrados; o telefone em CrashDump não tem um shell Linux operacional para receber sinais. Consulte [boot e crash](../diagnostico/boot-crash.md) antes de inferir que “basta matar e abrir de novo”.

## 12. Resolva erros comuns pelo contexto

| Mensagem ou situação | Interpretação e próximo passo |
|---|---|
| `no such job` | A sessão não conhece esse trabalho, ou ele terminou; consulte `jobs -l` |
| `ambiguous job spec` | Mais de uma fixture corresponde; identifique cada uma sem seleção ampla |
| `not a child of this shell` | `wait` está noutra sessão/contexto; não é uma falha universal do programa |
| `command not found` | Ferramenta não existe nesse ambiente; identifique gerenciador e origem |
| Não aparece prompt | O programa pode estar em primeiro plano; espere ou use sua saída documentada |
| Ctrl+Z não suspende | Terminal/controle de jobs pode não estar ativo; não confunda com tela travada |
| Log não muda | Processo acabou, está esperando ou grava noutro destino; confira identidade e caminho |

Se o erro é sintaxe, consulte `cat relatorio-aula.sh` e `bash -n relatorio-aula.sh`; conserve a versão anterior antes de editar. Se a pasta não pode receber logs, use a [aula de arquivos](arquivos-permissoes.md), sem ampliar permissões globalmente. Interrupção da criação pelo editor não deve ser corrigida executando um arquivo incompleto.

## 13. Fontes, verificação e retomada

Na próxima sessão, volte a `"$HOME/projetos/processos-aula"`, consulte os arquivos e leia o script. Crie nomes novos de registro, como `logs/retomada.log`, antes de executar. Uma nova execução terá nova identidade: capture `$!` de novo e consulte o job atual. Não grave PIDs em arquivos para automatizar encerramentos sem validar que ainda pertencem à aplicação correta.

Ao terminar, confirme que não deixou fixture parada ou em execução na sessão dedicada. Se houver uma identificada, retome com `fg` e conclua, ou envie TERM pelo job específico. Conserve os scripts e registros; não precisa remover a pasta para encerrar a aula. `exit` sai do Bash dedicado quando seu trabalho terminou.

Os exemplos foram testados com processos próprios em diretório temporário do notebook Fedora 44, Bash 5.3.9 e procps-ng 4.0.6: conclusão, captura de PID, registro, TERM tratado, espera, códigos e suspensão/retomada numa sessão interativa. Não foram encerrados serviços reais. A instalação e variantes BusyBox/Termux são instruções documentais, sem teste em outro telefone.

Antes de avançar, explique primeiro plano versus segundo plano; job versus PID; leitura de log versus execução do programa; e por que um PID antigo não identifica permanentemente a mesma coisa. Continue com [servidor Python](servidor-python.md), [SSH e arquivos](ssh-arquivos.md) ou escolha outra aula na [biblioteca](biblioteca.mdx).
