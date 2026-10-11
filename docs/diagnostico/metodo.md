---
title: Método de diagnóstico e coleta de evidências
description: Investigue por camadas, preserve uma referência e faça alterações reversíveis.
sidebar_position: 1
last_verified: '2026-10-10'
---

Diagnosticar não é escolher um palpite e repetir resets. O processo começa por uma referência, uma cadeia de funcionamento, testes capazes de separar causas e registros comparáveis. Cada alteração deve produzir uma conclusão verificável ou ser revertida.

**Dificuldade:** básica a avançada conforme a falha. **Resultado esperado:** um relatório reproduzível que indique o primeiro ponto da cadeia a falhar, as hipóteses descartadas e os limites. **Materiais:** terminal, relógio, espaço para logs, documentação do modelo e acesso de manutenção. Os comandos desta página consultam o sistema; não fazem flash nem escrevem configuração de hardware.

## 1. Defina o sintoma e a referência

“Não funciona” precisa virar uma observação concreta: teclado enumera mas não gera `EV_KEY`; monitor é detectado mas não mostra pixels; Wi-Fi associa mas DNS falha; fonte é conectada mas a bateria perde carga. Anote também o que **continua funcionando**.

Registre modelo/variante, kernel, distribuição, pacotes relevantes, cabos/hub/fonte, ordem das conexões e última montagem funcional. A referência deve ter confirmação física quando o problema é físico. Um framebuffer ativo não substitui a observação do monitor.

Use uma tabela por tentativa:

| Campo | Exemplo sem dados pessoais |
|---|---|
| Hipótese | Classificação udev rejeita teclado |
| Teste que separa causas | Comparar evtest e libinput no mesmo nó |
| Alteração | Nenhuma no primeiro teste |
| Resultado | EV_KEY presente; libinput não lista teclado |
| Conclusão permitida | Input kernel funciona para as teclas testadas |
| Conclusão ainda indevida | Todo USB/hub é perfeito |
| Reversão | Encerrar leitores e apagar log privado após análise |

## 2. Colete um inventário mínimo privado

```sh
umask 077
diagnostic_dir=$(mktemp -d "$HOME/diagnostico-smartphone.XXXXXX")
printf '%s\n' "$diagnostic_dir"
uname -a > "$diagnostic_dir/kernel.txt"
cat /etc/os-release > "$diagnostic_dir/sistema.txt"
cat /proc/sys/kernel/random/boot_id > "$diagnostic_dir/boot-id.txt"
cat /proc/uptime > "$diagnostic_dir/uptime.txt"
ps -eo pid,ppid,user,args > "$diagnostic_dir/processos.txt"
lsusb > "$diagnostic_dir/usb.txt" 2>&1
lsusb -t > "$diagnostic_dir/usb-arvore.txt" 2>&1
cat /proc/bus/input/devices > "$diagnostic_dir/input.txt"
ip -br address > "$diagnostic_dir/rede-privada.txt" 2>&1
sudo dmesg > "$diagnostic_dir/kernel-log.txt"
```

`umask 077` restringe arquivos criados; `mktemp` evita sobrescrever uma coleta anterior. Os erros das ferramentas opcionais ficam registrados em seus próprios arquivos. `ps -eo` requer implementação compatível, por exemplo procps; se ausente, use `ps` disponível e registre a diferença.

O inventário contém identificadores, nomes de processos, endereços e potencialmente argumentos sensíveis. **É privado por padrão.** Não envie o diretório inteiro ao GitHub. Remova dados pessoais de uma cópia e preserve o original para seu diagnóstico.

Em systemd, `journalctl -b --no-pager` complementa o kernel. OpenRC ou init customizado podem escrever `/var/log/messages` e arquivos próprios. Antes de dizer “não tem log”, identifique quem supervisiona o serviço e para onde stdout/stderr são encaminhados.

## 3. Acompanhe uma mudança por vez

Em terminais separados:

```sh
sudo dmesg -w
sudo udevadm monitor --kernel --udev --property
```

Esses comandos observam; Ctrl+C encerra. Se a distribuição não usa udev ou a ferramenta não existe, documente isso e compare sysfs/kernel com o mecanismo real de hotplug. Faça um teste com ação física claramente marcada, por exemplo “retirei só HDMI às 14:32”. Não desconecte simultaneamente fonte, hub e teclado se quer separar causas.

Capturas de input, câmera, áudio e Bluetooth exigem cuidado adicional: limite tempo e conteúdo. Não deixe keylogger de diagnóstico ativo. Um coletor temporário deve ter prazo, limite de espaço, encerramento e retenção definidos.

## 4. Escolha a camada antes da correção

| Primeiro resultado que falha | Investigação seguinte |
|---|---|
| Dispositivo não enumera | [USB, energia e hub](../hardware/usb-c-hubs.md) |
| USB enumera, não cria input | [HID/kernel](../hardware/teclados-usb.md) |
| Input gera eventos, desktop não recebe | udev, permissões, seat, libinput, foco |
| Display sem EDID/negociação | [USB-C/DP e cabo](../hardware/video-hotplug.md) |
| Display ativo, aplicação fecha no unplug | [Sessão/supervisor](../desktop/sessao-portatil.md) |
| Sem controlador Bluetooth | [Transporte, driver e firmware](../hardware/bluetooth.md) |
| Wi-Fi sem rota/DNS | [Rede por etapas](../hardware/wifi.md) |
| Renderer por CPU | [GPU/seleção/driver](../hardware/gpu.md) |
| Boot ID mudou | [Boot ou crash](boot-crash.md) |

Ausência de módulo em `lsmod` não significa driver ausente: pode estar embutido. Confira a configuração correspondente ao kernel. Um arquivo `.ko` com vermagic compatível ainda exige ABI/estrutura/configuração compatíveis; não carregue módulos obtidos de outro aparelho como teste rápido.

Para DT, consultas com `dtc -I fs -O dts /sys/firmware/devicetree/base` podem revelar `compatible`, `status`, papéis USB e dependências. Exigem dtc e árvore exposta; o dump **não é um arquivo pronto para flash**. Interprete junto aos bindings e fonte do driver da versão usada.

## 5. Alteração reversível e comparação

Faça backup do arquivo exato, permissões e versão. Descreva a hipótese que justifica a edição. Primeiro teste em escopo pequeno: processo isolado, configuração temporária ou dispositivo identificado. Evite selecionar driver global, substituir init ou resetar controlador do qual depende sua única conexão.

Sucesso temporário não basta para persistência. Confira reconexão, usuário comum, boot e interação com componentes que funcionavam. Se a alteração não produziu a evidência esperada, volte à referência antes de tentar a próxima hipótese; acumular parâmetros dificulta distinguir a causa.

## 6. Relatório e limites

Publique modelo/variante, versões, sequência mínima de reprodução, outputs saneados, correção proposta, rollback e testes físicos. Diferencie “observado”, “inferido”, “não testado” e “não recuperamos a stack”. Um panic sem pstore não permite afirmar qual parâmetro o causou.

Para contribuir, use [registro de dispositivo](../dispositivos/registrar-dispositivo.md). A meta é produzir uma correção no port/pacote apropriado; um script local com condições conhecidas pode ser útil, mas não deve virar recomendação universal sem revisão.

**Fontes e verificação:** **2026-10-10**; [reportar bugs do kernel](https://docs.kernel.org/admin-guide/reporting-issues.html), [sysfs](https://docs.kernel.org/filesystems/sysfs.html), [input](https://docs.kernel.org/input/event-codes.html), [Device Tree bindings no fonte Linux](https://github.com/torvalds/linux/tree/master/Documentation/devicetree/bindings). O protocolo desta página é uma proposta original baseada nesses mecanismos.
