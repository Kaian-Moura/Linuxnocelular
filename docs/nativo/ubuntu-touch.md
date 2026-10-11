---
title: Instale Ubuntu Touch em um aparelho suportado
description: Instalação com UBports Installer e compreensão de Lomiri, convergência e aplicativos desktop.
sidebar_position: 4
last_verified: '2026-10-10'
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

Use o link oficial da página do dispositivo ou as [releases do instalador](https://github.com/ubports/ubports-installer/releases). Selecione pacote correspondente ao computador: deb, AppImage, snap, exe ou dmg, conforme disponibilizado. **Execute como usuário comum**, sem `sudo`, seguindo a orientação UBports.

No Linux, antes de executar um AppImage, confira origem, integridade publicada e nome. A permissão de execução pode ser concedida pela interface do gerenciador de arquivos. Não execute um arquivo desconhecido só porque termina em `.AppImage`.

Conecte o telefone diretamente. Confira a detecção do modelo, sistema selecionado e canal oferecido. Para primeiro uso, prefira o canal estável **disponível para aquele port**, em vez de assumir que todo dispositivo oferece a mesma release. Não selecione outro modelo para contornar uma falha de detecção.

## 3. Siga a sequência sem misturar outro tutorial

O instalador exibirá ações como entrar no bootloader ou recovery. Use os botões exigidos pelo modelo e aguarde os downloads/gravações. Não mantenha outro aplicativo enviando comandos ADB/Fastboot ao mesmo aparelho. Em VM, cada mudança de modo pode criar uma nova interface USB que precisa ser repassada.

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

Documental em **10/10/2026**; instalação e periféricos não validados em todos os modelos.

- [UBports: instalação](https://docs.ubports.com/en/latest/userguide/install.html).
- [Catálogo de dispositivos](https://devices.ubuntu-touch.io/).
- [Arquitetura e introdução ao porting](https://docs.ubports.com/en/latest/porting/introduction/Intro.html).
- [Libertine: aplicativos desktop e limitações](https://docs.ubports.com/en/latest/userguide/dailyuse/libertine.html).
- [Waydroid no Ubuntu Touch](https://docs.ubports.com/en/latest/userguide/dailyuse/waydroid.html).
- [SSH](https://docs.ubports.com/en/latest/userguide/advanceduse/ssh.html).
