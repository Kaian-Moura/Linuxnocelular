import React, {useId, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {analyzeLayers, investigations, layerMarkdown, layerStates} from '@site/src/lib/layer-guide.mjs';
import styles from './styles.module.css';

export default function LayerGuide() {
  const [selected, setSelected] = useState(investigations[0].id);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const headingId = useId();
  const output = useRef(null);
  const guide = investigations.find(item => item.id === selected);
  function reset() {setAnswers({}); setResult(null);}
  function submit(event) {
    event.preventDefault();
    setResult(analyzeLayers(selected, answers));
    requestAnimationFrame(() => output.current?.focus());
  }
  return <section className={styles.panel} aria-labelledby={headingId}>
    <h2 id={headingId}>Localizar a primeira lacuna da cadeia</h2>
    <p>Marque apenas o que observou na mesma tentativa. Este formulário não acessa seu aparelho, não executa comandos e não salva respostas no navegador.</p>
    <form onSubmit={submit}>
      <label className={styles.choose}>Qual sintoma investigar?<select value={selected} onChange={event => {setSelected(event.target.value); reset();}}>{investigations.map(item => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label>
      <p className={styles.scope}>{guide.scope}</p>
      <div className={styles.steps}>{guide.steps.map((item, index) => <div className={styles.step} key={item.id}>
        <h3>{index + 1}. {item.title}</h3>
        <label>{item.question}<select value={answers[item.id] || 'unknown'} aria-describedby={`${headingId}-${item.id}`} onChange={event => {const value = event.target.value; setAnswers(previous => ({...previous, [item.id]: value})); setResult(null);}}>{Object.entries(layerStates).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <p id={`${headingId}-${item.id}`}>{item.hint} <Link to={item.href}>Como verificar esta etapa →</Link></p>
      </div>)}</div>
      <div className={styles.actions}><button className="button button--primary" type="submit">Encontrar minha próxima verificação</button><button className="button button--secondary" type="button" onClick={reset}>Limpar observações</button></div>
    </form>
    {result && <div className={styles.result} ref={output} tabIndex={-1} role="region" aria-label="Próxima verificação sugerida">
      <h3>{result.title}</h3><p>{result.explanation}</p>
      <p>{result.confirmed.length} etapa(s) anteriores marcadas como observadas; as marcações não foram medidas por esta página.</p>
      {!!result.later.length && <p>Você também marcou etapas posteriores. Confira se pertencem ao mesmo dispositivo, sessão e horário; elas não preenchem automaticamente a primeira lacuna.</p>}
      <Link className="button button--primary" to={result.href}>Abrir o guia da próxima etapa</Link>
      <p><a href={'data:text/markdown;charset=utf-8,' + encodeURIComponent(layerMarkdown(selected, answers))} download="diagnostico-manual.md">Baixar estas marcações em Markdown</a>. Para descrever medições e montagem, use a <Link to="/docs/diagnostico/ficha-evidencias/">ficha de bancada</Link>.</p>
      <p>A indicação localiza uma fronteira de investigação, não uma causa raiz. Antes de alterar algo, leia o guia, registre a hipótese e preserve o controle do sistema.</p>
    </div>}
  </section>;
}
