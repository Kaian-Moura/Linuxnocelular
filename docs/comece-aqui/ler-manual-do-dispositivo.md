---
title: 'Aprenda a encontrar e conferir uma receita para seu modelo'
description: Da identificação do aparelho à fonte original, versão, requisitos e evidências, sem copiar procedimentos de um telefone parecido.
sidebar_position: 10
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Um tutorial pode estar correto e ainda assim não servir para seu telefone. Modelo, variante regional, versão de firmware, arquitetura, método e estado atual mudam as condições. Esta aula ensina a ler uma receita antes de segui-la, com uma **ficha de pesquisa verificável**.

**Dificuldade:** iniciante para pesquisa; uma lacuna de kernel/recuperação pode exigir trabalho avançado. **Materiais:** navegador, informações do aparelho e um arquivo de anotações. **Resultado:** saber qual fonte se aplica, o que ela comprovou e o que continua desconhecido. Não é necessário desbloquear, obter root ou entrar em modo de emergência para aprender a conferir documentação.

## 1. Identifique antes de procurar

No Android acessível, abra **Configurações → Sobre o telefone**, conforme fabricante, e anote nome comercial, código de modelo e versão/build. Uma caixa ou etiqueta pode ajudar, mas precisa corresponder ao aparelho. Se consegue usar ADB autorizado, o [inventário](../compatibilidade/inventario.md) ensina consultas; não faça uma nova instalação apenas para identificar.

Crie um arquivo chamado `pesquisa-do-aparelho.txt` e separe **valor observado** de **hipótese**. Não registre IMEI/serial num documento que será público. Num Linux já instalado, registre também origem da imagem, release, kernel e alterações conhecidas. Arquitetura ARM64 descreve execução de instruções, não formato de boot compatível.

Se a tela está quebrada, use os meios já autorizados. Nome visto no computador ou uma propriedade incompleta pode não confirmar variante. Leia [tela quebrada](../preparacao/tela-quebrada.md); quando não dá para identificar ou confirmar telas obrigatórias, registre a lacuna. A pesquisa ainda pode continuar sem gravar nada.

## 2. Comece no projeto ou fabricante

Para Linux nativo, procure o catálogo oficial do projeto e a página do aparelho. Para Android com Termux, procure o repositório/documentação do aplicativo. Para recuperação, comece no suporte do fabricante. A [lista de downloads oficiais](downloads.md) reúne entradas, sem garantir um pacote para todo modelo.

Como exemplo de **consulta, não instalação**, o catálogo [UBports](https://devices.ubuntu-touch.io/) lista aparelhos e páginas correspondentes. Abra a página de um modelo encontrado, confira identificador, variante, estado e instalação. Não selecione outro com nome parecido se seu código não aparece. As orientações de [Ubuntu Touch](../nativo/ubuntu-touch.md) explicam esse caminho e suas limitações.

No postmarketOS/Nura, use a página de dispositivos e o port correspondente pelas fontes do [guia nativo](../nativo/postmarketos-imagens.md). Confira o nome atual do projeto e URLs históricas sem renomear ferramentas por suposição. Uma tabela pode indicar boot funcional enquanto vídeo ou suspensão não funcionam; leia cada função necessária.

Buscadores, fóruns e vídeos ajudam a localizar experiências, mas volte à fonte do comando/imagem e compare versões. Um arquivo reempacotado em um link de comentário não herda a confiança do fabricante. Se a fonte oficial não fornece uma imagem, essa ausência é uma lacuna, não permissão para usar a de outro modelo.

## 3. Confira o contexto da página

Anote:

| Campo | Pergunta |
|---|---|
| Modelo/variante | O identificador exato aparece? Há exceções regionais? |
| Data e versão | É documentação da release instalada, uma branch atual ou instrução antiga? |
| Estado inicial | Exige firmware específico, Android stock, bootloader já aberto, root ou layout original? |
| Ferramenta/host | Linux, Windows ou macOS? Qual arquitetura e versão da CLI? |
| Artefato | Quem publica, nome, versão, hash/assinatura e licença? |
| Destino | App, filesystem, partição, slot, dispositivo ou imagem de sistema? |
| Resultado | O que realmente foi observado e quais funções ficaram pendentes? |
| Retorno | Existe restauração documentada nas condições em que você ficará? |

Tags/releases e commits ajudam a reproduzir código. A branch `master/main` pode mudar entre duas leituras; registre a revisão quando o procedimento depender dela. Um manual atual também pode descrever opções ausentes na ferramenta empacotada. Consulte versão e `--help` antes de adaptar uma chamada; veja [leitura de erros](../diagnostico/erros-para-iniciantes.md).

## 4. Leia as etapas sem executá-las ainda

Divida a receita em download, preparação, comunicação, backup, mudança e validação. Para cada comando, responda **onde roda e o que modifica**. `adb devices` consulta conexão; desbloquear bootloader pode limpar dados; instalação de pacote muda o ambiente do gerenciador; iniciar um desktop não altera o kernel.

Marque placeholders: `MODELO`, `SERIAL`, `IP`, nomes de imagem e caminhos não são valores universais. Não substitua partição/slot por algo “parecido” para preencher um tutorial. Saída ilustrativa é um exemplo de leitura, não instrução para colar.

Quando a receita contém um comando destrutivo, precisa haver as condições exatas antes dele. Sem variante, firmware, imagem, alvo, modo e recuperação aplicáveis, não há um procedimento seguro a reproduzir. Você pode continuar preparando ferramentas e estudando sem atravessar essa etapa.

## 5. Compare relatos tecnicamente

Considere o exemplo fictício: “Pessoa A usou o mesmo Snapdragon e HDMI funcionou”. Isso não estabelece que seu aparelho tenha a mesma placa, controlador de energia, mux USB-C, firmware ou drivers. A evidência útil seria modelo/variante, kernel e patches, hub/cabo/carregador, modo de vídeo e cenário observado.

Outro exemplo: “Instalei Magisk e `id` mostra root”. Pergunte onde `id` rodou, qual método integrou a imagem de boot e qual privilégio foi verificado. O UID apresentado em PRoot não equivale a root Android; root não comprova desbloqueio. Leia [Magisk](../preparacao/root-magisk.md) antes de aceitar esse relato como pré-requisito resolvido.

Para comparar uma issue, confira a camada e a mensagem. Teclado listado em USB mas sem input é diferente de nenhum dispositivo enumerado. Monitor com teste de barras é diferente de compositor sem imagem. Buscar o mesmo nome de SoC é só o início; compare a cadeia descrita no [método de diagnóstico](../diagnostico/metodo.md).

## 6. Conclua com uma decisão e lacunas explícitas

Salve URL, data da consulta, modelo, release, requisitos confirmados, dependências e pendências. Você pode usar o [plano de recuperação](../preparacao/plano-recuperacao.md) e a [ficha de bancada](../diagnostico/ficha-evidencias.mdx). A ficha registra seu relato; não preenche suporte automaticamente.

Se há conflito entre fontes, preserve ambos com contexto e procure esclarecimento do mantenedor. Uma resposta sem variante/versão não resolve o conflito. Para pedir ajuda, escreva um problema delimitado, sem segredos: qual guia, qual etapa, ambiente e mensagem, último checkpoint e o que mudou. Não publique um dump completo por hábito.

Sua conclusão pode ser: caminho documentado a avaliar, método Android viável, investigação pendente ou recurso dispensável ao projeto. “Ainda não sei” é uma resposta válida. O [assistente de decisão](../escolha/index.mdx) utiliza essas informações sem inventar compatibilidade.

## Fontes e escopo

Método de leitura e exemplos originais, revisão documental em **11/10/2026**. Fontes de referência: [catálogo UBports](https://devices.ubuntu-touch.io/), [arquitetura de boot do AOSP](https://source.android.com/docs/core/architecture/bootloader), [Termux](https://github.com/termux/termux-app) e [política de evidências desta comunidade](../comunidade/fontes.md). Nenhum modelo adicional foi certificado nem uma operação de flash foi executada por esta aula.
