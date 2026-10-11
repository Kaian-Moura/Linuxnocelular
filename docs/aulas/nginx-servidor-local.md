---
title: Sirva uma página com Nginx sem alterar o servidor do sistema
description: Um laboratório de Nginx em pasta própria, porta alta e loopback, com configuração, logs, reload, parada e recuperação verificáveis.
sidebar_position: 62
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Nesta aula você utilizará **Nginx de verdade**, com uma configuração dedicada ao exercício. A página, o PID, os logs e os arquivos temporários ficarão numa pasta nova da sua conta. O servidor começará em `127.0.0.1:8092`, acessível pelo próprio ambiente, sem alterar `/etc/nginx`, parar outro servidor, abrir o firewall ou habilitar um serviço durante o boot. Você aprenderá a validar, iniciar, consultar, mudar e encerrar essa instância específica.

**Dificuldade:** iniciante após [o primeiro servidor Python](servidor-python.md). Materiais: terminal operacional, editor, navegador ou `curl`, pacote Nginx adequado ao ambiente e espaço para arquivos de exercício. Não exige root Android. A instalação de pacotes no Linux nativo pode exigir administração; a execução do laboratório será como usuário comum. Uma porta alta reduz a necessidade de privilégio, mas não é uma proteção contra acesso indevido se você mudar o endereço de escuta.

## O resultado e as fronteiras do laboratório

Você terá uma página HTML estática, uma URL `/status`, um acesso inexistente com resposta 404 e logs próprios. **Servidor web** é o programa que recebe pedidos HTTP e devolve respostas. **Cliente** será o navegador ou `curl`. **Configuração** determina que endereço e porta recebem os pedidos e quais arquivos serão oferecidos. Uma página estática não executa Python, não consulta SQLite e não se torna uma aplicação dinâmica porque foi servida por Nginx.

O Nginx pode ter processos master e worker. Neste exercício usamos um worker, suficiente para aprender sem apresentar um ajuste de desempenho como universal. O master ficará visível no terminal; comandos de controle em outra sessão usarão o mesmo prefixo e configuração para encontrar seu PID. [Organização dos processos e guia inicial oficial](https://nginx.org/en/docs/beginners_guide.html).

Este conteúdo não configura produção: **HTTP não fornece criptografia**, não há autenticação, TLS, certificados, domínio público, atualização automática ou política de acesso entre usuários locais. A etapa LAN é opcional e deliberada. Não compartilhe arquivos pessoais, não sirva sua pasta inteira e não exponha a porta no roteador. Uma aula funcionando no notebook também não demonstra autonomia do processo no Android nem estabilidade do hub.

## 1. Identifique onde o executável deve ser instalado

Uma arquitetura como ARM64 não é o único requisito de um binário. Linux com glibc, Alpine com musl e Android com Bionic têm bibliotecas e caminhos diferentes. Prefira o pacote mantido para seu ambiente. Não baixe um binário Linux x86_64 para tentar executá-lo num telefone ARM64 e não copie o executável do Termux para dentro de outra distribuição esperando equivalência.

### Termux no Android

Instale o aplicativo conforme [o guia Termux](../android/termux.md). Abra sua shell normal, fora do Debian PRoot, e execute:

```bash
pkg update
pkg install nginx curl nano
nginx -v
```

`pkg` escolhe o pacote do repositório Termux correspondente. O projeto mantém [uma receita própria de Nginx](https://github.com/termux/termux-packages/blob/master/packages/nginx/build.sh) com ajustes para esse ambiente; a existência dessa receita não garante ausência de restrições em todo Android. Não execute o `build.sh` do repositório no seu telefone: é uma receita de construção do mantenedor, não o instalador desta aula.

### Debian/Ubuntu ou Alpine/postmarketOS nativo

Consulte `cat /etc/os-release` e escolha somente o gerenciador correto. Antes de instalar, verifique se já há Nginx configurado para outra finalidade. Em Debian/Ubuntu, um pacote pode iniciar o serviço padrão durante a instalação conforme a política local. **Esta aula não autoriza alterar ou parar esse serviço existente.** Se está num computador compartilhado ou num servidor utilizado por outras pessoas, peça ao administrador que prepare o pacote; depois faça apenas a instância do exercício.

```bash
# Debian/Ubuntu com administração autorizada
sudo apt update
sudo apt install nginx curl nano
```

```bash
# Alpine/postmarketOS com administração autorizada
sudo apk update
sudo apk add nginx curl nano
```

Em PRoot, use o pacote da distribuição interna, mas não presuma que seu gerenciador de serviços funciona como num boot Linux nativo. Para reduzir camadas, prefira começar em Termux externo ou no Linux nativo. Instalar Nginx dentro de Debian PRoot não substitui Android nem transfere a administração do rádio Wi-Fi para o Debian.

Para Windows, a [página oficial de download](https://nginx.org/en/download.html) distingue distribuição Windows e código-fonte. **Os comandos desta aula são para shell Linux/Termux**, não para Windows nativo. No notebook Windows, execute o laboratório em um Linux já preparado, ou use o computador somente como cliente na fase LAN. No macOS, siga a instalação do ambiente de estudo escolhido; não execute `apt` por imitação. Não é necessário que cliente e servidor usem o mesmo sistema operacional.

**Checkpoint 1:** confira `nginx -v` e `nginx -V`. O exemplo utiliza `-e`, disponível a partir do Nginx 1.19.5, para direcionar também o log inicial a um destino próprio. Se seu pacote é anterior, atualize pelo distribuidor numa etapa separada e autorizada; não retire opções às cegas. `-V` mostra parâmetros da compilação, útil quando um módulo esperado falta. [Parâmetros de linha de comando](https://nginx.org/en/docs/switches.html).

## 2. Prepare uma pasta exclusiva

**Local: terminal do servidor, como usuário comum.** Confira `ls "$HOME"`. Se `aula-nginx` já existe, leia a seção de retomada; não sobrescreva seu conteúdo. Para a primeira execução:

```bash
mkdir "$HOME/aula-nginx"
cd "$HOME/aula-nginx"
mkdir conf html logs temp
mkdir temp/client temp/proxy temp/fastcgi temp/uwsgi temp/scgi
pwd
```

Execute a linha seguinte somente quando a anterior terminar sem erro. A pasta `conf` guardará configuração; `html`, arquivos públicos; `logs`, registros e PID; `temp`, arquivos temporários do Nginx. A separação ajuda a evitar que um log ou backup apareça como documento público. Nenhuma dessas pastas deve ser um link simbólico para sua pasta pessoal ou armazenamento sensível.

Use `nano html/index.html` e escreva:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Meu Nginx local</title>
  </head>
  <body>
    <h1>Meu Nginx local</h1>
    <p>Versão 1: página pública fictícia do laboratório.</p>
    <p><a href="/status">Consultar status do exercício</a></p>
  </body>
</html>
```

Grave com Ctrl+O, confirme o nome com Enter e saia com Ctrl+X. Abra `nano html/aviso.txt`, escreva “Somente conteúdo fictício para estudo.” e grave. Confira `ls -l html`. O editor não deve salvar `index.html.txt`; a extensão participa da identificação do tipo que enviaremos ao cliente.

**Checkpoint 2:** dois documentos públicos próprios, sem dados pessoais; nenhum arquivo de outra aplicação foi modificado. O que estiver em `html` poderá ser servido na fase LAN. Não use essa pasta como destino de backup.

## 3. Escreva uma configuração inteira e independente

Abra `nano conf/nginx.conf` e cole o conteúdo completo. **Este bloco é configuração Nginx, não um comando shell.** Preserve `$uri` literalmente: não o substitua por um caminho do telefone.

```nginx
worker_processes 1;
pid logs/nginx.pid;
error_log logs/error.log notice;

events {
    worker_connections 128;
}

http {
    access_log logs/access.log;
    client_body_temp_path temp/client;
    proxy_temp_path temp/proxy;
    fastcgi_temp_path temp/fastcgi;
    uwsgi_temp_path temp/uwsgi;
    scgi_temp_path temp/scgi;

    types {
        text/html html;
        text/plain txt;
        text/css css;
    }
    default_type application/octet-stream;

    server {
        listen 127.0.0.1:8092;
        server_name localhost;
        root html;
        index index.html;

        location / {
            try_files $uri $uri/ =404;
        }

        location = /status {
            default_type text/plain;
            return 200 "Nginx local ativo\n";
        }
    }
}
```

As diretivas terminam em `;`; os blocos usam chaves. O bloco `server` está dentro de `http`; `location` está dentro de `server`. `pid` e `error_log` pertencem ao contexto principal. Você não precisa decorar toda a gramática: precisa reconhecer a posição do erro quando o validador apontar uma linha.

`listen` limita esta instância a loopback IPv4 e à porta alta escolhida. `root html` resolve a raiz a partir do prefixo que informaremos explicitamente no comando. `index` oferece a página inicial ao pedir `/`. A lista `types` é suficiente para nossos três tipos, sem incluir um arquivo global cuja localização depende do pacote. `try_files` procura documentos na raiz e devolve 404 quando faltam. `/status` retorna uma mensagem do exercício; **não é monitoramento real de CPU, bateria ou conectividade**. [Diretivas HTTP usadas](https://nginx.org/en/docs/http/ngx_http_core_module.html).

Todos os destinos temporários são explícitos para não depender dos caminhos administrativos definidos na compilação do pacote. `access_log` registra pedidos; `error_log`, situações do servidor. Mesmo no laboratório, URLs podem aparecer no log: não coloque tokens ou senhas nos pedidos. [Logs HTTP](https://nginx.org/en/docs/http/ngx_http_log_module.html).

O exemplo espera uma compilação com os módulos HTTP comuns correspondentes às diretivas `proxy_temp_path`, `fastcgi_temp_path`, `uwsgi_temp_path` e `scgi_temp_path`. Um pacote reduzido pode não ter todos. Se o validador informa “unknown directive”, confira `nginx -V` e a composição do pacote. Não remova uma diretiva para permitir que o respectivo temporário volte ao destino global; instale o pacote compatível ou documente uma configuração adaptada ao módulo realmente presente.

## 4. Valide sem iniciar

**No terminal do servidor:**

```bash
nginx -p "$HOME/aula-nginx/" -c conf/nginx.conf -e "$HOME/aula-nginx/logs/inicio.log" -t
```

`-p` estabelece o prefixo do laboratório; mantenha a barra final. `-c` escolhe nosso arquivo; `-e` escolhe o log inicial; `-t` testa a configuração e os arquivos referenciados. Aguarde a indicação de teste bem-sucedido antes de iniciar. Um arquivo criado durante a validação não significa que existe servidor escutando.

Se aparecer erro, leia a primeira mensagem específica. Verifique ponto e vírgula, chaves, diretórios e permissão da pasta. O diagnóstico não requer `sudo`, porque o servidor foi deliberadamente preparado para sua conta. Não faça `chmod -R 777` e não altere o arquivo padrão do pacote para contornar um erro nesta pasta.

**Checkpoint 4:** teste termina com sucesso e a configuração continua limitada a `127.0.0.1`. Se você adicionou outro bloco `server`, incluiu um arquivo global ou mudou o bind, volte ao exemplo antes de prosseguir.

## 5. Inicie em primeiro plano e consulte por outra sessão

```bash
nginx -p "$HOME/aula-nginx/" -c conf/nginx.conf -e "$HOME/aula-nginx/logs/inicio.log" -g 'daemon off;'
```

O terminal não deve devolver o prompt enquanto a instância está ativa. Isso é esperado: `daemon off` mantém o master em primeiro plano. Deixe esta sessão aberta. Use outra sessão Termux ou outro terminal GNOME para os próximos comandos. Essa visibilidade é útil para aprender início e encerramento antes de criar um serviço automático.

Se houver “address already in use”, a validação sintática pode ter passado, mas a escuta falhou ao iniciar. Não mate um processo desconhecido. Encerre apenas uma execução sua que reconhece ou escolha outra porta alta na configuração; ajuste também todos os testes. Porta ocupada é diferente de erro de senha, firmware ou root.

Na **segunda sessão do servidor**, faça:

```bash
curl --noproxy '*' --max-time 5 -i http://127.0.0.1:8092/
curl --noproxy '*' --max-time 5 -i http://127.0.0.1:8092/status
curl --noproxy '*' --max-time 5 -i http://127.0.0.1:8092/nao-existe
```

`--noproxy '*'` impede que uma configuração de proxy desvie estes pedidos locais; as aspas evitam expansão pelo shell. `--max-time 5` limita a espera; `-i` mostra cabeçalhos junto ao conteúdo. Espere respectivamente 200 com HTML, 200 com “Nginx local ativo” e 404. O terceiro resultado é **um teste esperado de arquivo ausente**, não falha do servidor. `curl` sem `--fail` não transforma todo status HTTP de erro em código de processo diferente de zero; leia a resposta.

No navegador do próprio telefone, abra `http://127.0.0.1:8092/` na barra de endereço. Deve aparecer o título da página. Esse mesmo endereço no notebook aponta para **o notebook**, não para o telefone. Se não possui navegador utilizável no telefone, as consultas locais já validam esta etapa; veja a fase LAN ou um túnel de [SSH](ssh-arquivos.md) preparado separadamente.

## 6. Leia registros antes de mudar a configuração

Na segunda sessão:

```bash
tail -n 10 "$HOME/aula-nginx/logs/access.log"
tail -n 10 "$HOME/aula-nginx/logs/error.log"
cat "$HOME/aula-nginx/logs/nginx.pid"
```

O access log deve ter pedidos associados ao exercício. Um `favicon.ico` automático do navegador com 404 não invalida a página. O error log pode mostrar início e processos workers; não pressupõe que um monitor externo recebeu imagem ou que Android manterá o aplicativo acordado. O PID é o número do processo master deste laboratório enquanto ele está ativo.

**Não use esse número guardado dias depois para enviar sinais.** Processos terminam e números podem ser reutilizados. Os controles da próxima etapa só devem ser usados quando você reconhece a instância atual pelo terminal de primeiro plano, pasta e configuração. Nunca use `killall nginx`, `pkill nginx` ou `systemctl restart nginx` para controlar esta aula: podem afetar outras instâncias.

**Checkpoint 6:** conteúdo e logs concordam. Se a página vem de outro aplicativo, confira porta, destino, título e registro do pedido. Uma resposta 200 sozinha não identifica qual servidor respondeu.

## 7. Altere, valide e faça reload específico

Primeiro preserve a configuração inicial, desde que o nome de cópia ainda não exista:

```bash
cp -i "$HOME/aula-nginx/conf/nginx.conf" "$HOME/aula-nginx/conf/nginx.conf.inicial"
nano "$HOME/aula-nginx/conf/nginx.conf"
```

`cp -i` pergunta antes de substituir um destino existente; se houver cópia antiga, responda não e escolha outro nome. Na configuração, troque **somente** a mensagem de `/status` para `Nginx local versão 2\n`. Grave, saia e execute:

```bash
nginx -p "$HOME/aula-nginx/" -c conf/nginx.conf -e "$HOME/aula-nginx/logs/inicio.log" -t
```

Só se esse comando passar, execute:

```bash
nginx -p "$HOME/aula-nginx/" -c conf/nginx.conf -e "$HOME/aula-nginx/logs/inicio.log" -s reload
curl --noproxy '*' --max-time 5 -i http://127.0.0.1:8092/status
```

A nova mensagem deve aparecer. Reload solicita que o master da instância aplique a configuração sem encerrar abruptamente os pedidos existentes. Um sinal enviado com sucesso não substitui a consulta do resultado e a leitura do log. [Controle e sinais do Nginx](https://nginx.org/en/docs/control.html).

Agora personalize o texto de `html/index.html` para “Versão 2”. Um arquivo estático alterado não exige reload da configuração: faça outra consulta. Se o navegador mantém a página antiga, recarregue e compare com `curl`; cache do cliente é uma camada diferente da configuração ativa.

Para voltar à mensagem original, abra sua cópia inicial, compare o conteúdo e restaure a configuração de forma consciente. Preserve a versão modificada com outro nome antes de trocar. Faça `-t`, depois reload e consulta. Restaurar o arquivo sem reload não altera imediatamente o servidor ativo.

## 8. Encerre somente a instância do exercício

Com a sessão de primeiro plano ainda identificada, na segunda sessão execute:

```bash
nginx -p "$HOME/aula-nginx/" -c conf/nginx.conf -e "$HOME/aula-nginx/logs/inicio.log" -s quit
```

`quit` pede encerramento gracioso. O terminal da primeira sessão deve voltar ao prompt quando a instância terminar. Repita a consulta local:

```bash
curl --noproxy '*' --max-time 5 -i http://127.0.0.1:8092/status
```

Deve falhar a conexão, desde que nenhum outro processo tenha assumido a porta. Isso confirma a diferença entre parar servidor e apagar página: os arquivos do exercício continuam presentes. Não apague o PID de uma instância em funcionamento. Se a configuração atual ficou sintaticamente inválida, volte ao arquivo válido conhecido antes de usar o controle; não tente contornar a proteção com sinal a um PID que não reconhece.

**Checkpoint 8:** primeira sessão encerrada, consulta não recebe a mensagem do exercício, arquivos preservados. Reinicie com o comando da etapa 5 se quiser continuar. Um serviço executado pelo gerenciador do sistema não foi controlado aqui.

## 9. LAN opcional, com endereço confirmado e conteúdo público

Complete [rede local e diagnóstico](rede-local-diagnostico.md) antes desta etapa. Use somente rede própria ou onde recebeu autorização para hospedar esse teste. Redes de convidados, universidade e empresas podem isolar clientes ou proibir servidores; não contorne essas políticas. Confirme o IPv4 Wi-Fi atual do telefone nas configurações Android ou ferramentas nativas.

Com a instância parada e uma cópia da configuração local preservada, troque `listen 127.0.0.1:8092;` por `listen IP_ATUAL_DO_TELEFONE:8092;`, **substituindo esse texto pelo endereço realmente identificado**. Não cole `IP_ATUAL_DO_TELEFONE` como se fosse um endereço e não troque por `0.0.0.0` apenas para evitar a identificação. A escuta numa interface ainda pode permitir acesso por participantes da rede; o bind não é autenticação.

Valide com `-t`, inicie e faça primeiro uma consulta no próprio servidor usando esse IPv4. No notebook, abra `http://IP_ATUAL_DO_TELEFONE:8092/` com o mesmo número. Verifique o título e o pedido no access log. Se o endereço mudar após reconectar o Wi-Fi, a configuração antiga pode deixar de iniciar; volte a identificar a interface e **não** defina um IP estático arbitrário para compensar.

Ao terminar, encerre a instância, restaure `127.0.0.1`, valide e confirme novamente o alcance local. Não houve alteração do firewall, roteador ou DNS. Se o teste LAN falha, use a aula de diagnóstico para diferenciar bind, associação, IP, isolamento e aplicativo. Não conclua que precisa de root somente porque o notebook não abre a página.

## Retomada, erros e próximos passos

| Situação | Evidência a buscar | Ação apropriada |
| --- | --- | --- |
| Comando Nginx ausente | Ambiente e pacote instalado | Use o gerenciador daquela distribuição; não copie binários entre ABIs. |
| Permissão em `/var/...` | Opções completas e caminhos compilados | Confira `-p`, `-c`, `-e` e todos os temporários próprios. |
| `unknown directive` | `nginx -V` e linha indicada | Confira módulo e pacote, sem carregar código de terceiros aleatoriamente. |
| `invalid PID number` | Instância conhecida ainda está ativa? | Não use controle sobre um arquivo antigo; confira a sessão do exercício. |
| `connection refused` | Início, bind e porta | Leia o terminal/log; teste o destino correto. |
| Conteúdo inesperado | Título, porta e access log | Identifique o servidor que respondeu antes de editar outros serviços. |
| HTTP 403 | Arquivo inicial e permissão da própria raiz | Confira `index.html` e sua pasta; não habilite listagem para compensar. |
| Para ao sair do aplicativo | Política Android/processos | Registre a limitação; manter um serviço permanente é outra etapa. |

Para retomar amanhã, identifique a pasta, confira configuração e bind, valide, inicie e consulte. Não repita instalação nem criação de pastas por hábito. Um dispositivo desligado não mantém a instância desta aula; o boot automático não foi configurado intencionalmente. Na [rotina de manutenção](rotina-manutencao.md), separe aprendizado, serviço persistente e publicação de produção.

**Verificação e fontes:** configuração e operações executadas no notebook com Nginx 1.30.5, compilado do código oficial em pasta temporária, sem instalação no sistema ou alteração de serviços. Foram verificados validação, HTML, `/status`, 404, log, reload e encerramento específico. Termux, LAN física, Android em segundo plano e serviços permanentes permanecem dependentes do ambiente do leitor. As fontes oficiais estão vinculadas nas etapas correspondentes. Registre sua própria montagem na [ficha de evidências](../diagnostico/ficha-evidencias.mdx) e escolha o próximo projeto pela [biblioteca](biblioteca.mdx).
