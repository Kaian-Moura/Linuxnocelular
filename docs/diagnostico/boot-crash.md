---
title: Boot travado, tela preta e Qualcomm CrashDump
description: Diferencie perda de display, falha de sessão, panic e modos de boot antes de recuperar.
sidebar_position: 2
last_verified: '2026-10-10'
---

Uma tela preta pode coexistir com Linux e SSH perfeitamente ativos. Logo parada pode ser splash não atualizado. Já Qualcomm CrashDump indica que o telefone entrou num modo de falha fora do funcionamento normal da sessão. Nenhum desses sintomas autoriza, sozinho, apagar partições ou reinstalar firmware.

**Dificuldade:** intermediária a avançada. **Resultado:** classificar a falha, preservar evidências e escolher recuperação documentada. **Pré-requisitos:** modelo/variante conhecidos, notebook com ferramentas oficiais quando aplicáveis e método de manutenção previamente preparado. **Risco:** reboot físico pode perder logs/estado, mas ficar sem acesso exige intervenção; flash incorreto pode piorar a situação.

## Primeiro: em que estado ele está?

| Evidência | Estado provável | Próximo passo |
|---|---|---|
| SSH funciona; boot ID estável | Linux vivo | Investigar display/sessão |
| USB networking existe, SSH falha | Rede/serviço/boot parcial | Verificar endereço e serviço do port |
| ADB autorizado responde | Android ou daemon ADB específico | Consultar sistema; não assumir pmOS |
| Fastboot detecta dispositivo | Bootloader/fastbootd | Consulta e plano específico, sem flash automático |
| Tela informa CrashDump | Falha reportada pelo mecanismo Qualcomm | Registrar e recuperar segundo modelo |
| Só dispositivo USB de emergência | Modo vendor/emergência possível | Identificação e guia confiável; não tentar loader aleatório |
| Nada responde | Pode ser cabo, descarga, port, desligado ou crash | Isolamento físico e procedimentos documentados |

No notebook, `lsusb`, `adb devices -l` e `fastboot devices` são consultas úteis. **ADB não é um comando universal de reboot de Linux nativo.** Instalar ADB no notebook não cria adbd no telefone. Um `adb reboot` só funciona se um daemon compatível está ativo e acessível no aparelho.

## Se Linux ainda responde

```sh
cat /proc/sys/kernel/random/boot_id
cat /proc/uptime
ps -p 1 -o comm,args
ps -eo pid,ppid,user,args | rg 'gnome-shell|gnome-session|sshd'
sudo dmesg | tail -160
df -h
```

Compare boot ID com a referência. Procure `Oops`, `panic`, falhas GPU/USB/firmware, falta de memória e erro de armazenamento. Disco cheio pode impedir serviços ou login; não apague `/var` ou diretórios pessoais às cegas. Identifique logs/cache específicos e preserve dados antes de liberar espaço.

Em systemd, consulte `journalctl -b` e a unidade afetada. Em outro init, leia o supervisor. `systemctl reboot` num sistema cujo PID 1 é um script próprio pode não funcionar. Um reboot normal deve passar pelo mecanismo suportado para sincronizar dados e parar serviços; **reboot forçado não é rotina de diagnóstico** e pode perder gravações.

## Se ocorreu panic ou CrashDump

Anote ação exata: inserir hub, retirar PD, iniciar GPU, capturar framebuffer ou descarregar módulo. Fotografe apenas a mensagem técnica, evitando dados pessoais. Após recuperar o Linux, consulte:

```sh
ls -l /sys/fs/pstore
ls -l /proc/last_kmsg 2>/dev/null
```

Se houver arquivos, copie-os para um diretório privado com permissões restritas antes de novos testes. pstore depende de backend/configuração; `last_kmsg` é uma interface de alguns kernels antigos. Diretório vazio ou interface ausente não prova que não houve panic. O `dmesg` do novo boot também não é automaticamente o log do boot que morreu.

Stack trace, módulo, endereço de falha e versão exata são essenciais. Correlacione com o fonte correspondente; não atribua a um cabo ou parâmetro sem evidência. Na ausência de stack, declare a incerteza e procure uma reprodução mais segura, nunca uma série indiscriminada de crashes.

## Recuperação sem piorar a situação

Se não há SSH/ADB utilizável, uma reinicialização física pode ser inevitável. A combinação e duração dos botões dependem do fabricante/modelo; siga o manual ou guia do port. No OnePlus deste projeto, Power + Volume para cima foi usado historicamente para sair de CrashDump, mas isso não deve ser generalizado para Samsung, Xiaomi ou outro modelo.

Após retornar, evite repetir a ação que disparou a falha até preservar registros e restaurar a configuração experimental. Um arquivo de configuração temporário deve ser removido/restaurado pelo caminho de manutenção previsto; não é necessário trocar kernel para todo crash de aplicação.

Se precisar de bootloader/recovery, vá para a seção de [recuperação](../recuperacao/triagem.md). Firmware, partições, slots, anti-rollback e loaders de emergência exigem condições específicas. Qualcomm EDL não é sinônimo de “desbrick garantido”: pode exigir autenticação OEM e ferramenta autorizada. Não use firehose encontrado aleatoriamente nem comandos de erase de “tutorial universal”.

## Coleta preventiva e rollback

Antes de um experimento arriscado, salve inventário, hashes de arquivos alterados, estado de pacotes e logs num local persistente. Um coletor deve limitar tamanho/duração e não manter câmera ou captura de teclas ativa. Flush/sync reduz perda, mas não garante que registros de panic sobrevivam.

Para driver/pacote experimental, mantenha versões anteriores e explique como desativar seleção sem apagar o sistema. Para kernel/boot, só experimente com procedimento validado do dispositivo e imagem de recuperação correspondente. Reinstalação completa é último recurso quando há evidência e plano de restauração, não um teste de cabo.

## Aceitação após recuperar

Confirme boot ID novo, serviços de manutenção, sessão, vídeo físico, input, rede, armazenamento e energia. Um telefone voltar ao SSH não significa que o problema original foi resolvido. Documente qual função foi recuperada e qual teste ficou suspenso.

**Fontes e verificação:** **2026-10-10**; [pstore/ramoops](https://docs.kernel.org/admin-guide/ramoops.html), [reporting issues](https://docs.kernel.org/admin-guide/reporting-issues.html), [AOSP ADB](https://developer.android.com/tools/adb), [flashing AOSP](https://source.android.com/docs/setup/test/running). Esta página não fornece flash genérico ou firmware de emergência.
