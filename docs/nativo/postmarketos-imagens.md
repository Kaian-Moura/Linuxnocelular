---
title: Instale postmarketOS/Nura a partir de uma imagem publicada
description: Seleção de imagem, verificação, instaladores e validação sem flash genérico arriscado.
sidebar_position: 2
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

## Visão geral e resultado esperado

Este caminho usa uma imagem já produzida pelo projeto para um dispositivo suportado. O resultado é um sistema instalado que inicializa no telefone, com a interface disponibilizada para esse port. Dificuldade: intermediária; pode aumentar se exigir firmware específico ou flash manual. O projeto passou a se chamar Nura em setembro de 2026, mas ferramentas e links ainda podem conservar postmarketOS.

A [página oficial de instalação](https://nura.eco/install/), consultada em 11/10/2026, informa release estável **v26.06** e desenvolvimento **edge**, com categorias community e testing. Isso descreve a publicação consultada, não uma promessa de que v26.06 continuará sendo a versão mais recente. Escolha a versão indicada para o aparelho e registre-a.

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

### 2.1 Navegue até o arquivo, sem adivinhar a URL

Uma **imagem** é um arquivo que representa um sistema ou partição; baixá-la não a instala. Um arquivo `.xz` normalmente é essa imagem comprimida para reduzir o download. O instalador pode precisar da imagem extraída; outros fluxos obtêm/extram os arquivos automaticamente. Confira o formato requerido na receita antes de alterar o conteúdo.

No **navegador do computador**, abra a [página oficial de instalação](https://nura.eco/install/). Procure o modelo/variante da sua ficha. Clique na release estável indicada para ele, ou edge **somente se o guia do port a exigir**. A lista de diretórios que aparece depois é um catálogo de arquivos, não uma mensagem de erro.

Como exemplo de navegação realmente publicado, **FP4 confirmado** → [v26.06/fairphone-fp4](https://images.postmarketos.org/bpo/v26.06/fairphone-fp4/) → interface → data da construção. Na revisão havia diretórios `gnome-mobile`, `phosh`, `plasma-mobile` e `sxmo-de-sway`; a lista pode mudar. São interfaces para aquele port, não garantias de aceleração ou de funcionamento num aparelho diferente. O [roteiro FP4](fairphone-4.md) acompanha a instalação desse modelo.

Escolha uma construção e mantenha **todos os artefatos e checksums da mesma data**. Baixe o rootfs e, quando a receita exigir, a imagem de boot correspondente, além do manifesto/checksum/assinatura oferecidos. Não misture boot edge com rootfs stable nem use uma imagem de telefone vizinho. Salve URL, data, interface, nomes e algoritmo de hash.

No navegador, espere acabar cada download; `.part` e `.crdownload` indicam download incompleto. No gerenciador de arquivos do computador, crie uma pasta por construção, por exemplo `smartphone-linux/imagens-nura`, e mova para ela os arquivos baixados. Não mova firmware original para a mesma pasta: isso reduz a chance de selecionar o arquivo errado.

### 2.2 Instale somente os utilitários de inspeção no computador

Se o computador usa Ubuntu/Debian:

```bash
sudo apt update
sudo apt install file xz-utils unzip
```

Se usa Fedora, em vez do bloco anterior:

```bash
sudo dnf install file xz unzip
```

Esses comandos instalam ferramentas **no computador**. `sudo` pede a senha dele; `xz` não é um instalador para o telefone. Abra o terminal na pasta em que guardou os downloads; no Linux, muitos gerenciadores têm “Abrir no terminal”. Confirme com `pwd` e `ls -lh`: o primeiro mostra a pasta atual, o segundo os nomes/tamanhos dos arquivos.

**Local: computador Linux; `ARQUIVO.img.xz` é um marcador a substituir pelo nome real publicado, incluindo letras maiúsculas/minúsculas.** Não digite o marcador literalmente se seu arquivo tem outro nome. Para facilitar, digite as primeiras letras e pressione Tab para completar quando houver uma correspondência.

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

Isso só se aplica a um manifesto no formato esperado e com os arquivos na pasta correta. Um arquivo chamado `SHA512SUMS` exige `sha512sum -c SHA512SUMS`; **não troque o algoritmo mantendo o valor esperado**. Se o arquivo de checksum contiver apenas um hash, abra-o com `cat` e compare ao cálculo, em vez de usar `-c`. Nunca aceite um erro de integridade por supor que foi “apenas diferença de nome”.

**Resultado esperado:** cada arquivo requerido está completo, o formato corresponde ao publicado e os hashes conferem. `xz --test` retorna ao prompt sem mensagem quando passa; isso verifica compressão, não suporte do telefone. Se aparecer HTML em `file`, você pode ter salvo a página ou um bloqueio de acesso, não a imagem.

### 2.3 Extraia preservando o download original

Faça a extração **somente se a receita usar a imagem descomprimida**. Para `.img.xz` verificado, no computador:

```bash
xz --decompress --keep ARQUIVO.img.xz
ls -lh ARQUIVO.img.xz ARQUIVO.img
file ARQUIVO.img
```

`--keep` preserva o arquivo comprimido; o arquivo novo pode ocupar muito mais espaço. A saída pode identificar imagem de filesystem ou disco, conforme o artefato. Isso não autoriza escrever no disco do computador. Se já existir o arquivo extraído, `xz` pode recusar sobrescrever; compare a origem e escolha uma pasta nova, sem `--force` automático.

Se o download for **arquivo de coleção `.tar.xz`**, e não uma imagem `.img.xz`, liste antes de extrair:

```bash
tar -tf ARQUIVO.tar.xz
mkdir artefatos-extraidos
tar -xJf ARQUIVO.tar.xz -C artefatos-extraidos
ls -lh artefatos-extraidos
```

`tar -tf` mostra os arquivos; `-xJf` extrai uma coleção comprimida com xz na pasta nova. Não rode `tar` com `sudo` para extrair na sua pasta pessoal. Um ZIP deve ser inspecionado com `unzip -l` e extraído numa pasta nova; não renomeie ZIP para xz. Windows/macOS podem usar uma ferramenta de arquivos que suporte o formato, mas os passos de flash e utilitários necessários seguem o port.

Não extraia `.img` tentando encontrar um aplicativo `.exe`: o sistema é instalado por um método próprio, não aberto como programa de Windows.

## 3. Use o método oferecido para aquela variante

Se a página disponibilizar **instalador gráfico ou web**, confira sua origem, selecione o modelo e revise o resumo. Instale com cabo direto, sem hub, salvo exigência contrária explícita. Um instalador pode mudar o telefone de modo diversas vezes; deixe o computador reconhecer cada interface. Anote o log e evite interromper alimentação durante gravação.

Um exemplo concreto é a receita **Fairphone 4** do UBports Installer. Primeiro instale o aplicativo no computador seguindo [download, checksum e execução](ubuntu-touch.md#2-obtenha-e-execute-o-ubports-installer). Depois confirme FP4, requisitos de base/bootloader e selecione postmarketOS quando o instalador realmente oferecer a opção; escolha release/interface, revise a limpeza e siga suas telas. O instalador obtém os artefatos de sua receita: não lhe entregue manualmente uma imagem de outra construção. A [página FP4](fairphone-4.md) separa esse fluxo do flash próprio do port. **Este exemplo não cria suporte de instalador para todo aparelho da lista de imagens.**

Antes de uma instalação manual, tenha o [roteiro ADB/Fastboot](../preparacao/adb-fastboot.md) concluído. O [roteiro de desbloqueio](../preparacao/desbloquear-bootloader.md) explica a etapa separada que pode apagar dados. Se o guia exige Fastboot, a tela do telefone deve indicar o modo e `fastboot devices` precisa mostrar seu aparelho; estar na tela inicial Android não equivale a Fastboot. Não conclua que a imagem está errada quando a ferramenta simplesmente não encontra o modo.

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

- [ ] Código/variante, release, interface, data e arquivo confirmados na publicação.
- [ ] Downloads completos; checksum pelo algoritmo correto; extração quando requerida.
- [ ] Boot/rootfs da mesma construção, sem arquivos de outro modelo na pasta.
- [ ] Backup, acesso inicial e restauração preparados antes de gravação.
- [ ] Primeiro boot real e funções indispensáveis testadas, incluindo reboot.

## Fontes e limites da verificação

Documental, **11/10/2026**; catálogo e exemplo de diretórios FP4 lidos diretamente, sem gravação física. A falta de acesso automatizado a certas páginas da wiki foi mantida explícita; não a preenchemos com destinos de flash imaginados.

- [Nura: imagens e instalação](https://nura.eco/install/), lida diretamente.
- [Anúncio de mudança de nome](https://nura.eco/blog/2026/09/27/nura-rename/).
- [Wiki: instalação](https://wiki.postmarketos.org/wiki/Installation), acesso automatizado limitado; confirmar manualmente.
- [pmbootstrap: ferramenta de geração e flash](https://docs.postmarketos.org/pmbootstrap/).
- [Receita pública FP4 do instalador](https://github.com/ubports/installer-configs/blob/master/v2/devices/FP4.yml), usada somente no exemplo restrito ao modelo.
