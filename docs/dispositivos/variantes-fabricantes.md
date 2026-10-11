---
title: Fabricantes, variantes e guias de referência
description: Como pesquisar o procedimento correto sem extrapolar de marca, SoC ou nome comercial.
sidebar_position: 2
last_verified: '2026-10-10'
---

Marca e processador não são uma unidade suficiente de compatibilidade. Um mesmo nome comercial pode ter placa, rádio, bootloader, região e política de desbloqueio diferentes. Esta página fornece **roteiros de verificação e fontes**, não promete Linux nativo para todos os modelos das famílias listadas.

**Dificuldade:** básica para investigar; avançada para instalar um port incompleto. **Resultado:** uma ficha do dispositivo com evidências, caminho de instalação e recuperação corretos. **Pré-requisitos:** acesso autorizado ao aparelho e identidade exata. Não baixe um firmware só porque o nome parece parecido.

## Identificar sem publicar serial ou IMEI

No Android com ADB autorizado:

```sh
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.product.board
adb shell getprop ro.product.cpu.abi
adb shell getprop ro.build.fingerprint
```

Compare com Ajustes → Sobre o telefone, etiqueta e documentação. A fingerprint identifica build; revise dados antes de publicar. IMEI/serial ajudam alguns fabricantes em processos privados, mas não devem aparecer em issues públicas. Em Linux nativo, `uname -m`, `/proc/device-tree/model` quando exposto e o pacote do aparelho ajudam a conferir identidade.

## Google Pixel/Nexus

O Google fornece [factory images](https://developers.google.com/android/images) e [full OTA images](https://developers.google.com/android/ota) para aparelhos listados. São materiais de **restauração Android**, não imagens Linux. Variantes e política de desbloqueio precisam ser conferidas no aparelho/procedimento. Leia os avisos específicos de bootloader/anti-rollback e slots da versão: a documentação atual possui exceções de atualização que tornam downgrade perigoso.

Uma OTA completa pode ser alternativa de restauração em condições documentadas, sem o mesmo fluxo da factory image. Não generalize isso para outra marca ou para qualquer estado de partições. Relock só após sistema original íntegro e procedimento aplicável; bloquear bootloader com Linux/custom boot pode impedir boot.

## Sony Xperia

O programa [Sony Open Devices](https://opendevices.sony.net/aosp-on-xperia-open-devices/get-started/unlock-bootloader) documenta seleção de aparelhos, código e limitações. **AOSP support não é suporte Linux desktop.** A página diferencia variantes e cita modelos norte-americanos sem unlock, evidenciando por que o SKU importa.

A Sony informa apagamento de dados e possíveis efeitos de perda de chaves DRM/funcionalidades. Examine especificamente o modelo e firmware; não presuma que restaurar Android recupera todos os recursos afetados. O código de desbloqueio e identificadores devem permanecer privados. Depois procure um port Linux distinto e sua matriz de hardware.

## Xiaomi, Redmi e POCO

Use [a página oficial Mi Unlock](https://en.miui.com/unlock/download_en.html) e a documentação oficial correspondente à região e ao sistema. Permissões, contas, elegibilidade e prazos podem mudar entre MIUI/HyperOS e regiões. Um relato antigo de “esperar determinado número de horas” não estabelece a regra atual para seu aparelho.

Não recomende bypass de conta, ferramenta não oficial ou firmware de outra região para obter desbloqueio. Confirme variantes/codinomes, política de anti-rollback e restauração antes de procurar port. POCO X6 Pro, por exemplo, não pode herdar os procedimentos do OnePlus 9 Pro: ser Android ou ter muita RAM não iguala controlador, kernel ou bootloader.

## Samsung Galaxy

Identifique modelo completo e região/operadora; não assuma que todos os Galaxy oferecem unlock ou Fastboot padrão. O [material oficial Knox](https://www.samsung.com/us/business/solutions/samsung-knox/) descreve medição de integridade e Warranty Bit, incluindo consequências para serviços. Esse mecanismo não equivale a uma avaliação jurídica universal de garantia.

Consulte suporte oficial e guia mantido para o SKU antes de Download Mode, recovery ou restauração. DeX, quando documentado para o modelo, é uma alternativa de desktop **mantendo Android**. Não é GNOME nativo e não prova que o port Linux expõe a mesma saída de vídeo. Restaurar firmware não é garantia de reverter mudanças irreversíveis de segurança.

## OnePlus e outros fabricantes

Consulte fontes oficiais do kernel e documentação do modelo, depois o port exato. O [estudo OnePlus 9 Pro](oneplus-9-pro.md) mostra uma linha vendor customizada diferente do port público. Compartilhar Snapdragon não torna os módulos intercambiáveis. Ferramentas de emergência Qualcomm podem exigir autenticação/fonte autorizada; loaders desconhecidos não são plano de recuperação.

Para marcas sem um procedimento confiável de unlock/restore ou aparelhos gerenciados, trate essa lacuna como bloqueio do caminho nativo. [Termux](../android/termux.md), [PRoot](../android/proot-distro.md), serviços Android e acesso remoto podem aproveitar o hardware sem substituir o boot. Não prometa root ou desbloqueio por exploit não documentado.

## Pesquisar suporte Linux corretamente

1. Busque modelo e codinome nos catálogos da distribuição, como [UBports devices](https://devices.ubuntu-touch.io/) e wiki/pmaports do postmarketOS.
2. Abra a página individual e compare variantes, base Android exigida, recursos e recuperação.
3. Confira atividade do pacote/port, mantenedor, issues e data da evidência. Uma categoria “testing” ou um commit de boot não certifica desktop completo.
4. Procure código/patch relevante para kernel/DT/USB/GPU. Leia o escopo; um patch de SoC não cobre automaticamente todas as placas.
5. Se acesso ao site falhar, declare “não confirmado”; não use índice de busca antigo como estado atual.

Teste só o que cabe ao seu hardware e registre resultados em [uma ficha](registrar-dispositivo.md). A ficha pode concluir que Linux sobre Android ou servidor sem GUI é o caminho viável. Essa é uma decisão técnica válida, não uma falha do projeto.

## Verificação final e segurança

Você deve sair desta investigação com identidade, fonte de unlock quando aplicável, port/revisão, recursos necessários, backup e recuperação compatível. Se faltar uma dessas condições para um flash seguro, não avance. Os guias gerais explicam ferramentas, mas não substituem as instruções individuais de instalação.

**Fontes e verificação:** **2026-10-10**; Google factory/OTA, Sony Open Devices, Samsung Knox, Mi Unlock e UBports, vinculados acima. Não foi instalado/testado Linux em todos os modelos dessas marcas; esta página verifica fontes de pesquisa e particularidades documentadas, não publica uma lista universal de compatibilidade.
