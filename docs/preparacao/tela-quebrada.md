---
title: Planeje o acesso com tela ou touchscreen quebrados
description: O que é possível por ADB, monitor e SSH e quando um reparo físico é indispensável.
sidebar_position: 6
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Resultado e limite deste guia

O objetivo é obter um canal de controle confiável antes de trocar o sistema. Dificuldade: variável. Você precisa do aparelho que possui legitimamente, cabo de dados, computador, eventualmente hub/periféricos compatíveis e documentação da variante. Não há método universal para passar a autorização ADB ou desbloquear dados criptografados sem interação legítima.

Tela apagada pode significar painel quebrado, suspensão, problema de boot ou falta de energia. Tela acesa sem toque é outra situação. Identificar a diferença evita substituir um sistema funcional quando o problema é físico. Telefone inchado, excessivamente quente ou com conector danificado exige reparo, não tentativa contínua de boot.

## 1. Identifique os canais que já existem

| Situação | Caminho viável | Limite |
|---|---|---|
| ADB foi autorizado no mesmo computador | Shell e espelhamento Android | Pode perder autorização após limpeza |
| Tela visível, toque quebrado | Mouse USB/OTG, se suportado | Porta pode ficar ocupada; PIN e diálogos ainda existem |
| Saída de vídeo documentada | Monitor e periféricos | USB-C não garante DisplayPort |
| SSH já configurado em Linux | Administração por rede | IP, serviço e autenticação precisam funcionar após boot |
| Sem imagem, sem ADB/SSH autorizado | Reparar tela ou acesso físico suportado | Não há promessa de acesso remoto inicial |

Root não resolve automaticamente a falta da autorização ADB. O Android protege dados quando bloqueado; ferramentas de acesso remoto também costumam exigir permissões na tela. Não planeje instalar um aplicativo sem ter como aceitar o que ele requer.

## 2. Verifique ADB antes de qualquer desbloqueio

**Local: computador com ferramentas preparadas.**

```bash
adb devices -l
adb shell getprop sys.boot_completed
```

Se o alvo estiver em `device`, o shell está autorizado; `sys.boot_completed` pode indicar que o Android terminou parte de sua inicialização. Um valor vazio em recovery ou Linux não tem o mesmo significado. Se estiver `unauthorized`, é preciso aceitar no telefone. Reiniciar o servidor ADB não aprova a chave.

Se o shell funcionar, siga [download, instalação e primeira execução do scrcpy](scrcpy.md), a partir do [projeto oficial](https://github.com/Genymobile/scrcpy). A consulta e a execução iniciais são:

```bash
scrcpy --version
scrcpy
```

Ele mostra e controla o **Android que continua em execução**. Não instala Linux nem cria saída DisplayPort. O modo OTG do scrcpy pode oferecer entrada sem ADB em condições suportadas, mas **não oferece espelhamento de vídeo**; portanto não resolve sozinho um painel inteiramente invisível. [Documentação de OTG](https://github.com/Genymobile/scrcpy/blob/master/doc/otg.md).

Se o toque for o único defeito, um mouse físico pode permitir autorizar ADB, configurar Wi-Fi e exportar dados. Teste a combinação no Android original. Hubs e adaptadores devem suportar o papel host e fornecer energia suficiente. Evite mudar simultaneamente alimentação, monitor e teclado durante um diagnóstico.

## 3. Prepare uma segunda via de acesso

Quando o hub ocupa a única porta do telefone, o computador deixa de ter a conexão USB direta. Planeje Wi-Fi ou rede cabeada antes. Em Android compatível, depuração sem fio exige pareamento e configuração na tela; use apenas rede confiável e desligue ao terminar. Não abra ADB sem autenticação na internet.

Em Linux nativo, confirme SSH por Wi-Fi com o telefone no cabo e então no hub. O hostname pode funcionar por mDNS ou não; registre o endereço obtido no roteador e a chave de host local. Um ping sem resposta não prova desligamento, e um ping com resposta não prova que SSH esteja ativo.

Faça três testes separados: acesso após iniciar, acesso após reiniciar e acesso após trocar cabo por hub. O último verifica a dependência da rede USB. Não publique sua senha de Wi-Fi no guia do aparelho nem inclua chaves privadas em scripts de instalação.

## 4. O que muda ao instalar outro sistema

Após desbloqueio, os dados e as autorizações podem ser apagados. O novo sistema pode não oferecer vídeo externo, toque, rede ou desbloqueio do disco. Escolher criptografia sem um método funcional de entrada na inicialização pode deixar um aparelho com tela quebrada inacessível, mesmo se SSH funcionava depois do boot.

Confirme na página do port como fornecer usuário, senha/chave, rede e console. Teste isso em uma imagem ou boot temporário **somente quando suportado pelo modelo**. Se a única recuperação exige confirmação numa tela ilegível, avalie reparar o display antes de substituir Android.

Um desktop remoto de emergência deve ser identificado como remoto. VNC e RDP podem criar outra sessão em vez de mostrar a sessão física. Ver uma interface no notebook não confirma que o monitor externo recebe o mesmo desktop, nem que o telefone funciona sem notebook.

## Backup, erros, alternativas e recuperação/rollback

Faça [backup externo](backup.md) antes de desbloquear. Se ADB estiver autorizado, aproveite esse estado para exportar dados antes de qualquer limpeza. Se não houver autorização ou saída de vídeo, um reparo temporário do display pode ser o caminho mais seguro e rápido para recuperar dados e preparar o projeto.

Se a imagem remota cair após conectar o hub, investigue rede e USB antes de reiniciar o compositor. Se SSH funcionar mas o display ficar preto, o sistema ainda pode estar ativo: recolha logs, estados de conectores e processos. Se o aparelho entrar em modo de crash, use [triagem](../recuperacao/triagem.md); não envie resets USB repetidos a um kernel travado.

O rollback de uma sessão scrcpy é encerrá-la; Android continua instalado. O rollback de uma configuração de rede exige o acesso alternativo que você acabou de testar. Se a alteração interromper todos os canais, não há comando remoto que possa recuperar um daemon que não está em execução.

## Testes finais

Antes de instalar, comprove que consegue identificar o aparelho, salvar dados, operar a interface ou terminal, voltar de manutenção e acessar o sistema após um reinício. Se depender de monitor, valide-o fisicamente; screenshot remoto não basta. Se faltar qualquer etapa crítica, mantenha o sistema atual até resolver o acesso.

## Fontes e limites da verificação

Documentação consultada em **10/10/2026**; estado físico e suporte do aparelho precisam ser testados.

- [Android: autorização ADB e depuração sem fio](https://developer.android.com/tools/adb).
- [scrcpy: requisitos e controle Android](https://github.com/Genymobile/scrcpy).
- [scrcpy: modos de conexão](https://github.com/Genymobile/scrcpy/blob/master/doc/connection.md).
- [scrcpy: OTG](https://github.com/Genymobile/scrcpy/blob/master/doc/otg.md).
