---
title: Bluetooth, pareamento e periféricos
description: Separe rádio, transporte, firmware, perfil, input e reconexão.
sidebar_position: 4
last_verified: '2026-10-10'
---

Bluetooth não é um único recurso. Inicializar o rádio, descobrir um telefone, parear um teclado, produzir eventos HID e transportar áudio são testes diferentes. Uma mensagem **Conectado** não prova que todas essas funções operam.

**Dificuldade:** intermediária; adaptar UART/firmware é trabalho de port avançado. **Materiais:** dispositivo de teste carregado, manual de seus canais e botão de pareamento, acesso SSH/teclado virtual. **Resultado:** conexão útil e reconexão, com evidência do perfil realmente usado. No Android/PRoot, o Bluetooth normalmente permanece administrado pelo Android; estes comandos são para Linux nativo com BlueZ.

## Preparação e camadas

Preserve o pareamento existente: não apague `/var/lib/bluetooth` e não troque o endereço do adaptador. Esse diretório guarda identidades e chaves privadas. Um backup precisa manter permissões e nunca deve entrar num repositório público.

```sh
bluetoothctl --version
rfkill list
ls /sys/class/bluetooth
bluetoothctl list
bluetoothctl show
```

`rfkill` diferencia bloqueio de software e de hardware; nem todo kernel expõe ambos. Sem controlador em `bluetoothctl list`, examine driver, UART/USB, alimentação e firmware antes de repetir `pair`. `sudo dmesg | rg -i 'bluetooth|hci|qca|firmware'` ajuda, mas preserve também o contexto completo do log.

Em systemd, consulte `systemctl status bluetooth`; em OpenRC, `rc-service bluetooth status` se esse nome de serviço existir. PID 1 customizado pode exigir consulta ao supervisor do port. Instalar BlueZ não cria um transporte HCI ausente no kernel.

## Pareamento novo, somente quando necessário

Prefira o painel Bluetooth do desktop, que fornece agente de autenticação. Pelo terminal, a sessão interativa abaixo é equivalente para um teste controlado:

```text
bluetoothctl
power on
agent KeyboardDisplay
default-agent
scan on
```

Deixe o periférico no modo de pareamento seguindo seu manual. Anote o endereço descoberto associado ao dispositivo correto e execute `info ENDERECO`. Para **um dispositivo ainda não pareado**, use:

```text
pair ENDERECO
trust ENDERECO
connect ENDERECO
info ENDERECO
scan off
quit
```

Substitua `ENDERECO` pelo valor real. Confira e aceite o código nos dois lados; teclados podem exigir digitar o código no próprio teclado seguido de Enter. `trust` autoriza futuras conexões daquele dispositivo, portanto não use endereços desconhecidos. Nas versões atuais, `pair` pode também confiar/conectar e remover um pareamento anterior: **não o use como simples tentativa de reconexão**. Isso é documentado no [manual BlueZ](https://github.com/bluez/bluez/blob/master/doc/bluetoothctl.rst).

## Validar a função e não só o estado

| Evidência | O que confirma | O que falta |
|---|---|---|
| Adaptador Powered | Rádio habilitado | Descoberta/serviços |
| Paired/Bonded | Autenticação e, quando indicado, vínculo salvo | Conexão/perfil |
| Connected | Alguma conexão ativa | Perfil útil e dados |
| ServicesResolved | Descoberta concluída | Eventos/áudio/aplicação |
| Input com EV_KEY/EV_REL | Dados do teclado/mouse no kernel | Sessão e aplicação |

Para teclado/mouse, siga a parte evdev/libinput do [diagnóstico de input](teclados-usb.md). O transporte pode ser HID clássico ou HID sobre GATT/BLE; requisitos como HIDP ou UHID dependem da implementação kernel/BlueZ. Não conclua que `CONFIG_BT_HIDP` ausente impede todo teclado BLE, nem que `/dev/uhid` resolve todo Bluetooth.

Pressione e solte A, Shift e Enter; mova e clique com o mouse. Confira a aplicação com foco e o LED de Caps Lock separadamente. Uma sessão remota pode usar um seat diferente: os eventos físicos não são automaticamente encaminhados a toda sessão virtual.

## Reconexão e erros

Desligue/ligue apenas a chave do periférico, no mesmo canal, sem apertar Connect. Em vários modelos, Connect inicia outro pareamento ou identidade. Alguns dispositivos BLE usam endereços privados; mudanças de endereço exigem analisar identidade/resolução, não duplicar vínculos automaticamente.

Com o periférico acordado, tente `bluetoothctl connect ENDERECO` uma vez e registre `info`. Para aprofundar:

```sh
sudo btmon -w bluetooth-teste.btsnoop
```

Finalize com Ctrl+C após o teste curto. O arquivo pode conter identificadores e dados de comunicação; não publique sem revisão. [`btmon`](https://github.com/bluez/bluez/wiki/btmon) observa HCI. Ausência de anúncio com dispositivo dormindo, erro de autenticação e falha de perfil são causas distintas. Sinal fraco, bateria do periférico e interferência também precisam ser comparados.

## Persistência, reversão e testes finais

O vínculo salvo por BlueZ deve persistir sem scripts de `pair` no boot. Habilite o serviço segundo a distribuição, após conferir qual supervisor existe. Se o rádio depende de um inicializador vendor, ele precisa iniciar antes de BlueZ e usar firmware compatível; copiar um módulo compilado para outro kernel pode provocar panic, mesmo com nome semelhante.

Teste reconexão após ociosidade, power cycle do periférico, boot e duas classes de dispositivo. Áudio A2DP/HFP merece [teste de áudio](audio.md) próprio. Reverter uma configuração é restaurar o arquivo e serviço previamente salvos; não remover todos os vínculos. Um helper de reconexão deve ter limites e respeitar a ação de desconectar do usuário, sem busca permanente ou apagamento automático de chaves.

**Fontes e verificação:** **2026-10-10**; [Device API](https://github.com/bluez/bluez/blob/master/doc/org.bluez.Device.rst), [bluetoothctl](https://github.com/bluez/bluez/blob/master/doc/bluetoothctl.rst), [UHID](https://docs.kernel.org/hid/uhid.html), [driver QCA](https://github.com/torvalds/linux/blob/master/drivers/bluetooth/hci_qca.c). O [OnePlus do projeto](../dispositivos/oneplus-9-pro.md) usa adaptação particular, não suporte genérico garantido.
