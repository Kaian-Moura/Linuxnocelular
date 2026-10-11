---
title: Instale postmarketOS/Nura a partir de uma imagem publicada
description: Seleção de imagem, verificação, instaladores e validação sem flash genérico arriscado.
sidebar_position: 2
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Visão geral e resultado esperado

Este caminho usa uma imagem já produzida pelo projeto para um dispositivo suportado. O resultado é um sistema instalado que inicializa no telefone, com a interface disponibilizada para esse port. Dificuldade: intermediária; pode aumentar se exigir firmware específico ou flash manual. O projeto passou a se chamar Nura em setembro de 2026, mas ferramentas e links ainda podem conservar postmarketOS.

A [página oficial de instalação](https://nura.eco/install/), consultada em 10/10/2026, informa release estável **v26.06** e desenvolvimento **edge**, com categorias community e testing. Isso descreve a publicação consultada, não uma promessa de que v26.06 continuará sendo a versão mais recente. Escolha a versão indicada para o aparelho e registre-a.

## Compatibilidade, requisitos e materiais

- Modelo/variante identificados e presentes na documentação do port.
- Bootloader/recovery no estado requerido pelo método.
- Firmware Android de base exatamente como o mantenedor exige.
- Computador, cabo direto de dados, ferramentas e espaço para imagem e backup.
- Entrada/tela ou acesso administrativo preparado, especialmente em aparelho danificado.
- Plano de [restauração](../recuperacao/restaurar-android.md) e [backup externo](../preparacao/backup.md).

Uma entrada no catálogo geral não significa que haja imagem pronta. Uma entrada da tabela de imagens não garante GPU, modem, câmera ou DisplayPort. Se o seu aparelho não estiver na tabela, procure sua página; talvez precise de [pmbootstrap](postmarketos-pmbootstrap.md) ou só tenha um port inicial.

## Backup e riscos

A instalação pode substituir Android e apagar dados. Imagens de boot e rootfs são artefatos distintos; algumas placas usam outro bootloader ou cartão externo. Não escreva uma imagem de disco inteiro numa partição Android como se fosse um rootfs. Não substitua `userdata` por `super` por causa do tamanho disponível.

Se o aparelho possui tela quebrada, configure uma rota de acesso que estará disponível **no primeiro boot**. Uma senha padrão sem possibilidade de troca e SSH exposto não é uma configuração pronta para uso. Criptografia requer um método funcional de desbloqueio inicial.

## 1. Abra a página correta e faça um contrato de instalação

Na página de instalação e na página do dispositivo, preencha:

| Item | O que deve estar confirmado |
|---|---|
| Variante | Código do aparelho e codinome |
| Versão | Release/edge e data do artefato |
| Interface | GNOME, Phosh, Plasma Mobile, Sxmo ou outra realmente oferecida |
| Formato | Arquivo comprimido, boot image, rootfs, imagem de disco ou pacote de instalador |
| Método | Instalador gráfico/web, Fastboot, recovery, mídia removível ou outro |
| Destino | Partições/slots ou mídia, conforme fonte específica |
| Recuperação | Imagem original e procedimento de retorno |

**Lacuna desta publicação:** a wiki redirecionou para `wiki.nura.eco` e bloqueou nossa consulta automatizada em algumas páginas. O catálogo de imagens foi lido diretamente; não obtivemos uma autorização documental para publicar uma sequência única de flash. Abra a página no seu navegador e confirme sua instrução vigente. Se ela não estiver acessível, pare antes da gravação.

## 2. Baixe o artefato da publicação original

Use o link do modelo na página oficial, confira o nome e a arquitetura, e salve os arquivos de checksum/assinatura quando oferecidos. Não use a imagem de um telefone vizinho ou renomeie um arquivo para “servir”. Registre URL, data, nome do arquivo e hash local.

**Local: computador Linux; `ARQUIVO.img.xz` é um marcador a substituir pelo nome real publicado.**

```bash
file ARQUIVO.img.xz
sha256sum ARQUIVO.img.xz
xz --test ARQUIVO.img.xz
```

`file` ajuda a identificar o formato; `sha256sum` calcula o hash; `xz --test` verifica a integridade da compressão sem extrair. Use o último somente para arquivo xz. Esses comandos não provam autenticidade: compare o hash com o valor de uma fonte confiável ou verifique a assinatura pelo método do projeto. Se a publicação não oferece hash/assinatura, registre isso e não invente um checksum esperado.

Para um manifesto SHA256 obtido da mesma publicação, confira seu conteúdo e nome de algoritmo antes de usar:

```bash
sha256sum -c SHA256SUMS
```

Isso só se aplica a um manifesto no formato esperado e com os arquivos na pasta correta. Um arquivo chamado `SHA512SUMS` exige ferramenta correspondente. Nunca aceite um erro de integridade por supor que foi “apenas diferença de nome”.

## 3. Use o método oferecido para aquela variante

Se a página disponibilizar **instalador gráfico ou web**, confira sua origem, selecione o modelo e revise o resumo. Instale com cabo direto, sem hub, salvo exigência contrária explícita. Um instalador pode mudar o telefone de modo diversas vezes; deixe o computador reconhecer cada interface. Anote o log e evite interromper alimentação durante gravação.

Se o método for manual, escreva um pequeno plano com **arquivo → partição/slot → motivo → forma de recuperação** e compare com a fonte do modelo antes de executar. O flash deve ser exatamente o procedimento desse port. Esta página não converte um comando como `flash_rootfs` em permissão para sobrescrever uma partição escolhida por tamanho.

Se o método for cartão ou armazenamento USB, identifique a mídia por fabricante, tamanho e conexão física. Uma gravação de imagem apaga o conteúdo da mídia. Confirme que o destino não é o disco do computador; não há um `/dev/sdX` seguro e universal. Dispositivos com boot externo suportado podem permitir teste antes da substituição do armazenamento interno; essa capacidade também é específica.

## 4. Primeiro boot e verificação

Espere o tempo descrito pelo port para expansão inicial. Confirme a interface e obtenha acesso administrativo. As credenciais dependem da imagem; a página de releases consultada publica padrões, mas você deve conferir sua release e **trocar a senha imediatamente**:

```bash
passwd
cat /etc/os-release
uname -a
df -h
```

Execute no telefone, não no computador. `passwd` muda sua senha e pede confirmação; não coloque senhas em scripts públicos. `df` deve mostrar o rootfs esperado; não há obrigação de ele utilizar todo o armazenamento automaticamente.

Não acrescente todos os repositórios Alpine, edge e de terceiros para “completar” o sistema. Mantenha a branch da imagem e o pacote do dispositivo. Misturar releases pode quebrar kernel, bibliotecas e configurações de hardware.

## Erros comuns e alternativas

| Sintoma | Verificação e caminho seguinte |
|---|---|
| Modelo não aparece no instalador | Confira variante e método da página; não force outro modelo |
| Dispositivo some durante instalação | Confira modo USB, cabo e repasse de VM; preserve log |
| Fica no logo | Verifique tempo de primeiro boot, kernel/rootfs/slot e modo; [triagem](../recuperacao/triagem.md) |
| Inicializa, sem tela | Procure SSH/rede USB documentada; ausência de imagem não prova sistema parado |
| Pouco espaço | Consulte mapa e procedimento de expansão do port; não formate outra partição |
| Imagem pronta não atende | Gere com pmbootstrap apenas se o port oferecer os componentes necessários |

## Recuperação/rollback

Se foi um teste externo suportado, volte ao meio de boot original pelo procedimento da placa. Se partições internas foram substituídas, restaure pelo plano do modelo. Instalar novamente não recupera dados apagados; o backup deve estar fora do telefone. Não religue a trava enquanto houver imagens não aceitas pelo fabricante.

## Testes finais e próximos passos

Teste reinício sem computador, acesso administrativo, rede, carga, tela ou monitor, entrada e armazenamento. Depois acrescente aplicações. Registre exatamente a imagem e as limitações: funcionalidade parcial não é falha de sua execução se já era uma limitação do port.

## Fontes e limites da verificação

Documental, **10/10/2026**; nenhuma gravação genérica foi validada em todos os modelos.

- [Nura: imagens e instalação](https://nura.eco/install/), lida diretamente.
- [Anúncio de mudança de nome](https://nura.eco/blog/2026/09/27/nura-rename/).
- [Wiki: instalação](https://wiki.postmarketos.org/wiki/Installation), acesso automatizado limitado; confirmar manualmente.
- [pmbootstrap: ferramenta de geração e flash](https://docs.postmarketos.org/pmbootstrap/).
