---
title: Avalie uma matriz de suporte sem cair em falsas garantias
description: Como interpretar ports, versões, evidências e funções essenciais para um mini-PC.
sidebar_position: 2
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## “Suportado” não é uma resposta binária

Um port é a adaptação de um sistema a um hardware específico: kernel, descrição da placa, firmware, imagens de boot, configurações e integração de serviços. Um telefone pode inicializar, mas não oferecer GPU, carga confiável ou monitor externo. Para um servidor, Wi-Fi e energia podem bastar. Para um desktop, vídeo, entrada e aceleração são muito mais importantes.

Existem pelo menos quatro perguntas independentes:

1. Há um projeto destinado à variante exata?
2. Existe um procedimento de instalação atual e recuperável?
3. Os recursos necessários ao seu uso foram testados nessa versão?
4. Há manutenção e atualizações que você consegue acompanhar?

Uma lista de dispositivos conhecidos pode incluir ports incompletos. Uma imagem disponível pode ser experimental. A indicação “USB OTG funciona” não prova que hotplug de DisplayPort e carregamento simultâneo funcionem.

## Resultado esperado e pré-requisitos

Dificuldade: iniciante/intermediária. Você precisará da [ficha do aparelho](inventario.md), acesso à internet e uma lista dos recursos indispensáveis. O resultado é uma decisão documentada: instalar, investigar mais, manter Android ou procurar outro aparelho. Esta página não altera o telefone e não exige backup, mas uma decisão de instalação posterior exige [backup e recuperação](../preparacao/backup.md).

## 1. Procure no catálogo do projeto correto

| Projeto | Fonte primária | O que conferir |
|---|---|---|
| postmarketOS / Nura | [Dispositivos](https://wiki.postmarketos.org/wiki/Devices) e [instalação atual](https://nura.eco/install/) | Categoria do port, kernel, notas da variante, funções e instruções |
| Ubuntu Touch | [Catálogo UBports](https://devices.ubuntu-touch.io/) | Variante, firmware Android requerido, suporte e instalador |
| Mobian | [Dispositivos no Debian Wiki](https://wiki.debian.org/Mobian/Devices) | Nível de suporte e página de instalação específica |
| Droidian | [Catálogo](https://devices.droidian.org/) e [documentação](https://docs.droidian.org/) | Imagem específica, adaptação, Android vendor e recursos |
| Sailfish OS | [Aparelhos suportados](https://docs.sailfishos.org/Support/Supported_Devices/) | Suporte da Jolla versus comunidade, variante e licença |

Não acrescente um aparelho à sua matriz só porque o SoC é igual ao de outro. Tela, reguladores, circuitos de carga e roteamento USB variam entre placas. Tampouco trate uma GSI Android ou Droidian como imagem universal: há requisitos de vendor, kernel e adaptação.

:::info Mudança de nome confirmada
O projeto anunciou o nome **Nura em 27/09/2026**. Esta base conserva “postmarketOS” quando descreve o projeto original e os nomes de ferramentas/pacotes ainda utilizados. A [publicação oficial](https://nura.eco/blog/2026/09/27/nura-rename/) explica a transição. Em nossa consulta, algumas páginas da wiki redirecionaram e foram bloqueadas por proteção contra automação; não interpretamos conteúdo antigo do índice de busca como estado atual confirmado.
:::

## 2. Crie uma matriz por versão

Para cada função, preencha **estado, contexto e evidência**:

| Função | Exemplo de evidência adequada | Consequência se ausente |
|---|---|---|
| Boot | Release, hash da imagem, variante e método | Nenhum sistema utilizável |
| Wi-Fi/rede USB | Conexão após boot e reconexão | Necessidade de adaptador ou cabo |
| Carga | Medição de estado/corrente e teste de longa duração | Inviável operar continuamente |
| USB host/HID | Mouse e teclado produzindo eventos | Entrada externa limitada |
| Vídeo externo | Monitor/cabo/hub e teste de retirar/recolocar | Desktop depende de tela ou acesso remoto |
| GPU | Renderer, drivers, aplicação e estabilidade | Interface pode usar renderização por CPU |
| Áudio/microfone | Reprodução e captura por saída | Reuniões precisam de dispositivo externo |
| Suspensão | Retomada sem perder rede, vídeo ou entrada | Desative somente função problemática com evidência |
| Câmera | Aplicação, API e resoluções reais | Câmera USB ou outro dispositivo |

Use “desconhecido” quando não houver teste; “parcial” exige descrição do que funciona. “Funciona” sem data, versão e reprodução é uma pista, não garantia. Distinga testes realizados pelo mantenedor, relatos de terceiros e testes que você repetiu.

## 3. Leia o código e a manutenção quando a escolha for avançada

Na página do port, abra o pacote do dispositivo e do kernel. Registre o commit, a branch e a versão efetivamente fornecida. Verifique se um tutorial depende de fork pessoal ou patch ainda não integrado. Examine issues sobre o seu sintoma, a data da última alteração e se a correção foi incluída na imagem escolhida.

Um kernel downstream pode fornecer drivers Android difíceis de usar em Linux desktop. Um kernel mainline pode permitir uma pilha mais padronizada, mas ainda faltar um componente específico. “Kernel novo” não significa automaticamente “todas as funções melhores”. A [introdução ao porting](../nativo/porting.md) explica como comparar essas camadas.

Se a página mandar usar uma versão Android de base, não substitua por “a mais recente” sem confirmação. Firmware e interfaces do vendor podem ser requisitos exatos. Em aparelhos A/B, versões divergentes entre slots podem interferir na instalação e recuperação.

## 4. Defina um critério de aprovação

Para desktop diário, exija no mínimo: boot recuperável, acesso administrativo, carga previsível, vídeo utilizável e entrada confiável. Se GPU for indispensável, obtenha evidência do renderer e de uso contínuo. Para servidor, teste reinício, rede após queda do Wi-Fi, temperatura e espaço antes de acrescentar serviços.

Se algum requisito estiver desconhecido, classifique o caminho como **investigação**, não como instalação recomendada. Se estiver quebrado e não houver alternativa aceitável, escolha Linux sobre Android ou outra função para o aparelho. Esse resultado é válido: o guia não precisa forçar uma substituição do Android.

## Erros comuns, alternativas e testes finais

- **Vídeo funcionava no Android:** isso comprova hardware/cabo naquela montagem, mas não a implementação no kernel Linux.
- **O mantenedor marcou Wi-Fi como funcional:** confira banda, firmware, retomada e release; teste sua rede.
- **Um vídeo de demonstração mostrou GNOME:** pode ser uma sessão aninhada, remota ou renderizada por CPU. Pergunte como foi iniciado.
- **O port inicia só por comando no computador:** verifique se há instalação persistente. Boot temporário é teste, não resultado final.
- **Matriz antiga contradiz relato novo:** mantenha ambos com datas; não converta o relato em confirmação geral.

Não há rollback nesta avaliação. Seu teste final é selecionar um tutorial que cite o seu dispositivo e listar as limitações que você aceita. Se a documentação primária estiver indisponível, mantenha a etapa de flash suspensa até a leitura e conferência do procedimento original.

## Fontes e limites da verificação

Consulta documental em **10/10/2026**, sem validação física de todos os ports. Os catálogos acima são fontes mantidas pelos respectivos projetos. Mobian também retornou bloqueio de acesso direto em parte da consulta; informações de catálogo recuperadas pelo índice precisam ser rechecadas no navegador antes de instalar. A mudança de nome foi confirmada diretamente na publicação da Nura. Esta base não oferece uma certificação de compatibilidade.
