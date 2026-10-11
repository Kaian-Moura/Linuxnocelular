---
title: Modos de emergência, EDL e limites de recuperação
description: Identifique interfaces e requisitos sem presumir que uma ferramenta recupera qualquer telefone.
sidebar_position: 3
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Visão geral e resultado esperado

Modos de emergência tentam oferecer recuperação quando o boot normal falha. São implementações específicas de plataforma/fabricante, não um Linux de manutenção universal. Dificuldade: avançada. O resultado esperado é identificar o modo, reunir informações e selecionar um procedimento legítimo, ou reconhecer quando a recuperação exige assistência.

Uma indicação Qualcomm CrashDump não é equivalente a um recovery que aceita qualquer firmware. “Aparece no USB” confirma uma interface, não a possibilidade de escrever armazenamento ou extrair dados. Um telefone que inicia numa interface de emergência ainda pode precisar de programmer assinado e autenticação do fabricante.

## Pré-requisitos, materiais e backup

Você precisa de modelo/variante exatos, histórico da falha, computador/cabo direto, energia adequada, guia do fabricante/port e fonte verificada de qualquer pacote. Se os dados não foram copiados, uma gravação de recuperação pode apagá-los. É frequentemente impossível recuperar arquivos criptografados só lendo blocos sem chaves válidas.

Não abra o telefone nem faça curto em pontos de teste por uma receita de outra placa. Não use cabos modificados como procedimento universal. Intervenções físicas exigem guia correto, ferramenta e conhecimento de reparo; bateria e componentes podem ser danificados.

## 1. Identifique o que o computador realmente vê

Comece pelo [guia ADB/Fastboot](../preparacao/adb-fastboot.md) para instalar as ferramentas e localizar o Gerenciador de Dispositivos no Windows. No computador Linux, o comando `lsusb` vem do pacote `usbutils`; a [caixa de ferramentas](../diagnostico/instalar-ferramentas.md) ensina consultar e instalar esse pacote. Instalar um programa de diagnóstico não instala um programmer compatível nem concede autorização OEM.

No computador Linux:

```bash
lsusb
lsusb -d 05c6:
```

O segundo limita a fabricantes USB que usam o identificador Qualcomm; não prova o modelo nem o tipo de recuperação. IDs `9008` e `900e` são associações comuns a emergência/crash, mas não devem ser a única identificação. Leia a descrição, interface e mensagens do aparelho; IDs e implementações variam.

No Windows, consulte nome e identificadores de hardware no Gerenciador de Dispositivos. Um driver com “QDLoader” no nome não é confirmação de um procedimento de flash disponível. Não substitua drivers de todos os USBs com Zadig; uma ferramenta pode exigir backend/driver diferente da ferramenta OEM.

Registre informações sem publicar serial/IMEI. Se Fastboot ainda responde, prefira investigar esse caminho documentado antes de forçar um modo mais baixo. Se apenas Android recovery responde, use a recuperação compatível desse ambiente.

## 2. Entenda Qualcomm EDL, Sahara e Firehose

Em plataformas Qualcomm, EDL é um caminho de manutenção baixo nível. O protocolo inicial pode receber um **programmer/flash loader**, que então implementa operações de armazenamento. O programmer precisa ser aceito pela segurança do aparelho e conhecer seu hardware. Imagens, mapa de LUN/partições e tabelas de gravação também devem corresponder.

O [QDL do projeto linux-msm](https://github.com/linux-msm/qdl) implementa comunicação com interfaces EDL. O fato de ele detectar uma interface não autoriza usar um programmer de outro smartphone. A [documentação 96Boards](https://github.com/96boards/documentation/blob/master/consumer/guides/qdl.md) explica o protocolo em placas de desenvolvimento; essas instruções não certificam desbloqueio/recuperação de aparelhos comerciais.

Se QDL já estiver instalado numa versão que oferece a consulta, é possível examinar a ajuda e listar dispositivos:

```bash
qdl --help
qdl list
```

São consultas da ferramenta atual; versões antigas podem não ter `list`. **Não fornecemos aqui uma linha de gravação com `prog_firehose` e XMLs**, pois esses arquivos não foram verificados para o seu aparelho. Uma escrita incorreta pode substituir bootloaders, GPT ou dados de calibração. Também não oferecemos instruções de bypass de autenticação OEM.

## 3. Separe recuperação de firmware de análise de crash

Se o telefone caiu em CrashDump após conectar um hub ou carregar um módulo, reflashear todo o firmware pode ser desnecessário. Tente o retorno documentado ao sistema conhecido e recolha pstore/ramoops quando disponível. [Triagem](triagem.md) explica como preservar essas evidências.

Um modo de crash pode exportar dumps de memória. Dumps podem conter credenciais e dados privados; não envie um arquivo inteiro para um serviço desconhecido. Um desenvolvedor normalmente precisa do trecho pertinente, versão e stack trace, com dados sensíveis removidos.

Se o sistema foi realmente substituído por arquivos incompatíveis e não resta bootloader funcional, recuperação de firmware pode ser o caminho. Porém, é preciso confirmar a ferramenta, programmer, pacote e autorização exatos. Sem esses requisitos, este guia registra **recuperação não demonstrada**, não “dispositivo certamente recuperável”.

## 4. Outros fabricantes e protocolos

Samsung pode usar Download Mode e ferramentas próprias; Fastboot genérico não deve ser presumido. Smart Switch documenta certas falhas de atualização que produziram uma opção/código de recuperação. Consulte [restauração por fabricante](restaurar-android.md) e a elegibilidade do modelo.

Plataformas MediaTek e outros SoCs também têm modos e ferramentas de manutenção. Sem documentação primária, pacotes e condições confirmadas para a variante, não publicamos passos de flash ou promessa de compatibilidade. O nome do SoC não basta para escolher um download de ferramenta.

Fabricantes podem restringir operações a centros de serviço, contas autorizadas ou aparelhos elegíveis. Isso é uma limitação real do projeto de reaproveitamento. Não é resolvida por instalar mais repositórios na distribuição Linux.

## Erros comuns e alternativas

- **ADB não detecta EDL:** esperado; não há `adbd` Android operando ali.
- **Programmer não é aceito:** confirme autorização/assinatura/modelo; não force outro sem evidência.
- **Ferramenta vê o telefone, mas não armazenamento:** a fase inicial e o driver de flash são etapas diferentes.
- **Guia manda modificar GPT:** exige mapa original e justificativa; não copie XML de outra variante.
- **Pacote de emergência só existe em mirror:** verifique procedência e licença; disponibilidade não garante legitimidade.

Quando não existe método verificável, procure suporte do fabricante/mantenedor e considere assistência. Essa saída é preferível a novas alterações sem evidência que reduzam a chance de recuperação.

## Recuperação/rollback e testes finais

Consultas não exigem rollback. Sair do modo de emergência depende do aparelho e de ele ainda possuir software inicializável; um reset não recria partições. Após recuperação autorizada, confirme modelo, boot, rede, carga e funções originais. Não sobrescreva calibração/identidade de outro telefone. Guarde procedimento, origem dos arquivos e resultado, distinguindo recuperação observada de apenas documentada.

## Fontes e limites da verificação

Documental em **10/10/2026**, sem uso de programmer em aparelho do leitor.

- [linux-msm: QDL](https://github.com/linux-msm/qdl).
- [96Boards: protocolo de recuperação Qualcomm](https://github.com/96boards/documentation/blob/master/consumer/guides/qdl.md), contexto de placas de desenvolvimento.
- [Samsung: recuperação de atualização Smart Switch](https://update.kies.samsung.com/SmartSwitchPC_recovery_guide/firmware/emergencyrecovery/), condições específicas.
- [Linux: ramoops](https://docs.kernel.org/admin-guide/ramoops.html).
- [AOSP: proteção de boot/versão](https://source.android.com/docs/security/features/verifiedboot).
