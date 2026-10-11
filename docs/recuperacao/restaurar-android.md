---
title: Restaure o firmware original com condições verificadas
description: Como escolher pacotes e ferramentas de fabricante, distinguir OTA de imagem e evitar rollback inseguro.
sidebar_position: 2
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Resultado esperado e pré-requisitos

O objetivo é retornar a um sistema original compatível quando a instalação Linux falhar ou deixar de atender seu uso. Dificuldade: intermediária/avançada. Requisitos: variante exata, fonte legítima do firmware, ferramenta/método compatíveis, bateria e cabo adequados, acesso ao modo exigido e backup fora do telefone.

Uma reinstalação pode apagar tudo. Voltar a Android não restaura automaticamente aplicativos, chaves, DRM, modem/calibração nem o estado de segurança anterior. **Não existe um pacote “Android original para qualquer ARM64”.**

## Tipos de pacote e por que isso importa

| Tipo | Uso usual | O que não presumir |
|---|---|---|
| OTA incremental | Atualizar a partir de uma versão exata | Não equivale a restauração completa após substituir partições |
| OTA completa | Atualização/reinstalação pelo mecanismo aceito | Pode exigir recovery/origem e restringir downgrade |
| Imagem de fábrica | Restaurar conjuntos de imagens via ferramenta | Pode limpar dados e exigir bootloader permitido |
| Pacote de emergência | Recuperação em protocolo específico | Pode precisar de autenticação e programmer específico |
| Imagem de boot isolada | Restaurar kernel/ramdisk daquele estado | Não reconstrói todo o firmware |

O arquivo pode conter scripts com apagamentos e alterações de slots. Leia o plano do fabricante; não escolha pela extensão `.zip`. Um checksum publicado comprova integridade quando sua origem é confiável, mas não compatibilidade com o aparelho.

## 1. Identifique o estado e a versão de referência

Use a [triagem](triagem.md) para saber se existe Android, recovery, Fastboot, fastbootd ou modo de emergência. Compare com sua ficha: modelo, região/operadora, firmware de base, patch e slots.

Se Fastboot responde, consultas suportadas ajudam:

```bash
fastboot devices
fastboot getvar product
fastboot getvar current-slot
fastboot getvar is-userspace
```

Elas não dizem que qualquer imagem será aceita. Não use `set-active`, `erase`, `format`, `flashall` ou lock como consultas. Em algumas implementações, variáveis faltam; use documentação e mensagem física do modo.

## 2. Localize uma fonte primária e confirme elegibilidade

### Google Pixel/Nexus

A [página oficial de imagens de fábrica](https://developers.google.com/android/images) identifica aparelhos e versões. A [página de OTA completas](https://developers.google.com/android/ota) oferece outro método, com requisitos próprios. A Google alerta para transições específicas de rollback/slots em determinadas gerações. Leia os avisos **da versão e geração atuais**, não apenas um tutorial antigo que mostra `flash-all`.

Uma OTA pode evitar limpeza/desbloqueio em cenários suportados; isso não garante que consiga restaurar um layout que uma distribuição alterou. Consulte as instruções do pacote e o estado do aparelho. Não publique firmware redistribuído neste repositório.

### Fairphone

O [guia oficial de instalação manual](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone) descreve métodos e pacotes por modelo. Na consulta, diferencia Fastboot de OTA sideload e restringe a opção OTA a modelos/cenários específicos. Use o script e pacote oferecidos para o seu código de modelo; não adapte um script FP3 para FP4.

O fabricante informa requisitos de carga e alerta para perda de dados. A [página de bootloader](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-and-re-lock-the-bootloader) destaca riscos de relock com nível de patch antigo. Essa condição importa ao retornar de um port que exigia Android de base mais antigo.

### Samsung

A Samsung documenta recuperação de certas falhas de atualização por **Smart Switch**, incluindo código de recuperação emitido durante uma atualização que falhou. Veja o [guia oficial](https://update.kies.samsung.com/SmartSwitchPC_recovery_guide/firmware/emergencyrecovery/). Não interprete esse fluxo como ferramenta universal para qualquer Samsung com Linux instalado; a elegibilidade e versão do aplicativo precisam ser confirmadas.

Nem todo Samsung implementa Fastboot convencional. Download Mode, firmware e nomes de partição têm regras próprias. Ferramentas comunitárias podem ser úteis em aparelhos documentados, mas não substituem um procedimento verificado da variante.

### Sony, OnePlus e outras marcas

Consulte suporte e repositórios oficiais, além da página do port. A [Sony informa consequências do desbloqueio](https://opendevices.sony.net/aosp-on-xperia-open-devices/get-started/unlock-bootloader), inclusive funções/chaves que podem não voltar simplesmente com firmware original.

**Lacuna explícita:** este guia não oferece um pacote de emergência OnePlus 9 Pro autenticado e verificado para todas as variantes. Não indica um MSMDownloadTool, programmer ou mirror como restauração universal. Se a fonte oficial não disponibilizar o necessário, registre isso antes de instalar e procure o mantenedor/assistência. A existência de um arquivo em fórum não basta para classificá-lo como oficial.

## 3. Confira o pacote antes de executar

No computador, com o nome real do arquivo publicado:

```bash
file PACOTE.zip
sha256sum PACOTE.zip
unzip -l PACOTE.zip
```

`PACOTE.zip` é marcador, não nome de um firmware fornecido. Use apenas para ZIP; outros formatos têm ferramentas próprias. Compare hash publicado e conteúdo esperado. Extraia em pasta nova, sem sobrescrever backups. Leia scripts de gravação como código privilegiado: quais partições apagam, quais slots usam, se bloqueiam o bootloader e se verificam modelo.

Não retire uma proteção de produto do script para “fazer passar”. Não use `--force` para contornar incompatibilidade. Se o script não consegue reconhecer a variante, resolva a origem do pacote e a detecção antes.

## 4. Execute o fluxo do fabricante e valide

Mantenha cabo direto e alimentação estável. Use o modo e ferramenta requeridos. Se for sideload, ative o modo no recovery e forneça o **pacote compatível**; se for imagem de fábrica, siga o script/procedimento daquele pacote. Esta página não publica comandos de flash independentes porque destinos, formato e condições mudam entre fabricantes.

Preserve o log. Depois do boot, confira modelo, versão, Wi-Fi, áudio, câmera, carga e dados de rede originais. Troque configurações/credenciais necessárias e restaure seus arquivos somente depois da referência estar funcional. Se o sistema reportar outro modelo ou firmware incompatível, não religue a trava.

## Relock não é uma etapa universal

AVB e proteção contra rollback podem impedir imagens não assinadas ou antigas. Relock pode apagar dados e inutilizar um estado misto. Só considere religar a trava quando o fabricante/port explicitamente permitirem, todos os componentes necessários estiverem no estado esperado e o sistema original correto tiver inicializado. Esconder uma mensagem de boot não justifica a operação.

## Erros, alternativas e rollback

Se falhar uma transferência, confira cabo/mode/log antes de repetir. Se faltar partição ou tamanho divergir, investigue layout alterado e receita de restauração, em vez de criar partições pelo palpite. Se pedir autenticação OEM, não procure bypass; use o suporte legítimo. Quando não existe recuperação verificada, a alternativa pode ser assistência técnica.

Não há rollback para dados apagados sem backup. Um pacote anterior pode ser bloqueado por downgrade. Após falha no meio da gravação, preserve o modo de manutenção e procure o fluxo de retomada específico antes de reiniciar repetidamente.

## Testes finais

Comprove boot e reboot, modelo/versão corretos, rede, carga e funções originais. Registre se o bootloader ficou desbloqueado e as limitações remanescentes. Só então prepare uma nova tentativa Linux, mudando uma variável por vez.

## Fontes e limites da verificação

Documental em **10/10/2026**; ferramentas não executadas em todos os fabricantes. Fontes específicas estão citadas nas seções. Para os mecanismos comuns:

- [AOSP: Verified Boot e proteção de versão](https://source.android.com/docs/security/features/verifiedboot).
- [AOSP: partições dinâmicas](https://source.android.com/docs/core/ota/dynamic_partitions/implement).
- [AOSP: A/B](https://source.android.com/docs/core/ota/ab).
