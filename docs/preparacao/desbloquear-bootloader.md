---
title: Desbloqueie o bootloader com um procedimento verificável
description: Entenda a limpeza de dados, prepare ferramentas e recuperação e acompanhe um exemplo exclusivo ao Fairphone 4.
sidebar_position: 3
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Resultado esperado e o que esta etapa não faz

Você saberá verificar a elegibilidade do **seu modelo**, reconhecer os avisos e executar o desbloqueio somente quando houver um procedimento documentado. O exemplo com comandos destrutivos desta página é **exclusivo ao Fairphone 4, código FP4**, seguindo o fabricante. Ao terminar, o telefone continua com seu sistema de referência, porém permite as operações autorizadas pelo bootloader; Linux ainda não foi instalado.

Dificuldade: intermediária. Materiais: aparelho acessível, computador Linux/Windows/macOS, cabo USB com dados, botões funcionando, bateria suficiente e backup externo. É necessário compreender [modelo/variante](../compatibilidade/inventario.md), [ADB/Fastboot](adb-fastboot.md) e [recuperação](../recuperacao/restaurar-android.md). Sem conseguir ler e confirmar a tela física exigida, prepare primeiro [controle com tela quebrada](tela-quebrada.md); não aceite avisos às cegas.

## Bootloader, root e Desbloqueio OEM são coisas diferentes

O **bootloader** é o programa que escolhe e inicia os componentes do sistema. Em estado bloqueado, normalmente aceita apenas imagens autorizadas pelas regras de assinatura do fabricante. Desbloqueá-lo muda essa política e pode permitir instalar um sistema alternativo. Isso não fornece os drivers de câmera, GPU ou vídeo do novo sistema.

**Root** é um privilégio administrativo dentro de um sistema já rodando. Android com root não comprova que seu bootloader possa ser desbloqueado. ADB é um canal de comunicação; autorizar ADB não desbloqueia partições. A opção **Desbloqueio OEM** normalmente permite solicitar o desbloqueio depois: ligá-la não significa que a operação já terminou.

A [especificação AOSP](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking) descreve uma família de mecanismos, não concede elegibilidade a todas as marcas. Há aparelhos com comandos diferentes, código de autorização, espera, restrição por operadora ou sem desbloqueio disponibilizado. Samsung pode usar outro fluxo de manutenção; um comando Fastboot não vira universal por aparecer num tutorial Android.

## Etapa 1 — confirme elegibilidade antes de qualquer comando destrutivo

Na documentação do fabricante e do port, localize o **mesmo código de modelo**, região/operadora e firmware. Não confunda aparelho comprado sem bloqueio de SIM com bootloader desbloqueável. Guarde a URL, data e requisitos; se eles não forem claros, permaneça no Android e use [Termux/PRoot](../escolha/index.mdx) enquanto investiga.

Preencha esta lista antes de continuar:

- [ ] Código de modelo/codinome e variante confirmados, não apenas nome comercial.
- [ ] Fabricante ou mantenedor confiável documenta desbloqueio para essa variante.
- [ ] Backup de fotos, documentos, credenciais e autenticadores conferido fora do aparelho.
- [ ] Contas/PIN necessários conhecidos; você não depende de um aplicativo que será apagado para autorizar a recuperação.
- [ ] Firmware de restauração exato e ferramenta legítima preparados.
- [ ] Estado da bateria adequado; para preparação/restauração Fairphone, o fabricante solicita pelo menos **80%**.
- [ ] Você consegue entrar/sair do modo de manutenção e confirmar a tela exigida.
- [ ] Riscos de perda de funções/chaves e restrições de rollback compreendidos.

**Desbloqueio e relock podem apagar dados.** O backup não deve estar apenas em `userdata`, pois é justamente uma área que poderá ser limpa. A restauração de Android não necessariamente recupera chaves/DRM e funcionalidades perdidas. Se um port pede firmware antigo, não faça downgrade antes de ler as regras daquela variante.

## Etapa 2 — obtenha ferramentas no computador

Baixe **SDK Platform-Tools**, não um executável de fórum, na [página Android Developers](https://developer.android.com/tools/releases/platform-tools). Ela possui downloads separados para Windows, macOS e Linux. No navegador, escolha o sistema **do computador**, aceite os termos se concordar e aguarde o ZIP terminar. Você não precisa instalar Android Studio inteiro.

No gerenciador de arquivos do computador, extraia o ZIP numa pasta nova. Ela deve conter a subpasta `platform-tools`, com `adb`/`fastboot` ou seus `.exe`; a pasta que contém o ZIP não necessariamente é a pasta dos executáveis. Abra um terminal **dentro de `platform-tools`**. No Linux, o menu de contexto costuma oferecer “Abrir no terminal”; no Windows, abra PowerShell nessa pasta; no macOS, navegue até ela no Terminal.

**Linux/macOS, com ferramentas oficiais extraídas:**

```bash
./adb version
./fastboot --version
```

**PowerShell Windows, como alternativa ao bloco anterior:**

```powershell
./adb.exe version
./fastboot.exe --version
```

O prefixo `./` significa “o arquivo nesta pasta”. Se você instalou ferramentas pelos pacotes confiáveis da distribuição e elas estão no `PATH`, os comandos seguintes podem ser escritos como `adb`/`fastboot`, sem `./`. Use **uma cópia identificada**; não misture versões de pacotes diferentes.

**Resultado:** ambos imprimem versões. `command not found` ou “não é reconhecido” nesta etapa costuma ser pasta/executável errado, não problema do telefone. Consulte [terminal e ferramentas](../comece-aqui/terminal-primeiros-passos.md) e [ADB/Fastboot](adb-fastboot.md) para drivers/permissões. Não abra o instalador gráfico inteiro com root para contornar isso.

## Etapa 3 — habilite opções e teste ADB no Android

No FP4 com Android original, abra **Configurações → Sobre o telefone**, localize **Número da versão** e toque sete vezes; informe PIN/senha quando solicitado. Deve aparecer uma mensagem de opções de desenvolvedor habilitadas. Depois abra **Configurações → Sistema → Opções do desenvolvedor** e ligue **Depuração USB**.

Conecte o cabo direto ao computador, desbloqueie a tela e execute, **no computador**:

```bash
./adb devices -l
```

No telefone deve aparecer um pedido de autorização da chave do computador; aceite apenas seu computador confiável. Repita o comando. A linha do telefone precisa terminar/indicar **`device`**, não `unauthorized` ou `offline`. O serial que aparece é identificador particular; não publique sem necessidade.

Registre modelo e firmware antes da limpeza:

```bash
./adb shell getprop ro.product.model
./adb shell getprop ro.product.device
./adb shell getprop ro.build.version.release
./adb shell getprop ro.build.version.security_patch
./adb shell getprop ro.build.fingerprint
```

Cada comando apenas consulta uma propriedade. Confira com etiqueta e documentação: uma ROM pode alterar propriedades, portanto elas não substituem evidência física da variante.

Na mesma tela de opções do desenvolvedor, ligue **Desbloqueio OEM** e confirme PIN/aviso. O fabricante Fairphone orienta ter software atualizado e internet funcional para verificação. Atualizar para permitir o desbloqueio e preparar uma base Android específica do port são etapas diferentes; se o port requer base antiga, leia o plano completo antes de escolher o downgrade.

Se o interruptor estiver ausente/cinza ou não concluir a verificação, **pare** e investigue elegibilidade/firmware/conectividade com o fabricante. Root, outro cabo ou comandos repetidos não removem uma restrição contratual/da variante.

## Etapa 4 — reconheça Fastboot sem desbloquear ainda

No computador, com ADB operacional:

```bash
./adb reboot bootloader
```

Esse comando reinicia para o bootloader; não solicita por si só uma limpeza. A tela Android deve ser substituída pelo modo de manutenção do FP4. Nesse modo, ADB pode deixar de listar o aparelho, e isso é esperado. Consulte:

```bash
./fastboot devices
./fastboot getvar product
./fastboot getvar unlocked
```

A primeira linha deve listar o telefone. As outras consultam identificação/estado quando implementadas. Fastboot frequentemente imprime resultados em `stderr`; isso não significa falha se a consulta mostra `OKAY`. `unlocked: yes` é o estado que a receita FP4 do instalador espera; `no` significa bloqueado. Uma variável ausente não deve ser interpretada automaticamente como `yes`.

No **FP4**, a receita do instalador também documenta entrada física: telefone desligado, segure **Volume para baixo** e conecte-o ao computador por USB; aguarde a tela Fastboot. Não use essa combinação como instrução para qualquer Android.

**Só avance se** a identidade for FP4 confirmado, a variante/estado cumprir a fonte, o cabo for reconhecido e todos os itens de backup/recuperação da etapa 1 estiverem concluídos. Caso já esteja desbloqueado, não repita a limpeza para “testar”.

## Etapa 5 — exemplo destrutivo exclusivo ao Fairphone 4

:::danger Restrição do exemplo
Os próximos comandos alteram a política do bootloader e **apagam dados após confirmação física**. Use-os somente no FP4 confirmado, elegível e preparado acima, conforme a [instrução atual Fairphone](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader). Não são um tutorial genérico para OnePlus, Samsung, Motorola ou outro modelo.
:::

No computador, com **o FP4 no bootloader**:

```bash
./fastboot flashing unlock
```

Observe a tela do telefone. Ela deve apresentar um aviso/decisão de desbloqueio; use os botões conforme **as instruções impressas naquela tela** para selecionar e confirmar. Não conclua a operação por apenas receber uma linha no terminal. Se você cancelar, a operação não deve ser tratada como concluída.

Depois da confirmação, aguarde a limpeza e reinicialização previstas. A tela de configuração inicial pode aparecer novamente porque os dados foram apagados. Não restaure seus arquivos pessoais entre duas limpezas previstas pelo procedimento.

A instrução Fairphone consultada em 11/10/2026 descreve também um **segundo desbloqueio de seções críticas**, após retornar ao Fastboot. Essas seções protegem componentes necessários à inicialização; essa necessidade **não deve ser extrapolada a outros ports/fabricantes**. Para seguir o fluxo completo do fabricante FP4, retorne pelo modo físico documentado ou reconfigure Android/ADB e então execute:

```bash
./fastboot flashing unlock_critical
```

Novamente há confirmação física e **outra limpeza**. Leia o aviso e aguarde terminar. Se o procedimento vigente do seu modelo não pedir essa operação, não a acrescente por hábito. Não escreva bootloader, modem ou partições de identidade só porque o estado agora permite outras ações.

## Etapa 6 — confira o estado e prepare a próxima instalação

Volte ao bootloader FP4 e consulte:

```bash
./fastboot devices
./fastboot getvar product
./fastboot getvar unlocked
```

O aparelho deve continuar sendo identificado corretamente, e o estado requerido deve corresponder ao documentado. Guarde o resultado sem expor serial. Se não for instalar imediatamente, use a opção de reiniciar exibida no bootloader ou `./fastboot reboot` para voltar ao sistema original.

É esperado um aviso de bootloader desbloqueado na inicialização; esse aviso não significa que Linux já está instalado. Se houve reset, as autorizações ADB/configurações pessoais podem ter sido perdidas. Configure novamente somente o necessário para preparar o port.

Próximos caminhos: [FP4 pelo instalador](../nativo/fairphone-4.md), [Ubuntu Touch](../nativo/ubuntu-touch.md), [imagens Nura](../nativo/postmarketos-imagens.md) ou [construção com pmbootstrap](../nativo/postmarketos-pmbootstrap.md). Confira a base de firmware exigida **antes** de instalar. Não religue a trava com Ubuntu Touch/Nura ou estado misto para remover o aviso.

## Erros e recuperação

| Sintoma | Verificação e resposta |
|---|---|
| `unauthorized` em ADB | Android precisa autorizar a chave; desbloqueio não substitui autorização |
| `waiting for device` | Confira modo, cabo, drivers/permissões USB e repasse da VM; não repita comandos destrutivos |
| `flashing unlock is not allowed` ou semelhante | Reveja Desbloqueio OEM e elegibilidade documentada; não use um suposto bypass |
| Aviso físico não pode ser lido | Recupere controle/tela antes; não confirme por adivinhação |
| Volta ao Android inicial | Pode ser a limpeza prevista; confira estado por consulta antes de repetir |
| Comando não suportado | Confira ferramenta/implementação e procedimento do modelo; não tente outra família de comando ao acaso |
| Sem boot depois da operação | Identifique o modo em [triagem](../recuperacao/triagem.md), preserve acesso e siga restauração exata |

Desbloquear não oferece rollback de arquivos apagados. Retornar a Android segue [restauração](../recuperacao/restaurar-android.md); relock é outra operação destrutiva e exige imagens aceitas, estado completo e regras de rollback. A Fairphone alerta que religar a trava sobre software com patch mais antigo pode inutilizar o boot. Não fornecemos lock como passo automático deste tutorial.

## Checklist de conclusão e fontes

- [ ] Modelo/variante elegível e recuperação externa conferidos antes da limpeza.
- [ ] ADB autorizado e Fastboot identificado no computador correto.
- [ ] Confirmações físicas compreendidas; limpezas previstas concluídas.
- [ ] Estado consultado, firmware/base seguinte ainda conferidos.
- [ ] Nenhuma imagem gravada ou relock realizado fora do procedimento escolhido.

Revisão **documental em 11/10/2026**, sem desbloqueio físico nesta revisão. Fontes primárias:

- [AOSP: bloqueio, desbloqueio e proteção de seções críticas](https://source.android.com/docs/core/architecture/bootloader/locking_unlocking).
- [Fairphone: procedimento atual e alertas de relock](https://support.fairphone.com/hc/en-us/articles/10492476238865-How-to-unlock-or-lock-your-Fairphone-s-bootloader).
- [Fairphone: pacotes originais, requisitos e restauração](https://support.fairphone.com/hc/en-us/articles/18896094650513-How-to-manually-install-Android-on-your-Fairphone).
- [Android Developers: Platform-Tools](https://developer.android.com/tools/releases/platform-tools).
- [Receita FP4: modos físicos e condição de desbloqueio](https://github.com/ubports/installer-configs/blob/master/v2/devices/FP4.yml).
