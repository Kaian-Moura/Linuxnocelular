export const BENCH_VERSION = 1;
export const BENCH_LIMIT = 50000;
export const benchFields = [
  {id:'model', label:'Modelo e variante', limit:160, group:'system'},
  {id:'system', label:'Sistema, release e método', limit:200, group:'system'},
  {id:'kernel', label:'Kernel e origem da imagem', limit:200, group:'system'},
  {id:'access', label:'Meio de controle e recuperação', limit:300, group:'system'},
  {id:'reference', label:'Fonte da receita usada (sem credenciais)', limit:400, group:'system'},
  {id:'hub', label:'Hub e portas utilizadas', limit:200, group:'kit'},
  {id:'monitor', label:'Monitor, entrada, resolução e cabo', limit:250, group:'kit'},
  {id:'power', label:'Carregador, cabo e disposição da alimentação', limit:300, group:'kit'},
  {id:'notes', label:'O que mudou entre as tentativas', limit:1500, group:'kit'},
];
export const benchStatuses = {untested:'Não testado', passed:'Passou no cenário registrado', failed:'Falhou', inconclusive:'Inconclusivo', outside:'Fora do objetivo deste projeto'};
const check = (id, label, evidence, guide) => ({id,label,evidence,href:`/docs/${guide}/`});
export const benchChecks = [
  check('boot','Inicialização e acesso','Entrou na conta e abriu o arquivo salvo após ligar?','diagnostico/boot-crash'),
  check('session','Sessão gráfica principal','Identificou processo/sessão? Aplicativo permaneceu aberto durante reconexão?','desktop/gnome-nativo'),
  check('usb-keyboard','Teclado USB','Digitou letras, Shift, Backspace e reconectou somente o teclado?','hardware/teclados-usb'),
  check('usb-mouse','Mouse USB','Movimento, cliques e rolagem observados?','hardware/teclados-usb'),
  check('bluetooth','Bluetooth e reconexão','Digitou/moveu, depois desligou e ligou só o periférico sem refazer pareamento?','hardware/bluetooth'),
  check('wifi','Wi-Fi e acesso à rede','Associou, abriu página e retomou acesso sem perder o controle?','hardware/wifi'),
  check('video','Vídeo na montagem inicial','Imagem física observada e resolução confirmada?','hardware/video-hotplug'),
  check('hdmi-hotplug','Retirar e recolocar HDMI','Voltou imagem? Aplicativo/documento permaneceu? Anote tempo e sintomas.','hardware/video-hotplug'),
  check('hub-hotplug','Retirar e recolocar hub','Voltaram vídeo e entrada? Registre somente esse cenário, sem misturar PD.','hardware/video-hotplug'),
  check('charging','Energia e carga sob uso','Qual tendência da bateria em dois horários e qual montagem? LED sozinho não basta.','hardware/energia'),
  check('thermal','Temperatura e estabilidade','Qual carga e duração? Houve lentidão, encerramento ou proteção térmica?','hardware/energia'),
  check('audio','Áudio','Rota, volume e som realmente observado?','hardware/audio'),
  check('camera','Câmera em aplicações','Qual aplicativo, sensor, resolução e quadro observado?','hardware/cameras'),
];
export function createBench() {
  return {version:BENCH_VERSION,fields:Object.fromEntries(benchFields.map(item=>[item.id,''])),checks:Object.fromEntries(benchChecks.map(item=>[item.id,{status:'untested',evidence:''}]))};
}
const wellFormed = value => Array.from(value, character => {
  const code = character.charCodeAt(0);
  return character.length === 1 && code >= 0xD800 && code <= 0xDFFF ? '\uFFFD' : character;
}).join('');
export const encodeDownloadText = value => encodeURIComponent(wellFormed(value));
export function readBench(raw) {
  if (typeof raw !== 'string' || raw.length > BENCH_LIMIT) return {error:'Arquivo grande demais ou formato não textual. Limite: 50.000 caracteres.'};
  try {
    const source=JSON.parse(raw);
    if (!source || source.version!==BENCH_VERSION || !source.fields || !source.checks || Array.isArray(source.fields) || Array.isArray(source.checks)) return {error:'Formato ou versão de ficha não reconhecido. Use um JSON exportado por esta ferramenta.'};
    const data=createBench();
    for (const item of benchFields) {
      if (typeof source.fields[item.id] !== 'string' || source.fields[item.id].length>item.limit || source.fields[item.id].includes('\u0000') || wellFormed(source.fields[item.id])!==source.fields[item.id]) return {error:`Campo inválido: ${item.label}. A ficha atual foi preservada.`};
      data.fields[item.id]=source.fields[item.id];
    }
    for (const item of benchChecks) {
      const value=source.checks[item.id];
      if (!value || typeof value.status!=='string' || !Object.hasOwn(benchStatuses,value.status) || typeof value.evidence!=='string' || value.evidence.length>800 || value.evidence.includes('\u0000') || wellFormed(value.evidence)!==value.evidence) return {error:`Resultado inválido: ${item.label}. A ficha atual foi preservada.`};
      data.checks[item.id]={status:value.status,evidence:value.evidence};
    }
    return {data};
  } catch {return {error:'JSON inválido. Nenhum campo da ficha atual foi alterado.'};}
}
export function benchGaps(data) {
  const gaps=[];
  if (!data.fields.model.trim()) gaps.push('Modelo/variante ainda sem registro.');
  if (!data.fields.system.trim()) gaps.push('Sistema/release/método ainda sem registro.');
  if (!data.fields.access.trim()) gaps.push('Meio de controle/recuperação ainda sem registro.');
  for (const item of benchChecks) if (['passed','failed'].includes(data.checks[item.id].status) && !data.checks[item.id].evidence.trim()) gaps.push(`${item.label}: resultado marcado, mas a observação não foi descrita.`);
  return gaps;
}
const escaped = value => String(value).replace(/\\/g,'\\\\').replace(/([`*_[\]<>#|])/g,'\\$1').replace(/\r?\n/g,' / ');
export function benchMarkdown(data) {
  return ['# Registro de bancada — Celular → Linux','','Relato manual. Não certifica suporte, não autoriza flash e não foi medido automaticamente. Revise dados pessoais antes de compartilhar.','',
    ...benchFields.flatMap(item=>[`## ${item.label}`,escaped(data.fields[item.id])||'Não informado.','']),
    '## Resultados por cenário','',...benchChecks.flatMap(item=>[`### ${item.label}`,`Estado: ${benchStatuses[data.checks[item.id].status]}`,`Observação: ${escaped(data.checks[item.id].evidence)||'Não descrita.'}`,`Guia no site: ${item.href}`,'']),
    '## Lacunas de registro','',...(benchGaps(data).length?benchGaps(data).map(item=>`- ${item}`):['Os campos mínimos do registro foram preenchidos. Isso não comprova compatibilidade nem valida recuperação.']),
    '','Registre data, duração e versões dentro das observações; um teste vale somente para aquele cenário.'].join('\n');
}
