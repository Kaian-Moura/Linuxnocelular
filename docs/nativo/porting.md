---
title: Adaptação avançada de kernel, device tree e firmware
description: Um método de engenharia para criar ou melhorar um port sem confundir teoria com compatibilidade.
sidebar_position: 6
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Escopo e resultado esperado

Porting é desenvolvimento de suporte ao hardware. O resultado desta página é um plano reproduzível de investigação e artefatos rastreáveis; **não é uma promessa de habilitar qualquer smartphone**. Dificuldade: avançada. Pré-requisitos: Linux, Git, compilação, logs de kernel, entendimento de boot e recuperação específica. Use um aparelho de laboratório, com backup externo e caminho de retorno já testado.

Você precisará de fontes compatíveis com a placa, configuração real do kernel, documentação de boot, rootfs compatível, toolchain adequada e acesso administrativo. Sem um método de carregar código no dispositivo, um kernel compilado no computador não poderá ser testado ali. Sem drivers ou documentação, etapas podem exigir engenharia significativa ou permanecer impossíveis.

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

Verificação documental em **10/10/2026**; nenhum novo port foi criado por esta página.

- [Linux: modelo de uso de device tree](https://www.kernel.org/doc/html/latest/devicetree/usage-model.html).
- [Linux: Kconfig](https://docs.kernel.org/kbuild/kconfig.html).
- [Linux: kernel tainted](https://docs.kernel.org/admin-guide/tainted-kernels.html).
- [Linux: ramoops](https://docs.kernel.org/admin-guide/ramoops.html).
- [AOSP: módulos e integração do kernel](https://source.android.com/docs/core/architecture/kernel/modules).
- [Halium: primeiros passos](https://docs.halium.org/en/latest/porting/first-steps.html).
- [Droidian: porting](https://docs.droidian.org/porting-guide/).
