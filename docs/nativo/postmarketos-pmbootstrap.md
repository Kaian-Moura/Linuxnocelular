---
title: Gere uma imagem com pmbootstrap
description: Ambiente Linux, configuração de dispositivo, geração, exportação e validação antes do flash.
sidebar_position: 3
last_verified: '2026-10-10'
verification: documental
hardware_tested: false
---

## Visão geral e resultado esperado

`pmbootstrap` prepara ambientes de construção Alpine, resolve pacotes e produz uma imagem para um dispositivo descrito em **pmaports**. O objetivo deste tutorial é gerar e exportar os artefatos corretos, entender a seleção de kernel e concluir a instalação pelo procedimento **do seu port**. Ele não inventa suporte para um hardware ausente da árvore.

Dificuldade: intermediária para port mantido, avançada para pacote próprio. O computador de construção pode ter arquitetura diferente da CPU do telefone; a ferramenta gerencia os ambientes necessários. Instalar pmbootstrap não instala o sistema no telefone.

## Compatibilidade, materiais e preparação

Você precisa de computador com Linux, shell POSIX e dependências da versão da ferramenta; internet; espaço para fontes/chroots/imagens; permissões administrativas no computador; cabo de dados; documentação do modelo; backup e recuperação prontos. A documentação upstream não oferece execução oficialmente suportada em Windows/macOS: recomenda Linux, incluindo máquina virtual quando necessário. Repassar USB numa VM exige cuidado; construir na VM e gravar num host Linux direto pode simplificar a etapa física.

Anote o pacote de dispositivo e kernel da página do modelo. Eles podem estar em main/community/testing ou num fork experimental. Não escolha um aparelho “parecido” na pergunta de `init`. Se não houver pacote correto, o caminho passa a ser [porting](porting.md).

## Backup e riscos

Preparar e exportar a imagem altera arquivos no computador e usa chroots privilegiados. A etapa de flash pode apagar Android/dados. Execute pmbootstrap como usuário comum, deixando a ferramenta pedir elevação quando necessário. Não use `--assume-yes` durante uma primeira instalação: ele elimina confirmações importantes.

Não modifique branch, firmware e kernel simultaneamente sem uma referência. Uma configuração mainline e outra downstream para o mesmo aparelho podem ter resultados muito distintos. Suporte a boot não implica suporte a GNOME acelerado.

## 1. Instale a ferramenta pela distribuição ou fonte oficial

Exemplos **alternativos**, executados no computador:

```bash
# Fedora, se a versão empacotada atender ao port:
sudo dnf install pmbootstrap

# Debian, quando o pacote estiver disponível na release:
sudo apt install pmbootstrap
```

A documentação alerta que distribuições de release fixa podem ter versões antigas. Confira `pmbootstrap --version` e a exigência do port. Não trate o número mostrado num exemplo da documentação como versão atual garantida.

Se precisar da fonte oficial, instale primeiro Python, Git e OpenSSL pelo gerenciador do host; depois, numa pasta de trabalho nova:

```bash
git clone --depth=1 https://gitlab.postmarketos.org/postmarketOS/pmbootstrap.git
cd pmbootstrap
git rev-parse HEAD
./pmbootstrap.py --version
./pmbootstrap.py --help
```

O hash registra a revisão real. Utilize `./pmbootstrap.py` nos comandos seguintes se escolheu essa forma, ou configure o executável conforme a [instalação upstream](https://docs.nura.eco/pmbootstrap/main/installation.html). Evite instalar um pacote Python global com `sudo pip` para contornar o gerenciamento da distribuição.

## 2. Inicialize e confira cada seleção

```bash
pmbootstrap init
pmbootstrap config device
pmbootstrap config kernel
pmbootstrap config ui
pmbootstrap config aports
```

`init` prepara a configuração e perguntas de dispositivo, canal e interface. As consultas seguintes mostram os valores que serão utilizados. Leia a ajuda da sua versão se alguma opção mudar. Compare dispositivo/canal/kernel com a página do port e registre os caminhos: isso é necessário para reproduzir uma construção.

Escolha primeiro a interface testada no port. “GNOME instalado” não corrige falta de DRM, permissões do seat ou GPU. Em port inicial, terminal ou interface leve pode ser a escolha de diagnóstico. O serviço de inicialização também deve corresponder ao conjunto de pacotes escolhido; não copie unidades systemd em um sistema configurado com OpenRC.

## 3. Examine a receita do dispositivo

O caminho retornado por `pmbootstrap config aports` contém os pacotes pmaports. Localize o pacote informado pela página do aparelho, leia `APKBUILD`, `deviceinfo` e os patches do kernel. No diretório do repositório:

```bash
git status --short
git rev-parse HEAD
git branch --show-current
```

O `APKBUILD` informa fontes e dependências; `deviceinfo` descreve aspectos do hardware/formato de imagem e parâmetros de flash. Registre commits e alterações locais. Defaults históricos podem ter nomes diferentes dos atuais; consulte o [manual de deviceinfo](https://docs.nura.eco/pmaports/main/packaging/device-packages/deviceinfo-reference.html) e o código usado pela sua versão.

Não execute `pmbootstrap checksum` para “resolver” um erro de integridade sem conferir a fonte. Atualizar checksums pode legitimar um arquivo inesperado. Use a verificação disponível na ajuda da ferramenta quando estiver revisando fontes, não um aceite cego de conteúdo novo.

## 4. Gere o sistema, sem gravar no telefone

```bash
pmbootstrap install --help
pmbootstrap install
pmbootstrap export --help
pmbootstrap export
```

Sem uma opção que indique disco externo, `install` prepara o rootfs/imagem no ambiente da ferramenta; não é automaticamente um flash do telefone. Revise a ajuda e as opções da sua versão antes. Defina a senha solicitada e preserve credenciais em local privado. Criptografia de disco exige suporte e entrada funcional no boot; não a ative como teste num aparelho sem tela antes de validar o desbloqueio.

`export` disponibiliza os artefatos para uso externo; o manual consultado indica `/tmp/postmarketOS-export` como destino padrão. Confirme o caminho mostrado na sua execução. Conteúdo em `/tmp` pode desaparecer ao reiniciar o computador; copie sua exportação de forma consciente, incluindo arquivos alvo de links simbólicos se necessário.

```bash
ls -lh /tmp/postmarketOS-export
```

Veja quais arquivos foram gerados e seus tamanhos. Não presuma que haverá `dtbo.img`, nem que todo aparelho precisará dele. Kernel e rootfs precisam pertencer à mesma construção compatível.

## 5. Revise a operação de flash e aplique a receita específica

```bash
pmbootstrap flasher --help
pmbootstrap flasher list_devices
```

Esses comandos consultam ajuda/detecção. Subcomandos como `flash_kernel`, `flash_rootfs`, `flash_dtbo` e `flash_vbmeta` **podem gravar partições**. Sua presença na ajuda não significa que todos devam ser executados. Alguns aparelhos têm bootloader secundário ou instalam o kernel no rootfs; outros exigem fastbootd ou slots específicos.

Antes da gravação, compare `arquivo → destino → slot → firmware de base` com a página do port. Não substitua o destino por `userdata` só porque é maior. Não copie uma sequência que apaga `dtbo` de outro modelo. Um boot temporário também é hardware específico: ele executa código e pode travar, mesmo sem gravar permanentemente.

**Limite verificado:** não existe aqui uma sequência universal segura. As páginas de instalação da wiki ficaram parcialmente bloqueadas à consulta automática. Você pode gerar e inspecionar a imagem com o manual acessível; só conclua o flash depois de ler a receita atual do modelo. Se ela estiver incompleta, participe do porting ou mantenha Android.

## Verificação, erros e alternativas

Se um pacote não existir no canal, confira se o port está em edge ou num fork e se a página está atualizada. Se uma compilação falhar, preserve o log e a revisão, localize o primeiro erro e não troque kernel por acaso. Se a imagem for grande demais, revise interface e destino permitido; tamanho não autoriza apagar outra partição.

Depois de instalar, confira `/etc/os-release`, `uname -a`, espaço, rede e sessão no telefone. Ferramentas instaladas num chroot do computador não são provas sobre o kernel rodando no aparelho.

## Recuperação/rollback e testes finais

Volte à configuração anterior de construção somente com cópia/commit registrado; não limpe toda a área de trabalho antes de salvar logs. Após flash, a restauração é a do modelo, preparada no backup. Teste boot sem computador, reinício, rede, entrada, energia e vídeo conforme sua finalidade. Guarde commit pmaports, revisão pmbootstrap, canal, pacote do kernel e hashes dos artefatos no relatório.

## Fontes e limites da verificação

Verificação documental em **10/10/2026**. Comandos de construção foram conferidos no manual; flash não foi executado em aparelhos arbitrários.

- [pmbootstrap: instalação](https://docs.nura.eco/pmbootstrap/main/installation.html).
- [Manual de comandos, destino após redirecionamento](https://docs.nura.eco/pmbootstrap/main/usage.html).
- [Deviceinfo](https://docs.nura.eco/pmaports/main/packaging/device-packages/deviceinfo-reference.html), lida diretamente; conferir a receita do seu modelo.
- [Firmware no empacotamento](https://docs.nura.eco/pmaports/main/packaging/firmware-packages.html).
- [AOSP: formato de boot](https://source.android.com/docs/core/architecture/bootloader/boot-image-header).
