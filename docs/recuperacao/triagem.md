---
title: Sistema travado, logo permanente ou tela preta
description: Diferencie falha gráfica, falha de boot e modo de crash antes de reinstalar.
sidebar_position: 1
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Resultado esperado, dificuldade e materiais

O objetivo é identificar a camada que falhou, preservar evidências e escolher a menor recuperação necessária. Dificuldade: intermediária; avançada para panic. Materiais: computador, cabo de dados conhecido, plano do modelo, acesso físico quando disponível e um canal de rede previamente configurado.

**Tela preta não prova que o sistema morreu.** Pode haver um Linux funcional sem saída de vídeo, compositor encerrado, monitor na entrada errada ou problema de cabo. “Ficou no logo” também não determina sozinho a etapa do boot: o framebuffer pode conservar a imagem enquanto outro sistema inicializa. A combinação de USB, rede e logs fornece evidência melhor.

## Backup e riscos da recuperação

Não comece por limpeza de dados, flash de firmware ou reset contínuo de drivers. A alteração pode destruir logs e arquivos ainda recuperáveis. Se dados importam, obtenha cópia enquanto houver acesso. Reinício forçado pode perder trabalho e interromper gravação de disco; use-o apenas quando o sistema não permite desligamento normal e pela combinação documentada do modelo.

Se houver sinais de dano físico, calor anormal, líquido ou bateria inchada, interrompa as tentativas e procure reparo. Um pacote de firmware não conserta conector ou bateria danificados.

## 1. Registre o último estado funcional

Anote horário, mudança feita, versão do kernel, imagem e periféricos conectados. Separe eventos: retirar HDMI, retirar o hub e inserir PD são ações diferentes. Pergunte qual cabo realmente mudou, não “desconectei tudo”. Uma reprodução controlada com captura pode valer mais do que muitos reinícios.

Registre se houve mensagem Qualcomm CrashDump, reboot, perda de SSH, interface preta ou apenas monitor sem sinal. Preserve uma foto sem identificadores se a mensagem só aparece fisicamente.

## 2. Verifique o modo pelo computador

No Linux do computador:

```bash
lsusb
adb devices -l
fastboot devices
```

Essas consultas não gravam nada. `lsusb` mostra enumeração de barramento. ADB só responde se existir daemon e autorização; Linux nativo pode não oferecer ADB. Fastboot só responde em modo/protocolo correspondente. Ausência nas duas ferramentas não é diagnóstico de morte do aparelho.

| Evidência | Interpretação inicial | Próximo passo |
|---|---|---|
| SSH autenticado funciona | Linux e rede estão ativos | Diagnosticar vídeo/sessão/periféricos |
| ADB `device` em Android | Daemon acessível | Consultar boot e logs Android |
| Fastboot reconhecido | Ambiente de manutenção acessível | Registrar produto/slot, sem flash inicial |
| Interface EDL/CrashDump | Possível falha de boot/kernel ou modo de emergência | [Identificar modos](modos-emergencia.md) |
| Nenhum USB | Cabo, porta, energia ou modo podem falhar | Trocar uma variável física e conferir carga |

Se a rede era conhecida, tente SSH com o endereço confirmado, sem varrer redes que você não administra. Um aparelho longe do computador não será alcançável só porque está num Wi-Fi doméstico: redes distintas precisam de rota/VPN já preparada.

## 3. Se Linux responde, preserve dados e leia as camadas

**Local: shell do telefone por SSH ou terminal.**

```bash
uptime
uname -a
df -h
ps -p 1 -o comm=
ps -ef
sudo dmesg > "$HOME/dmesg-antes-da-recuperacao.txt"
```

`uptime` ajuda a distinguir reinício de uma sessão gráfica reiniciada. `df` pode revelar armazenamento cheio; `ps` identifica serviços e compositores. `dmesg` lê mensagens do kernel e salva cópia; requer permissão em alguns sistemas. Revise logs antes de publicar.

Se o PID 1 for systemd e houver journal:

```bash
journalctl -b --no-pager
journalctl -b -1 --no-pager
```

O segundo comando só ajuda se houver logs persistentes do boot anterior. Não encontrar esse boot significa ausência da captura, não ausência de crash. Em OpenRC, consulte `rc-status` e os arquivos oferecidos pelo daemon de log, frequentemente `/var/log/messages`, conforme configuração. Instalar systemd só para executar `journalctl` não é um diagnóstico apropriado.

Compare processos do display manager, compositor, sessão e aplicações. Se as aplicações fecharam ao hotplug, verifique se o compositor/sessão morreu: perda de vídeo físico e reinício de sessão são problemas diferentes. O objetivo é manter a sessão enquanto saídas aparecem/desaparecem.

## 4. Se o sistema não iniciou, procure logs preservados

Depois de recuperar acesso, examine pstore/ramoops, quando o kernel e a placa os configuram:

```bash
find /sys/fs/pstore -maxdepth 1 -type f -print
```

Leia/copiei os arquivos encontrados antes de apagá-los. O mecanismo pode preservar oops/panic através de um reset; não é um armazenamento infinito nem garantido em todos os modelos. Em kernel Android antigo, pode existir outra fonte, como `last_kmsg`, conforme a configuração. Não invente esse arquivo nem conclua que um diretório vazio elimina falha de kernel.

Um crash provocado por módulo exige casar versão/ABI e analisar o primeiro erro. Descarregar um driver de câmera, USB ou GPU essencial pode ser a causa, não a solução. Veja [porting](../nativo/porting.md).

## 5. Faça a recuperação menos invasiva que a evidência permite

Se apenas uma aplicação travou, encerre essa aplicação após preservar trabalho. Se o compositor falhou, a reinicialização da sessão pode ser necessária, mas avisará perda de aplicações. Se o kernel funciona e não há sinais de corrupção, um reboot normal pode limpar um estado ruim; **isso é recuperação, não causa raiz corrigida**.

Se o kernel parou, siga o reinício físico documentado do aparelho. Não generalize Power + Volume de um OnePlus para todas as marcas. Se boot image específica foi alterada, restaure o artefato conhecido pela receita do modelo, no alvo/slot correto. Se nem o bootloader funciona, avance ao modo de emergência somente com suporte e ferramentas compatíveis.

## Erros comuns e alternativas

- **Mandar `adb reboot` a postmarketOS sem `adbd`:** não tem efeito; use o canal administrativo funcional.
- **Apagar dados porque falta monitor:** primeiro confira acesso e conectores.
- **Forçar USB role repetidamente:** pode desencadear outro crash em driver incompleto; registre antes.
- **Trocar de kernel sem guardar configuração anterior:** elimina uma referência recuperável.
- **Religar bootloader como tentativa de boot:** pode bloquear imagens e acionar proteção de rollback.

Quando não há acesso remoto funcional, uma ação física pode ser indispensável. A documentação deve dizer isso explicitamente; um telefone desligado ou em crash sem serviço não recebe comandos SSH.

## Recuperação/rollback e testes finais

Após retornar, restaure apenas a alteração implicada, preservando cópia e logs. Teste o caso mínimo original, depois boot, reconexão e uso contínuo. Não provoque repetidos panics sem necessidade para “ter certeza”. Registre causa confirmada, hipóteses descartadas e o que ainda é desconhecido. Se apenas reboot recuperou, registre o bug como aberto.

## Fontes e limites da verificação

Verificação documental em **10/10/2026**; disponibilidade de logs e combinações físicas dependem do aparelho.

- [Linux: ramoops/panic persistente](https://docs.kernel.org/admin-guide/ramoops.html).
- [Linux: kernel tainted](https://docs.kernel.org/admin-guide/tainted-kernels.html).
- [Android: ADB](https://developer.android.com/tools/adb).
- [AOSP: bootloader e fastboot](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking).
- [QDL upstream: interfaces EDL e crash](https://github.com/linux-msm/qdl).
