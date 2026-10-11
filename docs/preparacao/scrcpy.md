---
title: Mostre e controle o Android no computador com scrcpy
description: Download oficial, extração, ADB, primeira execução e diagnóstico de uma janela de espelhamento Android.
sidebar_position: 5
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Resultado: uma janela no computador mostra o Android do telefone e recebe teclado/mouse, quando os requisitos de captura e entrada são atendidos. **Android continua em execução no telefone.** Isso não é instalação Linux, saída HDMI nem visualizador GNOME/postmarketOS. Dificuldade: iniciante após [ADB funcionando](adb-fastboot.md).

## Requisitos e limites

Você precisa de computador compatível, cabo de dados, Android suportado pelo scrcpy e autorização ADB aceita no telefone. O projeto descreve Android 5.0/API 21 ou posterior como requisito básico; recursos como áudio têm requisitos próprios. Root não é exigido para o espelhamento comum. Se nunca autorizou ADB e a tela/toque não permite aceitar o diálogo, esta aplicação não contorna aquela autorização. [Requisitos oficiais](https://github.com/Genymobile/scrcpy).

Primeiro conecte diretamente ao computador, sem hub que ocupa a mesma porta como host. Salve trabalho. Espelhamento não apaga dados, mas a pessoa com acesso à janela pode ver informações privadas e controlar aplicativos; evite gravações ou compartilhamento público sem revisar o conteúdo.

## 1. Baixe a edição do computador

Origem: [releases oficiais Genymobile/scrcpy](https://github.com/Genymobile/scrcpy/releases). Na revisão, a release estável publicada era 5.0.1; nomes e versões futuras podem mudar. Selecione o arquivo correspondente ao sistema e arquitetura **do computador**. Não baixe “Source code” quando precisa do executável pronto.

| Sistema | Caminho de instalação |
| --- | --- |
| Windows | ZIP binário oficial apropriado, extraído para uma pasta |
| Linux | Pacote da distribuição se oferecido; alternativamente binário oficial compatível e instrução da release |
| macOS | Binário da release, quando oferecido para sua arquitetura, ou pacote pelo método oficial documentado |

Leia a página específica de [Windows](https://github.com/Genymobile/scrcpy/blob/master/doc/windows.md), [Linux](https://github.com/Genymobile/scrcpy/blob/master/doc/linux.md) ou [macOS](https://github.com/Genymobile/scrcpy/blob/master/doc/macos.md). Não instale um APK chamado scrcpy de uma busca aleatória. Os componentes necessários ao espelhamento são coordenados pelo programa do computador.

## 2. Windows: extraia e abra o terminal na pasta

Clique no ZIP → Extrair Tudo → escolha uma pasta própria, como `smartphone-linux/downloads/scrcpy`. Entre na pasta que contém `scrcpy.exe`. Abra PowerShell naquela pasta, ou digite `Set-Location` com o caminho real entre aspas, conforme a [aula de downloads](../comece-aqui/computador-downloads.md).

**Local: PowerShell do computador, dentro da pasta extraída:**

```powershell
.\scrcpy.exe --version
.\adb.exe devices -l
.\scrcpy.exe
```

O segundo comando pressupõe que seu pacote Windows inclui `adb.exe` naquela pasta; confira a listagem. Se não, use sua instalação Platform-Tools já preparada. Verifique a cópia ADB e mantenha versões coerentes. Uma janela que fecha instantaneamente ao abrir com duplo clique esconde a mensagem: execute pelo terminal para ler o erro.

**Pare e confira:** o ADB lista **um** alvo em estado `device`? A versão do scrcpy aparece? A janela mostra a tela Android? Se `unauthorized`, aceite na tela antes de continuar. Não use root ou flash para consertar essa autorização.

## 3. Linux: pacote ou pasta oficial, uma alternativa

No computador Debian/Ubuntu, se a sua release oferece o pacote:

```bash
apt-cache policy scrcpy
sudo apt update
sudo apt install scrcpy adb
scrcpy --version
adb devices -l
scrcpy
```

`apt-cache policy` mostra a versão candidata. Uma versão muito antiga pode não suportar seu Android/recurso; nesse caso leia a instrução upstream do Linux para obter um binário/compilar com dependências compatíveis. Não acrescente repositórios de outra release por hábito.

Se baixou binário oficial em vez do pacote, extraia o arquivo e abra terminal na pasta resultante. A primeira consulta é `./scrcpy --version`; a execução é `./scrcpy`. Não misture esse fluxo com uma instalação diferente no `PATH` sem conferir qual está executando.

No macOS, siga a opção do [manual oficial](https://github.com/Genymobile/scrcpy/blob/master/doc/macos.md) para o seu sistema. Se Homebrew já estiver instalado pelo seu procedimento oficial, o projeto documenta `brew install scrcpy` e `brew install --cask android-platform-tools`; não cole um script de instalação de Homebrew encontrado em anúncio. Os comandos seguintes são `scrcpy --version`, `adb devices -l` e `scrcpy` no Terminal.

## 4. Faça um teste simples de controle

Abra um aplicativo de notas sem informação sensível no Android. Clique na janela de espelhamento e digite uma frase. Verifique uma tecla de edição e um clique. Se a captura aparece, mas entrada é recusada, o projeto documenta que determinados aparelhos, especialmente Xiaomi, podem exigir a opção adicional de segurança para depuração USB; use a configuração do fabricante, não concessão indiscriminada de permissões. [Requisitos e observação de entrada](https://github.com/Genymobile/scrcpy).

Para reduzir esforço de captura/transferência, o limite de dimensão pode ser testado:

```bash
scrcpy --max-size=1024
```

**Este bloco é para Linux/macOS com scrcpy no `PATH`**; no PowerShell da pasta use `.\scrcpy.exe --max-size=1024`. O valor limita a dimensão da captura, não muda permanentemente o painel ou habilita GPU. Compare a resposta com a execução padrão. Se houver vários aparelhos, escolha o alvo pelo parâmetro de serial descrito pelo projeto e confira o alvo antes de iniciar.

## Erros, alternativas e rollback

| Sintoma | Como investigar |
| --- | --- |
| “No ADB device” | Volte a `adb devices -l`; confira cabo/modo/autorizações |
| `unauthorized` | Aceite a chave no Android; servidor ADB não aprova por você |
| Janela abre sem controle | Confira foco da janela e configuração de entrada do fabricante |
| Tela protegida fica preta em aplicativo específico | Conteúdo protegido pode não ser capturável; teste notas/configurações |
| Binário não executa | Confira sistema/arquitetura/dependências e arquivo realmente extraído |
| Telefone já está em postmarketOS | scrcpy comum não se aplica; use [acesso remoto Linux](../desktop/acesso-remoto.md) |

O modo OTG do scrcpy é outra função: pode enviar entrada em condições suportadas, mas **não espelha vídeo**. Não o apresente como recuperação de painel invisível. [Modo OTG oficial](https://github.com/Genymobile/scrcpy/blob/master/doc/otg.md).

Fechar a janela encerra o espelhamento; o Android permanece instalado. Para remover o programa, apague somente a pasta portátil que não contém seus dados, ou remova o pacote pelo gerenciador usado. Revogue a autorização ADB de computadores que não pretende mais usar.

## Teste final e próximos passos

Confirme captura, clique, digitação, fechamento da janela e nova abertura sem alterar sistema. Se o telefone tem tela quebrada, aproveite o canal autorizado para [backup](backup.md) antes de limpeza; ele pode desaparecer após desbloqueio. Para Linux mantendo Android, siga [Termux](../android/termux.md); para Linux nativo, confira primeiro compatibilidade e recuperação.

## Fontes e verificação

Revisão documental em **11/10/2026**, sem espelhamento físico executado nesta edição. Fontes: [projeto e requisitos](https://github.com/Genymobile/scrcpy), [release](https://github.com/Genymobile/scrcpy/releases), guias por sistema vinculados acima e [OTG](https://github.com/Genymobile/scrcpy/blob/master/doc/otg.md). Os exemplos de teste são originais e não prometem funcionamento com firmware/versão não suportados.
