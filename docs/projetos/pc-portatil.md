---
title: Uso cotidiano, energia e operação portátil
sidebar_position: 11
description: Defina estados de operação, teste hotplug e separe apagar tela, bloquear e suspender o sistema.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, dificuldade e requisitos

**Dificuldade:** intermediária a avançada. **Resultado:** um perfil de uso diário com configurações registradas e teste de retorno após desconectar periféricos. A meta é tratar o telefone como uma máquina que mantém trabalhos e detecta monitor/teclado, respeitando as limitações reais do port.

Tenha backup, acesso SSH já validado, configuração gráfica estável, monitor/hub/cabos identificados e alimentação comprovada. Não comece por “máximo desempenho” enquanto carga, temperatura e hotplug ainda falham. Em Android, o ambiente Linux depende do ciclo de vida dos aplicativos; em Linux nativo, depende do kernel, init, compositor e políticas da sessão.

## 1. Definir os estados que você quer manter

| Estado | Comportamento desejado | O que precisa ser validado |
| --- | --- | --- |
| Desktop com monitor | Interface, periféricos e programas ativos | Vídeo, HID, energia e aceleração |
| Sem monitor | Trabalho preservado, acesso remoto possível | Compositor sem saída e rede |
| Tela apagada | Economia sem encerrar programas | Política de idle e retorno de imagem |
| Sessão bloqueada | Arquivos e aplicações protegidos | Autenticação, entrada e desbloqueio |
| Sistema suspenso | Baixo consumo, aplicações pausadas | Kernel, wakeup, USB, Wi-Fi e resume |
| Desligado | Dados sincronizados e boot previsível | Persistência de configuração e recuperação |

Desconectar HDMI deveria alterar saídas, não encerrar o desktop. Um supervisor que reinicia o compositor a cada mudança pode fazer o vídeo voltar e perder os programas. Se a política atual exige isso, ela ainda não atende ao objetivo de um computador portátil: investigue a causa e preserve o estado antes de trocar serviços.

## 2. Registrar a configuração conhecida

No Linux real:

```bash
uname -r
cat /etc/os-release
free -h
df -h
```

Registre também sessão gráfica, renderer, resolução, serviços de acesso remoto e regras de USB/energia. Preserve cópias dos arquivos que for alterar. Separe configurações da sessão do usuário de serviços de sistema: `gsettings` deve ser executado dentro da sessão correta, não como root no SSH esperando alterar automaticamente o GNOME de outro usuário.

Mantenha uma resolução conservadora e frame rate compatível com o monitor. Reduzir resolução pode diminuir custo de composição em software, mas não instala aceleração. Navegador com renderer por software pode continuar lento mesmo numa CPU potente.

## 3. Apagar e bloquear tela sem suspender às cegas

No GNOME, utilize Configurações → Energia/Tela e Privacidade/Bloqueio, conforme a versão. **Apagar tela**, **bloquear sessão** e **suspender sistema** são operações diferentes. Bloqueio precisa de método de autenticação utilizável mesmo com a tela do celular quebrada.

Para investigar schemas disponíveis:

```bash
gsettings list-schemas
gsettings list-keys org.gnome.desktop.session
gsettings get org.gnome.desktop.session idle-delay
```

Se essa chave existir, registre seu valor original e configure, por exemplo:

```bash
gsettings set org.gnome.desktop.session idle-delay 300
```

O valor expressa o atraso de idle em segundos; não é garantia de suspensão nem prova que o driver apagará o monitor corretamente. Restaure o valor anotado para rollback; `reset` retorna ao padrão do schema, que pode ser diferente da sua configuração anterior. Outras chaves variam e devem ser consultadas antes de usar comandos de tutoriais de Ubuntu/Fedora antigos.

Antes de ativar suspensão automática, confira `cat /sys/power/state` e, quando presente, `cat /sys/power/mem_sleep`. A presença de `mem` não comprova resume estável. Faça um teste manual com trabalhos salvos, energia adequada e recuperação física disponível; se o port não tem resume validado, mantenha suspensão automática desativada e use apagamento/bloqueio da tela.

## 4. Desempenho sustentado e temperatura

Governors controlam frequência da CPU; drivers e proteção térmica impõem limites. Para inspecionar políticas disponíveis:

```bash
ls /sys/devices/system/cpu/cpufreq/
```

Dentro dos diretórios `policy*`, leia `scaling_driver`, `scaling_governor` e `scaling_available_governors` quando existirem. Não escreva um governor que não aparece na lista nem aplique o mesmo valor a todos os aparelhos. `performance` pode elevar consumo sem melhorar um desktop limitado por renderização em software ou transferência de buffers.

Se `powerprofilesctl` e o serviço correspondente existem, `powerprofilesctl list` informa os perfis realmente oferecidos. Não prometa perfil performance quando o driver não o suporta. Comece por balanced, meça a tarefa e altere somente uma variável. Compare bateria/temperatura e tempo de execução, não apenas a frequência instantânea.

Bateria inchada, instabilidade elétrica ou aquecimento anormal tornam o aparelho inadequado ao uso contínuo sem avaliação. Não remova a bateria, improvise bypass elétrico nem desative proteções térmicas para transformá-lo em servidor. Um port com leitura de capacidade incorreta exige conferir também tensão, corrente e estado de carga pelo diagnóstico de energia, sem inferir autonomia apenas pelo percentual.

## 5. Hotplug como teste de aceitação

Salve um documento e deixe uma aplicação de teste aberta. Faça uma sequência documentada, com registros por SSH quando disponíveis: remover/recolocar apenas HDMI; remover/recolocar hub; reconectar teclado; testar alimentação PD somente quando a combinação é suportada e a bateria tem margem. Observe vídeo, entrada, rede e **se a mesma aplicação permanece aberta**.

Se uma conexão causa CrashDump ou outro travamento de kernel, interrompa essa sequência e investigue o port/driver; não repita resets cegos como estratégia de estabilidade. Um cabo USB-C com dados e carga não necessariamente conduz DisplayPort; a porta downstream de muitos hubs é apenas dados, mesmo que alimente o monitor.

Suspenda/reanexe periféricos com o mecanismo do desktop quando necessário, mas documente a limitação. Não anuncie hotplug de computador convencional se ainda depende de orientação do conector, uma ordem específica de cabos ou reconexão após PD.

## 6. Manutenção, rollback e critérios finais

Mantenha uma agenda simples: backup, espaço livre, logs, versões de kernel/Mesa/desktop, energia e teste de boot. Atualize por uma release consistente da distribuição; não habilite todos os repositórios. Antes de mudar kernel ou drivers, tenha artefatos de retorno e procedimento de recuperação específico.

Para rollback de desktop, restaure as configurações preservadas e os serviços correspondentes, sem apagar pacotes compartilhados por dependências. Remova desktops antigos só depois de verificar a transação e confirmar que a sessão principal inicia sozinha. Acesso remoto deve administrar ou compartilhar a sessão escolhida, não ser condição oculta para o sistema físico funcionar.

**Teste final:** boot direto no ambiente escolhido, programas persistentes durante hotplug, teclado/mouse, rede, áudio, carregamento medido, bloqueio/desbloqueio e, se habilitada, suspensão/resume. Um teste que passou uma vez é evidência inicial; registre repetição, versões e limitações. Sem estabilidade em energia e periféricos, utilize um papel menos exigente, como terminal de programação ou servidor de teste, enquanto o port evolui.

## Fontes e estado

Revisão documental: **10/10/2026**. [Estados de suspensão no kernel](https://docs.kernel.org/admin-guide/pm/sleep-states.html), [CPU frequency scaling](https://docs.kernel.org/admin-guide/pm/cpufreq.html), [GNOME, suspensão](https://help.gnome.org/gnome-help/power-suspend.html), [power-profiles-daemon](https://gitlab.freedesktop.org/upower/power-profiles-daemon), [GSettings](https://docs.gtk.org/gio/class.Settings.html). O funcionamento de resume, gauge, PD e hotplug deve ser validado para cada combinação de hardware/port; não há promessa universal de operação portátil.
