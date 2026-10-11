---
title: Prepare ADB e Fastboot e identifique cada modo
description: Instalação das ferramentas, autorização, permissões USB e consultas seguras.
sidebar_position: 2
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Resultado esperado, dificuldade e materiais

Você conseguirá identificar quando o telefone está em Android, recovery, bootloader ou fastbootd e executar consultas sem gravar partições. Dificuldade: iniciante/intermediária. Materiais: computador Linux, Windows ou macOS; cabo USB de dados; telefone acessível; [inventário](../compatibilidade/inventario.md) e procedimento do modelo. Não precisa de root para ADB comum.

**ADB** conversa com um daemon no sistema/recovery; **Fastboot** conversa com uma implementação de manutenção. O telefone pode aparecer em uma ferramenta e não na outra, conforme o modo. Linux nativo não necessariamente executa `adbd`: em postmarketOS, o acesso comum é SSH por Wi-Fi ou rede USB, se configurados.

## 1. Obtenha ferramentas verificadas

Baixe Platform-Tools no [Android Developers](https://developer.android.com/tools/releases/platform-tools) ou use o pacote confiável da distribuição. Não obtenha executáveis de um pacote de firmware desconhecido. Com a pasta oficial extraída, Linux/macOS permitem executar `./adb` e `./fastboot` dentro dela; no PowerShell use `./adb.exe` e `./fastboot.exe`.

Exemplos no computador Linux:

```bash
# Debian/Ubuntu, quando estes pacotes existem na versão utilizada:
sudo apt update
sudo apt install adb fastboot

# Fedora: alternativa; não execute junto com os comandos apt.
sudo dnf install android-tools
```

Esses comandos instalam ferramentas no computador, não no telefone. Confira com `apt-cache policy adb fastboot` ou `dnf info android-tools` antes, se tiver dúvida sobre a versão. Você não precisa de Android Studio inteiro para usar o pacote independente.

```bash
adb version
fastboot --version
```

Anote as versões. Se há várias cópias no `PATH`, confira `command -v adb` e `command -v fastboot`. Uma aplicação pode iniciar outro servidor ADB; mantenha ferramentas coerentes para evitar erros de versão.

## 2. Autorize ADB no Android

Na tela do telefone, habilite Opções do desenvolvedor conforme o fabricante, depois **Depuração USB**. Conecte ao computador e aceite a chave de autorização somente do computador que você controla. Então:

```bash
adb devices -l
adb shell id
```

O estado deve ser `device`. `unauthorized` pede interação no telefone; `offline` indica que a conexão não está operacional. `adb shell id` mostra o usuário do shell, geralmente sem privilégio root. O texto `device` confirma comunicação, mas não significa que todos os serviços do Android já terminaram de iniciar.

Use `adb -s SERIAL ...` ao haver mais de um aparelho. Nunca rode uma operação de manutenção sem conferir o alvo. Números de série são identificadores privados; retire-os de logs públicos.

## 3. Resolva detecção no computador por evidência

No Linux, compare:

```bash
lsusb
adb devices -l
id
```

`lsusb` pertence a usbutils. Se o dispositivo não aparece no barramento, investigue cabo, porta e modo antes de permissões. Se aparece no USB mas ADB informa `no permissions`, confira regras udev e acesso da sessão. A documentação Android cita o pacote Ubuntu `android-sdk-platform-tools-common` como conjunto de regras mantido pela comunidade. Outras distribuições têm pacotes e grupos diferentes; não crie `plugdev` por hábito nem aplique `MODE="0666"` a todos os USBs.

Windows pode exigir um driver ADB e outro para a interface Fastboot. Obtenha o driver na página oficial do fabricante ou no [guia Android de drivers OEM](https://developer.android.com/studio/run/oem-usb). No Gerenciador de Dispositivos, veja a interface que está com erro e o identificador de hardware. Um driver correto em Android não garante que o bootloader esteja reconhecido.

Uma máquina virtual precisa repassar cada interface USB que aparece após reiniciar. O desaparecimento da interface antiga e criação de outra é esperado. Para manutenção delicada, prefira o computador Linux diretamente, reduzindo a camada de redirecionamento USB.

## 4. Diferencie bootloader, fastbootd e recovery

Após salvar seu trabalho e conferir que sabe retornar:

```bash
adb reboot bootloader
fastboot devices
fastboot getvar product
fastboot getvar current-slot
fastboot getvar is-userspace
```

São uma transição de modo seguida de consultas. `getvar` frequentemente escreve em stderr mesmo quando funciona. `unknown variable` significa consulta não implementada, não defeito geral. Não use `fastboot getvar all` em um relatório público sem revisar: pode revelar identificadores.

| Modo | Acesso comum | Significado |
|---|---|---|
| Android normal | ADB autorizado | Sistema instalado em execução |
| Recovery | Interface própria e às vezes ADB/sideload | Ambiente de reparação; permissões variam |
| Bootloader Fastboot | `fastboot`, em modelos que o implementam | Etapa anterior ao sistema |
| Fastbootd | `fastboot`, `is-userspace: yes` quando suportado | Implementação em userspace para certas operações, inclusive partições lógicas |
| Download/EDL/outro | Protocolo específico | Não é “ADB com mais poderes” |

Em aparelhos A/B, `current-slot` informa a seleção; não altere slots para “ver se funciona” sem saber o conteúdo de cada um. Partições dinâmicas ficam em estruturas como `super`; escolher o modo correto depende da operação e do guia do aparelho. A [arquitetura AOSP de fastbootd](https://source.android.com/docs/core/architecture/bootloader/fastbootd) explica essa separação.

Para voltar de Fastboot quando documentado:

```bash
fastboot reboot
```

## Backup, erros, alternativas e rollback

As consultas não apagam dados. Reinícios encerram aplicações, portanto salve trabalho. **Não confunda a preparação desta página com autorização para flash.** Veja [backup](backup.md) antes de qualquer modificação.

Se ADB ficar incoerente, `adb kill-server` seguido de `adb start-server` reinicia o servidor **no computador** e pode interromper outras sessões ADB; não reinicia o telefone. Se ambas as ferramentas não detectarem, consulte [triagem de recuperação](../recuperacao/triagem.md). Em Linux nativo, use o endereço SSH confirmado pela sua configuração; um IP comum de uma distribuição não é universal.

## Testes finais e próximos passos

Confirme versões, alvo, autorização, modo e retorno ao sistema. Retire depuração/autorização que não for necessária após o projeto. Se o telefone só for acessível por cabo e você pretende usar hub na mesma porta, prepare uma segunda via administrativa antes de trocar a conexão.

## Fontes e limites da verificação

Consulta documental em **10/10/2026**, sem testes de drivers em todas as plataformas.

- [Platform-Tools oficiais](https://developer.android.com/tools/releases/platform-tools).
- [ADB](https://developer.android.com/tools/adb).
- [Preparação de dispositivo Android e regras Linux](https://developer.android.com/studio/run/device).
- [AOSP: Fastbootd](https://source.android.com/docs/core/architecture/bootloader/fastbootd).
- [AOSP: atualizações A/B](https://source.android.com/docs/core/ota/ab).
