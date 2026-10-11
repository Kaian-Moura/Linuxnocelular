---
title: USB-C, OTG, hubs e alimentação PD
description: Entenda os papéis de dados e energia e identifique o que cada porta realmente oferece.
sidebar_position: 1
last_verified: '2026-10-10'
---

USB-C descreve o conector. Ele não garante saída de vídeo, determinada velocidade, carregamento rápido ou capacidade de carregar enquanto controla periféricos. A transformação em mini-PC depende da combinação **telefone + kernel + cabo + hub + fonte + monitor**, e cada elemento precisa ser identificado.

**Escopo:** Linux nativo com acesso ao terminal. No Android, a negociação continua sob o kernel e os serviços Android; um ambiente PRoot não assume o controle desses componentes. **Dificuldade:** intermediária. **Resultado esperado:** uma montagem documentada, com papéis e limitações conhecidos. Os comandos iniciais apenas consultam o sistema.

## Três funções diferentes

| Função | O que significa | Como verificar |
|---|---|---|
| Host USB | O telefone enumera teclado, mouse e armazenamento | Árvore `lsusb -t` e logs de enumeração |
| Fonte ou consumidor de energia | O telefone fornece ou recebe energia | Classe power_supply e contrato/papel Type-C, quando expostos |
| Saída de vídeo | Um caminho de display transporta pixels | Documentação do modelo, negociação DP e conector DRM |

Em USB tradicional, o host normalmente fornece energia. Com USB-C e Power Delivery, um aparelho pode ser **host de dados e consumidor de energia** após a negociação adequada. Isso precisa ser implementado no controlador, firmware e driver. A inscrição PD no hub não acrescenta suporte ausente ao kernel do telefone. Consulte a [classe Type-C do kernel](https://docs.kernel.org/driver-api/usb/typec.html).

OTG permite que um aparelho assuma funções de host ou dispositivo, conforme sua implementação. No notebook, o telefone pode ser um dispositivo USB de rede; no hub, deve assumir host. Mudar de montagem implica mudar de papel, e não apenas trocar um cabo.

## Materiais e preparação

Antes de usar o terminal, prepare [ferramentas de USB e input](../diagnostico/instalar-ferramentas.md). Num primeiro teste, anote cada cabo e **a função da porta** em que entra: cabo principal do hub no telefone, HDMI na saída de vídeo, periférico em porta de dados, carregador na entrada PD somente se a montagem suportar. Os diagramas do manual do hub e a documentação do telefone determinam quais funções existem; o formato USB-C sozinho não determina isso.

Use um hub cuja documentação distinga entrada PD, cabo upstream ligado ao telefone, portas USB de dados e saídas de vídeo. Prefira uma fonte PD documentada e cabo com capacidade compatível. Uma porta USB-C marcada **Data, 5 Gbit/s** pode alimentar um monitor sem transmitir DisplayPort. Para vídeo nessa porta, o fabricante precisa declarar suporte de display naquele caminho específico.

Antes dos testes, carregue o telefone, faça backup dos dados e configure [acesso de manutenção](../desktop/acesso-remoto.md). Registre modelo do hub, fonte, potência nominal, cabos e ordem de conexão. Se a porta do telefone for única, SSH por Wi-Fi permite observação durante o uso do hub; não suponha que ADB continue disponível.

## Diagnóstico passo a passo

1. **Identifique a topologia atual.**

   ```sh
   lsusb
   lsusb -t
   ls /sys/class/typec /sys/class/usb_role /sys/class/power_supply
   ```

   `lsusb` lista dispositivos enumerados; `-t` relaciona portas e drivers. Diretórios ausentes podem significar uma interface não implementada no kernel downstream, não inexistência do hardware.

2. **Leia papéis expostos sem escrever neles.**

   ```sh
   for port in /sys/class/typec/port*; do
     [ -d "$port" ] || continue
     for attr in data_role power_role power_operation_mode; do
       [ -r "$port/$attr" ] || continue
       printf '%s: ' "$port/$attr"
       cat "$port/$attr"
     done
   done
   for role in /sys/class/usb_role/*/role; do
     [ -r "$role" ] && { printf '%s: ' "$role"; cat "$role"; }
   done
   ```

   Um host de dados pode coexistir com sink de energia. Valores entre colchetes podem indicar a seleção atual entre opções. Atributos vendor podem ter outros nomes: encontre-os na fonte do driver, não por tentativa de escrita.

3. **Monte uma referência mínima.** Ligue só hub e mouse, depois HDMI com alimentação própria do monitor. Observe o kernel com `sudo dmesg -w` em outro terminal. Acrescente teclado após a referência funcionar. Anote a primeira diferença: hub desaparece? Apenas um periférico falha? DP permanece conectado?

4. **Compare energia já presente com energia inserida depois.** Só faça isso com montagem segura e acesso alternativo. Uma troca PD pode redefinir VBUS e reiniciar o hub. Registre antes e depois; não use os LEDs como prova de enumeração ou carga.

5. **Confirme carga e estabilidade.** Use [energia e bateria](energia.md), teste digitação/movimentos e confira [vídeo](video-hotplug.md). Um único atributo `online=1` não comprova que o saldo de energia da bateria é positivo.

## Erros comuns e limites

`-71` corresponde a EPROTO: falha de protocolo USB. Pode envolver sinal, energia, hub ou driver; o código isolado não identifica a causa. `-110` é timeout. Compare outra porta, outro cabo conhecido e a montagem sem fonte externa, preservando as evidências anteriores. A [documentação de erros USB](https://docs.kernel.org/driver-api/usb/error-codes.html) explica o significado dos códigos.

Se inserir PD mata mouse e teclado, mas conectar o hub já alimentado funciona, há uma diferença relevante na transição de energia/papel. Isso é uma condição reproduzível, não uma correção definitiva. Nunca force o boost OTG do telefone contra uma fonte externa, altere limites de carga ou desative proteções térmicas para contornar a falha.

## Reversão, testes finais e próximo passo

Como os comandos são de leitura, a reversão consiste em retornar à montagem conhecida. Interrompa o teste se houver aquecimento anormal, cheiro, conector danificado ou bateria deformada. Não execute resets de PHY, unbind de controlador ou descarregamento de módulos sem um diagnóstico específico: eles podem derrubar display, rede de manutenção e o próprio kernel.

Uma montagem pronta deve passar por boot, conexão inicial, retirada/reconexão do hub, HDMI separado, teclado separado e inserção/retirada da alimentação se essa função for necessária. Verifique aplicações abertas e carga por alguns minutos. Registre exceções e siga para [sessão portátil](../desktop/sessao-portatil.md).

**Fontes e verificação:** consulta técnica em **2026-10-10**; [USB host API](https://docs.kernel.org/driver-api/usb/usb.html), [Type-C](https://docs.kernel.org/driver-api/usb/typec.html), [gerenciamento de energia USB](https://docs.kernel.org/driver-api/usb/power-management.html). Nenhum hub ou contrato PD específico é certificado por esta página.
