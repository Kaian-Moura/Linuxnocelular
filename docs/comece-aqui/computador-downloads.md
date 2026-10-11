---
title: Prepare o computador, baixe e abra os arquivos
description: Windows, macOS e Linux desde o navegador até a pasta de trabalho, extração, arquitetura e verificação do download.
sidebar_position: 3
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Este tutorial prepara o **notebook ou desktop**, não instala nada no telefone. Resultado: uma pasta organizada e a capacidade de baixar, extrair e conferir uma ferramenta. Dificuldade: iniciante. Você precisa de acesso à internet, espaço em disco, navegador e conta do computador; algumas ferramentas pedirão autorização administrativa na sua instalação.

## 1. Saiba em qual sistema você está

| Computador | Como conferir pela interface | Terminal que vamos usar |
| --- | --- | --- |
| Windows | Configurações → Sistema → Sobre | Windows PowerShell ou Windows Terminal com perfil PowerShell |
| macOS | Menu Apple → Sobre Este Mac | Terminal, em Aplicativos → Utilitários |
| Linux desktop | Configurações → Sobre; depois `cat /etc/os-release` | Terminal da distribuição |

No Windows, procure “PowerShell” no menu Iniciar e abra normalmente, sem “Executar como administrador” para consultas comuns. Windows Terminal é o aplicativo que pode conter PowerShell, Prompt de Comando ou WSL; confirme a aba. Comandos escritos para Bash não devem ser colados automaticamente no PowerShell. [Introdução da Microsoft ao PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started).

No GNOME, abra Atividades e pesquise “Terminal”, “Console” ou “Ptyxis”, conforme o aplicativo instalado. `Ctrl+Alt+T` funciona em alguns desktops, não em todos. No macOS, use Spotlight (`Command+Espaço`), digite “Terminal” e abra. Se você está conectado por SSH, a janela já pode estar controlando o telefone — confira o host antes de instalar algo.

**Verificação:** você vê uma linha esperando digitação, com indicação de usuário/pasta? Não precisa saber interpretar tudo ainda; a [aula de terminal](terminal-primeiros-passos.md) ensina isso.

## 2. Crie uma pasta que você consiga localizar

Pelo gerenciador de arquivos, abra sua pasta pessoal e crie uma pasta chamada `smartphone-linux`. Dentro dela crie `downloads`, `backup` e `anotacoes`. Não use a pasta do telefone como único destino de backup.

Alternativa no PowerShell do computador Windows:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\smartphone-linux\downloads"
New-Item -ItemType Directory -Force "$env:USERPROFILE\smartphone-linux\backup"
New-Item -ItemType Directory -Force "$env:USERPROFILE\smartphone-linux\anotacoes"
Set-Location "$env:USERPROFILE\smartphone-linux"
Get-Location
```

Alternativa no computador Linux/macOS:

```bash
mkdir -p "$HOME/smartphone-linux/downloads" "$HOME/smartphone-linux/backup" "$HOME/smartphone-linux/anotacoes"
cd "$HOME/smartphone-linux"
pwd
```

Escolha **uma alternativa**. O resultado é uma pasta no computador. Se ela já existia, esses comandos não apagam seu conteúdo. `HOME` e `USERPROFILE` são valores do sistema usados para localizar sua pasta pessoal; não os redefina.

## 3. Encontre a página oficial antes de baixar

Abra o [catálogo de downloads](downloads.md) e escolha a ferramenta do tutorial. O link deve levar ao projeto/fabricante; quando houver um redirecionamento, confira o domínio de destino. Em GitHub, o nome do proprietário e do repositório importam. Um botão de anúncio chamado “Download” pode não ser parte da página do projeto.

Procure a seção “Download”, “Releases” ou “Assets”. Baixe a versão estável indicada pelo tutorial e guarde o nome completo. “Source code” é o código-fonte e normalmente não é o programa pronto para executar. Não escolha uma pré-release apenas porque aparece antes na lista. Se o mantenedor só oferece desenvolvimento, isso precisa estar declarado no tutorial.

Salve em `smartphone-linux/downloads` ou mova o arquivo de Downloads para essa pasta. Espere desaparecer uma extensão de transferência incompleta, como `.part` ou `.crdownload`. Não abra um download interrompido. Registre no arquivo de anotações: ferramenta, versão, URL e data.

## 4. Escolha a arquitetura do destino correto

Uma ferramenta que roda no **notebook** precisa combinar com o notebook. Uma aplicação instalada no **telefone** precisa combinar com o telefone e seu ambiente. ARM64 não resolve diferenças de bibliotecas entre Android, Alpine e Debian.

| Rótulo no download | Significado habitual | Exemplo de onde usar |
| --- | --- | --- |
| `x86_64`, `amd64`, `x64` | Intel/AMD de 64 bits | Muitos notebooks; não é o Snapdragon |
| `aarch64`, `arm64` | ARM de 64 bits | Telefone ARM64 ou computador ARM; confirme sistema/bibliotecas |
| `armv7`, `armhf` | ARM de 32 bits, com diferenças de ABI | Somente ambiente correspondente |
| `universal` em APK | APK reúne as arquiteturas indicadas pelo mantenedor | Android suportado pelo aplicativo |
| `musl` / `glibc` | Bibliotecas C diferentes | Alpine costuma usar musl; Debian usa glibc |

No Windows, veja “Tipo de sistema” em Sobre. No Mac, veja chip Apple ou processador Intel. No Linux, `uname -m` ajuda a identificar a arquitetura. Um `.exe` Windows não é um pacote Linux; um APK Android não se instala com `apk add` do Alpine. O nome “apk” existe nos dois contextos com significados diferentes.

## 5. Identifique o tipo de arquivo

| Extensão | O que fazer nesta documentação |
| --- | --- |
| `.zip` | Extrair para uma pasta; depois localizar os executáveis |
| `.tar.gz`, `.tar.xz` | Arquivo compactado; extrair conforme o tutorial |
| `.exe`, `.msi` | Executável/instalador Windows; conferir origem e seguir o tutorial |
| `.dmg`, `.pkg` | Distribuição/instalador macOS; conferir origem e condições |
| `.AppImage` | Aplicação Linux portátil, sujeita a dependências e permissão de execução |
| `.apk` | Aplicativo Android; instalar no Android pelo caminho indicado |
| `.img`, `.bin`, `.iso` | Imagem/dados; **não executar nem gravar só pela extensão** |
| `.img.xz` | Imagem compactada; extrair apenas se o método exigir |

Um arquivo de imagem não “sabe” qual partição você quer alterar. Não arraste `.img` para uma ferramenta de flash sem o guia exato do modelo. Não renomeie `.zip` para `.img` nem use o botão “extrair tudo” em uma OTA e suponha que cada arquivo resultante seja gravável.

## 6. Extraia sem trabalhar dentro do arquivo compactado

No Windows: clique com o botão direito no ZIP → **Extrair Tudo** → escolha uma pasta em `smartphone-linux/downloads` → Extrair. Abra a pasta criada. O Explorador também permite navegar dentro do ZIP sem extrair; isso parece uma pasta, mas ainda não é o destino correto para executar ferramentas que dependem de arquivos vizinhos. Ative a exibição de extensões de arquivos para evitar nomes como `notas.txt.txt`.

No macOS, abrir um ZIP normalmente cria a pasta pelo Utilitário de Arquivo. No Linux, use “Extrair aqui” no gerenciador ou o descompactador da distribuição. Se não há opção gráfica, veja a instalação de `unzip` na [caixa de ferramentas](../diagnostico/instalar-ferramentas.md).

**Verificação:** ao abrir a pasta extraída de Platform-Tools você deve encontrar `adb`/`fastboot` ou `adb.exe`/`fastboot.exe`, conforme a plataforma. O caminho detalhado está em [ADB](../preparacao/adb-fastboot.md). Se só vê “README” e código-fonte, pode ter baixado o artefato errado.

## 7. Confira integridade sem confundir isso com confiança

Um hash é um resumo calculado do arquivo. Compare o algoritmo e o valor com os publicados pelo mantenedor, quando existirem. Dois valores iguais ajudam a confirmar que os bytes são os esperados; um hash fornecido pelo mesmo site falso que distribuiu o arquivo falso não comprova a origem.

**No PowerShell; troque `ARQUIVO.zip` pelo nome real, mantendo aspas:**

```powershell
Get-FileHash -Algorithm SHA256 ".\downloads\ARQUIVO.zip"
```

**No computador Linux; na pasta `smartphone-linux`:**

```bash
sha256sum "downloads/ARQUIVO.zip"
```

**No macOS; na mesma pasta:**

```bash
shasum -a 256 "downloads/ARQUIVO.zip"
```

Esses exemplos são alternativas por sistema. Se o projeto publica SHA512 ou assinatura GPG, siga aquele método, não compare SHA256 com um valor de outro algoritmo. Se não houver hash publicado, registre a ausência; não invente um valor esperado. Veja o exemplo de [verificação de imagem Ubuntu](https://ubuntu.com/tutorials/how-to-verify-ubuntu), que também separa hash de assinatura.

## 8. Faça uma primeira execução que não altere o telefone

Abra o terminal na pasta extraída e execute a opção de versão indicada pelo tutorial. Para Platform-Tools, Linux/macOS usam `./adb version`; PowerShell usa `.\adb.exe version`. `./` ou `.\` localiza o programa na pasta atual; sem isso, o shell pode procurar outra cópia no `PATH`.

Resultado esperado: nome e versão, depois o prompt volta. “Comando não encontrado” costuma significar pasta ou nome incorretos, não falha do celular. “Exec format error” pode ser plataforma/arquitetura incompatível. Nunca resolva uma biblioteca faltante instalando DLLs de um site aleatório ou copiando arquivos do Android para `/usr/lib`.

## Se a ferramenta exige Linux no computador

ADB e alguns instaladores oferecem versões Windows/macOS. Já os fluxos desta base com pmbootstrap usam um computador Linux. Você não precisa apagar Windows para experimentar: veja [Linux por pendrive sem instalar no disco](linux-no-computador.md). A preparação do pendrive apaga o próprio pendrive e exige identificar o destino. Uma sessão live comum perde alterações após reiniciar e pode não ter espaço para gerar uma imagem grande.

WSL e máquinas virtuais são ambientes diferentes, especialmente no acesso USB. Não converta automaticamente um tutorial Linux em tutorial WSL; verifique se a ferramenta declara suporte e como o telefone será repassado a cada modo de manutenção.

## Erros, recuperação e teste final

Se baixou uma ferramenta errada, apague **apenas esse arquivo/pasta de ferramenta**, após confirmar que não contém seus backups. Downloads e extração não alteram o telefone. Um instalador executado pode ter feito alterações no computador; remova por Aplicativos no Windows/macOS ou pelo gerenciador da distribuição, conforme o método.

Você terminou quando consegue apontar a página oficial, o arquivo original, a pasta extraída e a versão executada. Guarde o backup em outra pasta e continue no tutorial da ferramenta. Não é necessário editar `PATH` para começar; trabalhar na pasta explícita reduz ambiguidades.

## Fontes e verificação

Revisão documental em **11/10/2026**, sem instalar os exemplos em Windows/macOS nesta rodada. Os exercícios de pastas são exemplos originais; nomes de botões variam por versão/idioma. Fontes: [Microsoft PowerShell](https://learn.microsoft.com/en-us/powershell/scripting/learn/ps101/01-getting-started), [Platform-Tools](https://developer.android.com/tools/releases/platform-tools), [ABIs Android](https://developer.android.com/ndk/guides/abis) e [verificação Ubuntu](https://ubuntu.com/tutorials/how-to-verify-ubuntu).
