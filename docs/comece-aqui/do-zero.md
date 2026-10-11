---
title: Nunca fiz isso — por onde começo?
description: Uma trilha guiada desde identificar o telefone até escolher, instalar e validar um ambiente Linux.
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você não precisa saber usar Linux para começar. Precisa separar três coisas: **o aparelho que será reaproveitado**, **o computador que ajuda na preparação** e **o sistema que você quer ter ao final**. Esta página organiza a ordem dos exercícios. Nos links seguintes estão os downloads, a instalação das ferramentas e os comandos explicados.

Para acompanhar aulas com uma lista de verificações, abra [Minha trilha — aprenda fazendo](minha-trilha.mdx). Você pode praticar no [terminal simulado](laboratorio.mdx), conferir conceitos por [microaulas](micro-aulas.md) e ir direto à [primeira aplicação no Termux](../aulas/primeiro-projeto-termux.md). Nenhuma dessas ferramentas interativas se conecta ao telefone.

## O que você vai conseguir e o que precisa ter

Ao final da trilha, você terá escolhido um caminho com base no seu aparelho, feito um primeiro teste e registrado o que funciona. A parte inicial é para iniciantes e não exige root. Uma instalação nativa pode passar a ser intermediária ou avançada, dependendo do modelo; o nível aumenta no ponto indicado pelo tutorial.

Separe o telefone, um carregador apropriado, acesso à internet e um lugar fora dele para suas anotações e cópias. Para ADB, desbloqueio ou instalação pelo computador, acrescente notebook/desktop e **cabo que transmita dados**. Um cabo que carrega não está necessariamente apto a transferir arquivos. Hub e monitor só são necessários quando chegar à etapa de periféricos.

Abra o aplicativo de notas do computador e crie um documento chamado “Meu projeto Linux no celular”. Você pode usar o Bloco de Notas no Windows, Editor de Texto no Linux ou TextEdit no macOS. Salve numa pasta que consiga localizar depois. Ainda não há comandos para copiar.

## Etapa 1 — descubra exatamente o que você tem

No telefone Android, abra **Configurações**. Procure “Sobre o telefone”, “Sobre o dispositivo” ou use a busca das configurações com a palavra “modelo”. Anote o código do modelo e a versão Android. O nome comercial da caixa, sozinho, pode agrupar aparelhos diferentes.

Continue no [inventário guiado](../compatibilidade/inventario.md). Ele ensina a completar a ficha sem terminal e, depois, a consultar dados por ADB. Se a tela estiver quebrada, use o [guia de preparação sem tela](../preparacao/tela-quebrada.md); não tente clicar às cegas numa confirmação que apaga dados.

**Pare e confira:** você sabe dizer o código do modelo? Sabe se o Android ainda inicia? Sabe se consegue tocar na tela? Se não, registre “não sei” — isso é uma informação útil para o assistente, não uma falha.

## Etapa 2 — escreva seu objetivo em uma frase

Alguns exemplos: “Quero aprender Python sem trocar o Android”; “Quero um servidor SSH que fique ligado em casa”; “Quero remover Android e iniciar diretamente num desktop Linux”. Essas frases levam a preparações diferentes.

| Seu objetivo | Primeiro tutorial útil | Root necessário? |
| --- | --- | --- |
| Terminal e programação, preservando Android | [Instalar Termux do zero](../android/termux.md) | Não |
| Debian/Ubuntu em terminal, preservando Android | [PRoot depois do Termux](../android/proot-distro.md) | Não |
| Desktop Linux dentro do Android | [Interface gráfica sobre Android](../android/desktop.md) | Não no caminho apresentado com PRoot/Termux:X11 |
| Chroot com Android e acesso privilegiado | [Chroot](../android/chroot.md), após avaliar [root](../preparacao/root-magisk.md) | Sim, para o método descrito |
| Linux que inicializa no lugar do Android | [Avaliação de instalação nativa](../nativo/visao-geral.md) | Root Android não é requisito universal; o método de boot/instalação do port é decisivo |
| Apenas acessar outro computador | [Acesso remoto](../desktop/acesso-remoto.md) | Não, em geral |

Esses são caminhos, não uma lista de etapas obrigatórias. Você **não** precisa instalar Termux, root e chroot antes de Linux nativo. Veja as diferenças em [Linux e Android](../fundamentos/linux-android.md) e responda ao [assistente de decisão](../escolha/index.mdx). Se não existir um port para seu modelo, escolher Termux é um resultado viável.

## Etapa 3 — aprenda a ler um comando antes de usar um comando de manutenção

Faça a [aula prática de terminal](terminal-primeiros-passos.md). Ela começa ensinando onde abrir o terminal, o que copiar e como criar/salvar um arquivo. Não requer desbloqueio do aparelho.

Para preparar ferramentas no computador, siga [computador, pastas e downloads](computador-downloads.md). Existe uma diferença entre baixar um ZIP, extrair esse ZIP e executar o programa contido nele. O guia mostra como reconhecer cada caso e como escolher Windows, Linux ou macOS.

Consulte [onde baixar cada ferramenta](downloads.md) para encontrar a origem oficial e o tutorial de instalação, sem precisar procurar o programa num anúncio ou em um vídeo.

**Pare e confira:** você consegue ver a pasta em que está, executar uma consulta e reconhecer quando um comando terminou? Se uma linha diz “no telefone”, você sabe como entrar no terminal dele? Só avance quando essas perguntas tiverem resposta.

## Etapa 4 — escolha uma primeira experiência pequena

Se Android funciona, comece pelo [tutorial Termux](../android/termux.md): instalação do APK, atualização dos pacotes e primeiro programa. Seu teste de sucesso será executar algo dentro do telefone. Fechar o aplicativo não substitui Android nem modifica bootloader.

Se já decidiu por Linux nativo e há suporte documentado, termine [backup](../preparacao/backup.md), [ADB/Fastboot](../preparacao/adb-fastboot.md) e [desbloqueio do modelo](../preparacao/desbloquear-bootloader.md), quando ele for exigido pelo port. Em seguida escolha **um** tutorial:

| Caminho nativo | Por que escolher | Onde começar a instalação |
| --- | --- | --- |
| postmarketOS/Nura com imagem publicada | O modelo tem imagem e instrução de instalação mantidas | [Imagens, download e primeiro boot](../nativo/postmarketos-imagens.md) |
| postmarketOS/Nura com pmbootstrap | O port exige gerar os arquivos ou você precisa escolher a interface | [Preparar computador e pmbootstrap](../nativo/postmarketos-pmbootstrap.md) |
| Ubuntu Touch | O catálogo confirma variante e requisitos | [Instalador UBports do zero](../nativo/ubuntu-touch.md) |
| Mobian/Droidian | Há instruções específicas para seu hardware | [Escolha entre Mobian e Droidian](../nativo/mobian-droidian.md) |

Um telefone ausente das listas não deve receber a imagem de outro porque os dois são ARM64. Nesse caso, volte ao assistente ou estude [porting](../nativo/porting.md) como projeto de desenvolvimento, não como instalação para iniciantes.

## Etapa 5 — transforme o resultado em um computador útil

Instale primeiro uma aplicação pequena e valide antes de acrescentar outras. [Programação](../projetos/desenvolvimento.md) ensina Python, JavaScript e C/C++; [Arduino e ESP32](../projetos/arduino-esp32.md) ensina o fluxo para compilar e gravar uma placa. [SSH](../projetos/ssh-remoto.md) prepara acesso administrativo; [GNOME nativo](../desktop/gnome-nativo.md) explica uma sessão principal num sistema compatível.

Quando o GNOME estiver aberto, siga a [primeira configuração pela interface](../desktop/primeira-configuracao.md) para rede, Bluetooth, teclado, monitor, som e energia. Para a loja e os pacotes, há um [tutorial de instalar aplicativos](../desktop/instalar-aplicativos.md), com um exemplo pequeno antes de aplicações maiores.

Para monitor, siga [USB-C e hubs](../hardware/usb-c-hubs.md). A ordem de teste importa: referência no Android, capacidade de vídeo documentada, alimentação do monitor, negociação do hub, monitor detectado e sessão gráfica. Não compre adaptadores supondo que toda porta USB-C emite vídeo.

Na resolução de problemas, prepare a [caixa de ferramentas](../diagnostico/instalar-ferramentas.md) antes de executar os diagnósticos. Cada ferramenta deve ser instalada no sistema que está investigando: instalar `lsusb` no notebook não faz esse comando aparecer no telefone.

## Etapa 6 — teste o uso sem o notebook

O computador de preparação não precisa fazer parte do uso final, se seu caminho não depender dele. Mas esse resultado deve ser verificado: feche arquivos, salve o trabalho e teste reinício, alimentação, rede e acesso pelo método escolhido. Para desktop externo, teste retirar/reconectar HDMI e hub separadamente, observando se a sessão continua e os periféricos voltam.

Registre numa tabela “recurso / esperado / observado / versão / limitação”. Pode haver um resultado útil com câmera ou suspensão ausentes, desde que seu projeto não dependa delas. Um mouse se mexer uma vez não comprova que a carga sustenta o aparelho durante horas.

## Quando alguma coisa não corresponde à página

Não pule a verificação para “ver se o próximo comando resolve”. Anote a etapa, o sistema em que executou e o texto do erro. Compare com a tabela de erros do tutorial e com [método de diagnóstico](../diagnostico/metodo.md). Se foi apenas uma instalação de aplicação, volte ou remova pelo mesmo gerenciador. Se mudou partições, use o plano de recuperação do modelo.

Para obter ajuda, diga “estou no Windows, na pasta Platform-Tools; `adb devices` mostra unauthorized”, em vez de somente “não funciona”. Não publique senhas, números de série, IMEI ou dumps privados. Quando for fisicamente necessário aceitar um diálogo ou trocar um cabo, nenhum comando remoto substitui esse acesso.

## Fontes e verificação

Trilha editorial original, revisada em **11/10/2026**. As páginas vinculadas têm fontes e limites próprios; não houve instalação em novos aparelhos nesta revisão. Referências para a separação entre caminhos: [Termux](https://github.com/termux/termux-app), [PRoot-distro](https://github.com/termux/proot-distro), [dispositivos Ubuntu Touch](https://devices.ubuntu-touch.io/) e [instalação Nura](https://nura.eco/install/). Nenhuma dessas listas torna todos os celulares compatíveis.
