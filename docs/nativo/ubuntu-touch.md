---
title: Instale Ubuntu Touch em um aparelho suportado
description: Instalação com UBports Installer e compreensão de Lomiri, convergência e aplicativos desktop.
sidebar_position: 4
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Visão geral e resultado esperado

Ubuntu Touch é um sistema móvel mantido pela UBports. O boot termina em seu ambiente, normalmente **Lomiri**, e não em um aplicativo dentro do Android. Ports baseados em Halium podem usar componentes do Android para acesso ao hardware; “substituir Android” não significa necessariamente utilizar drivers mainline.

O resultado esperado é Ubuntu Touch inicializando diretamente e aplicações compatíveis disponíveis. **Não é uma instalação convencional do Ubuntu Desktop com GNOME.** Se o objetivo indispensável é GNOME como sessão principal com pacotes de desktop, examine também postmarketOS/Nura ou Mobian no seu hardware.

Dificuldade: intermediária com dispositivo mantido e instalador; avançada para porting. A presença de Termux, root ou uma GSI Android não comprova suporte ao Ubuntu Touch.

## Compatibilidade, materiais e conhecimentos

Antes de começar, abra o [catálogo de dispositivos](https://devices.ubuntu-touch.io/) e procure código/codinome exatos. Leia a release, recursos e instruções específicas, incluindo **a versão Android original exigida**. Um exemplo concreto é o [Fairphone 4](fairphone-4.md), para o qual a documentação consultada exige uma base particular; isso não deve ser generalizado a outros modelos.

Materiais: computador Linux/macOS/Windows compatível com o instalador, cabo direto de dados, espaço para downloads, acesso aos botões/tela e [backup](../preparacao/backup.md). Prepare Platform-Tools para diagnosticar conexão, mesmo quando o instalador inclui suas próprias ferramentas.

## Backup e riscos

Trocar Android por Ubuntu Touch não preserva automaticamente os dados. Exporte arquivos, aplicativos e credenciais. O instalador pode alterar partições, instalar recovery e limpar dados conforme a receita do aparelho. Leia os avisos e registre as opções. Uma opção de preservar dados que funciona numa atualização do próprio Ubuntu Touch não deve ser usada para uma primeira migração de Android.

Não faça downgrade para a versão de base sem conferir proteção contra rollback e método de fabricante. A exigência de uma base antiga é um requisito técnico, não autorização para usar qualquer pacote antigo encontrado em fórum.

## 1. Prepare o estado requerido pelo modelo

1. Confirme o modelo e a variante pela [ficha](../compatibilidade/inventario.md).
2. Anote firmware de base, estado do bootloader e instruções de recovery.
3. Siga o desbloqueio específico do fabricante, se requerido e após backup.
4. Volte ao sistema de base quando exigido, confira sua versão e restabeleça depuração USB.
5. Teste conexão do cabo e modos utilizados sem gravar imagens independentes.

```bash
# No computador, com Android autorizado:
adb devices -l
adb shell getprop ro.product.device
adb shell getprop ro.build.version.release
adb shell getprop ro.build.fingerprint
```

Essas consultas ajudam a confirmar estado. Uma propriedade de versão modificada por ROM não substitui a base vendor requerida; confira a origem do sistema instalado. Se houver discrepância, suspenda a instalação.

## 2. Obtenha e execute o UBports Installer

### 2.1 Escolha o arquivo do computador, não do telefone

Abra as [releases oficiais do UBports Installer](https://github.com/ubports/ubports-installer/releases), seguindo também o link da página de seu aparelho. Na publicação, abra **Assets** para ver os instaladores. “Source code” é código-fonte para desenvolvedores, não o aplicativo pronto para a primeira instalação.

Em **11/10/2026**, a release consultada era **0.11.2**. Os exemplos abaixo usam seus nomes reais; ao escolher outra versão, ajuste nomes/checksums para a mesma publicação. A arquitetura do instalador é a do **computador**: um telefone ARM64 pode ser instalado a partir de um notebook x86_64. AMD64/x64/x86_64 são nomes usuais para esse tipo de computador; não significam que precisa ser um processador AMD.

| Computador | Pacote publicado e forma de abrir |
|---|---|
| Ubuntu/Debian x86_64 | `.deb`; instalar pelo gerenciador e abrir pelo menu |
| Linux x86_64, por exemplo Fedora | `.AppImage`; dar permissão de execução e abrir |
| Windows x64 | `.exe`; abrir o instalador baixado |
| macOS Intel/x64 | `.dmg`; montar e instalar o aplicativo conforme a janela |
| ARM/32 bits ou outra plataforma | Confira se a release oferece um pacote compatível; não assuma que x64 funciona nativamente |

Downloads da versão verificada: [Linux .deb](https://github.com/ubports/ubports-installer/releases/download/0.11.2/ubports-installer_0.11.2_linux_amd64.deb), [Linux AppImage](https://github.com/ubports/ubports-installer/releases/download/0.11.2/ubports-installer_0.11.2_linux_x86_64.AppImage), [Windows x64](https://github.com/ubports/ubports-installer/releases/download/0.11.2/ubports-installer_0.11.2_win_x64.exe) e [macOS x64](https://github.com/ubports/ubports-installer/releases/download/0.11.2/ubports-installer_0.11.2_mac_x64.dmg). Use a [página de releases](https://github.com/ubports/ubports-installer/releases) para obter o arquivo `.sha256` correspondente. Esses links não são firmware do telefone.

### 2.2 Baixe e confira a integridade

No navegador, clique no instalador da tabela e no `.sha256` de **mesmo nome/versão**. Aguarde os dois downloads terminarem. Se o navegador mostrar `.part` ou `.crdownload`, o download ainda não terminou. No gerenciador de arquivos, crie uma pasta para os instaladores e mova os dois arquivos para ela. No Linux, é possível preparar a pasta no terminal:

```bash
mkdir -p "$HOME/smartphone-linux/instaladores"
```

Abra essa pasta no gerenciador de arquivos; Ctrl+L permite digitar o caminho da sua pasta pessoal seguido de `smartphone-linux/instaladores`. Depois de mover os arquivos, no **terminal do computador**:

```bash
cd "$HOME/smartphone-linux/instaladores"
ls -lh
cat ubports-installer_0.11.2_linux_amd64.deb.sha256
sha256sum ubports-installer_0.11.2_linux_amd64.deb
```

`ls` precisa mostrar os arquivos reais. O `cat` apresenta o hash publicado; `sha256sum` calcula o hash do arquivo baixado. Compare os **64 caracteres**: precisam ser iguais. O `.sha256` desta release contém somente o hash, sem nome do arquivo; portanto **não use `sha256sum -c` diretamente nele**. Num AppImage, substitua ambos os nomes pelos respectivos arquivos AppImage. Um hash coincidente verifica integridade relativamente à publicação; a confiança também depende de ter obtido a publicação pela origem correta.

Em Windows, abra PowerShell na pasta do download e use `Get-FileHash .\ubports-installer_0.11.2_win_x64.exe -Algorithm SHA256`; abra o `.sha256` como texto e compare. No macOS, no Terminal daquela pasta, `shasum -a 256 ubports-installer_0.11.2_mac_x64.dmg` faz o cálculo. Não pule uma divergência: baixe novamente da origem e confirme a versão.

### 2.3 Instale/execute no sistema escolhido

**Ubuntu/Debian x86_64, na pasta que contém o `.deb`:**

```bash
sudo apt install ./ubports-installer_0.11.2_linux_amd64.deb
```

O `./` indica um arquivo local; o gerenciador resolve dependências. A senha pedida pertence ao computador. Ao terminar, procure **UBports Installer** no menu de aplicativos e abra normalmente. Instalar o pacote com privilégio administrativo é diferente de **executar o aplicativo como root**: a UBports orienta não iniciar com `sudo`.

**Fedora/outro Linux x86_64, com o AppImage verificado:**

```bash
chmod u+x ubports-installer_0.11.2_linux_x86_64.AppImage
./ubports-installer_0.11.2_linux_x86_64.AppImage
```

`chmod u+x` concede permissão de execução ao seu usuário; a segunda linha abre o aplicativo. Um AppImage não precisa ser descompactado como ZIP. Também é possível usar Propriedades → Permissões → permitir execução no gerenciador de arquivos.

Se a mensagem mencionar **FUSE**, consulte o [manual AppImage](https://docs.appimage.org/user-guide/troubleshooting/fuse.html). No Ubuntu 24.04, a biblioteca se chama `libfuse2t64`; em versões anteriores pode ser `libfuse2`. Não remova `fuse3` nem instale pacotes de outra distribuição. Para uma AppImage tipo 2 verificada, a extração é alternativa documentada:

```bash
./ubports-installer_0.11.2_linux_x86_64.AppImage --appimage-extract
./squashfs-root/AppRun
```

Isso cria `squashfs-root` **na pasta atual**, com o aplicativo, sem gravar no telefone. Se ainda houver erro de sandbox/compatibilidade, preserve a mensagem e use um pacote suportado ou outro host; não desative a sandbox nem execute como root para esconder o erro.

**Windows:** abra o `.exe` verificado com duplo clique, conclua a instalação e abra o aplicativo pelo menu. Se houver bloqueio do antivírus, confira origem/publicação antes de decidir; não desative proteção global para arquivos desconhecidos. O driver USB pode precisar ser específico do fabricante e do modo, como explica [ADB/Fastboot](../preparacao/adb-fastboot.md).

**macOS:** abra o `.dmg` verificado e use a janela para instalar o aplicativo em Applications quando esse for o fluxo oferecido. Inicie pelo Finder. Se o sistema bloquear, verifique procedência e a autorização específica em Ajustes → Privacidade e Segurança; não desabilite as proteções do sistema inteiro. O pacote x64 não é prova de suporte nativo a Mac ARM.

Uma alternativa oficial para Linux com snap já instalado é `sudo snap install ubports-installer`; depois abra `ubports-installer` sem `sudo`. Não é necessário executar todos os métodos: escolha **um**.

**Tela esperada:** uma janela do UBports Installer pedindo conexão/identificação de aparelho, ou mostrando o modelo detectado. Nessa fase, abrir o aplicativo sozinho não grava o telefone. Anote a versão em About/Sobre.

## 3. Siga a sequência sem misturar outro tutorial

Conecte o telefone **diretamente ao computador**, com Android no estado requerido e ADB autorizado quando o método o usar. Confira o modelo detectado. Se precisar selecionar manualmente, escolha somente o codinome já confirmado; a seleção manual não cria suporte.

Os textos exatos dependem da tradução e receita, mas o fluxo deve ser acompanhado assim:

| Etapa da janela | O que conferir antes de avançar | Resultado esperado |
|---|---|---|
| Conexão/modelo | Mesmo modelo/variante de sua ficha | Nome correto, sem selecionar outro telefone |
| Avisos/requisitos | Firmware exigido, backup, desbloqueio e condições de limpeza | Você consegue comprovar cada requisito |
| Sistema/canal | Ubuntu Touch e canal estável oferecido para esse port | Versão/canal registrados; não uma release escolhida por outro modelo |
| Opções da instalação | Leia a explicação de wipe/bootstrap/particionamento quando existirem | Primeira migração aceita a limpeza requerida; preservar dados não preserva Android |
| Bootloader/recovery | Siga somente botões/ações da janela para o modelo | Tela do telefone muda para o modo solicitado e aplicativo volta a detectá-lo |
| Download/gravação | Internet, cabo e energia estáveis | Progresso sem erro; pode haver mais de uma reinicialização |
| Conclusão | Mensagem de término **e** boot real | Assistente inicial do Ubuntu Touch, não apenas “sucesso” no computador |

No [FP4](fairphone-4.md), a receita publica rótulos como `Confirm your model`, `Confirm OS version`, `Wipe Userdata`, `Partitioning` e `Bootstrap`; não presumimos que todos os aparelhos tenham essas opções. Um check-box que reorganiza partições não é cosmético.

Não mantenha outro aplicativo enviando comandos ADB/Fastboot ao mesmo aparelho. Em VM, cada mudança de modo pode criar uma nova interface USB que precisa ser repassada. Enquanto grava, não remova o cabo nem encerre o instalador para “forçar o boot”.

Anote a versão do instalador, canal, base Android e horário. Em falha, preserve o log e a última ação concluída. Não repita manualmente um apagamento de partição do log como “correção” sem entender o estado deixado pelo instalador.

## 4. Valide a inicialização e o uso desktop

Depois do primeiro boot, configure bloqueio, rede e atualizações pela interface. Teste entrada e saída de vídeo apenas se a página do aparelho indicar suporte. Convergência adapta a interface ao uso com periféricos; não é prova de compatibilidade com todo hub ou monitor.

O mecanismo **Libertine** permite aplicativos desktop dentro de ambientes gerenciados. Use Configurações → Libertine para criar o ambiente e instalar pacotes compatíveis. Não altere o rootfs principal com `apt` como num Ubuntu Desktop comum: o modelo de atualização é diferente. A documentação alerta que aplicativos Libertine não são a solução para servidores persistentes em background.

Exemplo de consultas, executadas em shell apropriado no Ubuntu Touch, conforme as restrições da versão:

```bash
libertine-container-manager list
libertine-container-manager list-apps
```

Elas listam ambientes e aplicativos, sem adicionar pacotes. Para instalar, prefira o fluxo gráfico documentado inicialmente; ambientes múltiplos exigem selecionar o identificador correto. Uma aplicação X11 antiga pode ter problemas de escala e entrada mesmo quando instala.

Para administração remota, siga o [guia SSH UBports](https://docs.ubports.com/en/latest/userguide/advanceduse/ssh.html): chave pública no telefone, permissões corretas e socket/serviço da versão instalada. Não habilite acesso com senha padrão na internet. ADB e SSH são funções a confirmar no port, não garantias gerais.

## Erros comuns e alternativas

| Mensagem/fase | O que fazer primeiro | O que não conclui |
|---|---|---|
| Arquivo/pacote não encontrado | Confira pasta e nome com `ls`; versão/arquitetura devem coincidir | Mudar a extensão não converte pacote |
| Janela nem abre | Execute pelo terminal para ler erro; confira arquitetura/FUSE/dependências | Isso não significa falha do telefone |
| `unauthorized` | Autorize a chave do computador na tela Android | Root ou desbloqueio não substituem essa autorização |
| `waiting for device` após mudar de modo | Confira modo, cabo, driver/permissões e VM | Não pede automaticamente repetir desbloqueio |
| Checksum/download falhou | Preserve log e repita o download oficial compatível | Não desative integridade para continuar |
| Boot para Android/recovery após término | Confira receita/base/última etapa e canal | Não prova que outra boot image aleatória resolverá |

- **Instalador não detecta:** confirme modelo, cabo, permissões/driver do modo atual e ferramentas; consulte [ADB/Fastboot](../preparacao/adb-fastboot.md).
- **Não inicializa após “sucesso”:** compare firmware de base e variante antes de repetir; instalador concluído não prova boot funcional.
- **Aplicativo Android não existe:** Ubuntu Touch tem seu ecossistema; Waydroid depende do port e nem todo aplicativo funciona nele.
- **Aplicativo desktop instala, mas não abre:** confira suporte e limitações Libertine, arquitetura e logs.
- **Seu modelo não está no catálogo:** mantenha Android ou participe de porting. Não tente selecionar um modelo próximo.

## Recuperação/rollback

Para falha de conexão, identifique o modo e utilize o fluxo de retomada documentado do instalador. Para voltar a Android, use firmware e método do fabricante para aquela variante. Isso normalmente envolve perda de dados do sistema novo. Não religue a trava sobre Ubuntu Touch se não existir suporte explícito para isso.

## Testes finais e próximos passos

Reinicie sem o computador; teste Wi-Fi, carga, aplicações, teclado/mouse e monitor quando suportado. Teste desconectar e reconectar periféricos sem perder documentos abertos. Caso o uso pretendido seja servidor, revise as políticas de execução e suspensão antes de confiar em disponibilidade contínua.

## Fontes e limites da verificação

Documental em **11/10/2026**; releases, nomes e formato dos checksums foram conferidos, mas instalação/periféricos não foram validados fisicamente em todos os modelos. Interfaces podem mudar; a receita específica determina quais opções aparecem.

- [UBports: instalação](https://docs.ubports.com/en/latest/userguide/install.html).
- [Catálogo de dispositivos](https://devices.ubuntu-touch.io/).
- [Arquitetura e introdução ao porting](https://docs.ubports.com/en/latest/porting/introduction/Intro.html).
- [Libertine: aplicativos desktop e limitações](https://docs.ubports.com/en/latest/userguide/dailyuse/libertine.html).
- [Waydroid no Ubuntu Touch](https://docs.ubports.com/en/latest/userguide/dailyuse/waydroid.html).
- [SSH](https://docs.ubports.com/en/latest/userguide/advanceduse/ssh.html).
- [Publicações oficiais do UBports Installer](https://github.com/ubports/ubports-installer/releases) e [receita FP4](https://github.com/ubports/installer-configs/blob/master/v2/devices/FP4.yml).
- [Execução de AppImages](https://docs.appimage.org/user-guide/run-appimages.html) e [diagnóstico de FUSE](https://docs.appimage.org/user-guide/troubleshooting/fuse.html).
