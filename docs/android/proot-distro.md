---
title: PRoot-distro — distribuição sem root
sidebar_position: 3
description: Instale um ambiente Debian ou Ubuntu sobre Android e reconheça seus limites de kernel e isolamento.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Visão geral e resultado esperado

**Dificuldade:** intermediária. **Resultado:** shell com filesystem e bibliotecas de uma distribuição Linux, conservando o Android. **Requisito:** [Termux funcional](./termux.md), rede e espaço para uma rootfs, pacotes e backup. Não exige root real nem bootloader desbloqueado.

Comece pelo tutorial Termux até conseguir executar `python --version`. Não procure um “APK do Ubuntu” para este procedimento: você instalará o gerenciador pelo terminal do Termux e ele baixará o filesystem da distribuição. O aplicativo Android continua sendo Termux. Uma rootfs é uma árvore com diretórios como `/etc`, `/usr` e `/home`; não é um arquivo de boot para Fastboot.

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

Abra o aplicativo Termux **no telefone**. Se a sessão anterior ficou dentro de Ubuntu/Debian, digite `exit` para voltar. Execute as linhas acima uma por vez, aguardando o cursor retornar. O pacote é obtido dos repositórios já configurados do Termux; confirme a transação apresentada. Não use `sudo`, não abra uma shell `su` e não execute o instalador dentro de outro PRoot.

Na revisão de 11/10/2026, o upstream documenta uma implementação Python com instalação de imagens OCI. Versões anteriores, amplamente presentes em tutoriais antigos, utilizam aliases de distribuições e uma implementação diferente. O pacote instalado pode não coincidir com o `master` do repositório. **A ajuda local determina qual bloco abaixo se aplica.** Registre também a versão de pacote por `apt-cache policy proot-distro`.

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

Observe a busca: este exemplo usa a imagem oficial chamada `ubuntu`, não uma imagem de nome parecido publicada por qualquer usuário. A imagem precisa existir para a arquitetura escolhida automaticamente. Uma busca bem-sucedida não comprova isso; a instalação verifica o conteúdo e pode informar que não há arquitetura compatível.

Durante o download, mantenha rede e espaço disponíveis. Ao terminar, a ferramenta deve apresentar a instância `ubuntu` e instrução de entrada. `login` não abre uma tela Android de login nem pede o PIN do aparelho. O cursor pode mudar para algo semelhante a `root@localhost`; os comandos de verificação abaixo identificam o ambiente de forma mais confiável do que o formato do cursor.

## 2B. Instalar pela interface legada

**Somente quando a ajuda e a lista confirmarem esse formato:**

```bash
proot-distro list
proot-distro install ubuntu
proot-distro login ubuntu
```

O alias `ubuntu` não promete uma versão específica. Verifique `/etc/os-release` e use as instruções da release efetivamente instalada. Se preferir Debian, utilize seu alias somente se aparecer na lista. Não execute ambos os caminhos para a mesma instância.

Se `install ubuntu:24.04` dá erro de alias desconhecido numa versão legada, isso não prova incompatibilidade do Ubuntu: você escolheu a sintaxe da outra versão. Volte à ajuda e ao caminho B. Se `ubuntu` já aparece como instalado, entre nele e inventarie seus dados; `reset` não é uma atualização e pode apagá-los.

## 3. Validar e atualizar o ambiente

**Dentro do Ubuntu ou Debian, como administrador simulado:**

```bash
cat /etc/os-release
uname -m
uname -r
id
apt update
apt install ca-certificates nano python3 python3-venv adduser
python3 -c 'import platform; print(platform.machine())'
```

`apt update` busca índices desta distribuição; não adiciona repositórios ao Android. O kernel informado deve permanecer relacionado ao host Android. Em ARM64, espere ferramentas da arquitetura arm64/aarch64; em um aparelho de 32 bits, pacotes ARM64 não passam a funcionar pelo nome comercial do processador.

`cat /etc/os-release` deve mostrar a distribuição instalada; `id` normalmente mostra o administrador simulado nesse primeiro acesso. No exemplo OCI, espere Ubuntu 24.04. `apt update` deve concluir sem erro de assinatura; depois confirme a lista de instalação de pacotes. Você não precisa de `sudo` nessa shell administrativa simulada. Saia com `exit`: agora `pkg` volta a ser o gerenciador apropriado do Termux.

Não use o `sudo` da distribuição para tentar modificar hardware do Android. Não presuma que uma sessão de login forneça systemd, logind ou um seat gráfico nativo.

## 4. Criar uma conta de trabalho e seu primeiro arquivo

Uma conta comum ajuda a separar arquivos de trabalho dos arquivos administrativos **dentro da distribuição**. Ela não cria uma nova proteção contra o aplicativo Termux ou contra outros processos com acesso à mesma rootfs.

Entre novamente como administrador pelo Termux com `proot-distro login ubuntu`. **Dentro do Ubuntu**, após instalar `adduser`, execute:

```bash
adduser aluno
```

`aluno` é um nome concreto para a conta deste tutorial; você pode usá-lo. Se escolher outro, substitua também os caminhos e `--user aluno` seguintes. Na pergunta de senha, digite uma senha própria e pressione Enter; **nenhum caractere aparecer é normal**. Digite a mesma senha na confirmação. Essa senha é da conta Linux, não do Android nem do F-Droid. Nos campos opcionais de nome completo etc., Enter mantém-os vazios; confira o resumo e confirme quando estiver correto.

Se disser que o usuário já existe, não o apague: confira `id aluno` e utilize a conta apenas se ela é sua. Quando concluir:

```bash
exit
```

Você voltou ao Termux. Confira que `proot-distro login --help` oferece `--user` e então execute:

```bash
proot-distro login --user aluno ubuntu
```

Esse login pelo gerenciador **não pede nem valida a senha criada**: ele seleciona a identidade dentro de PRoot. A senha pode ser usada por ferramentas Linux que realmente a consultem, mas não protege a rootfs do Termux. Se uma versão antiga não oferece essa opção, não copie opções incompatíveis: consulte a entrada de usuário documentada para essa versão ou continue o teste numa shell administrativa simulada.

**Na conta aluno, dentro do Ubuntu:**

```bash
whoami
pwd
mkdir -p "$HOME/projetos/primeiro"
cd "$HOME/projetos/primeiro"
printf '%s\n' 'print("Ubuntu sobre Android, sem root real")' > ola.py
python3 ola.py
```

Espere `aluno`, um diretório home da conta e a frase do programa. O arquivo é gravado na rootfs local; não está automaticamente no Downloads do Android. `nano ola.py` abre-o para edição: Ctrl+O, Enter salva; Ctrl+X sai. Para instalar mais pacotes depois, saia da conta comum e abra a entrada administrativa pelo Termux; não conceda permissões amplas apenas para facilitar uma instalação.

## 5. Persistência, backup e reprodutibilidade

Salve seus trabalhos em uma pasta de projetos do ambiente e exporte-a antes de remover ou reinicializar a instância. É mais fácil recuperar código e documentos do que confiar em uma cópia não testada de todo o filesystem. Registre:

```bash
cat /etc/os-release
dpkg-query -W > pacotes-instalados.txt
```

`dpkg-query` gera o inventário, mas não substitui os pacotes nem os dados. Execute-o numa pasta de trabalho para saber onde ficou o arquivo. Confira persistência: `exit`, entre outra vez como `aluno` e execute `python3 "$HOME/projetos/primeiro/ola.py"`. A mesma saída deve aparecer.

### Backup portátil dos seus projetos

Na conta `aluno`, dentro do Ubuntu, com seus projetos salvos e programas encerrados:

```bash
tar -czf "$HOME/projetos-aluno.tar.gz" -C "$HOME" projetos
tar -tzf "$HOME/projetos-aluno.tar.gz"
```

Na versão OCI atual que oferece o comando `copy`, saia ao Termux, tenha concluído `termux-setup-storage` do [guia Termux](./termux.md) e execute:

```bash
proot-distro copy ubuntu:/home/aluno/projetos-aluno.tar.gz "$HOME/storage/shared/Download/projetos-aluno.tar.gz"
sha256sum "$HOME/storage/shared/Download/projetos-aluno.tar.gz"
```

A consulta `proot-distro copy --help` deve confirmar essa sintaxe antes do uso. Abra **Arquivos → Downloads** no Android e copie o arquivo para outro dispositivo. Para testar a restauração dos projetos dentro do Ubuntu, crie uma pasta de teste nova, por exemplo `mkdir "$HOME/recuperacao-teste"`, extraia com `tar -xzf "$HOME/projetos-aluno.tar.gz" -C "$HOME/recuperacao-teste"` e execute o Python na cópia. Não precisa apagar a instância para testar seus dados.

Na interface legada sem `copy`, consulte `login --help`: quando `--bind` estiver disponível, você pode fazer uma sessão explícita para exportar arquivos. **No Termux**, com permissão de armazenamento e conta criada:

```bash
proot-distro login --user aluno --bind "$HOME/storage/shared/Download:/mnt/downloads" ubuntu
```

**Dentro do Ubuntu**, copie apenas o backup: `cp "$HOME/projetos-aluno.tar.gz" /mnt/downloads/projetos-aluno.tar.gz`, e saia com `exit`. O bind torna esse Downloads acessível ao ambiente: não monte ali diretórios com dados que você não pretende compartilhar. Se a versão local não oferece esses parâmetros, siga o mecanismo de exportação dessa versão, sem adivinhar o diretório privado da rootfs.

### Backup completo da instância, na versão OCI atual

Encerre os aplicativos e saia de **todas** as sessões da instância. Isso reduz inconsistências de arquivos e bancos em escrita. **No Termux**, leia `proot-distro backup --help`; para a interface atual documentada:

```bash
proot-distro backup ubuntu --output "$HOME/storage/shared/Download/ubuntu-backup.tar.xz"
tar -tJf "$HOME/storage/shared/Download/ubuntu-backup.tar.xz"
sha256sum "$HOME/storage/shared/Download/ubuntu-backup.tar.xz"
```

Esse backup deve ser um nome ainda livre; a implementação atual recusa sobrescrever um arquivo existente. A listagem inclui a árvore da instância, e o arquivo deve ser copiado para fora do telefone. Consulte a ajuda da versão legada antes de reutilizar opções ou formatos.

:::danger `restore` pode substituir a instância existente
Na implementação OCI consultada, `restore` usa os nomes contidos no arquivo e limpa a rootfs existente desses nomes. Não foi documentada uma opção `--name` para renomear durante a restauração. Portanto, **não** acrescente uma opção inventada nem restaure esse arquivo sobre `ubuntu` em uso como teste. Faça o teste de projetos acima, ou restaure a instância em um Termux de laboratório sem uma instância desse nome.
:::

Somente numa instalação de laboratório da **mesma interface**, em que `proot-distro list` confirme que `ubuntu` está ausente e em que o arquivo é seu backup verificado, a operação é `proot-distro restore CAMINHO_DO_BACKUP`. Substitua o marcador pelo caminho existente, por exemplo `"$HOME/storage/shared/Download/ubuntu-backup.tar.xz"`; depois confirme a lista e a entrada. A ausência desse ambiente de laboratório impede afirmar que o backup completo foi restaurado. Registrar essa lacuna é melhor do que apagar sua instância funcional.

## Erros comuns e diagnóstico

| Erro | O que significa | Próxima ação |
| --- | --- | --- |
| `systemctl` não conecta | systemd não é PID 1 nessa sessão | Executar o serviço em primeiro plano ou usar supervisão compatível |
| `Operation not permitted` ao montar | Kernel/permissões Android, não uma senha errada | Não insistir com `sudo`; avaliar chroot ou Linux nativo |
| `exec format error` | Arquitetura incorreta ou binário inválido | Comparar `uname -m`, pacote e loader |
| Processo morto com sinal 9 | Pode ser política Android ou falta de memória | Correlacionar horário, RAM e número de processos |
| Docker não inicia | PRoot não implementa namespaces/cgroups ausentes | Usar host Linux compatível, não trocar a imagem |
| Desktop não abre | Servidor gráfico, socket `/tmp` ou D-Bus | Seguir [desktop Android](./desktop.md) |
| `Unable to locate package` | Índices, release e nome de pacote | Executar `apt update` dentro da distro; buscar por `apt search NOME`, sem misturar mirrors de outra release |
| Senha parece não estar sendo digitada | Prompt de criação/SSH, sem eco | Digitar e pressionar Enter; ausência de asteriscos é normal |
| `--user` ou `copy` desconhecido | Ajuda e versão instalada | Usar a seção correspondente à interface, não atualizar por cima com pip |

Não aninhe PRoot dentro de outra sessão PRoot. Saia com `exit` para voltar ao Termux e só então execute seu gerenciador de ambientes.

## Rollback e testes finais

Fechar o shell com `exit` não remove a distribuição. Antes de `remove` ou `reset`, faça backup, confirme o nome na lista e leia a ajuda: essas operações podem apagar todos os dados daquela instância. Não as utilize como primeiros passos de diagnóstico.

Uma instalação está validada quando a release e arquitetura estão registradas, Python executa, os arquivos persistem após sair/reentrar e um backup foi restaurado separadamente. Esse resultado **não valida** câmera, USB, aceleração gráfica nem inicialização nativa. Continue com [desktop](./desktop.md), [programação](../projetos/desenvolvimento.md) ou serviços que não dependam de recursos ausentes do kernel.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem teste de hardware. Foram consultados [README e referência de comandos atuais](https://github.com/termux/proot-distro/blob/master/README.md), [README legado v4.35.0](https://github.com/termux/proot-distro/blob/v4.35.0/README.md), [implementação de backup](https://github.com/termux/proot-distro/blob/master/proot_distro/commands/backup.py), [implementação de restore](https://github.com/termux/proot-distro/blob/master/proot_distro/commands/restore.py), [histórico de releases](https://github.com/termux/proot-distro/releases), [PRoot](https://proot-me.github.io/) e [pacote no Termux](https://github.com/termux/termux-packages/tree/master/packages/proot-distro). A correspondência entre upstream e o pacote instalado, a disponibilidade da arquitetura e a recuperação num laboratório continuam sendo verificações locais; uma tag OCI não comprova compatibilidade de hardware.
