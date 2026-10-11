import React,{useState} from 'react';
import Link from '@docusaurus/Link';
import devices from '@site/data/devices.json';
export default function DeviceCatalog() {
  const [query,setQuery]=useState('');
  const filtered=devices.filter(d=>`${d.manufacturer} ${d.model} ${d.environment}`.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR')));
  return <section aria-label="Registros de dispositivos">
    <label htmlFor="device-filter">Filtrar modelo, fabricante ou ambiente</label>
    <input id="device-filter" type="search" value={query} onChange={e=>setQuery(e.target.value)} style={{display:'block',width:'100%',padding:'.8rem',margin:'.6rem 0 1rem',background:'var(--ifm-background-color)',color:'var(--ifm-font-color-base)',border:'1px solid var(--guide-line)',borderRadius:8}}/>
    <p aria-live="polite">{filtered.length} registro(s). Estado documental não significa teste físico.</p>
    {filtered.length>0 ? <table><caption>Combinações específicas, revisadas em 10/10/2026</caption><thead><tr><th>Aparelho e ambiente</th><th>Evidência</th><th>Limites e referência</th></tr></thead><tbody>{filtered.map(d=><tr key={d.id}>
      <td><strong>{d.manufacturer} {d.model}</strong><p>{d.environment}</p><Link to={d.guide}>Abrir guia</Link></td>
      <td><strong>{d.status==='experimental'?'Experimental':'Revisão documental'}</strong><p>{d.evidence}</p><small>Revisão: {d.lastReviewed}</small></td>
      <td><p>{d.limits}</p><a href={d.source} target="_blank" rel="noopener noreferrer">Fonte pública da entrada</a></td>
    </tr>)}</tbody></table> : <p>Sem registro nesta edição. Isso não prova incompatibilidade. Faça o inventário e consulte o catálogo do projeto pretendido.</p>}
  </section>;
}
