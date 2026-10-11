---
title: Como contribuir
description: Registre novos dispositivos, revise procedimentos, compartilhe evidências e mantenha a base técnica reproduzível.
sidebar_position: 1
last_verified: '2026-10-10'
---

## Uma contribuição começa por uma evidência

Você pode melhorar uma explicação para iniciantes, corrigir um link, registrar uma regressão ou documentar um aparelho novo. Não precisa portar um kernel para ajudar. O valor está em dizer exatamente **qual versão, combinação e teste** sustentam a afirmação.

Um relato como “USB funciona” é amplo demais. Prefira: “na variante X, release Y, kernel Z e hub H, teclado e mouse enumeram; HDMI volta após reconectar três vezes; inserir PD durante uso derruba os dispositivos”. O segundo relato deixa limitações visíveis e permite comparar resultados.

## Estrutura e responsabilidade

`docs/` contém a documentação em Markdown/MDX; `src/components/` guarda interfaces; `src/lib/recommend.mjs` contém regras do assistente; `templates/` fornece modelos reutilizáveis. `scripts/` e `tests/` verificam conteúdo, links e comportamento. Os guias se organizam por caminho, com diagnóstico compartilhado para evitar receitas divergentes.

Copie um modelo de `templates/` para iniciar uma página fora de `docs/` durante a pesquisa. Preencha os campos reais e mova para a categoria adequada quando existir conteúdo publicável. Um formulário vazio não deve entrar na navegação. Consulte [registrar um dispositivo](../dispositivos/registrar-dispositivo.md).

## Padrão de tutorial

Cada tutorial precisa apresentar resultado, dificuldade, compatibilidade, materiais, preparação, backup/riscos, passos, comandos explicados, critérios intermediários, falhas e alternativas, rollback, testes finais e fontes. Use `last_verified` no frontmatter e diga se houve revisão documental ou teste em hardware.

Explique o ambiente de execução: notebook, Termux, distribuição convidada ou Linux nativo. Indique privilégios. Um comando que modifica boot precisa de condições específicas, fonte correspondente e recuperação. Não substitua uma lacuna por um comando de outro dispositivo.

Em comandos, prefira nomes explícitos como `IP_DO_TELEFONE`, com instrução de substituição. Não use credenciais reais, tokens, serial, SSID privado ou IP público pessoal. Não publique blobs de firmware nem imagens de sistema sem verificar direito de redistribuição. Uma fonte pode exigir que cada leitor obtenha seu próprio arquivo.

## Status das informações

| Estado | Critério mínimo |
|---|---|
| Suportado pelo projeto | Fonte do projeto confirma modelo/versão e procedimento; funções têm escopo definido |
| Comunitário | Mantenedor/repositório identificados, revisão e limitações registradas |
| Experimental | Teste limitado ou integração instável; não recomendar como recurso garantido |
| Condicionado / não testado | Possibilidade depende de requisitos ainda não demonstrados; sem receita de flash |
| Não recomendado | Risco/obsolescência/ausência de suporte torna inadequado o uso proposto; explicar motivo |

Esses rótulos pertencem a um procedimento ou recurso, não necessariamente ao aparelho inteiro. Um port pode ter Wi-Fi suportado e câmera experimental. Registre negativos e incertezas tão claramente quanto sucessos.

## Revisão antes de enviar

1. Confira fontes primárias e data; guarde commit/tag quando relevante.
2. Faça revisão didática: termos novos explicados ou ligados ao glossário.
3. Leia comandos como código, conferindo aspas, placeholders e efeitos.
4. Remova dados pessoais e respeite licenças de material externo.
5. Execute `npm ci` e `npm run verify`; para interfaces, `npm run test:browser`.
6. Abra a página no navegador e teste links, sumário, busca e layout móvel.
7. Descreva o que foi testado e o que não foi no pull request.

Não afirme “validado” porque o build passou: isso valida o site, não a instalação num celular. Se não possui o hardware, uma revisão documental bem delimitada é uma contribuição legítima.

## Como relatar um problema

Identifique página ou recurso, comportamento esperado, resultado observado e sequência mínima. Para hardware, inclua variante, distribuição, kernel, firmware base, hub/cabos/alimentação e logs necessários. Remova segredos. Informe se o problema acontece após boot, suspensão, reconexão, troca de PD ou atualização.

Se encontrar um procedimento perigoso, não execute para confirmar. Registre a condição que falta, proponha bloquear a etapa e aponte a fonte. Uma vulnerabilidade ou exposição de credenciais deve seguir o arquivo `SECURITY.md` do repositório, evitando publicar dados sensíveis em issue aberta.

## Licenças e colaboração

O código original usa MIT; o texto e os materiais didáticos originais usam CC BY-SA 4.0. Contribuições devem respeitar essa separação e identificar material externo com origem/licença. Referenciar uma documentação não significa copiar seu conteúdo ou relicenciá-lo. Mantenha discussões respeitosas e centradas em evidências; pessoas iniciantes devem poder perguntar sem hostilidade.

Revisão editorial: **10/10/2026**. O padrão de contribuição é específico deste repositório. Para publicação e automação, veja [publicar o site](publicacao.md); para critérios de fontes, veja [referências e confiabilidade](fontes.md). [Licença CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
