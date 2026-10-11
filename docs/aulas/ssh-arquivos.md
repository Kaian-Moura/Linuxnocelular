---
title: Acesse o telefone e recupere um documento por SSH/SFTP
description: Um percurso local desde preparar cliente e servidor até conferir identidade, usar chaves, copiar arquivos e retirar o acesso.
sidebar_position: 20
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Nesta aula você criará um documento no telefone, acessará seu terminal pelo computador, guardará uma cópia externa e devolverá essa cópia **com outro nome**. Ao final, poderá demonstrar que os arquivos coincidem e encerrar o acesso conscientemente. SSH transporta uma sessão de terminal autenticada; SFTP transporta arquivos sobre SSH. Nenhum deles instala Linux nativo ou cria vídeo HDMI.

**Dificuldade:** iniciante com leitura atenta; configurar o servidor de uma distribuição desconhecida exige investigar sua integração. Reserve uma sessão sem pressa. Materiais: telefone controlável localmente, computador Windows/Linux/macOS, Wi-Fi doméstico ou laboratório autorizado, carregamento confiável e espaço para um documento. Os dois aparelhos precisam de uma rota entre si; estar “na internet” não basta. Esta aula não abre portas no roteador nem configura acesso vindo de outra rede.

## 1. Identifique as duas máquinas e escolha um servidor

Abra uma nota no computador com duas colunas: **telefone/servidor** e **computador/cliente**. Servidor é o programa que espera uma conexão; cliente é o programa que a inicia. Quando a conexão SSH estiver aberta, as linhas digitadas naquela janela serão executadas no telefone. Quando sair com `exit`, você retornará ao computador. Ter a janela no notebook não determina o lugar de execução.

Escolha **um** caminho de servidor:

| Estado do telefone | Percurso nesta aula |
| --- | --- |
| Android funcionando, Termux compatível | Caminho A, sem root e sem alterar boot |
| Linux nativo já instalado, com usuário/local de recuperação | Caminho B, conforme distribuição e init |
| Debian dentro de PRoot | Para esta primeira aula, execute o servidor no Termux externo; não configure serviços do Debian como se controlassem Android |
| Tela inacessível e nenhum acesso já autorizado | Resolva [o controle do aparelho](../preparacao/tela-quebrada.md) antes; o site não consegue confirmar permissões por você |

Se falta Termux, faça sua [instalação oficial guiada](../android/termux.md) e abra o aplicativo. Não limpe uma instalação existente com projetos para recomeçar a aula. Em Linux nativo, abra Terminal/Console na própria interface e consulte `whoami`, `cat /etc/os-release` e `cat /proc/1/comm`. Esses comandos identificam usuário, distribuição e processo de inicialização, respectivamente. Não escolha `root` porque apareceu em um tutorial.

**Checkpoint:** você consegue apontar onde abrir um terminal local do telefone e onde abrir um terminal do computador. Mantenha esse acesso local disponível até concluir e retirar o serviço. Se SSH já é seu único acesso ao telefone, não o reconfigure ou encerre às cegas.

## 2. Prepare o cliente do computador

### Windows

Abra Iniciar, procure **PowerShell** e abra uma janela comum. Execute `ssh -V`. Uma linha com versão OpenSSH confirma o cliente; pode aparecer no canal de erro sem representar uma falha. Se o comando não existe, abra Configurações, procure **Recursos opcionais**, escolha adicionar um recurso e instale **OpenSSH Client**. Não é necessário instalar OpenSSH Server no Windows para acessar o telefone. Os rótulos variam pela edição; use o [guia Microsoft](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse).

Feche/reabra PowerShell e repita a consulta. Depois execute `sftp -h`: uma explicação de uso confirma esse comando, ainda que a opção de ajuda encerre com código diferente de zero. Se o cliente não foi instalado, resolva o recurso opcional antes de continuar, sem baixar executáveis SSH de anúncios.

### Linux ou macOS

Abra Terminal/Console no Linux; no Mac, **Aplicativos → Utilitários → Terminal**. Consulte `ssh -V`. macOS normalmente já fornece o cliente. No computador Debian/Ubuntu que não o possui, instale com `sudo apt update` e `sudo apt install openssh-client`; no Fedora, `sudo dnf install openssh-clients`. Esses comandos administram **o computador**, não o telefone. Em outra distribuição, use o pacote correspondente documentado no [guia SSH](../projetos/ssh-remoto.md).

**Checkpoint:** cliente disponível, terminal comum reaberto, computador ligado à rede escolhida. A instalação do cliente não exige criar contas nem habilitar login remoto no notebook.

## 3. Prepare o servidor escolhido

### Caminho A — Termux no telefone Android

**Local: aplicativo Termux do telefone, fora de PRoot.** Execute uma linha por vez:

```bash
pkg update
pkg install openssh nano
whoami
ssh-keygen -A
passwd
```

Espere `pkg` terminar e confirme a instalação apresentada. `whoami` informa a conta do aplicativo; anote o resultado real. `ssh-keygen -A` cria chaves de identidade do servidor que estiverem ausentes, sem substituir as existentes. `passwd` pede uma senha para acesso ao ambiente Termux: ela não é automaticamente o PIN da tela Android. Digite uma senha própria, não publique-a e não espere caracteres visíveis durante a digitação. O [pacote oficial Termux](https://github.com/termux/termux-packages/blob/master/packages/openssh/build.sh) integra autenticação e SFTP; não compile o script de empacotamento como parte da aula.

No Android, abra **Configurações → Wi-Fi/Internet → rede conectada → detalhes** e procure endereço IP. O caminho muda por fabricante; procure a rede atual e seus detalhes. Escolha o IPv4 da conexão Wi-Fi para este percurso. Não copie gateway, MAC, endereço da rede móvel nem `/24`. Anote o IP, usuário e porta **8022**, usada nesta aula sem privilégios. A [configuração mantida pelo Termux](https://github.com/termux/termux-packages/blob/master/packages/openssh/sshd_config.patch) documenta essa adaptação de porta.

Volte ao Termux e, na linha abaixo, troque `IP_DO_TELEFONE` pelo IPv4 que anotou; as aspas permanecem:

```bash
sshd -D -e -p 8022 -o ListenAddress="IP_DO_TELEFONE"
```

O texto `IP_DO_TELEFONE` é um campo para preencher, não um nome de servidor real. Um exemplo de formato seria `192.168.1.50`, mas não copie esse número sem que seja o seu. `-D` mantém o processo em primeiro plano; `-e` deixa mensagens nessa janela; `-p` escolhe a porta; `ListenAddress` limita a escuta ao endereço escolhido. O prompt fica ocupado: isso é esperado. Deixe a janela aberta e crie **outra sessão Termux** pela gaveta lateral/ação Nova sessão para os próximos comandos locais.

Se aparece endereço indisponível, confira a digitação e o IP atual. Se aparece porta em uso, pode existir servidor anterior; não mate todos os processos para abrir outro. Use a sessão/serviço já preparado conforme seu guia, ou encerre apenas o teste que você reconhece. Não ative inicialização automática nesta aula.

### Caminho B — distribuição nativa do telefone

Se o port já entrega SSH configurado, preserve esse serviço e registre seu usuário, porta e autenticação. Alguns ports usam senha inicial específica; mude-a pelo procedimento próprio antes de manter acesso. **Não reaplique o bloco Termux a postmarketOS.** No telefone nativo com GNOME, encontre IP em Configurações → Wi-Fi → detalhes da rede; alternativamente, consulte `ip address show` e identifique a interface conectada. Para esta aula, use seu IPv4, sem o prefixo após a barra.

Se ainda não existe servidor, use somente a linha da sua distribuição. Tenha acesso local e credenciais administrativas legítimas, já fornecidas pela instalação. Os exemplos pressupõem `sudo` configurado; se a imagem usa `doas` ou outro mecanismo, consulte o guia do port em vez de habilitar root ou adivinhar senha:

```bash
# No telefone Debian/Ubuntu nativo
sudo apt update
sudo apt install openssh-server nano
sudo sshd -t
sudo systemctl start ssh
systemctl status ssh --no-pager
```

```bash
# No telefone Alpine/postmarketOS com OpenRC
sudo apk update
sudo apk add openssh nano
sudo sshd -t
sudo rc-service sshd start
sudo rc-service sshd status
```

`sshd -t` valida a configuração e costuma não imprimir nada quando está correta. Se acusa chave ausente, confira a integração da distribuição; `sudo ssh-keygen -A` pode gerar as ausentes, depois repita a validação. Se há erro de sintaxe, resolva antes de reiniciar. Não habilitamos boot automático nesses blocos. Algumas versões Ubuntu integram `ssh.socket`; preserve a integração e consulte também `systemctl status ssh.socket`, em vez de alterar porta/serviço por tentativa. [Ubuntu OpenSSH](https://ubuntu.com/server/docs/how-to/security/openssh-server/), [Alpine SSH](https://wiki.alpinelinux.org/wiki/Setting_up_a_SSH_server).

O pacote pode iniciar serviço durante a instalação; registre o estado efetivo. A porta usual é **22**, mas a configuração existente pode usar outra. Confira pelo administrador/guia e, quando disponível, `sudo sshd -T`: procure a linha `port`. O início padrão pode escutar em várias interfaces; mantenha o teste em rede controlada, sem exposição externa. Se isso não condiz com sua política de rede, configure escuta/firewall pela distribuição antes de iniciar, conforme [SSH avançado](../projetos/ssh-remoto.md). Não desative todo o firewall para fazer o teste passar.

**Checkpoint:** ficha contém usuário do telefone, IP alcançável, porta efetiva e caminho escolhido. Em uma rede pública/institucional sem autorização ou com isolamento de clientes, pare o teste LAN e use uma rede apropriada; não tente contornar sua política.

## 4. Confira a identidade do servidor antes de enviar a senha

Chave do servidor identifica **a máquina**; sua futura chave de cliente identificará **quem entra**. Leia a impressão digital da chave pública Ed25519 localmente no telefone:

```bash
# Termux, na segunda sessão local do telefone
ssh-keygen -lf "$PREFIX/etc/ssh/ssh_host_ed25519_key.pub"
```

```bash
# Linux nativo, no terminal local do telefone
ssh-keygen -lf /etc/ssh/ssh_host_ed25519_key.pub
```

Se a chave pública requer permissão administrativa no seu sistema, consulte-a com o acesso autorizado. Não imprima o arquivo sem `.pub`: é a chave privada do servidor. Anote algoritmo e `SHA256:...` da saída. Se não existir Ed25519, investigue o algoritmo/chave realmente fornecidos antes da conexão, sem gerar substituições só para eliminar um aviso.

**No computador**, preencha usuário, IP e porta usando sua ficha. Escolha o bloco do seu terminal; os valores digitados nos prompts são os seus, não exemplos publicados:

```bash
# Computador Linux/macOS: cada read aguarda você digitar o valor e Enter
printf 'Usuário do telefone: '
IFS= read -r sshPhoneUser
printf 'IPv4 do telefone: '
IFS= read -r sshPhoneIp
printf 'Porta SSH: '
IFS= read -r sshPhonePort
ssh -p "$sshPhonePort" "$sshPhoneUser@$sshPhoneIp"
```

```powershell
# Computador Windows, PowerShell
$sshPhoneUser = Read-Host 'Usuário do telefone'
$sshPhoneIp = Read-Host 'IPv4 do telefone'
$sshPhonePort = Read-Host 'Porta SSH'
ssh -p $sshPhonePort "$sshPhoneUser@$sshPhoneIp"
```

Na primeira conexão, espere pergunta de autenticidade e fingerprint. Compare **algoritmo e todos os caracteres** com a leitura local. Só responda `yes` quando coincidirem. Depois digite a senha da conta/Termux quando solicitada. Uma passphrase de chave, mais adiante, é outro segredo. Se a chave mudou numa conexão conhecida, não apague `known_hosts` nem desligue a conferência automaticamente: pode ser outro aparelho, IP reutilizado ou reinstalação; confirme fisicamente a nova identidade. [Verificação de host do OpenSSH](https://man.openbsd.org/ssh).

Já conectado, execute `whoami` e `pwd`. Compare com o terminal local do telefone. Execute `exit` e, de volta ao computador, consulte sua pasta atual. **Checkpoint:** consegue identificar a fronteira da conexão e confirmar que a autenticação chegou ao telefone esperado.

## 5. Crie o documento original no telefone

**Local: segunda sessão local do telefone, ou sessão SSH confirmada.** Confira se já existe `aula-ssh` em sua pasta pessoal. Se existir, não reutilize sobre arquivos antigos: escolha outro nome e adapte a aula, ou inspecione o projeto anterior. Para uma pasta nova:

```bash
mkdir "$HOME/aula-ssh"
nano "$HOME/aula-ssh/documento.txt"
```

No editor, escreva duas linhas suas, sem dados pessoais. Exemplo original:

```text
Meu telefone está aprendendo a ser um computador.
Este documento será copiado e recuperado com outro nome.
```

No nano, Ctrl+O grava, Enter confirma o caminho e Ctrl+X sai. No Termux, use a tecla CTRL da faixa adicional quando não houver teclado físico. Confira com `cat "$HOME/aula-ssh/documento.txt"` e `sha256sum "$HOME/aula-ssh/documento.txt"`. Anote o hash. Não há um valor único para textos editados à mão: codificação e quebra de linha podem variar.

O arquivo está na pasta privada do ambiente. Em Termux, ele não aparece automaticamente por MTP no Explorador do Windows. Não precisa conceder acesso a todo armazenamento compartilhado para usar SFTP nesta aula. **Checkpoint:** documento legível e hash registrado no telefone, sem alterar arquivos existentes.

## 6. Faça a primeira transferência por SFTP

No gerenciador do computador, crie uma pasta nova `aula-ssh-recebidos` dentro de sua pasta pessoal. No terminal **do computador**, entre nessa pasta: Linux/macOS, `cd "$HOME/aula-ssh-recebidos"`; PowerShell, `Set-Location "$env:USERPROFILE\aula-ssh-recebidos"`. As variáveis de conexão devem continuar definidas na mesma janela da etapa 4; se a fechou, preencha-as novamente.

```bash
# Computador Linux/macOS
sftp -P "$sshPhonePort" "$sshPhoneUser@$sshPhoneIp"
```

```powershell
# Computador Windows
sftp -P $sshPhonePort "$sshPhoneUser@$sshPhoneIp"
```

SFTP usa `-P` maiúsculo para porta; SSH usa `-p`. Após autenticar, aparecerá `sftp>`. **Digite nesse prompt**, sem copiar `sftp>`:

```text
lpwd
pwd
ls aula-ssh
get aula-ssh/documento.txt documento-copia.txt
bye
```

`lpwd` mostra a pasta **local do computador**; `pwd` mostra a pasta **remota do telefone**. `get` recebe um arquivo remoto e salva com o nome local escolhido; `bye` retorna ao terminal do computador. Este percurso pressupõe que SFTP iniciou na pasta pessoal, como no servidor comum configurado aqui: confira `pwd`; se a instalação usa chroot ou outra pasta, ajuste pelo caminho documentado, não adivinhe.

Abra `documento-copia.txt` pelo gerenciador do computador. Calcule seu hash: Linux `sha256sum documento-copia.txt`; Mac `shasum -a 256 documento-copia.txt`; PowerShell `Get-FileHash -Algorithm SHA256 -LiteralPath .\documento-copia.txt`. Compare com o hash do telefone. Mesmo texto visual não prova mesmos bytes; por isso há os dois testes. SFTP `get` pode sobrescrever um destino existente: use pasta/nome novos e confira antes de repetir. [Comandos do SFTP](https://man.openbsd.org/sftp).

## 7. Use uma chave de cliente, preservando o acesso anterior

**No computador**, prepare a pasta de chaves e crie uma chave exclusiva desta aula. Se o nome já existir, escolha outro; quando `ssh-keygen` perguntar por substituição, não aceite sem saber qual chave perderia.

```bash
# Computador Linux/macOS
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
ssh-keygen -t ed25519 -f "$HOME/.ssh/id_ed25519_aula" -C "aula-smartphone"
```

```powershell
# Computador Windows
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\id_ed25519_aula" -C "aula-smartphone"
```

Digite uma passphrase própria quando solicitado. Você terá arquivo privado `id_ed25519_aula` e público `id_ed25519_aula.pub`; só o **público** vai ao telefone. Confira a impressão digital com `ssh-keygen -lf` apontando ao `.pub`. Não cole a chave privada em chat, documento público ou área web servida. A passphrase não substitui a verificação da identidade do servidor. [Geração de chaves](https://man.openbsd.org/ssh-keygen).

Envie o público, mantendo a conexão por senha disponível. Confira antes que `chave-aula.pub` não exista na pasta pessoal remota; se existir, escolha um nome novo:

```bash
# Computador Linux/macOS
scp -P "$sshPhonePort" "$HOME/.ssh/id_ed25519_aula.pub" "${sshPhoneUser}@${sshPhoneIp}:chave-aula.pub"
```

```powershell
# Computador Windows
scp -P $sshPhonePort "$env:USERPROFILE\.ssh\id_ed25519_aula.pub" "${sshPhoneUser}@${sshPhoneIp}:chave-aula.pub"
```

**No telefone**, confira fingerprint de `chave-aula.pub`. Prepare `~/.ssh` com `mkdir -p "$HOME/.ssh"` e `chmod 700 "$HOME/.ssh"`. Se `authorized_keys` já existe, copie-o com um **nome de backup ainda inexistente**, preservando o original; por exemplo, depois de confirmar que o destino não existe:

```bash
cp -p "$HOME/.ssh/authorized_keys" "$HOME/.ssh/authorized_keys.antes-aula"
```

Essa linha só se aplica quando o original existe; se o backup já existe, escolha outro nome, sem sobrescrevê-lo. Abra `nano "$HOME/.ssh/authorized_keys"` e acrescente **a linha pública completa** de `chave-aula.pub`, numa linha própria. Consulte-a com `cat "$HOME/chave-aula.pub"` numa outra sessão para copiar. Não acrescente senha nem chave privada. Grave e aplique `chmod 600 "$HOME/.ssh/authorized_keys"`.

Abra uma nova conexão do computador com `ssh -i` apontando à chave privada recém-criada, `-p` e os mesmos destino/porta. Exemplo Linux/macOS: `ssh -i "$HOME/.ssh/id_ed25519_aula" -p "$sshPhonePort" "$sshPhoneUser@$sshPhoneIp"`; Windows adapta o caminho para `$env:USERPROFILE\.ssh\id_ed25519_aula`. A pergunta pela **passphrase da chave** é esperada. Se voltar à senha da conta, a chave ainda não foi aceita; reveja arquivo, conta, permissões e logs, preservando a sessão anterior.

## 8. Devolva a cópia com outro nome e verifique

**No computador, dentro de `aula-ssh-recebidos`, já fora de SSH:**

```bash
scp -i "$HOME/.ssh/id_ed25519_aula" -P "$sshPhonePort" documento-copia.txt "${sshPhoneUser}@${sshPhoneIp}:aula-ssh/documento-restaurado.txt"
```

```powershell
scp -i "$env:USERPROFILE\.ssh\id_ed25519_aula" -P $sshPhonePort .\documento-copia.txt "${sshPhoneUser}@${sshPhoneIp}:aula-ssh/documento-restaurado.txt"
```

Use somente o bloco do seu computador. Confira antes se o destino restaurado não existe; transferências comuns podem sobrescrever arquivos. No telefone, abra os dois documentos e execute `sha256sum` nos dois caminhos. Devem coincidir com a cópia externa. Você demonstrou transferência nos dois sentidos e recuperação de **um documento**, sem substituir o original. `scp` atual usa SFTP por padrão; não acrescente opções para forçar protocolo antigo apenas para contornar uma falha. [Manual scp](https://man.openbsd.org/scp).

## 9. Encerre, retome e retire acesso conscientemente

Saia das sessões do computador com `exit`/`bye`. Isso fecha o cliente, não necessariamente o servidor. No Termux, volte à janela específica de `sshd -D ...` e pressione Ctrl+C; confirme que voltou ao prompt. Uma nova tentativa deve falhar se aquele era o único servidor. No Linux nativo, pare somente um serviço que **você iniciou para a aula**, pelo mecanismo correto: `sudo rc-service sshd stop` em OpenRC; no Ubuntu, confira serviço e socket, pois ativação por `ssh.socket` pode reabrir o serviço. Não pare acesso existente do port sem alternativa local. Consulte o guia da distribuição para retirar também habilitação automática previamente existente, se esse for seu objetivo.

Para retomar, confirme IP atual, inicie o servidor pelo mesmo caminho e use a chave conhecida. Wi-Fi pode mudar de IP; isso não exige nova chave do cliente nem deve fazer você aceitar outra host key sem conferência. Android pode interromper processos por restrições de energia: uma queda não prova erro de senha. [Restrições de tarefas Android](https://developer.android.com/develop/background-work/background-tasks/bg-work-restrictions).

Se quer revogar **essa chave**, no telefone abra `authorized_keys`, identifique a linha pública exata/fingerprint e remova somente ela, com backup anterior. Não exclua o arquivo inteiro para remover uma autorização. Interrompa as sessões já abertas quando pertinente: revogar uma chave não encerra automaticamente uma sessão autenticada. A senha pode continuar permitindo login; retirar a chave não é retirar todos os métodos. Para desabilitar senha/definir acesso duradouro, siga o [guia SSH](../projetos/ssh-remoto.md), após validar outra sessão por chave e o retorno local.

## Quando uma etapa não funciona

| Sintoma | Verificação nesta aula |
| --- | --- |
| Timeout | IP atual, mesma rede/rota, isolamento de clientes, servidor ligado e firewall; não abra WAN |
| Connection refused | Porta correta e processo/serviço em execução |
| Permission denied | Conta, método, senha ou chave; não confunda passphrase com senha Android |
| Fingerprint diferente | Pare e compare localmente; pode ter outro aparelho nesse IP |
| SFTP sem subsystem | Confira pacote/configuração de SFTP da instalação, preservando o SSH funcional |
| Arquivo não encontrado | Compare `pwd` e `lpwd`, nome exato e local privado do Termux |
| Hash diferente | Confira arquivo/nome e se foi editado; receba nova cópia com outro nome, sem apagar evidências |

## Sua evidência final e o alcance desta aula

Anote caminho do servidor, versões, porta, data, fingerprints públicas, nomes de arquivo e hashes, em ficha privada. O resultado completo exige login no telefone correto, cópia externa aberta, retorno com nome novo, hashes iguais e encerramento/retomada previstos. Não publique IP/serial/senhas nem chaves privadas. Continue no [laboratório de backup/restauração](backup-restauracao.md).

Fontes primárias consultadas em **11/10/2026**, ligadas às etapas. A wiki Termux apresentou proteção de acesso nesta pesquisa; para empacotamento/configuração foram usados seus arquivos oficiais no GitHub. **Verificação documental de servidor no telefone; hardware não testado nesta elaboração.**

No notebook, em pastas temporárias com textos próprios, foram executados `get` e `put` por SFTP usando um subsystem local isolado (`sftp -D`), com igualdade dos bytes nas duas direções. Também foram testadas geração de uma chave Ed25519 de fixture e leitura de seu fingerprint público; essa chave nunca foi autorizada numa conta. Esse teste **não usou transporte SSH nem daemon no telefone** e não valida autenticação de rede, host key do seu aparelho, PowerShell/macOS, Wi-Fi ou persistência Android. Os exemplos bash também passaram por análise sintática sem execução de seus comandos no telefone.
