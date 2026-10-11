---
title: Monte seu kit de recuperação antes de alterar o boot
description: Produza uma ficha verificável de retorno ao sistema original, com fontes, arquivos, ferramentas, detecção e critérios concretos de parada.
sidebar_position: 7
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Seu plano de recuperação precisa funcionar quando o telefone não inicia, a tela fica preta ou a rede desaparece. “Depois procuro uma ROM” não é um plano. Ao terminar esta página, você terá uma pasta fora do aparelho, uma ficha de retorno e uma lista explícita de condições confirmadas/pendentes. **Não há gravação de firmware, desbloqueio nem reset neste tutorial.**

**Dificuldade:** iniciante para coletar informações e baixar arquivos; a elegibilidade de restauração pode exigir ajuda do fabricante/mantenedor. Materiais: computador, espaço para arquivos e extração, cabo de dados testado, carregador apropriado, editor de texto, documentação do modelo e acesso às suas contas. Antes, complete [inventário](../compatibilidade/inventario.md), [backup dos dados](backup.md) e [pastas/downloads](../comece-aqui/computador-downloads.md). Para consultas por cabo, prepare [ADB/Fastboot](adb-fastboot.md).

:::warning O plano não torna uma operação universalmente recuperável

Backup de dados e pacote original cobrem problemas distintos. Firmware pode não desfazer perda de chaves, restrições de versão, estado de garantia ou danos físicos. Um modo de emergência não garante que você terá a ferramenta autorizada para usá-lo. Se a recuperação ainda depende de algo que você não tem, registre isso antes de modificar o boot.

:::

## 1. Crie uma pasta que sobreviva à perda do telefone

**Local: gerenciador de arquivos do computador.** Na pasta `smartphone-linux` preparada na trilha inicial, crie `recuperacao`. Não a coloque no armazenamento do telefone nem mantenha sua única cópia sincronizada por uma conta inacessível sem ele. Organize assim, usando pastas comuns, sem comandos administrativos:

```text
smartphone-linux/
└── recuperacao/
    ├── ficha-retorno.txt
    ├── inventario/
    ├── guias/
    ├── downloads-originais/
    ├── ferramentas/
    ├── verificacoes/
    └── extracao-inspecao/
```

`downloads-originais` guarda o que você baixou, intacto; `extracao-inspecao` recebe cópias extraídas, para não confundir arquivo publicado com pasta modificada. Em `guias`, salve a página oficial por Imprimir → Salvar como PDF, quando possível, e anote também o link/data. Links podem mudar; cópias locais ajudam a ler instruções durante uma falha de internet. Não redistribua firmware de fabricante só porque guardou uma cópia privada; as licenças diferem.

Em `ficha-retorno.txt`, copie a ficha ao final desta página. Se trabalha no repositório, há também o arquivo `templates/plano-recuperacao.md`, para reutilização. **Pare e confira:** localize essa pasta pelo gerenciador, abra a ficha e confirme que nenhum caminho aponta ao telefone. Uma segunda cópia em disco externo é útil; confira que consegue abri-la.

## 2. Registre o estado que precisa ser recuperado

Abra as configurações Android e transcreva os campos do inventário. Registre informação desconhecida como desconhecida. Guarde fotografias legíveis das telas técnicas sem expor IMEI/serial em publicação. Se usar ADB, siga as consultas do [inventário](../compatibilidade/inventario.md), sem root. Preencha:

| Campo | Por que ele é necessário |
| --- | --- |
| Fabricante, código exato e variante | Distingue aparelhos visualmente semelhantes |
| Codinome e origem da identificação | Permite comparar o catálogo do projeto; não substitui a variante |
| Build completa, Android e patch de segurança | Identifica o ponto de partida e possíveis restrições de versão |
| Região/operadora, quando pertinente | Pacotes e elegibilidade podem depender delas |
| Sistema original ou já modificado | Um método para Android stock pode não recuperar um layout alterado |
| Bootloader bloqueado/desbloqueado, e como foi verificado | Determina quais métodos são permitidos; root é outro campo |
| A/B e slot observado, se documentado | Registra estado; não autoriza trocar slot |
| Tela, toque, botões e USB em funcionamento | Determina se consegue confirmar diálogos e entrar no modo exigido |
| Bateria e alimentação confiável | Evita iniciar uma manutenção sem energia suficiente |
| Contas e backup externo verificado | Permite acessar dados/serviços após uma limpeza |

“Versão antiga do Android” não basta para avaliar downgrade. É preciso confrontar o build/patch e as regras do fabricante com o sistema pretendido. Imagens disponíveis para download podem continuar proibidas pelo antirollback do aparelho. Consulte [segurança](../fundamentos/seguranca.md) e [restauração](../recuperacao/restaurar-android.md).

**Resultado esperado:** os campos que identificam o alvo estão preenchidos e você consegue mostrar sua origem. Se duas fontes contradizem o modelo, não baixe/grave a imagem para “ver se funciona”; investigue a divergência.

## 3. Localize uma origem de retorno documentada

Abra o suporte oficial do **seu** modelo, não um anúncio de ferramenta. Confira URL, fabricante, produto, variante e atualidade. A tabela abaixo indica pontos de partida verificados, não uma declaração de compatibilidade de todos os aparelhos de uma marca.

| Marca/família | Fonte oficial e o que ela oferece | Limite para seu plano |
| --- | --- | --- |
| Google Nexus/Pixel | [Factory images](https://developers.google.com/android/images) e [full OTA](https://developers.google.com/android/ota), selecionadas por dispositivo/build | Os métodos têm pré-condições distintas. Confira os avisos atuais de antirollback/A/B; OTA não é garantia de reconstruir um aparelho após Linux |
| Fairphone | [Instalação manual Android](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone), com arquivos por modelo e hashes | Exige seguir as condições do pacote/modelo; uma versão antiga publicada não autoriza downgrade ou relock |
| Motorola/Lenovo Android | [Software Fix para PC](https://en-us.support.motorola.com/app/answers/detail/a_id/158726/~/download-software-fix-%28pc-only%29/) | Na fonte consultada, Windows 10/11 de 64 bits; confirme reconhecimento/elegibilidade do seu produto e disponibilidade do serviço |
| Sony Xperia | [Xperia Companion](https://www.sony.co.uk/electronics/support/other-products-xperia-smart-devices/articles/00236877), Windows/macOS e reparo de software | Confira requisitos atuais e se o estado do seu aparelho é aceito; reparo não implica backup nem recuperação de chaves perdidas |
| Samsung Galaxy | [Download/instalação do Smart Switch PC](https://www.samsung.com/au/support/mobile-devices/downloading-smart-switch-on-pc/) e [recuperação de atualização interrompida](https://update.kies.samsung.com/SmartSwitchPC_recovery_guide/firmware/emergencyrecovery/) | A fonte de instalação é regional; o guia de emergência descreve falha de atualização. Não certifica restauração universal depois de Linux |
| Outra marca/modelo | Suporte oficial e página do port correspondente, a registrar na ficha | Nesta página não foi verificado um pacote/método universal. Ausência de fonte é uma pendência, não autorização para usar firmware semelhante |

Para OnePlus, Xiaomi e outros fabricantes, não extrapole um procedimento visto para um modelo a toda a marca. Um ZIP OTA, um conjunto de imagens Fastboot, um pacote de assistência e uma ROM comunitária são coisas diferentes. Se só encontrar arquivos em fóruns, registre autor, origem declarada, modelo, integridade e método. A classificação passa a ser **comunitária**, não oficial; uma cadeia de origem incompleta continua pendente.

### Se o fabricante publica um arquivo, como Google ou Fairphone

1. Encontre a linha **do código/variante correto**. Compare com sua ficha antes de abrir o download.
2. Leia as observações acima da tabela e do método. Registre se apaga dados, requer desbloqueio, depende de firmware base ou limita versões.
3. Copie para a ficha nome exato, versão/build, data/patch quando publicados, tipo de pacote, URL da página e URL final do download. Não substitua nomes para fazê-los parecer compatíveis.
4. Baixe pelo link da página oficial para `downloads-originais`; espere o navegador terminar. Arquivo parcial, extensão temporária ou download com erro não é pacote pronto.
5. Copie o SHA-256/assinatura **da fonte**, antes de comparar localmente. Se não há referência publicada, registre “integridade local registrada; autenticidade não confirmada por hash publicado”.

**Exemplo documental real, não escolha automática:** na fonte Fairphone consultada em 11/10/2026, o arquivo do FP4 Android 15 é `FP4.QREL.15.20.0.20260821145807.user-factory.zip`, build `FP4.QREL.15.20.0`, SHA-256 `4db3d8ce2c972d82700077d13b5a7e40325c721a3fe80fd2647d0064d8abf23c`. Confira novamente a [tabela oficial](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone) antes de baixar: ela pode mudar. Esses dados não se aplicam a FP3, FP5 nem outros telefones. O [guia de retorno FP4](../recuperacao/restaurar-android.md#exemplo-completo-fairphone-4-com-imagem-de-fábrica) contém as condições específicas; aqui você apenas prepara o kit.

No caso Pixel, não substitua “factory” por “OTA” por causa do mesmo nome de build. O pacote OTA completo pode ser adequado a certas recuperações em Android stock sem desbloqueio/apagar dados, mas isso depende do estado e do procedimento oficial. Escolher um arquivo menor ou não destrutivo não demonstra que ele consegue desfazer as alterações de uma instalação Linux.

### Se o fabricante fornece uma ferramenta que busca o firmware

**Motorola:** na página oficial, clique no download de Software Fix para o computador Windows compatível. Salve o instalador, execute-o pelo gerenciador de arquivos e siga o assistente. Abra o programa e registre a versão. Seu plano precisa registrar se a identificação do aparelho é aceita e como a ferramenta obtém o pacote; **não clique em Rescue/regravação para testar o kit**. Se a etapa exige iniciar uma operação destrutiva para revelar a elegibilidade, pare antes dela e peça confirmação ao suporte. Identificadores usados localmente não devem ir para uma ficha pública.

**Sony:** use o botão Windows ou macOS da página Xperia Companion, instale conforme o assistente e consulte a versão em “About/Sobre”. A documentação consultada descreve reparo e não apresenta esse aplicativo atual como solução de backup. Instalar/abrir a ferramenta não executa o reparo. Pare antes de confirmar “Software repair/Reparo de software” ou qualquer ação que sobrescreva o telefone. Registre a dependência de internet e obtenha confirmação das condições do modelo, especialmente se ele já foi desbloqueado/modificado.

**Samsung:** baixe Smart Switch PC a partir do suporte oficial adequado à sua região, abra o instalador e siga as telas. Registre a versão e a detecção para backup, se aplicável. Isso não prova que a recuperação de firmware será oferecida. O guia oficial de emergência depende do cenário de atualização falha/lista/código de recuperação; não trate a existência de um menu antigo como prova para seu Galaxy. Também não tente retirar bateria de aparelho selado para reproduzir instruções de modelos antigos.

**Resultado esperado:** você sabe o que consegue manter offline e o que depende de servidor, conta, Windows/macOS ou assistência. Se a ferramenta só oferece firmware durante uma operação, a ficha deve dizer “pacote não obtido; disponibilidade futura não garantida”. Não prometa um retorno offline que não foi preparado. Mantenha o Android ou outro caminho sem troca de boot enquanto a lacuna impede o plano.

## 4. Confira o arquivo sem instalá-lo

Vá à pasta `downloads-originais` pelo gerenciador de arquivos e abra o terminal nela. Leia o nome completo do arquivo; no Windows, habilite a exibição de extensões. Escolha **somente** o bloco do seu sistema. Os comandos seguintes calculam hash e não executam o ZIP.

**Exemplo concreto FP4, apenas se você baixou exatamente esse pacote oficial:**

```bash
# Computador Linux
sha256sum FP4.QREL.15.20.0.20260821145807.user-factory.zip
```

```bash
# Computador macOS
shasum -a 256 FP4.QREL.15.20.0.20260821145807.user-factory.zip
```

```powershell
# Computador Windows, PowerShell
Get-FileHash -Algorithm SHA256 -LiteralPath .\FP4.QREL.15.20.0.20260821145807.user-factory.zip
```

Se seu modelo/arquivo for outro, substitua o nome pelo **arquivo efetivamente publicado**, conforme [downloads](../comece-aqui/downloads.md). Não baixe o FP4 só para completar o exercício. Compare todos os 64 caracteres hexadecimais com o SHA da fonte — maiúsculas/minúsculas das letras não mudam o valor. Salve em `verificacoes` nome do arquivo, hash calculado, hash publicado, fonte e data. Um hash calculado sozinho serve para reconhecer o arquivo depois; não comprova procedência nem elegibilidade. [Documentação de Get-FileHash](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash?view=powershell-7.5).

**Se divergir:** confira se escolheu outra build, se o download terminou e se comparou o arquivo comprimido correto. Não altere o valor anotado para “passar”. Rebaixe da fonte oficial quando apropriado e, se persistir, contate o mantenedor. **Se houver assinatura:** use o procedimento e a chave publicados pelo projeto; não invente uma chave por analogia com outra distribuição.

Extraia uma cópia para `extracao-inspecao` usando “Extrair tudo/Extrair aqui” do gerenciador, no formato suportado. Extração é abrir o conteúdo, não executá-lo. Confira se há README, instruções, imagens e scripts mencionados pelo fabricante. Leia os arquivos de instrução num editor de texto. **Não dê duplo clique em script de flash para descobrir o que faz.** Arquivo inválido, falta de espaço ou extração incompleta são condições de parada. Se só há arquivos de imagem e nenhum método aplicável, o plano ainda não tem procedimento.

## 5. Prepare as ferramentas no computador certo

Instale Platform-Tools quando o método exigir ADB/Fastboot, conforme [tutorial de ferramentas](adb-fastboot.md). A origem oficial é [Android Platform-Tools](https://developer.android.com/tools/releases/platform-tools), com pacotes por sistema do computador. Guarde ZIP original, caminho extraído e versão; não escolha o pacote Android ARM64 para executar no notebook Windows por causa do processador do telefone.

**Local: terminal do computador, após a instalação.**

```bash
adb version
fastboot --version
```

Esses comandos consultam programas locais e funcionam sem telefone conectado. Se você usa ferramentas extraídas no Windows sem PATH, no PowerShell aberto na própria pasta use `.\adb.exe version` e `.\fastboot.exe --version`. **Mantenha esses prefixos em todas as consultas seguintes**, por exemplo `.\adb.exe devices -l` e `.\fastboot.exe devices`. A alternativa é preparar o PATH temporário pelo [tutorial ADB/Fastboot](adb-fastboot.md) e continuar na mesma janela; assim os nomes curtos dos blocos funcionam. “Command not found” indica instalação/caminho, não defeito no telefone. Instale drivers do fabricante somente quando o sistema e o modo exigirem; registre origem e versão. Não use o procedimento de uma marca para alterar drivers de outra.

Abra previamente o programa OEM compatível, se o método depender dele. Registre se você tem realmente o computador necessário. Uma máquina virtual Windows pode introduzir problemas de passagem USB e reconexão durante o boot; não a certifique como equivalente sem validação do método. Um Linux live sem armazenamento persistente também pode perder o kit ao reiniciar.

**Resultado esperado:** as ferramentas abrem/mostram versão e os arquivos estão localizáveis fora do telefone. Isso confirma a preparação do computador, ainda não a comunicação com o modo de recuperação.

## 6. Valide somente a detecção e a possibilidade de confirmar as telas

Você precisa distinguir **detectar Android ligado** de **detectar o modo que será usado para recuperar**. Um cabo que carrega pode não transmitir dados. Um hub funcional no desktop pode complicar o modo de boot. Para preparar a comunicação, use a conexão direta computador ↔ telefone quando recomendada pelo fabricante; guarde a identificação desse cabo/porta na ficha.

### Android ligado e autorizado

**Local: terminal do computador; telefone em Android, ADB autorizado fisicamente, um único alvo conhecido.**

```bash
adb devices -l
adb shell getprop ro.product.model
adb shell getprop ro.build.fingerprint
```

Espere uma linha com identificador e estado `device`, além das propriedades. `device` sozinho não prova boot completo. `unauthorized` exige confirmação no telefone; `offline` não é uma sessão utilizável. Não avance usando outro identificador nem publique a lista sem remover serial/identificadores. Guarde o registro privado em `inventario`. [Estados do ADB](https://developer.android.com/tools/adb).

### Fastboot, apenas quando o modelo e o guia confirmam esse método

Primeiro leia a combinação/entrada e **a saída sem gravação** no guia do fabricante. Se tela/botões não permitem confirmar o modo ou o retorno, isso é uma pendência. Você não precisa entrar agora para continuar baixando arquivos. Se decidir ensaiar a entrada, faça-o só com bateria adequada, dados já preservados, modelo compatível e instrução explícita de como sair; não selecione unlock, wipe ou instalação.

**Local: terminal do computador; telefone já no Fastboot indicado no guia, sem iniciar operação de flash.**

```bash
fastboot devices
fastboot getvar product
fastboot getvar current-slot
```

`devices` lista alvos desse protocolo; `getvar` consulta variáveis. Alguns aparelhos não expõem slot ou usam outro método; “variável desconhecida” não autoriza inventar um valor. Fastboot pode imprimir o resultado no canal de erro mesmo quando a consulta teve sucesso: leia a mensagem, não apenas o nome do canal. Compare produto com a documentação do modelo e registre o modo exato, pois bootloader Fastboot e Fastbootd não são intercambiáveis para todas as tarefas.

Não entre em modo de emergência nem force um crash para ensaiar a recuperação. Samsung/Sony e outros podem usar modos/protocolos diferentes; ausência em `fastboot devices` não é teste universal de aparelho morto. Para ferramentas OEM, use somente a detecção sem iniciar atualização/reparo e pare se a interface não separar as duas coisas.

**Resultado esperado:** uma evidência de detecção no modo relevante, ou uma pendência objetiva. Se ensaiou entrada num modo não destrutivo, registre também como voltou ao sistema pelo método oficial e se o Android iniciou. Tela quebrada torna especialmente importante ter outra forma real de observar/confirmar: [preparação sem tela](tela-quebrada.md).

## 7. Escreva a sequência de retorno, sem executá-la

Na ficha, escreva em linguagem simples: “Se ___ ocorrer, verifico ___; se o estado for ___, uso o guia ___ com o pacote ___; a operação apaga ___; depois valido ___”. Faça essa sequência baseada no método documentado, não em memória de um tutorial de outro aparelho.

Separe os níveis de retorno:

| Falha prevista | O plano precisa demonstrar |
| --- | --- |
| Aplicação/sessão não abre, Linux continua acessível | Cópia da configuração anterior e acesso administrativo documentado |
| Linux não inicia, bootloader continua acessível | Método específico do port/fabricante, arquivo e condições de recuperação nesse estado |
| Layout/firmware base foi alterado | Se o pacote/método reconstrói o que foi alterado; OTA comum pode não cobrir isso |
| Modo de emergência/bootloader inacessível | Caminho realmente documentado e disponível, possivelmente assistência; não basta saber o nome EDL |
| Android voltou, dados faltam | Backup pessoal recuperável, acesso às contas e novo provisionamento quando necessário |

Anote separadamente o que não volta: dados sem backup, possíveis chaves perdidas e restrições documentadas. Não inclua “relock no final” por hábito. O bloqueio com imagens/estado inadequados pode impedir boot; esse passo exige critérios próprios. Recuperar Android e relock são decisões distintas.

## 8. Faça uma revisão de mesa antes de autorizar a próxima etapa

Feche os aplicativos do telefone e simule **em notas**, sem desconectar nem alterar nada, a hipótese de ele não iniciar. Você consegue localizar guia, arquivos, hash, ferramenta, cabo, modo de entrada/saída e credenciais **sem usar esse telefone**? Abra uma amostra do backup no computador. Confira espaço de extração e fonte de energia. Peça a alguém para ler sua ficha e apontar o que está ambíguo, se possível.

### Critérios específicos para não avançar com alteração de boot

- **Identidade:** código/variante do telefone não corresponde à fonte, ou existem dados contraditórios sem resolução.
- **Dados/acesso:** fotos/projetos continuam só no telefone; códigos de recuperação/conta dependem dele; backup não foi aberto/testado.
- **Pacote:** não terminou o download, hash diverge, procedência não foi estabelecida, ou um ZIP OTA foi escolhido para substituir um método de factory sem confirmação.
- **Versão:** o caminho exige firmware anterior e as regras de downgrade/antirollback para seu estado não foram confirmadas. A existência do ZIP antigo não resolve essa condição.
- **Comunicação:** o modo necessário não é reconhecido, há vários alvos sem seleção ou a ferramenta do fabricante não aceita seu produto/estado.
- **Confirmação:** tela/botões não permitem confirmar uma operação obrigatória nem sair com segurança, sem alternativa documentada.
- **Dependência externa:** a única restauração exige computador, autenticação, servidor ou assistência que você não tem. Uma ferramenta baixada não prova que seu serviço ainda oferece o pacote.
- **Energia:** não atende ao nível/alimentação exigidos pelo guia, há cabo/porta instável ou o único carregamento confiável seria removido durante a operação.
- **Cobertura:** o método documentado não diz como voltar das alterações que o port fará. “Nunca aconteceu comigo” não substitui essa informação.

O resultado pode ser **“pronto para continuar avaliando a instalação do modelo”**, **“preparação pendente”** ou **“não substituir Android neste momento”**. Nenhum desses rótulos é garantia contra todas as falhas. Se há pendência, use [Termux/PRoot](../android/proot-distro.md) para avançar no aprendizado sem alterar boot, enquanto esclarece a lacuna.

## Duas fichas preenchidas para aprender a revisar

:::info Exemplos fictícios, sem validação de hardware

As situações e observações abaixo são inventadas para ensino. Não descrevem o telefone do autor/leitor. A primeira usa um modelo/build fictícios, sem download real. Na segunda, o nome do arquivo FP4 é um dado documental real; o cenário, medições e conclusões da pessoa são simulados. **Não copie a decisão para seu aparelho.**

:::

### Exemplo A — “encontrei uma ROM” ainda não é recuperação

| Campo | Ficha didática |
| --- | --- |
| Aparelho/build | “Telefone Exemplo-A”, `EX-A100`, `DEMO.2026.01` — todos fictícios |
| Dados | Fotos abertas no computador; autenticação ainda só no telefone |
| Fonte/pacote | Link de fórum sem origem demonstrada; nenhum método oficial identificado |
| Hash | Calculado localmente, sem referência independente |
| Detecção | Android por ADB; modo de restauração não identificado |
| Retorno | “Vou procurar depois”, sem cobertura de partições |
| Decisão | **Não alterar boot.** Preservar acesso à conta, encontrar método/pacote e avaliar elegibilidade |
| Próxima ação | Registrar perguntas no suporte do modelo; usar Termux enquanto isso |

### Exemplo B — kit organizado, mas downgrade continua bloqueado

| Campo | Ficha didática |
| --- | --- |
| Aparelho | FP4, identidade e build anotadas pela pessoa no cenário simulado |
| Estado | Android 15; backup pessoal conferido; tela/botões funcionais no cenário |
| Kit | Pacote FP4 Android 15 acima, fonte oficial, SHA anotado; instaladores e guia salvos |
| Detecção | Consulta do produto no Fastboot e retorno ao Android registrados no cenário, sem gravação |
| Objetivo | Instalar um port cujo guia exige uma base Android anterior |
| Lacuna | Não foram confirmadas as condições de downgrade/antirollback e retorno para essa transição |
| Decisão | **Não fazer downgrade nem instalar o port ainda.** O kit atual não autoriza a transição |
| Próxima ação | Confrontar guia vigente e fabricante, ou escolher caminho que aceite a base atual |

## Ficha para copiar e preencher

```text
PLANO DE RECUPERAÇÃO — uso privado
Data da revisão / responsável:
Modelo exato / variante / região / origem da identificação:
Codinome / fonte:
Build atual / Android / patch:
Estado original ou alterações anteriores:
Bootloader / evidência / root (campo separado):
Tela, toque, botões e energia:
Objetivo e alterações previstas pelo guia do port:

DADOS
Local externo das cópias:
Amostra restaurada/aberta / data / resultado:
Acesso a contas/autenticadores sem o telefone:
O que não foi preservado e consequência:

RETORNO DOCUMENTADO
Fonte oficial ou comunitária / URL / data:
Modelo e estado aos quais o método se aplica:
Arquivo exato / formato / versão / patch / tamanho publicado:
URL final / data de download / localização local:
Hash publicado e sua fonte:
Hash calculado / resultado da comparação:
Assinatura, se aplicável / procedimento / resultado:
Guia/README salvo e lido:
Ferramenta / versão / sistema do computador / origem:
Internet, conta, servidor ou assistência exigidos:

TESTE SEM GRAVAÇÃO
Cabo/porta direta e modo documentado:
Detecção / produto / data / saída privada salva:
Entrada e saída não destrutivas documentadas / observação:
Slot, se consultável / origem / sem troca de slot:
O que esse teste confirma e o que não confirma:

SEQUÊNCIA DE RETORNO
Falha prevista / como distinguir o estado:
Guia aplicável / condições de uso:
O que a operação apaga / o que ela não recupera:
Limites de versão, antirollback, partições e relock:
Testes de Android, rede, USB e restauração dos dados depois:

DECISÃO
Pendência / evidência necessária / fonte ou responsável:
Critérios de parada ainda presentes:
Pronto para avaliar próxima etapa ou bloqueado / motivo:
Data em que fonte e disponibilidade serão reconferidas:
```

Não preencha campo desconhecido com “OK”. Use, por exemplo, “antirollback: não confirmado; falta orientação do fabricante para passar da build X à base Y; próximo passo: consultar fonte Z”. Uma ficha pública deve remover IMEI, serial, chaves, senha, códigos de recuperação e dados pessoais. Preserve o original privado e publique somente a versão sanitizada.

## Fontes e alcance da verificação

**Verificação documental em 11 de outubro de 2026; nenhum download integral/flash/reparo foi executado em telefone para elaborar esta página.** Google, Fairphone, Motorola, Sony e Samsung foram consultados nos links próximos às afirmações. Platform-Tools/ADB e Get-FileHash fundamentam as consultas e integridade. A disponibilidade de uma página/arquivo não certifica recuperação no seu hardware. As marcas não cobertas permanecem lacunas explícitas. Para executar posteriormente um método já elegível, use [restaurar Android](../recuperacao/restaurar-android.md), [triagem](../recuperacao/triagem.md) e a instrução vigente do modelo; este guia entrega a preparação verificável.
