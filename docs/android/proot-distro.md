---
title: PRoot-distro — distribuição sem root
sidebar_position: 3
description: Instale um ambiente Debian ou Ubuntu sobre Android e reconheça seus limites de kernel e isolamento.
last_verified: '2026-10-10'
validation: documental
---

## Visão geral e resultado esperado

**Dificuldade:** intermediária. **Resultado:** shell com filesystem e bibliotecas de uma distribuição Linux, conservando o Android. **Requisito:** [Termux funcional](./termux.md), rede e espaço para uma rootfs, pacotes e backup. Não exige root real nem bootloader desbloqueado.

PRoot intercepta operações dos processos e adapta caminhos para apresentar uma árvore de arquivos diferente. O usuário `root` dentro dele é uma simulação útil ao gerenciador de pacotes: não dá acesso irrestrito ao Android. O kernel, o gerenciamento de energia e os drivers continuam sendo os do telefone.

:::warning PRoot não é uma fronteira de segurança
Não use esse ambiente para executar código hostil acreditando que ele está preso em uma máquina virtual. Caminhos compartilhados e a identidade do aplicativo podem dar acesso aos seus projetos. Imagens OCI aceitas pelo PRoot-distro não passam a ter o isolamento de Docker apenas pelo formato do arquivo.
:::

## 1. Preparar, registrar e identificar a versão

**No Termux, fora de qualquer PRoot:**

```bash
pkg update
pkg install proot-distro
proot-distro --help
proot-distro install --help
proot-distro login --help
```

Na revisão de 10/10/2026, o upstream documenta uma implementação Python com instalação de imagens OCI. Versões anteriores, amplamente presentes em tutoriais antigos, utilizam aliases de distribuições e uma implementação diferente. O pacote instalado pode não coincidir com o `master` do repositório. **A ajuda local determina qual bloco abaixo se aplica.** Registre também a versão de pacote por `apt-cache policy proot-distro`.

| Ajuda local | Procedimento |
| --- | --- |
| `install` aceita imagem, tag e opções como `--name` | Caminho OCI atual |
| `list` exibe distribuições instaláveis por alias; `install` aceita alias | Caminho legado |
| Ajuda diverge dos dois | Consulte documentação da versão; não experimente nomes até apagar dados |

Não atualize uma instalação existente via `pip` em cima do pacote do Termux apenas para fazer um comando antigo funcionar. Faça backup e siga um procedimento de migração documentado para a versão utilizada.

## 2A. Instalar pela interface OCI atual

Este exemplo usa Ubuntu 24.04 como versão explícita, evitando uma tag que muda de release silenciosamente:

```bash
proot-distro search ubuntu
proot-distro install ubuntu:24.04
proot-distro list
proot-distro login ubuntu
```

`search` consulta imagens; `install` baixa e prepara o filesystem; `list` confirma a instância; `login` inicia um shell nela. Utilize o nome efetivamente apresentado na lista se tiver criado uma instância com outro nome. Uma tag explícita ainda pode receber reconstruções: para reprodução estrita, registre o digest da imagem oferecido pelo registry e as versões de pacotes.

## 2B. Instalar pela interface legada

**Somente quando a ajuda e a lista confirmarem esse formato:**

```bash
proot-distro list
proot-distro install ubuntu
proot-distro login ubuntu
```

O alias `ubuntu` não promete uma versão específica. Verifique `/etc/os-release` e use as instruções da release efetivamente instalada. Se preferir Debian, utilize seu alias somente se aparecer na lista. Não execute ambos os caminhos para a mesma instância.

## 3. Validar e atualizar o ambiente

**Dentro do Ubuntu ou Debian, como administrador simulado:**

```bash
cat /etc/os-release
uname -m
uname -r
id
apt update
apt install ca-certificates nano python3 python3-venv
python3 -c 'import platform; print(platform.machine())'
```

`apt update` busca índices desta distribuição; não adiciona repositórios ao Android. O kernel informado deve permanecer relacionado ao host Android. Em ARM64, espere ferramentas da arquitetura arm64/aarch64; em um aparelho de 32 bits, pacotes ARM64 não passam a funcionar pelo nome comercial do processador.

Não use o `sudo` da distribuição para tentar modificar hardware do Android. Para aplicações diárias, crie um usuário comum quando a distribuição e a versão do PRoot-distro oferecerem suporte, por exemplo `adduser aluno`, e confirme `login --help` antes de usar `--user aluno`. Não presuma que uma sessão de login forneça systemd, logind ou um seat gráfico nativo.

## 4. Persistência, backup e reprodutibilidade

Salve seus trabalhos em uma pasta de projetos do ambiente e exporte-a antes de remover ou reinicializar a instância. É mais fácil recuperar código e documentos do que confiar em uma cópia não testada de todo o filesystem. Registre:

```bash
cat /etc/os-release
dpkg-query -W > pacotes-instalados.txt
```

`dpkg-query` gera o inventário, mas não substitui os pacotes nem os dados. Se utilizar as funções `backup` ou `restore`, consulte **a ajuda da versão instalada**, pois formatos e opções podem mudar. Copie o backup para fora do armazenamento privado do Termux e teste a restauração em uma instância de nome diferente.

## Erros comuns e diagnóstico

| Erro | O que significa | Próxima ação |
| --- | --- | --- |
| `systemctl` não conecta | systemd não é PID 1 nessa sessão | Executar o serviço em primeiro plano ou usar supervisão compatível |
| `Operation not permitted` ao montar | Kernel/permissões Android, não uma senha errada | Não insistir com `sudo`; avaliar chroot ou Linux nativo |
| `exec format error` | Arquitetura incorreta ou binário inválido | Comparar `uname -m`, pacote e loader |
| Processo morto com sinal 9 | Pode ser política Android ou falta de memória | Correlacionar horário, RAM e número de processos |
| Docker não inicia | PRoot não implementa namespaces/cgroups ausentes | Usar host Linux compatível, não trocar a imagem |
| Desktop não abre | Servidor gráfico, socket `/tmp` ou D-Bus | Seguir [desktop Android](./desktop.md) |

Não aninhe PRoot dentro de outra sessão PRoot. Saia com `exit` para voltar ao Termux e só então execute seu gerenciador de ambientes.

## Rollback e testes finais

Fechar o shell com `exit` não remove a distribuição. Antes de `remove` ou `reset`, faça backup, confirme o nome na lista e leia a ajuda: essas operações podem apagar todos os dados daquela instância. Não as utilize como primeiros passos de diagnóstico.

Uma instalação está validada quando a release e arquitetura estão registradas, Python executa, os arquivos persistem após sair/reentrar e um backup foi restaurado separadamente. Esse resultado **não valida** câmera, USB, aceleração gráfica nem inicialização nativa. Continue com [desktop](./desktop.md), [programação](../projetos/desenvolvimento.md) ou serviços que não dependam de recursos ausentes do kernel.

## Fontes e verificação

Revisão documental: **10/10/2026**. [README e referência de comandos atual](https://github.com/termux/proot-distro/blob/master/README.md), [histórico de releases](https://github.com/termux/proot-distro/releases), [PRoot](https://proot-me.github.io/), [pacote no Termux](https://github.com/termux/termux-packages/tree/master/packages/proot-distro). A correspondência entre upstream e o pacote de cada usuário deve ser conferida no aparelho; não há teste universal de hardware.
