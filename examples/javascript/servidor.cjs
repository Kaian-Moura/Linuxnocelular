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
