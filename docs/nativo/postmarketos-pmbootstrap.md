---
title: Gere uma imagem com pmbootstrap, do zero
description: Prepare Ubuntu ou Fedora, instale a ferramenta oficial e confira diálogos, configuração e artefatos antes do flash específico do aparelho.
sidebar_position: 3
last_verified: '2026-10-11'
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

## 1. Prepare o computador e instale a ferramenta, do zero

:::tip Local de execução
Até o primeiro boot, execute tudo desta página **no terminal do computador Linux**, como usuário comum. No Ubuntu/Fedora, abra o menu de aplicativos e procure “Terminal”. Digite uma linha, pressione Enter e leia a saída antes da próxima. Não copie `$` ou `#` usados como símbolos de prompt em documentos externos.
:::

O caminho principal usa Ubuntu/Debian ou Fedora **instalados nativamente no computador**. Não instale a ferramenta no Termux do telefone para seguir este roteiro. Uma VM é alternativa, mas o USB precisa ser repassado novamente quando o telefone muda de modo; WSL não é o caminho oficialmente suportado.

Confira host, arquitetura e espaço:

```bash
cat /etc/os-release
uname -m
df -h "$HOME"
```

Procure `ID=ubuntu`, `ID=debian` ou `ID=fedora` na primeira saída. `uname` identifica o computador, não a CPU do telefone. `df` mostra espaço livre na partição da pasta pessoal. Reserve uma margem de dezenas de GB para desktop/fontes/chroots; isso é planejamento, não um mínimo universal prometido pelo projeto.

Escolha **somente um** bloco. Para Ubuntu/Debian:

```bash
sudo apt update
sudo apt install git python3 openssl ca-certificates sudo coreutils util-linux rsync file xz-utils bzip2
```

Para Fedora:

```bash
sudo dnf install git python3 openssl ca-certificates sudo coreutils util-linux rsync file xz bzip2
```

`sudo` pede a senha **do computador**; normalmente nenhuma letra aparece enquanto você digita. `apt update` atualiza a lista de pacotes. O comando seguinte instala Git para obter código, Python para executar pmbootstrap, OpenSSL/certificados e utilitários de construção. Leia a lista do gerenciador e confirme quando ela corresponder a esses pacotes.

```bash
python3 --version
git --version
openssl version
```

Cada comando deve imprimir uma versão, sem `command not found`. O [arquivo de requisitos upstream](https://gitlab.postmarketos.org/postmarketOS/pmbootstrap/-/blob/main/pyproject.toml) consultado exige **Python 3.10 ou posterior**. Se o host for mais antigo, prepare uma distribuição suportada; não substitua seu Python de sistema por um executável aleatório.

### Alternativa A: pacote mantido pela distribuição

No Fedora, se a versão empacotada atender ao port:

```bash
sudo dnf install pmbootstrap
pmbootstrap --version
command -v pmbootstrap
```

No Debian, o manual também documenta `sudo apt install pmbootstrap`, **quando disponível na sua release**. Não presumimos disponibilidade em toda versão Ubuntu. Distribuições de release fixa podem congelar versões; se o pacote atende ao port, vá à seção 2. A última consulta informa qual executável o shell escolheu. Não mantenha duas instalações sem saber qual está usando.

### Alternativa B: código oficial pelo Git

É o caminho principal deste roteiro para Ubuntu ou host sem pacote suficientemente recente. Confira primeiro:

```bash
command -v pmbootstrap
```

Nenhum caminho é esperado num computador novo. Se retornar um, decida entre ele e a instalação Git antes de criar outro executável.

```bash
mkdir -p "$HOME/smartphone-linux"
cd "$HOME/smartphone-linux"
git clone --depth=1 https://gitlab.postmarketos.org/postmarketOS/pmbootstrap.git
cd pmbootstrap
git remote -v
git rev-parse HEAD
python3 pmbootstrap.py --version
```

`mkdir -p` cria sua pasta de projeto; `cd` muda o diretório do terminal. `git clone` baixa o repositório oficial e cria a subpasta `pmbootstrap`; não é necessário baixar um ZIP de código e mover arquivos à mão. `--depth=1` reduz o histórico. A URL ainda conserva postmarketOS após a mudança de nome. `remote -v` confirma a origem; `rev-parse HEAD` imprime o identificador da revisão para guardar no relatório. A última linha deve mostrar uma versão.

Se aparecer `destination path 'pmbootstrap' already exists`, não apague a pasta: pode ser uma instalação anterior. Abra-a e examine `git remote -v`. Erros HTTPS/DNS pedem verificar rede, relógio e certificados; não desative a verificação TLS. Não use `sudo pip` para resolver um erro sem entender sua causa.

Para disponibilizar o comando curto, **ainda dentro da pasta `pmbootstrap`**:

```bash
mkdir -p "$HOME/.local/bin"
ln -s "$PWD/pmbootstrap.py" "$HOME/.local/bin/pmbootstrap"
export PATH="$HOME/.local/bin:$PATH"
pmbootstrap --version
command -v pmbootstrap
```

`$PWD` é sua pasta atual. O link aponta para o programa baixado; `PATH` permite ao shell encontrá-lo. Se `ln` disser `File exists`, examine `ls -l "$HOME/.local/bin/pmbootstrap"`; não use `-f` para sobrescrever sem conferir. Não mova a pasta do código após criar o link.

A alteração de `PATH` vale no terminal atual. Se um novo terminal não localizar o comando, abra `.profile`, arquivo oculto de sua pasta pessoal, num editor e acrescente `export PATH="$HOME/.local/bin:$PATH"` uma vez, como recomenda o manual; abra uma nova sessão depois. Enquanto isso, é possível usar `python3 "$HOME/smartphone-linux/pmbootstrap/pmbootstrap.py"` seguido da ação desejada. Não tome `2.1.0`, número de um exemplo antigo do manual, como versão atual exigida.

**Resultado desta etapa:** versão impressa, origem registrada e executável identificado. Nada foi gravado no telefone.

## 2. Inicialize e confira cada seleção

Antes de iniciar, escreva numa nota o identificador `fabricante-codinome`, canal/release, kernel quando selecionável, firmware Android de base, interface testada e método de instalação. Não responda com um nome comercial apenas porque parece semelhante.

```bash
pmbootstrap init
```

O terminal apresenta perguntas; normalmente a resposta padrão aparece entre colchetes e Enter a aceita. **Leia o padrão antes de aceitar.** A ordem e certas perguntas variam conforme versão/port. O [código de init](https://gitlab.postmarketos.org/postmarketOS/pmbootstrap/-/blob/main/pmb/config/init.py) confirma os temas abaixo; a tabela não é uma captura de um aparelho testado.

| Pergunta/tema | Como entender e responder | Quando interromper |
|---|---|---|
| `Work path` | Pasta de cache, chroots e imagens; aceite uma pasta sua com espaço ou indique outra | Sem permissão/espaço; nunca escolha `/` ou uma partição do telefone |
| Caminho de pmaports | Repositório das receitas; no primeiro uso mantenha o oficial sugerido | Fork só quando a página do port exigir |
| `Channel` | Branch/release do sistema; siga a recomendada para o port | Não escolha edge só por ser mais recente |
| Categoria/tipo de port | Pode separar suporte próximo de mainline e downstream | Categoria diferente da documentação do dispositivo |
| `Vendor` / `Device codename` | Fabricante e codinome do pacote | Modelo ausente ou oferta de criar port novo: pare, não escolha o vizinho |
| `Kernel` | Aparece quando há mais de uma variante | Não invente opção se o pacote usa kernel fixo |
| `Username` | Conta comum do futuro telefone, por exemplo `usuario` | Use minúsculas, sem espaços; não é a senha |
| `User interface` | Interface/terminal realmente oferecido para o aparelho | GNOME sem driver não garante aceleração |
| Serviços e extras da interface | Opções compatíveis com o conjunto escolhido | Preserve seleção suportada; OpenRC e systemd não são intercambiáveis |
| Pacotes adicionais | Programas extras do rootfs | Na primeira imagem prefira vazio, personalizando após boot estável |
| Fuso, locale e layout | Região e teclado quando solicitados | Confira as opções da versão; Brasil costuma usar `America/Sao_Paulo` e locale brasileiro |
| Chaves SSH | Inclusão de chaves públicas existentes no computador | Somente suas chaves públicas; nunca distribua a chave privada |

É normal obter pmaports ou pedir a senha administrativa **do computador**. Não rode o processo inteiro com `sudo pmbootstrap`. Se errou uma resposta, use Ctrl+C antes de gerar/gravar e repita `init`. A oferta de criar um port é um trabalho de desenvolvimento, não uma forma de concluir a instalação num modelo ausente.

Ao terminar, consulte:

```bash
pmbootstrap status
pmbootstrap config device
pmbootstrap config kernel
pmbootstrap config ui
pmbootstrap config user
pmbootstrap config work
pmbootstrap config aports
```

Cada `config nome`, **sem segundo valor**, consulta a escolha. Compare aparelho, interface e usuário; anote `work` e `aports`, pois não são necessariamente a pasta do código pmbootstrap. `status` oferece a visão do estado e canal. Essas saídas precisam corresponder à nota feita antes de iniciar.

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
mkdir -p "$HOME/smartphone-linux/imagens-geradas"
cp -aL /tmp/postmarketOS-export/. "$HOME/smartphone-linux/imagens-geradas/"
ls -lh "$HOME/smartphone-linux/imagens-geradas"
```

`ls -lh` mostra nomes e tamanhos legíveis. `cp -aL` copia o conteúdo apontado pelos links simbólicos para uma pasta permanente, evitando depender de `/tmp`. Use uma pasta nova por construção para não misturar versões; se a ferramenta imprimir outro destino de exportação, substitua o caminho pelo real. Na pasta preservada, calcule `sha256sum` de cada artefato real e guarde junto aos commits. Esses são hashes da sua construção, não uma assinatura oficial de download.

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

Se um pacote não existir no canal, confira se o port está em edge ou num fork e se a página está atualizada. Se uma compilação falhar, preserve o log e a revisão, localize o primeiro erro e não troque kernel por acaso. `pmbootstrap log` permite acompanhar o registro; sair do acompanhamento com Ctrl+C não exige apagar a construção. Se a imagem for grande demais, revise interface e destino permitido; tamanho não autoriza apagar outra partição.

| Sintoma | Verificação concreta |
|---|---|
| `pmbootstrap: command not found` | Confira link/PATH e tente o caminho Python completo da etapa 1 |
| Python incompatível | Compare `python3 --version` e requisito atual upstream |
| Utilitário do host ausente | Leia o nome na mensagem e instale pelo gerenciador do computador |
| Modelo ausente | Reveja codinome/canal; não crie pacote novo nem aceite outro dispositivo |
| Checksum incorreto | Preserve o erro e confira fonte; atualizar checksum não é verificação |
| Área de trabalho cheia | Preserve artefatos/logs e libere arquivos identificados; não use `zap` cegamente |
| Flash sem destino documentado | Obtenha a receita exata; [Fairphone 4](fairphone-4.md) mostra um exemplo condicionado por instalador |

Depois de instalar, confira `/etc/os-release`, `uname -a`, espaço, rede e sessão no telefone. Ferramentas instaladas num chroot do computador não são provas sobre o kernel rodando no aparelho.

## Recuperação/rollback e testes finais

Volte à configuração anterior de construção somente com cópia/commit registrado; não limpe toda a área de trabalho antes de salvar logs. Para encerrar os ambientes depois de preservar arquivos, `pmbootstrap shutdown` desmonta os chroots; não desinstala o sistema do telefone. Após flash, a restauração é a do modelo, preparada no backup. Teste boot sem computador, reinício, rede, entrada, energia e vídeo conforme sua finalidade. Guarde commit pmaports, revisão pmbootstrap, canal, pacote do kernel e hashes dos artefatos no relatório.

- [ ] Ferramenta do computador executa e sua origem/revisão foram registradas.
- [ ] Modelo, canal, kernel e interface correspondem ao port.
- [ ] Exportação preservada fora de `/tmp`, sem links quebrados.
- [ ] Backup e [desbloqueio elegível](../preparacao/desbloquear-bootloader.md) preparados quando exigidos.
- [ ] Instalação somente pela receita do modelo; boot e funções necessárias validados depois.

## Fontes e limites da verificação

Verificação documental em **11/10/2026**. Comandos de construção, requisito Python e temas dos diálogos foram conferidos no manual/código; flash não foi executado em aparelhos arbitrários. A wiki pode exigir uma verificação no navegador: fontes de código não substituem uma receita de modelo que permaneça inacessível.

- [pmbootstrap: instalação](https://docs.nura.eco/pmbootstrap/main/installation.html).
- [Manual de comandos, destino após redirecionamento](https://docs.nura.eco/pmbootstrap/main/usage.html).
- [Deviceinfo](https://docs.nura.eco/pmaports/main/packaging/device-packages/deviceinfo-reference.html), lida diretamente; conferir a receita do seu modelo.
- [Firmware no empacotamento](https://docs.nura.eco/pmaports/main/packaging/firmware-packages.html).
- [AOSP: formato de boot](https://source.android.com/docs/core/architecture/bootloader/boot-image-header).
