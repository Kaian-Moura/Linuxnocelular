---
title: "Aula de JavaScript: crie seu primeiro servidor local"
description: Construa um planejador de estudos com Node.js, HTML, formulário, rotas HTTP e testes, restrito ao próprio aparelho.
sidebar_position: 11
last_verified: '2026-10-11'
verification: documental
hardware_tested: false
---

Você vai criar um **planejador de sessões de estudo**. Abra uma página local, escolha quantas sessões pretende fazer e a duração de cada uma: o programa calcula o total de minutos. A mesma informação também poderá ser consultada em JSON por uma rota da aplicação.

O projeto ensina JavaScript, arquivos, Node.js, HTTP, HTML, validação e testes sem instalar um framework. É um serviço **local**, sem contas, segredos ou exposição à internet. Não salva os campos preenchidos e não precisa internet depois de instalado. Dificuldade: iniciante, com uma parte intermediária de organização do código. Reserve **2–3 horas**, como orientação, ou faça até a primeira página hoje e os testes amanhã.

## 1. Entenda os três programas envolvidos

O **editor** escreve texto. O **Node.js** executa o JavaScript no terminal, fora do navegador. O **navegador** pede uma página ao servidor Node e apresenta o HTML recebido. JavaScript no servidor e JavaScript dentro de uma página são ambientes diferentes; nossa página não precisa executar JavaScript no navegador.

Um servidor HTTP aguarda pedidos num endereço e numa porta. Vamos escolher **`127.0.0.1:8765`**: `127.0.0.1` é loopback, isto é, o próprio sistema onde o cliente está executando, e `8765` é uma porta alta, sem necessidade de administração. No notebook, `127.0.0.1` significa o notebook, não o telefone. No navegador Android do mesmo aparelho, o serviço Termux normalmente pode ser acessado por esse endereço; políticas de apps/ROM podem exigir investigação se isso não ocorrer.

Não vamos usar `0.0.0.0`, abrir portas no roteador nem acrescentar túneis públicos. Um serviço local ainda deve validar entradas, e outros processos locais podem alcançá-lo: loopback não substitui autenticação para uma aplicação com dados sensíveis. Aqui usaremos somente números de prática.

### Escolha um ambiente já utilizável

Execute os comandos em **uma** destas opções: Termux fora de PRoot, Debian/Ubuntu, ou Alpine/postmarketOS. Abra o aplicativo Termux no Android, ou **Terminal/Console** da distribuição. Se usa SSH, conecte primeiro ao ambiente de destino; até executar `exit`, os comandos dessa janela serão remotos.

Não cole blocos Linux no PowerShell local nem em `adb shell`. Para começar sem ferramentas instaladas, veja [Termux desde zero](primeiro-projeto-termux.md), a [biblioteca](biblioteca.mdx) e a [primeira aula de terminal](../comece-aqui/terminal-primeiros-passos.md). Não é necessário root no Android para esta aplicação.

## 2. Instale o executor e o editor, sem misturar origens

A [página oficial Node.js](https://nodejs.org/en/download) oferece versões e instaladores para plataformas específicas. “LTS” indica uma linha com manutenção de longo prazo. No telefone, usamos o **pacote mantido para o ambiente**, pois um arquivo Linux ARM64 do site Node não é automaticamente compatível com Android/bionic ou Alpine/musl.

### Termux no Android

Se o aplicativo ainda não está instalado, siga [F-Droid → Termux → abrir o terminal](primeiro-projeto-termux.md#1-instale-termux-pelo-f-droid). Não desinstale um Termux existente para trocar assinaturas.

**No Termux, fora do Debian:**

```bash
pkg update
pkg install nodejs-lts nano curl
```

Escolhemos o pacote LTS. Os pacotes `nodejs` e `nodejs-lts` representam alternativas e podem conflitar; não instale os dois para “ter mais suporte”. Se já tem `nodejs`, confira a versão e a manutenção antes de trocar um ambiente com projetos existentes. A [receita Termux de nodejs-lts](https://github.com/termux/termux-packages/blob/master/packages/nodejs-lts/build.sh) registra as adaptações e dependências.

### Debian/Ubuntu

**No terminal da distribuição:**

```bash
sudo apt update
sudo apt install nodejs nano curl
```

Não precisamos `npm`: a aula usa exclusivamente módulos que vêm com Node. Dentro de Debian PRoot aberto como administrador simulado, retire somente o `sudo` da instalação. Não aplique esse bloco no terminal Termux externo.

### Alpine/postmarketOS

**No terminal Alpine/postmarketOS:**

```bash
doas apk update
doas apk add nodejs nano curl
```

Use `sudo` no lugar de `doas` somente se essa já é a ferramenta configurada pelo port. Não combine repositórios de releases diferentes para obter uma versão maior. Leia confirmações do gerenciador e espere terminar cada linha. Um erro de instalação deve ser resolvido antes da criação do projeto.

**Em qualquer uma dessas opções:**

```bash
node --version
nano --version
curl --version
node -p "Number(process.versions.node.split('.')[0]) >= 20"
```

O último comando imprime `true` para Node 20 ou posterior, requisito escolhido para usar o test runner estável desta aula. Se imprimir `false`, não prossiga copiando outro binário por cima do pacote: identifique a release, os pacotes mantidos disponíveis e suas opções no [guia de desenvolvimento](../projetos/desenvolvimento.md). A manutenção de segurança da distribuição e a manutenção upstream podem ter prazos diferentes; confirme ambas quando escolher um ambiente.

**Checkpoint 1:** os três programas mostram versões e a consulta retorna `true`. A numeração exata não precisa coincidir com screenshots ou vídeos. Para execução **local no notebook**, os instaladores Windows/macOS e verificações estão em [desenvolvimento](../projetos/desenvolvimento.md); instalar lá não instala no telefone.

## 3. Crie uma pasta e escreva duas linhas

**No terminal escolhido:**

```bash
mkdir -p "$HOME/projetos"
mkdir "$HOME/projetos/planejador-js"
cd "$HOME/projetos/planejador-js"
pwd
ls -la
nano primeiro.cjs
```

O segundo `mkdir` deve criar uma pasta nova. Se ela já existe, confira os arquivos; para uma aula já feita, use a etapa de retomada, não sobrescreva seu projeto. `$HOME` é a pasta da sua conta e não deve ser substituído por um exemplo `/home/...`.

**No editor**, cole:

<!-- example-file: javascript/primeiro.cjs -->
```javascript
const minutos = 3 * 25;
console.log(`Tempo planejado: ${minutos} minutos`);
```

`const` declara um valor que não será reatribuído; `*` multiplica; `console.log` escreve no terminal. As crases em JavaScript permitem inserir `${minutos}` na frase. Elas **fazem parte do código**; as três crases que delimitam o bloco na documentação não fazem.

Salve com **Ctrl+O**, Enter e **Ctrl+X**. No Termux, use a tecla extra CTRL e depois a letra. **No terminal:**

```bash
cat primeiro.cjs
node primeiro.cjs
```

**Saída ilustrativa:** `Tempo planejado: 75 minutos`. Se aparece um prompt `>` do Node por executar apenas `node`, use `.exit` ali para voltar ao shell. A extensão `.cjs` explicita o formato CommonJS; evita depender de um `package.json` antigo que configure outro formato de módulos.

## 4. Crie o servidor original da aula

**No terminal:**

```bash
nano servidor.cjs
```

**Dentro do nano**, cole o arquivo inteiro, preservando pontuação e aspas. Salve e saia:

<!-- example-file: javascript/servidor.cjs -->
```javascript
const http = require('node:http');

function planejar(sessoes, minutos) {
  const inteiro = (texto, maximo) => {
    if (!/^[1-9][0-9]*$/.test(String(texto))) {
      throw new RangeError('Use números inteiros positivos, sem espaços.');
    }
    const valor = Number(texto);
    if (!Number.isSafeInteger(valor) || valor > maximo) {
      throw new RangeError(`O valor precisa estar entre 1 e ${maximo}.`);
    }
    return valor;
  };
  const quantidade = inteiro(sessoes, 100);
  const duracao = inteiro(minutos, 1440);
  return { sessoes: quantidade, minutosPorSessao: duracao,
           minutosTotais: quantidade * duracao };
}

function html(conteudo) {
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Meu planejador local</title></head><body>
<h1>Meu planejador local</h1>${conteudo}</body></html>`;
}

function responder(metodo, caminho, parametros = new URLSearchParams()) {
  if (metodo !== 'GET') {
    return { status: 405, tipo: 'text/plain; charset=utf-8',
             corpo: 'Método não permitido. Use GET.' };
  }
  if (caminho === '/') {
    return { status: 200, tipo: 'text/html; charset=utf-8', corpo: html(`
<p>Calcule um plano sem guardar dados pessoais.</p>
<form action="/calcular" method="get">
<p><label>Sessões: <input name="sessoes" type="number" min="1" max="100"
value="3" required></label></p>
<p><label>Minutos por sessão: <input name="minutos" type="number" min="1"
max="1440" value="25" required></label></p>
<button type="submit">Calcular</button></form>`) };
  }
  if (caminho === '/calcular' || caminho === '/api/plano') {
    try {
      const plano = planejar(parametros.get('sessoes'), parametros.get('minutos'));
      if (caminho === '/api/plano') {
        return { status: 200, tipo: 'application/json; charset=utf-8',
                 corpo: JSON.stringify(plano) };
      }
      return { status: 200, tipo: 'text/html; charset=utf-8', corpo: html(
        `<p>${plano.sessoes} sessões de ${plano.minutosPorSessao} minutos:
<strong>${plano.minutosTotais} minutos no total.</strong></p>
<p><a href="/">Fazer outro cálculo</a></p>`) };
    } catch (erro) {
      if (!(erro instanceof RangeError)) throw erro;
      return { status: 400, tipo: 'text/plain; charset=utf-8', corpo: erro.message };
    }
  }
  return { status: 404, tipo: 'text/plain; charset=utf-8', corpo: 'Página não encontrada.' };
}

function criarServidor() {
  const servidor = http.createServer((pedido, resposta) => {
    let url;
    try {
      url = new URL(pedido.url, 'http://127.0.0.1');
    } catch {
      resposta.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
      resposta.end('URL inválida.');
      return;
    }
    const resultado = responder(pedido.method, url.pathname, url.searchParams);
    const cabecalhos = {
      'Content-Type': resultado.tipo,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Content-Security-Policy': "default-src 'none'; form-action 'self'; frame-ancestors 'none'"
    };
    if (resultado.status === 405) cabecalhos.Allow = 'GET';
    resposta.writeHead(resultado.status, cabecalhos);
    resposta.end(resultado.corpo);
  });
  servidor.requestTimeout = 5000;
  servidor.headersTimeout = 5000;
  servidor.keepAliveTimeout = 1000;
  return servidor;
}

module.exports = { planejar, responder, criarServidor };

if (require.main === module) {
  const porta = Number(process.env.AULA_PORTA || 8765);
  if (!Number.isInteger(porta) || porta < 1024 || porta > 65535) {
    console.error('AULA_PORTA precisa ser um inteiro entre 1024 e 65535.');
    process.exitCode = 1;
  } else {
    const servidor = criarServidor();
    servidor.on('error', (erro) => {
      console.error(`Não foi possível abrir o servidor: ${erro.code}`);
      process.exitCode = 1;
    });
    servidor.listen(porta, '127.0.0.1', () => {
      console.log(`Abra http://127.0.0.1:${porta} neste aparelho.`);
      console.log('Para encerrar, volte a este terminal e pressione Ctrl+C.');
    });
    const encerrar = () => servidor.close(() => console.log('Servidor encerrado.'));
    process.once('SIGINT', encerrar);
    process.once('SIGTERM', encerrar);
  }
}
```

### Entenda o fluxo antes de abrir a página

`require('node:http')` traz a biblioteca HTTP de Node; não baixa nada. `planejar` transforma e valida os dois números. O limite evita valores absurdos, negativos ou texto. A validação ocorre no servidor, porque a restrição visual `min`/`max` do formulário pode ser contornada por um cliente.

`html` monta uma página com idioma e UTF-8. `responder` escolhe uma **rota**, isto é, o comportamento associado a um caminho da URL. `/` mostra o formulário; `/calcular` mostra o resultado; `/api/plano` entrega JSON. Um caminho desconhecido responde **404**. Entrada inválida responde **400**; método diferente de GET recebe **405**.

`criarServidor` conecta essas funções ao transporte HTTP, rejeita uma URL malformada e acrescenta cabeçalhos. A resposta contém tipo de conteúdo e não deve ser guardada em cache. O HTML de resultado recebe somente números já validados; não insere texto arbitrário do visitante na página. A política de conteúdo limita recursos e formulários dessa aplicação simples; não transforma o exemplo em servidor público preparado para produção.

`module.exports` disponibiliza as funções aos testes. O bloco final inicia uma escuta somente quando você executa o arquivo diretamente. O endereço `'127.0.0.1'` na chamada `listen` é deliberado: **não o remova** para tentar corrigir um problema de acesso pelo notebook. A [API HTTP](https://nodejs.org/docs/latest-v24.x/api/http.html) e a [API de rede](https://nodejs.org/docs/latest-v24.x/api/net.html#serverlisten) explicam essas operações.

## 5. Inicie e abra o formulário no mesmo aparelho

**No terminal, na pasta do projeto:**

```bash
node --check servidor.cjs
node servidor.cjs
```

`--check` analisa sintaxe sem iniciar o serviço; sucesso normalmente não produz saída. O segundo comando abre o servidor e **não devolve o prompt**: ele continua trabalhando. Não digite outros comandos nessa janela esperando que sejam executados pelo shell.

**Saída ilustrativa:**

```text
Abra http://127.0.0.1:8765 neste aparelho.
Para encerrar, volte a este terminal e pressione Ctrl+C.
```

No telefone, mantenha esse terminal aberto e abra o navegador instalado no **mesmo aparelho**. Digite `http://127.0.0.1:8765` na barra de endereço, incluindo `http://`; não pesquise essa frase num buscador. No Linux nativo, use o navegador dessa sessão. No Android com Termux, troque de app sem encerrá-lo. Com Debian PRoot, a distribuição compartilha a rede do Android, mas sua execução precisa continuar viva e a política de apps/ROM pode restringir o acesso.

Você deve ver “Meu planejador local”, dois campos e **Calcular**. Deixe `3` e `25`, toque no botão: o resultado deve indicar **75 minutos**. Use “Fazer outro cálculo”, escolha `4` e `15` e confirme **60 minutos**.

**Checkpoint 2:** a URL passa a terminar em `/calcular?sessoes=...&minutos=...`, e você consegue repetir o cálculo. Por usar GET, os valores ficam na URL/histórico: isso é aceitável para esses números de prática, mas não é um desenho para senhas ou dados sensíveis.

Se o navegador abre, mas a página não carrega, confira o terminal servidor: Android pode encerrar processos em segundo plano e esse erro não prova falha do código. Retorne ao app e observe se ainda está ativo. Veja [serviços Android e limitações](../projetos/servidor-web.md), antes de configurar execução contínua.

## 6. Verifique HTTP com curl numa segunda janela

Mantenha o servidor da etapa 5 aberto. No Termux, abra o menu lateral — deslizando da borda esquerda ou pela ação do app — e escolha **New session/Nova sessão**. No desktop Linux, abra uma segunda janela de terminal. Com SSH, abra outra conexão ao mesmo ambiente. Essa nova janela terá o prompt enquanto a primeira continua no servidor.

**Na segunda janela, no mesmo ambiente:**

```bash
curl --max-time 5 -i 'http://127.0.0.1:8765/api/plano?sessoes=3&minutos=25'
curl --max-time 5 -i 'http://127.0.0.1:8765/api/plano?sessoes=0&minutos=25'
curl --max-time 5 -i 'http://127.0.0.1:8765/nao-existe'
```

As aspas impedem que `&` seja interpretado pelo shell. `-i` mostra cabeçalhos e corpo; `--max-time 5` limita a espera. Na primeira resposta, espere status `200` e:

```json
{"sessoes":3,"minutosPorSessao":25,"minutosTotais":75}
```

Esse é um **exemplo ilustrativo de resposta**, não um arquivo para colar no terminal. A segunda chamada deve mostrar `400` e uma mensagem; a terceira, `404`. Curl pode retornar sucesso na comunicação HTTP mesmo quando o status é 400/404: isso não significa que a aplicação aceitou o pedido.

### Se você só tem acesso pelo navegador do notebook

Não mude o endereço de escuta. Prepare uma conexão SSH autenticada conforme [SSH e túneis](../projetos/ssh-remoto.md), com o alias `mini-pc` apontando para seu aparelho. **No notebook**, numa janela dedicada:

```bash
ssh -N -o ExitOnForwardFailure=yes -L 127.0.0.1:9876:127.0.0.1:8765 mini-pc
```

Esse exemplo pressupõe que o alias, a conta, a chave e a porta SSH já foram configurados no guia; não é uma conexão pronta para um IP desconhecido. O primeiro `127.0.0.1` restringe a escuta no notebook; o segundo é o destino visto pelo servidor SSH no telefone. `ExitOnForwardFailure` pede encerrar se o túnel não puder ser aberto, em vez de deixar uma janela que parece pronta. Depois, no navegador **do notebook**, abra `http://127.0.0.1:9876`. Se a porta 9876 estiver ocupada no notebook, escolha outra porta local alta e use-a no navegador. Ctrl+C na janela do túnel o encerra; o servidor do telefone é encerrado separadamente.

## 7. Escreva testes sem ocupar uma porta

Testaremos as funções de cálculo e roteamento diretamente. Você não precisa deixar o servidor iniciado, usar 8765 ou acessar a rede para esses testes. Esse desenho permite testar mesmo quando outro processo já ocupa a porta do exemplo.

**No terminal com prompt, na pasta `planejador-js`:**

```bash
nano teste-servidor.cjs
```

**Dentro do editor:**

<!-- example-file: javascript/teste-servidor.cjs -->
```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { planejar, responder } = require('./servidor.cjs');

test('calcula três sessões de 25 minutos', () => {
  assert.deepEqual(planejar('3', '25'), {
    sessoes: 3, minutosPorSessao: 25, minutosTotais: 75
  });
});

test('rejeita zero, texto, decimal e número fora do limite', () => {
  for (const valor of ['0', 'texto', '1.5', '101']) {
    assert.throws(() => planejar(valor, '25'), RangeError);
  }
});

test('a página principal contém um formulário', () => {
  const resposta = responder('GET', '/');
  assert.equal(resposta.status, 200);
  assert.match(resposta.corpo, /<form action="\/calcular"/);
});

test('a API entrega JSON válido', () => {
  const consulta = new URLSearchParams('sessoes=4&minutos=15');
  const resposta = responder('GET', '/api/plano', consulta);
  assert.equal(resposta.status, 200);
  assert.equal(JSON.parse(resposta.corpo).minutosTotais, 60);
});

test('pedido inválido não vira cálculo', () => {
  assert.equal(responder('GET', '/calcular').status, 400);
  assert.equal(responder('GET', '/desconhecido').status, 404);
  assert.equal(responder('POST', '/').status, 405);
});
```

Salve e execute:

```bash
node --test teste-servidor.cjs
```

**Saída ilustrativa abreviada:** cinco testes, cinco aprovações, zero falhas. A apresentação visual varia entre versões de Node. `assert` faz comparações; `throws` exige que a entrada inválida seja rejeitada. A [documentação de test](https://nodejs.org/docs/latest-v24.x/api/test.html) e a [documentação de assert](https://nodejs.org/docs/latest-v24.x/api/assert.html) descrevem o comportamento.

**Checkpoint 3:** testes passam sem mensagens “Abra http...” ou um processo aguardando conexão. Se o servidor inicia ao importar, confira se você preservou o bloco `if (require.main === module)`.

**Exercício:** acrescente um teste para `planejar('2', '45')`, com total esperado 90. Depois teste uma duração maior que 1440 e espere `RangeError`. Não altere a função apenas para copiar os resultados dos testes: mantenha a regra de cálculo e os limites descritos.

## 8. Desligue, mude uma mensagem e retome

Volte à **primeira janela**, que está executando `node servidor.cjs`, e pressione **Ctrl+C**. Espere “Servidor encerrado.” e o prompt. Fechar a aba do navegador não encerra Node. Não use `killall node`, pois pode atingir outros projetos.

Na segunda janela, a mesma chamada curl agora deve falhar na conexão **se não há outro serviço escutando naquela porta**. Isso confirma o desligamento desse serviço em conjunto com a mensagem e o prompt; uma página guardada no navegador não é prova de servidor ativo.

Antes de personalizar o título:

```bash
cd "$HOME/projetos/planejador-js"
cp -i servidor.cjs servidor-versao-1.cjs
nano servidor.cjs
```

Se a cópia já existe, responda `n` para não a substituir e escolha outro nome. Mude a frase “Meu planejador local” no título/cabeçalho, mantendo as funções. Execute `node --check servidor.cjs`, os testes e reinicie. Alterações no arquivo **não atualizam automaticamente** um Node que já estava aberto: encerre a execução antiga, inicie de novo e recarregue a página.

Para voltar à versão anterior, guarde sua tentativa com outro nome e copie o backup sobre **somente `servidor.cjs` deste projeto**, usando `cp -i`. Não é preciso remover Node ou limpar Termux por uma falha de sintaxe.

No dia seguinte:

```bash
cd "$HOME/projetos/planejador-js"
node --version
node --test teste-servidor.cjs
node servidor.cjs
```

Abra a URL no navegador do mesmo aparelho. O programa não guarda os cálculos anteriores; retomar significa recuperar o código, não um histórico de consultas. Acrescentar persistência exige uma etapa própria de armazenamento, validação e backup.

## 9. Diagnóstico de erros, sem procurar solução ao acaso

| Sintoma | Causa possível | Próxima ação concreta |
|---|---|---|
| `SyntaxError` | Pontuação, aspas ou bloco faltando | `node --check servidor.cjs`; abra a linha indicada no nano |
| `Cannot find module './servidor.cjs'` | Teste fora da pasta ou nome incorreto | Confira `pwd` e `ls -l`; preserve os nomes da aula |
| `EADDRINUSE` | Outra execução ocupa a porta | Encerre sua execução anterior, ou escolha outra porta para esta instância |
| `ERR_SOCKET_BAD_PORT`/aviso de AULA_PORTA | Valor de porta inválido | Volte a 8765 ou use inteiro entre 1024 e 65535 |
| Curl conecta no telefone, mas notebook não | Loopback de máquinas diferentes | Use o túnel SSH preparado; não publique o serviço |
| Página desaparece após trocar de app | Processo terminou, política Android ou outra falha | Observe o terminal e o guia de serviços Android; não prometa execução contínua |
| Status 400 no formulário | Falta de campo, zero, decimal ou limite excedido | Volte à página principal e preencha inteiros nas faixas indicadas |

Para escolher uma porta diferente **só nessa execução**, no shell Linux:

```bash
AULA_PORTA=8766 node servidor.cjs
```

Use `http://127.0.0.1:8766` no navegador e nas chamadas curl correspondentes. Essa variável vale para o processo iniciado na linha; não altera a porta de servidores já abertos. Não precisa instalar um serviço de boot ou alterar firewall para este exercício.

## 10. Documente e preserve o projeto

Abra `nano MANIFESTO.md` e registre:

```text
# Planejador local
Objetivo: calcular sessões de estudo; nenhum dado pessoal ou histórico salvo.
Node observado: preencher com node --version.
Dependências: biblioteca padrão Node; não utiliza npm.
Iniciar: node servidor.cjs
Endereço: http://127.0.0.1:8765 no mesmo aparelho.
Testar: node --test teste-servidor.cjs
Encerrar: Ctrl+C no terminal do servidor.
Limite: exercício local, sem autenticação; não publicar na internet.
```

Pare o servidor antes de concluir a aula. **No terminal:**

```bash
mkdir -p "$HOME/backups"
tar -czf "$HOME/backups/planejador-js-$(date +%Y%m%d-%H%M%S).tar.gz" -C "$HOME/projetos" planejador-js
ls -lh "$HOME/backups"
```

Copie a cópia concluída para outro equipamento pelos métodos do [guia de backup](../preparacao/backup.md). Guardar o arquivo somente no telefone não protege contra perda do aparelho ou limpeza de dados do Termux.

Para testar a restauração, substitua `NOME_REAL.tar.gz` pelo nome que você acabou de observar; use uma pasta de destino nova:

```bash
tar -tzf "$HOME/backups/NOME_REAL.tar.gz"
mkdir "$HOME/restauro-planejador-aula"
tar -xzf "$HOME/backups/NOME_REAL.tar.gz" -C "$HOME/restauro-planejador-aula"
cd "$HOME/restauro-planejador-aula/planejador-js"
node --check servidor.cjs
node --test teste-servidor.cjs
```

Não extraia arquivos desconhecidos por cima dos seus projetos. Como não há dependências externas, a restauração não precisa `npm install`; requer somente um Node compatível e mantido. Se iniciar a cópia restaurada para verificar a página, encerre antes a instância original para não disputar a porta.

**Teste final:** a página calcula 75 e 60 corretamente; curl distingue 200/400/404; testes passam sem ocupar portas; Ctrl+C encerra somente a sua execução; o backup restaurado passa pelos mesmos testes. **Próximos exercícios:** transformar minutos em horas na página, acrescentar outra rota somente de leitura ou melhorar o HTML. Para um servidor doméstico real, passe ao [guia de servidor web](../projetos/servidor-web.md): essa transição exige decisões de rede, execução, atualização e proteção que esta aula não implementa.

## Fontes e limites de verificação

Os blocos de programa foram extraídos e executados **num notebook Linux x86_64, com Node 22.23.1**, em pastas temporárias em 11/10/2026. Os cinco testes sem sockets passaram. Um teste adicional abriu uma porta escolhida pelo sistema, exclusivamente em loopback, e verificou oito pedidos HTTP reais, incluindo URL malformada e método recusado. Também foram verificados encerramento por SIGINT, erro de porta ocupada, rejeição de porta inválida e testes após restauração do backup. Isso não certifica manutenção do processo em segundo plano ou acesso do navegador Android no seu aparelho.

Verificação documental em **11/10/2026**: [downloads Node.js](https://nodejs.org/en/download), [ciclo de releases](https://nodejs.org/en/about/previous-releases), [HTTP](https://nodejs.org/docs/latest-v24.x/api/http.html), [net](https://nodejs.org/docs/latest-v24.x/api/net.html), [test](https://nodejs.org/docs/latest-v24.x/api/test.html), [assert](https://nodejs.org/docs/latest-v24.x/api/assert.html) e [pacote LTS Termux](https://github.com/termux/termux-packages/blob/master/packages/nodejs-lts/build.sh). O código é original da aula; instalação, execução em segundo plano e navegador do seu aparelho continuam sujeitos aos checkpoints locais. Não houve teste de hardware nesta página.
