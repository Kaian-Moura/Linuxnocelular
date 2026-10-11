---
title: Automação doméstica, MQTT e ESP32
sidebar_position: 7
description: Faça um laboratório MQTT local e avalie Home Assistant somente nos caminhos atualmente suportados.
last_verified: '2026-10-10'
validation: documental
---

## Resultado e escolha de arquitetura

**Dificuldade:** intermediária para MQTT; avançada para Home Assistant no telefone. **Resultado:** publicar e receber uma mensagem de automação local; quando houver kernel compatível, experimentar um painel Home Assistant Container. O smartphone pode ser servidor, painel, coletor ou cliente de um servidor externo — escolha um papel antes de instalar tudo.

Materiais: rede controlada, terminal, energia e armazenamento confiáveis, opcionalmente ESP32 com firmware conhecido. Não conecte relés à rede elétrica durante o primeiro teste: uma mensagem MQTT e um LED de placa já validam a cadeia de comunicação sem acionar equipamentos reais.

:::info Estado atual do Home Assistant
Os métodos de instalação Core em ambiente Python e Supervised foram descontinuados, com fim de suporte anunciado para **2025.12**. As opções atuais documentadas são Home Assistant OS e Container. Não apresente `pip install homeassistant` no PRoot como uma instalação oficialmente suportada em 2026. Home Assistant OS também não é uma imagem universal para smartphones.
:::

## Caminho A — laboratório MQTT sem containers

MQTT conecta clientes a um broker que distribui mensagens por tópicos. Um cliente não precisa ser administrador do sistema nem acessar GPIO do smartphone para publicar uma mensagem.

Instale Mosquitto e clientes no ambiente utilizado: em Debian/Ubuntu, `sudo apt install mosquitto mosquitto-clients`; no administrador simulado do PRoot, use `apt` sem sudo. Em Alpine, confirme os pacotes `mosquitto` e `mosquitto-clients` da sua release; no Termux, confira `pkg search mosquitto` e o pacote disponível. A instalação nativa pode iniciar um serviço padrão; este teste usa **outra porta** para não substituir a configuração dele.

Crie uma pasta `~/mqtt-mini-pc` e um arquivo `mosquitto.conf` com:

```conf
listener 18883 127.0.0.1
allow_anonymous true
persistence false
```

Anonymous é permitido **somente neste listener loopback de laboratório**. Não troque o endereço por todas as interfaces mantendo essa política. Inicie:

```bash
mosquitto -c "$HOME/mqtt-mini-pc/mosquitto.conf" -v
```

Em outro terminal:

```bash
mosquitto_sub -h 127.0.0.1 -p 18883 -t 'lab/mesa/teste' -v
```

Em um terceiro:

```bash
mosquitto_pub -h 127.0.0.1 -p 18883 -t 'lab/mesa/teste' -m 'ligado'
```

**Verificação:** o subscriber imprime `lab/mesa/teste ligado` e o broker registra a conexão. Isso confirma somente comunicação local. Encerre cada processo com Ctrl+C. `persistence false` evita armazenamento permanente neste primeiro experimento.

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

Confira o digest para registrar a versão: `stable` muda com o tempo. A pasta de configuração pode conter tokens, credenciais e base de dados; não publique seu conteúdo. Acesse o painel local ou use túnel `-L 8123:127.0.0.1:8123` sobre o [SSH do host](./ssh-remoto.md). Crie a conta inicial, faça onboarding e salve backup pelo mecanismo disponível.

Descoberta de LAN, dongles e Bluetooth podem exigir rede host, dispositivos específicos e D-Bus; essas integrações ampliam a exposição e dependem do host. Consulte a receita oficial e avalie cada acesso necessário. Não adicione `--privileged` apenas para silenciar erros de uma integração que nem será utilizada. Container não inclui o Supervisor e as apps/add-ons de Home Assistant OS.

## Energia, disponibilidade e manutenção

Automação pode ser mais crítica que um desktop de testes. Se o telefone deixa de carregar ao conectar PD, entra em crash ou encerra processos com tela apagada, ele ainda não é um controlador confiável. Mantenha automações essenciais em infraestrutura estável e utilize o aparelho como painel/cliente enquanto essas falhas não forem resolvidas.

Limite crescimento de logs e histórico, acompanhe temperatura e faça backups fora do telefone. Prepare atualização em instância separada antes de alterar o serviço principal. A função de wake lock no Android aumenta consumo e não elimina todos os encerramentos.

## Erros, rollback e testes finais

MQTT recusado pede conferir listener/autenticação; mensagem ausente, tópico e ACL; Home Assistant inacessível, logs e bind; integração Bluetooth falhando, driver/D-Bus e permissões; toolchain ARM indisponível, host de compilação suportado. Não atribua todas as falhas a Wi-Fi sem medir cada camada.

Para encerrar Home Assistant com tempo de banco de dados, `sudo docker stop --time 60 mini-pc-homeassistant`; faça backup da configuração depois da parada limpa. Não remova o diretório para “resetar” um erro. MQTT de laboratório não alterou o perfil de produção; pare seu processo e preserve o arquivo se quiser repetir.

**Teste final:** publish/subscribe, reconexão de um cliente, conta sem privilégios desnecessários, retorno após boot, perda/reconexão da rede e restauração de backup. Só conecte um atuador depois de testar comportamento seguro nesses estados.

## Fontes e estado

Revisão documental: **10/10/2026**. [Home Assistant, métodos](https://www.home-assistant.io/installation/), [fim de suporte Core/Supervised](https://www.home-assistant.io/blog/2025/05/22/deprecating-core-and-supervised-installation-methods-and-32-bit-systems/), [Container no Linux](https://www.home-assistant.io/installation/linux), [Mosquitto configuração](https://mosquitto.org/man/mosquitto-conf-5.html), [Mosquitto publish](https://mosquitto.org/man/mosquitto_pub-1.html), [ESPHome](https://esphome.io/install/getting-started/). Os laboratórios não foram executados em cada telefone e não certificam automação crítica.
