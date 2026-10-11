---
title: 'Pacotes e repositórios: instale a ferramenta certa no lugar certo'
description: Identifique o ambiente, consulte origem e versão, examine uma transação e pratique com nano sem misturar distribuições ou releases.
sidebar_position: 52
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Esta aula ensina uma tarefa concreta: descobrir se o editor **nano** já existe, identificar o pacote que fornece seu executável e, se necessário, instalar a versão adequada ao ambiente escolhido. Depois você salvará e reabrirá um documento fictício. Saber instalar um programa inclui saber de onde ele veio, quais dependências serão alteradas e como verificar o resultado.

**Dificuldade:** iniciante. **Materiais:** terminal já acessível, conexão para consultar índices quando necessária, alimentação estável e espaço disponível. **Conhecimentos anteriores:** [terminal](../comece-aqui/terminal-primeiros-passos.md) e [arquivos](arquivos-permissoes.md). **Resultado:** inventário pequeno, decisão de instalação e texto salvo. Root no Android e bootloader desbloqueado não são requisitos do caminho Termux.

:::warning Não execute todos os blocos
Termux, Debian/Ubuntu e Alpine/postmarketOS são caminhos diferentes. Selecione o bloco correspondente ao terminal atual. A presença de uma ferramenta com nome `apt` não transforma Android em Debian. Não mudaremos arquivos de repositório, removeremos componentes do desktop ou instalaremos um novo gerenciador de pacotes para copiar um tutorial.
:::

## 1. Entenda o que o gerenciador organiza

Um pacote reúne arquivos e informações necessários para instalar uma parte do sistema: programa, biblioteca, documentação ou configuração. Dependência é outro componente necessário para o pacote funcionar. O gerenciador consulta essas relações e mantém um registro de instalação, em vez de apenas copiar um executável para qualquer pasta.

Repositório é uma coleção organizada de pacotes e índices. Mirror é um servidor que oferece uma cópia de uma coleção; trocar um mirror oficial da mesma coleção não equivale a adicionar uma nova distribuição. Release é uma edição do sistema com versões que devem funcionar juntas. Branch de desenvolvimento pode avançar sem o mesmo ciclo de estabilização.

Índice é o catálogo local de disponibilidade. **Atualizar índice** não significa executar todos os upgrades. **Instalar** um pacote pode incluir dependências ou mudanças em versões já presentes. **Atualizar o sistema inteiro** é uma operação mais ampla, e migrar de release exige planejamento próprio. Um comando curto pode representar uma transação grande.

Mais repositórios não significam “acesso completo a qualquer coisa”. Coleções incompatíveis podem oferecer versões conflitantes, bibliotecas com contratos diferentes ou pacotes de arquitetura errada. O objetivo aqui é uma ferramenta utilizável com origem identificada, não obter a maior contagem de fontes possíveis.

## 2. Identifique o ambiente antes da instalação

No terminal atual, consulte:

```sh
pwd
whoami
uname -m
command -v pkg
command -v apt
command -v apk
command -v nano
```

Se você está **fora de PRoot, no Termux**, execute `termux-info`. Leia identidade do aplicativo, arquitetura dos pacotes e origens/mirrors informados. A saída pode incluir dados do aparelho e ambiente; revise antes de publicar. A [aula de Termux](../android/termux.md) explica como abrir o aplicativo e preparar seu ambiente.

Se está **numa distribuição Linux**, consulte:

```sh
cat /etc/os-release
uname -r
```

`ID`, `VERSION_ID` e outros campos descrevem a distribuição naquele sistema de arquivos. `uname` descreve o kernel/contexto em uso. Em Debian PRoot, você pode ver Debian em `os-release` enquanto ainda usa o kernel Android. Isso não é uma instalação nativa nem autoriza operações de boot dentro do convidado.

Escolha o caminho:

| Contexto confirmado | Ferramentas desta aula | Privilégio de instalação |
|---|---|---|
| Termux direto | `pkg`, APT/dpkg adaptados | Usuário do aplicativo, sem sudo |
| Debian/Ubuntu nativo | `apt`, `apt-get`, `apt-cache`, `dpkg-query` | Administração já configurada |
| Debian PRoot | Ferramentas Debian dentro da instância | Administração interna do convidado |
| Alpine/postmarketOS | `apk`, mantendo repositórios do sistema/port | Administração já configurada |
| Outro Linux | Gerenciador próprio da distribuição | Siga a documentação dessa distribuição |

Não instale APK-tools no Debian ou APT no Alpine para “habilitar pacotes”. Mesmo que um binário de consulta exista por outro motivo, ele pode não administrar o sistema atual. No notebook de validação, por exemplo, o sistema era Fedora; possuir `dpkg-query` não tornou seus pacotes Fedora consultáveis como Debian.

**Checkpoint 2:** você escreveu qual ambiente vai modificar e qual caminho desta aula corresponde a ele.

## 3. Reconheça arquitetura e bibliotecas

`aarch64`, `arm64`, `arm64-v8a` e outros nomes aparecem em contextos diferentes. CPU compatível com instruções ARM64 é apenas uma parte da compatibilidade de um programa. Também importam formato do executável, carregador, bibliotecas e interface com o sistema. ABI é o conjunto de convenções que permite a partes compiladas trabalharem juntas; a [documentação Android de ABIs](https://developer.android.com/ndk/guides/abis?hl=pt-br) explica esse conceito no Android.

No caminho típico, Termux oferece programas adaptados ao ambiente Android/Bionic e aos caminhos do aplicativo; Debian usa seu conjunto de bibliotecas, normalmente glibc; Alpine usa musl. Não é suficiente renomear um arquivo para trocar esse ambiente. Um download marcado apenas “Linux ARM64” pode ter sido construído para glibc e não funcionar diretamente em Alpine ou Termux.

Esta aula deixa o gerenciador escolher pacotes da arquitetura configurada. Consulte `dpkg --print-architecture` no caminho Debian/Termux quando disponível, ou `apk --print-arch` no caminho Alpine. Não altere a arquitetura manualmente para fazer o nome de um pacote aparecer.

Quando um pacote não existe, alternativas são procurar a oferta oficial para **aquele** ambiente, usar outro aplicativo compatível, compilar um projeto com ferramentas adequadas ou usar um ambiente convidado explicitamente escolhido. Containers e PRoot não acrescentam drivers ao kernel. [Ambiente de execução Termux](https://github.com/termux/termux-packages/wiki/Termux-execution-environment).

## 4. Prepare um registro e consulte a ferramenta instalada

Crie uma pasta nova antes de registrar suas observações:

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/pacotes-aula"
cd "$HOME/projetos/pacotes-aula"
pwd
```

Se já existe, pare e retome pela seção 13. Não execute comandos com `>` sobre registros anteriores sem conservar uma cópia. Pelo editor que já conhece, ou num arquivo novo com `printf`, registre ambiente e objetivo usando dados fictícios de identificação:

```bash
printf '%s\n' 'Objetivo: conferir e usar nano.' 'Ambiente: vou preencher depois de consultar.' > plano.txt
```

Consulte `command -v nano` e, se encontrado, `nano --version`. Uma instalação existente já permite a parte prática. Não instale uma segunda cópia sem motivo. Registre a versão mostrada; o nome do pacote pode incluir revisão de distribuição adicional, que não aparece no número upstream do programa.

Você não precisa baixar nano manualmente. O [site do editor](https://www.nano-editor.org/) oferece documentação e distribuições do projeto; os comandos abaixo pedem a edição mantida para seu ambiente por meio de seu gerenciador. Código-fonte upstream não é um instalador universal para Android, ARM, Windows e Alpine.

## 5. Caminho Termux: consulte origem, candidato e plano

Use apenas no Termux **fora do PRoot**:

```bash
termux-info
pkg --help
apt --version
dpkg --print-architecture
apt-cache policy nano
apt-cache show nano
```

`policy` apresenta versão instalada/candidata e origens segundo os índices disponíveis. `show` apresenta metadados como descrição e dependências. Uma versão listada não prova que o download ainda estará disponível daqui a um mês. Se índice está ausente ou antigo, a consulta pode ser incompleta.

Confira as fontes configuradas sem editá-las:

```bash
ls -l "$PREFIX/etc/apt"
ls -l "$PREFIX/etc/apt/sources.list.d"
```

`$PREFIX` pertence ao Termux; não redefina essa variável. Se existir `sources.list`, leia com `cat "$PREFIX/etc/apt/sources.list"`; leia também os arquivos `.list`/`.sources` realmente encontrados na pasta, um de cada vez, conferindo o nome. Se uma pasta não existe naquela versão, registre isso em vez de criá-la ou copiar fontes Debian.

Depois de confirmar a origem e preservar ambientes importantes:

```bash
pkg update
apt-cache policy nano
apt-get -s install nano
```

`pkg update` consulta índices pelos mecanismos Termux. `-s` pede simulação ao APT, sem instalar nano. Leia todos os pacotes que seriam instalados, atualizados ou removidos. A simulação descreve o estado atual: não reserva os pacotes, não executa os scripts e não comprova que uma transação futura passará.

Se a lista é coerente com a instalação pretendida, continue conscientemente:

```bash
pkg install nano
```

Leia confirmações e aguarde o término. Não acrescente resposta automática para pular a análise. Não use `sudo` no Termux. Para problemas de mirror, a [orientação do projeto sobre pacotes](https://github.com/termux/termux-packages/wiki/Package-Management) apresenta `termux-change-repo`; ela contém histórico de migrações e deve ser confrontada com a origem atual do aplicativo. Consulte também o [código mantido do comando pkg](https://github.com/termux/termux-tools/blob/master/scripts/pkg.in), em vez de supor que toda versão da interface funciona da mesma maneira.

**Checkpoint Termux:** versão candidata e origem foram identificadas, simulação foi lida e `nano --version` funciona no aplicativo correto.

## 6. Caminho Debian/Ubuntu: leia antes de aceitar

Use na distribuição identificada. Primeiro consulte, sem privilégio:

```bash
cat /etc/os-release
apt --version
dpkg --print-architecture
apt-cache policy nano
apt-cache show nano
ls -l /etc/apt/sources.list.d
```

Leia `/etc/apt/sources.list` se existir e os arquivos `.list` ou `.sources` encontrados. Não cole uma lista inteira de outra instalação. O formato moderno deb822 usa campos como `URIs`, `Suites` e `Components`; o formato de uma linha usa entradas `deb`. Os formatos são descritos no [manual sources.list](https://manpages.debian.org/trixie/apt/sources.list.5.en.html).

Confira se os nomes correspondem à release e distribuição atuais. Debian e Ubuntu não são repositórios intercambiáveis. Nomes móveis como `stable` podem apontar para outra release depois de um lançamento; um codinome também precisa corresponder ao sistema efetivamente instalado. Não mude essas definições nesta aula.

No Linux nativo com `sudo` já autorizado:

```bash
sudo apt update
apt-cache policy nano
apt-get -s install nano
```

O primeiro comando escreve índices locais e acessa a rede; não é uma consulta sem efeitos. A simulação seguinte pode ser feita sem root, mas avise-se de que permissões de configuração e alterações concorrentes podem afetar seu resultado. Leia avisos do gerenciador. [Simulação apt-get](https://manpages.debian.org/trixie/apt/apt-get.8.en.html).

Só instale quando a transação prevista faz sentido para seu objetivo e existe espaço/energia:

```bash
sudo apt install nano
```

Dentro de Debian PRoot administrativo, use `apt update` e `apt install nano` **sem sudo**, nessa instância, após as mesmas consultas e simulação. Não execute esse bloco no Termux externo pensando que administra Debian. Em Ubuntu, mantenha as fontes Ubuntu da release correta e consulte suas notas de atualização quando necessário.

Se aparecem remoções inesperadas de desktop, pacote de dispositivo, kernel ou administração, responda não e investigue. Não combine automaticamente a instalação com upgrade global. A [Referência Debian sobre pacotes](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html#_basic_precautions) explica por que coleções misturadas exigem conhecimento além desta aula.

**Checkpoint Debian:** `nano --version` abre a edição da distribuição, e você compreende o que foi alterado pela transação.

## 7. Caminho Alpine/postmarketOS: preserve a integração do port

Use somente num sistema APK identificado:

```bash
cat /etc/os-release
apk --version
apk --print-arch
cat /etc/apk/repositories
apk search -e nano
apk policy nano
apk info nano
```

`search -e` procura nome exato. `policy` relaciona versões/origens disponíveis; `info` apresenta metadados conhecidos. Consulte `apk --help` e `apk info --help` se a versão local não reconhece uma opção: o conjunto e a apresentação podem mudar entre versões. Não converta um erro de sintaxe em alteração de repositórios.

As fontes devem permanecer coerentes com a release e, em postmarketOS, com a integração da distribuição e do dispositivo. Repositórios postmarketOS não são “lixo extra” para remover e deixar apenas Alpine. Também não acrescente edge/testing a uma instalação estável para obter uma versão maior de nano.

O [manual Alpine de pacotes](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html) explica coleções/releases e a inadequação de misturar branches. O [catálogo oficial](https://pkgs.alpinelinux.org/packages?name=nano) permite consultar nome, branch, repositório e arquitetura. Ao abrir o catálogo, selecione esses filtros: o resultado inicial pode estar numa branch e arquitetura diferentes das suas.

Com administração já configurada, atualize índices e simule:

```bash
sudo apk update
apk --simulate add nano
```

Leia a transação inteira. A opção de simulação consta do [manual mantido em apk-tools](https://github.com/alpinelinux/apk-tools/blob/master/doc/apk.8.scd). Se índice ou configuração não podem ser lidos como usuário, consulte a administração documentada do sistema, sem desativar verificações de assinatura.

APK pode executar instalação sem pergunta por padrão. Para pedir confirmação explicitamente quando a versão oferece `--interactive`:

```bash
sudo apk --interactive add nano
```

Confira `apk --help` antes; se a interface local não oferece essa opção, preserve o resultado da simulação e só faça a transação comum documentada pelo port após analisá-la. Com `doas` previamente configurado, adapte o privilégio, não a release. Nenhuma linha aqui migra Alpine ou instala outro kernel deliberadamente.

**Checkpoint Alpine:** a versão e origem pertencem à montagem de repositórios do sistema, a simulação é compreendida e o editor inicia.

## 8. Descubra quem fornece um arquivo

O dono Unix mostrado por `ls -l` é uma identidade de acesso. O **pacote responsável** por um caminho é outra informação. Isso ajuda a decidir onde buscar documentação e evita editar um executável gerenciado como se fosse uma configuração sua.

Consulte primeiro `command -v nano`. Se a resposta é um caminho absoluto de executável, no caminho Debian/Termux use:

```bash
nano_caminho=$(command -v nano)
printf '%s\n' "$nano_caminho"
dpkg-query -S "$nano_caminho"
dpkg-query -W nano
```

`-S` procura a responsabilidade do caminho no banco de pacotes; `-W` consulta a versão registrada. A [referência dpkg-query](https://manpages.debian.org/trixie/dpkg/dpkg-query.1.en.html) distingue lista de arquivos e metadados. Se um alias/função aparece no lugar de caminho, esclareça antes de usar essa variável como alvo de consulta.

Em Alpine/postmarketOS, use:

```bash
nano_caminho=$(command -v nano)
printf '%s\n' "$nano_caminho"
apk info -W "$nano_caminho"
apk info -L nano
```

`-W` consulta quem fornece o caminho; `-L` lista os arquivos conhecidos do pacote. [Manual apk-info](https://github.com/alpinelinux/apk-tools/blob/master/doc/apk-info.8.scd). Se não há resultado, pode ser caminho traduzido, link, arquivo criado após instalação ou um programa instalado por outro mecanismo. Não apague o arquivo para “deixar o gerenciador recuperar”.

## 9. Faça uma prova útil: salve e reabra

Na pasta nova de laboratório:

```bash
nano notas.txt
```

Digite duas linhas de texto fictício, por exemplo:

```text
Aprendi a identificar o gerenciador do meu ambiente.
Vou registrar origem e versao antes de instalar programas.
```

Na configuração tradicional de nano, **Ctrl+O** abre a gravação; confira que o nome é `notas.txt` e pressione Enter. **Ctrl+X** sai. Atalhos podem mudar por configuração ou opção da versão, então leia a barra de ajuda e o [manual oficial do nano](https://www.nano-editor.org/dist/latest/nano.html) se a interface difere.

Consulte `cat notas.txt` e reabra `nano notas.txt`. O mesmo conteúdo precisa aparecer. Ao terminar, saia sem criar mudanças adicionais. Isso mede instalação utilizável e persistência do documento, além de simplesmente reconhecer um comando. O editor não precisa de um daemon, regra de firewall ou extensão GNOME.

Se salvar é negado, confira `pwd`, `ls -ld .`, usuário e espaço. A [aula de permissões](arquivos-permissoes.md) ensina esse diagnóstico; não abra o editor como root para ignorar o local errado. Se `nano --version` funciona mas a tela do editor fica estranha, investigue o terminal/atalhos antes de reinstalar pacotes repetidamente.

## 10. Trate erros sem desativar a confiança

| Erro/sintoma | Verificação inicial |
|---|---|
| Pacote não encontrado | Nome, índice atualizado, release, repositório e arquitetura |
| Falha de conexão/DNS | Rede, data/hora e disponibilidade do mirror oficial |
| Assinatura não verificável | Origem, chave fornecida pela distribuição e relógio; não ignorar autenticação |
| Banco bloqueado | Outra transação pode estar ativa; aguarde e identifique, sem apagar locks |
| Dependências conflitantes | Compare fontes/releases e plano completo; não force substituição |
| Ferramenta instalada noutro ambiente | Confira contexto, PATH e comando executado |

Não instale uma chave de um comentário aleatório para silenciar um aviso. Assinatura válida ajuda a autenticar a origem esperada; não garante que um aplicativo é compatível com seu projeto, seguro para qualquer uso ou livre de bugs. Rede criptografada e assinatura são mecanismos diferentes.

Se uma transação foi interrompida, registre comando, etapa e mensagem. Conserve espaço e energia e procure o procedimento de recuperação do gerenciador/release. Não copie bancos de outra instalação nem use uma sequência de “forçar tudo” encontrada num fórum. Para um sistema já inconsistente, esta aula não oferece um reparo universal.

## 11. Separe ferramentas do sistema de dependências do projeto

Python pode ter um ambiente virtual e dependências próprias; Node usa manifests/lockfiles; Arduino usa índices e pacotes de placas. Isso não substitui o gerenciador do sistema, e o contrário também é verdadeiro. A origem e o destino de cada dependência precisam ser identificados.

Comece por [Python](python-projeto-completo.md), [JavaScript](javascript-servidor-local.md) e [C/C++](c-cpp-compilacao.md), que instalam ferramentas condicionais e criam projetos próprios. Para Arduino/ESP32, a arquitetura do computador que compila não é a arquitetura da placa, e disponibilidade de toolchain precisa ser conferida.

Não peça “todos os repositórios” como preparação obrigatória. Primeiro nomeie a aplicação, confirme oferta mantida para seu ambiente e avalie alternativas. Uma biblioteca de projeto instalada globalmente pode interferir em trabalhos diferentes; um ambiente por projeto ajuda a registrar versões e retomar, mas não isola automaticamente drivers e serviços do sistema.

## 12. Entenda recuperação e os limites de rollback

Texto criado com nano pode ser recuperado por [backup](backup-restauracao.md). Remover/reinstalar nano não reverte todos os pacotes que uma transação atualizou, não recupera documentos não copiados e não restaura firmware. Uma simulação não faz backup.

Antes de uma alteração mais ampla, preserve dados, lista de pacotes, arquivos de configuração pertinentes, release e fontes. Uma lista é um inventário, não um arquivo contendo os executáveis; as versões antigas podem não estar mais no mirror. Downgrade de bibliotecas e boot deve seguir procedimento específico, com recuperação validada.

Esta aula não exige desinstalar o editor no final. Se já existia, não seria adequado removê-lo só para “limpar” o exercício. Nenhuma remoção automática de dependências, desktop ou pacote de dispositivo está incluída. Para futuras alterações, siga a [rotina de manutenção](rotina-manutencao.md) e o [plano de recuperação](../preparacao/plano-recuperacao.md) quando envolver boot.

## 13. Retome e registre uma conclusão honesta

Ao voltar, identifique novamente ambiente/release, consulte versão e pacote de nano e abra o texto salvo. Não repita criação com `>` sobre `plano.txt` anterior. Acrescente manualmente às suas anotações: qual caminho usou; origem candidata; se o programa já existia; se houve instalação; dependências alteradas; e como verificou o texto.

Na [ficha de evidências](../diagnostico/ficha-evidencias.mdx), diferencie “consultei manual”, “simulei” e “instalei e usei”. Resultados de uma distribuição não comprovam que outra possui os mesmos pacotes. A consulta documental desta aula foi feita em 2026-10-11 nas fontes vinculadas. Os blocos APT/APK/Termux foram revisados pela documentação, sem instalação desses pacotes no notebook ou telefone.

No notebook Fedora 44, nano 8.7.1 já estava instalado. Foram verificadas abertura, gravação e reabertura do texto fictício numa pasta temporária, além de responsabilidade do executável pelo RPM do próprio Fedora. Isso valida a etapa de uso do editor naquele ambiente, não uma transação APT/APK ou compatibilidade de um smartphone.

Você conclui a aula quando sabe escolher **um** gerenciador, explicar a origem, ler a transação e reencontrar o documento salvo. Continue pela [biblioteca de aulas](biblioteca.mdx); instalar de forma compreendida é uma habilidade que será usada em todos os projetos seguintes.
