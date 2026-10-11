import React, {useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {recommend} from '../../lib/recommend.mjs';
import styles from './styles.module.css';

const unknown = ['unknown', 'Ainda não sei'];
const yesNo = [unknown, ['yes', 'Sim, verificado'], ['no', 'Não']];
const groups = [
  {title: '1. Aparelho e objetivo', fields: [
    ['arch', 'Arquitetura do sistema', [unknown, ['arm64', 'ARM64 / aarch64'], ['arm32', 'ARM de 32 bits'], ['x86', 'x86 / x86_64']]],
    ['intent', 'O que você quer fazer com Android?', [['explore', 'Ainda estou avaliando'], ['keep', 'Manter Android'], ['replace', 'Substituir Android']]],
    ['goal', 'Uso principal', [['desktop', 'Desktop e uso cotidiano'], ['terminal', 'Terminal e programação'], ['server', 'Servidor na rede local'], ['containers', 'Containers'], ['ai', 'IA e automação']]],
  ]},
  {title: '2. Acesso e periféricos', fields: [
    ['androidAccess', 'Consegue instalar/usar aplicativos no Android?', yesNo],
    ['screen', 'A tela funciona?', [unknown, ['working', 'Sim'], ['broken', 'Não / tela quebrada']]],
    ['touch', 'O touchscreen responde?', yesNo],
    ['adb', 'ADB funciona a partir de um computador confiável?', [unknown, ['authorized', 'Sim, autorizado e testado'], ['no', 'Não']]],
    ['alternateAccess', 'Há outro canal de controle já validado?', [unknown, ['ssh', 'SSH no Linux nativo já instalado'], ['boot', 'Fastboot/recovery com retorno testado'], ['no', 'Não']]],
    ['video', 'Saída de vídeo externa no modelo exato', [unknown, ['documented', 'Documentada e verificada'], ['no', 'Sem saída de vídeo']]],
    ['root', 'Android tem root já validado?', yesNo],
  ]},
  {title: '3. Evidências para Linux nativo', fields: [
    ['support', 'Existe guia de um port para modelo/variante exatos?', [unknown, ['documented', 'Sim, com versão e fonte'], ['no', 'Não encontrei']]],
    ['unlock', 'Bootloader pode ser desbloqueado neste aparelho?', yesNo],
    ['kernel', 'Kernel e drivers do port estão documentados?', [unknown, ['documented', 'Sim, para a versão pretendida'], ['no', 'Não']]],
    ['requiredHardware', 'As funções indispensáveis funcionam nesse port?', yesNo],
    ['backup', 'Backup externo conferido?', yesNo],
    ['recovery', 'Restauração do firmware exato preparada?', yesNo],
  ]},
];
export default function PathAssistant() {
  const [answers, setAnswers] = useState({intent: 'explore', goal: 'desktop'});
  const [result, setResult] = useState(null);
  const resultRef = useRef(null);
  function update(key, value) {setAnswers(a => ({...a, [key]: value})); setResult(null);}
  function submit(e) {
    e.preventDefault(); setResult(recommend(answers));
    requestAnimationFrame(() => resultRef.current?.focus());
  }
  return <div className={styles.assistant}>
    <p className={styles.notice}>Este assistente aplica critérios publicados. Não reconhece hardware automaticamente, não executa comandos e não envia suas respostas a um servidor.</p>
    <form onSubmit={submit}>
      <label className={styles.model}>Modelo e variante exatos (opcional para explorar; necessário para avaliar um port nativo)
        <input name="model" value={answers.model || ''} onChange={e => update('model', e.target.value)} placeholder="Ex.: código de modelo da etiqueta/configurações" maxLength={150}/>
      </label>
      {groups.map(group => <fieldset key={group.title}>
        <legend>{group.title}</legend>
        <div className={styles.grid}>{group.fields.map(([key, label, choices]) => <label key={key} htmlFor={`path-${key}`}>
          {label}
          <select id={`path-${key}`} name={key} value={answers[key] || 'unknown'} onChange={e => update(key, e.target.value)}>
            {choices.map(([value, text]) => <option value={value} key={value}>{text}</option>)}
          </select>
        </label>)}</div>
      </fieldset>)}
      <div className={styles.actions}>
        <button className="button button--primary" type="submit">Ver recomendação</button>
        <button className="button button--secondary" type="button" onClick={() => {setAnswers({intent: 'explore', goal: 'desktop'}); setResult(null);}}>Limpar respostas</button>
      </div>
    </form>
    {result && <section ref={resultRef} tabIndex={-1} className={styles.result} aria-labelledby="recommendation-title" aria-live="polite">
      <span className={styles.eyebrow}>Recomendação condicional</span>
      <h2 id="recommendation-title">{result.primary.title}</h2>
      {answers.model && <p><strong>Aparelho informado:</strong> {answers.model}</p>}
      <ul>{result.reasons.map(text => <li key={text}>{text}</li>)}</ul>
      <Link className="button button--primary" to={result.primary.href}>Abrir o guia recomendado</Link>
      <h3>O que ainda precisa ser conferido</h3>
      <ul>{result.warnings.map(text => <li key={text}>{text}</li>)}</ul>
      {result.alternatives.length > 0 && <><h3>Alternativas</h3><ul>{result.alternatives.map(path => <li key={path.key}><Link to={path.href}>{path.title}</Link></li>)}</ul></>}
      <p><Link to="/docs/escolha/criterios/">Leia as regras e os limites do assistente</Link>. Revisão documental: {result.checkedAt}. Sem evidência, marque “Ainda não sei”.</p>
    </section>}
  </div>;
}
