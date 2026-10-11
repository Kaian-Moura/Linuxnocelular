---
title: Critérios e limites das recomendações
description: Conheça as regras auditáveis, as incertezas e as condições de segurança do assistente de caminhos.
sidebar_position: 2
last_verified: '2026-10-10'
---

## O que o assistente faz

Ele transforma respostas explícitas em uma recomendação **condicional**, usando uma função local auditável em `src/lib/recommend.mjs`. Não consulta IMEI, não testa drivers, não mede bateria e não reconhece modelo pelo nome. Todas as opções podem ser “Ainda não sei”; isso leva a verificações, não a compatibilidade inventada.

As recomendações são entradas para tutoriais. Nenhuma oferece um comando de desbloqueio, grava uma imagem ou promete que determinada versão funciona. Mesmo “Avalie uma instalação Linux nativa documentada” significa revisar o port e suas condições antes de executar qualquer etapa de risco.

## Regras principais

| Respostas confirmadas | Resultado |
|---|---|
| Sem Android acessível, ADB autorizado, SSH Linux ou modo de manutenção validado | Recuperar primeiro um meio de controle |
| Manter/avaliar Android e aplicativos acessíveis | Termux para terminal/servidor; PRoot para ambiente de distribuição/desktop |
| Mesmo cenário com root validado | Chroot aparece como alternativa avançada, sem ser obrigatório |
| Objetivo containers | Avaliar requisitos específicos de kernel/runtime, sem indicar PRoot como implementação de Docker |
| Linux nativo já acessível por SSH e sem desejo de reinstalação | Configuração do sistema existente; não preparar flash desnecessário |
| Substituir Android, mas falta qualquer requisito nativo | Inventário/compatibilidade; alternativas Android se ele estiver acessível |
| Substituir Android, identidade/arquitetura e canal de controle confirmados, port e kernel documentados, desbloqueio permitido, funções necessárias validadas, backup e recuperação preparados | Avaliar o guia nativo |
| Android inacessível e sem caminho nativo comprovado | Recuperar controle antes de preparar novos ambientes |

Requisitos nativos são **conjuntivos**: todos precisam ser confirmados. Modelo, processador, root ou quantidade de RAM isolados nunca bastam. A arquitetura de 32 bits não é descartada automaticamente; sua disponibilidade de software é uma verificação independente. Não restringimos o conceito de Linux nativo a ARM64.

## Avisos adicionais

Sem evidência de vídeo externo, o assistente indica tela local ou acesso remoto. Touch indisponível exige outro meio de entrada. ADB não autorizado exige confirmar a autorização no dispositivo antes de confiar nele. Containers exigem verificar kernel; IA exige avaliar memória, desempenho e backends. Esses avisos não são tentativas de detectar automaticamente a condição real.

O objetivo “manter Android” nunca produz substituição nativa como recomendação principal. Escolher “ainda estou avaliando” permite apresentar o caminho nativo apenas como alternativa quando todos os requisitos foram declarados. O usuário pode consultar todos os guias independentemente das respostas.

## Evidência a guardar antes de responder “sim”

- **Port:** URL primária, codename/modelo, release e data; liste divergências de variante.
- **Kernel:** pacote/repositório/commit, configuração e firmware base exigidos.
- **Funções necessárias:** tabela do projeto e testes disponíveis para seu uso; não marque câmera se só boot foi validado.
- **Desbloqueio:** procedimento do fabricante/port para a variante e condições como operadora/região.
- **Recuperação:** arquivos de procedência verificável, ferramenta, requisitos de acesso e caminho documentado para restaurar.
- **Backup:** cópia externa e confirmação de leitura/restauração de arquivos importantes.

O formulário não pede upload desses arquivos: manter essa documentação é responsabilidade do projeto pessoal. O nome do aparelho digitado aparece no resumo, escapado por React; não é usado para buscar ou executar instruções. Ele é opcional para explorar os caminhos Android, mas precisa estar preenchido para uma avaliação nativa, como requisito mínimo de identidade. O texto não é validado contra um cadastro: escrevê-lo não comprova que a identificação está correta.

## Como contribuir sem enfraquecer a segurança

Uma mudança na lógica precisa incluir testes dos cenários afetados e preservar invariantes: sem port não recomendar flash; root não equivaler a desbloqueio; desconhecido não equivaler a sim; manter Android não recomendar sua substituição. Atualizar uma lista de modelos exige fontes e datas, separadas da lógica genérica.

Os testes de decisão e os testes no navegador do repositório verificam esses cenários, navegação e resultados acessíveis por teclado. Eles validam o software do site, **não o hardware dos leitores**. Uma combinação declarada incorretamente ainda pode gerar recomendação inadequada: esse é um limite de um formulário baseado em respostas.

## Privacidade e funcionamento offline

As respostas ficam na memória da aba; “Limpar respostas” apaga o estado atual. Não há banco, login, coleta própria ou API de IA. A busca usa índice gerado junto ao site; após carregar seus arquivos, não depende de uma pesquisa em serviço externo. Links para fontes externas naturalmente abrem outros serviços com suas próprias políticas.

Revisão das regras: **10/10/2026**. Fontes técnicas estão nos tutoriais ligados pela [página de escolha](index.mdx). O arquivo de regras e os testes são a referência de implementação; o texto descreve os motivos e limites dessas regras.
