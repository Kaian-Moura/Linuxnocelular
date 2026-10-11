---
title: 'Erros para iniciantes: do sintoma à próxima ação'
description: 'Quinze roteiros operacionais para identificar o ambiente, ler evidências e avançar sem resets ou correções universais.'
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você seguiu uma etapa e encontrou uma mensagem que não entende? Primeiro descubra **onde a etapa parou**. Este manual apresenta quinze situações, com verificações em ordem, resultados possíveis e a próxima ação segura. Não é necessário compreender todos os logs para começar: registre a mensagem exata, o comando e o lugar onde ele foi executado.

Os procedimentos foram revisados documentalmente em **11/10/2026**, sem executar testes num telefone nesta revisão. Todas as saídas abaixo são **ilustrativas**: nomes, números de dispositivos e resultados não representam seu aparelho. Não copie uma saída como se fosse a sua evidência. As verificações iniciais consultam estado; instalação de ferramentas, reconexão física e alterações pela interface são identificadas separadamente.

## Antes de qualquer caso: confirme o lugar do terminal

| Onde está a janela? | Onde os comandos atuam? | Primeira referência |
|---|---|---|
| PowerShell/Terminal no Windows, sem SSH | No notebook Windows | [Terminal e ferramentas no computador](../comece-aqui/computador-downloads.md) |
| Terminal do macOS/Linux, sem SSH | No notebook | [Primeiros passos no terminal](../comece-aqui/terminal-primeiros-passos.md) |
| Depois de `ssh` e de um login remoto bem-sucedido | No sistema que recebeu a conexão | [SSH desde zero](../projetos/ssh-remoto.md) |
| Aplicativo Termux | No ambiente Termux, sobre Android | [Instalar Termux](../android/termux.md) |
| Depois de entrar numa distribuição pelo proot-distro | No espaço de usuário dessa distribuição, usando o kernel Android | [PRoot](../android/proot-distro.md) |
| Depois de `adb shell` | No Android/recovery que oferece o serviço ADB | [ADB e Fastboot](../preparacao/adb-fastboot.md) |
| Terminal do desktop Linux nativo do telefone | No próprio Linux instalado | [Aula do mini-PC nativo](../aulas/mini-pc-nativo.md) |

Se é uma shell Linux/Termux, comece pelas linhas seguintes. **Não cole este bloco no PowerShell como se fosse um diagnóstico do telefone**:

```sh
pwd
id
uname -m
uname -r
cat /etc/os-release
```

`pwd` mostra a pasta atual; `id`, a conta; `uname`, a arquitetura e o kernel; `/etc/os-release`, a distribuição quando esse arquivo existe. No Termux direto, a falta de `/etc/os-release` pode ser normal: consulte `termux-info`. Dentro de PRoot, esse arquivo descreve a distribuição convidada; ele não prova instalação nativa. No Android via ADB, use os comandos Android do caso 5.

Se não sabe como abrir o terminal, escrever uma linha ou parar um comando, faça primeiro [a aula de terminal](../comece-aqui/terminal-primeiros-passos.md). Não copie os símbolos de prompt `$`, `#` ou `PS>` junto com o comando. Os blocos desta página já omitem esses símbolos.

### Ferramenta ausente não é diagnóstico de hardware

Antes de usar uma ferramenta, `command -v NOME` verifica se ela é encontrada na shell Linux. Os pacotes podem variar por release: consulte [instalar ferramentas de diagnóstico](instalar-ferramentas.md), que explica as consultas e a instalação no ambiente certo.

| Ferramenta | Pacote usual Debian/Ubuntu | Pacote usual Alpine/postmarketOS |
|---|---|---|
| `nano` | `nano` | `nano` |
| `lsusb` | `usbutils` | `usbutils` |
| `evtest` | `evtest` | `evtest` |
| `libinput` | `libinput-tools` | `libinput-tools` |
| `ip`, `ss` com opções completas | `iproute2` | `iproute2` |
| `nmcli`, quando NetworkManager já administra a rede | `network-manager` | `networkmanager-cli` |
| `aplay`, `arecord` | `alsa-utils` | `alsa-utils` |
| `wpctl`, se a sessão usa PipeWire/WirePlumber | `wireplumber` | `wireplumber` |
| `v4l2-ctl` | `v4l-utils` | `v4l-utils` |

Não instale outro gerenciador de rede ou servidor de áudio apenas para obter um comando. Isso pode criar um conflito com o serviço que já funciona. `udevadm` também depende da implementação udev presente; não substitua o gerenciador de dispositivos por tentativa.

Exemplo de **instalação**, distinto da coleta inicial, para quem confirmou Linux nativo Debian/Ubuntu, acesso sudo existente e necessidade de examinar USB:

```sh
sudo apt update
sudo apt install usbutils
```

Exemplo correspondente **somente** para Alpine/postmarketOS com doas já autorizado:

```sh
doas apk update
doas apk add usbutils
```

Escolha um bloco; não execute os dois. Se sua imagem documenta `sudo` no lugar de `doas`, use o método já configurado. Se não conhece a conta administrativa, resolva o caso 3. A tabela não autoriza misturar repositórios nem instalar pacotes Debian no Termux direto. Catálogos: [Debian](https://packages.debian.org/), [Ubuntu](https://packages.ubuntu.com/) e [Alpine](https://pkgs.alpinelinux.org/packages).

### Como registrar e desfazer

Guarde anotações numa pasta pessoal, não numa pasta de sistema. Prefira copiar os trechos relevantes depois de lê-los. Antes de publicar, retire serial, MAC, nome/endereço da rede, tokens, senhas e nomes de documentos pessoais. **Capturas de eventos de teclado podem revelar o que foi digitado**: durante testes use somente texto neutro e pare a captura antes de qualquer senha.

Consultas como `pwd`, `lsusb` e leitura de `/sys` não precisam de rollback. Um teste contínuo termina com **Ctrl+C**. Uma mudança de saída de som/escala/layout pode ser revertida pelo mesmo painel; anote o valor anterior. Não use apagar toda `~/.config`, `chmod 777`, reinstalar o sistema, descarregar controladores ou alterar partições como primeira etapa de diagnóstico.

## 1. “Comando não encontrado” ou “não é reconhecido”

**Onde:** primeiro no terminal em que o erro ocorreu. A frase pode significar ferramenta ausente, pasta fora do PATH ou comando escrito para outro sistema.

**Leia em ordem:**

1. Confira a grafia; `python3`, `python` e `py` não são sempre o mesmo comando. Identifique Windows/macOS/Linux/Termux pela tabela inicial.
2. Na shell Linux, execute as consultas abaixo, trocando `nano` apenas pelo comando que procura:

```sh
command -v nano
printf '%s\n' "$PATH"
```

3. Se baixou uma ferramenta, abra a pasta onde extraiu os arquivos e confira se o executável está lá. No PowerShell, `Get-Location` e `Get-ChildItem` mostram pasta e arquivos; a chamada local das Platform Tools extraídas está no bloco seguinte.

Exemplo concreto **no PowerShell dentro da pasta que contém adb.exe**:

```powershell
Get-Location
Get-ChildItem
.\adb.exe version
```

A grafia correta da chamada é `.` seguido de barra invertida e nome: `.\adb.exe`. Na shell macOS/Linux, na pasta extraída, a chamada equivalente é `./adb version`, conforme o [guia de ferramentas](../preparacao/adb-fastboot.md). Não acrescente a pasta Downloads inteira ao PATH.

**Saída ilustrativa:** `command -v nano` produz `/usr/bin/nano` quando localizado; saída vazia significa que a shell não encontrou esse nome no PATH. Isso não prova que nenhum arquivo equivalente exista no disco.

**Conclusão permitida:** ferramenta não localizada no ambiente atual. Instale pelo pacote da distribuição ou configure somente o diretório correto conforme o guia de downloads. Um erro de `apt` no Alpine pede o caso 4, não um instalador aleatório de APT.

**Recuperação:** nenhuma consulta acima altera configuração. Se mudou PATH, reverta a linha adicionada ao arquivo ou à configuração de ambiente que você realmente editou, preservando as entradas antigas. Continue em [downloads seguros](../comece-aqui/downloads.md).

## 2. “Arquivo ou pasta não existe”, ou “não consigo salvar”

**Onde:** na shell Linux que deveria conter o projeto. No notebook, uma pasta do telefone só é visível por um acesso apropriado, como SFTP; estar conectado por cabo não monta automaticamente a pasta pessoal.

```sh
pwd
printf '%s\n' "$HOME"
ls -la
ls -ld "$HOME"
df -h "$HOME"
```

Leia `pwd` e compare com a pasta em que salvou. `ls -la` inclui arquivos ocultos; `ls -ld` mostra permissões da pasta, sem listar seu conteúdo. `df` mostra o armazenamento do sistema de arquivos que contém aquela pasta; não é a soma de toda a capacidade comercial do aparelho.

**Saída ilustrativa:** você está em `/home/aluno`, mas o programa foi salvo em `/home/aluno/mini-pc-aula`. Executar `python3 primeiro_programa.py` na primeira pasta não localiza o arquivo da segunda. Use `cd "$HOME/mini-pc-aula"`, `ls` e só então execute o nome que aparece. Para nomes com espaços, use aspas: `ls "$HOME/Meu projeto"`.

**Ação segura:** para criar um projeto próprio novo, `mkdir -p "$HOME/mini-pc-aula"` cria somente a pasta pessoal indicada. Se `mini-pc-aula` já é um arquivo, o erro exige conferir o nome, não apagá-lo. Abra `nano "$HOME/mini-pc-aula/notas.txt"`; salve com Ctrl+O e Enter, saia com Ctrl+X e confira com `cat` no mesmo caminho. Se o arquivo já tem conteúdo, revise antes de editá-lo.

**Conclusão permitida:** caminho errado, falta de espaço ou permissão naquela localização, conforme a mensagem. Um nome diferente por maiúsculas, acentos ou extensão também precisa ser corrigido. Não é necessário usar root para escrever normalmente na própria pasta pessoal.

**Limite e recuperação:** `Read-only file system` pode indicar montagem/erro de armazenamento; não force remount sem entender o port. `Permission denied` em `/etc` é esperado para conta comum. Salve o texto pendente numa pasta que já seja sua, não aplique `chmod -R 777` ou troque proprietários do sistema. Siga [terminal e arquivos](../comece-aqui/terminal-primeiros-passos.md) e [backup](../preparacao/backup.md).

## 3. “A senha não aparece”, “sudo negado” ou “doas não existe”

**Onde:** no Linux em que o comando administrativo deveria atuar. A senha digitada no terminal normalmente não mostra letras nem asteriscos; isso evita expor seu tamanho. Digite e pressione Enter uma vez. Confira Caps Lock e layout antes de repetir.

Para inspecionar sem pedir elevação:

```sh
id
command -v sudo
command -v doas
```

**Saída ilustrativa:** `uid=1000(aluno)` é uma conta comum. Encontrar `/usr/bin/sudo` mostra que o programa existe, não que a conta pode usá-lo. Uma mensagem equivalente a “não está no sudoers” descreve política administrativa; repetir a senha não muda essa política.

**Conclusão permitida:** se a autenticação falha, a senha/política/contexto precisa ser conferida. Você não deve supor que senha de Wi-Fi ou PIN do Android é a senha Linux. Um membro de um grupo administrativo também depende da política efetiva; o nome de grupo isolado não certifica autorização.

**Ação segura:** use a conta e o método criados pelo instalador, consulte a documentação da imagem e teste a autenticação no painel **Usuários** do GNOME, quando integrado. Criação de contas e concessão de administração exigem **um administrador existente**; a [documentação GNOME](https://help.gnome.org/gnome-help/user-admin-explain.html) explica essa separação.

**Limite e recuperação:** não há uma senha padrão nesta página. Não instale scripts de “root universal” nem edite sudoers sem validar sintaxe e preservar recuperação. Se perdeu a única conta administrativa, consulte o procedimento de recuperação **da imagem instalada**. Continue em [GNOME nativo](../desktop/gnome-nativo.md) e [segurança](../fundamentos/seguranca.md).

## 4. “É apt ou apk?”, “pacote não encontrado” ou erro de repositório

**Onde:** no sistema em que você quer instalar o programa. APK Android é um formato de aplicativo; o comando `apk` Alpine administra pacotes Linux. Ter palavras parecidas não torna os pacotes intercambiáveis.

```sh
cat /etc/os-release
command -v apt
command -v apk
command -v pkg
uname -m
```

Escolha a consulta conforme o ambiente confirmado:

```sh
# Debian/Ubuntu: consulta local do catálogo APT
apt-cache policy nano
```

```sh
# Alpine/postmarketOS: consulta dos índices e da configuração local
apk search -x nano
cat /etc/apk/repositories
```

```sh
# Termux direto: consulta do catálogo Termux
pkg search nano
```

**Saída ilustrativa:** APT com `Candidate: (none)` indica que os índices/políticas atuais não oferecem candidato. Não significa que o projeto jamais exista para ARM. APK sem resultado pode refletir nome, índice, branch ou arquitetura. Os comandos consultam catálogos; o [APT documenta que eles podem estar desatualizados](https://manpages.debian.org/trixie/apt/apt-cache.8.en.html), e o [Alpine explica busca e informações](https://wiki.alpinelinux.org/wiki/Apk).

**Ação segura:** confira o nome no catálogo oficial da sua release e a rede/data. Atualizar os índices pelo gerenciador correto é uma etapa separada de instalação, com autorização quando exigida; use [instalar aplicativos](../desktop/instalar-aplicativos.md). No Termux, confira [a origem do aplicativo e dos repositórios](../android/termux.md), sem misturar assinaturas de canais diferentes.

**Limite e recuperação:** erro de assinatura, certificado ou release não deve ser contornado desativando verificações. Se já editou fontes, restaure a cópia anterior **do arquivo editado**, não uma lista obtida para outro sistema. Binário x86 não funciona por ser baixado num ARM; binário ARM64 glibc também pode não executar no Alpine musl. A indicação “pacote existe” ainda precisa de arquitetura e ambiente adequados.

## 5. “ADB não mostra nada”, “unauthorized” ou “offline”

**Onde:** no notebook, usando as Platform Tools oficiais. ADB precisa de um serviço `adbd` no dispositivo. **No Linux nativo do telefone, não aparecer em ADB pode ser normal**; use o acesso documentado do port, frequentemente SSH. A lista vazia não prova que o aparelho esteja desligado.

Se a ferramenta falta, faça [a instalação Windows/macOS/Linux desde zero](../preparacao/adb-fastboot.md), a partir de [Platform Tools oficiais](https://developer.android.com/tools/releases/platform-tools). Na pasta extraída, PowerShell usa `.\adb.exe`; macOS/Linux usam `./adb` quando o diretório não está no PATH.

Com o executável localizado, no notebook:

```sh
adb version
adb devices -l
```

**Saídas ilustrativas e conclusões:**

```text
List of devices attached
SERIAL_FICTICIO    unauthorized
```

| Estado | O que permite concluir | Próxima ação |
|---|---|---|
| Só o cabeçalho | Esse cliente não listou um endpoint ADB | Conferir sistema/mode, cabo de dados e enumeração no notebook |
| `unauthorized` | Endpoint encontrado, autorização ainda não aceita | Desbloquear Android e conferir/aceitar o pedido RSA no aparelho confiável |
| `offline` | Endpoint listado, sem comunicação operacional com o daemon | Conferir modo, cabo, estado do sistema e versões antes de tentar reconexão |
| `device` | Transporte ADB operacional | Consultar modelo; isso não certifica boot completo ou root |

Com **um único dispositivo**, estado `device` e Android confirmado, estas consultas são apropriadas:

```sh
adb shell getprop ro.product.model
adb shell getprop ro.build.version.release
```

Com vários endpoints, selecione o correto com `adb -s SERIAL_REAL ...`, substituindo pelo serial listado. Não envie comandos a um aparelho escolhido por acaso. A [documentação Android](https://developer.android.com/tools/adb) descreve cliente/daemon, autorização e estados.

**Ação física necessária:** autorizar RSA exige interação com Android desbloqueado; não é possível “aprovar pelo ADB” justamente quando ele está bloqueado. Tela quebrada pede [alternativas documentadas](../preparacao/tela-quebrada.md). Para uma lista vazia, verifique USB no Gerenciador de Dispositivos Windows, Relatório do Sistema → USB no macOS ou `lsusb` no notebook Linux. Um cabo que carrega pode não transportar dados.

**Recuperação:** estas consultas não apagam dados. Não execute desbloqueio, `adb root` ou resets de autorização como solução genérica. Encerrar o servidor ADB do notebook também afeta outras sessões; primeiro identifique versão e endpoint. Avance ao caso 6 se o aparelho está em Fastboot, e não em Android.

## 6. “Fastboot devices está vazio”

**Onde:** notebook. Fastboot e ADB são protocolos/modos diferentes. Estar no Android com ADB funcionando não significa estar em Fastboot; estar em Fastboot não exige que `adb devices` liste o aparelho.

Instale/localize as mesmas [Platform Tools](../preparacao/adb-fastboot.md). Depois consulte:

```sh
fastboot --version
fastboot devices
```

No PowerShell a partir da pasta extraída, use `.\fastboot.exe --version` e `.\fastboot.exe devices`; no macOS/Linux sem PATH, `./fastboot --version` e `./fastboot devices`.

**Saída ilustrativa:** `SERIAL_FICTICIO fastboot` mostra um endpoint desse protocolo. Uma saída vazia só informa que ele não foi encontrado por aquela execução. Não conclua bootloader bloqueado ou desbloqueado pela ausência da lista.

**Leia em ordem:**

1. O manual **do modelo/variante** explica como entrar no modo? Confira o nome exibido na tela ou o USB observado, quando a tela não funciona. Não copie combinações de botões de outro fabricante.
2. Confira se o notebook detecta algo por USB. Use as interfaces do sistema descritas no caso 5; no Linux com `usbutils`, `lsusb` é uma consulta inicial.
3. No Windows, confira o dispositivo e o driver indicado no Gerenciador de Dispositivos; use apenas a orientação OEM/Google aplicável do guia. No Linux, erro explícito de permissão pede a regra/integração oficial da distribuição, não permissões globais.
4. Distinga Fastboot do bootloader e **fastbootd**, quando o dispositivo utiliza este último. O [AOSP documenta fastbootd em espaço de usuário](https://source.android.com/docs/core/architecture/bootloader/fastbootd); eles não oferecem necessariamente as mesmas operações.

**Ação segura e limite físico:** conferir modo e trocar por um cabo de dados conhecido pode exigir manipulação física. Se nenhum endpoint aparece no USB, uma instrução de flash não tem como corrigir a comunicação. Se aparece um modo de emergência diferente, siga [triagem](../recuperacao/triagem.md).

**Recuperação:** `devices` não escreve partições. Não use `flash`, `erase`, `format`, desbloqueio ou seleção de slot para “ver se reconhece”. Só saia do modo pelo método documentado do aparelho e preserve a receita original de instalação.

## 7. “Aparece root, mas não consigo controlar hardware”

**Onde:** identifique a camada antes de testar. Administrador Linux nativo, root Android, UID simulado pelo PRoot e bootloader desbloqueado são condições diferentes.

```sh
id
uname -r
cat /etc/os-release
```

Se entrou com `proot-distro login ...`, o `uid=0(root)` pode ser a identidade apresentada **dentro do ambiente simulado**. Ele não concede privilégios sobre o kernel Android, carregamento de módulos ou partições reais. O [proot-distro mantido pelo Termux](https://github.com/termux/proot-distro) explica que não é uma virtualização com kernel próprio.

**Verificação opcional somente no Android/Termux direto:** se você **já instalou root por um método documentado para o aparelho**, `command -v su` verifica o executável. `su -c id` solicita executar apenas a consulta `id` com o mecanismo root existente; pode abrir um pedido de autorização no Android. Use somente se deseja conceder essa autorização ao terminal confiável, e não dentro de PRoot para tentar promovê-lo.

**Saída ilustrativa:** `uid=0(root)` retornado pelo `su` real confirmado demonstra que aquele mecanismo concedeu root à consulta. Não comprova que SELinux, drivers, namespaces ou USB permitem a operação desejada. `su: not found` não ensina como instalar root e não informa o estado do bootloader.

**Conclusão permitida:** privilégios da camada testada. Um Linux nativo não precisa de Magisk Android para administrar seus pacotes; PRoot não vira nativo por mostrar root.

**Ação segura/recuperação:** volte ao [caminho escolhido](../escolha/index.mdx). Para root Android, [requisitos e riscos do método específico](../preparacao/root-magisk.md); para kernel sem recurso, [porting](../nativo/porting.md). Não execute um script universal para contornar esses requisitos. Os testes consultam estado; nenhuma partição deve ser alterada neste diagnóstico.

## 8. “SSH não conecta”

**Onde:** cliente no notebook; servidor no telefone. O guia [SSH desde zero](../projetos/ssh-remoto.md) mostra instalação dos dois lados. Windows/macOS/Linux usam cliente OpenSSH; um aplicativo Termux normalmente utiliza porta/configuração diferentes de uma imagem Linux nativa.

No **Linux nativo do telefone**, quando existe acesso local e `iproute2` está instalado:

```sh
ip address
ip route
ss -ltn
```

**No Termux sobre Android**, obtenha o endereço por **Configurações Android → Wi-Fi → rede conectada → detalhes**, conforme a interface do fabricante. Confira a porta do seu servidor pela [configuração SSH no Termux](../projetos/ssh-remoto.md), normalmente `8022` quando mantido o padrão. Android pode impedir consultas `ip`/`ss` mesmo com os pacotes instalados: `Permission denied` nessas ferramentas não comprova falha do SSH nem exige fazer root ou desativar SELinux. São políticas de acesso a informações de rede, incluindo [restrições Android a `/proc/net`](https://developer.android.com/about/versions/10/privacy/changes#proc-net) e o [caso documentado pelo Termux](https://github.com/termux/termux-app/issues/2993).

No notebook, confira o cliente (`ssh -V`, inclusive no PowerShell). Use o **endereço e a porta atuais**, obtidos no telefone; não reutilize um IP de ontem nem publique o endereço no relatório. A forma da chamada é `ssh -p PORTA_REAL CONTA_REAL@IP_REAL`, com os três marcadores substituídos. A documentação [OpenSSH](https://man.openbsd.org/ssh) explica a seleção de porta.

**Resultados possíveis:**

| Mensagem | Conclusão permitida | Verificação seguinte |
|---|---|---|
| `Connection refused` | Houve rejeição para aquele endereço/porta | Servidor/porta realmente configurados e política de rede; `ss -ltn` somente no contexto em que a consulta é permitida |
| Timeout / sem resposta | Comunicação não completou no prazo | Endereço, mesma rede, isolamento Wi-Fi, suspensão e estado do aparelho |
| `Permission denied` | Servidor respondeu, autenticação falhou | Conta, chave/porta/contexto e política do servidor |
| Aviso de chave do host diferente | Identidade recebida mudou | Conferir fingerprint por acesso confiável antes de modificar known_hosts |

Num ambiente que permite a consulta, um `LISTEN` em `127.0.0.1:22` aceita conexões locais, não certifica acesso pela LAN. Um `LISTEN` em outra porta precisa daquela porta na chamada. Em Linux nativo, `ss` sem privilégio pode listar portas sem mostrar o processo; isso não elimina a consulta.

**Ação segura:** use a ativação do servidor correspondente à distribuição/init descrita no guia, não `systemctl` num OpenRC. Confirme o fingerprint por uma tela/acesso confiável. Não desative `StrictHostKeyChecking` nem remova todas as chaves conhecidas para esconder um aviso.

**Limite físico e recuperação:** se o telefone perdeu rede e você não tem outro acesso, reconectar cabo/tela compatível pode ser indispensável. Consulta SSH não recupera um kernel em CrashDump. Volte à montagem/acesso anterior e use [triagem](../recuperacao/triagem.md). Não encaminhe SSH na internet para resolver uma falha de rede local.

## 9. “Wi-Fi conectado, mas não abre páginas”

**Onde:** telefone. Comece por **Configurações → Wi-Fi**, confira rede selecionada e, se houver, o pedido de autenticação/captive portal. Estar associado ao ponto de acesso não comprova endereço, rota, DNS ou acesso externo.

No Linux nativo com `iproute2`:

```sh
ip address
ip route
```

Se **NetworkManager já é o gerenciador utilizado**, com `nmcli` disponível, estas consultas acrescentam estado:

```sh
nmcli device status
nmcli general status
```

A [referência nmcli](https://www.networkmanager.dev/docs/api/latest/nmcli.html) documenta consulta de dispositivos e estado. A ausência de NetworkManager num port que utiliza outro gerenciador não é defeito por si só.

**Leia a saída:** um endereço IPv4 apropriado na interface Wi-Fi e uma rota `default` são evidências de configuração IPv4, não garantia de internet. Redes somente IPv6 exigem leitura correspondente de `ip -6 route`; não declare falha apenas por não haver IPv4. Interface/nomes variam, por isso não copie `wlan0` como obrigatório.

Se `getent` existe, `getent hosts example.org` consulta resolução pelo sistema. Se `curl` já está instalado, `curl -I --max-time 15 https://example.org` tenta obter cabeçalhos HTTPS de um site público de exemplo, sem fornecer senha. Esse teste acessa a rede; falha de HEAD/proxy/TLS não prova ausência total de internet. Abra também o navegador e leia sua mensagem. Instale `curl` pelo pacote da distribuição somente se necessário; `getent` pertence à integração da biblioteca C e não deve motivar sua substituição. As opções de cabeçalhos e limite de tempo estão no [manual oficial curl](https://curl.se/docs/manpage.html).

**Saída ilustrativa:** uma resposta HTTP com código `200` indica que aquela requisição completou. “Could not resolve host” localiza o problema antes da conexão ao destino, mas ainda precisa de investigação do DNS/configuração. Falha de certificado pede conferir data/hora e política da rede, não `--insecure`.

**Ação segura:** entre no portal autorizado; obtenha certificados/método correto para Wi-Fi empresarial; corrija data pela interface quando necessário. Não desative validação 802.1X. Se está por SSH usando o mesmo Wi-Fi, não remova o perfil nem reinicie o gerenciador antes de preparar outro acesso. Continue em [Wi-Fi](../hardware/wifi.md).

**Recuperação:** consultas não mudam perfis. Qualquer edição posterior deve preservar o perfil anterior. Sem sinal, antena/driver/firmware compatível podem ser requisitos; instalar GNOME não fornece automaticamente o suporte que falta.

## 10. “Desktop preto”, “só aparece a logo” ou CrashDump

**Onde:** se SSH responde, consultas no telefone. Observe também fisicamente: monitor sem sinal, logo de boot, tela iluminada sem imagem e mensagem de crash são estados diferentes. A luz do teclado não prova que o Linux esteja vivo.

Com uma shell Linux nativa operacional:

```sh
uptime
cat /proc/sys/kernel/random/boot_id
cat /proc/1/comm
ps
```

`ps` simples funciona nas implementações comuns e pode truncar argumentos; para árvore/listagem completa, prepare procps/ripgrep conforme [GNOME nativo](../desktop/gnome-nativo.md). Não use opções de procps supondo que o BusyBox as implemente. As variáveis `XDG_*` de um SSH não representam automaticamente o desktop local.

**Leitura:** uptime curto e boot ID diferente do registro anterior indicam novo boot. Mesmo boot ID com aplicativos fechados permite investigar reinício da sessão/compositor sem confundi-lo com reboot. Isso requer uma leitura anterior do mesmo aparelho: um UUID isolado não prova histórico.

Se PID 1 e a documentação confirmam **systemd**, consulte:

```sh
systemctl status display-manager --no-pager
journalctl -b -n 80 --no-pager
```

Se a integração confirmada usa **OpenRC**:

```sh
rc-status -a
rc-update show
ls -l /var/log
```

Permissão insuficiente para logs não equivale a “sem erros”. Use o administrador existente quando autorizado; o serviço específico e o arquivo de log devem ser identificados pela imagem. Não instale journald num OpenRC para reproduzir uma receita systemd.

**Conclusão permitida:** SSH vivo aponta que o sistema não está inteiramente parado, mas vídeo/desktop ainda podem falhar. Display manager parado localiza uma etapa; não informa por que ele falhou. “Só a logo” sem acesso pode ainda ser boot, firmware, sistema de arquivos ou saída diferente.

**Ação segura:** confira o [diagnóstico de boot e crash](boot-crash.md), [GPU](../hardware/gpu.md) e [sessão nativa](../desktop/gnome-nativo.md). Se a tela mostra **Qualcomm CrashDump**, o sistema de manutenção pode não existir mais: não continue enviando resets de USB como se fosse só um display desligado. Registre a mensagem e use a recuperação **do modelo**, sem combinações de botões universais. Depois do retorno, `ls -l /sys/fs/pstore` verifica se existe armazenamento de crash; pasta ausente/vazia não descarta a falha.

**Recuperação:** preserve registros antes de reiniciar quando ainda há acesso. Um reboot encerra processos e pode perder logs voláteis. Não faça flash nem apague configurações do GNOME para tratar um crash de kernel; siga [triagem](../recuperacao/triagem.md).

## 11. “Monitor preto” ou “HDMI volta, mas hub não volta”

**Onde:** observação física no monitor e consulta no telefone. Primeiro salve documentos, suspenda gravações e não remova armazenamento USB montado. Se a única tela está quebrada e não há SSH, mudar cabos pode deixar o aparelho sem controle.

**Leia nesta ordem:**

1. O monitor abre seu próprio menu? Se não, confira sua alimentação/manual. Se abre, selecione a entrada em uso, por exemplo HDMI.
2. Identifique cada conexão: monitor alimentado, HDMI hub→monitor, cabo principal hub→telefone, PD separado quando suportado. USB-C “Data” do hub não comprova saída DP. Consulte [USB-C e hubs](../hardware/usb-c-hubs.md).
3. O port do **modelo** documenta vídeo nessa saída? Funcionar no Android não certifica o driver Linux. Uma sessão remota visível no notebook não comprova sinal no monitor.
4. No telefone nativo que expõe DRM, consulte os conectores, sem escrever em seus atributos:

```sh
for conector in /sys/class/drm/card*-*; do
    [ -f "$conector/status" ] || continue
    printf '\n%s\n' "$conector"
    cat "$conector/status"
    [ ! -f "$conector/modes" ] || cat "$conector/modes"
done
```

**Saída ilustrativa:** um conector mostra `connected` e `1920x1080`. Isso indica reconhecimento e um modo listado; **não comprova scanout correto nem imagem física**. `disconnected` indica ausência de detecção naquela leitura; não distingue cabo, entrada, negociação, energia e driver. Sem saída do bloco, o port pode não expor essa interface ou os conectores esperados.

**Ação segura:** quando há imagem em outra tela suportada, abra **Configurações → Telas** e confira disposição, monitor habilitado e modo oferecido. Aplique uma mudança por vez e use a reversão do diálogo se a imagem desaparecer. Não force EDID/resolução arbitrária, não escreva USB role e não descarregue o controlador para “reativar”.

**Teste físico que reduz hipóteses:** compare reconectar **só HDMI** com reconectar **só o cabo principal do hub**, mantendo as outras ligações. Registre vídeo, input, boot ID e continuidade dos aplicativos separadamente. Se uma operação já causa crash, pare os ciclos e preserve logs: ela precisa de [diagnóstico de hotplug](../hardware/video-hotplug.md), não de repetir o mesmo teste indefinidamente.

**Conclusão e recuperação:** HDMI que recupera e hub que não recupera localizam uma diferença de negociação/topologia; não certificam qual driver é culpado. Retorne à montagem previamente observada como estável, com a energia exigida pelos manuais. Reiniciar o compositor fecha aplicativos e pode mascarar uma falha de sessão; não declare correção permanente por um único retorno da imagem.

## 12. “O mouse USB funciona, mas o teclado não”

**Onde:** telefone Linux nativo. Use o mouse como comparação; periféricos no mesmo hub podem seguir interfaces, energia e drivers diferentes. Se o teclado é Bluetooth, USB não é sua cadeia: use [Bluetooth](../hardware/bluetooth.md) antes de aplicar este roteiro.

Prepare `usbutils`, `evtest` e, se necessário, `libinput-tools` pelo [guia de ferramentas](instalar-ferramentas.md). Depois consulte:

```sh
lsusb
lsusb -t
cat /proc/bus/input/devices
ls -l /dev/input
```

**Leia em ordem:** encontre hub/mouse/teclado por nomes/identificadores; em `lsusb -t`, compare os drivers de interface; em `/proc/bus/input/devices`, encontre o nome de cada periférico e seus handlers `eventN`. Um dispositivo USB pode ter várias interfaces HID, inclusive teclas de mídia; não escolha o primeiro `eventN` só pelo número.

**Exemplo ilustrativo:** o mouse tem interface `Driver=usbhid` e um handler `event6`; o teclado tem USB listado, mas nenhum handler de teclado identificado. A divergência está entre reconhecimento USB e registro input, ainda sem estabelecer a causa exata. `lsmod` sem `usbhid` não comprova ausência: um driver pode estar compilado diretamente no kernel.

Para testar, use o administrador documentado e execute `sudo evtest`, substituindo por `doas evtest` se essa é a integração existente. Leia a lista, escolha **o número correspondente ao teclado real** e pressione/solte A, Shift e Enter. Não use `--grab`. Pare com Ctrl+C **antes de digitar qualquer senha**, e não publique um log com texto privado.

**Evidências possíveis:**

| Observação | Conclusão permitida | Próxima camada |
|---|---|---|
| Teclado não aparece no USB | Não enumerou nessa observação | Cabo/porta/periférico, energia, host e logs |
| USB aparece, sem interface/input adequado | Enumeração não virou teclado utilizável | HID, configuração/driver do kernel e descriptors |
| `EV_KEY / KEY_A` aparece ao pressionar/soltar | Eventos de tecla chegam ao input do kernel | libinput, seat, sessão e foco |
| Eventos chegam, letras diferentes aparecem | Entrada funciona, tradução pode estar incorreta | Layout/fontes de entrada |

Se o kernel recebe teclas, consulte `sudo libinput list-devices` pelo administrador existente e compare `Capabilities: keyboard`, dispositivo e seat. A [documentação libinput](https://wayland.freedesktop.org/libinput/doc/latest/tools.html) esclarece que essa ferramenta não mostra toda a configuração do compositor. A [documentação input do kernel](https://docs.kernel.org/input/input.html) descreve a camada anterior.

**Ação segura:** clique num campo de texto da sessão **física** e teste; uma sessão VNC separada pode usar outros dispositivos/seat. Para mapear isso, [acesso remoto](../desktop/acesso-remoto.md). Se faltar permissão para a ferramenta, use administração já autorizada, não `chmod 666` nos dispositivos input. A configuração persistente correta depende da camada confirmada: [teclados USB](../hardware/teclados-usb.md).

**Limite físico e recuperação:** trocar por uma porta/teclado conhecido pode ser necessário depois da coleta. Pare as capturas; as consultas não alteram drivers. Não copie quirks/udev de outro modelo apenas porque o nome comercial do teclado parece semelhante.

## 13. “Conectei PD e os periféricos apagaram” ou “a bateria não sobe”

**Onde:** telefone e montagem física. Entrada PD do hub não é sinônimo de porta de dados, e papéis de energia/dados são separados. Um telefone pode receber energia e atuar como host quando hardware e drivers suportam essa combinação. O [framework USB-C do kernel](https://docs.kernel.org/driver-api/usb/typec.html) descreve esses papéis; sua presença física não garante integração completa no port.

Primeiro, **sem trocar mais cabos**, anote se vídeo, teclado e mouse continuam e consulte `lsusb -t`. Compare com o registro anterior: houve desaparecimento dos dispositivos ou eles ficaram listados sem eventos? São falhas distintas.

Descubra as fontes de alimentação expostas, sem assumir que a bateria se chama `battery`:

```sh
for fonte in /sys/class/power_supply/*; do
    [ -d "$fonte" ] || continue
    printf '\n%s\n' "$fonte"
    for atributo in type status capacity online; do
        [ -f "$fonte/$atributo" ] || continue
        printf '%s: ' "$atributo"
        cat "$fonte/$atributo"
    done
done
```

Identifique a entrada cujo `type` é `Battery`. Para uma apresentação com o nome de cada campo e acompanhamento local, leia os arquivos reais desse diretório, por exemplo `cat /sys/class/power_supply/NOME_REAL/capacity`, substituindo **NOME_REAL** pelo encontrado. Os diretórios podem representar fontes, bateria e componentes auxiliares; não some porcentagens nem copie nomes de outro aparelho.

**Saída ilustrativa:** `Battery`, `Charging`, `35` é um registro de estado e capacidade. Releia a mesma bateria após 10–15 minutos de trabalho leve, anotando horário. `Charging` informa estado relatado pelo driver, mas sozinho não prova crescimento sustentado. Carga completa, temperatura e política podem interromper o aumento; consumo alto e fonte insuficiente também exigem investigação. A [classe power supply](https://docs.kernel.org/power/power_supply_class.html) define atributos/unidades e permite ausência de campos não fornecidos pelo hardware.

**Ação física com propósito:** confira carregador, perfis/limites indicados na etiqueta, cabo, porta PD e manual do hub. Uma fonte “5 V” pode ser só um dos perfis; não conclua potência negociada só pela inscrição ou pela luz acesa. Sem ferramenta/driver que exponha contrato, registre **negociação desconhecida**. Não use a porta do notebook como fonte equivalente garantida a um carregador PD de tomada.

**Conclusão permitida:** correlação entre troca de alimentação e falha; a camada só é determinada comparando logs USB/Type-C/energia e input. Hotplug de PD que desliga periféricos pode expor limitação elétrica, firmware do hub ou integração de role switching. Não é automaticamente autosuspend; este mecanismo tem [comportamento próprio documentado](https://docs.kernel.org/driver-api/usb/power-management.html).

**Recuperação:** salve trabalhos, ejete armazenamento e volte à topologia anteriormente validada **respeitando a energia necessária dos aparelhos**. Não escreva limites de corrente, tensão, `power/control`, role ou unbind do controlador como conserto universal. Se a bateria segue caindo para nível crítico, interrompa uso e carregue pela conexão conhecida. Continue em [energia](../hardware/energia.md) e [hubs](../hardware/usb-c-hubs.md); montagem com crash pede triagem, não ciclos automáticos de reset.

## 14. “A imagem funciona, mas não sai som”

**Onde:** sessão gráfica do telefone e dispositivo físico escolhido. Comece por **Configurações → Som → Saída**. Selecione a saída correta, retire mudo, use volume moderado e o teste oferecido. Se a saída é HDMI, confira alto-falantes/saída de áudio no manual do monitor e seu próprio volume. O [GNOME documenta seleção e teste](https://help.gnome.org/gnome-help/sound-usespeakers.html).

Para separar driver de sessão, com `alsa-utils` disponível:

```sh
aplay -l
arecord -l
```

Esses comandos **listam**, sem reproduzir/gravar. `aplay -l` lista dispositivos de reprodução ALSA; `arecord -l`, captura. Um dispositivo listado não comprova que mixer, rota e amplificador estejam prontos. Ausência pode indicar suporte/inicialização ou acesso/contexto; confira mensagens, não instale outro servidor de áudio de imediato.

Se o desktop **já utiliza PipeWire/WirePlumber**, execute `wpctl status` na conta/contexto da sessão; um SSH sem esse contexto pode falhar para conectar e não provar que o áudio local parou. A [referência wpctl](https://pipewire.pages.freedesktop.org/wireplumber/man/wpctl.html) distingue dispositivos, saídas, entradas e fluxos.

**Saída ilustrativa:** uma seção `Sinks` com saída HDMI não é um microfone; uma fonte chamada “Monitor de…” pode capturar o áudio reproduzido. Não selecioná-la como microfone numa videochamada. Um sink padrão errado pode explicar ouvir no telefone enquanto esperava ouvir no monitor.

**Conclusão permitida:** quando o teste toca em outra saída, o áudio funciona nela; o caminho HDMI continua pendente. Quando ALSA aparece, mas a sessão não oferece saída, investigue integração de perfil/roteamento. Quando o monitor não possui alto-falantes, nenhum pacote cria esse hardware.

**Ação segura e recuperação:** altere a saída pelo painel e teste novamente; retorne à opção anterior se necessário. No Android/PRoot, ALSA direto não é automaticamente acessível; [desktop sobre Android](../android/desktop.md) utiliza outra arquitetura. Não apague estado PipeWire/WirePlumber nem execute mixers específicos Qualcomm sem a receita do port. Continue em [áudio](../hardware/audio.md).

## 15. “A câmera abre num app, mas Meet/navegador não encontra”

**Onde:** telefone, sessão e aplicação. Um sensor, uma câmera Android HAL, um nó V4L2 e uma câmera exposta ao navegador não são a mesma interface. A cadeia depende do driver, do pipeline, do port e do backend utilizado pela aplicação.

Comece pela interface: confira se o aplicativo tem seleção de câmera, se o navegador pediu/recebeu permissão **para aquele site**, se há bloqueio no ícone de permissões e se outro aplicativo está usando a câmera. Feche apenas a captura que você abriu para liberar o recurso, sem encerrar toda a sessão. Não forneça autorização a sites desconhecidos para testar.

No Linux nativo, consulte sem iniciar captura:

```sh
ls -l /dev/video* /dev/media* 2>/dev/null
```

Com `v4l-utils` instalado pelo repositório correto:

```sh
v4l2-ctl --list-devices
```

**Saída ilustrativa:** dois `/dev/videoN` podem ser partes de um codec/pipeline, não duas câmeras prontas. Nó existente não certifica imagem, formato nem permissão da sessão. A [API de captura V4L2](https://docs.kernel.org/userspace-api/media/v4l/dev-capture.html) distingue capacidades de captura; o [guia de câmeras](../hardware/cameras.md) mostra como identificar o nó correto antes de listar seus formatos.

Se a arquitetura do desktop já passa vídeo por PipeWire, `wpctl status` pode acrescentar o que o servidor da sessão expõe; a ausência ali não prova, sozinha, que nenhum aplicativo utiliza câmera por outro backend. Dentro de PRoot, listar arquivos não concede acesso ao hardware Android; use somente um método de integração documentado para esse caminho.

**Conclusão permitida:** se um app específico mostra imagem real e o navegador não enumera câmera, a divergência pode estar na interface/formato/backend/permissão; não significa automaticamente sensor quebrado. Se o app usa uma ponte HAL experimental, o navegador não passa a reconhecê-la como V4L2 sem uma integração adicional.

**Ação segura:** registre nome do app, backend documentado, câmera selecionada e permissões do site. Use [câmeras e privacidade](../hardware/cameras.md) para o pipeline apropriado. Não carregue módulos, faça flash de firmware ou crie dispositivos loopback sem confirmar kernel e receita. Resolução anunciada pelo Android não garante o mesmo modo no Linux: formatos/modos precisam estar implementados e validados.

**Recuperação e limite físico:** feche a captura; restaure somente as permissões que alterou. Se um teste de câmera já causou CrashDump, não repita para preencher uma tabela. Preserve logs e siga [boot/crash](boot-crash.md). Uma webcam USB compatível pode ser alternativa quando a câmera interna não tem suporte, mas requer enumeração, energia e permissão próprias.

## Como pedir ajuda com informações úteis

Depois do roteiro correspondente, você deve conseguir dizer **o que foi observado e o que ainda não foi demonstrado**. Use este modelo, preenchendo resultados reais e retirando identificadores pessoais:

```text
Modelo exato / variante:
Caminho: Android, Termux, PRoot, chroot ou Linux nativo:
Distribuição e versão / kernel / arquitetura:
Onde o comando foi executado:
Conta comum ou administração confirmada: (sem senha)
Sintoma e momento em que ocorre:
Montagem física e alimentação:
Comando exato e mensagem de erro relevante:
O que ainda funciona:
Teste que separou as hipóteses:
Alterações já feitas e backup disponível:
Recuperação/acesso alternativo disponíveis:
```

“O teclado aparece no USB, mas não cria input” é mais útil que “o Linux não funciona”. “Depois de conectar PD, os dispositivos desaparecem do USB e o boot ID não muda” separa uma falha de USB de um reboot. “Monitor `connected`, mas fisicamente sem imagem” evita concluir sucesso apenas pelo registro do sistema.

Se ainda falta uma observação física, identifique precisamente qual: menu do monitor, cabo/porta, aceitação RSA, outro periférico ou estado de crash. Nenhum comando remoto consegue medir sozinho o que a tela física está mostrando. Continue pelo [método de diagnóstico](metodo.md) para testes avançados, [triagem de recuperação](../recuperacao/triagem.md) para falha de boot e [contribuição](../comunidade/contribuir.md) para registrar evidências verificáveis. Logs de falha são úteis quando preservados com contexto; a [orientação do kernel para investigar bugs](https://docs.kernel.org/admin-guide/bug-hunting.html) explica essa importância.
