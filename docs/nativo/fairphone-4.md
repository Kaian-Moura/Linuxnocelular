---
title: Fairphone 4 — exemplo de instalação por modelo
description: Um roteiro condicionado para FP4 com UBports Installer, Ubuntu Touch ou imagem postmarketOS/Nura.
sidebar_position: 7
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Escopo e resultado esperado

Este guia é **exclusivo ao Fairphone 4, código FP4**. Não serve para FP3, FP5 ou Fairphone de outra geração. Mostra como utilizar um instalador que possui uma receita real para a placa, em vez de aplicar comandos genéricos a qualquer telefone. Resultado esperado: sistema escolhido inicializando diretamente, com os recursos que o port documenta. Dificuldade: intermediária.

Este projeto não executou a instalação num FP4 físico. A elegibilidade e o fluxo foram conferidos em documentação e configuração upstream, em **10/10/2026**. Se o aparelho não cumprir as condições atuais, pare antes de desbloquear ou gravar.

## Compatibilidade, requisitos e materiais

- FP4 identificado em etiqueta e sistema; confirme por [inventário](../compatibilidade/inventario.md).
- Computador Linux/macOS/Windows aceito pelo UBports Installer e pacote correspondente à arquitetura do computador.
- Cabo USB direto com dados, botões utilizáveis, tela para confirmações e energia suficiente.
- Backup externo validado e pacote de recuperação Fairphone correto.
- Tempo para preparar a base Android e verificar riscos de downgrade.

A [página UBports do FP4](https://devices.ubuntu-touch.io/device/fp4/) indica Halium 11, instalador e saída de vídeo. Para **Ubuntu Touch**, exige **Fairphone OS Android 11**, e diz que uma custom ROM previamente instalada não satisfaz a condição. Isso descreve aquele caminho; não significa que deva fazer downgrade em qualquer telefone que use Ubuntu Touch.

Para **postmarketOS/Nura**, confirme a [página do port FP4](https://wiki.postmarketos.org/wiki/Fairphone_4_%28fairphone-fp4%29), a versão atual e suas condições de firmware. O FP4 aparece nas imagens community da [página Nura](https://nura.eco/install/). Uma categoria mantida não elimina possíveis limitações de recursos.

## Backup e riscos específicos

Desbloquear e instalar podem apagar todos os dados. O FP4 tem esquema A/B e partições dinâmicas; o instalador controla destinos conforme sua receita. Não altere manualmente os slots ou apague `dtbo` fora desse procedimento. Retornar ao firmware original pode requerer reconstruir o conjunto de partições correto.

A Fairphone alerta que relock após instalar software com patch mais antigo pode inutilizar o boot. Se a base necessária for Android 11 e seu estado atual for mais novo, avalie o procedimento oficial e **não religue a trava para esconder o aviso**. Não confunda reinicializar o telefone com restaurar suas proteções e chaves.

## 1. Prepare a referência original e a saída de emergência

Abra o [guia oficial de restauração manual](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone) e localize **FP4**. Baixe somente o pacote cuja origem e condições você conferiu. Anote hashes publicados e requisitos, incluindo carga. Não use um pacote FP3 nem um script renomeado.

No computador com Android autorizado:

```bash
adb devices -l
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.build.version.release
adb shell getprop ro.build.version.security_patch
adb shell getprop ro.build.fingerprint
```

Salve os valores sem publicar serial/IMEI. Se a identidade divergir de FP4, não continue. Faça exportação de fotos, documentos, autenticadores e dados de aplicativos conforme [backup](../preparacao/backup.md).

## 2. Prepare bootloader e firmware pela instrução correta

Siga o [desbloqueio oficial Fairphone](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-and-re-lock-the-bootloader), que diferencia gerações e códigos. Leia todo o processo antes de aceitar a limpeza. Não substitua a etapa por um comando encontrado para OnePlus.

Quando uma limpeza retornar ao Android inicial, restabeleça o acesso e confira novamente base/variante. Para Ubuntu Touch, cumpra a base Fairphone OS Android 11 exigida pelo catálogo, usando o método oficial permitido. Para Nura, confirme a página vigente e os requisitos exibidos pelo instalador; **se houver divergência, suspenda a gravação e consulte o mantenedor**.

Testar consultas em Fastboot permite confirmar comunicação, quando estiver no modo certo:

```bash
fastboot devices
fastboot getvar product
fastboot getvar current-slot
fastboot getvar unlocked
```

Confira resultados e documentação; não altere `current-slot` manualmente nesta etapa. Um retorno que não corresponda ao esperado pelo instalador pede investigação, não `--force`.

## 3. Instale e abra o UBports Installer

Obtenha o instalador pelo link da página do FP4 ou pelas [releases upstream](https://github.com/ubports/ubports-installer/releases). Execute como usuário comum, sem `sudo`. Conecte o aparelho diretamente ao computador; retire o hub durante a gravação para reduzir variáveis, salvo orientação explícita diferente.

Confira a detecção FP4 e a seleção de sistema:

- **Ubuntu Touch:** escolha o canal estável oferecido para o FP4 e leia as opções de bootstrap, particionamento e limpeza da primeira instalação. Não use a opção de preservar dados como método de migrar Android intacto.
- **postmarketOS/Nura:** só prossiga se o instalador atual realmente oferecer esse sistema e uma release/interface para FP4. Se a opção desaparecer ou falhar, use a página vigente de imagens/instalação, sem importar uma configuração local de outro modelo.

Salve versão do instalador, sistema, release, interface e opções escolhidas. Interfaces disponíveis podem mudar; não prometemos GNOME acelerado por simplesmente selecioná-lo.

## 4. Entenda o que o instalador pode fazer

A [configuração upstream FP4](https://github.com/ubports/installer-configs/blob/master/v2/devices/FP4.yml), lida durante esta revisão, possui receitas diferentes para Ubuntu Touch e postmarketOS. Ela verifica desbloqueio e controla slots. O fluxo Ubuntu Touch pode reorganizar partições lógicas; o fluxo postmarketOS seleciona slot A, remove `dtbo` e grava imagens em `userdata` e `boot`.

Essa descrição explica **por que é destrutivo e específico**; não é uma lista de comandos para repetir por conta própria. Uma futura versão do instalador pode mudar a receita. A fonte aberta permite revisar o código que executará ações reais, preservando transparência.

Siga cada instrução de modo exibida. Não envie comandos simultâneos por outro terminal enquanto o instalador grava. Se houver erro, copie o log e a última etapa; não reinicie repetidamente nem misture sequências manuais.

## 5. Primeiro boot e verificação

Aguarde inicialização e expansão previstas. Configure senha/bloqueio, rede e atualizações pelo método do sistema escolhido. Se obtiver terminal:

```bash
cat /etc/os-release
uname -a
df -h
```

Essas consultas verificam distribuição, kernel e espaço. Troque credenciais padrão conforme a imagem; não use as de outra distribuição por hábito. Teste Wi-Fi, áudio, carga, entrada e vídeo externo. Ter “Display out” no catálogo não certifica seu hub, cabo e perfil de energia.

## Erros e alternativas

| Problema | Ação fundamentada |
|---|---|
| Não detecta FP4 | Confirme cabo, ADB/driver/permissões e modo atual |
| Instalador pede desbloqueio já realizado | Consulte variável e logs; não repita operação destrutiva para diagnosticar |
| Não inicializa depois de concluir | Confira base original, variante e log da receita |
| Sistema desejado não é oferecido | Use a instalação vigente do port; não force opção antiga |
| Monitor não funciona | Primeiro confirme suporte, cabo e camada USB/display; não reflasheie firmware imediatamente |

Há um [relato no próprio repositório do instalador](https://github.com/ubports/ubports-installer/issues/4714) de detecção de desbloqueio travada num FP4. Ele ajuda a formular a hipótese, mas não prova que todo erro seja o mesmo. Compare versão, etapa e saída real antes de aplicar uma solução.

## Recuperação/rollback

Para voltar ao original, use o pacote FP4 e fluxo oficial que você preparou; poderá haver limpeza. Não copie `dtbo` ou partições de identidade de outro aparelho. Depois do boot original, teste sensores e funções antes de relock; siga as condições atuais do fabricante sobre versão e patch. Se não houver recuperação confirmada para seu estado, procure suporte.

## Testes finais e registro público

Reinicie sem computador, teste acesso administrativo e reconexão de hub/monitor/entrada. Registre modelo, firmware base, release, kernel, instalador, periféricos e funções confirmadas. Relate os resultados como teste da sua montagem, sem transformá-los em certificação de todos os FP4.

## Fontes e limites da verificação

Documental, **10/10/2026**. Fontes de fabricante, catálogo e configuração lidas; não houve flash físico. A wiki postmarketOS teve acesso automatizado limitado, portanto a instrução atual do port deve ser reconferida pelo leitor. As referências primárias estão ligadas nos passos acima; nenhum firmware ou código de desbloqueio é distribuído por esta base.
