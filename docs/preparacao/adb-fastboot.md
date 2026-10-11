---
title: Prepare ADB e Fastboot e identifique cada modo
description: Instalação das ferramentas, autorização, permissões USB e consultas seguras.
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Resultado esperado, dificuldade e materiais

Você conseguirá identificar quando o telefone está em Android, recovery, bootloader ou fastbootd e executar consultas sem gravar partições. Dificuldade: iniciante/intermediária. Materiais: computador Linux, Windows ou macOS; cabo USB de dados; telefone acessível; [inventário](../compatibilidade/inventario.md) e procedimento do modelo. Não precisa de root para ADB comum.

**ADB** conversa com um daemon no sistema/recovery; **Fastboot** conversa com uma implementação de manutenção. O telefone pode aparecer em uma ferramenta e não na outra, conforme o modo. Linux nativo não necessariamente executa `adbd`: em postmarketOS, o acesso comum é SSH por Wi-Fi ou rede USB, se configurados.

## 1. Obtenha ferramentas verificadas

Platform-Tools é um conjunto que inclui `adb` e `fastboot`. Você o instala **no computador**. Android Studio inteiro não é necessário. Leia [pastas, downloads e extração](../comece-aqui/computador-downloads.md) se nunca preparou uma ferramenta de terminal. Escolha uma das alternativas abaixo, de acordo com o computador; não execute todas.

### Windows: ZIP oficial, extração e primeira execução

1. No navegador do computador abra [Platform-Tools, Android Developers](https://developer.android.com/tools/releases/platform-tools).
2. Na seção Downloads, escolha **Download SDK Platform-Tools for Windows**. Leia/aceite os termos se concordar e salve o ZIP. Não clique em anúncios nem baixe “ADB Installer” de outro site.
3. No Explorador, clique com o botão direito no ZIP → **Extrair Tudo**. Escolha sua pasta `smartphone-linux/downloads`. Abra a pasta extraída `platform-tools` que contém `adb.exe` e `fastboot.exe`.
4. Abra PowerShell pelo menu Iniciar. Digite `Set-Location` seguido do caminho real da pasta entre aspas. Você pode copiar o caminho pela barra de endereço do Explorador.

**Exemplo no PowerShell: ajuste o caminho se extraiu em outro lugar.**

```powershell
Set-Location "$env:USERPROFILE\smartphone-linux\downloads\platform-tools"
Get-ChildItem adb.exe, fastboot.exe
.\adb.exe version
.\fastboot.exe --version
```

`Set-Location` entra na pasta; `Get-ChildItem` confirma os dois arquivos. O prefixo `.\` manda executar o arquivo dessa pasta. **Verificação:** ambos imprimem versão e o prompt retorna. Se a pasta não existe, localize a extração no Explorador; não prossiga com um caminho imaginado.

Os blocos restantes desta página usam `adb` e `fastboot` sem prefixo. Para acompanhá-los nessa mesma janela, **depois de confirmar a pasta oficial**, acrescente-a ao caminho de busca somente da sessão:

```powershell
$platformToolsDir = (Get-Location).Path
$env:Path = "$platformToolsDir;$env:Path"
adb version
fastboot --version
```

Isso não modifica permanentemente Windows nem o telefone. Ao fechar PowerShell, a adição desaparece. Alternativamente, mantenha os prefixos `.\adb.exe` e `.\fastboot.exe` em cada comando. Não execute `adb.exe` que apareceu numa pasta de firmware desconhecida.

### macOS: ZIP oficial

Na mesma [página oficial](https://developer.android.com/tools/releases/platform-tools), escolha o download **Mac**, aceite os termos se concordar e abra o ZIP completo. Mova a pasta `platform-tools` extraída para `smartphone-linux/downloads` na sua pasta pessoal. Abra Terminal via Spotlight e entre na pasta:

```bash
cd "$HOME/smartphone-linux/downloads/platform-tools"
ls adb fastboot
./adb version
./fastboot --version
```

Se extraiu em outro destino, ajuste somente o caminho. Para acompanhar os blocos seguintes sem prefixo nessa janela:

```bash
export PATH="$PWD:$PATH"
adb version
fastboot --version
```

A adição vale para o shell atual. Não desative proteções globais do macOS para abrir uma ferramenta de origem duvidosa; confira a origem e as instruções do fornecedor se houver bloqueio.

### Linux: pacote da distribuição

Exemplos no computador Linux:

```bash
# Debian/Ubuntu. Execute apenas este grupo se é a sua distribuição.
sudo apt update
sudo apt install adb fastboot
adb version
fastboot --version
```

```bash
# Fedora. Alternativa ao grupo apt, não uma etapa seguinte.
sudo dnf install android-tools
adb version
fastboot --version
```

`sudo` pede a senha da conta do computador, sem mostrar caracteres enquanto você digita. O gerenciador informa pacotes/tamanho; confira antes da confirmação. Consulte `apt-cache policy adb fastboot` ou `dnf info android-tools` para a versão oferecida. Não misture pacotes de Fedora com Ubuntu.

### Linux: ZIP oficial como alternativa

Se o método do aparelho requer versão mais recente que a oferecida pela distribuição, baixe **Linux** na página oficial e extraia o ZIP. Abra terminal na pasta `platform-tools` e use `./adb version` e `./fastboot --version`. Para usar os blocos sem prefixo nessa janela, depois de conferir a pasta execute `export PATH="$PWD:$PATH"`. O arquivo Linux não é um programa Android, mesmo se ambos os sistemas usam o kernel Linux.

### Confira qual cópia está executando

```bash
adb version
fastboot --version
```

Anote as versões. Se há várias cópias no `PATH`, Linux/macOS permitem `command -v adb` e `command -v fastboot`; no PowerShell use `Get-Command adb, fastboot`. Uma aplicação pode iniciar outro servidor ADB; mantenha ferramentas coerentes para evitar erros de versão. “Comando não encontrado” antes de conectar o telefone indica problema de instalação/pasta no computador.

## 2. Autorize ADB no Android

1. **No telefone**, abra Configurações e procure “Número da versão”, “Número de compilação” ou “Build number” em Sobre o telefone/Informações do software. Em interfaces que seguem o procedimento Android, tocar sete vezes habilita as opções; o fabricante pode mudar o caminho. Pode ser solicitado PIN/senha do telefone.
2. Volte às Configurações e procure **Opções do desenvolvedor** pela busca. Ative **Depuração USB** e leia a confirmação. Não ative desbloqueio OEM para esta consulta: é outra função.
3. Conecte o cabo de dados diretamente ao computador, desbloqueie a tela e aguarde a pergunta **Permitir depuração USB?** com a impressão da chave RSA. Autorize somente o computador que você controla. “Sempre permitir” é opcional num computador pessoal, inadequado num computador emprestado.
4. **No computador**, execute:

```bash
adb devices -l
adb shell id
```

O estado deve ser `device`. `unauthorized` pede interação no telefone; `offline` indica que a conexão não está operacional. `adb shell id` mostra o usuário do shell, geralmente sem privilégio root. O texto `device` confirma comunicação, mas não significa que todos os serviços do Android já terminaram de iniciar.

**Saída ilustrativa — não copie como comando:**

```text
List of devices attached
IDENTIFICADOR_LOCAL   device product:... model:...
```

Se aparece apenas o cabeçalho, nenhum alvo ADB foi encontrado. Se aparece `unauthorized`, a chave ainda não foi aceita. O identificador real é privado; mantenha-o no seu relatório local. Confirme que o aparelho listado é o seu antes de reiniciar ou alterar qualquer coisa. Um diálogo para “transferência de arquivos/MTP” não é a autorização RSA do ADB.

**Verificação desta etapa:** `adb shell id` retorna informações de usuário do Android. Normalmente não será `uid=0`. Isso é esperado, e não impede ADB comum. A instalação das ferramentas não exige root Android.

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

**Windows, roteiro visual de driver:** abra Iniciar, procure “Gerenciador de Dispositivos” e veja qual item aparece/desaparece ao conectar o telefone. Se há triângulo de erro, abra Propriedades → Detalhes → IDs de Hardware para identificar a interface; guarde a informação localmente. Baixe o pacote pelo link OEM e use o instalador do fabricante ou “Atualizar driver → Procurar drivers no meu computador”, conforme o pacote. O [procedimento Android de driver OEM](https://developer.android.com/studio/run/oem-usb) descreve essa instalação. Google USB Driver é para dispositivos Google compatíveis; não force esse pacote em toda marca. Confirme novamente ADB depois da instalação, e Fastboot quando realmente entrar naquele modo.

**Ubuntu, quando aparece `no permissions`:** a documentação Android orienta regras udev e acesso do usuário. Se esse é o seu sistema, confirme disponibilidade do pacote e grupo antes de usar a alternativa documentada:

```bash
sudo apt install android-sdk-platform-tools-common
getent group plugdev
id
```

Somente se a política Ubuntu descrita na [documentação Android](https://developer.android.com/studio/run/device) e o grupo `plugdev` existirem no seu sistema, acrescente **seu usuário** com `sudo usermod -aG plugdev "$USER"`, encerre a sessão do computador e entre novamente. Replugue o cabo e consulte `adb devices -l`. `-aG` acrescenta um grupo; não omita o `-a`. Não transplante essa regra para distribuições que usam outra política e não crie permissões universais `0666` para todos os USBs.

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

| Resultado | Próximo teste, sem flash |
| --- | --- |
| `adb` não encontrado | Confira pasta, arquivo do seu sistema e prefixo/PATH da etapa 1 |
| Só aparece cabeçalho | Confira cabo de dados, depuração e driver/permissões do computador |
| `unauthorized` | Desbloqueie e aceite RSA no telefone; se necessário revogue autorizações nas Opções do desenvolvedor e autorize novamente |
| `offline` | Confira cabo/versão, salve sessões e reinicie somente o servidor ADB |
| `more than one device` | Consulte a lista e use `adb -s SERIAL ...` com o alvo local conferido |
| ADB some após ir ao bootloader | Esperado nesse modo; consulte `fastboot devices` e seu driver |
| `unknown variable` em getvar | Consulta não implementada; use a alternativa documental do modelo |
| Tela está quebrada e não autorizou | [Planeje o acesso físico](tela-quebrada.md); não há aprovação remota automática |

As consultas não apagam dados. Reinícios encerram aplicações, portanto salve trabalho. **Não confunda a preparação desta página com autorização para flash.** Veja [backup](backup.md) antes de qualquer modificação.

Se ADB ficar incoerente, `adb kill-server` seguido de `adb start-server` reinicia o servidor **no computador** e pode interromper outras sessões ADB; não reinicia o telefone. Se ambas as ferramentas não detectarem, consulte [triagem de recuperação](../recuperacao/triagem.md). Em Linux nativo, use o endereço SSH confirmado pela sua configuração; um IP comum de uma distribuição não é universal.

## Testes finais e próximos passos

Confirme versões, alvo, autorização, modo e retorno ao sistema. Retire depuração/autorização que não for necessária após o projeto. Se o telefone só for acessível por cabo e você pretende usar hub na mesma porta, prepare uma segunda via administrativa antes de trocar a conexão.

## Fontes e limites da verificação

Consulta documental em **11/10/2026**, sem testes de drivers em todas as plataformas.

- [Platform-Tools oficiais](https://developer.android.com/tools/releases/platform-tools).
- [ADB](https://developer.android.com/tools/adb).
- [Preparação de dispositivo Android e regras Linux](https://developer.android.com/studio/run/device).
- [Ativar opções de desenvolvimento no Android](https://developer.android.com/studio/debug/dev-options).
- [Instalar drivers OEM no Windows](https://developer.android.com/studio/run/oem-usb).
- [AOSP: Fastbootd](https://source.android.com/docs/core/architecture/bootloader/fastbootd).
- [AOSP: atualizações A/B](https://source.android.com/docs/core/ota/ab).
