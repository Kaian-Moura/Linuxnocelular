---
title: Celular com tela quebrada ou sem imagem
description: Planeje acesso autorizado e reconheça quando Linux nativo ainda não é viável.
sidebar_position: 4
last_verified: '2026-10-10'
---

Um aparelho com tela quebrada pode ser reutilizável, mas o projeto começa pela capacidade de controlá-lo com segurança. Não ter display funcional aumenta o risco de perder autenticação, aceitar o dispositivo errado ou ficar sem meio de recuperação após o flash.

**Dificuldade:** básica quando acesso já está autorizado; avançada quando não existe controle. **Resultado:** encontrar um caminho real de acesso e preparar uma alternativa antes de substituir Android. **Materiais:** cabo de dados conhecido, notebook, periféricos quando suportados e documentação da variante. Sem acesso autorizado ou interface de confirmação, pode ser necessário reparar a tela primeiro.

## Cenário A: Android e ADB já autorizado

Prepare [ADB passo a passo](../preparacao/adb-fastboot.md) e siga [download, extração e uso do scrcpy](../preparacao/scrcpy.md) quando o canal estiver autorizado. Os dois tutoriais ensinam Windows/macOS/Linux; não é necessário fazer root para o espelhamento comum nem instalar um Linux no telefone para testar esse acesso.

No notebook:

```sh
adb devices -l
```

`device` indica transporte autorizado; `unauthorized` exige aceitar a chave no aparelho; `offline` é outra falha. Não há um comando mágico no notebook que aceite a própria chave ADB em nome do usuário. Ativar depuração também exige um caminho legítimo de controle do Android.

Se autorizado, consultas como abaixo ajudam a identificar o aparelho:

```sh
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.product.cpu.abi
```

Ferramentas como [scrcpy](https://github.com/Genymobile/scrcpy) podem mostrar/controlar Android pelo notebook quando os requisitos são atendidos. Isso é espelhamento de Android, não instalação Linux. Proteção de conteúdo, estado de bloqueio, firmware e permissões podem limitar o uso; não prometa acesso a apps bancários ou telas protegidas.

Antes de mudar o sistema, faça backup acessível de seus dados e prepare recuperação do fabricante. Root já existente não substitui desbloqueio do bootloader nem autorização ADB. Fastboot pode funcionar com tela ruim, mas a confirmação do desbloqueio e a seleção dos botões continuam dependentes do modelo.

## Cenário B: display quebrado, touchscreen ou saída externa utilizáveis

Um mouse OTG pode ajudar a controlar Android se o aparelho já permite host e há imagem suficiente para saber onde clicar. Saída externa só existe se o modelo e a combinação suportam DP/MHL/outra tecnologia. USB-C presente, carregador funcionando e monitor aceso não comprovam vídeo.

Use [USB-C/hubs](../hardware/usb-c-hubs.md) e [vídeo](../hardware/video-hotplug.md) para conferir capacidades. Não faça desbloqueio/flash “às cegas” baseado em número fixo de cliques: menus, idioma e versão mudam. Se não consegue ler a confirmação, procure um caminho de display seguro antes de executar ação destrutiva.

ADB sem autorização, touchscreen inacessível e ausência de saída de vídeo podem tornar a etapa inicial inviável sem reparo temporário. Documentar esse limite é melhor que prometer uma técnica universal.

## Cenário C: Linux nativo já inicia sem display

Verifique se o port oferece USB networking, SSH e como as credenciais/chaves são provisionadas. Endereço e interface padrão variam; não copie um IP de tutorial sem consultar a imagem. No notebook, observe interfaces novas com `ip -br link` e mensagens de USB, usando a documentação específica para atribuição de endereço.

Se SSH por rede funciona, teste antes de ocupar a porta com o hub. Faça uma reserva DHCP ou anote como descobrir o destino legitimamente. Um telefone conectado à rede doméstica não fica automaticamente acessível pela rede da faculdade; use [acesso remoto protegido](../desktop/acesso-remoto.md).

O GNOME pode ser usado num monitor físico se o port suporta isso, ou numa sessão remota. São objetivos distintos. Um servidor SSH pode permanecer útil mesmo que GPU, touchscreen e vídeo externo não funcionem: terminal, automação e serviços exigem menos da pilha gráfica.

## Cenário D: aparelho sem saída de vídeo USB-C

As opções incluem interface pelo próprio display se ainda utilizável, desktop remoto por rede, servidor sem GUI ou Android/Termux controlado remotamente. Adaptador HDMI comum não acrescenta DP Alt Mode a um telefone sem essa saída. Soluções USB de display com driver próprio precisam de suporte real Linux/ARM e energia; não são equivalentes a um cabo passivo.

Para um “PC sem notebook obrigatório”, um monitor físico só é viável com um caminho de vídeo suportado ou receptor externo compatível. Uma sessão remota ainda roda no telefone, mas exige outro cliente para visualizar. O assistente [Escolha seu caminho](../escolha/index.mdx) ajuda a separar essas condições.

## Preparação de emergência e teste final

Antes de substituir Android, tenha: backup, variante/firmware identificados, recuperação documentada, entrada no bootloader compreendida, cabo de dados conhecido e acesso que não depende exclusivamente da tela quebrada. Teste boot e manutenção após desligar/religar e reconecte sem apagar autorizações ou chaves.

Não desative bloqueio/criptografia permanentemente só para facilitar assistência remota. Se usar autologin no Linux, registre seu impacto e considere credenciais fortes e acesso físico. Registros de diagnóstico não devem expor fotos, mensagens ou serial do aparelho.

Se perder acesso, classifique o estado em [boot/crash](boot-crash.md), em vez de concluir que está brickado. Reverter uma configuração de rede/desktop exige o canal alternativo preparado; sem ele, recuperação física é uma limitação real do projeto.

**Fontes e verificação:** **2026-10-10**; [ADB e autorização](https://developer.android.com/tools/adb), [scrcpy oficial](https://github.com/Genymobile/scrcpy), [OpenSSH](https://www.openssh.com/manual.html), [Type-C](https://docs.kernel.org/driver-api/usb/typec.html). Procedimentos de bootloader dependem do fabricante e não são substituídos por esta página.
