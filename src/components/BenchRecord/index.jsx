import React, {useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {benchFields,benchChecks,benchStatuses,createBench,readBench,benchGaps,benchMarkdown,encodeDownloadText,BENCH_LIMIT} from '../../lib/bench.mjs';
import styles from './styles.module.css';

export default function BenchRecord() {
  const [data,setData]=useState(createBench);
  const [reviewed,setReviewed]=useState(false);
  const [message,setMessage]=useState('');
  const inputRef=useRef(null);
  const importSequence=useRef(0);
  const gaps=benchGaps(data);
  function cancelImport() {importSequence.current++;if(inputRef.current)inputRef.current.value='';}
  function field(event) {const {name,value}=event.target;cancelImport();setData(current=>({...current,fields:{...current.fields,[name]:value}}));setReviewed(false);}
  function result(id,part,value) {cancelImport();setData(current=>({...current,checks:{...current.checks,[id]:{...current.checks[id],[part]:value}}}));setReviewed(false);}
  async function importFile(event) {
    const file=event.target.files?.[0];
    if (!file) return;
    const sequence=++importSequence.current;
    setReviewed(false);
    if (file.size>BENCH_LIMIT) {setMessage('Arquivo acima de 50 KB. A ficha atual foi preservada.');event.target.value='';return;}
    try {
      const parsed=readBench(await file.text());
      if (sequence!==importSequence.current) return;
      setReviewed(false);
      if (parsed.error) setMessage(parsed.error);
      else {setData(parsed.data);setMessage('Ficha importada para esta página. Confira os dados antes de exportar; a importação não executou comandos.');}
    } catch {if(sequence===importSequence.current){setReviewed(false);setMessage('Não foi possível ler esse arquivo. A ficha atual foi preservada.');}}
    finally {if (sequence===importSequence.current && inputRef.current) inputRef.current.value='';}
  }
  return <section className={styles.record} aria-label="Ficha de bancada do meu projeto">
    <p className={styles.privacy}>Preenchimento manual e local. Não existe conexão com o telefone, coleta automática, envio ou salvamento no navegador. <strong>Saindo da página você pode perder a ficha:</strong> exporte seu JSON para retomar. Evite senhas, serial, IMEI, chaves, endereços privados e logs completos.</p>
    {[['system','1. Identifique o sistema'],['kit','2. Registre a montagem']].map(([group,title]) => <fieldset key={group}><legend>{title}</legend><div className={styles.fields}>{benchFields.filter(item=>item.group===group).map(item => <label key={item.id}>{item.label}{item.id==='notes'?<textarea name={item.id} rows={3} value={data.fields[item.id]} maxLength={item.limit} onChange={field}/>:<input name={item.id} value={data.fields[item.id]} maxLength={item.limit} onChange={field} autoComplete="off"/>}</label>)}</div></fieldset>)}
    <fieldset><legend>3. Anote um teste por cenário</legend><p className={styles.help}>Use “Passou” somente quando observou a função. Descreva ação, resultado, data/duração e versões; luz do periférico, “conectado” ou código 0 não bastam. Fora do objetivo não significa funcionando.</p>
      {benchChecks.map(item => <div className={styles.check} key={item.id}><h3>{item.label}</h3><p id={`bench-help-${item.id}`}>{item.evidence}</p><div className={styles.row}><label>Resultado: {item.label}<select value={data.checks[item.id].status} onChange={event=>result(item.id,'status',event.target.value)} aria-describedby={`bench-help-${item.id}`}>{Object.entries(benchStatuses).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Observação: {item.label}<textarea rows={2} maxLength={800} value={data.checks[item.id].evidence} onChange={event=>result(item.id,'evidence',event.target.value)} aria-describedby={`bench-help-${item.id}`}/></label></div>{['failed','inconclusive'].includes(data.checks[item.id].status)&&<Link to={item.href}>Investigar: {item.label} →</Link>}</div>)}
    </fieldset>
    <div className={styles.summary}><h3>Lacunas do registro</h3>{gaps.length?<ul>{gaps.map(item=><li key={item}>{item}</li>)}</ul>:<p>Os campos mínimos foram preenchidos. Isso não comprova suporte, estabilidade ou recuperação.</p>}</div>
    <fieldset><legend>4. Revise e conserve sua ficha</legend><label className={styles.review}><input type="checkbox" checked={reviewed} onChange={event=>setReviewed(event.target.checked)}/> Revisei o conteúdo e removi dados pessoais que não quero exportar.</label><p className={styles.help}>Qualquer edição ou importação pede uma nova revisão. Markdown é para leitura; JSON é para retomar. Nada será enviado ao projeto ou a terceiros.</p>
      <div className={styles.actions}>{reviewed?<><a className="button button--primary" href={'data:text/markdown;charset=utf-8,'+encodeDownloadText(benchMarkdown(data))} download="ficha-celular-linux.md">Baixar ficha Markdown</a><a className="button button--secondary" href={'data:application/json;charset=utf-8,'+encodeDownloadText(JSON.stringify(data,null,2))} download="ficha-celular-linux.json">Baixar ficha JSON</a></>:<p>Revise o conteúdo e marque a opção acima para habilitar os downloads.</p>}</div>
      <p className={styles.help}>Importar uma ficha válida substitui os campos desta página. Exporte o que precisa conservar antes. Arquivos inválidos preservam a ficha atual.</p>
      <label className={styles.import}>Retomar de uma ficha JSON<input ref={inputRef} type="file" accept=".json,application/json" onChange={importFile}/></label>
      <button type="button" className="button button--secondary" onClick={()=>{cancelImport();setData(createBench());setReviewed(false);setMessage('Campos desta página limpos. Nenhum arquivo exportado nem configuração do aparelho foi apagado.');}}>Limpar campos desta página</button>
      <p role="status" className={styles.message}>{message}</p>
    </fieldset>
  </section>;
}
