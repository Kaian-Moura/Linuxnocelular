---
title: Containers — Docker e Podman com requisitos reais
sidebar_position: 6
description: Verifique namespaces, cgroups e arquitetura antes de executar serviços OCI no smartphone.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado e fronteira de compatibilidade

**Dificuldade:** avançada. **Resultado condicionado:** um container web ARM64 acessível somente pelo loopback num host Linux com suporte apropriado. Containers compartilham o kernel do host e usam mecanismos como namespaces e cgroups. Uma imagem não carrega automaticamente outro kernel.

**Requisitos:** Linux real com kernel e segurança compatíveis, armazenamento e rede funcionais, runtime disponível para a arquitetura, acesso administrativo quando exigido e backup. Em Android com root, esses requisitos podem continuar ausentes. Em PRoot, instalar uma imagem OCI não fornece o isolamento e as interfaces que um runtime OCI necessita.

:::danger Não trate permissões amplas como reparo
`--privileged`, acesso ao socket Docker, bind mount da raiz do host e desativação de SELinux/seccomp podem dar amplo controle sobre o telefone. Não são solução genérica para um kernel incompleto. O grupo `docker` também concede privilégios relevantes; não o use como simples grupo de aplicativos comuns.
:::

## 0. Entender o que será instalado e onde

O **host** é o Linux do telefone; **imagem** é o pacote de arquivos de uma aplicação; **container** é uma instância dessa imagem. No Docker, o programa `docker` é um cliente que conversa com um serviço privilegiado, o **daemon**. Instalar o cliente sem um daemon funcional não prepara o telefone para hospedar containers.

Este laboratório começa em um terminal **do Linux nativo do telefone**, aberto pelo desktop ou pela conexão de [SSH](./ssh-remoto.md). Não o execute no PowerShell do notebook esperando instalar no telefone. Confira:

```bash
cat /etc/os-release
uname -m
cat /proc/1/comm
id
```

Guarde nome e versão da distribuição, arquitetura e init. `aarch64` é a designação de ARM64 no kernel; Debian usa `arm64` nos pacotes. `systemd` e OpenRC possuem comandos diferentes para serviços. Se o terminal for um Debian aberto por `proot-distro`, a distribuição dentro dele não controla o kernel Android: interrompa esta trilha e prefira [serviço web sem containers](./servidor-web.md).

Não é necessário instalar Docker no notebook para acessar a aplicação pelo navegador e SSH. Para **aprender containers separadamente no notebook**, a origem do Docker Desktop é [Docker Get Docker](https://docs.docker.com/get-started/get-docker/): escolha Windows ou macOS e a arquitetura da máquina, leia os requisitos apresentados, execute o instalador, abra Docker Desktop e espere o mecanismo iniciar. No Windows, os requisitos do backend WSL 2 precisam ser atendidos; no macOS, escolha Apple Silicon ou Intel corretamente. Esse Docker roda no notebook, com seu próprio ambiente de execução; não comprova suporte no telefone.

Se ainda não sabe criar uma pasta, editar com `nano` ou ler uma mensagem de erro, faça a [primeira aula de terminal](../comece-aqui/terminal-primeiros-passos.md). Nas etapas abaixo, `sudo` é utilizado em um sistema onde ele já funciona; se a sua distribuição usa `doas`, siga a política administrativa dela, sem instalar ou configurar acesso irrestrito por tentativa.

## 1. Levantar evidências do kernel e do host

No Linux real:

```bash
uname -a
cat /proc/self/cgroup
ls -ld /sys/fs/cgroup
ls -l /proc/self/ns
cat /proc/filesystems
```

Esses comandos registram kernel, hierarquia de cgroups, namespaces visíveis e filesystems. A presença de diretórios sozinha não prova que você pode criar namespaces ou aplicar limites. Se existe `/proc/config.gz`, examine a configuração com `zcat /proc/config.gz`; caso contrário, consulte o arquivo de configuração do pacote kernel ou seu source exato.

Procure famílias `CONFIG_NAMESPACES`, `CONFIG_UTS_NS`, `CONFIG_IPC_NS`, `CONFIG_PID_NS`, `CONFIG_NET_NS`, `CONFIG_CGROUPS`, controles de memória/processos, seccomp e suporte de rede/overlay exigido pelo runtime. Rootless acrescenta `CONFIG_USER_NS`, mapeamento de IDs e um backend de rede/storage apropriado. Os nomes e dependências completos variam por versão; use também as verificações oficiais do runtime.

Quando `unshare` estiver disponível, um teste de user namespace como usuário comum é:

```bash
unshare --user --map-root-user true
```

Falha pode indicar kernel, sysctl ou política de segurança; não permite concluir qual sem logs. Sucesso apenas valida esse mecanismo, não Docker inteiro. Não altere sysctls globais antes de entender por que a distribuição bloqueia a operação.

Para obter as ferramentas de leitura e o navegador de teste, escolha **somente** seu gerenciador:

```bash
# Debian/Ubuntu nativo
sudo apt update
sudo apt install util-linux curl nano ca-certificates
```

```bash
# Alpine/postmarketOS nativo
sudo apk add util-linux curl nano ca-certificates
```

`unshare` pertence à família util-linux; o empacotamento pode dividi-la. Se `command -v unshare` continuar sem saída, consulte `apk search '*unshare*'` e a descrição do pacote da sua release, em vez de baixar binários x86 para ARM. `curl` verifica a resposta HTTP; `nano` permite criar o conteúdo de teste. Não publique um dump completo do sistema sem revisar nomes e dados pessoais.

## 2. Instalar por um caminho da distribuição

Em **Debian/Ubuntu nativo**, o pacote distribuído pelo sistema pode ser instalado com:

```bash
sudo apt update
sudo apt install docker.io
```

Esse é o pacote da distribuição, não a instalação Docker CE do repositório Docker. A versão oferecida pode não atender à condição de segurança do laboratório abaixo. Confira `apt policy docker.io` antes de instalar e a versão do **Server** em `sudo docker version` depois. Não misture `docker.io`, Docker CE e versões de containerd por tentativa.

### Alternativa completa: Docker CE em Debian 13 ARM64 novo

Este bloco é para **Debian 13/trixie nativo, ARM64, com systemd e sem runtime/containerd anterior**. Confira `cat /etc/os-release`, `dpkg --print-architecture` e:

```bash
dpkg-query -W docker.io docker-compose docker-doc docker-buildx podman-docker containerd runc
ls -l /etc/apt/sources.list.d/docker.sources /etc/apt/keyrings/docker.asc
```

Mensagens de pacote/arquivo ausente são esperadas numa instalação nova. Se algum existir, pare: faça inventário dos containers, dados e serviços antes de uma migração. Os passos não incluem remoção automática de conflitos. Para Debian 12, Ubuntu ou derivadas, use o procedimento da release exata; não escreva `trixie` num sistema diferente. A fonte oficial confirma Debian 12/13 e ARM64, mas isso não certifica o kernel do smartphone. [Docker no Debian](https://docs.docker.com/engine/install/debian/).

Na instalação nova, configure a chave e a fonte de pacotes:

```bash
sudo apt update
sudo apt install ca-certificates curl nano
sudo install -m 0755 -d /etc/apt/keyrings
sudo curl -fsSL https://download.docker.com/linux/debian/gpg -o /etc/apt/keyrings/docker.asc
sudo chmod a+r /etc/apt/keyrings/docker.asc
sudo nano /etc/apt/sources.list.d/docker.sources
```

Cole **este conteúdo**, salve com Ctrl+O, Enter, e saia com Ctrl+X:

```text
Types: deb
URIs: https://download.docker.com/linux/debian
Suites: trixie
Components: stable
Architectures: arm64
Signed-By: /etc/apt/keyrings/docker.asc
```

Então atualize o índice, confira a origem e instale:

```bash
sudo apt update
apt policy docker-ce
sudo apt install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

O candidato deve vir de `download.docker.com/linux/debian` para `trixie/stable`, sem erro de assinatura. `curl: (22)`, certificado inválido ou erro de chave no APT são motivos para verificar URL, relógio e rede, não para desativar a validação. A instalação baixa pacotes compatíveis; não executa um script remoto por `curl | sh`.

Com systemd e unidade `docker` confirmada:

```bash
sudo systemctl enable --now docker
sudo systemctl status docker --no-pager
sudo docker info
```

Em **Alpine/postmarketOS com OpenRC** e pacote da sua release:

```bash
sudo apk add docker
ls -l /etc/init.d/docker
sudo rc-service docker start
sudo rc-update add docker default
sudo docker info
```

Confira `community` da release correta quando necessário, em [repositórios e pacotes](../fundamentos/terminal-pacotes.md). Dependendo da release, o script OpenRC pertence a `docker-openrc`; se `/etc/init.d/docker` não existir, consulte `apk info -L docker` e `apk search docker-openrc`, instale o subpacote **da mesma release** e confira o arquivo novamente. Não adicione repositórios Debian ao Alpine. Não inicie o daemon num PRoot se ele não pode receber os recursos do kernel.

`docker info` deve apresentar seção de servidor, versão, storage driver e dados do host. Erro `Cannot connect to the Docker daemon` pede verificação do serviço, não uso de `chmod 666 /var/run/docker.sock`. Em systemd, leia `sudo journalctl -b -u docker --no-pager -n 100`. Em OpenRC, confira `rc-service docker status` e o log configurado em `/etc/conf.d/docker` ou syslog da distribuição. Identifique cgroups, storage, namespace ou rede que falhou antes de baixar mais imagens.

O exemplo mantém `sudo docker`. Adicionar um usuário ao grupo `docker` concede controle relevante do host, conforme [pós-instalação do Docker](https://docs.docker.com/engine/install/linux-postinstall/). Uma senha root não cria controles ausentes no kernel.

### Alternativa Podman: avaliação rootless no Debian

Podman não exige um daemon central. **Rootless** significa executar sem privilégios administrativos no host, utilizando namespaces e mapeamentos de IDs; isso acrescenta requisitos. Em Debian nativo, com pacote disponível e usuário comum real:

```bash
sudo apt update
sudo apt install podman uidmap passt fuse-overlayfs
podman --version
podman info --debug
cat /etc/subuid
cat /etc/subgid
```

`uidmap` fornece ferramentas de mapeamento; `passt` inclui o backend de rede `pasta`, usado por versões atuais; `fuse-overlayfs` é uma opção de storage. A versão da distribuição decide o backend efetivo: leia a saída de `podman info`, sem forçar configurações de outra versão. O usuário deve possuir intervalos válidos, sem sobreposição, em ambos os arquivos quando exigidos. Não cole um intervalo arbitrário de outro computador. Se faltarem ou houver erro de user namespace, este guia **não considera rootless preparado**; trate o provisionamento de IDs com o administrador e a [documentação Podman](https://docs.podman.io/en/latest/markdown/podman.1.html).

Como prova mínima, somente depois de `podman info` funcionar, `podman run --rm docker.io/library/hello-world` baixa a imagem e deve imprimir a mensagem do programa, encerrando em seguida. Não transforme isso em certificação de rede, limitação de memória ou produção. Os comandos Docker seguintes são a trilha principal; não execute os dois runtimes em paralelo para reparar um ao outro.

## 3. Executar um teste sem dados importantes

Somente após `docker info` apresentar um estado funcional, confirme `sudo docker version`. Este laboratório exige **Docker Engine 28.0.0 ou posterior** com rede bridge padrão em modo NAT: versões anteriores podem expor portas publicadas no loopback a outros hosts do mesmo segmento L2. Não use a promessa de isolamento local em versões antigas nem em redes com roteamento direto configurado. Consulte [publicação de portas](https://docs.docker.com/engine/network/port-publishing/) antes de alterar redes. Com essas condições:

```bash
sudo docker pull nginx:stable-alpine
sudo docker image inspect nginx:stable-alpine --format '{{.Architecture}} {{.Os}} {{index .RepoDigests 0}}'
sudo docker run --rm --name mini-pc-web-teste -p 127.0.0.1:8080:80 nginx:stable-alpine
```

Confira a arquitetura selecionada pelo registry; em ARM64, ela deve corresponder ao host. A tag `stable-alpine` recebe atualizações: registre o digest e use-o para reprodução estrita. A escuta publicada fica somente em 127.0.0.1. O container pode ter seu usuário interno administrador; isso é diferente de rootless no host, e o exemplo não concede `--privileged`.

O último comando mantém o terminal ocupado e imprime logs. Isso é normal: não digite `curl` nele. Abra outro terminal ou outra conexão SSH ao **telefone** e execute:

```bash
curl -I http://127.0.0.1:8080/
sudo docker ps --filter name=mini-pc-web-teste
```

A primeira saída deve conter HTTP 200; a segunda mostra o nome do container e a publicação `127.0.0.1:8080->80/tcp`. Para ver no notebook, use o alias `mini-pc` configurado no [guia SSH](./ssh-remoto.md), em um terminal **do notebook**:

```bash
ssh -N -o ExitOnForwardFailure=yes -L 18080:127.0.0.1:8080 mini-pc
```

Deixe esse terminal aberto e visite `http://127.0.0.1:18080` no navegador do notebook. Deve aparecer a página de boas-vindas do Nginx. A ausência de texto no túnel é normal; `Address already in use` pede escolher outra porta local, por exemplo 18081, mudando também a URL. O túnel não precisa de Docker Desktop.

Ctrl+C no terminal do `docker run` encerra o teste; `--rm` remove somente esse container, não o cache da imagem. Ctrl+C no terminal SSH fecha somente o túnel. Confira `sudo docker ps -a --filter name=mini-pc-web-teste`: esse teste não deve permanecer ativo.

## 4. Dados persistentes, versões e atualização

Crie uma pasta nova para arquivos de uma aplicação e monte somente ela; para conteúdo estático, use um bind mount `:ro`. Bancos de dados precisam de volume/diretório de escrita e backup consistente. Não monte `$HOME` inteiro, `/dev` inteiro nem o socket Docker dentro de um serviço web sem necessidade documentada.

Uma aplicação permanente deve ter nome, imagem/digest, diretórios, portas, limites, política de reinício e mecanismo de parada registrados em um arquivo de configuração, como Compose quando disponível. Atualize primeiro numa instância de teste, faça backup, então substitua o container mantendo os dados. Um snapshot de volume enquanto um banco escreve pode ser inconsistente.

### Criar uma página própria e mantê-la após reiniciar

Depois de encerrar o teste anterior, no telefone, crie uma pasta **nova**, sem informações privadas:

```bash
mkdir -p ~/containers-mini-pc/site
cd ~/containers-mini-pc/site
nano index.html
```

Cole, salve com Ctrl+O, Enter, e saia com Ctrl+X:

```html
<!doctype html>
<html lang="pt-BR">
  <meta charset="utf-8">
  <title>Meu mini PC</title>
  <h1>Meu telefone está servindo esta página.</h1>
</html>
```

Confira `cat index.html`. Inicie um container com nome diferente, diretório de conteúdo somente leitura e política de reinício:

```bash
sudo docker run -d --name mini-pc-site --restart unless-stopped \
  -p 127.0.0.1:8080:80 \
  --mount "type=bind,src=$HOME/containers-mini-pc/site,dst=/usr/share/nginx/html,readonly" \
  nginx:stable-alpine
sudo docker logs --tail 30 mini-pc-site
curl http://127.0.0.1:8080/
```

`-d` executa em segundo plano; a resposta inicial é um identificador longo. A política atua quando o daemon volta, mas respeita uma parada manual. A aplicação precisa também do serviço Docker habilitado no init. Edite `index.html` com `nano` e recarregue o navegador pelo túnel: o conteúdo deve mudar sem recriar a imagem. Isso mostra **persistência do arquivo no host**, não um backup.

Para reprodução estrita, substitua a tag mutável pelo digest completo obtido na inspeção, usando o formato `nginx@sha256:…`; não copie reticências como se fossem um hash. Registre versão do daemon, imagem e diretório. Limites `--memory`/`--cpus` exigem controladores funcionais: não declare o host otimizado sem testar que os limites são efetivamente aplicados.

Se a porta 8080 estiver ocupada, consulte `sudo docker ps` e o serviço web anterior. Pare **apenas** o serviço do seu laboratório ou escolha outro número no bind e no túnel. Erro de nome existente pede `sudo docker ps -a --filter name=mini-pc-site`; não crie uma sequência de containers esquecidos. Detalhes dos flags e políticas estão em [docker run](https://docs.docker.com/reference/cli/docker/container/run/) e [reinício de containers](https://docs.docker.com/engine/containers/start-containers-automatically/).

## Erros, limites e alternativas

| Sintoma | Camada provável | Verificação |
| --- | --- | --- |
| `operation not permitted` ao criar namespace | Kernel ou política | Configuração, sysctls e logs de segurança |
| Falta cgroup/controller | Kernel, montagem ou delegação | `docker info`, `/sys/fs/cgroup` e init |
| Erro overlay | Filesystem/driver | Storage driver e filesystem real |
| `exec format error` | Arquitetura da imagem | Manifesto e inspeção da imagem |
| Porta inacessível | Bind, firewall ou rede runtime | Teste local antes de externo |
| Desktop fica sem RAM | Limites/carga | Aplicações ativas e controlador de memória |

Não desative o firewall inteiro: runtimes podem adicionar suas próprias regras e a publicação de portas altera a exposição. No Android, opções do firmware/kernel não suportadas podem tornar essa tarefa um trabalho de porting. Alternativas são executar a aplicação diretamente no Termux/PRoot quando viável ou hospedar os containers em outro Linux, administrando-o por SSH.

## Rollback e testes finais

Pare apenas os containers criados para o projeto, copie os volumes com consistência e desabilite o serviço somente se não hospedar outras aplicações. Evite `docker system prune --volumes`: ele pode apagar dados de projetos não relacionados. A remoção do runtime não equivale a backup dos volumes.

Para desmontar **somente este laboratório**, confira o nome e use:

```bash
sudo docker stop mini-pc-site
sudo docker rm mini-pc-site
ls -l ~/containers-mini-pc/site/index.html
```

O HTML continua no diretório do usuário. Não apague `/var/lib/docker` nem volumes para “limpar” erros. Se instalou o repositório CE, seus dois arquivos de APT devem ser registrados no inventário; não os apague enquanto pacotes dele ainda forem usados. Uma migração de runtime precisa de plano próprio.

Valide HTTP, arquitetura, escopo da porta, logs, parada limpa, restauração de dados e reinício do host. Documente se o isolamento de namespaces/seccomp está completo. Sem esses testes, a classificação é **experimental**, mesmo que um container isolado tenha iniciado.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem executar os comandos nem testar containers no telefone. [Docker Engine, plataformas](https://docs.docker.com/engine/install/), [Docker Debian](https://docs.docker.com/engine/install/debian/), [Docker Ubuntu — procedimento separado](https://docs.docker.com/engine/install/ubuntu/), [segurança do daemon](https://docs.docker.com/engine/security/), [instalação Podman](https://podman.io/docs/installation), [cgroup v2 no kernel](https://docs.kernel.org/admin-guide/cgroup-v2.html), [namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html). A wiki Alpine não pôde ser lida pela ferramenta nesta revisão; confirme também arquivos e serviços do pacote local. Suporte ARM64 do runtime não é prova de suporte no kernel do aparelho.
