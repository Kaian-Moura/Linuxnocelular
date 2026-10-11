---
title: Containers — Docker e Podman com requisitos reais
sidebar_position: 6
description: Verifique namespaces, cgroups e arquitetura antes de executar serviços OCI no smartphone.
last_verified: '2026-10-10'
validation: documental
---

## Resultado e fronteira de compatibilidade

**Dificuldade:** avançada. **Resultado condicionado:** um container web ARM64 acessível somente pelo loopback num host Linux com suporte apropriado. Containers compartilham o kernel do host e usam mecanismos como namespaces e cgroups. Uma imagem não carrega automaticamente outro kernel.

**Requisitos:** Linux real com kernel e segurança compatíveis, armazenamento e rede funcionais, runtime disponível para a arquitetura, acesso administrativo quando exigido e backup. Em Android com root, esses requisitos podem continuar ausentes. Em PRoot, instalar uma imagem OCI não fornece o isolamento e as interfaces que um runtime OCI necessita.

:::danger Não trate permissões amplas como reparo
`--privileged`, acesso ao socket Docker, bind mount da raiz do host e desativação de SELinux/seccomp podem dar amplo controle sobre o telefone. Não são solução genérica para um kernel incompleto. O grupo `docker` também concede privilégios relevantes; não o use como simples grupo de aplicativos comuns.
:::

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

## 2. Instalar por um caminho da distribuição

Em **Debian/Ubuntu nativo**, o pacote distribuído pelo sistema pode ser instalado com:

```bash
sudo apt update
sudo apt install docker.io
```

Esse é o pacote da distribuição, não a instalação Docker CE do repositório Docker. Se escolher CE, siga os requisitos e repositórios oficiais para a release e remova conflitos conforme aquela documentação; não misture `docker.io`, Docker CE e versões de containerd por tentativa.

Com systemd e unidade `docker` confirmada:

```bash
sudo systemctl enable --now docker
sudo docker info
```

Em **Alpine/postmarketOS com OpenRC** e pacote da sua release:

```bash
sudo apk add docker
sudo rc-service docker start
sudo rc-update add docker default
sudo docker info
```

Confira `community` da release correta quando necessário. Não inicie o daemon num PRoot se ele não pode receber os recursos do kernel. Se `docker info` falhar, leia o log do serviço e identifique cgroups, storage, namespace ou rede que falhou antes de baixar mais imagens.

Podman pode operar sem daemon e em modo rootless, mas isso não dispensa os requisitos de kernel. Instale pelo gerenciador do host, confira `podman info --debug`, mapeamentos em `/etc/subuid` e `/etc/subgid` quando necessários e a documentação do backend utilizado. Não converta a senha root em promessa de suporte rootless.

## 3. Executar um teste sem dados importantes

Somente após `docker info` apresentar um estado funcional, confirme `sudo docker version`. Este laboratório exige **Docker Engine 28.0.0 ou posterior** com rede bridge padrão em modo NAT: versões anteriores podem expor portas publicadas no loopback a outros hosts do mesmo segmento L2. Não use a promessa de isolamento local em versões antigas nem em redes com roteamento direto configurado. Consulte [publicação de portas](https://docs.docker.com/engine/network/port-publishing/) antes de alterar redes. Com essas condições:

```bash
sudo docker pull nginx:stable-alpine
sudo docker image inspect nginx:stable-alpine --format '{{.Architecture}} {{.Os}} {{index .RepoDigests 0}}'
sudo docker run --rm --name mini-pc-web-teste -p 127.0.0.1:8080:80 nginx:stable-alpine
```

Confira a arquitetura selecionada pelo registry; em ARM64, ela deve corresponder ao host. A tag `stable-alpine` recebe atualizações: registre o digest e use-o para reprodução estrita. A escuta publicada fica somente em 127.0.0.1. O container pode ter seu usuário interno administrador; isso é diferente de rootless no host, e o exemplo não concede `--privileged`.

Em outro terminal, `curl -I http://127.0.0.1:8080/` deve retornar HTTP 200. Para testar do computador, use [túnel SSH](./ssh-remoto.md). Ctrl+C encerra esse teste em primeiro plano; `--rm` remove somente o container de teste, não o cache da imagem.

## 4. Dados persistentes, versões e atualização

Crie uma pasta nova para arquivos de uma aplicação e monte somente ela; para conteúdo estático, use um bind mount `:ro`. Bancos de dados precisam de volume/diretório de escrita e backup consistente. Não monte `$HOME` inteiro, `/dev` inteiro nem o socket Docker dentro de um serviço web sem necessidade documentada.

Uma aplicação permanente deve ter nome, imagem/digest, diretórios, portas, limites, política de reinício e mecanismo de parada registrados em um arquivo de configuração, como Compose quando disponível. Atualize primeiro numa instância de teste, faça backup, então substitua o container mantendo os dados. Um snapshot de volume enquanto um banco escreve pode ser inconsistente.

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

Valide HTTP, arquitetura, escopo da porta, logs, parada limpa, restauração de dados e reinício do host. Documente se o isolamento de namespaces/seccomp está completo. Sem esses testes, a classificação é **experimental**, mesmo que um container isolado tenha iniciado.

## Fontes e verificação

Revisão documental: **10/10/2026**. [Docker Engine, plataformas](https://docs.docker.com/engine/install/), [Docker Debian](https://docs.docker.com/engine/install/debian/), [segurança do daemon](https://docs.docker.com/engine/security/), [Podman](https://docs.podman.io/en/latest/markdown/podman.1.html), [cgroup v2 no kernel](https://docs.kernel.org/admin-guide/cgroup-v2.html), [namespaces](https://man7.org/linux/man-pages/man7/namespaces.7.html). A wiki Alpine não pôde ser lida pela ferramenta nesta revisão; confira também documentação/pacote local antes de iniciar o serviço.
