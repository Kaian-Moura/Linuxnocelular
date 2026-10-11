---
title: Terminal, arquivos, permissões e pacotes
description: Aprenda a ler comandos, identificar o ambiente e instalar software sem misturar distribuições ou privilégios.
sidebar_position: 3
last_verified: '2026-10-10'
---

## Terminal e shell

Se nunca abriu um terminal ou salvou um arquivo por comando, faça primeiro a [aula prática do zero](../comece-aqui/terminal-primeiros-passos.md). Para localizar downloads, extrair ZIP e escolher Windows/Linux/macOS, use [preparação do computador](../comece-aqui/computador-downloads.md). Aqui você aprofunda as relações entre arquivos, privilégios, pacotes e serviços.

O terminal é uma interface de texto. O **shell** interpreta os comandos digitados. Uma linha pode iniciar um programa, redirecionar saída ou conectar programas. O prompt `usuario@aparelho:~$` não faz parte do comando: normalmente você copia apenas o texto depois do `$`. O símbolo `#` pode representar um prompt privilegiado ou um comentário, dependendo do contexto.

Um comando se compõe de programa, opções e argumentos. Em `ls -l /etc`, `ls` lista, `-l` pede detalhes e `/etc` é o caminho. Leia a explicação antes de executar. Comandos são sensíveis a maiúsculas/minúsculas; espaços e aspas podem mudar o significado.

## Primeiro exercício, sem root

No shell de um ambiente Linux ou Termux já acessível:

```bash
pwd
id
mkdir -p ~/laboratorio-celular
cd ~/laboratorio-celular
printf 'Meu primeiro arquivo\n' > notas.txt
cat notas.txt
ls -l notas.txt
```

`pwd` informa a pasta atual; `id`, o usuário e grupos; `mkdir -p` cria o diretório; `cd` entra nele. `printf` escreve a frase. O operador `>` grava no arquivo **substituindo conteúdo anterior** com o mesmo nome: use um arquivo novo neste exercício. `cat` lê o texto; `ls -l` mostra proprietário e permissões. Resultado esperado: a frase aparece e o arquivo pertence ao seu usuário.

Para acrescentar texto, `>>` adiciona ao final. `|` passa a saída de um comando ao próximo. Um programa baixado e canalizado ao shell passa a executar imediatamente: prefira baixar, verificar origem e examinar antes. Para parar um programa no terminal, `Ctrl+C` costuma enviar uma interrupção; não é um desligamento físico.

## Caminhos e arquivos especiais

`/` é a raiz do ambiente de arquivos; `~` é a pasta pessoal do usuário atual. `/etc` contém configurações; `/usr` contém programas e dados do sistema; `/var` guarda dados variáveis. `/proc` e `/sys` expõem informações e controles do kernel; não são pastas comuns de armazenamento. Escrever em sysfs pode alterar hardware: a existência de um arquivo não torna qualquer valor seguro.

`/dev/input/event*` representa eventos de entrada; `/dev/dri` pode expor dispositivos gráficos. Permissões sobre esses nós protegem acesso a hardware e, em alguns casos, dados sensíveis. Não resolva um problema aplicando permissões globais de leitura/escrita em toda a árvore `/dev`.

## Privilégio e permissões

Um usuário comum tem acesso limitado. `sudo` e `doas`, quando configurados, executam ações com outra identidade, frequentemente root. Não existe senha de sudo universal. Termux sem root não se torna privilegiado ao usar o nome `root` dentro do PRoot.

Prefira consultar sem privilégio; eleve somente quando o guia exigir. O significado das permissões em `ls -l` começa por leitura, escrita e execução para proprietário, grupo e outros. Um arquivo executável ainda pode exigir arquitetura e bibliotecas corretas. “Permission denied” não deve levar automaticamente a `chmod 777`: identifique quem precisa acessar o quê.

## Qual gerenciador de pacotes usar?

Primeiro execute `cat /etc/os-release` no ambiente desejado. Termux é uma exceção: usa seus caminhos e pacotes próprios, não um rootfs desktop convencional. **APT dentro do Debian não instala o pacote no sistema Alpine que o hospeda.**

| Ambiente | Buscar | Instalar exemplo | Observação |
|---|---|---|---|
| Termux | `pkg search python` | `pkg install python` | No shell Termux, sem sudo |
| Alpine / postmarketOS | `apk search python3` | `doas apk add python3` | Use o elevador configurado no sistema |
| Debian / Ubuntu | `apt search python3` | `sudo apt install python3` | Root em PRoot pode dispensar sudo apenas dentro dele |
| Fedora | `dnf search python3` | `sudo dnf install python3` | Não use para alterar o telefone Alpine |

Não execute a coluna de instalação inteira. Escolha **uma linha**, correspondente ao ambiente confirmado. O exemplo instala Python, não drivers nem aceleração gráfica. Consulte `--help` e os manuais de sua versão se o gerenciador não aceitar uma opção.

## Repositórios: confiança antes de quantidade

Um repositório distribui pacotes e metadados. Ele precisa combinar distribuição, release e arquitetura. Misturar stable e edge/testing sem política de pinning pode produzir um conjunto inconsistente; adicionar todos os repositórios não dá “acesso completo”, apenas amplia dependências e riscos.

No Alpine, registre `/etc/apk/repositories` e `/etc/apk/world`; no Debian, fontes APT e pacotes instalados. Prefira repositórios oficiais da release; para software ausente, verifique empacotamento da distribuição, compilação ou ambiente separado. Flatpak também depende de suporte do sistema: não é solução universal em kernels móveis antigos.

## Serviços e logs

Um serviço executa em segundo plano. O **init** coordena inicialização e encerramento. OpenRC usa ferramentas como `rc-service` e `rc-status`; systemd usa `systemctl` e `journalctl`. Android e PRoot não adotam automaticamente o init do rootfs. Antes de usar comandos de serviço no Linux nativo, consulte `cat /proc/1/comm`; ele lê o nome do processo de PID 1 sem depender das opções de uma implementação específica de `ps`. Se houver restrição de acesso, registre o erro em vez de presumir qual init está funcionando.

Um comando com sucesso não prova a função completa. Instalar SSH não prova que está ouvindo; iniciar o desktop não prova imagem no monitor. Cada tutorial ensina um teste observável. Ao pedir ajuda, informe ambiente, versão, comando e erro integral relevante, ocultando segredos.

## Fontes e verificação

Revisão documental em **10/10/2026**. Consulte [referência de pacotes Debian](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html), [APK no Alpine](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html) e [regras de sysfs no kernel](https://docs.kernel.org/admin-guide/sysfs-rules.html). Comandos do exercício são exemplos originais de operações de shell; verifique o shell instalado e não use-os em arquivos importantes existentes.
