---
title: Configure o desktop pela primeira vez, sem terminal
description: 'Um roteiro visual para GNOME: aplicativos, idioma, teclado, rede, Bluetooth, monitor, som e energia com testes separados.'
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Este roteiro começa quando o **GNOME já está aberto no Linux**. Para instalar e torná-lo a sessão principal, siga [GNOME nativo](gnome-nativo.md). Resultado: encontrar configurações, conectar recursos já suportados e testar o uso básico. Dificuldade: iniciante. Nomes e organização variam por versão e pelas adaptações móveis; as fontes GNOME abaixo descrevem o desktop convencional.

Uma opção aparecer nas Configurações não instala o driver que falta. Se ela está ausente ou não funciona, registre o sintoma e siga o capítulo de hardware correspondente. No Android com desktop em PRoot/Termux:X11, rede e Bluetooth continuam normalmente sob o controle do Android; este roteiro não transfere seu hardware ao desktop convidado.

## 1. Encontre aplicações, arquivos e configurações

Use **Atividades**, normalmente no canto superior esquerdo, ou a tecla Super/Windows. Digite “Configurações” e abra o resultado. Para outros aplicativos, faça a mesma busca pelo nome. O botão de grade mostra aplicações; a pesquisa costuma ser mais fácil no primeiro uso. Com mouse, você não depende de conhecer atalhos.

Abra **Arquivos**, entre na sua pasta pessoal e crie uma pasta `Meus projetos`. Anote onde ela ficou. Não comece salvando projetos em pastas do sistema como `/usr` ou `/etc`. Se precisa editar por terminal, a [aula de arquivos](../comece-aqui/terminal-primeiros-passos.md) mostra um exercício separado.

**Verificação:** você consegue abrir Configurações, voltar ao desktop, localizar Arquivos e reabrir a pasta de projetos. Não há necessidade de fechar a sessão ou reiniciar para encontrar o menu.

## 2. Idioma e teclado são escolhas diferentes

Procure nas Configurações por **Região e idioma** e **Teclado**. O idioma afeta textos da interface; a fonte de entrada afeta quais símbolos as teclas produzem. Um teclado brasileiro ABNT2 tem disposição diferente de um teclado americano. Adicione a fonte correspondente ao teclado que você está usando, em vez de escolher somente pelo país onde está.

Abra um editor/notas e teste letras, Shift, números, pontuação e `ç`, quando houver essa tecla. Se o teclado envia letras incorretas, pode ser layout. Se não envia nada, trocar layout não conserta enumeração/driver; siga [teclados USB](../hardware/teclados-usb.md) ou [Bluetooth](../hardware/bluetooth.md). [Fontes de entrada no GNOME](https://help.gnome.org/gnome-help/keyboard-layouts.html).

Se o teclado físico não está disponível, procure **Acessibilidade → Digitação → Teclado na tela**, quando oferecido pela sua versão. O comportamento automático depende de aplicação, toolkit e sessão; mantenha mouse e um canal de [SSH](../projetos/ssh-remoto.md) se a tela do telefone estiver quebrada. [Teclado de tela GNOME](https://help.gnome.org/gnome-help/keyboard-osk.html).

## 3. Conecte uma rede Wi-Fi pela interface

Abra o menu no lado direito da barra superior, encontre Wi-Fi e selecione a rede. Se o menu estiver diferente, abra Configurações e pesquise Wi-Fi. Ative o rádio se estiver desligado, escolha uma rede que você tem autorização para usar e digite a senha no diálogo. Não publique essa senha na documentação ou nos registros.

Depois de conectar, abra uma página pública no navegador. Ícone de conectado comprova associação, mas não resolve portal cativo, DNS ou bloqueio entre clientes. Redes de faculdade/empresa podem exigir configuração 802.1X e certificado; siga as instruções da instituição, sem desativar validação do servidor. [Conexão Wi-Fi GNOME](https://help.gnome.org/gnome-help/net-wireless-connect.html).

**Verificação:** a página abre e você consegue acessar o telefone pelo canal administrativo configurado, se necessário. Se não houver adaptador Wi-Fi no painel, siga [diagnóstico de Wi-Fi](../hardware/wifi.md); não instale um segundo gerenciador de rede sobre o já existente.

## 4. Pareie um periférico Bluetooth e teste sua função

Nas Configurações, abra Bluetooth e ative o rádio. No teclado/mouse/fone, use o modo de pareamento **descrito no manual do periférico**. Alguns teclados têm canais 1/2/3: escolha um e registre qual. Selecione o nome correto na lista, confira o código apresentado e complete a confirmação. Teclados podem exigir digitar o código no próprio teclado e Enter. [Pareamento GNOME](https://help.gnome.org/gnome-help/bluetooth-connect-device.html.pt_BR).

Depois do estado conectado, faça um teste real: letras num campo com foco, movimento/clique/rolagem do mouse ou reprodução no fone. Para reconectar um dispositivo já vinculado, ligue-o no mesmo canal; apertar Connect pode iniciar um **novo pareamento**, conforme o modelo.

**Verificação:** o periférico executa sua função e retorna depois de desligar/ligar sua chave. Se o painel diz conectado mas não há entrada/áudio, use [Bluetooth por camadas](../hardware/bluetooth.md). Não remova todos os vínculos nem reinicie o rádio repetidamente para testar uma única tecla.

## 5. Configure o monitor externo que já foi detectado

Primeiro confirme que aparelho, port e hub suportam o caminho de vídeo; [USB-C e hubs](../hardware/usb-c-hubs.md) explica essas condições. Alimente o monitor pelo método apropriado, selecione nele a entrada utilizada e conecte vídeo. Não use uma porta “USB-C Data” do hub presumindo DisplayPort.

Nas Configurações GNOME, pesquise **Telas/Monitores**. Se o monitor está listado, selecione-o, escolha um modo **oferecido pelo monitor**, escala e orientação, e aplique. Confira a imagem antes de confirmar manter; o GNOME prevê retorno após tempo limite se você não confirmar. Quando há duas telas, escolha juntar/espelhar conforme o objetivo. [Configuração de monitores GNOME](https://help.gnome.org/gnome-help/display-dual-monitors.html.pt_BR).

**Verificação:** a imagem aparece fisicamente inteira, o ponteiro alcança os controles e o modo é confortável. Uma captura remota não comprova pixels no HDMI. Salve um documento de teste e confira reconexão HDMI e hub separadamente, sem trabalho importante aberto. Se o conector some ou CrashDump ocorre, siga [hotplug de vídeo](../hardware/video-hotplug.md), preservando os registros.

## 6. Escolha a saída de som, depois teste o microfone

Abra Configurações → Som. Em **Saída**, escolha telefone, monitor/HDMI, USB ou fone Bluetooth conforme os dispositivos detectados. Comece com volume baixo e use o teste oferecido ou um arquivo local conhecido. Nem todo monitor tem alto-falante, mesmo recebendo vídeo. [Saída de áudio GNOME](https://help.gnome.org/gnome-help/sound-usespeakers.html).

Em **Entrada**, escolha o microfone correto e observe o medidor enquanto fala. Uma “fonte monitor” pode capturar o áudio de saída, não sua voz. Depois confira uma gravação curta, sem registrar outras pessoas, e só então o navegador/Meet. Permissões do site e da aplicação são outra camada.

**Verificação:** ouve o arquivo no destino escolhido e sua gravação contém sua voz. Se apenas uma parte funciona, siga [áudio](../hardware/audio.md) para aquela função, sem copiar mixers de outro telefone.

## 7. Diferencie apagar tela, bloquear e suspender

No painel **Energia**, veja o tempo de apagar a tela. Essa ação reduz atividade do display; **suspensão** tenta parar mais partes do sistema e pode interromper serviços/rede. **Bloqueio de tela** protege a sessão com autenticação. São controles diferentes e podem ter configurações separadas.

Comece testando somente apagar a tela após alguns minutos. Salve o trabalho, espere e tente acordar por entrada suportada. O programa aberto deve continuar disponível. [Tempo de tela GNOME](https://help.gnome.org/gnome-help/display-blank.html).

Só configure suspensão automática depois de confirmar que **o port desse aparelho** retoma sem crash e preserva controle. Um servidor precisa permanecer acessível conforme seu objetivo. Para um telefone com tela quebrada, bloquear/suspender sem um meio funcional de entrada pode tornar a recuperação física necessária. [Configuração de suspensão GNOME](https://help.gnome.org/gnome-help/power-autosuspend.html) descreve os controles, não o suporte dos drivers móveis.

Se perfis de energia aparecem, comece em Equilibrado. “Desempenho” só funciona quando a pilha implementa o perfil; não torna seguro desativar controles térmicos. Confira o [guia de energia](../hardware/energia.md) para medir carga e temperatura. Um ícone de raio não demonstra que a bateria aumenta sob uso.

## 8. Aplicativos e personalização, uma alteração por vez

Para loja, pacotes e Flatpak, siga [instalar aplicativos do zero](instalar-aplicativos.md). GNOME e a loja Software são componentes diferentes; a loja pode precisar do plugin e de uma origem compatível. Primeiro instale uma aplicação pequena e teste.

Papéis de parede e aparência podem ser ajustados nas Configurações, conforme a versão. Antes de instalar extensões, confira compatibilidade com **a versão do GNOME Shell**, origem e como desativar cada uma. Uma extensão pode modificar a sessão principal e causar falhas. Guarde um estado funcional antes de personalizar o painel; não instale várias e depois tente descobrir qual alterou o comportamento.

## Teste final e reversão

Faça uma lista: abrir aplicações, salvar arquivos, teclado/layout, rede, periférico Bluetooth, monitor, som, retorno da tela e boot. Marque “não suportado/não testado” onde faltar recurso. Para reverter configurações de usuário, volte ao mesmo painel e recoloque os valores anteriores; não apague toda a pasta de configurações para desfazer um ajuste.

Se um problema começou após instalar uma extensão/aplicativo, revise essa alteração específica. Se iniciou após trocar energia/cabos, registre a topologia e siga hardware. O objetivo é uma sequência de funções observadas, não uma barra de status visualmente completa.

## Fontes e verificação

Revisão documental em **11/10/2026**, com páginas GNOME de [rede](https://help.gnome.org/gnome-help/net-wireless-connect.html), [Bluetooth](https://help.gnome.org/gnome-help/bluetooth-connect-device.html.pt_BR), [monitor](https://help.gnome.org/gnome-help/display-dual-monitors.html.pt_BR), [som](https://help.gnome.org/gnome-help/sound-usespeakers.html), [layout](https://help.gnome.org/gnome-help/keyboard-layouts.html), [tela](https://help.gnome.org/gnome-help/display-blank.html) e [suspensão](https://help.gnome.org/gnome-help/power-autosuspend.html). Nenhum teste físico foi executado nesta revisão; organização de painéis e suporte dos ports variam.
