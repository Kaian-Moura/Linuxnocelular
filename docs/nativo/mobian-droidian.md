---
title: Mobian, Droidian e outras alternativas móveis
description: Escolha entre Linux mainline e adaptações Android sem presumir compatibilidade de imagens ARM64.
sidebar_position: 5
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Dois projetos, requisitos diferentes

**Mobian** integra Debian ao hardware móvel, com foco em dispositivos que conseguem usar kernel próximo de mainline. **Droidian** utiliza uma adaptação baseada em Halium e componentes Android para disponibilizar um ambiente GNU/Linux em aparelhos compatíveis. Compartilhar parte do ecossistema Debian não torna imagens e kernels intercambiáveis.

Resultado esperado: escolher uma opção com suporte demonstrável e instalar pela receita específica, preservando a capacidade de recuperação. Dificuldade: intermediária em modelo mantido; avançada em adaptação. Se não existe port, o resultado desta página é uma investigação de viabilidade, não um flash tentativo.

## Compatibilidade, materiais e preparação

Use os catálogos [Mobian](https://wiki.debian.org/Mobian/Devices) e [Droidian](https://devices.droidian.org/). Confirme variante, nível de suporte, imagem, firmware e instruções. O catálogo Mobian consultado distingue níveis de suporte e aparelhos Android como OnePlus 6/6T e Pixel 3a; **isso não estende suporte ao OnePlus 9 Pro ou a qualquer outro Snapdragon**.

Você precisa de computador, ferramentas do método, cabo de dados, espaço, backup e plano de restauração. Prepare uma ficha do estado original. Em A/B, confira a base nos slots conforme o projeto; não altere slot apenas porque um tutorial de outro aparelho usa `a`.

## Backup e riscos

Os métodos nativos podem apagar Android e `userdata`. Imagens Droidian específicas podem suportar criptografia e ocupar o armazenamento disponível, mas a capacidade depende da imagem escolhida. Um ZIP genérico de rootfs não fornece automaticamente o kernel da sua placa.

Preserve as partições e o firmware que o port precisa acessar. Remover “restos do Android” pode eliminar exatamente as bibliotecas/firmwares necessários. Não force a instalação de kernel genérico Debian ARM64 se o port usa um kernel ou initramfs específicos.

## Caminho A: Mobian em dispositivo listado

### 1. Abra a instalação da variante

Parta de [Mobian/Devices](https://wiki.debian.org/Mobian/Devices), depois da página do aparelho. O guia [OnePlus 6 e 6T](https://wiki.debian.org/InstallingDebianOn/OnePlus/OnePlus6), por exemplo, diferencia boot images pelos device trees e registra imagens semanais testadas. Uma imagem de rootfs compartilhada por uma família não permite compartilhar cegamente a boot image.

Se houver instruções diferentes para SD, eMMC e Android/UFS, siga somente a do seu hardware. Uma receita PinePhone não é uma receita para smartphone Android.

### 2. Baixe e verifique

Use o link de imagem da página do modelo. Selecione versão/release recomendada e leia a [verificação de assinatura](https://wiki.debian.org/Mobian/FAQ). Confira formato e hash no computador:

```bash
file ARQUIVO.tar.xz
xz --test ARQUIVO.tar.xz
sha256sum ARQUIVO.tar.xz
tar -tf ARQUIVO.tar.xz
```

`ARQUIVO.tar.xz` é o nome real obtido da publicação, não um download oferecido aqui. `tar -tf` lista conteúdo sem gravar no telefone. Esses comandos verificam aspectos de integridade e formato; assinatura/autenticidade seguem o método Mobian. Não execute scripts de um arquivo não verificado.

### 3. Instale pela receita, depois verifique no telefone

Execute a sequência específica de mídia/bootloader/partições da página do dispositivo. Não extrapole comandos que apagam `dtbo` ou `userdata` para outro modelo. Antes da execução, registre arquivos, slots, destinos e forma de retorno.

Depois do boot:

```bash
cat /etc/os-release
uname -a
df -h
passwd
```

Confira versão e troque imediatamente a senha publicada pela imagem. Se houver expansão automática no primeiro boot, espere o tempo previsto antes de desligar. Use os repositórios correspondentes à release instalada; não mude stable/testing/unstable para resolver um driver sem entender as consequências.

## Caminho B: Droidian com adaptação correta

### 1. Escolha imagem específica ou estágio de porting

O [repositório canônico de imagens Droidian](https://github.com/droidian-images/droidian) distingue imagens graváveis por Fastboot de ZIPs graváveis por recovery. O primeiro é recomendado quando existe para o dispositivo. ZIPs genéricos servem também a fases de adaptação e dependem de kernel/configuração apropriados.

Confira a API do **vendor Android**, a arquitetura e o pacote de adaptação. O repositório descreve variantes API28/29/30/32/33 conforme base Android; isso não autoriza instalar um ZIP por adivinhar a versão exibida no aparelho. Firmware vendor e Android da interface podem ter históricos diferentes após ROMs customizadas.

### 2. Prepare a instalação

Se o [Droidian Installer](https://github.com/droidian-releng/droidian-installer) oferecer uma configuração atual para seu modelo, use o fluxo documentado, confira opções e preserve logs. Não acrescente uma configuração local de outro aparelho. Se usar um arquivo específico com script de gravação, **leia o script antes**, verifique arquivo/assinatura e compare todas as partições com a página do port.

O repositório exige atenção à mesma versão Android nos slots A/B. Isso é uma condição desse método, não um motivo para copiar partições brutas entre slots sem guia. Em método recovery, confirme que o recovery aceita a base e o formato. Sideload fornece um pacote ao recovery, que decide quais operações executar; não é uma cópia inocente de arquivo.

### 3. Acompanhe o primeiro boot e a integração

Após instalação, identifique kernel e release, troque credenciais padrão e teste recursos da adaptação. Se falta rede, preserve logs antes de alterar pacotes. Um pacote de adaptação contém configurações e eventualmente binários necessários; remover como “bloatware” pode quebrar o port.

A recomendação de formatar dados encontrada numa seção de troubleshooting upstream é destrutiva. Não a transforme na primeira tentativa genérica para toda falha de boot. Confirme primeiro estado da partição, variante, firmware, boot image e instrução vigente.

## Outras distribuições

Sailfish OS disponibiliza versões para modelos oficiais e ports comunitários, com componentes e licenças que podem variar. Consulte [dispositivos e versões Android requeridas](https://docs.sailfishos.org/Support/Supported_Devices/) e o guia específico. Uma documentação de HADK ensina adaptação, não prova suporte pronto ao seu telefone.

Para qualquer outro projeto, exija a mesma combinação: código/variante, mantenedor, imagem rastreável, instrução de instalação, matriz de funções e recuperação. Uma demonstração de boot ou uma distribuição genérica aarch64 é evidência de possibilidade, não tutorial completo de instalação.

## Erros, alternativas e recuperação/rollback

Se o catálogo só apresenta demonstração, use como laboratório, mantendo outra máquina para tarefas diárias. Se faltar kernel/adaptação, leia [porting](porting.md). Se o arquivo está disponível apenas em mirror pessoal sem origem verificável, registre a lacuna e não o recomende como distribuição oficial.

Para retorno a Android, execute o método específico preparado. Se havia dados criptografados, uma imagem antiga pode não recuperar chaves. Não religue bootloader sobre imagens não reconhecidas. Após reinstalação, revise firmware e recursos originais antes de uma nova tentativa.

## Testes finais

Inicialize sem computador, confirme rede, entrada, carga e interface, reinicie e repita periféricos. Registre nome da imagem, kernel, firmware de base e funções testadas. Uma alternativa só é melhor para seu mini-PC quando cumpre esses requisitos, não porque oferece `apt`.

## Fontes e limites da verificação

Consulta em **10/10/2026**, sem flash físico. Parte do Debian Wiki retornou 403; conteúdo indexado foi usado para localizar a referência, e a instrução vigente precisa ser lida antes da gravação.

- [Mobian: objetivos](https://wiki.debian.org/Mobian/) e [dispositivos](https://wiki.debian.org/Mobian/Devices).
- [Mobian: OnePlus 6/6T](https://wiki.debian.org/InstallingDebianOn/OnePlus/OnePlus6).
- [Droidian: imagens canônicas](https://github.com/droidian-images/droidian).
- [Droidian Installer](https://github.com/droidian-releng/droidian-installer).
- [Droidian: kernel/adaptação](https://docs.droidian.org/porting-guide/).
- [Sailfish: suporte oficial e comunitário](https://docs.sailfishos.org/Support/Supported_Devices/).
