---
title: Servidor web local no smartphone
sidebar_position: 4
description: Publique uma página privada, teste por túnel e configure Nginx sem privilégios para servir arquivos estáticos.
last_verified: '2026-10-11'
validation: documental
hardware_tested: false
---

## Visão geral, materiais e riscos

**Dificuldade:** inicial para teste; intermediária para serviço persistente. **Resultado:** página estática servida pelo telefone, acessível localmente e por túnel SSH. Não é uma receita pronta de hospedagem pública. Um serviço doméstico depende de energia, temperatura, atualizações, backup e conectividade, não apenas de conseguir abrir uma URL.

Você precisará de Python, editor, terminal, uma pasta exclusiva e [SSH validado](./ssh-remoto.md) para testar do computador. Termux/PRoot podem hospedar aplicações simples, mas o Android pode encerrar processos. Linux nativo permite integrar serviços ao init, respeitando a implementação do port.

## 0. Preparar ferramentas, terminal e navegador

O **servidor** executará no telefone; o navegador pode estar no próprio telefone ou no notebook. Para acessar por túnel, instale somente o cliente SSH no Windows/macOS/Linux e crie o alias `mini-pc` pelo [guia SSH desde o começo](ssh-remoto.md). Abra uma conexão `ssh mini-pc` ou um terminal local no telefone. Os comandos Python/Nginx desta página são executados **nesse telefone**, não no PowerShell local do Windows.

Se ainda não tem Python e editor, instale o bloco da sua distribuição:

| Ambiente do telefone | Preparação |
|---|---|
| Termux Android | `pkg update` e `pkg install python nano curl` |
| Debian/Ubuntu | `sudo apt update` e `sudo apt install python3 nano curl` |
| Alpine/postmarketOS | `sudo apk update` e `sudo apk add python3 nano curl` |
| Debian/Ubuntu no PRoot | Mesmo APT dentro da distribuição, como administrador simulado, sem sudo se ausente |

Leia o plano de instalação e confirme sua conclusão. Teste `python3 --version` e `curl --version`. Se faltar privilégio, utilize a administração já configurada pelo port; não substitua o init nem repositórios para instalar um editor. Em Android/PRoot, mantenha o aplicativo ativo no teste inicial e trate encerramentos pelo Android antes de prometer hospedagem contínua.

No notebook, um navegador instalado já basta para a página de teste. A instalação de um navegador no telefone é opcional para um servidor sem monitor; o túnel permitirá verificar pelo notebook. Um servidor de teste em `127.0.0.1` não aparece automaticamente na internet.

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

O terminal ocupado pelo servidor pode mostrar `Serving HTTP on 127.0.0.1 port 8080`. Deixe-o aberto: esse processo precisa continuar executando. Abra uma segunda sessão terminal/SSH para os próximos checks; pressionar Ctrl+C na primeira para digitar outro comando **encerra o servidor**. `HTTP/1.0 200 OK`, ou uma versão equivalente com 200, comprova resposta local.

Para entender o arquivo que acabou de criar, execute `nano "$HOME/web-mini-pc/html/index.html"` na segunda shell. Pode substituir o conteúdo do **arquivo de teste** pelo exemplo legível:

```html
<!doctype html>
<html lang="pt-BR">
  <meta charset="utf-8">
  <title>Mini PC Linux</title>
  <h1>Meu telefone está servindo esta página</h1>
  <p>Esta página foi salva no próprio telefone.</p>
</html>
```

Salve por **Ctrl+O → Enter** e saia por **Ctrl+X**. Recarregue o navegador; deve aparecer a frase nova. Não copie as crases do bloco para o arquivo. `pwd` e `ls -l "$HOME/web-mini-pc/html/index.html"` ajudam a localizar um arquivo salvo noutra pasta. Faça o laboratório numa pasta nova se já havia conteúdo com esses nomes.

**Verificação:** status HTTP 200, a frase correta e uma linha de requisição no terminal. Para encerrar, Ctrl+C. O módulo `http.server` é ferramenta de desenvolvimento, não servidor de produção com autenticação robusta.

## 2. Testar do computador mantendo a escuta privada

Com o servidor ativo e o alias de cliente `mini-pc` configurado conforme o [guia SSH](./ssh-remoto.md), execute no computador:

```bash
ssh -N -L 8080:127.0.0.1:8080 mini-pc
```

Abra `http://127.0.0.1:8080` no computador. A página veio do telefone pelo túnel, mesmo com URL local. Esse acesso não depende de saída HDMI; precisa de conexão SSH entre as duas máquinas. Se a porta local está em uso, escolha 18080 à esquerda do encaminhamento e abra essa porta.

No **PowerShell Windows**, Terminal macOS ou terminal Linux do notebook, o comando do túnel usa o mesmo formato OpenSSH, desde que o alias foi configurado nesse computador. A janela pode ficar sem output: isso é normal para `-N`, que não abre shell remota. Acrescente `-o ExitOnForwardFailure=yes` para detectar falha ao abrir a porta local. Abra **outra janela**, o navegador do notebook, e digite a URL na barra de endereços.

Se a página não abrir, teste em ordem: processo Python ainda executando no telefone; `curl` local nele; `ssh mini-pc` numa nova janela do notebook; túnel sem erro; URL e porta local certas. O loopback do notebook sozinho não aponta ao telefone. Um erro `channel ... connect failed: Connection refused` no túnel costuma indicar que a porta do servidor remoto não tem um serviço ativo.

## 3. Nginx de usuário para arquivos estáticos

Instale Nginx pelo gerenciador **do ambiente utilizado**: `pkg install nginx` no Termux, `sudo apt install nginx` em Debian/Ubuntu real ou `sudo apk add nginx` em Alpine/postmarketOS. Em Debian, a instalação pode iniciar o serviço de sistema: verifique isso e não deixe dois daemons tentando usar as mesmas portas. O exemplo abaixo usa configuração independente em porta 8080; não substitui `/etc/nginx`.

Nginx é obtido do repositório assinado da distribuição. No Windows/macOS do notebook, você não precisa baixar um instalador Nginx para abrir a página que o telefone serve. Confira `command -v nginx` e `nginx -v`. Pacotes Linux podem instalar o executável em `/usr/sbin/nginx`, fora do PATH de certos usuários: se o comando não for encontrado mas esse arquivo existir, utilize **`/usr/sbin/nginx` no lugar de `nginx`** nos testes seguintes. Isso é diferente de um pacote não instalado.

```bash
mkdir -p "$HOME/web-mini-pc/logs" "$HOME/web-mini-pc/run"
mkdir -p "$HOME/web-mini-pc/run/client-body" "$HOME/web-mini-pc/run/proxy" "$HOME/web-mini-pc/run/fastcgi" "$HOME/web-mini-pc/run/uwsgi" "$HOME/web-mini-pc/run/scgi"
```

Crie `~/web-mini-pc/nginx.conf`:

No telefone, execute `nano "$HOME/web-mini-pc/nginx.conf"`, cole o bloco seguinte e salve por **Ctrl+O → Enter → Ctrl+X**. Se esse arquivo já existe, faça uma cópia antes e compare; não o substitua sem preservar a configuração anterior. O símbolo `~` e `$HOME` referem-se à conta do telefone, não à pasta do notebook.

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

Espere as mensagens `syntax is ok` e `test is successful` antes de iniciar. Se houver `unknown directive`, confira módulos presentes e a linha indicada; não use `sudo` para esconder um problema de sintaxe. O Nginx em primeiro plano não mostra necessariamente cada request: consulte na segunda shell `tail -n 20 "$HOME/web-mini-pc/logs/access.log"` e `tail -n 20 "$HOME/web-mini-pc/logs/error.log"`.

Abra `http://127.0.0.1:8080/pagina-que-nao-existe` para o teste 404. Confirmar um endereço válido e um inválido ajuda a verificar que o servidor está usando sua pasta, e não o site padrão de outro daemon. Ctrl+C encerra o teste; não deve apagar o HTML.

## 4. Integrar persistência somente depois da validação

No Linux nativo, uma unidade systemd ou serviço OpenRC deve iniciar Nginx com a configuração confirmada, como usuário sem privilégios, registrar logs e permitir parada limpa. Utilize os serviços distribuídos pelos pacotes quando apropriado; não sobreponha init diferentes. No Termux, a supervisão pode ser feita por termux-services, mantendo as limitações de ciclo de vida do Android.

### Exemplo completo: serviço de usuário systemd no Debian nativo

Este bloco exige **systemd e um gerenciador de usuário funcional no telefone**, executável em `/usr/sbin/nginx` confirmado e a configuração independente acima já testada. Não serve para PRoot nem OpenRC. Confira `systemctl --user status`; se não houver bus/gerenciador de usuário, corrija a integração documentada em vez de exportar valores fictícios de sessão. Pare o Nginx de teste antes de iniciar outro na mesma porta.

```bash
mkdir -p "$HOME/.config/systemd/user"
nano "$HOME/.config/systemd/user/mini-pc-web.service"
```

O nome de serviço deve estar livre; preserve um arquivo existente. Salve:

```ini
[Unit]
Description=Pagina local do mini PC

[Service]
ExecStart=/usr/sbin/nginx -p "%h/web-mini-pc/" -c "%h/web-mini-pc/nginx.conf"
Restart=on-failure
RestartSec=5

[Install]
WantedBy=default.target
```

`%h` é expandido pelo systemd para a home do usuário. Este serviço usa a mesma porta 8080 e a configuração `daemon off` já testada. Se o caminho do binário for outro, troque-o pelo **absoluto observado**; systemd não interpreta `~` como uma shell. Então:

```bash
systemctl --user daemon-reload
systemctl --user enable --now mini-pc-web.service
systemctl --user status mini-pc-web.service --no-pager
curl -I http://127.0.0.1:8080/
```

O status deve ser ativo e HTTP retornar 200. `journalctl --user -u mini-pc-web.service -n 30 --no-pager` mostra falhas do serviço, enquanto os logs HTTP continuam na pasta do projeto. Habilitar um serviço de usuário não garante execução antes de login: **se deseja manter o servidor mesmo sem sessão**, com política de energia já validada, `sudo loginctl enable-linger "$(id -un)"` habilita o gerenciador persistente dessa conta. Confirme por `loginctl show-user "$(id -un)" -p Linger` e teste após boot. Essa função não impede suspensão do sistema nem falha elétrica.

Para reverter: `systemctl --user disable --now mini-pc-web.service`. Remova/arquive apenas seu arquivo de serviço, execute `systemctl --user daemon-reload` e preserve o HTML. Desative linger somente se foi habilitado por este projeto e nenhum outro serviço pessoal depende dele.

### OpenRC e Termux: usar o supervisor da própria integração

Em **OpenRC**, `rc-service nginx status` consulta o serviço fornecido pelo pacote, que normalmente usa a configuração de sistema. Ele **não lê automaticamente** `~/web-mini-pc/nginx.conf`. Não o habilite esperando a página acima sem configurar explicitamente seu virtual host e permissões conforme a release. Para um port customizado, um serviço próprio precisa de usuário, caminho absoluto, configuração, logs e parada testados; sua criação é parte da integração daquele port, não uma unidade systemd copiada. O teste completo em primeiro plano acima continua disponível sem prometer um boot automático não configurado.

No **Termux**, instale `pkg install termux-services`, reinicie a sessão conforme o README e confira `ls "$PREFIX/var/service"`. O pacote Nginx consultado oferece supervisão que procura uma configuração do usuário em `~/.nginx/nginx.conf`, utilizando esse diretório como prefixo. Para usar essa convenção, primeiro consulte `ls -ld "$HOME/.nginx"`: se já existir, preserve seu conteúdo e não execute a cópia abaixo por cima dele. Numa instalação **sem essa pasta**, copie os arquivos do laboratório:

```bash
mkdir "$HOME/.nginx"
cp -R "$HOME/web-mini-pc/html" "$HOME/web-mini-pc/logs" "$HOME/web-mini-pc/run" "$HOME/.nginx/"
cp "$HOME/web-mini-pc/nginx.conf" "$HOME/.nginx/nginx.conf"
nano "$HOME/.nginx/nginx.conf"
```

**Atenção:** o serviço Termux do pacote consultado acrescenta `daemon off;` pela linha de comando. No `nano` da cópia destinada a ele, remova somente a linha `daemon off;`, salve com Ctrl+O/Enter/Ctrl+X e preserve-a no arquivo original. Valide por `nginx -t -p "$HOME/.nginx/" -c "$HOME/.nginx/nginx.conf" -g 'daemon off;'`. Depois de parar o teste manual, com serviço `nginx` realmente presente, `sv-enable nginx` e `sv status nginx` controlam o supervisor. Confira o script instalado por `cat "$PREFIX/var/service/nginx/run"`, pois outra versão pode ter outra convenção. Revalide HTTP e encerramento; `sv-disable nginx` desabilita somente esse serviço de laboratório quando não for mais necessário. Iniciar ao boot Android ainda requer Termux:Boot compatível e as políticas do Android; não confunda supervisão do aplicativo com Linux nativo.

Para atualizar conteúdo, versione a pasta publicada, teste uma cópia e faça backup. Para configuração, preserve a versão anterior, valide `nginx -t` e utilize o sinal de reload pelo mecanismo documentado somente para o daemon correspondente. Logs precisam de rotação e limite de armazenamento se o serviço ficar permanente.

Se desejar acesso direto por LAN, identifique o IP da interface, configure uma escuta deliberada nesse endereço e restrinja o firewall à rede/usuários necessários. Essa mudança amplia a exposição. Hospedagem pública exige TLS, DNS, autenticação quando houver dados privados, atualizações, limites e monitoramento; isso é um projeto separado, não um motivo para abrir o roteador durante o teste.

## Falhas, rollback e testes finais

`Address already in use` pede localizar quem usa a porta; `Permission denied` pede verificar arquivos e diretórios, não tornar tudo gravável; página antiga pede comparar conteúdo servido e cache; timeout externo pede testar primeiro `curl` no telefone, depois túnel e rota. Não desative o firewall inteiro para diagnosticar HTTP.

Para rollback, pare o processo e restaure sua configuração/conteúdo versionado. A pasta original permanece no lugar; a receita não altera partições. **Teste final:** página 200, caminho desconhecido 404, leitura por túnel, nenhuma chave/arquivo privado servido, logs visíveis, parada limpa e retorno pelo mecanismo de supervisão escolhido. Se depende de Android, teste tela apagada e pressão de memória antes de chamar o serviço de permanente.

## Fontes e verificação

Revisão documental: **11/10/2026**, sem iniciar Nginx/Python no telefone. [Python http.server e restrição de produção](https://docs.python.org/3/library/http.server.html), [Nginx, controle](https://nginx.org/en/docs/control.html), [diretivas principais](https://nginx.org/en/docs/ngx_core_module.html), [HTTP core](https://nginx.org/en/docs/http/ngx_http_core_module.html), [túneis SSH](https://man.openbsd.org/ssh), [systemd.service fornecido pelo Debian](https://manpages.debian.org/trixie/systemd/systemd.service.5.en.html), [loginctl/linger no Debian](https://manpages.debian.org/trixie/systemd/loginctl.1.en.html), [serviço Nginx Termux](https://github.com/termux/termux-packages/blob/master/packages/nginx/build.sh). O HTML, configuração e unidade são exemplos originais de laboratório e precisam ser validados com o binário/init instalados. O site upstream systemd bloqueou a consulta automatizada; os manuais distribuídos pelo Debian foram conferidos. OpenRC customizado e boot Android não foram certificados nesta publicação.
