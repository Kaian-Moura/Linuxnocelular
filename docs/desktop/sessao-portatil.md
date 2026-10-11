---
title: Preservar aplicações ao desconectar o monitor
description: Uma sessão portátil continua viva sem display e retoma o vídeo sem fechar programas.
sidebar_position: 4
last_verified: '2026-10-10'
---

Desligar um monitor, suspender o sistema, encerrar o compositor e reiniciar o telefone são eventos diferentes. Um mini-PC deve conservar aplicações quando perde apenas a saída física, se o compositor e o port suportam esse modo. A persistência de processos não significa conservar RAM após reboot ou CrashDump.

**Dificuldade:** intermediária. **Resultado esperado:** mesmo documento e processos após HDMI/hub reconnect. **Pré-requisitos:** desktop nativo funcional, acesso remoto independente, energia suficiente e teste básico de [vídeo](../hardware/video-hotplug.md). Salve uma cópia dos trabalhos, pois um teste pode revelar uma falha real do compositor.

## Identifique quem encerra a sessão

Execute no terminal do Linux nativo ou por SSH. Prepare `ps` com opções completas e `rg` pelo [guia de ferramentas](../diagnostico/instalar-ferramentas.md): um Alpine mínimo pode trazer somente o `ps` do BusyBox, que não oferece todas as opções abaixo. Se isso acontecer, instale o pacote correspondente da sua release antes da comparação; um erro de opção não prova que a sessão desapareceu.

```sh
cat /proc/sys/kernel/random/boot_id
cat /proc/uptime
ps -eo pid,ppid,user,args | rg 'gnome-session|gnome-shell|xfce4-session|weston'
```

Guarde boot ID e PIDs antes do teste. O boot ID identifica a execução do kernel. Um PID de Shell diferente pode indicar restart; mesmo PID não prova que o aplicativo manteve seu estado, então use também uma janela de teste com texto não salvo.

Consulte o launcher/supervisor. Procure decisões relacionadas a `connected`, `disconnected`, “no output” ou reinício. Leia os arquivos sem editá-los inicialmente. Um script que termina GNOME ao perder DP causará fechamento de aplicações mesmo se o driver não tiver crashado. Uma política de “recuperação de vídeo” que reinicia a sessão inteira troca um sintoma por perda de trabalho.

## Plano de teste reproduzível

1. Abra um editor, digite `Sessão preservada 123` e deixe a janela aberta. Use um documento descartável, sem dados privados.
2. Registre boot ID, PIDs e estado dos conectores DRM. Mantenha `dmesg`/journal e evento DRM monitorados.
3. Retire apenas o HDMI por dez segundos. Confirme por SSH que sessão/aplicativo continuam vivos. Reconecte e verifique o texto fisicamente.
4. Repita retirando apenas o cabo upstream do hub, sem mudar fonte/cabos adicionais. Essa etapa inclui nova negociação Type-C e enumeração USB.
5. Observe teclado/mouse, foco e layout após retornar. Registre se o display volta com outro modo/escala.
6. Só depois teste boot sem monitor e conexão tardia, se isso faz parte do uso pretendido.

O protocolo separa causas. Boot ID mudou? Houve reboot/crash. Boot ID estável, Shell morreu? Investigue compositor ou supervisor. Shell e aplicativo vivos, DRM desconectado? Investigue negociação/display. DRM ativo, mas monitor preto? Ainda falta validar pixels no caminho físico; não reinicie programas para declarar sucesso.

## Correções possíveis e seus limites

**Política do supervisor:** retirar apenas o encerramento provocado por ausência de monitor pode preservar a sessão, desde que o compositor suporte nenhuma saída. O supervisor ainda deve detectar e registrar falhas reais. Faça backup, teste e implemente no serviço original, sem iniciar outro desktop em paralelo.

**Eventos de hotplug:** drivers downstream podem não entregar os eventos que a biblioteca/compositor esperam. Compare kernel, udev e consumidor; a correção ideal fica no port/driver. Uma tradução de eventos precisa refletir mudanças reais, sem inventar estado conectado, e não pode reiniciar aplicações. Veja [vídeo e hotplug](../hardware/video-hotplug.md).

**Modo headless/saída virtual:** alguns compositores oferecem mecanismos específicos. Uma sessão virtual pode conservar aplicações remotamente, mas não é a mesma coisa que o GNOME local assumir o monitor físico. Não acrescente conectores virtuais ao driver vendor sem avaliar KMS/planos; o histórico do projeto inclui falhas graves em caminhos DRM experimentais.

**Suspensão:** o desktop ficar vivo durante unplug não comprova suspend/resume. Trate [energia](../hardware/energia.md) separadamente. Uma sessão GNOME Remote Login também pode ser distinta da sessão local; reconexão RDP não prova hotplug físico.

## Backup, persistência e rollback

Antes de alterar serviço/launcher, salve arquivo, permissões, versão do pacote e configuração anterior. Mudanças no serviço devem respeitar o init utilizado, registrar erros, ter lock contra duplicação e evitar laços de reset USB/DP. Não faça unbind repetidamente como política automática sem segurança e causa comprovadas.

Reverta restaurando só os arquivos modificados e reiniciando o serviço numa manutenção planejada. Isso pode fechar aplicações; avise usuários e salve trabalho antes. Faça teste após reboot para confirmar que não dependia de um daemon iniciado manualmente via SSH.

## Critérios de aceitação

Uma validação útil registra: boot com e sem hub, cinco ciclos HDMI, cinco ciclos de hub, texto preservado, mesmos processos durante cada ciclo, teclado/mouse funcionando, nenhum panic e energia coerente. Trata-se do protocolo inicial deste projeto, a ser ampliado conforme hardware. Documente fonte/cabos e exceções: “funcionou uma vez” e “funciona se reconectar em determinada ordem” não equivalem a estabilidade geral.

O [OnePlus](../dispositivos/oneplus-9-pro.md) passou testes de preservação da sessão GNOME em setembro, mas voltou a apresentar problemas separados de orientação e inserção PD. Isso mostra por que um teste de sessão não encerra o diagnóstico da pilha USB-C inteira.

**Fontes e verificação:** **2026-10-10**; [DRM/KMS](https://docs.kernel.org/gpu/drm-kms.html), [Mutter](https://gitlab.gnome.org/GNOME/mutter), [Weston DRM backend](https://gitlab.freedesktop.org/wayland/weston/-/tree/main/libweston/backend-drm). As condições de aceitação são propostas metodológicas, não garantia de suporte do upstream.
