---
title: Comece aqui
description: O que este projeto ensina, como usar os guias e como preparar um reaproveitamento seguro e viável.
sidebar_position: 1
last_verified: '2026-10-10'
---

Um smartphone pode ser útil muito depois de deixar de servir como telefone principal. Processador, memória, armazenamento, Wi-Fi e bateria podem sustentar programação, um terminal de administração, serviços na rede local ou um desktop. O desafio é fazer o software conversar com esse hardware de maneira confiável.

Esta base ajuda você a **investigar o próprio aparelho e escolher um caminho**, em vez de copiar uma sequência de flash de outro modelo. A inspiração é um OnePlus 9 Pro com Snapdragon 888 e 12 GB de RAM, mas seus resultados não definem a compatibilidade de outros celulares.

## O resultado que você pode buscar

| Caminho | Quem controla o hardware | Android continua? | O que você obtém |
|---|---|---|---|
| Termux | Kernel e serviços Android | Sim | Terminal, ferramentas e serviços compilados para o ambiente Android |
| PRoot | Kernel Android; chamadas adaptadas em espaço de usuário | Sim | Ambiente de uma distribuição, com limitações de desempenho e recursos |
| Chroot | Kernel Android, com acesso privilegiado | Sim | Outro sistema de arquivos e programas Linux, sem trocar o kernel |
| Linux nativo | Kernel e integração do port escolhido | Em geral é substituído; dual boot não é presumido | Sistema inicializado diretamente no aparelho, limitado pelos drivers disponíveis |
| Acesso remoto | Depende de onde os programas realmente executam | Depende | Controle de uma sessão; não altera por si só o sistema do telefone |

**Nativo não significa que todas as funções funcionarão.** Um aparelho pode iniciar Linux e ainda não ter câmera, suspensão, áudio ou vídeo externo utilizáveis. Inversamente, manter Android pode ser a escolha mais útil para preservar drivers, mesmo sem oferecer o controle de uma instalação nativa.

## Como percorrer a documentação

1. Leia [Linux, Android e as camadas do sistema](fundamentos/linux-android.md) se os termos forem novos.
2. Faça o [inventário do aparelho](compatibilidade/inventario.md), identificando modelo, variante e arquitetura.
3. Abra [Qual caminho devo seguir com meu celular?](escolha/index.mdx). O assistente não adivinha suporte; use “Ainda não sei” quando faltar evidência.
4. Prepare [backup e recuperação](preparacao/backup.md) antes de alterar boot ou partições.
5. Siga o tutorial do caminho escolhido e faça as verificações intermediárias.
6. Valide periféricos, energia e reconexão antes de considerar o aparelho um computador pronto.

Os guias contêm comandos de diferentes ambientes. **Um comando do notebook não deve ser colado automaticamente no telefone.** As páginas indicam onde executá-lo e que privilégio exige. Exemplos com nomes como `USUARIO` ou `IP_DO_TELEFONE` precisam ser substituídos; não são credenciais universais.

## Primeiro experimento recomendado

Para quem tem Android funcionando e ainda não decidiu substituí-lo, comece pelo [Termux](android/termux.md). Instale ferramentas, execute um pequeno programa e confira consumo e estabilidade. Esse experimento não exige flash e permite descobrir se seu objetivo já é atendido.

Se o objetivo exige iniciar Linux sem Android, procure um port **para o modelo e variante exatos**, confira sua lista de funções e estabeleça uma restauração viável. Encontrar uma imagem ARM64 não satisfaz esse requisito. Uma imagem precisa combinar kernel, descrição do hardware, firmware, formato de boot e instalação apropriados.

:::danger Antes de modificar o aparelho
Desbloqueio pode apagar todos os dados. Firmware incompatível, partições incorretas ou downgrade bloqueado podem impedir a inicialização e até a recuperação acessível ao usuário. Não use o aparelho principal como laboratório sem aceitar essas consequências. Leia o guia de recuperação antes do guia de instalação.
:::

## O que “verificado” significa aqui

Uma **revisão documental** confirma o que uma fonte primária descreve, na data registrada. Ela não equivale a executar cada procedimento em cada variante. **Teste em hardware** exige versão, equipamento, passos e resultado observável. Quando a fonte não pôde ser consultada ou um recurso não foi validado, a página registra a lacuna.

Usamos cinco estados: suportado pelo projeto, comunitário, experimental, possibilidade condicionada e não recomendado. “Comunitário” não é sinônimo de defeituoso; indica quem mantém a solução e onde procurar suporte. Um recurso experimental não deve aparecer numa tabela como garantia de funcionamento.

## O projeto original e o nome postmarketOS

O projeto original utilizou postmarketOS. Em **27 de setembro de 2026**, o projeto anunciou o nome **Nura**. Esta documentação mantém “postmarketOS/Nura” onde isso ajuda a reconhecer material histórico e registra URLs atuais; ferramentas como `pmbootstrap` não devem ser renomeadas por suposição. [Anúncio do próprio projeto](https://nura.eco/blog/2026/09/27/nura-rename/).

O [estudo do OnePlus](dispositivos/oneplus-9-pro.md) mostra adaptações e falhas reais, incluindo situações em que software, energia e vídeo interagem. Ele é um relato técnico com limites, não um instalador universal nem uma promessa de suporte oficial.

## Critérios para chamar o resultado de pronto

Um desktop deve iniciar de forma previsível, responder a teclado/mouse, voltar após desconectar o monitor, conservar aplicativos quando isso for esperado e ter um caminho independente de recuperação. Um servidor precisa reiniciar e recuperar seus serviços, manter dados e funcionar com controles térmicos. Em ambos, porcentagem de bateria e tela acesa não bastam para comprovar alimentação adequada.

Mantenha um diário: versão do kernel, distribuição, periféricos, alterações e testes. Isso reduz tentativas repetidas e permite [contribuir com evidências](comunidade/contribuir.md). Você pode reaproveitar um aparelho com poucos recursos funcionando, desde que seu projeto dependa apenas deles.

## Fontes e escopo

Revisão documental: **10/10/2026**. A arquitetura dos caminhos é sustentada pela [arquitetura do AOSP](https://source.android.com/docs/core/architecture), pelo [projeto PRoot](https://proot-me.github.io/) e pelos guias dos projetos ligados em cada tutorial. Os exemplos introdutórios não certificam nenhum modelo.
