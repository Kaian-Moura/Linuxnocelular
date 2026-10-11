---
title: SSH, administração remota e túneis
sidebar_position: 3
description: Configure acesso autenticado ao telefone e separe LAN, internet, shell e compartilhamento de tela.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, materiais e dificuldade

**Dificuldade:** intermediária. **Resultado:** abrir uma shell do telefone no computador com autenticação por chave, transferir arquivos e acessar serviços privados por túnel. SSH fornece controle de terminal; não cria GNOME nem compartilha a tela por si só.

Tenha uma sessão local de recuperação, telefone e computador numa rede confiável, usuário confirmado e um IP alcançável. Em Linux nativo com tela quebrada, valide SSH antes de trocar configurações gráficas. Em Android, [Termux](../android/termux.md) precisa estar operacional e pode sofrer restrições de bateria.

Um endereço privado funciona somente numa rede com rota até ele. O telefone em casa e o notebook na faculdade não ficam conectados por conhecer o mesmo IP `192.168.x.x`. Para acesso externo, configure VPN privada com autenticação e documentação própria; não abra SSH/VNC indiscriminadamente no roteador.

## 0. Preparar o cliente do computador desde o início

Há dois programas diferentes: **cliente SSH**, no notebook, e **servidor SSH**, no telefone. Você não precisa habilitar o servidor do Windows para acessar o telefone. Um cabo USB também não cria automaticamente uma rede: no Linux nativo, USB networking depende da imagem; no Termux, usaremos o Wi-Fi autorizado. Configure os dois aparelhos na mesma rede confiável, sem isolamento entre clientes.

### Windows 10/11 compatível

Abra o menu Iniciar, procure **PowerShell** e abra uma janela comum. Execute:

```powershell
ssh -V
```

Se aparecer uma versão OpenSSH, o cliente já existe. Se o comando não for encontrado, a [documentação Microsoft](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse) permite instalar o recurso opcional **OpenSSH Client**. Pela interface, procure **Recursos opcionais**, escolha adicionar/exibir recursos, pesquise OpenSSH Client e instale **o cliente**. Os rótulos variam com a edição do Windows.

Alternativamente, em PowerShell **aberto como administrador**, consulte e instale somente esse recurso:

```powershell
Get-WindowsCapability -Online -Name OpenSSH.Client*
Add-WindowsCapability -Online -Name OpenSSH.Client~~~~0.0.1.0
```

Use a segunda linha somente se a consulta informar que o recurso não está instalado. Depois feche a janela administrativa, reabra PowerShell comum e repita `ssh -V`. Falhas do Windows Update/recurso opcional devem ser resolvidas pelo mecanismo do Windows, não por copiar DLLs de um site de terceiros.

### macOS

Abra **Aplicativos → Utilitários → Terminal** e execute `ssh -V`. macOS normalmente fornece o cliente OpenSSH. Não instale um servidor adicional nem modifique o login remoto do Mac para este tutorial. Se o cliente não existir na sua edição, consulte o suporte Apple e a instalação por um gerenciador confiável; não presuma que uma ferramenta Linux `.deb` serve para o Mac.

### Linux do notebook

Abra Terminal/Console e teste `ssh -V`. Se faltar, instale pelo gerenciador do **notebook**: Debian/Ubuntu, `sudo apt update` e `sudo apt install openssh-client`; Fedora, `sudo dnf install openssh-clients`; Alpine, consulte e instale `openssh-client-default` da release apropriada. Feche e reabra a shell se um pacote não aparecer no PATH. Instalar o cliente aqui não configura o telefone.

### Uma ficha que evita adivinhar os valores

Preencha localmente, sem publicar dados pessoais:

| Campo | Como obter | Exemplo de formato, não um valor a copiar |
|---|---|---|
| Conta do telefone | `whoami` no terminal dele | `aluno` ou conta `u0_a...` do Termux |
| Endereço alcançável | Detalhes Wi-Fi Android ou `ip -br address` no Linux | IP da interface Wi-Fi, sem `/24` |
| Porta do SSH | Configuração/escuta do daemon | 8022 Termux; frequentemente 22 no Linux |
| Fingerprint do servidor | Chave pública conferida localmente | Linha contendo `SHA256:...` |
| Caminho da chave de cliente | Criado na etapa 3 | `~/.ssh/smartphone-linux` |

Não utilize `root`, um usuário do notebook ou uma senha de outro tutorial por adivinhação. Se a conta ainda não tem senha ou chave funcional no telefone, resolva isso pela instalação que você escolheu antes de depender de SSH.

## 1. Preparar o servidor no ambiente correto

**Termux:**

```bash
pkg install openssh
whoami
ssh-keygen -A
passwd
sshd -D -e -p 8022
```

`whoami` informa o nome de conta do aplicativo. `ssh-keygen -A` cria host keys ausentes; não substitui as existentes. `passwd` configura uma senha temporária para preparar a chave. `-D -e` mantém o servidor em primeiro plano com logs visíveis; a porta 8022 é não privilegiada. Este teste pode escutar nas interfaces de rede: execute apenas em LAN controlada, sem redirecionamento do roteador, e encerre com Ctrl+C depois do preparo.

**Debian/Ubuntu nativo:** instale `openssh-server` por `sudo apt install openssh-server`. Com systemd e serviço `ssh` confirmado, `sudo systemctl enable --now ssh` inicia e habilita o daemon. **Alpine/postmarketOS com OpenRC:** `sudo apk add openssh`, `sudo rc-service sshd start` e `sudo rc-update add sshd default`. Não execute comandos de dois sistemas init nem use `systemctl` em PRoot esperando controlar o Android.

Para um iniciante em Linux nativo, execute primeiro no telefone `cat /etc/os-release` e `cat /proc/1/comm`. A leitura de `/proc/1/comm` identifica o nome do processo PID 1 sem depender das opções do `ps` BusyBox; confirme a integração da distribuição quando aparecer um launcher próprio. No Debian/Ubuntu com systemd, o fluxo completo é:

```bash
sudo apt update
sudo apt install openssh-server
sudo sshd -t
sudo systemctl enable --now ssh
systemctl status ssh --no-pager
```

`sshd -t` não imprime nada quando a sintaxe está correta. Se informar arquivo/linha com erro, não reinicie por cima dele. O status deve indicar serviço ativo; versões Ubuntu que usam ativação por socket podem exigir conferir também `systemctl status ssh.socket`. Preserve a integração fornecida pela release. No Alpine/OpenRC, após `sudo apk update` e `sudo apk add openssh`, confira `sudo rc-service sshd status`; se faltarem host keys, gere as ausentes com `sudo ssh-keygen -A`, valide `sudo sshd -t` e então use os comandos de início/habilitação acima.

No Termux, mantenha a janela de `sshd -D ...` aberta; ela está ocupada executando o servidor. Para continuar trabalhando no telefone, crie outra sessão Termux pela interface do aplicativo. Um servidor de teste não deve disputar a porta com outro `sshd` existente: `Address already in use` pede localizar o daemon anterior. Não inicie um servidor novo dentro do PRoot para contornar um SSH do Termux que já funciona.

A porta nativa costuma ser 22, mas confira configuração e escuta. Não suponha um usuário ou senha padrão para todos os ports.

## 2. Identificar endereço e verificar a identidade

No Linux nativo, `ip -br address` mostra interfaces e endereços. No Android, consulte os detalhes do Wi-Fi nas configurações; comandos netlink podem estar limitados ao aplicativo. Não publique endereço MAC, IP público e dados pessoais nos registros comunitários.

No telefone, calcule a fingerprint pública da host key. No Termux:

```bash
ssh-keygen -lf "$PREFIX/etc/ssh/ssh_host_ed25519_key.pub"
```

No Linux nativo, o caminho padrão correspondente é `/etc/ssh/ssh_host_ed25519_key.pub`; se indisponível, confira os `HostKey` configurados. A chave **pública** pode ser inspecionada; nunca compartilhe os arquivos privados sem `.pub`.

No computador, substitua `USUARIO` e `IP_DO_TELEFONE` pelos valores confirmados:

```bash
ssh -p 8022 USUARIO@IP_DO_TELEFONE
```

Use a porta real, 22 quando aplicável. Compare a fingerprint apresentada antes de aceitar. Uma mudança inesperada pede investigação; não use `StrictHostKeyChecking=no` como reparo. Pode ser reinstalação legítima, outro aparelho no mesmo IP ou ataque.

Escreva o comando com seus valores reais, **sem os nomes de marcador**. Por exemplo, depois de confirmar conta e endereço, a sintaxe é `ssh -p PORTA conta@endereco`. Ao receber a pergunta de confiança, compare a fingerprint inteira com a ficha e só então responda `yes`. A senha digitada não aparece na tela. Se entrar, execute `whoami`, `pwd` e `uname -m`: os resultados devem ser os do telefone. Escreva `exit` para voltar ao notebook; o servidor continua rodando.

Se houver firewall no telefone, crie somente a permissão LAN necessária pela ferramenta já utilizada e pelo administrador responsável. Esta página não recomenda limpar o firewall. Uma rede de faculdade pode impedir telefone e notebook de conversarem mesmo conectados ao mesmo Wi-Fi; teste em rede própria antes de culpar a autenticação.

## 3. Criar e instalar uma chave de cliente

No computador:

```bash
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
ssh-keygen -t ed25519 -f "$HOME/.ssh/smartphone-linux"
ssh-copy-id -i "$HOME/.ssh/smartphone-linux.pub" -p 8022 USUARIO@IP_DO_TELEFONE
ssh -i "$HOME/.ssh/smartphone-linux" -p 8022 -o IdentitiesOnly=yes -o PreferredAuthentications=publickey USUARIO@IP_DO_TELEFONE
```

`mkdir` cria a pasta de chaves quando ainda falta; `chmod 700` restringe o diretório à conta local. Antes de `ssh-keygen`, confira que `~/.ssh/smartphone-linux` e sua chave pública correspondente não existem. Se existirem, preserve-as e escolha outro nome em **todas** as linhas; não aceite sobrescrita. Proteja a chave privada com passphrase e use o agente da sessão quando apropriado. `ssh-copy-id -i` copia a chave pública indicada à conta remota. O último comando valida essa chave, sem escolher uma identidade antiga por acaso. Se `ssh-copy-id` não estiver instalado, use o procedimento manual do OpenSSH para `authorized_keys`, com diretório 700 e arquivo 600; não coloque a chave privada no telefone.

O bloco anterior é para shell Linux/macOS com `ssh-copy-id` disponível. Uma chave tem dois arquivos: `smartphone-linux` é **privado** e permanece no notebook; `smartphone-linux.pub` é **público** e pode ser autorizado no telefone. O pedido de passphrase protege a chave privada e não troca a senha do telefone.

### Windows ou cliente sem ssh-copy-id: instalação manual completa

No PowerShell do notebook Windows, confira primeiro:

```powershell
Test-Path "$env:USERPROFILE\.ssh\smartphone-linux"
Test-Path "$env:USERPROFILE\.ssh\smartphone-linux.pub"
```

Se ambos retornarem `False`, crie a pasta se necessário e gere a chave:

```powershell
New-Item -ItemType Directory -Force "$env:USERPROFILE\.ssh"
ssh-keygen -t ed25519 -f "$env:USERPROFILE\.ssh\smartphone-linux"
Get-Content "$env:USERPROFILE\.ssh\smartphone-linux.pub"
```

Copie **a linha pública inteira**, que começa com `ssh-ed25519`. No Linux/macOS, a mesma linha pode ser exibida com `cat "$HOME/.ssh/smartphone-linux.pub"`. Faça uma conexão por senha já verificada ao telefone e, nessa shell remota como a conta que receberá a chave:

```bash
mkdir -p "$HOME/.ssh"
chmod 700 "$HOME/.ssh"
nano "$HOME/.ssh/authorized_keys"
```

Se nano faltar, instale-o no ambiente do telefone (`pkg install nano`, `sudo apt install nano` ou `sudo apk add nano`, conforme o sistema). Preserve linhas existentes, acrescente sua nova chave pública em **uma linha**, sem aspas nem quebras inseridas manualmente, e salve por **Ctrl+O → Enter → Ctrl+X**. Uma quebra apenas visual do editor não é necessariamente uma nova linha. Então execute:

```bash
chmod 600 "$HOME/.ssh/authorized_keys"
```

Não use `sudo` para criar a pasta de chaves da conta comum. Em outra janela PowerShell, mantendo a conexão anterior aberta, teste com endereço/porta reais:

```powershell
ssh -i "$env:USERPROFILE\.ssh\smartphone-linux" -p 8022 -o IdentitiesOnly=yes -o PreferredAuthentications=publickey USUARIO@IP_DO_TELEFONE
```

Troque 8022 pela porta nativa quando aplicável. Se pedir a **passphrase da chave**, isso é esperado; se cair para senha do usuário ou negar acesso, a autenticação por chave ainda não foi comprovada. No Linux/macOS, use o último comando do bloco da etapa 3. Só avance à restrição de senha depois dessa segunda conexão funcionar.

**Mantenha uma sessão funcional aberta** enquanto testa alterações, além da recuperação local. Depois de validar a chave, pare o daemon de teste Termux com Ctrl+C e inicie:

```bash
sshd -D -e -p 8022 -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no -o PermitRootLogin=no
```

Confirme em nova conexão que a chave entra e a senha não. Para persistência, salve essas políticas na configuração do daemon após fazer backup e validar com `sshd -t`. OpenSSH usa, em geral, o primeiro valor obtido de uma opção: apenas anexar outra linha no fim pode não sobrescrever a antiga. Revise também `Include` e blocos `Match`.

### Guardar a política sem perder acesso

No Termux, o arquivo normalmente é `$PREFIX/etc/ssh/sshd_config`; no Linux nativo, `/etc/ssh/sshd_config`. Confirme a configuração realmente utilizada e preserve uma cópia com nome ainda livre antes de editar. No Termux, use `cp -p "$PREFIX/etc/ssh/sshd_config" "$HOME/sshd_config.before-mini-pc"` quando esse backup não existir, depois `nano "$PREFIX/etc/ssh/sshd_config"`. No Linux, preserve uma cópia administrativa e edite por `sudo nano /etc/ssh/sshd_config` ou ferramenta do port.

Encontre as diretivas globais aplicáveis e configure `PasswordAuthentication no`, `KbdInteractiveAuthentication no` e `PermitRootLogin no` depois de validar sua conta comum por chave. No Termux, confirme também `Port 8022`. Não coloque as linhas dentro de um bloco `Match` por engano. Consulte `sshd -T` para o resultado efetivo da configuração padrão; políticas Match precisam ser verificadas para a conexão concreta conforme o manual. Valide `sshd -t` no Termux ou `sudo sshd -t` no Linux. Se der erro, restaure a cópia antes de reiniciar.

Pare o daemon de teste e inicie-o novamente com a configuração validada. No Linux systemd, use o serviço observado; `sudo systemctl reload ssh` só se a unidade `ssh` suportar reload. Em OpenRC, `sudo rc-service sshd reload` depende da implementação do script, que deve ser consultada. Faça uma nova conexão antes de fechar a antiga. Uma regra errada não deve deixar um aparelho com tela quebrada sem todas as rotas de acesso.

## 4. Configurar um alias no cliente sem substituir seu arquivo

Para os exemplos seguintes, configure o alias `mini-pc` no **computador cliente**. Preserve `~/.ssh/config` se já existir: abra-o no editor, faça uma cópia antes de modificar e acrescente somente um bloco para um nome ainda não utilizado. Não substitua os hosts existentes. Se há um bloco `Host *`, coloque a configuração específica antes dele para evitar valores globais obtidos primeiro.

```sshconfig
Host mini-pc
    HostName IP_DO_TELEFONE
    User USUARIO_CONFIRMADO
    Port 8022
    IdentityFile ~/.ssh/smartphone-linux
    IdentitiesOnly yes
```

Substitua IP e usuário pelos valores reais. Utilize a porta observada, normalmente 8022 no Termux ou 22 no Linux nativo. O arquivo `IdentityFile` deve ser a chave **privada local** criada na etapa anterior, sem enviá-la ao telefone. Se utilizou outra chave, ajuste esse caminho. Não adicione `StrictHostKeyChecking no`.

Confira `ssh -G mini-pc` e depois `ssh mini-pc`; compare endereço, usuário, porta e caminho da chave antes de confiar no alias. O alias passa a funcionar também em SFTP, rsync e encaminhamentos, sem depender de uma chave de nome padrão. Mantenha o arquivo de configuração e chaves com permissões que não permitam escrita por outros usuários.

No Linux/macOS, abra `nano "$HOME/.ssh/config"`, acrescente o bloco sem apagar os anteriores e use o procedimento de salvar acima. Se criar o arquivo, `chmod 600 "$HOME/.ssh/config"` restringe o acesso. No Windows, abra `notepad "$env:USERPROFILE\.ssh\config"` no PowerShell: confirme no Explorador que ficou **config**, sem `.txt`. O OpenSSH Windows aceita `IdentityFile ~/.ssh/smartphone-linux` nesse arquivo. Proteja a pasta pelas permissões de sua conta do Windows, sem traduzir `chmod` para comandos ACL não revisados.

## 5. Túneis e compartilhamento de tela

Para acessar um servidor web do telefone que escuta em `127.0.0.1:8080`, no computador:

```bash
ssh -N -L 8080:127.0.0.1:8080 mini-pc
```

Abra `http://127.0.0.1:8080` **no computador**. O encaminhamento liga seu loopback ao loopback remoto, protegido pelo SSH. Mude a porta local se já estiver ocupada. Ctrl+C encerra o túnel, não o servidor remoto.

Para VNC, use a porta confirmada no [guia de desktop Android](../android/desktop.md). Em Linux nativo, descubra se o servidor compartilha a sessão física existente ou cria outra. RDP e VNC não equivalem a GNOME nativo, e uma sessão secundária pode receber teclado/mouse de outro seat. Não instale todos os servidores de tela ao mesmo tempo para tentar resolver entrada.

## Persistência, erros e recuperação

No Termux, `termux-services` oferece supervisão compatível com o aplicativo; consulte os nomes de serviços instalados e use `sv-enable sshd` apenas quando o serviço correspondente existir e o teste manual tiver sido encerrado. Termux:Boot é opcional, precisa de origem/assinatura compatível e um script revisado. Isso não impede encerramentos pelo Android.

Para preparar supervisão no Termux, instale `pkg install termux-services`, encerre o `sshd -D` de teste e reinicie a sessão Termux conforme o README da ferramenta. Confira `ls "$PREFIX/var/service"`; somente se houver `sshd`, execute `sv-enable sshd` e `sv status sshd`. O estado deve indicar execução. Teste `ssh mini-pc` de novo. Esse passo inicia com a sessão/gerenciador Termux; começar após boot Android exige a instalação compatível de Termux:Boot e um script próprio revisado, e desbloqueio/políticas Android podem continuar necessários. Não chame isso de boot de Linux nativo.

Para um arquivo de teste, no telefone `printf '%s\n' 'SSH funcionando' > "$HOME/teste-ssh.txt"` cria um texto novo. No notebook, `sftp mini-pc`, seguido no prompt por `get teste-ssh.txt` e `bye`, copia-o para a pasta local atual. Abra o arquivo e confira a frase. Use uma pasta local vazia para não substituir um arquivo existente. O [guia de arquivos](arquivos-nas.md) mostra clientes gráficos e backup.

No Linux real, valide serviço, política de firewall e rota após boot. Ative a regra LAN apropriada pela ferramenta existente; não substitua o firewall inteiro. `Connection refused` costuma indicar ausência de escuta; timeout, rota/firewall/aparelho dormindo; `Permission denied`, conta/chave; `Host key changed`, identidade diferente. Inspecione logs antes de apagar configurações.

Para rollback, restaure a cópia do arquivo, valide sintaxe e recarregue pelo mecanismo do seu sistema. Não encerre a única sessão antes de confirmar a recuperação. Antes de compartilhar logs, remova credenciais e endereços pessoais.

## Testes finais e próximos passos

Valide uma conexão por chave, transferência de um arquivo, túnel web, retorno após suspender a tela e após reiniciar. Registre separadamente o que funciona por USB, LAN e VPN. Use [servidor web](./servidor-web.md) e [arquivos](./arquivos-nas.md) sem exposição pública desnecessária.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem iniciar servidores ou acessar o telefone. [Microsoft: cliente OpenSSH](https://learn.microsoft.com/en-us/windows-server/administration/openssh/openssh_install_firstuse), [ssh](https://man.openbsd.org/ssh), [sshd_config](https://man.openbsd.org/sshd_config), [sshd e authorized_keys](https://man.openbsd.org/sshd), [ssh-keygen](https://man.openbsd.org/ssh-keygen), [pacote OpenSSH do Termux](https://github.com/termux/termux-packages/tree/master/packages/openssh), [Termux Services](https://github.com/termux/termux-services), [Termux Boot](https://github.com/termux/termux-boot). A wiki Termux apresentou bloqueio anti-automação; não foi utilizada como evidência de procedimentos não lidos. Rede, nomes de serviço, firewall e inicialização automática precisam ser confirmados no aparelho/edição instalados.
