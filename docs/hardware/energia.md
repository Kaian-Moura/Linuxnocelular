---
title: Bateria, temperatura, suspensão e desempenho
description: Meça carga e consumo, preserve proteções e diferencie apagar tela de suspender o sistema.
sidebar_position: 9
last_verified: '2026-10-10'
---

Um celular usado como PC enfrenta carga contínua, hub, monitor e uma bateria envelhecida. “Máximo desempenho” permanentemente pode aumentar calor, descarregar mesmo conectado e reduzir desempenho sustentado por throttling. O objetivo é **estabilidade com desempenho suficiente**, conservando as proteções do aparelho.

**Dificuldade:** básica para painel GNOME e leitura; avançada para drivers de carga/suspensão. **Materiais:** fonte/cabo compatíveis, ambiente ventilado e relógio para comparar leituras. **Resultado:** saber se a bateria está efetivamente recebendo energia e escolher uma política reproduzível. Não há configuração universal de carga rápida ou corrente segura para todos os telefones.

## Preparação

Para localizar os controles de tela, bloqueio, suspensão e perfis no GNOME, siga [primeira configuração do desktop](../desktop/primeira-configuracao.md). Para instalar/encontrar as ferramentas de consulta usadas abaixo, veja [pacotes de diagnóstico](../diagnostico/instalar-ferramentas.md). Faça as consultas no telefone: a bateria e os sensores do notebook são outro conjunto de hardware.

Não use bateria inchada, perfurada, excessivamente quente ou com vazamento. Não remova a bateria nem alimente seus terminais com uma fonte improvisada. Consulte assistência apropriada. Para testes do port, reserve carga suficiente para recuperar o telefone sem depender do hub que está sob investigação.

Desligar a tela reduz parte do consumo; suspender o sistema muda estados do SoC, rede e periféricos. A presença de `mem` em `/sys/power/state` não garante que suspend/resume funcione nesse port.

## Medir carga sem se enganar pelo ícone

```sh
for supply in /sys/class/power_supply/*; do
  [ -d "$supply" ] || continue
  printf '\n%s\n' "$supply"
  for attr in type status online capacity voltage_now current_now temp; do
    [ -r "$supply/$attr" ] || continue
    printf '%s=' "$attr"
    cat "$supply/$attr"
  done
done
```

Nomes como `battery`, `usb` e `bms` variam. Segundo a [classe power_supply](https://docs.kernel.org/power/power_supply_class.html), tensão e corrente usam normalmente microvolts e microamperes; temperatura de bateria usa décimos de grau Celsius, salvo indicação diferente. Por exemplo, 4.000.000 µV são 4 V. **Não confunda a tensão da célula com a tensão negociada no carregador.**

O sinal da corrente e sensores vendor precisam ser conferidos no driver. `online=1` indica presença na fonte representada; `Charging` é estado relatado, não uma medição infalível do saldo. Compare múltiplas amostras durante alguns minutos, atividade do sistema, estado e tendência da carga. Uma bateria pode receber corrente limitada enquanto o consumo total supera a alimentação.

Percentual parado em 1% com outras leituras incoerentes pode ser gauge/calibração/driver; não atribua automaticamente a um cabo. Também não declare bateria cheia pela tensão: há efeitos de carga, química, temperatura e curvas do fabricante. Corrigir gauge exige dados específicos; não execute sequências de calibração destrutivas ou descarga profunda como primeira medida.

## Temperatura e frequência

```sh
for zone in /sys/class/thermal/thermal_zone*; do
  [ -r "$zone/type" ] && { printf '%s ' "$zone"; cat "$zone/type"; }
  [ -r "$zone/temp" ] && cat "$zone/temp"
done
for policy in /sys/devices/system/cpu/cpufreq/policy*; do
  [ -d "$policy" ] || continue
  printf '\n%s\n' "$policy"
  cat "$policy/scaling_governor" "$policy/scaling_available_governors" 2>/dev/null
done
```

Zonas térmicas normalmente reportam milésimos de grau, diferente do atributo `temp` da bateria. Nomes podem corresponder a sensores diferentes; não compare limites de CPU, pele e bateria como se fossem a mesma medida. Registre temperatura de repouso e depois de workload real, preservando o controle térmico. Não desative thermal-engine, cooling devices ou trip points para “destravar FPS”.

Se `powerprofilesctl list` existir, veja quais perfis o hardware realmente oferece. `performance` pode não existir e não obriga uma frequência constante. No GNOME, escolha o perfil disponível pelo painel. Não escreva frequências ou tensões fora da tabela suportada.

## Tela ociosa e suspensão

Use Configurações → Energia para apagar tela após ociosidade. Antes de alterar por terminal, consulte:

```sh
gsettings get org.gnome.desktop.session idle-delay
gsettings list-recursively org.gnome.settings-daemon.plugins.power
cat /sys/power/state
cat /sys/power/mem_sleep 2>/dev/null
```

Essas consultas não suspendem. Execute `gsettings` dentro da sessão correta. Anote valores antigos antes de modificá-los. Uma configuração GNOME não conserta driver que não retoma USB/DP. Teste suspensão somente com suporte documentado, trabalho salvo e possibilidade de despertar/recuperar fisicamente. Para um servidor ou tela quebrada, manter sistema ativo e apenas apagar display pode ser a política inicial viável.

## Autosuspend USB: experimento restrito

Se a falha ocorre após ociosidade e logs indicam suspensão do periférico, identifique seu caminho com `lsusb -t` e sysfs. Leia `power/control` e `power/runtime_status` do dispositivo correto. Uma alteração temporária para `on`, feita **somente naquele dispositivo identificado**, pode comparar o comportamento; registre o valor anterior e restaure-o ao terminar. Não desative gerenciamento de energia de toda a árvore sem prova. Veja [USB power management](https://docs.kernel.org/driver-api/usb/power-management.html).

Se o experimento demonstrar a causa, uma regra persistente deve restringir dispositivo/condição e ser revisada. Identidade VID:PID pode servir para um quirk energético real, mas não resolve genericamente todos os teclados.

## Validação e limites

Compare trabalho leve, navegador, câmera e jogo com fonte conectada, sem fonte e após hotplug. Anote carga, temperatura, CPU, desempenho e periféricos. Repita após boot. Reversão significa restaurar políticas salvas e remover somente a regra experimental.

Este guia não promete suspensão profunda, carga pass-through ou proteção contra falhas de ports experimentais. Um mini-PC deixado permanentemente ligado exige avaliação física da bateria, ventilação e manutenção, além da configuração do desktop.

**Fontes e verificação:** **2026-10-10**; [power_supply](https://docs.kernel.org/power/power_supply_class.html), [thermal sysfs](https://docs.kernel.org/driver-api/thermal/sysfs-api.html), [estados de sono](https://docs.kernel.org/admin-guide/pm/sleep-states.html), [USB power management](https://docs.kernel.org/driver-api/usb/power-management.html).
