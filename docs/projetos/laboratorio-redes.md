---
title: Laboratório de redes e observabilidade
sidebar_position: 10
description: Aprenda endereços, portas, DNS e diagnóstico de serviços usando somente sistemas autorizados.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Resultado, materiais e escopo

**Dificuldade:** intermediária. **Resultado:** descobrir em qual camada falha uma conexão ao telefone e observar um serviço próprio. Você precisará de terminal, rede local, cliente SSH e um [servidor web de teste](./servidor-web.md). Para o laboratório inicial não é necessário root, modo promíscuo nem varrer uma rede inteira.

Um endereço identifica uma interface; rota define como chegar a outro endereço; porta identifica um serviço TCP/UDP; DNS traduz nomes; firewall controla tráfego. Wi-Fi conectado não implica que um servidor está escutando, e ping funcionando não comprova autenticação SSH ou HTTP saudável.

Use somente equipamentos próprios ou com autorização de quem administra a rede. Faculdade, trabalho e redes públicas podem restringir clientes entre si. Não tente “consertar” isolamento de rede alterando regras que você não controla.

## 0. Instalar ferramentas e abrir as duas máquinas

O primeiro laboratório observa **o próprio telefone**, sem varrer a LAN. Abra um terminal local dele ou uma shell por [SSH](./ssh-remoto.md). Os comandos `ip`, `ss`, Nmap e `curl` abaixo são executados **no telefone**. O notebook usa seu cliente SSH e navegador; uma requisição feita no PowerShell sem túnel observa o notebook, não o telefone.

Escolha um bloco de instalação no ambiente do telefone:

```bash
# Debian/Ubuntu nativo
sudo apt update
sudo apt install iproute2 curl nano nmap bind9-dnsutils
```

```bash
# Alpine/postmarketOS nativo, repositórios da própria release
sudo apk update
sudo apk add iproute2 curl nano nmap bind-tools
```

```bash
# Termux direto no Android
pkg update
pkg install iproute2 curl nano nmap dnsutils
```

Num Debian PRoot, utilize o APT como administrador simulado, sem sudo quando ausente, mas lembre que a rede pertence ao host Android. A instalação de iproute2 dentro do PRoot não remove restrições netlink do Android. Os pacotes são obtidos dos repositórios do sistema; não há necessidade de instalar Nmap por um arquivo `.exe` no telefone ARM. No notebook Windows, os testes SSH utilizam PowerShell com OpenSSH Client já preparado; macOS utiliza Terminal e Linux o emulador de terminal da distribuição.

Confira:

```bash
command -v ip
command -v ss
curl --version
nmap --version
command -v dig
```

Devem aparecer caminhos/versões. `command not found` pede rever pacote e PATH; `Permission denied` **depois** de encontrar o programa pode ser política do host. Antes de explorar portas, abra o [servidor web](./servidor-web.md) num terminal separado e deixe-o ativo no loopback 8080. Esse processo em primeiro plano ocupará sua janela, por isso abra outra para diagnóstico.

Crie um registro local sem dados pessoais:

```bash
mkdir -p "$HOME/rede-mini-pc"
nano "$HOME/rede-mini-pc/observacoes.md"
```

Escreva data, ambiente (nativo/Termux/PRoot), qual processo web está ativo e resultados dos testes seguintes; salve com **Ctrl+O → Enter → Ctrl+X**. Não precisa ser script executável. Após cada alteração, abra o mesmo arquivo no nano e acrescente o resultado. IPs, nomes de rede e detalhes privados podem ser necessários na sua anotação local, mas devem ser removidos de uma contribuição pública.

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
nmap -sT -p 22,8022,8080,18883 127.0.0.1
```

As portas correspondem ao SSH Linux normalmente em 22, SSH Termux normalmente em 8022, web e MQTT de laboratório, quando iniciados. Sua configuração pode escolher outra porta. `-sT` utiliza conexões TCP normais e não exige raw sockets. Uma porta fechada pode ser correta se seu servidor está parado. A saída deve listar estado por porta: `open` comprova que aceitou a conexão TCP, não que a autenticação da aplicação passou. Esse comando não varre aparelhos alheios nem descobre se uma aplicação exige senha.

Para DNS, com os pacotes acima, execute `dig example.org +short`. Devem aparecer respostas de endereço quando a resolução funciona; os valores podem mudar, portanto este guia não fixa um IP esperado. Para observar cabeçalho/status e servidor que respondeu, use `dig example.org`. Em glibc, `getent hosts example.org` testa também o mecanismo de resolução utilizado por aplicações, que pode considerar `/etc/hosts`. Compare com a configuração de rede do host. Um nome público de teste evita expor URLs privados; falha de DNS não se corrige gravando um IP permanente em qualquer aplicação.

## 5. Captura de tráfego, quando houver necessidade

No Linux real, tcpdump exige acesso apropriado. Se faltar, Debian/Ubuntu fornece `sudo apt install tcpdump` e Alpine/postmarketOS `sudo apk add tcpdump`, quando disponível na release. Não instale/rootear Android apenas para habilitar essa etapa opcional. Confira `command -v tcpdump` e `ip -br address`; o restante exige que a interface loopback observada realmente se chame `lo`. Para observar apenas seu teste HTTP:

```bash
sudo tcpdump -i lo -nn 'tcp port 8080' -c 10
```

Em outro terminal do telefone, execute `curl --max-time 5 -I http://127.0.0.1:8080/`. Deve haver linhas de tráfego no terminal tcpdump e uma resposta HTTP no cliente. `-nn` evita resolução de nomes e `-c 10` limita o número de pacotes; se ainda não chegarem dez, Ctrl+C encerra a observação. Sem servidor ativo, pode haver apenas tentativa/rejeição, que é um resultado diagnóstico. Não capture uma interface Wi-Fi inteira para investigar loopback. Capturas podem conter dados pessoais e credenciais; guarde-as privadamente e compartilhe somente o necessário.

Android, PRoot e kernels móveis podem não oferecer capacidades de captura. Não instale módulos de outro kernel nem adquira root só para repetir esse exemplo. Logs de cliente/servidor e SSH normalmente bastam para diagnosticar a primeira conexão.

## Falhas, rollback e testes finais

Monte uma linha do tempo: endereço antes/depois, processo vivo, porta, requisição local, caminho SSH e resultado externo. Perda de vídeo não implica perda de rede; perda de SSH não prova CrashDump; IP alcançável não comprova sessão gráfica. Correlacione sintomas sem unir todas as falhas numa teoria única.

O laboratório não muda firewall nem roteador. Encerre processos de teste e túneis ao terminar; remova capturas sensíveis quando não forem mais necessárias. **Teste final:** explicar uma porta aberta, uma fechada, um serviço limitado a loopback e uma falha de autenticação, com evidência da camada correspondente. Em seguida, monitore serviços reais sem ampliar o escopo da rede.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem executar scans, captures ou instalações no telefone. [Nmap, técnicas](https://nmap.org/book/man-port-scanning-techniques.html), [condições de uso de scans](https://nmap.org/book/legal-issues.html), [iproute2](https://wiki.linuxfoundation.org/networking/iproute2), [tcpdump](https://www.tcpdump.org/manpages/tcpdump.1.html), [SSH](https://man.openbsd.org/ssh), [BIND dig](https://bind9.readthedocs.io/en/latest/manpages.html#dig-dns-lookup-utility). Visibilidade de interfaces, DNS e captura no Android continuam dependentes da versão e das permissões locais. Nenhum comando altera o roteador ou firewall.
