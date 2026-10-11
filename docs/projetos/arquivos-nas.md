---
title: Arquivos, backups e um pequeno NAS
sidebar_position: 5
description: Sirva arquivos por SFTP, valide cópias e entenda limites de armazenamento, USB e sincronização.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, requisitos e limites

**Dificuldade:** intermediária. **Resultado:** diretório de arquivos no telefone acessível por SFTP e cópia de backup testada no computador. Um smartphone pode prestar serviço de arquivos, mas não ganha redundância de disco, memória ECC ou recuperação de energia só por ser chamado de NAS.

Tenha [SSH com chave](./ssh-remoto.md), armazenamento disponível, energia estável, rede e uma cópia externa. Em Android, confirme permissões do aplicativo para acessar cada pasta; em Linux nativo, confirme filesystem, montagem e proprietário. Discos USB exigem host funcional e energia apropriada, podendo disputar hub com vídeo e carga.

## 0. Preparar uma transferência sem aprender um servidor novo

SFTP é um protocolo de transferência **sobre SSH**, e não FTP. O servidor OpenSSH do telefone já pode fornecer essa função. Comece por [SSH desde zero](ssh-remoto.md), incluindo instalação do cliente no Windows/macOS/Linux, conta, endereço, porta, fingerprint, chave e alias `mini-pc`. Você deve conseguir `ssh mini-pc` antes de seguir; SFTP não corrige uma conexão SSH que ainda falha.

Abra no telefone um terminal local ou a shell SSH. Verifique `pwd` e `whoami`: a pasta `$HOME/arquivos-mini-pc` será criada na home **do telefone**. Reserve arquivos sem valor para os testes. No notebook, escolha uma pasta local nova para receber a cópia. Seus documentos pessoais só entram no servidor depois que transferência e restauração forem comprovadas.

O Windows com OpenSSH Client, macOS e Linux normalmente oferecem `sftp` junto do cliente SSH. No notebook Linux/macOS, execute `command -v sftp`; no PowerShell Windows, `Get-Command sftp`. Deve aparecer um caminho para o executável. Isso comprova apenas sua presença, não uma conexão. Se faltar, utilize a instalação OpenSSH do guia; não instale um servidor FTP público como substituto.

Se prefere uma interface gráfica, há [WinSCP para Windows](https://winscp.net/eng/download.php) e [FileZilla Client](https://filezilla-project.org/download.php?type=client) para sistemas suportados. Baixe **Client**, não FileZilla Server. Os exemplos de terminal abaixo dispensam um aplicativo extra.

:::warning Sincronização não é backup
Um sincronizador pode replicar exclusões e corrupção. Mantenha uma cópia com histórico ou snapshots em outro dispositivo e teste restauração. A memória interna de um telefone antigo não deve ser a única cópia de fotos, documentos ou projetos.
:::

## 1. Criar uma área de teste

Como usuário comum do telefone:

```bash
mkdir -p "$HOME/arquivos-mini-pc"
printf '%s\n' 'Arquivo de teste do mini PC' > "$HOME/arquivos-mini-pc/teste.txt"
df -h "$HOME/arquivos-mini-pc"
sha256sum "$HOME/arquivos-mini-pc/teste.txt"
```

O diretório é separado da publicação web e das chaves SSH. `df` informa espaço do filesystem real; `sha256sum` permite conferir integridade após transferência. No Termux, prefira a pasta privada para projetos com permissões e links; copie documentos compartilháveis ao espaço Android somente quando a permissão e o destino forem confirmados.

Copie o hash para sua anotação local. Uma linha contém o hash e o nome do arquivo; compare o **hash**, não a diferença de nomes entre máquinas. Letras hexadecimais maiúsculas/minúsculas representam o mesmo valor. Se `teste.txt` já existir com conteúdo importante, escolha outro arquivo em todas as etapas. Você pode abrir `nano "$HOME/arquivos-mini-pc/teste.txt"`, alterar o texto de teste e salvar por **Ctrl+O → Enter → Ctrl+X** antes de recalcular o hash.

## 2. Transferir por SFTP

No computador, após configurar o alias `mini-pc` e validar conta, IP, porta e chave pelo [guia SSH](./ssh-remoto.md):

Prepare o diretório local antes de abrir SFTP. **Linux/macOS do notebook**, numa pasta de destino ainda sem um `teste.txt` importante:

```bash
mkdir -p "$HOME/Downloads/mini-pc-transferencia"
cd "$HOME/Downloads/mini-pc-transferencia"
```

**PowerShell Windows do notebook:**

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\Downloads\mini-pc-transferencia"
Set-Location "$env:USERPROFILE\Downloads\mini-pc-transferencia"
```

`mkdir`/`New-Item` criam a pasta, e `cd`/`Set-Location` escolhem onde o próximo download será salvo. Confirme o diretório e use o mesmo comando de conexão nos três sistemas:

```bash
sftp mini-pc
```

A configuração do alias define a porta e a chave utilizadas. Se usar parâmetros explícitos em vez do alias, SFTP utiliza `-P` maiúsculo para porta, diferente de `ssh -p`. Depois de verificar a host key, execute no prompt SFTP, utilizando um diretório local de teste que não contenha um `teste.txt` importante:

```text
pwd
ls
cd arquivos-mini-pc
get teste.txt
bye
```

No computador, compare o checksum do `teste.txt` baixado. Para enviar um arquivo de teste, utilize `put NOME_LOCAL` somente após conferir o diretório remoto e que nenhum arquivo importante será sobrescrito. SFTP usa o transporte SSH, não precisa de FTP aberto nem senha transmitida por HTTP.

No prompt `sftp>`, `pwd` refere-se à pasta **remota**; `lpwd` mostra a pasta **local** do notebook. `cd` muda o remoto, `lcd` muda o local. `get` baixa, `put` envia e `bye` sai. O prompt SFTP não é uma shell Linux: `sudo`, `nano` e comandos APT não são executados ali. Abra outra conexão SSH quando precisar desses programas.

Depois de `bye`, no notebook Linux execute `sha256sum teste.txt`; no macOS, `shasum -a 256 teste.txt`; no PowerShell, `Get-FileHash .\teste.txt -Algorithm SHA256`. O hash deve coincidir com o do telefone. Abra o texto pelo editor do notebook e confira a frase, evitando confiar apenas no nome.

Para enviar, crie localmente `enviado-notebook.txt` no editor e salve como texto simples UTF-8 nessa pasta. No Windows, o Bloco de Notas deve usar tipo **Todos os arquivos** se necessário para não acrescentar `.txt` a outro nome. Abra SFTP novamente e, confirmando que o destino não contém arquivo importante com esse nome:

```text
cd arquivos-mini-pc
put enviado-notebook.txt
ls
bye
```

No telefone, `cat "$HOME/arquivos-mini-pc/enviado-notebook.txt"` deve mostrar o conteúdo enviado. Calcule o hash nos dois lados se quiser confirmar integridade. Este teste prova as duas direções; não precisa abrir portas adicionais nem dar permissão a todos os usuários.

O servidor precisa do subsystem SFTP adequado. No Termux, o pacote OpenSSH declara seu componente SFTP; em outras distribuições, confira `Subsystem` na configuração. Falha de subsystem deve ser corrigida na configuração/pacote, não removendo autenticação.

### Clientes gráficos: abrir, preencher e verificar

**WinSCP no Windows:** use [o download oficial](https://winscp.net/eng/download.php), escolha o pacote de instalação adequado, execute-o e revise licença/opções. O fluxo típico oferece instalação usual e interface Commander/Explorer; escolha a que compreende. Abra o programa e, em **Nova sessão**, selecione **SFTP**, endereço do telefone, porta SSH e conta confirmada. Em **Avançado → SSH → Autenticação**, escolha a chave **privada local** criada no guia SSH. Se sua versão solicitar conversão para o formato PuTTY, siga [o procedimento WinSCP de chave](https://winscp.net/eng/docs/ui_login_authentication), guarde a cópia convertida de forma privada e não a envie ao telefone.

Clique em login, compare a fingerprint de host e informe a passphrase da chave se solicitada. Na interface Commander, o lado local mostra o notebook e o remoto mostra o telefone; confirme pelo caminho apresentado, não apenas pelo lado visual. Abra `arquivos-mini-pc` no remoto e a pasta de transferência no local, copie `teste.txt` e leia o resumo da operação. Uma pergunta de sobrescrita pede comparar os arquivos antes de aceitar. A tela de login pode armazenar credenciais; só salve quando entende como o programa as protege.

**FileZilla Client no macOS/Linux/Windows compatível:** baixe a edição/arquitetura do sistema pela página oficial, revise o instalador e abra o programa. No **Gerenciador de sites**, crie um site com protocolo **SFTP — SSH File Transfer Protocol**, host, porta e conta. Se usar autenticação por chave, selecione o arquivo de chave pelo mecanismo suportado da sua versão. Não use o modo FTP apenas porque a interface oferece conexão rápida. Confira fingerprint e caminhos locais/remotos, copie um arquivo de teste e compare hashes. O cliente gráfico não torna a pasta da home pública; permissões e conta SSH continuam definindo o acesso.

Se uma GUI não aceitar seu formato de chave, não reduza a autenticação do servidor para contornar: utilize o cliente `sftp mini-pc` já validado ou siga a conversão/importação oficial do cliente. A chave pública autorizada no telefone continua a mesma quando o formato da privada é convertido corretamente.

## 3. Backup incremental com rsync

Instale rsync no computador e no ambiente do telefone pelo gerenciador correspondente: `pkg install rsync`, `sudo apt install rsync` ou `sudo apk add rsync`. Mantenha os programas da arquitetura e libc corretas.

Rsync precisa existir **nos dois lados** e este bloco é para notebook Linux/macOS com rsync disponível. Confirme `rsync --version` localmente e `ssh mini-pc 'rsync --version'` remotamente. Em Debian/Ubuntu do notebook, `sudo apt update` e `sudo apt install rsync`; Fedora, `sudo dnf install rsync`. macOS pode fornecer uma versão antiga: registre-a e use opções suportadas, ou instale uma versão por um gerenciador confiável já configurado. Windows não fornece rsync nativo com OpenSSH; use SFTP/WinSCP inicialmente, ou prepare um ambiente Linux separado com seu próprio cliente/alias, sem presumir que PowerShell compreende este comando.

No computador:

```bash
mkdir -p "$HOME/backup-mini-pc"
rsync -av --partial --dry-run -e ssh mini-pc:arquivos-mini-pc/ "$HOME/backup-mini-pc/"
```

`--dry-run` mostra a transferência planejada. A barra após o diretório remoto copia seu **conteúdo**. Leia a lista e então execute novamente sem `--dry-run`. Não adicione `--delete`: o exemplo busca preservar arquivos no destino, e esse parâmetro poderia apagar dados que não estão mais na origem.

Depois de revisar a simulação, a transferência real é:

```bash
rsync -av --partial -e ssh mini-pc:arquivos-mini-pc/ "$HOME/backup-mini-pc/"
```

`-a` solicita atributos de arquivo, `-v` mostra o progresso informativo, `--partial` preserva uma transferência parcial quando interrompida. A pasta de backup fica **no notebook**. Execute `ls -l "$HOME/backup-mini-pc"` e compare o checksum de `teste.txt`. Repetir a transferência atualiza arquivos alterados; não cria histórico completo de versões. Para histórico, utilize destinos datados/snapshots ou ferramenta de backup adequada antes de usar documentos importantes.

Teste restaurar para um novo diretório no telefone, sem substituir a pasta original. Arquive um inventário com data e checksum de arquivos relevantes. Em storage compartilhado Android, atributos POSIX podem não ser preserváveis; documente quais metadados realmente importam e não confunda um aviso de permissão com perda do conteúdo sem conferir hashes.

Por exemplo, ainda no notebook Linux/macOS, escolha um nome de restauração que **não existe no telefone**, confirme-o por SSH e crie-o:

```bash
ssh mini-pc 'mkdir "$HOME/restauracao-mini-pc-teste"'
rsync -av --dry-run -e ssh "$HOME/backup-mini-pc/" mini-pc:restauracao-mini-pc-teste/
```

O `mkdir` sem `-p` falha se já houver esse destino; não ignore a falha. Confira a simulação, repita o comando rsync sem `--dry-run` e, no telefone, abra os arquivos restaurados e compare hashes. O diretório original `arquivos-mini-pc` permanece preservado. Restauração testada é parte do resultado, e não apenas ter uma barra de progresso de upload concluída.

## 4. Sincronização e clientes gráficos

Syncthing é uma alternativa de sincronização entre máquinas com builds compatíveis, mas requer revisão do pacote disponível no seu sistema. Configure primeiro pela interface local, confirme device IDs por canal confiável e compartilhe apenas uma pasta de teste. A interface administrativa deve ficar no loopback ou protegida por túnel e autenticação.

Não assuma que instalar o binário de uma arquitetura atende a Android, Alpine e Debian igualmente. Revise o estado de clientes Android comunitários e a política de bateria. Ative versionamento de arquivos quando disponível e mantenha backup independente: versionamento local também pode desaparecer com falha física do telefone.

Samba pode oferecer SMB a clientes de desktop em Linux nativo; exige pacote, contas, permissões e firewall próprios. Não use compartilhamento público com `guest ok` para a pasta pessoal. Para um iniciante ou aparelho administrado por SSH, SFTP é um primeiro servidor completo com menos serviços e configurações. A migração para SMB só deve ocorrer com escopo de pastas e acesso documentados.

## 5. Discos USB, consumo e desligamento

No Linux nativo, compare `lsblk -f` antes/depois da conexão; identifique o disco pelo tamanho, modelo e filesystem, não por presumir `/dev/sda`. Leia o filesystem existente sem formatar. Falta de suporte a exFAT/NTFS exige ferramenta/driver da distribuição compatível, não `mkfs` para “consertar”.

Antes de remover um disco, feche aplicações, pare transferências, confirme ausência de processos usando-o e desmonte pelo desktop ou comando apropriado para o ponto confirmado. Um hub que interrompe alimentação durante negociação PD pode corromper escrita; valide hotplug de energia com dados de teste antes de depender de storage externo.

## Erros, rollback e testes finais

Conexão recusada pede conferir SSH; arquivo negado pede proprietário/permissão; transferência lenta pede separar Wi-Fi, CPU, criptografia e velocidade do disco; falta de espaço pede medir a partição real. Expandir uma rootfs é uma operação de armazenamento específica, não uma instrução universal para qualquer telefone.

Para rollback, pare o serviço/sincronizador e remova apenas a configuração específica depois do backup. Não apague a pasta de dados para desinstalar um servidor. **Teste final:** transferência nos dois sentidos, hashes iguais, restauração em pasta nova, retorno após boot e comportamento após perda de rede. Só use dados importantes depois dessa validação e com segunda cópia.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem transferir dados do telefone. [SFTP](https://man.openbsd.org/sftp), [rsync](https://download.samba.org/pub/rsync/rsync.1), [WinSCP: instalar](https://winscp.net/eng/docs/guide_install), [conectar](https://winscp.net/eng/docs/guide_connect), [chaves na autenticação](https://winscp.net/eng/docs/ui_login_authentication), [FileZilla Client](https://filezilla-project.org/download.php?type=client), [Syncthing, segurança](https://docs.syncthing.net/users/security.html), [Syncthing, versionamento](https://docs.syncthing.net/users/versioning.html), [Samba, smb.conf](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html). A viabilidade dos discos, filesystems e clientes Android deve ser testada no aparelho real. SMB/Syncthing são alternativas para uma próxima configuração; o caminho completo inicial desta página é SFTP com teste de backup/restauração.
