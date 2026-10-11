---
title: Instale aplicativos e entenda a loja e os repositórios
description: Busque, instale, abra e remova um programa no Linux nativo, usando pacotes ou Flatpak quando suportado.
sidebar_position: 3
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Este tutorial é para um **Linux nativo já inicializado** ou computador Linux convencional. Resultado: instalar uma aplicação pequena, encontrá-la no desktop e saber como atualizar/remover pelo mesmo mecanismo. Dificuldade: iniciante. Para aplicativos Android use Play Store/F-Droid ou a origem do projeto; para pacotes Termux use `pkg`, conforme [Termux](../android/termux.md). APK Android e o gerenciador `apk` Alpine são coisas diferentes.

## 1. Saiba qual loja atende qual sistema

Uma distribuição combina programas empacotados para sua versão e arquitetura. O repositório é a origem desses pacotes; o gerenciador resolve dependências e verifica metadados. Uma loja gráfica, quando instalada, é uma interface para uma ou mais dessas origens.

| Ambiente | Instalação usual | Onde os programas ficam |
| --- | --- | --- |
| Alpine/postmarketOS | `apk`, com doas/sudo configurado | No Linux instalado |
| Debian/Ubuntu | APT, com sudo ou root apropriado | Na distribuição onde o comando roda |
| Fedora | DNF | No Fedora, não no telefone conectado por USB |
| Termux | `pkg` | No ambiente Termux dentro do Android |
| Flatpak, quando suportado | `flatpak` ou loja com plugin | Aplicações isoladas e runtimes, por usuário/sistema |

**GNOME não determina o gerenciador.** Você pode usar GNOME sobre Alpine ou Debian e terá comandos diferentes. Execute no terminal do sistema onde deseja instalar:

```bash
cat /etc/os-release
uname -m
id
```

Se não sabe abrir terminal ou interpretar essa saída, faça a [primeira aula](../comece-aqui/terminal-primeiros-passos.md). Uma linha `aarch64` pede programas compatíveis com ARM64; ela não transforma instaladores Windows `.exe` em programas Linux.

## 2. Primeiro pacote: um editor pequeno

Vamos usar `nano` porque é fácil testar sem depender de aceleração gráfica. Primeiro consulte se já está instalado por `command -v nano`. Se existir, pode pular a instalação e seguir o teste.

**Alpine/postmarketOS, com doas:**

```bash
doas apk update
apk search -e nano
doas apk add nano
```

**Debian/Ubuntu, alternativa:**

```bash
sudo apt update
apt-cache policy nano
sudo apt install nano
```

**Fedora, alternativa:**

```bash
dnf info nano
sudo dnf install nano
```

Escolha apenas seu ambiente. No Alpine com sudo configurado, troque o elevador; não instale um segundo mecanismo administrativo só para copiar a linha literalmente. Os gerenciadores mostram as alterações. Leia dependências e remoções; um editor comum não deveria exigir remover o pacote do dispositivo ou kernel.

**Teste:** execute `nano --version`; deve imprimir a versão. Crie e salve uma anotação seguindo [nano do zero](../comece-aqui/terminal-primeiros-passos.md). Esse aplicativo é de terminal e não precisa aparecer como ícone na grade do GNOME. Para um programa gráfico, procure o pacote pelo nome e confira sua descrição/origem antes de instalar.

## 3. Como pesquisar um programa que você não conhece

Comece pela página oficial da aplicação e veja sistemas suportados. Depois busque nos pacotes da **sua distribuição**: [Alpine](https://pkgs.alpinelinux.org/packages), [Debian](https://packages.debian.org/) ou [Ubuntu](https://packages.ubuntu.com/). Escolha branch/arquitetura nos filtros. Um nome ausente não é autorização para inserir o repositório de uma versão diferente.

No terminal, `apk search NOME`, `apt search NOME` ou `dnf search NOME` são buscas; substitua NOME pelo termo real. Confira o pacote encontrado por `apk info PACOTE`, `apt show PACOTE` ou `dnf info PACOTE` antes de instalar. Se o comando do programa tem outro nome que o pacote, a descrição/lista de arquivos explica essa relação.

Não baixe um `.deb` para instalar no Alpine, nem um `.rpm` para instalar no Debian. Os formatos e as bibliotecas não são intercambiáveis. Um binário que exige glibc pode não executar num sistema musl; para aplicações gráficas, Flatpak é uma alternativa **somente quando o kernel e a integração permitem**.

## 4. Flatpak: verifique condições antes da loja

Flatpak fornece runtimes e isolamento para aplicativos Linux, mas depende de recursos do kernel, permissões e integração de sessão. Kernels Android/downstream antigos podem não oferecer o necessário. PRoot não é um host Flatpak convencional. Não desative sandbox/namespaces para apresentar uma instalação incompleta como segura.

No Linux nativo, veja `uname -r` e o método Flatpak da distribuição. O [projeto upstream](https://github.com/flatpak/flatpak/blob/main/README.md) registra requisitos do código atual; confira a **versão empacotada** e o port, não use a versão do kernel isoladamente como certificação.

**Alpine/postmarketOS, se os pacotes existem na sua release e o port atende os requisitos:**

```bash
apk search -e flatpak
apk search -e gnome-software
apk search -e gnome-software-plugin-flatpak
doas apk add flatpak gnome-software gnome-software-plugin-flatpak
```

Esse é o caminho documentado para Alpine no [setup Flathub](https://flathub.org/en/setup/Alpine), com os pacotes encontrados na release correta. Não apague entradas postmarketOS/Nura para copiar uma lista Alpine genérica. Se o sistema já tem GNOME Software, não precisa reinstalar outro desktop.

**Debian/Ubuntu com os pacotes disponíveis, alternativa:**

```bash
sudo apt update
sudo apt install flatpak gnome-software gnome-software-plugin-flatpak
```

Consulte também [setup Flathub por distribuição](https://flathub.org/setup) para diferenças de versão e sessão. Depois confira `flatpak --version`. Faça logout/login ou reinício normal somente quando a instrução da distribuição exigir para integrar o menu; salve o trabalho antes.

## 5. Adicione uma origem Flatpak definida, por usuário

**No terminal do usuário que usará os aplicativos, sem sudo:**

```bash
flatpak remote-add --user --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak remotes --user --show-details
```

Escolhemos escopo **do usuário** para que o exemplo não exija adicionar um remoto global. `--if-not-exists` evita duplicar uma origem de mesmo nome nesse escopo; não substitui a inspeção do URL se um remoto `flathub` já existia. `--show-details` mostra a coluna de URL que a listagem simples omite, conforme o [manual de remotos Flatpak](https://docs.flatpak.org/en/latest/flatpak-command-reference.html#flatpak-remotes). Confira que o remoto corresponde à origem oficial escolhida; se o nome já aponta para outra fonte, pare e investigue antes de instalar. Flathub é um repositório separado dos pacotes Alpine/Debian.

## 6. Instale, abra e encontre o primeiro aplicativo gráfico

Uma calculadora é um teste menor que um navegador completo. Confira o aplicativo/arquitetura disponível para o sistema:

```bash
flatpak remote-info --user flathub org.gnome.Calculator
flatpak install --user flathub org.gnome.Calculator
flatpak run org.gnome.Calculator
```

Execute **somente se** o primeiro comando encontrar o aplicativo para sua arquitetura. O instalador pode baixar também um runtime: por isso o tamanho total é maior que apenas a calculadora. Leia permissões e tamanho antes de confirmar. Se `remote-info` falhar, resolva rede/origem/arquitetura em vez de baixar um binário x86 para o telefone ARM.

Na interface GNOME, abra Atividades/grade e procure **Calculadora**. Faça `2 + 2` e confira o resultado. A execução pelo terminal revela erros que um clique no ícone pode ocultar. `flatpak list --user` mostra a instalação. Se há duplicatas no menu, confira se instalou a mesma aplicação pelo pacote e por Flatpak ou em dois escopos.

### Se preferir a loja gráfica

Abra **Software** pelo menu. Procure a aplicação, abra a página e confira a origem (Flathub ou distribuição), desenvolvedor, permissões e arquitetura disponível. Clique Instalar e espere concluir; depois Abrir. Se a loja não oferece a origem que você adicionou por usuário, consulte `flatpak remotes --user --show-details` e a integração/plugin da versão instalada. Não faça uma segunda instalação global só para esconder uma falha de integração.

## 7. Atualizar, remover e preservar dados

Para aplicações Flatpak do usuário:

```bash
flatpak update --user
flatpak uninstall --user org.gnome.Calculator
```

Revise o que será atualizado/removido. Sem `--delete-data`, não estamos pedindo apagar dados pessoais da aplicação. Remover um programa não apaga necessariamente todos os arquivos que ele criou; backup de projetos/documentos continua necessário.

Para um pacote da distribuição, confira primeiro o plano de remoção. Alpine oferece `doas apk del --simulate nano`; Debian/Ubuntu, `apt -s remove nano`. Só execute a remoção real quando a lista estiver correta. Não use remoção recursiva, limpeza de dependências ou comandos de apagar pastas do sistema como rotina de iniciante.

## Repositórios: por que não instalar “todos”

Repositórios precisam combinar versão, arquitetura, assinatura e política de atualização. Somar stable, edge, testing e fontes privadas pode deixar o sistema sem conjunto coerente de bibliotecas/drivers. Para um pacote ausente, considere a versão oficialmente suportada, Flatpak compatível, compilação documentada ou outro ambiente; não force o telefone a aceitar uma coleção de repositórios incompatíveis.

Não altere `/etc/apk/repositories` sem preservar uma cópia e entender as entradas do port. A [documentação APK](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html) distingue releases e repositórios. Uma instalação desktop móvel pode precisar de uma origem do projeto além da Alpine correspondente.

## Erros e conclusão

| Sintoma | Primeira verificação |
| --- | --- |
| Nenhum pacote corresponde | Nome, índice, release e arquitetura |
| Instalação funciona, ícone não aparece | Programa é CLI? Arquivo desktop/integração/exportação estão disponíveis? |
| App fecha ao clicar | Abra pelo terminal e leia erro real |
| Flatpak reclama de namespaces/sandbox | Recursos/política do kernel; não contorne desligando isolamento |
| Loja vazia | Rede, remoto, plugin e sessão; GNOME instalado não implica loja pronta |
| Falta espaço | Some runtime/cache/dados; não apague partições nem logs sem diagnóstico |

Conclua quando consegue localizar a origem, instalar, testar e remover a aplicação sem alterar drivers/boot. Para ambientes de desenvolvimento, continue em [linguagens do zero](../projetos/desenvolvimento.md). Para programas Android, volte ao caminho Android em vez de executar o gerenciador da distribuição errada.

## Fontes e verificação

Revisão documental em **11/10/2026**, sem instalação no telefone. Fontes: [APK](https://docs.alpinelinux.org/user-handbook/0.1a/Working/apk.html), [Debian packages](https://www.debian.org/doc/manuals/debian-reference/ch02.en.html), [DNF](https://dnf.readthedocs.io/en/latest/command_ref.html), [uso Flatpak](https://docs.flatpak.org/en/latest/using-flatpak.html), [origens/instalação](https://flathub.org/setup), [Alpine](https://flathub.org/en/setup/Alpine) e [requisitos upstream Flatpak](https://github.com/flatpak/flatpak/blob/main/README.md). O teste físico e a política do kernel permanecem específicos do aparelho.
