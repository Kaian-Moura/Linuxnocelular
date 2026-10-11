---
title: Dez microaulas para entender o projeto
description: Aprenda os fundamentos com exemplos, exercícios seguros e resultados que você consegue conferir antes de modificar o telefone.
sidebar_position: 5
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você não precisa decorar todos os termos antes de começar. Precisa reconhecer **qual aparelho, qual sistema e qual camada** uma instrução modifica. Este curso serve para treinar essa leitura. Faça uma aula por vez e escreva as respostas num arquivo de notas do computador. Os exercícios não desbloqueiam o bootloader, não gravam partições e não trocam o sistema do telefone.

**Resultado esperado:** conseguir preencher um inventário, escolher um caminho inicial e explicar como verificará e recuperará uma alteração. Dificuldade: iniciante. Reserve cerca de dez minutos por aula, sem obrigação de fazer todas no mesmo dia. Materiais: esta documentação, editor de texto e, para os exercícios opcionais, computador com terminal e seu próprio telefone Android. Se ADB ainda não está instalado/autorizado, faça primeiro a parte pela interface; prepare-o no [tutorial ADB/Fastboot](../preparacao/adb-fastboot.md) quando necessário.

Cada exercício informa onde acontece. **Terminal no computador** e **terminal no telefone** são lugares diferentes. Um terminal conectado por SSH executa comandos no aparelho remoto; abrir esse terminal no notebook não transforma o comando em operação local. Consulte [primeiros passos no terminal](terminal-primeiros-passos.md) se isso ainda não estiver claro. Nenhum exercício exige `sudo` ou root.

## Aula 1 — nome comercial, código do modelo e build

### Entenda com um exemplo

“Tenho um Galaxy” identifica uma família, não o alvo de uma imagem de sistema. Mesmo um nome completo pode reunir variantes de região, operadora e hardware. O **código do modelo** diferencia o produto; o **codinome** costuma identificar o dispositivo em um projeto; a **build** identifica a versão concreta do software instalado. O processador é uma peça desse inventário, não substitui o modelo.

Uma página que aceita o modelo X não aceita automaticamente X Pro. Uma imagem de um telefone com Snapdragon 888 não serve em todo Snapdragon 888: placas, tela, armazenamento e configuração de boot podem divergir. No projeto do OnePlus 9 Pro, essa distinção é especialmente importante porque conseguir iniciar uma imagem não confirma câmera, hub ou aceleração gráfica.

### Faça o exercício

**Local: interface do telefone Android; anotação no computador.** Abra Configurações → Sobre o telefone, ou procure “modelo” na busca das configurações. Copie o código do modelo, versão Android, número da versão/build e nível do patch de segurança. Não publique IMEI nem número de série. Se um campo não aparecer, escreva “não localizado” e a tela consultada.

**Opcional: terminal do computador, com um único telefone e ADB autorizado.**

```bash
adb devices -l
adb shell getprop ro.product.model
adb shell getprop ro.product.device
adb shell getprop ro.build.fingerprint
```

`devices -l` lista conexões; `shell` pede ao Android que execute a consulta; `getprop` lê uma propriedade. A impressão digital da build pode ser longa. Copie o texto inteiro para sua ficha local e confronte com as telas, sem tratá-lo como única prova da variante. Se houver vários aparelhos, pare e use a seleção de alvo explicada no tutorial ADB.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** pelo menos um código de modelo e uma versão/build, cada um com a origem da informação. Um campo desconhecido continua desconhecido; não complete por semelhança com uma foto de anúncio.

**Erro comum:** a consulta retorna `unauthorized`. Isso significa falta de autorização ADB, não incompatibilidade com Linux. Faça a autorização física documentada; não desbloqueie o bootloader para resolver isso.

**Aprofunde:** [inventário completo](../compatibilidade/inventario.md) e [como ADB se comunica com o Android](https://developer.android.com/tools/adb).

## Aula 2 — kernel, distribuição e desktop são camadas diferentes

### Entenda com um exemplo

O **kernel** é o núcleo que administra processos, memória e acesso ao hardware. A **distribuição** reúne programas, bibliotecas, pacotes e políticas de administração. O **desktop** oferece janelas, menus e integração visual. Android usa um kernel Linux, mas isso não o torna uma instalação Debian com GNOME. O caminho entre um aplicativo e o hardware passa por componentes diferentes nos dois sistemas.

Imagine que um teclado aparece no USB, mas nenhum dispositivo de entrada é criado. Trocar o tema do GNOME não altera o driver. Agora imagine que existem eventos de teclado e apenas uma aplicação não reage: trocar o kernel antes de verificar foco e sessão gráfica seria começar pela camada errada. Essa leitura evita atribuir todo problema ao “Linux”.

### Faça o exercício

**Local: papel ou editor de notas.** Complete a frase: “Quero usar a distribuição ___, com desktop ___, sobre kernel do ___, mantendo/substituindo Android”. Se ainda não escolheu, escreva “a decidir”; consulte os caminhos antes de preencher.

**Opcional: terminal de um sistema Linux já funcionando, no computador ou no telefone — anote qual.**

```bash
uname -r
cat /etc/os-release
```

O primeiro lê a versão do kernel em execução. O segundo lê a identificação da distribuição naquele ambiente. Não está instalando nem atualizando nada. Em um Debian via PRoot, `os-release` pode identificar Debian e `uname` continuar mostrando o kernel do Android: esse resultado demonstra compartilhamento do kernel, não instalação nativa. No Android puro, `/etc/os-release` pode não existir.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** você consegue dizer que versão do kernel e nome da distribuição respondem perguntas diferentes. GNOME é outra camada, não um novo kernel.

**Erro comum:** concluir que Wi-Fi funcionará no Linux nativo porque funciona no Android. O port precisa fornecer o caminho apropriado de driver, firmware e configuração; instalar um desktop não demonstra esse suporte.

**Aprofunde:** [Linux e Android](../fundamentos/linux-android.md), [boot e kernel](../fundamentos/boot-kernel.md) e [visão do kernel na arquitetura Android](https://source.android.com/docs/core/architecture/kernel).

## Aula 3 — ADB, root e bootloader não são três nomes para o mesmo acesso

### Entenda com um exemplo

**ADB** é uma ferramenta de comunicação e depuração com um sistema que oferece `adbd`, após a autorização pertinente. **Root** é privilégio administrativo dentro de um sistema em execução. **Bootloader** é um componente anterior ao sistema operacional, responsável por iniciar o código aceito pela política de boot do aparelho. Desbloqueá-lo muda essa política; não instala automaticamente Linux nem concede automaticamente root ao Android.

Um Android original pode permitir ADB com bootloader bloqueado e sem root. Um postmarketOS instalado pode oferecer `sudo` e SSH sem oferecer ADB. Também pode haver fabricante que permita ADB e proíba desbloqueio. A arquitetura geral do AOSP descreve esses mecanismos, mas a elegibilidade é determinada pela implementação do aparelho. A operação de desbloqueio costuma apagar dados e requer preparação própria.

### Faça o exercício

**Local: editor de notas, sem executar comandos de manutenção.** Classifique as três necessidades:

1. Copiar fotos acessíveis pelo ADB de um Android autorizado.
2. Instalar um pacote de sistema em um Linux nativo já funcionando.
3. Iniciar uma imagem alternativa quando o fabricante exige desbloqueio.

Depois responda: “Tenho ADB, então já posso gravar qualquer imagem?” e “Tenho root, então meu aparelho aparece na lista de dispositivos suportados?”

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** a primeira é comunicação/autorização e acesso aos arquivos permitidos; a segunda envolve administração do sistema; a terceira envolve a política de boot e o método específico do port. As duas perguntas finais têm resposta **não**. Root e desbloqueio não criam um port ou drivers.

**Erro comum:** entrar em Fastboot e esperar que `adb devices` continue listando o aparelho. São protocolos/estados distintos. A lista vazia do ADB, nesse contexto, não prova que o aparelho morreu. Outra confusão é usar `sudo` no computador e achar que isso tornou o telefone root: o privilégio foi aplicado ao computador.

**Aprofunde:** [bootloader e elegibilidade](../compatibilidade/bootloader.md), [desbloqueio com condições e backup](../preparacao/desbloquear-bootloader.md), [root e Magisk](../preparacao/root-magisk.md) e [política de bloqueio do AOSP](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking).

## Aula 4 — ARM64 descreve o processador; não garante que um programa abra

### Entenda com um exemplo

O conjunto de instruções é a linguagem de máquina entendida pela CPU. Uma **ABI** define convenções necessárias para componentes binários trabalharem juntos. Ainda há o sistema operacional, bibliotecas, formato do programa e versões esperadas. No Android, `arm64-v8a` é um nome de ABI; em muitas ferramentas Linux aparece `aarch64`, e Debian usa `arm64` como nome de arquitetura de pacotes. Esses nomes próximos não tornam um APK, um pacote Debian e um programa Alpine intercambiáveis.

Um notebook pode ser `x86_64` e preparar imagens para um telefone ARM64 usando ferramentas apropriadas. Isso não significa executar diretamente o binário ARM64 no notebook. Um programa Linux ARM64 também pode depender de glibc enquanto o ambiente usa musl. O suporte ao hardware do telefone é uma verificação adicional, independente da arquitetura do programa.

### Faça o exercício

**Local: notas.** Para cada download, marque o que falta confirmar:

| Oferta de download fictícia | Perguntas que você deve fazer |
| --- | --- |
| “Aplicativo ARM64” | Para Android, Linux ou outro sistema? Qual formato e biblioteca? |
| “Imagem Linux para Snapdragon” | Qual modelo, variante, layout e instrução de instalação? |
| “Programa Linux x64” | Meu ambiente é x86-64? Isso se refere ao computador ou telefone? |

**Opcional: terminal do computador com ADB já autorizado.**

```bash
adb shell getprop ro.product.cpu.abilist
```

Esse comando consulta as ABIs anunciadas pelo Android. Não o use como prova do suporte a Linux nativo. Se fizer `uname -m` num terminal Linux, registre onde o executou: o resultado pode ser a arquitetura do computador, não do telefone.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** uma lista de perguntas que inclui arquitetura **e** plataforma. Se o Android anunciar ABIs de 64 e 32 bits, você registra ambas; não escolhe firmware somente pela primeira.

**Erro comum:** `Exec format error` ao abrir um binário. Pode indicar arquitetura/formato inadequado. Não tente corrigir com permissões ilimitadas ou root; volte à origem e à plataforma do download.

**Aprofunde:** [inventário de arquitetura](../compatibilidade/inventario.md), [programação em ARM](../projetos/desenvolvimento.md) e [ABIs documentadas no Android NDK](https://developer.android.com/ndk/guides/abis).

## Aula 5 — caminho, pasta atual e permissão

### Entenda com um exemplo

`Downloads/arquivo.zip` é um caminho relativo à pasta em que você está. `/home/ana/Downloads/arquivo.zip` é um caminho absoluto em um exemplo Linux. `/` designa o início da árvore de arquivos; `/root` costuma ser a pasta pessoal da conta root. Nenhum deles é a mesma coisa que “a raiz do Android”, expressão vaga que deve ser substituída por um caminho concreto.

Permissões controlam acesso. Em arquivos, leitura, escrita e execução são operações diferentes. Em diretórios, a permissão de execução permite percorrer o caminho. A opção “pode executar” não transforma um ZIP em instalador, nem torna confiável um script baixado. A propriedade do arquivo e os mecanismos adicionais de segurança também importam.

### Faça o exercício

**Local: terminal Linux ou macOS do computador, sem SSH.**

```bash
pwd
ls -ld .
id
```

`pwd` mostra a pasta atual; `ls -ld .` mostra os atributos dessa pasta; `id` mostra sua identidade/grupos. Aqui `.` significa “esta pasta”. Apenas consulte: não mude permissões. No Windows, faça a parte equivalente abrindo uma pasta no Explorador, copiando seu caminho e consultando Propriedades; a interpretação das permissões Unix não se aplica diretamente ao painel Windows.

**Exercício em notas:** suponha que a pasta atual seja `/home/ana` e o arquivo esteja em `/home/ana/Downloads/imagem.zip`. Qual caminho relativo descreve esse arquivo? O que muda se você passar a estar em `/home/ana/Documentos`?

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** na primeira situação, `Downloads/imagem.zip`; na segunda, `../Downloads/imagem.zip`, porque `..` aponta à pasta superior. Esses caminhos são didáticos, não nomes de firmware para baixar. Você também deve distinguir a conta atual de seu diretório atual.

**Erro comum:** “No such file or directory” seguido de uma tentativa com `sudo`. Privilégio não corrige um caminho inexistente. Confira grafia, maiúsculas, pasta atual e extração. Um nome com espaços precisa ser tratado como um único argumento, conforme a aula de terminal.

**Aprofunde:** [terminal passo a passo](terminal-primeiros-passos.md), [pastas e downloads](computador-downloads.md) e [seção de arquivos/permissões da referência Debian](https://www.debian.org/doc/manuals/debian-reference/ch01.en.html#_unix_like_filesystem).

## Aula 6 — estar no Wi-Fi, ter endereço e ter internet

### Entenda com um exemplo

Uma conexão Wi-Fi liga seu dispositivo a uma rede. Um **endereço IP** identifica uma interface nesse contexto. Um **roteador/gateway** pode encaminhar o tráfego para outras redes. **DNS** resolve nomes como os dos sites. Você pode ter comunicação local sem internet, internet no navegador sem acesso SSH ao telefone, ou um endereço correto com isolamento entre clientes imposto pela rede.

Considere dois dispositivos em casa e um notebook na faculdade. O endereço privado do telefone em casa não é, por si só, um endereço alcançável da faculdade. Compartilhar esse número não cria rota nem túnel. `localhost` se refere ao próprio sistema em que o programa opera: no navegador do notebook, não significa automaticamente o telefone. Containers e alguns ambientes acrescentam outras fronteiras de rede.

### Faça o exercício

**Local: interface do computador.** Abra detalhes da conexão Wi-Fi e anote endereço IPv4/IPv6, gateway quando houver e nome da rede. Consulte os detalhes do Wi-Fi no telefone e compare. Não publique endereços e identificadores da sua rede sem necessidade.

**Opcional: terminal Linux do computador com a ferramenta `ip` disponível.**

```bash
ip address show
ip route show
```

Ambos consultam o estado; não trocam rotas. Se a ferramenta não existir, use os detalhes da interface gráfica, sem instalar nada para concluir esta aula. No PowerShell Windows, `Get-NetIPConfiguration` é uma consulta equivalente para esta finalidade; a saída tem outro formato.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** identificar a conexão em uso e explicar que “tem endereço”, “alcança outro aparelho” e “acessa a internet” são testes diferentes. Um endereço `127.0.0.1` é local; endereços privados como `192.168.x.x` não demonstram acesso vindo de qualquer lugar.

**Erro comum:** abrir a porta SSH do roteador antes de entender o alcance. Não faça isso nesta aula. Primeiro prepare autenticação e um acesso local documentado; para redes diferentes, avalie um túnel/VPN com política apropriada.

**Aprofunde:** [SSH e acesso remoto](../projetos/ssh-remoto.md), [Wi-Fi e conectividade](../hardware/wifi.md) e [conceitos de rede na referência Debian](https://www.debian.org/doc/manuals/debian-reference/ch05.en.html).

## Aula 7 — hospedeiro, ambiente interno e cliente/servidor

### Entenda com um exemplo

O **hospedeiro** fornece a base de execução. Um ambiente interno pode compartilhar seu kernel, como chroot/PRoot, ou ser uma máquina virtual com outra estrutura. Não chame toda janela de Linux de “máquina virtual”: o método muda o que você pode administrar. No Debian via PRoot, aparecer `root` no terminal não concede privilégio administrativo ao Android hospedeiro.

**Cliente** e **servidor** descrevem papéis em uma comunicação. O cliente SSH no notebook pede uma sessão; o servidor SSH no telefone a atende; os comandos dessa sessão rodam no telefone. No VNC, o visualizador exibe uma sessão servida em outro contexto. GNOME num servidor remoto e GNOME como sessão principal do telefone podem parecer semelhantes na captura de tela e continuar sendo arquiteturas diferentes. Uma imagem vista no notebook não comprova saída HDMI no hub.

### Faça o exercício

**Local: papel/notas, sem iniciar serviços.** Desenhe três caixas: “notebook”, “Android” e “Debian no PRoot”. Ligue-as e escreva onde cada ação acontece:

1. Baixar Platform-Tools para o notebook.
2. Abrir Termux no telefone.
3. Entrar no Debian por PRoot e instalar um pacote nele, seguindo seu tutorial.
4. Ver a tela desse ambiente por um cliente remoto no notebook.

Depois desenhe a alternativa “postmarketOS nativo no telefone → GNOME → monitor”. Marque onde Android deixa de ser a base desse segundo caminho.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** você distingue o local da ferramenta, do sistema interno e da apresentação da imagem. O pacote Debian da terceira ação pertence ao Debian interno; não instala um driver no kernel Android. O visualizador da quarta ação não torna o notebook necessário para todo método, mas aquele acesso específico depende dele.

**Erro comum:** seguir comandos de serviços de um Linux nativo dentro do PRoot e esperar que substituam o boot do Android. Antes do comando, determine qual sistema controla a inicialização.

**Aprofunde:** [PRoot](../android/proot-distro.md), [chroot](../android/chroot.md), [virtualização](../android/virtualizacao.md), [GNOME principal](../desktop/gnome-nativo.md) e [manual do cliente OpenSSH](https://man.openbsd.org/ssh).

## Aula 8 — programa, pacote, driver e firmware

### Entenda com um exemplo

Um **programa** executa uma tarefa. Um **pacote** é uma unidade distribuída e administrada pelo sistema, podendo conter programas, bibliotecas ou outros arquivos. Um **driver** permite ao kernel ou a outro componente controlar um dispositivo. **Firmware** pode ser código/dados usados por um componente de hardware; em instruções de fabricantes, a mesma palavra também pode designar um pacote amplo de software do telefone. Pergunte qual sentido está sendo usado.

“Instalei o aplicativo Bluetooth” não demonstra que rádio e driver funcionam. Um log que informa arquivo de firmware ausente aponta uma dependência concreta, mas copiar um arquivo de outro modelo não é uma correção segura. O nome do arquivo esperado, a origem autorizada e a orientação do port devem coincidir. Distribuições administram seus pacotes de forma diferente; juntar todos os repositórios disponíveis tende a criar incompatibilidades, não acesso universal.

### Faça o exercício

**Local: notas.** Classifique “editor de texto”, “pacote de bibliotecas”, “driver do controlador USB” e “arquivo de firmware solicitado pelo rádio”. Para o último, anote duas perguntas: de onde vem e para qual dispositivo foi documentado?

**Opcional: terminal de uma distribuição Linux já identificada, fora de PRoot se a intenção for consultar o sistema nativo. Escolha apenas a linha correspondente.**

```bash
# Debian/Ubuntu: consulta metadados locais do pacote bash
apt-cache policy bash

# Fedora: consulta o pacote bash instalado
rpm -q bash

# Alpine/postmarketOS: lista nomes de pacotes instalados
apk info
```

Esses comandos não acrescentam repositórios nem instalam pacotes. A consulta Debian pode mostrar metadados antigos; a linha Fedora pode dizer que o pacote não está instalado; Alpine pode usar outro shell. Registre o observado, sem concluir que um pacote existe em toda distribuição.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** classificar as quatro camadas e usar o gerenciador da distribuição certa. Uma versão em repositório não demonstra instalação nem compatibilidade com o hardware.

**Erro comum:** aplicar `apt` ao postmarketOS por hábito ou baixar um “driver ARM” aleatório. Volte à distribuição e ao port antes de alterar o sistema.

**Aprofunde:** [terminal e pacotes](../fundamentos/terminal-pacotes.md), [porting](../nativo/porting.md) e [uso de firmware pelos drivers do kernel](https://docs.kernel.org/driver-api/firmware/introduction.html).

## Aula 9 — verificar, fazer backup e voltar são tarefas distintas

### Entenda com um exemplo

**Verificar** compara uma expectativa com evidência. **Backup** preserva dados recuperáveis fora do alvo. **Rollback** descreve como voltar de uma alteração. Um checksum verifica o conteúdo contra um valor de referência; não demonstra que o arquivo serve no modelo, nem recupera fotos apagadas. Uma imagem original pode restaurar o sistema e continuar sem seus arquivos pessoais. Algumas mudanças de versão esbarram em antirollback; não presuma que “voltar” significa instalar qualquer versão antiga.

### Faça o exercício

**Local: computador, em uma pasta nova só para estudo.** Pelo gerenciador de arquivos, crie uma pasta `aula-verificacao` que ainda não exista. No editor, salve `aula-hash.txt` com uma frase curta. Abra o terminal **nessa pasta**, conforme a aula de terminal, e escolha seu sistema:

```bash
# Linux
sha256sum aula-hash.txt

# macOS
shasum -a 256 aula-hash.txt
```

```powershell
# Windows PowerShell
Get-FileHash -Algorithm SHA256 -LiteralPath .\aula-hash.txt
```

Copie o resultado para as notas. Pelo gerenciador de arquivos, faça uma cópia chamada `aula-hash-copia.txt`. Edite apenas o original, acrescente uma palavra e calcule os hashes dos dois arquivos, substituindo o nome no comando. Abra a cópia e confira a frase anterior. Não use imagens reais de firmware neste exercício.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** a cópia preserva o texto anterior; o original alterado possui outro hash. Você produziu uma verificação e uma cópia recuperável de um arquivo, não um backup completo do telefone. Os valores variam com texto, codificação e quebras de linha; não há um hash único esperado nesta aula.

**Erro comum:** calcular um hash e chamar isso de autenticidade. Falta comparar com uma referência obtida da fonte confiável, e, quando publicado, conferir assinatura pelo procedimento do projeto. Também não apague o arquivo antigo antes de testar a cópia.

**Aprofunde:** [backup](../preparacao/backup.md), [plano de recuperação](../preparacao/plano-recuperacao.md), [downloads e integridade](downloads.md) e [documentação de Get-FileHash](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash?view=powershell-7.5).

## Aula 10 — transforme “não funciona” em uma pergunta testável

### Entenda com um exemplo

Se o monitor fica preto, você ainda não sabe se houve queda de energia, perda de link, erro do driver, falta de sessão gráfica ou crash do telefone. Separe a cadeia: **aparelho ligado → controlador/porta → cabo/hub → detecção do monitor → geração da imagem → apresentação**. Teclado e mouse têm sua própria cadeia USB, HID, input e sessão. Uma camada funcionar não confirma todas as outras.

Uma experiência útil muda uma variável e registra o antes/depois. “Troquei cabo, kernel e desktop e reiniciei” pode até recuperar a imagem, mas não identifica a causa. Um teste após conectar o hub também não demonstra que desconectar/reconectar ou mudar a alimentação funcionará. Esses são cenários separados.

### Faça o exercício

**Local: notas; use um estado que você já conhece, sem trocar cabos nem reiniciar.** Escolha “sem vídeo”, “Wi-Fi indisponível” ou “teclado sem digitação” e preencha:

| Campo | Sua anotação |
| --- | --- |
| Estado inicial e último evento | O que estava funcionando e o que ocorreu antes da falha? |
| Uma hipótese | Em qual camada a falha pode estar? |
| Evidência que falta | Qual consulta ou observação distingue essa hipótese? |
| Teste seguro | Leitura de log, consulta de estado ou inspeção física sem gravação |
| Resultado esperado | O que confirmaria/refutaria a hipótese? |
| Retorno | O que você preservará antes de uma futura alteração? |

Se não há acesso ao telefone, “não tenho leitura do kernel” é uma lacuna a registrar; não é confirmação de erro no kernel. Um leigo pode começar pela observação da tela, LEDs, alimentação e documentação, sem escrever em `/sys` nem reiniciar drivers.

### Confira a resposta e reconheça o erro comum

**Resposta esperada:** um teste com resultado interpretável. Exemplo: “Vou conferir se o sistema continua alcançável por um acesso previamente preparado; se sim, tela preta não basta para concluir que houve crash”. O resultado ainda pode exigir outro teste, mas a pergunta ficou menor.

**Erro comum:** tratar uma correção temporária como garantia permanente. A validação deve registrar reinício e reconexão quando fazem parte do objetivo, além da sessão atual.

**Aprofunde:** [método de diagnóstico](../diagnostico/metodo.md), [teclado USB](../hardware/teclados-usb.md), [vídeo e hotplug](../hardware/video-hotplug.md) e [triagem de recuperação](../recuperacao/triagem.md).

## Seu primeiro resultado concreto

Escreva um parágrafo com modelo/build, objetivo, caminho escolhido, local de execução das ferramentas e limitação ainda não confirmada. Complete: “Antes de alterar o boot, preciso preservar ___ e conseguir recuperar ___ pelo método ___”. Se o último campo estiver vazio, termine o [plano de recuperação](../preparacao/plano-recuperacao.md), ou escolha um método [sobre Android](../android/termux.md) que não substitua o sistema.

Você terminou o curso quando consegue explicar essas escolhas em suas próprias palavras e localizar as fontes; não quando executou todos os comandos opcionais. A documentação é uma base para decidir. A compatibilidade depende do modelo e os exemplos não substituem a orientação do fabricante/port.

## Fontes e alcance da verificação

Conteúdo didático original; referências primárias consultadas em **11 de outubro de 2026** nos pontos indicados: Android Developers/AOSP para propriedades, ADB, ABI e boot; Debian para arquivos e rede; kernel.org para firmware; OpenSSH para cliente remoto; Microsoft para hash. **Verificação documental, sem teste no aparelho nesta elaboração.** Nomes e endereços usados nos exercícios são exemplos, não firmware nem identificação de um participante. Os aprofundamentos contêm as condições práticas que esta introdução não tenta universalizar.
