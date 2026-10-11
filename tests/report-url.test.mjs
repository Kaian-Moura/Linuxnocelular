import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reportUrl} from '../scripts/report-url.mjs';
test('relatório retira todos os parâmetros assinados sem copiar tokens', () => {
  assert.equal(reportUrl('https://downloads.invalid/file.zip?token=FICTICIO&sig=EXEMPLO#parte'), 'https://downloads.invalid/file.zip');
});
test('identidade embutida em URL não é publicada pelo sanitizador', () => {
  assert.equal(reportUrl('https://aluno:EXEMPLO@downloads.invalid/file.zip'), 'https://downloads.invalid/file.zip');
});
test('referência sem parâmetros é preservada e URL inválida é recusada', () => {
  assert.equal(reportUrl('https://docs.invalid/guia/'), 'https://docs.invalid/guia/');
  assert.throws(() => reportUrl('isto não é uma URL'));
});
