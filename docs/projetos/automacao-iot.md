---
title: Automação doméstica, MQTT e ESP32
sidebar_position: 7
description: Faça um laboratório MQTT local e avalie Home Assistant somente nos caminhos atualmente suportados.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado e escolha de arquitetura

**Dificuldade:** intermediária para MQTT; avançada para Home Assistant no telefone. **Resultado:** publicar e receber uma mensagem de automação local; quando houver kernel compatível, experimentar um painel Home Assistant Container. O smartphone pode ser servidor, painel, coletor ou cliente de um servidor externo — escolha um papel antes de instalar tudo.

Materiais: rede controlada, terminal, energia e armazenamento confiáveis, opcionalmente ESP32 com firmware conhecido. Não conecte relés à rede elétrica durante o primeiro teste: uma mensagem MQTT e um LED de placa já validam a cadeia de comunicação sem acionar equipamentos reais.

:::info Estado atual do Home Assistant
Os métodos de instalação Core em ambiente Python e Supervised foram descontinuados, com fim de suporte anunciado para **2025.12**. As opções atuais documentadas são Home Assistant OS e Container. Não apresente `pip install homeassistant` no PRoot como uma instalação oficialmente suportada em 2026. Home Assistant OS também não é uma imagem universal para smartphones.
:::

## Caminho A — laboratório MQTT sem containers

MQTT conecta clientes a um broker que distribui mensagens por tópicos. Um cliente não precisa ser administrador do sistema nem acessar GPIO do smartphone para publicar uma mensagem.

### A1. Instalar as ferramentas no lugar certo

Todos os três processos iniciais serão executados **no telefone**, dentro do mesmo Linux nativo ou da mesma distribuição PRoot. O notebook pode abrir três conexões SSH separadas; instalar Mosquitto no notebook cria outro broker, não o deste laboratório. Confira `cat /etc/os-release` ou, no Termux direto, `termux-info`. O download é feito pelo gerenciador do ambiente; o [site oficial Mosquitto](https://mosquitto.org/download/) explica os pacotes, mas não é necessário procurar um instalador Windows para rodar o broker no telefone.

Escolha um bloco:

```bash
# Debian/Ubuntu nativo
sudo apt update
sudo apt install mosquitto mosquitto-clients nano
```

```bash
# Alpine/postmarketOS nativo, pacotes da própria release
sudo apk update
sudo apk add mosquitto mosquitto-clients nano
```

```bash
# Termux direto no Android
pkg update
pkg install libmosquitto nano
```

No Debian/Ubuntu PRoot, entre primeiro na distribuição e use o mesmo APT como administrador simulado, retirando `sudo` se ele não existe. No Termux, o pacote consultado chama-se **`libmosquitto`**, embora forneça também o serviço Mosquitto; confirme os executáveis depois de instalar. Não confunda esse nome com os pacotes Debian. A fonte de empacotamento está em [Termux libmosquitto](https://github.com/termux/termux-packages/blob/master/packages/libmosquitto/build.sh).

```bash
command -v mosquitto
command -v mosquitto_sub
command -v mosquitto_pub
```

Cada comando deve mostrar um caminho. Se o broker nativo estiver em `/usr/sbin/mosquitto` e fora do PATH, confirme `ls -l /usr/sbin/mosquitto` e use esse caminho em lugar de `mosquitto` abaixo. Se `mosquitto_sub` faltar, revise o pacote de clientes da sua release: não é um problema de senha nem Wi-Fi. A instalação nativa pode iniciar um serviço padrão; este teste usa **outra porta** para não substituir a configuração dele.

### A2. Criar a configuração e iniciar o broker

No primeiro terminal do telefone, crie a pasta e abra o editor:

```bash
mkdir -p "$HOME/mqtt-mini-pc"
nano "$HOME/mqtt-mini-pc/mosquitto.conf"
```

Se o arquivo já existe, preserve uma cópia antes de editá-lo. Cole o conteúdo abaixo, salve com **Ctrl+O → Enter** e saia com **Ctrl+X**. Na tela do nano, `^` representa a tecla Ctrl; não é texto para digitar. Confira com `cat "$HOME/mqtt-mini-pc/mosquitto.conf"`:

```conf
listener 18883 127.0.0.1
allow_anonymous true
persistence false
```

Anonymous é permitido **somente neste listener loopback de laboratório**. Não troque o endereço por todas as interfaces mantendo essa política. Inicie:

```bash
mosquitto -c "$HOME/mqtt-mini-pc/mosquitto.conf" -v
```

### A3. Receber antes de publicar

O broker mantém o primeiro terminal ocupado e imprime logs: isso é esperado. **Abra um segundo terminal do mesmo ambiente** — outra conexão `ssh mini-pc`, ou outra sessão Termux e o mesmo login PRoot se essa é sua escolha. Não inicie outro broker. Execute:

```bash
mosquitto_sub -h 127.0.0.1 -p 18883 -t 'lab/mesa/teste' -v
```

Deixe o subscriber esperando. Abra um terceiro terminal, novamente no telefone e no mesmo ambiente, e publique:

```bash
mosquitto_pub -h 127.0.0.1 -p 18883 -t 'lab/mesa/teste' -m 'ligado'
```

**Verificação:** o subscriber imprime `lab/mesa/teste ligado` e o broker registra a conexão. Isso confirma somente comunicação local. Encerre cada processo com Ctrl+C. `persistence false` evita armazenamento permanente neste primeiro experimento.

O publisher normalmente retorna ao prompt sem imprimir a mensagem; ela aparece no subscriber. Repita o publish trocando somente `ligado` por `desligado`: a segunda linha deve chegar também. `Connection refused` pede conferir o broker ativo, endereço e porta 18883. `Address already in use` no broker pede localizar outro processo desse laboratório antes de tentar outra porta. Um subscriber iniciado **depois** da publicação não recebe uma mensagem antiga não retida: essa ordem é parte do teste.

## Do laboratório para um dispositivo IoT

Para receber ESP32 na LAN, crie um listener deliberado no IP da interface, use autenticação, limite o firewall e configure ACLs de tópicos. Gere credenciais por `mosquitto_passwd` de modo interativo, sem escrever senha em shell history. Defina `allow_anonymous false`, o `password_file` e permissões de leitura adequadas ao usuário do broker, seguindo sua versão. Para tráfego sensível ou redes não confiáveis, configure TLS com verificação de certificados.

Compile/grave a placa conforme [Arduino/ESP32](./arduino-esp32.md) ou o fluxo suportado do ESPHome. Não presuma que toolchains ESPHome funcionam em todos os hosts ARM64/Android. Você pode compilar em outro computador e deixar o smartphone como broker/painel.

Teste comandos que expiram, estados e reconexões antes de um atuador. Mensagem retida pode reaplicar um comando antigo; QoS não garante por si só que um relé ficou na posição desejada. Defina estado seguro na perda de rede ou energia, tópico de disponibilidade e autenticação distinta por dispositivo.

## Caminho B — Home Assistant Container

Pré-requisito obrigatório: [runtime OCI funcional](./containers.md) num kernel suportado, imagem para a arquitetura e Docker Engine compatível. Home Assistant documenta Engine 23 ou posterior, mas **este laboratório exige 28.0.0 ou posterior**, com bridge NAT padrão, para evitar a exposição L2 de portas loopback em versões antigas. Veja [publicação de portas Docker](https://docs.docker.com/engine/network/port-publishing/). Esse caminho não está disponível apenas porque o telefone tem root ou porque PRoot lê imagens OCI.

O exemplo a seguir limita o primeiro painel ao loopback, sem USB/Bluetooth e sem `--privileged`. É um **laboratório reduzido**, não a receita oficial com todas as integrações. Após revisar a imagem e a arquitetura:

```bash
mkdir -p "$HOME/home-assistant-mini-pc/config"
sudo docker pull ghcr.io/home-assistant/home-assistant:stable
sudo docker run -d --name mini-pc-homeassistant --stop-timeout 60 \
  -e TZ=America/Sao_Paulo \
  -p 127.0.0.1:8123:8123 \
  -v "$HOME/home-assistant-mini-pc/config:/config" \
  ghcr.io/home-assistant/home-assistant:stable
sudo docker logs --tail 100 mini-pc-homeassistant
```

Confira o digest para registrar a versão: `stable` muda com o tempo. A pasta de configuração pode conter tokens, credenciais e base de dados; não publique seu conteúdo. No notebook com o alias `mini-pc` preparado pelo [guia SSH](./ssh-remoto.md), abra:

```bash
ssh -N -o ExitOnForwardFailure=yes -L 18123:127.0.0.1:8123 mini-pc
```

Deixe esse terminal aberto e visite `http://127.0.0.1:18123` no navegador do notebook. A primeira inicialização pode levar tempo; acompanhe `sudo docker logs --tail 100 mini-pc-homeassistant` numa conexão separada em vez de recriar o container. Se aparecer a tela inicial, crie a conta administrativa local, guarde a senha privadamente e revise nome/localização/unidades no onboarding. Não envie localização precisa a este projeto. Não adicione integrações de relés durante essa prova. Use a função de backup documentada na versão e copie o arquivo para fora do telefone antes de tornar o serviço importante.

Descoberta de LAN, dongles e Bluetooth podem exigir rede host, dispositivos específicos e D-Bus; essas integrações ampliam a exposição e dependem do host. Consulte a receita oficial e avalie cada acesso necessário. Não adicione `--privileged` apenas para silenciar erros de uma integração que nem será utilizada. Container não inclui o Supervisor e as apps/add-ons de Home Assistant OS.

## Energia, disponibilidade e manutenção

Automação pode ser mais crítica que um desktop de testes. Se o telefone deixa de carregar ao conectar PD, entra em crash ou encerra processos com tela apagada, ele ainda não é um controlador confiável. Mantenha automações essenciais em infraestrutura estável e utilize o aparelho como painel/cliente enquanto essas falhas não forem resolvidas.

Limite crescimento de logs e histórico, acompanhe temperatura e faça backups fora do telefone. Prepare atualização em instância separada antes de alterar o serviço principal. A função de wake lock no Android aumenta consumo e não elimina todos os encerramentos.

## Erros, rollback e testes finais

MQTT recusado pede conferir listener/autenticação; mensagem ausente, tópico e ACL; Home Assistant inacessível, logs e bind; integração Bluetooth falhando, driver/D-Bus e permissões; toolchain ARM indisponível, host de compilação suportado. Não atribua todas as falhas a Wi-Fi sem medir cada camada.

Para encerrar Home Assistant com tempo de banco de dados, `sudo docker stop --time 60 mini-pc-homeassistant`; faça backup da configuração depois da parada limpa. Não remova o diretório para “resetar” um erro. MQTT de laboratório não alterou o perfil de produção; pare seu processo e preserve o arquivo se quiser repetir.

**Teste final:** publish/subscribe, reconexão de um cliente, conta sem privilégios desnecessários, retorno após boot, perda/reconexão da rede e restauração de backup. Só conecte um atuador depois de testar comportamento seguro nesses estados.

## Fontes e estado

Revisão documental: **11/10/2026**, sem instalar pacotes nem executar o laboratório. [Home Assistant, métodos](https://www.home-assistant.io/installation/), [fim de suporte Core/Supervised](https://www.home-assistant.io/blog/2025/05/22/deprecating-core-and-supervised-installation-methods-and-32-bit-systems/), [Container no Linux](https://www.home-assistant.io/installation/linux), [Mosquitto configuração](https://mosquitto.org/man/mosquitto-conf-5.html), [Mosquitto publish](https://mosquitto.org/man/mosquitto_pub-1.html), [ESPHome](https://esphome.io/install/getting-started/). O nome do pacote Termux foi conferido no source oficial; disponibilidade de versão e serviço continua dependente do repositório utilizado. Os laboratórios não certificam automação crítica.
