---
title: Servidor web local no smartphone
sidebar_position: 4
description: Publique uma página privada, teste por túnel e configure Nginx sem privilégios para servir arquivos estáticos.
last_verified: '2026-10-10'
validation: documental
---

## Visão geral, materiais e riscos

**Dificuldade:** inicial para teste; intermediária para serviço persistente. **Resultado:** página estática servida pelo telefone, acessível localmente e por túnel SSH. Não é uma receita pronta de hospedagem pública. Um serviço doméstico depende de energia, temperatura, atualizações, backup e conectividade, não apenas de conseguir abrir uma URL.

Você precisará de Python, editor, terminal, uma pasta exclusiva e [SSH validado](./ssh-remoto.md) para testar do computador. Termux/PRoot podem hospedar aplicações simples, mas o Android pode encerrar processos. Linux nativo permite integrar serviços ao init, respeitando a implementação do port.

:::warning Não sirva a pasta pessoal inteira
Um servidor de arquivos estáticos pode publicar documentos, chaves e links simbólicos presentes no diretório servido. Crie uma pasta de publicação limpa. Escutar em `0.0.0.0` ou `::` pode disponibilizar o serviço em redes que você não considerou; os exemplos começam no loopback.
:::

## 1. Criar conteúdo de teste

```bash
mkdir -p "$HOME/web-mini-pc/html"
cd "$HOME/web-mini-pc/html"
printf '%s\n' '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Mini PC</title><h1>Servidor do smartphone funcionando</h1></html>' > index.html
python3 -m http.server 8080 --bind 127.0.0.1 --directory "$HOME/web-mini-pc/html"
```

`--directory` define somente a árvore de publicação; `--bind` limita a escuta ao telefone; 8080 é uma porta não privilegiada. Em outro terminal no telefone, execute `curl -I http://127.0.0.1:8080/` se curl estiver instalado. No navegador do telefone, abra a mesma URL.

**Verificação:** status HTTP 200, a frase correta e uma linha de requisição no terminal. Para encerrar, Ctrl+C. O módulo `http.server` é ferramenta de desenvolvimento, não servidor de produção com autenticação robusta.

## 2. Testar do computador mantendo a escuta privada

Com o servidor ativo e o alias de cliente `mini-pc` configurado conforme o [guia SSH](./ssh-remoto.md), execute no computador:

```bash
ssh -N -L 8080:127.0.0.1:8080 mini-pc
```

Abra `http://127.0.0.1:8080` no computador. A página veio do telefone pelo túnel, mesmo com URL local. Esse acesso não depende de saída HDMI; precisa de conexão SSH entre as duas máquinas. Se a porta local está em uso, escolha 18080 à esquerda do encaminhamento e abra essa porta.

## 3. Nginx de usuário para arquivos estáticos

Instale Nginx pelo gerenciador **do ambiente utilizado**: `pkg install nginx` no Termux, `sudo apt install nginx` em Debian/Ubuntu real ou `sudo apk add nginx` em Alpine/postmarketOS. Em Debian, a instalação pode iniciar o serviço de sistema: verifique isso e não deixe dois daemons tentando usar as mesmas portas. O exemplo abaixo usa configuração independente em porta 8080; não substitui `/etc/nginx`.

```bash
mkdir -p "$HOME/web-mini-pc/logs" "$HOME/web-mini-pc/run"
mkdir -p "$HOME/web-mini-pc/run/client-body" "$HOME/web-mini-pc/run/proxy" "$HOME/web-mini-pc/run/fastcgi" "$HOME/web-mini-pc/run/uwsgi" "$HOME/web-mini-pc/run/scgi"
```

Crie `~/web-mini-pc/nginx.conf`:

```nginx
worker_processes 1;
daemon off;
pid run/nginx.pid;
error_log logs/error.log warn;
events { worker_connections 128; }
http {
  client_body_temp_path run/client-body;
  proxy_temp_path run/proxy;
  fastcgi_temp_path run/fastcgi;
  uwsgi_temp_path run/uwsgi;
  scgi_temp_path run/scgi;
  access_log logs/access.log;
  default_type application/octet-stream;
  types {
    text/html html;
    text/css css;
    application/javascript js;
  }
  server {
    listen 127.0.0.1:8080;
    server_name localhost;
    root html;
    index index.html;
    location / { try_files $uri $uri/ =404; }
  }
}
```

O prefixo informado ao iniciar resolve os caminhos relativos desta configuração dentro da sua pasta. Os cinco diretórios temporários foram definidos explicitamente: `-p` sozinho não substitui caminhos absolutos compilados no pacote, que podem apontar para diretórios protegidos do sistema. A configuração utiliza um worker e não precisa de root. O bloco mínimo de tipos cobre esta demonstração; um site com outros formatos precisa de MIME types corretos e revisão de conteúdo.

```bash
nginx -t -p "$HOME/web-mini-pc/" -c "$HOME/web-mini-pc/nginx.conf"
nginx -p "$HOME/web-mini-pc/" -c "$HOME/web-mini-pc/nginx.conf"
```

`-t` valida configuração e acesso a arquivos. O segundo comando fica em primeiro plano. Encerre o servidor Python anterior antes, pois ambos usam 8080. Teste novamente a página, o túnel e uma URL inexistente, que deve retornar 404.

## 4. Integrar persistência somente depois da validação

No Linux nativo, uma unidade systemd ou serviço OpenRC deve iniciar Nginx com a configuração confirmada, como usuário sem privilégios, registrar logs e permitir parada limpa. Utilize os serviços distribuídos pelos pacotes quando apropriado; não sobreponha init diferentes. No Termux, a supervisão pode ser feita por termux-services, mantendo as limitações de ciclo de vida do Android.

Para atualizar conteúdo, versione a pasta publicada, teste uma cópia e faça backup. Para configuração, preserve a versão anterior, valide `nginx -t` e utilize o sinal de reload pelo mecanismo documentado somente para o daemon correspondente. Logs precisam de rotação e limite de armazenamento se o serviço ficar permanente.

Se desejar acesso direto por LAN, identifique o IP da interface, configure uma escuta deliberada nesse endereço e restrinja o firewall à rede/usuários necessários. Essa mudança amplia a exposição. Hospedagem pública exige TLS, DNS, autenticação quando houver dados privados, atualizações, limites e monitoramento; isso é um projeto separado, não um motivo para abrir o roteador durante o teste.

## Falhas, rollback e testes finais

`Address already in use` pede localizar quem usa a porta; `Permission denied` pede verificar arquivos e diretórios, não tornar tudo gravável; página antiga pede comparar conteúdo servido e cache; timeout externo pede testar primeiro `curl` no telefone, depois túnel e rota. Não desative o firewall inteiro para diagnosticar HTTP.

Para rollback, pare o processo e restaure sua configuração/conteúdo versionado. A pasta original permanece no lugar; a receita não altera partições. **Teste final:** página 200, caminho desconhecido 404, leitura por túnel, nenhuma chave/arquivo privado servido, logs visíveis, parada limpa e retorno pelo mecanismo de supervisão escolhido. Se depende de Android, teste tela apagada e pressão de memória antes de chamar o serviço de permanente.

## Fontes e verificação

Revisão documental: **10/10/2026**. [Python http.server e restrição de produção](https://docs.python.org/3/library/http.server.html), [Nginx, controle](https://nginx.org/en/docs/control.html), [diretivas principais](https://nginx.org/en/docs/ngx_core_module.html), [HTTP core](https://nginx.org/en/docs/http/ngx_http_core_module.html), [túneis SSH](https://man.openbsd.org/ssh). O exemplo de Nginx é configuração original de laboratório; deve ser validado com o binário instalado.
