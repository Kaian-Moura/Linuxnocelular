---
title: Bootloader, root e autorização para substituir o sistema
description: Diferencie privilégios no Android, permissões de boot e políticas do fabricante.
sidebar_position: 3
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## O que você está verificando

O bootloader prepara o hardware e escolhe o que inicializar antes do sistema operacional. Ele pode verificar assinaturas e impedir imagens não autorizadas. **Root** é privilégio administrativo dentro de um sistema já iniciado. São controles diferentes: ter root no Android não prova que o bootloader aceite outro kernel; desbloquear o bootloader não instala root nem habilita drivers Linux.

A opção **Desbloqueio de OEM** geralmente permite solicitar uma mudança de estado, mas não é a mudança em si. A política pode depender de variante, operadora, conta, token e fabricante. A documentação AOSP descreve uma implementação de referência; cada aparelho deve ser conferido em sua fonte específica. [AOSP: bloqueio e desbloqueio](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking).

## Resultado, dificuldade e requisitos

Para executar a preparação e um método de desbloqueio documentado desde o início, use [Desbloqueio do bootloader, passo a passo](../preparacao/desbloquear-bootloader.md). Para conceder privilégios dentro do Android, use [root com Magisk](../preparacao/root-magisk.md). Esta página explica como avaliar a política e o estado; os dois tutoriais mostram as operações e seus pré-requisitos próprios.

Resultado esperado: registrar se seu modelo possui um método documentado de desbloqueio e qual o estado atual. Dificuldade: intermediária; **a execução do desbloqueio fica no tutorial específico do aparelho**, depois de backup. Materiais: [inventário](inventario.md), computador com Platform-Tools, cabo de dados, acesso aos botões e página oficial ou do port.

## Backup e riscos

Desbloquear normalmente provoca limpeza dos dados; religar a trava também pode limpar. Uma tela quebrada dificulta aceitar confirmações físicas e voltar a autorizar ADB após a limpeza. Planeje isso antes. Mudanças podem afetar DRM, aplicativos bancários, garantias e atualizações, conforme modelo e política. Não generalize consequências de um fabricante para outro.

Religar a trava sobre um sistema não aceito pelo fabricante pode impedir o boot. Downgrade pode encontrar proteção contra rollback, mesmo com bootloader desbloqueado. Não execute bloqueio, desbloqueio de partições críticas ou alteração de AVB como tentativa aleatória de corrigir vídeo ou rede.

## 1. Verifique a política, não apenas um comando da internet

Procure o código exato do aparelho no fabricante e na documentação do port. Registre:

1. Se sua variante é elegível.
2. Se exige código, conta ou período de espera.
3. Quais dados serão apagados e quais funções podem ser afetadas.
4. Como entrar no modo exigido e confirmar na tela.
5. Como restaurar o sistema e se é permitido religar a trava.

Como exemplos de dependência real, a [Sony Open Devices](https://opendevices.sony.net/aosp-on-xperia-open-devices/get-started/unlock-bootloader) exige elegibilidade e código para determinados Xperia e identifica variantes sem desbloqueio. A [Fairphone](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-and-re-lock-the-bootloader) distingue gerações e alerta para dados e rollback. Essas páginas não autorizam o mesmo procedimento em um OnePlus ou Samsung.

## 2. Consulte o estado em Android

**Local: computador; somente leitura.**

```bash
adb shell getprop ro.oem_unlock_supported
adb shell getprop ro.boot.flash.locked
adb shell getprop ro.boot.verifiedbootstate
```

Registre os valores brutos. Em implementações conformes, `ro.boot.flash.locked` diferencia bloqueado/desbloqueado; `verifiedbootstate` descreve o estado de verificação do boot. Porém, propriedades ausentes, ROMs modificadas e implementações de fabricante exigem confirmação adicional. Um retorno vazio não significa permissão concedida. Não use `adb root` como teste equivalente: aparelhos comerciais frequentemente recusam esse comando mesmo quando existe outra solução de root.

## 3. Consulte o modo de boot, quando necessário

Só faça esta transição se já souber voltar ao Android, tiver botões utilizáveis e não depender de uma aplicação aberta:

```bash
adb reboot bootloader
fastboot devices
fastboot getvar product
fastboot getvar current-slot
fastboot getvar is-userspace
```

`adb reboot bootloader` reinicia e interrompe os aplicativos. Os comandos `getvar` são consultas; fabricantes podem retornar `unknown variable`. `is-userspace: yes` identifica fastbootd quando implementado; não é o mesmo modo de baixo nível do bootloader. A/B e fastbootd são explicados em [ADB e Fastboot](../preparacao/adb-fastboot.md).

Alguns modelos oferecem `getvar unlocked`; outros usam consultas OEM diferentes. Não existe uma consulta de desbloqueio garantida para todas as marcas. Use a consulta citada pelo fabricante e confirme a indicação na tela. Um `getvar` não suportado não é justificativa para tentar o comando destrutivo de desbloqueio.

Para sair do fastboot, se o aparelho e o procedimento suportarem:

```bash
fastboot reboot
```

O retorno deve ser o sistema instalado. Isso não apaga dados, mas encerra a sessão do modo de manutenção.

## Por que não existe aqui um botão “desbloquear qualquer celular”

O comando AOSP `fastboot flashing unlock` é uma operação real, potencialmente destrutiva, e não um teste de compatibilidade. Não o colocamos como etapa universal executável. Outros modelos usam protocolo e autorização diferentes. Primeiro conclua [backup](../preparacao/backup.md), confirme sua variante e consulte o tutorial do projeto/fabricante escolhido. Root e exploits não constituem um método universal, estável ou seguro para contornar uma política sem suporte.

## Erros, alternativas e recuperação/rollback

Se Fastboot não aparecer, volte ao diagnóstico USB do computador. Se a permissão OEM não existir, investigue elegibilidade e política atual, sem comprar códigos de origem duvidosa. Se o fabricante não permitir desbloquear sua variante, a alternativa reproduzível é manter Android e usar Termux/PRoot, ou utilizar o telefone como cliente de outra máquina.

Após uma consulta, basta voltar ao sistema; nenhuma imagem foi alterada. Após um desbloqueio executado em outro tutorial, não existe rollback dos dados apagados: restaure seu backup externo. Não religue a trava apenas para esconder o aviso de boot.

## Testes finais e próximos passos

Você deve ter: fonte de elegibilidade, estado observado, procedimento de retorno, dados externos conferidos e uma explicação de como confirmar no aparelho. Se faltar um desses elementos, permaneça no diagnóstico. Caso estejam completos, avance para [instalação nativa](../nativo/visao-geral.md) ou mantenha Android de acordo com seu objetivo.

## Fontes e limites da verificação

Verificação documental em **10/10/2026**; desbloqueio não executado em aparelhos do leitor.

- [AOSP: Bootloader](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking).
- [AOSP: Android Verified Boot](https://source.android.com/docs/security/features/verifiedboot/avb).
- [AOSP: Fastbootd](https://source.android.com/docs/core/architecture/bootloader/fastbootd).
- Páginas específicas Sony e Fairphone citadas acima: exemplos de condições particulares, não modelos universais.
