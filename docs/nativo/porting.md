---
title: Adaptação avançada de kernel, device tree e firmware
description: Um método de engenharia para criar ou melhorar um port sem confundir teoria com compatibilidade.
sidebar_position: 6
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Escopo e resultado esperado

Porting é desenvolvimento de suporte ao hardware. O resultado desta página é um plano reproduzível de investigação e artefatos rastreáveis; **não é uma promessa de habilitar qualquer smartphone**. Dificuldade: avançada. Pré-requisitos: Linux, Git, compilação, logs de kernel, entendimento de boot e recuperação específica. Use um aparelho de laboratório, com backup externo e caminho de retorno já testado.

Você precisará de fontes compatíveis com a placa, configuração real do kernel, documentação de boot, rootfs compatível, toolchain adequada e acesso administrativo. Sem um método de carregar código no dispositivo, um kernel compilado no computador não poderá ser testado ali. Sem drivers ou documentação, etapas podem exigir engenharia significativa ou permanecer impossíveis.

Esta não é a primeira instalação recomendada para quem nunca usou Linux. Faça [a trilha do zero](../comece-aqui/do-zero.md), confirme o [inventário](../compatibilidade/inventario.md) e aprenda a [gerar uma imagem com pmbootstrap](postmarketos-pmbootstrap.md) sem flash antes de tentar desenvolver um port. A primeira meta aqui é **obter e entender a receita**, não compilar uma imagem de outro smartphone.

## Entenda as camadas

| Componente | O que faz | Erro de interpretação comum |
|---|---|---|
| Kernel | Controla memória, processos e drivers | Trocar userspace não muda suas capacidades |
| Configuração Kconfig | Seleciona recursos embutidos/módulos | Instalar pacote não cria uma opção ausente |
| Device tree | Descreve placa, conexões, reguladores e dispositivos | Não é um pacote de drivers universal |
| Firmware | Código/dados carregados por determinados componentes | Fonte do driver não necessariamente inclui o firmware |
| HAL Android | Interface de hardware de userspace Android | Pode depender de binder, serviços e bibliotecas Android |
| Bibliotecas Linux | Integram drivers às aplicações | Uma libc diferente pode impedir binários proprietários |
| Init/serviços | Ordenam inicialização e acesso | Serviço “ativo” não prova hardware funcional |

Um **driver embutido** não aparece em `lsmod`; um módulo pode existir no disco e ainda não estar carregado. Um componente marcado `=m` exige módulo compatível com o kernel. `vermagic`, símbolos, configuração e ABI importam; copiar `camera.ko` de uma versão próxima não é seguro.

## Backup e riscos

Preserve kernel/boot image conhecidos, configuração, logs e dados exigidos pelo modelo. Algumas operações de módulo, remote processor ou USB podem causar panic/CrashDump. Não descarregue drivers essenciais como reset genérico. Desativar proteções térmicas e carga para evitar um sintoma cria outro risco, e não é uma correção aceitável.

Fontes GPL do kernel não conferem licença para distribuir blobs proprietários. Guarde a origem e a licença de cada firmware, com instrução legítima de obtenção quando redistribuição não for permitida. Não publique partições pessoais de calibração.

## 1. Capture uma referência conhecida

No Linux do telefone:

```bash
uname -a
cat /proc/cmdline
cat /proc/sys/kernel/tainted
lsmod
find /sys/bus/platform/devices -maxdepth 1 -mindepth 1 -type l
```

Essas consultas descrevem kernel, parâmetros e dispositivos; logs podem expor identificadores, portanto revise antes de compartilhar. O indicador tainted ajuda a interpretar crashes após módulos externos/proprietários; não identifica sozinho a causa.

Se disponível:

```bash
zcat /proc/config.gz > kernel-config-observada.txt
```

Esse arquivo requer a configuração que expõe o kernel em `/proc`. Se não existir, procure o artefato de build ou pacote correspondente; não trate ausência do arquivo como ausência de todo driver. A configuração Android genérica do SoC não substitui a da placa em execução.

## 2. Registre fontes e comparação mainline/downstream

### Obtenha o repositório de receitas, sem tocar no telefone

No postmarketOS/Nura, **pmbootstrap** é a ferramenta que prepara o ambiente de build; **pmaports** contém receitas de pacotes, kernels e dispositivos. Um clone de pmaports é código para estudar, não um arquivo que se grava no bootloader. Utilize um computador Linux com Git, espaço e acesso à internet, conforme [preparação do host](postmarketos-pmbootstrap.md#1-prepare-o-computador-e-instale-a-ferramenta-do-zero).

Este exemplo baixa **apenas fontes/receitas oficiais**, sem instalar nada no telefone. Abra o terminal do computador:

```bash
mkdir -p "$HOME/smartphone-linux/fontes"
cd "$HOME/smartphone-linux/fontes"
git clone --depth=1 https://gitlab.postmarketos.org/postmarketOS/pmaports.git pmaports-estudo
cd pmaports-estudo
git remote -v
git branch --show-current
git rev-parse HEAD
git status --short
```

`mkdir -p` cria a pasta de estudo; `cd` entra nela. `git clone` baixa uma cópia, e `--depth=1` reduz o histórico baixado. Os quatro comandos finais conferem origem, branch, commit e alterações locais. Na consulta de 11/10/2026, a branch padrão do repositório era `main`; não suponha `master` a partir de um tutorial antigo. Salve o commit no registro do experimento. Um clone raso não contém automaticamente qualquer commit antigo que uma publicação mencione.

Se já existe `pmaports-estudo`, não sobrescreva sua árvore: escolha outra pasta ou confira sua cópia. Se o clone falhar por rede, resolva conexão/URL antes de compilar. A interface web do GitLab pode oferecer uma verificação anti-bot; isso não torna um mirror pessoal equivalente à origem. O acesso Git e alguns arquivos raw estavam disponíveis na revisão mesmo quando uma página web não foi.

### Encontre a placa, o kernel e as dependências reais

Como exemplo **somente de leitura**, o FP4 possuía os arquivos abaixo na árvore consultada:

```bash
git grep -n 'fairphone-fp4' -- device
sed -n '1,220p' device/community/device-fairphone-fp4/APKBUILD
sed -n '1,220p' device/community/device-fairphone-fp4/deviceinfo
```

`git grep` busca no código versionado; `sed -n` mostra as linhas indicadas sem editar. Essas consultas não comprovam compatibilidade de outro Fairphone nem autorizam flash. Se você estuda outro modelo, substitua a pesquisa pelo **codename confirmado**; encontre o caminho retornado pela árvore, não presuma a mesma categoria `community`. Se o dispositivo não aparece, isso é uma lacuna de port, não um motivo para copiar esse diretório e trocar seu nome.

No `APKBUILD`, leia `depends`, `makedepends`, `source`, versões, checksums e funções de preparação. Na revisão, o pacote FP4 dependia de `linux-postmarketos-qcom-sm6350` e de vários firmwares específicos. `deviceinfo` apontava para o DTB `qcom/sm7225-fairphone-fp4`, arquitetura `aarch64` e detalhes de boot. O SoC e o nome do DTB podem parecer diferentes para um iniciante: siga o que a **receita daquela placa** usa, não renomeie o DTB para coincidir com uma publicidade do processador.

Para localizar a receita do kernel citado por esse exemplo:

```bash
git ls-files '*linux-postmarketos-qcom-sm6350*/APKBUILD'
```

Abra o caminho realmente retornado. Dele obtenha URL e revisão das fontes, config, patches, dependências e ordem de aplicação. Na consulta da branch `main`, o arquivo estava em `device/community/linux-postmarketos-qcom-sm6350/APKBUILD` e usava fontes do [fork `sm6350-mainline/linux`](https://github.com/sm6350-mainline/linux), com LLVM/Clang e a configuração da receita. Isso descreve **a branch de desenvolvimento lida**, não o kernel de toda imagem estável FP4. A ferramenta de empacotamento pode aplicar modificações antes de compilar: baixar apenas o tarball upstream sem esses patches não reproduz o kernel distribuído.

Não ative uma variável `deviceinfo` por seu nome parecer útil. Por exemplo, a [referência oficial](https://docs.nura.eco/pmaports/main/packaging/device-packages/deviceinfo-reference.html) explica que uma configuração de atualização de kernel pode autorizar escrita automática numa partição e exige validação específica. No FP4 consultado havia tal integração habilitada; isso descreve um port mantido, não uma configuração segura para copiar a um aparelho novo.

### Escolha a toolchain pela receita, não pelo nome ARM64

Toolchain é o conjunto de compilador, linker, headers e ferramentas que transforma fonte em binários. Um computador x86-64 pode gerar código aarch64 com cross-compilation, mas isso exige alvo e ABI corretos. O kernel vendor pode exigir Clang de determinada revisão; um kernel mainline empacotado pode usar outra cadeia. Um módulo proprietário pode depender de opções e símbolos que nenhuma troca de GCC por Clang resolverá.

No caminho pmbootstrap, prepare a ferramenta conforme [seu tutorial](postmarketos-pmbootstrap.md), selecione o dispositivo/release existentes e deixe o ambiente isolado obter dependências da receita. Não execute seu `APKBUILD` diretamente como script root no computador: ele faz parte de um sistema de build. Para Halium/Droidian, parta do guia oficial de adaptação e da árvore do mantenedor; para fontes de fabricante, use o repositório GPL indicado pelo fabricante para **modelo, base e revisão**. Confira licença, README e integridade do download antes de executar scripts de preparação.

O resultado esperado desta investigação é uma tabela rastreável:

| Item | Registro que deve existir |
|---|---|
| Placa | Modelo/codename e revisão do hardware |
| Receita | URL pmaports/adaptação, branch e commit |
| Kernel | URL, commit/tag, config e patches aplicados |
| Compilação | Toolchain e dependências da receita |
| Firmware | Origem legítima, versão, licença e modo de obtenção |
| Boot | Formato, partição/método e recuperação do modelo |

Se falta uma dessas peças, registre a lacuna e investigue antes do build/flash. “Compilou sem erros” não completa a tabela nem torna o artefato inicializável.

Identifique repositório, branch, commit, patches e toolchain. Em cada checkout:

```bash
git status --short
git rev-parse HEAD
git log -5 --oneline
```

Um downstream pode conter grandes adaptações do fabricante, drivers exclusivos e ABI Android. Mainline favorece integração comum, mas pode ainda não incluir a tela, DP ou câmera dessa placa. Compare função por função e não apenas o número de versão.

Para postmarketOS/Nura, examine `APKBUILD`, `deviceinfo`, config e patches usados no pacote. Para Halium/Droidian/Ubuntu Touch, siga o guia da base e do dispositivo; um kernel Android stock pode não oferecer os recursos que a adaptação exige. [Droidian explica explicitamente a necessidade de kernel adaptado](https://docs.droidian.org/porting-guide/).

## 3. Faça uma hipótese testável por vez

Exemplo: “teclado enumerou, mas não há input; o suporte HID necessário está ausente”. A evidência precisa distinguir enumeração USB, vínculo do driver, registro input e entrega ao compositor. Compare um periférico funcional, capture logs e verifique os símbolos pertinentes da configuração e do código.

Crie uma tabela **hipótese → evidência → alteração → resultado → reversão**. Não altere DTS, autosuspend, compositor e versão Mesa num único teste: se funcionar ou travar, você não saberá qual mudança foi responsável. Guarde o caso mínimo que reproduz o problema.

## 4. Edite e compile no ambiente do port

Use a receita do projeto para obter o kernel e gerar a boot image. Kconfig contém dependências: não basta inserir uma linha `CONFIG_...=y` que a ferramenta depois remove. O [manual Kconfig](https://docs.kernel.org/kbuild/kconfig.html) mostra como identificar símbolos novos e comparar configurações. Um build bem-sucedido é apenas uma etapa; verifique que o símbolo entrou no artefato.

Device tree descreve detalhes como reguladores, GPIO, interruptos, PHY e conexões. `status = "okay"` não cria hardware nem completa um driver. Use bindings e DTS da placa correta; valide pelo fluxo `dtbs_check` da árvore que você utiliza. Uma alteração válida no schema ainda pode estar eletricamente incorreta para aquela placa.

Não fornecemos uma linha de compilação universal: vendor trees podem requerer Clang específico, módulos externos, DTBO e ferramentas diferentes. Documente a linha real testada e versões; se ainda não há build reproduzido, classifique como **experimental**, não como instrução pronta.

## 5. Teste com acesso de emergência e recolha a falha

Use boot temporário apenas se suportado. Quando houver flash, escreva o alvo exato e mantenha um artefato de retorno. Antes de testar USB-C, mantenha acesso por Wi-Fi/SSH se possível; antes de testar rede, mantenha console/USB. Um teste físico não deve depender do mesmo canal que ele pode derrubar.

Em panic, examine pstore/ramoops quando configurado; não há garantia de que os registros sobreviverão. Em falha só gráfica, preserve a sessão e colete DRM/compositor em vez de reiniciar o telefone imediatamente. Cada correção precisa de teste de boot, reinício, retomada e reconexão, além do caso que motivou a mudança.

## Erros comuns, alternativas e rollback

`invalid module format` pede conferir versão/ABI, não forçar carregamento. Firmware ausente pede identificar o arquivo solicitado e sua origem, não baixar blobs de qualquer aparelho. Um serviço funcionando sem interface kernel exige corrigir a camada abaixo. Se o sistema só funciona com root/SELinux globalmente desativado, investigue permissões específicas antes de manter uma abertura geral.

Volte ao artefato conhecido e à configuração anterior se houver crash novo. Preserve a captura antes de limpar caches ou logs. Se não puder testar fisicamente, entregue patch, build e limitações claramente; não declare o hardware habilitado.

## Testes finais e contribuição

Documente matriz antes/depois, kernel/commit, configuração, pacote, firmware licenciado, hardware de teste, sequência de boot e resultado. Faça correções persistentes no pacote/driver adequado, com revisão upstream, em vez de comandos manuais escondidos no login. Relatos positivos precisam de versão e reprodução para beneficiar outros dispositivos.

## Fontes e limites da verificação

Verificação documental em **11/10/2026**; nenhum novo port foi criado por esta página e nenhum telefone foi alterado. A origem Git de pmaports e os arquivos raw do pacote FP4 foram consultados. O clone/consultas são exemplos reproduzíveis de estudo; a compilação e o flash de um port novo não foram validados por esta documentação.

- [Linux: modelo de uso de device tree](https://www.kernel.org/doc/html/latest/devicetree/usage-model.html).
- [Linux: Kconfig](https://docs.kernel.org/kbuild/kconfig.html).
- [Linux: kernel tainted](https://docs.kernel.org/admin-guide/tainted-kernels.html).
- [Linux: ramoops](https://docs.kernel.org/admin-guide/ramoops.html).
- [AOSP: módulos e integração do kernel](https://source.android.com/docs/core/architecture/kernel/modules).
- [Halium: primeiros passos](https://docs.halium.org/en/latest/porting/first-steps.html).
- [Droidian: porting](https://docs.droidian.org/porting-guide/).
- [pmaports: repositório de receitas](https://gitlab.postmarketos.org/postmarketOS/pmaports), [APKBUILD FP4](https://gitlab.postmarketos.org/postmarketOS/pmaports/-/blob/main/device/community/device-fairphone-fp4/APKBUILD) e [deviceinfo FP4](https://gitlab.postmarketos.org/postmarketOS/pmaports/-/blob/main/device/community/device-fairphone-fp4/deviceinfo).
- [pmbootstrap: instalação](https://docs.nura.eco/pmbootstrap/main/installation.html), [uso](https://docs.nura.eco/pmbootstrap/main/usage.html) e [referência deviceinfo](https://docs.nura.eco/pmaports/main/packaging/device-packages/deviceinfo-reference.html).
