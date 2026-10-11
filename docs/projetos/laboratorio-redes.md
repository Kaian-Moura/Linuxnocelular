---
title: Laboratório de redes e observabilidade
sidebar_position: 10
description: Aprenda endereços, portas, DNS e diagnóstico de serviços usando somente sistemas autorizados.
last_verified: '2026-10-10'
validation: documental
---

## Resultado, materiais e escopo

**Dificuldade:** intermediária. **Resultado:** descobrir em qual camada falha uma conexão ao telefone e observar um serviço próprio. Você precisará de terminal, rede local, cliente SSH e um [servidor web de teste](./servidor-web.md). Para o laboratório inicial não é necessário root, modo promíscuo nem varrer uma rede inteira.

Um endereço identifica uma interface; rota define como chegar a outro endereço; porta identifica um serviço TCP/UDP; DNS traduz nomes; firewall controla tráfego. Wi-Fi conectado não implica que um servidor está escutando, e ping funcionando não comprova autenticação SSH ou HTTP saudável.

Use somente equipamentos próprios ou com autorização de quem administra a rede. Faculdade, trabalho e redes públicas podem restringir clientes entre si. Não tente “consertar” isolamento de rede alterando regras que você não controla.

## 1. Registrar interfaces e rotas

No Linux nativo:

```bash
ip -br address
ip route
```

Identifique a interface Wi-Fi, endereço, prefixo de rede e rota default. Não publique essas informações completas ao abrir uma issue. Um IP USB e um IP Wi-Fi são caminhos diferentes: o telefone pode responder em um e não no outro.

No Android, acesso netlink por Termux pode ser limitado. Se aparecer `Permission denied`, consulte os detalhes de rede na interface Android ou ADB autorizado; não conclua que a interface não existe. A informação válida deve vir do host Android, não de uma interface fictícia dentro do PRoot.

## 2. Testar a aplicação local antes da rede

Com o servidor do telefone no loopback:

```bash
curl --max-time 5 -I http://127.0.0.1:8080/
```

HTTP 200 indica que o serviço respondeu a essa requisição. `Connection refused` aponta para porta sem escuta ou rejeição; timeout pode indicar processo preso ou outra condição; HTTP 404 indica rota/conteúdo, não falha física de Wi-Fi. Não use ping como substituto desse teste.

No Linux nativo, `ss -ltn` lista sockets TCP em escuta. `ss -ltnp` acrescenta processos quando o usuário tem autorização. No Android a visibilidade pode ser limitada; combine logs do programa e requisições locais em vez de alterar segurança do sistema.

## 3. Diferenciar loopback, LAN e túnel

`127.0.0.1` sempre refere-se à máquina onde o cliente está sendo executado. Abrir esse endereço no notebook não acessa diretamente o telefone. Um túnel [SSH](./ssh-remoto.md) pode fazer o serviço remoto aparecer nesse endereço local, mas depende de uma conexão SSH ativa.

Se o web server escuta somente no loopback, falha ao abrir `http://IP_DO_TELEFONE:8080` de outro equipamento é **comportamento esperado**. Prefira túnel para o laboratório. Para exposição LAN deliberada, confirme bind da interface, regra de firewall e autorização dos clientes; não faça a mudança apenas para melhorar um teste de ping.

De um computador autorizado, com o alias de cliente `mini-pc` configurado conforme o [guia SSH](./ssh-remoto.md), teste o próprio servidor:

```bash
ssh -vv mini-pc
```

Os logs detalhados separam resolução, conexão TCP, negociação e autenticação. Podem revelar endereços, nomes e caminhos de chaves: faça revisão antes de compartilhar. Uma falha de host key pede verificação de identidade, não desativação da proteção.

## 4. Portas e DNS num laboratório restrito

Quando Nmap estiver disponível pelo repositório do seu ambiente, um teste de conexões TCP ao **próprio telefone** é:

```bash
nmap -sT -p 8022,8080,18883 127.0.0.1
```

As portas correspondem aos laboratórios SSH, web e MQTT, quando iniciados. `-sT` utiliza conexões TCP normais e não exige raw sockets. Uma porta fechada pode ser correta se seu servidor está parado. Esse comando não varre aparelhos alheios nem descobre se uma aplicação exige senha.

Para DNS, utilize a ferramenta da sua distribuição, como `getent hosts example.org` em glibc ou cliente DNS instalado e documentado. Compare resolução com a configuração de rede do host. A escolha de um domínio de teste sem dados sensíveis evita expor URLs privados; falha de DNS não se corrige gravando um IP permanente em qualquer aplicação.

## 5. Captura de tráfego, quando houver necessidade

No Linux real, tcpdump exige acesso apropriado. Para observar apenas seu teste HTTP loopback, após confirmar que a interface é `lo`:

```bash
sudo tcpdump -i lo -nn 'tcp port 8080' -c 10
```

Em outro terminal, gere uma requisição HTTP local. `-nn` evita resolução de nomes e `-c 10` limita o número de pacotes. Não capture uma interface Wi-Fi inteira para investigar um serviço loopback. Capturas podem conter dados pessoais e credenciais; guarde-as de maneira privada e compartilhe somente o necessário.

Android, PRoot e kernels móveis podem não oferecer capacidades de captura. Não instale módulos de outro kernel nem adquira root só para repetir esse exemplo. Logs de cliente/servidor e SSH normalmente bastam para diagnosticar a primeira conexão.

## Falhas, rollback e testes finais

Monte uma linha do tempo: endereço antes/depois, processo vivo, porta, requisição local, caminho SSH e resultado externo. Perda de vídeo não implica perda de rede; perda de SSH não prova CrashDump; IP alcançável não comprova sessão gráfica. Correlacione sintomas sem unir todas as falhas numa teoria única.

O laboratório não muda firewall nem roteador. Encerre processos de teste e túneis ao terminar; remova capturas sensíveis quando não forem mais necessárias. **Teste final:** explicar uma porta aberta, uma fechada, um serviço limitado a loopback e uma falha de autenticação, com evidência da camada correspondente. Em seguida, monitore serviços reais sem ampliar o escopo da rede.

## Fontes e verificação

Revisão documental: **10/10/2026**. [Nmap, técnicas](https://nmap.org/book/man-port-scanning-techniques.html), [condições de uso de scans](https://nmap.org/book/legal-issues.html), [iproute2](https://wiki.linuxfoundation.org/networking/iproute2), [tcpdump](https://www.tcpdump.org/manpages/tcpdump.1.html), [SSH](https://man.openbsd.org/ssh). Visibilidade de interfaces e captura no Android continuam dependentes da versão e das permissões locais.
