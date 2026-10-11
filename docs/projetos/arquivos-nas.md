---
title: Arquivos, backups e um pequeno NAS
sidebar_position: 5
description: Sirva arquivos por SFTP, valide cópias e entenda limites de armazenamento, USB e sincronização.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, requisitos e limites

**Dificuldade:** intermediária. **Resultado:** diretório de arquivos no telefone acessível por SFTP e cópia de backup testada no computador. Um smartphone pode prestar serviço de arquivos, mas não ganha redundância de disco, memória ECC ou recuperação de energia só por ser chamado de NAS.

Tenha [SSH com chave](./ssh-remoto.md), armazenamento disponível, energia estável, rede e uma cópia externa. Em Android, confirme permissões do aplicativo para acessar cada pasta; em Linux nativo, confirme filesystem, montagem e proprietário. Discos USB exigem host funcional e energia apropriada, podendo disputar hub com vídeo e carga.

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

## 2. Transferir por SFTP

No computador, após configurar o alias `mini-pc` e validar conta, IP, porta e chave pelo [guia SSH](./ssh-remoto.md):

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

O servidor precisa do subsystem SFTP adequado. No Termux, o pacote OpenSSH declara seu componente SFTP; em outras distribuições, confira `Subsystem` na configuração. Falha de subsystem deve ser corrigida na configuração/pacote, não removendo autenticação.

## 3. Backup incremental com rsync

Instale rsync no computador e no ambiente do telefone pelo gerenciador correspondente: `pkg install rsync`, `sudo apt install rsync` ou `sudo apk add rsync`. Mantenha os programas da arquitetura e libc corretas.

No computador:

```bash
mkdir -p "$HOME/backup-mini-pc"
rsync -av --partial --dry-run -e ssh mini-pc:arquivos-mini-pc/ "$HOME/backup-mini-pc/"
```

`--dry-run` mostra a transferência planejada. A barra após o diretório remoto copia seu **conteúdo**. Leia a lista e então execute novamente sem `--dry-run`. Não adicione `--delete`: o exemplo busca preservar arquivos no destino, e esse parâmetro poderia apagar dados que não estão mais na origem.

Teste restaurar para um novo diretório no telefone, sem substituir a pasta original. Arquive um inventário com data e checksum de arquivos relevantes. Em storage compartilhado Android, atributos POSIX podem não ser preserváveis; documente quais metadados realmente importam e não confunda um aviso de permissão com perda do conteúdo sem conferir hashes.

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

Revisão documental: **10/10/2026**. [SFTP](https://man.openbsd.org/sftp), [rsync](https://download.samba.org/pub/rsync/rsync.1), [Syncthing, segurança](https://docs.syncthing.net/users/security.html), [Syncthing, versionamento](https://docs.syncthing.net/users/versioning.html), [Samba, smb.conf](https://www.samba.org/samba/docs/current/man-html/smb.conf.5.html). A viabilidade dos discos, filesystems e clients Android deve ser testada no aparelho real.
