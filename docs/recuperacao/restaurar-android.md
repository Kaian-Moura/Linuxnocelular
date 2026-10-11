---
title: Restaure o firmware original com condições verificadas
description: Como escolher pacotes e ferramentas de fabricante, distinguir OTA de imagem e evitar rollback inseguro.
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Resultado esperado e pré-requisitos

O objetivo é retornar a um sistema original compatível quando a instalação Linux falhar ou deixar de atender seu uso. Dificuldade: intermediária/avançada. Requisitos: variante exata, fonte legítima do firmware, ferramenta/método compatíveis, bateria e cabo adequados, acesso ao modo exigido e backup fora do telefone.

Uma reinstalação pode apagar tudo. Voltar a Android não restaura automaticamente aplicativos, chaves, DRM, modem/calibração nem o estado de segurança anterior. **Não existe um pacote “Android original para qualquer ARM64”.**

Leia esta página **antes de instalar Linux**, enquanto você ainda consegue descobrir a identidade e a versão original do aparelho. Se já existe falha, primeiro faça [triagem](triagem.md); não use uma tentativa de restauração para descobrir o modelo. Todos os downloads, consultas Fastboot, extrações e scripts abaixo são feitos **no computador**. Não execute uma imagem de fábrica dentro do terminal do telefone.

Para um iniciante, a preparação mínima é saber [baixar arquivos](../comece-aqui/downloads.md), [abrir um terminal na pasta correta](../comece-aqui/terminal-primeiros-passos.md) e [instalar ADB/Fastboot](../preparacao/adb-fastboot.md). Você também precisa ler os avisos no telefone; se tela e botões não permitem confirmar uma operação exigida, isso pode bloquear a recuperação até consertar essa parte.

## Tipos de pacote e por que isso importa

| Tipo | Uso usual | O que não presumir |
|---|---|---|
| OTA incremental | Atualizar a partir de uma versão exata | Não equivale a restauração completa após substituir partições |
| OTA completa | Atualização/reinstalação pelo mecanismo aceito | Pode exigir recovery/origem e restringir downgrade |
| Imagem de fábrica | Restaurar conjuntos de imagens via ferramenta | Pode limpar dados e exigir bootloader permitido |
| Pacote de emergência | Recuperação em protocolo específico | Pode precisar de autenticação e programmer específico |
| Imagem de boot isolada | Restaurar kernel/ramdisk daquele estado | Não reconstrói todo o firmware |

O arquivo pode conter scripts com apagamentos e alterações de slots. Leia o plano do fabricante; não escolha pela extensão `.zip`. Um checksum publicado comprova integridade quando sua origem é confiável, mas não compatibilidade com o aparelho.

Uma **factory image** pode conter outra coleção ZIP e vários arquivos de partição. Um pacote OTA pode manter dados em um cenário e falhar completamente em outro. Não extraia um ZIP OTA para transformar seus componentes numa sequência inventada de Fastboot. O projeto Linux pode ter substituído `userdata`, `boot` ou reorganizado partições lógicas; a restauração precisa levar isso em conta.

## 1. Identifique o estado e a versão de referência

Use a [triagem](triagem.md) para saber se existe Android, recovery, Fastboot, fastbootd ou modo de emergência. Compare com sua ficha: modelo, região/operadora, firmware de base, patch e slots.

Se Fastboot responde, consultas suportadas ajudam:

```bash
fastboot devices
fastboot getvar product
fastboot getvar current-slot
fastboot getvar is-userspace
```

Elas não dizem que qualquer imagem será aceita. Não use `set-active`, `erase`, `format`, `flashall` ou lock como consultas. Em algumas implementações, variáveis faltam; use documentação e mensagem física do modo.

Se as ferramentas estão apenas numa pasta extraída, `fastboot` sem prefixo pode não ser encontrado: entre na pasta Platform Tools e use `./fastboot` no Linux/macOS ou `./fastboot.exe` no PowerShell. Uma lista vazia de `fastboot devices` não prova que o telefone morreu; pode indicar modo errado, cabo apenas de carga, driver ou permissões. Confira a tela do telefone e o guia do computador antes de tentar qualquer flash.

O resultado desta etapa deve ser uma ficha: **modelo/codename**, estado atual, slot quando aplicável, último firmware original conhecido, mudanças feitas pelo port e modo de recuperação disponível. Se só consegue dizer “é um Snapdragon”, faltam dados para escolher o pacote.

## 2. Localize uma fonte primária e confirme elegibilidade

### Google Pixel/Nexus

A [página oficial de imagens de fábrica](https://developers.google.com/android/images) identifica aparelhos e versões. A [página de OTA completas](https://developers.google.com/android/ota) oferece outro método, com requisitos próprios. A Google alerta para transições específicas de rollback/slots em determinadas gerações. Leia os avisos **da versão e geração atuais**, não apenas um tutorial antigo que mostra `flash-all`.

Uma OTA pode evitar limpeza/desbloqueio em cenários suportados; isso não garante que consiga restaurar um layout que uma distribuição alterou. Consulte as instruções do pacote e o estado do aparelho. Não publique firmware redistribuído neste repositório.

Na página Google, leia os termos e os avisos antes de liberar a listagem de downloads. Selecione o **codename exato** e a build compatível, incluindo região/operadora quando houver versões distintas. O número do patch não é sempre a data de publicação. Baixe o ZIP e compare o SHA-256 fornecido na mesma linha; preserve o link e a versão em sua ficha.

Há uma opção gráfica documentada, [Android Flash Tool](https://flash.android.com/), para dispositivos suportados pelo Google. A [instrução AOSP](https://source.android.com/docs/setup/test/flash) explica o uso de navegador com WebUSB, como Chrome/Edge, a permissão de acesso USB e **Add new device**. Para retornar um Pixel ao software público, use o caminho **back-to-public** indicado na documentação, não uma build AOSP de desenvolvimento escolhida ao acaso.

Antes de **Install**, confirme modelo, build, avisos de limpeza/desbloqueio e condições de rollback do seu Pixel. Um navegador pode pedir selecionar novamente o dispositivo quando ele muda para Fastboot; isso não autoriza usar **force flash** para contornar uma falha de compatibilidade. Pare e confira a mensagem. A ferramenta não é um instalador Android universal para OnePlus, Samsung ou Fairphone.

### Fairphone

O [guia oficial de instalação manual](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone) descreve métodos e pacotes por modelo. Na consulta, diferencia Fastboot de OTA sideload e restringe a opção OTA a modelos/cenários específicos. Use o script e pacote oferecidos para o seu código de modelo; não adapte um script FP3 para FP4.

O fabricante informa requisitos de carga e alerta para perda de dados. A [página de bootloader](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader) destaca riscos de relock com nível de patch antigo. Essa condição importa ao retornar de um port que exigia Android de base mais antigo.

### Exemplo completo: Fairphone 4 com imagem de fábrica

Este exemplo é **exclusivo de FP4 identificado**, com bootloader e partições críticas desbloqueados segundo o procedimento Fairphone, Fastboot disponível e estado admitido pelo guia oficial. Não atende FP3/FP5, não é receita de emergência EDL e não autoriza downgrade. O resultado esperado é Android Fairphone original iniciando de novo; todos os dados no telefone podem ser apagados.

#### A. Escolha a versão e obtenha o arquivo oficial

Abra a [instalação manual Fairphone](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone), localize **Fairphone 4** e escolha a imagem adequada ao seu objetivo e ao estado do aparelho. O fabricante exigia **pelo menos 80% de bateria** na revisão. Faça o backup, preserve credenciais de suas contas e siga também as orientações sobre SIM/microSD do guia. Se um aparelho que falhou não alcança carga suficiente, resolva a alimentação antes de iniciar uma gravação longa.

Em 11/10/2026, a página oferecia como atual:

| Campo | Artefato observado |
|---|---|
| Arquivo | `FP4.QREL.15.20.0.20260821145807.user-factory.zip` |
| Versão | `FP4.QREL.15.20.0`, Android 15 |
| Release | 28/09/2026 |
| Patch | 05/09/2026 |
| SHA-256 | `4db3d8ce2c972d82700077d13b5a7e40325c721a3fe80fd2647d0064d8abf23c` |

O [download publicado pelo fabricante](https://android-builds.fairphone.com/FP4/A15/FP4.QREL.15.20.0.20260821145807.user-factory.zip) tinha cerca de 3,2 GB comprimidos. Reserve espaço adicional para extrair; a pasta expandida será maior. Uma atualização da página pode tornar outra build a correta. Confira a versão **na fonte atual**, não mantenha este nome fixo como recomendação eterna.

Clique no arquivo pelo navegador, aguarde o término e mova-o para `smartphone-linux/fp4/recuperacao` dentro da sua pasta pessoal. Não abra um `.part`/`.crdownload`. No terminal do computador Linux, entre nessa pasta pelo gerenciador de arquivos ou com `cd`; confira `pwd` e `ls`. Para esta publicação exata:

```bash
sha256sum FP4.QREL.15.20.0.20260821145807.user-factory.zip
unzip -l FP4.QREL.15.20.0.20260821145807.user-factory.zip
```

O primeiro resultado deve ter os mesmos 64 caracteres do hash oficial. O segundo lista conteúdo sem instalar. Se `unzip` não existe, no Ubuntu/Debian use `sudo apt install unzip`; no Fedora, `sudo dnf install unzip`. Não execute scripts quando o hash divergir; refaça o download de fonte correta e investigue.

No Windows, abra PowerShell na pasta e execute `Get-FileHash .\FP4.QREL.15.20.0.20260821145807.user-factory.zip -Algorithm SHA256`. No macOS, use `shasum -a 256 FP4.QREL.15.20.0.20260821145807.user-factory.zip`. Maiúsculas/minúsculas no texto hexadecimal não mudam seu valor, mas todos os dígitos precisam corresponder.

#### B. Extraia e reconheça o pacote

No Windows, clique com o botão direito → **Extrair tudo**, escolhendo uma pasta nova. No macOS, extraia pelo Finder/Utilitário de Arquivo. No Linux, use o gerenciador de arquivos ou:

```bash
mkdir fp4-retorno-android15
unzip FP4.QREL.15.20.0.20260821145807.user-factory.zip -d fp4-retorno-android15
cd fp4-retorno-android15/FP4.QREL.15.20.0.20260821145807.user-factory
ls -lh
```

`mkdir` cria o destino; `unzip -d` extrai nele; `cd` entra na pasta interna daquela publicação. Se o nome mudou, use o nome realmente listado em vez de criar uma pasta vazia para fazer o comando “passar”. Esses passos não exigem `sudo` e ainda não escrevem no telefone.

O diretório ZIP dessa publicação foi inspecionado nesta revisão. Continha `README.txt`, pasta `images`, `SHA256SUMS` e estes arquivos:

- `flash_fp4_factory.sh`: entrada Linux.
- `flash_fp4_factory.command`: implementação compartilhada/Linux e entrada macOS.
- `flash_fp4_factory.bat`: entrada Windows.

Leia `README.txt` e o script correspondente em um editor. Na versão Android 15 inspecionada, o `.sh` chama o `.command`; **ler só o arquivo pequeno `.sh` não mostra todos os flashes**. Não execute com duplo clique enquanto ainda está tentando ler seu conteúdo; use **Abrir com → editor de texto**.

O código consultado verifica produto FP4 e desbloqueio normal/crítico, valida checksums, grava o conjunto de firmware/boot/partições de sistema, limpa dados e seleciona o slot esperado. Não bloqueia novamente o bootloader ao terminar. Isso explica por que o pacote inteiro e suas condições importam: não é somente trocar `boot.img`. Não copie as linhas internas de apagamento para recuperar outro aparelho.

No Linux, `command -v fastboot` e `fastboot --version` precisam funcionar **antes** de lançar o script, porque essa implementação procura Fastboot no PATH. Ter o executável numa pasta de Downloads sem PATH configurado não satisfaz essa condição. Siga [ADB/Fastboot](../preparacao/adb-fastboot.md); não retire a checagem do script para contornar o problema.

#### C. Confirme o alvo antes da operação destrutiva

Desligue o FP4. Segure **Volume para baixo** e conecte o cabo USB de dados diretamente ao computador, conforme o README oficial. O telefone deve abrir o bootloader. Conecte **somente um telefone alvo**; não use o hub com monitor/periféricos durante a restauração.

No computador, antes de executar o script:

```bash
fastboot devices
fastboot getvar product
fastboot getvar is-userspace
fastboot oem device-info
```

Os resultados precisam identificar FP4, o modo esperado e desbloqueios normal/crítico exigidos. A consulta `oem device-info` é específica dessa implementação Fairphone; não é uma consulta garantida em qualquer marca. Saídas Fastboot podem aparecer no canal de erro do terminal mesmo em caso de sucesso. Se falta desbloqueio, volte ao [procedimento Fairphone](../preparacao/desbloquear-bootloader.md), cuja execução também limpa dados, apenas quando ainda for elegível. Não presuma que um telefone travado permite ativar OEM unlocking depois da falha.

Se produto, estado de segurança, versão permitida ou pacote não correspondem, **não comece**. Uma imagem publicada anteriormente não prova que o rollback para ela seja permitido no estado atual. A preparação Android 11 exigida por certos ports e o retorno ao Android atual são situações diferentes.

#### D. Execute a entrada correta, com as proteções preservadas

Somente depois de cumprir A–C, leia novamente o aviso de perda de dados. No computador Linux, dentro da pasta extraída e verificada descrita acima:

```bash title="Operação destrutiva exclusiva do FP4 e pacote validado"
./flash_fp4_factory.sh
```

Esse arquivo é o script real da publicação, não uma ferramenta genérica desta documentação. Se a extração retirou o bit executável, confira a integridade e permita execução dos **dois arquivos dessa publicação** com `chmod u+x flash_fp4_factory.sh flash_fp4_factory.command`, depois lance o `.sh`. Não transforme `Permission denied` de USB em motivo para executar todo o pacote como root; corrija as permissões do computador.

No Windows, abra o `.bat` desse pacote, como orienta o fabricante. No macOS, abra o `.command`; se houver bloqueio, siga a exceção em **Privacidade e Segurança** somente para o pacote que você verificou. Não substitua esses arquivos por um script de fórum.

O script consultado começa identificando o ambiente e validando a integridade, depois apresenta um aviso de limpeza que exige digitar `Yes` com a capitalização indicada. **Aceitar essa confirmação inicia um fluxo que apaga dados**; não confirme se ainda não entende o pacote e seu alvo. Depois há detecção do aparelho, validação do estado e progresso de partições. Preserve a saída/log. O final previsto mostra `OPERATION SUCCESSFUL` e reinicia o telefone.

Não edite `INTEGRITY_CHECK`, produto, limpeza, slots ou comportamento de rollback para “fazer funcionar”. Também não suponha que uma opção chamada “dry run” seja totalmente inofensiva: no script lido, o fluxo ainda termina numa etapa de reboot. A revisão do código é feita no editor; não exige executar um modo de teste no telefone.

#### E. Confira o retorno e só então restaure seus arquivos

Aguarde Android concluir a primeira inicialização. O resultado esperado é o assistente original Fairphone/Android, não só o menu Fastboot nem a logo parada. Confira em **Configurações → Sobre o telefone** modelo e versão; com ADB autorizado novamente, leia release, patch e fingerprint. Teste Wi-Fi, carga, áudio, câmeras, SIM/rede e reboot antes de copiar dados pessoais.

O retorno do sistema pode estar funcional com o bootloader ainda desbloqueado. **Não aplique relock automaticamente**, sobretudo após bases antigas ou conjuntos de firmware mistos. Leia a condição atual Fairphone sobre versão/patch e segurança antes de decidir; o aviso visual de desbloqueio não é motivo suficiente para fazê-lo.

Se o script falhar, anote partição e mensagem, mantenha o modo de manutenção e consulte a orientação da versão/fabricante. Não reaplique um pacote diferente, não selecione outro slot por tentativa e não corte a energia repetidamente. O pacote inspecionado orienta uma retomada específica após erro; isso não deve ser extrapolado para outro fabricante ou para um dano de armazenamento.

### Samsung

A Samsung documenta recuperação de certas falhas de atualização por **Smart Switch**, incluindo código de recuperação emitido durante uma atualização que falhou. Veja o [guia oficial](https://update.kies.samsung.com/SmartSwitchPC_recovery_guide/firmware/emergencyrecovery/). Não interprete esse fluxo como ferramenta universal para qualquer Samsung com Linux instalado; a elegibilidade e versão do aplicativo precisam ser confirmadas.

Nem todo Samsung implementa Fastboot convencional. Download Mode, firmware e nomes de partição têm regras próprias. Ferramentas comunitárias podem ser úteis em aparelhos documentados, mas não substituem um procedimento verificado da variante.

### Sony, OnePlus e outras marcas

Consulte suporte e repositórios oficiais, além da página do port. A [Sony informa consequências do desbloqueio](https://opendevices.sony.net/aosp-on-xperia-open-devices/get-started/unlock-bootloader), inclusive funções/chaves que podem não voltar simplesmente com firmware original.

**Lacuna explícita:** este guia não oferece um pacote de emergência OnePlus 9 Pro autenticado e verificado para todas as variantes. Não indica um MSMDownloadTool, programmer ou mirror como restauração universal. Se a fonte oficial não disponibilizar o necessário, registre isso antes de instalar e procure o mantenedor/assistência. A existência de um arquivo em fórum não basta para classificá-lo como oficial.

## 3. Confira o pacote antes de executar

No computador, com o nome real do arquivo publicado:

```bash
file PACOTE.zip
sha256sum PACOTE.zip
unzip -l PACOTE.zip
```

`PACOTE.zip` é marcador, não nome de um firmware fornecido. Use apenas para ZIP; outros formatos têm ferramentas próprias. Compare hash publicado e conteúdo esperado. Extraia em pasta nova, sem sobrescrever backups. Leia scripts de gravação como código privilegiado: quais partições apagam, quais slots usam, se bloqueiam o bootloader e se verificam modelo.

Não retire uma proteção de produto do script para “fazer passar”. Não use `--force` para contornar incompatibilidade. Se o script não consegue reconhecer a variante, resolva a origem do pacote e a detecção antes.

## 4. Execute o fluxo do fabricante e valide

Mantenha cabo direto e alimentação estável. Use o modo e ferramenta requeridos. Se for sideload, ative o modo no recovery e forneça o **pacote compatível**; se for imagem de fábrica, siga o script/procedimento daquele pacote. Esta página não publica comandos de flash independentes porque destinos, formato e condições mudam entre fabricantes.

Preserve o log. Depois do boot, confira modelo, versão, Wi-Fi, áudio, câmera, carga e dados de rede originais. Troque configurações/credenciais necessárias e restaure seus arquivos somente depois da referência estar funcional. Se o sistema reportar outro modelo ou firmware incompatível, não religue a trava.

## Relock não é uma etapa universal

AVB e proteção contra rollback podem impedir imagens não assinadas ou antigas. Relock pode apagar dados e inutilizar um estado misto. Só considere religar a trava quando o fabricante/port explicitamente permitirem, todos os componentes necessários estiverem no estado esperado e o sistema original correto tiver inicializado. Esconder uma mensagem de boot não justifica a operação.

## Erros, alternativas e rollback

| Sintoma | Interpretação e próxima ação |
|---|---|
| Download termina como `.part`/`.crdownload` | Ainda não existe pacote completo; aguarde ou refaça antes de verificar |
| Hash diferente do oficial | Não execute; compare arquivo/versão e refaça o download confiável |
| Extração relata erro ou falta espaço | Confira integridade e espaço do computador; não use uma pasta incompleta |
| Script diz que Fastboot não existe | Configure instalação/PATH do computador, sem modificar o script |
| Lista Fastboot vazia | Confira cabo, modo e permissões/driver antes de concluir dano físico |
| Produto errado, critical locked ou rollback rejeitado | Não force; confirme elegibilidade e procedimento de fabricante |
| Erro numa partição após flashes anteriores | Preserve log e siga a retomada da receita exata; não misture firmware |
| Boot original funciona, mas um recurso falta | Compare versão/base/estado, reúna logs e consulte fabricante/port |
| Dados antigos não aparecem | Reinstalação limpa não recupera dados apagados; restaure backup externo |

Se falhar uma transferência, confira cabo/mode/log antes de repetir. Se faltar partição ou tamanho divergir, investigue layout alterado e receita de restauração, em vez de criar partições pelo palpite. Se pedir autenticação OEM, não procure bypass; use o suporte legítimo. Quando não existe recuperação verificada, a alternativa pode ser assistência técnica.

Não há rollback para dados apagados sem backup. Um pacote anterior pode ser bloqueado por downgrade. Após falha no meio da gravação, preserve o modo de manutenção e procure o fluxo de retomada específico antes de reiniciar repetidamente.

## Testes finais

Comprove boot e reboot, modelo/versão corretos, rede, carga e funções originais. Registre se o bootloader ficou desbloqueado e as limitações remanescentes. Só então prepare uma nova tentativa Linux, mudando uma variável por vez.

Guarde a ficha com URL do pacote, nome, hash, versão da ferramenta/script, estado inicial/final e mensagem de conclusão. É esse registro que permite repetir uma recuperação sem depender da memória. Não publique números de série, IMEI, contas ou logs com dados pessoais.

## Fontes e limites da verificação

Documental em **11/10/2026**; nenhum telefone foi gravado ou restaurado durante a revisão. A página Fairphone e o diretório/README/scripts dos pacotes oficiais FP4 foram consultados. O conteúdo pequeno dos scripts foi lido por requisições HTTP Range; os ZIPs completos de vários GB **não foram baixados nem tiveram seu hash global recalculado aqui**. O leitor deve verificar o pacote completo antes de executar. Outros fabricantes exigem sua receita atual. Fontes específicas estão citadas nas seções. Para os mecanismos comuns:

- [AOSP: Verified Boot e proteção de versão](https://source.android.com/docs/security/features/verifiedboot).
- [AOSP: partições dinâmicas](https://source.android.com/docs/core/ota/dynamic_partitions/implement).
- [AOSP: A/B](https://source.android.com/docs/core/ota/ab).
