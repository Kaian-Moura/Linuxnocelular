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
