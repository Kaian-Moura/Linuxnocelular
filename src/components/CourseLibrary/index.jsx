import React, {useState} from 'react';
import Link from '@docusaurus/Link';
import {goals, environments, levels, filterCourses} from '../../lib/courses.mjs';
import styles from './styles.module.css';
const empty = {query:'', goal:'all', environment:'all', level:'all'};
export default function CourseLibrary() {
  const [filters, setFilters] = useState(empty);
  const results = filterCourses(filters);
  const change = event => setFilters(current => ({...current, [event.target.name]:event.target.value}));
  return <section className={styles.library} aria-label="Biblioteca de aulas práticas">
    <form onSubmit={event => event.preventDefault()} className={styles.filters}>
      <label className={styles.search}>O que você quer construir?<input type="search" name="query" value={filters.query} onChange={change} maxLength={80} placeholder="Python, backup, rede…" autoComplete="off"/></label>
      {[['goal','Objetivo',goals],['environment','Onde pretende executar?',environments],['level','Experiência',levels]].map(([name,label,options]) => <label key={name}>{label}<select name={name} value={filters[name]} onChange={change}>{Object.entries(options).map(([value,text]) => <option key={value} value={value}>{text}</option>)}</select></label>)}
      <button type="button" onClick={() => setFilters(empty)}>Limpar filtros</button>
    </form>
    <p className={styles.count} role="status">{results.length} aula(s) encontrada(s). O filtro organiza conteúdo; não verifica suporte do seu aparelho.</p>
    {results.length ? <ul className={styles.cards}>{results.map(item => <li key={item.id}>
      <span className={styles.level}>{levels[item.level]}</span><h3><Link to={item.href}>{item.title}</Link></h3>
      <p><strong>Você vai produzir:</strong> {item.result}</p><p><strong>Antes de começar:</strong> {item.prerequisite}</p>
      <small>{item.environments.map(value => environments[value]).join(' · ')}</small><Link to={item.href} className={styles.start} aria-label={`Abrir aula: ${item.title}`}>Abrir aula →</Link>
    </li>)}</ul> : <div className={styles.empty}><p>Nenhuma aula combina com todos os filtros. Isso não prova incompatibilidade do telefone.</p><button type="button" onClick={() => setFilters(empty)}>Mostrar todas as aulas</button><Link to="/docs/escolha/">Investigar os requisitos do meu aparelho →</Link></div>}
  </section>;
}
