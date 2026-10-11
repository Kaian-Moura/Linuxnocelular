---
title: Faça um backup e prove que consegue restaurar seu projeto
description: Um laboratório com arquivos próprios, cópia externa, hashes e restauração em pasta separada, sem sobrescrever seu trabalho.
sidebar_position: 22
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Nesta aula, “tenho backup” só será considerado um resultado depois que você recuperar uma cópia e conferir seu conteúdo. Você criará dois documentos de estudo, guardará a primeira versão, mudará o original e restaurará a versão anterior **em outra pasta**. Não haverá exclusão automática nem substituição de sistema.

**Dificuldade:** iniciante após [pastas e terminal](../comece-aqui/terminal-primeiros-passos.md). Materiais: editor de texto, gerenciador de arquivos, espaço para algumas cópias e um destino fora do telefone quando ele for a origem. Pode praticar inteiramente no computador primeiro. O laboratório usa arquivos seus e pequenos; não aplique os comandos a partições, `/dev`, raiz do sistema, fotos sem outra cópia ou dados privados de aplicações.

**Resultado esperado:** conseguir identificar versão original, versão modificada, arquivo de backup e versão restaurada, com texto e hashes coerentes. Uma cópia no mesmo aparelho ajuda a desfazer um erro de edição, mas não protege contra perda/limpeza desse aparelho. Um backup de projeto não é clone de firmware, root, identidade do telefone ou todos os dados Android.

## 1. Decida onde está a origem e onde estará a cópia externa

Desenhe duas caixas numa nota: **origem do projeto** e **destino do backup**. Na origem, anote sistema/usuário/pasta. No destino, anote computador ou armazenamento independente que você consegue abrir sem o telefone. Exemplos de topologias, não caminhos universais:

| Origem | Destino externo possível | Observação |
| --- | --- | --- |
| Projeto no Termux privado | Computador por SFTP | MTP não expõe automaticamente a pasta privada do aplicativo |
| Projeto no Linux nativo | Computador por SFTP ou disco montado corretamente | Confirme permissões, montagem e espaço antes da cópia |
| Arquivos compartilhados Android | Computador por transferência de arquivos/MTP | Isso não inclui todos os dados privados dos aplicativos |
| Projeto já no computador | Disco externo ou outro destino acessível | Uma segunda pasta no mesmo disco é treino, não proteção independente |

Se você ainda não preparou uma transferência entre telefone e computador, faça [SSH/SFTP e arquivos](ssh-arquivos.md) quando compatível. Se usará armazenamento compartilhado Android, siga [backup do dispositivo](../preparacao/backup.md) e a concessão de acesso pertinente. Não faça root/desbloqueio só para esta aula; uma operação que apaga dados não é pré-requisito sensato para preservá-los.

**Checkpoint 1:** você sabe onde os bytes existem hoje e qual lugar continuará acessível se o telefone perder o sistema. Se ainda não há esse lugar, execute o laboratório local para aprender, mas registre “cópia externa pendente”.

## 2. Crie uma área nova para o laboratório

### Pela interface, em qualquer computador

No Windows, abra Explorador; no Mac, Finder; no Linux desktop, Arquivos. Entre na pasta pessoal e crie **uma pasta nova** `aula-backup`. Se o nome já existe, não misture o projeto anterior: use outro nome e adapte os caminhos. Dentro dela, crie `projeto`, `copias` e `restaurado-v1`. O último diretório deve ficar vazio até a restauração.

Na pasta `projeto`, crie `ideias.txt` e `tarefas.txt` com um editor de texto. No Windows, use Bloco de Notas e habilite extensões no Explorador para evitar `ideias.txt.txt`. No macOS TextEdit, escolha texto simples antes de salvar; documentos formatados `.rtf` não correspondem ao exercício. Num desktop Linux, use o editor de texto disponível. Não precisa instalar IDE.

### Pelo terminal Linux/macOS, Termux ou Linux nativo

Abra o terminal **do ambiente que será a origem**. Confira `pwd`, `$HOME` e o nome `aula-backup` na pasta pessoal. Para uma área ainda inexistente:

```bash
mkdir "$HOME/aula-backup"
mkdir "$HOME/aula-backup/projeto"
mkdir "$HOME/aula-backup/copias"
mkdir "$HOME/aula-backup/restaurado-v1"
```

Pare se aparecer “File exists”; os próximos passos devem criar arquivos novos. Use o editor já preparado pela aula de terminal: `nano "$HOME/aula-backup/projeto/ideias.txt"`, grave com Ctrl+O, Enter, Ctrl+X; repita para `tarefas.txt`. A criação pela interface também é válida no Linux nativo.

### Um percurso PowerShell equivalente, opcional

Se prefere o terminal Windows, depois de confirmar que o nome ainda não existe:

```powershell
$backupLabDir = "$env:USERPROFILE\aula-backup"
New-Item -ItemType Directory $backupLabDir
New-Item -ItemType Directory "$backupLabDir\projeto"
New-Item -ItemType Directory "$backupLabDir\copias"
New-Item -ItemType Directory "$backupLabDir\restaurado-v1"
notepad "$backupLabDir\projeto\ideias.txt"
```

Feche o editor depois de salvar e abra `tarefas.txt` da mesma maneira. Não troque o diretório por Downloads inteiro; a experiência deve ficar pequena e identificável.

**Checkpoint 2:** três pastas de finalidade distinta; somente `projeto` contém dois arquivos próprios. Nenhum caminho aponta a configurações ou dados de outro aplicativo.

## 3. Escreva a versão que você deseja preservar

Nos dois arquivos, use textos próprios ou estes exemplos originais:

```text title="ideias.txt — conteúdo de estudo"
Versão 1 do meu projeto.
Objetivo: reaproveitar um aparelho sem perder meu trabalho.
```

```text title="tarefas.txt — conteúdo de estudo"
1. Identificar o ambiente.
2. Fazer uma cópia externa.
3. Restaurar em outra pasta e conferir.
```

Grave, feche e reabra cada arquivo pelo gerenciador. Copiar texto para a tela do editor sem salvar não cria backup. Texto acentuado pode ter codificações diferentes conforme o editor; isso não é um defeito do exercício, mas você deverá comparar as cópias do mesmo arquivo byte a byte, sem reeditar a cópia para “padronizar” antes da verificação.

No Termux/Linux, pode consultar os documentos com `cat` apontando aos caminhos exatos. No Windows, abra no Bloco de Notas; no Mac, texto simples. Anote a data e o significado de “v1” em sua ficha: é a versão de conteúdo do **seu projeto**, não a versão de Android.

**Checkpoint 3:** os dois arquivos mostram seu conteúdo original mesmo depois de fechar/reabrir. O projeto não contém senhas, chaves SSH privadas, tokens ou configurações de rede pessoal para este laboratório.

## 4. Registre hashes da origem antes de alterar qualquer coisa

Um hash SHA-256 é uma impressão do conteúdo em bytes. Ele ajuda a comparar cópias; não informa se você esqueceu um arquivo, se o projeto compila ou se uma aplicação consegue importar seus dados. Vamos combiná-lo com listagem e leitura humana.

**No terminal Linux/Termux/Linux nativo da origem:**

```bash
sha256sum "$HOME/aula-backup/projeto/ideias.txt"
sha256sum "$HOME/aula-backup/projeto/tarefas.txt"
```

**No terminal macOS da origem:**

```bash
shasum -a 256 "$HOME/aula-backup/projeto/ideias.txt"
shasum -a 256 "$HOME/aula-backup/projeto/tarefas.txt"
```

**No PowerShell Windows da origem:**

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\aula-backup\projeto\ideias.txt"
Get-FileHash -Algorithm SHA256 -LiteralPath "$env:USERPROFILE\aula-backup\projeto\tarefas.txt"
```

Copie nome e resultado para uma nota **fora da pasta projeto**; ela será sua referência da versão 1. Não há um número publicado para comparar aqui, porque o texto/codificação pode ser seu. Cada arquivo deve ter sua linha. [Get-FileHash](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.utility/get-filehash?view=powershell-7.5), [hashlib Python](https://docs.python.org/3/library/hashlib.html).

Se uma ferramenta não existe, use a interface/alternativa do sistema ou prepare-a pelo gerenciador adequado; não execute comandos Windows no Termux. Para quem já tem Python, uma alternativa de leitura é:

```bash
python3 - <<'PY'
from pathlib import Path
import hashlib
projeto = Path.home() / 'aula-backup' / 'projeto'
for nome in ('ideias.txt', 'tarefas.txt'):
    dados = (projeto / nome).read_bytes()
    print(nome, hashlib.sha256(dados).hexdigest())
PY
```

Esse bloco só lê os dois arquivos conhecidos; não procura toda a sua memória. **Checkpoint 4:** referência anterior preservada com nomes completos e duas impressões, antes da próxima edição.

## 5. Faça uma cópia legível antes de aprender compactação

Pelo gerenciador, selecione a pasta `projeto`, escolha **Copiar**, abra `copias` e **Colar**. Não use Recortar. Ao final deve existir `copias/projeto/ideias.txt` e `copias/projeto/tarefas.txt`. Se o sistema pergunta para mesclar/substituir, pare: o destino não estava novo. Escolha outra pasta de cópia e registre seu nome.

Um percurso de terminal, apenas se `copias/projeto` ainda não existe:

```bash
# Origem Linux/macOS/Termux/Linux nativo
cp -R "$HOME/aula-backup/projeto" "$HOME/aula-backup/copias/"
```

```powershell
# Origem Windows PowerShell
Copy-Item -LiteralPath "$env:USERPROFILE\aula-backup\projeto" -Destination "$env:USERPROFILE\aula-backup\copias" -Recurse
```

O `-R`/`-Recurse` inclui a pasta e seus arquivos. Estes exemplos de cópia são adequados aos documentos do laboratório; não estão prometendo preservação universal de ACL, donos, hard links ou todo metadado de uma instalação. [Copy-Item](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/copy-item?view=powershell-7.5).

Abra as cópias pelo gerenciador e calcule hashes nos novos caminhos. Devem coincidir com as duas referências da origem. Compare também a quantidade/nome de arquivos. Um hash de `ideias.txt` correto não demonstra que `tarefas.txt` foi copiado.

**Checkpoint 5:** há duas versões idênticas na área do laboratório. Isso ainda é somente uma cópia **no mesmo aparelho/disco**. Não marque “backup externo pronto” antes de transferir e conferir o destino independente.

## 6. Empacote o projeto, se precisar de um arquivo único

`tar` reúne arquivos numa estrutura de arquivo; gzip comprime os bytes. `projeto-v1.tar.gz` permite transportar uma pasta como um arquivo. Ele não é criptografado por essas opções e não contém automaticamente tudo que existe fora da pasta escolhida. Nesta aula, o arquivo ficará em `copias`, **fora** de `projeto`, evitando empacotar o próprio backup dentro dele.

**Linux/macOS/Termux/Linux nativo com `tar` disponível:** confirme que `projeto-v1.tar.gz` não existe no destino; se existir, escolha outro nome. Depois:

```bash
tar -czf "$HOME/aula-backup/copias/projeto-v1.tar.gz" -C "$HOME/aula-backup" projeto
tar -tzf "$HOME/aula-backup/copias/projeto-v1.tar.gz"
```

`-c` cria; `-z` usa gzip; `-f` recebe o caminho do arquivo; `-C` muda a base da leitura; `-t` lista sem extrair. Espere entradas da pasta `projeto/` e seus dois documentos. A lista deve ser curta e relativa, sem caminhos para arquivos de sistema. O modo de listar não prova toda integridade nem executa o conteúdo.

**Windows:** a cópia de pasta da etapa 5 já basta para concluir a aula. Opcionalmente, use o recurso do Explorador de compactar a pasta em ZIP, anote o formato e abra a lista de membros. Um ZIP tem procedimento de extração próprio; não renomeie `.zip` para `.tar.gz`. Algumas versões Windows também fornecem `tar`; consulte `tar --version` antes de usar comandos e confirme que as opções são aceitas. Não instalar uma ferramenta extra só para este laboratório é uma alternativa válida.

Calcule o hash do **arquivo de backup**, além dos hashes internos dos documentos. Essa nova impressão permite comparar o pacote antes/depois de transportá-lo; não substitui a restauração. Se copiar o pacote e depois modificá-lo, a referência original continua necessária para explicar a diferença.

**Checkpoint 6:** você sabe qual formato usou, o que incluiu e onde está o arquivo intacto. Extraia só arquivos que você criou/conferiu nesta aula; um arquivo desconhecido pode conter nomes/links/dados fora desse escopo. [Operações de criação/listagem/extração do GNU tar](https://www.gnu.org/software/tar/manual/tar.html).

## 7. Leve uma cópia para fora da origem e confira de novo

### Telefone como origem, computador como destino

Pela aula [SFTP](ssh-arquivos.md), conecte ao telefone e confira as pastas local/remota. Use `get` para receber `aula-backup/copias/projeto-v1.tar.gz` num diretório **novo** do computador, ou `get -r` para receber a pasta `aula-backup/copias/projeto` quando não usou arquivo compactado. O comando é dado dentro de `sftp>`, não no shell Android; `lpwd` localiza o destino do computador.

No Termux, alternativamente, exponha **somente o pacote de backup de estudo** pelo armazenamento compartilhado, após a permissão documentada do aplicativo, e copie por MTP. No Android ligado ao Windows/Linux, desbloqueie, selecione Transferência de arquivos e copie pelo gerenciador. Não transforme isso em “copiei todos os dados Termux”: você moveu apenas o artefato escolhido. No Mac, siga o caminho ADB/SFTP documentado; Finder não deve ser presumido como navegador MTP universal.

### Computador como origem

Conecte seu disco externo, identifique-o pelo gerenciador e crie uma pasta nova `backup-estudo-v1`. Confira capacidade e que está copiando para o dispositivo certo. Copie o pacote/pasta e aguarde terminar; depois calcule os hashes no destino. Não formate um disco para contornar um erro de acesso. Se não dispõe de mídia externa, use um destino de backup que consegue acessar por outro aparelho e registre suas dependências de conta/rede; a cópia local continua sendo somente treino.

Em qualquer rota, compare o hash do pacote recebido com a referência. Se transportou pasta sem compactação, compare cada documento. Depois abra o backup ou seus membros no destino, sem modificar o original. Desconectar no meio pode deixar arquivo parcial; mensagem de transferência concluída e hash conferido são evidências complementares.

**Checkpoint 7:** você consegue abrir/listar a cópia no destino independente e demonstrar igualdade. Registro útil: origem, destino, data, formato, tamanho, nomes, hashes e resultado de leitura. Não coloque senhas, passphrases ou chaves privadas numa ficha pública.

## 8. Altere somente o original e preserve as duas versões

Volte ao editor da **origem**, abra `projeto/ideias.txt` e acrescente uma linha: “Versão 2: agora estou testando a restauração.” Grave, feche e reabra. Não toque em `copias`, no pacote externo ou nas referências v1. Calcule o hash de `projeto/ideias.txt` novamente e anote como versão 2.

O hash desse documento deve mudar; `tarefas.txt`, que não foi editado, deve manter o anterior. Confira no destino de backup que a primeira versão continua sem a linha adicional. Uma sincronização que propaga todas as alterações pode não manter versões antigas; por isso usamos destinos/versionamento identificados, em vez de presumir que qualquer pasta sincronizada é um backup histórico.

Se o hash não mudou, confira se salvou, se abriu o arquivo correto e se mudou bytes de verdade. Não apague o original para forçar o teste. Se a cópia também mudou, investigue se estava editando a cópia, usando um link ou sincronizando automaticamente. Pare antes de produzir outra cópia que oculte essa evidência.

**Checkpoint 8:** versão 2 visível na origem e versão 1 intacta no backup. Você ainda não provou recuperação; falta abrir a versão restaurada fora de ambos.

## 9. Restaure em um destino vazio, sem sobrescrever o projeto

No destino de recuperação, confirme que `restaurado-v1` está vazio e pertence ao laboratório. Não selecione a pasta `projeto` como destino de extração. Se a restauração acontecer no computador a partir de backup do telefone, crie ali uma área nova `aula-backup-recuperado`; ajuste somente o destino e anote essa escolha.

**Para o arquivo tar da etapa 6, ainda acessível no ambiente Linux/macOS/Termux:**

```bash
tar -tzf "$HOME/aula-backup/copias/projeto-v1.tar.gz"
tar -xzf "$HOME/aula-backup/copias/projeto-v1.tar.gz" -C "$HOME/aula-backup/restaurado-v1"
```

`-x` extrai. O resultado deve ser `restaurado-v1/projeto/ideias.txt` e `restaurado-v1/projeto/tarefas.txt`. Quando o arquivo está num disco/computador externo, use seu caminho real, confirmado pelo gerenciador; não copie o exemplo `$HOME` esperando que ele procure em todos os discos. Listar antes ajuda a confirmar a origem, formato e nomes escolhidos.

**Para pasta de backup ou ZIP, em qualquer desktop:** copie a pasta de backup para o diretório novo ou use Extrair tudo/Extrair no destino escolhido. Leia o diálogo antes de confirmar. Se aparecer “substituir arquivos existentes”, cancele e escolha uma pasta vazia: esta aula não exige substituição. No PowerShell, a cópia de pasta usa `Copy-Item` para o destino novo, como na etapa 5; no ZIP use a extração da interface, preservando o arquivo compactado.

Abra os dois documentos **dentro de restaurado-v1**. `ideias.txt` deve conter a primeira versão e não a frase da versão 2. Compare seus hashes com as referências v1. Como verificação adicional em Linux/macOS/Termux, `cmp` compara bytes de dois arquivos e não imprime nada quando iguais:

```bash
cmp "$HOME/aula-backup/copias/projeto/ideias.txt" "$HOME/aula-backup/restaurado-v1/projeto/ideias.txt"
cmp "$HOME/aula-backup/copias/projeto/tarefas.txt" "$HOME/aula-backup/restaurado-v1/projeto/tarefas.txt"
```

Use essa comparação apenas se guardou a cópia de pasta da etapa 5 nos caminhos apresentados; se restaurou em outro computador, compare hashes/arquivos disponíveis naquele destino. O projeto original v2 continua preservado. Você não precisa mover a recuperação sobre ele para provar que o backup funciona.

**Checkpoint 9:** versão restaurada abre e coincide com v1; versão original v2 continua diferente somente onde você editou. Se a recuperação falhou, mantenha o pacote intacto e registre erro, tamanho, lista e ferramenta. Não repita extração sobre o projeto atual.

## 10. Entenda o que esta experiência não inclui

| Item | Por que a cópia dos dois documentos não o cobre |
| --- | --- |
| Aplicações Android e seus dados privados | Cada aplicativo tem regras de exportação/acesso; MTP/SFTP do Termux não leem todos eles |
| Autenticadores, passkeys, eSIM e bancos | Podem exigir recuperação/provisionamento pelo fornecedor, independente dos arquivos copiados |
| Ambiente inteiro Debian PRoot | Precisa do método/versionamento de backup da ferramenta, com requisitos próprios; não é só copiar dois textos |
| Serviços/dados em uso | Uma cópia durante gravações pode ser inconsistente; bancos exigem exportação/snapshot apropriados |
| Linux nativo, permissões e metadados completos | Um backup de documentos não replica rootfs, donos, montagens e configuração de boot |
| Partições, bootloader, firmware e chaves do dispositivo | Nenhum comando desta aula lê/grava partições nem garante reconstrução dessas identidades |

Para PRoot, consulte o [tutorial e versão da ferramenta](../android/proot-distro.md), pare as atividades que precisam de consistência e faça um teste de restauração isolado. Não extraia um backup de rootfs em `/` para “voltar Debian”. Para dados pessoais Android, use [backup dedicado](../preparacao/backup.md). Antes de alterar boot, produza o [plano de recuperação do modelo](../preparacao/plano-recuperacao.md): firmware original e dados pessoais são necessidades distintas.

## Rotina pequena que você pode manter

Guarde versões com nomes/data e preserve as anteriores enquanto verifica a nova. Depois de uma edição importante, feche/salve os arquivos, crie a cópia apropriada, leve-a ao destino externo, compare e teste recuperação numa pasta nova. Documente o que foi excluído do escopo. Para um projeto real, inclua código, dados necessários e instruções de reprodução; dependências reinstaláveis podem ter tratamento diferente de conteúdo insubstituível.

Se um backup contiver informações privadas, planeje proteção e recuperação da chave pelo método adequado. Tar/gzip/ZIP comum não prometem sigilo. Git pode ajudar a versionar código, mas um repositório só no telefone continua dependente dele e credenciais não devem ser publicadas. Sincronização, versionamento e backup têm funções relacionadas, não idênticas.

Não há limpeza automática ao final. Você pode guardar o laboratório para lembrar as três versões, ou remover **pela interface**, depois de conferir que são apenas arquivos de estudo e que não escolheu seu projeto real. Não apague o backup externo para comemorar o sucesso da restauração; defina conscientemente a retenção.

## Erros comuns e validação final

| Sintoma | Como reduzir o problema |
| --- | --- |
| Arquivo “não encontrado” | Pasta, usuário, extensão, nome e ambiente; privilégio não corrige caminho |
| Destino pergunta para mesclar | Não era novo; cancele e crie área vazia |
| Hash difere após copiar | Arquivo parcial, arquivo errado ou edição/codificação no destino; preserve ambos e repita com nome novo |
| Pacote contém pastas inesperadas | Liste e confira a base de criação; não extraia sobre sistema/projeto |
| Backup só aparece no telefone | Ainda falta cópia externa; armazenamento compartilhado continua no aparelho |
| Texto abre, mas projeto real não executa | Dados íntegros não substituem ambiente/dependências e teste funcional |

Você concluiu quando consegue apontar original v2, backup v1 externo e restauração v1 separada, explicar os hashes e abrir os arquivos recuperados. Marque explicitamente quais destinos foram realmente testados. Revisão documental em **11/10/2026**, com fontes primárias ligadas aos pontos técnicos. **Hardware e dados privados Android não testados nesta elaboração.**

No notebook foram criados os dois textos originais desta aula em área temporária. Passaram: cópia por `cp -R`, criação/listagem por tar, cópia do pacote para outra pasta, comparação SHA-256, alteração somente do original, extração separada e conferência de bytes/hashes da versão 1. O original versão 2 continuou preservado. **O destino do teste foi outra pasta do mesmo notebook, não um disco independente nem telefone.** PowerShell, interfaces Windows/macOS, MTP, PRoot e restauração de aplicativos/firmware não foram executados; seus limites continuam documentais. A validação prova o laboratório de arquivos no host, sem simular um backup completo do aparelho.
